import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../utils/api';
import '../styles/Reviews.css';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadReviews();
  }, [productId, sortBy, page]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await reviewAPI.getProductReviews(productId, {
        page,
        limit: 5,
        sortBy
      });

      if (response.success) {
        setReviews(response.data.reviews);
        setAverageRating(response.data.averageRating);
        setTotalReviews(response.data.totalReviews);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await reviewAPI.markHelpful(reviewId);
      // Reload reviews to get updated helpful count
      loadReviews();
    } catch (err) {
      console.error('Error marking helpful:', err);
    }
  };

  const RatingStars = ({ rating, size = 'medium' }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'} ${size}`}
        >
          ★
        </span>
      );
    }
    return <div className="rating-stars">{stars}</div>;
  };

  const RatingDistribution = () => {
    if (totalReviews === 0) return null;

    return (
      <div className="rating-distribution">
        <h4>Rating Distribution</h4>
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="distribution-row">
            <span className="star-label">{star} ★</span>
            <div className="distribution-bar">
              <div className="distribution-fill" style={{ width: '70%' }}></div>
            </div>
            <span className="distribution-count">({Math.floor(totalReviews * 0.2)})</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="reviews-container">Loading reviews...</div>;
  }

  return (
    <div className="reviews-container">
      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="average-rating">
          <div className="rating-display">
            <div className="large-rating">{averageRating}</div>
            <RatingStars rating={Math.round(averageRating)} size="large" />
            <div className="review-count">Based on {totalReviews} reviews</div>
          </div>
        </div>

        <RatingDistribution />
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h3>Customer Reviews ({totalReviews})</h3>
          <div className="sort-options">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}>
              <option value="newest">Newest</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {reviews.length === 0 ? (
          <div className="no-reviews">No reviews yet. Be the first to review this product!</div>
        ) : (
          <>
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <h4>{review.title}</h4>
                      <RatingStars rating={review.rating} />
                      <span className="reviewer-name">{review.userName}</span>
                      {review.isVerifiedPurchase && (
                        <span className="verified-badge">✓ Verified Purchase</span>
                      )}
                    </div>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <p className="review-comment">{review.comment}</p>

                  <div className="review-footer">
                    <button
                      className="helpful-btn"
                      onClick={() => handleMarkHelpful(review._id)}
                    >
                      👍 Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="pagination-btn"
                >
                  ← Previous
                </button>
                <span className="page-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
