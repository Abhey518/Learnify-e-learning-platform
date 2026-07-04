import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import quizRoutes from './features/quiz/routes';
import QuizPage from './features/quiz/pages/QuizPage';
import QuizListPage from './features/quiz/pages/QuizListPage'; // 🌟 අලුත් පේජ් එක උඩින්ම ඉම්පෝට් කළා

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/quizzes" replace />} />
        
        {/* 🟢 1. Student View: කෝස් එකක් ඇතුළේ තියෙන ක්විස් ලැයිස්තුව බලන්න (FR-3.3) */}
        <Route path="/courses/:courseId/quizzes" element={<QuizListPage userRole="student" />} />

        {/* 🟢 2. Instructor View: කෝස් එකක් ඇතුළේ ක්විස් මැනේජ් කරන්න/Templates හදන්න (FR-3.1) */}
        <Route path="/courses/:courseId/quizzes/manage" element={<QuizListPage userRole="instructor" />} />

        {/* Student Quiz UI Link (FR-3.4) */}
        <Route path="/quizzes/:quizId" element={<QuizPage userRole="student" />} />
        
        {/* Instructor Panel Testing View (FR-3.2) */}
        <Route path="/quizzes/:quizId/manage" element={<QuizPage userRole="instructor" />} />

        {/* Other quiz routes from your team */}
        {quizRoutes}
      </Routes>
    </Router>
  );
}

export default App;