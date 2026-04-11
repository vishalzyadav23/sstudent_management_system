import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // <-- NEW: Added Axios import
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

// --- NEW FIX: GLOBAL AXIOS INTERCEPTOR ---
// This automatically attaches your JWT token to every request sent to Spring Boot
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
// -----------------------------------------

// We create a tiny Navigation component inside App.js so it can use the "useNavigate" hook for logging out
function Navigation() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const role = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.clear(); // Destroy the wristband!
    navigate('/'); // Send them back to login
  };

  return (
    <nav className="navbar">
      <h1>University ERP System</h1>
      <div className="nav-links">
        {/* If they are NOT logged in, hide the links */}
        {!token ? (
          <span>Please Log In</span>
        ) : (
          /* If they ARE logged in, show the proper links based on role */
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            
            {/* --- ADMIN LINKS --- */}
            {role === 'ADMIN' && (
              <Link 
                to="/dashboard" 
                className="btn" 
                style={{ 
                  background: 'rgba(0, 122, 255, 0.1)', 
                  color: '#007aff', 
                  padding: '8px 16px', 
                  borderRadius: '14px', 
                  textDecoration: 'none', 
                  fontWeight: '700' 
                }}
              >
                ⚙️ Admin Dashboard
              </Link>
            )}

            {/* --- FACULTY LINKS --- */}
            {role === 'FACULTY' && (
              <Link 
                to="/faculty-dashboard" 
                className="btn" 
                style={{ 
                  background: 'rgba(88, 86, 214, 0.1)', 
                  color: '#5856d6', 
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
              <Link to="/my-profile" style={{ textDecoration: 'none', color: '#475569', fontWeight: '600' }}>My Portal</Link>
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
          
          {/* --- UPDATED ROUTE: Now points to the unified Admin Dashboard --- */}
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