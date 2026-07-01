import React, { useState, useEffect } from 'react';

export default function CoursesPage() {
  // 1. Force the initial state container to be a true empty array []
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 2. Fetch data from your Flask backend proxy configuration
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    
    fetch(`${baseUrl}/auth/courses`) // Adjust targeting endpoint if registered under a different blueprint
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch system courses data.");
        return res.json();
      })
      .then((data) => {
        // SAFETY GUARD: Thoroughly inspect incoming structure to ensure it's an array
        if (Array.isArray(data)) {
          setCourses(data);
        } else if (data && Array.isArray(data.data)) {
          setCourses(data.data); // Extracts array if backend returned raw wrapper object
        } else {
          console.error("API payload is not an array format:", data);
          setCourses([]); // Fallback safety allocation
        }
      })
      .catch((err) => {
        setError(err.message);
        setCourses([]); // Keep state clean as an array on failure
      })
      .finally(() => setLoading(false));
  }, []);

  // 3. SECURE RENDER GUARD: Safe filtering logic that never throws an exception
  // If courses is somehow altered, Array.isArray(courses) catches it and keeps it a safe list loop
  const safeCoursesArray = Array.isArray(courses) ? courses : [];

  const filteredCourses = safeCoursesArray.filter((course) => {
    // Safety check to ensure the course object properties exist before running string lookups
    const courseTitle = course?.title ? course.title.toLowerCase() : '';
    const courseDesc = course?.description ? course.description.toLowerCase() : '';
    const query = searchTerm.toLowerCase();

    return courseTitle.includes(query) || courseDesc.includes(query);
  });

  return (
    <div className="bg-light min-vh-100 py-5 text-dark">
      <div className="container" style={{ marginTop: '2rem' }}>
        
        {/* Course Filter View Search Header */}
        <div className="row justify-content-center mb-5">
          <div className="col-12 col-md-8 text-center">
            <h1 className="fw-bold mb-2 text-dark">Explore Our Courses</h1>
            <p className="text-muted mb-4">Discover a wide array of skills taught by top industry specialists.</p>
            
            {/* Search Input Box */}
            <div className="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border">
              <span className="input-group-text bg-white border-0 text-secondary ps-4">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                placeholder="Search by course title or keyword description..."
                className="form-control border-0 ps-2 bg-white text-dark"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: '1rem', height: '54px' }}
              />
            </div>
          </div>
        </div>

        {/* Loading and Error Management Toggles */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger text-center shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        {/* Dynamic Card Generation Grid */}
        {!loading && !error && (
          <div className="row g-4 justify-content-start">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div key={course.id || Math.random()} className="col-12 col-sm-6 col-md-4 col-lg-3 text-start">
                  <div className="card h-100 shadow-sm border-0 rounded-3 bg-white text-dark overflow-hidden">
                    {/* Course Banner Thumbnail Image */}
                    <img 
                      src={course.image_url || "https://unsplash.com"} 
                      className="card-img-top object-cover" 
                      alt={course.title}
                      style={{ height: '160px', objectFit: 'cover' }}
                    />
                    
                    <div className="card-body d-flex flex-column justify-content-between p-3.5">
                      <div>
                        <h5 className="card-title fw-bold text-dark mb-1 text-truncate" title={course.title}>
                          {course.title}
                        </h5>
                        <p className="card-text text-muted small mb-3 text-clamp" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {course.description || "No description provided for this learning pathway unit."}
                        </p>
                      </div>
                      
                      <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                        <span className="fw-bold h6 text-primary mb-0" style={{ color: '#6f42c1' }}>
                          {course.price && course.price > 0 ? `$${course.price}` : 'Free'}
                        </span>
                        <button className="btn btn-sm text-white px-3 fw-medium rounded-pill" style={{ backgroundColor: '#6f42c1' }}>
                          View Class
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Displayed if search filter outputs empty arrays */
              <div className="col-12 text-center py-5">
                <i className="bi bi-book-half text-secondary fs-1 mb-2 d-block"></i>
                <p className="text-muted">No courses matched your current search parameter filter.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
