import React from 'react';
import { Plus, Search } from 'lucide-react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';

const InternEvaluations = ({ currentUser }) => {
  const handleSubmitInternshipEvaluation = () => {
    // Add your evaluation submission logic here
    console.log('Submitting internship evaluation');
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
                  style={{
                    width: '100%',
                    height: 40,
                    padding: '8px 14px 8px 38px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#f1f5f9',
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* New Evaluation Button */}
              <button 
                onClick={handleSubmitInternshipEvaluation}
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

          {/* Empty state */}
          <div style={{ 
            background: '#fff', 
            borderRadius: 12, 
            boxShadow: '0 1px 4px #e2e8f0', 
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px'
          }}>
            <div style={{ color: '#64748b', fontSize: 16 }}>
              No evaluations to display yet
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternEvaluations;