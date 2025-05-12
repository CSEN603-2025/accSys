import React, { useState, useRef, useEffect } from 'react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { mockInternships } from '../../DummyData/mockInternships';
import jsPDF from 'jspdf';

// Example: courses per major (expand as needed)
const COURSES_BY_MAJOR = {
  'Computer Science': [
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
  'Information Engineering': [
    'Signals and Systems',
    'Digital Logic',
    'Database Systems',
    'Software Engineering',
    'Embedded Systems',
    'Computer Networks',
  ],
  // Add more majors as needed
};

const StudentReports = ({ currentUser }) => {
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [form, setForm] = useState({
    title: '',
    introduction: '',
    body: '',
    courses: [],
  });
  const [reports, setReports] = useState(currentUser?.reports || []);
  const [uploading, setUploading] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [notifiedInternships, setNotifiedInternships] = useState([]);

  // Use mockInternships if user has no internships
  const internships = (currentUser?.internships && currentUser.internships.length > 0)
    ? currentUser.internships
    : mockInternships;
  const major = currentUser?.major || 'Computer Science';
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
    if ((status === 'flagged' || status === 'rejected') && currentUser?.notifications && !notifiedInternships.includes(internship.id)) {
      currentUser.notifications.push({
        message: `Your internship '${internship.title}' was ${status}.`,
        date: new Date().toISOString(),
        read: false
      });
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
                courses: form.courses,
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
          courses: form.courses,
          submissionDate: new Date().toLocaleDateString(),
          status: 'Submitted',
        };
        setReports((prev) => [...prev, newReport]);
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
    doc.text('Introduction:', 10, 35);
    doc.text(report.introduction, 10, 45, { maxWidth: 180 });
    doc.text('Body:', 10, 60);
    doc.text(report.body, 10, 70, { maxWidth: 180 });
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
    if (internship.title.toLowerCase().includes('flagged')) return 'flagged';
    if (internship.title.toLowerCase().includes('rejected')) return 'rejected';
    if (internship.title.toLowerCase().includes('completed')) return 'completed';
    if (internship.title.toLowerCase().includes('pending')) return 'pending';
    if (internship.title.toLowerCase().includes('accepted')) return 'accepted';
    if (internship.id % 5 === 0) return 'flagged';
    if (internship.id % 3 === 0) return 'rejected';
    if (internship.id % 2 === 0) return 'accepted';
    return 'pending';
  };

  // Appeal state per report
  const [appealState, setAppealState] = useState({}); // { [reportId]: { comment: '', submitted: false } }
  const appealRefs = useRef({});
  const [scrollToAppealId, setScrollToAppealId] = useState(null);

  // Dummy flagged and rejected reports for demo (only one per internship)
  const dummyFlaggedReports = [
    {
      id: 101,
      title: 'Backend API Report',
      introduction: 'API flagged for review.',
      body: 'Details about the backend API internship flagged.',
      courses: ['Database Systems', 'Software Engineering'],
      submissionDate: '2025-07-10',
      status: 'flagged',
      internship: { id: 11, title: 'Backend Developer Intern (Flagged)' }
    }
  ];
  const dummyRejectedReports = [
    {
      id: 102,
      title: 'QA Testing Report',
      introduction: 'QA internship was rejected.',
      body: 'Details about the QA internship rejection.',
      courses: ['Operating Systems'],
      submissionDate: '2025-07-12',
      status: 'rejected',
      internship: { id: 12, title: 'QA Tester Intern (Rejected)' }
    }
  ];

  // Add a dummy notification for demo
  useEffect(() => {
    if (currentUser && currentUser.notifications && !currentUser.notifications.some(n => n.message.includes('flagged'))) {
      currentUser.notifications.unshift({
        message: "Your internship 'Backend Developer Intern (Flagged)' was flagged.",
        date: new Date().toISOString(),
        read: false,
        type: 'flagged',
        internshipId: 11,
        reportId: 101
      });
    }
  }, [currentUser]);

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
    // Optionally, move to "Appealed Reports" section or show under submitted
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
            <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>{editingReportId ? 'Edit Report' : 'Submit/Update a Report'}</h3>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Appeal section for flagged/rejected internships */}
              {selectedInternship && ['flagged', 'rejected'].includes(getStatus(selectedInternship)) && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '1rem 1.2rem', marginBottom: 18, width: '100%' }}>
                  <div style={{ fontWeight: 600, color: '#b91c1c', marginBottom: 6 }}>
                    This internship is {getStatus(selectedInternship)}.
                  </div>
                  <div style={{ color: '#b91c1c', fontSize: 15, marginBottom: 8 }}>
                    If you believe this is a mistake, you can appeal by submitting a comment below:
                  </div>
                  <form onSubmit={handleAppealSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <textarea
                      value={appealState[selectedInternship.id]?.comment || ''}
                      onChange={e => handleAppealChange(selectedInternship.id, e.target.value)}
                      placeholder="Enter your appeal comment..."
                      rows={3}
                      style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                      required
                    />
                    <button
                      type="submit"
                      style={{ background: '#1746a2', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', alignSelf: 'flex-start' }}
                    >
                      Submit Appeal
                    </button>
                    {appealState[selectedInternship.id]?.submitted && <div style={{ color: '#16a34a', fontWeight: 500 }}>Appeal submitted!</div>}
                  </form>
                </div>
              )}
              <div style={{ minWidth: 260, flex: 1 }}>
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
                      value={form.introduction}
                      onChange={handleFormChange}
                      placeholder="Introduction"
                      rows={2}
                      style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                      required
                    />
                    <textarea
                      name="body"
                      value={form.body}
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
              {/* Reports for selected internship */}
              {selectedInternship && (
                <div style={{ flex: 1, minWidth: 320 }}>
                  <h4 style={{ fontWeight: 600, fontSize: 17, marginBottom: 10 }}>Submitted Reports</h4>
                  {getReportsForInternship(selectedInternship.id).length === 0 ? (
                    <div style={{ color: '#64748b' }}>No reports submitted yet.</div>
                  ) : (
                    getReportsForInternship(selectedInternship.id).map((report) => (
                      <div key={report.id} style={{ background: '#f1f5f9', borderRadius: 8, padding: '1rem', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ fontWeight: 600 }}>{report.title}</div>
                        <div style={{ color: '#64748b', fontSize: 14 }}>{report.submissionDate}</div>
                        <div style={{ fontSize: 15 }}><b>Introduction:</b> {report.introduction}</div>
                        <div style={{ fontSize: 15 }}><b>Body:</b> {report.body}</div>
                        <div style={{ color: '#1746a2', fontSize: 15 }}>Courses: {report.courses.join(', ')}</div>
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
                  {dummyFlaggedReports.length === 0 ? (
                    <div style={{ color: '#64748b' }}>No flagged reports.</div>
                  ) : (
                    dummyFlaggedReports.map((report) => (
                      <div key={report.id} ref={el => appealRefs.current[report.id] = el} style={{ background: appealState[report.id]?.submitted ? '#e0fce7' : '#fff7ed', border: '1px solid #fca5a5', borderRadius: 8, padding: '1rem', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ fontWeight: 600 }}>{report.title}</div>
                        <div style={{ color: '#64748b', fontSize: 14 }}>{report.submissionDate}</div>
                        <div style={{ fontSize: 15 }}><b>Introduction:</b> {report.introduction}</div>
                        <div style={{ fontSize: 15 }}><b>Body:</b> {report.body}</div>
                        <div style={{ color: '#1746a2', fontSize: 15 }}>Courses: {report.courses.join(', ')}</div>
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
                  {dummyRejectedReports.length === 0 ? (
                    <div style={{ color: '#64748b' }}>No rejected reports.</div>
                  ) : (
                    dummyRejectedReports.map((report) => (
                      <div key={report.id} ref={el => appealRefs.current[report.id] = el} style={{ background: appealState[report.id]?.submitted ? '#e0fce7' : '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '1rem', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ fontWeight: 600 }}>{report.title}</div>
                        <div style={{ color: '#64748b', fontSize: 14 }}>{report.submissionDate}</div>
                        <div style={{ fontSize: 15 }}><b>Introduction:</b> {report.introduction}</div>
                        <div style={{ fontSize: 15 }}><b>Body:</b> {report.body}</div>
                        <div style={{ color: '#1746a2', fontSize: 15 }}>Courses: {report.courses.join(', ')}</div>
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
