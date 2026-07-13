import React, { useContext, useState, useEffect } from 'react';
import { ProductContext } from '../context/ProductContext';
import { CartContext } from '../context/CartContext';

export default function BundlePage() {
  const { products, navigateTo, addToast } = useContext(ProductContext);
  const { addToCart } = useContext(CartContext);

  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/bundles');
        const data = await res.json();
        setBundles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching bundles', err);
        setBundles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, []);

  const handleAddBundle = (bundle) => {
    const bundledProds = products.filter(p => (bundle.productIds || []).includes(p._id));
    if (bundledProds.length === 0) {
      addToast('⚠️ No products linked to this bundle yet.');
      return;
    }
    bundledProds.forEach(p => {
      const size = p.sizes?.[0] || 'One Size';
      addToCart(p, size, 1);
    });
  };

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0c332b 0%, #1a5c4a 60%, #2d8c6e 100%)',
        borderRadius: '16px',
        padding: '60px 40px',
        textAlign: 'center',
        margin: '30px 0 50px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-30px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '2.5rem' }}>🎁</span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', color: 'white', margin: '10px 0 8px', letterSpacing: '-0.02em' }}>Bundle &amp; Save</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
            Curated sets crafted to save you more — styled together, priced beautifully.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '25px', flexWrap: 'wrap' }}>
            {['📦 Hand-picked Sets', '💰 Up to 60% Savings', '🚀 Free Delivery'].map(tag => (
              <span key={tag} style={{ background: 'rgba(255,255,255,0.12)', color: 'white', padding: '7px 16px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: '500', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.15)' }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '15px' }}>⌛</div>
          <p style={{ color: 'var(--text-muted)' }}>Loading bundles...</p>
        </div>
      ) : bundles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎁</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontSize: '1.6rem', marginBottom: '8px' }}>No Bundles Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>Our team is curating special bundle deals — check back soon!</p>
          <button
            onClick={() => navigateTo('shop')}
            style={{ background: 'var(--primary-color)', color: 'white', padding: '12px 28px', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Browse All Products
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '28px' }}>
          {bundles.map(bundle => {
            const bundledProds = products.filter(p => (bundle.productIds || []).includes(p._id));
            const savings = bundle.originalPrice > 0 ? bundle.originalPrice - bundle.bundlePrice : 0;
            const savingsPct = bundle.originalPrice > 0 ? Math.round((savings / bundle.originalPrice) * 100) : 0;
            const firstImage = bundledProds[0]?.images?.[0] || null;

            return (
              <div key={bundle._id} style={{
                background: 'white',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
              >
                {/* Bundle image / product thumbnails */}
                <div style={{ position: 'relative', background: '#f5f0ea', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {savingsPct > 0 && (
                    <div style={{ position: 'absolute', top: '14px', left: '14px', background: '#e63946', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', zIndex: 2 }}>
                      Save {savingsPct}%
                    </div>
                  )}

                  {bundledProds.length > 0 ? (
                    <div style={{ display: 'flex', gap: '8px', padding: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {bundledProds.slice(0, 3).map((p, i) => (
                        <div key={p._id} style={{ width: bundledProds.length === 1 ? '180px' : '130px', height: bundledProds.length === 1 ? '180px' : '130px', borderRadius: '10px', overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <img src={p.images?.[0] || '/images/lilac_orchid.png'} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                      {bundledProds.length > 3 && (
                        <div style={{ width: '130px', height: '130px', borderRadius: '10px', background: 'rgba(12,51,43,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '1.1rem', border: '2px solid white' }}>
                          +{bundledProds.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '4rem', opacity: 0.3 }}>📦</div>
                  )}
                </div>

                {/* Bundle Info */}
                <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--primary-color)', margin: '0 0 6px' }}>{bundle.name}</h3>
                  {bundle.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 14px', lineHeight: '1.5' }}>{bundle.description}</p>
                  )}

                  {/* Included products list */}
                  {bundledProds.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>What's Included:</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {bundledProds.map(p => (
                          <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-color)' }}>
                            <span style={{ color: '#2d6a4f', fontWeight: '700' }}>✓</span>
                            <span>{p.title}</span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>Rs {p.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '18px', marginTop: 'auto' }}>
                    <span style={{ fontSize: '1.7rem', fontWeight: '700', color: '#0c332b' }}>Rs {bundle.bundlePrice.toLocaleString()}</span>
                    {bundle.originalPrice > 0 && (
                      <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>Rs {bundle.originalPrice.toLocaleString()}</span>
                    )}
                    {savings > 0 && (
                      <span style={{ fontSize: '0.8rem', background: '#d4edda', color: '#155724', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>
                        You save Rs {savings.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleAddBundle(bundle)}
                    style={{
                      width: '100%',
                      padding: '13px',
                      background: 'linear-gradient(135deg, #0c332b, #1a5c4a)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      letterSpacing: '0.03em',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    🛒 Add Bundle to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
