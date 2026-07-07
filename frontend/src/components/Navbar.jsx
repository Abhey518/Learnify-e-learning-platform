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
              role: data.role || 'student',
              name: data.name || 'User' 
            });
            const isLogeed = true;
          } else {
            setUser({ logged_in: false, role: null });
          }
        })
        .catch((err) => {
          console.error("Session sync check skipped:", err.message);
          setUser({ logged_in: false, role: null });
        });
    }, [location.pathname]); 


    // Clean application logout cleanup task routine routing
  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (response.ok) {
        window.location.href = '/'; 
      }
    } catch (err) {
      console.error("Logout dispatch failure execution trace:", err);
    }
  };

  // Determine button active highlighting states natively using current location path
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white border-bottom shadow-sm fixed-top py-2.5">
      <div className="container">
        
        {/* Brand System Logo Title */}
        <Link className="navbar-brand fw-bold d-flex align-items-center text-dark" to="/">
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
              /* --- User Is Authenticated Successfully: Show Profile Dropdown Menu --- */
              <div className="dropdown">
                <button 
                  className="btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-pill border shadow-sm text-dark bg-light dropdown-toggle"
                  type="button" 
                  id="navbarUserDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  style={{ fontWeight: '600' }}
                >
                  <i className="bi bi-person-circle fs-5" style={{ color: '#6f42c1' }}></i>
                  <span>{user.name}</span>
                </button>
                
                {/* Dropdown Items Overlaid Box Grid Alignments */}
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 p-2.5 rounded-3 text-start animate-fadeIn" aria-labelledby="navbarUserDropdown" style={{ minWidth: '210px' }}>
                  {/* Informational Header Section item slot */}
                  <li className="px-3 py-2 border-bottom mb-2 bg-light/40 rounded-2">
                    <div className="small text-muted fw-normal" style={{ fontSize: '0.75rem' }}>Signed in as</div>
                    <div className="fw-bold text-dark text-truncate">{user.name}</div>
                    <span className="badge text-capitalize mt-1 px-2 py-1 text-white" style={{ backgroundColor: '#6f42c1', fontSize: '0.7rem' }}>
                      {user.role}
                    </span>
                  </li>
                  
                  {/* Context Dashboard Nav Links */}
                  <li>
                    <Link 
                      className="dropdown-item py-2 small rounded-2 fw-medium text-dark d-flex align-items-center" 
                      to={
                        user.role === 'instructor' ? '/dashboards/instructor' : 
                        user.role === 'admin' ? '/admin' : '/dashboards/student'
                      }
                    >
                      <i className="bi bi-speedometer2 me-2 text-secondary"></i> My Dashboard
                    </Link>
                  </li>
                  
                  <li>
                    <Link className="dropdown-item py-2 small rounded-2 fw-medium text-dark d-flex align-items-center" to="/profile/settings">
                      <i className="bi bi-gear me-2 text-secondary"></i> Account Settings
                    </Link>
                  </li>
                  
                  {/* Divider Action Separator Line */}
                  <li><hr className="dropdown-divider my-2 border-slate-100" /></li>
                  
                  {/* Destructive Logging Action item button link */}
                  <li>
                    <button 
                      onClick={handleSignOut}
                      className="dropdown-item py-2 small rounded-2 fw-semibold text-danger d-flex align-items-center"
                      type="button"
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              /* --- User is Logged Out: Render Public Default Route Buttons --- */
              <>
                {location.pathname !== '/login' && (
                  <Link 
                    to="/login" 
                    className="btn btn-sm px-4 py-2 fw-semibold text-white rounded-pill shadow-sm transition-all"
                    style={{ backgroundColor: '#4b2194' }}
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
