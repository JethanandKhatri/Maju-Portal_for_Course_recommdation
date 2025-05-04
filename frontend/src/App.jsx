import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import StudentPortal from './components/StudentPortal';
import AdminPortal from './components/AdminPortal';
import StudentLogin from './components/StudentLogin';
import AdminLogin from './components/AdminLogin';
import Chatbot from './components/Chatbot';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/student/dashboard" element={<StudentPortal />} />
          <Route path="/admin/dashboard" element={<AdminPortal />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 