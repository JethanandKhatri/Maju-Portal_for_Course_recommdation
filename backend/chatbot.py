from flask import jsonify, request
import json
import os
from typing import List, Dict, Any
import pandas as pd

class CourseRecommender:
    def __init__(self):
        self.courses = self._load_courses()
        self.prerequisites = self._load_prerequisites()
        self.student_data = self._load_student_data()

    def _load_courses(self) -> pd.DataFrame:
        # Load course data from CSV or database
        # This is a placeholder - you'll need to implement actual data loading
        return pd.DataFrame({
            'course_id': ['CS101', 'CS102', 'MATH101'],
            'course_name': ['Introduction to Programming', 'Data Structures', 'Calculus I'],
            'prerequisites': ['None', 'CS101', 'None'],
            'credits': [3, 3, 4],
            'department': ['CS', 'CS', 'MATH']
        })

    def _load_prerequisites(self) -> Dict[str, List[str]]:
        # Load prerequisite relationships
        return {
            'CS102': ['CS101'],
            'CS201': ['CS102'],
            'MATH201': ['MATH101']
        }

    def _load_student_data(self) -> Dict[str, Any]:
        # Load student academic records
        # This is a placeholder - implement actual data loading
        return {
            'completed_courses': ['CS101', 'MATH101'],
            'cgpa': 3.5,
            'program': 'Computer Science',
            'current_semester': 2
        }

    def get_recommendations(self, student_id: str) -> List[Dict[str, Any]]:
        student = self.student_data
        completed = set(student['completed_courses'])
        
        recommendations = []
        for _, course in self.courses.iterrows():
            prereqs = self.prerequisites.get(course['course_id'], [])
            if all(prereq in completed for prereq in prereqs):
                recommendations.append({
                    'course_id': course['course_id'],
                    'course_name': course['course_name'],
                    'credits': course['credits'],
                    'department': course['department']
                })
        
        return recommendations

class Chatbot:
    def __init__(self):
        self.recommender = CourseRecommender()
        self.conversation_state = {}

    def process_message(self, message: str, conversation_history: List[Dict[str, str]]) -> str:
        # Simple intent detection
        message = message.lower()
        
        if any(greeting in message for greeting in ['hi', 'hello', 'hey']):
            return "Hello! I'm your academic advisor chatbot. I can help you with course recommendations and academic planning. How can I assist you today?"
        
        elif 'recommend' in message or 'course' in message:
            recommendations = self.recommender.get_recommendations('student123')
            if recommendations:
                response = "Based on your academic record, I recommend the following courses:\n"
                for course in recommendations:
                    response += f"- {course['course_id']}: {course['course_name']} ({course['credits']} credits)\n"
                return response
            else:
                return "I couldn't find any suitable course recommendations at the moment. Please check your prerequisites or contact your academic advisor."
        
        elif 'prerequisite' in message:
            return "I can check prerequisites for any course. Please specify which course you're interested in."
        
        elif 'help' in message:
            return "I can help you with:\n- Course recommendations\n- Prerequisite checking\n- Academic planning\n- Program requirements\nWhat would you like to know?"
        
        else:
            return "I'm not sure I understand. Could you please rephrase your question? I can help with course recommendations, prerequisites, and academic planning."

def setup_chatbot_routes(app):
    chatbot = Chatbot()

    @app.route('/api/chatbot/response', methods=['POST'])
    def get_chatbot_response():
        data = request.get_json()
        message = data.get('message', '')
        conversation_history = data.get('conversationHistory', [])
        
        response = chatbot.process_message(message, conversation_history)
        return jsonify({'response': response}) 