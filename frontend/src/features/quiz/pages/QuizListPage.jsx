import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

export default function QuizListPage({ userRole = 'student' }) {
  const { courseId } = useParams(); // Extracts courseId from structural URL layout parameters
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuizTitle, setNewQuizTitle] = useState('');

  // 1. GET Request: Fetch all quizzes mapped to this course track from Flask API blueprint
  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const fetchQuizzes = () => {
    axios.get(`http://127.0.0.1:5000/api/courses/${courseId}/quizzes`)
      .then(res => {
        setQuizzes(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching quizzes:", err);
        setLoading(false);
      });
  };

  // 2. POST Request: Instructor initiates a new quiz placeholder container schema row
  const handleCreateQuiz = (e) => {
    e.preventDefault();
    if (!newQuizTitle.trim()) return;

    const payload = {
      title: newQuizTitle,
      course_id: parseInt(courseId)
    };

    axios.post(`http://127.0.0.1:5000/api/courses/${courseId}/quizzes`, payload)
      .then(res => {
        alert("Quiz base parameters created successfully!");
        setNewQuizTitle('');
        fetchQuizzes(); // Refresh list immediately to reflect changes dynamically
      })
      .catch(err => {
        console.error("Failed to create quiz:", err);
        alert("Error creating quiz configuration framework.");
      });
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border" style={{ color: '#6f42c1' }} role="status"></div>
          <h5 className="mt-3 fw-semibold text-secondary">Loading Quiz Registry Track...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            
            <div className="d-flex justify-content-between align-items-center mb-5">
              <div>
                <h2 className="fw-bold text-dark mb-1">Course Quizzes & Assessments</h2>
                <p className="text-muted small">Manage and participate in evaluated milestones for Course #{courseId}</p>
              </div>
              <Link to="/courses" className="btn btn-outline-secondary btn-sm rounded-3">
                ← Back to Courses
              </Link>
            </div>

            {/* --- INSTRUCTOR: CREATE QUIZ MODULE --- */}
            {userRole === 'instructor' && (
              <div className="card p-4 shadow-sm border-0 bg-white mb-5" style={{ borderRadius: '1rem' }}>
                <h5 className="fw-bold text-dark mb-3">
                  <i className="bi bi-plus-circle-fill me-2" style={{ color: '#6f42c1' }}></i>Setup New Assessment Module
                </h5>
                <form onSubmit={handleCreateQuiz} className="row g-3">
                  <div className="col-md-9">
                    <input 
                      type="text" 
                      className="form-control py-2.5 rounded-3" 
                      placeholder="e.g., Database Management Systems - Quiz 01" 
                      value={newQuizTitle} 
                      onChange={e => setNewQuizTitle(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="col-md-3">
                    <button type="submit" className="btn text-white w-100 py-2.5 fw-semibold rounded-3" style={{ backgroundColor: '#6f42c1' }}>
                      Create Quiz Template
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* --- QUIZ LIST MATRIX --- */}
            <h5 className="fw-bold text-dark mb-3 px-1">Available Quizzes ({quizzes.length})</h5>
            {quizzes.length === 0 ? (
              <div className="card border-0 shadow-sm p-5 text-center rounded-4">
                <i className="bi bi-clipboard-x display-4 mb-3" style={{ color: '#6f42c1' }}></i>
                <p className="text-muted mb-0">No active assessments hosted under this track metric yet.</p>
              </div>
            ) : (
              <div className="row g-3">
                {quizzes.map((quiz) => (
                  <div className="col-12" key={quiz.id}>
                    <div className="card p-4 shadow-sm border-0 bg-white d-flex flex-md-row justify-content-between align-items-md-center gap-3" style={{ borderRadius: '1rem' }}>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge text-primary border px-2.5 py-1.5 fs-7 fw-semibold" style={{ backgroundColor: '#f3e8ff', color: '#6f42c1' }}>ID: #{quiz.id}</span>
                          <h5 className="fw-bold text-dark mb-0 ms-1">{quiz.title}</h5>
                        </div>
                        <small className="text-muted">Target Module: Course Assembly Evaluation Stack</small>
                      </div>
                      
                      <div>
                        {userRole === 'instructor' ? (
                          <Link to={`/quizzes/${quiz.id}/manage`} className="btn btn-dark fw-semibold px-4 py-2 rounded-3 btn-sm shadow-sm">
                            <i className="bi bi-gear-fill me-1"></i> Manage Questions
                          </Link>
                        ) : (
                          <Link to={`/quizzes/${quiz.id}`} className="btn text-white fw-semibold px-4 py-2 rounded-3 btn-sm shadow-sm" style={{ backgroundColor: '#6f42c1' }}>
                            Start Assessment →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}