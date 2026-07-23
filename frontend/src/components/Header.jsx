import React, { useContext, useState } from 'react';
import { ProductContext } from '../context/ProductContext';
import { CartContext } from '../context/CartContext';

export default function Header() {
  const {
    activePage,
    navigateTo,
    selectedCategory,
    setSelectedCategory,
    setShowSearchModal
  } = useContext(ProductContext);

  const {
    cart,
    setShowCartDrawer
  } = useContext(CartContext);

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const totalCartQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleNavClick = (e, page, category = '') => {
    e.preventDefault();
    setSelectedCategory(category);
    navigateTo(page);
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    setSelectedCategory('');
    navigateTo('about');
  };

  return (
    <>
      {/* Marquee Announcement Bar */}
      <div className="announcement-bar">
        <div className="marquee-container">
          <div className="marquee-content">
            <div className="marquee-item"><span>⏳</span> Hurry! Limited Stock Available</div>
            <div className="marquee-item"><span>💵</span> Cash on Delivery Available Across Pakistan</div>
            <div className="marquee-item"><span>🚀</span> Free Nationwide Delivery on Orders Over Rs. 7,000+</div>
            {/* Duplicate for infinite loop */}
            <div className="marquee-item"><span>⏳</span> Hurry! Limited Stock Available</div>
            <div className="marquee-item"><span>💵</span> Cash on Delivery Available Across Pakistan</div>
            <div className="marquee-item"><span>🚀</span> Free Nationwide Delivery on Orders Over Rs. 7,000+</div>
          </div>
        </div>
      </div>

      {/* Premium Header Layout */}
      <header className="premium-header">
        {/* Top Row: Helpline, Logo, Icons */}
        <div className="header-top-row">
          {/* Mobile hamburger menu toggle button */}
          <button 
            className="mobile-hamburger-btn" 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle Menu"
          >
            {showMobileMenu ? '✕' : '☰'}
          </button>

          <div className="header-helpline">
            <span>📞 Support: +92 308 6195677</span>
          </div>

          <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => navigateTo('home')}>
            <div className="logo-image-wrap">
              <img src="/images/logo.png" alt="Nushmeera Clothes Logo" style={{ height: '60px', objectFit: 'contain' }} />
            </div>
          </div>

          <div className="header-icons">
            <button className="header-icon-btn" onClick={() => setShowSearchModal(true)} aria-label="Search">🔍</button>
            <button className="header-icon-btn" aria-label="Profile">👤</button>
            <button className="header-icon-btn" onClick={() => setShowCartDrawer(true)} aria-label="Cart">
              👜
              {totalCartQty > 0 && (
                <span className="cart-count-badge">
                  {totalCartQty}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Row: Centered Navigation Menu (Desktop view) */}
        <nav className="header-nav-bar desktop-nav">
          <ul className="header-menu-list">
            <li>
              <a 
                href="#/" 
                className={activePage === 'home' ? 'active' : ''} 
                onClick={(e) => handleNavClick(e, 'home')}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#/shop" 
                className={activePage === 'shop' && selectedCategory === 'New Arrival' ? 'active' : ''} 
                onClick={(e) => handleNavClick(e, 'shop', 'New Arrival')}
              >
                New Arrival
              </a>
            </li>
            <li>
              <a 
                href="#/shop" 
                className={activePage === 'shop' && selectedCategory === 'Summer Lawn Edit' ? 'active' : ''} 
                onClick={(e) => handleNavClick(e, 'shop', 'Summer Lawn Edit')}
              >
                Summer Lawn Edit
              </a>
            </li>
            <li>
              <a 
                href="#/shop" 
                className={activePage === 'shop' && selectedCategory === '3 Piece Suits' ? 'active' : ''} 
                onClick={(e) => handleNavClick(e, 'shop', '3 Piece Suits')}
              >
                3 Piece Suits
              </a>
            </li>
            <li>
              <a 
                href="#/shop" 
                className={activePage === 'shop' && selectedCategory === '2 Piece Sets' ? 'active' : ''} 
                onClick={(e) => handleNavClick(e, 'shop', '2 Piece Sets')}
              >
                2 Piece Sets
              </a>
            </li>
            <li>
              <a 
                href="#/shop" 
                className={activePage === 'shop' && selectedCategory === 'Co-ord Sets' ? 'active' : ''} 
                onClick={(e) => handleNavClick(e, 'shop', 'Co-ord Sets')}
              >
                Co-ord Sets
              </a>
            </li>
            <li>
              <a 
                href="#/bundles" 
                className={activePage === 'bundle' ? 'active' : ''} 
                onClick={(e) => { e.preventDefault(); setSelectedCategory(''); navigateTo('bundle'); }}
              >
                Bundle &amp; Save
              </a>
            </li>
            <li>
              <a 
                href="#/shop" 
                className={activePage === 'shop' && selectedCategory === 'Dresses under 2999' ? 'active' : ''} 
                onClick={(e) => handleNavClick(e, 'shop', 'Dresses under 2999')}
              >
                Dresses under 2999
              </a>
            </li>
            <li>
              <a 
                href="#/about" 
                className={activePage === 'about' ? 'active' : ''}
                onClick={handleAboutClick}
              >
                About Us
              </a>
            </li>
            <li>
              <a 
                href="#/contact" 
                className={activePage === 'contact' ? 'active' : ''} 
                onClick={(e) => handleNavClick(e, 'contact')}
              >
                Contact Us
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Slide-out Mobile Navigation Drawer */}
      <div className={`mobile-nav-drawer ${showMobileMenu ? 'active' : ''}`}>
        <div className="mobile-nav-header">
          <span className="mobile-nav-title">Nushmeera Clothes</span>
          <button className="mobile-nav-close" onClick={() => setShowMobileMenu(false)}>✕</button>
        </div>
        <ul className="mobile-menu-links">
          <li>
            <a 
              href="#/" 
              className={activePage === 'home' ? 'active' : ''} 
              onClick={(e) => { handleNavClick(e, 'home'); setShowMobileMenu(false); }}
            >
              Home
            </a>
          </li>
          <li>
            <a 
              href="#/shop" 
              className={activePage === 'shop' && selectedCategory === 'New Arrival' ? 'active' : ''} 
              onClick={(e) => { handleNavClick(e, 'shop', 'New Arrival'); setShowMobileMenu(false); }}
            >
              New Arrival
            </a>
          </li>
          <li>
            <a 
              href="#/shop" 
              className={activePage === 'shop' && selectedCategory === 'Summer Lawn Edit' ? 'active' : ''} 
              onClick={(e) => { handleNavClick(e, 'shop', 'Summer Lawn Edit'); setShowMobileMenu(false); }}
            >
              Summer Lawn Edit
            </a>
          </li>
          <li>
            <a 
              href="#/shop" 
              className={activePage === 'shop' && selectedCategory === '3 Piece Suits' ? 'active' : ''} 
              onClick={(e) => { handleNavClick(e, 'shop', '3 Piece Suits'); setShowMobileMenu(false); }}
            >
              3 Piece Suits
            </a>
          </li>
          <li>
            <a 
              href="#/shop" 
              className={activePage === 'shop' && selectedCategory === '2 Piece Sets' ? 'active' : ''} 
              onClick={(e) => { handleNavClick(e, 'shop', '2 Piece Sets'); setShowMobileMenu(false); }}
            >
              2 Piece Sets
            </a>
          </li>
          <li>
            <a 
              href="#/shop" 
              className={activePage === 'shop' && selectedCategory === 'Co-ord Sets' ? 'active' : ''} 
              onClick={(e) => { handleNavClick(e, 'shop', 'Co-ord Sets'); setShowMobileMenu(false); }}
            >
              Co-ord Sets
            </a>
          </li>
          <li>
            <a 
              href="#/bundles" 
              className={activePage === 'bundle' ? 'active' : ''} 
              onClick={(e) => { e.preventDefault(); setSelectedCategory(''); navigateTo('bundle'); setShowMobileMenu(false); }}
            >
              Bundle &amp; Save
            </a>
          </li>
          <li>
            <a 
              href="#/shop" 
              className={activePage === 'shop' && selectedCategory === 'Dresses under 2999' ? 'active' : ''} 
              onClick={(e) => { handleNavClick(e, 'shop', 'Dresses under 2999'); setShowMobileMenu(false); }}
            >
              Dresses under 2999
            </a>
          </li>
          <li>
            <a 
              href="#/about" 
              className={activePage === 'about' ? 'active' : ''}
              onClick={(e) => { handleAboutClick(e); setShowMobileMenu(false); }}
            >
              About Us
            </a>
          </li>
          <li>
            <a 
              href="#/contact" 
              className={activePage === 'contact' ? 'active' : ''} 
              onClick={(e) => { handleNavClick(e, 'contact'); setShowMobileMenu(false); }}
            >
              Contact Us
            </a>
          </li>
        </ul>
      </div>

      {/* Backdrop for Mobile Drawer */}
      {showMobileMenu && (
        <div className="mobile-nav-backdrop" onClick={() => setShowMobileMenu(false)}></div>
      )}
    </>
  );
}
