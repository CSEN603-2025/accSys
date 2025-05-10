import React from 'react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import {House, FileText, Edit, Star} from 'lucide-react';

const studentLinks = [
  { icon: <House/> , label: 'Dashboard', active: true },
  { icon: <FileText/>, label: 'Applications' },
  { icon: <Edit/>, label: 'Reports' },
  { icon: <Star/>, label: 'Evaluation' },
];

// Example: You could define other roles like this
// const scadLinks = [...];
// const facultyLinks = [...];
// const companyLinks = [...];

const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 4px #e2e8f0',
  padding: '1.5rem 2rem',
  flex: 1,
  minWidth: 180,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const quickCardStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 4px #e2e8f0',
  padding: '1.5rem',
  flex: 1,
  minWidth: 180,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 8,
};

const quickButtonStyle = {
  background: '#f1f5f9',
  border: 'none',
  borderRadius: 8,
  padding: '8px 18px',
  fontWeight: 500,
  cursor: 'pointer',
};

const StudentDashboard = () => {
  return (
    <div className="dashboard-root" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <SideBar links={studentLinks} />
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Navbar */}
        <NavBar />
        {/* Dashboard Content */}
        <div className="dashboard-content" style={{ padding: '2rem', flex: 1 }}>
          {/* Welcome Message */}
          <h2 style={{ fontWeight: 700 }}>Welcome back, Ahmed Hassan!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Here's an overview of your internship activities.</p>

          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
            <SummaryCard title="Applications" value={2} desc="Total internship applications" />
            <SummaryCard title="Pending" value={1} desc="Awaiting approval" />
            <SummaryCard title="Active" value={0} desc="Currently active internships" />
            <SummaryCard title="Reports" value={1} desc="Submitted reports" />
          </div>

          {/* Recent Application Section */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ fontWeight: 600, fontSize: 22 }}>Recent Application</div>
            <div style={{ color: '#64748b', fontSize: 14, marginBottom: 12 }}>Your most recent internship application</div>
            <div style={{ fontWeight: 500, fontSize: 18 }}>Web Development Intern</div>
            <div style={{ color: '#64748b', fontSize: 15 }}>MediaMinds</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <span style={{ background: '#fef3c7', color: '#b45309', borderRadius: 8, padding: '2px 10px', fontSize: 13 }}>Pending</span>
              <span style={{ color: '#64748b', fontSize: 13 }}>Applied on 3/1/2024</span>
            </div>
            <button style={{ marginTop: 16, padding: '6px 18px', borderRadius: 8, background: '#f1f5f9', border: 'none', fontWeight: 500, cursor: 'pointer' }}>View Details</button>
          </div>

          {/* Quick Access Cards */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <QuickCard title="Applications" desc="View and manage your internship applications" btn="View Applications" />
            <QuickCard title="Reports" desc="Submit and view your internship reports" btn="Manage Reports" />
            <QuickCard title="Evaluation" desc="View your performance evaluations" btn="View Evaluations" />
          </div>
        </div>
        {/* New Application Button */}
        <button style={{ position: 'absolute', top: 32, right: 48, background: '#1746a2', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
          New Application
        </button>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, desc }) => (
  <div style={cardStyle}>
    <div>{title}</div>
    <div style={{ fontSize: 28, fontWeight: 600 }}>{value}</div>
    <div style={{ color: '#64748b', fontSize: 14 }}>{desc}</div>
  </div>
);

const QuickCard = ({ title, desc, btn }) => (
  <div style={quickCardStyle}>
    <div style={{ fontWeight: 600 }}>{title}</div>
    <div style={{ color: '#64748b', fontSize: 14, marginBottom: 12 }}>{desc}</div>
    <button style={quickButtonStyle}>{btn}</button>
  </div>
);

export default StudentDashboard;
