import React, { useContext, useState } from 'react';
import { ProductContext } from '../context/ProductContext';

export default function Contact() {
  const { addToast } = useContext(ProductContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      addToast("⚠️ Please fill in all fields.");
      return;
    }
    addToast("✉️ Message sent. We will contact you soon!");
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      <div className="section-title-wrap">
        <h2 className="section-title" style={{ fontSize: '3rem', margin: '30px 0 10px' }}>Contact Us</h2>
        <p className="section-subtitle">Reach out to our customer support team for queries and guidance</p>
      </div>
      
      <div className="contact-layout" style={{ marginTop: '30px' }}>
        <div className="contact-form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea 
                rows="5" 
                className="form-control" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className="form-submit-btn">Send Message</button>
          </form>
        </div>

        <div className="contact-info-card">
          <div className="contact-info-block">
            <h3>Customer Support</h3>
            <p className="footer-contact-item">📧 nushmeera4@gmail.com</p>
            <p className="footer-contact-item">📞 +92 308 6195677</p>
          </div>
          
          <div className="contact-info-block">
            <h3>Our Office Address</h3>
            <p className="footer-contact-item">📍 LDA Avenue, Lahore, Pakistan</p>
          </div>

          <div className="contact-info-block">
            <h3>Exchange Policy</h3>
            <p className="footer-contact-item" style={{ color: 'var(--text-muted)' }}>
              We offer free replacements for defective items within 7 days. Please send your queries to our support email with order details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
