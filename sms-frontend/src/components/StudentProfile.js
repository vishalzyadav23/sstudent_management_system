import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // States for Editable Fields
  const [formData, setFormData] = useState({ email: '', address: '' });
  const [profileMessage, setProfileMessage] = useState('');

  // States for Password Change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [isPwdError, setIsPwdError] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const studentId = localStorage.getItem('studentId');

  useEffect(() => {
    if (!token || !studentId) {
      navigate('/');
      return;
    }

    axios.get(`http://localhost:8080/api/students/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setStudent(res.data.data);
      setFormData({ email: res.data.data.email, address: res.data.data.address });
    })
    .catch(err => console.error("Error fetching profile", err));
  }, [navigate, token, studentId]);

  // --- Logic: Update Profile (Email/Address) ---
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:8080/api/students/my-profile/${studentId}`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setStudent(res.data.data);
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

    axios.post('http://localhost:8080/api/auth/change-password', 
      { oldPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    )
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

  if (!student) return <div style={{ textAlign: 'center', marginTop: '100px', fontWeight: '600' }}>Loading System...</div>;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '60px' }}>
      
      <header style={{ marginBottom: '30px', animation: 'fadeIn 0.6s ease' }}>
        <h2 style={{ fontSize: '34px', fontWeight: '800', letterSpacing: '-1px', margin: 0 }}>My Profile</h2>
        <p style={{ color: '#8e8e93', fontWeight: '500', margin: '5px 0 0 0' }}>Manage your identity and security settings.</p>
      </header>

      {/* --- SECTION 1: IDENTITY CARD (READ ONLY) --- */}
      <div style={{ background: 'var(--ios-glass)', backdropFilter: 'blur(30px) saturate(200%)', padding: '30px', borderRadius: '28px', border: '1px solid var(--ios-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <div style={{ width: '90px', height: '90px', background: 'linear-gradient(135deg, #007aff, #5856d6)', borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '36px', fontWeight: 'bold', boxShadow: '0 8px 16px rgba(0,122,255,0.3)' }}>
            {student.name.charAt(0)}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '26px', fontWeight: '800' }}>{student.name}</h3>
            <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
              <span className={`dept-badge dept-${(student.department || 'other').toLowerCase()}`}>{student.department}</span>
              <span style={{ color: '#8e8e93', fontWeight: '600', fontSize: '13px' }}>ID: {student.rollNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: EDITABLE CONTACT INFO --- */}
      <div style={{ background: 'var(--ios-glass)', backdropFilter: 'blur(30px) saturate(200%)', padding: '30px', borderRadius: '28px', border: '1px solid var(--ios-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', marginBottom: '25px' }}>
        <h4 style={{ margin: '0 0 20px 0', fontSize: '17px', fontWeight: '700' }}>Contact Details</h4>
        
        {profileMessage && <div style={{ background: '#34c759', color: 'white', padding: '10px', borderRadius: '12px', marginBottom: '15px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>{profileMessage}</div>}

        <form onSubmit={handleProfileUpdate}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#8e8e93', fontWeight: '800', marginBottom: '6px', marginLeft: '4px' }}>EMAIL ADDRESS</label>
            <input 
              className="custom-input" 
              type="email" 
              value={formData.email} 
              disabled={!isEditing} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{ width: '100%', boxSizing: 'border-box', background: isEditing ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.03)' }} 
            />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#8e8e93', fontWeight: '800', marginBottom: '6px', marginLeft: '4px' }}>RESIDENTIAL ADDRESS</label>
            <textarea 
              className="custom-input" 
              rows="2" 
              value={formData.address} 
              disabled={!isEditing} 
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              style={{ width: '100%', boxSizing: 'border-box', background: isEditing ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.03)', fontFamily: 'inherit' }} 
            />
          </div>

          {!isEditing ? (
            <button type="button" onClick={() => setIsEditing(true)} className="btn btn-edit" style={{ width: '100%' }}>Update Contact Info</button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-add" style={{ flex: 2 }}>Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-edit" style={{ flex: 1 }}>Cancel</button>
            </div>
          )}
        </form>
      </div>

      {/* --- SECTION 3: SECURITY --- */}
      <div style={{ background: 'var(--ios-glass)', backdropFilter: 'blur(30px) saturate(200%)', padding: '30px', borderRadius: '28px', border: '1px solid var(--ios-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
        <h4 style={{ margin: '0 0 20px 0', fontSize: '17px', fontWeight: '700' }}>Security</h4>
        
        {pwdMessage && (
          <div style={{ backgroundColor: isPwdError ? '#ff3b30' : '#34c759', color: 'white', padding: '10px', borderRadius: '12px', marginBottom: '15px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
            {pwdMessage}
          </div>
        )}

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="password" placeholder="Current Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="custom-input" style={{ width: '100%', boxSizing: 'border-box' }} required />
          <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="custom-input" style={{ width: '100%', boxSizing: 'border-box' }} required />
          <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="custom-input" style={{ width: '100%', boxSizing: 'border-box' }} required />
          <button type="submit" className="btn btn-add" style={{ marginTop: '5px' }}>Update Password</button>
        </form>
      </div>

      <p style={{ textAlign: 'center', color: '#8e8e93', fontSize: '12px', marginTop: '30px', fontWeight: '500' }}>
        Note: Official records (Name, Roll No) can only be changed by Admin.
      </p>
    </div>
  );
}

export default StudentProfile;