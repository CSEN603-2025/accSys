import React, { useState } from 'react';
import SideBar from '../Components/SideBar';
import NavBar from '../Components/NavBar';
import { mockUsers } from '../DummyData/mockUsers';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScadStudentList = ({ currentUser }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Get all students
  const students = mockUsers.filter(user => user.role === 'student');

  // Filter students based on search query and status
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.major?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && student.currentInternship) ||
      (statusFilter === 'completed' && student.pastInternships?.length > 0) ||
      (statusFilter === 'no_internship' && !student.currentInternship && !student.pastInternships?.length);

    return matchesSearch && matchesStatus;
  });

  const handleViewProfile = (studentId) => {
    const student = students.find(student => student.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setShowProfileModal(true);
    }
  };

  const getStatusColor = (student) => {
    if (student.currentInternship) return { bg: '#dcfce7', text: '#166534' };
    if (student.pastInternships?.length > 0) return { bg: '#e0e7ef', text: '#2563eb' };
    return { bg: '#f1f5f9', text: '#64748b' };
  };

  const getStatusText = (student) => {
    if (student.currentInternship) return 'Active Internship';
    if (student.pastInternships?.length > 0) return 'Completed Internship';
    return 'No Internship';
  };

  // Profile Modal Component
  const ProfileModal = ({ student, onClose }) => {
    if (!student) return null;

    // Calculate number of submitted reports
    const submittedReports = student.reports?.length || 0;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          width: '90%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <X size={24} color="#64748b" />
          </button>

          {/* Profile Header */}
          <div style={{ 
            marginBottom: '32px', 
            textAlign: 'center',
            paddingBottom: '24px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: '#1746a2',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '48px',
              fontWeight: '700',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              {student.username.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>{student.username}</h2>
            <p style={{ color: '#64748b', fontSize: '16px' }}>{student.email}</p>
          </div>

          {/* Main Content Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '32px',
            marginBottom: '32px'
          }}>
            {/* Personal Information */}
            <div style={{
              background: '#f8fafc',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '20px',
                color: '#1746a2',
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: '12px'
              }}>Personal Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontWeight: '500', color: '#4b5563', marginBottom: '4px' }}>Phone</div>
                  <div style={{ color: '#1e293b' }}>{student.phone || 'Not specified'}</div>
                </div>
                <div>
                  <div style={{ fontWeight: '500', color: '#4b5563', marginBottom: '4px' }}>Major</div>
                  <div style={{ color: '#1e293b' }}>{student.major || 'Not specified'}</div>
                </div>
                <div>
                  <div style={{ fontWeight: '500', color: '#4b5563', marginBottom: '4px' }}>Graduation Year</div>
                  <div style={{ color: '#1e293b' }}>{student.graduationYear || 'Not specified'}</div>
                </div>
                <div>
                  <div style={{ fontWeight: '500', color: '#4b5563', marginBottom: '4px' }}>GPA</div>
                  <div style={{ color: '#1e293b' }}>{student.gpa || 'Not specified'}</div>
                </div>
                <div>
                  <div style={{ fontWeight: '500', color: '#4b5563', marginBottom: '4px' }}>Semester</div>
                  <div style={{ color: '#1e293b' }}>{student.semesterNumber || 'Not specified'}</div>
                </div>
              </div>
            </div>

            {/* Status & Reports */}
            <div style={{
              background: '#f8fafc',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '20px',
                color: '#1746a2',
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: '12px'
              }}>Status & Reports</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <div style={{ fontWeight: '500', color: '#4b5563', marginBottom: '12px' }}>Internship Status</div>
                  <div style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    display: 'inline-block',
                    ...getStatusColor(student),
                    fontSize: '15px',
                    fontWeight: '500'
                  }}>
                    {getStatusText(student)}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: '500', color: '#4b5563', marginBottom: '12px' }}>Submitted Reports</div>
                  <div style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    background: '#f1f5f9',
                    display: 'inline-block',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#1746a2'
                  }}>
                    {submittedReports} {submittedReports === 1 ? 'Report' : 'Reports'}
                  </div>
                </div>
              </div>
            </div>

            {/* Interests */}
            <div style={{
              background: '#f8fafc',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '20px',
                color: '#1746a2',
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: '12px'
              }}>Interests</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {student.interests?.length > 0 ? (
                  student.interests.map((interest, idx) => (
                    <span key={idx} style={{
                      background: '#e0e7ff',
                      color: '#1746a2',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {interest}
                    </span>
                  ))
                ) : (
                  <div style={{ color: '#64748b', fontStyle: 'italic' }}>No interests specified</div>
                )}
              </div>
            </div>
          </div>

          {/* Internships Section */}
          {student.internships?.length > 0 && (
            <div style={{ 
              marginBottom: '32px',
              background: '#f8fafc',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '20px',
                color: '#1746a2',
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: '12px'
              }}>Previous Internships</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {student.internships.map((intern, idx) => (
                  <div key={idx} style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}>
                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px', color: '#1746a2' }}>{intern.company}</div>
                    <div style={{ color: '#64748b', marginBottom: '8px' }}>{intern.role}</div>
                    <div style={{ color: '#64748b', marginBottom: '12px', fontSize: '14px' }}>{intern.duration}</div>
                    <div style={{ fontSize: '14px', color: '#475569' }}>{intern.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities Section */}
          {student.activities?.length > 0 && (
            <div style={{ 
              background: '#f8fafc',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '20px',
                color: '#1746a2',
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: '12px'
              }}>College Activities</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {student.activities.map((activity, idx) => (
                  <div key={idx} style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}>
                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px', color: '#1746a2' }}>{activity.name}</div>
                    <div style={{ color: '#64748b', marginBottom: '12px' }}>{activity.role}</div>
                    <div style={{ fontSize: '14px', color: '#475569' }}>{activity.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <SideBar userRole="scad" />
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Navbar */}
        <NavBar currentUser={currentUser} />
        {/* Dashboard Content */}
        <div style={{ padding: '2rem', flex: 1 }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Student Management</h1>
          <p style={{ color: '#4B5563', marginBottom: '1.5rem' }}>View and manage all students in the system.</p>

          {/* Search and Filter Bar */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            alignItems: 'center'
          }}>
            <div style={{
              position: 'relative',
              flex: 1
            }}>
              <Search style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6B7280'
              }} />
              <input
                type="text"
                placeholder="Search students by name, email, or major..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Internship Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.375rem'
                  }}
                >
                  <option value="all">All Students</option>
                  <option value="active">Active Internships</option>
                  <option value="completed">Completed Internships</option>
                  <option value="no_internship">No Internships</option>
                </select>
              </div>
            </div>
          )}

          {/* Students List */}
          <div style={{
            background: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
              padding: '1rem',
              borderBottom: '1px solid #E5E7EB',
              fontWeight: 600,
              color: '#374151'
            }}>
              <div>Name</div>
              <div>Email</div>
              <div>Major</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                  padding: '1rem',
                  borderBottom: '1px solid #E5E7EB',
                  alignItems: 'center'
                }}
              >
                <div style={{ fontWeight: 500 }}>{student.username}</div>
                <div style={{ color: '#6B7280' }}>{student.email}</div>
                <div>{student.major || 'Not specified'}</div>
                <div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    ...getStatusColor(student)
                  }}>
                    {getStatusText(student)}
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => handleViewProfile(student.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: 'rgb(23, 70, 162)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
            {filteredStudents.length === 0 && (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#6B7280'
              }}>
                No students found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          student={selectedStudent}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
};

export default ScadStudentList; 