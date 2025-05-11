import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPageTitle } from '../pages/PageTitle';

const NavBar = ({ currentUser, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  // Default to 'student' if userRole is not set
  const userRole = (currentUser?.role ? currentUser.role.toLowerCase() : 'student');
  const pageTitle = getPageTitle(location.pathname, userRole);

  const unreadCount = currentUser?.notifications?.filter(n => !n.read).length || 0;

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
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target) &&
        !event.target.closest('.notification-bell')
      ) {
        setNotificationsOpen(false);
      }
    }
    if (dropdownOpen || notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, notificationsOpen]);

  const handleMarkAllAsRead = () => {
    if (currentUser) {
      currentUser.markAllAsRead();
      // Force re-render by updating state
      setNotificationsOpen(false);
      setTimeout(() => setNotificationsOpen(true), 0);
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
    setDropdownOpen(false);
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Just now';
    
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    return 'Just now';
  };

  const getUserInitials = () => {
    if (!currentUser) return 'U';
    
    // For company users, use company name
    if (currentUser.role === 'company' && currentUser.companyName) {
      const words = currentUser.companyName.split(' ').filter(word => word.length > 0);
      if (words.length === 0) return 'C';
      return words.map(word => word[0]).join('').toUpperCase().substring(0, 2);
    }
    
    // For other users, use username
    const words = currentUser.username.split(' ').filter(word => word.length > 0);
    if (words.length === 0) return 'U';
    return words.map(word => word[0]).join('').toUpperCase().substring(0, 2);
  };

  const getDisplayName = () => {
    if (!currentUser) return 'User';
    
    // For company users, show company name
    if (currentUser.role === 'company' && currentUser.companyName) {
      return currentUser.companyName;
    }
    
    // For other users, show username
    return currentUser.username || 'User';
  };

  const getRoleDisplay = () => {
    if (!currentUser?.role) return 'User';
    const role = currentUser.role.toLowerCase();
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleProfileClick = () => {
    if (userRole === 'student') {
      navigate('/student/profile');
    } else if (userRole === 'faculty') {
      navigate('/faculty/profile');
    } else if (userRole === 'company') {
      navigate('/company/profile');
    } else if (userRole === 'scad') {
      navigate('/scad/profile');
    }
    setDropdownOpen(false);
  };

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 2rem 1.2rem 2rem', background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'relative', zIndex: 2 }}>
      {/* Left Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <h1 className='text-2xl font-bold'>
          {pageTitle || 'Internship Portal'}
        </h1>
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
        <div style={{ position: 'relative' }}>
          <button 
            className="notification-bell"
            onClick={() => setNotificationsOpen(open => !open)}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              position: 'relative', 
              height: 40, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <span role="img" aria-label="bell" style={{ fontSize: 22, color: '#64748b', display: 'flex', alignItems: 'center', height: '100%' }}>
              <Bell />
            </span>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: 18,
                height: 18,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                transform: 'translate(25%, -25%)',
              }}>
                {unreadCount}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <div
              ref={notificationsRef}
              style={{
                position: 'absolute',
                top: 48,
                right: 0,
                width: 320,
                background: '#fff',
                borderRadius: 10,
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                padding: '0.5rem 0',
                zIndex: 10,
              }}
            >
              <div style={{ 
                padding: '0.75rem 1rem', 
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>Notifications</div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: 13,
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 4,
                    }}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              {currentUser?.notifications?.length > 0 ? (
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {currentUser.notifications.map((notification, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #f1f5f9',
                        background: notification.read ? 'transparent' : '#f8fafc',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 14, marginBottom: 4 }}>{notification.message}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{formatTimeAgo(notification.date)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
                  No notifications
                </div>
              )}
            </div>
          )}
        </div>
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
            {getUserInitials()}
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
                <div style={{ fontWeight: 600, fontSize: 16 }}>{getDisplayName()}</div>
                <div style={{ color: '#64748b', fontSize: 14 }}>{getRoleDisplay()}</div>
              </div>
              <DropdownButton icon={<User size={18} />} label="Profile" onClick={handleProfileClick} />
              <DropdownButton onClick={handleLogout} icon={<LogOut size={18} />} label="Log Out" last />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const DropdownButton = ({ icon, label, last, onClick }) => (
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
    onClick={onClick}
    onMouseDown={e => e.preventDefault()}
    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
    onMouseLeave={e => e.currentTarget.style.background = 'none'}
  >
    {icon}
    {label}
  </button>
);

export default NavBar;
