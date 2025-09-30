import React from 'react';

const ProductCard = ({ product, isRecommendation }) => {
  return (
    <div className="product-card">
      <div className="product-name">{product.name}</div>
      <div className="product-price">${product.price}</div>
      <div className="product-category">{product.category}</div>
      <div className="product-description">{product.description}</div>
      
      {isRecommendation && (
        <div className="ai-recommendation-content">
          {product.recommendation_reason && (
            <div className="recommendation-reason">
              <strong>🤖 AI Analysis:</strong> {product.recommendation_reason}
            </div>
          )}
          
          {product.pros && product.pros.length > 0 && (
            <div className="recommendation-pros">
              <strong>✅ Key Advantages:</strong>
              <ul>
                {product.pros.map((pro, index) => (
                  <li key={index}>{pro}</li>
                ))}
              </ul>
            </div>
          )}
          
          {product.considerations && product.considerations.length > 0 && (
            <div className="recommendation-considerations">
              <strong>⚠️ Considerations:</strong>
              <ul>
                {product.considerations.map((consideration, index) => (
                  <li key={index}>{consideration}</li>
                ))}
              </ul>
            </div>
          )}
          
          {product.match_score && (
            <div className="match-score">
              <strong>Match Score:</strong> 
              <span className="score-badge">{product.match_score}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCard;