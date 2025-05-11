import React from 'react';
import SideBar from '../Components/SideBar';
import NavBar from '../Components/NavBar';
import { Users, FileText, Star } from 'lucide-react';
import { mockUsers } from '../DummyData/mockUsers';

const CompanyHome = ({ currentUser }) => {
  // Get all students and applications
  const students = mockUsers.filter(u => u.role === 'student');
  let applications = [];
  let activeInterns = 0;
  let completedInternships = 0;
  let pendingApplications = 0;

  students.forEach(student => {
    (student.applications || []).forEach(app => {
      if (app.internship.company.id === currentUser.id) {
        applications.push({
          student: student.username,
          position: app.internship.title,
          date: app.submissionDate ? new Date(app.submissionDate).toLocaleDateString() : '',
          status: app.status,
          id: app.id,
        });
        if (app.status === 'pending') pendingApplications++;
        if (app.status === 'approved') activeInterns++;
        if (app.status === 'completed') completedInternships++;
      }
    });
  });

  // Optionally, sort applications by date descending
  applications = applications.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole={currentUser?.role?.toLowerCase() || 'company'} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ padding: '2rem', flex: 1 }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>
            Welcome, {currentUser?.companyName || currentUser?.username}
          </h2>
          <div style={{ color: '#64748b', marginBottom: 32 }}>
            Internship management dashboard for your company
          </div>
          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
            <SummaryCard title="Active Interns" value={activeInterns} desc="Currently interning" icon={<Users size={28} color="#1746a2" />} />
            <SummaryCard title="Pending Applications" value={pendingApplications} desc="Awaiting review" icon={<FileText size={28} color="#1746a2" />} />
            <SummaryCard title="Completed Internships" value={completedInternships} desc="Successfully completed" icon={<Star size={28} color="#1746a2" />} />
          </div>
          {/* Recent Applications Table */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem', marginBottom: 32 }}>
            <div style={{ fontWeight: 600, fontSize: 22, marginBottom: 8 }}>Recent Applications</div>
            <div style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>Latest internship applications for your company</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>Student</th>
                  <th style={{ padding: '8px 12px' }}>Position</th>
                  <th style={{ padding: '8px 12px' }}>Date</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                  <th style={{ padding: '8px 12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px' }}>{app.student}</td>
                    <td style={{ padding: '8px 12px' }}>{app.position}</td>
                    <td style={{ padding: '8px 12px' }}>{app.date}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        background: app.status === 'completed' ? '#e0e7ff' : app.status === 'approved' ? '#dcfce7' : '#fef3c7',
                        color: app.status === 'completed' ? '#1746a2' : app.status === 'approved' ? '#166534' : '#b45309',
                        borderRadius: 8, padding: '2px 12px', fontWeight: 600, fontSize: 14
                      }}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <button style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>Showing {applications.length} of {applications.length} applications</div>
          </div>
          {/* Manage Interns & Evaluations */}
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Manage Interns</div>
              <div style={{ color: '#64748b', fontSize: 15, marginBottom: 18 }}>View and manage your current interns</div>
              <button style={{ width: '100%', background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 500, fontSize: 16, color: '#1746a2', cursor: 'pointer' }}>View Interns</button>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Intern Evaluations</div>
              <div style={{ color: '#64748b', fontSize: 15, marginBottom: 18 }}>Submit and manage intern performance evaluations</div>
              <button style={{ width: '100%', background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 500, fontSize: 16, color: '#1746a2', cursor: 'pointer' }}>Manage Evaluations</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, desc, icon }) => (
  <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.5rem 2rem', flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>{title}</div>
      <div>{icon}</div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 600 }}>{value}</div>
    <div style={{ color: '#64748b', fontSize: 14 }}>{desc}</div>
  </div>
);

export default CompanyHome;