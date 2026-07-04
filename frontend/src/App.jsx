import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'

import RegisterPage from './features/registration/RegisterPage';
import LoginPage from './features/registration/LoginPage';
import LandingPage from './LandingPage';
import CoursesPage from './features/courses/CoursesPage';
import InstructorDashboard from './dashboards/InstructorDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import StudentLearningPage from './features/courses/StudentLearningPage';
import StudentLessonPage from './features/courses/StudentLessonPage';


export default function App() {
  return (
    <Router>

      {/* Render the Navbar component on all pages */}
      <Navbar /> 
      
      {/* Apply padding to avoid overlap with the fixed Navbar */}
      <main style={{ minHeight: '100vh', paddingTop: '72px', backgroundColor: '#f8f9fa' }}>
        
        <Routes>
          {/* Define the routes for the application */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/courses" element={<CoursesPage />} />

          {/* Catch-all route to redirect to the landing page for any undefined routes */}
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}

          <Route 
            path="/dashboards/instructor"
            element={
              <ProtectedRoute allowedRoles="instructor">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/dashboards/student"
            element={
              <ProtectedRoute allowedRoles="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/courses/:courseId/learning"
            element={
              <ProtectedRoute allowedRoles="student">
                <StudentLearningPage />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/courses/:courseId/learning/:lessonId"
            element={
              <ProtectedRoute allowedRoles="student">
                <StudentLessonPage />
              </ProtectedRoute>
            }
          />  
  
          </Routes>
        </main>
      </Router>
  );
}
