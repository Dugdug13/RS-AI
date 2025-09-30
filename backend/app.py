from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Sample product database
PRODUCTS = [
    {"id": 1, "name": "iPhone 14", "category": "smartphones", "price": 799, "description": "Latest iPhone with A15 Bionic chip"},
    {"id": 2, "name": "Samsung Galaxy S23", "category": "smartphones", "price": 699, "description": "Android flagship with excellent camera"},
    {"id": 3, "name": "Google Pixel 7", "category": "smartphones", "price": 499, "description": "Pure Android experience with great photography"},
    {"id": 4, "name": "OnePlus 11", "category": "smartphones", "price": 449, "description": "Fast performance with OxygenOS"},
    {"id": 5, "name": "MacBook Air M2", "category": "laptops", "price": 1199, "description": "Lightweight laptop with Apple Silicon"},
    {"id": 6, "name": "Dell XPS 13", "category": "laptops", "price": 999, "description": "Premium Windows ultrabook"},
    {"id": 7, "name": "ThinkPad X1 Carbon", "category": "laptops", "price": 1299, "description": "Business laptop with excellent keyboard"},
    {"id": 8, "name": "HP Spectre x360", "category": "laptops", "price": 1149, "description": "2-in-1 convertible laptop"},
    {"id": 9, "name": "AirPods Pro", "category": "audio", "price": 249, "description": "Wireless earbuds with noise cancellation"},
    {"id": 10, "name": "Sony WH-1000XM5", "category": "audio", "price": 399, "description": "Premium noise-canceling headphones"},
    {"id": 11, "name": "iPad Air", "category": "tablets", "price": 599, "description": "Versatile tablet for work and entertainment"},
    {"id": 12, "name": "Samsung Galaxy Tab S8", "category": "tablets", "price": 549, "description": "Android tablet with S Pen support"}
]

def get_perplexity_recommendation(user_preference, products):
    """
    Get product recommendations from Perplexity API
    """
    api_key = os.getenv('PERPLEXITY_API_KEY')
    if not api_key:
        return {"error": "Perplexity API key not configured"}
    
    # Create product list string for the AI
    product_list = "\n".join([
        f"- {p['name']}: ${p['price']} - {p['description']}"
        for p in products
    ])
    
    prompt = f"""
    As an expert product advisor, analyze the user's preference: "{user_preference}"
    
    Available products:
    {product_list}
    
    Please provide detailed recommendations considering:
    - Price-to-value ratio
    - Feature alignment with user needs
    - Use case suitability
    - Competitive advantages
    - Potential drawbacks or considerations
    
    Respond in JSON format:
    {{
        "recommendations": [
            {{
                "product_name": "Exact Product Name",
                "reason": "Detailed explanation of why this product is recommended, including specific features, benefits, and how it meets the user's criteria",
                "pros": ["Key advantage 1", "Key advantage 2", "Key advantage 3"],
                "considerations": ["Any limitation or consideration"],
                "match_score": 85
            }}
        ],
        "summary": "Comprehensive analysis of the user's needs and overall recommendation strategy",
        "alternative_suggestions": "Additional advice or alternative options to consider"
    }}
    
    Provide 2-4 top recommendations ranked by suitability."""
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'model': 'sonar-pro',
        'messages': [
            {
                'role': 'system',
                'content': 'You are an expert product recommendation assistant with deep knowledge of technology products. Analyze user preferences and provide detailed, personalized recommendations with comprehensive explanations. Always respond with valid JSON format and include rich content about why each product is suitable.'
            },
            {
                'role': 'user',
                'content': prompt
            }
        ],
        'max_tokens': 1500,
        'temperature': 0.3
    }
    
    try:
        response = requests.post(
            'https://api.perplexity.ai/chat/completions',
            headers=headers,
            json=data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Try to parse JSON from the response
            try:
                # Extract JSON from the response if it's wrapped in markdown
                if '```json' in content:
                    json_start = content.find('```json') + 7
                    json_end = content.find('```', json_start)
                    content = content[json_start:json_end].strip()
                elif '```' in content:
                    json_start = content.find('```') + 3
                    json_end = content.find('```', json_start)
                    content = content[json_start:json_end].strip()
                
                return json.loads(content)
            except json.JSONDecodeError:
                # If JSON parsing fails, return a formatted response
                return {
                    "recommendations": [],
                    "summary": content,
                    "raw_response": True
                }
        else:
            return {"error": f"API request failed with status {response.status_code}"}
            
    except Exception as e:
        return {"error": f"Failed to get recommendation: {str(e)}"}

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products"""
    return jsonify(PRODUCTS)

@app.route('/api/recommend', methods=['POST'])
def recommend_products():
    """Get AI-powered product recommendations"""
    data = request.get_json()
    
    if not data or 'preference' not in data:
        return jsonify({"error": "Preference is required"}), 400
    
    user_preference = data['preference']
    
    # Get AI recommendation
    ai_response = get_perplexity_recommendation(user_preference, PRODUCTS)
    
    if "error" in ai_response:
        return jsonify(ai_response), 500
    
    # Match recommended products with our database
    recommended_products = []
    if "recommendations" in ai_response:
        for rec in ai_response["recommendations"]:
            product_name = rec.get("product_name", "")
            # Find matching products (case-insensitive partial match)
            matching_products = [
                p for p in PRODUCTS 
                if product_name.lower() in p["name"].lower() or p["name"].lower() in product_name.lower()
            ]
            
            for product in matching_products:
                product_with_reason = product.copy()
                product_with_reason["recommendation_reason"] = rec.get("reason", "")
                product_with_reason["pros"] = rec.get("pros", [])
                product_with_reason["considerations"] = rec.get("considerations", [])
                product_with_reason["match_score"] = rec.get("match_score", 0)
                recommended_products.append(product_with_reason)
    
    return jsonify({
        "recommendations": recommended_products,
        "summary": ai_response.get("summary", ""),
        "ai_response": ai_response
    })

@app.route('/api/search', methods=['GET'])
def search_products():
    """Search products by category, price range, or name"""
    category = request.args.get('category')
    max_price = request.args.get('max_price', type=int)
    min_price = request.args.get('min_price', type=int)
    name = request.args.get('name')
    
    filtered_products = PRODUCTS
    
    if category:
        filtered_products = [p for p in filtered_products if p['category'].lower() == category.lower()]
    
    if max_price:
        filtered_products = [p for p in filtered_products if p['price'] <= max_price]
    
    if min_price:
        filtered_products = [p for p in filtered_products if p['price'] >= min_price]
    
    if name:
        filtered_products = [p for p in filtered_products if name.lower() in p['name'].lower()]
    
    return jsonify(filtered_products)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Product Recommendation API is running"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)