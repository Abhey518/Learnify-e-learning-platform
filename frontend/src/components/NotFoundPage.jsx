import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center text-dark py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 text-center">
            
            
            <div className="card shadow-sm border-0 rounded-3 bg-white p-5 position-relative overflow-hidden">
              
              
              <div className="mb-4 position-relative">
                <span 
                  className="fw-black d-block mb-0 font-monospace select-none" 
                  style={{ 
                    fontSize: '7.5rem', 
                    fontWeight: '900', 
                    color: 'rgba(111, 66, 193, 0.12)',
                    letterSpacing: '-2px',
                    lineHeight: '1'
                  }}
                >
                  404
                </span>
                
                
                <div 
                  className="position-absolute start-50 top-50 translate-middle rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                  style={{ 
                    backgroundColor: '#fff', 
                    color: '#6f42c1', 
                    width: '64px', 
                    height: '64px',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <i className="bi bi-journal-x fs-2"></i>
                </div>
              </div>

              
              <h1 className="fw-bold h3 mb-2 text-dark">Classroom Not Found</h1>
              <p className="text-secondary small px-3 mb-4">
                Looks like this module doesn't exist, or you’ve successfully skipped past the syllabus parameters! Let's get you back on track before the professor notices.
              </p>

              
              <div className="d-grid gap-2 max-w-xs mx-auto" style={{ maxWidth: '260px', margin: '0 auto' }}>
                <Link
                  to="/courses"
                  className="btn text-white fw-medium rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                  style={{ backgroundColor: '#6f42c1', height: '46px', fontSize: '0.95rem' }}
                >
                  <i className="bi bi-book-half"></i> Browse Available Courses
                </Link>
                
                <Link
                  to="/"
                  className="btn btn-link text-decoration-none text-muted small mt-1"
                >
                  <i className="bi bi-house-door-fill me-1"></i> Head Back Home
                </Link>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}