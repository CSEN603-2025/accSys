import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage/LoginPage';
import StudentHome from './pages/StudentHome';
import FacultyHome from './pages/FacultyHome';
import CompanyHome from './pages/CompanyHome';
import ScadHome from './pages/ScadHome';

export default function App() {
  const [user, setUser] = useState(null); // Simulates a logged-in user

  const renderHomeByRole = () => {
    switch (user.role) {
      case 'student':
        return <StudentHome />;
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
      <Route path="/student" element={<StudentHome />} />
      <Route path="/faculty" element={<FacultyHome />} />
      <Route path="/company" element={<CompanyHome />} />
      <Route path="/scad" element={<ScadHome />} />
      {/* Default route fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
