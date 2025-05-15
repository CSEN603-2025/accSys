import React, { useState } from 'react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { mockUsers } from '../../DummyData/mockUsers';
import { Search, Filter, ChevronDown, Star } from 'lucide-react';

const FacultyEvaluations = ({ currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  // Get all student evaluations
  const getAllEvaluations = () => {
    return mockUsers
      .filter(user => user.role === 'student')
      .flatMap(student => 
        (student.evaluations || []).map(evaluation => ({
          ...evaluation,
          student: {
            id: student.id,
            username: student.username,
            email: student.email,
            major: student.major
          }
        }))
      );
  };

  // Filter evaluations based on search and status
  const getFilteredEvaluations = () => {
    let filtered = getAllEvaluations();

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(evaluation => 
        evaluation.student?.username.toLowerCase().includes(query) ||
        evaluation.student?.email.toLowerCase().includes(query) ||
        evaluation.student?.major?.toLowerCase().includes(query) ||
        evaluation.feedback?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(evaluation => evaluation.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return new Date(date).toLocaleDateString();
  };

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

  // Evaluation Card Component
  const EvaluationCard = ({ evaluation }) => {
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
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              {evaluation.internship?.title || 'Untitled Internship'}
            </h3>
            <div style={{ color: '#64748b', fontSize: '14px' }}>
              Student: <span style={{ fontWeight: '500', color: '#334155' }}>{evaluation.student?.username || 'Unknown Student'}</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>
              {evaluation.student?.major && `Major: ${evaluation.student.major}`}
            </div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>
              Company: <span style={{ fontWeight: '500', color: '#334155' }}>{evaluation.internship?.company?.companyName || 'Unknown Company'}</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>
              Supervisor: <span style={{ fontWeight: '500', color: '#334155' }}>{evaluation.internship?.supervisor || 'Not specified'}</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>
              Duration: {formatDate(evaluation.internship?.startDate)} - {formatDate(evaluation.internship?.endDate)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {renderStars(evaluation.rating || 0)}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Feedback:</div>
          <div style={{ color: '#334155', fontSize: '15px' }}>
            {evaluation.feedback || 'No feedback provided'}
          </div>
        </div>

        {evaluation.recommend && (
          <div style={{ 
            background: '#dcfce7', 
            color: '#16a34a', 
            padding: '8px 12px', 
            borderRadius: '6px', 
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '16px'
          }}>
            <span>✓</span> Recommended to other students
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#64748b', fontSize: '14px' }}>
            Submitted: {formatDate(evaluation.createdAt)}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setSelectedEvaluation(evaluation);
                setShowEvaluationModal(true);
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
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Evaluation Modal Component
  const EvaluationModal = ({ evaluation, onClose }) => {
    if (!evaluation) return null;

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
            ×
          </button>

          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
            Evaluation Details
          </h2>

          {/* Student Information Section */}
          <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>Student Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Name</div>
                <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '500' }}>{evaluation.student?.username || 'Unknown Student'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Major</div>
                <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '500' }}>{evaluation.student?.major || 'Not specified'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Email</div>
                <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '500' }}>{evaluation.student?.email || 'Not specified'}</div>
              </div>
            </div>
          </div>

          {/* Internship Information Section */}
          <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>Internship Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Position</div>
                <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '500' }}>{evaluation.internship?.title || 'Not specified'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Company</div>
                <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '500' }}>{evaluation.internship?.company?.companyName || 'Not specified'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Supervisor</div>
                <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '500' }}>{evaluation.internship?.supervisor || 'Not specified'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>Duration</div>
                <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '500' }}>
                  {formatDate(evaluation.internship?.startDate)} - {formatDate(evaluation.internship?.endDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Evaluation Details Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>Evaluation Details</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Overall Rating</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                {renderStars(evaluation.rating || 0)}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Feedback</div>
              <div style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#334155',
                whiteSpace: 'pre-wrap'
              }}>
                {evaluation.feedback || 'No feedback provided'}
              </div>
            </div>

            {evaluation.recommend && (
              <div style={{
                background: '#dcfce7',
                color: '#16a34a',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>✓</span> Student recommends this company to other students
              </div>
            )}

            <div style={{ color: '#64748b', fontSize: '14px', marginTop: '16px' }}>
              Submitted on: {formatDate(evaluation.createdAt)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole={currentUser?.role?.toLowerCase() || 'faculty'} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ flex: 1, padding: '2rem 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Student Evaluations</h2>
              <p style={{ color: '#64748b', fontSize: '16px' }}>View and manage student internship evaluations</p>
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
                  placeholder="Search evaluations by student name, major, or feedback..."
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
                    <option value="all">All Evaluations</option>
                    <option value="recommended">Recommended</option>
                    <option value="not_recommended">Not Recommended</option>
                  </select>
                </div>
              </div>
            )}

            {/* Evaluations List */}
            <div>
              {getFilteredEvaluations().length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px',
                  background: 'white',
                  borderRadius: '12px',
                  color: '#64748b'
                }}>
                  No evaluations found matching your criteria.
                </div>
              ) : (
                getFilteredEvaluations().map((evaluation) => (
                  <EvaluationCard key={evaluation.id} evaluation={evaluation} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation Modal */}
      {showEvaluationModal && (
        <EvaluationModal
          evaluation={selectedEvaluation}
          onClose={() => {
            setShowEvaluationModal(false);
            setSelectedEvaluation(null);
          }}
        />
      )}
    </div>
  );
};

export default FacultyEvaluations; 