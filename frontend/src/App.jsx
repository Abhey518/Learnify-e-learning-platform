import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'

import RegisterPage from './features/registration/RegisterPage';
import LoginPage from './features/registration/LoginPage';
import LandingPage from './LandingPage';
import CoursesPage from './features/courses/CoursesPage';
import AdminDashboardPage from './features/analytics/AdminDashboardPage';
import SubmitReviewForm from './features/analytics/SubmitReviewForm';
import CourseReviewsSection from './components/CourseReviewsSection';


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
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/submit-review" element={<SubmitReviewForm />} />
          <Route path="/course-reviews/:courseId" element={<CourseReviewsSection />} />

          {/* Catch-all Fallback Safety Routing Block */}
          <Route path="*" element={<Navigate to="/" replace />} />


          <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          } 
        />




        </Routes>
      </main>
    </Router>
  );
}
