import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState({ logged_in: false, role: null });


  useEffect(() => {
      const finalUrl = '/api/auth/current-user';
      
      fetch(finalUrl, { credentials: 'include' })
        .then((res) => {
          if (!res.ok) throw new Error(`Server returned status ${res.status}`);
          return res.json();
        })
        .then((data) => {
          // Stripped down check: uses the exact field we added to Flask
          if (data && data.logged_in === true) {
            setUser({
              logged_in: true,
              role: data.role || 'student'
            });
          } else {
            setUser({ logged_in: false, role: null });
          }
        })
        .catch((err) => {
          console.error("Session sync check skipped:", err.message);
          setUser({ logged_in: false, role: null });
        });
    }, [location.pathname]); // Re-verify whenever the user moves between pages

  // Determine button active highlighting states natively using current location path
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white border-bottom shadow-sm fixed-top py-2.5">
      <div className="container">
        
        {/* Brand System Logo Title */}
        <Link className="navbar-brand fw-bold d-flex align-items-center text-dark" to="/">
          {/* Fixed color override: removed text-primary so purple works */}
          <i className="bi bi-mortarboard-fill me-2 fs-4" style={{ color: '#6f42c1' }}></i>
          <span style={{ letterSpacing: '0.4px', fontWeight: '700' }}>Learnify</span>
        </Link>

        {/* Mobile Sidebar Hamburger Toggle Trigger */}
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#publicSystemNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Central & Right Alignment Layout Groups */}
        <div className="collapse navbar-collapse" id="publicSystemNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-md-0 ms-md-3">
            <li className="nav-item">
              <Link className={`nav-link small fw-medium ${location.pathname === '/' ? 'active text-primary' : 'text-secondary'}`} to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link small fw-medium text-secondary" to="/courses">
                        Browse Courses
                </Link>
            </li>
          </ul>

          {/* Action Call Routing Block Container */}
          <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
            {user && user.logged_in ? (
              /* Shortcut if they are logged in */
              <Link 
                to={
                  user.role === 'instructor' ? '/dashboard/instructor' : 
                  user.role === 'admin' ? '/admin' : '/dashboard/student'
                }
                className="btn btn-sm px-4 py-2 fw-semibold text-white rounded-pill"
                style={{ backgroundColor: '#6f42c1' }}
              >
                Go to Dashboard <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            ) : (
              /* User is logged out */
              <>
                {location.pathname !== '/login' && (
                  <Link 
                    to="/login" 
                    className="btn btn-sm px-4 py-2 fw-semibold text-white rounded-pill shadow-sm transition-all"
                    style={{ backgroundColor: '#6f42c1' }}
                  >
                    Sign In
                  </Link>
                )}
                {location.pathname !== '/register' && (
                  <Link 
                    to="/register" 
                    className="btn btn-sm px-4 py-2 fw-semibold text-white rounded-pill shadow-sm transition-all"
                    style={{ backgroundColor: '#4b2194' }}
                  >
                    Get Started
                  </Link>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
