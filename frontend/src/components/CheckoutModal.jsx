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
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutCity, setCheckoutCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(null); // coupon object
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Reset fields on modal open/close
  useEffect(() => {
    if (!showCheckoutModal) {
      setCheckoutName('');
      setCheckoutPhone('');
      setCheckoutAddress('');
      setCheckoutCity('');
      setCouponCode('');
      setCouponInput('');
      setCouponDiscount(0);
      setCouponApplied(null);
      setCouponError('');
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
    if (!checkoutName.trim() || !checkoutPhone.trim() || !checkoutAddress.trim() || !checkoutCity.trim()) {
      addToast('⚠️ Please complete the shipping details');
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
        addToast(`🎉 Order Placed! ID: ${data.orderId}`);
        clearCart();
        setShowCheckoutModal(false);
        setShowCartDrawer(false);
        fetchProducts();
      } else {
        addToast('❌ Checkout failed');
      }
    } catch (error) {
      console.error(error);
      addToast('❌ Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`modal-overlay ${showCheckoutModal ? 'active' : ''}`} onClick={() => setShowCheckoutModal(false)}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h3 className="modal-title">💵 Cash On Delivery Checkout</h3>
          <button className="modal-close-btn" onClick={() => setShowCheckoutModal(false)}>×</button>
        </div>
        <div className="modal-body">

          {/* ── Order Summary ── */}
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

          {/* ── Coupon Code Box ── */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>🎟️ Promo / Coupon Code</label>
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

          {/* ── Shipping Details Form ── */}
          <form onSubmit={handleOrderSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={checkoutName}
                onChange={(e) => setCheckoutName(e.target.value)}
                placeholder="e.g. Asif Sadiq"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="text"
                className="form-control"
                value={checkoutPhone}
                onChange={(e) => setCheckoutPhone(e.target.value)}
                placeholder="e.g. 03001234567"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Shipping Address</label>
              <input
                type="text"
                className="form-control"
                value={checkoutAddress}
                onChange={(e) => setCheckoutAddress(e.target.value)}
                placeholder="Street name, house number, area"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                value={checkoutCity}
                onChange={(e) => setCheckoutCity(e.target.value)}
                placeholder="e.g. Lahore, Karachi, Islamabad"
                required
              />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              ℹ️ By placing this order, you agree to pay in Cash upon receiving the parcel from the rider.
            </div>
            <button type="submit" className="form-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Placing Order...' : 'Place Order (COD)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
