import React, { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';
import { CartContext } from '../context/CartContext';

export default function CartDrawer() {
  const { navigateTo, setShowCheckoutModal } = useContext(ProductContext);
  const {
    cart,
    showCartDrawer,
    setShowCartDrawer,
    updateCartQty,
    deleteCartItem,
    getCartSubtotal
  } = useContext(CartContext);

  const subtotal = getCartSubtotal();
  const freeShippingThreshold = 7000;
  const freeShippingPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = freeShippingThreshold - subtotal;
  const totalCartQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutClick = () => {
    setShowCartDrawer(false);
    setShowCheckoutModal(true);
  };

  return (
    <div className={`cart-drawer-overlay ${showCartDrawer ? 'active' : ''}`} onClick={() => setShowCartDrawer(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <h3 className="cart-drawer-title">Shopping Cart ({totalCartQty})</h3>
          <button className="cart-drawer-close" onClick={() => setShowCartDrawer(false)}>×</button>
        </div>

        {/* Shipping Goal */}
        <div className="cart-free-shipping-bar">
          {subtotal >= freeShippingThreshold ? (
            <p className="free-shipping-text">🎉 Congratulations! You qualify for <strong>FREE SHIPPING!</strong></p>
          ) : (
            <p className="free-shipping-text">Add <strong>Rs.{remainingForFreeShipping.toLocaleString()}</strong> more to get <strong>FREE SHIPPING</strong></p>
          )}
          <div className="shipping-progress-bar">
            <div className="shipping-progress-fill" style={{ width: `${freeShippingPercent}%` }}></div>
          </div>
        </div>

        {/* Cart items List */}
        <div className="cart-drawer-items">
          {cart.length === 0 ? (
            <div className="cart-drawer-empty">
              <span>👜</span>
              <p>Your cart is empty</p>
              <button 
                className="btn-write-review" 
                onClick={() => { setShowCartDrawer(false); navigateTo('shop'); }}
              >
                Shop Our Collection
              </button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={`${item._id}-${item.size}`} className="cart-item-row">
                <img src={item.images[0]} alt={item.title} className="cart-item-img" />
                <div className="cart-item-details">
                  <h4 className="cart-item-title">{item.title}</h4>
                  <span className="cart-item-meta">Size: {item.size}</span>
                  <div className="cart-item-controls">
                    <div className="cart-qty-select">
                      <button className="cart-qty-btn" onClick={() => updateCartQty(index, -1)}>−</button>
                      <span className="cart-qty-val">{item.quantity}</span>
                      <button className="cart-qty-btn" onClick={() => updateCartQty(index, 1)}>+</button>
                    </div>
                    <span className="cart-item-price">Rs.{(item.price * item.quantity).toLocaleString()}</span>
                    <button className="cart-item-delete" onClick={() => deleteCartItem(index)} aria-label="Remove item">🗑️</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal-row">
              <span>Subtotal</span>
              <span>Rs.{subtotal.toLocaleString()}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
              Taxes and shipping calculated at checkout
            </p>
            <button className="cart-checkout-btn" onClick={handleCheckoutClick}>
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
