import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    axios.post('http://localhost:8080/api/auth/login', { username, password })
      .then(response => {
        // --- PHASE 1 FIX: Adding .data to read the new ApiResponse wrapper ---
        const token = response.data.data.token;
        const role = response.data.data.role;
        const studentId = response.data.data.studentId; 

        // 2. Save them securely in the browser's memory
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('username', username);
        
        // If they are a student, save their specific ID!
        if (studentId) {
            localStorage.setItem('studentId', studentId); 
        }

        // 3. Redirect based on role after login
        if (role === 'ADMIN') {
          navigate('/dashboard'); 
        } else {
          navigate('/my-profile'); 
        }
      })
      .catch(err => {
        // Show the actual error message from our backend if possible
        const errorMsg = err.response?.data?.message || "Invalid username or password";
        setError(errorMsg);
        console.error(err);
      });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '350px' }}>
        <h2 style={{ textAlign: 'center', color: '#4f46e5', marginBottom: '20px' }}>System Login</h2>
        
        {error && <p style={{ color: '#ef4444', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', backgroundColor: '#fee2e2', padding: '8px', borderRadius: '4px' }}>{error}</p>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            className="custom-input"
            style={{ width: '100%', boxSizing: 'border-box' }}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="custom-input"
            style={{ width: '100%', boxSizing: 'border-box' }}
            required 
          />
          <button type="submit" className="btn btn-add" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
            Login
          </button>
        </form>

        {/* --- NEW FORGOT PASSWORD LINK --- */}
        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
          <Link to="/forgot-password" style={{ color: '#6b7280', textDecoration: 'none' }}>Forgot Password?</Link>
        </p>

        {/* --- EXISTING REGISTRATION LINK --- */}
        <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
          New Student? <Link to="/register" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 'bold' }}>Create an account</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;