import React, { useState, useRef, useEffect } from 'react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { mockInternships, mockReports } from '../../DummyData/mockUsers';
import { Eye, Edit2, Trash2, Upload, Calendar, Search, Building2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { Eye, Edit2, Trash2, Upload, Calendar, Search, Building2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

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
  const [selected, setSelected] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [reportForm, setReportForm] = useState({ title: '', introduction: '', body: '', courses: [] });
  const [evaluationForm, setEvaluationForm] = useState({ feedback: '', recommend: false });
  const [reports, setReports] = useState(currentUser?.reports || []);
  const [editingReportId, setEditingReportId] = useState(null);
  const [notifiedInternships, setNotifiedInternships] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [evaluations, setEvaluations] = useState(currentUser?.evaluations || []);
  const [editingEvaluationId, setEditingEvaluationId] = useState(null);
  const [evaluationError, setEvaluationError] = useState('');

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
    setSelected(internship);
    setShowModal(true);
    setShowReportForm(false);
    setShowEvaluationForm(false);
  };

  const handleOpenReportForm = () => {
    setShowReportForm(true);
    setShowEvaluationForm(false);
    setReportForm({ title: '', introduction: '', body: '', courses: [] });
    setEditingReportId(null);
  };

  const handleOpenEvaluationForm = () => {
    setShowEvaluationForm(true);
    setShowReportForm(false);
    if (selected) {
      const existingEvaluation = evaluations.find(e => e.internship?.id === selected.id);
      if (existingEvaluation) {
        setEvaluationForm({
          feedback: existingEvaluation.feedback,
          recommend: existingEvaluation.recommend
        });
        setEditingEvaluationId(existingEvaluation.id);
        setEvaluationError('');
      } else {
        setEvaluationForm({ feedback: '', recommend: false });
        setEditingEvaluationId(null);
        setEvaluationError('');
      }
    }
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
    const { name, value, type, checked } = e.target;
    setEvaluationForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
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
            introduction: reportForm.introduction,
            body: reportForm.body,
            courses: reportForm.courses || [],
          }
          : r
      ));
    } else {
      // Add new report
      const newReport = {
        id: Date.now(),
        internship: selected,
        title: reportForm.title,
        introduction: reportForm.introduction,
        body: reportForm.body,
        courses: reportForm.courses || [],
        submissionDate: new Date(),
        status: 'Submitted',
      };
      setReports((prev) => [...prev, newReport]);
      currentUser?.submitReport?.(newReport);
    }
    setReportForm({ title: '', introduction: '', body: '', courses: [] });
    setEditingReportId(null);
    setShowReportForm(false);
    setShowModal(false);
    setSelected(null);
  };

  const handleEvaluationSubmit = (e) => {
    e.preventDefault();
    setEvaluationError('');
    if (editingEvaluationId) {
      // Update existing evaluation
      const updatedEvaluation = {
        id: editingEvaluationId,
        internship: selected,
        feedback: evaluationForm.feedback,
        recommend: evaluationForm.recommend,
        createdAt: evaluations.find(e => e.id === editingEvaluationId)?.createdAt || new Date(),
        updatedAt: new Date()
      };
      setEvaluations(prev => prev.map(evaluation => evaluation.id === editingEvaluationId ? updatedEvaluation : evaluation));
      if (currentUser?.evaluations) {
        const userEvaluationIndex = currentUser.evaluations.findIndex(e => e.id === editingEvaluationId);
        if (userEvaluationIndex !== -1) {
          currentUser.evaluations[userEvaluationIndex] = updatedEvaluation;
        }
      }
    } else {
      // Add new evaluation
      const newEvaluation = {
        id: Date.now(),
        internship: selected,
        feedback: evaluationForm.feedback,
        recommend: evaluationForm.recommend,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setEvaluations(prev => [...prev, newEvaluation]);
      currentUser?.submitEvaluation?.(newEvaluation);
    }
    setEvaluationForm({ feedback: '', recommend: false });
    setEditingEvaluationId(null);
    setShowEvaluationForm(false);
    setShowModal(false);
    setSelected(null);
  };

  const handleEditReport = (report) => {
    setSelected(report.internship);
    setReportForm({
      title: report.title,
      introduction: report.introduction,
      body: report.body,
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
      setReportForm({ title: '', introduction: '', body: '', courses: [] });
    }
  };

  const handleEditEvaluation = (evaluation) => {
    setSelected(evaluation.internship);
    setEvaluationForm({
      feedback: evaluation.feedback,
      recommend: evaluation.recommend
    });
    setEditingEvaluationId(evaluation.id);
    setShowEvaluationForm(true);
    setShowModal(true);
  };

  const handleDeleteEvaluation = (evaluationId) => {
    // Remove from state
    setEvaluations(prev => prev.filter(evaluation => evaluation.id !== evaluationId));
    
    // Remove from user's evaluations
    if (currentUser?.evaluations) {
      currentUser.evaluations = currentUser.evaluations.filter(e => e.id !== evaluationId);
    }
    
    // If this was the evaluation being edited, reset the form
    if (editingEvaluationId === evaluationId) {
      setEditingEvaluationId(null);
      setEvaluationForm({ feedback: '', recommend: false });
    }
  };

  // Get evaluations for a specific internship
  const getEvaluationsForInternship = (internshipId) =>
    evaluations.filter(evaluation => evaluation.internship?.id === internshipId);

  const handleDownloadReport = (report) => {
    try {
      // Generate PDF using jsPDF
      const doc = new jsPDF();
      let yOffset = 20; // Starting y position
      const margin = 10; // Left margin
      const maxWidth = 190; // Maximum width for text
      
      // Add title
      doc.setFontSize(16);
      const title = report.title || 'Untitled Report';
      doc.text(title, margin, yOffset);
      yOffset += 10;
      
      // Add submission date
      doc.setFontSize(12);
      const submissionDate = `Submitted on: ${formatDate(report.submissionDate)}`;
      doc.text(submissionDate, margin, yOffset);
      yOffset += 15;
      
      // Add content
      doc.setFontSize(12);
      doc.text('Content:', margin, yOffset);
      yOffset += 7;
      
      // Add content text with proper wrapping
      doc.setFontSize(11);
      const content = report.content || 'No content provided';
      const splitContent = doc.splitTextToSize(content, maxWidth);
      doc.text(splitContent, margin, yOffset);
      yOffset += (splitContent.length * 7) + 10; // Add space after content
      
      // Add courses
      doc.setFontSize(12);
      doc.text('Courses Used:', margin, yOffset);
      yOffset += 7;
      
      // Add courses text with proper wrapping
      doc.setFontSize(11);
      const courses = (report.courses || []).join(', ') || 'No courses specified';
      const splitCourses = doc.splitTextToSize(courses, maxWidth);
      doc.text(splitCourses, margin, yOffset);
      
      // Save the PDF
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`${safeTitle}_report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
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
                <div key={`internship-${internship.id}`} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem', minWidth: 320, flex: 1, maxWidth: 370, display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                        {evaluations.some(e => e.internship?.id === internship.id) ? 'Edit Evaluation' : 'Evaluate'}
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

          {/* Modal for internship details */}
          {showModal && selected && (
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
              padding: '1rem'
            }}>
              <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: '1.5rem',
                width: '100%',
                maxWidth: 800,
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                position: 'relative'
              }}>
                <button
                  onClick={() => { setShowModal(false); setSelected(null); }}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'none',
                    border: 'none',
                    fontSize: 22,
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >×</button>

                {showEvaluationForm ? (
                  <>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20 }}>Evaluate Internship</h3>
                    <div style={{ display: 'flex', gap: 24 }}>
                      <div style={{ flex: 1, minWidth: 320 }}>
                        {evaluationError && (
                          <div style={{ color: '#b91c1c', fontWeight: 600, marginBottom: 10 }}>{evaluationError}</div>
                        )}
                        <form onSubmit={handleEvaluationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="checkbox"
                              name="recommend"
                              checked={evaluationForm.recommend}
                              onChange={handleEvaluationFormChange}
                              style={{ width: 18, height: 18 }}
                            />
                            <label style={{ fontWeight: 500 }}>Recommend this company to other students</label>
                          </div>
                          {editingEvaluationId ? (
                            <>
                              <button
                                type="submit"
                                style={{ background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', marginTop: 8 }}
                              >
                                Update Evaluation
                              </button>
                              <button
                                type="button"
                                onClick={() => { setEditingEvaluationId(null); setEvaluationForm({ feedback: '', recommend: false }); setEvaluationError(''); }}
                                style={{ background: '#e2e8f0', color: '#16a34a', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 8, padding: '8px 18px', marginTop: 4, cursor: 'pointer' }}
                              >
                                Cancel Edit
                              </button>
                            </>
                          ) : (
                            <button
                              type="submit"
                              style={{ background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', marginTop: 8 }}
                            >
                              Submit Evaluation
                            </button>
                          )}
                        </form>
                      </div>
                      <div style={{ flex: 1, minWidth: 320 }}>
                        <h4 style={{ fontWeight: 600, fontSize: 17, marginBottom: 10 }}>Previous Evaluations</h4>
                        {getEvaluationsForInternship(selected.id).length === 0 ? (
                          <div style={{ color: '#64748b' }}>No evaluations submitted yet.</div>
                        ) : (
                          getEvaluationsForInternship(selected.id).map((evaluation) => (
                            <div key={`evaluation-${evaluation.id}`} style={{ background: '#f1f5f9', borderRadius: 8, padding: '1rem', marginBottom: 12 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ color: '#64748b', fontSize: 14 }}>{formatDate(evaluation.createdAt)}</div>
                              </div>
                              <div style={{ fontSize: 15, marginTop: 8 }}>{evaluation.feedback}</div>
                              {evaluation.recommend && (
                                <div style={{ color: '#16a34a', fontSize: 14, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <span>✓</span> Recommended to other students
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                <button 
                                  onClick={() => handleEditEvaluation(evaluation)} 
                                  style={{ background: '#e0f2fe', color: '#1746a2', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteEvaluation(evaluation.id)} 
                                  style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                ) : showReportForm ? (
                  <>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20 }}>
                      {editingReportId ? 'Edit Report' : 'Submit Report'}
                    </h3>
                    <div style={{ display: 'flex', gap: 24 }}>
                      {/* LEFT: Form */}
                      <div style={{ flex: 1, minWidth: 320 }}>
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
                            rows={3}
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
                          {editingReportId ? (
                            <>
                              <button
                                type="submit"
                                style={{ background: '#1746a2', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', marginTop: 8 }}
                              >
                                Save Changes
                              </button>
                              <button
                                type="button"
                                onClick={() => { setEditingReportId(null); setReportForm({ title: '', introduction: '', body: '', courses: [] }); }}
                                style={{ background: '#e2e8f0', color: '#1746a2', fontWeight: 600, fontSize: 15, border: 'none', borderRadius: 8, padding: '8px 18px', marginTop: 4, cursor: 'pointer' }}
                              >
                                Cancel Edit
                              </button>
                            </>
                          ) : (
                            <button
                              type="submit"
                              style={{ background: '#1746a2', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', marginTop: 8 }}
                            >
                              Submit Report
                            </button>
                          )}
                        </form>
                      </div>
                      {/* RIGHT: Reports */}
                      <div style={{ flex: 1, minWidth: 320 }}>
                        {/* Submitted Reports Section */}
                        <h4 style={{ fontWeight: 600, fontSize: 17, marginBottom: 10 }}>Submitted Reports</h4>
                        {getReportsForInternship(selected.id).length === 0 ? (
                          <div style={{ color: '#64748b', fontStyle: 'italic', marginBottom: 12 }}>
                            No reports submitted yet.
                          </div>
                        ) : (
                          getReportsForInternship(selected.id).map((report) => (
                            <div key={report.id} style={{ background: '#f1f5f9', borderRadius: 8, padding: '1rem', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <div style={{ fontWeight: 600, fontSize: 16 }}>{report.title}</div>
                              <div style={{ color: '#64748b', fontSize: 14 }}>{formatDate(report.submissionDate)}</div>
                              <div style={{ fontSize: 15, marginTop: 8 }}><b>Introduction:</b> {report.introduction}</div>
                              <div style={{ fontSize: 15, marginTop: 8 }}><b>Body:</b> {report.body}</div>
                              <div style={{ color: '#1746a2', fontSize: 15 }}>Courses: {(report.courses || []).join(', ')}</div>
                              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                                <button 
                                  onClick={() => handleDownloadReport(report)} 
                                  style={{ background: '#e0e7ef', color: '#1746a2', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                >
                                  <Download size={16} /> Download
                                </button>
                                <button 
                                  onClick={() => handleEditReport(report)} 
                                  style={{ background: '#e0f2fe', color: '#1746a2', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteReport(report.id)} 
                                  style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}
                                >
                                  Delete
                                </button>
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
                            <div key={report.id} style={{ background: '#fff7ed', border: '1px solid #fca5a5', borderRadius: 8, padding: '1rem', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <div style={{ fontWeight: 600 }}>{report.title}</div>
                              <div style={{ color: '#64748b', fontSize: 14 }}>{formatDate(report.submissionDate)}</div>
                              <div style={{ fontSize: 15 }}><b>Content:</b> {report.body}</div>
                              <div style={{ color: '#1746a2', fontSize: 15 }}>Courses: {(report.courses || []).join(', ')}</div>
                            </div>
                          ))
                        )}
                        {/* Rejected Reports Section */}
                        <h4 style={{ fontWeight: 600, fontSize: 17, margin: '24px 0 10px 0', color: '#991b1b' }}>Rejected Reports</h4>
                        {getReportsByStatus('rejected').length === 0 ? (
                          <div style={{ color: '#64748b' }}>No rejected reports.</div>
                        ) : (
                          getReportsByStatus('rejected').map((report) => (
                            <div key={report.id} style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '1rem', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <div style={{ fontWeight: 600 }}>{report.title}</div>
                              <div style={{ color: '#64748b', fontSize: 14 }}>{formatDate(report.submissionDate)}</div>
                              <div style={{ fontSize: 15 }}><b>Content:</b> {report.body}</div>
                              <div style={{ color: '#1746a2', fontSize: 15 }}>Courses: {(report.courses || []).join(', ')}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20 }}>{selected.title}</h3>
                    
                    {/* Company Profile Section */}
                    <div style={{ 
                      background: '#f8fafc', 
                      borderRadius: 8, 
                      padding: '1.5rem', 
                      marginBottom: '1.5rem' 
                    }}>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        {/* Company Logo */}
                        <div style={{
                          width: '80px',
                          height: '80px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#fff',
                          borderRadius: 8,
                          padding: '0.5rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                          {selected.company?.logoUrl ? (
                            <img
                              src={selected.company.logoUrl}
                              alt={`${selected.company.companyName} logo`}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <Building2 size={40} color="#94a3b8" />
                          )}
                        </div>
                        {/* Company Info */}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{selected.company?.companyName}</h4>
                          <div style={{ color: '#64748b', marginBottom: 4 }}><b>Location:</b> {selected.company?.location || 'Not specified'}</div>
                          <div style={{ color: '#64748b', marginBottom: 4 }}><b>Industry:</b> {selected.company?.industry || 'Not specified'}</div>
                          <div style={{ color: '#64748b', marginBottom: 4 }}><b>Size:</b> {selected.company?.size || 'Not specified'}</div>
                          <div style={{ color: '#64748b', marginBottom: 4 }}><b>Founded:</b> {selected.company?.founded || 'Not specified'}</div>
                          <div style={{ color: '#64748b', marginBottom: 4 }}><b>Website:</b> {selected.company?.website || 'Not specified'}</div>
                          <div style={{ color: '#64748b', marginBottom: 4 }}><b>Email:</b> {selected.company?.email || 'Not specified'}</div>
                          <div style={{ color: '#64748b', marginBottom: 4 }}><b>Phone:</b> {selected.company?.phone || 'Not specified'}</div>
                        </div>
                      </div>
                      {selected.company?.description && (
                        <div style={{ color: '#334155', lineHeight: 1.6, marginTop: '1rem' }}>
                          <b>About Company:</b>
                          <p style={{ marginTop: 8 }}>{selected.company.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Internship Details Section */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Internship Details</h4>
                      <div style={{ color: '#64748b', marginBottom: 8 }}><b>Location:</b> {selected.location}</div>
                      <div style={{ color: '#64748b', marginBottom: 8 }}><b>Duration:</b> {formatDate(selected.startDate)} - {formatDate(selected.endDate)}</div>
                      <div style={{ color: '#64748b', marginBottom: 8 }}><b>Status:</b> {selected.status === 'accepted' ? 'Current' : 'Completed'}</div>
                      <div style={{ color: '#64748b', marginBottom: 8 }}><b>Type:</b> {selected.type || 'Full-time'}</div>
                      <div style={{ color: '#334155', marginTop: 12, lineHeight: 1.6 }}>
                        <b>Description:</b>
                        <p style={{ marginTop: 8 }}>{selected.description}</p>
                      </div>
                    </div>

                    {selected.status !== 'accepted' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' }}>
                        <button
                          onClick={() => { handleViewDetails(selected); handleOpenReportForm(); }}
                          style={{ background: '#1746a2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', flex: 1 }}
                        >
                          Add Report
                        </button>
                        <button
                          onClick={() => { handleViewDetails(selected); handleOpenEvaluationForm(); }}
                          style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', flex: 1 }}
                        >
                          {evaluations.some(e => e.internship?.id === selected.id) ? 'Edit Evaluation' : 'Evaluate'}
                        </button>
                      </div>
                    )}
                  </>
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