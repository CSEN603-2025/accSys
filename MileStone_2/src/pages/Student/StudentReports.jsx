import React, { useState, useRef, useEffect } from 'react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { mockInternships, mockReports } from '../../DummyData/mockUsers';
import jsPDF from 'jspdf';

// Example: courses per major (expand as needed)
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

const StudentReports = ({ currentUser }) => {
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [form, setForm] = useState({
    title: '',
    introduction: '',
    body: '',
    courses: [],
  });
  const [reports, setReports] = useState(currentUser?.reports?.map(report => ({
    ...report,
    courses: report.courses || []
  })) || []);
  const [uploading, setUploading] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [notifiedInternships, setNotifiedInternships] = useState([]);

  // Use mockInternships if user has no internships
  const internships = [
    ...(currentUser?.currentInternship ? [currentUser.currentInternship] : []),
    ...(currentUser?.pastInternships || [])
  ];
  const major = currentUser?.major || 'CS';
  const availableCourses = COURSES_BY_MAJOR[major] || [];

  // Filter reports for a specific internship
  const getReportsForInternship = (internshipId) =>
    reports.filter((r) => r.internship?.id === internshipId);

  const handleSelectInternship = (internship) => {
    setSelectedInternship(internship);
    setForm({ title: '', introduction: '', body: '', courses: [] });
    setEditingReportId(null);
    // Notify if flagged or rejected
    const status = getStatus(internship);
    if ((status === 'flagged' || status === 'rejected') && !notifiedInternships.includes(internship.id)) {
      currentUser?.addNotification(`Your internship '${internship.title}' was ${status}.`);
      setNotifiedInternships(prev => [...prev, internship.id]);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'courses') {
      const options = Array.from(e.target.selectedOptions, (o) => o.value);
      setForm((f) => ({ ...f, courses: options }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Format date helper function
  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return new Date(date).toLocaleDateString();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedInternship) return;
    setUploading(true);
    setTimeout(() => {
      if (editingReportId) {
        // Edit existing report
        setReports((prev) => prev.map((r) =>
          r.id === editingReportId
            ? {
                ...r,
                title: form.title,
                introduction: form.introduction,
                body: form.body,
                courses: form.courses || [],
              }
            : r
        ));
      } else {
        // Add new report
        const newReport = {
          id: Date.now(),
          internship: selectedInternship,
          title: form.title,
          introduction: form.introduction,
          body: form.body,
          courses: form.courses || [],
          submissionDate: new Date(),
          status: 'Submitted',
        };
        setReports((prev) => [...prev, newReport]);
        currentUser?.submitReport(newReport);
      }
      setForm({ title: '', introduction: '', body: '', courses: [] });
      setUploading(false);
      setEditingReportId(null);
      setSelectedInternship(null);
    }, 1000);
  };

  const handleDelete = (reportId) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    if (editingReportId === reportId) {
      setEditingReportId(null);
      setForm({ title: '', introduction: '', body: '', courses: [] });
    }
  };

  const handleDownload = (report) => {
    // Generate PDF using jsPDF
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(report.title, 10, 20);
    doc.setFontSize(12);
    doc.text('Content:', 10, 35);
    doc.text(report.body, 10, 45, { maxWidth: 180 });
    doc.text('Courses Used: ' + report.courses.join(', '), 10, 85);
    doc.save(`${report.title.replace(/\s+/g, '_')}_report.pdf`);
  };

  const handleEdit = (report) => {
    setSelectedInternship(report.internship);
    setForm({
      title: report.title,
      introduction: report.introduction,
      body: report.body,
      courses: report.courses,
    });
    setEditingReportId(report.id);
  };

  // Add status for demo (in real app, this would come from backend)
  const getStatus = (internship) => {
    if (internship.status) return internship.status;
    return 'pending';
  };

  // Appeal state per report
  const [appealState, setAppealState] = useState({}); // { [reportId]: { comment: '', submitted: false } }
  const appealRefs = useRef({});
  const [scrollToAppealId, setScrollToAppealId] = useState(null);

  // Scroll to appeal form if notification is clicked
  useEffect(() => {
    if (scrollToAppealId && appealRefs.current[scrollToAppealId]) {
      appealRefs.current[scrollToAppealId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      setScrollToAppealId(null);
    }
  }, [scrollToAppealId]);

  // Pass this to NavBar to handle notification click
  const handleNotificationClick = (notif) => {
    if (notif.type === 'flagged' || notif.type === 'rejected') {
      setScrollToAppealId(notif.reportId);
    }
  };

  // Appeal submit per report
  const handleAppealChange = (reportId, value) => {
    setAppealState((prev) => ({
      ...prev,
      [reportId]: { ...prev[reportId], comment: value }
    }));
  };

  const handleAppealSubmit = (e, reportId) => {
    e.preventDefault();
    setAppealState((prev) => ({
      ...prev,
      [reportId]: { ...prev[reportId], submitted: true }
    }));
    currentUser?.addNotification(`Appeal submitted for report ${reportId}`);
  };

  // Filter reports by status
  const getReportsByStatus = (status) => {
    return reports.filter(report => report.status === status);
  };

  // Only show content if user is logged in
  if (!currentUser) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#b91c1c', fontWeight: 600 }}>Please log in to view your reports and internships.</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole="student" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ maxWidth: 1100, margin: '2rem auto', padding: 0 }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Internship Reports</h2>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '2rem', marginBottom: 32 }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* LEFT: Form */}
              <div style={{ minWidth: 260, flex: 1 }}>
                <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>{editingReportId ? 'Edit Report' : 'Submit Report'}</h3>
                <label style={{ fontWeight: 500 }}>Select Internship</label>
                <select
                  value={selectedInternship?.id || ''}
                  onChange={(e) => {
                    const internship = internships.find((i) => i.id === Number(e.target.value));
                    handleSelectInternship(internship);
                  }}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}
                  disabled={!!editingReportId}
                >
                  <option value="">Choose internship...</option>
                  {internships.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.title} @ {i.company?.companyName || i.company?.username || 'Company'}
                    </option>
                  ))}
                </select>
                {selectedInternship && (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      placeholder="Report Title"
                      style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                      required
                    />
                    <textarea
                      name="introduction"
                      value={form.introduction || ''}
                      onChange={handleFormChange}
                      placeholder="Introduction"
                      rows={3}
                      style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                      required
                    />
                    <textarea
                      name="body"
                      value={form.body || ''}
                      onChange={handleFormChange}
                      placeholder="Body"
                      rows={5}
                      style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                      required
                    />
                    <label style={{ fontWeight: 500 }}>Courses Used</label>
                    <select
                      name="courses"
                      multiple
                      value={form.courses}
                      onChange={handleFormChange}
                      style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', minHeight: 80 }}
                    >
                      {availableCourses.map((course) => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={uploading}
                      style={{ background: '#1746a2', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', borderRadius: 8, padding: '10px 24px', cursor: uploading ? 'not-allowed' : 'pointer', marginTop: 8 }}
                    >
                      {uploading ? (editingReportId ? 'Saving...' : 'Uploading...') : (editingReportId ? 'Save Changes' : 'Submit Report')}
                    </button>
                    {editingReportId && (
                      <button
                        type="button"
                        onClick={() => { setEditingReportId(null); setForm({ title: '', introduction: '', body: '', courses: [] }); setSelectedInternship(null); }}
                        style={{ background: '#e2e8f0', color: '#1746a2', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 8, padding: '8px 18px', marginTop: 4, cursor: 'pointer' }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </form>
                )}
              </div>
              {/* RIGHT: Reports */}
              {selectedInternship && (
                <div style={{ flex: 1, minWidth: 320 }}>
                  {/* Submitted Reports Section */}
                  <h4 style={{ fontWeight: 600, fontSize: 17, marginBottom: 10 }}>Submitted Reports</h4>
                  {getReportsForInternship(selectedInternship.id).length === 0 ? (
                    <div style={{ color: '#64748b', fontStyle: 'italic', marginBottom: 12 }}>
                      No reports submitted yet.
                    </div>
                  ) : (
                    getReportsForInternship(selectedInternship.id).map((report) => (
                      <div key={report.id} style={{ background: '#f1f5f9', borderRadius: 8, padding: '1rem', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>{report.title}</div>
                        <div style={{ color: '#64748b', fontSize: 14 }}>{formatDate(report.submissionDate)}</div>
                        <div style={{ fontSize: 15, marginTop: 8 }}><b>Introduction:</b> {report.introduction}</div>
                        <div style={{ fontSize: 15, marginTop: 8 }}><b>Body:</b> {report.body}</div>
                        <div style={{ color: '#1746a2', fontSize: 15 }}>Courses: {(report.courses || []).join(', ')}</div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                          <button onClick={() => handleDownload(report)} style={{ background: '#e0e7ef', color: '#1746a2', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}>Download</button>
                          <button onClick={() => handleEdit(report)} style={{ background: '#e0f2fe', color: '#1746a2', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDelete(report.id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}>Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                  {/* Flagged Reports Section */}
                  <h4 style={{ fontWeight: 600, fontSize: 17, margin: '24px 0 10px 0', color: '#b91c1c' }}>Flagged Reports</h4>
                  {getReportsByStatus('flagged').length === 0 ? (
                    <div style={{ color: '#64748b' }}>No flagged reports.</div>
                  ) : (
                    getReportsByStatus('flagged').map((report) => (
                      <div key={report.id} ref={el => appealRefs.current[report.id] = el} style={{ background: appealState[report.id]?.submitted ? '#e0fce7' : '#fff7ed', border: '1px solid #fca5a5', borderRadius: 8, padding: '1rem', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ fontWeight: 600 }}>{report.title}</div>
                        <div style={{ color: '#64748b', fontSize: 14 }}>{formatDate(report.submissionDate)}</div>
                        <div style={{ fontSize: 15 }}><b>Content:</b> {report.body}</div>
                        <div style={{ color: '#1746a2', fontSize: 15 }}>Courses: {(report.courses || []).join(', ')}</div>
                        {/* Appeal form for flagged */}
                        {!appealState[report.id]?.submitted ? (
                          <form onSubmit={e => handleAppealSubmit(e, report.id)} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                            <textarea
                              value={appealState[report.id]?.comment || ''}
                              onChange={e => handleAppealChange(report.id, e.target.value)}
                              placeholder="Enter your appeal comment..."
                              rows={2}
                              style={{ padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}
                              required
                            />
                            <button
                              type="submit"
                              style={{ background: '#b91c1c', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 8, padding: '6px 16px', cursor: 'pointer', alignSelf: 'flex-start' }}
                            >
                              Appeal
                            </button>
                          </form>
                        ) : (
                          <div style={{ color: '#16a34a', fontWeight: 600, background: '#e0fce7', borderRadius: 6, padding: '8px 12px', marginTop: 8 }}>Appeal submitted!</div>
                        )}
                      </div>
                    ))
                  )}
                  {/* Rejected Reports Section */}
                  <h4 style={{ fontWeight: 600, fontSize: 17, margin: '24px 0 10px 0', color: '#991b1b' }}>Rejected Reports</h4>
                  {getReportsByStatus('rejected').length === 0 ? (
                    <div style={{ color: '#64748b' }}>No rejected reports.</div>
                  ) : (
                    getReportsByStatus('rejected').map((report) => (
                      <div key={report.id} ref={el => appealRefs.current[report.id] = el} style={{ background: appealState[report.id]?.submitted ? '#e0fce7' : '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '1rem', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ fontWeight: 600 }}>{report.title}</div>
                        <div style={{ color: '#64748b', fontSize: 14 }}>{formatDate(report.submissionDate)}</div>
                        <div style={{ fontSize: 15 }}><b>Content:</b> {report.body}</div>
                        <div style={{ color: '#1746a2', fontSize: 15 }}>Courses: {(report.courses || []).join(', ')}</div>
                        {/* Appeal form for rejected */}
                        {!appealState[report.id]?.submitted ? (
                          <form onSubmit={e => handleAppealSubmit(e, report.id)} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                            <textarea
                              value={appealState[report.id]?.comment || ''}
                              onChange={e => handleAppealChange(report.id, e.target.value)}
                              placeholder="Enter your appeal comment..."
                              rows={2}
                              style={{ padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}
                              required
                            />
                            <button
                              type="submit"
                              style={{ background: '#991b1b', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 8, padding: '6px 16px', cursor: 'pointer', alignSelf: 'flex-start' }}
                            >
                              Appeal
                            </button>
                          </form>
                        ) : (
                          <div style={{ color: '#16a34a', fontWeight: 600, background: '#e0fce7', borderRadius: 6, padding: '8px 12px', marginTop: 8 }}>Appeal submitted!</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReports;
