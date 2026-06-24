import { Routes, Route } from 'react-router-dom'

// Import feature routes
import coursesRoutes from '../features/courses/routes'
import enrollmentRoutes from '../features/enrollment/routes'
import quizRoutes from '../features/quiz/routes'
import forumRoutes from '../features/forum/routes'
import analyticsRoutes from '../features/analytics/routes'

export default function AppRoutes() {
  return (
    <Routes>
      {coursesRoutes}
      {enrollmentRoutes}
      {quizRoutes}
      {forumRoutes}
      {analyticsRoutes}
    </Routes>
  )
}
