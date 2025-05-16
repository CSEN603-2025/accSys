import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { ArrowLeft, Search, ChevronUp, ChevronDown, X, FileText, Calendar, Clock } from 'lucide-react';
import { mockUsers } from '../../DummyData/mockUsers';

const CompanyInterns = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Get current and past interns
  const getCurrentInterns = () => {
    return mockUsers
      .filter(user =>
        user.role === 'student' &&
        user.currentInternship?.company.id === currentUser.id &&
        user.currentInternship.status !== 'completed'
      )
      .map(student => ({
        ...student,
        internshipDetails: student.currentInternship
      }));
  };
  const getCompletedInterns = () => {
    return mockUsers
      .filter(user =>
        user.role === 'student' &&
        user.pastInternships?.some(internship =>
          internship.company.id === currentUser.id &&
          internship.status === 'completed'
        )
      )
      .map(student => ({
        ...student,
        internshipDetails: student.pastInternships.find(i =>
          i.company.id === currentUser.id &&
          i.status === 'completed'
        )
      }));
  };

  const currentInterns = getCurrentInterns();
  const completedInterns = getCompletedInterns();

  // Filter interns based on search
  const filteredCurrentInterns = currentInterns.filter(intern =>
    intern.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.internshipDetails.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompletedInterns = completedInterns.filter(intern =>
    intern.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.internshipDetails.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate remaining duration for current interns
  const getRemainingDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (now > end) {
      // When an internship is completed, update the student's pro status
      return 'Completed';
    }

    const remainingDays = Math.ceil((end - Math.max(start, now)) / (1000 * 60 * 60 * 24));
    return `${remainingDays} days remaining`;
  };

  // Add a function to mark an internship as completed
  const markInternshipAsCompleted = (intern) => {
    // Update the internship status to completed
    if (intern.internshipDetails) {
      intern.internshipDetails.status = 'completed';

      // Move from current internship to past internships if it's a current internship
      if (intern.currentInternship && intern.currentInternship.id === intern.internshipDetails.id) {
        intern.pastInternships = intern.pastInternships || [];
        intern.pastInternships.push(intern.currentInternship);
        intern.currentInternship = null;
      }

      // Update the pro student status
      if (intern.updateProStatus) {
        intern.updateProStatus();
      }

      // Update UI to reflect changes
      setShowDetailsModal(false);
      setSelectedIntern(null);

      // Show notification
      alert(`${intern.username}'s internship has been marked as completed. Their Pro Student status has been updated.`);
    }
  };

  // Intern Details Modal
  const InternDetailsModal = ({ intern, onClose }) => {
    if (!intern) return null;

    const isInternshipCompleted = intern.internshipDetails.status === 'completed';

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
        zIndex: 1000
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
            Intern Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Personal Information */}
            <section>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1rem', color: '#1746a2' }}>
                Personal Information
              </h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Name</label>
                  <div style={{ color: '#374151' }}>{intern.username}</div>
                </div>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Email</label>
                  <div style={{ color: '#374151' }}>{intern.email}</div>
                </div>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Major</label>
                  <div style={{ color: '#374151' }}>{intern.major}</div>
                </div>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>GPA</label>
                  <div style={{ color: '#374151' }}>{intern.gpa}</div>
                </div>
              </div>
            </section>

            {/* Internship Information */}
            <section>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1rem', color: '#1746a2' }}>
                Internship Details
              </h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Position</label>
                  <div style={{ color: '#374151' }}>{intern.internshipDetails.title}</div>
                </div>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Duration</label>
                  <div style={{ color: '#374151' }}>
                    {new Date(intern.internshipDetails.startDate).toLocaleDateString()} - {new Date(intern.internshipDetails.endDate).toLocaleDateString()}
                  </div>
                </div>
                {intern.currentInternship && (
                  <div>
                    <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Status</label>
                    <div style={{ color: '#166534', background: '#dcfce7', display: 'inline-block', padding: '4px 12px', borderRadius: '8px' }}>
                      {getRemainingDuration(intern.internshipDetails.startDate, intern.internshipDetails.endDate)}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Download CV Button */}
            <button
              onClick={() => {
                // Implement CV download logic
                const dummyCV = new Blob([`Dummy CV for ${intern.username}\nMajor: ${intern.major}\nGPA: ${intern.gpa}`],
                  { type: 'text/plain' });
                const url = window.URL.createObjectURL(dummyCV);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${intern.username}_CV.txt`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                color: '#1746a2',
                fontWeight: '500',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              <FileText size={20} />
              Download CV
            </button>

            {/* Action Buttons */}
            {!isInternshipCompleted && intern.currentInternship && (
              <button
                onClick={() => markInternshipAsCompleted(intern)}
                style={{
                  background: '#dcfce7',
                  color: '#166534',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}
              >
                Mark Internship as Completed
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const InternsList = ({ interns, title, isPast = false }) => (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1rem' }}>{title}</h2>
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 20px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px 20px', textAlign: 'left' }}>Position</th>
              <th style={{ padding: '12px 20px', textAlign: 'left' }}>Duration</th>
              {!isPast && <th style={{ padding: '12px 20px', textAlign: 'left' }}>Status</th>}
              <th style={{ padding: '12px 20px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interns.length === 0 ? (
              <tr>
                <td colSpan={isPast ? 4 : 5} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  No interns found
                </td>
              </tr>
            ) : (
              interns.map(intern => (
                <tr key={intern.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 500 }}>{intern.username}</div>
                    <div style={{ color: '#64748b', fontSize: 14 }}>{intern.email}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>{intern.internshipDetails.title}</td>
                  <td style={{ padding: '16px 20px' }}>
                    {new Date(intern.internshipDetails.startDate).toLocaleDateString()} - {new Date(intern.internshipDetails.endDate).toLocaleDateString()}
                  </td>
                  {!isPast && (
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        background: '#dcfce7',
                        color: '#166534',
                        borderRadius: 8,
                        padding: '4px 12px',
                        fontSize: 14,
                        fontWeight: 500
                      }}>
                        {getRemainingDuration(intern.internshipDetails.startDate, intern.internshipDetails.endDate)}
                      </span>
                    </td>
                  )}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setSelectedIntern(intern);
                          setShowDetailsModal(true);
                        }}
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

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
              <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Interns Management</h1>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', width: 300 }}>
              <Search size={20} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search interns..."
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

          {/* Current Interns Section */}
          <InternsList
            interns={filteredCurrentInterns}
            title="Current Interns"
          />

          {/* Completed Internships Section */}
          <InternsList
            interns={filteredCompletedInterns}
            title="Completed Internships"
            isPast={true}
          />
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <InternDetailsModal
          intern={selectedIntern}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedIntern(null);
          }}
        />
      )}
    </div>
  );
};

export default CompanyInterns;