import { Route } from 'react-router-dom';
import QuizListPage from './pages/QuizListPage';
import QuizPage from './pages/QuizPage';

const quizRoutes = [
  <Route key="quiz-list" path="/quizzes" element={<QuizListPage />} />,
  <Route key="quiz-take" path="/quizzes/:id" element={<QuizPage />} />
];

export default quizRoutes;