import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../core/supabaseClient';

export default function StudentLessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessonSequence, setLessonSequence] = useState([]);
  const [lessonDetailsMap, setLessonDetailsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || '/api';
  const progressStorageKey = `learnify-course-progress-${courseId}`;

  useEffect(() => {
    loadLessonWorkspace();
  }, [courseId]);

  const loadLessonWorkspace = async () => {
    setLoading(true);
    setError('');

    try {
      const courseRes = await fetch(`${baseUrl}/courses/${courseId}`, { credentials: 'include' });
      const courseData = await courseRes.json();
      if (!courseRes.ok) {
        throw new Error(courseData.error || 'Failed to load course');
      }
      setCourse(courseData || null);

      const modulesRes = await fetch(`${baseUrl}/courses/${courseId}/modules`, { credentials: 'include' });
      const modulesData = await modulesRes.json();
      if (!modulesRes.ok) {
        throw new Error(modulesData.error || 'Failed to load modules');
      }

      const orderedModules = [...(modulesData || [])].sort((a, b) => a.order_no - b.order_no);

      const sequence = [];
      for (const module of orderedModules) {
        const lessonsRes = await fetch(`${baseUrl}/courses/modules/${module.id}/lessons`, { credentials: 'include' });
        const lessonsData = await lessonsRes.json();
        if (!lessonsRes.ok) {
          throw new Error(lessonsData.error || 'Failed to load lessons');
        }

        const orderedLessons = [...(lessonsData || [])].sort((a, b) => a.order_no - b.order_no);
        orderedLessons.forEach((lesson) => {
          sequence.push({
            ...lesson,
            module_id: module.id,
            module_title: module.title,
            module_order_no: module.order_no
          });
        });
      }

      setLessonSequence(sequence);

      const detailsMap = {};
      for (const lesson of sequence) {
        // Teammate handoff note:
        // Replace this direct Supabase read with backend lesson-detail endpoint when available.
        // Recommended endpoint shape: GET /api/courses/lessons/<lesson_id>
        const { data, error: detailError } = await supabase
          .from('lessons')
          .select('id, body, video_url, file_url')
          .eq('id', lesson.id)
          .single();

        if (!detailError && data) {
          detailsMap[lesson.id] = data;
        }
      }
      setLessonDetailsMap(detailsMap);
    } catch (err) {
      setError(err.message || 'Failed to load lesson workspace');
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = useMemo(
    () => lessonSequence.findIndex((lesson) => String(lesson.id) === String(lessonId)),
    [lessonSequence, lessonId]
  );

  const currentLesson = currentIndex >= 0 ? lessonSequence[currentIndex] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < lessonSequence.length - 1 ? lessonSequence[currentIndex + 1] : null;
  const lessonDetails = currentLesson ? lessonDetailsMap[currentLesson.id] : null;

  const handleCompleteAndContinue = async () => {
    if (!currentLesson) {
      return;
    }

    setActionLoading(true);

    // Temporary local progress toggle until enrollment progress backend is available.
    // Teammate integration target:
    // POST /api/enrollment/progress with { student_id, lesson_id, is_completed }
    const saved = window.sessionStorage.getItem(progressStorageKey);
    let completed = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          completed = parsed;
        }
      } catch {
        completed = [];
      }
    }

    if (!completed.includes(currentLesson.id)) {
      completed.push(currentLesson.id);
      window.sessionStorage.setItem(progressStorageKey, JSON.stringify(completed));
    }

    if (nextLesson) {
      navigate(`/learn/course/${courseId}/lesson/${nextLesson.id}`);
    } else {
      navigate(`/learn/course/${courseId}`);
    }

    setActionLoading(false);
  };

  return (
    <div className="bg-light min-vh-100 py-5 text-dark">
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <div>
            <h1 className="fw-bold mb-1 text-dark">Lesson Workspace</h1>
            <p className="text-muted mb-0">Complete this lesson and continue to the next one without leaving the page flow.</p>
          </div>
          <button className="btn btn-outline-secondary rounded-pill px-4 fw-medium" onClick={() => navigate(`/learn/course/${courseId}`)}>
            <i className="bi bi-arrow-left me-2"></i>Back To Course
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
        ) : !currentLesson ? (
          <div className="alert alert-warning text-center shadow-sm" role="alert">
            <i className="bi bi-exclamation-circle-fill me-2"></i>Lesson not found in this course.
          </div>
        ) : (
          <>
            <div className="card shadow-sm border-0 rounded-3 bg-white mb-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-3">
                  <div>
                    <h4 className="fw-bold text-dark mb-1">{currentLesson.title}</h4>
                    <p className="text-muted mb-0">
                      Module {currentLesson.module_order_no}: {currentLesson.module_title}
                    </p>
                  </div>
                  {course && (
                    <span className="badge rounded-pill px-3 py-2 bg-secondary">
                      <i className="bi bi-book me-1"></i>{course.title}
                    </span>
                  )}
                </div>

                <div className="border rounded-3 p-3 bg-light">
                  {lessonDetails?.body ? (
                    <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-wrap' }}>{lessonDetails.body}</p>
                  ) : (
                    <p className="mb-0 text-muted">Lesson content is not available yet.</p>
                  )}
                </div>

                {lessonDetails?.video_url && (
                  <div className="mt-3">
                    <a href={lessonDetails.video_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                      <i className="bi bi-play-circle me-2"></i>Open Video
                    </a>
                  </div>
                )}

                {lessonDetails?.file_url && (
                  <div className="mt-3">
                    <a href={lessonDetails.file_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-dark rounded-pill px-3">
                      <i className="bi bi-paperclip me-2"></i>Open Material
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <small className="text-muted">
                {nextLesson ? `Next lesson: ${nextLesson.title}` : 'This is the last lesson in the course.'}
              </small>
              <button className="btn rounded-pill px-4 fw-medium text-white shadow-sm" style={{ backgroundColor: '#6f42c1' }} onClick={handleCompleteAndContinue} disabled={actionLoading}>
                {actionLoading ? 'Saving...' : 'Complete And Continue'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
