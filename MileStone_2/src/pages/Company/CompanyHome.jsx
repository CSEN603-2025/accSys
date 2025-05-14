import React, { useState } from 'react';
import { BrowserRouter, Route, Link } from "react-router-dom";
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { Users, FileText, Star, Plus, X, ArrowRight } from 'lucide-react';
import { mockUsers } from '../../DummyData/mockUsers';
import { mockInternships } from '../../DummyData/mockUsers';
import { Internship } from '../../models/models';

const CompanyHome = ({ currentUser }) => {
  // State for modal and form
  const [showModal, setShowModal] = useState(false);
  const [postData, setPostData] = useState({
    title: '',
    type: 'paid',
    location: '',
    durationMonths: '',
    description: '',
    salary: '',
    skills: '',
    industry: currentUser?.industry || ''
  });

  // Mock function to add to internship postings
  const addToInternshipPostings = (posting) => {
    // Create a new internship instance
    const newInternship = {
      id: Date.now(), // Use timestamp as temporary ID
      company: {
        id: currentUser.id,
        companyName: currentUser.companyName,
        industry: currentUser.industry,
        location: posting.location
      },
      title: posting.title,
      description: posting.description,
      location: posting.location,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 1 week from now
      endDate: new Date(Date.now() + (7 + 30 * posting.durationMonths) * 24 * 60 * 60 * 1000).toISOString(),
      durationMonths: parseInt(posting.durationMonths),
      paid: posting.type === 'paid',
      salary: posting.type === 'paid' ? parseInt(posting.salary) : 0,
      skills: posting.skills.split(',').map(s => s.trim()).filter(Boolean),
      industry: posting.industry,
      isApproved: false,
      applicationsCount: 0,
      isRemote: posting.location.toLowerCase().includes('remote'),
      department: '',
      contactPerson: currentUser.username,
      tags: posting.skills.split(',').map(s => s.trim()).filter(Boolean),
      createdAt: new Date().toISOString()
    };

    // Add to mockInternships
    mockInternships.push(newInternship);
    
    // Add to company's posted internships
    if (currentUser.postedInternships) {
      currentUser.postedInternships.push(newInternship);
    }
  };

  // Get all students and applications
  const students = mockUsers.filter(u => u.role === 'student');
  let applications = [];
  let activeInterns = 0;
  let completedInternships = 0;
  let pendingApplications = 0;

  students.forEach(student => {
    (student.applications || []).forEach(app => {
      if (app.internship.company.id === currentUser.id) {
        applications.push({
          student: student.username,
          position: app.internship.title,
          date: app.submissionDate ? new Date(app.submissionDate).toLocaleDateString() : '',
          status: app.status,
          id: app.id,
        });
        if (app.status === 'pending') pendingApplications++;
        if (app.status === 'accepted') activeInterns++;
        if (app.status === 'finalized') completedInternships++;
      }
    });
  });

  // Sort applications by date
  applications = applications.sort((a, b) => new Date(b.date) - new Date(a.date));

  const getStatusStyles = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#b45309' },
      accepted: { bg: '#e0e7ff', color: '#1746a2' },
      rejected: { bg: '#fee2e2', color: '#b91c1c' },
      finalized: { bg: '#dcfce7', color: '#166534' }
    };
    return styles[status] || styles.pending;
  };

  const handleDownloadCV = (student) => {
    // Simulating CV download - in real app, this would fetch and download actual file
    const dummyCV = new Blob([`Dummy CV for ${student}\nMajor: ${student.major}\nGPA: ${student.gpa}`], 
      { type: 'text/plain' });
    const url = window.URL.createObjectURL(dummyCV);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student}_CV.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Handle new post submission
  const handleSubmitPost = (e) => {
    e.preventDefault();
    
    addToInternshipPostings(postData);
    
    setPostData({
      title: '',
      type: 'paid',
      location: '',
      durationMonths: '',
      description: '',
      salary: '',
      skills: '',
      industry: currentUser?.industry || ''
    });
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for numeric inputs
    if (name === 'salary' || name === 'durationMonths') {
      // Prevent negative numbers and ensure it's a valid number
      const numValue = Math.max(0, parseInt(value) || 0);
      setPostData(prev => ({ ...prev, [name]: numValue.toString() }));
    } else {
      setPostData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole={currentUser?.role?.toLowerCase() || 'company'} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ padding: '2rem', flex: 1 }}>
          {/* Header with New Post button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>
                Welcome, {currentUser?.companyName || currentUser?.username}
              </h2>
              <div style={{ color: '#64748b' }}>
                Internship management dashboard for your company
              </div>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#1746a2', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8, 
                padding: '10px 24px', 
                fontWeight: 600, 
                fontSize: 16, 
                cursor: 'pointer',
                height: 40,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#0b2e59'}
              onMouseLeave={(e) => e.target.style.background = '#1746a2'}
            >
              <Plus size={20} />
              New Internship Posting
            </button>
          </div>

          {/* New Post Modal */}
          {showModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2rem',
                position: 'relative'
              }}>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}
                >
                  <X size={24} />
                </button>

                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1.5rem', paddingRight: '2rem' }}>
                  Create New Internship Posting
                </h2>
                
                <form onSubmit={handleSubmitPost} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Position Title*
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={postData.title}
                      onChange={handleInputChange}
                      placeholder="Internship Position Title"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc'
                      }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Internship Type*
                      </label>
                      <select
                        name="type"
                        value={postData.type}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc'
                        }}
                        required
                      >
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </div>

                    {postData.type === 'paid' && (
                      <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                          Monthly Salary (EGP)*
                        </label>
                        <input
                          type="number"
                          name="salary"
                          value={postData.salary}
                          onChange={handleInputChange}
                          placeholder="e.g., 3000"
                          min="0"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc'
                          }}
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Location*
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={postData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., Remote, Cairo, etc."
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc'
                        }}
                        required
                      />
                    </div>

                    <div style={{ flex: '1 1 200px' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Duration (months)*
                      </label>
                      <input
                        type="number"
                        name="durationMonths"
                        value={postData.durationMonths}
                        onChange={handleInputChange}
                        placeholder="e.g., 3"
                        min="1"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc'
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Required Skills (comma-separated)*
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={postData.skills}
                      onChange={handleInputChange}
                      placeholder="e.g., React, Node.js, Python"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Description*
                    </label>
                    <textarea
                      name="description"
                      value={postData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the internship position..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        minHeight: '100px',
                        resize: 'vertical'
                      }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#1746a2',
                      color: 'white',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      marginTop: '1rem'
                    }}
                  >
                    Create Posting
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
            <SummaryCard title="Active Interns" value={activeInterns} desc="Currently interning" icon={<Users size={28} color="#1746a2" />} />
            <SummaryCard title="Pending Applications" value={pendingApplications} desc="Awaiting review" icon={<FileText size={28} color="#1746a2" />} />
            <SummaryCard title="Completed Internships" value={completedInternships} desc="Successfully completed" icon={<Star size={28} color="#1746a2" />} />
          </div>

          {/* Recent Applications Table */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem', marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 22 }}>Recent Applications</div>
              <Link 
                to="/applicants"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#1746a2',
                  textDecoration: 'none',
                  fontSize: 16,
                  fontWeight: 500
                }}
              >
                View All
                <ArrowRight size={20} />
              </Link>
            </div>
            <div style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>Latest internship applications for your company</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>Student</th>
                  <th style={{ padding: '8px 12px' }}>Position</th>
                  <th style={{ padding: '8px 12px' }}>Date</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                  <th style={{ padding: '8px 12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px' }}>{app.student}</td>
                    <td style={{ padding: '8px 12px' }}>{app.position}</td>
                    <td style={{ padding: '8px 12px' }}>{app.date}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        background: getStatusStyles(app.status).bg,
                        color: getStatusStyles(app.status).color,
                        borderRadius: 8, 
                        padding: '2px 12px', 
                        fontWeight: 600, 
                        fontSize: 14
                      }}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleDownloadCV(app.student)}
                          style={{ 
                            background: '#f1f5f9', 
                            border: 'none', 
                            borderRadius: 6, 
                            padding: '6px 12px', 
                            fontWeight: 500, 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#1746a2'
                          }}
                        >
                          <FileText size={16} />
                          CV
                        </button>
                        <Link
                          to="/applicants"
                          style={{ 
                            background: '#f1f5f9', 
                            border: 'none', 
                            borderRadius: 6, 
                            padding: '6px 12px', 
                            fontWeight: 500, 
                            cursor: 'pointer',
                            textDecoration: 'none',
                            color: '#1746a2',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>Showing {applications.length} of {applications.length} applications</div>
          </div>

          {/* Manage Interns & Evaluations */}
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Manage Interns</div>
              <div style={{ color: '#64748b', fontSize: 15, marginBottom: 18 }}>View and manage your current interns</div>
              <Link 
                to="/company/interns"
                style={{ 
                  display: 'block',
                  width: '100%', 
                  background: '#f1f5f9', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '12px 0', 
                  fontWeight: 500, 
                  fontSize: 16, 
                  color: '#1746a2', 
                  cursor: 'pointer',
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                View Interns
              </Link>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Intern Evaluations</div>
              <div style={{ color: '#64748b', fontSize: 15, marginBottom: 18 }}>Submit and manage intern evaluations</div>
              <Link 
                to="/intern-evaluations"
                style={{ 
                  display: 'block',
                  width: '100%', 
                  background: '#f1f5f9', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '12px 0', 
                  fontWeight: 500, 
                  fontSize: 16, 
                  color: '#1746a2', 
                  cursor: 'pointer',
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                Manage Evaluations
              </Link>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Internship Postings</div>
              <div style={{ color: '#64748b', fontSize: 15, marginBottom: 18 }}>View and manage your internship postings</div>
              <Link 
                to="/internships"
                style={{ 
                  display: 'block',
                  width: '100%', 
                  background: '#f1f5f9', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '12px 0', 
                  fontWeight: 500, 
                  fontSize: 16, 
                  color: '#1746a2', 
                  cursor: 'pointer',
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                View Postings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, desc, icon }) => (
  <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem 2rem', flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>{title}</div>
      <div>{icon}</div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 600 }}>{value}</div>
    <div style={{ color: '#64748b', fontSize: 14 }}>{desc}</div>
  </div>
);

export default CompanyHome;