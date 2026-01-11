"""
Delivery Agent
AI agent for delivery optimization, route planning, and partner management
"""

from typing import Dict, Any, List
from .base_agent import BaseAgent


class DeliveryAgent(BaseAgent):
    """AI Agent for delivery-related intelligence"""
    
    def __init__(self):
        super().__init__("Delivery Agent")
    
    async def optimize_delivery_assignment(
        self,
        order_id: str,
        pickup_location: Dict[str, float],
        delivery_location: Dict[str, float],
        available_partners: List[Dict]
    ) -> Dict[str, Any]:
        """
        Assign optimal delivery partner using AI
        
        Args:
            order_id: Order ID
            pickup_location: Vendor location {lat, lng}
            delivery_location: Customer location {lat, lng}
            available_partners: List of available delivery partners
            
        Returns:
            Optimal delivery partner assignment
        """
        prompt = f"""
You are a delivery optimization AI for The Local Loop platform.

**Order ID:** {order_id}

**Pickup Location:** 
- Latitude: {pickup_location.get('lat')}
- Longitude: {pickup_location.get('lng')}

**Delivery Location:**
- Latitude: {delivery_location.get('lat')}
- Longitude: {delivery_location.get('lng')}

**Available Delivery Partners:**
{self._format_partners(available_partners)}

**Task:**
Select the optimal delivery partner considering:
1. Distance from pickup location
2. Current workload
3. Performance rating
4. Vehicle type
5. Estimated delivery time

**Response Format (JSON):**
{{
  "selected_partner": {{
    "partner_id": "id",
    "partner_name": "name",
    "distance_from_pickup": 1.5,
    "estimated_pickup_time": 10,
    "estimated_delivery_time": 25,
    "confidence_score": 0.92
  }},
  "reasoning": "why this partner was selected",
  "alternative_partners": [
    {{"partner_id": "id2", "reason": "backup option"}}
  ],
  "delivery_priority": "high|medium|low"
}}

Provide assignment in JSON format.
"""
        
        response = await self.generate_response(prompt, temperature=0.5)
        return self.parse_json_response(response)
    
    async def optimize_route(
        self,
        partner_id: str,
        current_location: Dict[str, float],
        pending_deliveries: List[Dict]
    ) -> Dict[str, Any]:
        """
        Optimize delivery route for multiple orders
        
        Args:
            partner_id: Delivery partner ID
            current_location: Current location of partner
            pending_deliveries: List of pending deliveries
            
        Returns:
            Optimized route plan
        """
        prompt = f"""
You are a route optimization AI for delivery partners.

**Partner ID:** {partner_id}

**Current Location:**
- Latitude: {current_location.get('lat')}
- Longitude: {current_location.get('lng')}

**Pending Deliveries:**
{self._format_deliveries(pending_deliveries)}

**Task:**
Create an optimized delivery route that:
1. Minimizes total distance
2. Respects delivery time windows
3. Considers traffic patterns
4. Prioritizes urgent deliveries

**Response Format (JSON):**
{{
  "optimized_route": [
    {{
      "order_id": "id",
      "sequence": 1,
      "address": "address",
      "estimated_arrival": "10:30 AM",
      "priority": "high|medium|low"
    }}
  ],
  "total_distance": 8.5,
  "estimated_total_time": 45,
  "fuel_efficiency": "optimized",
  "route_summary": "brief description of route"
}}

Provide route in JSON format.
"""
        
        response = await self.generate_response(prompt, temperature=0.4)
        return self.parse_json_response(response)
    
    async def predict_delivery_time(
        self,
        pickup_location: Dict[str, float],
        delivery_location: Dict[str, float],
        current_time: str,
        traffic_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Predict accurate delivery time using AI
        
        Args:
            pickup_location: Pickup coordinates
            delivery_location: Delivery coordinates
            current_time: Current time
            traffic_data: Real-time traffic information
            
        Returns:
            Delivery time prediction
        """
        prompt = f"""
You are a delivery time prediction AI.

**Pickup Location:** Lat {pickup_location.get('lat')}, Lng {pickup_location.get('lng')}
**Delivery Location:** Lat {delivery_location.get('lat')}, Lng {delivery_location.get('lng')}
**Current Time:** {current_time}

**Traffic Conditions:**
- Overall traffic: {traffic_data.get('traffic_level', 'moderate')}
- Peak hour: {traffic_data.get('is_peak_hour', False)}
- Weather: {traffic_data.get('weather', 'clear')}

**Task:**
Predict delivery time considering:
1. Distance between locations
2. Current traffic conditions
3. Time of day
4. Weather conditions
5. Historical delivery data

**Response Format (JSON):**
{{
  "estimated_pickup_time": 8,
  "estimated_delivery_time": 25,
  "total_time": 33,
  "confidence": 0.88,
  "factors": ["traffic", "distance", "time_of_day"],
  "time_range": {{
    "min": 28,
    "max": 38
  }}
}}

Provide prediction in JSON format.
"""
        
        response = await self.generate_response(prompt, temperature=0.5)
        return self.parse_json_response(response)
    
    async def partner_performance_analysis(
        self,
        partner_id: str,
        performance_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze delivery partner performance and provide insights
        
        Args:
            partner_id: Delivery partner ID
            performance_data: Performance metrics
            
        Returns:
            Performance analysis and recommendations
        """
        prompt = f"""
You are a performance analysis AI for delivery partners.

**Partner ID:** {partner_id}

**Performance Metrics:**
- Total Deliveries: {performance_data.get('total_deliveries', 0)}
- On-Time Rate: {performance_data.get('on_time_rate', 0)}%
- Customer Rating: {performance_data.get('rating', 0)}/5
- Average Delivery Time: {performance_data.get('avg_delivery_time', 0)} mins
- Cancellation Rate: {performance_data.get('cancellation_rate', 0)}%
- Distance Covered: {performance_data.get('distance_covered', 0)} km

**Task:**
Analyze performance and provide:
1. Overall performance assessment
2. Strengths and weaknesses
3. Areas for improvement
4. Training recommendations
5. Incentive suggestions

**Response Format (JSON):**
{{
  "performance_grade": "excellent|good|average|needs_improvement",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvement_areas": [
    {{
      "area": "description",
      "current_score": 75,
      "target_score": 90,
      "recommendations": ["rec1", "rec2"]
    }}
  ],
  "training_suggestions": ["suggestion1", "suggestion2"],
  "incentive_eligibility": true,
  "overall_score": 85
}}

Provide analysis in JSON format.
"""
        
        response = await self.generate_response(prompt, temperature=0.6)
        return self.parse_json_response(response)
    
    async def handle_delivery_issue(
        self,
        issue_type: str,
        issue_details: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Provide AI-powered solutions for delivery issues
        
        Args:
            issue_type: Type of issue (delay, wrong_address, etc.)
            issue_details: Details about the issue
            
        Returns:
            Recommended solutions
        """
        prompt = f"""
You are a delivery issue resolution AI.

**Issue Type:** {issue_type}

**Issue Details:**
{self._format_issue_details(issue_details)}

**Task:**
Provide immediate solutions and recommendations:
1. Assess severity of the issue
2. Suggest immediate actions
3. Provide customer communication template
4. Recommend preventive measures

**Response Format (JSON):**
{{
  "severity": "critical|high|medium|low",
  "immediate_actions": [
    {{
      "action": "description",
      "priority": "urgent|high|normal",
      "responsible": "partner|vendor|support"
    }}
  ],
  "customer_message": "message to send to customer",
  "resolution_time": 15,
  "preventive_measures": ["measure1", "measure2"],
  "escalation_needed": false
}}

Provide solution in JSON format.
"""
        
        response = await self.generate_response(prompt, temperature=0.7)
        return self.parse_json_response(response)
    
    def _format_partners(self, partners: List[Dict]) -> str:
        """Format partners for prompt"""
        if not partners:
            return "No partners available"
        
        formatted = []
        for partner in partners:
            formatted.append(
                f"- {partner.get('name', 'Unknown')} (ID: {partner.get('id', 'N/A')})\n"
                f"  Location: Lat {partner.get('lat', 0)}, Lng {partner.get('lng', 0)}\n"
                f"  Rating: {partner.get('rating', 0)}/5\n"
                f"  Active Orders: {partner.get('active_orders', 0)}\n"
                f"  Vehicle: {partner.get('vehicle_type', 'bike')}"
            )
        return "\n\n".join(formatted)
    
    def _format_deliveries(self, deliveries: List[Dict]) -> str:
        """Format deliveries for prompt"""
        if not deliveries:
            return "No pending deliveries"
        
        formatted = []
        for delivery in deliveries:
            formatted.append(
                f"- Order {delivery.get('order_id', 'N/A')}\n"
                f"  Address: {delivery.get('address', 'Unknown')}\n"
                f"  Priority: {delivery.get('priority', 'normal')}\n"
                f"  Time Window: {delivery.get('time_window', 'flexible')}"
            )
        return "\n\n".join(formatted)
    
    def _format_issue_details(self, details: Dict[str, Any]) -> str:
        """Format issue details for prompt"""
        formatted = []
        for key, value in details.items():
            formatted.append(f"- {key}: {value}")
        return "\n".join(formatted) if formatted else "No additional details"

