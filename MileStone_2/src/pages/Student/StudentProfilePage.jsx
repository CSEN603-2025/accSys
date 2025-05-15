import React, { useState, useRef, useEffect } from 'react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { User, Upload, X, Edit2, AlertCircle, Award } from 'lucide-react'; // Added AlertCircle and Award icons

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
    profilePicture: currentUser?.profilePicture || null,
  };
  const initialInterests = currentUser?.interests || [];
  const initialInternships = currentUser?.internships || [];
  const initialActivities = currentUser?.activities || [];

  const [profile, setProfile] = useState(initialProfile);
  const [editMode, setEditMode] = useState(false);
  const [interests, setInterests] = useState(initialInterests);
  const [newInterest, setNewInterest] = useState('');
  const [internships, setInternships] = useState(initialInternships);
  const [newInternship, setNewInternship] = useState({ company: '', role: '', duration: '', description: '' });
  const [activities, setActivities] = useState(initialActivities);
  const [newActivity, setNewActivity] = useState({ name: '', role: '', description: '' });
  const [profileImagePreview, setProfileImagePreview] = useState(profile.profilePicture);
  const fileInputRef = useRef(null);
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false
  });

  // Update preview when currentUser changes
  useEffect(() => {
    if (currentUser?.profilePicture) {
      setProfileImagePreview(currentUser.profilePicture);
      setProfile(prev => ({ ...prev, profilePicture: currentUser.profilePicture }));
    }
  }, [currentUser?.profilePicture]);

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

  const handleProfileEdit = () => setEditMode(true);

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result;
        setProfileImagePreview(imageDataUrl);
        setProfile(prev => ({ ...prev, profilePicture: imageDataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleProfileSave = () => {
    // Validate required fields
    const errors = {
      name: !profile.name.trim(),
      email: !profile.email.trim()
    };

    setFormErrors(errors);

    // If there are errors, don't proceed with save
    if (errors.name || errors.email) {
      return;
    }

    // Update currentUser data if available
    if (currentUser) {
      currentUser.username = profile.name;
      currentUser.email = profile.email;
      currentUser.phone = profile.phone;
      currentUser.major = profile.major;
      currentUser.graduationYear = profile.graduationYear;
      currentUser.gpa = profile.gpa;
      currentUser.semesterNumber = profile.semesterNumber;
      currentUser.profilePicture = profile.profilePicture;
    }

    setEditMode(false);
  };

  const handleProfileCancel = () => {
    setProfile(initialProfile);
    setProfileImagePreview(initialProfile.profilePicture);
    setEditMode(false);
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

  // Helper function to get user initials for avatar
  const getUserInitials = () => {
    if (!profile.name) return 'U';

    const words = profile.name.split(' ').filter(word => word.length > 0);
    if (words.length === 0) return 'U';
    return words.map(word => word[0]).join('').toUpperCase().substring(0, 2);
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
          {/* Profile Card */}
          <div style={{ marginBottom: 32, padding: 24, border: '1px solid #e2e8f0', borderRadius: 10 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Personal Information</h3>

            {editMode ? (
              <div className="edit-profile-mode">
                <div style={{ marginBottom: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: profileImagePreview ? 'transparent' : '#1746a2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }} onClick={triggerFileInput}>
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Profile"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{
                          fontWeight: 700,
                          fontSize: 42,
                          color: '#fff'
                        }}>
                          {getUserInitials()}
                        </span>
                      )}
                    </div>

                    {/* Edit icon positioned outside the avatar - bottom right */}
                    <div
                      onClick={triggerFileInput}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: -10,
                        background: '#1746a2',
                        color: '#fff',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        zIndex: 2
                      }}
                    >
                      <Edit2 size={16} />
                    </div>
                  </div>

                  {/* Add Pro Student badge in edit mode */}
                  {currentUser?.isProStudent && (
                    <div style={{
                      background: '#10b981',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '10px'
                    }}>
                      <Award size={12} />
                      PRO STUDENT
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Vertical form layout with labels */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                  {/* Name field */}
                  <div>
                    <label
                      htmlFor="name"
                      style={{
                        display: 'block',
                        marginBottom: 6,
                        fontWeight: 500,
                        fontSize: 14,
                        color: formErrors.name ? '#ef4444' : '#4b5563'
                      }}
                    >
                      Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your full name"
                      style={{
                        width: '100%',
                        padding: 10,
                        border: `1px solid ${formErrors.name ? '#ef4444' : '#d1d5db'}`,
                        borderRadius: '0.375rem',
                        backgroundColor: formErrors.name ? '#fef2f2' : 'transparent'
                      }}
                    />
                    {formErrors.name && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#ef4444',
                        fontSize: 12,
                        marginTop: 4
                      }}>
                        <AlertCircle size={12} style={{ marginRight: 4 }} />
                        Full Name is required
                      </div>
                    )}
                  </div>

                  {/* Email field */}
                  <div>
                    <label
                      htmlFor="email"
                      style={{
                        display: 'block',
                        marginBottom: 6,
                        fontWeight: 500,
                        fontSize: 14,
                        color: formErrors.email ? '#ef4444' : '#4b5563'
                      }}
                    >
                      Email Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      placeholder="Enter your email address"
                      style={{
                        width: '100%',
                        padding: 10,
                        border: `1px solid ${formErrors.email ? '#ef4444' : '#d1d5db'}`,
                        borderRadius: '0.375rem',
                        backgroundColor: formErrors.email ? '#fef2f2' : 'transparent'
                      }}
                    />
                    {formErrors.email && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#ef4444',
                        fontSize: 12,
                        marginTop: 4
                      }}>
                        <AlertCircle size={12} style={{ marginRight: 4 }} />
                        Email Address is required
                      </div>
                    )}
                  </div>

                  {/* Phone field */}
                  <div>
                    <label
                      htmlFor="phone"
                      style={{
                        display: 'block',
                        marginBottom: 6,
                        fontWeight: 500,
                        fontSize: 14,
                        color: '#4b5563'
                      }}
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter your phone number"
                      style={{
                        width: '100%',
                        padding: 10,
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    />
                  </div>

                  {/* Major dropdown */}
                  <div>
                    <label
                      htmlFor="major"
                      style={{
                        display: 'block',
                        marginBottom: 6,
                        fontWeight: 500,
                        fontSize: 14,
                        color: '#4b5563'
                      }}
                    >
                      Major
                    </label>
                    <select
                      id="major"
                      name="major"
                      value={profile.major}
                      onChange={handleProfileChange}
                      style={{
                        width: '100%',
                        padding: 10,
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    >
                      <option value="">Select Major</option>
                      {MAJOR_OPTIONS.map(major => (
                        <option key={major} value={major}>{major}</option>
                      ))}
                    </select>
                  </div>

                  {/* Semester number dropdown */}
                  <div>
                    <label
                      htmlFor="semesterNumber"
                      style={{
                        display: 'block',
                        marginBottom: 6,
                        fontWeight: 500,
                        fontSize: 14,
                        color: '#4b5563'
                      }}
                    >
                      Current Semester
                    </label>
                    <select
                      id="semesterNumber"
                      name="semesterNumber"
                      value={profile.semesterNumber}
                      onChange={handleProfileChange}
                      style={{
                        width: '100%',
                        padding: 10,
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    >
                      {SEMESTER_OPTIONS.map(num => (
                        <option key={num} value={num}>{`Semester ${num}`}</option>
                      ))}
                    </select>
                  </div>

                  {/* Graduation Year field */}
                  <div>
                    <label
                      htmlFor="graduationYear"
                      style={{
                        display: 'block',
                        marginBottom: 6,
                        fontWeight: 500,
                        fontSize: 14,
                        color: '#4b5563'
                      }}
                    >
                      Expected Graduation Year
                    </label>
                    <input
                      id="graduationYear"
                      name="graduationYear"
                      value={profile.graduationYear}
                      onChange={handleProfileChange}
                      placeholder="Enter your expected graduation year"
                      style={{
                        width: '100%',
                        padding: 10,
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                    />
                  </div>

                  {/* GPA field */}
                  <div>
                    <label
                      htmlFor="gpa"
                      style={{
                        display: 'block',
                        marginBottom: 6,
                        fontWeight: 500,
                        fontSize: 14,
                        color: '#4b5563'
                      }}
                    >
                      GPA (0-4)
                    </label>
                    <input
                      id="gpa"
                      name="gpa"
                      value={profile.gpa}
                      onChange={handleProfileChange}
                      placeholder="Enter your GPA"
                      style={{
                        width: '100%',
                        padding: 10,
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem'
                      }}
                      type="number"
                      min="0"
                      max="4"
                      step="0.01"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button onClick={handleProfileCancel} style={{ background: '#e2e8f0', color: '#1746a2', padding: '10px 20px', borderRadius: 6, border: 'none', fontWeight: 500 }}>Cancel</button>
                  <button onClick={handleProfileSave} style={{ background: '#1746a2', color: '#fff', padding: '10px 20px', borderRadius: 6, border: 'none', fontWeight: 500 }}>Save Changes</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: '100%',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between'
                }}>
                  {/* Left side with avatar and personal info */}
                  <div style={{
                    width: '30%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingRight: 20
                  }}>
                    {/* Profile avatar - matching NavBar style */}
                    <div style={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: '#1746a2',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 42,
                      marginBottom: 16,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      overflow: 'hidden'
                    }}>
                      {profile.profilePicture ? (
                        <img
                          src={profile.profilePicture}
                          alt="Profile"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        getUserInitials()
                      )}
                    </div>

                    {/* Name and email */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: 16,
                      width: '100%'
                    }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: 18,
                        marginBottom: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
                        {profile.name}
                        {/* Add Pro Student badge in profile page */}
                        {currentUser?.isProStudent && (
                          <div style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <Award size={10} />
                            PRO
                          </div>
                        )}
                      </div>
                      <div style={{
                        color: '#64748b',
                        fontSize: 14,
                        wordBreak: 'break-word'
                      }}>
                        {profile.email}
                      </div>
                    </div>
                  </div>

                  {/* Right side with additional details */}
                  <div style={{
                    width: '40%',
                    textAlign: 'left'
                  }}>
                    <div style={{ marginBottom: 10 }}><b>Phone:</b> {profile.phone || 'Not specified'}</div>
                    <div style={{ marginBottom: 10 }}><b>Major:</b> {profile.major || 'Not specified'}</div>
                    <div style={{ marginBottom: 10 }}><b>Graduation Year:</b> {profile.graduationYear || 'Not specified'}</div>
                    <div style={{ marginBottom: 10 }}><b>GPA:</b> {profile.gpa || 'Not specified'}</div>
                    <div style={{ marginBottom: 0 }}><b>Semester Number:</b> {profile.semesterNumber || 'Not specified'}</div>
                    <button
                      onClick={handleProfileEdit}
                      style={{
                        background: '#1746a2',
                        color: '#fff',
                        padding: '8px 18px',
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        width: '75%',
                        marginTop: 8
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
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
            <input value={newInterest} onChange={e => setNewInterest(e.target.value)} placeholder="Add new interest..." style={{ padding: 8, marginRight: 8, border: '1px solid #d1d5db', borderRadius: '0.375rem', marginBottom: '10px' }} />
            <br />
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
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Previous Internships/Part-time Jobs</h3>
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
              <input name="company" value={newInternship.company} onChange={handleInternshipChange} placeholder="Company" style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
              <input name="role" value={newInternship.role} onChange={handleInternshipChange} placeholder="Role" style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
              <input name="duration" value={newInternship.duration} onChange={handleInternshipChange} placeholder="Duration" style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
            </div>
            <textarea name="description" value={newInternship.description} onChange={handleInternshipChange} placeholder="Description" style={{ padding: 8, width: '100%', marginBottom: 8, border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
            <button
              onClick={handleAddInternship}
              style={{
                background: (!newInternship.company || !newInternship.role) ? '#cbd5e1' : '#1746a2',
                color: (!newInternship.company || !newInternship.role) ? '#64748b' : '#fff',
                padding: '8px 18px',
                borderRadius: 6,
                border: 'none',
                cursor: (!newInternship.company || !newInternship.role) ? 'not-allowed' : 'pointer',
                opacity: (!newInternship.company || !newInternship.role) ? 0.7 : 1
              }}
              disabled={!newInternship.company || !newInternship.role}
            >Add</button>
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
              <input name="name" value={newActivity.name} onChange={handleActivityChange} placeholder="Activity Name" style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
              <input name="role" value={newActivity.role} onChange={handleActivityChange} placeholder="Role" style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
            </div>
            <textarea name="description" value={newActivity.description} onChange={handleActivityChange} placeholder="Description" style={{ padding: 8, width: '100%', marginBottom: 8, border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
            <button
              onClick={handleAddActivity}
              style={{
                background: (!newActivity.name || !newActivity.role) ? '#cbd5e1' : '#1746a2',
                color: (!newActivity.name || !newActivity.role) ? '#64748b' : '#fff',
                padding: '8px 18px',
                borderRadius: 6,
                border: 'none',
                cursor: (!newActivity.name || !newActivity.role) ? 'not-allowed' : 'pointer',
                opacity: (!newActivity.name || !newActivity.role) ? 0.7 : 1
              }}
              disabled={!newActivity.name || !newActivity.role}
            >Add</button>
          </div>
          {currentUser?.isProStudent && (
            <div style={{ marginTop: 32, padding: 24, border: '1px solid #e2e8f0', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 16 }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Technical Assessments</h3>
                <div style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <Award size={12} />
                  PRO
                </div>
              </div>
              
              {currentUser?.assessmentScores?.length > 0 ? (
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                  {currentUser.assessmentScores.map((assessment, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#f8fafc',
                        borderRadius: 8,
                        padding: '1rem',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 600 }}>{assessment.title}</div>
                        <span style={{
                          background: assessment.score >= 70 ? '#dcfce7' : '#fee2e2',
                          color: assessment.score >= 70 ? '#166534' : '#991b1b',
                          padding: '2px 8px',
                          borderRadius: 12,
                          fontSize: 14,
                          fontWeight: 500
                        }}>
                          {assessment.score}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: 14 }}>
                        <span>{assessment.difficulty}</span>
                        <span>{new Date(assessment.completedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  color: '#64748b',
                  background: '#f1f5f9',
                  padding: '1rem',
                  borderRadius: 8,
                  textAlign: 'center'
                }}>
                  No assessments completed yet. Complete technical assessments to showcase your skills!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
