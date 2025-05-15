import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { ArrowLeft, Search, ChevronUp, ChevronDown, X, FileText, Filter } from 'lucide-react';
import { mockUsers, mockInternships } from '../../DummyData/mockUsers';

const Applicants = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Get company's internships
  const companyInternships = mockInternships.filter(
    internship => internship.company.id === currentUser.id
  );

  // Get all students and their applications
  const students = mockUsers.filter(u => u.role === 'student');
  let applications = [];

  students.forEach(student => {
    (student.applications || []).forEach(app => {
      if (app.internship.company.id === currentUser.id) {
        applications.push({
          student: student.username,
          position: app.internship.title,
          date: app.submissionDate ? new Date(app.submissionDate).toLocaleDateString() : '',
          status: app.status,
          id: app.id,
          email: student.email,
          major: student.major,
          gpa: student.gpa,
          studentDetails: student,
          internshipId: app.internship.id
        });
      }
    });
  });

  // Filter applications based on search term and selected internship
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInternship = selectedInternship === 'all' || app.internshipId.toString() === selectedInternship;
    
    return matchesSearch && matchesInternship;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let compareA = a[sortField];
    let compareB = b[sortField];

    if (sortField === 'date') {
      compareA = new Date(a.date);
      compareB = new Date(b.date);
    }

    if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp style={{ opacity: 0.3 }} size={16} />;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const getStatusStyles = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#b45309' },
      accepted: { bg: '#e0e7ff', color: '#1746a2' },
      rejected: { bg: '#fee2e2', color: '#b91c1c' },
      finalized: { bg: '#dcfce7', color: '#166534' }
    };
    return styles[status] || styles.pending;
  };

  // Application Details Modal
  const ApplicationDetailsModal = ({ application, onClose }) => {
    if (!application) return null;

    const handleStatusChange = (newStatus) => {
      // Get the student and internship
      const student = mockUsers.find(u => u.username === application.student);
      const internship = mockInternships.find(i => i.id === application.internshipId);

      if (!student || !internship) return;

      if (newStatus === 'finalized') {
        // Create a new StudentInternship instance
        const newInternship = {
          id: Date.now(),
          company: currentUser,
          title: internship.title,
          description: internship.description,
          location: internship.location,
          startDate: internship.startDate,
          endDate: internship.endDate,
          status: 'active'
        };

        // Move student to current interns
        student.currentInternship = newInternship;
        currentUser.currentInterns = currentUser.currentInterns || [];
        currentUser.currentInterns.push(student);

        // Set up automatic transition to past interns
        const endDate = new Date(internship.endDate);
        const now = new Date();
        const timeUntilEnd = endDate.getTime() - now.getTime();
        
        if (timeUntilEnd > 0) {
          setTimeout(() => {
            // Move from current to past interns
            student.pastInternships = student.pastInternships || [];
            student.pastInternships.push(student.currentInternship);
            student.currentInternship = null;
            
            currentUser.pastInterns = currentUser.pastInterns || [];
            currentUser.pastInterns.push(student);
            currentUser.currentInterns = currentUser.currentInterns.filter(i => i.id !== student.id);
          }, timeUntilEnd);
        }
      }

      // Update the application status
      applications = applications.map(app => 
        app.id === application.id ? { ...app, status: newStatus } : app
      );
      
      // Update the student's application status
      if (student) {
        student.applications = student.applications.map(app =>
          app.id === application.id ? { ...app, status: newStatus } : app
        );
      }
      
      onClose();
    };

    const handleDownloadCV = () => {
      // Simulating CV download - in real app, this would fetch and download actual file
      const dummyCV = new Blob([`Dummy CV for ${application.student}\nMajor: ${application.major}\nGPA: ${application.gpa}`], 
        { type: 'text/plain' });
      const url = window.URL.createObjectURL(dummyCV);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${application.student}_CV.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    };

    return (
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
            onClick={onClose}
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

          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '1.5rem' }}>
            Application Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Student Information */}
            <section>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1rem', color: '#1746a2' }}>
                Student Information
              </h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Name</label>
                  <div style={{ color: '#374151' }}>{application.student}</div>
                </div>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Email</label>
                  <div style={{ color: '#374151' }}>{application.email}</div>
                </div>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Major</label>
                  <div style={{ color: '#374151' }}>{application.major}</div>
                </div>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>GPA</label>
                  <div style={{ color: '#374151' }}>{application.gpa}</div>
                </div>
                <div>
                  <button
                    onClick={handleDownloadCV}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: '#1746a2',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FileText size={20} />
                    Download CV
                  </button>
                </div>
              </div>
            </section>

            {/* Application Information */}
            <section>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1rem', color: '#1746a2' }}>
                Application Information
              </h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Position</label>
                  <div style={{ color: '#374151' }}>{application.position}</div>
                </div>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Application Date</label>
                  <div style={{ color: '#374151' }}>{application.date}</div>
                </div>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Current Status</label>
                  <div>
                    <span style={{
                      background: getStatusStyles(application.status).bg,
                      color: getStatusStyles(application.status).color,
                      borderRadius: 8,
                      padding: '4px 12px',
                      fontSize: 14,
                      fontWeight: 500
                    }}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {application.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusChange('accepted')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#e0e7ff',
                      color: '#1746a2',
                      border: 'none',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusChange('rejected')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#fee2e2',
                      color: '#b91c1c',
                      border: 'none',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Reject
                  </button>
                </>
              )}
              {application.status === 'accepted' && (
                <button
                  onClick={() => handleStatusChange('finalized')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Finalize
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole={currentUser?.role?.toLowerCase() || 'company'} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <NavBar currentUser={currentUser} />
        
        <div style={{ padding: '2rem' }}>
          {/* Page Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link 
                to="/company" 
                style={{ 
                  marginRight: '1rem', 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: '#1746a2'
                }}
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 style={{ fontSize: '24px', fontWeight: '600' }}>All Applications</h1>
            </div>

            {/* Search and Filter Section */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {/* Filter Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '8px 16px',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#1e293b',
                    fontSize: '15px'
                  }}
                >
                  <Filter size={18} />
                  {selectedInternship === 'all' 
                    ? 'All Positions' 
                    : companyInternships.find(i => i.id.toString() === selectedInternship)?.title || 'All Positions'}
                  <ChevronDown size={18} />
                </button>

                {showFilterDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 50,
                    minWidth: '200px'
                  }}>
                    <div style={{
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      <button
                        onClick={() => {
                          setSelectedInternship('all');
                          setShowFilterDropdown(false);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '8px 16px',
                          textAlign: 'left',
                          background: selectedInternship === 'all' ? '#f1f5f9' : '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#1e293b',
                          borderBottom: '1px solid #e2e8f0'
                        }}
                      >
                        All Positions
                      </button>
                      {companyInternships.map(internship => (
                        <button
                          key={internship.id}
                          onClick={() => {
                            setSelectedInternship(internship.id.toString());
                            setShowFilterDropdown(false);
                          }}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '8px 16px',
                            textAlign: 'left',
                            background: selectedInternship === internship.id.toString() ? '#f1f5f9' : '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#1e293b',
                            borderBottom: '1px solid #e2e8f0'
                          }}
                        >
                          {internship.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', width: 300 }}>
                <Search size={20} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 40px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 15
                  }}
                />
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left' }}>
                    <button
                      onClick={() => handleSort('student')}
                      style={{ 
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        font: 'inherit',
                        fontWeight: 600,
                        color: '#1e293b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Student <SortIcon field="student" />
                    </button>
                  </th>
                  <th style={{ padding: '12px 20px', textAlign: 'left' }}>
                    <button
                      onClick={() => handleSort('position')}
                      style={{ 
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        font: 'inherit',
                        fontWeight: 600,
                        color: '#1e293b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Position <SortIcon field="position" />
                    </button>
                  </th>
                  <th style={{ padding: '12px 20px', textAlign: 'left' }}>
                    <button
                      onClick={() => handleSort('date')}
                      style={{ 
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        font: 'inherit',
                        fontWeight: 600,
                        color: '#1e293b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Date <SortIcon field="date" />
                    </button>
                  </th>
                  <th style={{ padding: '12px 20px', textAlign: 'left' }}>
                    <button
                      onClick={() => handleSort('status')}
                      style={{ 
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        font: 'inherit',
                        fontWeight: 600,
                        color: '#1e293b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Status <SortIcon field="status" />
                    </button>
                  </th>
                  <th style={{ padding: '12px 20px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedApplications.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                      No applications found
                    </td>
                  </tr>
                ) : (
                  sortedApplications.map(app => (
                    <tr key={app.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 500 }}>{app.student}</div>
                        <div style={{ color: '#64748b', fontSize: 14 }}>{app.email}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>{app.position}</td>
                      <td style={{ padding: '16px 20px' }}>{app.date}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          background: getStatusStyles(app.status).bg,
                          color: getStatusStyles(app.status).color,
                          borderRadius: 8,
                          padding: '4px 12px',
                          fontSize: 14,
                          fontWeight: 500
                        }}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <button
                          onClick={() => handleViewDetails(app)}
                          style={{
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 16px',
                            color: '#1746a2',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div style={{ padding: '16px 20px', color: '#64748b', fontSize: 14, borderTop: '1px solid #e2e8f0' }}>
              Showing {sortedApplications.length} of {applications.length} applications
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedApplication(null);
          }}
        />
      )}

      {/* Add click handler to close dropdown when clicking outside */}
      <div 
        onClick={() => showFilterDropdown && setShowFilterDropdown(false)} 
        style={{ 
          display: showFilterDropdown ? 'block' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40
        }} 
      />
    </div>
  );
};

export default Applicants;