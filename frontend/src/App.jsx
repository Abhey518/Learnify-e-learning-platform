<<<<<<< HEAD
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
=======
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
>>>>>>> 4ed59a1d7d2d56524150966236754f09e65a4059
