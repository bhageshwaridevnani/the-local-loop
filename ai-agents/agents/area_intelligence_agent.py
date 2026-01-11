"""
Area Intelligence Agent
AI agent for area validation, address parsing, and location intelligence
"""

from typing import Dict, Any
from .base_agent import BaseAgent


class AreaIntelligenceAgent(BaseAgent):
    """AI Agent for area and location intelligence"""
    
    def __init__(self):
        super().__init__("Area Intelligence Agent")
    
    async def validate_area(
        self,
        address: str,
        pincode: str,
        city: str
    ) -> Dict[str, Any]:
        """
        Validate if address is in serviceable area using AI
        
        Args:
            address: Full address
            pincode: Postal code
            city: City name
            
        Returns:
            Validation result with area assignment
        """
        prompt = f"""
You are an intelligent area validation system for The Local Loop hyperlocal platform.

**Service Areas:**
- Ahmedabad, Gujarat, India
- Covered Pincodes: 382481, 382424, 382470, 380015, 380052
- Covered Localities: Gota, Chandkheda, Satellite, Bodakdev, Vastrapur

**Address to Validate:**
- Address: {address}
- Pincode: {pincode}
- City: {city}

**Task:**
Analyze the address and determine:
1. Extract latitude and longitude coordinates (approximate)
2. Identify the specific locality
3. Verify if pincode matches our service area
4. Calculate confidence score (0-1)
5. Assign to appropriate area

**Scoring Criteria:**
- Pincode match: 40%
- Locality recognition: 30%
- City match: 20%
- Address format quality: 10%

**Decision Rules:**
- Score >= 0.8: APPROVED (immediate service)
- Score 0.5-0.8: PENDING (manual review needed)
- Score < 0.5: REJECTED (outside service area)

**Response Format (JSON):**
{{
  "status": "approved|pending|rejected",
  "area_id": 1,
  "area_name": "Ahmedabad - Gota",
  "locality": "extracted locality name",
  "latitude": 23.1167,
  "longitude": 72.5667,
  "confidence_score": 0.95,
  "pincode_match": true,
  "city_match": true,
  "message": "Address validated successfully",
  "reasoning": "why this decision was made"
}}

Analyze and respond in JSON format only.
"""
        
        response = await self.generate_response(prompt, temperature=0.3)
        return self.parse_json_response(response)
    
    async def suggest_area_expansion(
        self,
        new_address: str,
        demand_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze potential for area expansion
        
        Args:
            new_address: Address outside current service area
            demand_data: Demand metrics for the area
            
        Returns:
            Expansion recommendation
        """
        prompt = f"""
You are helping expand The Local Loop service area intelligently.

**Current Service Areas:**
- Ahmedabad - Gota (382481)
- Ahmedabad - Chandkheda (382424)
- Ahmedabad - Satellite (380015)

**New Address Request:**
{new_address}

**Demand Data:**
- Requests from area: {demand_data.get('request_count', 0)}
- Estimated population: {demand_data.get('population', 'unknown')}
- Commercial density: {demand_data.get('commercial_density', 'medium')}

**Task:**
Analyze and recommend:
1. Identify the locality and pincode
2. Calculate distance from nearest service area
3. Assess demand potential
4. Recommend expansion priority

**Response Format (JSON):**
{{
  "locality": "identified locality",
  "pincode": "extracted pincode",
  "distance_from_nearest": 5.2,
  "expansion_priority": "high|medium|low",
  "estimated_users": 1000,
  "estimated_vendors": 50,
  "infrastructure_readiness": "good|moderate|poor",
  "recommendation": "detailed recommendation",
  "estimated_setup_time": "2 weeks",
  "potential_revenue": "₹50,000/month"
}}

Provide strategic expansion analysis in JSON format.
"""
        
        response = await self.generate_response(prompt, temperature=0.6)
        return self.parse_json_response(response)
    
    async def parse_address_components(
        self,
        address: str
    ) -> Dict[str, Any]:
        """
        Parse address into structured components using AI
        
        Args:
            address: Unstructured address string
            
        Returns:
            Structured address components
        """
        prompt = f"""
You are an address parsing AI.

**Address to Parse:**
{address}

**Task:**
Extract and structure the address components:
1. Street/House number
2. Locality/Area
3. Landmark (if any)
4. City
5. State
6. Pincode
7. Approximate coordinates

**Response Format (JSON):**
{{
  "house_number": "extracted house/flat number",
  "street": "street name",
  "locality": "locality/area name",
  "landmark": "nearby landmark",
  "city": "city name",
  "state": "state name",
  "pincode": "postal code",
  "country": "India",
  "formatted_address": "properly formatted address",
  "coordinates": {{
    "latitude": 23.1167,
    "longitude": 72.5667,
    "accuracy": "approximate|precise"
  }}
}}

Parse and respond in JSON format.
"""
        
        response = await self.generate_response(prompt, temperature=0.4)
        return self.parse_json_response(response)
    
    async def calculate_service_radius(
        self,
        area_center: Dict[str, float],
        vendor_locations: list,
        customer_density: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate optimal service radius for an area
        
        Args:
            area_center: Center coordinates of area
            vendor_locations: List of vendor locations
            customer_density: Customer distribution data
            
        Returns:
            Optimal service radius recommendation
        """
        prompt = f"""
You are a service area optimization AI.

**Area Center:**
- Latitude: {area_center.get('lat')}
- Longitude: {area_center.get('lng')}

**Vendor Distribution:**
- Total Vendors: {len(vendor_locations)}
- Average Distance: {customer_density.get('avg_vendor_distance', 'N/A')} km

**Customer Density:**
- High Density Zones: {customer_density.get('high_density_zones', [])}
- Medium Density Zones: {customer_density.get('medium_density_zones', [])}
- Low Density Zones: {customer_density.get('low_density_zones', [])}

**Task:**
Calculate optimal service radius considering:
1. Vendor coverage
2. Customer density
3. Delivery time constraints (max 30 mins)
4. Competition coverage

**Response Format (JSON):**
{{
  "recommended_radius_km": 5.0,
  "min_radius_km": 3.0,
  "max_radius_km": 7.0,
  "coverage_percentage": 85,
  "estimated_customers": 5000,
  "estimated_vendors": 150,
  "delivery_time_estimate": 25,
  "reasoning": "why this radius is optimal"
}}

Provide recommendation in JSON format.
"""
        
        response = await self.generate_response(prompt, temperature=0.5)
        return self.parse_json_response(response)

