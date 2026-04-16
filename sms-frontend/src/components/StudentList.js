import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 4;
  
  const navigate = useNavigate();

  // --- FIXED: Wrapped in useCallback to prevent infinite loops and clear the ESLint warning ---
  const loadStudents = useCallback(() => {
    const token = localStorage.getItem('jwtToken'); 
    
    axios.get('http://localhost:8080/api/students', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => setStudents(response.data.data)) 
      .catch(error => {
        console.error(error);
        if (error.response && error.response.status === 403) {
          alert("Session expired. Please login again.");
          localStorage.clear();
          navigate('/');
        }
      });
  }, [navigate]); // Added navigate as a dependency

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'ADMIN') {
      navigate('/');
      return;
    }
    
    loadStudents();
  }, [navigate, loadStudents]); // FIXED: Added loadStudents to the dependency array!

  const deleteStudent = (id) => {
    const token = localStorage.getItem('jwtToken'); 

    if (window.confirm("Are you sure you want to delete this student?")) {
      axios.delete(`http://localhost:8080/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` } 
      })
        .then(() => loadStudents())
        .catch(error => {
          console.error("Delete Error: ", error);
          if (error.response && error.response.status === 403) {
            alert("403 Forbidden: Your Admin session expired! Please click the red 'Logout' button and log back in as Admin.");
          } else if (error.response && error.response.status === 500) {
             alert("500 Error: Cannot delete this student because they have a linked User Account. We need to update the database rules!");
          } else {
            alert("Error: " + error.message);
          }
        });
    }
  };

  // --- PERFORMANCE UPGRADE: useMemo prevents lag during typing/sorting ---
  const processedStudents = useMemo(() => {
    let result = students.filter(student => {
      const matchesSearch = 
        (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDept = filterDept === '' || (student.department && student.department.toLowerCase() === filterDept.toLowerCase());
      
      return matchesSearch && matchesDept;
    });

    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [students, searchTerm, filterDept, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = processedStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(processedStudents.length / studentsPerPage);

  const totalStudents = students.length;
  const itStudents = students.filter(s => 
    s.department && (s.department.toLowerCase() === 'it' || s.department.toLowerCase() === 'cs' || s.department.toLowerCase() === 'computer science')
  ).length;
  const otherStudents = totalStudents - itStudents;

  // --- Year-Wise Distribution Logic ---
  const yearDistribution = students.reduce((acc, student) => {
    const year = student.academicYear || 'Unknown';
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* --- PREMIUM DASHBOARD HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: '#0f172a', margin: 0, fontSize: '28px', fontWeight: '800' }}>Admin Overview</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Welcome back. Here is what is happening today.</p>
        </div>
        <Link to="/add">
          <button className="btn btn-add" style={{ padding: '12px 24px', borderRadius: '10px' }}>
            <span style={{ fontSize: '16px', marginRight: '8px' }}>+</span> Add New Student
          </button>
        </Link>
      </div>
      
      {/* --- TOP GRADIENT METRIC CARDS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '30px' }}>
        
        {/* Total Students Card - Indigo Gradient */}
        <div style={{ padding: '24px', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <h3 style={{ margin: 0, color: '#e0e7ff', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Students</h3>
          <h1 style={{ fontSize: '42px', margin: '10px 0 0 0', fontWeight: '800' }}>{totalStudents}</h1>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, fontSize: '100px' }}>👥</div>
        </div>

        {/* Tech Dept Card - Emerald Gradient */}
        <div style={{ padding: '24px', background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <h3 style={{ margin: 0, color: '#d1fae5', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tech (IT / CS)</h3>
          <h1 style={{ fontSize: '42px', margin: '10px 0 0 0', fontWeight: '800' }}>{itStudents}</h1>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, fontSize: '100px' }}>💻</div>
        </div>

        {/* Other Depts Card - Amber/Orange Gradient */}
        <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <h3 style={{ margin: 0, color: '#fef3c7', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Other Departments</h3>
          <h1 style={{ fontSize: '42px', margin: '10px 0 0 0', fontWeight: '800' }}>{otherStudents}</h1>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, fontSize: '100px' }}>⚙️</div>
        </div>
      </div>

      {/* --- YEAR-WISE DISTRIBUTION WIDGET --- */}
      <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #f1f5f9' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>
          Academic Year Distribution
        </h3>
        <div className="year-grid">
          {Object.entries(yearDistribution).length > 0 ? (
            Object.entries(yearDistribution).map(([year, count]) => (
              <div key={year} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Class Of</span>
                  <span style={{ display: 'block', fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>{year}</span>
                </div>
                <div style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '8px 12px', borderRadius: '8px', fontWeight: '800', fontSize: '16px' }}>
                  {count}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#64748b', margin: 0 }}>No academic year data available.</p>
          )}
        </div>
      </div>

      {/* --- TABLE CONTROLS --- */}
      <div className="control-panel" style={{ backgroundColor: 'transparent', padding: 0, border: 'none', marginBottom: '20px' }}>
        <input 
          type="text" 
          className="custom-input"
          placeholder="🔍 Search by name, email, or roll number..." 
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <select 
          className="custom-select"
          style={{ maxWidth: '250px' }}
          value={filterDept} 
          onChange={(e) => { setFilterDept(e.target.value); setCurrentPage(1); }}
        >
          <option value="">All Departments</option>
          <option value="cs">Computer Science</option>
          <option value="it">Information Tech</option>
          <option value="ec">Electronics</option>
          <option value="mechanical">Mechanical</option>
        </select>
      </div>
      
      {/* --- PREMIUM TABLE --- */}
      <table className="custom-table">
        <thead>
          <tr>
            <th onClick={() => requestSort('id')} style={{cursor: 'pointer'}}>ID ↕</th>
            <th onClick={() => requestSort('name')} style={{cursor: 'pointer'}}>Student Name ↕</th>
            <th onClick={() => requestSort('rollNumber')} style={{cursor: 'pointer'}}>Roll No. ↕</th>
            <th onClick={() => requestSort('email')} style={{cursor: 'pointer'}}>Email Address ↕</th>
            <th onClick={() => requestSort('department')} style={{cursor: 'pointer'}}>Department ↕</th>
            <th>Academic Year</th>
            <th style={{ textAlign: 'right' }}>Actions</th> 
          </tr>
        </thead>
        <tbody>
          {currentStudents.length > 0 ? currentStudents.map(student => {
            // Logic to pick the right pill badge color
            const deptUpper = student.department ? student.department.toUpperCase() : '';
            let badgeClass = 'dept-other';
            if (deptUpper === 'IT' || deptUpper === 'CS' || deptUpper === 'COMPUTER SCIENCE') badgeClass = 'dept-it';
            else if (deptUpper === 'MECHANICAL') badgeClass = 'dept-mechanical';
            else if (deptUpper === 'EC' || deptUpper === 'ELECTRONICS') badgeClass = 'dept-ec';

            return (
              <tr key={student.id}>
                <td style={{ color: '#64748b', fontWeight: '600' }}>#{student.id}</td>
                <td>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{student.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{student.address}</div>
                </td>
                <td style={{ fontWeight: '600', color: '#475569' }}>{student.rollNumber}</td>
                <td style={{ color: '#64748b' }}>{student.email}</td>
                <td>
                  <span className={`dept-badge ${badgeClass}`}>{student.department}</span>
                </td>
                <td style={{ fontWeight: '600', color: '#475569' }}>{student.academicYear}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Link to={`/edit/${student.id}`}>
                      <button className="btn btn-edit">Edit</button>
                    </Link>
                    <button className="btn btn-delete" onClick={() => deleteStudent(student.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="7" style={{textAlign: 'center', padding: '60px 30px'}}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                <h3 style={{ color: '#334155', margin: '0 0 5px 0' }}>No students found</h3>
                <p style={{ color: '#64748b', margin: 0 }}>Try adjusting your search or department filter.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '30px', gap: '20px' }}>
          <button className="btn btn-edit" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            ← Previous
          </button>
          <span style={{ fontWeight: '600', color: '#475569' }}>Page {currentPage} of {totalPages}</span>
          <button className="btn btn-edit" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default StudentList;