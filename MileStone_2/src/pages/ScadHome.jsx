import React from 'react';
import SideBar from '../Components/SideBar';
import NavBar from '../Components/NavBar';

const ScadHome = ({ currentUser }) => {
  return (
    <div className="dashboard-root" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <SideBar userRole="scad" />
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Navbar */}
        <NavBar currentUser={currentUser} />
        {/* Dashboard Content */}
        <div className="dashboard-content" style={{ padding: '2rem', flex: 1 }}>
          <h1 style={{ fontWeight: 700 }}>Welcome {currentUser?.username}! 👨‍💼</h1>
        </div>
      </div>
    </div>
  );
};

export default ScadHome;
