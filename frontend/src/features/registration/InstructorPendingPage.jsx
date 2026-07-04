import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function InstructorPendingPage() {
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  const handleCheckStatus = () => {
    setChecking(true);
    setStatusMessage('');
    setIsError(false);

    // Verify current browser context role by checking the session auth state
    fetch(`${baseUrl}/auth/current-user`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error("Could not verify registration logs.");
        return res.json();
      })
      .then((user) => {
        // If the admin has already changed the role to 'instructor', redirect instantly
        if (user.status === 'approved') {
          setStatusMessage("Congratulations! Your account has been approved. Redirecting to your dashboard...");
          setTimeout(() => navigate('/instructor-analytics'), 2000);
        } else {
          // Still matches 'pending_instructor' or equivalent non-approved state
          setStatusMessage("Your application is still under review by our administration team. We appreciate your patience!");
        }
      })
      .catch((err) => {
        setIsError(true);
        setStatusMessage("Unable to synchronize verification status. Please try again shortly.");
      })
      .finally(() => setChecking(false));
  };

  const handleLogout = () => {
    fetch(`${baseUrl}/auth/logout`, { method: 'POST', credentials: 'include' })
      .then(() => navigate('/login'));
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center text-dark py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 text-center">
            

            <div className="card shadow-sm border-0 rounded-3 bg-white p-5">
              

              <div className="mb-4">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle animate-pulse" 
                  style={{ 
                    backgroundColor: 'rgba(111, 66, 193, 0.1)', 
                    color: '#6f42c1',
                    width: '90px',
                    height: '90px'
                  }}
                >
                  <i className="bi bi-hourglass-split display-4"></i>
                </div>
              </div>


              <h1 className="fw-bold h3 mb-2 text-dark">Application Under Review</h1>
              <p className="text-muted small px-3 mb-4">
                Thank you for applying to teach on our platform! Our administrators are currently verifying your credentials and portfolio. This typically takes 24–48 hours.
              </p>


              {statusMessage && (
                <div 
                  className={`alert ${isError ? 'alert-danger' : 'alert-info'} small shadow-sm mb-4 border-0`} 
                  role="alert"
                >
                  <i className={`bi ${isError ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'} me-2`}></i>
                  {statusMessage}
                </div>
              )}


              <div className="d-flex flex-column gap-2 max-w-xs mx-auto" style={{ maxWidth: '320px', margin: '0 auto' }}>
                <button
                  type="button"
                  className="btn btn-lg text-white fw-medium rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                  style={{ backgroundColor: '#6f42c1', height: '46px', fontSize: '0.95rem' }}
                  onClick={handleCheckStatus}
                  disabled={checking}
                >
                  {checking ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Checking Credentials...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-clockwise"></i> Check Application Status
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-link text-decoration-none text-secondary small mt-2"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-left me-1"></i> Sign Out / Cancel Application
                </button>
              </div>

            </div>


            <p className="text-muted small mt-4">
              Have questions regarding verification? Contact support at <span className="fw-medium text-dark">support@eduplatform.com</span>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}