import React, { useState } from 'react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { mockUsers } from '../../DummyData/mockUsers';

const StudentEvaluations = ({ currentUser }) => {
  // --- My Evaluations logic (copied from StudentInternships evaluation modal) ---
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [evaluationForm, setEvaluationForm] = useState({ feedback: '', recommend: false });
  const [evaluations, setEvaluations] = useState(currentUser?.evaluations || []);
  const [editingEvaluationId, setEditingEvaluationId] = useState(null);
  const [evaluationError, setEvaluationError] = useState('');

  // For demo: Assume currentUser has a list of internships
  const internships = [
    ...(currentUser?.currentInternship ? [currentUser.currentInternship] : []),
    ...(currentUser?.pastInternships || [])
  ];
  const [selectedInternship, setSelectedInternship] = useState(null);

  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return new Date(date).toLocaleDateString();
  };

  const getEvaluationsForInternship = (internshipId) =>
    evaluations.filter(evaluation => evaluation.internship?.id === internshipId);

  const handleOpenEvaluationForm = (internship) => {
    setSelectedInternship(internship);
    setShowEvaluationForm(true);
    const existingEvaluation = evaluations.find(e => e.internship?.id === internship.id);
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
  };

  const handleEvaluationFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEvaluationForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEvaluationSubmit = (e) => {
    e.preventDefault();
    const existingEvaluation = evaluations.find(e => e.internship?.id === selectedInternship.id);
    if (!editingEvaluationId && existingEvaluation) {
      setEvaluationError('You can only submit one evaluation per internship. Please edit or delete your existing evaluation.');
      return;
    }
    setEvaluationError('');
    if (editingEvaluationId) {
      // Update existing evaluation
      const updatedEvaluation = {
        id: editingEvaluationId,
        internship: selectedInternship,
        feedback: evaluationForm.feedback,
        recommend: evaluationForm.recommend,
        createdAt: evaluations.find(e => e.id === editingEvaluationId)?.createdAt || new Date(),
        updatedAt: new Date()
      };
      setEvaluations(prev => prev.map(evaluation => evaluation.id === editingEvaluationId ? updatedEvaluation : evaluation));
      const userEvaluationIndex = currentUser.evaluations.findIndex(e => e.id === editingEvaluationId);
      if (userEvaluationIndex !== -1) {
        currentUser.evaluations[userEvaluationIndex] = updatedEvaluation;
      }
      // Persist in mockUsers
      const studentInMock = (window.mockUsers || mockUsers).find(u => u.id === currentUser.id);
      if (studentInMock) {
        studentInMock.updateEvaluation(updatedEvaluation);
      }
    } else {
      // Add new evaluation
      const newEvaluation = {
        id: Date.now(),
        internship: selectedInternship,
        feedback: evaluationForm.feedback,
        recommend: evaluationForm.recommend,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setEvaluations(prev => [...prev, newEvaluation]);
      currentUser.submitEvaluation?.(newEvaluation);
      // Persist in mockUsers
      const studentInMock = (window.mockUsers || mockUsers).find(u => u.id === currentUser.id);
      if (studentInMock) {
        studentInMock.addEvaluation(newEvaluation);
      }
    }
    setEvaluationForm({ feedback: '', recommend: false });
    setEditingEvaluationId(null);
    setShowEvaluationForm(false);
    setSelectedInternship(null);
  };

  const handleEditEvaluation = (evaluation) => {
    setSelectedInternship(evaluation.internship);
    setEvaluationForm({
      feedback: evaluation.feedback,
      recommend: evaluation.recommend
    });
    setEditingEvaluationId(evaluation.id);
    setShowEvaluationForm(true);
    setEvaluationError('');
  };

  const handleDeleteEvaluation = (evaluationId) => {
    setEvaluations(prev => prev.filter(evaluation => evaluation.id !== evaluationId));
    currentUser.evaluations = currentUser.evaluations.filter(e => e.id !== evaluationId);
    // Persist in mockUsers
    const studentInMock = (window.mockUsers || mockUsers).find(u => u.id === currentUser.id);
    if (studentInMock && Array.isArray(studentInMock.evaluations)) {
      studentInMock.evaluations = studentInMock.evaluations.filter(e => e.id !== evaluationId);
    }
    if (editingEvaluationId === evaluationId) {
      setEditingEvaluationId(null);
      setEvaluationForm({ feedback: '', recommend: false });
      setEvaluationError('');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole="student" currentUser={currentUser} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ maxWidth: 1100, margin: '2rem auto', padding: 0 }}>
          {/* Section 1: My Performance Evaluations */}
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>Performance Evaluations</h2>
          <div style={{ color: '#64748b', marginBottom: 32 }}>View your internship performance evaluations</div>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '2rem', marginBottom: 32 }}>
            <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>My Performance Evaluations</h3>
            {/* Placeholder for company evaluations */}
            <div style={{ color: '#64748b', fontStyle: 'italic' }}>[Company evaluations will appear here]</div>
          </div>

          {/* Section 2: My Evaluations */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '2rem', marginBottom: 32 }}>
            <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>My Evaluations</h3>
            {/* Internship selection and add evaluation button */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 500 }}>Select Internship</label>
              <select
                value={selectedInternship?.id || ''}
                onChange={(e) => {
                  const internship = internships.find((i) => i.id === Number(e.target.value));
                  setSelectedInternship(internship);
                  if (internship) {
                    const existingEvaluation = evaluations.find(e => e.internship?.id === internship.id);
                    if (existingEvaluation) {
                      setEvaluationForm({
                        feedback: existingEvaluation.feedback,
                        recommend: existingEvaluation.recommend
                      });
                      setEditingEvaluationId(existingEvaluation.id);
                    } else {
                      setEvaluationForm({ feedback: '', recommend: false });
                      setEditingEvaluationId(null);
                    }
                    setShowEvaluationForm(true);
                  } else {
                    setShowEvaluationForm(false);
                    setEditingEvaluationId(null);
                    setEvaluationForm({ feedback: '', recommend: false });
                  }
                  setEvaluationError('');
                }}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 8 }}
              >
                <option value="">Choose internship...</option>
                {internships.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title} @ {i.company?.companyName || i.company?.username || 'Company'}
                  </option>
                ))}
              </select>
            </div>
            {/* Evaluation Form */}
            {showEvaluationForm && selectedInternship && (
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24 }}>
                {/* LEFT: Evaluation Form */}
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
                          onClick={() => { setEditingEvaluationId(null); setEvaluationForm({ feedback: '', recommend: false }); setEvaluationError(''); setShowEvaluationForm(false); setSelectedInternship(null); }}
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
                {/* RIGHT: Previous Evaluation */}
                <div style={{ flex: 1, minWidth: 320 }}>
                  <h4 style={{ fontWeight: 600, fontSize: 17, marginBottom: 10 }}>Previous Evaluation</h4>
                  {getEvaluationsForInternship(selectedInternship.id).length === 0 ? (
                    <div style={{ color: '#64748b' }}>No evaluations submitted yet.</div>
                  ) : (
                    getEvaluationsForInternship(selectedInternship.id).slice(0, 1).map((evaluation) => (
                      <div key={evaluation.id} style={{ background: '#f1f5f9', borderRadius: 8, padding: '1rem', marginBottom: 12 }}>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentEvaluations;
