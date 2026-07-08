import React, { useState, useEffect } from 'react';

export default function InstructorAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(''); 
  const [coursesFilterList, setCoursesFilterList] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  const queryParams = new URLSearchParams(window.location.search);
  const instructorIdFromUrl = queryParams.get('instructor_id') || '';

  // Watch for both course filter switches AND instructor identity URL resets
  useEffect(() => {
    fetchMetrics();
  }, [selectedCourse, instructorIdFromUrl]);

  const fetchMetrics = () => {
    setLoading(true);
    setError('');

    let url = `${baseUrl}/instructor/dashboard?`;
    
    if (instructorIdFromUrl) {
      url += `instructor_id=${instructorIdFromUrl}&`;
    }
    if (selectedCourse) {
      url += `course_id=${selectedCourse}`;
    }

    fetch(url, {
      method: 'GET',
      credentials: 'include'
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load instructor dashboard analytics details.");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setAnalyticsData(data);
          
          // Safely updates list mapping entries using the matched backend name structure
          if (data.my_courses && !selectedCourse) {
            setCoursesFilterList(data.my_courses);
          }
        } else {
          throw new Error(data.error || "Failed payload verification pass.");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="bg-light min-vh-100 py-5 text-dark">
      <div className="container" style={{ marginTop: '2rem' }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 text-start">
          <div>
            <h1 className="fw-bold mb-1 text-dark h2">Instructor Insights Deck</h1>
            <p className="text-muted mb-0">Track student engagement performance metrics, course distributions, and ratings logs.</p>
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Reset Filter clear option helper badge if active */}
            {selectedCourse && (
              <button 
                className="btn btn-sm btn-link text-decoration-none text-danger fw-bold p-0 me-2"
                onClick={() => setSelectedCourse('')}
              >
                ClearFilter
              </button>
            )}
            
            <label htmlFor="courseSelect" className="form-label small text-secondary fw-semibold mb-0 text-nowrap">
              <i className="bi bi-funnel-fill me-1"></i> Filter Course:
            </label>
            <select
              id="courseSelect"
              className="form-select border shadow-sm bg-white text-dark rounded-pill px-3"
              style={{ minWidth: '220px', fontSize: '0.9rem' }}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={loading && !analyticsData}
            >
              <option value="">All Teaching Modules</option>
              {coursesFilterList.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title || `Course ID: ${course.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger text-center shadow-sm mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        {loading && !analyticsData ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ color: '#6f42c1' }} role="status">
              <span className="visually-hidden">Compiling Metrics Matrix...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="row g-3 mb-4 text-start">
              <div className="col-12 col-sm-6 col-md-3">
                <div className="card shadow-sm border-0 rounded-3 bg-white p-3 h-100">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-secondary small fw-medium d-block mb-1">Total Enrolled</span>
                      <h3 className="fw-bold text-dark mb-0">{analyticsData?.total_students || 0}</h3>
                    </div>
                    <div className="rounded-circle p-2.5 bg-success bg-opacity-10 text-success">
                      <i className="bi bi-people-fill fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <div className="card shadow-sm border-0 rounded-3 bg-white p-3 h-100">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-secondary small fw-medium d-block mb-1">Average Rating</span>
                      <h3 className="fw-bold text-dark mb-0">
                        {analyticsData?.average_rating ? Number(analyticsData.average_rating).toFixed(1) : "0.0"}
                      </h3>
                    </div>
                    <div className="rounded-circle p-2.5 bg-warning bg-opacity-10 text-warning">
                      <i className="bi bi-star-fill fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <div className="card shadow-sm border-0 rounded-3 bg-white p-3 h-100">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-secondary small fw-medium d-block mb-1">Active Courses</span>
                      <h3 className="fw-bold text-dark mb-0">{analyticsData?.total_courses || coursesFilterList.length}</h3>
                    </div>
                    <div className="rounded-circle p-2.5 bg-primary bg-opacity-10 text-primary" style={{ color: '#6f42c1' }}>
                      <i className="bi bi-book-half fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <div className="card shadow-sm border-0 rounded-3 bg-white p-3 h-100">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-secondary small fw-medium d-block mb-1">Feedback Count</span>
                      <h3 className="fw-bold text-dark mb-0">{analyticsData?.total_reviews || 0}</h3>
                    </div>
                    <div className="rounded-circle p-2.5 bg-info bg-opacity-10 text-info">
                      <i className="bi bi-chat-left-heart-fill fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4 text-start">
              <div className="col-12 col-lg-6">
                <div className="card shadow-sm border-0 rounded-3 bg-white p-4 h-100">
                  <h3 className="fw-bold mb-3 text-dark h5 border-bottom pb-2">Modules Overview</h3>
                  {(analyticsData?.my_courses || coursesFilterList).length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0 text-dark">
                        <thead className="table-light text-secondary small">
                          <tr>
                            <th>Course Name/ID</th>
                            <th className="text-center">Enrolled</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(analyticsData?.my_courses || coursesFilterList).map((c) => (
                            <tr key={c.id}>
                              <td>
                                <span className="fw-bold d-block text-dark small">{c.title}</span>
                                <small className="text-muted">ID: {c.id}</small>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-light text-dark border px-2.5 rounded-pill fw-medium">
                                  {c.student_count || 0} Students
                                </span>
                              </td>
                              <td className="text-end">
                                <button 
                                  className={`btn btn-sm rounded-pill px-3 ${selectedCourse === c.id.toString() ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                                  style={selectedCourse === c.id.toString() ? { backgroundColor: '#6f42c1', borderColor: '#6f42c1' } : {}}
                                  onClick={() => setSelectedCourse(c.id.toString())}
                                >
                                  {selectedCourse === c.id.toString() ? 'Isolated' : 'Isolate'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted py-4 text-center my-0 small">No matching instructional records linked to this profile.</p>
                  )}
                </div>
              </div>

              <div className="col-12 col-lg-6">
                <div className="card shadow-sm border-0 rounded-3 bg-white p-4 h-100">
                  <h3 className="fw-bold mb-3 text-dark h5 border-bottom pb-2">Recent Course Feedback</h3>
                  {analyticsData?.recent_reviews && analyticsData.recent_reviews.length > 0 ? (
                    <div className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '420px' }}>
                      {analyticsData.recent_reviews.map((rev, index) => (
                        <div key={rev.id || index} className="p-3 border rounded-3 bg-light shadow-sm">
                          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-1.5">
                            <span className="badge bg-warning text-dark small">
                              <i className="bi bi-star-fill me-1"></i>{rev.rating}.0
                            </span>
                            <small className="text-muted">
                              {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                            </small>
                          </div>
                          <p className="mb-0 text-secondary small italic">"{rev.comment || 'No text summary left.'}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted h-100 d-flex flex-column align-items-center justify-content-center">
                      <i className="bi bi-chat-right-dots fs-3 text-secondary mb-2"></i>
                      <p className="mb-0 small">No student evaluations found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}