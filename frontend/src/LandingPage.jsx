import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      
      {/* 2. Hero Section */}
      <header className="container my-auto py-5">
        <div className="row align-items-center justify-content-center">
          <div className="col-lg-6 text-center text-lg-start mb-5 mb-lg-0">
            {/* Scaled 3x Mortarboard Icon */}
            <div className="mb-3 d-inline-block">
              <i className="bi bi-mortarboard-fill" style={{ color: '#6f42c1', fontSize: '4.5rem' }}></i>
            </div>
            <h1 className="display-4 fw-bold mb-3 text-dark" style={{ letterSpacing: '-1px', lineHeight: '1.2' }}>
              Welcome to <span style={{ color: '#6f42c1' }}>Learnify</span>
            </h1>
            <p className="lead text-muted mb-4 fs-5">
              Your one-stop platform for online learning. Master new skills, earn recognized certifications, and learn from top-tier global experts at your own pace.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
              <Link to="/courses" className="btn text-white fw-semibold px-5 py-3 shadow" style={{ backgroundColor: '#6f42c1', borderRadius: '0.75rem' }}>
                Explore Courses
              </Link>
              <Link to="/" className="btn btn-outline-secondary fw-semibold px-5 py-3" style={{ borderRadius: '0.75rem', borderColor: '#dee2e6', color: '#495057' }}>
                Watch Demo
              </Link>
            </div>
          </div>

          {/* 3. Hero Visual / Action Card */}
          <div className="col-md-8 col-lg-5 offset-lg-1">
            <div className="card p-5 shadow-lg border-0 text-center bg-white" style={{ borderRadius: '1.5rem' }}>
              <div className="bg-light p-4 rounded-4 mb-4 text-center">
                <i className="bi bi-shield-check fs-1" style={{ color: '#6f42c1' }}></i>
                <h5 className="fw-bold mt-2 mb-0 text-dark">Join 10,000+ Students</h5>
              </div>
              <p className="text-muted mb-4 small">
                Create a free account to unlock bite-sized video lessons, practice quizzes, and interactive community forums.
              </p>
              <div className="d-grid gap-3">
                <Link to="/register" className="btn text-white fw-semibold py-2.5 shadow-sm" style={{ backgroundColor: '#6f42c1', borderRadius: '0.75rem' }}>
                  Create Free Account
                </Link>
                <div className="text-center mt-2">
                  <span className="text-muted small">Already a member? </span>
                  <Link to="/login" className="small fw-bold text-decoration-none" style={{ color: '#6f42c1' }}>Sign In</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 4. Features Grid Section */}
      <section className="bg-white py-5 border-top">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Why Learn With Learnify?</h2>
            <p className="text-muted">Everything you need to succeed in your professional journey.</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <div className="p-3 mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f3e8ff', width: '60px', height: '60px' }}>
                <i className="bi bi-laptop fs-3" style={{ color: '#6f42c1' }}></i>
              </div>
              <h5 className="fw-bold text-dark">Flexible Schedule</h5>
              <p className="text-muted small px-3">Learn on your own time from any device, anywhere in the world.</p>
            </div>
            <div className="col-md-4 text-center">
              <div className="p-3 mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f3e8ff', width: '60px', height: '60px' }}>
                <i className="bi bi-person-workspace fs-3" style={{ color: '#6f42c1' }}></i>
              </div>
              <h5 className="fw-bold text-dark">Expert Mentors</h5>
              <p className="text-muted small px-3">Gain practical insights directly from industry leading professionals.</p>
            </div>
            <div className="col-md-4 text-center">
              <div className="p-3 mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f3e8ff', width: '60px', height: '60px' }}>
                <i className="bi bi-award fs-3" style={{ color: '#6f42c1' }}></i>
              </div>
              <h5 className="fw-bold text-dark">Certifications</h5>
              <p className="text-muted small px-3">Earn verified, shareable certificates to showcase your mastery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Simple Footer */}
      <footer className="bg-dark text-light py-4 mt-auto">
        <div className="container text-center">
          <p className="mb-0 small text-white-50">&copy; {new Date().getFullYear()} Learnify Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
