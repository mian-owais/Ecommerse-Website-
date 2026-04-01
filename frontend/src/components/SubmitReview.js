import React, { useState } from 'react';
import { reviewAPI } from '../utils/api';
import '../styles/Reviews.css';

const SubmitReview = ({ productId, onReviewSubmitted, isLoggedIn }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleRatingChange = (stars) => {
    setFormData(prev => ({
      ...prev,
      rating: stars
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a review title');
      return;
    }

    if (!formData.comment.trim()) {
      setError('Please enter a review comment');
      return;
    }

    if (formData.title.length > 100) {
      setError('Title cannot exceed 100 characters');
      return;
    }

    if (formData.comment.length > 500) {
      setError('Comment cannot exceed 500 characters');
      return;
    }

    setLoading(true);

    try {
      await reviewAPI.submitReview(productId, {
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment
      });

      setSuccess('Review submitted successfully!');
      setFormData({ rating: 5, title: '', comment: '' });
      
      // Trigger callback to refresh reviews
      if (onReviewSubmitted) {
        setTimeout(() => {
          onReviewSubmitted();
          setShowForm(false);
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="submit-review-container">
        <div className="login-prompt">
          <p>Please <span style={{ color: '#667eea' }}>login</span> to write a review</p>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-review-container">
      {!showForm ? (
        <button
          className="write-review-btn"
          onClick={() => setShowForm(true)}
        >
          ✍️ Write a Review
        </button>
      ) : (
        <div className="review-form">
          <div className="form-header">
            <h3>Share Your Experience</h3>
            <button
              className="close-btn"
              onClick={() => setShowForm(false)}
              type="button"
            >
              ✕
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Rating Selection */}
            <div className="form-group">
              <label>Rating</label>
              <div className="rating-selector">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`rating-btn ${star <= formData.rating ? 'selected' : ''}`}
                    onClick={() => handleRatingChange(star)}
                  >
                    {'★'.repeat(star)}{'☆'.repeat(5 - star)}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label htmlFor="title">
                Review Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Summarize your experience"
                maxLength="100"
                disabled={loading}
                className="form-input"
              />
              <div className="char-count">
                {formData.title.length}/100 characters
              </div>
            </div>

            {/* Comment */}
            <div className="form-group">
              <label htmlFor="comment">
                Your Review <span className="required">*</span>
              </label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Share details about your experience..."
                maxLength="500"
                rows="5"
                disabled={loading}
                className="form-textarea"
              />
              <div className="char-count">
                {formData.comment.length}/500 characters
              </div>
            </div>

            {/* Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SubmitReview;
