import React, { useState } from 'react';
import PropTypes from 'prop-types';
import logo from '../assets/GucLogo.png'; // Adjust the path to your logo image

const SideBar = ({ links }) => {
  const [collapsed, setCollapsed] = useState(false);

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
              active={link.active}
              collapsed={collapsed}
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
  links: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      label: PropTypes.string.isRequired,
      active: PropTypes.bool,
    })
  ).isRequired,
};

const SideBarLink = ({ icon, label, active, collapsed }) => (
  <li style={{ marginBottom: 6, display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start' }}>
    <a
      href="#"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : 12,
        padding: collapsed ? '12px 0' : '12px 24px',
        borderRadius: 8,
        background: active ? '#0b2e59' : 'transparent',
        color: '#fff',
        fontWeight: active ? 600 : 500,
        textDecoration: 'none',
        fontSize: 16,
        justifyContent: collapsed ? 'center' : 'flex-start',
        width: '100%',
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {!collapsed && label}
    </a>
  </li>
);

export default SideBar;
