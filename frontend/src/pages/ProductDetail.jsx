import React, { useContext, useState, useEffect } from 'react';
import { ProductContext } from '../context/ProductContext';
import { CartContext } from '../context/CartContext';

export default function ProductDetail() {
  const {
    selectedProduct,
    setShowSizingModal,
    setShowReviewModal,
    setShowCheckoutModal,
    productReviews,
    fetchReviews
  } = useContext(ProductContext);

  const { addToCart } = useContext(CartContext);

  const [detailSize, setDetailSize] = useState('Medium');
  const [detailQty, setDetailQty] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState(0); // 0 = Details, 1 = Shipping, -1 = Closed
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Scroll to top when product details loads
  useEffect(() => {
    window.scrollTo(0, 0);
    setDetailQty(1);
    setActiveImageIndex(0);
    if (selectedProduct) {
      setDetailSize(selectedProduct.sizes[0] || 'Medium');
      fetchReviews(selectedProduct._id);
    }
  }, [selectedProduct]);

  if (!selectedProduct) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <p>Please select a product from our Shop catalog.</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(selectedProduct, detailSize, detailQty);
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, detailSize, detailQty);
    setShowCheckoutModal(true);
  };

  const discountAmount = selectedProduct.originalPrice - selectedProduct.price;
  const discountPercent = Math.round((1 - selectedProduct.price / selectedProduct.originalPrice) * 100);

  return (
    <div className="container">
      <div className="product-detail-layout" style={{ marginTop: '40px' }}>
        {/* Left Column: Image gallery */}
        <div className="product-gallery">
          <div className="product-gallery-main">
            <img 
              src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]} 
              alt={selectedProduct.title} 
            />
          </div>
          <div className="product-gallery-thumbs">
            {selectedProduct.images.map((img, idx) => (
              <div 
                key={idx} 
                className={`product-thumb ${activeImageIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(idx)}
                style={{ cursor: 'pointer' }}
              >
                <img src={img} alt={`thumbnail-${idx}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: details */}
        <div className="product-info-panel">
          <span className="product-tag">{selectedProduct.fabric} | {selectedProduct.category}</span>
          <h1 className="product-detail-title">{selectedProduct.title}</h1>
          
          <div className="product-rating-row">
            <div className="stars-rating">
              {'★'.repeat(Math.round(selectedProduct.rating))}
              {'☆'.repeat(5 - Math.round(selectedProduct.rating))}
            </div>
            <span 
              className="reviews-link" 
              onClick={() => document.getElementById('reviews-anchor')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ cursor: 'pointer' }}
            >
              {selectedProduct.reviewsCount} reviews
            </span>
          </div>

          <div className="product-detail-prices">
            <span className="detail-price">Rs.{selectedProduct.price.toLocaleString()}</span>
            <span className="detail-original-price">Rs.{selectedProduct.originalPrice.toLocaleString()}</span>
            {discountPercent > 0 && (
              <span className="detail-save-badge">SAVE {discountPercent}%</span>
            )}
          </div>

          {discountAmount > 0 && (
            <div className="save-alert-pill">
              <span>🏷️</span> You Save Rs.{discountAmount.toLocaleString()} + Fast Delivery
            </div>
          )}

          {/* Sizing Chart link */}
          <div className="swatch-group">
            <div className="swatch-header">
              <span>Size: {detailSize}</span>
              <span className="size-chart-link" onClick={() => setShowSizingModal(true)} style={{ cursor: 'pointer' }}>
                📐 Sizing Chart
              </span>
            </div>
            <div className="size-pills">
              {selectedProduct.sizes.map((sz) => (
                <button 
                  key={sz} 
                  className={`size-pill ${detailSize === sz ? 'active' : ''}`}
                  onClick={() => setDetailSize(sz)}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency Progress Bar */}
          <div className="stock-urgency-box">
            <div className="stock-left-text">
              <span>Only {selectedProduct.stock} left in stock</span>
              <span>SELLING FAST</span>
            </div>
            <div className="stock-progress-bar">
              <div className="stock-progress-fill" style={{ width: `${(selectedProduct.stock / 15) * 100}%` }}></div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>CLAIMED</span>
              <span>{selectedProduct.claimed}% sold</span>
            </div>
          </div>

          {/* Quantity picker */}
          <div className="swatch-header">
            <span>Quantity</span>
          </div>
          <div className="qty-selector">
            <button className="qty-btn" onClick={() => setDetailQty(Math.max(1, detailQty - 1))}>-</button>
            <span className="qty-value">{detailQty}</span>
            <button className="qty-btn" onClick={() => setDetailQty(detailQty + 1)}>+</button>
          </div>

          {/* Buying actions */}
          <div className="buy-actions">
            <button className="btn-add-cart" onClick={handleAddToCart}>Add to Cart</button>
            <button className="btn-buy-now" onClick={handleBuyNow}>Buy It Now</button>
          </div>

          {/* Details accordions */}
          <div className="detail-accordions">
            <div className={`accordion-item ${activeAccordion === 0 ? 'active' : ''}`}>
              <div 
                className="accordion-title" 
                onClick={() => setActiveAccordion(activeAccordion === 0 ? -1 : 0)}
                style={{ cursor: 'pointer' }}
              >
                <span>Details</span>
                <span>{activeAccordion === 0 ? '−' : '+'}</span>
              </div>
              <div className="accordion-content">
                <ul style={{ paddingLeft: '20px' }}>
                  {selectedProduct.details.map((detail, idx) => (
                    <li key={idx} style={{ marginBottom: '5px' }}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={`accordion-item ${activeAccordion === 1 ? 'active' : ''}`}>
              <div 
                className="accordion-title" 
                onClick={() => setActiveAccordion(activeAccordion === 1 ? -1 : 1)}
                style={{ cursor: 'pointer' }}
              >
                <span>Shipping & Exchanges</span>
                <span>{activeAccordion === 1 ? '−' : '+'}</span>
              </div>
              <div className="accordion-content">
                <p>🚛 <strong>Cash on Delivery:</strong> Available nationwide across Pakistan.</p>
                <p>📦 <strong>Delivery Time:</strong> 3-5 working days.</p>
                <p>🔁 <strong>Exchanges:</strong> Hassle-free exchanges within 7 days of delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Judge.me Reviews Portal */}
      <section id="reviews-anchor" className="reviews-section" style={{ margin: '60px 0 100px' }}>
        <div className="section-title-wrap">
          <h2 className="section-title">Customer Reviews</h2>
        </div>
        <div className="reviews-summary-box">
          <div className="reviews-stat-left">
            <span className="reviews-stat-avg">{selectedProduct.rating}</span>
            <div className="stars-rating" style={{ fontSize: '1.2rem' }}>
              {'★'.repeat(Math.round(selectedProduct.rating))}
              {'☆'.repeat(5 - Math.round(selectedProduct.rating))}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Based on {selectedProduct.reviewsCount} reviews
            </span>
          </div>
          <button className="btn-write-review" onClick={() => setShowReviewModal(true)}>
            Write a review
          </button>
        </div>

        <div className="review-list-items">
          {productReviews.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              No reviews yet. Be the first to leave one!
            </div>
          ) : (
            productReviews.map((rev, index) => (
              <div key={index} className="review-item-card">
                <div className="review-meta">
                  <span className="reviewer-name">{rev.reviewerName}</span>
                  <span className="review-date">{new Date(rev.date).toLocaleDateString()}</span>
                </div>
                <div className="review-item-stars">
                  {'★'.repeat(rev.rating)}
                  {'☆'.repeat(5 - rev.rating)}
                </div>
                <h4 className="review-item-title">{rev.title}</h4>
                <p className="review-item-body">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
