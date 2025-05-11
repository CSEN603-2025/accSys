import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/GucLogo.png';
import { House, FileText, Users, Star } from 'lucide-react';

const roleLinks = {
  company: [
    { icon: <House />, label: 'Dashboard', path: '/company' },
    { icon: <Users />, label: 'Applicants', path: '/company/applicants' },
    { icon: <FileText />, label: 'Postings', path: '/company/postings' },
    { icon: <Star />, label: 'Evaluations', path: '/company/evaluations' },
  ],
  // ... other roles ...
};

const SideBar = ({ userRole = 'company', activeSection }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const links = roleLinks[userRole] || roleLinks.company;

  const handleNavigation = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const isActive = (path) => {
    // First check if this is the active section
    if (activeSection && path.includes(activeSection)) {
      return true;
    }
    // Fallback to path matching
    return location.pathname === path;
  };

  return (
    <aside style={{
      width: collapsed ? 70 : 220,
      background: '#1746a2',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'relative',
      transition: 'width 0.2s',
      alignItems: collapsed ? 'center' : 'flex-start',
    }}>
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: 20,
          cursor: 'pointer',
          margin: collapsed ? '1.2rem 0' : '1.2rem 0 1.2rem 1.5rem',
        }}
      >
        {collapsed ? '»' : '«'}
      </button>

      {/* Logo */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: collapsed ? '0 0 1.5rem 0' : '0 1.5rem 1.5rem 1.5rem',
      }}>
        <img src={logo} alt="GUC Logo" style={{ width: 32, height: 32 }} />
        {!collapsed && <span style={{ fontWeight: 700, fontSize: 22, marginLeft: 10 }}>GUC</span>}
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, width: '100%' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {links.map((link) => (
            <li key={link.label} style={{ marginBottom: 6 }}>
              <button
                onClick={() => handleNavigation(link.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: collapsed ? 0 : 12,
                  padding: collapsed ? '12px 0' : '12px 24px',
                  borderRadius: 8,
                  background: isActive(link.path) ? '#0b2e59' : 'transparent',
                  color: '#fff',
                  fontWeight: isActive(link.path) ? 600 : 500,
                  width: '100%',
                  border: 'none',
                  cursor: 'pointer',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
              >
                <span style={{ fontSize: 18 }}>{link.icon}</span>
                {!collapsed && link.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Copyright */}
      {!collapsed && (
        <div style={{ 
          fontSize: 13, 
          color: '#cbd5e1', 
          padding: '1.5rem',
          position: 'absolute',
          bottom: 0,
          width: '100%',
          textAlign: 'center'
        }}>
          © 2025 GUC
        </div>
      )}
    </aside>
  );
};

SideBar.propTypes = {
  userRole: PropTypes.oneOf(['student', 'faculty', 'company', 'scad']),
  activeSection: PropTypes.string,
};

export default SideBar;