import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('instructors');
  const [instructors, setInstructors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [studentsList, setStudentsList] = useState([]);      
  const [instructorsList, setInstructorsList] = useState([]);  
  const [userSubTab, setUserSubTab] = useState('student');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'users') {
      setActiveTab('users');
    }
  }, []);

  useEffect(() => {
    setSuccessMessage('');
    setError('');
    
    if (activeTab === 'instructors') {
      fetchPendingInstructors();
    } else if (activeTab === 'reviews') {
      fetchPlatformReviews();
    } else if (activeTab === 'users') {
      fetchGlobalUsersDirectory();
    }
  }, [activeTab]);

  const fetchPendingInstructors = () => {
    setLoading(true);
    fetch(`${baseUrl}/admin/pending-instructors`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch pending instructor applications.");
        return res.json();
      })
      .then((data) => setInstructors(data.applications || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const fetchPlatformReviews = () => {
    setLoading(true);
    fetch(`${baseUrl}/reviews`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error("Could not retrieve system review logs.");
        return res.json();
      })
      .then((data) => setReviews(Array.isArray(data) ? data : data.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const fetchGlobalUsersDirectory = () => {
    setLoading(true);
    
    Promise.all([
      fetch(`${baseUrl}/admin/students`, { credentials: 'include' }).then(res => res.json()),
      fetch(`${baseUrl}/admin/instructors`, { credentials: 'include' }).then(res => res.json())
    ])
      .then(([studentsData, instructorsData]) => {
        setStudentsList(Array.isArray(studentsData) ? studentsData : []);
        setInstructorsList(Array.isArray(instructorsData) ? instructorsData : []);
      })
      .catch(() => setError("Failed to synchronize user records directories."))
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

  const handleDeleteReview = (reviewId) => {
    if (!window.confirm("Are you absolutely sure you want to remove this review?")) return;
    setError('');
    setSuccessMessage('');
    fetch(`${baseUrl}/admin/reviews/${reviewId}`, { method: 'DELETE', credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error("Could not execute review deletion override.");
        return res.json();
      })
      .then((data) => {
        setSuccessMessage(data.message || "Review content removed successfully.");
        setReviews(prev => prev.filter(item => item.id !== reviewId));
      })
      .catch((err) => setError(err.message));
  };

  const handleDeleteUserAccount = (targetId, typeClassification) => {
    const label = typeClassification === 'student' ? 'Student' : 'Instructor';
    if (!window.confirm(`WARNING: Are you sure you want to completely delete this ${label} account? This action cannot be undone.`)) {
      return;
    }

    setError('');
    setSuccessMessage('');
    const endpointPath = typeClassification === 'student' ? `students/${targetId}` : `instructors/${targetId}`;

    fetch(`${baseUrl}/admin/${endpointPath}`, {
      method: 'DELETE',
      credentials: 'include'
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Could not delete specified platform account.`);
        return res.json();
      })
      .then(() => {
        setSuccessMessage(`${label} profile credentials evicted successfully.`);
        if (typeClassification === 'student') {
          setStudentsList(prev => prev.filter(user => (user.user_id || user.id) !== targetId));
        } else {
          setInstructorsList(prev => prev.filter(user => (user.user_id || user.id) !== targetId));
        }
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div className="bg-light min-vh-100 py-5 text-dark">
      <div className="container" style={{ marginTop: '2rem' }}>
        
        {/* Title Header */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 text-center">
            <h1 className="fw-bold mb-2 text-dark">Administrative Control Panel</h1>
            <p className="text-muted">Manage system approvals, examine registered profiles, and moderate global data layers.</p>
          </div>
        </div>

        {/* 3-Tab Controller Navigation System */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-lg-8 text-center">
            <div className="btn-group w-100 shadow-sm rounded-pill p-1 bg-white border flex-wrap">
              <button 
                className={`btn rounded-pill px-3 fw-medium ${activeTab === 'instructors' ? 'text-white' : 'btn-white text-secondary border-0'}`}
                style={activeTab === 'instructors' ? { backgroundColor: '#6f42c1' } : {}}
                onClick={() => setActiveTab('instructors')}
              >
                <i className="bi bi-person-badge-fill me-1.5"></i> Applications Queue
              </button>
              <button 
                className={`btn rounded-pill px-3 fw-medium ${activeTab === 'reviews' ? 'text-white' : 'btn-white text-secondary border-0'}`}
                style={activeTab === 'reviews' ? { backgroundColor: '#6f42c1' } : {}}
                onClick={() => setActiveTab('reviews')}
              >
                <i className="bi bi-chat-square-text-fill me-1.4"></i> Content Moderation
              </button>
              <button 
                className={`btn rounded-pill px-3 fw-medium ${activeTab === 'users' ? 'text-white' : 'btn-white text-secondary border-0'}`}
                style={activeTab === 'users' ? { backgroundColor: '#6f42c1' } : {}}
                onClick={() => setActiveTab('users')}
              >
                <i className="bi bi-people-fill me-1.5"></i> User Accounts List
              </button>
            </div>
          </div>
        </div>

        {/* Informational Status Feedback System */}
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

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ color: '#6f42c1' }} role="status">
              <span className="visually-hidden">Syncing Server Core...</span>
            </div>
          </div>
        )}

        {!loading && (
          <div className="row mt-4">
            <div className="col-12">
              
              {/* TAB 1: PENDING INSTRUCTOR APPLICATIONS */}
              {activeTab === 'instructors' && (
                <div className="card shadow-sm border-0 rounded-3 bg-white p-4">
                  <h3 className="fw-bold mb-4 text-dark h5 border-bottom pb-2 text-start">Pending Access Authorizations</h3>
                  {instructors.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0 text-dark text-start">
                        <thead className="table-light text-secondary">
                          <tr><th>Full Name</th><th>Email Destination</th><th>Verification Portfolio</th><th>Submission Date</th><th className="text-center">Action Decisions</th></tr>
                        </thead>
                        <tbody>
                          {instructors.map((inst, index) => (
                            <tr key={inst.id || `pending-${index}`}>
                              <td><span className="fw-bold">{inst.name}</span></td>
                              <td><span className="text-muted">{inst.email}</span></td>
                              <td><a href={inst.resume_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary rounded-pill px-3"><i className="bi bi-file-earmark-pdf me-1"></i>View CV</a></td>
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
                  ) : <p className="text-muted py-4 text-center">No pending instructor rows inside the processing queue.</p>}
                </div>
              )}

              {/* TAB 2: CONTENT MODERATION */}
              {activeTab === 'reviews' && (
                <div className="card shadow-sm border-0 rounded-3 bg-white p-4">
                  <h3 className="fw-bold mb-4 text-dark h5 border-bottom pb-2 text-start">Platform Content Moderation</h3>
                  {reviews.length > 0 ? (
                    <div className="row g-3">
                      {reviews.map((rev, index) => (
                        <div key={rev.id || `review-${index}`} className="col-12">
                          <div className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-start shadow-sm text-start">
                            <div>
                              <div className="d-flex align-items-center mb-1 flex-wrap gap-2">
                                <span className="badge bg-warning text-dark"><i className="bi bi-star-fill me-1"></i>{rev.rating}.0</span>
                                <strong className="text-dark">Course ID: {rev.course_id}</strong>
                                <span className="text-muted">|</span>
                                <span className="text-secondary fw-medium">By: {rev.profiles?.name || "Unknown Student"}</span>
                              </div>
                              <p className="mb-0 text-muted mt-2 italic">"{rev.comment || 'No feedback text.'}"</p>
                            </div>
                            <button className="btn btn-sm btn-outline-danger rounded-pill px-3 flex-shrink-0" onClick={() => handleDeleteReview(rev.id)}>Delete Review</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-muted py-4 text-center">No structural course reviews published yet.</p>}
                </div>
              )}

              {/* 👥 TAB 3: PLATFORM USER DIRECTORIES & SYSTEM PURGING */}
              {activeTab === 'users' && (
                <div className="card shadow-sm border-0 rounded-3 bg-white p-4 text-start">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4 flex-wrap gap-3">
                    <h3 className="fw-bold text-dark h5 mb-0">Global Members Management</h3>
                    
                    <div className="btn-group btn-group-sm rounded-pill p-0.5 bg-light border">
                      <button 
                        className={`btn rounded-pill px-3 ${userSubTab === 'student' ? 'btn-dark text-white' : 'btn-light text-secondary border-0'}`}
                        onClick={() => setUserSubTab('student')}
                      >
                        Students ({studentsList.length})
                      </button>
                      <button 
                        className={`btn rounded-pill px-3 ${userSubTab === 'instructor' ? 'btn-dark text-white' : 'btn-light text-secondary border-0'}`}
                        onClick={() => setUserSubTab('instructor')}
                      >
                        Instructors ({instructorsList.length})
                      </button>
                    </div>
                  </div>

                  {userSubTab === 'student' ? (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0 text-dark">
                        <thead className="table-light text-secondary">
                          <tr>
                            <th>Student Account Name</th>
                            <th>Status Class</th>
                            <th>Student Email</th>
                            <th className="text-center">System Safety Decimation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentsList.length > 0 ? (
                            studentsList.map((stud, index) => {
                              const studentId = stud.student_id || stud.user_id || stud.id || stud.uuid;
                              
                              return (
                                <tr key={studentId || `stud-${index}`}>
                                  <td><span className="fw-bold text-dark">{stud.name || 'Anonymous User'}</span></td>
                                  <td><span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5">Active Student</span></td>
                                  <td><code className="text-muted small">{stud.email || 'N/A'}</code></td>
                                  <td className="text-center">
                                    <button 
                                      className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                      onClick={() => {
                                        if (!studentId) {
                                          alert(`Sync Error: Backend keys contain: ${Object.keys(stud).join(', ')}`);
                                          return;
                                        }
                                        handleDeleteUserAccount(studentId, 'student');
                                      }}
                                    >
                                      <i className="bi bi-person-x-fill me-1"></i>Delete Account
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : <tr><td colSpan="4" className="text-center py-4 text-muted">No students registered in database.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0 text-dark">
                        <thead className="table-light text-secondary">
                          <tr>
                            <th>Instructor Name</th>
                            <th>Role Target Badge</th>
                            <th>User Email</th>
                            <th className="text-center">System Safety Decimation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {instructorsList.length > 0 ? (
                            instructorsList.map((inst, index) => {
                              const instructorId = inst.instructor_id || inst.user_id || inst.id || inst.uuid;
                              
                              return (
                                <tr key={instructorId || `inst-${index}`}>
                                  <td>
                                    {/* ✅ Wrap name in a navigational link passing the instructor ID via URL query parameter */}
                                    <Link 
                                      to={`/instructor-analytics?instructor_id=${instructorId}`} 
                                      className="fw-bold text-decoration-none"
                                      style={{ color: '#6f42c1' }}
                                    >
                                      {inst.name || 'Anonymous Instructor'} <i className="bi bi-box-arrow-up-right small ms-1" style={{ fontSize: '0.75rem' }}></i>
                                    </Link>
                                  </td>
                                  <td><span className="badge bg-purple-subtle text-primary border border-primary-subtle rounded-pill px-2.5" style={{ color: '#6f42c1' }}>Certified Instructor</span></td>
                                  <td><code className="text-muted small">{inst.email || 'N/A'}</code></td>
                                  <td className="text-center">
                                    <button 
                                      className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                      onClick={() => {
                                        if (!instructorId) {
                                          alert(`Sync Error: Backend keys contain: ${Object.keys(inst).join(', ')}`);
                                          return;
                                        }
                                        handleDeleteUserAccount(instructorId, 'instructor');
                                      }}
                                    >
                                      <i className="bi bi-person-x-fill me-1"></i>Delete Account
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                           ) : <tr><td colSpan="4" className="text-center py-4 text-muted">No instructors registered in database.</td></tr>}
                        </tbody>
                      </table>
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