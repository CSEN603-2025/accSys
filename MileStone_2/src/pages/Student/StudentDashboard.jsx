import React from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { FileText, Clock, CheckCircle, FileCheck, Plus } from 'lucide-react';

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
  const activeInternships = currentUser?.applications?.filter(app => app.status === 'approved').length || 0;
  const submittedReports = currentUser?.reports?.length || 0;

  // Get most recent application
  const recentApplication = currentUser?.applications?.sort((a, b) => 
    new Date(b.submissionDate) - new Date(a.submissionDate)
  )[0];

  const handleViewDetails = () => {
    if (recentApplication) {
      navigate(`/student/applications/${recentApplication.id}`);
    }
  };

  const handleNewApplication = () => {
    navigate('/student/internships');
  };

  const handleQuickAccess = (path) => {
    navigate(path);
  };

  const handleCreateReport = () => {
    navigate('/student/reports/new');
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
      <SideBar userRole="student" />
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

          {/* Recent Application Section */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ fontWeight: 600, fontSize: 22 }}>Recent Application</div>
            <div style={{ color: '#64748b', fontSize: 14, marginBottom: 12 }}>Your most recent internship application</div>
            {recentApplication ? (
              <>
                <div style={{ fontWeight: 500, fontSize: 18 }}>{recentApplication.internship.title}</div>
                <div style={{ color: '#64748b', fontSize: 15 }}>{recentApplication.internship.company.companyName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <span style={{ 
                    background: getStatusColor(recentApplication.status).bg,
                    color: getStatusColor(recentApplication.status).text,
                    borderRadius: 8, 
                    padding: '2px 10px', 
                    fontSize: 13 
                  }}>
                    {recentApplication.status.charAt(0).toUpperCase() + recentApplication.status.slice(1)}
                  </span>
                  <span style={{ color: '#64748b', fontSize: 13 }}>
                    Applied on {new Date(recentApplication.submissionDate).toLocaleDateString()}
                  </span>
                </div>
                <button 
                  onClick={handleViewDetails}
                  style={{ 
                    marginTop: 16, 
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
              onClick={() => handleQuickAccess('/student/applications')}
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
