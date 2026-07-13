import React, { useContext, useState, useEffect } from 'react';
import { ProductContext } from '../context/ProductContext';

export default function AdminDashboard() {
  const {
    products,
    adminOrders,
    adminLoading,
    adminToken,
    adminUsername,
    updateOrderStatus,
    deleteOrder,
    createAdminProduct,
    updateAdminProduct,
    deleteAdminProduct,
    importAdminProducts,
    loginAdmin,
    logoutAdmin,
    navigateTo,
    adminCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    adminBundles,
    createBundle,
    updateBundle,
    deleteBundle
  } = useContext(ProductContext);

  // Login Form States
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('overview'); // overview, orders, products, import, offers
  
  // Offers & Bundles States
  const [offerSubTab, setOfferSubTab] = useState('coupons'); // coupons, bundles
  // Coupon Form
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [cpCode, setCpCode] = useState('');
  const [cpType, setCpType] = useState('percentage');
  const [cpValue, setCpValue] = useState('');
  const [cpMinOrder, setCpMinOrder] = useState('');
  const [cpMaxUses, setCpMaxUses] = useState('');
  const [cpExpiry, setCpExpiry] = useState('');
  const [cpActive, setCpActive] = useState(true);
  // Bundle Form
  const [showBundleForm, setShowBundleForm] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState(null);
  const [bnName, setBnName] = useState('');
  const [bnDesc, setBnDesc] = useState('');
  const [bnProductIds, setBnProductIds] = useState([]);
  const [bnBundlePrice, setBnBundlePrice] = useState('');
  const [bnOriginalPrice, setBnOriginalPrice] = useState('');
  const [bnActive, setBnActive] = useState(true);
  
  // Create / Edit Product Form Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  // Form Fields
  const [prodTitle, setProdTitle] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('3 Piece Suits');
  const [prodFabric, setProdFabric] = useState('Printed Lawn');
  const [prodStock, setProdStock] = useState('10');
  const [prodImages, setProdImages] = useState('/images/lilac_orchid.png');
  const [prodSizes, setProdSizes] = useState(['Small', 'Medium', 'Large']);
  const [prodDetails, setProdDetails] = useState('');

  // Bulk Import States
  const [importType, setImportType] = useState('json'); // json, csv
  const [importText, setImportText] = useState('');

  // Order Details Expanded Rows
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Calculate Overview Metrics
  const totalSales = adminOrders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);
  const totalOrders = adminOrders.length;
  const totalProducts = products.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  const lowStockItems = products.filter(p => p.stock <= 5);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingProductId(null);
    setProdTitle('');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdCategory('3 Piece Suits');
    setProdFabric('Lawn');
    setProdStock('10');
    setProdImages('/images/lilac_orchid.png');
    setProdSizes(['Small', 'Medium', 'Large', 'Extra Large']);
    setProdDetails('Fabric: Premium Lawn\nIncludes Shirt and Pants\nDry clean recommended');
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setEditingProductId(product._id);
    setProdTitle(product.title);
    setProdPrice(product.price.toString());
    setProdOriginalPrice(product.originalPrice.toString());
    setProdCategory(product.category);
    setProdFabric(product.fabric);
    setProdStock(product.stock.toString());
    setProdImages(product.images.join(', '));
    setProdSizes(product.sizes);
    setProdDetails(product.details.join('\n'));
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodTitle || !prodPrice || !prodOriginalPrice || !prodStock) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      title: prodTitle,
      price: parseFloat(prodPrice),
      originalPrice: parseFloat(prodOriginalPrice),
      category: prodCategory,
      fabric: prodFabric,
      stock: parseInt(prodStock),
      images: prodImages.split(',').map(s => s.trim()),
      sizes: prodSizes,
      details: prodDetails.split('\n').map(s => s.trim()).filter(s => s.length > 0)
    };

    let success = false;
    if (isEditing) {
      success = await updateAdminProduct(editingProductId, payload);
    } else {
      success = await createAdminProduct(payload);
    }

    if (success) {
      setShowProductModal(false);
    }
  };

  const handleSizeCheckbox = (size) => {
    if (prodSizes.includes(size)) {
      setProdSizes(prodSizes.filter(s => s !== size));
    } else {
      setProdSizes([...prodSizes, size]);
    }
  };

  const handleImportSubmit = async () => {
    if (!importText.trim()) {
      alert("Please paste data to import first.");
      return;
    }

    try {
      let list = [];
      if (importType === 'json') {
        list = JSON.parse(importText);
        if (!Array.isArray(list)) {
          alert("JSON must be an array of products.");
          return;
        }
      } else {
        // Parse CSV
        const lines = importText.split('\n').filter(l => l.trim().length > 0);
        list = lines.map(line => {
          const parts = line.split(',').map(s => s.trim());
          return {
            title: parts[0] || 'Imported Design',
            price: parseFloat(parts[1]) || 2999,
            originalPrice: parseFloat(parts[2]) || 4999,
            category: parts[3] || 'Shop All',
            fabric: parts[4] || 'Lawn',
            stock: parseInt(parts[5]) || 10,
            images: ['/images/lilac_orchid.png'],
            sizes: ['Small', 'Medium', 'Large'],
            details: ['Premium wear', 'Imported fabric']
          };
        });
      }

      const success = await importAdminProducts(list);
      if (success) {
        setImportText('');
        setActiveTab('products');
      }
    } catch (error) {
      console.error(error);
      alert("Failed to parse import text. Please verify formatting.");
    }
  };

  const toggleOrderExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // Coupon form helpers
  const resetCouponForm = () => {
    setEditingCouponId(null); setCpCode(''); setCpType('percentage');
    setCpValue(''); setCpMinOrder(''); setCpMaxUses(''); setCpExpiry(''); setCpActive(true);
  };
  const openCreateCoupon = () => { resetCouponForm(); setShowCouponForm(true); };
  const openEditCoupon = (c) => {
    setEditingCouponId(c._id); setCpCode(c.code); setCpType(c.discountType);
    setCpValue(c.discountValue.toString()); setCpMinOrder(c.minOrderAmount.toString());
    setCpMaxUses(c.maxUses.toString()); setCpExpiry(c.expiryDate ? c.expiryDate.substring(0,10) : '');
    setCpActive(c.isActive); setShowCouponForm(true);
  };
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    const payload = { code: cpCode, discountType: cpType, discountValue: Number(cpValue),
      minOrderAmount: Number(cpMinOrder)||0, maxUses: Number(cpMaxUses)||0,
      expiryDate: cpExpiry || null, isActive: cpActive };
    let ok;
    if (editingCouponId) ok = await updateCoupon(editingCouponId, payload);
    else ok = await createCoupon(payload);
    if (ok) { setShowCouponForm(false); resetCouponForm(); }
  };

  // Bundle form helpers
  const resetBundleForm = () => {
    setEditingBundleId(null); setBnName(''); setBnDesc(''); setBnProductIds([]);
    setBnBundlePrice(''); setBnOriginalPrice(''); setBnActive(true);
  };
  const openCreateBundle = () => { resetBundleForm(); setShowBundleForm(true); };
  const openEditBundle = (b) => {
    setEditingBundleId(b._id); setBnName(b.name); setBnDesc(b.description);
    setBnProductIds(b.productIds || []); setBnBundlePrice(b.bundlePrice.toString());
    setBnOriginalPrice(b.originalPrice.toString()); setBnActive(b.isActive); setShowBundleForm(true);
  };
  const handleBundleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: bnName, description: bnDesc, productIds: bnProductIds,
      bundlePrice: Number(bnBundlePrice), originalPrice: Number(bnOriginalPrice)||0, isActive: bnActive };
    let ok;
    if (editingBundleId) ok = await updateBundle(editingBundleId, payload);
    else ok = await createBundle(payload);
    if (ok) { setShowBundleForm(false); resetBundleForm(); }
  };
  const handleBundleProductToggle = (id) => {
    setBnProductIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUser.trim() || !loginPass.trim()) {
      setLoginError('Please enter both username and password.');
      return;
    }

    setLoginLoading(true);
    const result = await loginAdmin(loginUser, loginPass);
    setLoginLoading(false);
    if (!result.success) {
      setLoginError(result.error);
    } else {
      setLoginUser('');
      setLoginPass('');
    }
  };

  if (!adminToken) {
    return (
      <div className="admin-login-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 160px)', backgroundColor: '#faf8f5', padding: '40px 20px' }}>
        <div className="admin-login-card" style={{ background: 'white', padding: '40px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-premium)', width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ fontSize: '2.5rem' }}>🛡️</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontSize: '1.8rem', marginTop: '10px' }}>Admin Access</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '5px' }}>Nushmeera Clothes Management Portal</p>
          </div>

          {loginError && (
            <div className="admin-login-error" style={{ backgroundColor: '#fdf3f2', color: '#d85c27', padding: '12px 15px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '20px', borderLeft: '4px solid #dc3545', fontWeight: '500' }}>
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-color)', fontWeight: '600', marginBottom: '8px' }}>Username</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="Enter admin username"
                style={{ width: '100%', padding: '12px 15px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '30px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-color)', fontWeight: '600', marginBottom: '8px' }}>Password</label>
              <input 
                type="password" 
                className="form-control" 
                required 
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Enter password"
                style={{ width: '100%', padding: '12px 15px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loginLoading}
              style={{
                width: '100%',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                padding: '14px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                opacity: loginLoading ? 0.7 : 1,
                transition: 'var(--transition-smooth)'
              }}
            >
              {loginLoading ? 'Logging In...' : 'Verify & Enter'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '25px' }}>
            <button 
              onClick={() => navigateTo('home')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}
            >
              ⬅️ Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 160px)', marginTop: '20px' }}>
      
      {/* Sidebar navigation panel */}
      <aside className="admin-sidebar" style={{ width: '280px', backgroundColor: '#0c332b', color: 'white', padding: '30px 20px' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-color)', marginBottom: '30px', fontWeight: 'bold' }}>
          🛡️ Control Center
        </h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <li>
            <button 
              onClick={() => setActiveTab('overview')} 
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 15px',
                borderRadius: '6px',
                color: activeTab === 'overview' ? 'var(--primary-color)' : 'white',
                backgroundColor: activeTab === 'overview' ? 'var(--accent-color)' : 'transparent',
                fontWeight: activeTab === 'overview' ? '600' : 'normal'
              }}
            >
              📊 Overview Dashboard
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('orders')} 
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 15px',
                borderRadius: '6px',
                color: activeTab === 'orders' ? 'var(--primary-color)' : 'white',
                backgroundColor: activeTab === 'orders' ? 'var(--accent-color)' : 'transparent',
                fontWeight: activeTab === 'orders' ? '600' : 'normal'
              }}
            >
              📋 Customer Orders ({totalOrders})
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('products')} 
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 15px',
                borderRadius: '6px',
                color: activeTab === 'products' ? 'var(--primary-color)' : 'white',
                backgroundColor: activeTab === 'products' ? 'var(--accent-color)' : 'transparent',
                fontWeight: activeTab === 'products' ? '600' : 'normal'
              }}
            >
              📦 Product Inventory ({totalProducts})
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('import')} 
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 15px',
                borderRadius: '6px',
                color: activeTab === 'import' ? 'var(--primary-color)' : 'white',
                backgroundColor: activeTab === 'import' ? 'var(--accent-color)' : 'transparent',
                fontWeight: activeTab === 'import' ? '600' : 'normal'
              }}
            >
              📥 Bulk Product Import
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('offers')} 
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 15px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: activeTab === 'offers' ? 'var(--primary-color)' : 'white',
                backgroundColor: activeTab === 'offers' ? 'var(--accent-color)' : 'transparent',
                fontWeight: activeTab === 'offers' ? '600' : 'normal'
              }}
            >
              🎁 Offers &amp; Bundles
            </button>
          </li>
          <li style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <div style={{ padding: '0 15px', marginBottom: '15px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
              Logged in as: <strong style={{ color: 'var(--accent-color)' }}>{adminUsername}</strong>
            </div>
            <button 
              onClick={logoutAdmin} 
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 15px',
                color: '#dc3545',
                fontSize: '0.9rem',
                fontWeight: '600',
                backgroundColor: 'rgba(220, 53, 69, 0.08)',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              🔒 Log Out
            </button>
          </li>
          <li style={{ marginTop: '10px' }}>
            <button 
              onClick={() => navigateTo('home')} 
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 15px',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer'
              }}
            >
              ⬅️ Back to Shop Frontend
            </button>
          </li>
        </ul>
      </aside>

      {/* Main dashboard content area */}
      <main className="admin-content" style={{ flexGrow: 1, padding: '40px', backgroundColor: '#faf8f5' }}>
        
        {/* Tab 1: Overview Dashboard */}
        {activeTab === 'overview' && (
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '30px' }}>Dashboard Overview</h1>
            
            {/* Overview Stats Cards Grid */}
            <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
              <div className="admin-stat-card" style={{ background: 'white', padding: '25px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Total Revenue</span>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', marginTop: '8px' }}>Rs. {totalSales.toLocaleString()}</h3>
              </div>
              <div className="admin-stat-card" style={{ background: 'white', padding: '25px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Total Orders</span>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', marginTop: '8px' }}>{totalOrders}</h3>
              </div>
              <div className="admin-stat-card" style={{ background: 'white', padding: '25px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Active Inventory</span>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', marginTop: '8px' }}>{totalProducts} Items</h3>
              </div>
              <div className="admin-stat-card" style={{ background: 'white', padding: '25px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Average Order Value</span>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', marginTop: '8px' }}>Rs. {avgOrderValue.toLocaleString()}</h3>
              </div>
            </div>

            {/* Warning Cards: Low Stock warnings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#d85c27', marginBottom: '20px', fontWeight: 'bold' }}>
                  ⚠️ Low Stock Alert (Stock ≤ 5 Items)
                </h3>
                {lowStockItems.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All designs are well-stocked!</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 0' }}>Design Name</th>
                        <th>Category</th>
                        <th>Fabric</th>
                        <th>Price</th>
                        <th>Stock Left</th>
                        <th>Quick Restock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockItems.map(item => (
                        <tr key={item._id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                          <td style={{ padding: '12px 0', fontWeight: '600' }}>{item.title}</td>
                          <td>{item.category}</td>
                          <td>{item.fabric}</td>
                          <td>Rs. {item.price.toLocaleString()}</td>
                          <td style={{ color: '#d85c27', fontWeight: 'bold' }}>{item.stock} left</td>
                          <td>
                            <button 
                              onClick={() => openEditModal(item)}
                              style={{ color: 'var(--accent-color)', fontWeight: '500', textDecoration: 'underline' }}
                            >
                              Edit Stock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders Panel */}
        {activeTab === 'orders' && (
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '30px' }}>Customer Orders Log</h1>
            {adminLoading ? (
              <p>Loading checkouts...</p>
            ) : adminOrders.length === 0 ? (
              <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-muted)' }}>No simulated checkouts placed yet.</p>
              </div>
            ) : (
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px' }}>Order ID</th>
                      <th>Date</th>
                      <th>Customer Details</th>
                      <th>Total Billing</th>
                      <th>Status</th>
                      <th>Change Status</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminOrders.map(order => {
                      const isExpanded = expandedOrderId === order.orderId;
                      let badgeColor = '#ffc107'; // yellow
                      if (order.status === 'Shipped') badgeColor = '#17a2b8'; // blue
                      if (order.status === 'Delivered') badgeColor = '#28a745'; // green
                      if (order.status === 'Cancelled') badgeColor = '#dc3545'; // red

                      return (
                        <React.Fragment key={order.orderId}>
                          <tr style={{ borderBottom: '1px solid #f1f1f1' }}>
                            <td style={{ padding: '15px 12px' }}>
                              <button 
                                onClick={() => toggleOrderExpand(order.orderId)}
                                style={{ fontWeight: '600', color: 'var(--primary-color)', textDecoration: 'underline' }}
                              >
                                {order.orderId}
                              </button>
                            </td>
                            <td>{new Date(order.date).toLocaleDateString()}</td>
                            <td>
                              <strong>{order.customerDetails?.name}</strong> <br />
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {order.customerDetails?.phone} | {order.customerDetails?.city}
                              </span>
                            </td>
                            <td>Rs. {order.totalAmount?.toLocaleString()}</td>
                            <td>
                              <span style={{
                                backgroundColor: badgeColor,
                                color: 'white',
                                padding: '3px 8px',
                                borderRadius: '3px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              <select 
                                value={order.status} 
                                onChange={(e) => updateOrderStatus(order._id || order.orderId, e.target.value)}
                                style={{ padding: '5px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button 
                                onClick={() => deleteOrder(order._id || order.orderId)}
                                style={{ color: '#dc3545', fontSize: '0.8rem', padding: '5px 10px', border: '1px solid #dc3545', borderRadius: '4px' }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                          {/* Expanded detail row showing items */}
                          {isExpanded && (
                            <tr style={{ backgroundColor: '#fdfbfa' }}>
                              <td colSpan="7" style={{ padding: '20px 25px', borderBottom: '1px solid var(--border-color)' }}>
                                <h4 style={{ color: 'var(--primary-color)', marginBottom: '10px', fontSize: '0.9rem' }}>📦 Purchased Items:</h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                  <thead>
                                    <tr style={{ borderBottom: '1px solid #e0e0e0', textAlign: 'left', color: 'var(--text-muted)' }}>
                                      <th style={{ padding: '5px 0' }}>Item Design</th>
                                      <th>Fabric</th>
                                      <th>Selected Size</th>
                                      <th>Quantity</th>
                                      <th>Price</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.cartItems?.map((item, idx) => (
                                      <tr key={idx} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                        <td style={{ padding: '8px 0', fontWeight: '500' }}>{item.title}</td>
                                        <td>{item.fabric}</td>
                                        <td>{item.size}</td>
                                        <td>{item.quantity}x</td>
                                        <td>Rs. {item.price.toLocaleString()}</td>
                                      </tr>
                                    ))}
                                    <tr>
                                      <td colSpan="3"></td>
                                      <td style={{ padding: '10px 0', fontWeight: 'bold' }}>Shipping Address:</td>
                                      <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>
                                        {order.customerDetails?.address}, {order.customerDetails?.city}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Products Panel */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)', margin: 0 }}>Product Inventory</h1>
              <button 
                onClick={openCreateModal}
                style={{
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  padding: '12px 25px',
                  borderRadius: '4px',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase'
                }}
              >
                ➕ Create New Product
              </button>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>Design Image</th>
                    <th>Product Title</th>
                    <th>Category</th>
                    <th>Fabric</th>
                    <th>Selling Price</th>
                    <th>Compare Price</th>
                    <th>Stock status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <img 
                          src={p.images[0]} 
                          alt={p.title} 
                          style={{ width: '45px', height: '55px', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                      </td>
                      <td style={{ fontWeight: '600' }}>{p.title}</td>
                      <td>{p.category}</td>
                      <td>{p.fabric}</td>
                      <td>Rs. {p.price.toLocaleString()}</td>
                      <td style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                        Rs. {p.originalPrice.toLocaleString()}
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 'bold',
                          color: p.stock <= 5 ? '#d85c27' : 'var(--text-color)'
                        }}>
                          {p.stock} units
                        </span>
                        {p.stock <= 5 && <span style={{ fontSize: '0.7rem', display: 'block', color: '#d85c27' }}>⚠️ low stock</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                          <button 
                            onClick={() => openEditModal(p)}
                            style={{ color: 'var(--accent-color)', padding: '5px 12px', border: '1px solid var(--accent-color)', borderRadius: '4px', fontSize: '0.8rem' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${p.title}"?`)) {
                                deleteAdminProduct(p._id);
                              }
                            }}
                            style={{ color: '#dc3545', padding: '5px 12px', border: '1px solid #dc3545', borderRadius: '4px', fontSize: '0.8rem' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Bulk Importer */}
        {activeTab === 'import' && (
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '30px' }}>Bulk Product Importer</h1>
            
            <div style={{ background: 'white', padding: '30px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '30px' }}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="import_type" 
                    value="json" 
                    checked={importType === 'json'} 
                    onChange={() => setImportType('json')} 
                  />
                  JSON Array import
                </label>
                <label style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="import_type" 
                    value="csv" 
                    checked={importType === 'csv'} 
                    onChange={() => setImportType('csv')} 
                  />
                  CSV Text import (comma-separated lines)
                </label>
              </div>

              <div style={{ marginBottom: '20px' }}>
                {importType === 'json' ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Paste a JSON array of products. Required fields: <code>title</code>, <code>price</code>, <code>originalPrice</code>, <code>category</code>, <code>fabric</code>, <code>stock</code>.
                    <br />
                    Example: <code>[{"{"}"title": "Lilac Pret", "price": 3000, "originalPrice": 6000, "category": "Kaftans", "fabric": "Lawn", "stock": 10{"}"}]</code>
                  </p>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Paste products as comma-separated lines. Format:
                    <br />
                    <code>Title, Price, OriginalPrice, Category, Fabric, Stock</code>
                    <br />
                    Example: <code>Vaneeza Lawn Edit, 5000, 9000, 3 Piece Suits, Lawn, 12</code>
                  </p>
                )}
              </div>

              <textarea 
                rows="10" 
                className="form-control" 
                style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '20px' }}
                placeholder={importType === 'json' ? '[\n  {\n    "title": "Summer Bliss Kaftan",\n    "price": 3200,\n    "originalPrice": 5999,\n    "category": "Kaftans",\n    "fabric": "Cotton",\n    "stock": 15\n  }\n]' : 'Zaitoon Pret, 2500, 5000, 2 Piece Sets, Cotton, 15\nMidnight Dusk, 4000, 7000, 3 Piece Suits, Lawn, 8'}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              ></textarea>

              <button 
                onClick={handleImportSubmit}
                style={{
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  padding: '12px 30px',
                  borderRadius: '4px',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase'
                }}
              >
                📥 Execute Bulk Import
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: Offers & Bundles */}
        {activeTab === 'offers' && (
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '8px' }}>🎁 Offers &amp; Bundles</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.9rem' }}>Create discount coupons and product bundles to boost sales.</p>

            {/* Sub-tab switcher */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid var(--border-color)', paddingBottom: '0' }}>
              {[['coupons', '🎟️ Coupon Codes'], ['bundles', '📦 Product Bundles']].map(([key, label]) => (
                <button key={key} onClick={() => setOfferSubTab(key)} style={{
                  padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontWeight: offerSubTab === key ? '700' : '500', fontSize: '0.95rem',
                  color: offerSubTab === key ? 'var(--primary-color)' : 'var(--text-muted)',
                  borderBottom: offerSubTab === key ? '2px solid var(--primary-color)' : '2px solid transparent',
                  marginBottom: '-2px', transition: 'all 0.2s'
                }}>{label}</button>
              ))}
            </div>

            {/* ---- COUPONS ---- */}
            {offerSubTab === 'coupons' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>All Coupons ({adminCoupons.length})</h3>
                  <button onClick={openCreateCoupon} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>+ Create Coupon</button>
                </div>

                {/* Coupon Form */}
                {showCouponForm && (
                  <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '25px', marginBottom: '25px', boxShadow: 'var(--shadow-premium)' }}>
                    <h4 style={{ margin: '0 0 20px', color: 'var(--primary-color)' }}>{editingCouponId ? '✏️ Edit Coupon' : '✨ New Coupon'}</h4>
                    <form onSubmit={handleCouponSubmit}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '15px', marginBottom: '15px' }}>
                        <div className="form-group">
                          <label className="form-label">Coupon Code *</label>
                          <input className="form-control" required value={cpCode} onChange={e => setCpCode(e.target.value.toUpperCase())} placeholder="e.g. SAVE20" style={{ textTransform: 'uppercase' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Discount Type</label>
                          <select className="form-control" value={cpType} onChange={e => setCpType(e.target.value)}>
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (Rs)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Discount Value *</label>
                          <input className="form-control" type="number" required value={cpValue} onChange={e => setCpValue(e.target.value)} placeholder={cpType === 'percentage' ? 'e.g. 20' : 'e.g. 500'} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '15px', marginBottom: '20px' }}>
                        <div className="form-group">
                          <label className="form-label">Min Order (Rs)</label>
                          <input className="form-control" type="number" value={cpMinOrder} onChange={e => setCpMinOrder(e.target.value)} placeholder="0 = no minimum" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Max Uses</label>
                          <input className="form-control" type="number" value={cpMaxUses} onChange={e => setCpMaxUses(e.target.value)} placeholder="0 = unlimited" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Expiry Date</label>
                          <input className="form-control" type="date" value={cpExpiry} onChange={e => setCpExpiry(e.target.value)} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <input type="checkbox" id="cpActiveChk" checked={cpActive} onChange={e => setCpActive(e.target.checked)} />
                        <label htmlFor="cpActiveChk" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Coupon is Active</label>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="form-submit-btn" style={{ flex: 1 }}>{editingCouponId ? '💾 Save Changes' : '✨ Create Coupon'}</button>
                        <button type="button" onClick={() => { setShowCouponForm(false); resetCouponForm(); }} style={{ padding: '12px 20px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Coupons Table */}
                {adminCoupons.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '10px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>No coupons yet. Create your first offer!</div>
                ) : (
                  <div style={{ background: 'white', borderRadius: '10px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead style={{ background: '#f9f7f4' }}>
                        <tr>
                          {['Code', 'Type', 'Discount', 'Min Order', 'Uses', 'Expiry', 'Status', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-color)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {adminCoupons.map(c => (
                          <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--primary-color)', fontFamily: 'monospace', fontSize: '0.9rem' }}>{c.code}</td>
                            <td style={{ padding: '12px 16px' }}>{c.discountType === 'percentage' ? 'Percent' : 'Fixed'}</td>
                            <td style={{ padding: '12px 16px', fontWeight: '600', color: '#2d6a4f' }}>{c.discountType === 'percentage' ? `${c.discountValue}%` : `Rs ${c.discountValue}`}</td>
                            <td style={{ padding: '12px 16px' }}>{c.minOrderAmount > 0 ? `Rs ${c.minOrderAmount}` : 'None'}</td>
                            <td style={{ padding: '12px 16px' }}>{c.usedCount}/{c.maxUses > 0 ? c.maxUses : '∞'}</td>
                            <td style={{ padding: '12px 16px' }}>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'No expiry'}</td>
                            <td style={{ padding: '12px 16px' }}><span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', background: c.isActive ? '#d4edda' : '#f8d7da', color: c.isActive ? '#155724' : '#721c24' }}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => openEditCoupon(c)} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>✏️ Edit</button>
                                <button onClick={() => { if(window.confirm('Delete this coupon?')) deleteCoupon(c._id); }} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', color: '#dc3545' }}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ---- BUNDLES ---- */}
            {offerSubTab === 'bundles' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Product Bundles ({adminBundles.length})</h3>
                  <button onClick={openCreateBundle} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>+ Create Bundle</button>
                </div>

                {/* Bundle Form */}
                {showBundleForm && (
                  <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '25px', marginBottom: '25px', boxShadow: 'var(--shadow-premium)' }}>
                    <h4 style={{ margin: '0 0 20px', color: 'var(--primary-color)' }}>{editingBundleId ? '✏️ Edit Bundle' : '✨ New Bundle'}</h4>
                    <form onSubmit={handleBundleSubmit}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div className="form-group">
                          <label className="form-label">Bundle Name *</label>
                          <input className="form-control" required value={bnName} onChange={e => setBnName(e.target.value)} placeholder="e.g. Summer Duo Set" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <input className="form-control" value={bnDesc} onChange={e => setBnDesc(e.target.value)} placeholder="Short description" />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div className="form-group">
                          <label className="form-label">Bundle Price (Rs) *</label>
                          <input className="form-control" type="number" required value={bnBundlePrice} onChange={e => setBnBundlePrice(e.target.value)} placeholder="e.g. 8999" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Original / Compare Price (Rs)</label>
                          <input className="form-control" type="number" value={bnOriginalPrice} onChange={e => setBnOriginalPrice(e.target.value)} placeholder="e.g. 12999" />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label className="form-label">Select Products to Include</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px', maxHeight: '200px', overflowY: 'auto', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px', background: '#faf8f5' }}>
                          {products.map(p => (
                            <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer', padding: '6px 8px', borderRadius: '4px', background: bnProductIds.includes(p._id) ? '#e8f5e9' : 'white', border: '1px solid', borderColor: bnProductIds.includes(p._id) ? '#2d6a4f' : 'var(--border-color)', transition: 'all 0.15s' }}>
                              <input type="checkbox" checked={bnProductIds.includes(p._id)} onChange={() => handleBundleProductToggle(p._id)} />
                              <span>{p.title} – Rs {p.price.toLocaleString()}</span>
                            </label>
                          ))}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>{bnProductIds.length} product(s) selected</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <input type="checkbox" id="bnActiveChk" checked={bnActive} onChange={e => setBnActive(e.target.checked)} />
                        <label htmlFor="bnActiveChk" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Bundle is Active</label>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="form-submit-btn" style={{ flex: 1 }}>{editingBundleId ? '💾 Save Changes' : '✨ Create Bundle'}</button>
                        <button type="button" onClick={() => { setShowBundleForm(false); resetBundleForm(); }} style={{ padding: '12px 20px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Bundles Grid */}
                {adminBundles.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '10px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>No bundles yet. Create your first bundle deal!</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '20px' }}>
                    {adminBundles.map(b => {
                      const savings = b.originalPrice - b.bundlePrice;
                      const savingsPct = b.originalPrice > 0 ? Math.round((savings / b.originalPrice) * 100) : 0;
                      const bundledProds = products.filter(p => (b.productIds || []).includes(p._id));
                      return (
                        <div key={b._id} style={{ background: 'white', borderRadius: '10px', border: `2px solid ${b.isActive ? 'var(--primary-color)' : 'var(--border-color)'}`, padding: '20px', position: 'relative', boxShadow: b.isActive ? 'var(--shadow-premium)' : 'none' }}>
                          {!b.isActive && <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.7rem', background: '#f8d7da', color: '#721c24', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>Inactive</span>}
                          {b.isActive && savingsPct > 0 && <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.7rem', background: '#d4edda', color: '#155724', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>Save {savingsPct}%</span>}
                          <h4 style={{ margin: '0 0 8px', color: 'var(--primary-color)', fontSize: '1rem' }}>📦 {b.name}</h4>
                          {b.description && <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{b.description}</p>}
                          <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '1.3rem', fontWeight: '700', color: '#2d6a4f' }}>Rs {b.bundlePrice.toLocaleString()}</span>
                            {b.originalPrice > 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '8px' }}>Rs {b.originalPrice.toLocaleString()}</span>}
                          </div>
                          {bundledProds.length > 0 && (
                            <div style={{ marginBottom: '12px' }}>
                              <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Includes:</p>
                              {bundledProds.map(p => <div key={p._id} style={{ fontSize: '0.8rem', color: 'var(--text-color)', padding: '2px 0' }}>• {p.title}</div>)}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                            <button onClick={() => openEditBundle(b)} style={{ flex: 1, padding: '7px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' }}>✏️ Edit</button>
                            <button onClick={() => { if(window.confirm('Delete this bundle?')) deleteBundle(b._id); }} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #dc3545', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem', color: '#dc3545' }}>🗑️</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* CRUD Product Dialog Modal */}
      {showProductModal && (
        <div className="modal-overlay active" onClick={() => setShowProductModal(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{isEditing ? '📝 Modify Product Details' : '✨ Create New Product Listing'}</h3>
              <button className="modal-close-btn" onClick={() => setShowProductModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              <form onSubmit={handleProductSubmit}>
                
                <div className="form-group">
                  <label className="form-label">Product Name / Title *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    placeholder="e.g. Vaneeza Embroidered 3pc"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Selling Price (Rs) *</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      required 
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="e.g. 5799"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Compare Price / Original (Rs) *</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      required 
                      value={prodOriginalPrice}
                      onChange={(e) => setProdOriginalPrice(e.target.value)}
                      placeholder="e.g. 9979"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select 
                      className="form-control"
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                    >
                      <option value="3 Piece Suits">3 Piece Suits</option>
                      <option value="2 Piece Sets">2 Piece Sets</option>
                      <option value="Co-ord Sets">Co-ord Sets</option>
                      <option value="Kaftans">Kaftans</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fabric *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={prodFabric}
                      onChange={(e) => setProdFabric(e.target.value)}
                      placeholder="e.g. Cotton Lawn"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Units *</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      required 
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      placeholder="e.g. 10"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URLs (comma-separated if multiple)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={prodImages}
                    onChange={(e) => setProdImages(e.target.value)}
                    placeholder="e.g. /images/lilac_orchid.png"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Available Sizes</label>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    {['Small', 'Medium', 'Large', 'Extra Large'].map(sz => (
                      <label key={sz} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={prodSizes.includes(sz)}
                          onChange={() => handleSizeCheckbox(sz)}
                        />
                        {sz}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description Details (One item per line)</label>
                  <textarea 
                    rows="4" 
                    className="form-control" 
                    placeholder="Fabric: Premium Embroidered Lawn&#10;Shirt: Embroidered Front&#10;Dupatta: Chiffon"
                    value={prodDetails}
                    onChange={(e) => setProdDetails(e.target.value)}
                  ></textarea>
                </div>

                <button type="submit" className="form-submit-btn">
                  {isEditing ? '💾 Update Product' : '✨ Create Product Listing'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
