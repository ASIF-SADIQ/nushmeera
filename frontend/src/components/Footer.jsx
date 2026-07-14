import React, { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';

export default function Footer() {
  const { navigateTo, setSelectedCategory } = useContext(ProductContext);

  const handleNavClick = (e, page, category = '') => {
    e.preventDefault();
    setSelectedCategory(category);
    navigateTo(page);
  };

  return (
    <>
      {/* Floating Whatsapp button */}
      <a href="https://wa.me/923086195677" target="_blank" rel="noopener noreferrer" className="whatsapp-widget" aria-label="Chat on WhatsApp">
        💬
      </a>

      {/* Footers */}
      <footer>
        <div className="container">
          <div className="footer-columns">
            <div>
              <h3 className="footer-col-title">About Nushmeera Clothes</h3>
              <p style={{ lineHeight: '1.6', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                Nushmeera Clothes represents traditional Pakistani craftsmanship fused with modern daily luxury edits. We create timeless designs with fabrics engineered for durability and style.
              </p>
            </div>
            <div>
              <h3 className="footer-col-title">Help Links</h3>
              <ul className="footer-links">
                <li><a href="#/shop" onClick={(e) => handleNavClick(e, 'shop')}>New Arrival</a></li>
                <li><a href="#/contact" onClick={(e) => handleNavClick(e, 'contact')}>Track Order</a></li>
                <li><a href="#/contact" onClick={(e) => handleNavClick(e, 'contact')}>Exchanges & Returns</a></li>
              </ul>
            </div>
            <div>
              <h3 className="footer-col-title">Quick Links</h3>
              <ul className="footer-links">
                <li><a href="#/contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact Us</a></li>
                <li><a href="#/shop" onClick={(e) => handleNavClick(e, 'shop')}>All Collections</a></li>
                <li><a href="#/shop" onClick={(e) => handleNavClick(e, 'shop', 'Dresses under 2999')}>Dresses under 2999</a></li>
                <li><a href="#/admin" onClick={(e) => handleNavClick(e, 'admin')} style={{ opacity: 0.6 }}>🛡️ Admin Portal</a></li>
              </ul>
            </div>
            <div>
              <h3 className="footer-col-title">Store Details</h3>
              <p className="footer-contact-item">📧 nushmeera4@gmail.com</p>
              <p className="footer-contact-item">📞 +92 308 6195677</p>
              <p className="footer-contact-item">📍 LDA Avenue, Lahore, Pakistan</p>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copyright">
              © 2026, Nushmeera Clothes. Developed in MERN Stack.
            </div>
            <div className="footer-payment-icons">
              💳 💵 🏦
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
