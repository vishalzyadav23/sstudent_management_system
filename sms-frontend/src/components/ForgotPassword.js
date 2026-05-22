import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  // Changed from username to email
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter a valid email address.');
      setIsError(true);
      return;
    }

    setMessage('');
    setIsLoading(true); // Start loading animation

    // Send the email to your Spring Boot backend
    axios.post('http://localhost:8080/api/auth/forgot-password', { email: email })
      .then(response => {
        setIsError(false);
        // Show the green success message from your design
        setMessage("If that account exists, a reset link has been sent to the associated email address.");
        setEmail(''); // Clear the input box
      })
      .catch(error => {
        setIsError(true);
        setMessage(error.response?.data?.message || "Failed to send email. Please check backend SMTP config.");
      })
      .finally(() => {
        setIsLoading(false); // Stop loading animation
      });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ 
        padding: '40px', 
        backgroundColor: 'white', 
        borderRadius: '24px', 
        boxShadow: '0 10px 40px rgba(0,0,0,0.05)', 
        width: '100%',
        maxWidth: '380px',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ textAlign: 'center', color: '#000', marginBottom: '10px', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Forgot Password
        </h2>
        <p style={{ textAlign: 'center', color: '#8e8e93', fontSize: '14px', marginBottom: '25px', fontWeight: '500' }}>
          Enter your email address and we will generate a reset link.
        </p>

        {message && (
          <div style={{ 
            backgroundColor: isError ? '#ff3b30' : '#34c759', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '12px', 
            marginBottom: '20px', 
            textAlign: 'center', 
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="vishuyadav636064@gmail.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="custom-input"
            style={{ 
              width: '100%', 
              boxSizing: 'border-box', 
              padding: '14px', 
              fontSize: '15px',
              backgroundColor: 'rgba(0,0,0,0.03)',
              border: 'none',
              borderRadius: '12px',
              outline: 'none'
            }}
            required 
          />
          <button 
            type="submit" 
            className="btn btn-add" 
            disabled={isLoading}
            style={{ 
              width: '100%', 
              padding: '14px', 
              marginTop: '10px', 
              fontSize: '16px', 
              borderRadius: '14px',
              backgroundColor: isLoading ? '#a1a1aa' : '#007aff',
              color: 'white',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', color: '#8e8e93', fontSize: '14px', fontWeight: '500' }}>
          Remembered it? <Link to="/" style={{ color: '#007aff', textDecoration: 'none', fontWeight: '600' }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;