import React, { useState } from 'react';
import { mockUsers, mockInternships, mockApplications } from '../DummyData/mockUsers';
import { Plus, Filter, Eye, CheckCircle2, XCircle, Search } from 'lucide-react';
import NavBar from '../Components/NavBar';
import SideBar from '../Components/SideBar';

const STATUS_STYLES = {
  accepted: { background: '#e0e7ff', color: '#2563eb' },
  pending: { background: '#fef9c3', color: '#b45309' },
  finalized: { background: '#e0e7ff', color: '#2563eb' },
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

  const getDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    return months;
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: window.innerWidth < 1024 ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      marginBottom: 28,
      minHeight: 170,
      maxWidth: '95%',
      marginLeft: 'auto',
      marginRight: 'auto',
      overflow: 'hidden',
    }}>
      {/* Left: Main Info */}
      <div style={{
        flex: 1,
        padding: window.innerWidth < 768 ? '24px 20px' : '44px 64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: window.innerWidth < 480 ? 'column' : 'row', alignItems: window.innerWidth < 480 ? 'flex-start' : 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: window.innerWidth < 480 ? 18 : 22, fontWeight: 700, margin: 0, marginRight: 16 }}>{internship.title}</h3>
          <span style={{
            padding: '4px 16px',
            borderRadius: 16,
            fontSize: 14,
            fontWeight: 500,
            background: statusStyle.background,
            color: statusStyle.color,
            marginLeft: window.innerWidth < 480 ? 0 : 16,
            marginTop: window.innerWidth < 480 ? 8 : 2,
            minWidth: 0,
            textAlign: 'center',
            display: 'inline-block',
          }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
        <div style={{ color: '#2563eb', fontWeight: 500, fontSize: window.innerWidth < 480 ? 14 : 16, marginBottom: 2 }}>{internship.company.companyName}</div>
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
        borderLeft: window.innerWidth < 1024 ? 'none' : '1px solid #e5e7eb',
        borderTop: window.innerWidth < 1024 ? '1px solid #e5e7eb' : 'none',
        minWidth: window.innerWidth < 1024 ? 'auto' : 370,
        maxWidth: window.innerWidth < 1024 ? '100%' : 440,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: window.innerWidth < 768 ? '24px 20px' : '44px 48px',
      }}>
        <div style={{ color: '#334155', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Duration</div>
        <div style={{ color: '#334155', fontSize: 15, marginBottom: 18, textAlign: 'center' }}>
          {`${post.startDate instanceof Date ? post.startDate.toLocaleDateString() : new Date(post.startDate).toLocaleDateString()} - ${post.endDate instanceof Date ? post.endDate.toLocaleDateString() : new Date(post.endDate).toLocaleDateString()}`}
          <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            {getDuration(post.startDate, post.endDate)} months
          </div>
        </div>
        <button style={{
          background: '#1746a2',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '12px 0',
          width: '100%',
          fontWeight: 600,
          fontSize: 16,
          cursor: 'pointer',
          transition: 'background 0.2s',
          maxWidth: window.innerWidth < 1024 ? '300px' : '100%'
        }}
          onClick={onViewDetails}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

const ApplicationsPage = ({ currentUser }) => {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const isStudent = currentUser?.role === 'student';
  const isCompany = currentUser?.role === 'company';
  const isFaculty = currentUser?.role === 'faculty';
  const isSCAD = currentUser?.role === 'scad';

  // Get applications based on user role
  const getApplications = () => {
    if (!currentUser) return [];

    switch (currentUser.role.toLowerCase()) {
      case 'student':
        // Students see their own applications
        return currentUser.applications || [];

      case 'company':
        // Companies see applications for their internships
        return mockApplications.filter(app =>
          app.internship.company.id === currentUser.id
        );

      case 'faculty':
      case 'scad':
        // Faculty and SCAD see all applications
        return mockApplications;

      default:
        return [];
    }
  };

  // Get applications and apply filters
  let applications = getApplications();

  // Apply search filter
  if (search.trim()) {
    const searchLower = search.toLowerCase();
    applications = applications.filter(app =>
      app.internship.title.toLowerCase().includes(searchLower) ||
      app.internship.company.companyName.toLowerCase().includes(searchLower) ||
      (app.student && app.student.username.toLowerCase().includes(searchLower)) ||
      (app.internship.location && app.internship.location.toLowerCase().includes(searchLower)) ||
      (app.internship.description && app.internship.description.toLowerCase().includes(searchLower))
    );
  }

  // Apply status filter
  if (statusFilter && statusFilter !== 'all') {
    applications = applications.filter(app => app.status.toLowerCase() === statusFilter.toLowerCase());
  }

  // Sort applications by date (most recent first)
  applications.sort((a, b) => {
    const dateA = new Date(a.submissionDate);
    const dateB = new Date(b.submissionDate);
    return dateB - dateA;
  });

  const handleView = (application) => {
    setSelected(application);
    setShowModal(true);
  };

  const handleStatusChange = (application, newStatus) => {
    // Update application status
    application.status = newStatus;

    // Notify student
    application.student.addNotification(
      `Your application for "${application.internship.title}" has been ${newStatus}`
    );

    // Force re-render
    setSearch(prev => prev + '');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return { bg: '#dcfce7', color: '#16a34a' };
      case 'rejected':
        return { bg: '#fee2e2', color: '#991b1b' };
      case 'pending':
        return { bg: '#fef3c7', color: '#b45309' };
      default:
        return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  // Header styles
  const headerBox = {
    marginBottom: 32,
    maxWidth: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: window.innerWidth < 768 ? '0 20px' : '0'
  };
  const headerTitle = {
    fontWeight: 700,
    fontSize: window.innerWidth < 480 ? 24 : 28,
    color: '#334155',
    marginBottom: 2,
    marginTop: 0
  };
  const headerDesc = {
    color: '#64748b',
    fontSize: window.innerWidth < 480 ? 15 : 17,
    marginBottom: 0
  };
  const actionsRow = { display: 'flex', gap: 12 };
  const actionBtn = { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#1746a2', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s' };

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
      <div style={{
        maxWidth: '95%',
        margin: '0 auto',
        marginBottom: 24,
        display: 'flex',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
        gap: 16,
        padding: window.innerWidth < 768 ? '0 20px' : '0'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: window.innerWidth < 768 ? 16 : 0
        }}>
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
                transition: 'background 0.2s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', width: window.innerWidth < 768 ? '100%' : '260px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b'
            }}
          />
          <input
            type="text"
            placeholder="Search applications..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 40px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '15px',
              background: '#fff',
              outline: 'none',
              transition: 'all 0.2s',
              '&:focus': {
                borderColor: '#1746a2',
                boxShadow: '0 0 0 2px rgba(23, 70, 162, 0.1)'
              }
            }}
          />
        </div>
      </div>
      <div style={{ maxWidth: '95%', margin: '0 auto' }}>
        {applications.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: 16 }}>No applications found.</div>
        ) : (
          applications.map((app, idx) => (
            <ApplicationCard key={idx} application={app} showStudent={currentUser?.role !== 'student'} onViewDetails={() => handleView(app)} />
          ))
        )}
      </div>
      {/* Modal for application details */}
      {selected && (
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
          padding: window.innerWidth < 768 ? '20px' : '0'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: window.innerWidth < 768 ? '24px' : '36px',
            width: '100%',
            maxWidth: 540,
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#64748b', cursor: 'pointer' }}>×</button>
            <h3 style={{ fontSize: window.innerWidth < 480 ? 20 : 22, fontWeight: 700, marginBottom: 10 }}>{selected.internship.title}</h3>
            <div style={{ color: '#64748b', marginBottom: 8 }}><b>Company:</b> {selected.internship.company.companyName}</div>
            <div style={{ color: '#64748b', marginBottom: 8 }}><b>Status:</b> {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}</div>
            <div style={{ color: '#64748b', marginBottom: 8 }}><b>Applied on:</b> {selected.submissionDate instanceof Date ? selected.submissionDate.toLocaleDateString() : new Date(selected.submissionDate).toLocaleDateString()}</div>
            <div style={{ color: '#64748b', marginBottom: 8 }}><b>Description:</b> {selected.internship.description}</div>
            <div style={{ color: '#64748b', marginBottom: 8 }}><b>Skills:</b> {(mockInternships.find(i => i.id === selected.internship.id)?.skills || []).join(', ')}</div>
            {selected.internship.location && <div style={{ color: '#64748b', marginBottom: 8 }}><b>Location:</b> {selected.internship.location}</div>}
            <div style={{ color: '#64748b', marginBottom: 8 }}><b>Duration:</b> {`${selected.internship.startDate instanceof Date ? selected.internship.startDate.toLocaleDateString() : new Date(selected.internship.startDate).toLocaleDateString()} - ${selected.internship.endDate instanceof Date ? selected.internship.endDate.toLocaleDateString() : new Date(selected.internship.endDate).toLocaleDateString()}`}</div>
            {/* User-entered application info */}
            {selected.applicationData && Object.keys(selected.applicationData).length > 0 && (
              <div style={{ marginTop: 18, padding: '16px 0 0 0', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: 600, color: '#334155', marginBottom: 8 }}>Your Application Info:</div>
                {Object.entries(selected.applicationData).map(([key, value]) => (
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
      <SideBar userRole={currentUser?.role?.toLowerCase() || 'student'} currentUser={currentUser} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ flex: 1, padding: window.innerWidth < 768 ? '1.5rem 0 0 0' : '2.5rem 0 0 0', background: '#f8fafc' }}>{mainContent}</div>
      </div>
    </div>
  );
};

export default ApplicationsPage;
