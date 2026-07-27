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

  // 1. Hero Slideshow State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Fallback high-res luxury fashion image URLs for Hero Slides
  const defaultHeroImages = [
    'https://cdn.shopify.com/s/files/1/0713/6552/5615/files/ChatGPTImageJul9_2026_01_11_23AM_7.png?v=1783717621',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80'
  ];

  // Extract all valid image URLs from loaded products
  const productImages = products
    .flatMap(p => p.images || [])
    .filter(url => url && typeof url === 'string' && url.startsWith('http'));

  const heroSlides = [
    {
      tagline: 'PREMIUM SUMMER COLLECTION 2026',
      title: 'Summer Lawn Edit',
      subtitle: 'Handcrafted luxury embroidered & printed lawn 3-piece suits.',
      cta: 'Shop Collection',
      category: '3 Piece Suits',
      image: productImages[0] || defaultHeroImages[0]
    },
    {
      tagline: 'EXCLUSIVE FESTIVE SELECTION',
      title: 'Luxury Embroidered Edit',
      subtitle: 'Exquisite chiffon & organza embroidery for formal elegance.',
      cta: 'Explore 3-Piece',
      category: '3 Piece Suits',
      image: productImages[4] || defaultHeroImages[1]
    },
    {
      tagline: 'EVERYDAY COMFORT & STYLE',
      title: 'Chic 2-Piece & Co-Ords',
      subtitle: 'Modern silhouettes designed for everyday elegance.',
      cta: 'Browse 2-Piece',
      category: '2 Piece Sets',
      image: productImages[8] || defaultHeroImages[2]
    },
    {
      tagline: 'AFFORDABLE LUXURY FASHION',
      title: 'Dresses Under Rs. 2,999',
      subtitle: 'High-end lawn & linen outfits at unbeatable value.',
      cta: 'Shop Under 2999',
      category: 'Dresses under 2999',
      image: productImages[12] || defaultHeroImages[3]
    }
  ];

  // Auto-play Hero Slideshow every 5 seconds
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // 2. Rotational Category Cards State (Rotates image every 15 seconds)
  const [catImageIndexes, setCatImageIndexes] = useState([0, 1, 2]);

  useEffect(() => {
    if (productImages.length === 0) return;

    const catTimer = setInterval(() => {
      setCatImageIndexes(prev => [
        (prev[0] + 3) % productImages.length,
        (prev[1] + 5) % productImages.length,
        (prev[2] + 7) % productImages.length
      ]);
    }, 15000); // Rotates every 15 seconds

    return () => clearInterval(catTimer);
  }, [productImages.length]);

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

  const featuredProduct = products[0] || null;
  const winners = products.slice(1, 4);

  // Images for the 3 Category Cards
  const cat1Image = productImages[catImageIndexes[0]] || defaultHeroImages[1];
  const cat2Image = productImages[catImageIndexes[1]] || defaultHeroImages[0];
  const cat3Image = productImages[catImageIndexes[2]] || defaultHeroImages[2];

  return (
    <div className="home-page">
      {/* 1. Interactive Hero Slider Banner */}
      <section className="hero-slider-section">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlideIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url('${slide.image}')` }}
          >
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <p className="hero-tagline">{slide.tagline}</p>
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-subtitle">{slide.subtitle}</p>
              <button 
                onClick={() => handleCategorySelect(slide.category)} 
                className="hero-btn"
              >
                {slide.cta} →
              </button>
            </div>
          </div>
        ))}

        {/* Carousel Prev/Next Navigation Controls */}
        <button className="hero-arrow hero-arrow-left" onClick={prevSlide} aria-label="Previous Slide">
          ❮
        </button>
        <button className="hero-arrow hero-arrow-right" onClick={nextSlide} aria-label="Next Slide">
          ❯
        </button>

        {/* Slide Indicator Dots */}
        <div className="hero-dots">
          {heroSlides.map((_, index) => (
            <span
              key={index}
              className={`hero-dot ${index === currentSlideIndex ? 'active' : ''}`}
              onClick={() => setCurrentSlideIndex(index)}
            ></span>
          ))}
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

      {/* 3. Shop by Category Grid with Rotational Product Images */}
      <section className="categories-section container">
        <div className="section-title-wrap">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Curated edits made for everyday luxury • Auto-rotating gallery</p>
        </div>
        <div className="categories-grid">
          <div 
            onClick={() => handleCategorySelect('New Arrival')}
            className="category-card"
            style={{ backgroundImage: `url('${cat1Image}')` }}
          >
            <div className="category-overlay"></div>
            <span className="rotating-badge">🔄 Live Gallery</span>
            <div className="category-details">
              <h3>New Arrival</h3>
              <span className="category-link">EXPLORE EDIT →</span>
            </div>
          </div>

          <div 
            onClick={() => handleCategorySelect('3 Piece Suits')}
            className="category-card"
            style={{ backgroundImage: `url('${cat2Image}')` }}
          >
            <div className="category-overlay"></div>
            <span className="rotating-badge">🔄 Live Gallery</span>
            <div className="category-details">
              <h3>Summer Lawn Edit</h3>
              <span className="category-link">EXPLORE EDIT →</span>
            </div>
          </div>

          <div 
            onClick={() => handleCategorySelect('Dresses under 2999')}
            className="category-card"
            style={{ backgroundImage: `url('${cat3Image}')` }}
          >
            <div className="category-overlay"></div>
            <span className="rotating-badge">🔄 Live Gallery</span>
            <div className="category-details">
              <h3>Dresses Under 2999</h3>
              <span className="category-link">EXPLORE EDIT →</span>
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
          <div 
            className="story-image" 
            style={{ backgroundImage: `url('${productImages[15] || defaultHeroImages[3]}')` }}
          ></div>
          <div className="story-text-panel">
            <span className="story-tagline">NUSHMEERA CLOTHES</span>
            <h2>Our Story & Craft</h2>
            <p>
              Born from a love for delicate embroideries and breathable Pakistani lawns, Nushmeera Clothes blends classic aesthetics with contemporary comfort. We source the finest long-staple cotton yarns and print them with non-toxic, skin-friendly colors.
            </p>
            <p>
              Each design tells a story of craftsmanship. Our weavers, embroiderers, and tailors align to bring you outfits that make you stand out, whether in a casual meeting or a formal evening gathering.
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
              <img src={featuredProduct.images[0] || defaultHeroImages[0]} alt={featuredProduct.title} />
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
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
