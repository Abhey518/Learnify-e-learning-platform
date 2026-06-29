import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';

import RegisterPage from './features/registration/RegisterPage';
import LoginPage from './features/registration/LoginPage';
import LandingPage from './LandingPage';


export default function App() {
  return (
    <Router>
      {/* 1. Global Navigation Bar sits perfectly at the top edge of every public view */}
      <Navbar />

      {/* 2. Main content area with a 72px padding top offset to prevent navbar overlap */}
      <main style={{ minHeight: '100vh', paddingTop: '72px', backgroundColor: '#f8f9fa' }}>
        <Routes>
          {/* Public Platform Core Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Catch-all Fallback Safety Routing Block */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  );
}
