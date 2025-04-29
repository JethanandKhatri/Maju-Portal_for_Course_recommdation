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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Chat as ChatIcon,
  Logout as LogoutIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

function StudentPortal() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  React.useEffect(() => {
    const id = sessionStorage.getItem('student_id');
    if (!id) {
      navigate('/student/login');
      return;
    }
    setStudentId(id);
    fetchStudentData(id);
    // eslint-disable-next-line
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_id: studentId, password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(true);
        fetchStudentData();
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
    sessionStorage.removeItem('student_id');
    setIsLoggedIn(false);
    setStudentId('');
    setStudentData(null);
    setRecommendations([]);
    setChatHistory([]);
    setActiveTab(0);
    navigate('/student/login');
  };

  const fetchStudentData = async (id) => {
    try {
      const response = await fetch('/api/student_portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_id: id }),
      });
      const data = await response.json();
      if (data.profile) {
        setStudentData(data.profile);
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError('Failed to fetch student data');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      sender: 'student',
      text: message,
      timestamp: new Date().toISOString(),
    };

    setChatHistory([...chatHistory, newMessage]);
    setMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          student_id: studentId,
        }),
      });

      const data = await response.json();
      const botMessage = {
        sender: 'bot',
        text: data.message,
        timestamp: new Date().toISOString(),
      };

      setChatHistory((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (course) => {
    setSelectedCourse(course);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedCourse(null);
    setOpenDialog(false);
  };

  // Helper function to get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '#4caf50';
      case 'medium':
        return '#ff9800';
      case 'hard':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  // Helper function to get match score color
  const getMatchScoreColor = (score) => {
    if (score >= 0.8) return '#4caf50';
    if (score >= 0.6) return '#ff9800';
    return '#f44336';
  };

  if (!isLoggedIn) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Student Login
            </Typography>
            <form onSubmit={handleLogin}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
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
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Student Portal
          </Typography>
          <Box>
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchStudentData} sx={{ mr: 1 }}>
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

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab icon={<PersonIcon />} label="Profile" />
          <Tab icon={<TrendingUpIcon />} label="Recommendations" />
          <Tab icon={<ChatIcon />} label="Chat" />
        </Tabs>

        {activeTab === 0 && studentData && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Student ID:</strong> {studentData.Student_ID}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Name:</strong> {studentData.Name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Department:</strong> {studentData.Department}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>CGPA:</strong> {studentData.CGPA}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Completed Courses
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Course Code</TableCell>
                          <TableCell>Course Name</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {studentData.Completed_Courses.map((course, index) => (
                          <TableRow key={index}>
                            <TableCell>{course.Course_Code}</TableCell>
                            <TableCell>{course.Course_Name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Course Code</TableCell>
                  <TableCell>Course Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Match Score</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recommendations.map((course) => (
                  <TableRow key={course.Course_Code}>
                    <TableCell>{course.Course_Code}</TableCell>
                    <TableCell>{course.Course_Name}</TableCell>
                    <TableCell>{course.Department}</TableCell>
                    <TableCell>
                      <Chip
                        label={course.Difficulty}
                        size="small"
                        sx={{
                          backgroundColor: getDifficultyColor(course.Difficulty),
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${(course.Match_Score * 100).toFixed(0)}%`}
                        size="small"
                        sx={{
                          backgroundColor: getMatchScoreColor(course.Match_Score),
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(course)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: '400px', overflow: 'auto' }}>
                {chatHistory.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender === 'student' ? 'flex-end' : 'flex-start',
                      mb: 2
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: '70%',
                        backgroundColor: msg.sender === 'student' ? 'primary.main' : 'grey.100',
                        color: msg.sender === 'student' ? 'white' : 'text.primary'
                      }}
                    >
                      <Typography variant="body1">{msg.text}</Typography>
                    </Paper>
                  </Box>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  Send
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedCourse && (
            <>
              <DialogTitle>Course Details</DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Course Code:</strong> {selectedCourse.Course_Code}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Course Name:</strong> {selectedCourse.Course_Name}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Department:</strong> {selectedCourse.Department}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Credit Hours:</strong> {selectedCourse.Credit_Hours}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Difficulty:</strong> {selectedCourse.Difficulty}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Prerequisites:</strong> {selectedCourse.Prerequisites}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Match Score:</strong> {(selectedCourse.Match_Score * 100).toFixed(0)}%
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default StudentPortal; 