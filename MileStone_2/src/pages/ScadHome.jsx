import React, { useState, useEffect } from 'react';
import SideBar from '../Components/SideBar';
import NavBar from '../Components/NavBar';
import InternshipCalendar from '../Components/InternshipCalendar';
import { BarChart3, Users, Clock, BookOpen, Star, Building2, Calendar, X } from 'lucide-react';
import { mockUsers } from '../DummyData/mockUsers';
import jsPDF from 'jspdf';
import IncomingCallNotification from '../Components/IncomingCallNotification';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'flex-start',
    flex: 1,
    minWidth: '200px'
  }}>
    <div style={{
      padding: '0.75rem',
      borderRadius: '0.5rem',
      marginRight: '1rem',
      backgroundColor: color
    }}>
      <Icon style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
    </div>
    <div>
      <h3 style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 500 }}>{title}</h3>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{value}</p>
    </div>
  </div>
);

const ScadHome = ({ currentUser }) => {
  // Get all students and their reports
  const students = mockUsers.filter(user => user.role === 'student');
  const allReports = students.flatMap(student => student.reports || []);
  
  // Calculate report statistics
  const reportStats = {
    accepted: allReports.filter(report => report.status === 'accepted').length,
    rejected: allReports.filter(report => report.status === 'rejected').length,
    flagged: allReports.filter(report => report.status === 'flagged').length
  };

  // Calculate average review time (mock data for now)
  const avgReviewTime = "2.5 days";

  // Get course statistics
  const courseStats = students.reduce((acc, student) => {
    const reports = student.reports || [];
    reports.forEach(report => {
      const courses = report.courses || [];
      courses.forEach(course => {
        acc[course] = (acc[course] || 0) + 1;
      });
    });
    return acc;
  }, {});

  const topCourses = Object.entries(courseStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  // Get company statistics
  const companies = mockUsers.filter(user => user.role === 'company');
  
  // Calculate company ratings
  const companyRatings = companies.map(company => {
    const ratings = students
      .filter(student => student.pastInternships?.some(internship => internship.company.id === company.id))
      .map(student => student.pastInternships
        .find(internship => internship.company.id === company.id)?.rating || 0);
    
    const avgRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0;

    return {
      name: company.companyName,
      rating: avgRating.toFixed(1)
    };
  });

  const topRatedCompanies = companyRatings
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  // Calculate internship counts per company
  const companyInternshipCounts = companies.map(company => ({
    name: company.companyName,
    count: (company.currentInterns?.length || 0) + (company.pastInterns?.length || 0)
  }));

  const topCompaniesByCount = companyInternshipCounts
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Download statistics as PDF
  const handleDownloadStats = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text('SCAD Dashboard Statistics', 14, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Accepted Reports: ${reportStats.accepted}`, 14, y); y += 7;
    doc.text(`Rejected Reports: ${reportStats.rejected}`, 14, y); y += 7;
    doc.text(`Flagged Reports: ${reportStats.flagged}`, 14, y); y += 7;
    doc.text(`Average Review Time: ${avgReviewTime}`, 14, y); y += 10;
    doc.setFontSize(14);
    doc.text('Top Courses:', 14, y); y += 7;
    doc.setFontSize(12);
    topCourses.forEach(course => {
      doc.text(`${course.name}: ${course.count} students`, 18, y); y += 6;
    });
    y += 4;
    doc.setFontSize(14);
    doc.text('Top Rated Companies:', 14, y); y += 7;
    doc.setFontSize(12);
    topRatedCompanies.forEach(company => {
      doc.text(`${company.name}: ${company.rating}/5.0`, 18, y); y += 6;
    });
    y += 4;
    doc.setFontSize(14);
    doc.text('Top Companies by Internship Count:', 14, y); y += 7;
    doc.setFontSize(12);
    topCompaniesByCount.forEach(company => {
      doc.text(`${company.name}: ${company.count} internships`, 18, y); y += 6;
    });
    doc.save('scad_dashboard_statistics.pdf');
  };

  const [incomingCall, setIncomingCall] = useState(null);

  // Simulate incoming call (for testing)
  useEffect(() => {
    const simulateIncomingCall = () => {
      const callers = [
        { id: 1, name: 'John Doe', type: 'Student' },
        { id: 2, name: 'Company XYZ', type: 'Company' },
        { id: 3, name: 'Faculty Member', type: 'Faculty' }
      ];
      
      const randomCaller = callers[Math.floor(Math.random() * callers.length)];
      setIncomingCall(randomCaller);
    };

    // Simulate a call every 30 seconds (for testing)
    const interval = setInterval(simulateIncomingCall, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptCall = () => {
    // Handle accepted call
    console.log('Call accepted:', incomingCall);
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    // Handle rejected call
    console.log('Call rejected:', incomingCall);
    setIncomingCall(null);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <SideBar userRole="scad" currentUser={currentUser} />
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Navbar */}
        <NavBar currentUser={currentUser} />
        {/* Incoming Call Notification */}
        {incomingCall && (
          <IncomingCallNotification
            onAccept={handleAcceptCall}
            onReject={handleRejectCall}
          />
        )}
        {/* Dashboard Content */}
        <div style={{ padding: '2rem', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button
              onClick={handleDownloadStats}
              style={{
                background: '#1746a2',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Download Statistics Report
            </button>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Admin Dashboard</h1>
          <p style={{ color: '#4B5563', marginBottom: '1.5rem' }}>Welcome back, {currentUser?.username}! Here's an overview of your system.</p>

          {/* Statistics Grid */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            <StatCard
              title="Accepted Reports"
              value={reportStats.accepted}
              icon={BarChart3}
              color="#10B981"
            />
            <StatCard
              title="Rejected Reports"
              value={reportStats.rejected}
              icon={BarChart3}
              color="#EF4444"
            />
            <StatCard
              title="Flagged Reports"
              value={reportStats.flagged}
              icon={BarChart3}
              color="#F59E0B"
            />
            <StatCard
              title="Average Review Time"
              value={avgReviewTime}
              icon={Clock}
              color="#3B82F6"
            />
          </div>

          {/* Detailed Statistics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Top Courses */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <BookOpen style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#2563EB' }} />
                Most Used Courses
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topCourses.map((course, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#4B5563' }}>{course.name}</span>
                    <span style={{ fontWeight: 600 }}>{course.count} students</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Rated Companies */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Star style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#F59E0B' }} />
                Top Rated Companies
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topRatedCompanies.map((company, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#4B5563' }}>{company.name}</span>
                    <span style={{ fontWeight: 600 }}>{company.rating}/5.0</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Companies by Count */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Building2 style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#7C3AED' }} />
                Top Companies by Internship Count
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topCompaniesByCount.map((company, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#4B5563' }}>{company.name}</span>
                    <span style={{ fontWeight: 600 }}>{company.count} internships</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Internship Cycles */}
            {currentUser?.role === 'scad' && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '1.5rem'
              }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Calendar style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#059669' }} />
                  Internship Cycles
                </h2>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem',
                  height: '100%'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.25rem',
                    fontSize: '0.875rem'
                  }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} style={{ textAlign: 'center', color: '#6B7280', fontWeight: 500 }}>
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - date.getDay() + i);
                      const isCurrentMonth = date.getMonth() === new Date().getMonth();
                      return (
                        <div
                          key={i}
                          style={{
                            textAlign: 'center',
                            padding: '0.5rem',
                            color: isCurrentMonth ? '#1F2937' : '#9CA3AF',
                            backgroundColor: date.getDate() === new Date().getDate() ? '#E5E7EB' : 'transparent',
                            borderRadius: '0.25rem',
                            cursor: 'pointer'
                          }}
                        >
                          {date.getDate()}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: '0' }}>
                    <button
                      onClick={() => document.getElementById('calendar-modal').showModal()}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'rgb(23, 70, 162)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Calendar style={{ width: '1rem', height: '1rem' }} />
                      Manage Cycles
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Calendar Modal */}
          {currentUser?.role === 'scad' && (
            <dialog id="calendar-modal" style={{
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              maxWidth: '90vw',
              width: '800px'
            }}>
              <InternshipCalendar />
              <button
                onClick={() => document.getElementById('calendar-modal').close()}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.5rem',
                  backgroundColor: '#fff',
                  color: 'rgb(100, 116, 139)',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                <X size={18}/>
              </button>
            </dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScadHome;
