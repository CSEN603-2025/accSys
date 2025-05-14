import React, { useState } from 'react';
import { Plus, Search, X, Star } from 'lucide-react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { mockUsers } from '../../DummyData/mockUsers';

const InternEvaluations = ({ currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [newEvaluation, setNewEvaluation] = useState({
    internId: '',
    internName: '',
    overallRating: '',
    technicalSkills: '',
    softSkills: '',
    performanceAssessment: '',
    skillsAssessment: '',
    additionalComments: ''
  });

  // Filter interns from mockUsers that belong to the current company
  const companyInterns = mockUsers.filter(user => 
    user.role?.toLowerCase() === 'student' && 
    user.currentInternship &&
    user.currentInternship.company.id === currentUser.id
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updateFunction = selectedEvaluation ? setSelectedEvaluation : setNewEvaluation;
    
    updateFunction(prev => {
      if (name === 'internId') {
        const selectedIntern = companyInterns.find(intern => intern.id.toString() === value);
        return {
          ...prev,
          internId: value,
          internName: selectedIntern ? selectedIntern.username : ''
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleSubmitEvaluation = (e) => {
    e.preventDefault();
    const evaluation = {
      ...newEvaluation,
      id: Date.now(),
      submittedOn: new Date().toLocaleDateString()
    };
    setEvaluations(prev => [evaluation, ...prev]);
    setNewEvaluation({
      internId: '',
      internName: '',
      overallRating: '',
      technicalSkills: '',
      softSkills: '',
      performanceAssessment: '',
      skillsAssessment: '',
      additionalComments: ''
    });
    setShowModal(false);
  };

  const handleEditClick = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setEvaluations(prev => 
      prev.map(evaluation => 
        evaluation.id === selectedEvaluation.id ? selectedEvaluation : evaluation
      )
    );
    setSelectedEvaluation(null);
    setShowEditModal(false);
  };

  const handleDeleteEvaluation = (evaluationId) => {
    if (window.confirm('Are you sure you want to delete this evaluation?')) {
      setEvaluations(prev => prev.filter(evaluation => evaluation.id !== evaluationId));
    }
  };

  const filteredEvaluations = evaluations.filter(evaluation => 
    evaluation.internName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        fill={index < rating ? "#fbbf24" : "none"}
        stroke={index < rating ? "#fbbf24" : "#94a3b8"}
      />
    ));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole={currentUser?.role?.toLowerCase() || 'company'} activeSection="evaluations" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <NavBar currentUser={currentUser} />

        <div style={{ padding: '2rem', flex: 1 }}>
          {/* Header row with title, search, and button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 32
          }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>
                Intern Evaluations
              </h2>
              <div style={{ color: '#64748b' }}>
                Manage and submit performance evaluations for your interns
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', width: 250, height: 40 }}>
                <span style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a0aec0',
                  fontSize: 18,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                }}>
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Search evaluations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '8px 14px 8px 38px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f1f5f9',
                    fontSize: '15px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* New Evaluation Button */}
              <button
                onClick={() => setShowModal(true)}
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
                  height: 40,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#0b2e59'}
                onMouseLeave={(e) => e.target.style.background = '#1746a2'}
              >
                <Plus size={20} />
                New Evaluation
              </button>
            </div>
          </div>

          {/* Evaluations Grid */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            padding: '1rem 0',
            width: '100%'
          }}>
            {filteredEvaluations.length === 0 ? (
              <div style={{
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 1px 4px #e2e8f0',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px',
                width: '100%'
              }}>
                <div style={{ color: '#64748b', fontSize: 16 }}>
                  No evaluations to display yet
                </div>
              </div>
            ) : (
              filteredEvaluations.map(evaluation => (
                <div key={evaluation.id} style={{
                  background: '#fff',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  width: '100%'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: 22, fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{evaluation.internName}</h3>
                      <div style={{ color: '#64748b', fontSize: 16 }}>
                        {companyInterns.find(intern => intern.id.toString() === evaluation.internId)?.currentInternship?.title || 'Former Intern'}
                      </div>
                      <div style={{ color: '#64748b', fontSize: 16, marginTop: '4px' }}>Submitted on {evaluation.submittedOn}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {renderStars(parseInt(evaluation.overallRating))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Technical Skills</div>
                      <div style={{ fontSize: 16, color: '#64748b' }}>Rating: {evaluation.technicalSkills}/5</div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Soft Skills</div>
                      <div style={{ fontSize: 16, color: '#64748b' }}>Rating: {evaluation.softSkills}/5</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Comments</div>
                    <div style={{ fontSize: 16, color: '#64748b', lineHeight: '1.6' }}>{evaluation.performanceAssessment}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '12px' }}>
                    <button
                      onClick={() => handleDeleteEvaluation(evaluation.id)}
                      style={{
                        background: 'none',
                        border: '1px solid #dc2626',
                        color: '#dc2626',
                        fontSize: 16,
                        cursor: 'pointer',
                        padding: '8px 24px',
                        borderRadius: 6,
                        fontWeight: 500,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#dc2626';
                        e.target.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'none';
                        e.target.style.color = '#dc2626';
                      }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleEditClick(evaluation)}
                      style={{
                        background: 'none',
                        border: '1px solid #1746a2',
                        color: '#1746a2',
                        fontSize: 16,
                        cursor: 'pointer',
                        padding: '8px 24px',
                        borderRadius: 6,
                        fontWeight: 500,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#1746a2';
                        e.target.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'none';
                        e.target.style.color = '#1746a2';
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Evaluation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '2rem',
            width: '90%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <X size={24} color="#64748b" />
            </button>

            <h2 style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>Submit Intern Evaluation</h2>

            <form onSubmit={handleSubmitEvaluation}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Select Intern</label>
                <select
                  name="internId"
                  value={newEvaluation.internId}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: '15px',
                    color: '#1e293b'
                  }}
                  required
                >
                  <option value="">Select an intern</option>
                  {companyInterns.map(intern => (
                    <option key={intern.id} value={intern.id}>
                      {intern.username} - {intern.currentInternship?.title || 'Current Intern'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Overall Rating</label>
                <select
                  name="overallRating"
                  value={newEvaluation.overallRating}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0'
                  }}
                  required
                >
                  <option value="">Select a rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Below Average</option>
                  <option value="3">3 - Average</option>
                  <option value="4">4 - Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Technical Skills Rating</label>
                <input
                  type="number"
                  name="technicalSkills"
                  min="1"
                  max="5"
                  value={newEvaluation.technicalSkills}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Soft Skills Rating</label>
                <input
                  type="number"
                  name="softSkills"
                  min="1"
                  max="5"
                  value={newEvaluation.softSkills}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Performance Assessment</label>
                <textarea
                  name="performanceAssessment"
                  value={newEvaluation.performanceAssessment}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    minHeight: 100,
                    resize: 'vertical'
                  }}
                  required
                  placeholder="Evaluate the intern's overall performance and achievements"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Skills Assessment</label>
                <textarea
                  name="skillsAssessment"
                  value={newEvaluation.skillsAssessment}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    minHeight: 100,
                    resize: 'vertical'
                  }}
                  required
                  placeholder="Evaluate the technical and soft skills demonstrated"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Additional Comments</label>
                <textarea
                  name="additionalComments"
                  value={newEvaluation.additionalComments}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    minHeight: 100,
                    resize: 'vertical'
                  }}
                  placeholder="Provide any additional feedback, suggestions, or comments"
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#1746a2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontWeight: 600,
                  width: '100%',
                  cursor: 'pointer'
                }}
              >
                Submit Evaluation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Evaluation Modal */}
      {showEditModal && selectedEvaluation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '2rem',
            width: '90%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedEvaluation(null);
              }}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <X size={24} color="#64748b" />
            </button>

            <h2 style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>Edit Evaluation</h2>

            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Select Intern</label>
                <select
                  name="internId"
                  value={selectedEvaluation.internId}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: '15px',
                    color: '#1e293b'
                  }}
                  required
                >
                  <option value="">Select an intern</option>
                  {companyInterns.map(intern => (
                    <option key={intern.id} value={intern.id}>
                      {intern.username} - {intern.currentInternship?.title || 'Current Intern'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Overall Rating</label>
                <select
                  name="overallRating"
                  value={selectedEvaluation.overallRating}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0'
                  }}
                  required
                >
                  <option value="">Select a rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Below Average</option>
                  <option value="3">3 - Average</option>
                  <option value="4">4 - Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Technical Skills Rating</label>
                <input
                  type="number"
                  name="technicalSkills"
                  min="1"
                  max="5"
                  value={selectedEvaluation.technicalSkills}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Soft Skills Rating</label>
                <input
                  type="number"
                  name="softSkills"
                  min="1"
                  max="5"
                  value={selectedEvaluation.softSkills}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Performance Assessment</label>
                <textarea
                  name="performanceAssessment"
                  value={selectedEvaluation.performanceAssessment}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    minHeight: 100,
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#1746a2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontWeight: 600,
                  width: '100%',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternEvaluations;