import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentList from './StudentList'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

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
  const [classTiming, setClassTiming] = useState(''); // NEW: Schedule State
  const [courseMessage, setCourseMessage] = useState(''); 

  // --- NEW: DRILL-DOWN SUBJECT FOLDER STATES ---
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [folderTab, setFolderTab] = useState('content'); // 'content' or 'videos'
  const [tempContent, setTempContent] = useState('');
  const [tempVideo, setTempVideo] = useState('');

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
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState('Present');
  const [recordMessage, setRecordMessage] = useState('');
  const [bulkMarks, setBulkMarks] = useState({});

  // --- STUDENT QUICK VIEW STATES (ALL DETAILS) ---
  const [viewStudentId, setViewStudentId] = useState('');
  const [showStudentInfo, setShowStudentInfo] = useState(false);
  const [showDirectory, setShowDirectory] = useState(true);
  const [viewMarks, setViewMarks] = useState([]);
  const [viewAttendance, setViewAttendance] = useState([]);

  // --- STATE FOR INDIVIDUAL EXPORT ---
  const [exportStudentId, setExportStudentId] = useState('');

  const navigate = () => window.location.href = '/'; // Fallback navigation

  const getAuthHeader = () => {
    const token = localStorage.getItem('jwtToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchCourses();
    fetchFaculty();
    fetchStudents();
  }, []);

  const fetchCourses = () => axios.get('http://localhost:8080/api/erp/courses', { headers: getAuthHeader() }).then(res => setCourses(res.data)).catch(console.error);
  
  const fetchFaculty = () => axios.get('http://localhost:8080/api/erp/faculty', { headers: getAuthHeader() }).then(res => setFaculty(res.data)).catch(console.error);
  
  const fetchStudents = () => axios.get('http://localhost:8080/api/students', { headers: getAuthHeader() })
    .then(res => {
      const studentArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setStudents(studentArray);
    })
    .catch(console.error);

  // --- DRILL DOWN FUNCTIONS ---
  const openSubjectFolder = (subject) => {
    setSelectedSubject(subject);
    setFolderTab('content');
    setTempContent(subject.content || '');
    setTempVideo(subject.videoUrl || '');
  };

  // --- FIXED: PERMANENT DATABASE SAVE ---
  const handleSaveMaterial = () => {
    if (!selectedSubject) return;

    axios.put(`http://localhost:8080/api/erp/courses/${selectedSubject.id}/material`, {
      content: tempContent,
      videoUrl: tempVideo
    }, { headers: getAuthHeader() })
    .then(res => {
      // If the backend succeeds, update the React UI
      const updatedCourses = courses.map(sub => 
        sub.id === selectedSubject.id 
          ? { ...sub, content: tempContent, videoUrl: tempVideo }
          : sub
      );
      setCourses(updatedCourses);
      setSelectedSubject({ ...selectedSubject, content: tempContent, videoUrl: tempVideo });
      
      alert("✅ Material saved permanently to the database!");
    })
    .catch(err => {
      console.error("Failed to save material:", err);
      alert("❌ Failed to save material. Please ensure your Spring Boot server is running.");
    });
  };

  // --- ADD METHODS (NOW WITH TIMING) ---
  const handleAddCourse = (e) => {
    e.preventDefault();
    setCourseMessage(''); 
    
    axios.post('http://localhost:8080/api/erp/courses', { 
      courseCode, 
      courseName, 
      credits: Number(credits), 
      semester: Number(semester),
      classTiming // Sending the new schedule field to backend
    }, { headers: getAuthHeader() })
      .then(() => { 
        fetchCourses(); 
        setCourseCode(''); 
        setCourseName(''); 
        setCredits('3');
        setSemester('1');
        setClassTiming(''); // Clear input
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
    
    axios.post('http://localhost:8080/api/erp/faculty', { name: facName, email: facEmail, department: facDept, designation: facDesig }, { headers: getAuthHeader() })
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
      axios.delete(`http://localhost:8080/api/erp/courses/${id}`, { headers: getAuthHeader() })
        .then(() => {
          setCourseMessage("🗑️ Subject removed.");
          fetchCourses(); 
          if (selectedSubject && selectedSubject.id === id) setSelectedSubject(null);
          setTimeout(() => setCourseMessage(''), 3000);
        })
        .catch(err => console.error("Delete failed", err));
    }
  };

  const deleteFaculty = (id) => {
    if (window.confirm("Remove this faculty member from the system?")) {
      axios.delete(`http://localhost:8080/api/erp/faculty/${id}`, { headers: getAuthHeader() })
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
    }, { headers: getAuthHeader() })
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

  // --- BULK GRADE ENTRY LOGIC ---
  const handleBulkMarkChange = (courseId, field, value) => {
    setBulkMarks(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [field]: value
      }
    }));
  };

  const handleBulkPublish = async (e) => {
    e.preventDefault();
    if (!recordStudentId) {
      setRecordMessage('⚠️ Please select a Target Student first.');
      return; 
    }

    const coursesToGrade = Object.keys(bulkMarks).filter(id => bulkMarks[id].internal && bulkMarks[id].semester);

    if (coursesToGrade.length === 0) {
      setRecordMessage('⚠️ Please enter marks for at least one subject.');
      return;
    }

    try {
      const promises = coursesToGrade.map(courseId => 
        axios.post('http://localhost:8080/api/erp/marks/publish', { 
          studentId: Number(recordStudentId), 
          courseId: Number(courseId), 
          internalMarks: Number(bulkMarks[courseId].internal), 
          semesterMarks: Number(bulkMarks[courseId].semester) 
        }, { headers: getAuthHeader() })
      );

      await Promise.all(promises); 
      
      setRecordMessage('✅ All Subject Marks successfully published to the Report Card!'); 
      setBulkMarks({}); 
      setTimeout(() => setRecordMessage(''), 4000); 

    } catch (err) {
      console.error("Publish Marks Error:", err);
      const serverError = err.response?.data?.error || err.response?.data?.message || err.message;
      if (err.response?.status === 403) {
        setRecordMessage('❌ 403 Forbidden: Your session expired. Please log out and log back in.');
      } else {
        setRecordMessage(`❌ Server error: ${serverError}`);
      }
    }
  };

  const handleLogAttendance = (e) => {
    e.preventDefault();

    if (!recordStudentId || !recordCourseId) {
      setRecordMessage('⚠️ Please select a Target Student and Course from the dropdowns first.');
      return; 
    }

    axios.post('http://localhost:8080/api/erp/attendance/log', { 
      studentId: Number(recordStudentId), 
      courseId: Number(recordCourseId), 
      date: attDate, 
      status: attStatus 
    }, { headers: getAuthHeader() }) 
    .then(() => { 
      setRecordMessage(`✅ Attendance marked as ${attStatus}!`); 
      setTimeout(() => setRecordMessage(''), 4000); 
    })
    .catch((err) => {
      console.error("Log Attendance Error:", err);
      const serverError = err.response?.data?.error || err.response?.data?.message || err.message;
      if (err.response?.status === 403) {
        setRecordMessage('❌ 403 Forbidden: Your session expired. Please log out and log back in.');
      } else {
        setRecordMessage(`❌ Server error: ${serverError}`);
      }
    });
  };

  // --- FETCH FULL STUDENT DETAILS ---
  const handleViewStudentDetail = async () => {
    if (!viewStudentId) {
      alert('⚠️ Please select a student from the dropdown first.');
      return;
    }
    try {
      const headers = getAuthHeader();
      
      const [marksRes, attRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/erp/marks/student/${viewStudentId}`, { headers }).catch(() => ({ data: [] })),
        axios.get(`http://localhost:8080/api/erp/attendance/student/${viewStudentId}`, { headers }).catch(() => ({ data: [] }))
      ]);

      setViewMarks(Array.isArray(marksRes.data) ? marksRes.data : (marksRes.data.data || []));
      setViewAttendance(Array.isArray(attRes.data) ? attRes.data : (attRes.data.data || []));

      setShowStudentInfo(true);
      setShowDirectory(false); 
    } catch (error) {
      console.error("Error fetching full student details:", error);
      alert("Could not fetch academic records.");
    }
  };

  // =========================================================================
  // --- ADVANCED FEATURE: BEAUTIFUL PDF GENERATION ---
  // =========================================================================
  
  const downloadStudentsPDF = (e) => {
    e.preventDefault();
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(0, 122, 255);
    doc.text("EduCore ERP - Master Student Directory", 14, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Student ID', 'Full Name', 'Roll Number']],
      body: students.map(s => [s.id, s.name, s.rollNumber]),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }
    });
    
    doc.save("All_Student_Records.pdf");
  };

  const downloadSingleStudentPDF = async (e) => {
    e.preventDefault();
    if (!exportStudentId) return alert("Please select a student from the dropdown first!");
    
    const student = students.find(s => s.id === Number(exportStudentId));
    if (!student) return;

    try {
      const headers = getAuthHeader();
      
      const [classesRes, marksRes, attRes, healthRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/erp/student/${exportStudentId}/classes`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:8080/api/erp/student/${exportStudentId}/marks`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:8080/api/erp/attendance/student/${exportStudentId}`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:8080/api/health/student/${exportStudentId}`, { headers }).catch(() => ({ data: { data: [] } }))
      ]);

      const studentClasses = Array.isArray(classesRes.data) ? classesRes.data : (classesRes.data.data || []);
      const studentMarks = Array.isArray(marksRes.data) ? marksRes.data : (marksRes.data.data || []);
      const studentAtt = Array.isArray(attRes.data) ? attRes.data : (attRes.data.data || []);
      
      let studentHealth = Array.isArray(healthRes.data) ? healthRes.data : (healthRes.data.data || []);
      studentHealth = studentHealth.slice(0, 100); 

      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(0, 122, 255); 
      doc.text("EduCore ERP - Official Student Record", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

      autoTable(doc, {
        startY: 35,
        head: [['Student ID', 'Full Name', 'Roll Number', 'Department', 'Email']],
        body: [[student.id, student.name, student.rollNumber, student.department || 'N/A', student.email || 'N/A']],
        theme: 'grid',
        headStyles: { fillColor: [52, 58, 64] }
      });

      doc.text("Enrolled Classes", 14, doc.lastAutoTable.finalY + 15);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Course Code', 'Course Name', 'Credits', 'Semester', 'Professor']],
        body: studentClasses.length > 0 
          ? studentClasses.map(c => [c.course?.courseCode || 'N/A', c.course?.courseName || 'N/A', c.course?.credits || 0, c.academicSemester || 'N/A', c.faculty?.name || 'N/A'])
          : [['No classes found', '', '', '', '']],
        theme: 'striped',
        headStyles: { fillColor: [0, 122, 255] }
      });

      doc.text("Academic Performance", 14, doc.lastAutoTable.finalY + 15);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Course', 'Internal (40)', 'Semester (60)', 'Total Score', 'Final Grade']],
        body: studentMarks.length > 0
          ? studentMarks.map(m => [m.course?.courseName || 'N/A', m.internalMarks || 0, m.semesterMarks || 0, m.totalMarks || 0, m.grade || 'N/A'])
          : [['No grades found', '', '', '', '']],
        theme: 'striped',
        headStyles: { fillColor: [88, 86, 214] }
      });

      doc.text("Attendance Record", 14, doc.lastAutoTable.finalY + 15);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Date', 'Course Code', 'Course Name', 'Status']],
        body: studentAtt.length > 0
          ? studentAtt.map(a => [new Date(a.date).toLocaleDateString(), a.course?.courseCode || 'N/A', a.course?.courseName || 'N/A', a.status])
          : [['No attendance logged', '', '', '']],
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] }
      });

      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(255, 45, 85); 
      doc.text("IoT Health Telemetry (Latest 100 Readings)", 14, 20);

      autoTable(doc, {
        startY: 25,
        head: [['Timestamp', 'Heart Rate', 'SpO2 (%)', 'Body Temp (C)', 'Room Temp (C)', 'Humidity (%)']],
        body: studentHealth.length > 0
          ? studentHealth.map(h => [new Date(h.recordedAt).toLocaleString(), `${h.bpm} BPM`, h.spo2, h.bodyTemp, h.roomTemp, h.roomHumidity])
          : [['No IoT data recorded', '', '', '', '', '']],
        theme: 'striped',
        headStyles: { fillColor: [255, 45, 85] }
      });

      doc.save(`${student.name.replace(/\s+/g, '_')}_Official_Record.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Failed to export PDF: ${error.message}`); 
    }
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
              onClick={() => { setActiveTab(tab); setSelectedSubject(null); }}
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
            
            {/* If NO subject is selected -> Show the Normal Grid */}
            {!selectedSubject ? (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <h3 style={{ marginTop: 0, fontSize: '22px', color: '#1d1d1f' }}>Add New Subject</h3>
                
                {courseMessage && (
                  <div style={{ background: courseMessage.includes('✅') ? '#dcfce7' : '#fee2e2', color: courseMessage.includes('✅') || courseMessage.includes('🗑️') ? '#166534' : '#991b1b', padding: '12px 20px', borderRadius: '12px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' }}>
                    {courseMessage}
                  </div>
                )}

                <form onSubmit={handleAddCourse} style={{ display: 'flex', gap: '15px', marginBottom: '30px', background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input type="text" placeholder="Code (e.g. CS101)" value={courseCode} onChange={e=>setCourseCode(e.target.value)} className="custom-input" style={{ flex: 1, minWidth: '120px' }} required />
                  <input type="text" placeholder="Subject Name" value={courseName} onChange={e=>setCourseName(e.target.value)} className="custom-input" style={{ flex: 2, minWidth: '180px' }} required />
                  
                  {/* NEW TIMING INPUT */}
                  <input type="text" placeholder="Schedule (e.g. Mon 10AM)" value={classTiming} onChange={e=>setClassTiming(e.target.value)} className="custom-input" style={{ flex: 1, minWidth: '160px' }} required />

                  <select value={credits} onChange={e=>setCredits(e.target.value)} className="custom-input" style={{ flex: 1, minWidth: '100px', backgroundColor: 'white' }} required>
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
                    <div 
                      key={c.id} 
                      onClick={() => openSubjectFolder(c)}
                      style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', position: 'relative', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.02)' } }}
                    >
                      <button onClick={(e) => { e.stopPropagation(); deleteSubject(c.id); }} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', opacity: 0.7 }}>🗑️</button>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#007aff' }}>{c.courseCode}</span>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#1d1d1f', margin: '5px 0', paddingRight: '25px' }}>{c.courseName}</div>
                      <div style={{ fontSize: '13px', color: '#8e8e93' }}>Sem {c.semester} • {c.credits} Credits</div>
                      
                      {/* NEW TIMING DISPLAY */}
                      <div style={{ fontSize: '13px', color: '#10b981', marginTop: '8px', fontWeight: '600' }}>🕒 {c.classTiming || 'Timing TBA'}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* --- NEW FEATURE: DRILL-DOWN FOLDER VIEW --- */
              <div style={{ animation: 'appLaunch 0.3s ease-out' }}>
                
                {/* Header & Back Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <button 
                    onClick={() => setSelectedSubject(null)} 
                    style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>
                    ⬅ Back to Subjects
                  </button>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#1d1d1f' }}>{selectedSubject.courseName} <span style={{color: '#8e8e93', fontWeight: '500', fontSize: '18px'}}>({selectedSubject.courseCode})</span></h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8e8e93' }}>Manage course materials and video lectures</p>
                  </div>
                </div>

                {/* Folder Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button 
                    onClick={() => setFolderTab('content')}
                    style={{ flex: 1, padding: '15px', borderRadius: '14px', border: 'none', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', background: folderTab === 'content' ? '#007aff' : '#f3f4f6', color: folderTab === 'content' ? 'white' : '#475569' }}>
                    📄 Subject Content & Notes
                  </button>
                  <button 
                    onClick={() => setFolderTab('videos')}
                    style={{ flex: 1, padding: '15px', borderRadius: '14px', border: 'none', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', background: folderTab === 'videos' ? '#ff2d55' : '#f3f4f6', color: folderTab === 'videos' ? 'white' : '#475569' }}>
                    🎥 YouTube Video Lectures
                  </button>
                </div>

                {/* Folder 1: Content Workspace */}
                {folderTab === 'content' && (
                  <div style={{ background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', animation: 'fadeIn 0.3s ease-out' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Syllabus & Study Material</h4>
                    <p style={{ fontSize: '14px', color: '#8e8e93', marginTop: 0 }}>Add text notes, important instructions, or syllabus details for the students.</p>
                    <textarea 
                      value={tempContent}
                      onChange={(e) => setTempContent(e.target.value)}
                      placeholder="Paste syllabus or detailed subject notes here..." 
                      style={{ width: '100%', height: '200px', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '15px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                      <button onClick={handleSaveMaterial} style={{ background: '#007aff', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: 'bold', cursor: 'pointer' }}>💾 Save Content</button>
                    </div>
                  </div>
                )}

                {/* Folder 2: Video Workspace */}
                {folderTab === 'videos' && (
                  <div style={{ background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', animation: 'fadeIn 0.3s ease-out' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Official Video Lecture</h4>
                    <p style={{ fontSize: '14px', color: '#8e8e93', marginTop: 0 }}>Paste a YouTube link for the primary lecture material.</p>
                    <input 
                      type="text" 
                      value={tempVideo}
                      onChange={(e) => setTempVideo(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..." 
                      style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} 
                    />
                    
                    {/* YouTube Preview box */}
                    {tempVideo && tempVideo.includes("youtube.com") && (
                      <div style={{ marginTop: '20px', padding: '15px', background: '#fff1f2', borderRadius: '12px', border: '1px dashed #fda4af', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>📺</span>
                        <span style={{ color: '#be123c', fontWeight: '600', fontSize: '14px' }}>Valid YouTube Link Detected! Students will be able to click this link in their portal.</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                      <button onClick={handleSaveMaterial} style={{ background: '#ff2d55', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: 'bold', cursor: 'pointer' }}>🔗 Save Video Link</button>
                    </div>
                  </div>
                )}

              </div>
            )}
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
              <input type="text" placeholder="Full Name" value={facName} onChange={e=>setFacName(e.target.value)} className="custom-input" style={{ flex: 1, minWidth: '120px' }} required />
              <input type="email" placeholder="Email Address" value={facEmail} onChange={e=>setFacEmail(e.target.value)} className="custom-input" style={{ flex: 1, minWidth: '120px' }} required />
              
              <select value={facDept} onChange={e=>setFacDept(e.target.value)} className="custom-input" style={{ backgroundColor: 'white', flex: 1 }}>
                <option>Computer Science</option>
                <option>Information Technology</option>
                <option>Mechanical</option>
              </select>

              <select value={facDesig} onChange={e=>setFacDesig(e.target.value)} className="custom-input" style={{ backgroundColor: 'white', flex: 1 }}>
                <option>Assistant Professor</option>
                <option>Associate Professor</option>
                <option>Professor</option>
                <option>Head of Dept (HOD)</option>
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
            
            {/* EXPORT SECTION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px', padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#1d1d1f' }}>Official Report Generator</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#8e8e93' }}>Generate formatted PDF documents of student records.</p>
                </div>
                <button 
                  onClick={downloadStudentsPDF} 
                  style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', transition: 'all 0.2s' }}>
                  <span>📄</span> Export ALL Directory (PDF)
                </button>
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed rgba(16, 185, 129, 0.3)', margin: '5px 0' }}/>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select 
                  value={exportStudentId} 
                  onChange={e => setExportStudentId(e.target.value)} 
                  className="custom-select" 
                  style={{ flex: 1, borderColor: 'rgba(16, 185, 129, 0.4)', background: 'white' }}
                >
                  <option value="">-- Select a specific student to generate PDF --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
                </select>
                <button 
                  onClick={downloadSingleStudentPDF} 
                  style={{ background: '#059669', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📄</span> Download A-Z Record (PDF)
                </button>
              </div>
            </div>

            {/* --- STUDENT QUICK VIEW SECTION (360 DEGREE) --- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px', padding: '20px', background: 'rgba(0, 122, 255, 0.05)', borderRadius: '16px', border: '1px solid rgba(0, 122, 255, 0.2)' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1d1d1f' }}>Student 360° View</h3>
              <p style={{ margin: '0', fontSize: '13px', color: '#8e8e93' }}>Select a student to view their profile, report card, and attendance.</p>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '5px' }}>
                <select 
                  value={viewStudentId} 
                  onChange={e => {
                    setViewStudentId(e.target.value);
                    setShowStudentInfo(false);
                  }} 
                  className="custom-select" 
                  style={{ flex: 1, minWidth: '200px', borderColor: 'rgba(0, 122, 255, 0.4)', background: 'white' }}
                >
                  <option value="">-- 👤 Select Target Student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
                </select>
                
                <button 
                  type="button" 
                  onClick={handleViewStudentDetail} 
                  className="btn" 
                  style={{ background: '#007aff', color: 'white', padding: '10px 18px', fontSize: '14px', fontWeight: 'bold', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
                >
                  👀 View Full Record
                </button>
                
                <button 
                  type="button" 
                  onClick={() => {
                    setShowDirectory(true); 
                    setShowStudentInfo(false);
                    setViewStudentId('');
                  }} 
                  className="btn" 
                  style={{ background: '#f1f5f9', color: '#334155', padding: '10px 18px', fontSize: '14px', fontWeight: 'bold', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer' }}
                >
                  📋 View All Directory
                </button>
              </div>

              {/* DYNAMIC STUDENT INFO CARD: PROFILE, MARKS & ATTENDANCE */}
              {showStudentInfo && viewStudentId && (
                <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '15px', animation: 'fadeIn 0.3s ease-out', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  {(() => {
                    const s = students.find(st => st.id === Number(viewStudentId));
                    if (!s) return <p>Student not found.</p>;
                    return (
                      <>
                        {/* 1. PERSONAL INFO */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                          <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '5px' }}>
                            <strong style={{color:'#64748b', fontSize: '12px', textTransform: 'uppercase'}}>Full Name</strong><br/>
                            <span style={{fontWeight: '800', color: '#1d1d1f', fontSize: '20px'}}>{s.name}</span>
                          </div>
                          <div><strong style={{color:'#64748b', fontSize: '12px', textTransform: 'uppercase'}}>Roll No</strong><br/><span style={{fontWeight: '600'}}>{s.rollNumber}</span></div>
                          <div><strong style={{color:'#64748b', fontSize: '12px', textTransform: 'uppercase'}}>Department</strong><br/><span style={{fontWeight: '600'}}>{s.department}</span></div>
                          <div><strong style={{color:'#64748b', fontSize: '12px', textTransform: 'uppercase'}}>Academic Year</strong><br/><span style={{fontWeight: '600'}}>{s.academicYear}</span></div>
                          <div><strong style={{color:'#64748b', fontSize: '12px', textTransform: 'uppercase'}}>Email Address</strong><br/><a href={`mailto:${s.email}`} style={{color: '#007aff', textDecoration: 'none', fontWeight: '600'}}>{s.email}</a></div>
                        </div>

                        {/* 2. GRADES / MARKS */}
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#5856d6', borderBottom: '2px solid rgba(88, 86, 214, 0.2)', paddingBottom: '5px' }}>📊 Academic Performance</h4>
                        {viewMarks.length === 0 ? (
                          <p style={{ color: '#8e8e93', fontSize: '13px', background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>No grades published yet.</p>
                        ) : (
                          <div style={{ overflowX: 'auto', marginBottom: '25px' }}>
                            <table className="custom-table" style={{ width: '100%', fontSize: '13px' }}>
                              <thead>
                                <tr><th>Subject Code</th><th>Internal (40)</th><th>Sem (60)</th><th>Total (100)</th><th>Grade</th></tr>
                              </thead>
                              <tbody>
                                {viewMarks.map(m => (
                                  <tr key={m.id}>
                                    <td style={{ fontWeight: '700' }}>{m.course?.courseCode || 'N/A'}</td>
                                    <td>{m.internalMarks}</td>
                                    <td>{m.semesterMarks}</td>
                                    <td style={{ fontWeight: '700' }}>{m.totalMarks}</td>
                                    <td><span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' }}>{m.grade}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* 3. ATTENDANCE LOG */}
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#10b981', borderBottom: '2px solid rgba(16, 185, 129, 0.2)', paddingBottom: '5px' }}>📅 Attendance Record</h4>
                        {viewAttendance.length === 0 ? (
                          <p style={{ color: '#8e8e93', fontSize: '13px', background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>No attendance logged yet.</p>
                        ) : (
                          <div style={{ overflowX: 'auto', maxHeight: '200px' }}>
                            <table className="custom-table" style={{ width: '100%', fontSize: '13px' }}>
                              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>
                                <tr><th>Date</th><th>Subject</th><th>Status</th></tr>
                              </thead>
                              <tbody>
                                {viewAttendance.map(a => (
                                  <tr key={a.id}>
                                    <td style={{ fontWeight: '600' }}>{new Date(a.date).toLocaleDateString()}</td>
                                    <td>{a.course?.courseCode || 'N/A'}</td>
                                    <td>
                                      <span style={{ background: a.status === 'Absent' ? '#fee2e2' : '#dcfce7', color: a.status === 'Absent' ? '#991b1b' : '#166534', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>
                                        {a.status === 'Absent' ? '🔴 Absent' : '🟢 Present'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* ONLY SHOW FULL DIRECTORY IF showDirectory IS TRUE */}
            {showDirectory && <StudentList />} 
          </div>
        )}

        {/* 4. ENROLLMENT & ACADEMIC DATA TAB */}
        {activeTab === 'enrollment' && (
          <div style={{ animation: 'appLaunch 0.4s ease-out' }}>
            
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

              {/* CARD 2: Update Academic Data (NOW WITH BULK ENTRY) */}
              <div style={{ flex: '1 1 350px', background: 'rgba(88, 86, 214, 0.04)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(88, 86, 214, 0.1)' }}>
                <h3 style={{ marginTop: 0, fontSize: '22px', color: '#5856d6' }}>2. Update Academic Data</h3>
                <p style={{ color: '#8e8e93', marginBottom: '20px', fontSize: '14px' }}>Log attendance or bulk publish subject marks.</p>
                
                {recordMessage && (
                  <div style={{ background: recordMessage.includes('✅') ? '#e0e7ff' : '#fee2e2', color: recordMessage.includes('✅') ? '#4338ca' : '#991b1b', padding: '10px 15px', borderRadius: '10px', marginBottom: '15px', fontWeight: '600', fontSize: '13px' }}>
                    {recordMessage}
                  </div>
                )}

                {/* SHARED STUDENT SELECTOR */}
                <select value={recordStudentId} onChange={e=>setRecordStudentId(e.target.value)} className="custom-select" style={{ width: '100%', borderColor: '#c7c7cc', background: 'white', marginBottom: '15px' }}>
                  <option value="">-- 👤 Select Target Student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
                </select>

                <hr style={{ border: 'none', borderTop: '1px dashed #c7c7cc', margin: '20px 0' }}/>

                {/* ATTENDANCE SECTION */}
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1d1d1f' }}>Log Attendance</h4>
                <form onSubmit={handleLogAttendance} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '25px' }}>
                  <select value={recordCourseId} onChange={e=>setRecordCourseId(e.target.value)} className="custom-select" style={{ flex: '1 1 100%', borderColor: '#c7c7cc', background: 'white' }}>
                    <option value="">-- Select Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.courseCode}</option>)}
                  </select>
                  <input type="date" value={attDate} onChange={e=>setAttDate(e.target.value)} className="custom-input" style={{ flex: '1 1 120px', borderColor: '#c7c7cc' }} required />
                  <select value={attStatus} onChange={e=>setAttStatus(e.target.value)} className="custom-select" style={{ flex: '1 1 100px', borderColor: '#c7c7cc', background: 'white' }}>
                    <option value="Present">🟢 Present</option>
                    <option value="Absent">🔴 Absent</option>
                  </select>
                  <button type="submit" className="btn btn-add" style={{ flex: '1 1 100%', background: '#10b981', padding: '10px' }}>Log Att.</button>
                </form>

                <hr style={{ border: 'none', borderTop: '1px dashed #c7c7cc', margin: '20px 0' }}/>

                {/* BULK MARKS SECTION */}
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1d1d1f' }}>Bulk Grade Entry (Subject-Wise)</h4>
                <form onSubmit={handleBulkPublish}>
                  <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '15px', border: '1px solid #c7c7cc', borderRadius: '12px', background: 'white' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                        <tr>
                          <th style={{ padding: '10px', fontSize: '12px', color: '#8e8e93' }}>SUBJECT</th>
                          <th style={{ padding: '10px', fontSize: '12px', color: '#8e8e93' }}>INT (40)</th>
                          <th style={{ padding: '10px', fontSize: '12px', color: '#8e8e93' }}>SEM (60)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map(c => (
                          <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>{c.courseCode}</td>
                            <td style={{ padding: '8px' }}>
                              <input type="number" placeholder="0" value={bulkMarks[c.id]?.internal || ''} onChange={e => handleBulkMarkChange(c.id, 'internal', e.target.value)} className="custom-input" style={{ width: '50px', padding: '6px', fontSize: '13px' }} />
                            </td>
                            <td style={{ padding: '8px' }}>
                              <input type="number" placeholder="0" value={bulkMarks[c.id]?.semester || ''} onChange={e => handleBulkMarkChange(c.id, 'semester', e.target.value)} className="custom-input" style={{ width: '50px', padding: '6px', fontSize: '13px' }} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button type="submit" className="btn btn-add" style={{ width: '100%', background: '#5856d6', padding: '12px', fontWeight: 'bold' }}>Publish All Subject Marks</button>
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