import React, { useState } from 'react';
import SideBar from '../Components/SideBar';
import NavBar from '../Components/NavBar';
import { mockUsers } from '../DummyData/mockUsers';
import { mockInternships } from '../DummyData/mockInternships';
import { BriefcaseBusiness, UploadCloud } from 'lucide-react';
import { Application } from '../models/User';

// Check this code in InternshipPage.jsx
const getInternshipsForUser = (currentUser) => {
  let internships = [...mockInternships]; // Start with all internships
  
  if (!currentUser) return [];

  switch (currentUser.role.toLowerCase()) {
    case 'student':
      // Students see all approved internships
      return internships.filter(internship => internship.isApproved);
      
    case 'company':
      // Companies see only their own postings
      return internships.filter(internship => 
        internship.company.id === currentUser.id
      );
      
    case 'faculty':
    case 'scad':
      // Faculty and SCAD see all internships
      return internships;
      
    default:
      return []; // Make sure you're returning a proper default
  }
};

const STATUS_COLORS = {
  approved: { bg: '#dcfce7', color: '#16a34a' },
  pending: { bg: '#fef3c7', color: '#b45309' },
};

const InternshipPage = ({ currentUser, setCurrentUser }) => {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const isStudent = currentUser?.role === 'student';
  const isCompany = currentUser?.role === 'company';
  const isFaculty = currentUser?.role === 'faculty';
  const isSCAD = currentUser?.role === 'scad';
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyData, setApplyData] = useState({ name: currentUser?.username || '', email: currentUser?.email || '', major: currentUser?.major || '', gpa: currentUser?.gpa || '', semester: currentUser?.semesterNumber || '' });
  const [applySuccess, setApplySuccess] = useState(false);
  const [industryFilter, setIndustryFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [paidFilter, setPaidFilter] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState({ cv: null, coverLetter: null, certificates: null });

  // Get unique industries for filter dropdown
  const industries = Array.from(new Set(getInternshipsForUser(currentUser).map(i => i.company.industry))).filter(Boolean);

  // Get internships based on user role
  let internships = getInternshipsForUser(currentUser);
  if (search.trim()) {
    internships = internships.filter(i =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.company.companyName.toLowerCase().includes(search.toLowerCase())
    );
  }
  // Filter by industry
  if (industryFilter) {
    internships = internships.filter(i => i.company.industry === industryFilter);
  }
  // Filter by duration
  if (durationFilter) {
    internships = internships.filter(i => {
      if (!i.durationMonths) return false;
      if (durationFilter === '<2') return i.durationMonths < 2;
      if (durationFilter === '2-4') return i.durationMonths >= 2 && i.durationMonths <= 4;
      if (durationFilter === '>4') return i.durationMonths > 4;
      return true;
    });
  }
  // Filter by paid/unpaid
  if (paidFilter) {
    internships = internships.filter(i => paidFilter === 'paid' ? i.paid : !i.paid);
  }

  // Get page title based on user role
  const getPageTitle = () => {
    if (isCompany) return "Your Internship Postings";
    if (isFaculty) return "All Internships";
    if (isSCAD) return "All Internships";
    return "Available Internships";
  };

  // Open modal with internship details
  const handleView = (internship) => {
    setSelected(internship);
    setShowModal(true);
  };

  // Open the apply modal
  const openApplyModal = (internship) => {
    setSelected(internship);
    setShowApplyModal(true);
    setApplyData({
      name: currentUser?.username || '',
      email: currentUser?.email || '',
      major: currentUser?.major || '',
      gpa: currentUser?.gpa || '',
      semester: currentUser?.semesterNumber || ''
    });
    setApplySuccess(false);
  };

  // Handle apply form change
  const handleApplyChange = (e) => {
    setApplyData({ ...applyData, [e.target.name]: e.target.value });
  };

  // Handle apply form submit
  const handleApplySubmit = (e) => {
    e.preventDefault();
    setApplySuccess(true);
    
    // Create a new application
    const newApp = new Application(
      Date.now(),
      currentUser,
      selected,
      'pending',
      new Date(),
      { ...applyData }
    );

    // Add the application to the student's applications
    currentUser.applyToInternship(newApp);

    // Update the current user state
    setCurrentUser({
      ...currentUser,
      applications: [...currentUser.applications]
    });

    setTimeout(() => {
      setShowApplyModal(false);
      setSelected(null);
      setApplySuccess(false);
      alert('Application submitted!');
    }, 1200);
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setUploadedFiles(prev => ({ ...prev, [name]: files[0] }));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole={currentUser?.role?.toLowerCase() || 'student'} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ maxWidth: 1800, margin: '2rem auto', padding: 0 }}>
          {/* Title and subtitle */}
          <div style={{ marginBottom: 24, marginTop: 24 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{getPageTitle()}</div>
            <div style={{ color: '#64748b', fontSize: 17, marginTop: 4 }}>Browse and manage internships</div>
          </div>
          {/* Card container */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '2.5rem 2.5rem 2rem 2.5rem', marginTop: 18, maxWidth: 1800, marginLeft: 'auto', marginRight: 'auto' }}>
            {/* Search and filter row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 24 }}>Internships</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  type="text"
                  placeholder="Search internships..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: 15,
                    width: 220,
                    outline: 'none',
                  }}
                />
                <button style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontWeight: 600,
                  fontSize: 15,
                  color: '#334155',
                  cursor: 'pointer',
                }}>Filter</button>
              </div>
            </div>
            {/* Filter controls */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 18, alignItems: 'center' }}>
              <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15 }}>
                <option value=''>All Industries</option>
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
              <select value={durationFilter} onChange={e => setDurationFilter(e.target.value)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15 }}>
                <option value=''>All Durations</option>
                <option value='<2'>{'< 2 months'}</option>
                <option value='2-4'>{'2-4 months'}</option>
                <option value='>4'>{'> 4 months'}</option>
              </select>
              <select value={paidFilter} onChange={e => setPaidFilter(e.target.value)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15 }}>
                <option value=''>Paid or Unpaid</option>
                <option value='paid'>Paid</option>
                <option value='unpaid'>Unpaid</option>
              </select>
            </div>
            {/* Table */}
            <table style={{ width: '100%', minWidth: 1200, borderCollapse: 'separate', borderSpacing: 0, background: '#fff' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>Company</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>Position</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>Location</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>Duration</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>Paid</th>
                  {(isFaculty || isSCAD) && (
                    <th style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>Status</th>
                  )}
                  <th style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {internships.length === 0 ? (
                  <tr><td colSpan={isFaculty || isSCAD ? 8 : 7} style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>No internships found.</td></tr>
                ) : internships.map((internship, idx) => (
                  <tr key={internship.id} style={{ background: idx % 2 === 1 ? '#f8fafc' : '#fff', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px 16px', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0' }}>{internship.company?.companyName || '-'}</td>
                    <td style={{ padding: '14px 16px', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0' }}>{internship.title || '-'}</td>
                    <td style={{ padding: '14px 16px', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0' }}>{internship.location || '-'}</td>
                    <td style={{ padding: '14px 16px', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0' }}>{internship.durationMonths ? `${internship.durationMonths} month${internship.durationMonths > 1 ? 's' : ''}` : '-'}</td>
                    <td style={{ padding: '14px 16px', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0' }}>
                      {internship.paid ? <span style={{ color: '#16a34a', fontWeight: 600 }}>Paid</span> : <span style={{ color: '#991b1b', fontWeight: 600 }}>Unpaid</span>}
                    </td>
                    {(isFaculty || isSCAD) && (
                      <td style={{ padding: '14px 16px', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0' }}>
                        <span style={{
                          background: STATUS_COLORS[internship.isApproved ? 'approved' : 'pending'].bg,
                          color: STATUS_COLORS[internship.isApproved ? 'approved' : 'pending'].color,
                          borderRadius: 8,
                          padding: '4px 14px',
                          fontWeight: 600,
                          fontSize: 15,
                          display: 'inline-block',
                        }}>{internship.isApproved ? 'Approved' : 'Pending'}</span>
                      </td>
                    )}
                    <td style={{ padding: '14px 16px', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0' }}>
                      <button style={{
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        padding: '6px 18px',
                        fontWeight: 600,
                        fontSize: 15,
                        color: '#334155',
                        cursor: 'pointer',
                        marginRight: 8
                      }} onClick={() => handleView(internship)}>View</button>
                      {isStudent && internship.isApproved && (
                        <button style={{
                          background: '#1746a2',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 18px',
                          fontWeight: 600,
                          fontSize: 15,
                          color: '#fff',
                          cursor: 'pointer',
                        }} onClick={() => openApplyModal(internship)}>Apply</button>
                      )}
                      {isCompany && (
                        <button style={{
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          padding: '6px 18px',
                          fontWeight: 600,
                          fontSize: 15,
                          color: '#334155',
                          cursor: 'pointer',
                          marginLeft: 8
                        }}>Edit</button>
                      )}
                      {(isFaculty || isSCAD) && !internship.isApproved && (
                        <>
                          <button style={{
                            background: '#dcfce7',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 12px',
                            fontWeight: 600,
                            fontSize: 15,
                            color: '#16a34a',
                            cursor: 'pointer',
                            marginRight: 4
                          }}>✔</button>
                          <button style={{
                            background: '#fee2e2',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 12px',
                            fontWeight: 600,
                            fontSize: 15,
                            color: '#991b1b',
                            cursor: 'pointer',
                          }}>✖</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Modal for internship details */}
        {showModal && selected && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 400, maxWidth: 540, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', position: 'relative' }}>
              <button onClick={() => { setShowModal(false); setSelected(null); }} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#64748b', cursor: 'pointer' }}>×</button>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{selected.title}</h3>
              <div style={{ color: '#64748b', marginBottom: 8 }}><b>Company:</b> {selected.company.companyName}</div>
              <div style={{ color: '#64748b', marginBottom: 8 }}><b>Industry:</b> {selected.company.industry}</div>
              <div style={{ color: '#64748b', marginBottom: 8 }}><b>Location:</b> {selected.location}</div>
              <div style={{ color: '#64748b', marginBottom: 8 }}><b>Duration:</b> {selected.durationMonths ? `${selected.durationMonths} month${selected.durationMonths > 1 ? 's' : ''}` : '-'}</div>
              <div style={{ color: '#64748b', marginBottom: 8 }}><b>Paid:</b> {selected.paid ? 'Paid' : 'Unpaid'}</div>
              {selected.paid && (
                <div style={{ color: '#64748b', marginBottom: 8 }}><b>Expected Salary:</b> {selected.salary ? `${selected.salary} EGP/month` : '-'}</div>
              )}
              <div style={{ color: '#64748b', marginBottom: 8 }}><b>Skills Required:</b> {Array.isArray(selected.skills) ? selected.skills.join(', ') : '-'}</div>
              <div style={{ color: '#334155', marginBottom: 18 }}><b>Job Description:</b> {selected.description}</div>
              {isStudent && selected.isApproved && (
                <button
                  style={{ background: '#1746a2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                  onClick={() => openApplyModal(selected)}
                >
                  Apply
                </button>
              )}
            </div>
          </div>
        )}
        {/* Modal for applying to internship */}
        {showApplyModal && selected && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(0,0,0,0.18)', 
            zIndex: 1100, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: window.innerWidth < 768 ? '20px' : '0'
          }}>
            <div style={{ 
              background: '#fff', 
              borderRadius: 12, 
              padding: window.innerWidth < 768 ? '24px' : '32px', 
              width: '100%',
              maxWidth: 540, 
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)', 
              position: 'relative'
            }}>
              <button 
                onClick={() => { setShowApplyModal(false); setApplySuccess(false); }} 
                style={{ 
                  position: 'absolute', 
                  top: 16, 
                  right: 16, 
                  background: 'none', 
                  border: 'none', 
                  fontSize: 22, 
                  color: '#64748b', 
                  cursor: 'pointer',
                  zIndex: 1
                }}
              >×</button>
              <h3 style={{ 
                fontSize: window.innerWidth < 480 ? 20 : 22, 
                fontWeight: 700, 
                marginBottom: 10,
                paddingRight: 24 // Make space for close button
              }}>Apply for {selected.title}</h3>
              <div style={{ color: '#64748b', marginBottom: 8 }}><b>Company:</b> {selected.company.companyName}</div>
              <form onSubmit={handleApplySubmit} style={{ 
                marginTop: 18, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 12 
              }}>
                <div>
                  <label style={{ 
                    fontWeight: 500, 
                    display: 'block', 
                    marginBottom: 4,
                    fontSize: window.innerWidth < 480 ? 14 : 15
                  }}>Name</label>
                  <input 
                    name="name" 
                    value={applyData.name} 
                    onChange={handleApplyChange} 
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      borderRadius: 6, 
                      border: '1px solid #e2e8f0',
                      fontSize: window.innerWidth < 480 ? 14 : 15
                    }} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ 
                    fontWeight: 500, 
                    display: 'block', 
                    marginBottom: 4,
                    fontSize: window.innerWidth < 480 ? 14 : 15
                  }}>Email</label>
                  <input 
                    name="email" 
                    value={applyData.email} 
                    onChange={handleApplyChange} 
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      borderRadius: 6, 
                      border: '1px solid #e2e8f0',
                      fontSize: window.innerWidth < 480 ? 14 : 15
                    }} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ 
                    fontWeight: 500, 
                    display: 'block', 
                    marginBottom: 4,
                    fontSize: window.innerWidth < 480 ? 14 : 15
                  }}>Major</label>
                  <input 
                    name="major" 
                    value={applyData.major} 
                    onChange={handleApplyChange} 
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      borderRadius: 6, 
                      border: '1px solid #e2e8f0',
                      fontSize: window.innerWidth < 480 ? 14 : 15
                    }} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ 
                    fontWeight: 500, 
                    display: 'block', 
                    marginBottom: 4,
                    fontSize: window.innerWidth < 480 ? 14 : 15
                  }}>GPA</label>
                  <input 
                    name="gpa" 
                    value={applyData.gpa} 
                    onChange={handleApplyChange} 
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      borderRadius: 6, 
                      border: '1px solid #e2e8f0',
                      fontSize: window.innerWidth < 480 ? 14 : 15
                    }} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ 
                    fontWeight: 500, 
                    display: 'block', 
                    marginBottom: 4,
                    fontSize: window.innerWidth < 480 ? 14 : 15
                  }}>Semester</label>
                  <input 
                    name="semester" 
                    value={applyData.semester} 
                    onChange={handleApplyChange} 
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      borderRadius: 6, 
                      border: '1px solid #e2e8f0',
                      fontSize: window.innerWidth < 480 ? 14 : 15
                    }} 
                    required 
                  />
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: window.innerWidth < 480 ? 'column' : 'row',
                  alignItems: window.innerWidth < 480 ? 'stretch' : 'center', 
                  gap: 8 
                }}>
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('cv-upload').click()} 
                    style={{ 
                      background: '#f1f5f9', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: 8, 
                      padding: '8px 16px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8,
                      fontSize: window.innerWidth < 480 ? 14 : 15,
                      flex: window.innerWidth < 480 ? '1' : 'auto'
                    }}
                  >
                    <UploadCloud size={window.innerWidth < 480 ? 16 : 18} /> Upload CV
                  </button>
                  <input id="cv-upload" name="cv" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
                  {uploadedFiles.cv && (
                    <span style={{ 
                      fontSize: window.innerWidth < 480 ? 13 : 14,
                      wordBreak: 'break-all'
                    }}>{uploadedFiles.cv.name}</span>
                  )}
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: window.innerWidth < 480 ? 'column' : 'row',
                  alignItems: window.innerWidth < 480 ? 'stretch' : 'center', 
                  gap: 8 
                }}>
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('coverLetter-upload').click()} 
                    style={{ 
                      background: '#f1f5f9', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: 8, 
                      padding: '8px 16px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8,
                      fontSize: window.innerWidth < 480 ? 14 : 15,
                      flex: window.innerWidth < 480 ? '1' : 'auto'
                    }}
                  >
                    <UploadCloud size={window.innerWidth < 480 ? 16 : 18} /> Upload Cover Letter
                  </button>
                  <input id="coverLetter-upload" name="coverLetter" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
                  {uploadedFiles.coverLetter && (
                    <span style={{ 
                      fontSize: window.innerWidth < 480 ? 13 : 14,
                      wordBreak: 'break-all'
                    }}>{uploadedFiles.coverLetter.name}</span>
                  )}
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: window.innerWidth < 480 ? 'column' : 'row',
                  alignItems: window.innerWidth < 480 ? 'stretch' : 'center', 
                  gap: 8 
                }}>
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('certificates-upload').click()} 
                    style={{ 
                      background: '#f1f5f9', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: 8, 
                      padding: '8px 16px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8,
                      fontSize: window.innerWidth < 480 ? 14 : 15,
                      flex: window.innerWidth < 480 ? '1' : 'auto'
                    }}
                  >
                    <UploadCloud size={window.innerWidth < 480 ? 16 : 18} /> Upload Certificates
                  </button>
                  <input id="certificates-upload" name="certificates" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: 'none' }} />
                  {uploadedFiles.certificates && (
                    <span style={{ 
                      fontSize: window.innerWidth < 480 ? 13 : 14,
                      wordBreak: 'break-all'
                    }}>{uploadedFiles.certificates.name}</span>
                  )}
                </div>
                <button 
                  type="submit" 
                  style={{ 
                    background: '#1746a2', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 6, 
                    padding: '8px 24px', 
                    fontWeight: 600, 
                    fontSize: window.innerWidth < 480 ? 15 : 16, 
                    cursor: 'pointer', 
                    marginTop: 8,
                    width: window.innerWidth < 480 ? '100%' : 'auto'
                  }}
                >
                  Submit Application
                </button>
                {applySuccess && (
                  <div style={{ 
                    color: '#16a34a', 
                    fontWeight: 600, 
                    fontSize: window.innerWidth < 480 ? 15 : 16, 
                    marginTop: 12,
                    textAlign: 'center'
                  }}>Application submitted!</div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternshipPage;
