import React, { useState } from 'react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';

// Define major options
const MAJOR_OPTIONS = [
  "Computer Science & Engineering",
  "Digital Media engineering & Technology",
  "Networks Engineering",
  "Electronics Engineering",
  "Communications Engineering",
  "Architectural Engineering",
  "Design and Production Engineering",
  "Mechatronics Engineering",
  "Civil Engineering",
  "Business Informatics",
  "General Management",
  "Technology-based Management",
  "Pharmacy",
  "Biotechnology",
  "Graphic Design",
  "Media Design",
  "Product Design",
];

const SEMESTER_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

const StudentProfilePage = ({ currentUser }) => {
  // Use currentUser for initial values if available
  const initialProfile = {
    name: currentUser?.username || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    major: currentUser?.major || '',
    graduationYear: currentUser?.graduationYear || '',
    gpa: currentUser?.gpa || '',
    semesterNumber: currentUser?.semesterNumber || 1,
  };
  const initialInterests = currentUser?.interests || [];
  const initialInternships = currentUser?.internships || [];
  const initialActivities = currentUser?.activities || [];

  const [profile, setProfile] = useState(initialProfile);
  const [editProfile, setEditProfile] = useState(false);
  const [interests, setInterests] = useState(initialInterests);
  const [newInterest, setNewInterest] = useState('');
  const [internships, setInternships] = useState(initialInternships);
  const [newInternship, setNewInternship] = useState({ company: '', role: '', duration: '', description: '' });
  const [activities, setActivities] = useState(initialActivities);
  const [newActivity, setNewActivity] = useState({ name: '', role: '', description: '' });

  // Profile handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === 'gpa') {
      // Only allow numbers between 0 and 4, with up to 2 decimals
      const num = value.replace(/[^0-9.]/g, '');
      if (num === '' || (Number(num) >= 0 && Number(num) <= 4)) {
        setProfile({ ...profile, gpa: num });
      }
    } else if (name === 'semesterNumber') {
      setProfile({ ...profile, semesterNumber: Number(value) });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleProfileEdit = () => setEditProfile(true);

  const handleProfileSave = () => {
    // Update currentUser data if available
    if (currentUser) {
      currentUser.username = profile.name;
      currentUser.email = profile.email;
      currentUser.phone = profile.phone;
      currentUser.major = profile.major;
      currentUser.graduationYear = profile.graduationYear;
      currentUser.gpa = profile.gpa;
      currentUser.semesterNumber = profile.semesterNumber;
    }

    setEditProfile(false);
  };

  const handleProfileCancel = () => {
    setProfile(initialProfile);
    setEditProfile(false);
  };

  // Interests handlers
  const handleAddInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests(prev => {
        const updated = [...prev, trimmed];
        if (currentUser?.interests) currentUser.interests = updated;
        return updated;
      });
      setNewInterest('');
    }
  };
  const handleRemoveInterest = (interest) => {
    setInterests(prev => {
      const updated = prev.filter(i => i !== interest);
      if (currentUser?.interests) currentUser.interests = updated;
      return updated;
    });
  };

  // Internships handlers
  const handleInternshipChange = (e) => {
    setNewInternship({ ...newInternship, [e.target.name]: e.target.value });
  };
  const handleAddInternship = () => {
    if (newInternship.company && newInternship.role) {
      setInternships(prev => {
        const updated = [...prev, { ...newInternship }];
        if (currentUser?.internships) currentUser.internships = updated;
        return updated;
      });
      setNewInternship({ company: '', role: '', duration: '', description: '' });
    }
  };
  const handleRemoveInternship = (idx) => {
    setInternships(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      if (currentUser?.internships) currentUser.internships = updated;
      return updated;
    });
  };

  // Activities handlers
  const handleActivityChange = (e) => {
    setNewActivity({ ...newActivity, [e.target.name]: e.target.value });
  };
  const handleAddActivity = () => {
    if (newActivity.name && newActivity.role) {
      setActivities(prev => {
        const updated = [...prev, { ...newActivity }];
        if (currentUser?.activities) currentUser.activities = updated;
        return updated;
      });
      setNewActivity({ name: '', role: '', description: '' });
    }
  };
  const handleRemoveActivity = (idx) => {
    setActivities(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      if (currentUser?.activities) currentUser.activities = updated;
      return updated;
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <SideBar userRole={currentUser?.role?.toLowerCase() || 'student'} />
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Navbar */}
        <NavBar currentUser={currentUser} />
        {/* Profile Content */}
        <div style={{ maxWidth: 900, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Student Profile</h2>
          {/* Profile Card */}
          <div style={{ marginBottom: 32, padding: 24, border: '1px solid #e2e8f0', borderRadius: 10 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Personal Information</h3>
            {editProfile ? (
              <>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <input name="name" value={profile.name} onChange={handleProfileChange} placeholder="Name" style={{ flex: 1, padding: 8 }} />
                  <input name="email" value={profile.email} onChange={handleProfileChange} placeholder="Email" style={{ flex: 1, padding: 8 }} />
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <input name="phone" value={profile.phone} onChange={handleProfileChange} placeholder="Phone" style={{ flex: 1, padding: 8 }} />

                  {/* Major dropdown */}
                  <select
                    name="major"
                    value={profile.major}
                    onChange={handleProfileChange}
                    style={{ flex: 1, padding: 8 }}
                  >
                    <option value="">Select Major</option>
                    {MAJOR_OPTIONS.map(major => (
                      <option key={major} value={major}>{major}</option>
                    ))}
                  </select>

                  {/* Semester number dropdown */}
                  <select
                    name="semesterNumber"
                    value={profile.semesterNumber}
                    onChange={handleProfileChange}
                    style={{ flex: 1, padding: 8 }}
                  >
                    {SEMESTER_OPTIONS.map(num => (
                      <option key={num} value={num}>{`Semester ${num}`}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <input name="graduationYear" value={profile.graduationYear} onChange={handleProfileChange} placeholder="Graduation Year" style={{ flex: 1, padding: 8 }} />
                  <input
                    name="gpa"
                    value={profile.gpa}
                    onChange={handleProfileChange}
                    placeholder="GPA"
                    style={{ flex: 1, padding: 8 }}
                    type="number"
                    min="0"
                    max="4"
                    step="0.01"
                  />
                </div>
                <button onClick={handleProfileSave} style={{ marginRight: 12, background: '#1746a2', color: '#fff', padding: '8px 18px', borderRadius: 6, border: 'none' }}>Save</button>
                <button onClick={handleProfileCancel} style={{ background: '#e2e8f0', color: '#1746a2', padding: '8px 18px', borderRadius: 6, border: 'none' }}>Cancel</button>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 8 }}><b>Name:</b> {profile.name}</div>
                <div style={{ marginBottom: 8 }}><b>Email:</b> {profile.email}</div>
                <div style={{ marginBottom: 8 }}><b>Phone:</b> {profile.phone}</div>
                <div style={{ marginBottom: 8 }}><b>Major:</b> {profile.major}</div>
                <div style={{ marginBottom: 8 }}><b>Graduation Year:</b> {profile.graduationYear}</div>
                <div style={{ marginBottom: 8 }}><b>GPA:</b> {profile.gpa}</div>
                <div style={{ marginBottom: 8 }}><b>Semester Number:</b> {profile.semesterNumber}</div>
                <button onClick={handleProfileEdit} style={{ background: '#1746a2', color: '#fff', padding: '8px 18px', borderRadius: 6, border: 'none' }}>Edit</button>
              </>
            )}
          </div>
          {/* Job Interests */}
          <div style={{ marginBottom: 32, padding: 24, border: '1px solid #e2e8f0', borderRadius: 10 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Job Interests</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              {interests.map((interest, idx) => (
                <span key={idx} style={{ background: '#e0e7ff', color: '#1746a2', padding: '6px 14px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {interest}
                  <button onClick={() => handleRemoveInterest(interest)} style={{ background: 'none', border: 'none', color: '#ef4444', marginLeft: 4, cursor: 'pointer', fontWeight: 700 }}>×</button>
                </span>
              ))}
            </div>
            <input value={newInterest} onChange={e => setNewInterest(e.target.value)} placeholder="Add new interest..." style={{ padding: 8, marginRight: 8 }} />
            <button
              onClick={handleAddInterest}
              disabled={!newInterest.trim() || interests.includes(newInterest.trim())}
              style={{
                background: (!newInterest.trim() || interests.includes(newInterest.trim())) ? '#cbd5e1' : '#1746a2',
                color: (!newInterest.trim() || interests.includes(newInterest.trim())) ? '#64748b' : '#fff',
                padding: '8px 18px',
                borderRadius: 6,
                border: 'none',
                cursor: (!newInterest.trim() || interests.includes(newInterest.trim())) ? 'not-allowed' : 'pointer',
                opacity: (!newInterest.trim() || interests.includes(newInterest.trim())) ? 0.7 : 1
              }}
            >Add</button>
          </div>
          {/* Previous Internships */}
          <div style={{ marginBottom: 32, padding: 24, border: '1px solid #e2e8f0', borderRadius: 10 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Previous Internships</h3>
            <ul style={{ marginBottom: 16 }}>
              {internships.map((intern, idx) => (
                <li key={idx} style={{ marginBottom: 10, background: '#f1f5f9', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b>{intern.company}</b> - {intern.role} ({intern.duration})<br />
                    <span style={{ fontSize: 14 }}>{intern.description}</span>
                  </div>
                  <button onClick={() => handleRemoveInternship(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>×</button>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input name="company" value={newInternship.company} onChange={handleInternshipChange} placeholder="Company" style={{ padding: 8 }} />
              <input name="role" value={newInternship.role} onChange={handleInternshipChange} placeholder="Role" style={{ padding: 8 }} />
              <input name="duration" value={newInternship.duration} onChange={handleInternshipChange} placeholder="Duration" style={{ padding: 8 }} />
            </div>
            <textarea name="description" value={newInternship.description} onChange={handleInternshipChange} placeholder="Description" style={{ padding: 8, width: '100%', marginBottom: 8 }} />
            <button
              onClick={handleAddInternship}
              style={{
                background: ( !newInternship.company || !newInternship.role ) ? '#cbd5e1' : '#1746a2',
                color: ( !newInternship.company || !newInternship.role ) ? '#64748b' : '#fff',
                padding: '8px 18px',
                borderRadius: 6,
                border: 'none',
                cursor: ( !newInternship.company || !newInternship.role ) ? 'not-allowed' : 'pointer',
                opacity: ( !newInternship.company || !newInternship.role ) ? 0.7 : 1
              }}
              disabled={ !newInternship.company || !newInternship.role }
            >Add Internship</button>
          </div>
          {/* College Activities */}
          <div style={{ marginBottom: 0, padding: 24, border: '1px solid #e2e8f0', borderRadius: 10 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>College Activities</h3>
            <ul style={{ marginBottom: 16 }}>
              {activities.map((act, idx) => (
                <li key={idx} style={{ marginBottom: 10, background: '#f1f5f9', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b>{act.name}</b> - {act.role}<br />
                    <span style={{ fontSize: 14 }}>{act.description}</span>
                  </div>
                  <button onClick={() => handleRemoveActivity(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>×</button>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input name="name" value={newActivity.name} onChange={handleActivityChange} placeholder="Activity Name" style={{ padding: 8 }} />
              <input name="role" value={newActivity.role} onChange={handleActivityChange} placeholder="Role" style={{ padding: 8 }} />
            </div>
            <textarea name="description" value={newActivity.description} onChange={handleActivityChange} placeholder="Description" style={{ padding: 8, width: '100%', marginBottom: 8 }} />
            <button
              onClick={handleAddActivity}
              style={{
                background: ( !newActivity.name || !newActivity.role ) ? '#cbd5e1' : '#1746a2',
                color: ( !newActivity.name || !newActivity.role ) ? '#64748b' : '#fff',
                padding: '8px 18px',
                borderRadius: 6,
                border: 'none',
                cursor: ( !newActivity.name || !newActivity.role ) ? 'not-allowed' : 'pointer',
                opacity: ( !newActivity.name || !newActivity.role ) ? 0.7 : 1
              }}
              disabled={ !newActivity.name || !newActivity.role }
            >Add Activity</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
