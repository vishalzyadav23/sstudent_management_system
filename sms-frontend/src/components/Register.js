import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  // Login Details
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Student Details
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [address, setAddress] = useState('');

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    // Package the data exactly how Spring Boot expects it!
    const newUser = {
      username: username,
      password: password,
      role: "STUDENT", // Force the role to STUDENT so they can't make themselves Admin!
      student: {
        name: name,
        rollNumber: rollNumber,
        email: email,
        department: department,
        academicYear: academicYear,
        address: address
      }
    };

    axios.post('http://localhost:8080/api/auth/register', newUser)
      .then(response => {
        setMessage("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate('/'), 2000); // Send to login after 2 seconds
      })
      .catch(err => {
        setMessage("Error creating account. Username might be taken.");
        console.error(err);
      });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', paddingBottom: '40px' }}>
      <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '500px' }}>
        <h2 style={{ textAlign: 'center', color: '#4f46e5' }}>Student Registration</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '20px' }}>Create your account to view your profile</p>

        {message && <div style={{ backgroundColor: message.includes("Error") ? '#ef4444' : '#10b981', color: 'white', padding: '10px', textAlign: 'center', borderRadius: '4px', marginBottom: '15px' }}>{message}</div>}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <h4 style={{ margin: '10px 0 0 0', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>1. Account Details</h4>
          <input type="text" placeholder="Choose a Username" value={username} onChange={(e) => setUsername(e.target.value)} className="custom-input" required />
          <input type="password" placeholder="Choose a Password" value={password} onChange={(e) => setPassword(e.target.value)} className="custom-input" required />

          <h4 style={{ margin: '20px 0 0 0', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>2. Student Details</h4>
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="custom-input" required />
          <input type="text" placeholder="Roll Number" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className="custom-input" required />
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="custom-input" required />
          
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="custom-input" required>
            <option value="">Select Department</option>
            <option value="CS">Computer Science</option>
            <option value="IT">Information Technology</option>
            <option value="EC">Electronics</option>
            <option value="Mechanical">Mechanical</option>
          </select>
          
          <input type="text" placeholder="Academic Year (e.g., 2026)" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="custom-input" required />
          <input type="text" placeholder="Home Address" value={address} onChange={(e) => setAddress(e.target.value)} className="custom-input" required />

          <button type="submit" className="btn btn-add" style={{ padding: '12px', marginTop: '10px' }}>Register Account</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;