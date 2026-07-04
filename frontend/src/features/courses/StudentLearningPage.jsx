import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function StudentLearningPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessonsMap, setLessonsMap] = useState({});
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || '/api';
  const progressStorageKey = `learnify-course-progress-${courseId}`;

  useEffect(() => {
    // Temporary local progress state until enrollment progress APIs are connected.
    // Teammate integration target:
    // 1) GET /api/enrollment/progress/<student_id>/course/<course_id>
    // 2) Replace local sessionStorage usage with backend response state.
    const saved = window.sessionStorage.getItem(progressStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompletedLessonIds(parsed);
        }
      } catch {
        setCompletedLessonIds([]);
      }
    } else {
      setCompletedLessonIds([]);
    }

    loadCourseAndModules();
  }, [courseId]);

  const loadCourseAndModules = () => {
    setLoading(true);
    setError('');
    setCourse(null);
    setModules([]);
    setLessonsMap({});

    fetch(`${baseUrl}/courses/${courseId}`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : res.json().then((e) => { throw new Error(e.error || 'Failed to load course'); }))
      .then((courseData) => {
        setCourse(courseData || null);
        return fetch(`${baseUrl}/courses/${courseId}/modules`, { credentials: 'include' });
      })
      .then((res) => res.ok ? res.json() : res.json().then((e) => { throw new Error(e.error || 'Failed to load modules'); }))
      .then((moduleData) => {
        const normalizedModules = moduleData || [];
        setModules(normalizedModules);
        normalizedModules.forEach((module) => fetchLessons(module.id));
      })
      .catch((err) => setError(err.message || 'Failed to load learning page'))
      .finally(() => setLoading(false));
  };

  const fetchLessons = (moduleId) => {
    if (lessonsMap[moduleId]) {
      return;
    }

    fetch(`${baseUrl}/courses/modules/${moduleId}/lessons`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : res.json().then((e) => { throw new Error(e.error || 'Failed to load lessons'); }))
      .then((lessonData) => setLessonsMap((prev) => ({ ...prev, [moduleId]: lessonData || [] })))
      .catch((err) => setLessonsMap((prev) => ({ ...prev, [moduleId]: err.message || 'Failed to load lessons' })));
  };

  const getModuleStatus = (moduleId) => {
    const moduleLessons = lessonsMap[moduleId];
    if (!Array.isArray(moduleLessons) || moduleLessons.length === 0) {
      return 'To Do';
    }
    const doneCount = moduleLessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
    return doneCount === moduleLessons.length ? 'Completed' : 'To Do';
  };

  const openLessonPage = (lessonId) => {
    navigate(`/learn/course/${courseId}/lesson/${lessonId}`);
  };

  return (
    <div className="bg-light min-vh-100 py-5 text-dark">
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <div>
            <h1 className="fw-bold mb-1 text-dark">Course Learning Workspace</h1>
            <p className="text-muted mb-0">Read modules, open lessons, and continue your study flow on a dedicated page.</p>
          </div>
          <button className="btn btn-outline-secondary rounded-pill px-4 fw-medium" onClick={() => navigate('/dashboard/student')}>
            <i className="bi bi-arrow-left me-2"></i>Back To Dashboard
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ color: '#6f42c1' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
          </div>
        ) : (
          <>
            {course && (
              <div className="card shadow-sm border-0 rounded-3 bg-white mb-4">
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

            {modules.length === 0 ? (
              <div className="text-center p-5 bg-white rounded-3 text-muted shadow-sm">
                <i className="bi bi-box-seam fs-1 text-secondary mb-2 d-block"></i>
                <p className="mb-0">No modules found for this course yet.</p>
              </div>
            ) : (
              <div className="accordion accordion-flush shadow-sm rounded-3 overflow-hidden" id="studentLearningAccordion">
                {modules.map((module, index) => {
                  const isFirst = index === 0;
                  const lessons = lessonsMap[module.id];
                  const hasError = typeof lessons === 'string';

                  return (
                    <div className="accordion-item border-0 border-bottom" key={module.id}>
                      <h2 className="accordion-header bg-white">
                        <button
                          className={`accordion-button fw-bold ${!isFirst ? 'collapsed' : ''}`}
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#learningModule${module.id}`}
                          onClick={() => fetchLessons(module.id)}
                        >
                          <span>Module {module.order_no}: {module.title}</span>
                          <span className={`badge rounded-pill ms-2 ${getModuleStatus(module.id) === 'Completed' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-dark border border-warning-subtle'}`}>
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

                          {!lessons ? (
                            <div className="text-center text-muted small p-3">
                              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                              Loading lesson access...
                            </div>
                          ) : hasError ? (
                            <div className="alert alert-warning py-2 small mb-0 shadow-sm border-0 border-start border-warning border-4">
                              <i className="bi bi-exclamation-circle-fill me-2"></i>{lessons}
                            </div>
                          ) : lessons.length === 0 ? (
                            <div className="text-muted small fst-italic text-center py-3">No lessons found in this module.</div>
                          ) : (
                            <ul className="list-group list-group-flush border rounded-3 shadow-sm overflow-hidden">
                              {lessons.map((lesson) => (
                                <li key={lesson.id} className="list-group-item d-flex align-items-center bg-white py-3">
                                  <span className="badge bg-secondary rounded-pill me-3 px-3">Lesson {lesson.order_no}</span>
                                  <span className="fw-medium text-dark">{lesson.title}</span>
                                  {completedLessonIds.includes(lesson.id) && (
                                    <span className="badge bg-success-subtle text-success border border-success-subtle ms-2">Completed</span>
                                  )}
                                  <button
                                    className="btn btn-sm btn-outline-primary rounded-pill ms-auto"
                                    onClick={() => openLessonPage(lesson.id)}
                                  >
                                    Open Lesson
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
