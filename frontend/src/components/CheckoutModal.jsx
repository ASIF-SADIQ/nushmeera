import React, { useState, useContext, useEffect } from 'react';
import { ProductContext } from '../context/ProductContext';
import { CartContext } from '../context/CartContext';

export default function CheckoutModal() {
  const {
    showCheckoutModal,
    setShowCheckoutModal,
    addToast,
    fetchProducts
  } = useContext(ProductContext);

  const {
    cart,
    clearCart,
    getCartSubtotal,
    setShowCartDrawer
  } = useContext(CartContext);

  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutCity, setCheckoutCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Confirmation State
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Reset fields on modal open/close
  useEffect(() => {
    if (!showCheckoutModal) {
      setCheckoutName('');
      setCheckoutEmail('');
      setCheckoutPhone('');
      setCheckoutAddress('');
      setCheckoutCity('');
      setCouponCode('');
      setCouponInput('');
      setCouponDiscount(0);
      setCouponApplied(null);
      setCouponError('');
      setPlacedOrderDetails(null);
    }
  }, [showCheckoutModal]);

  if (!showCheckoutModal) return null;

  const subtotal = getCartSubtotal();
  const freeShippingThreshold = 7000;
  const shippingFee = subtotal < freeShippingThreshold && subtotal > 0 ? 250 : 0;
  const totalAmountPayable = Math.max(0, subtotal + shippingFee - couponDiscount);

  // ── Apply coupon ──────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponError('Please enter a coupon code.'); return; }
    setCouponError('');
    setCouponLoading(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderAmount: subtotal })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponApplied(data.coupon);
        setCouponDiscount(data.discountAmount);
        setCouponCode(code);
        addToast(`🎟️ Coupon "${code}" applied! You save Rs ${data.discountAmount.toLocaleString()}`);
      } else {
        setCouponError(data.error || 'Invalid coupon code.');
        setCouponApplied(null);
        setCouponDiscount(0);
        setCouponCode('');
      }
    } catch {
      setCouponError('Could not validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponInput('');
    setCouponError('');
    addToast('Coupon removed.');
  };

  // ── Submit order ──────────────────────────────────────────────────────────
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutName.trim() || !checkoutEmail.trim() || !checkoutPhone.trim() || !checkoutAddress.trim() || !checkoutCity.trim()) {
      addToast('⚠️ Please complete all required fields.');
      return;
    }
    if (cart.length === 0) {
      addToast('⚠️ Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart,
          customerDetails: {
            name: checkoutName,
            email: checkoutEmail,
            phone: checkoutPhone,
            address: checkoutAddress,
            city: checkoutCity
          },
          couponCode: couponCode || null,
          couponDiscount: couponDiscount || 0
        })
      });
      const data = await res.json();
      if (data.success) {
        setPlacedOrderDetails({
          orderId: data.orderId,
          name: checkoutName,
          email: checkoutEmail,
          phone: checkoutPhone,
          address: checkoutAddress,
          city: checkoutCity,
          totalAmount: totalAmountPayable,
          itemsCount: cart.length
        });
        clearCart();
        setShowCartDrawer(false);
        fetchProducts();
      } else {
        addToast('❌ Checkout failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error(error);
      addToast('❌ Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishCheckout = () => {
    setShowCheckoutModal(false);
    setPlacedOrderDetails(null);
  };

  return (
    <div className={`modal-overlay ${showCheckoutModal ? 'active' : ''}`} onClick={handleFinishCheckout}>
      <div 
        className="modal-content-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '540px', 
          width: '92%', 
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
        }}
      >
        {/* ── Header ── */}
        <div 
          className="modal-header" 
          style={{ 
            padding: '16px 24px', 
            background: '#0f3d33', 
            color: 'white', 
            display: 'flex', 
            justify: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <h3 className="modal-title" style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
            {placedOrderDetails ? '🎉 Order Confirmed' : '💵 Cash On Delivery Checkout'}
          </h3>
          <button 
            className="modal-close-btn" 
            onClick={handleFinishCheckout}
            style={{ color: 'white', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {/* ── SUCCESS SCREEN DISPLAY ── */}
          {placedOrderDetails ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ 
                width: '70px', 
                height: '70px', 
                background: '#d4edda', 
                color: '#28a745', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '2.5rem', 
                margin: '0 auto 16px' 
              }}>
                ✓
              </div>

              <h2 style={{ color: '#0f3d33', fontSize: '1.6rem', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                Order Placed Successfully!
              </h2>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Thank you <strong>{placedOrderDetails.name}</strong>! Your order reference is:
              </p>

              <div style={{ 
                background: '#f8f9fa', 
                border: '2px dashed #0f3d33', 
                padding: '12px 20px', 
                borderRadius: '8px', 
                display: 'inline-block', 
                marginBottom: '24px' 
              }}>
                <span style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f3d33', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
                  {placedOrderDetails.orderId}
                </span>
              </div>

              {/* Summary Box */}
              <div style={{ 
                background: '#faf9f6', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '16px', 
                textAlign: 'left', 
                fontSize: '0.85rem', 
                marginBottom: '24px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Customer Name:</span>
                  <strong>{placedOrderDetails.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mobile Number:</span>
                  <strong>{placedOrderDetails.phone}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery Address:</span>
                  <strong>{placedOrderDetails.address}, {placedOrderDetails.city}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px', fontSize: '0.95rem' }}>
                  <span>Total Amount (COD):</span>
                  <strong style={{ color: '#0f3d33', fontSize: '1.1rem' }}>Rs. {placedOrderDetails.totalAmount.toLocaleString()}</strong>
                </div>
              </div>

              <div style={{ background: '#e8f4f8', border: '1px solid #bbeeef', padding: '12px 16px', borderRadius: '6px', fontSize: '0.85rem', color: '#0c5460', marginBottom: '24px' }}>
                📩 <strong>Email Notification Sent:</strong> A confirmation email with full order details has been sent to <strong>{placedOrderDetails.email}</strong> and our dispatch team!
              </div>

              <button 
                onClick={handleFinishCheckout} 
                className="form-submit-btn"
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  background: '#0f3d33', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  fontWeight: '600', 
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                Continue Shopping →
              </button>
            </div>
          ) : (
            /* ── CHECKOUT FORM DISPLAY ── */
            <>
              {/* Order Summary */}
              <div style={{ backgroundColor: '#f9f7f4', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: couponDiscount > 0 ? '8px' : '0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span>Rs {subtotal.toLocaleString()}</span>
                </div>
                {shippingFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: couponDiscount > 0 ? '8px' : '0' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                    <span>Rs 250</span>
                  </div>
                )}
                {shippingFee === 0 && subtotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: couponDiscount > 0 ? '8px' : '0' }}>
                    <span style={{ color: '#2d6a4f', fontWeight: '600' }}>🚀 Free Delivery</span>
                    <span style={{ color: '#2d6a4f' }}>— Rs 0</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#e63946', fontWeight: '600' }}>🎟️ Discount ({couponCode})</span>
                    <span style={{ color: '#e63946', fontWeight: '600' }}>− Rs {couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.95rem' }}>
                  <span>Total Payable</span>
                  <span style={{ color: 'var(--primary-color)' }}>Rs {totalAmountPayable.toLocaleString()}</span>
                </div>
              </div>

              {/* Coupon Code Box */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontWeight: '600', fontSize: '0.85rem' }}>🎟️ Promo / Coupon Code</label>
                {couponApplied ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#d4edda', borderRadius: '6px', padding: '10px 14px', border: '1px solid #c3e6cb' }}>
                    <span style={{ flex: 1, fontWeight: '700', color: '#155724', fontFamily: 'monospace', fontSize: '0.95rem' }}>{couponCode}</span>
                    <span style={{ fontSize: '0.8rem', color: '#155724' }}>
                      {couponApplied.discountType === 'percentage' ? `${couponApplied.discountValue}% off` : `Rs ${couponApplied.discountValue} off`}
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      style={{ background: 'transparent', border: 'none', color: '#721c24', fontSize: '1rem', cursor: 'pointer', fontWeight: '700', lineHeight: 1 }}
                      title="Remove coupon"
                    >×</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                      placeholder="Enter promo code (e.g. NUSH20)"
                      style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      style={{
                        padding: '10px 18px',
                        background: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: couponLoading || !couponInput.trim() ? 'not-allowed' : 'pointer',
                        opacity: couponLoading || !couponInput.trim() ? 0.65 : 1,
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                        transition: 'opacity 0.2s'
                      }}
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '6px', marginBottom: 0 }}>⚠️ {couponError}</p>
                )}
              </div>

              {/* Shipping Form Inputs */}
              <form onSubmit={handleOrderSubmit}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem' }}>Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    placeholder="e.g. Asif Sadiq"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem' }}>Email Address * (For Order Confirmation)</label>
                  <input
                    type="email"
                    className="form-control"
                    value={checkoutEmail}
                    onChange={(e) => setCheckoutEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem' }}>Mobile Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={checkoutPhone}
                    onChange={(e) => setCheckoutPhone(e.target.value)}
                    placeholder="e.g. 03086195677"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem' }}>Shipping Address *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={checkoutAddress}
                    onChange={(e) => setCheckoutAddress(e.target.value)}
                    placeholder="House number, street name, area"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem' }}>City *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={checkoutCity}
                    onChange={(e) => setCheckoutCity(e.target.value)}
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    required
                  />
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', background: '#f5f5f5', padding: '10px 14px', borderRadius: '6px' }}>
                  ℹ️ By placing this order, you agree to pay in Cash upon receiving the parcel from the delivery rider.
                </div>

                <button 
                  type="submit" 
                  className="form-submit-btn" 
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#0f3d33',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  {isSubmitting ? 'Placing Order...' : 'Place Order (COD) →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
