import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/GucLogo.png'; // Adjust the path to your logo image
import { House, FileText, Edit, Star, Building2, BriefcaseBusiness, Users, Building, ClipboardList, Settings, Award } from 'lucide-react';

// Role-specific navigation links with their corresponding paths
const roleLinks = {
  student: [
    { icon: <House />, label: 'Dashboard', path: '/student' },
    { icon: <Building2 />, label: 'Companies', path: '/companies' },
    { icon: <BriefcaseBusiness />, label: 'Internships', path: '/internships' },
    { icon: <FileText />, label: 'Applications', path: '/applications' },
    { icon: <Edit />, label: 'Reports', path: '/student/reports' },
    { icon: <Star />, label: 'Evaluation', path: '/student/evaluation' },
  ],
  faculty: [
    { icon: <House />, label: 'Dashboard', path: '/faculty' },
    { icon: <Users />, label: 'Students', path: '/faculty/students' },
    { icon: <Building2 />, label: 'Companies', path: '/companies' },
    { icon: <BriefcaseBusiness />, label: 'Internships', path: '/internships' },
    { icon: <FileText />, label: 'Applications', path: '/faculty/applications' },
    { icon: <Edit />, label: 'Reports', path: '/faculty/reports' },
    { icon: <Star />, label: 'Evaluations', path: '/faculty/evaluations' },
  ],
  company: [
    { icon: <House />, label: 'Dashboard', path: '/company' },
    { icon: <BriefcaseBusiness />, label: 'Internships', path: '/internships' },
    { icon: <FileText />, label: 'Postings', path: '/company/postings' },
    { icon: <Users />, label: 'Applicants', path: '/company/applicants' },
    { icon: <Star />, label: 'Evaluations', path: '/intern-evaluations' },
  ],
  scad: [
    { icon: <House />, label: 'Dashboard', path: '/scad' },
    { icon: <Users />, label: 'Students', path: '/scad/students' },
    { icon: <Building2 />, label: 'Companies', path: '/companies' },
    { icon: <Building />, label: 'Companies (Admin)', path: '/scad/companies' },
    { icon: <BriefcaseBusiness />, label: 'Internships', path: '/internships' },
    { icon: <ClipboardList />, label: 'Applications', path: '/scad/applications' },
    { icon: <Award />, label: 'Evaluations', path: '/scad/evaluations' },
    { icon: <Settings />, label: 'Settings', path: '/scad/settings' },
  ],
};

const SideBar = ({ userRole }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const links = roleLinks[userRole] || roleLinks.student;

  const handleNavigation = (path) => {
    // If we're already on the dashboard path, don't navigate
    if (location.pathname === path) {
      return;
    }
    
    // For dashboard navigation, ensure we go to the role-specific path
    if (path === `/${userRole}`) {
      navigate(path);
      return;
    }

    // For other paths, navigate normally
    navigate(path);
  };

  const isActive = (path) => {
    // For dashboard, check if we're at the root path for the role
    if (path === `/${userRole}`) {
      return location.pathname === path || location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <aside
      style={{
        width: collapsed ? 70 : 220,
        background: '#1746a2',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative',
        transition: 'width 0.2s',
        alignItems: collapsed ? 'center' : 'flex-start',
      }}
    >
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
          alignSelf: collapsed ? 'center' : 'flex-start',
        }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '»' : '«'}
      </button>
      {/* Logo and GUC Text */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          width: '100%',
          padding: collapsed ? '0 0 1.5rem 0' : '0 1.5rem 1.5rem 1.5rem',
          minHeight: 40,
        }}
      >
        <img src={logo} alt="GUC Logo" style={{ width: 32, height: 32, display: 'block', marginRight: collapsed ? 0 : 10, marginLeft: collapsed ? 0 : 0 }} />
        {!collapsed && (
          <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>GUC</span>
        )}
      </div>
      {/* Navigation */}
      <nav style={{ flex: 1, width: '100%' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {links.map((link) => (
            <SideBarLink
              key={link.label}
              icon={link.icon}
              label={link.label}
              path={link.path}
              isActive={isActive(link.path)}
              collapsed={collapsed}
              onClick={() => handleNavigation(link.path)}
            />
          ))}
        </ul>
      </nav>
      {/* Copyright */}
      {!collapsed && (
        <div style={{ fontSize: 13, color: '#cbd5e1', padding: '1.5rem', position: 'absolute', bottom: 0, width: '100%' }}>
          © 2025 GUC
        </div>
      )}
    </aside>
  );
};

SideBar.propTypes = {
  userRole: PropTypes.oneOf(['student', 'faculty', 'company', 'scad']).isRequired,
};

const SideBarLink = ({ icon, label, path, isActive, collapsed, onClick }) => (
  <li style={{ marginBottom: 6, display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start' }}>
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : 12,
        padding: collapsed ? '12px 0' : '12px 24px',
        borderRadius: 8,
        background: isActive ? '#0b2e59' : 'transparent',
        color: '#fff',
        fontWeight: isActive ? 600 : 500,
        textDecoration: 'none',
        fontSize: 16,
        justifyContent: collapsed ? 'center' : 'flex-start',
        width: '100%',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
          background: isActive ? '#0b2e59' : 'rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {!collapsed && label}
    </button>
  </li>
);

export default SideBar;
