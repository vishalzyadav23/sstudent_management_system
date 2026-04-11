import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentList from './StudentList'; 

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('courses');
  
  // --- STATES FOR DATA ---
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);

  // --- STATES FOR NEW COURSE FORM ---
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState('3'); 
  const [semester, setSemester] = useState('1'); 
  const [courseMessage, setCourseMessage] = useState(''); 

  // --- STATES FOR NEW FACULTY FORM ---
  const [facName, setFacName] = useState('');
  const [facEmail, setFacEmail] = useState('');
  const [facDept, setFacDept] = useState('Computer Science');
  const [facDesig, setFacDesig] = useState('Assistant Professor');
  const [facMessage, setFacMessage] = useState(''); 

  // --- STATES FOR ENROLLMENT FORM ---
  const [enrollStudentId, setEnrollStudentId] = useState('');
  const [enrollCourseId, setEnrollCourseId] = useState('');
  const [enrollFacultyId, setEnrollFacultyId] = useState('');
  const [enrollSemester, setEnrollSemester] = useState('Fall 2026');
  const [enrollSection, setEnrollSection] = useState('A');
  const [enrollMessage, setEnrollMessage] = useState('');

  // --- STATES FOR ACADEMIC RECORDS ---
  const [recordStudentId, setRecordStudentId] = useState('');
  const [recordCourseId, setRecordCourseId] = useState('');
  const [internalMarks, setInternalMarks] = useState('');
  const [semesterMarks, setSemesterMarks] = useState('');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState('Present');
  const [recordMessage, setRecordMessage] = useState('');

  // Fetch initial data when dashboard loads
  useEffect(() => {
    fetchCourses();
    fetchFaculty();
    fetchStudents();
  }, []);

  const fetchCourses = () => axios.get('http://localhost:8080/api/erp/courses').then(res => setCourses(res.data)).catch(console.error);
  
  const fetchFaculty = () => axios.get('http://localhost:8080/api/erp/faculty').then(res => setFaculty(res.data)).catch(console.error);
  
  const fetchStudents = () => axios.get('http://localhost:8080/api/students')
    .then(res => {
      const studentArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setStudents(studentArray);
    })
    .catch(console.error);

  // --- ADD METHODS ---
  const handleAddCourse = (e) => {
    e.preventDefault();
    setCourseMessage(''); 
    
    axios.post('http://localhost:8080/api/erp/courses', { 
      courseCode, 
      courseName, 
      credits: Number(credits), 
      semester: Number(semester) 
    })
      .then(() => { 
        fetchCourses(); 
        setCourseCode(''); 
        setCourseName(''); 
        setCredits('3');
        setSemester('1');
        setCourseMessage('✅ Subject created successfully!');
        setTimeout(() => setCourseMessage(''), 4000);
      })
      .catch(err => {
        const errorMessage = err.response?.data?.message || err.message || "Failed to create subject.";
        setCourseMessage(`❌ Error: ${errorMessage}`);
        console.error(err);
      });
  };

  const handleAddFaculty = (e) => {
    e.preventDefault();
    setFacMessage(''); 
    
    axios.post('http://localhost:8080/api/erp/faculty', { name: facName, email: facEmail, department: facDept, designation: facDesig })
      .then(() => { 
        fetchFaculty(); 
        setFacName(''); 
        setFacEmail(''); 
        setFacMessage('✅ Professor onboarded successfully!');
        setTimeout(() => setFacMessage(''), 4000);
      })
      .catch(err => {
        const errorMessage = err.response?.data?.message || err.message || "Failed to add faculty.";
        setFacMessage(`❌ Error: ${errorMessage}`);
        console.error(err);
      });
  };

  // --- DELETE METHODS ---
  const deleteSubject = (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      axios.delete(`http://localhost:8080/api/erp/courses/${id}`)
        .then(() => {
          setCourseMessage("🗑️ Subject removed.");
          fetchCourses(); 
          setTimeout(() => setCourseMessage(''), 3000);
        })
        .catch(err => console.error("Delete failed", err));
    }
  };

  const deleteFaculty = (id) => {
    if (window.confirm("Remove this faculty member from the system?")) {
      axios.delete(`http://localhost:8080/api/erp/faculty/${id}`)
        .then(() => {
          setFacMessage("🗑️ Faculty removed.");
          fetchFaculty(); 
          setTimeout(() => setFacMessage(''), 3000);
        })
        .catch(err => console.error("Delete failed", err));
    }
  };

  // --- ENROLLMENT METHOD ---
  const handleEnrollment = (e) => {
    e.preventDefault();
    setEnrollMessage('');
    
    axios.post('http://localhost:8080/api/erp/enroll', {
      studentId: Number(enrollStudentId),
      courseId: Number(enrollCourseId),
      facultyId: Number(enrollFacultyId),
      semester: enrollSemester,
      section: enrollSection
    })
    .then(() => {
      setEnrollMessage('✅ Student successfully enrolled in the class!');
      setTimeout(() => setEnrollMessage(''), 4000);
      setEnrollStudentId(''); 
    })
    .catch(err => {
      const errorMessage = err.response?.data?.message || err.message || "Failed to enroll student.";
      setEnrollMessage(`❌ Error: ${errorMessage}`);
      console.error(err);
    });
  };

  // --- NEW: ACADEMIC LOGGING METHODS ---
  const handlePublishMarks = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8080/api/erp/marks/publish', { 
      studentId: Number(recordStudentId), 
      courseId: Number(recordCourseId), 
      internalMarks: Number(internalMarks), 
      semesterMarks: Number(semesterMarks) 
    })
    .then(() => { 
      setRecordMessage('✅ Marks published to Report Card!'); 
      setInternalMarks(''); 
      setSemesterMarks(''); 
      setTimeout(() => setRecordMessage(''), 4000); 
    })
    .catch(() => setRecordMessage('❌ Error publishing marks.'));
  };

  const handleLogAttendance = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8080/api/erp/attendance/log', { 
      studentId: Number(recordStudentId), 
      courseId: Number(recordCourseId), 
      date: attDate, 
      status: attStatus 
    })
    .then(() => { 
      setRecordMessage(`✅ Attendance marked as ${attStatus}!`); 
      setTimeout(() => setRecordMessage(''), 4000); 
    })
    .catch(() => setRecordMessage('❌ Error logging attendance.'));
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* --- HEADER SECTION --- */}
      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(30px)', padding: '35px', borderRadius: '24px', marginBottom: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.5)' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1d1d1f', letterSpacing: '-0.5px', fontWeight: '800' }}>Admin Command Center</h2>
        <p style={{ margin: 0, color: '#8e8e93', fontWeight: '500', fontSize: '16px' }}>Manage the university's core infrastructure: subjects, staff, students, and enrollments.</p>
        
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '30px', flexWrap: 'wrap' }}>
          {['courses', 'faculty', 'students', 'enrollment'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                padding: '12px 24px', 
                borderRadius: '14px', 
                border: 'none', 
                fontWeight: '700', 
                cursor: 'pointer', 
                background: activeTab === tab ? '#007aff' : 'rgba(0,0,0,0.05)', 
                color: activeTab === tab ? 'white' : '#475569', 
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'courses' ? '📘 Subjects' : tab === 'faculty' ? '👨‍🏫 Faculty' : tab === 'students' ? '🎓 Students' : '🔗 Enrollments'}
            </button>
          ))}
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(30px)', padding: '35px', borderRadius: '24px', minHeight: '50vh', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.5)' }}>
        
        {/* 1. COURSES TAB */}
        {activeTab === 'courses' && (
          <div style={{ animation: 'appLaunch 0.4s ease-out' }}>
            <h3 style={{ marginTop: 0, fontSize: '22px', color: '#1d1d1f' }}>Add New Subject</h3>
            
            {courseMessage && (
              <div style={{ background: courseMessage.includes('✅') ? '#dcfce7' : '#fee2e2', color: courseMessage.includes('✅') || courseMessage.includes('🗑️') ? '#166534' : '#991b1b', padding: '12px 20px', borderRadius: '12px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' }}>
                {courseMessage}
              </div>
            )}

            <form onSubmit={handleAddCourse} style={{ display: 'flex', gap: '15px', marginBottom: '30px', background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="text" placeholder="Code (e.g. CS101)" value={courseCode} onChange={e=>setCourseCode(e.target.value)} className="custom-input" style={{ flex: 1, minWidth: '120px' }} required />
              
              <input type="text" placeholder="Subject Name" value={courseName} onChange={e=>setCourseName(e.target.value)} className="custom-input" style={{ flex: 2, minWidth: '200px' }} required />
              
              <select value={credits} onChange={e=>setCredits(e.target.value)} className="custom-input" style={{ flex: 1, minWidth: '120px', backgroundColor: 'white' }} required>
                <option value="1">1 Credit</option>
                <option value="2">2 Credits</option>
                <option value="3">3 Credits</option>
                <option value="4">4 Credits</option>
                <option value="5">5 Credits</option>
              </select>

              <select value={semester} onChange={e=>setSemester(e.target.value)} className="custom-input" style={{ flex: 1, minWidth: '120px', backgroundColor: 'white' }} required>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>

              <button type="submit" className="btn btn-add" style={{ padding: '12px 24px', background: '#007aff', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', flex: '0 0 auto' }}>
                Add Subject
              </button>
            </form>

            <h3 style={{ fontSize: '18px', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Subjects ({courses.length})</h3>
            <div className="year-grid">
              {courses.map(c => (
                <div key={c.id} style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', position: 'relative' }}>
                  <button onClick={() => deleteSubject(c.id)} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', opacity: 0.7 }}>🗑️</button>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#007aff' }}>{c.courseCode}</span>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#1d1d1f', margin: '5px 0', paddingRight: '25px' }}>{c.courseName}</div>
                  <div style={{ fontSize: '13px', color: '#8e8e93' }}>Sem {c.semester} • {c.credits} Credits</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. FACULTY TAB */}
        {activeTab === 'faculty' && (
          <div style={{ animation: 'appLaunch 0.4s ease-out' }}>
             <h3 style={{ marginTop: 0, fontSize: '22px', color: '#1d1d1f' }}>Onboard Faculty</h3>
            
             {facMessage && (
              <div style={{ background: facMessage.includes('✅') ? '#dcfce7' : '#fee2e2', color: facMessage.includes('✅') || facMessage.includes('🗑️') ? '#166534' : '#991b1b', padding: '12px 20px', borderRadius: '12px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' }}>
                {facMessage}
              </div>
             )}

             <form onSubmit={handleAddFaculty} style={{ display: 'flex', gap: '15px', marginBottom: '30px', background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '16px', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Full Name" value={facName} onChange={e=>setFacName(e.target.value)} className="custom-input" style={{ flex: 1, minWidth: '150px' }} required />
              <input type="email" placeholder="Email Address" value={facEmail} onChange={e=>setFacEmail(e.target.value)} className="custom-input" style={{ flex: 1, minWidth: '150px' }} required />
              <select value={facDept} onChange={e=>setFacDept(e.target.value)} className="custom-input" style={{ backgroundColor: 'white' }}>
                <option>Computer Science</option>
                <option>Information Technology</option>
                <option>Mechanical</option>
              </select>
              <button type="submit" className="btn btn-add" style={{ background: '#5856d6' }}>Add Professor</button>
            </form>

            <table className="custom-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faculty.map(f => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: '600' }}>{f.name}</td>
                    <td style={{ color: '#8e8e93' }}>{f.email}</td>
                    <td><span className="dept-badge dept-it">{f.department}</span></td>
                    <td style={{ color: '#475569', fontWeight: '500' }}>{f.designation}</td>
                    <td>
                      <button 
                        onClick={() => deleteFaculty(f.id)} 
                        style={{ background: '#ff3b30', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. STUDENTS TAB */}
        {activeTab === 'students' && (
          <div style={{ animation: 'appLaunch 0.4s ease-out' }}>
            <StudentList /> 
          </div>
        )}

        {/* 4. ENROLLMENT & ACADEMIC DATA TAB (RESPONSIVE FIX) */}
        {activeTab === 'enrollment' && (
          <div style={{ animation: 'appLaunch 0.4s ease-out' }}>
            
            {/* The Responsive Flex Container replacing the rigid grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
              
              {/* CARD 1: Class Assignments */}
              <div style={{ flex: '1 1 300px', background: 'rgba(0,0,0,0.02)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0, fontSize: '22px', color: '#1d1d1f' }}>1. Class Assignments</h3>
                <p style={{ color: '#8e8e93', marginBottom: '25px', fontSize: '14px' }}>Link a student to a course and professor.</p>
                
                {enrollMessage && (
                  <div style={{ background: enrollMessage.includes('✅') ? '#dcfce7' : '#fee2e2', color: enrollMessage.includes('✅') ? '#166534' : '#991b1b', padding: '10px 15px', borderRadius: '10px', marginBottom: '15px', fontWeight: '600', fontSize: '13px' }}>
                    {enrollMessage}
                  </div>
                )}

                <form onSubmit={handleEnrollment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <select value={enrollStudentId} onChange={e=>setEnrollStudentId(e.target.value)} className="custom-select" required>
                    <option value="" disabled>-- Select Student --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
                  </select>
                  <select value={enrollCourseId} onChange={e=>setEnrollCourseId(e.target.value)} className="custom-select" required>
                    <option value="" disabled>-- Select Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName}</option>)}
                  </select>
                  <select value={enrollFacultyId} onChange={e=>setEnrollFacultyId(e.target.value)} className="custom-select" required>
                    <option value="" disabled>-- Assign Professor --</option>
                    {faculty.map(f => <option key={f.id} value={f.id}>{f.name} ({f.department})</option>)}
                  </select>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <input type="text" placeholder="Semester (e.g. Fall 2026)" value={enrollSemester} onChange={e=>setEnrollSemester(e.target.value)} className="custom-input" style={{ flex: '1 1 120px' }} required />
                    <input type="text" placeholder="Section (e.g. A)" value={enrollSection} onChange={e=>setEnrollSection(e.target.value)} className="custom-input" style={{ flex: '1 1 120px' }} required />
                  </div>
                  <button type="submit" className="btn btn-add" style={{ padding: '14px', marginTop: '5px' }}>🔗 Finalize</button>
                </form>
              </div>

              {/* CARD 2: Update Academic Data */}
              <div style={{ flex: '1 1 350px', background: 'rgba(88, 86, 214, 0.04)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(88, 86, 214, 0.1)' }}>
                <h3 style={{ marginTop: 0, fontSize: '22px', color: '#5856d6' }}>2. Update Academic Data</h3>
                <p style={{ color: '#8e8e93', marginBottom: '25px', fontSize: '14px' }}>Log daily attendance and publish grades.</p>
                
                {recordMessage && (
                  <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '10px 15px', borderRadius: '10px', marginBottom: '15px', fontWeight: '600', fontSize: '13px' }}>
                    {recordMessage}
                  </div>
                )}

                {/* Target Selectors */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                  <select value={recordStudentId} onChange={e=>setRecordStudentId(e.target.value)} className="custom-select" style={{ flex: '1 1 150px', borderColor: '#c7c7cc', background: 'white' }} required>
                    <option value="">-- Target Student --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select value={recordCourseId} onChange={e=>setRecordCourseId(e.target.value)} className="custom-select" style={{ flex: '1 1 150px', borderColor: '#c7c7cc', background: 'white' }} required>
                    <option value="">-- Target Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.courseCode}</option>)}
                  </select>
                </div>

                {/* Form 1: Daily Attendance */}
                <form onSubmit={handleLogAttendance} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '25px' }}>
                  <input type="date" value={attDate} onChange={e=>setAttDate(e.target.value)} className="custom-input" style={{ flex: '1 1 120px', borderColor: '#c7c7cc' }} required />
                  <select value={attStatus} onChange={e=>setAttStatus(e.target.value)} className="custom-select" style={{ flex: '1 1 100px', borderColor: '#c7c7cc', background: 'white' }}>
                    <option value="Present">🟢 Present</option>
                    <option value="Absent">🔴 Absent</option>
                  </select>
                  <button type="submit" className="btn btn-add" style={{ flex: '1 1 100px', background: '#10b981', padding: '10px' }}>Log Att.</button>
                </form>

                <hr style={{ border: 'none', borderTop: '1px dashed #c7c7cc', margin: '20px 0' }}/>

                {/* Form 2: Report Card Grades */}
                <form onSubmit={handlePublishMarks} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <input type="number" placeholder="Internal (40)" value={internalMarks} onChange={e=>setInternalMarks(e.target.value)} className="custom-input" style={{ flex: '1 1 100px', borderColor: '#c7c7cc' }} required/>
                  <input type="number" placeholder="Sem (60)" value={semesterMarks} onChange={e=>setSemesterMarks(e.target.value)} className="custom-input" style={{ flex: '1 1 100px', borderColor: '#c7c7cc' }} required/>
                  <button type="submit" className="btn btn-add" style={{ flex: '1 1 100px', background: '#5856d6', padding: '10px' }}>Publish</button>
                </form>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;