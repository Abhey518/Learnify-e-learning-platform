import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Shared 
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'
import NotFoundPage from './components/NotFoundPage';

// Registration Pages
import RegisterPage from './features/registration/RegisterPage';
import LoginPage from './features/registration/LoginPage';

// Home Page
import LandingPage from './LandingPage';

// Course Pages
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
import quizRoutes from './features/quiz/routes';
import QuizPage from './features/quiz/pages/QuizPage';
import QuizListPage from './features/quiz/pages/QuizListPage';

// Forum Pages
import ForumThreads from './features/forum/ForumThreads';
import ThreadDetails from './features/forum/ThreadDetails';
import Forum from './features/forum/Forum';


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
          {/* <Route path="/enrollment" element={<EnrollmentDashboard />} /> */}

          <Route path="/courses/:courseId/forum" element={<ForumThreads />} />
          <Route path="/courses/:courseId/forum/:threadId" element={<ThreadDetails />} />
          <Route path="/courses/:courseId/forum" element={<Forum />} />



          



          <Route path="*" element={<NotFoundPage />} />
            
            
          
//             Have to check ///////////
          <Route path="/" element={<Navigate to="/quizzes" replace />} />
          <Route path="/courses/:courseId/quizzes" element={<QuizListPage userRole="student" />} />
          <Route path="/courses/:courseId/quizzes/manage" element={<QuizListPage userRole="instructor" />} />
          <Route path="/quizzes/:quizId" element={<QuizPage userRole="student" />} />
          <Route path="/quizzes/:quizId/manage" element={<QuizPage userRole="instructor" />} />  
            
            ////////////////////////
            





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
            <ProtectedRoute allowedRoles="instructor">
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
