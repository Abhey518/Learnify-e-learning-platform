import React, { useState, useEffect } from 'react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('instructors'); // 'instructors' or 'reviews'
  const [instructors, setInstructors] = useState([]);
  const [reviews, setReviews] = useState([]); // Array container for platform feedback logs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  // Fetch contextual dataset depending on the active tab selection
  useEffect(() => {
    setSuccessMessage('');
    setError('');
    
    if (activeTab === 'instructors') {
      fetchPendingInstructors();
    } else if (activeTab === 'reviews') {
      fetchPlatformReviews();
    }
  }, [activeTab]);

  const fetchPendingInstructors = () => {
    setLoading(true);
    fetch(`${baseUrl}/admin/pending-instructors`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch pending instructor applications.");
        return res.json();
      })
      .then((data) => {
        setInstructors(data.applications || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // Fetch live feedback records from the data tier
  const fetchPlatformReviews = () => {
    setLoading(true);
    // Directly targets your primary reviews collection endpoint
    fetch(`${baseUrl}/reviews`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error("Could not retrieve system review logs.");
        return res.json();
      })
      .then((data) => {
        // Fallback safety allocations matching your platform arrays style
        if (Array.isArray(data)) setReviews(data);
        else if (data && Array.isArray(data.data)) setReviews(data.data);
        else setReviews([]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleProcessInstructor = (userId, statusAction) => {
    setError('');
    setSuccessMessage('');
    fetch(`${baseUrl}/admin/process-instructor`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, status: statusAction }),
      credentials: 'include'
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to update application status.`);
        return res.json();
      })
      .then((data) => {
        setSuccessMessage(data.message);
        setInstructors(prev => prev.filter(item => item.id !== userId));
      })
      .catch((err) => setError(err.message));
  };

  //Fire backend moderation override execution requests
  const handleDeleteReview = (reviewId) => {
    if (!window.confirm("Are you absolutely sure you want to remove this review from the platform?")) {
      return;
    }

    setError('');
    setSuccessMessage('');

    fetch(`${baseUrl}/admin/reviews/${reviewId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not execute moderation override deletion sweep.");
        return res.json();
      })
      .then((data) => {
        setSuccessMessage(data.message || "Review content removed successfully.");
        // Evict the record from state to update the UI instantly
        setReviews(prev => prev.filter(item => item.id !== reviewId));
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div className="bg-light min-vh-100 py-5 text-dark">
      <div className="container" style={{ marginTop: '2rem' }}>
        
        {/* Dashboard Title Section Header */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 text-center">
            <h1 className="fw-bold mb-2 text-dark">Administrative Control Panel</h1>
            <p className="text-muted">Manage system approvals, review instructor credentials, and moderate global content.</p>
          </div>
        </div>

        {/* Tab Navigation System Controller */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-md-6 text-center">
            <div className="btn-group w-100 shadow-sm rounded-pill p-1 bg-white border">
              <button 
                className={`btn rounded-pill px-4 fw-medium ${activeTab === 'instructors' ? 'text-white' : 'btn-white text-secondary border-0'}`}
                style={activeTab === 'instructors' ? { backgroundColor: '#6f42c1' } : {}}
                onClick={() => setActiveTab('instructors')}
              >
                <i className="bi bi-person-badge-fill me-2"></i>Instructor Queue
              </button>
              <button 
                className={`btn rounded-pill px-4 fw-medium ${activeTab === 'reviews' ? 'text-white' : 'btn-white text-secondary border-0'}`}
                style={activeTab === 'reviews' ? { backgroundColor: '#6f42c1' } : {}}
                onClick={() => setActiveTab('reviews')}
              >
                <i className="bi bi-chat-square-text-fill me-2"></i>Content Moderation
              </button>
            </div>
          </div>
        </div>

        {/* Action Alerts Block */}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show text-center shadow-sm" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i> {successMessage}
            <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger text-center shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        {/* Loader Display Spinnings */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ color: '#6f42c1' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Main Interface Content Rendering Container */}
        {!loading && (
          <div className="row mt-4">
            <div className="col-12">
              
              {/* TAB 1: PENDING INSTRUCTOR APPLICATIONS */}
              {activeTab === 'instructors' && (
                <div className="card shadow-sm border-0 rounded-3 bg-white overflow-hidden p-4">
                  <h3 className="fw-bold mb-4 text-dark h5 border-bottom pb-2">Pending Access Authorizations</h3>
                  
                  {instructors.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0 text-dark">
                        <thead className="table-light text-secondary">
                          <tr>
                            <th>Full Name</th>
                            <th>Email Destination</th>
                            <th>Verification Portfolio</th>
                            <th>Submission Date</th>
                            <th className="text-center">Action Decisions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {instructors.map((inst) => (
                            <tr key={inst.id}>
                              <td><span className="fw-bold">{inst.name}</span></td>
                              <td><span className="text-muted">{inst.email}</span></td>
                              <td>
                                <a href={inst.resume_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                                  <i className="bi bi-file-earmark-pdf me-1"></i>View CV/Resume
                                </a>
                              </td>
                              <td><span className="small text-muted">{new Date(inst.created_at).toLocaleDateString()}</span></td>
                              <td className="text-center">
                                <div className="d-flex gap-2 justify-content-center">
                                  <button className="btn btn-sm btn-success rounded-pill px-3 fw-medium" onClick={() => handleProcessInstructor(inst.id, 'approved')}>Approve</button>
                                  <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-medium" onClick={() => handleProcessInstructor(inst.id, 'rejected')}>Reject</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-people fs-1 text-secondary mb-2 d-block"></i>
                      <p className="mb-0">Excellent! The instructor application processing queue is completely empty.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: REVIEW MODERATION OVERRIDES */}
              {activeTab === 'reviews' && (
                <div className="card shadow-sm border-0 rounded-3 bg-white p-4">
                  <h3 className="fw-bold mb-4 text-dark h5 border-bottom pb-2">Platform Content Moderation</h3>
                  
                  {reviews.length > 0 ? (
                    <div className="row g-3">
                      {reviews.map((rev) => {
                        // Safety Fallback Extractions if a profile or course gets deleted later
                        const courseTitle = rev.courses?.title || `Course ID: ${rev.course_id}`;
                        const studentName = rev.profiles?.name;

                        return (
                          <div key={rev.id} className="col-12">
                            <div className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-start shadow-sm">
                              <div className="text-start">
                                <div className="d-flex align-items-center mb-1 flex-wrap gap-2">
                                  <span className="badge bg-warning text-dark">
                                    <i className="bi bi-star-fill me-1"></i>{rev.rating}.0
                                  </span>
                                  {/* ✅ Displaying True Course Name instead of ID */}
                                  <strong className="text-dark">{courseTitle}</strong>
                                  <span className="text-muted d-none d-sm-inline">|</span>
                                  {/* ✅ Displaying True Student Name instead of UUID */}
                                  <span className="text-secondary fw-medium">By: {studentName}</span>
                                </div>
                                <p className="mb-0 text-muted mt-2 italic">"{rev.comment || 'No text feedback provided.'}"</p>
                              </div>
                              
                              <button 
                                className="btn btn-sm btn-outline-danger rounded-pill px-3 flex-shrink-0"
                                onClick={() => handleDeleteReview(rev.id)}
                              >
                                <i className="bi bi-trash3-fill me-1"></i>Delete Review
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-chat-square-heart fs-1 text-secondary mb-2 d-block"></i>
                      <p className="mb-0">No course reviews have been published on the platform yet.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}