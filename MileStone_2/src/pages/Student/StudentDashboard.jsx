import React from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { FileText, Clock, CheckCircle, FileCheck, Plus, Building2 } from 'lucide-react';

const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 4px #e2e8f0',
  padding: '1.5rem 2rem',
  flex: 1,
  minWidth: 180,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const quickCardStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 4px #e2e8f0',
  padding: '1.5rem',
  flex: 1,
  minWidth: 180,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 8,
};

const quickButtonStyle = {
  background: '#f1f5f9',
  border: 'none',
  borderRadius: 8,
  padding: '8px 18px',
  fontWeight: 500,
  cursor: 'pointer',
};

const StudentDashboard = ({ currentUser }) => {
  const navigate = useNavigate();

  // Calculate summary statistics
  const totalApplications = currentUser?.applications?.length || 0;
  const pendingApplications = currentUser?.applications?.filter(app => app.status === 'pending').length || 0;
  const activeInternships = currentUser?.currentInternship ? 1 : 0;
  const submittedReports = currentUser?.reports?.length || 0;

  // Get most recent application
  const recentApplication = currentUser?.applications?.sort((a, b) =>
    new Date(b.submissionDate) - new Date(a.submissionDate)
  )[0];

  const handleViewDetails = () => {
    if (recentApplication) {
      navigate(`/applications`);
    }
  };

  const handleNewApplication = () => {
    navigate('/student/internships');
  };

  const handleQuickAccess = (path) => {
    navigate(path);
  };

  const handleCreateReport = () => {
    navigate('/student/reports');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return { bg: '#dcfce7', text: '#166534' };
      case 'rejected':
        return { bg: '#fee2e2', text: '#991b1b' };
      case 'pending':
      default:
        return { bg: '#fef3c7', text: '#b45309' };
    }
  };

  return (
    <div className="dashboard-root" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <SideBar userRole="student" currentUser={currentUser} />
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Navbar */}
        <NavBar currentUser={currentUser} />
        {/* Dashboard Content */}
        <div className="dashboard-content" style={{ padding: '2rem', flex: 1 }}>
          {/* Welcome Message and Create Report Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontWeight: 700 }}>Welcome back, {currentUser?.username}!</h2>
              <p style={{ color: '#64748b' }}>Here's an overview of your internship activities.</p>
            </div>
            <button
              onClick={handleCreateReport}
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
                transition: 'background-color 0.2s',
                '&:hover': {
                  background: '#0b2e59'
                }
              }}
            >
              <Plus size={20} />
              Create Report
            </button>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
            <SummaryCard title="Applications" value={totalApplications} desc="Total internship applications" icon={<FileText size={24} color="#1746a2" />} />
            <SummaryCard title="Pending" value={pendingApplications} desc="Awaiting approval" icon={<Clock size={24} color="#1746a2" />} />
            <SummaryCard title="Active" value={activeInternships} desc="Currently active internships" icon={<CheckCircle size={24} color="#1746a2" />} />
            <SummaryCard title="Reports" value={submittedReports} desc="Submitted reports" icon={<FileCheck size={24} color="#1746a2" />} />
          </div>

          <div style={{ fontWeight: 600, fontSize: 22 }}>Recent Application</div>
          <div className="mb-4" style={{ color: '#64748b', fontSize: 14, marginBottom: 12 }}>Your most recent internship application</div>
          {/* Recent Application Section */}
          <div className='' style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem', marginBottom: '2rem' }}>
            {recentApplication ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    minWidth: '60px',
                    background: '#f1f5f9',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '8px'
                  }}>
                    {recentApplication.internship.company.logoUrl ? (
                      <img
                        src={recentApplication.internship.company.logoUrl}
                        alt={`${recentApplication.internship.company.companyName} logo`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <Building2 size={30} color="#94a3b8" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 18 }}>{recentApplication.internship.title}</div>
                    <div style={{ color: '#64748b', fontSize: 15 }}>{recentApplication.internship.company.companyName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 0 }}>
                      <span style={{ color: '#64748b', fontSize: 13 }}>
                        Applied on {new Date(recentApplication.submissionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                    <span style={{
                      background: getStatusColor(recentApplication.status).bg,
                      color: getStatusColor(recentApplication.status).text,
                      borderRadius: 8,
                      padding: '2px 10px',
                      fontSize: 13
                    }}>
                      {recentApplication.status.charAt(0).toUpperCase() + recentApplication.status.slice(1)}
                    </span>
                    <button
                      onClick={handleViewDetails}
                      style={{
                        padding: '6px 18px',
                        borderRadius: 8,
                        background: '#f1f5f9',
                        border: 'none',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          background: '#e2e8f0'
                        }
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: '#64748b', fontSize: 15, marginTop: 8 }}>No applications yet</div>
            )}
          </div>

          {/* Quick Access Cards */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <QuickCard
              title="Applications"
              desc="View and manage your internship applications"
              btn="View Applications"
              onClick={() => handleQuickAccess('/applications')}
            />
            <QuickCard
              title="Reports"
              desc="Submit and view your internship reports"
              btn="Manage Reports"
              onClick={() => handleQuickAccess('/student/reports')}
            />
            <QuickCard
              title="Evaluation"
              desc="View your performance evaluations"
              btn="View Evaluations"
              onClick={() => handleQuickAccess('/student/evaluation')}
            />
          </div>

          {/* Pro Student Features */}
          {currentUser?.isProStudent && (
            <>
              <div style={{ fontWeight: 600, fontSize: 22, marginTop: '2rem', marginBottom: '1rem' }}>Pro Features</div>
              
              {/* Profile Views Section */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: '0.5rem' }}>Companies That Viewed Your Profile</div>
                <div style={{ color: '#64748b', fontSize: 14, marginBottom: '1rem' }}>Companies that have shown interest in your profile</div>
                <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem' }}>
                  {currentUser?.profileViews?.length > 0 ? (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {currentUser.profileViews.map((view, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1rem',
                          padding: '1rem',
                          background: '#f8fafc',
                          borderRadius: 8
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            minWidth: '40px',
                            background: '#f1f5f9',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            padding: '4px'
                          }}>
                            {view.company.logoUrl ? (
                              <img
                                src={view.company.logoUrl}
                                alt={`${view.company.companyName} logo`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain'
                                }}
                              />
                            ) : (
                              <Building2 size={20} color="#94a3b8" />
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{view.company.companyName}</div>
                            <div style={{ color: '#64748b', fontSize: 13 }}>
                              Viewed on {new Date(view.viewedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#64748b', fontSize: 15, textAlign: 'center', padding: '2rem' }}>
                      No companies have viewed your profile yet
                    </div>
                  )}
                </div>
              </div>

              {/* Workshop Certificates Section */}
              <div>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: '0.5rem' }}>Workshop Certificates</div>
                <div style={{ color: '#64748b', fontSize: 14, marginBottom: '1rem' }}>Your completed workshop certificates</div>
                <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem' }}>
                  {currentUser?.workshopCertificates?.length > 0 ? (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {currentUser.workshopCertificates.map((certificate, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1rem',
                          padding: '1rem',
                          background: '#f8fafc',
                          borderRadius: 8
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            minWidth: '40px',
                            background: '#f1f5f9',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <FileCheck size={20} color="#1746a2" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{certificate.workshopName}</div>
                            <div style={{ color: '#64748b', fontSize: 13 }}>
                              Completed on {new Date(certificate.completedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            onClick={() => window.open(certificate.certificateUrl, '_blank')}
                            style={{
                              padding: '6px 18px',
                              borderRadius: 8,
                              background: '#f1f5f9',
                              border: 'none',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                background: '#e2e8f0'
                              }
                            }}
                          >
                            View Certificate
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#64748b', fontSize: 15, textAlign: 'center', padding: '2rem' }}>
                      No workshop certificates yet
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        {/* New Application Button */}
        <button
          onClick={handleNewApplication}
          style={{
            position: 'absolute',
            top: 32,
            right: 48,
            background: '#1746a2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': {
              background: '#0b2e59'
            }
          }}
        >
          New Application
        </button>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, desc, icon }) => (
  <div style={cardStyle}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>{title}</div>
      {icon}
    </div>
    <div style={{ fontSize: 28, fontWeight: 600 }}>{value}</div>
    <div style={{ color: '#64748b', fontSize: 14 }}>{desc}</div>
  </div>
);

const QuickCard = ({ title, desc, btn, onClick }) => (
  <div style={quickCardStyle}>
    <div style={{ fontWeight: 600 }}>{title}</div>
    <div style={{ color: '#64748b', fontSize: 14, marginBottom: 12 }}>{desc}</div>
    <button
      onClick={onClick}
      style={{
        ...quickButtonStyle,
        transition: 'background-color 0.2s',
        '&:hover': {
          background: '#e2e8f0'
        }
      }}
    >
      {btn}
    </button>
  </div>
);

export default StudentDashboard;
