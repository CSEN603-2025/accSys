import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Settings, LogOut } from 'lucide-react';

const NavBar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Example user data
  const user = {
    name: 'Ahmed Hassan',
    role: 'Student',
    initials: 'AH',
  };

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 2rem 1.2rem 2rem', background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'relative', zIndex: 2 }}>
      {/* Left Side (empty for now) */}
      <div>
        <h1 className='text-2xl font-bold'>Internship Portal</h1>
      </div>
      {/* Right Side: Search, Notification, Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, height: 40 }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', width: 340, height: 40, display: 'flex', alignItems: 'center' }}>
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
            placeholder="Search companies or internships..."
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
              display: 'block',
            }}
          />
        </div>
        {/* Notification Bell */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span role="img" aria-label="bell" style={{ fontSize: 22, color: '#64748b', display: 'flex', alignItems: 'center', height: '100%' }}><Bell/></span>
        </button>
        {/* User Avatar with Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            ref={avatarRef}
            onClick={() => setDropdownOpen((open) => !open)}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#1746a2',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
              userSelect: 'none',
              border: dropdownOpen ? '2px solid #2563eb' : 'none',
              transition: 'border 0.15s',
            }}
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            {user.initials}
          </div>
          {dropdownOpen && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: 48,
                right: 0,
                minWidth: 220,
                background: '#fff',
                borderRadius: 10,
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                padding: '1rem 0',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
              }}
            >
              <div style={{ padding: '0 1.2rem 0.7rem 1.2rem', borderBottom: '1px solid #e2e8f0', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{user.name}</div>
                <div style={{ color: '#64748b', fontSize: 14 }}>{user.role}</div>
              </div>
              <DropdownButton icon={<User size={18} />} label="Profile" />
              <DropdownButton icon={<Settings size={18} />} label="Settings" />
              <DropdownButton icon={<LogOut size={18} />} label="Log Out" last />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const DropdownButton = ({ icon, label, last }) => (
  <button
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      padding: '10px 1.2rem',
      background: 'none',
      border: 'none',
      color: '#334155',
      fontSize: 15,
      cursor: 'pointer',
      borderBottom: last ? 'none' : '1px solid #f1f5f9',
      transition: 'background 0.15s',
    }}
    onMouseDown={e => e.preventDefault()}
  >
    {icon}
    {label}
  </button>
);

export default NavBar;
