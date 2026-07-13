import React, { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const {
    products,
    loading,
    selectedCategory,
    setSelectedCategory,
    sortOrder,
    setSortOrder,
    activeFilterDropdown,
    setActiveFilterDropdown,
    filterInStock,
    setFilterInStock,
    filterOutOfStock,
    setFilterOutOfStock,
    filterPriceFrom,
    setFilterPriceFrom,
    filterPriceTo,
    setFilterPriceTo
  } = useContext(ProductContext);

  // Filter and Sort Logic
  const getFilteredProducts = () => {
    let list = [...products];

    // Filter by Category Menu
    if (selectedCategory && selectedCategory !== 'Shop All') {
      if (selectedCategory === 'Dresses under 2999') {
        list = list.filter(p => p.price < 2999);
      } else if (selectedCategory === 'Summer Lawn Edit') {
        // Map summer lawn edit to 3 Piece Suits category
        list = list.filter(p => p.category.toLowerCase() === '3 piece suits');
      } else if (selectedCategory === 'Bundle & Save') {
        // Map Bundle & Save to items with high discounts (>= 40%)
        list = list.filter(p => (1 - p.price / p.originalPrice) >= 0.4);
      } else if (selectedCategory === 'New Arrival') {
        // Show all products (or can implement customized logic)
      } else {
        list = list.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
      }
    }

    // Filter by Availability (Dropdown)
    if (filterInStock && !filterOutOfStock) {
      list = list.filter(p => p.stock > 0);
    } else if (!filterInStock && filterOutOfStock) {
      list = list.filter(p => p.stock === 0);
    }

    // Filter by Price range (Dropdown)
    if (filterPriceFrom) {
      list = list.filter(p => p.price >= parseFloat(filterPriceFrom));
    }
    if (filterPriceTo) {
      list = list.filter(p => p.price <= parseFloat(filterPriceTo));
    }

    // Sorting
    if (sortOrder === 'price-low-high') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-high-low') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOrder === 'alpha-a-z') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === 'alpha-z-a') {
      list.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortOrder === 'date-old-new') {
      list.sort((a, b) => a._id.localeCompare(b._id));
    } else if (sortOrder === 'date-new-old') {
      list.sort((a, b) => b._id.localeCompare(a._id));
    }
    return list;
  };

  const filteredProducts = getFilteredProducts();

  // Counting metrics for dropdown filters
  const inStockCount = products.filter(p => p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const highestPrice = products.reduce((max, p) => p.price > max ? p.price : max, 0);

  const toggleDropdown = (dropdownName, e) => {
    e.stopPropagation(); // Avoid triggering outside click listener
    setActiveFilterDropdown(activeFilterDropdown === dropdownName ? null : dropdownName);
  };

  return (
    <div className="container">
      <div className="section-title-wrap">
        <h2 className="section-title" style={{ fontSize: '3rem', margin: '30px 0 10px' }}>
          {selectedCategory || "Shop All"}
        </h2>
      </div>
      
      {/* Inline Dropdown Filters layout matching screenshots */}
      <div className="catalog-layout">
        <div className="inline-filters-row" onClick={(e) => e.stopPropagation()}>
          <div className="filters-left">
            <span>Filter:</span>
            
            {/* Availability Dropdown Filter */}
            <div className="filter-dropdown">
              <button 
                className="filter-dropdown-btn" 
                onClick={(e) => toggleDropdown('availability', e)}
              >
                Availability ▾
              </button>
              {activeFilterDropdown === 'availability' && (
                <div className="filter-dropdown-card">
                  <div className="filter-card-header">
                    <span>{(filterInStock ? 1 : 0) + (filterOutOfStock ? 1 : 0)} selected</span>
                    <span className="reset-btn" onClick={() => { setFilterInStock(false); setFilterOutOfStock(false); }}>Reset</span>
                  </div>
                  <label className="filter-option">
                    <input 
                      type="checkbox" 
                      checked={filterInStock} 
                      onChange={(e) => setFilterInStock(e.target.checked)} 
                    />
                    In stock ({inStockCount})
                  </label>
                  <label className="filter-option">
                    <input 
                      type="checkbox" 
                      checked={filterOutOfStock} 
                      onChange={(e) => setFilterOutOfStock(e.target.checked)} 
                    />
                    Out of stock ({outOfStockCount})
                  </label>
                </div>
              )}
            </div>

            {/* Price Dropdown Filter */}
            <div className="filter-dropdown">
              <button 
                className="filter-dropdown-btn" 
                onClick={(e) => toggleDropdown('price', e)}
              >
                Price ▾
              </button>
              {activeFilterDropdown === 'price' && (
                <div className="filter-dropdown-card">
                  <div className="filter-card-header">
                    <span>The highest price is Rs.{highestPrice.toLocaleString()}</span>
                    <span className="reset-btn" onClick={() => { setFilterPriceFrom(''); setFilterPriceTo(''); }}>Reset</span>
                  </div>
                  <div className="filter-price-range">
                    <div className="filter-price-inputs">
                      <div className="filter-price-field">
                        <span>Rs</span>
                        <input 
                          type="number" 
                          placeholder="From" 
                          value={filterPriceFrom}
                          onChange={(e) => setFilterPriceFrom(e.target.value)}
                        />
                      </div>
                      <div className="filter-price-field">
                        <span>Rs</span>
                        <input 
                          type="number" 
                          placeholder="To" 
                          value={filterPriceTo}
                          onChange={(e) => setFilterPriceTo(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="catalog-sort">
              <span style={{ marginRight: '10px', fontSize: '0.85rem' }}>Sort by:</span>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)} 
                style={{ padding: '8px 15px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
              >
                <option value="featured">Featured</option>
                <option value="best-selling">Best Selling</option>
                <option value="alpha-a-z">Alphabetically, A-Z</option>
                <option value="alpha-z-a">Alphabetically, Z-A</option>
                <option value="price-low-high">Price, low to high</option>
                <option value="price-high-low">Price, high to low</option>
                <option value="date-old-new">Date, old to new</option>
                <option value="date-new-old">Date, new to old</option>
              </select>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {filteredProducts.length} products
            </span>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            No products found matching these filters.
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
