import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './components/ProductCard';
import SearchSection from './components/SearchSection';
import ProductFilters from './components/ProductFilters';

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendationSummary, setRecommendationSummary] = useState('');
  const [alternativeSuggestions, setAlternativeSuggestions] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Fetch all products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    }
  };

  const handleRecommendation = async (preference) => {
    setLoading(true);
    setError('');
    setShowRecommendations(false);

    try {
      const response = await axios.post('/api/recommend', {
        preference: preference
      });

      const aiResponse = response.data.ai_response || {};
      setRecommendations(response.data.recommendations || []);
      setRecommendationSummary(aiResponse.summary || response.data.summary || '');
      setAlternativeSuggestions(aiResponse.alternative_suggestions || '');
      setShowRecommendations(true);
      
      // Clear any previous errors if we got recommendations
      if (response.data.recommendations.length > 0) {
        setError('');
      }
      
      if (response.data.recommendations.length === 0) {
        setError('No specific product recommendations found, but here is what the AI suggests: ' + 
                (aiResponse.summary || response.data.summary || 'Please try a different search.'));
      }
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
      console.error('Error getting recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters) => {
    let filtered = products;

    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= filters.minPrice);
    }

    setFilteredProducts(filtered);
    setShowRecommendations(false);
  };

  const clearFilters = () => {
    setFilteredProducts(products);
    setShowRecommendations(false);
    setRecommendations([]);
    setRecommendationSummary('');
    setAlternativeSuggestions('');
    setError('');
  };

  return (
    <div className="container">
      <header className="header">
        <h1>AI-Powered Product Recommendation System</h1>
        <p>Tell us what you're looking for and get personalized recommendations</p>
      </header>

      <SearchSection onSearch={handleRecommendation} loading={loading} />

      {error && <div className="error">{error}</div>}

      {loading && <div className="loading">Getting recommendations...</div>}

      {showRecommendations && recommendationSummary && (
        <div className="recommendations-summary">
          <h3>🧠 AI Analysis & Recommendation Summary</h3>
          <p className="summary-text">{recommendationSummary}</p>
          
          {alternativeSuggestions && (
            <div className="alternative-suggestions">
              <h4>💡 Additional Insights</h4>
              <p className="alternative-text">{alternativeSuggestions}</p>
            </div>
          )}
        </div>
      )}

      <ProductFilters onFilter={handleFilter} onClear={clearFilters} />

      {showRecommendations && recommendations.length > 0 && (
        <div>
          <h2 className="section-title">AI Recommendations</h2>
          <div className="products-grid">
            {recommendations.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isRecommendation={true}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="section-title">
          {showRecommendations ? 'All Products' : 'Our Products'}
        </h2>
        <div className="products-grid">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isRecommendation={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;