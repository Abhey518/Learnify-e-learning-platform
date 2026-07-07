import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function StudentLessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessonSequence, setLessonSequence] = useState([]);
  const [lessonDetailsMap, setLessonDetailsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const progressStorageKey = `learnify-course-progress-${courseId}`;
  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    loadLessonWorkspace();
  }, [courseId, lessonId]);

  const loadLessonWorkspace = async () => {
    setError('');
    
    // Only show global spinner if sequence arrays are completely uninitialized
    if (lessonSequence.length === 0) {
      setLoading(true);
    }

    try {
      // Fetch Course details if not cached yet
      if (!course) {
        const courseRes = await fetch(`${baseUrl}/courses/${courseId}`, { credentials: 'include' });
        const courseData = await courseRes.json();
        if (!courseRes.ok) throw new Error(courseData.error || 'Failed to load course details.');
        setCourse(courseData);
      }

      // Fetch entire workspace setup
      const workspaceRes = await fetch(`${baseUrl}/enrollment/courses/${courseId}/workspace-setup`, { credentials: 'include' });
      const workspaceData = await workspaceRes.json();
      
      if (!workspaceRes.ok) {
        throw new Error(workspaceData.error || 'Failed to assemble workspace mappings.');
      }

      const sequence = workspaceData.sequence || [];
      setLessonSequence(sequence);

      const detailsMap = {};
      sequence.forEach((lesson) => {
        detailsMap[lesson.id] = {
          id: lesson.id,
          body: lesson.content || "",
          video_url: lesson.video_url || null,
          file_url: lesson.file_url || null
        };
      });
      setLessonDetailsMap(detailsMap);

    } catch (err) {
      setError(err.message || 'Critical architecture sync error.');
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
    if (!currentLesson || actionLoading) return;

    setActionLoading(true);
    setError('');

    const lessonIdToComplete = currentLesson.id;

    try {
      const response = await fetch(`${baseUrl}/enrollment/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lesson_id: lessonIdToComplete,
          is_completed: true
        }),
        credentials: 'include',
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to submit progress update parameters.');
      }

      const latestIndex = lessonSequence.findIndex((l) => String(l.id) === String(lessonIdToComplete));
      const dynamicNextLesson = (latestIndex >= 0 && latestIndex < lessonSequence.length - 1) 
        ? lessonSequence[latestIndex + 1] 
        : null;

      setActionLoading(true); // Keep button disabled during delay
      
      setTimeout(() => {
        if (dynamicNextLesson) {
          navigate(`/courses/${courseId}/learning/${dynamicNextLesson.id}`);
        } else {
          navigate(`/courses/${courseId}/learning`);
        }
        setActionLoading(false);
      }, 1500); // 1500 milliseconds = 1.5 seconds delay

    } catch (err) {
      console.error("Progress operation exception:", err);
      setError(err.message || "Failed to communicate progress flags adjustments.");
      setActionLoading(false);
    }
  };




  return (
    <div className="bg-light min-vh-100 py-5 text-dark">
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 text-start">
          <div>
            <h1 className="fw-bold mb-1 text-dark">Lesson Workspace</h1>
            <p className="text-muted mb-0">Complete this lesson and continue to the next one without leaving the page flow.</p>
          </div>
          <button className="btn btn-outline-secondary rounded-pill px-4 fw-medium" onClick={() => navigate(`/courses/${courseId}/learning`)}>
            <i className="bi bi-arrow-left me-2"></i>Back To Course Map
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ color: '#6f42c1' }} role="status"></div>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center shadow-sm text-start" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
          </div>
        ) : !currentLesson ? (
          <div className="alert alert-warning text-center shadow-sm text-start" role="alert">
            <i className="bi bi-exclamation-circle-fill me-2"></i>Lesson target payload index out of bounds.
          </div>
        ) : (
          <>
            <div className="card shadow-sm border-0 rounded-3 bg-white mb-4 text-start">
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
                    <p className="mb-0 text-muted fst-italic">No content data initialized for this lesson frame.</p>
                  )}
                </div>

                {lessonDetails?.video_url && (
                  <div className="mt-3">
                    <a href={lessonDetails.video_url} target="_blank" rel="noreferrer" className="btn btn-sm text-white px-3 rounded-pill" style={{ backgroundColor: '#6f42c1' }}>
                      <i className="bi bi-play-circle me-1.5"></i> Open Video Lecture
                    </a>
                  </div>
                )}

                {lessonDetails?.file_url && (
                  <div className="mt-3">
                    <a href={lessonDetails.file_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-dark rounded-pill px-3">
                      <i className="bi bi-paperclip me-2"></i>Open Study Material
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 text-start">
              <small className="text-muted fw-medium">
                {nextLesson ? `Next up: ${nextLesson.title}` : '🎉 You have successfully reached the end of this curriculum track!'}
              </small>
              <button 
                className="btn rounded-pill px-4 fw-bold text-white shadow-sm" 
                style={{ backgroundColor: '#6f42c1' }} 
                onClick={handleCompleteAndContinue} 
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    {/* Dynamic change notification message state text */}
                    {error ? 'Error occurred...' : 'Progress Saved! Loading next lesson...'}
                  </>
                ) : (
                  'Complete And Continue'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}