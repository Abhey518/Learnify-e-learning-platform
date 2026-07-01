import React, { useState, useEffect } from 'react';

export default function CourseReviewsSection({ courseId }) {
  const [reviews, setReviews] = useState([]);
  const [metrics, setMetrics] = useState({ average_rating: 0, total_reviews: 0, distribution: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    if (!courseId) return;

    setLoading(true);
    setError('');

    fetch(`${baseUrl}/courses/${courseId}/reviews`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load course reviews.");
        return res.json();
      })
      .then((data) => {
        // Expecting { success: true, reviews: [...], average_rating: X, total_reviews: Y }
        setReviews(data.reviews || []);
        
        // Calculate or map ratings distribution for the progress bars
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        (data.reviews || []).forEach(rev => {
          if (dist[rev.rating] !== undefined) dist[rev.rating]++;
        });

        setMetrics({
          average_rating: data.average_rating || 0,
          total_reviews: data.total_reviews || (data.reviews || []).length,
          distribution: dist
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" style={{ color: '#6f42c1' }} role="status">
          <span className="visually-hidden">Loading Feedback Matrix...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center small shadow-sm" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3 shadow-sm p-4 text-dark text-start border">
      <h3 className="fw-bold mb-4 h4 text-dark">Student Feedback</h3>

      {/* Summary Matrix Top Grid */}
      <div className="row g-4 align-items-center mb-5">
        {/* Left Big Badge Score */}
        <div className="col-12 col-md-4 text-center border-end border-md-end-none">
          <h4 className="display-3 fw-bold mb-0" style={{ color: '#6f42c1' }}>
            {metrics.average_rating.toFixed(1)}
          </h4>
          <div className="text-warning fs-4 my-1">
            {/* Generate static stars representing the average rating score rounded */}
            {[1, 2, 3, 4, 5].map((star) => (
              <i 
                key={star} 
                className={`bi ${star <= Math.round(metrics.average_rating) ? 'bi-star-fill' : 'bi-star'}`}
              ></i>
            ))}
          </div>
          <p className="text-muted small mb-0">Course Rating ({metrics.total_reviews} reviews)</p>
        </div>

        {/* Right Distribution Progress Bars */}
        <div className="col-12 col-md-8">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = metrics.distribution[stars] || 0;
            const percentage = metrics.total_reviews > 0 ? (count / metrics.total_reviews) * 100 : 0;
            
            return (
              <div key={stars} className="d-flex align-items-center mb-2">
                <span className="small text-secondary fw-medium me-2" style={{ width: '50px' }}>
                  {stars} Star
                </span>
                <div className="progress flex-grow-1 bg-light rounded-pill" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar rounded-pill" 
                    role="progressbar" 
                    style={{ width: `${percentage}%`, backgroundColor: '#6f42c1' }}
                    aria-valuenow={percentage} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
                <span className="small text-muted ms-3 text-end" style={{ width: '35px' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="text-muted opacity-25 my-4" />

      {/* Individual Review Comments Grid */}
      <h4 className="fw-bold text-dark h5 mb-3">All Reviews ({reviews.length})</h4>
      
      {reviews.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {reviews.map((rev, idx) => (
            <div key={rev.id || idx} className="p-3 border rounded-3 bg-light shadow-sm">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                <div>
                  <strong className="text-dark d-block">
                    {rev.profiles?.name || "Verified Student"}
                  </strong>
                  <span className="text-warning small">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <i key={i} className="bi bi-star-fill me-0.5"></i>
                    ))}
                    {Array.from({ length: 5 - rev.rating }).map((_, i) => (
                      <i key={i} className="bi bi-star text-muted me-0.5"></i>
                    ))}
                  </span>
                </div>
                <small className="text-muted">
                  {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                </small>
              </div>
              <p className="mb-0 text-secondary mt-2 italic">
                "{rev.comment || 'No written text summary provided for this course module.'}"
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted">
          <i className="bi bi-chat-left-dots fs-2 text-secondary mb-2 d-block"></i>
          <p className="mb-0 small">No students have commented on this course yet.</p>
        </div>
      )}
    </div>
  );
}