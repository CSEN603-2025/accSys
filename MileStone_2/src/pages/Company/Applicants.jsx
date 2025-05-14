import React from 'react';
import { Link } from 'react-router-dom';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { ArrowLeft } from 'lucide-react';

const Applicants = ({ currentUser }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole={currentUser?.role?.toLowerCase() || 'company'} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <NavBar currentUser={currentUser} />
        
        <div style={{ padding: '2rem' }}>
          {/* Page Header */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <Link 
              to="/company" 
              style={{ 
                marginRight: '1rem', 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                color: '#1746a2'
              }}
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Applicants</h1>
          </div>

          {/* Empty State */}
          <div style={{ 
            background: '#fff', 
            borderRadius: '12px', 
            padding: '3rem', 
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#334155'
            }}>
              No applicants yet
            </div>
            <p style={{ 
              color: '#64748b', 
              marginBottom: '2rem',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Applicants to your internship postings will appear here once they start applying.
            </p>
            <Link 
              to="/internship-postings"
              style={{ 
                display: 'inline-block',
                background: '#1746a2', 
                color: 'white', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '8px', 
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '16px'
              }}
            >
              View Your Postings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applicants;