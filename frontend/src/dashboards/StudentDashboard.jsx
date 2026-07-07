import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = () => {
    setLoading(true);
    setError('');
    
    fetch(`${baseUrl}/enrollment/catalog`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch dashboard learning records.");
        return res.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.courses)) {
          const filtered = data.courses.filter(course => course.is_enrolled === true);
          setEnrolledCourses(filtered);
        } else {
          setEnrolledCourses([]);
        }
      })
      .catch(err => setError(err.message || "Failed to parse database records."))
      .finally(() => setLoading(false));
  };

  const openLearningPage = (courseId) => {
    navigate(`/courses/${courseId}/learning`);
  };

  return (
    <div className="bg-light min-vh-100 py-5 text-dark">
      <div className="container" style={{ marginTop: '2rem' }}>
        
        {/* Dashboard Title Section Header */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 text-center">
            <h1 className="fw-bold mb-2 text-dark">Student Workspace</h1>
            <p className="text-muted">Track your running learning curricula modules, check progress metrics, and resume active lessons.</p>
          </div>
        </div>

        {/* Dynamic Label Section Heading */}
        <div className="row text-start mb-4 border-bottom pb-2">
          <div className="col-12">
            <h3 className="fw-bold text-dark h5 mb-0">
              <i className="bi bi-book-half me-2 text-primary" style={{ color: '#6f42c1' }}></i> 
              My Active Enrolled Courses ({enrolledCourses.length})
            </h3>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger text-center shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ color: '#6f42c1' }} role="status">
              <span className="visually-hidden">Syncing Core...</span>
            </div>
          </div>
        ) : (
          <div className="row mt-2 g-4 justify-content-start text-start">
            
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map(course => (
                <div key={course.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className="card h-100 shadow-sm border-0 rounded-3 bg-white text-dark overflow-hidden d-flex flex-column justify-content-between">
                    
                    {/* Course Banner Image Area */}
                    <img 
                      src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"} 
                      className="card-img-top" 
                      alt={course.title}
                      style={{ height: '140px', objectFit: 'cover' }}
                    />
                    
                    {/* Card Meta Content Block Area */}
                    <div className="card-body d-flex flex-column p-3">
                      <h5 className="card-title fw-bold text-dark mb-1 text-truncate" title={course.title}>
                        {course.title}
                      </h5>
                      <p className="card-text text-muted small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.description || "No class summary description loaded."}
                      </p>
                      
                      {/* Interactive Button Section Footers */}
                      <div className="mt-auto d-grid border-top pt-2.5">
                        <button 
                          className="btn rounded-pill fw-semibold text-white shadow-sm d-flex align-items-center justify-content-center gap-1.5 btn-sm py-2" 
                          style={{ backgroundColor: '#6f42c1' }} 
                          onClick={() => openLearningPage(course.id)}
                        >
                          <i className="bi bi-rocket-takeoff-fill"></i> Resume Workspace
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5 text-muted mt-2">
                <div className="card shadow-sm border-0 rounded-3 bg-white p-5 mx-auto" style={{ maxWidth: '60px' == '60px' ? '600px' : 'auto' }}>
                  <i className="bi bi-journal-bookmark fs-1 text-secondary mb-3 d-block"></i>
                  <h4 className="fw-bold text-dark mb-2">No Active Enrollments</h4>
                  <p className="text-secondary small mb-4">
                    You haven’t added any courses to your custom program map tracking queue yet. Visit our main campus catalog index tab to get started.
                  </p>
                  <div>
                    <Link 
                      to="/courses" 
                      className="btn text-white fw-semibold px-4 py-2.5 shadow-sm rounded-pill" 
                      style={{ backgroundColor: '#6f42c1' }}
                    >
                      <i className="bi bi-search me-1.5"></i> Explore Catalog Directory
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}