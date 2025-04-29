from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import random
import json
import hashlib

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NumpyEncoder, self).default(obj)

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
CORS(app)
app.json_encoder = NumpyEncoder

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data'))

STUDENT_DATA_FILE = os.path.join(DATA_DIR, 'student_data.csv')
COURSE_DATA_FILE = os.path.join(DATA_DIR, 'course_data.csv')
ENROLLMENT_DATA_FILE = os.path.join(DATA_DIR, 'enrollment_data.csv')

# Admin credentials (in a real app, this would be in a secure database)
ADMIN_CREDENTIALS = {
    'admin': hashlib.sha256('admin123'.encode()).hexdigest()
}

SAMPLE_DATA = {
    'student': pd.DataFrame({
        'Student_ID': [f'FA21-BSCS-{i:04d}' for i in range(1, 11)],
        'Name': [f'Student {i}' for i in range(1, 11)],
        'Program': ['BSCS'] * 10,
        'Department': ['Computer Science'] * 10,
        'Semester': [random.randint(1, 8) for _ in range(10)],
        'CGPA': [round(random.uniform(2.0, 4.0), 2) for _ in range(10)],
        'Completed_Courses': ['CS101,CS102'] * 10
    }),
    'course': pd.DataFrame({
        'Course_Code': [f'CS{i:03d}' for i in range(101, 111)],
        'Course_Name': [f'Course {i}' for i in range(101, 111)],
        'Department': ['Computer Science'] * 10,
        'Prerequisites': ['None'] * 10,
        'Credit_Hours': [3] * 10,
        'Difficulty': ['Medium'] * 10
    }),
    'enrollment': pd.DataFrame({
        'Course_Code': [f'CS{i:03d}' for i in range(101, 111)],
        'Course_Name': [f'Course {i}' for i in range(101, 111)],
        'Enrollment_Count': np.random.randint(50, 150, 10),
        'Students_Enrolled': ['FA21-BSCS-0001,FA21-BSCS-0002'] * 10
    })
}

def load_data():
    try:
        # Read CSV files with proper handling of quotes and commas
        student_df = pd.read_csv(STUDENT_DATA_FILE, quotechar='"', escapechar='\\')
        course_df = pd.read_csv(COURSE_DATA_FILE, quotechar='"', escapechar='\\')
        enrollment_df = pd.read_csv(ENROLLMENT_DATA_FILE, quotechar='"', escapechar='\\')

        # Clean column names by removing quotes
        student_df.columns = [col.strip('"') for col in student_df.columns]
        course_df.columns = [col.strip('"') for col in course_df.columns]
        enrollment_df.columns = [col.strip('"') for col in enrollment_df.columns]

        # Clean string values by removing extra quotes
        for col in student_df.columns:
            if student_df[col].dtype == 'object':
                student_df[col] = student_df[col].apply(lambda x: x.strip('"') if isinstance(x, str) else x)
                
        for col in course_df.columns:
            if course_df[col].dtype == 'object':
                course_df[col] = course_df[col].apply(lambda x: x.strip('"') if isinstance(x, str) else x)
                
        for col in enrollment_df.columns:
            if enrollment_df[col].dtype == 'object':
                enrollment_df[col] = enrollment_df[col].apply(lambda x: x.strip('"') if isinstance(x, str) else x)

        print(f"Loaded {len(student_df)} students, {len(course_df)} courses, {len(enrollment_df)} enrollments")
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        student_df = SAMPLE_DATA['student']
        course_df = SAMPLE_DATA['course']
        enrollment_df = SAMPLE_DATA['enrollment']
    return student_df, course_df, enrollment_df

def get_course_recommendations(student_id, student_df, course_df, enrollment_df):
    student = student_df[student_df['Student_ID'] == student_id]
    if student.empty:
        print(f"Student not found for ID: {student_id}")
        return {"error": "Student not found"}

    completed_courses = student['Completed_Courses'].iloc[0].split(',')
    department = student['Department'].iloc[0]
    cgpa = student['CGPA'].iloc[0]

    print(f"Student ID: {student_id}")
    print(f"Department: {department}")
    print(f"Completed Courses: {completed_courses}")

    dept_courses = course_df[course_df['Department'] == department]
    print(f"Found {len(dept_courses)} courses in department {department}")
    available_courses = dept_courses[~dept_courses['Course_Code'].isin(completed_courses)]
    print(f"Available courses for recommendation: {len(available_courses)}")

    recommended_courses = []
    for _, course in available_courses.iterrows():
        prereqs = course['Prerequisites']
        if prereqs == 'None':
            recommended_courses.append({
                'Course_Code': course['Course_Code'],
                'Course_Name': course['Course_Name'],
                'Difficulty': course['Difficulty'],
                'Credit_Hours': course['Credit_Hours'],
                'Prerequisites': 'None',
                'Match_Score': 1.0
            })
        else:
            prereq_list = prereqs.split(',')
            completed_prereqs = sum(1 for p in prereq_list if p in completed_courses)
            if completed_prereqs == len(prereq_list):
                difficulty_score = 1.0 if course['Difficulty'] == 'Easy' else (0.8 if course['Difficulty'] == 'Medium' else 0.6)
                cgpa_score = min(1.0, cgpa / 4.0)
                match_score = (difficulty_score + cgpa_score) / 2

                recommended_courses.append({
                    'Course_Code': course['Course_Code'],
                    'Course_Name': course['Course_Name'],
                    'Difficulty': course['Difficulty'],
                    'Credit_Hours': course['Credit_Hours'],
                    'Prerequisites': prereqs,
                    'Match_Score': match_score
                })

    recommended_courses.sort(key=lambda x: x['Match_Score'], reverse=True)

    for course in recommended_courses:
        enrollment = enrollment_df[enrollment_df['Course_Code'] == course['Course_Code']]
        if not enrollment.empty:
            course['Enrollment_Count'] = enrollment['Enrollment_Count'].iloc[0]
        else:
            course['Enrollment_Count'] = 0

    print(f"Returning {len(recommended_courses)} recommended courses.")
    return recommended_courses

@app.route('/api/analyze', methods=['POST'])
def analyze_data():
    try:
        student_df, course_df, enrollment_df = load_data()
        
        # Convert numeric values to Python native types for JSON serialization
        analysis = {
            'student_stats': {
                'count': int(len(student_df)),
                'departments': student_df['Department'].value_counts().to_dict(),
                'cgpa_stats': {k: float(v) if isinstance(v, (np.float64, np.float32)) else v 
                              for k, v in student_df['CGPA'].describe().to_dict().items()}
            },
            'course_stats': {
                'count': int(len(course_df)),
                'departments': course_df['Department'].value_counts().to_dict(),
                'difficulty': course_df['Difficulty'].value_counts().to_dict()
            },
            'enrollment_stats': {
                'total_enrollments': int(enrollment_df['Enrollment_Count'].sum()),
                'avg_enrollment': float(enrollment_df['Enrollment_Count'].mean()),
                'max_enrollment': int(enrollment_df['Enrollment_Count'].max())
            },
            'message': 'Analysis completed successfully'
        }
        return jsonify(analysis)
    except Exception as e:
        print(f"Error in analyze_data: {str(e)}")
        return jsonify({'error': str(e), 'message': 'Error during analysis'}), 500

@app.route('/api/recommend', methods=['POST'])
def recommend_courses():
    try:
        data = request.json
        student_id = data.get('student_id', '')

        if not student_id:
            return jsonify({'error': 'Student ID is required', 'message': 'Please provide a student ID'}), 400

        student_df, course_df, enrollment_df = load_data()
        recommendations = get_course_recommendations(student_id, student_df, course_df, enrollment_df)

        if 'error' in recommendations:
            return jsonify({'error': recommendations['error'], 'message': 'Student not found'}), 404

        # Ensure all values are JSON serializable
        def make_serializable(obj):
            if isinstance(obj, dict):
                return {k: make_serializable(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [make_serializable(v) for v in obj]
            elif hasattr(obj, 'item'):
                return obj.item()
            elif obj is None:
                return ''
            else:
                return obj

        serializable_recommendations = make_serializable(recommendations)

        return jsonify({
            'recommendations': serializable_recommendations,
            'message': f'Found {len(recommendations)} course recommendations'
        })
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': str(e), 'message': 'Error generating recommendations'}), 500

@app.route('/api/students', methods=['GET'])
def get_students():
    try:
        student_df, _, _ = load_data()
        # Convert DataFrame to list of dictionaries and handle NaN values
        students = student_df[['Student_ID', 'Name', 'Department', 'CGPA']].fillna('').to_dict('records')
        return jsonify({
            'students': students,
            'message': f'Found {len(students)} students'
        })
    except Exception as e:
        print(f"Error in get_students: {str(e)}")
        return jsonify({'error': str(e), 'message': 'Error retrieving students'}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '').lower()
        student_id = data.get('student_id', '').strip() if data.get('student_id') else ''

        student_df, course_df, enrollment_df = load_data()

        # Respond to course recommendations
        if 'recommend' in user_message and student_id:
            recommendations = get_course_recommendations(student_id, student_df, course_df, enrollment_df)
            if 'error' in recommendations:
                response = "Sorry, I couldn't find your student record. Please check your ID."
            elif recommendations:
                course_list = "\n".join([f"{c['Course_Code']}: {c['Course_Name']} (Difficulty: {c['Difficulty']})" for c in recommendations[:5]])
                response = f"Here are some recommended courses for you:\n{course_list}"
            else:
                response = "You have completed all available courses in your department!"
        # Respond to course info
        elif 'course' in user_message:
            courses = course_df[['Course_Code', 'Course_Name', 'Prerequisites']].head(5).to_dict('records')
            course_list = "\n".join([f"{c['Course_Code']}: {c['Course_Name']} (Prerequisites: {c['Prerequisites']})" for c in courses])
            response = f"Here are some example courses:\n{course_list}"
        # Respond to CGPA
        elif 'cgpa' in user_message and student_id:
            student = student_df[student_df['Student_ID'] == student_id]
            if not student.empty:
                response = f"Your CGPA is {student.iloc[0]['CGPA']}."
            else:
                response = "Sorry, I couldn't find your student record."
        # Default/help
        else:
            response = (
                "Hi! I can help you with course recommendations, course info, and CGPA queries. "
                "Try asking: 'What courses do you recommend for me?' or 'Show me some courses.'"
            )

        return jsonify({
            'message': response,
            'confidence': 0.98
        })
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': str(e), 'message': 'Error processing your message'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        student_id = data.get('student_id', '').strip()
        password = data.get('password', '').strip()
        
        if not student_id or not password:
            return jsonify({'success': False, 'message': 'Student ID and password are required'}), 400
            
        student_df, _, _ = load_data()
        
        # Check if Password column exists
        if 'Password' not in student_df.columns:
            return jsonify({'success': False, 'message': 'Password column not found in student data'}), 500
            
        student = student_df[student_df['Student_ID'] == student_id]
        
        if student.empty:
            return jsonify({'success': False, 'message': 'Student ID not found'}), 401
            
        stored_password = str(student['Password'].iloc[0]).strip()
        if stored_password == password:
            return jsonify({
                'success': True, 
                'student_id': student_id, 
                'name': student['Name'].iloc[0],
                'department': student['Department'].iloc[0],
                'cgpa': float(student['CGPA'].iloc[0])
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid password'}), 401
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'success': False, 'message': 'An error occurred during login'}), 500

@app.route('/api/student_portal', methods=['POST'])
def student_portal():
    try:
        data = request.json
        student_id = data.get('student_id', '').strip()
        student_df, course_df, enrollment_df = load_data()
        student = student_df[student_df['Student_ID'] == student_id]
        if student.empty:
            return jsonify({'error': 'Student not found'}), 404
            
        student_info = student.iloc[0].to_dict()
        # Get completed courses info
        completed_codes = student_info['Completed_Courses'].split(',') if student_info['Completed_Courses'] else []
        completed_courses = course_df[course_df['Course_Code'].isin(completed_codes)][['Course_Code', 'Course_Name']].to_dict('records')
        
        # Get recommendations
        recommendations = get_course_recommendations(student_id, student_df, course_df, enrollment_df)
        
        # Convert all numeric values to Python native types
        def convert_numpy_types(obj):
            if isinstance(obj, dict):
                return {k: convert_numpy_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_numpy_types(v) for v in obj]
            elif isinstance(obj, (np.integer, np.floating)):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            return obj
            
        # Prepare response with converted types
        response_data = {
            'profile': {
                'Student_ID': str(student_info['Student_ID']),
                'Name': str(student_info['Name']),
                'Department': str(student_info['Department']),
                'CGPA': float(student_info['CGPA']),
                'Completed_Courses': completed_courses
            },
            'recommendations': convert_numpy_types(recommendations)
        }
        
        return jsonify(response_data)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': str(e), 'message': 'Error loading student portal'}), 500

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password are required'}), 400
            
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        if username in ADMIN_CREDENTIALS and ADMIN_CREDENTIALS[username] == hashed_password:
            return jsonify({
                'success': True,
                'username': username,
                'role': 'admin'
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
            
    except Exception as e:
        print(f"Admin login error: {str(e)}")
        return jsonify({'success': False, 'message': 'An error occurred during login'}), 500

@app.route('/api/admin/dashboard', methods=['GET'])
def admin_dashboard():
    try:
        student_df, course_df, enrollment_df = load_data()
        # Calculate statistics for admin dashboard
        total_students = int(len(student_df))
        total_courses = int(len(course_df))
        total_enrollments = int(enrollment_df['Enrollment_Count'].sum())
        # Department statistics
        dept_stats = {str(k): int(v) for k, v in student_df['Department'].value_counts().items()}
        # Course difficulty distribution
        difficulty_stats = {str(k): int(v) for k, v in course_df['Difficulty'].value_counts().items()}
        # Average CGPA by department
        cgpa_by_dept = {str(k): float(v) for k, v in student_df.groupby('Department')['CGPA'].mean().items()}
        # Most enrolled courses
        top_courses = [
            {
                'Course_Code': str(row['Course_Code']),
                'Course_Name': str(row['Course_Name']),
                'Enrollment_Count': int(row['Enrollment_Count'])
            }
            for _, row in enrollment_df.sort_values('Enrollment_Count', ascending=False).head(5).iterrows()
        ]
        return jsonify({
            'success': True,
            'stats': {
                'total_students': total_students,
                'total_courses': total_courses,
                'total_enrollments': total_enrollments,
                'department_stats': dept_stats,
                'difficulty_stats': difficulty_stats,
                'cgpa_by_department': cgpa_by_dept,
                'top_courses': top_courses
            }
        })
    except Exception as e:
        print(f"Admin dashboard error: {str(e)}")
        return jsonify({'success': False, 'message': 'Error loading admin dashboard'}), 500

@app.route('/api/admin/students', methods=['GET'])
def admin_get_students():
    try:
        student_df, _, _ = load_data()
        students = student_df.to_dict('records')
        return jsonify({
            'success': True,
            'students': students
        })
    except Exception as e:
        print(f"Admin get students error: {str(e)}")
        return jsonify({'success': False, 'message': 'Error retrieving students'}), 500

@app.route('/api/admin/courses', methods=['GET'])
def admin_get_courses():
    try:
        _, course_df, _ = load_data()
        courses = course_df.to_dict('records')
        return jsonify({
            'success': True,
            'courses': courses
        })
    except Exception as e:
        print(f"Admin get courses error: {str(e)}")
        return jsonify({'success': False, 'message': 'Error retrieving courses'}), 500

@app.route('/api/admin/enrollments', methods=['GET'])
def admin_get_enrollments():
    try:
        _, _, enrollment_df = load_data()
        enrollments = enrollment_df.to_dict('records')
        return jsonify({
            'success': True,
            'enrollments': enrollments
        })
    except Exception as e:
        print(f"Admin get enrollments error: {str(e)}")
        return jsonify({'success': False, 'message': 'Error retrieving enrollments'}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
