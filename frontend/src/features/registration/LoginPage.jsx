import React, { useState } from 'react';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fallback to /api if your VITE_API_URL environment string is blank
  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 1. Send request and save raw HTTP response stream into a variable
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include' // Instructs your browser to save the session cookie
      });

      // 2. Extracted exactly ONCE to prevent body stream execution crashes
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please try again.');
      }

      setSuccess('Logged in successfully! Redirecting...');
      
      // 3. Fallback tracking logic in case Flask doesn't provide a redirect_url property
      const targetUrl = data.redirect_url || '/dashboards/student';

      setTimeout(() => {
        window.location.href = targetUrl;
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
            
            {/* Login Form Box */}
            <div className="card shadow-sm border-0 rounded-4 p-4 p-sm-5 bg-white">
              
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="fw-bold text-dark mb-1">Welcome Back</h2>
                <p className="text-muted small">Log in to your Learnify account</p>
              </div>

              {/* Status Alert Banners */}
              {error && <div className="alert alert-danger small py-2 mb-3" role="alert">{error}</div>}
              {success && <div className="alert alert-success small py-2 mb-3" role="alert">{success}</div>}

              <form onSubmit={handleSubmit}>
                
                {/* Email Address Input */}
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
                      className="form-control bg-light border-start-0 ps-1 text-dark"
                      style={{ height: '46px' }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="mb-4 text-start">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold text-secondary mb-0">Password</label>
                    <a href="/forgot-password" className="small text-decoration-none" style={{ color: '#6f42c1' }}>Forgot?</a>
                  </div>
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
                      className="form-control bg-light border-start-0 ps-1 text-dark"
                      style={{ height: '46px' }}
                    />
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 fw-semibold border-0 shadow-sm d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: '#6f42c1', height: '48px' }}
                >
                  {loading && (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  )}
                  {loading ? 'Signing In...' : 'Log In'}
                </button>
              </form>

              {/* Redirection Link to Signup page */}
              <div className="text-center mt-4">
                <span className="small text-muted">New to Learnify? </span>
                <a href="/register" className="small fw-bold text-decoration-none" style={{ color: '#6f42c1' }}>
                  Create an account
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
