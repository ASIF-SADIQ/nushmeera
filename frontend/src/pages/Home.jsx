import React, { useContext, useState, useEffect } from 'react';
import { ProductContext } from '../context/ProductContext';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const {
    products,
    loading,
    navigateTo,
    setSelectedCategory,
    setShowCheckoutModal,
    setShowSizingModal,
    activePage
  } = useContext(ProductContext);

  const { addToCart } = useContext(CartContext);

  // 1. Hero 135-Product Slider State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Filter products that have valid images
  const validProducts = products.length > 0 ? products : [
    {
      _id: 'sample_1',
      title: 'Summer Lawn Edit 2026',
      category: '3 Piece Suits',
      fabric: 'Embroidered Lawn',
      price: 3690,
      originalPrice: 5990,
      images: ['https://cdn.shopify.com/s/files/1/0713/6552/5615/files/ChatGPTImageJul9_2026_01_11_23AM_7.png?v=1783717621']
    }
  ];

  // Auto-play 135-Product Hero Slider every 4 seconds continuously
  useEffect(() => {
    if (validProducts.length === 0) return;
    const slideTimer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % validProducts.length);
    }, 4000); // 4 seconds per slide

    return () => clearInterval(slideTimer);
  }, [validProducts.length]);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % validProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + validProducts.length) % validProducts.length);
  };

  // 2. Auto-Rotational Category Cards State (Rotates image every 10 seconds)
  const [catImageIndexes, setCatImageIndexes] = useState([0, 2, 4]);

  useEffect(() => {
    if (validProducts.length === 0) return;

    const catTimer = setInterval(() => {
      setCatImageIndexes(prev => [
        (prev[0] + 3) % validProducts.length,
        (prev[1] + 5) % validProducts.length,
        (prev[2] + 7) % validProducts.length
      ]);
    }, 10000);

    return () => clearInterval(catTimer);
  }, [validProducts.length]);

  useEffect(() => {
    if (activePage === 'about') {
      const storySection = document.querySelector('.our-story-section');
      if (storySection) {
        storySection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [activePage]);

  // Local state for featured product quick-add block
  const [featuredSize, setFeaturedSize] = useState('Medium');
  const [featuredQty, setFeaturedQty] = useState(1);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    navigateTo('shop');
  };

  const activeHeroProduct = validProducts[currentSlideIndex] || validProducts[0];
  const featuredProduct = validProducts[0] || null;
  const winners = validProducts.slice(1, 5);

  const cat1Product = validProducts[catImageIndexes[0] % validProducts.length];
  const cat2Product = validProducts[catImageIndexes[1] % validProducts.length];
  const cat3Product = validProducts[catImageIndexes[2] % validProducts.length];

  return (
    <div className="home-page">
      {/* 1. Ultra-Luxury Split-Screen 135-Product Hero Slider */}
      <section className="hero-product-slider">
        <div className="hero-product-container container">
          {/* Left Text Panel */}
          <div className="hero-product-text">
            <div className="hero-product-badge">
              <span>✨ CATALOG HIGHLIGHT {currentSlideIndex + 1} OF {validProducts.length}</span>
            </div>
            
            <span className="hero-product-category">{activeHeroProduct.category || 'Luxury Pret'}</span>
            <h1 className="hero-product-title">{activeHeroProduct.title}</h1>
            
            <div className="hero-product-meta">
              <span className="meta-pill">{activeHeroProduct.fabric || 'Premium Lawn'}</span>
              <span className="meta-pill">100% Uncropped Original</span>
            </div>

            <div className="hero-product-pricing">
              <span className="hero-price">Rs. {activeHeroProduct.price ? activeHeroProduct.price.toLocaleString() : '2,999'}</span>
              {activeHeroProduct.originalPrice && (
                <span className="hero-original-price">Rs. {activeHeroProduct.originalPrice.toLocaleString()}</span>
              )}
              {activeHeroProduct.originalPrice && (
                <span className="hero-discount-pill">
                  SAVE {Math.round((1 - activeHeroProduct.price / activeHeroProduct.originalPrice) * 100)}%
                </span>
              )}
            </div>

            <div className="hero-product-actions">
              <button 
                onClick={() => navigateTo('product', activeHeroProduct)} 
                className="hero-btn-primary"
              >
                Shop Outfit →
              </button>
              <button 
                onClick={() => handleCategorySelect(activeHeroProduct.category || '')} 
                className="hero-btn-secondary"
              >
                Browse Category
              </button>
            </div>

            {/* Slide Navigation Controls */}
            <div className="hero-slider-controls">
              <button className="ctrl-btn" onClick={prevSlide} aria-label="Previous Product">❮ Prev</button>
              <div className="slider-counter">
                <strong>{currentSlideIndex + 1}</strong> / {validProducts.length}
              </div>
              <button className="ctrl-btn" onClick={nextSlide} aria-label="Next Product">Next ❯</button>
            </div>
          </div>

          {/* Right Uncropped Product Image Frame */}
          <div className="hero-product-image-frame">
            <div className="hero-img-backdrop"></div>
            <img 
              key={activeHeroProduct._id}
              src={activeHeroProduct.images && activeHeroProduct.images[0] ? activeHeroProduct.images[0] : '/images/vaneeza_pink.png'} 
              alt={activeHeroProduct.title} 
              className="hero-product-img"
            />
            {/* Quick Tag */}
            <div className="hero-img-floating-tag">
              <span>💖 {activeHeroProduct.reviewsCount || 24} Verified Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Continuous Auto-Scrolling Infinite Product Showcase */}
      <section className="infinite-marquee-section">
        <div className="marquee-header container">
          <h3>🔥 Live Catalog Carousel • {validProducts.length} Uncropped Designs Auto-Rotating</h3>
        </div>
        <div className="marquee-track-container">
          <div className="marquee-track">
            {validProducts.concat(validProducts).map((prod, idx) => (
              <div 
                key={`${prod._id}-${idx}`} 
                className="marquee-item"
                onClick={() => navigateTo('product', prod)}
              >
                <div className="marquee-img-wrap">
                  <img src={prod.images && prod.images[0] ? prod.images[0] : '/images/vaneeza_pink.png'} alt={prod.title} />
                </div>
                <div className="marquee-item-info">
                  <span className="marquee-title">{prod.title}</span>
                  <span className="marquee-price">Rs.{prod.price ? prod.price.toLocaleString() : '2,999'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Trusted By - Customer Statistics & Features Card Block */}
      <section className="trusted-by-section container">
        <div className="trusted-by-grid">
          <div className="trust-card">
            <span className="trust-icon">⭐</span>
            <div className="trust-info">
              <h4>7,500+ Customers</h4>
              <p>Highly rated MERN store</p>
            </div>
          </div>
          <div className="trust-card">
            <span className="trust-icon">🚀</span>
            <div className="trust-info">
              <h4>Free Shipping</h4>
              <p>On orders above Rs. 7,000+</p>
            </div>
          </div>
          <div className="trust-card">
            <span className="trust-icon">🔁</span>
            <div className="trust-info">
              <h4>7-Day Exchange</h4>
              <p>Easy exchanges nationwide</p>
            </div>
          </div>
          <div className="trust-card">
            <span className="trust-icon">💵</span>
            <div className="trust-info">
              <h4>Cash on Delivery</h4>
              <p>Pay upon delivery across Pakistan</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Shop by Category Grid with Full Uncropped Product Images */}
      <section className="categories-section container">
        <div className="section-title-wrap">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Curated edits made for everyday luxury • Auto-rotating gallery (Full Uncropped View)</p>
        </div>
        <div className="categories-grid">
          <div 
            onClick={() => handleCategorySelect('New Arrival')}
            className="category-card-uncropped"
          >
            <div className="cat-card-img-frame">
              <img 
                src={cat1Product && cat1Product.images ? cat1Product.images[0] : ''} 
                alt="New Arrival" 
              />
              <span className="rotating-badge">🔄 Live Gallery</span>
            </div>
            <div className="category-details-bar">
              <h3>New Arrival</h3>
              <span className="category-link">EXPLORE EDIT →</span>
            </div>
          </div>

          <div 
            onClick={() => handleCategorySelect('3 Piece Suits')}
            className="category-card-uncropped"
          >
            <div className="cat-card-img-frame">
              <img 
                src={cat2Product && cat2Product.images ? cat2Product.images[0] : ''} 
                alt="Summer Lawn Edit" 
              />
              <span className="rotating-badge">🔄 Live Gallery</span>
            </div>
            <div className="category-details-bar">
              <h3>Summer Lawn Edit</h3>
              <span className="category-link">EXPLORE EDIT →</span>
            </div>
          </div>

          <div 
            onClick={() => handleCategorySelect('Dresses under 2999')}
            className="category-card-uncropped"
          >
            <div className="cat-card-img-frame">
              <img 
                src={cat3Product && cat3Product.images ? cat3Product.images[0] : ''} 
                alt="Dresses Under 2999" 
              />
              <span className="rotating-badge">🔄 Live Gallery</span>
            </div>
            <div className="category-details-bar">
              <h3>Dresses Under 2999</h3>
              <span className="category-link">EXPLORE EDIT →</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Winners of the Month Showcase */}
      <section className="winners-section container">
        <div className="section-title-wrap">
          <h2 className="section-title">Winners of the Month</h2>
          <p className="section-subtitle">Our most loved, fast-selling designs this season</p>
        </div>

        {loading ? (
          <div className="loading-placeholder">Loading Winners...</div>
        ) : (
          <div className="products-grid">
            {winners.map((product) => (
              <div key={product._id} className="winner-card-wrapper" style={{ position: 'relative' }}>
                <span className="winner-tag-badge">🏆 Best Seller</span>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Featured Product Quick Add Panel */}
      {featuredProduct && (
        <section className="featured-quickadd-section container">
          <div className="section-title-wrap">
            <h2 className="section-title">Featured Design</h2>
            <p className="section-subtitle">Highlight of the Summer Edit - Get yours before stock runs out</p>
          </div>

          <div className="featured-quickadd-card">
            <div className="quickadd-image-panel">
              <img src={featuredProduct.images && featuredProduct.images[0] ? featuredProduct.images[0] : ''} alt={featuredProduct.title} />
              <span className="quickadd-badge">Special Discount</span>
            </div>

            <div className="quickadd-info-panel">
              <span className="quickadd-tag">{featuredProduct.fabric || 'Premium Lawn'}</span>
              <h3 className="quickadd-title">{featuredProduct.title}</h3>
              
              <div className="quickadd-rating-row">
                <span className="stars">{'★'.repeat(Math.round(featuredProduct.rating || 5))}</span>
                <span className="count">({featuredProduct.reviewsCount || 22} verified reviews)</span>
              </div>

              <div className="quickadd-prices">
                <span className="current-price">Rs.{featuredProduct.price ? featuredProduct.price.toLocaleString() : '2,999'}</span>
                {featuredProduct.originalPrice && (
                  <span className="original-price">Rs.{featuredProduct.originalPrice.toLocaleString()}</span>
                )}
                {featuredProduct.originalPrice && (
                  <span className="discount-pill">
                    SAVE {Math.round((1 - featuredProduct.price / featuredProduct.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Stock Urgency Progress Bar */}
              <div className="stock-urgency-box">
                <div className="stock-left-text">
                  <span>Only {featuredProduct.stock || 8} items left in store</span>
                  <span className="selling-fast">SELLING OUT QUICK</span>
                </div>
                <div className="stock-progress-bar">
                  <div 
                    className="stock-progress-fill" 
                    style={{ width: `${((featuredProduct.stock || 8) / 15) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Sizing Chart link */}
              <div className="quickadd-sizes-wrapper">
                <div className="sizes-header">
                  <span>Choose Size:</span>
                  <span className="sizing-link" onClick={() => setShowSizingModal(true)}>📐 View Sizing Guide</span>
                </div>
                <div className="size-pills">
                  {(featuredProduct.sizes || ['Small', 'Medium', 'Large', 'Extra Large']).map((size) => (
                    <button 
                      key={size}
                      className={`size-pill ${featuredSize === size ? 'active' : ''}`}
                      onClick={() => setFeaturedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Picker */}
              <div className="quickadd-qty-wrapper">
                <span>Quantity</span>
                <div className="qty-selector">
                  <button className="qty-btn" onClick={() => setFeaturedQty(Math.max(1, featuredQty - 1))}>-</button>
                  <span className="qty-value">{featuredQty}</span>
                  <button className="qty-btn" onClick={() => setFeaturedQty(featuredQty + 1)}>+</button>
                </div>
              </div>

              {/* Buying buttons */}
              <div className="buy-actions">
                <button 
                  className="btn-add-cart"
                  onClick={() => addToCart(featuredProduct, featuredSize, featuredQty)}
                >
                  Add to Cart
                </button>
                <button 
                  className="btn-buy-now"
                  onClick={() => {
                    addToCart(featuredProduct, featuredSize, featuredQty);
                    setShowCheckoutModal(true);
                  }}
                >
                  Buy It Now
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. Latest Arrivals Grid */}
      <section className="new-arrivals-section container" style={{ paddingBottom: '80px' }}>
        <div className="section-title-wrap">
          <h2 className="section-title">New Arrivals</h2>
          <p className="section-subtitle">Freshly stitched catalog arrivals</p>
        </div>

        {loading ? (
          <div className="loading-placeholder">Loading new arrivals...</div>
        ) : (
          <div className="products-grid">
            {validProducts.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
