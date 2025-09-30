import React, { useState } from 'react';

const SearchSection = ({ onSearch, loading }) => {
  const [preference, setPreference] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (preference.trim()) {
      onSearch(preference.trim());
    }
  };

  const handleExampleClick = (example) => {
    setPreference(example);
  };

  const examples = [
    "I want a smartphone under $500",
    "Looking for a laptop for programming",
    "Need good wireless headphones for music",
    "Want a tablet for reading and entertainment"
  ];

  return (
    <div className="search-section">
      <h2>What are you looking for?</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={preference}
          onChange={(e) => setPreference(e.target.value)}
          placeholder="e.g., I want a phone under $500, or I need a laptop for work..."
          className="search-input"
          disabled={loading}
        />
        <button 
          type="submit" 
          className="search-button"
          disabled={loading || !preference.trim()}
        >
          {loading ? 'Getting Recommendations...' : 'Get AI Recommendations'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px' }}>
        <p style={{ marginBottom: '10px', color: '#666' }}>Try these examples:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {examples.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleExampleClick(example)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#495057'
              }}
              disabled={loading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchSection;