import React, { useState } from 'react';
import SideBar from '../Components/SideBar';
import NavBar from '../Components/NavBar';
import { mockUsers, mockInternships } from '../DummyData/mockUsers';

import { Eye, Edit2, Trash2, Upload, Search } from 'lucide-react';
import { Application, InternshipPost } from '../models/models';

// Check this code in InternshipPage.jsx
const getInternshipsForUser = (currentUser) => {
  let internships = [...mockInternships]; // Start with all internships

  if (!currentUser) return [];

  switch (currentUser.role.toLowerCase()) {
    case 'student':
      // Students see all approved internships
      return internships.filter(internship => internship.isApproved);

    case 'company':
      // Companies see all internships
      return internships;

    case 'faculty':
    case 'scad':
      // Faculty and SCAD see all internships
      return internships;

    default:
      return [];
  }
};

const STATUS_COLORS = {
  approved: { bg: '#dcfce7', color: '#16a34a' },
  pending: { bg: '#fef3c7', color: '#b45309' },
};

const InternshipPage = ({ currentUser, setCurrentUser }) => {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [search, setSearch] = useState("");
  const isStudent = currentUser?.role === 'student';
  const isCompany = currentUser?.role === 'company';
  const isFaculty = currentUser?.role === 'faculty';
  const isSCAD = currentUser?.role === 'scad';
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyData, setApplyData] = useState({
    name: currentUser?.username || '',
    email: currentUser?.email || '',
    major: currentUser?.major || '',
    gpa: currentUser?.gpa || '',
    semester: currentUser?.semesterNumber || ''
  });
  const [applySuccess, setApplySuccess] = useState(false);
  const [industryFilter, setIndustryFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [paidFilter, setPaidFilter] = useState('');
  const [myInternshipsOnly, setMyInternshipsOnly] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({ cv: null, coverLetter: null, certificates: null });
  const [editData, setEditData] = useState({
    title: '',
    location: '',
    description: '',
    startDate: '',
    endDate: '',
    skills: []
  });

  // Get unique industries for filter dropdown
  const industries = Array.from(new Set(getInternshipsForUser(currentUser).map(i => i.company.industry))).filter(Boolean);

  // Get internships based on user role
  let internships = getInternshipsForUser(currentUser);

  // Apply my internships filter for companies
  if (isCompany && myInternshipsOnly) {
    internships = internships.filter(i => i.company.id === currentUser.id);
  }

  // Apply search filter
  if (search.trim()) {
    internships = internships.filter(i =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.company.companyName.toLowerCase().includes(search.toLowerCase()) ||
      i.location.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Apply industry filter
  if (industryFilter) {
    internships = internships.filter(i => i.company.industry === industryFilter);
  }

  // Apply duration filter
  if (durationFilter) {
    internships = internships.filter(i => {
      const duration = (new Date(i.endDate) - new Date(i.startDate)) / (1000 * 60 * 60 * 24 * 30); // Convert to months
      switch (durationFilter) {
        case '<2': return duration < 2;
        case '2-4': return duration >= 2 && duration <= 4;
        case '>4': return duration > 4;
        default: return true;
      }
    });
  }

  // Apply paid filter
  if (paidFilter) {
    internships = internships.filter(i => i.paid === (paidFilter === 'paid'));
  }

  const handleView = (internship) => {
    setSelected(internship);
    setShowModal(true);
  };

  const openApplyModal = (internship) => {
    setSelected(internship);
    setShowApplyModal(true);
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    setApplying(true);

    // Create new application
    const newApplication = new Application(
      Date.now(), // Use timestamp as ID
      currentUser,
      selected,
      'pending',
      new Date(),
      {
        ...applyData,
        files: uploadedFiles
      }
    );

    // Add application to student's applications
    currentUser.applyToInternship(newApplication);

    // Add applicant to internship
    selected.addApplicant(newApplication);

    setApplying(false);
    setApplySuccess(true);
    setTimeout(() => {
      setShowApplyModal(false);
      setApplySuccess(false);
      setSelected(null);
      setUploadedFiles({ cv: null, coverLetter: null, certificates: null });
    }, 2000);
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFiles(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  // Handle edit internship
  const handleEdit = (internship) => {
    setSelected(internship);
    setEditData({
      title: internship.title || '',
      location: internship.location || '',
      description: internship.description || '',
      startDate: internship.startDate.toISOString().split('T')[0] || '',
      endDate: internship.endDate.toISOString().split('T')[0] || '',
      skills: internship.skills || []
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    // Find the internship in mockInternships and update it
    const internshipIndex = mockInternships.findIndex(i => i.id === selected.id);
    if (internshipIndex !== -1) {
      mockInternships[internshipIndex] = {
        ...mockInternships[internshipIndex],
        ...editData,
        startDate: new Date(editData.startDate),
        endDate: new Date(editData.endDate),
        skills: editData.skills.split(',').map(s => s.trim()).filter(Boolean)
      };
    }

    setShowEditModal(false);
    setSelected(null);
  };

  // Check if internship belongs to current company
  const isOwnInternship = (internship) => {
    return isCompany && internship.company.id === currentUser.id;
  };

  // Handle delete with instant update
  const handleDelete = (internship) => {
    if (window.confirm('Are you sure you want to delete this internship posting?')) {
      const index = mockInternships.findIndex(i => i.id === internship.id);
      if (index !== -1) {
        mockInternships.splice(index, 1);
        // Update the internships list without changing filters
        internships = internships.filter(i => i.id !== internship.id);
        // Close modal if open
        if (showModal) {
          setShowModal(false);
          setSelected(null);
        }
        // Force re-render
        setSearch(prev => prev + '');
      }
    }
  };

  // Get applicants count - only show for company's own internships
  const getApplicantsCount = (internship) => {
    if (isOwnInternship(internship)) {
      return internship.applicants?.length || 0;
    }
    return '-';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SideBar userRole={currentUser?.role?.toLowerCase() || 'student'} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ maxWidth: 1800, margin: '2rem auto', padding: '0 1rem' }}>
          {/* Title and subtitle - Updated structure */}
          <div style={{ marginBottom: 16, marginTop: 16 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
              {isSCAD ? 'Browse Internships' : 'Browse and apply for internships'}
            </h1>
          </div>
          {/* Card container */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            padding: '1.5rem',
            marginTop: 12, /* Reduced from 18 to 12 */
            maxWidth: 1800,
            marginLeft: 'auto',
            marginRight: 'auto',
            overflowX: 'auto'
          }}>
            {/* Search and filter row */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8, /* Reduced from 18 to 8 */
              gap: 12,
              padding: '0.25rem' /* Reduced from 0.5rem to 0.25rem */
            }}>
              <div></div> {/* Empty div to maintain flex layout */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {/* Move search bar to filter controls section */}
                {isCompany && (
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: 15,
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={myInternshipsOnly}
                      onChange={e => setMyInternshipsOnly(e.target.checked)}
                    />
                    My Internships Only
                  </label>
                )}
              </div>
            </div>

            {/* Filter controls with search bar */}
            <div style={{
              display: 'flex',
              gap: 16,
              marginBottom: 16, /* You can adjust this value if needed */
              marginTop: 0, /* Ensures no extra space at the top */
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {/* Remove the "Internships" label */}
              {/* <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#334155',
                margin: 0,
                paddingRight: 16
              }}>
                Internships
              </h3> */}

              {/* Add search bar here */}
              <div style={{ position: 'relative', minWidth: '200px' }}>
                <Search size={18} style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }} />
                <input
                  type="text"
                  placeholder="Search internships..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 16px 8px 38px',
                    fontSize: '15px',
                    width: '200px',
                    outline: 'none',
                    background: '#f1f5f9'
                  }}
                />
              </div>

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
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'separate', borderSpacing: 0, background: '#fff' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                    <th style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>Company</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>Title</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>Location</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>Duration</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>Paid</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>Applicants</th>
                    {(isFaculty || isSCAD) && (
                      <th style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>Status</th>
                    )}
                    <th style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {internships.length === 0 ? (
                    <tr><td colSpan={isFaculty || isSCAD ? 9 : 8} style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>No internships found.</td></tr>
                  ) : internships.map((internship, idx) => (
                    <tr key={internship.id} style={{ background: idx % 2 === 1 ? '#f8fafc' : '#fff', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 16px', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{internship.company?.companyName || '-'}</td>
                      <td style={{ padding: '14px 16px', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{internship.title || '-'}</td>
                      <td style={{ padding: '14px 16px', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{internship.location || '-'}</td>
                      <td style={{ padding: '14px 16px', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        {internship.startDate && internship.endDate ?
                          `${Math.round((new Date(internship.endDate) - new Date(internship.startDate)) / (1000 * 60 * 60 * 24 * 30))}m` :
                          '-'}
                      </td>
                      <td style={{ padding: '14px 16px', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        {internship.paid ? <span style={{ color: '#16a34a', fontWeight: 600 }}>Paid</span> : <span style={{ color: '#991b1b', fontWeight: 600 }}>Unpaid</span>}
                      </td>
                      <td style={{ padding: '14px 16px', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        <span style={{
                          background: isOwnInternship(internship) ? '#e0e7ff' : '#f1f5f9',
                          color: isOwnInternship(internship) ? '#1746a2' : '#64748b',
                          borderRadius: 8,
                          padding: '4px 12px',
                          fontWeight: 600,
                          fontSize: 14
                        }}>
                          {getApplicantsCount(internship)}
                        </span>
                      </td>
                      {(isFaculty || isSCAD) && (
                        <td style={{ padding: '14px 16px', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                          <span style={{
                            background: STATUS_COLORS[internship.isApproved ? 'approved' : 'pending'].bg,
                            color: STATUS_COLORS[internship.isApproved ? 'approved' : 'pending'].color,
                            borderRadius: 8,
                            padding: '4px 12px',
                            fontWeight: 600,
                            fontSize: 14
                          }}>
                            {internship.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                      )}
                      <td style={{ padding: '14px 16px', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => handleView(internship)}
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #e2e8f0',
                              borderRadius: 8,
                              padding: '6px',
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {isOwnInternship(internship) && (
                            <>
                              <button
                                onClick={() => handleEdit(internship)}
                                style={{
                                  background: '#1746a2',
                                  border: 'none',
                                  borderRadius: 8,
                                  padding: '6px',
                                  color: '#fff',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(internship)}
                                style={{
                                  background: '#fee2e2',
                                  border: 'none',
                                  borderRadius: 8,
                                  padding: '6px',
                                  color: '#991b1b',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                          {isStudent && internship.isApproved && (
                            <button
                              onClick={() => openApplyModal(internship)}
                              style={{
                                background: '#1746a2',
                                border: 'none',
                                borderRadius: 8,
                                padding: '6px',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Apply"
                            >
                              <Upload size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Modal for internship details */}
        {showModal && selected && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.18)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: '1.5rem',
              width: '100%',
              maxWidth: 540,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              position: 'relative'
            }}>
              <button
                onClick={() => { setShowModal(false); setSelected(null); }}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >×</button>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 10, paddingRight: '2rem' }}>{selected.title}</h3>
              <div style={{ color: '#64748b', marginBottom: 8 }}><b>Company:</b> {selected.company.companyName}</div>
              <div style={{ color: '#64748b', marginBottom: 8 }}><b>Location:</b> {selected.location}</div>
              <div style={{ color: '#64748b', marginBottom: 8 }}><b>Duration:</b> {selected.startDate && selected.endDate ?
                `${Math.round((new Date(selected.endDate) - new Date(selected.startDate)) / (1000 * 60 * 60 * 24 * 30))} months` :
                '-'}</div>
              <div style={{ color: '#64748b', marginBottom: 8 }}><b>Status:</b> {selected.isApproved ? 'Approved' : 'Pending'}</div>
              <div style={{ color: '#64748b', marginBottom: 8 }}><b>Skills Required:</b> {Array.isArray(selected.skills) ? selected.skills.join(', ') : '-'}</div>
              {isOwnInternship(selected) && (
                <div style={{ color: '#64748b', marginBottom: 8 }}><b>Total Applicants:</b> {getApplicantsCount(selected)}</div>
              )}
              <div style={{ color: '#334155', marginBottom: 18 }}><b>Job Description:</b> {selected.description}</div>
              {isStudent && selected.isApproved && (
                <button
                  style={{
                    background: '#1746a2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.75rem 1.5rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  onClick={() => { setShowModal(false); openApplyModal(selected); }}
                >
                  Apply Now
                </button>
              )}
              {isOwnInternship(selected) && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button
                    style={{
                      background: '#1746a2',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '0.75rem 1.5rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      flex: 1
                    }}
                    onClick={() => { setShowModal(false); handleEdit(selected); }}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      background: '#fee2e2',
                      color: '#991b1b',
                      border: 'none',
                      borderRadius: 6,
                      padding: '0.75rem 1.5rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      flex: 1
                    }}
                    onClick={() => handleDelete(selected)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Modal for editing internship */}
        {showEditModal && selected && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.18)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: '1.5rem',
              width: '100%',
              maxWidth: 540,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              position: 'relative'
            }}>
              <button
                onClick={() => { setShowEditModal(false); setSelected(null); }}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >×</button>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20, paddingRight: '2rem' }}>Edit Internship</h3>
              <form onSubmit={handleEditSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editData.title}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editData.location}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Description</label>
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0', minHeight: 100 }}
                    required
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={editData.startDate}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={editData.endDate}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Skills (comma-separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={Array.isArray(editData.skills) ? editData.skills.join(', ') : editData.skills}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#1746a2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.75rem 1.5rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Save Changes
                </button>
              </form>
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
            padding: '1rem'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: '1.5rem',
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
                  top: 12,
                  right: 12,
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >×</button>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 10, paddingRight: '2rem' }}>Apply for {selected.title}</h3>

              <div style={{ color: '#64748b', marginBottom: 8 }}><b>Company:</b> {selected.company.companyName}</div>
              <form onSubmit={handleApplySubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                marginTop: 24
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Name</label>
                  <input
                    type="text"
                    value={applyData.name}
                    onChange={(e) => setApplyData(prev => ({ ...prev, name: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email</label>
                  <input
                    type="email"
                    value={applyData.email}
                    onChange={(e) => setApplyData(prev => ({ ...prev, email: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Major</label>
                  <input
                    type="text"
                    value={applyData.major}
                    onChange={(e) => setApplyData(prev => ({ ...prev, major: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>GPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={applyData.gpa}
                    onChange={(e) => setApplyData(prev => ({ ...prev, gpa: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Current Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={applyData.semester}
                    onChange={(e) => setApplyData(prev => ({ ...prev, semester: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => document.getElementById('cv-upload').click()}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    <Upload size={18} /> Upload CV
                  </button>
                  <input id="cv-upload" name="cv" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
                  {uploadedFiles.cv && (
                    <span style={{ color: '#16a34a', fontSize: 14 }}>✓ {uploadedFiles.cv.name}</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => document.getElementById('coverLetter-upload').click()}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    <Upload size={18} /> Upload Cover Letter
                  </button>
                  <input id="coverLetter-upload" name="coverLetter" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
                  {uploadedFiles.coverLetter && (
                    <span style={{ color: '#16a34a', fontSize: 14 }}>✓ {uploadedFiles.coverLetter.name}</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => document.getElementById('certificates-upload').click()}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    <Upload size={18} /> Upload Certificates
                  </button>
                  <input id="certificates-upload" name="certificates" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: 'none' }} />
                  {uploadedFiles.certificates && (
                    <span style={{ color: '#16a34a', fontSize: 14 }}>✓ {uploadedFiles.certificates.name}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={applying}
                  style={{
                    background: '#1746a2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.75rem 1.5rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: applying ? 'not-allowed' : 'pointer',
                    opacity: applying ? 0.7 : 1,
                    width: '100%'
                  }}
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
              {applySuccess && (
                <div style={{
                  background: '#dcfce7',
                  color: '#16a34a',
                  padding: '0.75rem 1rem',
                  borderRadius: 6,
                  marginTop: 16,
                  textAlign: 'center',
                  fontWeight: 500
                }}>
                  Application submitted successfully!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternshipPage;
