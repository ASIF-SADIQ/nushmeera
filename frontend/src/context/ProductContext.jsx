import React, { createContext, useState, useEffect } from 'react';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('home'); // home, shop, product, contact
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Filtering & Sorting
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('best-selling');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Filters
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null); // 'availability', 'price', null
  const [filterInStock, setFilterInStock] = useState(false);
  const [filterOutOfStock, setFilterOutOfStock] = useState(false);
  const [filterPriceFrom, setFilterPriceFrom] = useState('');
  const [filterPriceTo, setFilterPriceTo] = useState('');

  // Modals Visibility
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSizingModal, setShowSizingModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Toast System
  const [toasts, setToasts] = useState([]);

  // Product reviews state
  const [productReviews, setProductReviews] = useState([]);

  // Admin Portal States
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('admin_token') || null);
  const [adminUsername, setAdminUsername] = useState(localStorage.getItem('admin_username') || null);
  const [adminCoupons, setAdminCoupons] = useState([]);
  const [adminBundles, setAdminBundles] = useState([]);

  // Load reviews when product changes
  useEffect(() => {
    if (selectedProduct) {
      fetchReviews(selectedProduct._id);
    }
  }, [selectedProduct]);

  // Fetch products list on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Hash-based router listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/product/')) {
        const prodId = hash.replace('#/product/', '');
        fetch(`/api/products/${prodId}`)
          .then(res => res.json())
          .then(data => {
            if (data._id) {
              setSelectedProduct(data);
              setActivePage('product');
            }
          });
      } else if (hash === '#/shop') {
        setActivePage('shop');
      } else if (hash === '#/contact') {
        setActivePage('contact');
      } else if (hash === '#/admin') {
        setActivePage('admin');
      } else if (hash === '#/about') {
        setActivePage('about');
      } else if (hash === '#/bundles') {
        setActivePage('bundle');
      } else {
        setActivePage('home');
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Trigger initially

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products", error);
      addToast("⚠️ Error connecting to server. Using offline data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId) => {
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      const data = await res.json();
      setProductReviews(data);
    } catch (error) {
      console.error("Error fetching reviews", error);
    }
  };

  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const navigateTo = (page, prod = null) => {
    if (page === 'product' && prod) {
      window.location.hash = `#/product/${prod._id}`;
    } else if (page === 'shop') {
      window.location.hash = `#/shop`;
    } else if (page === 'contact') {
      window.location.hash = `#/contact`;
    } else if (page === 'admin') {
      window.location.hash = `#/admin`;
    } else if (page === 'about') {
      window.location.hash = `#/about`;
    } else if (page === 'bundle') {
      window.location.hash = `#/bundles`;
    } else {
      window.location.hash = `#/`;
    }
  };

  const handleUnauthorized = () => {
    addToast("🔒 Session expired. Please log in again.");
    logoutAdmin();
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdminUsername(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    setAdminOrders([]);
  };

  const loginAdmin = async (username, password, captchaToken = undefined) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, captchaToken })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminToken(data.token);
        setAdminUsername(data.username);
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_username', data.username);
        addToast("🔑 Logged in successfully!");
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed', requireCaptcha: data.requireCaptcha };
      }
    } catch (error) {
      console.error("Login error", error);
      return { success: false, error: 'Connection failed' };
    }
  };

  // Fetch admin orders on page load/change
  const fetchAdminOrders = async () => {
    if (!adminToken) return;
    setAdminLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      setAdminOrders(data);
    } catch (error) {
      console.error("Error fetching admin orders", error);
    } finally {
      setAdminLoading(false);
    }
  };

  // ---- Coupon Management ----
  const fetchAdminCoupons = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/coupons', { headers: { 'Authorization': `Bearer ${adminToken}` } });
      if (res.status === 401) { handleUnauthorized(); return; }
      const data = await res.json();
      setAdminCoupons(data);
    } catch (error) { console.error("Error fetching coupons", error); }
  };

  // ---- Bundle Management ----
  const fetchAdminBundles = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/bundles', { headers: { 'Authorization': `Bearer ${adminToken}` } });
      if (res.status === 401) { handleUnauthorized(); return; }
      const data = await res.json();
      setAdminBundles(data);
    } catch (error) { console.error("Error fetching bundles", error); }
  };

  useEffect(() => {
    if (activePage === 'admin' && adminToken) {
      fetchAdminOrders();
      fetchAdminCoupons();
      fetchAdminBundles();
    }
  }, [activePage, adminToken]);

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status })
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        addToast("📋 Order status updated successfully!");
        fetchAdminOrders();
      }
    } catch (error) {
      console.error("Error updating order status", error);
      addToast("❌ Failed to update order status");
    }
  };

  const deleteOrder = async (id) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        addToast("🗑️ Order deleted successfully!");
        fetchAdminOrders();
      }
    } catch (error) {
      console.error("Error deleting order", error);
      addToast("❌ Failed to delete order");
    }
  };

  const createAdminProduct = async (prodData) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(prodData)
      });
      if (res.status === 401) {
        handleUnauthorized();
        return false;
      }
      if (res.ok) {
        addToast("✨ New product created successfully!");
        fetchProducts();
      }
      return res.ok;
    } catch (error) {
      console.error("Error creating product", error);
      addToast("❌ Failed to create product");
      return false;
    }
  };

  const updateAdminProduct = async (id, prodData) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(prodData)
      });
      if (res.status === 401) {
        handleUnauthorized();
        return false;
      }
      if (res.ok) {
        addToast("📝 Product updated successfully!");
        fetchProducts();
      }
      return res.ok;
    } catch (error) {
      console.error("Error updating product", error);
      addToast("❌ Failed to update product");
      return false;
    }
  };

  const deleteAdminProduct = async (id) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.status === 401) {
        handleUnauthorized();
        return false;
      }
      if (res.ok) {
        addToast("🗑️ Product deleted successfully!");
        fetchProducts();
      }
      return res.ok;
    } catch (error) {
      console.error("Error deleting product", error);
      addToast("❌ Failed to delete product");
      return false;
    }
  };

  const importAdminProducts = async (productsList) => {
    try {
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ productsList })
      });
      if (res.status === 401) { handleUnauthorized(); return false; }
      if (res.ok) {
        const data = await res.json();
        addToast(`📥 Imported ${data.count} products successfully!`);
        fetchProducts();
      }
      return res.ok;
    } catch (error) {
      console.error("Error importing products", error);
      addToast("❌ Failed to import products");
      return false;
    }
  };

  // (fetchAdminCoupons and fetchAdminBundles are declared above the useEffect that calls them)

  const createCoupon = async (couponData) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify(couponData)
      });
      if (res.status === 401) { handleUnauthorized(); return false; }
      const data = await res.json();
      if (res.ok) { addToast('🎟️ Coupon created!'); fetchAdminCoupons(); return true; }
      addToast(`❌ ${data.error}`);
      return false;
    } catch (error) { addToast('❌ Failed to create coupon'); return false; }
  };

  const updateCoupon = async (id, couponData) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify(couponData)
      });
      if (res.status === 401) { handleUnauthorized(); return false; }
      if (res.ok) { addToast('✏️ Coupon updated!'); fetchAdminCoupons(); return true; }
      return false;
    } catch (error) { addToast('❌ Failed to update coupon'); return false; }
  };

  const deleteCoupon = async (id) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (res.ok) { addToast('🗑️ Coupon deleted'); fetchAdminCoupons(); }
    } catch (error) { addToast('❌ Failed to delete coupon'); }
  };

  const createBundle = async (bundleData) => {
    try {
      const res = await fetch('/api/admin/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify(bundleData)
      });
      if (res.status === 401) { handleUnauthorized(); return false; }
      const data = await res.json();
      if (res.ok) { addToast('📦 Bundle created!'); fetchAdminBundles(); return true; }
      addToast(`❌ ${data.error}`);
      return false;
    } catch (error) { addToast('❌ Failed to create bundle'); return false; }
  };

  const updateBundle = async (id, bundleData) => {
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify(bundleData)
      });
      if (res.status === 401) { handleUnauthorized(); return false; }
      if (res.ok) { addToast('✏️ Bundle updated!'); fetchAdminBundles(); return true; }
      return false;
    } catch (error) { addToast('❌ Failed to update bundle'); return false; }
  };

  const deleteBundle = async (id) => {
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (res.ok) { addToast('🗑️ Bundle deleted'); fetchAdminBundles(); }
    } catch (error) { addToast('❌ Failed to delete bundle'); }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveFilterDropdown(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        setProducts,
        loading,
        activePage,
        setActivePage,
        selectedProduct,
        setSelectedProduct,
        selectedCategory,
        setSelectedCategory,
        sortOrder,
        setSortOrder,
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults,
        activeFilterDropdown,
        setActiveFilterDropdown,
        filterInStock,
        setFilterInStock,
        filterOutOfStock,
        setFilterOutOfStock,
        filterPriceFrom,
        setFilterPriceFrom,
        filterPriceTo,
        setFilterPriceTo,
        showSearchModal,
        setShowSearchModal,
        showSizingModal,
        setShowSizingModal,
        showCheckoutModal,
        setShowCheckoutModal,
        showReviewModal,
        setShowReviewModal,
        toasts,
        addToast,
        navigateTo,
        fetchProducts,
        productReviews,
        setProductReviews,
        fetchReviews,
        adminOrders,
        adminLoading,
        adminToken,
        adminUsername,
        fetchAdminOrders,
        updateOrderStatus,
        deleteOrder,
        createAdminProduct,
        updateAdminProduct,
        deleteAdminProduct,
        importAdminProducts,
        loginAdmin,
        logoutAdmin,
        adminCoupons,
        fetchAdminCoupons,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        adminBundles,
        fetchAdminBundles,
        createBundle,
        updateBundle,
        deleteBundle
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
