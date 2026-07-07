import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

export default function QuizPage() { 
  const { quizId, courseId } = useParams(); 
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('student');
  const [studentMarks, setStudentMarks] = useState([]);

  // New Attempt Tracker States
  const [quizMeta, setQuizMeta] = useState(null);
  const [studentAttempts, setStudentAttempts] = useState(0);

  // Instructor Creation Form State
  const [newQuestion, setNewQuestion] = useState({
    question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A'
  });

  // QUESTION EDITING STATES RESTORED
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingQuestionData, setEditingQuestionData] = useState({
    question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A'
  });

  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    axios.get(`${baseUrl}/auth/current-user`, { withCredentials: true })
      .then(res => {
        if (res.data && res.data.logged_in) {
          const operationalRole = String(res.data.user_role || res.data.role || 'student').toLowerCase();
          setUserRole(operationalRole);
        }
      })
      .catch(err => console.error("Identity lookup failed:", err));

    refreshQuestions();

    if (userRole === 'instructor') {
    loadInstructorMarksReport();
    

    const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('view') === 'marks') {
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 600); // Gives data half a second to fetch and render first
      }
  }
  }, [quizId, userRole]);

  const refreshQuestions = () => {
    axios.get(`${baseUrl}/quizzes/${quizId}`, { withCredentials: true })
      .then(res => {
        setQuizMeta(res.data.meta);
        setQuestions(res.data.questions || []);
        setStudentAttempts(res.data.current_student_attempts || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching quiz data", err);
        setLoading(false);
      });
  };

  const handleCreateQuestion = (e) => {
    e.preventDefault();
    axios.post(`${baseUrl}/quizzes/${quizId}/questions`, newQuestion, { withCredentials: true })
      .then(() => {
        alert("Question appended successfully!");
        setNewQuestion({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A' });
        refreshQuestions();
      })
      .catch(err => console.error("Creation failed:", err));
  };

  // HANDLERS TO EDIT EXISTING QUESTIONS
  const startEditing = (q) => {
    setEditingQuestionId(q.id);
    setEditingQuestionData({
      question_text: q.question_text || q.text || '',
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      option_e: q.option_e || '',
      correct_option: q.correct_option || 'A'
    });
  };

  const handleSaveQuestionEdit = (e, qId) => {
    e.preventDefault();
    axios.put(`${baseUrl}/questions/${qId}`, editingQuestionData, { withCredentials: true })
      .then(() => {
        alert("Question updated successfully!");
        setEditingQuestionId(null);
        refreshQuestions();
      })
      .catch(err => {
        console.error("Failed to update question parameters:", err);
        alert("Error updating question details.");
      });
  };

  const handleOptionSelect = (questionId, optionLetter) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    const formattedAnswers = Object.entries(selectedAnswers).map(([qId, ans]) => ({
      question_id: parseInt(qId),
      answer: ans
    }));

    axios.post(`${baseUrl}/quizzes/${quizId}/submit`, formattedAnswers, { withCredentials: true })
      .then(res => {
        setQuizResult(res.data);
        alert(`Quiz submitted successfully!`);
      })
      .catch(err => {
        console.error("Quiz submission crashed:", err);
        alert("Error saving quiz responses.");
      });
  };

  const loadInstructorMarksReport = () => {
    axios.get(`${baseUrl}/quizzes/${quizId}/instructor-marks`, { withCredentials: true })
      .then(res => {
        if (res.data && res.data.success) {
          setStudentMarks(res.data.marks || []);
        }
      })
      .catch(err => console.error("Error loading marks registry matrix:", err));
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4 text-dark text-start">
      <div className="container">
        <div className="mb-4 d-flex justify-content-between align-items-center">

          {userRole === 'student' ? (
            <Link to={`/courses/${courseId}/learning`} className="btn btn-sm btn-outline-secondary rounded-3">
              ← Back to Learning Workspace
            </Link>

          ) : (
            <Link to="/dashboards/instructor" className="btn btn-sm btn-outline-secondary rounded-3">
              ← Back to Dashboard Workspace
            </Link>
          )
          }



          <span className="badge bg-secondary px-3 py-2 text-capitalize">Logged as: {userRole}</span>
        </div>

        {userRole === 'instructor' && (
          <div className="row g-4">
            {/* Left Side: Create Form */}
            <div className="col-md-5">
              <div className="card p-4 shadow-sm border-0 bg-white sticky-top" style={{ top: '2rem', borderRadius: '1rem' }}>
                <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-plus-circle me-2 text-primary"></i> Add New Question</h5>
                <form onSubmit={handleCreateQuestion} className="row g-2">
                  <div className="col-12">
                    <label className="small fw-semibold text-muted">Question Text</label>
                    <textarea className="form-control bg-white text-dark border" rows="2" required value={newQuestion.question_text} onChange={e => setNewQuestion({...newQuestion, question_text: e.target.value})} />
                  </div>
                  {['a', 'b', 'c', 'd', 'e'].map(letter => (
                    <div className="col-12" key={letter}>
                      <label className="small fw-semibold text-muted">Option {letter.toUpperCase()}</label>
                      <input type="text" className="form-control form-control-sm bg-white text-dark border" value={newQuestion[`option_${letter}`]} onChange={e => setNewQuestion({...newQuestion, [`option_${letter}`]: e.target.value})} required={letter !== 'e'} />
                    </div>
                  ))}
                  <div className="col-12 mb-2">
                    <label className="small fw-semibold text-muted">Correct Answer Key</label>
                    <select className="form-select form-select-sm bg-white text-dark border" value={newQuestion.correct_option} onChange={e => setNewQuestion({...newQuestion, correct_option: e.target.value})}>
                      {['A', 'B', 'C', 'D', 'E'].map(l => <option key={l} value={l}>Option {l}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn text-white w-100 fw-semibold rounded-3 mt-2" style={{ backgroundColor: '#6f42c1' }}>Add to Quiz</button>
                </form>
              </div>
            </div>

            <div className="row g-4 mt-2">
              <div className="col-12">
                <div className="card p-4 shadow-sm border-0 bg-white rounded-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">
                      <i className="bi bi-journal-check me-2 text-success"></i>Student Attempt Marks Registry
                    </h5>
                    <span className="badge bg-success-subtle text-success px-3 py-2 border border-success-subtle">
                      Total Attempts: {studentMarks.length}
                    </span>
                  </div>

                  {studentMarks.length === 0 ? (
                    <div className="text-center py-4 text-muted bg-light rounded-3">
                      No students have attempted this quiz module yet.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle border-0 text-start">
                        <thead className="table-light">
                          <tr>
                            <th className="py-2.5 ps-3 text-dark small fw-bold">Student Name</th>
                            <th className="py-2.5 text-dark small fw-bold">Raw Score</th>
                            <th className="py-2.5 text-dark small fw-bold">Marks (Out of 100)</th>
                            <th className="py-2.5 text-dark small fw-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentMarks.map((entry, index) => {
                            // Determine a styling color based on performance thresholds
                            const passTheme = entry.percentage_marks >= 50 ? 'bg-success' : 'bg-danger';
                            
                            return (
                              // ✅ FIX: Combined index with student_id ensures unique keys for multiple attempts
                              <tr key={`${entry.student_id}-${index}`}>
                                <td className="ps-3 fw-medium text-dark">{entry.student_name}</td>
                                <td className="text-muted small">
                                  {entry.raw_score} / {entry.total_questions} Qs
                                </td>
                                <td>
                                  <span className="fw-bold text-primary" style={{ fontSize: '1.05rem' }}>
                                    {entry.percentage_marks}%
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${passTheme} px-2 py-1 small rounded-pill text-white`}>
                                    {entry.percentage_marks >= 50 ? 'Passed' : 'Needs Review'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Questions Matrix & Inline Editor */}
            <div className="col-md-7">
              <h5 className="fw-bold text-dark mb-3 px-1">Active Questions ({questions.length})</h5>
              {questions.length === 0 ? (
                <div className="card border-0 shadow-sm p-4 text-center bg-white rounded-3 text-muted">No questions loaded for this quiz yet.</div>
              ) : (
                questions.map((q, idx) => (
                  <div className="card p-4 shadow-sm border-0 bg-white mb-3 rounded-4" key={q.id || idx}>
                    
                    {editingQuestionId === q.id ? (
                      <form onSubmit={(e) => handleSaveQuestionEdit(e, q.id)} className="row g-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge bg-warning text-dark">Editing Question #{idx + 1}</span>
                          <button type="button" className="btn-close" onClick={() => setEditingQuestionId(null)}></button>
                        </div>
                        <div className="col-12">
                          <textarea className="form-control bg-white text-dark border" rows="2" required value={editingQuestionData.question_text} onChange={e => setEditingQuestionData({...editingQuestionData, question_text: e.target.value})} />
                        </div>
                        {['a', 'b', 'c', 'd', 'e'].map(letter => (
                          <div className="col-6" key={letter}>
                            <input type="text" className="form-control form-control-sm bg-white text-dark border" placeholder={`Option ${letter.toUpperCase()}`} value={editingQuestionData[`option_${letter}`]} onChange={e => setEditingQuestionData({...editingQuestionData, [`option_${letter}`]: e.target.value})} required={letter !== 'e'} />
                          </div>
                        ))}
                        <div className="col-12 d-flex gap-2 align-items-center mt-2">
                          <select className="form-select form-select-sm w-50 bg-white text-dark border" value={editingQuestionData.correct_option} onChange={e => setEditingQuestionData({...editingQuestionData, correct_option: e.target.value})}>
                            {['A', 'B', 'C', 'D', 'E'].map(l => <option key={l} value={l}>Correct: {l}</option>)}
                          </select>
                          <button type="submit" className="btn btn-sm btn-success px-4 rounded-3">Save Changes</button>
                          <button type="button" className="btn btn-sm btn-light border px-3 rounded-3" onClick={() => setEditingQuestionId(null)}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold text-dark mb-1">Q{idx + 1}: {q.question_text || q.text}</h6>
                          <button className="btn btn-sm btn-outline-primary py-1 px-2.5 rounded-3" onClick={() => startEditing(q)}>
                            <i className="bi bi-pencil-fill me-1"></i>Edit
                          </button>
                        </div>
                        <div className="row g-2 ps-2">
                          {['a', 'b', 'c', 'd'].map(l => (
                            <div className="col-6 small text-muted" key={l}>
                              <span className={q.correct_option === l.toUpperCase() ? "text-success fw-bold" : ""}>
                                {l.toUpperCase()}. {q[`option_${l}`]}
                              </span>
                            </div>
                          ))}
                          {q.option_e && q.option_e !== "N/A" && (
                            <div className="col-6 small text-muted">
                              <span className={q.correct_option === "E" ? "text-success fw-bold" : ""}>E. {q.option_e}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 pt-2 border-top small fw-bold text-success">
                          Correct Key: Option {q.correct_option}
                        </div>
                      </>
                    )}

                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {userRole === 'student' && (
          <div className="row justify-content-center">
            <div className="col-lg-9">
              
              {/* Lockout Check Screen Layout */}
              {!quizResult && quizMeta && studentAttempts >= quizMeta.attempt_limit ? (
                <div className="card border-0 shadow-sm p-5 text-center rounded-4 bg-white mb-4">
                  <i className="bi bi-lock-fill display-3 text-danger mb-3"></i>
                  <h3 className="fw-bold text-dark mb-1">Attempt Limit Reached</h3>
                  <p className="text-muted mb-4">
                    You have already attempted this quiz <b>{studentAttempts}</b> out of <b>{quizMeta.attempt_limit}</b> allowed times.
                  </p>
                  <Link to={`/courses/${courseId}/learning`} className="btn btn-secondary rounded-pill px-4 fw-semibold">
                    Return to Learning Workspace
                  </Link>
                </div>
              ) : quizResult ? (
                <div className="card border-0 shadow-sm p-5 text-center rounded-4 bg-white mb-4">
                  <i className="bi bi-check-circle-fill display-3 text-success mb-3"></i>
                  <h3 className="fw-bold text-dark mb-1">Quiz Finished!</h3>
                  <p className="text-muted mb-4">{quizResult.message || "Your test submission has been recorded."}</p>
                  
                  <div className="p-4 bg-light rounded-3 d-inline-block mx-auto mb-4" style={{ minWidth: '220px' }}>
                    <span className="small text-muted fw-bold text-uppercase d-block mb-1">Your Total Score</span>
                    <h1 className="display-4 fw-bold text-primary mb-0">{quizResult.score} / {quizResult.total_questions}</h1>
                  </div>
                  <div>
                    <Link to={`/courses/${courseId}/learning`} className="btn text-white rounded-pill px-4 fw-semibold" style={{ backgroundColor: '#6f42c1' }}>
                      Return to Learning Workspace
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleQuizSubmit}>
                  <div className="card border-0 p-4 shadow-sm bg-white mb-4 rounded-4">
                    <h4 className="fw-bold text-dark mb-1">Assessment Evaluation Sheet</h4>
                    <p className="text-muted small mb-0">Please answer all multi-choice questions listed below carefully before finishing.</p>
                  </div>

                  {questions.length === 0 ? (
                    <div className="card border-0 shadow-sm p-5 text-center bg-white rounded-4 text-muted">
                      <i className="bi bi-exclamation-octagon display-4 mb-2 text-warning"></i>
                      <p className="mb-0">This quiz template has been setup but doesn't contain questions yet.</p>
                    </div>
                  ) : (
                    <>
                      {questions.map((q, idx) => (
                        <div className="card p-4 shadow-sm border-0 bg-white mb-3 rounded-4 text-start" key={q.id || idx}>
                          <h5 className="fw-bold text-dark mb-3">
                            <span className="text-primary me-2">Question {idx + 1}.</span>
                            {q.question_text || q.text}
                          </h5>
                          
                          <div className="d-flex flex-column gap-2 ps-1">
                            {['a', 'b', 'c', 'd'].map((letter) => {
                              const upperLetter = letter.toUpperCase();
                              const isSelected = selectedAnswers[q.id] === upperLetter;
                              return (
                                <div 
                                  key={letter}
                                  className={`p-3 border rounded-3 cursor-pointer d-flex align-items-center transition-all ${isSelected ? 'border-primary bg-primary-subtle' : 'bg-light hover-bg-white'}`}
                                  onClick={() => handleOptionSelect(q.id, upperLetter)}
                                  style={{ transition: 'all 0.15s ease', cursor: 'pointer' }}
                                >
                                  <div className={`rounded-circle border d-flex align-items-center justify-content-center me-3 fw-semibold ${isSelected ? 'bg-primary text-white border-primary' : 'bg-white text-secondary'}`} style={{ width: '28px', height: '28px', minWidth: '28px' }}>
                                    {upperLetter}
                                  </div>
                                  <span className={`fw-medium ${isSelected ? 'text-primary font-weight-bold' : 'text-dark'}`}>
                                    {q[`option_${letter}`]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <div className="text-end mt-4 mb-5">
                        <button type="submit" className="btn btn-lg text-white font-weight-bold shadow px-5 py-2.5 rounded-pill" style={{ backgroundColor: '#6f42c1' }}>
                          Finalize and Submit Quiz
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}