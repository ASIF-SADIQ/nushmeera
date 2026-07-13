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

  useEffect(() => {
    if (activePage === 'about') {
      const storySection = document.querySelector('.our-story-section');
      if (storySection) {
        storySection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [activePage]);

  // Local state for the homepage featured product quick-add block
  const [featuredSize, setFeaturedSize] = useState('Medium');
  const [featuredQty, setFeaturedQty] = useState(1);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    navigateTo('shop');
  };

  // Find Vaneeza Embroidered 3pc from product list
  const featuredProduct = products.find(p => p._id === 'prod_vaneeza') || products[0];

  // Pick top 3 products for "Winners of the Month"
  const winners = products.filter(p => p._id === 'prod_1' || p._id === 'prod_2' || p._id === 'prod_6');

  return (
    <div className="home-page">
      {/* 1. Hero Slider Banner */}
      <section 
        className="hero" 
        style={{ backgroundImage: `url('/images/hero_banner.png')` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <p className="hero-tagline">Premium Summer Collection</p>
          <h1 className="hero-title">Summer Lawn Edit 2026</h1>
          <button onClick={() => handleCategorySelect('')} className="hero-btn">Shop Collection</button>
        </div>
      </section>

      {/* 2. Trusted By - Customer Statistics & Features Card Block */}
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

      {/* 3. Shop by Category Grid */}
      <section className="categories-section container">
        <div className="section-title-wrap">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Curated edits made for everyday luxury</p>
        </div>
        <div className="categories-grid">
          <div 
            onClick={() => handleCategorySelect('New Arrival')}
            className="category-card"
            style={{ backgroundImage: `url('/images/lilac_orchid.png')` }}
          >
            <div className="category-overlay"></div>
            <div className="category-details">
              <h3>New Arrival</h3>
              <span className="category-link">Explore Edit</span>
            </div>
          </div>

          <div 
            onClick={() => handleCategorySelect('Summer Lawn Edit')}
            className="category-card"
            style={{ backgroundImage: `url('/images/vaneeza_pink.png')` }}
          >
            <div className="category-overlay"></div>
            <div className="category-details">
              <h3>Summer Lawn Edit</h3>
              <span className="category-link">Explore Edit</span>
            </div>
          </div>

          <div 
            onClick={() => handleCategorySelect('Dresses under 2999')}
            className="category-card"
            style={{ backgroundImage: `url('/images/midnight_dusk.png')` }}
          >
            <div className="category-overlay"></div>
            <div className="category-details">
              <h3>Dresses under 2999</h3>
              <span className="category-link">Explore Edit</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Winners of the Month Showcase */}
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

      {/* 5. Narrative "Our Story" Brand Segment */}
      <section className="our-story-section">
        <div className="container story-content-wrap">
          <div className="story-image" style={{ backgroundImage: `url('/images/midnight_dusk.png')` }}></div>
          <div className="story-text-panel">
            <span className="story-tagline">NUSHMEERA CLOTHES</span>
            <h2>Our Story & Craft</h2>
            <p>
              Born from a love for delicate embroideries and breathable Pakistani lawns, Nushmeera Clothes blends classic aesthetics with contemporary comfort. We source the finest long-staple cotton yarns and print them with non-toxic, skin-friendly colors.
            </p>
            <p>
              Each design tells a story of craftsmanship. Our weavers, embroiderers, and tailors align to bring you outfits that make you stand out, whether in a casual meeting or a formal evening gather.
            </p>
            <button onClick={() => navigateTo('contact')} className="story-btn">Read Our Manifesto</button>
          </div>
        </div>
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
              <img src={featuredProduct.images[0]} alt={featuredProduct.title} />
              <span className="quickadd-badge">Special Discount</span>
            </div>

            <div className="quickadd-info-panel">
              <span className="quickadd-tag">{featuredProduct.fabric}</span>
              <h3 className="quickadd-title">{featuredProduct.title}</h3>
              
              <div className="quickadd-rating-row">
                <span className="stars">{'★'.repeat(Math.round(featuredProduct.rating))}</span>
                <span className="count">({featuredProduct.reviewsCount} verified reviews)</span>
              </div>

              <div className="quickadd-prices">
                <span className="current-price">Rs.{featuredProduct.price.toLocaleString()}</span>
                <span className="original-price">Rs.{featuredProduct.originalPrice.toLocaleString()}</span>
                <span className="discount-pill">
                  SAVE {Math.round((1 - featuredProduct.price / featuredProduct.originalPrice) * 100)}%
                </span>
              </div>

              {/* Stock Urgency Progress Bar */}
              <div className="stock-urgency-box">
                <div className="stock-left-text">
                  <span>Only {featuredProduct.stock} items left in store</span>
                  <span className="selling-fast">SELLING OUT QUICK</span>
                </div>
                <div className="stock-progress-bar">
                  <div 
                    className="stock-progress-fill" 
                    style={{ width: `${(featuredProduct.stock / 15) * 100}%` }}
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
                  {featuredProduct.sizes.map((size) => (
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
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
