import React, { useState } from 'react';
import { mockUsers } from '../DummyData/mockUsers';
import { mockInternships } from '../DummyData/mockInternships';
import { Plus, Filter } from 'lucide-react';
import NavBar from '../Components/NavBar';
import SideBar from '../Components/SideBar';

const STATUS_STYLES = {
  completed: { background: '#e0e7ff', color: '#2563eb' },
  pending: { background: '#fef9c3', color: '#b45309' },
  approved: { background: '#e0e7ff', color: '#2563eb' },
  rejected: { background: '#fee2e2', color: '#b91c1c' },
};

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
];

// Card component for displaying an application
const ApplicationCard = ({ application, showStudent, onViewDetails }) => {
  const { internship, status, submissionDate, student } = application;
  const statusKey = status.toLowerCase();
  const statusStyle = STATUS_STYLES[statusKey] || { background: '#f1f5f9', color: '#334155' };
  // Always get skills from the internship post in mockInternships
  const post = mockInternships.find(i => i.id === internship.id);
  const skills = post?.skills || internship.skills || [];

  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      marginBottom: 28,
      minHeight: 170,
      maxWidth: 1300,
      marginLeft: 'auto',
      marginRight: 'auto',
      overflow: 'hidden',
    }}>
      {/* Left: Main Info */}
      <div style={{ flex: 1, padding: '44px 64px 44px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, marginRight: 16 }}>{internship.title}</h3>
          <span style={{
            padding: '4px 16px',
            borderRadius: 16,
            fontSize: 14,
            fontWeight: 500,
            background: statusStyle.background,
            color: statusStyle.color,
            marginLeft: 0,
            minWidth: 0,
            textAlign: 'center',
            display: 'inline-block',
            marginTop: 2,
          }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
        <div style={{ color: '#2563eb', fontWeight: 500, fontSize: 16, marginBottom: 2 }}>{internship.company.companyName}</div>
        {showStudent && (
          <div style={{ color: '#64748b', fontSize: 14, marginBottom: 2 }}>Student: <span style={{ fontWeight: 500 }}>{student.username}</span></div>
        )}
        <div style={{ color: '#64748b', fontSize: 14, marginBottom: 10 }}>Applied on {submissionDate instanceof Date ? submissionDate.toLocaleDateString() : new Date(submissionDate).toLocaleDateString()}</div>
        <div style={{ color: '#64748b', fontSize: 15, marginBottom: 10 }}>{internship.description}</div>
        <div style={{ color: '#334155', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Skills</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {skills.map((skill, idx) => (
            <span key={idx} style={{ padding: '4px 14px', background: '#eff6ff', color: '#2563eb', borderRadius: 16, fontSize: 14, fontWeight: 500 }}>{skill}</span>
          ))}
        </div>
      </div>
      {/* Right: Duration & Button */}
      <div style={{
        background: '#f1f5f9',
        borderLeft: '1px solid #e5e7eb',
        minWidth: 370,
        maxWidth: 440,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '44px 48px',
      }}>
        <div style={{ color: '#334155', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Duration</div>
        <div style={{ color: '#334155', fontSize: 15, marginBottom: 18 }}>
          {`${internship.startDate instanceof Date ? internship.startDate.toLocaleDateString() : new Date(internship.startDate).toLocaleDateString()} - ${internship.endDate instanceof Date ? internship.endDate.toLocaleDateString() : new Date(internship.endDate).toLocaleDateString()}`}
        </div>
        <button style={{ background: '#1746a2', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', width: '100%', fontWeight: 600, fontSize: 16, cursor: 'pointer', transition: 'background 0.2s' }}
          onClick={onViewDetails}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

const ApplicationsPage = ({ currentUser, setCurrentUser }) => {
  // Header styles
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const headerBox = { marginBottom: 32, maxWidth: 1300, marginLeft: 'auto', marginRight: 'auto' };
  const headerTitle = { fontWeight: 700, fontSize: 28, color: '#334155', marginBottom: 2, marginTop: 0 };
  const headerDesc = { color: '#64748b', fontSize: 17, marginBottom: 0 };
  const actionsRow = { display: 'flex', gap: 12 };
  const actionBtn = { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#1746a2', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s' };

  // Get applications based on user role
  const getApplications = () => {
    let applications = [];
    if (currentUser?.role === 'student') {
      applications = currentUser.applications || [];
    } else if (currentUser?.role === 'scad' || currentUser?.role === 'faculty') {
      applications = mockUsers
        .filter(u => u.role === 'student')
        .flatMap(student => student.applications.map(app => ({ ...app, student })));
    }
    
    // Sort applications by submission date (most recent first)
    return applications.sort((a, b) => {
      const dateA = new Date(a.submissionDate);
      const dateB = new Date(b.submissionDate);
      return dateB - dateA;
    });
  };

  // Filter applications
  let filteredApps = getApplications();
  
  // Filter by status
  if (statusFilter !== 'all') {
    filteredApps = filteredApps.filter(app => app.status.toLowerCase() === statusFilter);
  }
  
  // Filter by search term
  if (searchTerm.trim()) {
    filteredApps = filteredApps.filter(app =>
      app.internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.internship.company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Main content
  const mainContent = (
    <>
      <div style={{ ...headerBox, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={headerTitle}>{currentUser?.role === 'student' ? 'Internship Applications' : 'All Internship Applications'}</h1>
          <p style={headerDesc}>{currentUser?.role === 'student' ? 'View and manage your internship applications' : 'View and manage all internship applications submitted by students'}</p>
        </div>
      </div>
      {/* Status filter and search */}
      <div style={{ maxWidth: 1300, margin: '0 auto', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontWeight: 500, color: '#334155', fontSize: 15 }}>Status:</span>
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            style={{
              background: statusFilter === opt.value ? '#1746a2' : '#f1f5f9',
              color: statusFilter === opt.value ? '#fff' : '#334155',
              border: 'none',
              borderRadius: 8,
              padding: '7px 18px',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              marginRight: 4,
              transition: 'background 0.2s',
            }}
          >
            {opt.label}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search company or internship..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            marginLeft: 24,
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 15,
            width: 260,
            background: '#f8fafc',
            outline: 'none',
          }}
        />
      </div>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        {filteredApps.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: 16 }}>No applications found.</div>
        ) : (
          filteredApps.map((app, idx) => (
            <ApplicationCard key={idx} application={app} showStudent={currentUser?.role !== 'student'} onViewDetails={() => setSelectedApp(app)} />
          ))
        )}
      </div>
      {/* Modal for application details */}
      {selectedApp && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 36, minWidth: 400, maxWidth: 540, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', position: 'relative' }}>
            <button onClick={() => setSelectedApp(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#64748b', cursor: 'pointer' }}>×</button>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{selectedApp.internship.title}</h3>
            <div style={{ color: '#64748b', marginBottom: 8 }}><b>Company:</b> {selectedApp.internship.company.companyName}</div>
            <div style={{ color: '#64748b', marginBottom: 8 }}><b>Status:</b> {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}</div>
            <div style={{ color: '#64748b', marginBottom: 8 }}><b>Applied on:</b> {selectedApp.submissionDate instanceof Date ? selectedApp.submissionDate.toLocaleDateString() : new Date(selectedApp.submissionDate).toLocaleDateString()}</div>
            <div style={{ color: '#64748b', marginBottom: 8 }}><b>Description:</b> {selectedApp.internship.description}</div>
            <div style={{ color: '#64748b', marginBottom: 8 }}><b>Skills:</b> {(mockInternships.find(i => i.id === selectedApp.internship.id)?.skills || []).join(', ')}</div>
            {selectedApp.internship.location && <div style={{ color: '#64748b', marginBottom: 8 }}><b>Location:</b> {selectedApp.internship.location}</div>}
            <div style={{ color: '#64748b', marginBottom: 8 }}><b>Duration:</b> {`${selectedApp.internship.startDate instanceof Date ? selectedApp.internship.startDate.toLocaleDateString() : new Date(selectedApp.internship.startDate).toLocaleDateString()} - ${selectedApp.internship.endDate instanceof Date ? selectedApp.internship.endDate.toLocaleDateString() : new Date(selectedApp.internship.endDate).toLocaleDateString()}`}</div>
            {/* User-entered application info */}
            {selectedApp.applicationData && Object.keys(selectedApp.applicationData).length > 0 && (
              <div style={{ marginTop: 18, padding: '16px 0 0 0', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: 600, color: '#334155', marginBottom: 8 }}>Your Application Info:</div>
                {Object.entries(selectedApp.applicationData).map(([key, value]) => (
                  <div key={key} style={{ color: '#64748b', marginBottom: 6 }}>
                    <b>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</b> {String(value)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole={currentUser?.role?.toLowerCase() || 'student'} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ flex: 1, padding: '2.5rem 0 0 0', background: '#f8fafc' }}>{mainContent}</div>
      </div>
    </div>
  );
};

export default ApplicationsPage;
