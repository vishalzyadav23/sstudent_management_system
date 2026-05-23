import React, { useState, useEffect } from 'react';
import api from '../api'; 
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ParamedicAssistChat from './ParamedicAssistChat';

function StudentProfile() {
  // --- UI STATES ---
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);

  // --- DATA STATES ---
  const [student, setStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]); 
  const [healthData, setHealthData] = useState([]); 
  const [latestHealth, setLatestHealth] = useState(null);
  const [predictiveData, setPredictiveData] = useState(null);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [medicalDocuments, setMedicalDocuments] = useState([]);
  const [documentNotes, setDocumentNotes] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  
  // --- EDIT PROFILE STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ email: '', address: '', emergencyContactName: '', emergencyContactPhone: '' });
  const [profileMessage, setProfileMessage] = useState('');

  // --- SECURITY STATES ---
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [isPwdError, setIsPwdError] = useState(false);

  // --- PROFILE PICTURE STATE ---
  const [profilePic, setProfilePic] = useState(null);

  // --- NEW: LEARNING PORTAL STATE ---
  const [selectedClass, setSelectedClass] = useState(null);

  const navigate = useNavigate();
  const studentId = localStorage.getItem('studentId');

  // Fetch standard data on load
  useEffect(() => {
    if (!studentId) {
      navigate('/');
      return;
    }

    const fetchAllData = async () => {
      try {
        const profileRes = await api.get(`/students/${studentId}`);
        const studentData = profileRes.data.data || profileRes.data; 
        setStudent(studentData);
        setFormData({
          email: studentData.email || '',
          address: studentData.address || '',
          emergencyContactName: studentData.emergencyContactName || '',
          emergencyContactPhone: studentData.emergencyContactPhone || ''
        });
        
        setProfilePic(studentData.profileImageUrl || null);

        const classesRes = await api.get(`/erp/student/${studentId}/classes`);
        setClasses(classesRes.data.data || classesRes.data || []);

        const marksRes = await api.get(`/erp/student/${studentId}/marks`);
        setMarks(marksRes.data.data || marksRes.data || []);

        const attRes = await api.get(`/erp/student/${studentId}/attendance`);
        setAttendance(attRes.data.data || attRes.data || []);

        const predictiveRes = await api.get(`/ai/student/${studentId}/predictive`);
        setPredictiveData(predictiveRes.data.data || predictiveRes.data.predictive || predictiveRes.data || null);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching portal data:", err);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [navigate, studentId]);

  // --- LIVE IOT HEALTH DATA POLLING ---
  useEffect(() => {
    if (activeTab !== "health") return;

    const fetchHealthData = async () => {
      try {
        const res = await api.get(`/health/student/${studentId}`);
        let data = res.data.data || res.data || [];
        data = data.slice(0, 20).reverse();

        const formattedData = data.map(record => ({
          ...record,
          timeLabel: new Date(record.recordedAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' })
        }));

        setHealthData(formattedData);
        setLatestHealth(formattedData.length > 0 ? formattedData[formattedData.length - 1] : null);
      } catch (err) {
        console.error("Error fetching health data", err);
      }
    };

    const fetchHealthAlerts = async () => {
      try {
        const res = await api.get(`/health/student/${studentId}/alerts`);
        setHealthAlerts(res.data.data || res.data || []);
      } catch (err) {
        console.error("Error fetching health alerts", err);
      }
    };

    const fetchMedicalDocuments = async () => {
      try {
        const res = await api.get(`/health/student/${studentId}/documents`);
        setMedicalDocuments(res.data.data || res.data || []);
      } catch (err) {
        console.error("Error fetching medical documents", err);
      }
    };

    fetchHealthData();
    fetchHealthAlerts();
    fetchMedicalDocuments();

    const interval = setInterval(() => {
      fetchHealthData();
      fetchHealthAlerts();
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab, studentId]);

  // --- Logic: Update Profile (Email/Address) ---
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    api.put(`/students/my-profile/${studentId}`, formData)
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

    api.post('/auth/change-password', { oldPassword, newPassword })
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
      reader.onloadend = async () => {
        const base64String = reader.result; 
        setProfilePic(base64String); 
        
        try {
          await api.put(`/students/${studentId}/photo`, { profileImageUrl: base64String });
        } catch (error) {
          console.error("Failed to save photo to DB:", error);
          alert("Failed to permanently save the profile picture to the server.");
        }
      };
      reader.readAsDataURL(file); 
    }
  };

  const handleDocumentChange = (e) => {
    setSelectedDocument(e.target.files[0] || null);
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!selectedDocument) {
      setUploadMessage('Please choose a medical document first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedDocument);
    if (documentNotes) {
      formData.append('notes', documentNotes);
    }

    try {
      await api.post(`/health/student/${studentId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMessage('Document uploaded successfully.');
      setSelectedDocument(null);
      setDocumentNotes('');
      const docsRes = await api.get(`/health/student/${studentId}/documents`);
      setMedicalDocuments(docsRes.data.data || docsRes.data || []);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadMessage('Upload failed. Please try again.');
    }
  };

  // --- Helper: Convert Standard YouTube Links to Embed Links ---
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) return url.replace("youtu.be/", "www.youtube.com/embed/");
    return url;
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
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '30px', flexWrap: 'wrap' }}>
          {['personal', 'classes', 'grades', 'attendance', 'health'].map(tab => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedClass(null); }} // Reset selected class on tab change
              style={{ 
                padding: '12px 24px', 
                borderRadius: '14px', 
                border: 'none', 
                fontWeight: '700', 
                cursor: 'pointer', 
                background: activeTab === tab ? (tab === 'health' ? '#ff2d55' : '#007aff') : 'rgba(0,0,0,0.05)', 
                color: activeTab === tab ? 'white' : '#475569', 
                transition: 'all 0.2s',
              }}
            >
              {tab === 'personal' ? '👤 Personal Info' : tab === 'classes' ? '📚 My Schedule' : tab === 'grades' ? '🎓 Report Card' : tab === 'attendance' ? '📅 Attendance' : '🩺 Live Vitals'}
            </button>
          ))}
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div style={{ minHeight: '40vh' }}>
        
        {/* TAB: LIVE HEALTH & VITALS */}
        {activeTab === 'health' && (
          <div style={{ animation: "appLaunch 0.4s ease-out" }}>
            <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
              
              <div style={{ flex: 1, minWidth: "160px", background: "white", padding: "20px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(255,45,85,0.1)", borderLeft: "5px solid #ff2d55" }}>
                <h4 style={{ margin: 0, color: "#8e8e93", fontSize: "12px", textTransform: "uppercase" }}>Heart Rate</h4>
                <div style={{ fontSize: "36px", fontWeight: "800", color: "#ff2d55", marginTop: "10px" }}>
                  {healthData.length > 0 ? healthData[healthData.length - 1].bpm : "--"} <span style={{fontSize: "14px", color: "#8e8e93"}}>BPM</span>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: "160px", background: "white", padding: "20px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(88,86,214,0.1)", borderLeft: "5px solid #5856d6" }}>
                <h4 style={{ margin: 0, color: "#8e8e93", fontSize: "12px", textTransform: "uppercase" }}>Blood Oxygen</h4>
                <div style={{ fontSize: "36px", fontWeight: "800", color: "#5856d6", marginTop: "10px" }}>
                  {healthData.length > 0 ? healthData[healthData.length - 1].spo2 : "--"} <span style={{fontSize: "14px", color: "#8e8e93"}}>%</span>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: "160px", background: "white", padding: "20px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(255,149,0,0.1)", borderLeft: "5px solid #ff9500" }}>
                <h4 style={{ margin: 0, color: "#8e8e93", fontSize: "12px", textTransform: "uppercase" }}>Body Temp</h4>
                <div style={{ fontSize: "36px", fontWeight: "800", color: "#ff9500", marginTop: "10px" }}>
                  {healthData.length > 0 && healthData[healthData.length - 1].bodyTemp ? healthData[healthData.length - 1].bodyTemp.toFixed(1) : "--"} <span style={{fontSize: "14px", color: "#8e8e93"}}>°C</span>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: "160px", background: "white", padding: "20px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(50,173,230,0.1)", borderLeft: "5px solid #32ade6" }}>
                <h4 style={{ margin: 0, color: "#8e8e93", fontSize: "12px", textTransform: "uppercase" }}>Room Temp</h4>
                <div style={{ fontSize: "36px", fontWeight: "800", color: "#32ade6", marginTop: "10px" }}>
                  {healthData.length > 0 && healthData[healthData.length - 1].roomTemp ? healthData[healthData.length - 1].roomTemp.toFixed(1) : "--"} <span style={{fontSize: "14px", color: "#8e8e93"}}>°C</span>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: "160px", background: "white", padding: "20px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(52,199,89,0.1)", borderLeft: "5px solid #34c759" }}>
                <h4 style={{ margin: 0, color: "#8e8e93", fontSize: "12px", textTransform: "uppercase" }}>Room Humidity</h4>
                <div style={{ fontSize: "36px", fontWeight: "800", color: "#34c759", marginTop: "10px" }}>
                  {healthData.length > 0 && healthData[healthData.length - 1].roomHumidity ? healthData[healthData.length - 1].roomHumidity.toFixed(1) : "--"} <span style={{fontSize: "14px", color: "#8e8e93"}}>%</span>
                </div>
              </div>

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#ffffff', padding: '22px', borderRadius: '22px', boxShadow: '0 14px 30px rgba(0,0,0,0.05)', borderLeft: '5px solid #ff2d55' }}>
                <div style={{ fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6366f1', marginBottom: '10px' }}>Health Risk</div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#1f2937' }}>{predictiveData?.healthTrend?.healthRiskLabel || 'Loading...'}</div>
                <div style={{ marginTop: '8px', color: '#475569', fontSize: '14px' }}>{predictiveData?.healthTrend?.healthRiskSummary || 'Assessing recent vitals to understand potential risk.'}</div>
              </div>
              <div style={{ background: '#ffffff', padding: '22px', borderRadius: '22px', boxShadow: '0 14px 30px rgba(0,0,0,0.05)', borderLeft: '5px solid #34d399' }}>
                <div style={{ fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#10b981', marginBottom: '10px' }}>Attendance Forecast</div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#1f2937' }}>{predictiveData?.attendanceProjection?.attendanceRiskLabel || 'Loading...'}</div>
                <div style={{ marginTop: '8px', color: '#475569', fontSize: '14px' }}>{predictiveData?.attendanceProjection?.attendanceProjectionSummary || 'Checking attendance history and forecasted impact.'}</div>
              </div>
              <div style={{ background: '#ffffff', padding: '22px', borderRadius: '22px', boxShadow: '0 14px 30px rgba(0,0,0,0.05)', borderLeft: '5px solid #7c3aed' }}>
                <div style={{ fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '10px' }}>Academic Guidance</div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#1f2937' }}>{predictiveData?.academicAdvisor?.academicTrendLabel || 'Loading...'}</div>
                <div style={{ marginTop: '8px', color: '#475569', fontSize: '14px' }}>{predictiveData?.academicAdvisor?.academicAdvisorNotes || 'Synthesizing course performance and tutor advice.'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '22px', borderRadius: '22px', border: '1px solid rgba(15, 23, 42, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Emergency Timeline</h4>
                  <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>{healthAlerts.length} alerts</span>
                </div>
                {healthAlerts.length === 0 ? (
                  <div style={{ color: '#64748b', marginTop: '16px', lineHeight: '1.7' }}>No escalations have been recorded yet. Your wearable sensor data is being monitored continuously.</div>
                ) : (
                  healthAlerts.map(alert => (
                    <div key={alert.id} style={{ marginTop: '16px', padding: '16px', borderRadius: '18px', background: '#ffffff', border: '1px solid rgba(99, 102, 241, 0.12)' }}>
                      <div style={{ fontSize: '14px', color: '#334155', fontWeight: '700' }}>{alert.severity} alert</div>
                      <div style={{ marginTop: '6px', color: '#475569', fontSize: '14px' }}>{alert.message}</div>
                      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>{new Date(alert.createdAt).toLocaleString()}</span>
                        <span style={{ color: alert.severity === 'Critical' ? '#b91c1c' : '#d97706', fontSize: '12px', fontWeight: '600' }}>{alert.emailSent ? 'Nurse/Admin alerted' : 'Pending notification'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ background: '#f8fafc', padding: '22px', borderRadius: '22px', border: '1px solid rgba(15, 23, 42, 0.08)' }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Medical Record Uploads</h4>
                <p style={{ margin: '10px 0 14px', color: '#64748b', fontSize: '14px' }}>Attach prescriptions, scan reports, or physician notes for review.</p>
                <div style={{ display: 'grid', gap: '14px' }}>
                  <input type="file" accept="application/pdf,image/*" onChange={handleDocumentChange} />
                  <textarea
                    rows="3"
                    value={documentNotes}
                    onChange={(e) => setDocumentNotes(e.target.value)}
                    placeholder="Add optional notes for the document"
                    style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid rgba(148, 163, 184, 0.4)', background: 'white' }}
                  />
                  <button onClick={handleDocumentUpload} className="btn btn-add" style={{ width: '100%' }}>Upload Document</button>
                  {uploadMessage && <div style={{ color: '#334155', fontSize: '13px', fontWeight: '600' }}>{uploadMessage}</div>}
                </div>
                {medicalDocuments.length > 0 && (
                  <div style={{ marginTop: '18px', display: 'grid', gap: '12px' }}>
                    {medicalDocuments.map(doc => (
                      <div key={doc.id} style={{ padding: '14px', borderRadius: '16px', background: 'white', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{doc.fileName}</div>
                            <div style={{ fontSize: '12px', color: '#475569' }}>{doc.notes || 'No description provided'}</div>
                          </div>
                          <a
                            href={`data:${doc.contentType};base64,${doc.fileData}`}
                            download={doc.fileName}
                            style={{ color: '#2563eb', fontSize: '12px', fontWeight: '700' }}
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: "white", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 20px 0", color: "#1d1d1f" }}>Real-Time Physiological Telemetry</h3>
              {latestHealth ? (
                <div style={{ marginBottom: '18px', display: 'grid', gap: '10px' }}>
                  <div style={{ color: '#475569', fontSize: '14px' }}>
                    Latest update: <strong>{latestHealth.timeLabel}</strong>
                  </div>
                  <div style={{ color: '#0f766e', fontSize: '14px' }}>
                    Health status: <strong>{latestHealth.spo2 < 94 || latestHealth.bpm > 100 || latestHealth.bodyTemp > 37.5 ? 'Review required' : 'Stable'}</strong>
                  </div>
                  <div style={{ color: '#334155', fontSize: '14px' }}>
                    Sensor source: <strong>{latestHealth.deviceSource || 'Campus health sensor'}</strong>
                  </div>
                  <div style={{ color: '#334155', fontSize: '14px' }}>
                    Emergency contact: <strong>{student.emergencyContactName || student.name}</strong> / <strong>{student.emergencyContactPhone || student.phoneNumber}</strong>
                  </div>
                </div>
              ) : null}
              {healthData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#8e8e93" }}>Waiting for Edge Device connection...</div>
              ) : (
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <LineChart data={healthData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5ea" />
                      <XAxis dataKey="timeLabel" stroke="#8e8e93" fontSize={12} tickMargin={10} />
                      <YAxis yAxisId="left" domain={['dataMin - 5', 'dataMax + 5']} stroke="#ff2d55" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" domain={[90, 100]} stroke="#5856d6" fontSize={12} />
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} />
                      <Line yAxisId="left" type="monotone" dataKey="bpm" name="Heart Rate (BPM)" stroke="#ff2d55" strokeWidth={4} dot={{ r: 4, fill: "#ff2d55" }} activeDot={{ r: 8 }} isAnimationActive={false} />
                      <Line yAxisId="right" type="monotone" dataKey="spo2" name="Blood Oxygen (%)" stroke="#5856d6" strokeWidth={4} dot={{ r: 4, fill: "#5856d6" }} activeDot={{ r: 8 }} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* PARAMEDIC ASSIST CHAT */}
            <ParamedicAssistChat student={student} healthData={healthData} latestReading={latestHealth} />
          </div>
        )}

        {/* TAB 1: PERSONAL INFO */}
        {activeTab === 'personal' && (
          <div style={{ animation: 'appLaunch 0.4s ease-out', maxWidth: '700px', margin: '0 auto' }}>
            
            <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(30px)', padding: '30px', borderRadius: '28px', border: '1px solid var(--ios-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', marginBottom: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                
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

            <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(30px)', padding: '30px', borderRadius: '28px', border: '1px solid var(--ios-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 20px 0', fontSize: '17px', fontWeight: '700' }}>Contact Details</h4>
              {profileMessage && <div style={{ background: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '12px', marginBottom: '15px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>{profileMessage}</div>}

              <form onSubmit={handleProfileUpdate}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#8e8e93', fontWeight: '800', marginBottom: '6px', marginLeft: '4px' }}>EMAIL ADDRESS</label>
                  <input className="custom-input" type="email" value={formData.email} disabled={!isEditing} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', background: isEditing ? 'white' : 'rgba(0,0,0,0.03)', border: isEditing ? '1px solid #007aff' : 'none' }} />
                </div>
                <div style={{ display: 'grid', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#8e8e93', fontWeight: '800', marginBottom: '6px', marginLeft: '4px' }}>EMERGENCY CONTACT NAME</label>
                    <input className="custom-input" type="text" value={formData.emergencyContactName} disabled={!isEditing} onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', background: isEditing ? 'white' : 'rgba(0,0,0,0.03)', border: isEditing ? '1px solid #007aff' : 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#8e8e93', fontWeight: '800', marginBottom: '6px', marginLeft: '4px' }}>EMERGENCY CONTACT PHONE</label>
                    <input className="custom-input" type="tel" value={formData.emergencyContactPhone} disabled={!isEditing} onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', background: isEditing ? 'white' : 'rgba(0,0,0,0.03)', border: isEditing ? '1px solid #007aff' : 'none' }} />
                  </div>
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

        {/* TAB 2: CLASSES (NOW WITH LEARNING PORTAL DRILL-DOWN) */}
        {activeTab === 'classes' && (
          <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(30px)', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', animation: 'appLaunch 0.4s ease-out' }}>
            
            {/* IF NO CLASS IS SELECTED -> SHOW GRID */}
            {!selectedClass ? (
              <>
                <h3 style={{ marginTop: 0, fontSize: '22px', color: '#1d1d1f', marginBottom: '5px' }}>Current Semester Enrollments</h3>
                <p style={{ color: '#8e8e93', marginBottom: '25px', fontSize: '15px' }}>Click on any class to view syllabus notes and video lectures.</p>
                
                {classes.length === 0 ? (
                  <p style={{ color: '#8e8e93', background: 'rgba(0,0,0,0.03)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>You are not currently enrolled in any classes.</p>
                ) : (
                  <div className="year-grid">
                    {classes.map(enroll => (
                      <div key={enroll.id} 
                           onClick={() => setSelectedClass(enroll)}
                           style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.02)' } }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#007aff', marginBottom: '8px' }}>{enroll.course?.courseCode || 'N/A'} • Sec {enroll.section}</div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1d1d1f', marginBottom: '10px' }}>{enroll.course?.courseName || 'Unknown Course'}</div>
                        <div style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>👨‍🏫 Prof. {enroll.faculty?.name || 'TBA'}</div>
                        <div style={{ fontSize: '13px', color: '#8e8e93', marginTop: '5px' }}>{enroll.academicSemester} • {enroll.course?.credits || 0} Credits</div>
                      </div>
                    ))}
                  </div>
                )}

                  {/* NEW: ASSIGNMENT DATE & TIME DISPLAY */}
                  {classes.length > 0 && (
                    <div style={{ marginTop: '25px', padding: '20px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#10b981', fontWeight: '600' }}>📅 Upcoming Class Assignments</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                        {classes.filter(enroll => enroll.assignmentDate).map(enroll => (
                          <div key={enroll.id} style={{ flex: '1 1 250px', background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#10b981' }}>{enroll.course?.courseCode}</div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1d1d1f', marginTop: '5px' }}>{enroll.course?.courseName}</div>
                            <div style={{ fontSize: '12px', color: '#8e8e93', marginTop: '8px' }}>
                              📅 {new Date(enroll.assignmentDate).toLocaleDateString()} at 🕒 {enroll.assignmentTime || 'TBA'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </>
            ) : (
              /* IF CLASS IS SELECTED -> SHOW LEARNING PORTAL */
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                
                {/* Header & Back Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <button 
                    onClick={() => setSelectedClass(null)} 
                    style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>
                    ⬅ Back to Schedule
                  </button>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '24px', color: '#1d1d1f' }}>{selectedClass.course?.courseName}</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#8e8e93', fontWeight: '500' }}>{selectedClass.course?.courseCode} • Prof. {selectedClass.faculty?.name}</p>
                  </div>
                </div>

                {/* Content Workspace */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                  
                  {/* Syllabus / Notes Section */}
                  <div style={{ flex: '1 1 300px', background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#007aff', display: 'flex', alignItems: 'center', gap: '8px' }}><span>📄</span> Syllabus & Notes</h4>
                    {selectedClass.course?.content ? (
                      <div style={{ whiteSpace: 'pre-wrap', color: '#334155', fontSize: '15px', lineHeight: '1.6', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        {selectedClass.course.content}
                      </div>
                    ) : (
                      <p style={{ color: '#8e8e93', fontStyle: 'italic', background: '#f8fafc', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>No notes have been provided for this subject yet.</p>
                    )}
                  </div>

                  {/* Video Lecture Section */}
                  <div style={{ flex: '1 1 300px', background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#ff2d55', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🎥</span> Video Lecture</h4>
                    {selectedClass.course?.videoUrl ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* Interactive embedded YouTube Player */}
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <iframe 
                            src={getEmbedUrl(selectedClass.course.videoUrl)} 
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} 
                            allowFullScreen 
                            title="Course Video"
                          ></iframe>
                        </div>
                        {/* Fallback external link button */}
                        <a href={selectedClass.course.videoUrl} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', background: '#fff1f2', color: '#e11d48', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #fecdd3', transition: 'all 0.2s' }}>
                          Watch externally on YouTube
                        </a>
                      </div>
                    ) : (
                      <p style={{ color: '#8e8e93', fontStyle: 'italic', background: '#f8fafc', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>No video lecture linked for this subject.</p>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GRADES */}
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

        {/* TAB 4: ATTENDANCE */}
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