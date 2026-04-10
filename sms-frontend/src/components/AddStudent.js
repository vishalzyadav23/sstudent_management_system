import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddStudent() {
  const [student, setStudent] = useState({
    name: '', rollNumber: '', email: '', department: '', academicYear: '', address: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 1. Grab the Admin's token!
    const token = localStorage.getItem('jwtToken');

    // 2. Show the token in the headers when sending the POST request
    axios.post('http://localhost:8080/api/students', student, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => navigate('/dashboard'))
      .catch(error => {
        console.error("Error adding student: ", error);
        alert("Failed to add student. The Bouncer blocked you! Are you logged in as Admin?");
      });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
      <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '500px' }}>
        <h2 style={{ color: '#4f46e5', textAlign: 'center', marginBottom: '20px' }}>Add New Student</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" placeholder="Name" value={student.name} onChange={(e) => setStudent({...student, name: e.target.value})} className="custom-input" required />
          <input type="text" placeholder="Roll Number" value={student.rollNumber} onChange={(e) => setStudent({...student, rollNumber: e.target.value})} className="custom-input" required />
          <input type="email" placeholder="Email" value={student.email} onChange={(e) => setStudent({...student, email: e.target.value})} className="custom-input" required />
          
          <select value={student.department} onChange={(e) => setStudent({...student, department: e.target.value})} className="custom-input" required>
            <option value="">Select Department</option>
            <option value="CS">Computer Science</option>
            <option value="IT">Information Technology</option>
            <option value="EC">Electronics</option>
            <option value="Mechanical">Mechanical</option>
          </select>
          
          <input type="text" placeholder="Academic Year" value={student.academicYear} onChange={(e) => setStudent({...student, academicYear: e.target.value})} className="custom-input" required />
          <input type="text" placeholder="Address" value={student.address} onChange={(e) => setStudent({...student, address: e.target.value})} className="custom-input" required />
          
          <button type="submit" className="btn btn-add" style={{ padding: '12px', marginTop: '10px' }}>Save Student</button>
        </form>
      </div>
    </div>
  );
}

export default AddStudent;