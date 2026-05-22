import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard'; 
import AddStudent from './components/AddStudent';
import EditStudent from './components/EditStudent';
import Login from './components/Login';
import StudentProfile from './components/StudentProfile';
import Register from './components/Register'; 
import ForgotPassword from './components/ForgotPassword'; 
import ResetPassword from './components/ResetPassword';
import FacultyDashboard from './components/FacultyDashboard'; 
import './App.css';

function Navigation() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const role = localStorage.getItem('userRole');

  // --- GLOBAL THEME STATE ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('appTheme') === 'dark';
  });

  // Apply the theme to the entire website body whenever it changes
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('appTheme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('appTheme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.clear(); // Destroy the wristband!
    navigate('/'); // Send them back to the login screen
  };

  return (
    <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: isDarkMode ? '#f5f5f7' : '#1d1d1f' }}>EduCore ERP & IoT Telemetry</h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        
        {/* --- GLOBAL THEME TOGGLE (Visible everywhere!) --- */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            background: isDarkMode ? '#333' : '#fff',
            color: isDarkMode ? '#fff' : '#1d1d1f',
            border: isDarkMode ? '1px solid #555' : '1px solid #e2e8f0',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease'
          }}
        >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>

        {/* --- AUTHENTICATED LINKS --- */}
        {token && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '10px' }}>
            
            {/* --- ADMIN LINKS --- */}
            {role === 'ADMIN' && (
              <Link to="/dashboard" style={{ textDecoration: 'none', color: isDarkMode ? '#e2e8f0' : '#475569', fontWeight: '600' }}>Dashboard</Link>
            )}

            {/* --- FACULTY LINKS --- */}
            {role === 'FACULTY' && (
              <Link 
                to="/faculty-dashboard" 
                style={{ 
                  background: 'rgba(0, 122, 255, 0.1)', 
                  color: '#007aff', 
                  padding: '8px 16px', 
                  borderRadius: '14px', 
                  textDecoration: 'none', 
                  fontWeight: '700' 
                }}
              >
                📚 My Classes
              </Link>
            )}

            {/* --- STUDENT LINKS --- */}
            {role === 'STUDENT' && (
              <Link to="/my-profile" style={{ textDecoration: 'none', color: isDarkMode ? '#e2e8f0' : '#475569', fontWeight: '600' }}>My Portal</Link>
            )}

            <button onClick={handleLogout} className="btn btn-delete" style={{ marginLeft: '10px' }}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="dashboard-container">
        <Navigation />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<AdminDashboard />} /> 
          <Route path="/add" element={<AddStudent />} />
          <Route path="/edit/:id" element={<EditStudent />} />
          <Route path="/my-profile" element={<StudentProfile />} />
          <Route path="/register" element={<Register />} /> 
          <Route path="/forgot-password" element={<ForgotPassword />} /> 
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;