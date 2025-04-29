import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import LandingPage from './components/LandingPage';
import StudentPortal from './components/StudentPortal';
import AdminPortal from './components/AdminPortal';
import StudentLogin from './components/StudentLogin';
import AdminLogin from './components/AdminLogin';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/student/dashboard" element={<StudentPortal />} />
          <Route path="/admin/dashboard" element={<AdminPortal />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 