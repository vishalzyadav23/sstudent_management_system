import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function StudentProfile() {
  // --- UI STATES ---
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);

  // --- DATA STATES ---
  const [student, setStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]); // State for Attendance Data
  
  // --- EDIT PROFILE STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ email: '', address: '' });
  const [profileMessage, setProfileMessage] = useState('');

  // --- SECURITY STATES ---
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [isPwdError, setIsPwdError] = useState(false);

  // --- PROFILE PICTURE STATES (Saves to memory) ---
  const [profilePic, setProfilePic] = useState(localStorage.getItem('savedProfilePic') || null);

  const navigate = useNavigate();
  const studentId = localStorage.getItem('studentId');
  // NOTE: 'username' variable was removed here to clear the React warning!

  // Fetch all student data (Profile, Classes, Grades, Attendance)
  useEffect(() => {
    if (!studentId) {
      navigate('/');
      return;
    }

    const fetchAllData = async () => {
      try {
        // 1. Fetch Basic Profile
        const profileRes = await axios.get(`http://localhost:8080/api/students/${studentId}`);
        const studentData = profileRes.data.data || profileRes.data; 
        setStudent(studentData);
        setFormData({ email: studentData.email || '', address: studentData.address || '' });

        // 2. Fetch Enrolled Classes (Bulletproofed wrapper check)
        const classesRes = await axios.get(`http://localhost:8080/api/erp/student/${studentId}/classes`);
        setClasses(classesRes.data.data || classesRes.data || []);

        // 3. Fetch Grades (Bulletproofed wrapper check)
        const marksRes = await axios.get(`http://localhost:8080/api/erp/student/${studentId}/marks`);
        setMarks(marksRes.data.data || marksRes.data || []);

        // 4. Fetch Attendance
        const attRes = await axios.get(`http://localhost:8080/api/erp/student/${studentId}/attendance`);
        setAttendance(attRes.data.data || attRes.data || []);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching portal data:", err);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [navigate, studentId]);

  // --- Logic: Update Profile (Email/Address) ---
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:8080/api/students/my-profile/${studentId}`, formData)
    .then(res => {
      setStudent(res.data.data || res.data);
      setIsEditing(false);
      setProfileMessage("Contact info updated! ✨");
      setTimeout(() => setProfileMessage(''), 3000);
    })
    .catch(err => console.error(err));
  };

  // --- Logic: Change Password ---
  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setIsPwdError(true);
      setPwdMessage("New passwords do not match!");
      return;
    }

    axios.post('http://localhost:8080/api/auth/change-password', { oldPassword, newPassword })
    .then(res => {
      setIsPwdError(false);
      setPwdMessage("Security updated successfully!");
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setPwdMessage(''), 3000);
    })
    .catch(err => {
      setIsPwdError(true);
      setPwdMessage(err.response?.data?.message || "Failed to update password");
    });
  };

  // --- PROFILE PICTURE UPLOAD LOGIC ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader(); 
      
      reader.onloadend = () => {
        const base64String = reader.result; 
        setProfilePic(base64String); 
        localStorage.setItem('savedProfilePic', base64String); 
      };
      
      reader.readAsDataURL(file); 
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontWeight: '600', color: '#8e8e93' }}>Loading Student Portal...</div>;
  if (!student) return <div style={{ textAlign: 'center', marginTop: '100px', color: '#ff3b30' }}>Error loading profile.</div>;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* --- HEADER SECTION --- */}
      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(30px)', padding: '35px', borderRadius: '24px', marginBottom: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.5)' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1d1d1f', letterSpacing: '-0.5px', fontWeight: '800' }}>
          Welcome back, {student.name.split(' ')[0]}! 👋
        </h2>
        <p style={{ margin: 0, color: '#8e8e93', fontWeight: '500', fontSize: '16px' }}>Student ID: #{student.rollNumber || studentId} | Manage your academics and identity.</p>
        
        {/* Tab Navigation - INCLUDES ATTENDANCE */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '30px', flexWrap: 'wrap' }}>
          {['personal', 'classes', 'grades', 'attendance'].map(tab => (
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
              }}
            >
              {tab === 'personal' ? '👤 Personal Info' : tab === 'classes' ? '📚 My Schedule' : tab === 'grades' ? '🎓 Report Card' : '📅 Attendance'}
            </button>
          ))}
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div style={{ minHeight: '40vh' }}>
        
        {/* =========================================
            TAB 1: PERSONAL INFO & SECURITY 
            ========================================= */}
        {activeTab === 'personal' && (
          <div style={{ animation: 'appLaunch 0.4s ease-out', maxWidth: '700px', margin: '0 auto' }}>
            
            {/* Identity Card with Interactive Avatar */}
            <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(30px)', padding: '30px', borderRadius: '28px', border: '1px solid var(--ios-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', marginBottom: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                
                {/* Clickable Image Upload Area */}
                <label style={{ cursor: 'pointer', position: 'relative' }}>
                  <div style={{ 
                    width: '90px', height: '90px', 
                    background: profilePic ? 'transparent' : 'linear-gradient(135deg, #007aff, #5856d6)', 
                    borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', 
                    color: 'white', fontSize: '36px', fontWeight: 'bold', 
                    boxShadow: '0 8px 16px rgba(0,122,255,0.3)', overflow: 'hidden'
                  }}>
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      student.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#10b981', color: 'white', borderRadius: '50%', padding: '6px', fontSize: '12px', border: '3px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                    📷
                  </div>
                  
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>

                <div>
                  <h3 style={{ margin: 0, fontSize: '26px', fontWeight: '800' }}>{student.name}</h3>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                    <span className={`dept-badge dept-${(student.department || 'other').toLowerCase()}`}>{student.department || 'CS'}</span>
                    <span style={{ color: '#8e8e93', fontWeight: '600', fontSize: '13px' }}>Roll: {student.rollNumber || studentId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Contact Info */}
            <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(30px)', padding: '30px', borderRadius: '28px', border: '1px solid var(--ios-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 20px 0', fontSize: '17px', fontWeight: '700' }}>Contact Details</h4>
              {profileMessage && <div style={{ background: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '12px', marginBottom: '15px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>{profileMessage}</div>}

              <form onSubmit={handleProfileUpdate}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#8e8e93', fontWeight: '800', marginBottom: '6px', marginLeft: '4px' }}>EMAIL ADDRESS</label>
                  <input className="custom-input" type="email" value={formData.email} disabled={!isEditing} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', background: isEditing ? 'white' : 'rgba(0,0,0,0.03)', border: isEditing ? '1px solid #007aff' : 'none' }} />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#8e8e93', fontWeight: '800', marginBottom: '6px', marginLeft: '4px' }}>RESIDENTIAL ADDRESS</label>
                  <textarea className="custom-input" rows="2" value={formData.address} disabled={!isEditing} onChange={(e) => setFormData({...formData, address: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', background: isEditing ? 'white' : 'rgba(0,0,0,0.03)', border: isEditing ? '1px solid #007aff' : 'none', fontFamily: 'inherit' }} />
                </div>

                {!isEditing ? (
                  <button type="button" onClick={() => setIsEditing(true)} className="btn btn-edit" style={{ width: '100%' }}>Update Contact Info</button>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-add" style={{ flex: 2 }}>Save Changes</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-edit" style={{ flex: 1, color: '#ff3b30', background: 'rgba(255,59,48,0.1)' }}>Cancel</button>
                  </div>
                )}
              </form>
            </div>

            {/* Security */}
            <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(30px)', padding: '30px', borderRadius: '28px', border: '1px solid var(--ios-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
              <h4 style={{ margin: '0 0 20px 0', fontSize: '17px', fontWeight: '700' }}>Security</h4>
              {pwdMessage && <div style={{ background: isPwdError ? '#fee2e2' : '#dcfce7', color: isPwdError ? '#991b1b' : '#166534', padding: '10px', borderRadius: '12px', marginBottom: '15px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>{pwdMessage}</div>}

              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="password" placeholder="Current Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="custom-input" style={{ width: '100%', boxSizing: 'border-box', background: 'white', border: '1px solid rgba(0,0,0,0.1)' }} required />
                <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="custom-input" style={{ width: '100%', boxSizing: 'border-box', background: 'white', border: '1px solid rgba(0,0,0,0.1)' }} required />
                <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="custom-input" style={{ width: '100%', boxSizing: 'border-box', background: 'white', border: '1px solid rgba(0,0,0,0.1)' }} required />
                <button type="submit" className="btn btn-add" style={{ marginTop: '5px' }}>Update Password</button>
              </form>
            </div>
            
            <p style={{ textAlign: 'center', color: '#8e8e93', fontSize: '12px', marginTop: '20px', fontWeight: '500' }}>Official records (Name, Roll No) can only be changed by Admin.</p>
          </div>
        )}

        {/* =========================================
            TAB 2: CLASSES (ERP)
            ========================================= */}
        {activeTab === 'classes' && (
          <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(30px)', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', animation: 'appLaunch 0.4s ease-out' }}>
            <h3 style={{ marginTop: 0, fontSize: '22px', color: '#1d1d1f' }}>Current Semester Enrollments</h3>
            
            {classes.length === 0 ? (
              <p style={{ color: '#8e8e93', background: 'rgba(0,0,0,0.03)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>You are not currently enrolled in any classes.</p>
            ) : (
              <div className="year-grid">
                {classes.map(enroll => (
                  <div key={enroll.id} style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#007aff', marginBottom: '8px' }}>{enroll.course?.courseCode || 'N/A'} • Sec {enroll.section}</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#1d1d1f', marginBottom: '10px' }}>{enroll.course?.courseName || 'Unknown Course'}</div>
                    <div style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>👨‍🏫 Prof. {enroll.faculty?.name || 'TBA'}</div>
                    <div style={{ fontSize: '13px', color: '#8e8e93', marginTop: '5px' }}>{enroll.academicSemester} • {enroll.course?.credits || 0} Credits</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================
            TAB 3: GRADES (ERP)
            ========================================= */}
        {activeTab === 'grades' && (
          <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(30px)', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', animation: 'appLaunch 0.4s ease-out' }}>
            <h3 style={{ marginTop: 0, fontSize: '22px', color: '#1d1d1f', marginBottom: '20px' }}>Official Report Card</h3>
            
            {marks.length === 0 ? (
              <p style={{ color: '#8e8e93', background: 'rgba(0,0,0,0.03)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>No grades have been published for you yet.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Internal Marks</th>
                    <th>Semester Marks</th>
                    <th>Total Score</th>
                    <th style={{ textAlign: 'right' }}>Final Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map(mark => (
                    <tr key={mark.id}>
                      <td style={{ fontWeight: '700', color: '#1d1d1f' }}>{mark.course?.courseName || 'N/A'} <span style={{ fontSize: '12px', color: '#8e8e93', fontWeight: '500', marginLeft: '8px' }}>({mark.course?.courseCode || 'N/A'})</span></td>
                      <td>{mark.internalMarks || '0'} / 40</td>
                      <td>{mark.semesterMarks || '0'} / 60</td>
                      <td style={{ fontWeight: '600' }}>{mark.totalMarks || '0'} / 100</td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ background: mark.grade === 'F' ? '#fee2e2' : '#dcfce7', color: mark.grade === 'F' ? '#991b1b' : '#166534', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', fontSize: '16px' }}>
                          {mark.grade || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* =========================================
            TAB 4: ATTENDANCE (ERP)
            ========================================= */}
        {activeTab === 'attendance' && (
          <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(30px)', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', animation: 'appLaunch 0.4s ease-out' }}>
            <h3 style={{ marginTop: 0, fontSize: '22px', color: '#1d1d1f', marginBottom: '20px' }}>Attendance History</h3>
            
            {attendance.length === 0 ? (
              <p style={{ color: '#8e8e93', background: 'rgba(0,0,0,0.03)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>No attendance records found.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map(record => (
                    <tr key={record.id}>
                      <td style={{ fontWeight: '600', color: '#475569' }}>{new Date(record.date).toLocaleDateString()}</td>
                      <td style={{ fontWeight: '700', color: '#1d1d1f' }}>{record.course?.courseName || 'N/A'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ background: record.status === 'Absent' ? '#fee2e2' : '#dcfce7', color: record.status === 'Absent' ? '#991b1b' : '#166534', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', fontSize: '14px' }}>
                          {record.status === 'Absent' ? '🔴 Absent' : '🟢 Present'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default StudentProfile;