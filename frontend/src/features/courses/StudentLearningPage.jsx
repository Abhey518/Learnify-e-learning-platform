import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function StudentLearningPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessonsMap, setLessonsMap] = useState({});
  
  // Holds dynamic quiz list tracking arrays grouped by module IDs
  const [quizzesMap, setQuizzesMap] = useState({});

  const [completedLessonIds, setCompletedLessonIds] = useState([]); 
  const [completedQuizIds, setCompletedQuizIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [progressData, setProgressData] = useState(null);
  const [showProgress, setShowProgress] = useState(false);

  // Course Review State Management
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || '/api';
  const progressStorageKey = `learnify-course-progress-${courseId}`;

  useEffect(() => {
    loadCourseModulesAndProgress();
  }, [courseId]);

  const loadCourseModulesAndProgress = async () => {
    setLoading(true);
    setError('');
    setCourse(null);
    setModules([]);
    setLessonsMap({});
    setQuizzesMap({}); // Clear out active caches
    setCompletedLessonIds([]);
    
    try {
      // Fetch Course details
      const courseRes = await fetch(`${baseUrl}/courses/${courseId}`, { credentials: 'include' });
      const quizIdsRes = await fetch(`${baseUrl}/enrollment/progress/session/course/${courseId}/quizzes`, { credentials: 'include' });
      if (quizIdsRes.ok) {
        const quizIdsData = await quizIdsRes.json();
        if (quizIdsData.success && Array.isArray(quizIdsData.completed_quiz_ids)) {
          setCompletedQuizIds(quizIdsData.completed_quiz_ids);
        }
      }


      if (!courseRes.ok) throw new Error("Failed to load course details.");
      const courseData = await courseRes.json();
      setCourse(courseData);

      // Fetch Modules
      const modulesRes = await fetch(`${baseUrl}/courses/${courseId}/modules`, { credentials: 'include' });
      if (!modulesRes.ok) throw new Error("Failed to load course modules.");
      const moduleData = await modulesRes.json();
      const normalizedModules = moduleData || [];
      setModules(normalizedModules);

      // Fetch Overall Dashboard Progress Layout Matrices
      const progressRes = await fetch(`${baseUrl}/enrollment/progress/session/course/${courseId}`, { credentials: 'include' });
      if (progressRes.ok) {
        const data = await progressRes.json();
        if (data.success && data.progress) {
          setProgressData(data.progress);
        }
      }

      // Fetch the exact individual completed lesson IDs array from DB
      const lessonIdsRes = await fetch(`${baseUrl}/enrollment/progress/session/course/${courseId}/lessons`, { credentials: 'include' });
      if (lessonIdsRes.ok) {
        const lessonIdsData = await lessonIdsRes.json();
        if (lessonIdsData.success && Array.isArray(lessonIdsData.completed_lesson_ids)) {
          setCompletedLessonIds(lessonIdsData.completed_lesson_ids);
        }
      }

      // Fetch Existing Course Reviews
      await fetchCourseReviews();

      // Pre-load lessons and quizzes for the first active module container
      if (normalizedModules.length > 0) {
        handleModuleAccordionActivation(normalizedModules[0].id);
      }

    } catch (err) {
      setError(err.message || 'Failed to sync learning page assets.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseReviews = async () => {
    try {
      const res = await fetch(`${baseUrl}/courses/${courseId}/reviews`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.warn("Reviews endpoint loading fallback triggered:", err);
    }
  };

  // Fires on accordion opening to load content blocks simultaneously
  const handleModuleAccordionActivation = (moduleId) => {
    fetchLessons(moduleId);
    fetchModuleQuizzes(moduleId);
  };

  const fetchLessons = (moduleId) => {
    if (lessonsMap[moduleId]) return;

    fetch(`${baseUrl}/courses/modules/${moduleId}/lessons`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : res.json().then((e) => { throw new Error(e.error || 'Failed to load lessons'); }))
      .then((lessonData) => {
        setLessonsMap((prev) => ({ ...prev, [moduleId]: lessonData || [] }));
      })
      .catch((err) => setLessonsMap((prev) => ({ ...prev, [moduleId]: err.message || 'Failed to load lessons' })));
  };

  // Fetches quizzes belonging strictly to individual module containers
  const fetchModuleQuizzes = (moduleId) => {
    if (quizzesMap[moduleId]) return;

    fetch(`${baseUrl}/courses/modules/${moduleId}/quizzes`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : res.json().then((e) => { throw new Error(e.error || 'Failed to load quizzes'); }))
      .then((quizData) => {
        setQuizzesMap((prev) => ({ ...prev, [moduleId]: quizData || [] }));
      })
      .catch((err) => setQuizzesMap((prev) => ({ ...prev, [moduleId]: err.message || 'Failed to load quizzes' })));
  };

  const handleToggleProgress = () => {
    setShowProgress(!showProgress);
  };

  const getModuleStatus = (moduleId) => {
    if (!progressData || !progressData.modules) return 'To Do';
    const targetMod = progressData.modules.find(m => m.module_id === moduleId);
    return targetMod && targetMod.is_completed ? 'Completed' : 'To Do';
  };

  const openLessonPage = (lessonId) => {
    navigate(`/courses/${courseId}/learning/${lessonId}`);
  };

  // Navigates testing students into their multiple choice assessment sheet runtime layout
  const openQuizPage = (quizId) => {
      navigate(`/courses/${courseId}/quizzes/${quizId}`);
  };

  // Submit student reviews
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError("Please write a short comment before submitting.");
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const res = await fetch(`${baseUrl}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          course_id: courseId,
          rating: rating, 
          comment: comment 
        }),
        credentials: 'include'
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || (data.errors ? Object.values(data.errors).join(", ") : "Failed to submit review.");
        throw new Error(errorMsg);
      }

      setReviewSuccess("Thank you! Your course review has been captured.");
      setComment('');
      setRating(5);
      
      fetchCourseReviews();
    } catch (err) {
      setReviewError(err.message || "Could not log review parameters.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <div className="bg-light min-vh-100 py-5 text-dark">
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 text-start">
          <div>
            <h1 className="fw-bold mb-1 text-dark">Course Learning Workspace</h1>
            <p className="text-muted mb-0">Read modules, open lessons, and continue your study flow on a dedicated page.</p>
          </div>
          
          <div className="d-flex gap-2">
            <button 
              className="btn text-white fw-semibold shadow-sm rounded-pill px-4 d-inline-flex align-items-center gap-2"
              style={{ backgroundColor: '#6f42c1', fontSize: '0.95rem' }}
              onClick={handleToggleProgress}
            >
              <i className="bi bi-bar-chart-line-fill"></i>
              {showProgress ? "Hide Progress" : "Check Progress"}
            </button>

            <button className="btn btn-outline-secondary rounded-pill px-4 fw-medium" onClick={() => navigate('/dashboards/student')}>
              <i className="bi bi-arrow-left me-2"></i>Back To Dashboard
            </button>
          </div>
        </div>

        {/* PROGRESS CARD DRAWER PANEL OVERLAY */}
        {showProgress && progressData && (
          <div className="card border-0 shadow-sm mb-4 text-start bg-white" style={{ borderRadius: '1.5rem' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold text-dark mb-3"><i className="bi bi-pie-chart-fill me-2" style={{ color: '#6f42c1' }}></i>Learning Metrics Matrix</h5>
              <div className="row text-center g-3 border-bottom pb-4 mb-4">
                <div className="col-md-4 border-end">
                  <span className="text-muted small fw-bold text-uppercase">Total Completion</span>
                  <h1 className="display-5 fw-bold my-1" style={{ color: '#6f42c1' }}>{progressData.overall_progress_percentage}%</h1>
                </div>
                <div className="col-md-4 border-end">
                  <span className="text-muted small fw-bold text-uppercase">Lessons Finished</span>
                  <h2 className="fw-bold text-dark my-1">{progressData.completed_lessons} / {progressData.total_lessons}</h2>
                </div>
                <div className="col-md-4">
                  <span className="text-muted small fw-bold text-uppercase">Quizzes Done</span>
                  <h2 className="fw-bold text-dark my-1">{progressData.completed_quizzes} / {progressData.total_quizzes}</h2>
                </div>
              </div>

              {/* Module Progress Breakdown Summary */}
              <h6 className="fw-bold text-dark mb-3">Module Breakdown Summary</h6>
              <div className="row g-3">
                {progressData.modules?.map((mod) => (
                  <div className="col-md-6" key={mod.module_id}>
                    <div className="p-3 border rounded-3 bg-light">
                      <div className="d-flex justify-content-between align-items-center small mb-1.5">
                        <span className="fw-bold text-dark text-truncate me-2">{mod.module_title}</span>
                        <span className={`badge rounded-pill ${mod.is_completed ? 'bg-success' : 'bg-secondary'}`}>{mod.is_completed ? 'Done' : 'In Progress'}</span>
                      </div>
                      <div className="progress" style={{ height: "6px", borderRadius: '3px' }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${mod.progress_percentage}%`, backgroundColor: '#6f42c1' }}></div>
                      </div>
                      <div className="d-flex justify-content-between text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                        <span>{mod.completed_lessons} / {mod.total_lessons} units</span>
                        <span>{mod.progress_percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ color: '#6f42c1' }} role="status"></div>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
          </div>
        ) : (
          <>
            {course && (
              <div className="card shadow-sm border-0 rounded-3 bg-white mb-4 text-start">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                    <div>
                      <h4 className="fw-bold mb-2 text-dark">{course.title}</h4>
                      <p className="text-muted mb-2">{course.description}</p>
                    </div>
                    <span className="badge rounded-pill px-3 py-2 bg-secondary">
                      <i className="bi bi-tag-fill me-1"></i>{course.category}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {course && (
              <div 
                className="card shadow-sm border-0 rounded-3 bg-white mb-4 overflow-hidden" 
                style={{ borderLeft: '5px solid #6f42c1' }}
              >
                <div className="card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-3">
                    {/* Discussion Icon container */}
                    <div 
                      className="p-3 rounded-circle d-flex align-items-center justify-content-center" 
                      style={{ backgroundColor: '#f3e8ff', width: '50px', height: '50px' }}
                    >
                      <i className="bi bi-chat-left-text-fill fs-5" style={{ color: '#6f42c1' }}></i>
                    </div>
                    {/* Card Title & Text details */}
                    <div>
                      <h5 className="fw-bold mb-1 text-dark">Course Discussion Forum</h5>
                      <p className="text-muted mb-0 small">
                        Clear your doubts, ask questions, and collaborate with your instructor and fellow students.
                      </p>
                    </div>
                  </div>
                  {/* Button that routes the student directly to this course's discussion forum */}
                  <button 
                    onClick={() => navigate(`/courses/${courseId}/forum`)}
                    className="btn text-white rounded-pill px-4 py-2 fw-medium shadow-sm transition-all"
                    style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }}
                  >
                    Go to Forum <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            )}

            {modules.length === 0 ? (
              <div className="text-center p-5 bg-white rounded-3 text-muted shadow-sm mb-4">
                <i className="bi bi-box-seam fs-1 text-secondary mb-2 d-block"></i>
                <p className="mb-0">No modules found for this course yet.</p>
              </div>
            ) : (
              <div className="accordion accordion-flush shadow-sm rounded-3 overflow-hidden text-start mb-4" id="studentLearningAccordion">
                {modules.map((module, index) => {
                  const isFirst = index === 0;
                  const lessons = lessonsMap[module.id];
                  const hasError = typeof lessons === 'string';

                  // Binds localized quizzes array to active row map scope
                  const quizzes = quizzesMap[module.id];
                  const hasQuizError = typeof quizzes === 'string';

                  return (
                    <div className="accordion-item border-0 border-bottom" key={module.id}>
                      <h2 className="accordion-header bg-white">
                        <button
                          className={`accordion-button fw-bold ${!isFirst ? 'collapsed' : ''}`}
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#learningModule${module.id}`}
                          
                          // Triggers retrieval for both contents cleanly upon toggle
                          onClick={() => handleModuleAccordionActivation(module.id)}
                        >
                          <span className='flex-grow-1'>Module {module.order_no}: {module.title}</span>
                          <span className={`badge rounded-pill me-4 ${getModuleStatus(module.id) === 'Completed' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-dark border border-warning-subtle'}`}>
                            {getModuleStatus(module.id)}
                          </span>
                        </button>
                      </h2>
                      <div
                        id={`learningModule${module.id}`}
                        className={`accordion-collapse collapse ${isFirst ? 'show' : ''}`}
                        data-bs-parent="#studentLearningAccordion"
                      >
                        <div className="accordion-body bg-light border-top">
                          {module.description && (
                            <p className="text-muted small mb-3 border-bottom pb-2"><i>{module.description}</i></p>
                          )}

                          {/* --- LESSON SECTIONS LOOP --- */}
                          <h6 className="fw-bold mb-2 text-dark small text-uppercase tracking-wider">
                            <i className="bi bi-book-half me-1.5 text-secondary"></i> Lessons
                          </h6>
                          {!lessons ? (
                            <div className="text-center text-muted small p-2 mb-3">
                              <div className="spinner-border spinner-border-sm me-2" role="status"></div>Loading...
                            </div>
                          ) : hasError ? (
                            <div className="alert alert-warning py-2 small mb-3 border-0 shadow-none"><i className="bi bi-exclamation-circle-fill me-2"></i>{lessons}</div>
                          ) : lessons.length === 0 ? (
                            <div className="text-muted small fst-italic text-start py-2 ps-2 mb-3 bg-white rounded border">No text units mapped to this curriculum framework yet.</div>
                          ) : (
                            <ul className="list-group list-group-flush border rounded-3 shadow-sm overflow-hidden mb-4">
                              {lessons.map((lesson) => {
                                const isLessonCompleted = completedLessonIds.includes(lesson.id);

                                return (
                                  <li key={lesson.id} className="list-group-item d-flex align-items-center bg-white py-3">
                                    <span className="badge bg-secondary rounded-pill me-3 px-3"> Lesson {lesson.order_no}</span>
                                    <span className="fw-medium text-dark">{lesson.title}</span>
                                    
                                    <span className={`badge rounded-pill ms-auto me-2 ${isLessonCompleted ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-dark border border-warning-subtle'}`}>
                                      {isLessonCompleted ? 'Completed' : 'To Do'}
                                    </span>
                                    
                                    <button
                                      className="btn btn-sm btn-outline-primary rounded-pill"
                                      onClick={() => openLessonPage(lesson.id)}
                                    >
                                      Open Lesson
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}

                          {/* --- INTEGRATED QUIZZES BLOCK SECTIONS LOOP --- */}
                          <h6 className="fw-bold mb-2 text-dark small text-uppercase tracking-wider mt-2">
                            <i className="bi bi-patch-question-fill me-1.5 text-secondary"></i> Assessments & Quizzes
                          </h6>
                          {!quizzes ? (
                            <div className="text-center text-muted small p-2">
                              <div className="spinner-border spinner-border-sm me-2" role="status"></div>Loading evaluations...
                            </div>
                          ) : hasQuizError ? (
                            <div className="alert alert-warning py-2 small border-0 shadow-none"><i className="bi bi-exclamation-circle-fill me-2"></i>{quizzes}</div>
                          ) : quizzes.length === 0 ? (
                            <div className="text-muted small fst-italic text-start py-2 ps-2 bg-white rounded border">No evaluations or assessments scheduled for this block.</div>
                          ) : (
                            <ul className="list-group list-group-flush border rounded-3 shadow-sm overflow-hidden">
                              {quizzes.map((quiz) => {
                                // Check if this quiz ID exists in our completion matrix state array
                                const isQuizCompleted = completedQuizIds.includes(quiz.id);

                                return (
                                  <li key={quiz.id} className="list-group-item d-flex align-items-center bg-white py-3">
                                    <div className="d-flex align-items-center">
                                      <span className="badge text-white rounded-pill me-3 px-3" style={{ backgroundColor: '#6f42c1' }}>Quiz</span>
                                      <span className="fw-medium text-dark">{quiz.title}</span>
                                      
                                      {/* DYNAMIC COMPLETION STATE BADGES INJECTION
                                      {isQuizCompleted && (
                                        <span className="badge bg-success-subtle text-success border border-success-subtle ms-2"> Completed</span>
                                      )} */}
                                    </div>

                                    <span className={`badge rounded-pill ms-auto me-2 ${isQuizCompleted ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-dark border border-warning-subtle'}`}>
                                      {isQuizCompleted ? 'Completed' : 'To Do'}
                                    </span>
                                    
                                    <button
                                      // className={`btn btn-sm rounded-pill ms-auto px-3 text-white ${isQuizCompleted ? 'btn-secondary bg-secondary' : ''}`}
                                      className={`btn btn-sm rounded-pill px-3 text-white ${isQuizCompleted ? 'btn-secondary bg-secondary' : ''}`}
                                      style={!isQuizCompleted ? { backgroundColor: '#6f42c1', fontSize: '0.85rem' } : { fontSize: '0.85rem' }}
                                      onClick={() => openQuizPage(quiz.id)}
                                    >
                                      {isQuizCompleted ? "Retake Attempt" : "Start Assessment →"}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* COURSE REVIEWS & FEEDBACK COMPONENT TAB SECTION */}
            <div className="card shadow-sm border-0 rounded-4 bg-white text-start mb-5 overflow-hidden">
              <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                <ul className="nav nav-tabs border-bottom-0">
                  <li className="nav-item">
                    <button className="nav-link active fw-bold px-4 py-2 text-dark border-0 border-bottom border-3" style={{ borderBottomColor: '#6f42c1 !important', fontSize: '1.05rem' }}>
                      <i className="bi bi-chat-square-heart-fill me-2 text-muted"></i>Course Feedback & Reviews
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body p-4">
                <div className="row g-4">
                  {/* Left Column: Review Form */}
                  <div className="col-lg-5 border-end pe-lg-4">
                    <h5 className="fw-bold mb-3 text-dark">Share Your Experience</h5>
                    
                    {reviewSuccess && <div className="alert alert-success py-2 small mb-3"><i className="bi bi-check-circle-fill me-2"></i>{reviewSuccess}</div>}
                    {reviewError && <div className="alert alert-danger py-2 small mb-3"><i className="bi bi-exclamation-octagon-fill me-2"></i>{reviewError}</div>}

                    <form onSubmit={handleReviewSubmit}>
                      <div className="mb-3">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Select Rating Star</label>
                        <div className="d-flex gap-1 fs-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i 
                              key={star}
                              className={`bi cursor-pointer ${star <= (hoverRating || rating) ? 'bi-star-fill text-warning' : 'bi-star text-secondary'}`}
                              style={{ transition: 'transform 0.15s ease' }}
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Your Detailed Review Comment</label>
                        <textarea 
                          className="form-control rounded-3" 
                          rows="4" 
                          placeholder="What did you think of the course quality, modules pace, or instruction delivery format?"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="btn w-100 rounded-pill text-white fw-bold py-2 shadow-sm"
                        style={{ backgroundColor: '#6f42c1' }}
                        disabled={submittingReview}
                      >
                        {submittingReview ? (
                          <><span className="spinner-border spinner-border-sm me-2"></span>Posting Feed...</>
                        ) : 'Submit Review'}
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Existing Reviews List */}
                  <div className="col-lg-7 ps-lg-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold mb-0 text-dark">Student Testimonials ({reviews.length})</h5>
                      {reviews.length > 0 && (
                        <span className="badge bg-warning text-dark fw-bold px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                          <i className="bi bi-star-fill"></i> {averageRating} Course Avg
                        </span>
                      )}
                    </div>

                    <div className="overflow-y-auto pe-1" style={{ maxHeight: '340px' }}>
                      {reviews.length === 0 ? (
                        <div className="text-center py-5 text-muted bg-light rounded-3 border border-dashed">
                          <i className="bi bi-chat-left-quote fs-2 text-secondary mb-2 d-block"></i>
                          <p className="mb-0 fst-italic">Be the first student to drop a evaluation score review for this program track!</p>
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          {reviews.map((rev, index) => (
                            <div className="p-3 border rounded-3 bg-light" key={rev.id || index}>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="d-flex align-items-center gap-2.5">
                                  <div className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold" style={{ backgroundColor: '#6f42c1', width: '36px', height: '36px', fontSize: '0.85rem' }}>
                                    {(rev.student_name || rev.user_name || 'ST').substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <h6 className="fw-bold mb-0 small text-dark">{rev.student_name || rev.user_name || 'Anonymous Student'}</h6>
                                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent Submission'}
                                    </small>
                                  </div>
                                </div>
                                <div className="text-warning small">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <i key={i} className={`bi ${i < (rev.rating || 5) ? 'bi-star-fill' : 'bi-star'}`} />
                                  ))}
                                </div>
                              </div>
                              <p className="mb-0 text-muted small lh-base" style={{ whiteSpace: 'pre-wrap' }}>{rev.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}