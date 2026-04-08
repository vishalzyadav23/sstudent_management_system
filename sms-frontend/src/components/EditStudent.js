import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function EditStudent() {
  const { id } = useParams(); // Grabs the student ID from the URL
  const navigate = useNavigate();
  
  // State to hold the student data
  const [student, setStudent] = useState({
    name: '', rollNumber: '', email: '', phoneNumber: '', department: '', academicYear: '', address: ''
  });

  // 1. VIEWING ONE STUDENT'S DETAILS (Runs when the page opens)
  useEffect(() => {
    axios.get(`http://localhost:8080/api/students/${id}`)
      .then(response => {
        setStudent(response.data); // Fills the form with the existing data
      })
      .catch(error => console.error(error));
  }, [id]);

  // Handle typing in the input boxes
  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  // 2. UPDATING STUDENT INFORMATION (Runs when you click Save)
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:8080/api/students/${id}`, student)
      .then(response => {
        alert("Student Updated Successfully!");
        navigate('/'); // Go back to the main list
      })
      .catch(error => console.error(error));
  };

  return (
    <div>
      <h2>Edit Student Details</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
        <label>Name:</label>
        <input type="text" name="name" value={student.name} onChange={handleChange} required />
        
        <label>Roll Number:</label>
        <input type="text" name="rollNumber" value={student.rollNumber} onChange={handleChange} required />
        
        <label>Email:</label>
        <input type="email" name="email" value={student.email} onChange={handleChange} required />
        
        <label>Phone Number:</label>
        <input type="text" name="phoneNumber" value={student.phoneNumber} onChange={handleChange} />
        
        <label>Department:</label>
        <input type="text" name="department" value={student.department} onChange={handleChange} />
        
        <label>Academic Year:</label>
        <input type="text" name="academicYear" value={student.academicYear} onChange={handleChange} />
        
        <label>Address:</label>
        <input type="text" name="address" value={student.address} onChange={handleChange} />
        
        <button type="submit" style={{ padding: '10px', backgroundColor: '#2196F3', color: 'white', cursor: 'pointer', border: 'none' }}>
          Update Student
        </button>
      </form>
    </div>
  );
}

export default EditStudent;