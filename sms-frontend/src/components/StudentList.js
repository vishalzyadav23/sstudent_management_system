import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function StudentList() {
  const [students, setStudents] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 4;

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    axios.get('http://localhost:8080/api/students')
      .then(response => setStudents(response.data))
      .catch(error => console.error(error));
  };

  const deleteStudent = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      axios.delete(`http://localhost:8080/api/students/${id}`)
        .then(() => loadStudents())
        .catch(error => alert("Error: " + error.message));
    }
  };

  let processedStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = filterDept === '' || (student.department && student.department.toLowerCase() === filterDept.toLowerCase());
    
    return matchesSearch && matchesDept;
  });

  processedStudents.sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = processedStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(processedStudents.length / studentsPerPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#374151' }}>All Students</h2>
        <Link to="/add">
          <button className="btn btn-add">+ Add New Student</button>
        </Link>
      </div>

      <div className="control-panel">
        <input 
          type="text" 
          className="custom-input"
          placeholder="Search name, email, roll..." 
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        
        <select 
          className="custom-select"
          value={filterDept} 
          onChange={(e) => { setFilterDept(e.target.value); setCurrentPage(1); }}
        >
          <option value="">All Departments</option>
          <option value="cs">CS</option>
          <option value="it">IT</option>
          <option value="ec">EC</option>
          <option value="mechanical">Mechanical</option>
        </select>
      </div>
      
      <table className="custom-table">
        <thead>
          <tr>
            <th onClick={() => requestSort('id')} style={{cursor: 'pointer'}}>ID ↕</th>
            <th onClick={() => requestSort('name')} style={{cursor: 'pointer'}}>Name ↕</th>
            <th onClick={() => requestSort('rollNumber')} style={{cursor: 'pointer'}}>Roll Number ↕</th>
            <th onClick={() => requestSort('email')} style={{cursor: 'pointer'}}>Email ↕</th>
            <th onClick={() => requestSort('department')} style={{cursor: 'pointer'}}>Department ↕</th>
            <th>Academic Year</th>
            <th>Address</th>
            <th>Actions</th> 
          </tr>
        </thead>
        <tbody>
          {currentStudents.length > 0 ? currentStudents.map(student => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td><strong>{student.name}</strong></td>
              <td>{student.rollNumber}</td>
              <td>{student.email}</td>
              <td><span style={{ textTransform: 'uppercase', fontWeight: 'bold', color: '#4b5563' }}>{student.department}</span></td>
              <td>{student.academicYear}</td>
              <td>{student.address}</td>
              <td>
                <Link to={`/edit/${student.id}`}>
                  <button className="btn btn-edit">Edit</button>
                </Link>
                <button className="btn btn-delete" onClick={() => deleteStudent(student.id)}>
                  Delete
                </button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="8" style={{textAlign: 'center', padding: '30px', color: '#6b7280'}}>No students found. Try adjusting your search or filter.</td></tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            className="btn btn-page"
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(currentPage - 1)}>
            Previous
          </button>
          
          <span>Page {currentPage} of {totalPages}</span>
          
          <button 
            className="btn btn-page"
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(currentPage + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default StudentList;