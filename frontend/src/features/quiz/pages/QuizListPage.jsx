import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

export default function QuizListPage() {
  const { courseId, moduleId } = useParams(); 
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [userRole, setUserRole] = useState('student'); 

  // EDITING STATES
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [attemptLimit, setAttemptLimit] = useState(1);

  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    axios.get(`${baseUrl}/auth/current-user`, { withCredentials: true })
      .then(res => {
        if (res.data && res.data.logged_in) {
          setUserRole(res.data.user_role || res.data.role || 'student');
        }
      })
      .catch(err => console.error("Session sync failed:", err));

    fetchQuizzes();
  }, [courseId, moduleId]);

  const fetchQuizzes = () => {
    const fetchUrl = moduleId 
      ? `${baseUrl}/courses/modules/${moduleId}/quizzes`
      : `${baseUrl}/courses/${courseId}/quizzes`;

    axios.get(fetchUrl, { withCredentials: true })
      .then(res => {
        setQuizzes(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching quizzes:", err);
        setLoading(false);
      });
  };

  const handleCreateQuiz = (e) => {
    e.preventDefault();
    if (!newQuizTitle.trim()) return;

    const payload = {
      title: newQuizTitle,
      course_id: parseInt(courseId),
      module_id: moduleId ? parseInt(moduleId) : null,
      attempt_limit: parseInt(attemptLimit) // Pass to backend
    };

    const postUrl = moduleId 
      ? `${baseUrl}/courses/modules/${moduleId}/quizzes`
      : `${baseUrl}/courses/${courseId}/quizzes`;

    axios.post(postUrl, payload, { withCredentials: true })
      .then(() => {
        setNewQuizTitle('');
        fetchQuizzes(); 
      })
      .catch(err => console.error("Failed to create quiz:", err));
  };

  const handleSaveEdit = (quizId) => {
    if (!editingTitle.trim()) return;
    axios.put(`${baseUrl}/quizzes/${quizId}`, { title: editingTitle }, { withCredentials: true })
      .then(() => {
        setEditingQuizId(null);
        fetchQuizzes();
      })
      .catch(err => console.error("Failed to update quiz title:", err));
  };

  // CENTRALIZED DELETION ACTION
  const handleDeleteQuiz = (quizId, quizTitle) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${quizTitle}"?`);
    if (!confirmDelete) return;

    axios.delete(`${baseUrl}/quizzes/${quizId}`, { withCredentials: true })
      .then(() => {
        alert("Quiz removed successfully.");
        fetchQuizzes();
      })
      .catch(err => {
        console.error("Failed to delete quiz:", err);
        alert("Error executing deletion request.");
      });
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-5 text-dark">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            
            <div className="d-flex justify-content-between align-items-center mb-5 text-start">
              <div>
                <h2 className="fw-bold text-dark mb-1">Course Quizzes & Assessments</h2>
                <p className="text-muted small">Manage and participate in evaluated milestones for Course #{courseId}</p>
              </div>

              {userRole === 'instructor'? (
                <Link to="/dashboards/instructor" className="btn btn-outline-secondary btn-sm rounded-3">
                  ← Back to Dashboard
                </Link>
              ): (
                <Link to="/dashboards/student" className="btn btn-outline-secondary btn-sm rounded-3">
                  ← Back to Dashboard
                </Link>
              )}

            </div>

            {/* --- INSTRUCTOR: SETUP NEW TEMPLATE --- */}
            {userRole === 'instructor' && (
              <div className="card p-4 shadow-sm border-0 bg-white mb-5 text-start" style={{ borderRadius: '1rem' }}>
                <h5 className="fw-bold text-dark mb-3">Setup New Assessment Module</h5>
                <form onSubmit={handleCreateQuiz} className="row g-3">
                  <div className="col-md-7">
                    <label className="small fw-bold text-muted mb-1">Quiz Title</label>
                    <input 
                      type="text" 
                      className="form-control bg-white text-dark border" 
                      placeholder="e.g., Database Systems - Quiz 01" 
                      value={newQuizTitle} 
                      onChange={e => setNewQuizTitle(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="small fw-bold text-muted mb-1">Allowed Attempts</label>
                    <select className="form-select bg-white text-dark border" value={attemptLimit} onChange={e => setAttemptLimit(e.target.value)}>
                      <option value="1">1 Attempt</option>
                      <option value="2">2 Attempts</option>
                      <option value="3">3 Attempts</option>
                      <option value="5">5 Attempts</option>
                    </select>
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <button type="submit" className="btn text-white w-100 fw-semibold" style={{ backgroundColor: '#6f42c1' }}>
                      Create Quiz Template
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* --- QUIZ ROW RENDERING LOOP MATRIX --- */}
            <h5 className="fw-bold text-dark mb-3 px-1 text-start">Available Quizzes ({quizzes.length})</h5>
            {quizzes.length === 0 ? (
              <div className="card border-0 shadow-sm p-5 text-center rounded-4 bg-white">
                <p className="text-muted mb-0">No active assessments hosted under this track metric yet.</p>
              </div>
            ) : (
              <div className="row g-3 text-start">
                {quizzes.map((quizItem) => ( 
                  <div className="col-12" key={quizItem.id}>
                    <div className="card p-4 shadow-sm border-0 bg-white d-flex flex-md-row justify-content-between align-items-md-center gap-3" style={{ borderRadius: '1rem' }}>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          <span className="badge bg-light text-primary border px-2.5 py-1.5 fs-7 fw-semibold">ID: #{quizItem.id}</span>
                          
                          {editingQuizId === quizItem.id ? (
                            <div className="d-flex gap-2 align-items-center my-1 flex-grow-1" style={{ minWidth: '250px' }}>
                              <input 
                                type="text" 
                                className="form-control form-control-sm border bg-white text-dark rounded"
                                value={editingTitle}
                                onChange={e => setEditingTitle(e.target.value)}
                              />
                              <button className="btn btn-sm btn-success px-2 py-1" onClick={() => handleSaveEdit(quizItem.id)}>Save</button>
                              <button className="btn btn-sm btn-light border px-2 py-1" onClick={() => setEditingQuizId(null)}>Cancel</button>
                            </div>
                          ) : (
                            <h5 className="fw-bold text-dark mb-0 ms-1">{quizItem.title}</h5>
                          )}
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center gap-2">
                        {userRole === 'instructor' ? (
                          <>
                            {editingQuizId !== quizItem.id && (
                              <button 
                                className="btn btn-sm btn-outline-secondary fw-medium px-3 py-2 rounded-3"
                                onClick={() => { setEditingQuizId(quizItem.id); setEditingTitle(quizItem.title); }}
                              >
                                <i className="bi bi-pencil-square me-1"></i> Edit Title
                              </button>
                            )}
                            
                            <Link to={`/courses/${courseId}/quizzes/${quizItem.id}`} className="btn btn-dark fw-semibold px-4 py-2 rounded-3 btn-sm shadow-sm">
                              <i className="bi bi-gear-fill me-1"></i> Manage Questions
                            </Link>

                            {/* STABLE BUTTON EXPLICITLY HOOKED TO quizItem */}
                            {editingQuizId !== quizItem.id && (
                              <button 
                                className="btn btn-sm btn-outline-danger fw-medium px-2.5 py-2 rounded-3"
                                onClick={() => handleDeleteQuiz(quizItem.id, quizItem.title)}
                              >
                                <i className="bi bi-trash3-fill"></i>
                              </button>
                            )}
                          </>
                        ) : (
                          <Link to={`/courses/${courseId}/quizzes/${quizItem.id}`} className="btn btn-primary fw-semibold px-4 py-2 rounded-3 btn-sm shadow-sm">
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