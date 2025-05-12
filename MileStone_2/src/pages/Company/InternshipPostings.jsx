// InternshipPostings.js
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const InternshipPostings = ({ postings }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar would be here */}
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Navbar would be here */}
        
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <Link to="/company-dashboard" style={{ marginRight: '1rem', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={20} />
            </Link>
            <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Internship Postings</h1>
          </div>

          {postings.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {postings.map(posting => (
                <div key={posting.id} style={{ 
                  background: '#fff', 
                  borderRadius: '12px', 
                  padding: '1.5rem', 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '0.5rem' }}>
                    {posting.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ 
                      background: posting.type === 'paid' ? '#dcfce7' : '#fef3c7',
                      color: posting.type === 'paid' ? '#166534' : '#b45309',
                      borderRadius: '4px', 
                      padding: '0.25rem 0.5rem', 
                      fontSize: '14px'
                    }}>
                      {posting.type.charAt(0).toUpperCase() + posting.type.slice(1)}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                      {posting.duration}
                    </span>
                  </div>
                  <div style={{ color: '#64748b', marginBottom: '0.5rem' }}>
                    {posting.location}
                  </div>
                  <p style={{ 
                    color: '#334155', 
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {posting.description}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    fontSize: '14px',
                    color: '#64748b'
                  }}>
                    <span>Posted: {posting.date}</span>
                    <span>By: {posting.company}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              background: '#fff', 
              borderRadius: '12px', 
              padding: '2rem', 
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                No internship postings found.
              </p>
              <Link 
                to="/company-dashboard"
                style={{ 
                  display: 'inline-block',
                  background: '#1746a2', 
                  color: 'white', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '6px', 
                  textDecoration: 'none'
                }}
              >
                Create New Posting
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternshipPostings;