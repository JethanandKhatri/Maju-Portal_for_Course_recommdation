import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LogoutIcon from '@mui/icons-material/Logout';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#b59d2b', '#c0392b', '#232b5c'];

function AdminPortal() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const username = sessionStorage.getItem('admin_username');
    if (!username) {
      navigate('/admin/login');
      return;
    }
    setIsLoggedIn(true);
    fetchDashboardData();
    fetchStudents();
    fetchCourses();
    fetchEnrollments();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (activeTab === 2) {
      console.log('useEffect: Fetching courses because Courses tab is active');
      fetchCourses();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(true);
        fetchDashboardData();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_username');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setDashboardData(null);
    setStudents([]);
    setCourses([]);
    setEnrollments([]);
    setActiveTab(0);
    navigate('/admin/login');
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/students');
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses');
      const data = await response.json();
      if (data.success) {
        console.log('Courses:', data.courses);
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/admin/enrollments');
      const data = await response.json();
      if (data.success) {
        setEnrollments(data.enrollments);
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    console.log('Tab changed to:', newValue);
    switch (newValue) {
      case 0:
        fetchDashboardData();
        break;
      case 1:
        fetchStudents();
        break;
      case 2:
        console.log('Fetching courses...');
        fetchCourses();
        break;
      case 3:
        fetchEnrollments();
        break;
      default:
        break;
    }
  };

  const handleOpenDialog = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  // Helper function to get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#4caf50';
      case 'Medium': return '#ff9800';
      case 'Hard': return '#f44336';
      default: return '#757575';
    }
  };

  // Prepare data for charts
  const departmentData = dashboardData ? Object.entries(dashboardData.department_stats).map(([name, value]) => ({ name, value })) : [];
  const difficultyData = dashboardData ? Object.entries(dashboardData.difficulty_stats).map(([name, value]) => ({ name, value })) : [];
  const topCoursesData = dashboardData ? dashboardData.top_courses.map(c => ({ name: c.Course_Name, value: c.Enrollment_Count })) : [];

  if (!isLoggedIn) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Admin Login
            </Typography>
            <form onSubmit={handleLogin}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Login'}
              </Button>
            </form>
          </Paper>
        </Box>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0.5, sm: 2 }, py: { xs: 1, sm: 4 } }}>
      <Box sx={{ mt: { xs: 2, sm: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: 24, sm: 32 } }}>
            Admin Dashboard
          </Typography>
          <Box>
            <Tooltip title="Refresh Data">
              <IconButton onClick={() => handleTabChange(null, activeTab)} sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3, minHeight: 48 }} variant="scrollable" scrollButtons="auto">
          <Tab icon={<DashboardIcon />} label="Dashboard" sx={{ minWidth: 100 }} />
          <Tab icon={<PeopleIcon />} label="Students" sx={{ minWidth: 100 }} />
          <Tab icon={<SchoolIcon />} label="Courses" sx={{ minWidth: 100 }} />
          <Tab icon={<TrendingUpIcon />} label="Enrollments" sx={{ minWidth: 100 }} />
        </Tabs>
        {activeTab === 0 && dashboardData && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.total_students}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Courses
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.total_courses}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Enrollments
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.total_enrollments}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Departments
                  </Typography>
                  <Typography variant="h4">
                    {Object.keys(dashboardData.department_stats).length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ height: 340 }}>
                <CardContent>
                  <Typography variant="h6" align="center">Students by Department</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={departmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ height: 340 }}>
                <CardContent>
                  <Typography variant="h6" align="center">Course Difficulty Distribution</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={difficultyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={12} lg={4}>
              <Card sx={{ height: 340 }}>
                <CardContent>
                  <Typography variant="h6" align="center">Top Enrolled Courses</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={topCoursesData} layout="vertical" margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#c0392b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        {activeTab === 1 && (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <TableContainer component={Paper} sx={{ minWidth: 600 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>CGPA</TableCell>
                    <TableCell>Completed Courses</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.Student_ID}>
                      <TableCell>{student.Student_ID}</TableCell>
                      <TableCell>{student.Name}</TableCell>
                      <TableCell>{student.Department}</TableCell>
                      <TableCell>{student.CGPA}</TableCell>
                      <TableCell>{student.Completed_Courses}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {activeTab === 2 && (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <TableContainer component={Paper} sx={{ minWidth: 600 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Course Code</TableCell>
                    <TableCell>Course Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Prerequisites</TableCell>
                    <TableCell>Credit Hours</TableCell>
                    <TableCell>Difficulty</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No courses found.</TableCell>
                    </TableRow>
                  ) : (
                    courses.map((course, idx) => (
                      <TableRow key={course.Course_Code || idx}>
                        <TableCell>{course.Course_Code}</TableCell>
                        <TableCell>{course.Course_Name}</TableCell>
                        <TableCell>{course.Department}</TableCell>
                        <TableCell>{course.Prerequisites}</TableCell>
                        <TableCell>{course.Credit_Hours}</TableCell>
                        <TableCell>{course.Difficulty}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {activeTab === 3 && (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <TableContainer component={Paper} sx={{ minWidth: 600 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Course Code</TableCell>
                    <TableCell>Course Name</TableCell>
                    <TableCell>Enrollment Count</TableCell>
                    <TableCell>Students Enrolled</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow key={enrollment.Course_Code}>
                      <TableCell>{enrollment.Course_Code}</TableCell>
                      <TableCell>{enrollment.Course_Name}</TableCell>
                      <TableCell>{enrollment.Enrollment_Count}</TableCell>
                      <TableCell>{enrollment.Students_Enrolled}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default AdminPortal; 