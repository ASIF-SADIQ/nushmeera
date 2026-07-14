import React, { useContext, useState, useEffect } from 'react';
import { ProductContext } from '../context/ProductContext';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const {
    products,
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
            <a 
              href={`https://api.whatsapp.com/send?phone=923086195677&text=Hi,%0AI want to order this product: ${selectedProduct.title}%0Ahttps://nushmeera.store/#/product/${selectedProduct._id}%0APrice: Rs.${selectedProduct.price}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-whatsapp"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style={{ width: '22px', marginRight: '10px' }} />
              ORDER ON WHATSAPP
            </a>
          </div>

          {/* Trust Badges Box */}
          <div className="trust-badges-box">
            <div className="trust-badge-row">
              <span className="trust-badge-icon">🚚</span>
              <div className="trust-badge-content">
                <div className="trust-badge-title">Free Delivery on Orders Over Rs. 7,000</div>
                <div className="trust-badge-desc">Rs. 200 delivery charge applies on orders below Rs. 7,000</div>
              </div>
              <div className="trust-badge-action">FREE</div>
            </div>
            <div className="trust-badge-row">
              <span className="trust-badge-icon">💳</span>
              <div className="trust-badge-content">
                <div className="trust-badge-title">Cash on Delivery Available</div>
                <div className="trust-badge-desc">Pay when your parcel arrives — no advance needed</div>
              </div>
              <div className="trust-badge-action" style={{ backgroundColor: '#f5f5f5', color: '#666' }}>COD</div>
            </div>
            <div className="trust-badge-row">
              <span className="trust-badge-icon">🔄</span>
              <div className="trust-badge-content">
                <div className="trust-badge-title">Easy Exchange within 7 Days</div>
                <div className="trust-badge-desc">Wrong size? WhatsApp us with your order number</div>
              </div>
            </div>
            <div className="trust-badge-row">
              <span className="trust-badge-icon">💬</span>
              <div className="trust-badge-content">
                <div className="trust-badge-title">Need help with size or details?</div>
                <div className="trust-badge-desc">Our team responds in minutes</div>
              </div>
              <a href="https://wa.me/923086195677" target="_blank" rel="noopener noreferrer" className="trust-badge-btn">
                Chat Now
              </a>
            </div>
          </div>

          {/* Product Details (Static List) */}
          <div className="product-details-list">
            <h4>Details</h4>
            <ul>
              {selectedProduct.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
            <p><strong>Disclaimer:</strong> Actual color may look slightly different from photos due to lighting and screen settings.</p>
          </div>

          {/* FAQ accordions */}
          <div className="detail-accordions" style={{ marginTop: '30px' }}>
            {[
              { icon: '📦', title: "Kya Milay Ga? (What's Included)", content: "Your order includes a complete stitched outfit — ready to wear. Check the product title for exact pieces (2Pc or 3Pc). No additional stitching required." },
              { icon: '📏', title: "Size Kaise Choose Karein?", content: "We offer S, M, L, XL across all products. Har product ke saath size chart diya gaya hai — please apni chest, length aur shoulder measurements check karein before placing order." },
              { icon: '🚚', title: "Delivery Kitne Din Mein Hogi?", content: "Delivery usually takes 3-5 working days all over Pakistan." },
              { icon: '💵', title: "Payment Ka Tareeqa?", content: "We offer Cash on Delivery (COD) nationwide." },
              { icon: '🔄', title: "Exchange/Return Policy", content: "Size issue ya defective item? 7 din ke andar exchange available hai. Conditions:\n• Product unworn ho aur tags attached hon\n• Order number + photos WhatsApp karein: 03086195677\n• Hum exchange process guide kar dein ge\nNote: Sale items exchange ke liye eligible nahi ho sakti. Refunds sirf defective/incorrect items pe available hain." },
              { icon: '🎨', title: "Color Same Aayega?", content: "Hum koshish karte hain ke photos bilkul accurate hon, lekin screen brightness aur lighting ki wajah se halka sa color difference ho sakta hai. Humare customer reviews aur videos mein jo color dikhta hai — woh closest representation hai." },
              { icon: '🧵', title: "Fabric Quality Kaisi Hai?", content: "Nushmeera sirf premium fabrics use karta hai — Silk Finish Lawn, Cotton, Khaddar aur more. Har fabric soft, breathable aur all-day comfortable hai. 5000+ customers ne humari quality pe trust kiya hai." },
              { icon: '❓', title: "Koi Aur Sawal?", content: "WhatsApp: 03086195677 (minutes mein reply)\nEmail: nushmeera4@gmail.com\nHum order se pehle aur baad mein — dono waqt help ke liye available hain 🤍" }
            ].map((faq, index) => (
              <div key={index} className={`accordion-item ${activeAccordion === index ? 'active' : ''}`}>
                <div 
                  className="accordion-title" 
                  onClick={() => setActiveAccordion(activeAccordion === index ? -1 : index)}
                  style={{ cursor: 'pointer' }}
                >
                  <span><span className="accordion-icon">{faq.icon}</span> {faq.title}</span>
                  <span>{activeAccordion === index ? '−' : '+'}</span>
                </div>
                <div className="accordion-content">
                  <p style={{ whiteSpace: 'pre-line' }}>{faq.content}</p>
                </div>
              </div>
            ))}
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

      {/* Recommended Products */}
      <section className="recommended-section" style={{ padding: '0 0 100px' }}>
        <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '30px', fontSize: '2rem' }}>You May Also Like</h2>
        <div className="products-grid">
          {products
            .filter(p => p._id !== selectedProduct._id)
            .sort(() => 0.5 - Math.random()) // Randomize
            .slice(0, 4) // Pick 4
            .map(p => (
              <ProductCard key={p._id} product={p} />
            ))
          }
        </div>
      </section>
    </div>
  );
}
