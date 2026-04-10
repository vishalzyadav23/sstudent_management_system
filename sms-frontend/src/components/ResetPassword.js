import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  // This grabs the token from the URL! Example: /reset-password/1234-abcd
  const { token } = useParams(); 
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match!");
      return;
    }

    axios.post('http://localhost:8080/api/auth/reset-password', { 
      token: token, 
      newPassword: newPassword 
    })
      .then(response => {
        setIsError(false);
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate('/'), 3000);
      })
      .catch(error => {
        setIsError(true);
        setMessage(error.response?.data?.message || "Invalid or expired token.");
      });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '350px' }}>
        <h2 style={{ textAlign: 'center', color: '#10b981', marginBottom: '20px' }}>Set New Password</h2>

        {message && (
          <div style={{ backgroundColor: isError ? '#ef4444' : '#10b981', color: 'white', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="password" 
            placeholder="New Password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            className="custom-input"
            style={{ width: '100%', boxSizing: 'border-box' }}
            required 
          />
          <input 
            type="password" 
            placeholder="Confirm New Password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            className="custom-input"
            style={{ width: '100%', boxSizing: 'border-box' }}
            required 
          />
          <button type="submit" className="btn btn-update" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
            Save Password
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 'bold' }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;