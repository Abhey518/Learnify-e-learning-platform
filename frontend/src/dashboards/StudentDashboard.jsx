import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState('enrolled'); // 'catalog', 'enrolled'

  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    setLoading(true);
    setError('');
    fetch(`${baseUrl}/courses`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch courses"))
      .then(data => setCourses(data || []))
      .catch(err => setError(err.toString()))
      .finally(() => setLoading(false));
  };

  const handleEnrollClick = (course) => {
    setError('');
    alert(`Enrollment is managed by your teammate's feature branch. Please insert enrollment in Supabase for course: ${course.title}`);
  };

  const openLearningPage = (courseId) => {
    navigate(`/learn/course/${courseId}`);
  };

  return (
    <div className="bg-light min-vh-100 py-5 text-dark">
      <div className="container" style={{ marginTop: '2rem' }}>
        
        {/* Dashboard Title Section Header */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 text-center">
            <h1 className="fw-bold mb-2 text-dark">Student Dashboard</h1>
            <p className="text-muted">Browse published courses, enroll, and start learning.</p>
          </div>
        </div>

        {/* 2-Tab Controller Navigation System */}
        <div className="row justify-content-center mb-4">
          
        <h6 className="fw-bold mb-2 text-dark">My Courses</h6>
        </div>

        {error && (
          <div className="alert alert-danger text-center shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ color: '#6f42c1' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row mt-4">
            
            {/* TAB: COURSE CATALOG */}
            {/* {activeTab === 'catalog' && (
              courses.length === 0 ? (
                <div className="col-12 text-center py-5 text-muted">
                  <i className="bi bi-journal-x fs-1 text-secondary mb-2 d-block"></i>
                  <p className="mb-0">There are no published courses available yet. Check back later!</p>
                </div>
              ) : (
                courses.map(course => {
                  return (
                    <div key={course.id} className="col-md-4 mb-4">
                      <div className="card shadow-sm border-0 rounded-3 bg-white h-100 p-3">
                        <div className="card-body d-flex flex-column p-2">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h5 className="card-title fw-bold text-dark text-truncate mb-0" title={course.title}>{course.title}</h5>
                          </div>
                          <h6 className="card-subtitle mb-3 text-muted small"><i className="bi bi-tag-fill me-1"></i>{course.category}</h6>
                          <p className="card-text text-muted flex-grow-1" style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            "{course.description}"
                          </p>
                          
                          <div className="mt-4 d-flex flex-column gap-2 border-top pt-3">
                            <button className="btn rounded-pill fw-medium text-white shadow-sm" style={{ backgroundColor: '#6f42c1' }} onClick={() => openLearningPage(course.id)}>
                              <i className="bi bi-play-circle-fill me-2"></i>Open Learning Page
                            </button>
                            <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-medium" onClick={() => handleEnrollClick(course)}>
                              <i className="bi bi-person-plus-fill me-2"></i>Enroll (Manual For Now)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )} */}

            {/* TAB: MY COURSES */}
            {/* {activeTab === 'enrolled' && (
            )} */}
              <div className="col-12 text-center py-5 text-muted mt-3">
                <div className="card shadow-sm border-0 rounded-3 bg-white p-5 mx-auto" style={{ maxWidth: '680px' }}>
                  <i className="bi bi-journal-check fs-1 text-secondary mb-3 d-block"></i>
                  <h4 className="fw-bold text-dark mb-2">Dedicated Learning Page Ready</h4>
                  <p className="mb-2">Course learning now happens on a separate page for better usability and navigation.</p>
                  <p className="small mb-0">When enrollment backend is integrated, this tab can show real enrolled courses with Resume actions.</p>
                  <Link to="/courses" className="btn text-white fw-semibold px-5 py-3 shadow" style={{ backgroundColor: '#6f42c1', borderRadius: '0.75rem' }}>
                    <i className="bi bi-person-plus-fill me-2"></i>Explore Courses
                  </Link>

                  
                </div>
              </div>

          </div>
        )}
      </div>
    </div>
  );
}
