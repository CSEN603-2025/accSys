import React, { useState, useRef, useEffect } from 'react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { mockUsers, mockInternships, mockReports } from '../../DummyData/mockUsers';
import jsPDF from 'jspdf';
import { Search, Filter, ChevronDown, X } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null); // 'flag' or 'reject'
  const [clarificationText, setClarificationText] = useState('');
  const [selectedReportForAction, setSelectedReportForAction] = useState(null);
  const [majorFilter, setMajorFilter] = useState('all');

  const isStudent = currentUser?.role === 'student';
  const isFaculty = currentUser?.role === 'faculty';
  const isSCAD = currentUser?.role === 'scad';

  // Get all reports for faculty/SCAD
  const getAllReports = () => {
    if (!isFaculty && !isSCAD) return [];
    return mockUsers
      .filter(user => user.role === 'student')
      .flatMap(student =>
        (student.reports || []).map(report => ({
          ...report,
          student: {
            id: student.id,
            username: student.username,
            email: student.email,
            major: student.major
          }
        }))
      );
  };

  // Filter reports based on search and status
  const getFilteredReports = () => {
    let filtered = isStudent ? reports : getAllReports();

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report =>
        (report.title?.toLowerCase() || '').includes(query) ||
        (report.introduction?.toLowerCase() || '').includes(query) ||
        (report.body?.toLowerCase() || '').includes(query) ||
        (report.student?.username?.toLowerCase() || '').includes(query) ||
        (report.student?.email?.toLowerCase() || '').includes(query) ||
        (report.student?.major?.toLowerCase() || '').includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => (report.status?.toLowerCase() || 'pending') === statusFilter.toLowerCase());
    }
    if ((isFaculty || isSCAD) && majorFilter !== 'all') {
      filtered = filtered.filter(report => (report.student?.major || '').toLowerCase() === majorFilter.toLowerCase());
    }
    return filtered.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
  };

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
          status: 'pending',
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
    try {
      // Create new PDF document
      const doc = new jsPDF();

      // Helper function to sanitize text
      const sanitizeText = (text) => {
        if (text === null || text === undefined) return '';
        return String(text).trim();
      };

      // Helper function to add text with word wrap and validation
      const addWrappedText = (text, x, y, maxWidth, lineHeight = 7) => {
        const sanitizedText = sanitizeText(text);
        if (!sanitizedText) return 0;
        
        try {
          const splitText = doc.splitTextToSize(sanitizedText, maxWidth);
          if (Array.isArray(splitText) && splitText.length > 0) {
            doc.text(splitText, x, y);
            return splitText.length * lineHeight;
          }
          return 0;
        } catch (error) {
          console.error('Error in addWrappedText:', error);
          return 0;
        }
      };

      // Helper function to add section with validation
      const addSection = (title, content, startY) => {
        if (!title || !content) return 0;
        
        doc.setFontSize(14);
        doc.setTextColor(23, 70, 162); // #1746a2
        doc.text(sanitizeText(title), 20, startY);
        
        doc.setFontSize(12);
        doc.setTextColor(51, 65, 85); // #334155
        return addWrappedText(content, 20, startY + 7, 170);
      };

      // Set document properties
      doc.setProperties({
        title: sanitizeText(report.title),
        subject: 'Internship Report',
        author: sanitizeText(report.student?.username) || 'Student',
        creator: 'SCAD System'
      });

      // Add header with logo and title
      doc.setFontSize(20);
      doc.setTextColor(23, 70, 162); // #1746a2
      doc.text('Internship Report', 105, 20, { align: 'center' });
      
      // Add report title
      doc.setFontSize(16);
      doc.setTextColor(51, 65, 85); // #334155
      doc.text(sanitizeText(report.title), 105, 35, { align: 'center' });
      
      // Add horizontal line
      doc.setDrawColor(226, 232, 240); // #e2e8f0
      doc.line(20, 40, 190, 40);

      let yPosition = 50;

      // Student Details Section
      doc.setFontSize(14);
      doc.setTextColor(23, 70, 162); // #1746a2
      doc.text('Student Details', 20, yPosition);
      
      doc.setFontSize(12);
      doc.setTextColor(51, 65, 85); // #334155
      yPosition += 7;
      doc.text(`Name: ${sanitizeText(report.student?.username)}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Email: ${sanitizeText(report.student?.email)}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Major: ${sanitizeText(report.student?.major)}`, 20, yPosition);
      yPosition += 15;

      // Internship Details Section
      doc.setFontSize(14);
      doc.setTextColor(23, 70, 162); // #1746a2
      doc.text('Internship Details', 20, yPosition);
      
      doc.setFontSize(12);
      doc.setTextColor(51, 65, 85); // #334155
      yPosition += 7;
      doc.text(`Company: ${sanitizeText(report.internship?.company?.companyName)}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Supervisor: ${sanitizeText(report.internship?.mainSupervisor)}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Start Date: ${sanitizeText(formatDate(report.internship?.startDate))}`, 20, yPosition);
      yPosition += 7;
      doc.text(`End Date: ${sanitizeText(formatDate(report.internship?.endDate))}`, 20, yPosition);
      yPosition += 15;

      // Report Content Section
      doc.setFontSize(14);
      doc.setTextColor(23, 70, 162); // #1746a2
      doc.text('Report Content', 20, yPosition);
      yPosition += 7;

      // Introduction
      doc.setFontSize(12);
      doc.setTextColor(51, 65, 85); // #334155
      doc.text('Introduction:', 20, yPosition);
      yPosition += 7;
      const introHeight = addWrappedText(report.introduction, 20, yPosition, 170);
      yPosition += introHeight + 10;

      // Body
      doc.text('Body:', 20, yPosition);
      yPosition += 7;
      const bodyHeight = addWrappedText(report.body, 20, yPosition, 170);
      yPosition += bodyHeight + 10;

      // Courses
      doc.text('Courses Used:', 20, yPosition);
      yPosition += 7;
      const coursesText = Array.isArray(report.courses) ? report.courses.join(', ') : '';
      const coursesHeight = addWrappedText(coursesText, 20, yPosition, 170);
      yPosition += coursesHeight + 15;

      // Evaluation Section (if present)
      if (report.evaluation) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(23, 70, 162); // #1746a2
        doc.text('Evaluation Details', 20, yPosition);
        yPosition += 7;

        doc.setFontSize(12);
        doc.setTextColor(51, 65, 85); // #334155
        const evaluationDetails = [
          `Overall Rating: ${sanitizeText(report.evaluation.overallRating)}`,
          `Technical Skills: ${sanitizeText(report.evaluation.technicalSkills)}`,
          `Soft Skills: ${sanitizeText(report.evaluation.softSkills)}`,
          `Performance Assessment: ${sanitizeText(report.evaluation.performanceAssessment)}`,
          `Skills Assessment: ${sanitizeText(report.evaluation.skillsAssessment)}`,
          `Additional Comments: ${sanitizeText(report.evaluation.additionalComments)}`
        ];

        evaluationDetails.forEach(detail => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          const detailHeight = addWrappedText(detail, 20, yPosition, 170);
          yPosition += detailHeight + 5;
        });
      }

      // Add footer with page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // #64748b
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save the PDF with sanitized filename
      const sanitizedTitle = sanitizeText(report.title).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`${sanitizedTitle || 'report'}_report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    }
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

  // Add this new function to handle status changes with clarification
  const handleStatusChangeWithClarification = (report, newStatus) => {
    setSelectedReportForAction(report);
    setSelectedAction(newStatus);
    setClarificationText('');
    setShowClarificationModal(true);
  };

  const handleSubmitClarification = () => {
    if (!selectedReportForAction || !selectedAction || !clarificationText.trim()) return;

    // Update the report status
    const updatedReport = {
      ...selectedReportForAction,
      status: selectedAction,
      clarification: clarificationText,
      clarificationDate: new Date(),
      clarifiedBy: currentUser.username
    };

    // Update reports state
    setReports(prev => prev.map(r =>
      r.id === selectedReportForAction.id ? updatedReport : r
    ));

    // Notify the student
    if (selectedReportForAction.student) {
      selectedReportForAction.student.addNotification(
        `Your report "${selectedReportForAction.title}" has been ${selectedAction}. Reason: ${clarificationText}`
      );
    } else if (selectedReportForAction.studentId) {
      // Fallback: find student by ID in mockUsers
      const studentUser = mockUsers.find(u => u.id === selectedReportForAction.studentId);
      if (studentUser) {
        studentUser.addNotification(
          `Your report "${selectedReportForAction.title}" has been ${selectedAction}. Reason: ${clarificationText}`
        );
      }
    }

    // Close the modal and reset state
    setShowClarificationModal(false);
    setSelectedAction(null);
    setClarificationText('');
    setSelectedReportForAction(null);
  };

  // Report Modal Component
  const ReportModal = ({ report, onClose }) => {
    if (!report) return null;

    const statusColors = {
      pending: { bg: '#fef3c7', text: '#b45309' },
      flagged: { bg: '#fff7ed', text: '#b45309' },
      rejected: { bg: '#fee2e2', text: '#b91c1c' },
      approved: { bg: '#dcfce7', text: '#16a34a' }
    };

    const status = (report?.status || 'pending').toLowerCase();
    const statusStyle = statusColors[status] || { bg: '#f1f5f9', text: '#64748b' };

    const handleStatusChange = (newStatus) => {
      if (newStatus === 'approved') {
        // Find the student in mockUsers and update the report status in their reports array
        if (report.student && report.student.id) {
          const studentUser = mockUsers.find(u => u.id === report.student.id);
          if (studentUser && Array.isArray(studentUser.reports)) {
            const reportIndex = studentUser.reports.findIndex(r => r.id === report.id);
            if (reportIndex !== -1) {
              studentUser.reports[reportIndex].status = 'approved';
              studentUser.reports[reportIndex].clarification = null;
              studentUser.reports[reportIndex].clarificationDate = new Date();
              studentUser.reports[reportIndex].clarifiedBy = currentUser.username;
              studentUser.addNotification(`Your report "${report.title}" has been approved.`);
            }
          }
        }
        // Update local UI state as well
        const updatedReport = {
          ...report,
          status: 'approved',
          clarification: null,
          clarificationDate: new Date(),
          clarifiedBy: currentUser.username
        };
        setReports(prev => prev.map(r =>
          r.id === report.id ? updatedReport : r
        ));
        setShowReportModal(false);
        setSelectedReport(null);
      } else if (newStatus === 'flagged' || newStatus === 'rejected') {
        // For flag and reject, show clarification modal
        setSelectedReportForAction(report);
        setSelectedAction(newStatus);
        setClarificationText('');
        setShowClarificationModal(true);
      }
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <X size={24} color="#64748b" />
          </button>

          {/* Report Header */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ flex: 1, marginRight: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>{report?.title || 'Untitled Report'}</h2>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: statusStyle.bg,
                  color: statusStyle.text,
                  display: 'inline-block'
                }}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
              </div>
            </div>
            {/* Student & Internship Details */}
            <div style={{ marginBottom: 16, background: '#f8fafc', borderRadius: 8, padding: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Student Details:</div>
              <div>Name: {report.student?.username}</div>
              <div>Email: {report.student?.email}</div>
              <div>Major: {report.student?.major}</div>
              <div style={{ fontWeight: 500, margin: '12px 0 4px 0' }}>Internship Details:</div>
              <div>Company: {report.internship?.company?.companyName || 'N/A'}</div>
              <div>Main Supervisor: {report.internship?.mainSupervisor || 'N/A'}</div>
              <div>Start Date: {formatDate(report.internship?.startDate)}</div>
              <div>End Date: {formatDate(report.internship?.endDate)}</div>
            </div>
          </div>

          {/* Report Content */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Introduction</div>
            <div style={{ marginBottom: 16 }}>{report.introduction}</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Body</div>
            <div style={{ marginBottom: 16 }}>{report.body}</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Courses Used</div>
            <div style={{ marginBottom: 16 }}>{(report.courses || []).join(', ')}</div>
          </div>

          {/* Evaluation Details if present */}
          {report.evaluation && (
            <div style={{ background: '#f1f5f9', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Evaluation Details</div>
              <div>Overall Rating: {report.evaluation.overallRating}</div>
              <div>Technical Skills: {report.evaluation.technicalSkills}</div>
              <div>Soft Skills: {report.evaluation.softSkills}</div>
              <div>Performance Assessment: {report.evaluation.performanceAssessment}</div>
              <div>Skills Assessment: {report.evaluation.skillsAssessment}</div>
              <div>Additional Comments: {report.evaluation.additionalComments}</div>
            </div>
          )}

          {/* Clarification if present */}
          {report.clarification && (
            <div style={{ background: '#fff7ed', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Clarification</div>
              <div>{report.clarification}</div>
              <div style={{ fontSize: 13, color: '#b45309', marginTop: 4 }}>By: {report.clarifiedBy} on {formatDate(report.clarificationDate)}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              onClick={() => handleDownload(report)}
              style={{
                background: '#e0e7ff',
                color: '#2563eb',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Download Report
            </button>
            {(isFaculty || isSCAD) && (
              <div style={{ position: 'relative' }}>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    color: '#334155',
                    appearance: 'none',
                    paddingRight: '40px'
                  }}
                >
                  <option value="pending">Set as Pending</option>
                  <option value="flagged">Flag Report</option>
                  <option value="rejected">Reject Report</option>
                  <option value="approved">Approve Report</option>
                </select>
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <ChevronDown size={16} color="#64748b" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add the Clarification Modal component
  const ClarificationModal = () => {
    if (!showClarificationModal || !selectedAction || !selectedReportForAction) return null;
    if (selectedAction === 'approved') return null; // Don't show for approval

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          width: '90%',
          maxWidth: '600px',
          position: 'relative'
        }}>
          <button
            onClick={() => {
              setShowClarificationModal(false);
              setSelectedAction(null);
              setClarificationText('');
              setSelectedReportForAction(null);
            }}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <X size={24} color="#64748b" />
          </button>

          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
            {selectedAction === 'flagged' ? 'Flag Report' : 'Reject Report'}
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Please provide a reason for {selectedAction === 'flagged' ? 'flagging' : 'rejecting'} this report:
            </label>
            <textarea
              value={clarificationText}
              onChange={(e) => setClarificationText(e.target.value)}
              placeholder={`Enter reason for ${selectedAction === 'flagged' ? 'flagging' : 'rejecting'} the report...`}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '15px',
                resize: 'vertical'
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={() => {
                setShowClarificationModal(false);
                setSelectedAction(null);
                setClarificationText('');
                setSelectedReportForAction(null);
              }}
              style={{
                background: '#e2e8f0',
                color: '#64748b',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitClarification}
              disabled={!clarificationText.trim()}
              style={{
                background: selectedAction === 'flagged' ? '#fff7ed' : '#fee2e2',
                color: selectedAction === 'flagged' ? '#b45309' : '#b91c1c',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                opacity: !clarificationText.trim() ? 0.5 : 1
              }}
            >
              {selectedAction === 'flagged' ? 'Flag Report' : 'Reject Report'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Report Card Component
  const ReportCard = ({ report }) => {
    const statusColors = {
      pending: { bg: '#fef3c7', text: '#b45309' },
      flagged: { bg: '#fff7ed', text: '#b45309' },
      rejected: { bg: '#fee2e2', text: '#b91c1c' },
      approved: { bg: '#dcfce7', text: '#16a34a' }
    };

    const status = (report?.status || 'pending').toLowerCase();
    const statusStyle = statusColors[status] || { bg: '#f1f5f9', text: '#64748b' };

    return (
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{report?.title || 'Untitled Report'}</h3>
            <div style={{ color: '#64748b', fontSize: '14px' }}>
              Submitted by: <span style={{ fontWeight: '500', color: '#334155' }}>{report?.student?.username || 'Unknown Student'}</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>
              {report?.student?.major && `Major: ${report.student.major}`}
            </div>
          </div>
          <div style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
            background: statusStyle.bg,
            color: statusStyle.text
          }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Content Preview:</div>
          <div style={{ color: '#334155', fontSize: '15px' }}>
            {(report?.introduction || 'No introduction provided').slice(0, 150)}
            {(report?.introduction?.length || 0) > 150 ? '...' : ''}
          </div>
        </div>

        {report?.courses?.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Courses Used:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {report.courses.slice(0, 3).map((course, idx) => (
                <span key={idx} style={{
                  background: '#f1f5f9',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  {course}
                </span>
              ))}
              {report.courses.length > 3 && (
                <span style={{
                  background: '#f1f5f9',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  +{report.courses.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#64748b', fontSize: '14px' }}>
            Submitted: {formatDate(report?.submissionDate)}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setSelectedReport(report);
                setShowReportModal(true);
              }}
              style={{
                background: '#e0e7ff',
                color: '#2563eb',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              View Report
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Faculty/SCAD View
  const FacultyView = () => (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Student Reports</h2>
        <p style={{ color: '#64748b', fontSize: '16px' }}>View and manage all submitted internship reports</p>
      </div>

      {/* Search and Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b'
          }} />
          <input
            type="text"
            placeholder="Search reports by title, content, or student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '15px'
            }}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          <Filter size={16} />
          Filters
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              <option value="all">All Reports</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="rejected">Rejected</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div>
        {getFilteredReports().length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            background: 'white',
            borderRadius: '12px',
            color: '#64748b'
          }}>
            No reports found matching your criteria.
          </div>
        ) : (
          getFilteredReports().map((report) => (
            <ReportCard key={report.id} report={report} />
          ))
        )}
      </div>
    </div>
  );

  // Only show content if user is logged in
  if (!currentUser) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#b91c1c', fontWeight: 600 }}>Please log in to view reports.</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole={currentUser?.role?.toLowerCase() || 'student'} currentUser={currentUser} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ flex: 1, padding: '2rem 0' }}>
          {(isFaculty || isSCAD) ? (
            <FacultyView />
          ) : (
            // Original student view content
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
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
                            {/* Show clarification/reason if present, else default message */}
                            <div style={{ background: '#fffbe6', borderRadius: 6, padding: '8px 12px', color: '#b45309', margin: '8px 0' }}>
                              <b>Reason:</b> {report.clarification || 'Please contact your supervisor for more details.'}
                              <div style={{ fontSize: 13, color: '#b45309', marginTop: 2 }}>By: {report.clarifiedBy || 'System'} on {formatDate(report.clarificationDate) || formatDate(report.submissionDate)}</div>
                            </div>
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
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          report={selectedReport}
          onClose={() => {
            setShowReportModal(false);
            setSelectedReport(null);
          }}
        />
      )}

      {/* Clarification Modal */}
      <ClarificationModal />
    </div>
  );
};

export default StudentReports;
