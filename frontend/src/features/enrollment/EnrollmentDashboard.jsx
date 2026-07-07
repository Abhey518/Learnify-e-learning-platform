import React, { useState, useEffect } from "react";

export default function EnrollmentDashboard() {
    // Page Navigation State
    const [currentPage, setCurrentPage] = useState("catalog"); // 'catalog' | 'lessons' | 'progress'
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Data States
    const [courses, setCourses] = useState([]);
    const [courseWorkspaceData, setCourseWorkspaceData] = useState({ modules: [], lessons: [] });
    const [lessonContent, setLessonContent] = useState(null);
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Unify routing context paths using your environment configurations
    const baseUrl = import.meta.env.VITE_API_URL || '/api/enrollment';

    useEffect(() => {
        fetchCatalog();
    }, []);

    // Fetch Course Catalog (FR-2.1)
    const fetchCatalog = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${baseUrl}/catalog`);
            const data = await res.json();
            if (data.success) {
                setCourses(data.courses || []);
            } else {
                setError(data.error || "Failed to load course catalog.");
            }
        } catch (err) {
            setError("Network error connecting to API service.");
        } finally {
            setLoading(false);
        }
    };

    // Enroll Student securely utilizing session context (FR-2.2)
    const handleEnroll = async (courseId, courseTitle) => {
        setLoading(true);
        setError("");
        setSuccessMsg("");
        try {
            const res = await fetch(`${baseUrl}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // backend derives this safely from session cookies
                body: JSON.stringify({ course_id: courseId }),
                credentials: "include" 
            });
            const data = await res.json();

            if (res.status === 201 || res.status === 200) {
                setSuccessMsg(`Successfully launched content workspace for: ${courseTitle}`);
                setSelectedCourse({ id: courseId, title: courseTitle });
                
                // Trigger dynamic mapping load for this course modules
                fetchCourseStructure(courseId);
                setCurrentPage("lessons");
            } else {
                setError(data.error || "Enrollment failed.");
            }
        } catch (err) {
            setError("Failed to execute enrollment request.");
        } finally {
            setLoading(false);
        }
    };

    // Populates lesson map lists dynamically from course selection matrices
    const fetchCourseStructure = async (courseId) => {
        try {
            // Re-uses your standard progress calc layout map payload array definitions
            const res = await fetch(`${baseUrl}/progress/session/course/${courseId}`, { credentials: "include" });
            const data = await res.json();
            if (data.success && data.progress) {
                setCourseWorkspaceData({
                    modules: data.progress.modules || [],
                    lessons: data.progress.lessons || [] 
                });
            }
        } catch (err) {
            console.error("Could not synchronize secondary workspace parameters", err);
        }
    };

    // 3. Action: Fetch Secure Lesson Content (FR-2.4)
    const handleViewLesson = async (lessonId) => {
        setLoading(true);
        setError("");
        try {
            // Dynamic lookup passing browser query constraints securely via active session
            const res = await fetch(`${baseUrl}/lessons/${lessonId}`, { credentials: "include" });
            const data = await res.json();
            if (data.success) {
                setLessonContent(data.lesson);
            } else {
                setError(data.error || "Could not retrieve secure data contents.");
            }
        } catch (err) {
            setError("Authorization access validation failed.");
        } finally {
            setLoading(false);
        }
    };

    // Action: Check Progress (FR-2.6)
    const handleViewProgress = async (course) => {
        setSelectedCourse(course);
        setLoading(true);
        setError("");
        try {
            // Pass session path mapping tracking parameters cleanly 
            const res = await fetch(`${baseUrl}/progress/session/course/${course.id}`, { credentials: "include" });
            const data = await res.json();
            if (data.success) {
                setProgressData(data.progress);
                setCurrentPage("progress");
            } else {
                setError(data.error || "Failed to parse progress matrix metrics.");
            }
        } catch (err) {
            setError("Could not gather system progress structures.");
        } finally {
            setLoading(false);
        }
    };

    // Action: Complete Lesson Toggle via secure session tracking updates (FR-2.5)
    const handleToggleComplete = async (lessonId, currentStatus) => {
        try {
            const res = await fetch(`${baseUrl}/progress`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lesson_id: lessonId,
                    is_completed: !currentStatus
                }),
                credentials: "include"
            });
            
            if (res.ok) {
                // Update workspace display state flags instantly to provide immediate rendering response feedback
                setLessonContent(prev => prev && prev.id === lessonId ? { ...prev, is_completed: !currentStatus } : prev);
                if (selectedCourse) fetchCourseStructure(selectedCourse.id);
            }
        } catch (err) {
            console.error("Progress synchronization error", err);
        }
    };

    return (
        <div className="bg-light min-vh-100 py-5">
            <div className="container">
                {/* Navigation Tabs Header */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 border-bottom pb-3">
                    <div className="d-flex align-items-center gap-2 mb-3 mb-md-0">
                        <i className="bi bi-mortarboard-fill fs-2" style={{ color: '#6f42c1' }}></i>
                        <h2 className="fw-bold m-0 text-dark">Learnify Dashboard</h2>
                    </div>

                    <div className="btn-group shadow-sm" style={{ borderRadius: '0.75rem', overflow: 'hidden' }}>
                        <button
                            className="btn fw-semibold px-4 py-2.5"
                            style={{
                                backgroundColor: currentPage === "catalog" ? "#6f42c1" : "white",
                                color: currentPage === "catalog" ? "white" : "#495057",
                                border: "1px solid #dee2e6"
                            }}
                            onClick={() => { setCurrentPage("catalog"); setError(""); setSuccessMsg(""); }}
                        >
                            Course Catalog
                        </button>
                        <button
                            className="btn fw-semibold px-4 py-2.5"
                            disabled={!selectedCourse}
                            style={{
                                backgroundColor: currentPage === "lessons" ? "#6f42c1" : "white",
                                color: currentPage === "lessons" ? "white" : "#495057",
                                border: "1px solid #dee2e6"
                            }}
                            onClick={() => {
                                setCurrentPage("lessons");
                                if (selectedCourse) fetchCourseStructure(selectedCourse.id);
                            }}
                        >
                            Course Workspace
                        </button>
                        <button
                            className="btn fw-semibold px-4 py-2.5"
                            disabled={!selectedCourse}
                            style={{
                                backgroundColor: currentPage === "progress" ? "#6f42c1" : "white",
                                color: currentPage === "progress" ? "white" : "#495057",
                                border: "1px solid #dee2e6"
                            }}
                            onClick={() => handleViewProgress(selectedCourse)}
                        >
                            My Progress
                        </button>
                    </div>
                </div>

                {/* Global Notices */}
                {error && <div className="alert alert-danger rounded-3 text-start" role="alert"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
                {successMsg && <div className="alert alert-success rounded-3 text-start" role="alert"><i className="bi bi-check-circle-fill me-2"></i>{successMsg}</div>}
                {loading && <div className="text-center my-4"><div className="spinner-border" style={{ color: '#6f42c1' }} role="status"></div></div>}

                {/* --- PAGE 1: COURSE CATALOG --- */}
                {currentPage === "catalog" && !loading && (
                    <div className="text-start">
                        <h4 className="fw-bold text-dark mb-4">Available Course Catalog</h4>
                        <div className="row g-4">
                            {courses.length > 0 ? (
                                courses.map((course) => (
                                    <div className="col-md-4" key={course.id}>
                                        <div className="card h-100 border-0 shadow-sm p-3" style={{ borderRadius: '1.25rem' }}>
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="card-title fw-bold text-dark mb-2">{course.title || "Untitled Course"}</h5>
                                                <p className="card-text text-muted flex-grow-1 small">
                                                    {course.description || "Master this course stream at your own pace with bite-sized modules."}
                                                </p>
                                                <div className="d-grid gap-2 mt-4">
                                                    <button
                                                        className="btn text-white fw-semibold shadow-sm"
                                                        style={{ backgroundColor: '#6f42c1', borderRadius: '0.6rem' }}
                                                        onClick={() => handleEnroll(course.id, course.title)}
                                                    >
                                                        Enroll & Launch
                                                    </button>
                                                    <button
                                                        className="btn btn-sm fw-semibold"
                                                        style={{ color: '#6f42c1', backgroundColor: '#f3e8ff', borderRadius: '0.6rem' }}
                                                        onClick={() => handleViewProgress(course)}
                                                    >
                                                        Check Metrics
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : <p className="text-muted text-center py-4 w-100">No public catalog items active inside database.</p>}
                        </div>
                    </div>
                )}

                {/* --- PAGE 2: LESSONS WORKSPACE PANEL --- */}
                {currentPage === "lessons" && !loading && selectedCourse && (
                    <div className="text-start">
                        <div className="mb-4">
                            <span className="badge px-3 py-2 mb-2 rounded-pill" style={{ backgroundColor: '#f3e8ff', color: '#6f42c1' }}>Workspace Active</span>
                            <h3 className="fw-bold text-dark">{selectedCourse.title}</h3>
                        </div>

                        <div className="row g-4">
                            {/* Sidebar Directory Map */}
                            <div className="col-lg-4">
                                <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '1.25rem' }}>
                                    <div className="p-3 fw-bold text-white text-center" style={{ backgroundColor: '#6f42c1' }}>
                                        Course Navigation Map
                                    </div>
                                    <div className="list-group list-group-flush" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                        {progressData && progressData.modules && progressData.modules.length > 0 ? (
                                            progressData.modules.map((mod) => (
                                                <div key={mod.module_id} className="border-bottom">
                                                    <div className="bg-light p-2.5 fw-bold small text-secondary border-bottom">
                                                        📁 {mod.module_title}
                                                    </div>
                                                    {/* Dynamically queries module entries using matching progress mapping structures */}
                                                    <button
                                                        onClick={() => handleViewLesson(mod.module_id)} 
                                                        className="list-group-item list-group-item-action text-start p-3 small border-0"
                                                    >
                                                        <i className="bi bi-book-half me-2" style={{ color: '#6f42c1' }}></i> 
                                                        Launch Lesson Unit ({mod.completed_lessons} / {mod.total_lessons} Done)
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-3 text-muted text-center small">No modules initialized for this course.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Pane View */}
                            <div className="col-lg-8">
                                <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '1.25rem' }}>
                                    {lessonContent ? (
                                        <div>
                                            <h4 className="fw-bold pb-2 mb-3" style={{ color: '#6f42c1', borderBottom: '2px solid #f3e8ff' }}>{lessonContent.title}</h4>
                                            <div className="p-4 rounded-4 mb-4" style={{ backgroundColor: '#f8f9fa', minHeight: '180px' }}>
                                                <p className="text-dark mb-0">{lessonContent.content || "Secure lesson data verified successfully."}</p>
                                            </div>
                                            <div className="form-check form-switch p-3 rounded-3" style={{ backgroundColor: '#f3e8ff' }}>
                                                <input
                                                    className="form-check-input ms-0 me-3"
                                                    type="checkbox"
                                                    id="lessonComplete"
                                                    checked={lessonContent.is_completed || false}
                                                    onChange={() => handleToggleComplete(lessonContent.id, lessonContent.is_completed)}
                                                />
                                                <label className="form-check-label fw-bold" style={{ color: '#6f42c1' }} htmlFor="lessonComplete">
                                                    Mark this lesson unit as fully completed
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5 text-muted">
                                            <i className="bi bi-book fs-1 mb-3 d-block" style={{ color: '#6f42c1' }}></i>
                                            <h5>No Lesson Selected</h5>
                                            <p className="small">Select a lesson unit on the left sidebar map to unlock secure platform content.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- PAGE 3: PROGRESS PANEL LOGISTICS --- */}
                {currentPage === "progress" && !loading && progressData && (
                    <div className="text-start">
                        <h4 className="fw-bold text-dark mb-4">
                            Course Progress Overview: <span style={{ color: '#6f42c1' }}>{selectedCourse?.title}</span>
                        </h4>

                        <div className="card border-0 shadow-sm mb-5" style={{ borderRadius: '1.5rem' }}>
                            <div className="card-body row text-center p-4 g-3">
                                <div className="col-md-4 border-md-end">
                                    <span className="text-muted small fw-bold text-uppercase">Total Completion</span>
                                    <h1 className="display-4 fw-bold my-2" style={{ color: '#6f42c1' }}>{progressData.overall_progress_percentage}%</h1>
                                </div>
                                <div className="col-md-4 border-md-end">
                                    <span className="text-muted small fw-bold text-uppercase">Lessons Completed</span>
                                    <h2 className="fw-bold text-dark my-2">{progressData.completed_lessons} / {progressData.total_lessons}</h2>
                                </div>
                                <div className="col-md-4">
                                    <span className="text-muted small fw-bold text-uppercase">Quizzes Finished</span>
                                    <h2 className="fw-bold text-dark my-2">{progressData.completed_quizzes} / {progressData.total_quizzes}</h2>
                                </div>
                            </div>
                        </div>

                        <h5 className="fw-bold text-dark mb-3">Module Progress Matrix</h5>
                        <div className="row g-4">
                            {progressData.modules?.map((mod) => (
                                <div className="col-md-6" key={mod.module_id}>
                                    <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '1rem' }}>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="fw-bold text-dark">{mod.module_title}</span>
                                                {mod.is_completed ? (
                                                    <span className="badge bg-success rounded-pill">Completed</span>
                                                ) : (
                                                    <span className="badge rounded-pill" style={{ backgroundColor: '#f3e8ff', color: '#6f42c1' }}>In Progress</span>
                                                )}
                                            </div>
                                            <div className="progress my-3" style={{ height: "10px", borderRadius: '5px' }}>
                                                <div
                                                    className="progress-bar"
                                                    role="progressbar"
                                                    style={{ width: `${mod.progress_percentage}%`, backgroundColor: '#6f42c1' }}
                                                    aria-valuenow={mod.progress_percentage}
                                                    aria-valuemin="0"
                                                    aria-valuemax="100"
                                                ></div>
                                            </div>
                                            <div className="d-flex justify-content-between text-muted small">
                                                <span>{mod.completed_lessons} / {mod.total_lessons} Lessons</span>
                                                <span>{mod.progress_percentage}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}