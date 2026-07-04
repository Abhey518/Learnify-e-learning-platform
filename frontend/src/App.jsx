import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'
import NotFoundPage from './components/NotFoundPage';

import RegisterPage from './features/registration/RegisterPage';
import LoginPage from './features/registration/LoginPage';
import LandingPage from './LandingPage';
import CoursesPage from './features/courses/CoursesPage';
import AdminDashboardPage from './features/analytics/AdminDashboardPage';
import SubmitReviewForm from './features/analytics/SubmitReviewForm';
import CourseReviewsSection from './components/CourseReviewsSection';
import InstructorAnalyticsPage from './features/analytics/InstructorAnalyticsPage';
import InstructorPendingPage from './features/registration/InstructorPendingPage';



export default function App() {
  return (
    <Router>
      {/* Global Navigation Bar */}
      <Navbar />

      <main style={{ minHeight: '100vh', paddingTop: '72px', backgroundColor: '#f8f9fa' }}>
        <Routes>
          {/* Public Platform Core Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/submit-review" element={<SubmitReviewForm />} />
          <Route path="/course-reviews/:courseId" element={<CourseReviewsSection />} />


          



          <Route path="*" element={<NotFoundPage />} />





          <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/instructor-analytics" element={
            <ProtectedRoute allowedRole="admin">
              <InstructorAnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/instructor-analytics" element={
            <ProtectedRoute allowedRole="instructor">
              <InstructorAnalyticsPage />
            </ProtectedRoute>
          } />
          <Route 
          path="/dashboard/instructor/pending" 
          element={
            <ProtectedRoute allowedRole="pending_instructor">
              <InstructorPendingPage />
            </ProtectedRoute>
          } 
        />





        </Routes>
      </main>
    </Router>
  );
}
