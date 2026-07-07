/* ==============================================================================
 * Learnify - A Comprehensive Learning Management System
 * 
 * Developed by:
 *   - Srirajitha.S
 *   - Thennakoon T M B M
 *   - Lathinka R W I (ishadi)
 *   - Abeywardhana H H A P
 *   - Insifa M.F
 * 
 * Bachelor of Information and Communication Technology (BICT)
 * Software System Specialization
 * Faculty of Computing and Technology, University of Kelaniya - Sri Lanka
 * 
 * Project developed for:
 *   3rd Year - Software Architecture and Concepts
 * 
 * Copyright (C) 2026. All rights reserved.
 * ==============================================================================
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 * ==============================================================================
 */



import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'
import NotFoundPage from './components/NotFoundPage';

import RegisterPage from './features/registration/RegisterPage';
import LoginPage from './features/registration/LoginPage';
import LandingPage from './LandingPage';
import CoursesPage from './features/courses/CoursesPage';

// Admin and Instructor Analytics Pages
import AdminDashboardPage from './dashboards/AdminDashboardPage';
import SubmitReviewForm from './features/analytics/SubmitReviewForm';
import CourseReviewsSection from './components/CourseReviewsSection';
import InstructorAnalyticsPage from './features/analytics/InstructorAnalyticsPage';

// Instructor Dashboards
import InstructorDashboard from './dashboards/InstructorDashboard';
import InstructorPendingPage from './features/registration/InstructorPendingPage';
import InstructorRejectedPage from './features/registration/InstructorRejectedPage';

// Student Dashboards and Learning Pages
import StudentDashboard from './dashboards/StudentDashboard';
import StudentLearningPage from './features/courses/StudentLearningPage';
import StudentLessonPage from './features/courses/StudentLessonPage';
import EnrollmentDashboard from './features/enrollment/EnrollmentDashboard';

// Forum Pages
import ForumThreads from './features/forum/ForumThreads';
import ThreadDetails from './features/forum/ThreadDetails';
import Forum from './features/forum/Forum';

// Quiz Pages
import QuizPage from './features/quiz/pages/QuizPage';
import QuizListPage from './features/quiz/pages/QuizListPage';


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
          path="/dashboards/instructor/pending" 
          element={
            <ProtectedRoute allowedRole="pending_instructor">
              <InstructorPendingPage />
            </ProtectedRoute>
          } 
        />
            
          <Route 
          path="/dashboards/instructor"
          element={
            <ProtectedRoute allowedRole="instructor">
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/dashboards/instructor/rejected" 
          element={
            <ProtectedRoute allowedRole="rejected_instructor">
              <InstructorRejectedPage />
            </ProtectedRoute>
          } 
        />

          <Route 
            path="/dashboards/student"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/courses/:courseId/learning"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentLearningPage />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/courses/:courseId/learning/:lessonId"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentLessonPage />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/courses/:courseId/quizzes-list/:moduleId?"
            element={
              <ProtectedRoute allowedRole={["student", "instructor"]}>
                <QuizListPage />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/courses/:courseId/quizzes/:quizId"
            element={
              <ProtectedRoute allowedRoles={["student", "instructor"]}>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/courses/:courseId/forum"
            element={
              <ProtectedRoute allowedRoles={["student", "instructor"]}>
                <Forum />
              </ProtectedRoute>
            }
          />

        </Routes>
      </main>
    </Router>
  );
}
