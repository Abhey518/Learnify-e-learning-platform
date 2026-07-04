<<<<<<< HEAD
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import modular feature route arrays and segments
import coursesRoutes from '../features/courses/routes';
import enrollmentRoutes from '../features/enrollment/routes';
import quizRoutes from '../features/quiz/routes';
import forumRoutes from '../features/forum/routes';
import analyticsRoutes from '../features/analytics/routes';

// 🌟 Direct Imports with Correct Folder Layout Paths
import QuizListPage from '../features/quiz/pages/QuizListPage';
import QuizPage from '../features/quiz/pages/QuizPage';
=======
import { Routes, Route } from 'react-router-dom'

// Import feature routes
import coursesRoutes from '../features/courses/routes'
import enrollmentRoutes from '../features/enrollment/routes'
import quizRoutes from '../features/quiz/routes'
import forumRoutes from '../features/forum/routes'
import analyticsRoutes from '../features/analytics/routes'
>>>>>>> 4ed59a1d7d2d56524150966236754f09e65a4059

export default function AppRoutes() {
  return (
    <Routes>
<<<<<<< HEAD
      {/* 🟢 Direct Hardcoded Matrix Routes */}
      <Route path="/courses/:courseId/quizzes" element={<QuizListPage userRole="student" />} />
      <Route path="/courses/:courseId/quizzes/manage" element={<QuizListPage userRole="instructor" />} />
      <Route path="/quizzes/:quizId" element={<QuizPage userRole="student" />} />
      <Route path="/quizzes/:quizId/manage" element={<QuizPage userRole="instructor" />} />

      {/* Legacy structural routes configuration fallback layout */}
      {coursesRoutes}
      {enrollmentRoutes}
      {...quizRoutes}
      {forumRoutes}
      {analyticsRoutes}
    </Routes>
  );
}
=======
      {coursesRoutes}
      {enrollmentRoutes}
      {quizRoutes}
      {forumRoutes}
      {analyticsRoutes}
    </Routes>
  )
}
>>>>>>> 4ed59a1d7d2d56524150966236754f09e65a4059
