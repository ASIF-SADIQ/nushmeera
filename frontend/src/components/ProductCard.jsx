import React, { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';

export default function ProductCard({ product }) {
  const { navigateTo } = useContext(ProductContext);

  if (!product) return null;

  const discountPercent = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <div className="product-card">
      <div 
        className="product-card-image-wrap" 
        onClick={() => navigateTo('product', product)} 
        style={{ cursor: 'pointer' }}
      >
        <img 
          src={product.images[0]} 
          alt={product.title} 
          className="product-card-img" 
          loading="lazy"
        />
        {product.stock <= 6 && (
          <span className="product-card-badge">Selling Fast</span>
        )}
        {discountPercent > 0 && (
          <span className="product-card-badge" style={{ left: 'unset', right: '12px', backgroundColor: '#a7863d' }}>
            SAVE {discountPercent}%
          </span>
        )}
      </div>
      <div className="product-card-info">
        <h3 className="product-card-title">{product.title}</h3>
        <div className="product-card-rating">
          {'★'.repeat(Math.round(product.rating))}
          {'☆'.repeat(5 - Math.round(product.rating))}
          <span className="product-card-reviews-count">({product.reviewsCount} reviews)</span>
        </div>
        <div className="product-card-price-row">
          <span className="product-card-price">Rs.{product.price.toLocaleString()}</span>
          <span className="product-card-original-price">Rs.{product.originalPrice.toLocaleString()}</span>
        </div>
        <button className="product-card-btn" onClick={() => navigateTo('product', product)}>
          Choose options
        </button>
      </div>
    </div>
  );
}
