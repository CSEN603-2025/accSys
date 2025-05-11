import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import "./index.css";

import LoginPage from './pages/LoginPage/LoginPage';
import StudentDashboard from './pages/Student/StudentDashboard';
import FacultyHome from './pages/FacultyHome';
import CompanyHome from './pages/CompanyHome';
import ScadHome from './pages/ScadHome';
import RegisterCompany from './pages/LoginPage/RegisterCompany';
import CompaniesPage from './pages/CompaniesPage';

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
      case 'SCAD':
        return <ScadHome currentUser={user} />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <Routes>
      <Route path="/" element={user ? renderHomeByRole() : <Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage onLogin={setUser} />} />
      {/* Optional: direct access to dashboards */}
      <Route path="/student" element={<StudentDashboard currentUser={user} />} />
      <Route path="/faculty" element={<FacultyHome currentUser={user} />} />
      <Route path="/company" element={<CompanyHome currentUser={user} />} />
      <Route path="/scad" element={<ScadHome currentUser={user} />} />
      <Route path="/register-company" element={<RegisterCompany />} />
      <Route path="/companies" element={<CompaniesPage currentUser={user} />} />
      {/* Default route fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
