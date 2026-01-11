"""
Customer Agent
AI agent for personalized customer recommendations and assistance
"""

from typing import Dict, Any, List
from .base_agent import BaseAgent


class CustomerAgent(BaseAgent):
    """AI Agent for customer-related intelligence"""
    
    def __init__(self):
        super().__init__("Customer Agent")
    
    async def get_personalized_recommendations(
        self,
        customer_id: str,
        purchase_history: List[Dict],
        current_time: str,
        area_id: str
    ) -> Dict[str, Any]:
        """
        Generate personalized product recommendations for customer
        
        Args:
            customer_id: Customer ID
            purchase_history: List of past purchases
            current_time: Current time for time-based recommendations
            area_id: Customer's area for local recommendations
            
        Returns:
            Personalized recommendations
        """
        prompt = f"""
You are a personalized shopping assistant for The Local Loop hyperlocal platform.

**Customer Profile:**
- Customer ID: {customer_id}
- Area: {area_id}
- Current Time: {current_time}

**Purchase History:**
{self._format_purchase_history(purchase_history)}

**Task:**
Generate personalized product recommendations considering:
1. Past purchase patterns
2. Time of day (breakfast, lunch, dinner items)
3. Trending items in their area
4. Seasonal relevance
5. Complementary products

**Response Format (JSON):**
{{
  "recommendations": [
    {{
      "category": "category name",
      "products": ["product1", "product2", "product3"],
      "reason": "why these products"
    }}
  ],
  "trending_in_area": ["item1", "item2"],
  "time_based_suggestions": ["breakfast/lunch/dinner items"],
  "personalized_message": "friendly message to customer"
}}

Provide helpful, relevant recommendations in JSON format.
"""
        
        response = await self.generate_response(prompt, temperature=0.8)
        return self.parse_json_response(response)
    
    async def answer_customer_query(
        self,
        query: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Answer customer questions using AI
        
        Args:
            query: Customer's question
            context: Additional context (order status, products, etc.)
            
        Returns:
            AI-generated answer
        """
        prompt = f"""
You are a helpful customer service assistant for The Local Loop.

**Customer Query:**
{query}

**Context:**
{self._format_context(context)}

**Task:**
Provide a helpful, accurate, and friendly response to the customer's query.
If it's about:
- Order status: Provide clear status information
- Product availability: Check context and inform
- Delivery time: Give realistic estimates
- General questions: Answer helpfully

**Response Format (JSON):**
{{
  "answer": "your detailed answer",
  "suggested_actions": ["action1", "action2"],
  "requires_human_support": false,
  "confidence": 0.95
}}

Respond in JSON format.
"""
        
        response = await self.generate_response(prompt, temperature=0.7)
        return self.parse_json_response(response)
    
    async def predict_customer_needs(
        self,
        customer_id: str,
        behavior_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Predict what customer might need next
        
        Args:
            customer_id: Customer ID
            behavior_data: Browsing and purchase behavior
            
        Returns:
            Predicted needs and suggestions
        """
        prompt = f"""
You are a predictive analytics agent for customer behavior.

**Customer ID:** {customer_id}

**Behavior Data:**
- Recent searches: {behavior_data.get('recent_searches', [])}
- Cart items: {behavior_data.get('cart_items', [])}
- Browsing history: {behavior_data.get('browsing_history', [])}
- Last purchase: {behavior_data.get('last_purchase_date', 'N/A')}

**Task:**
Predict what the customer might need next based on their behavior.

**Response Format (JSON):**
{{
  "predicted_needs": ["need1", "need2", "need3"],
  "urgency_level": "high|medium|low",
  "suggested_products": ["product1", "product2"],
  "reasoning": "why these predictions",
  "best_time_to_notify": "morning|afternoon|evening"
}}

Provide predictions in JSON format.
"""
        
        response = await self.generate_response(prompt, temperature=0.6)
        return self.parse_json_response(response)
    
    def _format_purchase_history(self, history: List[Dict]) -> str:
        """Format purchase history for prompt"""
        if not history:
            return "No purchase history available"
        
        formatted = []
        for item in history[:10]:  # Last 10 purchases
            formatted.append(
                f"- {item.get('product_name', 'Unknown')} "
                f"({item.get('category', 'N/A')}) "
                f"on {item.get('date', 'N/A')}"
            )
        return "\n".join(formatted)
    
    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format context for prompt"""
        formatted = []
        for key, value in context.items():
            formatted.append(f"- {key}: {value}")
        return "\n".join(formatted) if formatted else "No additional context"

