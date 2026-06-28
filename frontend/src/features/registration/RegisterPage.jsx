import React, { useState } from 'react';


export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    resume_url: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role') {
      setFormData({ ...formData, role: value, resume_url: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = data.redirect_url;
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column justify-content-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5">
            
            {/* Elegant Form Wrapper Card */}
            <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5 bg-white">
              
              {/* Brand Header Section */}
              <div className="text-center mb-4">
                <h2 className="fw-bold text-dark mb-1">Create an Account</h2>
                <p className="text-muted small">Join the Learnify e-learning platform</p>
              </div>

              {/* Server Status Messages */}
              {error && <div className="alert alert-danger small py-2 mb-3" role="alert">{error}</div>}
              {success && <div className="alert alert-success small py-2 mb-3" role="alert">{success}</div>}

              <form onSubmit={handleSubmit}>
                
                {/* 1. Account Tier Dropdown Selection */}
                <div className="mb-3 text-start">
                  <label className="form-label small fw-semibold text-secondary mb-1">Account Type</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-secondary border-end-0 px-3">
                      <i className="bi bi-person-badge"></i>
                    </span>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="form-select bg-light border-start-0 ps-1"
                      style={{ height: '46px' }}
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      {/* <option value="admin">Administrator</option> */}
                    </select>
                  </div>
                </div>

                {/* 2. Full Name Input */}
                <div className="mb-3 text-start">
                  <label className="form-label small fw-semibold text-secondary mb-1">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-secondary border-end-0 px-3">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="form-control bg-light border-start-0 ps-1"
                      style={{ height: '46px' }}
                    />
                  </div>
                </div>

                {/* 3. Email Input */}
                <div className="mb-3 text-start">
                  <label className="form-label small fw-semibold text-secondary mb-1">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-secondary border-end-0 px-3">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="form-control bg-light border-start-0 ps-1"
                      style={{ height: '46px' }}
                    />
                  </div>
                </div>

                {/* 4. Password Input */}
                <div className="mb-3 text-start">
                  <label className="form-label small fw-semibold text-secondary mb-1">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-secondary border-end-0 px-3">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="form-control bg-light border-start-0 ps-1"
                      style={{ height: '46px' }}
                    />
                  </div>
                </div>

                {/* 5. Conditional Instructor Resume Field */}
                {formData.role === 'instructor' && (
                  <div className="mb-3 text-start">
                    <label className="form-label small fw-semibold text-secondary mb-1">Resume Link</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-secondary border-end-0 px-3">
                        <i className="bi bi-link-45deg"></i>
                      </span>
                      <input
                        type="url"
                        name="resume_url"
                        required
                        value={formData.resume_url}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        className="form-control bg-light border-start-0 ps-1"
                        style={{ height: '46px' }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Execution Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 fw-semibold border-0 shadow-sm mt-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: '#6f42c1', height: '48px' }}
                >
                  {loading && (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  )}
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              {/* Route Alternative Footer redirection link */}
              <div className="text-center mt-4">
                <span className="small text-muted">Already have an account? </span>
                <a href="/login" className="small fw-bold text-decoration-none" style={{ color: '#6f42c1' }}>
                  Log in
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
