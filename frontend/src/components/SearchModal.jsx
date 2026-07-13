import React, { useContext, useEffect, useRef } from 'react';
import { ProductContext } from '../context/ProductContext';

export default function SearchModal() {
  const {
    showSearchModal,
    setShowSearchModal,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    products,
    navigateTo
  } = useContext(ProductContext);

  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (showSearchModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearchModal]);

  if (!showSearchModal) return null;

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    const matches = products.filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase()) || 
      p.category.toLowerCase().includes(query.toLowerCase()) || 
      p.fabric.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(matches);
  };

  const handleResultClick = (product) => {
    navigateTo('product', product);
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className={`modal-overlay ${showSearchModal ? 'active' : ''}`} onClick={() => setShowSearchModal(false)}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ top: '10%', transform: 'translateY(0)' }}>
        <div className="modal-header">
          <h3 className="modal-title">🔍 Search Products</h3>
          <button className="modal-close-btn" onClick={() => setShowSearchModal(false)}>×</button>
        </div>
        <div className="modal-body search-modal-body">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search lawn, 3pc, kaftan..." 
            value={searchQuery}
            onChange={handleSearchChange}
            ref={inputRef}
          />
          
          {searchResults.length > 0 && (
            <div className="search-results-list">
              {searchResults.map(p => (
                <div 
                  key={p._id} 
                  className="search-result-item" 
                  onClick={() => handleResultClick(p)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={p.images[0]} alt={p.title} className="search-result-img" />
                  <div>
                    <h4 className="search-result-title">{p.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.category}</span>
                  </div>
                  <span className="search-result-price">Rs.{p.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          
          {searchQuery && searchResults.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '15px 0' }}>
              No matching products found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
