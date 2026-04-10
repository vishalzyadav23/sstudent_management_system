import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- Auto-Redirect if already logged in ---
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('userRole');
    if (token) {
      if (role === 'ADMIN') navigate('/dashboard');
      else if (role === 'STUDENT') navigate('/my-profile');
    }
  }, [navigate]);

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

        // 3. Redirect based on role after login (Using window.location fixes the Navbar bug)
        window.location.href = role === 'ADMIN' ? '/dashboard' : '/my-profile';
      })
      .catch(err => {
        // Show the actual error message from our backend if possible
        const errorMsg = err.response?.data?.message || "Invalid username or password";
        setError(errorMsg);
        console.error(err);
      });
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '75vh', 
      background: 'rgba(255, 255, 255, 0.6)', 
      backdropFilter: 'blur(20px)',
      borderRadius: '30px', 
      overflow: 'hidden', 
      boxShadow: '0 20px 40px rgba(0,0,0,0.08)', 
      border: '1px solid rgba(255,255,255,0.8)',
      animation: 'fadeIn 0.6s ease-out'
    }}>
      
      {/* --- LEFT SIDE: Brand Hero Section --- */}
      <div style={{ 
        flex: '1.2', 
        background: 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)', 
        padding: '60px', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background circles */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
        
        <h1 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 15px 0', letterSpacing: '-1px', zIndex: 1 }}>
          Welcome back.
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.9, lineHeight: '1.6', fontWeight: '500', maxWidth: '80%', zIndex: 1 }}>
          Access your secure dashboard to manage student records, update identities, and monitor academic progress.
        </p>
      </div>

      {/* --- RIGHT SIDE: Login Form --- */}
      <div style={{ 
        flex: '1', 
        background: 'white', 
        padding: '60px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center' 
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1d1d1f', marginBottom: '8px' }}>System Login</h2>
        <p style={{ color: '#8e8e93', fontSize: '15px', fontWeight: '500', marginBottom: '30px' }}>Enter your credentials to continue.</p>

        {error && (
          <div style={{ background: '#ffebee', color: '#d32f2f', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#8e8e93', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username / Email</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="custom-input"
              style={{ width: '100%', boxSizing: 'border-box', background: '#f5f5f7', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '16px' }}
              required 
            />
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', color: '#8e8e93', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
              <Link to="/forgot-password" style={{ color: '#007aff', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="custom-input"
              style={{ width: '100%', boxSizing: 'border-box', background: '#f5f5f7', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '16px' }}
              required 
            />
          </div>

          <button type="submit" className="btn btn-add" style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '14px', marginTop: '10px', boxShadow: '0 8px 16px rgba(0,122,255,0.2)' }}>
            Login
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '30px', color: '#8e8e93', fontSize: '14px', fontWeight: '500' }}>
          New Student? <Link to="/register" style={{ color: '#007aff', textDecoration: 'none', fontWeight: '700' }}>Create an account</Link>
        </p>
      </div>

    </div>
  );
}

export default Login;