import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function InstructorRejectedPage() {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  const handleLogout = () => {
    fetch(`${baseUrl}/auth/logout`, { method: 'POST', credentials: 'include' })
      .then(() => navigate('/login'));
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center text-dark py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 text-center">
            
            {/* Main Application Status Card Canvas */}
            <div className="card shadow-sm border-0 rounded-3 bg-white p-5">
              
              {/* Dynamic Theme Icon Asset - Dark Crimson Warning Tone */}
              <div className="mb-4">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle" 
                  style={{ 
                    backgroundColor: 'rgba(220, 53, 69, 0.1)', 
                    color: '#dc3545',
                    width: '90px',
                    height: '90px'
                  }}
                >
                  <i className="bi bi-x-circle-fill display-4"></i>
                </div>
              </div>

              {/* Title Headings */}
              <h1 className="fw-bold h3 mb-2 text-dark">Application Status Update</h1>
              <p className="text-muted small px-3 mb-4">
                Thank you for your interest in teaching on our platform. After careful review of your submitted portfolio and teaching credentials, our administration team has determined that it does not quite align with our current curriculum criteria.
              </p>

              {/* Re-application Guideline Box */}
              <div className="p-3 border rounded-3 bg-light text-start shadow-sm mb-4 small">
                <h6 className="fw-bold text-dark mb-2"><i className="bi bi-info-circle-fill me-1.5" style={{ color: '#6f42c1' }}></i> Next Steps for Instructors</h6>
                <p className="text-secondary mb-2">
                  Applications are frequently turned down if curriculum outlines are missing, or if verification links/CV attachments were broken during the screening process.
                </p>
                <p className="text-secondary mb-0">
                  You are welcome to re-apply with an updated portfolio after <b>30 days</b> have passed.
                </p>
              </div>

              {/* Functional Interaction Action Buttons */}
              <div className="d-flex flex-column gap-2 max-w-xs mx-auto" style={{ maxWidth: '320px', margin: '0 auto' }}>
                <button
                  type="button"
                  className="btn btn-lg text-white fw-medium rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                  style={{ backgroundColor: '#6f42c1', height: '46px', fontSize: '0.95rem' }}
                  onClick={() => navigate('/courses')}
                >
                  <i className="bi bi-book-half"></i> Explore Platform Courses
                </button>

                <button
                  type="button"
                  className="btn btn-link text-decoration-none text-secondary small mt-2"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-left me-1"></i> Sign Out of Account
                </button>
              </div>

            </div>

            {/* Sub Footer Contact Hint */}
            <p className="text-muted small mt-4">
              Would you like to appeal this decision? Contact the validation council at <span className="fw-medium text-dark">appeals@eduplatform.com</span>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

// for rejected onece 