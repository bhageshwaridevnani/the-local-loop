"""
Vendor Agent
AI agent for vendor optimization, inventory management, and business insights
"""

from typing import Dict, Any, List
from .base_agent import BaseAgent


class VendorAgent(BaseAgent):
    """AI Agent for vendor-related intelligence"""
    
    def __init__(self):
        super().__init__("Vendor Agent")
    
    async def optimize_pricing(
        self,
        vendor_id: str,
        products: List[Dict],
        market_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Provide AI-powered pricing recommendations
        
        Args:
            vendor_id: Vendor ID
            products: List of vendor's products
            market_data: Market trends and competitor data
            
        Returns:
            Pricing optimization suggestions
        """
        prompt = f"""
You are a pricing optimization expert for The Local Loop hyperlocal marketplace.

**Vendor ID:** {vendor_id}

**Current Products:**
{self._format_products(products)}

**Market Data:**
- Average market price: {market_data.get('avg_price', 'N/A')}
- Competitor prices: {market_data.get('competitor_prices', [])}
- Demand trend: {market_data.get('demand_trend', 'stable')}
- Season: {market_data.get('season', 'regular')}

**Task:**
Analyze and provide pricing recommendations to:
1. Maximize profit while staying competitive
2. Consider demand elasticity
3. Account for seasonal factors
4. Maintain customer satisfaction

**Response Format (JSON):**
{{
  "recommendations": [
    {{
      "product_id": "id",
      "product_name": "name",
      "current_price": 100,
      "recommended_price": 95,
      "reason": "explanation",
      "expected_impact": "increase sales by 15%"
    }}
  ],
  "overall_strategy": "competitive|premium|value",
  "estimated_revenue_impact": "+12%",
  "confidence_score": 0.85
}}

Provide recommendations in JSON format.
"""
        
        response = await self.generate_response(prompt, temperature=0.6)
        return self.parse_json_response(response)
    
    async def inventory_management(
        self,
        vendor_id: str,
        inventory: List[Dict],
        sales_history: List[Dict]
    ) -> Dict[str, Any]:
        """
        AI-powered inventory management suggestions
        
        Args:
            vendor_id: Vendor ID
            inventory: Current inventory levels
            sales_history: Historical sales data
            
        Returns:
            Inventory optimization suggestions
        """
        prompt = f"""
You are an inventory management AI for The Local Loop platform.

**Vendor ID:** {vendor_id}

**Current Inventory:**
{self._format_inventory(inventory)}

**Sales History (Last 30 days):**
{self._format_sales_history(sales_history)}

**Task:**
Analyze inventory and provide actionable recommendations:
1. Identify low stock items that need reordering
2. Detect slow-moving items
3. Predict demand for next week
4. Suggest optimal reorder quantities

**Response Format (JSON):**
{{
  "urgent_reorders": [
    {{
      "product_id": "id",
      "product_name": "name",
      "current_stock": 5,
      "recommended_order": 50,
      "reason": "high demand, low stock"
    }}
  ],
  "slow_moving_items": [
    {{
      "product_id": "id",
      "product_name": "name",
      "stock_level": 100,
      "suggestion": "discount or bundle"
    }}
  ],
  "demand_forecast": {{
    "next_week": "high|medium|low",
    "trending_products": ["product1", "product2"]
  }},
  "overall_health": "good|needs_attention|critical"
}}

Provide analysis in JSON format.
"""
        
        response = await self.generate_response(prompt, temperature=0.5)
        return self.parse_json_response(response)
    
    async def business_insights(
        self,
        vendor_id: str,
        performance_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate business insights and growth recommendations
        
        Args:
            vendor_id: Vendor ID
            performance_data: Sales, revenue, customer data
            
        Returns:
            Business insights and recommendations
        """
        prompt = f"""
You are a business intelligence advisor for The Local Loop vendors.

**Vendor ID:** {vendor_id}

**Performance Metrics:**
- Total Revenue: ₹{performance_data.get('revenue', 0)}
- Total Orders: {performance_data.get('orders', 0)}
- Average Order Value: ₹{performance_data.get('avg_order_value', 0)}
- Customer Rating: {performance_data.get('rating', 0)}/5
- Repeat Customer Rate: {performance_data.get('repeat_rate', 0)}%
- Top Products: {performance_data.get('top_products', [])}

**Task:**
Provide strategic business insights and actionable recommendations:
1. Identify growth opportunities
2. Suggest product mix optimization
3. Recommend marketing strategies
4. Highlight areas for improvement

**Response Format (JSON):**
{{
  "performance_summary": "overall assessment",
  "strengths": ["strength1", "strength2"],
  "areas_for_improvement": ["area1", "area2"],
  "growth_opportunities": [
    {{
      "opportunity": "description",
      "potential_impact": "high|medium|low",
      "action_steps": ["step1", "step2"]
    }}
  ],
  "marketing_suggestions": ["suggestion1", "suggestion2"],
  "competitive_positioning": "market leader|strong|average|needs work"
}}

Provide insights in JSON format.
"""
        
        response = await self.generate_response(prompt, temperature=0.7)
        return self.parse_json_response(response)
    
    async def demand_prediction(
        self,
        vendor_id: str,
        product_id: str,
        historical_data: List[Dict]
    ) -> Dict[str, Any]:
        """
        Predict future demand for specific products
        
        Args:
            vendor_id: Vendor ID
            product_id: Product to predict demand for
            historical_data: Historical sales data
            
        Returns:
            Demand predictions
        """
        prompt = f"""
You are a demand forecasting AI for The Local Loop.

**Vendor ID:** {vendor_id}
**Product ID:** {product_id}

**Historical Sales Data:**
{self._format_sales_history(historical_data)}

**Task:**
Predict demand for the next 7 days considering:
1. Historical patterns
2. Day of week trends
3. Seasonal factors
4. Recent trends

**Response Format (JSON):**
{{
  "predictions": [
    {{"day": "Monday", "predicted_units": 25, "confidence": 0.85}},
    {{"day": "Tuesday", "predicted_units": 20, "confidence": 0.82}}
  ],
  "weekly_total": 150,
  "trend": "increasing|stable|decreasing",
  "recommended_stock_level": 180,
  "insights": "key insights about demand pattern"
}}

Provide predictions in JSON format.
"""
        
        response = await self.generate_response(prompt, temperature=0.5)
        return self.parse_json_response(response)
    
    def _format_products(self, products: List[Dict]) -> str:
        """Format products for prompt"""
        if not products:
            return "No products available"
        
        formatted = []
        for product in products[:20]:  # Limit to 20 products
            formatted.append(
                f"- {product.get('name', 'Unknown')}: "
                f"₹{product.get('price', 0)} "
                f"(Stock: {product.get('stock', 0)})"
            )
        return "\n".join(formatted)
    
    def _format_inventory(self, inventory: List[Dict]) -> str:
        """Format inventory for prompt"""
        if not inventory:
            return "No inventory data"
        
        formatted = []
        for item in inventory[:20]:
            formatted.append(
                f"- {item.get('product_name', 'Unknown')}: "
                f"{item.get('quantity', 0)} units "
                f"(Min: {item.get('min_stock', 0)})"
            )
        return "\n".join(formatted)
    
    def _format_sales_history(self, history: List[Dict]) -> str:
        """Format sales history for prompt"""
        if not history:
            return "No sales history"
        
        formatted = []
        for sale in history[:30]:  # Last 30 entries
            formatted.append(
                f"- {sale.get('date', 'N/A')}: "
                f"{sale.get('product_name', 'Unknown')} - "
                f"{sale.get('quantity', 0)} units"
            )
        return "\n".join(formatted)

