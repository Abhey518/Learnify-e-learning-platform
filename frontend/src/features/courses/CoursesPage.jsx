import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CoursesPage() {
  // --- CORE VIEW STATE PIPELINES ---
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- SYSTEM ACCUMULATOR MAP FOR AVERAGE RATINGS ---
  const [courseRatingsMap, setCourseRatingsMap] = useState({});
  
  // --- ASYNC STORAGE MATRICES ---
  const [courseWorkspaceData, setCourseWorkspaceData] = useState({ modules: [], lessons: [] });
  const [lessonContent, setLessonContent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // --- LAYOUT BOUNDARY NOTICES ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL || '/api';
  const baseUrlenroll = `${baseUrl}/enrollment`;
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchCatalog();
    const checkUserRole = async () => {
      try {
        const res = await fetch(`${baseUrl}/auth/current-user`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok && data.logged_in) {
          setUserRole(data.user_role || data.role || null);
        }
      } catch (err) {
        console.error("Failed to sync user role context maps:", err);
      }
    };
    checkUserRole();
  }, []);
  
  const fetchCatalog = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${baseUrlenroll}/catalog`);
      const data = await res.json();
      if (data.success) {
        const catalogCourses = data.courses || [];
        setCourses(catalogCourses);
        
        // CONCURRENT LAUNCH: Fetch average ratings for all retrieved courses simultaneously
        fetchCatalogRatings(catalogCourses);
      } else {
        setError(data.error || "Failed to load course catalog.");
      }
    } catch (err) {
      setError("Network error connecting to API service.");
    } finally {
      setLoading(false);
    }
  };

  // FETCH RATINGS CONCURRENTLY FROM EXTENDED ANALYTICS MICROSERVICE
  const fetchCatalogRatings = async (catalogCourses) => {
    const ratingsCache = {};
    
    // Process mappings concurrently using Promise.all to prevent sequential backend lockouts
    await Promise.all(
      catalogCourses.map(async (course) => {
        try {
          const res = await fetch(`${baseUrl}/courses/${course.id}/reviews`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            // Fallback reading matching your exact return structure: data.average_rating or data.average
            ratingsCache[course.id] = data.average_rating || data.average || 0;
          }
        } catch (e) {
          console.warn(`Could not sync analytics evaluation boundaries for course: ${course.id}`, e);
        }
      })
    );
    
    setCourseRatingsMap(ratingsCache);
  };

  // Secure Filtering Engine
  const safeCoursesArray = Array.isArray(courses) ? courses : [];
  const filteredCourses = safeCoursesArray.filter((course) => {
    const courseTitle = course?.title ? course.title.toLowerCase() : '';
    return courseTitle.includes(searchTerm.toLowerCase());
  });

  // Dashboard Dynamic Redirect Checker Logic
  const handleMyCoursesRedirect = async () => {
    try {
      const res = await fetch(`${baseUrl}/auth/current-user`, { credentials: 'include' });
      const data = await res.json();
      
      if (data && data.logged_in === true) {
        navigate('/dashboards/student'); 
      } else {
        navigate('/login'); 
      }
    } catch (err) {
      console.error("Network synchronization drop during session lookup:", err);
      navigate('/login'); 
    }
  };

  // Complete Course Enrollment Pipeline
  const handleEnroll = async (courseId, courseTitle) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`${baseUrlenroll}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: courseId }),
        credentials: "include" 
      });
      const data = await res.json();

      if (res.status === 201 || res.status === 200) {
        setSuccessMsg(`Successfully launched content workspace for: ${courseTitle}`);
        setSelectedCourse({ id: courseId, title: courseTitle });
        navigate(`/courses/${courseId}/learning`); 
      } else if (res.status === 400 && data.error === "Already enrolled in this course") {
        setSuccessMsg(`Resuming class workspace for: ${courseTitle}`);
        navigate(`/courses/${courseId}/learning`);
      } else if (res.status === 401) {
        setError("You must be logged in to enroll in courses.");
        navigate('/login');
      } else {
        setError(data.error || "Enrollment failed.");
      }
    } catch (err) {
      setError("Failed to execute enrollment request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 py-5 text-dark">
      <div className="container" style={{ marginTop: '2rem' }}>
        
        {/* Upper Brand Subheader Layout */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 border-bottom pb-3 text-start gap-3">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-mortarboard-fill fs-2" style={{ color: '#6f42c1' }}></i>
            <h2 className="fw-bold m-0 text-dark">Learnify Workspace</h2>
          </div>

          {userRole === 'student' && (
            <div>
              <button
                className="btn text-white fw-semibold shadow-sm btn-sm px-4 rounded-pill" 
                onClick={handleMyCoursesRedirect}
                style={{ 
                  backgroundColor: '#6f42c1', 
                  fontSize: '0.9rem',
                  borderRadius: '0.6rem' 
                }}
              >
                <i className="bi bi-journal-bookmark-fill me-2" style={{ color: '#fff' }}> Check Enrolled Courses</i> 
              </button>
            </div>
          )}
        </div>

        {/* Informational Status Feedback Systems */}
        {error && <div className="alert alert-danger rounded-3 text-start shadow-sm" role="alert"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
        {successMsg && <div className="alert alert-success rounded-3 text-start shadow-sm" role="alert"><i className="bi bi-check-circle-fill me-2"></i>{successMsg}</div>}
        {loading && <div className="text-center my-5"><div className="spinner-border text-primary" style={{ color: '#6f42c1' }} role="status"></div></div>}

        {/* --- CATALOGUE EXPLORER GRID VIEW --- */}
        {!loading && (
          <>
            <div className="row justify-content-center mb-5">
              <div className="col-12 col-md-8 text-center">
                <h1 className="fw-bold mb-2 text-dark">Explore Our Courses</h1>
                <p className="text-muted mb-4">Discover a wide array of skills taught by top industry specialists.</p>
                <div className="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border">
                  <span className="input-group-text bg-white border-0 text-secondary ps-4"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    placeholder="Search by course title..."
                    className="form-control border-0 ps-2 bg-white text-dark"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ fontSize: '1rem', height: '54px' }}
                  />
                </div>
              </div>
            </div>

            <div className="row g-4 justify-content-start">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => {
                  // EXTRACT RATING FROM SYNCHRONIZED MAP ASYNCHRONOUSLY
                  const rawRating = courseRatingsMap[course.id];
                  const dynamicRating = rawRating && rawRating > 0 ? Number(rawRating).toFixed(1) : "New";

                  return (
                    <div key={course.id || Math.random()} className="col-12 col-sm-6 col-md-4 col-lg-3 text-start">
                      <div className="card h-100 shadow-sm border-0 rounded-3 bg-white text-dark overflow-hidden">
                        <img 
                          src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"} 
                          className="card-img-top" 
                          alt={course.title} 
                          style={{ height: '160px', objectFit: 'cover' }} 
                        />
                        <div className="card-body d-flex flex-column justify-content-between p-3">
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h5 className="card-title fw-bold text-dark mb-0 text-truncate me-2" style={{ maxWidth: '70%' }} title={course.title}>
                                {course.title}
                              </h5>
                              
                              {/* RATINGS BADGE: Displays live numeric average or clean fallback style */}
                              <span className="badge rounded-pill d-inline-flex align-items-center gap-1 shadow-sm px-2.5 py-1.5"
                                    style={{ 
                                      backgroundColor: dynamicRating === "New" ? '#e9ecef' : '#fff3cd', 
                                      color: dynamicRating === "New" ? '#495057' : '#856404',
                                      fontSize: '0.75rem',
                                      border: dynamicRating === "New" ? '1px solid #ced4da' : '1px solid #ffeeba',
                                      fontWeight: '700'
                                    }}>
                                <i className={`bi ${dynamicRating === "New" ? 'bi-star' : 'bi-star-fill'}`}></i>
                                {dynamicRating}
                              </span>
                            </div>

                            <p className="card-text text-muted small mb-3" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {course.description || "No description provided."}
                            </p>
                          </div>
                          
                          <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                            <span className="fw-bold h6 mb-0" style={{ color: '#6f42c1' }}>
                              {course.price > 0 ? `$${course.price}` : 'Free'}
                            </span>
                            
                            {course.is_enrolled ? (
                              <a 
                                href={`/courses/${course.id}/learning`}
                                className="btn text-white fw-semibold shadow-sm btn-sm px-4 rounded-pill"
                                style={{ backgroundColor: '#28a745' }}
                              >
                                <i className="bi bi-rocket-takeoff-fill me-1"></i> Launch
                              </a>
                            ) : (
                              <button 
                                className="btn text-white fw-semibold shadow-sm btn-sm px-3 rounded-pill" 
                                style={{ backgroundColor: '#6f42c1' }} 
                                onClick={() => handleEnroll(course.id, course.title)}
                              >
                                Enroll & Launch
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-12 text-center py-5">
                  <i className="bi bi-book-half text-secondary fs-1 mb-2 d-block"></i>
                  <p className="text-muted">No courses matched your search parameters.</p>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}