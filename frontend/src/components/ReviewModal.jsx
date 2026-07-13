import React, { useState, useContext, useEffect } from 'react';
import { ProductContext } from '../context/ProductContext';

export default function ReviewModal() {
  const {
    selectedProduct,
    showReviewModal,
    setShowReviewModal,
    addToast,
    fetchReviews,
    fetchProducts
  } = useContext(ProductContext);

  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset states when modal is opened/closed
  useEffect(() => {
    if (!showReviewModal) {
      setReviewName('');
      setReviewRating(5);
      setReviewTitle('');
      setReviewComment('');
    }
  }, [showReviewModal]);

  if (!showReviewModal || !selectedProduct) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewTitle.trim() || !reviewComment.trim()) {
      addToast("⚠️ Please fill in all required fields");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct._id,
          reviewerName: reviewName,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment
        })
      });
      const newRev = await res.json();
      if (newRev.reviewerName) {
        addToast("✨ Review submitted successfully!");
        setShowReviewModal(false);
        fetchReviews(selectedProduct._id);
        fetchProducts(); // Refresh product avg rating & count
      } else {
        addToast("❌ Review submission failed");
      }
    } catch (error) {
      console.error(error);
      addToast("❌ Review submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`modal-overlay ${showReviewModal ? 'active' : ''}`} onClick={() => setShowReviewModal(false)}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">⭐ Write a Customer Review</h3>
          <button className="modal-close-btn" onClick={() => setShowReviewModal(false)}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Review Rating</label>
              <div className="interactive-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    className={`interactive-star ${reviewRating >= star ? 'selected' : ''}`}
                    onClick={() => setReviewRating(star)}
                    style={{ cursor: 'pointer' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={reviewName} 
                onChange={(e) => setReviewName(e.target.value)} 
                placeholder="e.g. Sana K."
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Review Title</label>
              <input 
                type="text" 
                className="form-control" 
                value={reviewTitle} 
                onChange={(e) => setReviewTitle(e.target.value)} 
                placeholder="e.g. Highly recommend!"
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Review Comment</label>
              <textarea 
                rows="4" 
                className="form-control" 
                value={reviewComment} 
                onChange={(e) => setReviewComment(e.target.value)} 
                placeholder="What did you like or dislike about this dress?"
                required
              ></textarea>
            </div>
            <button type="submit" className="form-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
