import React, { createContext, useState, useEffect, useContext } from 'react';
import { ProductContext } from './ProductContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { addToast } = useContext(ProductContext);
  
  // Cart State (Backed by localStorage)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('nushmeera_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('nushmeera_cart', JSON.stringify(cart));
  }, [cart]);

  // Cart operations
  const addToCart = (product, size, qty) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item._id === product._id && item.size === size
      );
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += qty;
        return newCart;
      } else {
        return [...prevCart, { ...product, size, quantity: qty }];
      }
    });
    addToast(`👜 Added ${qty}x ${product.title} (${size}) to Cart`);
    setShowCartDrawer(true);
  };

  const updateCartQty = (index, delta) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      newCart[index].quantity += delta;
      if (newCart[index].quantity <= 0) {
        newCart.splice(index, 1);
        addToast("🗑️ Item removed from cart");
      }
      return newCart;
    });
  };

  const deleteCartItem = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
    addToast("🗑️ Item removed from cart");
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        showCartDrawer,
        setShowCartDrawer,
        addToCart,
        updateCartQty,
        deleteCartItem,
        getCartSubtotal,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
