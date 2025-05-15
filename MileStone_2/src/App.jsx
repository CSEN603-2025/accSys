import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import "./index.css";

import LoginPage from './pages/LoginPage/LoginPage';
import StudentDashboard from './pages/Student/StudentDashboard';
import FacultyHome from './pages/FacultyHome';
import CompanyHome from './pages/Company/CompanyHome';
import InternEvaluations from './pages/Company/InternEvaluations';
import Applicants from './pages/Company/Applicants';
import CompanyInterns from './pages/Company/CompanyInterns';

import ScadHome from './pages/ScadHome';
import ScadStudentList from './pages/ScadStudentList';
import RegisterCompany from './pages/LoginPage/RegisterCompany';
import CompaniesPage from './pages/CompaniesPage';
import InternshipPage from './pages/InternshipPage';
import StudentProfilePage from './pages/Student/StudentProfilePage';
import SideBar from './Components/SideBar';
import NavBar from './Components/NavBar';
import StudentReports from './pages/Student/StudentReports';
import StudentInternships from './pages/Student/StudentInternships';
import ApplicationsPage from './pages/ApplicationsPage';
import StudentEvaluations from './pages/Student/StudentEvaluations';

// Placeholder components for other roles
const FacultyProfilePage = ({ currentUser }) => <div style={{padding: 40}}><h2>Faculty Profile Page</h2><p>Welcome, {currentUser?.username}</p></div>;
const CompanyProfilePage = ({ currentUser }) => <div style={{padding: 40}}><h2>Company Profile Page</h2><p>Welcome, {currentUser?.companyName || currentUser?.username}</p></div>;
const ScadProfilePage = ({ currentUser }) => <div style={{padding: 40}}><h2>SCAD Profile Page</h2><p>Welcome, {currentUser?.username}</p></div>;

export default function App() {
  const [user, setUser] = useState(null); // Simulates a logged-in user

  const renderHomeByRole = () => {
    switch (user.role) {
      case 'student':
        return <StudentDashboard currentUser={user} />;
      case 'faculty':
        return <FacultyHome currentUser={user} />;
      case 'company':
        return <CompanyHome currentUser={user} />;
      case 'scad':
        return <ScadHome currentUser={user} />;
      default:
        return <Navigate to="/login" />;
    }
  };

  // Dynamic profile page route
  const renderProfileByRole = () => {
    if (!user) return <Navigate to="/login" />;
    switch (user.role) {
      case 'student':
        return <StudentProfilePage currentUser={user} />;
      case 'faculty':
        return <FacultyProfilePage currentUser={user} />;
      case 'company':
        return <CompanyProfilePage currentUser={user} />;
      case 'scad':
        return <ScadProfilePage currentUser={user} />;
      default:
        return <div>Unknown user type</div>;
    }
  };

  return (
    <Routes>
      <Route path="/" element={user ? renderHomeByRole() : <Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage onLogin={setUser} />} />
      {/* Optional: direct access to dashboards */}
      <Route path="/student" element={<StudentDashboard currentUser={user} />} />
      <Route path="/student/reports" element={<StudentReports currentUser={user} />} />
      <Route path="/faculty" element={<FacultyHome currentUser={user} />} />
      <Route path="/company" element={<CompanyHome currentUser={user} />} />
      <Route path="/scad" element={<ScadHome currentUser={user} />} />
      <Route path="/scad/students" element={<ScadStudentList currentUser={user} />} />
      <Route path="/register-company" element={<RegisterCompany />} />
      <Route path="/companies" element={<CompaniesPage currentUser={user} />} />
      <Route path="/intern-evaluations" element={<InternEvaluations currentUser={user} />} />
      <Route path="/internships" element={<InternshipPage currentUser={user} />} />
      <Route path="/student/profile" element={<StudentProfilePage currentUser={user} />} />
      <Route path="/student/studentinternships" element={<StudentInternships currentUser={user} />} />
      <Route path="/applications" element={<ApplicationsPage currentUser={user} />} />
      <Route path="/applicants" element={<Applicants currentUser={user} />} />
      <Route path="/company/interns" element={<CompanyInterns currentUser={user} />} />
      <Route path="/student/evaluation" element={<StudentEvaluations currentUser={user} />} />


      {/* Dynamic profile route for all user types */}
      <Route path="/profile" element={renderProfileByRole()} />
      {/* Default route fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
