import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState('classes');
  
  // State variables to hold live database data
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // When the component loads, fetch the real data from Spring Boot!
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all courses we created in the database
        const coursesRes = await axios.get('http://localhost:8080/api/erp/courses');
        setCourses(coursesRes.data);

        // Fetch all students to build our attendance roster
        const studentsRes = await axios.get('http://localhost:8080/api/students');
        setStudents(studentsRes.data);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data from database:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* --- HEADER SECTION --- */}
      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(30px)', padding: '35px', borderRadius: '24px', marginBottom: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.5)' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1d1d1f', letterSpacing: '-0.5px', fontWeight: '800' }}>Faculty Portal</h2>
        <p style={{ margin: 0, color: '#8e8e93', fontWeight: '500', fontSize: '16px' }}>Manage your classes, log daily attendance, and enter student grades.</p>
        
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
          {['classes', 'attendance', 'marks'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                padding: '12px 24px', 
                borderRadius: '14px', 
                border: 'none', 
                fontWeight: '700', 
                cursor: 'pointer', 
                background: activeTab === tab ? '#5856d6' : 'rgba(0,0,0,0.05)', 
                color: activeTab === tab ? 'white' : '#475569', 
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'classes' ? '📚 My Classes' : tab === 'attendance' ? '✅ Mark Attendance' : '📝 Enter Marks'}
            </button>
          ))}
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(30px)', padding: '35px', borderRadius: '24px', minHeight: '50vh', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.5)' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8e8e93', fontWeight: '600' }}>Loading database records...</div>
        ) : (
          <>
            {/* 1. MY CLASSES TAB */}
            {activeTab === 'classes' && (
              <div style={{ animation: 'appLaunch 0.4s ease-out' }}>
                <h3 style={{ marginTop: 0, fontSize: '22px', color: '#1d1d1f' }}>Active Subjects</h3>
                
                {courses.length === 0 ? (
                  <div style={{ background: 'rgba(0,0,0,0.03)', padding: '30px', borderRadius: '16px', textAlign: 'center', color: '#8e8e93' }}>
                    No subjects found. An Admin needs to create courses first!
                  </div>
                ) : (
                  <div className="year-grid">
                    {courses.map(cls => (
                      <div key={cls.id} style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', transition: 'transform 0.2s', cursor: 'pointer' }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#5856d6', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {cls.courseCode} • {cls.credits} Credits
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1d1d1f', marginBottom: '15px' }}>{cls.courseName}</div>
                        <div style={{ fontSize: '14px', color: '#8e8e93', fontWeight: '500' }}>Semester {cls.semester}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
              <div style={{ animation: 'appLaunch 0.4s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '22px', color: '#1d1d1f' }}>Today's Roster</h3>
                  <input type="date" className="custom-input" style={{ background: 'white', padding: '10px 16px' }} defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student Name</th>
                      <th>Roll No.</th>
                      <th style={{ textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td style={{ color: '#8e8e93', fontWeight: '600' }}>#{student.id}</td>
                        <td style={{ fontWeight: '600', color: '#1d1d1f' }}>{student.name}</td>
                        <td style={{ color: '#475569', fontWeight: '500' }}>{student.rollNumber}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button style={{ background: '#34c759', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', marginRight: '8px', cursor: 'pointer' }}>Present</button>
                          <button style={{ background: '#ff3b30', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Absent</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. MARKS TAB */}
            {activeTab === 'marks' && (
              <div style={{ animation: 'appLaunch 0.4s ease-out' }}>
                <h3 style={{ marginTop: 0, fontSize: '22px', color: '#1d1d1f', marginBottom: '20px' }}>Grade Entry</h3>
                
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Internal (40)</th>
                      <th>Semester (60)</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td style={{ fontWeight: '600', color: '#1d1d1f' }}>{student.name}</td>
                        <td><input type="number" className="custom-input" placeholder="0-40" style={{ width: '80px', padding: '8px', background: 'white' }} /></td>
                        <td><input type="number" className="custom-input" placeholder="0-60" style={{ width: '80px', padding: '8px', background: 'white' }} /></td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn" style={{ background: '#007aff', color: 'white' }}>Save Marks</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FacultyDashboard;