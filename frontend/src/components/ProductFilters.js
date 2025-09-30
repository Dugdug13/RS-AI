import React, { useState } from 'react';

const ProductFilters = ({ onFilter, onClear }) => {
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const categories = ['smartphones', 'laptops', 'audio', 'tablets'];

  const handleFilterChange = () => {
    const filters = {
      category: category,
      minPrice: minPrice ? parseInt(minPrice) : null,
      maxPrice: maxPrice ? parseInt(maxPrice) : null
    };
    onFilter(filters);
  };

  const handleClear = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onClear();
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '10px', 
      marginBottom: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
    }}>
      <h3 style={{ marginBottom: '15px', color: '#333' }}>Filter Products</h3>
      
      <div className="filters">
        <select 
          value={category} 
          onChange={(e) => {
            setCategory(e.target.value);
            setTimeout(handleFilterChange, 0);
          }}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => {
            setMinPrice(e.target.value);
            setTimeout(handleFilterChange, 0);
          }}
          className="filter-select"
          style={{ width: '120px' }}
        />

        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(e.target.value);
            setTimeout(handleFilterChange, 0);
          }}
          className="filter-select"
          style={{ width: '120px' }}
        />

        <button onClick={handleClear} className="clear-button">
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;