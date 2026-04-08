import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddStudent() {
  const navigate = useNavigate(); // This helps us redirect after saving
  
  // State to hold form inputs
  const [student, setStudent] = useState({
    name: '', rollNumber: '', email: '', phoneNumber: '', department: '', academicYear: '', address: ''
  });

  // Handle typing in the input boxes
  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  // Handle the Submit button
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents page reload
    axios.post('http://localhost:8080/api/students', student)
      .then(response => {
        alert("Student Added Successfully!");
        navigate('/'); // Redirect back to the student list
      })
      .catch(error => console.error(error));
  };

  return (
    <div>
      <h2>Add New Student</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
        <input type="text" name="rollNumber" placeholder="Roll Number" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
        <input type="text" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} />
        <input type="text" name="department" placeholder="Department" onChange={handleChange} />
        <input type="text" name="academicYear" placeholder="Academic Year" onChange={handleChange} />
        <input type="text" name="address" placeholder="Address" onChange={handleChange} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', cursor: 'pointer' }}>Save Student</button>
      </form>
    </div>
  );
}

export default AddStudent;