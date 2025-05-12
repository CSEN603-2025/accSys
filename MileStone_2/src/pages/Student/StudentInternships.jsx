import React, { useState, useRef, useEffect } from 'react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { mockInternships } from '../../DummyData/mockInternships';

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', color: '#b45309' },
  accepted: { bg: '#dcfce7', color: '#166534' },
  rejected: { bg: '#fee2e2', color: '#991b1b' },
  completed: { bg: '#e0e7ef', color: '#2563eb' },
};

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
};

const StudentInternships = ({ currentUser }) => {
  // Use mockInternships if user has no internships
  const internships = (currentUser?.internships && currentUser.internships.length > 0)
    ? currentUser.internships
    : mockInternships;
  const major = currentUser?.major || 'Computer Science';
  const availableCourses = COURSES_BY_MAJOR[major] || [];

  // Dummy statuses for demo
  const getStatus = (internship) => {
    // You can replace this with real status logic
    if (internship.status) return internship.status;
    if (internship.title.toLowerCase().includes('completed')) return 'completed';
    if (internship.title.toLowerCase().includes('pending')) return 'pending';
    if (internship.title.toLowerCase().includes('rejected')) return 'rejected';
    if (internship.title.toLowerCase().includes('accepted')) return 'accepted';
    // Demo: mark some as completed
    if (internship.id % 4 === 0) return 'completed';
    if (internship.id % 3 === 0) return 'rejected';
    if (internship.id % 2 === 0) return 'accepted';
    return 'pending';
  };

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({ title: '', introduction: '', body: '', courses: [] });
  const [reports, setReports] = useState([]);
  const [editingReportIdx, setEditingReportIdx] = useState(null);

  // Dummy flagged and rejected reports for demo
  const dummyFlaggedReports = [
    {
      id: 201,
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
      id: 202,
      title: 'QA Testing Report',
      introduction: 'QA internship was rejected.',
      body: 'Details about the QA internship rejection.',
      courses: ['Operating Systems'],
      submissionDate: '2025-07-12',
      status: 'rejected',
      internship: { id: 12, title: 'QA Tester Intern (Rejected)' }
    }
  ];

  // Appeal state per report (for modal)
  const [appealState, setAppealState] = useState({}); // { [reportId]: { comment: '', submitted: false } }
  const appealRefs = useRef({});

  // New state for evaluation
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [evaluationForm, setEvaluationForm] = useState({ text: '' });
  const [evaluations, setEvaluations] = useState([]); // { internshipId, text, date }
  const [editingEvaluationIdx, setEditingEvaluationIdx] = useState(null);
  const [evaluationError, setEvaluationError] = useState('');

  // 1. Notification when internship cycle begins
  useEffect(() => {
    if (currentUser && currentUser.notifications) {
      internships.forEach(internship => {
        const today = new Date().toISOString().slice(0, 10);
        if (internship.startDate && internship.startDate === today) {
          if (!currentUser.notifications.some(n => n.type === 'cycle' && n.internshipId === internship.id)) {
            currentUser.notifications.unshift({
              message: `Internship cycle for '${internship.title}' has begun!`,
              date: new Date().toISOString(),
              read: false,
              type: 'cycle',
              internshipId: internship.id
            });
          }
        }
      });
    }
  }, [currentUser, internships]);

  // Only show content if user is logged in
  if (!currentUser) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#b91c1c', fontWeight: 600 }}>Please log in to view your reports and internships.</div>;
  }

  const filteredInternships = internships.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    (i.company?.companyName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleViewDetails = (internship) => {
    setSelectedInternship(internship);
    setShowModal(true);
    setShowReportForm(false);
    setShowEvaluationModal(false);
    setEvaluationForm({ text: '' });
    setEditingEvaluationIdx(null);
    setEvaluationError('');
  };

  const handleOpenReportForm = () => {
    setShowReportForm(true);
    setReportForm({ title: '', introduction: '', body: '', courses: [] });
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

  const handleEditReport = (report, idx) => {
    setShowReportForm(true);
    setReportForm({
      title: report.title,
      introduction: report.introduction,
      body: report.body,
      courses: report.courses,
    });
    setEditingReportIdx(idx);
  };

  const handleDeleteReport = (idx) => {
    setReports(prev => prev.filter((_, i) => i !== idx));
    if (editingReportIdx === idx) {
      setEditingReportIdx(null);
      setReportForm({ title: '', introduction: '', body: '', courses: [] });
    }
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (editingReportIdx !== null) {
      setReports(prev => prev.map((r, i) =>
        i === editingReportIdx
          ? {
              ...r,
              ...reportForm,
            }
          : r
      ));
      // Simulate status change for demo (accepted, rejected, flagged)
      const newStatus = reportForm.status || 'accepted'; // You can randomize or set as needed
      if (currentUser && currentUser.notifications) {
        currentUser.notifications.unshift({
          message: `Your report '${reportForm.title}' for internship '${selectedInternship.title}' at '${selectedInternship.company?.companyName || 'Company'}' was ${newStatus}.`,
          date: new Date().toISOString(),
          read: false,
          type: newStatus,
          internshipId: selectedInternship.id
        });
      }
      setEditingReportIdx(null);
    } else {
      setReports(prev => [...prev, {
        ...reportForm,
        internshipId: selectedInternship.id,
        date: new Date().toLocaleDateString(),
      }]);
      // Add notification for pending report
      if (currentUser && currentUser.notifications) {
        currentUser.notifications.unshift({
          message: `Your report '${reportForm.title}' for internship '${selectedInternship.title}' at '${selectedInternship.company?.companyName || 'Company'}' is now pending.`,
          date: new Date().toISOString(),
          read: false,
          type: 'pending',
          internshipId: selectedInternship.id
        });
      }
    }
    setShowReportForm(false);
    setShowModal(false);
    setSelectedInternship(null);
    setReportForm({ title: '', introduction: '', body: '', courses: [] });
  };

  // Appeal handlers for modal
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
  };

  // New handlers for evaluation
  const handleOpenEvaluationModal = () => {
    if (selectedInternship) {
      const evalIdx = evaluations.findIndex(e => e.internshipId === selectedInternship.id);
      if (evalIdx !== -1) {
        setEvaluationForm({ text: evaluations[evalIdx].text });
        setEditingEvaluationIdx(evalIdx);
      } else {
        setEvaluationForm({ text: '' });
        setEditingEvaluationIdx(null);
      }
    } else {
      setEvaluationForm({ text: '' });
      setEditingEvaluationIdx(null);
    }
    setShowEvaluationModal(true);
    setEvaluationError('');
  };
  const handleEvaluationFormChange = (e) => {
    setEvaluationForm({ text: e.target.value });
  };
  const handleEvaluationSubmit = (e) => {
    e.preventDefault();
    if (evaluations.some(e => e.internshipId === selectedInternship.id)) {
      setEvaluationError('You cannot submit more than one evaluation for this internship.');
      return;
    }
    setEvaluations(prev => [...prev, {
      internshipId: selectedInternship.id,
      text: evaluationForm.text,
      date: new Date().toLocaleDateString(),
    }]);
    setEvaluationForm({ text: '' });
    setEditingEvaluationIdx(null);
    setEvaluationError('');
  };
  const handleEditEvaluation = (evalIdx) => {
    setEvaluationForm({ text: evaluations[evalIdx].text });
    setEditingEvaluationIdx(evalIdx);
    setEvaluationError('');
  };
  const handleDeleteEvaluation = (evalIdx) => {
    setEvaluations(prev => prev.filter((_, i) => i !== evalIdx));
    setEvaluationForm({ text: '' });
    setEditingEvaluationIdx(null);
    setEvaluationError('');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole="student" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ maxWidth: 1100, margin: '2rem auto', padding: 0 }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>My Internships</h2>
          <input
            type="text"
            placeholder="Search by job title or company name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 350, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 24 }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            {filteredInternships.map(internship => {
              const status = getStatus(internship);
              const statusColor = STATUS_COLORS[status] || {};
              const hasEvaluation = evaluations.some(e => e.internshipId === internship.id);
              return (
                <div key={internship.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem', minWidth: 320, flex: 1, maxWidth: 370, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>{internship.title}</div>
                  <div style={{ color: '#64748b', fontSize: 15 }}>{internship.company?.companyName || 'Company'}</div>
                  <div style={{ fontSize: 14, background: statusColor.bg, color: statusColor.color, borderRadius: 6, padding: '2px 12px', display: 'inline-block', fontWeight: 600 }}>{status.charAt(0).toUpperCase() + status.slice(1)}</div>
                  <div style={{ color: '#64748b', fontSize: 14 }}>{internship.location}</div>
                  <button
                    onClick={() => handleViewDetails(internship)}
                    style={{ background: '#1746a2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, marginTop: 8, cursor: 'pointer' }}
                  >
                    View Details
                  </button>
                  {status === 'completed' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' }}>
                      <button
                        onClick={() => { handleViewDetails(internship); handleOpenReportForm(); }}
                        style={{ background: '#1746a2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                      >
                        Add Report
                      </button>
                      <button
                        onClick={() => { handleViewDetails(internship); handleOpenEvaluationModal(); }}
                        style={{ background: hasEvaluation ? '#a3a3a3' : '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: hasEvaluation ? 'not-allowed' : 'pointer' }}
                        disabled={hasEvaluation}
                      >
                        Add Evaluation
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal for internship details and report form */}
          {showModal && selectedInternship && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                <button onClick={() => { setShowModal(false); setShowReportForm(false); }} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#64748b', cursor: 'pointer' }}>×</button>
                <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>{selectedInternship.title}</h3>
                <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}>{selectedInternship.company?.companyName || 'Company'}</div>
                <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}>{selectedInternship.location}</div>
                <div style={{ fontSize: 15, marginBottom: 16 }}>{selectedInternship.description}</div>
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
                          name="introduction"
                          value={reportForm.introduction}
                          onChange={handleReportFormChange}
                          placeholder="Introduction"
                          rows={2}
                          style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                          required
                        />
                        <textarea
                          name="body"
                          value={reportForm.body}
                          onChange={handleReportFormChange}
                          placeholder="Body"
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
                          style={{ background: '#1746a2', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', borderRadius: 8, padding: '10px 24px', marginTop: 8, cursor: 'pointer' }}
                        >
                          {editingReportIdx !== null ? 'Save Changes' : 'Submit Report'}
                        </button>
                      </form>
                    </div>
                    {/* Reports for selected internship */}
                    <div style={{
                      flex: '0 0 370px',
                      maxWidth: 390,
                      minWidth: 320,
                      height: '100%',
                      minHeight: 0,
                      overflowY: 'auto',
                      boxSizing: 'border-box',
                    }}>
                      <h4 style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Pending Reports</h4>
                      {reports.filter(r => r.internshipId === selectedInternship.id).length === 0 ? (
                        <div style={{ color: '#64748b' }}>No reports submitted yet.</div>
                      ) : (
                        reports.filter(r => r.internshipId === selectedInternship.id).map((report, idx) => (
                          <div key={idx} style={{ background: '#f1f5f9', borderRadius: 8, padding: '1rem', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ fontWeight: 600 }}>{report.title}</div>
                            <div style={{ color: '#64748b', fontSize: 14 }}>{report.date}</div>
                            <div style={{ fontSize: 15 }}><b>Introduction:</b> {report.introduction}</div>
                            <div style={{ fontSize: 15 }}><b>Body:</b> {report.body}</div>
                            <div style={{ color: '#1746a2', fontSize: 15 }}>Courses: {report.courses.join(', ')}</div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                              <button onClick={() => handleEditReport(report, idx)} style={{ background: '#e0f2fe', color: '#1746a2', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}>Edit</button>
                              <button onClick={() => handleDeleteReport(idx)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}>Delete</button>
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
                                  rows={3}
                                  style={{ padding: 8, borderRadius: 6, border: '1px solid #e2e8f0', minHeight: 120 }}
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
                                  rows={3}
                                  style={{ padding: 8, borderRadius: 6, border: '1px solid #e2e8f0', minHeight: 120 }}
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
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Evaluation Modal */}
          {showEvaluationModal && selectedInternship && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                <button onClick={() => { setShowEvaluationModal(false); setShowModal(false); setEvaluationError(''); }} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#64748b', cursor: 'pointer' }}>×</button>
                <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>{selectedInternship.title} - Evaluation</h3>
                <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}>{selectedInternship.company?.companyName || 'Company'}</div>
                <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}>{selectedInternship.location}</div>
                <div style={{ fontSize: 15, marginBottom: 16 }}>{selectedInternship.description}</div>
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flex: 1, minHeight: 0, marginTop: 18 }}>
                  {/* Evaluation Form */}
                  <div style={{ minWidth: 260, flex: 1, minHeight: 0 }}>
                    <form onSubmit={handleEvaluationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <label style={{ fontWeight: 500, fontSize: 16 }}>Write your evaluation</label>
                      <textarea
                        value={evaluationForm.text}
                        onChange={handleEvaluationFormChange}
                        placeholder="Enter your evaluation..."
                        rows={7}
                        style={{ padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15 }}
                        required
                      />
                      {evaluationError && <div style={{ color: '#b91c1c', fontWeight: 500 }}>{evaluationError}</div>}
                      <button
                        type="submit"
                        style={{ background: '#22c55e', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', borderRadius: 8, padding: '10px 24px', marginTop: 8, cursor: 'pointer', alignSelf: 'flex-start' }}
                      >
                        {(editingEvaluationIdx !== null && evaluations[editingEvaluationIdx]?.internshipId === selectedInternship.id) ? 'Save Changes' : 'Submit Evaluation'}
                      </button>
                    </form>
                  </div>
                  {/* Submitted Evaluations */}
                  <div style={{ flex: '0 0 370px', maxWidth: 390, minWidth: 320, height: '100%', minHeight: 0, overflowY: 'auto', boxSizing: 'border-box' }}>
                    <h4 style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Submitted Evaluations</h4>
                    {evaluations.filter(e => e.internshipId === selectedInternship.id).length === 0 ? (
                      <div style={{ color: '#64748b' }}>No evaluations submitted yet.</div>
                    ) : (
                      evaluations.filter(e => e.internshipId === selectedInternship.id).map((ev, idx) => (
                        <div key={idx} style={{ background: '#f1f5f9', borderRadius: 8, padding: '1rem', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ fontWeight: 600 }}>Your Evaluation</div>
                          <div style={{ color: '#64748b', fontSize: 14 }}>{ev.date}</div>
                          <div style={{ fontSize: 15, margin: '10px 0' }}>{ev.text}</div>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => handleEditEvaluation(evaluations.findIndex(e => e.internshipId === selectedInternship.id))} style={{ background: '#e0f2fe', color: '#1746a2', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}>Edit</button>
                            <button onClick={() => handleDeleteEvaluation(evaluations.findIndex(e => e.internshipId === selectedInternship.id))} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}>Delete</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentInternships;
