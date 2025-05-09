import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import "./index.css";

import LoginPage from './pages/LoginPage/LoginPage';
import StudentDashboard from './pages/Student/StudentDashboard';
import FacultyHome from './pages/FacultyHome';
import CompanyHome from './pages/CompanyHome';
import ScadHome from './pages/ScadHome';
import RegisterCompany from './pages/LoginPage/RegisterCompany';

export default function App() {
  const [user, setUser] = useState(null); // Simulates a logged-in user

  const renderHomeByRole = () => {
    switch (user.role) {
      case 'student':
        return <StudentDashboard />;
      case 'faculty':
        return <FacultyHome />;
      case 'company':
        return <CompanyHome />;
      case 'scad':
        return <ScadHome />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <Routes>
      <Route path="/" element={user ? renderHomeByRole() : <Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage onLogin={setUser} />} />
      {/* Optional: direct access to dashboards */}
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/faculty" element={<FacultyHome />} />
      <Route path="/company" element={<CompanyHome />} />
      <Route path="/scad" element={<ScadHome />} />
      <Route path="/register-company" element={<RegisterCompany />} />
      {/* Default route fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
