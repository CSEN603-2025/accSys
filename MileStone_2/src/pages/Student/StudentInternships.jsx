import React, { useState, useRef, useEffect } from 'react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { mockInternships, mockReports } from '../../DummyData/mockUsers';
import { Eye, Edit2, Trash2, Upload, Calendar, Search } from 'lucide-react';

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', color: '#b45309' },
  accepted: { bg: '#dcfce7', color: '#166534' },
  rejected: { bg: '#fee2e2', color: '#991b1b' },
  completed: { bg: '#e0e7ef', color: '#2563eb' },
};

const COURSES_BY_MAJOR = {
  'CS': [
    'Data Structures',
    'Algorithms',
    'Operating Systems',
    'Database Systems',
    'Software Engineering',
    'Computer Networks',
    'Web Development',
    'Machine Learning',
    'Artificial Intelligence',
  ],
  'IS': [
    'Signals and Systems',
    'Digital Logic',
    'Database Systems',
    'Software Engineering',
    'Embedded Systems',
    'Computer Networks',
  ],
  'Robotics': [
    'Robotics Fundamentals',
    'AI & Machine Learning',
    'Control Systems',
    'Computer Vision',
    'Embedded Systems',
    'Programming for Robotics',
  ]
};

const StudentInternships = ({ currentUser }) => {
  // Get all internships (current and past)
  const allInternships = [
    ...(currentUser?.currentInternship ? [currentUser.currentInternship] : []),
    ...(currentUser?.pastInternships || [])
  ];
  const internships = allInternships.length > 0 ? allInternships : mockInternships;
  const major = currentUser?.major || 'CS';
  const availableCourses = COURSES_BY_MAJOR[major] || [];

  const [showModal, setShowModal] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [reportForm, setReportForm] = useState({ title: '', content: '', courses: [] });
  const [evaluationForm, setEvaluationForm] = useState({ rating: 5, feedback: '' });
  const [reports, setReports] = useState(currentUser?.reports || []);
  const [editingReportId, setEditingReportId] = useState(null);
  const [notifiedInternships, setNotifiedInternships] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Format date helper function
  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return new Date(date).toLocaleDateString();
  };

  // Get status for internship
  const getStatus = (internship) => {
    if (internship.status) return internship.status;
    return 'pending';
  };

  // Filter reports for a specific internship
  const getReportsForInternship = (internshipId) =>
    reports.filter((r) => r.internship?.id === internshipId);

  // Filter reports by status
  const getReportsByStatus = (status) => {
    return reports.filter(report => report.status === status);
  };

  const handleViewDetails = (internship) => {
    setSelectedInternship(internship);
    setShowModal(true);
    setShowReportForm(false);
    setShowEvaluationForm(false);
  };

  const handleOpenReportForm = () => {
    setShowReportForm(true);
    setShowEvaluationForm(false);
    setReportForm({ title: '', content: '', courses: [] });
    setEditingReportId(null);
  };

  const handleOpenEvaluationForm = () => {
    setShowEvaluationForm(true);
    setShowReportForm(false);
    setEvaluationForm({ rating: 5, feedback: '' });
  };

  const handleReportFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'courses') {
      const options = Array.from(e.target.selectedOptions, (o) => o.value);
      setReportForm((f) => ({ ...f, courses: options }));
    } else {
      setReportForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleEvaluationFormChange = (e) => {
    const { name, value } = e.target;
    setEvaluationForm((f) => ({ ...f, [name]: value }));
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (editingReportId) {
      // Edit existing report
      setReports((prev) => prev.map((r) =>
        r.id === editingReportId
          ? {
            ...r,
            title: reportForm.title,
            content: reportForm.content,
            courses: reportForm.courses || [],
          }
          : r
      ));
    } else {
      // Add new report
      const newReport = {
        id: Date.now(),
        internship: selectedInternship,
        title: reportForm.title,
        content: reportForm.content,
        courses: reportForm.courses || [],
        submissionDate: new Date(),
        status: 'Submitted',
      };
      setReports((prev) => [...prev, newReport]);
      currentUser?.submitReport(newReport);
    }
    setReportForm({ title: '', content: '', courses: [] });
    setEditingReportId(null);
    setShowReportForm(false);
    setShowModal(false);
    setSelectedInternship(null);
  };

  const handleEvaluationSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the evaluation to your backend
    console.log('Evaluation submitted:', {
      internship: selectedInternship,
      ...evaluationForm
    });
    setEvaluationForm({ rating: 5, feedback: '' });
    setShowEvaluationForm(false);
    setShowModal(false);
    setSelectedInternship(null);
  };

  const handleEditReport = (report) => {
    setSelectedInternship(report.internship);
    setReportForm({
      title: report.title,
      content: report.content,
      courses: report.courses || [],
    });
    setEditingReportId(report.id);
    setShowReportForm(true);
    setShowModal(true);
  };

  const handleDeleteReport = (reportId) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    if (editingReportId === reportId) {
      setEditingReportId(null);
      setReportForm({ title: '', content: '', courses: [] });
    }
  };

  // Only show content if user is logged in
  if (!currentUser) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#b91c1c', fontWeight: 600 }}>Please log in to view your reports and internships.</div>;
  }

  // Filter internships based on status and search
  const filteredInternships = internships.filter(internship => {
    const now = new Date();
    const startDate = new Date(internship.startDate);
    const endDate = new Date(internship.endDate);
    const isAccepted = internship.status === 'accepted';
    const isPast = endDate < now && !isAccepted;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      (internship.title?.toLowerCase().includes(searchLower) || 
       internship.company?.companyName?.toLowerCase().includes(searchLower));

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'current' && !isAccepted) return false;
      if (statusFilter === 'completed' && !isPast) return false;
    }

    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole="student" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ maxWidth: 1100, margin: '2rem auto', padding: 0 }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>My Internships</h2>

          {/* Search and Filter Bar */}
          <div style={{ 
            display: 'flex', 
            gap: 16, 
            marginBottom: 24,
            position: 'sticky',
            top: 0,
            background: '#f8fafc',
            padding: '16px 0',
            zIndex: 10,
            width: '100%',
            maxWidth: 1100
          }}>
            <div style={{ 
              position: 'relative', 
              width: 300,
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search size={18} style={{ 
                position: 'absolute', 
                left: 12, 
                color: '#64748b',
                pointerEvents: 'none'
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company name or job title..."
                style={{
                  width: '100%',
                  padding: '8px 14px 8px 40px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  fontSize: 15,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  height: 40
                }}
              />
            </div>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#fff',
                fontSize: 15,
                width: 160,
                height: 40
              }}
            >
              <option value="all">All Status</option>
              <option value="current">Current</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Internships List */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            {filteredInternships.map(internship => {
              const status = getStatus(internship);
              const statusColor = STATUS_COLORS[status] || {};
              const now = new Date();
              const startDate = new Date(internship.startDate);
              const endDate = new Date(internship.endDate);
              const isAccepted = internship.status === 'accepted';
              const isPast = endDate < now && !isAccepted;

              let statusText = isAccepted ? 'Current' : 'Completed';

              return (
                <div key={internship.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem', minWidth: 320, flex: 1, maxWidth: 370, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>{internship.title}</div>
                  <div style={{ color: '#64748b', fontSize: 15 }}>{internship.company?.companyName || 'Company'}</div>
                  <div style={{ fontSize: 14, background: statusColor.bg, color: statusColor.color, borderRadius: 6, padding: '2px 12px', display: 'inline-block', fontWeight: 600 }}>{statusText}</div>
                  <div style={{ color: '#64748b', fontSize: 14 }}>{internship.location}</div>
                  <div style={{ color: '#64748b', fontSize: 14 }}>
                    {formatDate(internship.startDate)} - {formatDate(internship.endDate)}
                  </div>
                  <button
                    onClick={() => handleViewDetails(internship)}
                    style={{ background: '#1746a2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, marginTop: 8, cursor: 'pointer' }}
                  >
                    View Details
                  </button>
                  {!isAccepted && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' }}>
                      <button
                        onClick={() => { handleViewDetails(internship); handleOpenReportForm(); }}
                        style={{ background: '#1746a2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', flex: 1 }}
                      >
                        Add Report
                      </button>
                      <button
                        onClick={() => { handleViewDetails(internship); handleOpenEvaluationForm(); }}
                        style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', flex: 1 }}
                      >
                        Evaluate
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Show message if no internships */}
          {filteredInternships.length === 0 && (
            <div style={{ color: '#64748b', padding: '1rem 0' }}>
              {searchQuery ? 'No internships found matching your search.' : 'No internships found. Start by applying to available opportunities!'}
            </div>
          )}

          {/* Modal for internship details and forms */}
          {showModal && selectedInternship && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: '1.2rem',
                minWidth: 750,
                maxWidth: 950,
                minHeight: 520,
                maxHeight: '85vh',
                position: 'relative',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                overflow: 'auto',
              }}>
                <button onClick={() => { setShowModal(false); setShowReportForm(false); setShowEvaluationForm(false); }} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#64748b', cursor: 'pointer' }}>×</button>
                <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>{selectedInternship.title}</h3>
                <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}>{selectedInternship.company?.companyName || 'Company'}</div>
                <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}>{selectedInternship.location}</div>
                <div style={{ fontSize: 15, marginBottom: 16 }}>{selectedInternship.description}</div>

                {/* Show evaluation form */}
                {showEvaluationForm && (
                  <div style={{
                    display: 'flex',
                    gap: 24,
                    alignItems: 'flex-start',
                    flex: 1,
                    minHeight: 0,
                    marginTop: 18,
                  }}>
                    <div style={{ minWidth: 260, flex: 1, minHeight: 0 }}>
                      <form onSubmit={handleEvaluationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <label style={{ fontWeight: 500 }}>Rating (1-5)</label>
                        <input
                          type="number"
                          name="rating"
                          value={evaluationForm.rating}
                          onChange={handleEvaluationFormChange}
                          min="1"
                          max="5"
                          style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                          required
                        />
                        <label style={{ fontWeight: 500 }}>Feedback</label>
                        <textarea
                          name="feedback"
                          value={evaluationForm.feedback}
                          onChange={handleEvaluationFormChange}
                          placeholder="Share your experience and feedback..."
                          rows={5}
                          style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                          required
                        />
                        <button
                          type="submit"
                          style={{ background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', marginTop: 8 }}
                        >
                          Submit Evaluation
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Show report form for completed internships */}
                {showReportForm && (
                  <div style={{
                    display: 'flex',
                    gap: 24,
                    alignItems: 'flex-start',
                    flex: 1,
                    minHeight: 0,
                    marginTop: 18,
                  }}>
                    <div style={{ minWidth: 260, flex: 1, minHeight: 0 }}>
                      <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <input
                          name="title"
                          value={reportForm.title}
                          onChange={handleReportFormChange}
                          placeholder="Report Title"
                          style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                          required
                        />
                        <textarea
                          name="content"
                          value={reportForm.content}
                          onChange={handleReportFormChange}
                          placeholder="Content"
                          rows={5}
                          style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                          required
                        />
                        <label style={{ fontWeight: 500 }}>Courses Used</label>
                        <select
                          name="courses"
                          multiple
                          value={reportForm.courses}
                          onChange={handleReportFormChange}
                          style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', minHeight: 80 }}
                        >
                          {availableCourses.map((course) => (
                            <option key={course} value={course}>{course}</option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          style={{ background: '#1746a2', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', marginTop: 8 }}
                        >
                          {editingReportId ? 'Save Changes' : 'Submit Report'}
                        </button>
                        {editingReportId && (
                          <button
                            type="button"
                            onClick={() => { setEditingReportId(null); setReportForm({ title: '', content: '', courses: [] }); }}
                            style={{ background: '#e2e8f0', color: '#1746a2', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 8, padding: '8px 18px', marginTop: 4, cursor: 'pointer' }}
                          >
                            Cancel Edit
                          </button>
                        )}
                      </form>
                    </div>
                    {/* Reports for selected internship */}
                    <div style={{ flex: 1, minWidth: 320 }}>
                      <h4 style={{ fontWeight: 600, fontSize: 17, marginBottom: 10 }}>Submitted Reports</h4>
                      {getReportsForInternship(selectedInternship.id).length === 0 ? (
                        <div style={{ color: '#64748b' }}>No reports submitted yet.</div>
                      ) : (
                        getReportsForInternship(selectedInternship.id).map((report) => (
                          <div key={report.id} style={{ background: '#f1f5f9', borderRadius: 8, padding: '1rem', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ fontWeight: 600 }}>{report.title}</div>
                            <div style={{ color: '#64748b', fontSize: 14 }}>{formatDate(report.submissionDate)}</div>
                            <div style={{ fontSize: 15 }}><b>Content:</b> {report.content}</div>
                            <div style={{ color: '#1746a2', fontSize: 15 }}>Courses: {(report.courses || []).join(', ')}</div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                              <button onClick={() => handleEditReport(report)} style={{ background: '#e0f2fe', color: '#1746a2', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}>Edit</button>
                              <button onClick={() => handleDeleteReport(report.id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}>Delete</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentInternships;
