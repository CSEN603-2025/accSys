import React, { useState } from 'react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';

const StudentProfilePage = ({ currentUser }) => {
  // Use currentUser for initial values if available
  const initialProfile = {
    name: currentUser?.username || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    major: currentUser?.major || '',
    graduationYear: currentUser?.graduationYear || '',
    gpa: currentUser?.gpa || '',
  };
  const initialInterests = currentUser?.interests || ['Web Development', 'AI', 'Data Science'];
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
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  const handleProfileEdit = () => setEditProfile(true);
  const handleProfileSave = () => setEditProfile(false);
  const handleProfileCancel = () => {
    setProfile(initialProfile);
    setEditProfile(false);
  };

  // Interests handlers
  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };
  const handleRemoveInterest = (interest) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  // Internships handlers
  const handleInternshipChange = (e) => {
    setNewInternship({ ...newInternship, [e.target.name]: e.target.value });
  };
  const handleAddInternship = () => {
    if (newInternship.company && newInternship.role) {
      setInternships([...internships, newInternship]);
      setNewInternship({ company: '', role: '', duration: '', description: '' });
    }
  };
  const handleRemoveInternship = (idx) => {
    setInternships(internships.filter((_, i) => i !== idx));
  };

  // Activities handlers
  const handleActivityChange = (e) => {
    setNewActivity({ ...newActivity, [e.target.name]: e.target.value });
  };
  const handleAddActivity = () => {
    if (newActivity.name && newActivity.role) {
      setActivities([...activities, newActivity]);
      setNewActivity({ name: '', role: '', description: '' });
    }
  };
  const handleRemoveActivity = (idx) => {
    setActivities(activities.filter((_, i) => i !== idx));
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
                  <input name="major" value={profile.major} onChange={handleProfileChange} placeholder="Major" style={{ flex: 1, padding: 8 }} />
                  <input name="graduationYear" value={profile.graduationYear} onChange={handleProfileChange} placeholder="Graduation Year" style={{ flex: 1, padding: 8 }} />
                  <input name="gpa" value={profile.gpa} onChange={handleProfileChange} placeholder="GPA" style={{ flex: 1, padding: 8 }} />
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
            <button onClick={handleAddInterest} style={{ background: '#1746a2', color: '#fff', padding: '8px 18px', borderRadius: 6, border: 'none' }}>Add</button>
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
            <button onClick={handleAddInternship} style={{ background: '#1746a2', color: '#fff', padding: '8px 18px', borderRadius: 6, border: 'none' }}>Add Internship</button>
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
            <button onClick={handleAddActivity} style={{ background: '#1746a2', color: '#fff', padding: '8px 18px', borderRadius: 6, border: 'none' }}>Add Activity</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
