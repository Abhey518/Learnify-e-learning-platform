import React, { useState } from 'react';

export default function SubmitReviewForm({ courseId, courseTitle, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || '/api';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const payload = {
      course_id: parseInt(courseId) || 5,
      rating: rating,
      comment: comment
    };

    fetch(`${baseUrl}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      credentials: 'include' // Enforces your session login validation check
    })

    .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || data.errors?.comment || data.errors?.rating || "Failed to submit your review.");
        }
        return data;
      })

      .then((data) => {
        setSuccess("Thank you! Your feedback has been published successfully.");
        setComment('');
        setRating(5);
        
        // Triggers parent callback if provided to refresh layout arrays instantly
        if (onReviewSubmitted) {
          onReviewSubmitted(data.review);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="card shadow-sm border-0 rounded-3 bg-white text-dark overflow-hidden">
      <div className="card-body p-4 text-start">
        
        <h4 className="fw-bold text-dark mb-1 h5">Share Your Experience</h4>
        <p className="text-muted small mb-4">
          Reviewing: <span className="fw-semibold text-dark">{courseTitle || `Course #${courseId}`}</span>
        </p>

        {/* Informational Status Feedbacks */}
        {success && (
          <div className="alert alert-success text-center small shadow-sm mb-4" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i> {success}
          </div>
        )}

        {error && (
          <div className="alert alert-danger text-center small shadow-sm mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Interactive Dynamic Star Selection Matrix */}
          <div className="mb-4">
            <label className="form-label fw-medium text-secondary small d-block mb-2">
              Your Rating Selection
            </label>
            <div className="d-flex align-items-center gap-1 fs-3">
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit = star <= (hoveredRating || rating);
                return (
                  <i
                    key={star}
                    className={`bi ${isLit ? 'bi-star-fill text-warning' : 'bi-star text-muted'} cursor-pointer`}
                    style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  ></i>
                );
              })}
              <span className="ms-3 text-muted small fw-medium">
                ({rating} out of 5 Stars)
              </span>
            </div>
          </div>

          {/* Comment Feedback Input Area Box */}
          <div className="mb-4">
            <label htmlFor="reviewComment" className="form-label fw-medium text-secondary small mb-2">
              Written Comments (Optional)
            </label>
            <textarea
              id="reviewComment"
              className="form-control bg-light border text-dark ps-3 py-2.5"
              rows="4"
              placeholder="What did you love about this learning experience? What could be improved? Taught by top specialists..."
              style={{ fontSize: '0.95rem', borderRadius: '10px', resize: 'none' }}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
            ></textarea>
          </div>

          {/* Submit Action Execution Command Button */}
          <div className="d-grid mt-2">
            <button
              type="submit"
              className="btn btn-lg text-white fw-medium rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
              style={{ backgroundColor: '#6f42c1', height: '48px', fontSize: '1rem' }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Publishing Feedbacks...
                </>
              ) : (
                <>
                  <i className="bi bi-send-fill small"></i> Submit Review
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}