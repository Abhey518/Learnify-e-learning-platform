import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

export default function QuizPage({ userRole = 'student' }) { 
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Instructor Form States
  const [newQuestion, setNewQuestion] = useState({
    text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A'
  });

  // GET Request: Fetch Quiz Questions
  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/api/quizzes/${quizId}`)
      .then(res => {
        setQuestions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching quiz data", err);
        setLoading(false);
      });
  }, [quizId]);

  // Student: Option index selection management
  const handleOptionSelect = (questionId, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex
    });
  };

  // POST Request: Student Quiz Submission
  const handleQuizSubmit = (e) => {
    e.preventDefault();
    axios.post(`http://127.0.0.1:5000/api/quizzes/${quizId}/submit`, selectedAnswers)
      .then(res => {
        if (res.data.success) {
          setQuizResult({
            score: res.data.score,
            total: res.data.total_questions,
            status: 'Completed'
          });
        }
      })
      .catch(err => console.error("Submission failed", err));
  };

  // Instructor: Publish a new question straight to Supabase
  const handleCreateQuestion = (e) => {
    e.preventDefault();
    
    const payload = {
      quiz_id: parseInt(quizId),
      question_text: newQuestion.text,
      option_a: newQuestion.option_a,
      option_b: newQuestion.option_b,
      option_c: newQuestion.option_c,
      option_d: newQuestion.option_d,
      option_e: newQuestion.option_e.trim() || "N/A",
      correct_option: newQuestion.correct_option
    };

    axios.post(`http://127.0.0.1:5000/api/quizzes/${quizId}/questions`, payload)
      .then(res => {
        alert("Question published and saved to Supabase successfully!");
        
        const savedQuestion = res.data.id ? res.data : {
          ...newQuestion,
          id: Date.now(),
          quiz_id: quizId,
          question_text: newQuestion.text,
          option_e: newQuestion.option_e.trim() || "N/A"
        };

        setQuestions([...questions, savedQuestion]);
        setNewQuestion({ text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A' });
      })
      .catch(err => {
        console.error("Failed to add question to database:", err);
        alert("Error saving question.");
      });
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border" style={{ color: '#6f42c1' }} role="status"></div>
          <h5 className="mt-3 fw-semibold text-secondary">Loading Quiz Content...</h5>
        </div>
      </div>
    );
  }

  return (
    /* 🌟 Fixed: Added border-0 shadow-none to eliminate side vertical lines */
    <div className="bg-light min-vh-100 d-flex flex-column border-0 shadow-none">
      
      {/* 🌟 Fixed: Changed container to container-fluid px-md-5 for a beautifully broad full-width grid layout */}
      <div className="container-fluid px-md-5 my-5 py-3 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-9">
            
            {/* --- INSTRUCTOR PANEL VIEW --- */}
            {userRole === 'instructor' && (
              <>
                <div className="text-center mb-4">
                  <div className="p-3 mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm" style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-sliders fs-3" style={{ color: '#6f42c1' }}></i>
                  </div>
                  <h2 className="fw-bold text-dark">Quiz Management</h2>
                  <p className="text-muted small">Create and modify test parameters for Quiz #{quizId}</p>
                </div>

                <div className="card p-4 p-md-5 shadow-lg border-0 bg-white mb-4" style={{ borderRadius: '1.5rem' }}>
                  <h4 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                    <i className="bi bi-plus-circle-fill" style={{ color: '#6f42c1' }}></i> Add Multiple Choice Question
                  </h4>
                  <form onSubmit={handleCreateQuestion}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-secondary small">Question Content / Prompt</label>
                      <input type="text" className="form-control py-2.5 rounded-3" value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} placeholder="e.g., What is the default port for a Flask server?" required />
                    </div>
                    
                    <label className="form-label fw-semibold text-secondary small">Answer Options Matrix</label>
                    <div className="row g-3 mb-3">
                      <div className="col-sm-6">
                        <input type="text" className="form-control py-2 rounded-3" placeholder="Option A" value={newQuestion.option_a} onChange={e => setNewQuestion({...newQuestion, option_a: e.target.value})} required />
                      </div>
                      <div className="col-sm-6">
                        <input type="text" className="form-control py-2 rounded-3" placeholder="Option B" value={newQuestion.option_b} onChange={e => setNewQuestion({...newQuestion, option_b: e.target.value})} required />
                      </div>
                      <div className="col-sm-6">
                        <input type="text" className="form-control py-2 rounded-3" placeholder="Option C" value={newQuestion.option_c} onChange={e => setNewQuestion({...newQuestion, option_c: e.target.value})} required />
                      </div>
                      <div className="col-sm-6">
                        <input type="text" className="form-control py-2 rounded-3" placeholder="Option D" value={newQuestion.option_d} onChange={e => setNewQuestion({...newQuestion, option_d: e.target.value})} required />
                      </div>
                      <div className="col-sm-6">
                        <input type="text" className="form-control py-2 rounded-3" placeholder="Option E (Optional - e.g., None of the above)" value={newQuestion.option_e} onChange={e => setNewQuestion({...newQuestion, option_e: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-secondary small">Designated Correct Answer Key</label>
                      <select className="form-select py-2.5 rounded-3" value={newQuestion.correct_option} onChange={e => setNewQuestion({...newQuestion, correct_option: e.target.value})}>
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                        <option value="E">Option E</option>
                      </select>
                    </div>
                    <button type="submit" className="btn text-white fw-semibold w-100 py-3 shadow-sm" style={{ backgroundColor: '#6f42c1', borderRadius: '0.75rem' }}>
                      Publish Question to Quiz Stack
                    </button>
                  </form>
                </div>

                <h5 className="fw-bold text-dark mt-5 mb-3 px-1">Active Questions View Matrix ({questions.length})</h5>
                {questions.length === 0 ? (
                  <div className="card border-0 shadow-sm p-4 text-center rounded-4"><p className="text-muted mb-0">No questions mapped to this resource yet.</p></div>
                ) : (
                  questions.map((q, index) => (
                    <div className="card p-4 mb-3 shadow-sm border-0 bg-white" style={{ borderRadius: '1rem' }} key={q.id}>
                      <h5 className="fw-bold text-dark mb-3">{index + 1}. {q.text || q.question_text}</h5>
                      <div className="row g-2 small text-muted ms-1">
                        <div className={`col-10 py-1 ${q.correct_option === 'A' ? 'fw-bold text-success' : ''}`}>A. {q.option_a} {q.correct_option === 'A' && '✓'}</div>
                        <div className={`col-10 py-1 ${q.correct_option === 'B' ? 'fw-bold text-success' : ''}`}>B. {q.option_b} {q.correct_option === 'B' && '✓'}</div>
                        <div className={`col-10 py-1 ${q.correct_option === 'C' ? 'fw-bold text-success' : ''}`}>C. {q.option_c} {q.correct_option === 'C' && '✓'}</div>
                        <div className={`col-10 py-1 ${q.correct_option === 'D' ? 'fw-bold text-success' : ''}`}>D. {q.option_d} {q.correct_option === 'D' && '✓'}</div>
                        {q.option_e && q.option_e !== "N/A" && (
                          <div className={`col-10 py-1 ${q.correct_option === 'E' ? 'fw-bold text-success' : ''}`}>E. {q.option_e} {q.correct_option === 'E' && '✓'}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* --- STUDENT VIEW PANEL --- */}
            {userRole === 'student' && (
              <div className="card p-4 p-md-5 shadow-lg border-0 bg-white" style={{ borderRadius: '1.5rem' }}>
                <div className="text-center mb-4">
                  <div className="p-3 mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f3e8ff', width: '55px', height: '55px' }}>
                    <i className="bi bi-journal-check fs-4" style={{ color: '#6f42c1' }}></i>
                  </div>
                  <h2 className="fw-bold text-dark mb-1">Knowledge Assessment</h2>
                  <p className="text-muted small">Please answer all validation parameters carefully.</p>
                </div>

                {quizResult ? (
                  <div className="bg-light p-4 rounded-4 text-center border mt-2">
                    <div className="mb-2"><i className="bi bi-patch-check-fill display-5" style={{ color: '#6f42c1' }}></i></div>
                    <h4 className="fw-bold text-dark mb-3">Quiz Evaluation Success!</h4>
                    <hr className="my-3 opacity-25" />
                    <div className="row justify-content-center py-2">
                      <div className="col-6 border-end">
                        <span className="text-muted small d-block">AGGREGATE SCORE</span>
                        <span className="fs-3 fw-bold text-dark">{quizResult.score} / {quizResult.total}</span>
                      </div>
                      <div className="col-6">
                        <span className="text-muted small d-block">ENGINE STATUS</span>
                        <span className="badge mt-2 px-3 py-2 fs-7 fw-semibold" style={{ backgroundColor: '#f3e8ff', color: '#6f42c1' }}>{quizResult.status}</span>
                      </div>
                    </div>
                    <Link to="/courses" className="btn btn-outline-secondary btn-sm mt-4 px-4 py-2 fw-semibold" style={{ borderRadius: '0.5rem' }}>
                      Return to Course Track
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleQuizSubmit}>
                    {questions.map((q, qIndex) => (
                      <div key={q.id} className="mb-5 pb-4 border-bottom">
                        <h5 className="fw-bold text-dark mb-4 d-flex align-items-start gap-2 fs-5" style={{ lineHeight: '1.4' }}>
                          <span className="badge rounded-3 px-2.5 py-1.5 fs-7" style={{ backgroundColor: '#f3e8ff', color: '#6f42c1' }}>{qIndex + 1}</span>
                          {q.text || q.question_text}
                        </h5>
                        
                        <div className="d-flex flex-column gap-2.5 ms-md-4">
                          {[q.option_a, q.option_b, q.option_c, q.option_d, q.option_e].map((opt, oIndex) => {
                            if (!opt) return null;
                            if (oIndex === 4 && opt === "N/A") return null;
                            
                            const optionLetter = String.fromCharCode(65 + oIndex);
                            const isSelected = selectedAnswers[q.id] === oIndex;
                            
                            return (
                              <label 
                                key={oIndex} 
                                className="d-flex align-items-center gap-3 p-3 rounded-3 border transition-all" 
                                style={{ 
                                  cursor: 'pointer',
                                  backgroundColor: isSelected ? '#f3e8ff' : '#fff',
                                  borderColor: isSelected ? '#6f42c1' : '#dee2e6',
                                  borderWidth: isSelected ? '1.5px' : '1px',
                                }}
                              >
                                <input 
                                  type="radio" 
                                  name={`question-${q.id}`} 
                                  style={{ accentColor: '#6f42c1', width: '18px', height: '18px' }}
                                  checked={isSelected}
                                  onChange={() => handleOptionSelect(q.id, oIndex)}
                                  required
                                />
                                <span className="text-dark fs-6">
                                  <strong className="me-1" style={{ color: isSelected ? '#6f42c1' : '#495057' }}>{optionLetter}.</strong> {opt}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    
                    <button type="submit" className="btn text-white fw-semibold w-100 py-3 mt-3 shadow" style={{ backgroundColor: '#6f42c1', borderRadius: '0.75rem' }}>
                      Finalize & Submit Quiz Stack
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      <footer className="bg-dark text-light py-4 mt-auto">
        <div className="container text-center">
          <p className="mb-0 small text-white-50">&copy; {new Date().getFullYear()} Learnify Inc. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}