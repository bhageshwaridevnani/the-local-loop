"""
Location Matcher Agent
Matches customers, vendors, and delivery partners based on geographic proximity
Uses 5km radius for service area matching
"""

from typing import Dict, Any, List, Tuple
import math
from .base_agent import BaseAgent


class LocationMatcherAgent(BaseAgent):
    """AI Agent for location-based matching with 5km radius"""
    
    def __init__(self):
        super().__init__("Location Matcher Agent")
        self.service_radius_km = 5.0  # 5km radius
    
    def calculate_distance(
        self,
        lat1: float,
        lon1: float,
        lat2: float,
        lon2: float
    ) -> float:
        """
        Calculate distance between two coordinates using Haversine formula
        
        Args:
            lat1, lon1: First location coordinates
            lat2, lon2: Second location coordinates
            
        Returns:
            Distance in kilometers
        """
        # Earth's radius in kilometers
        R = 6371.0
        
        # Convert degrees to radians
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        # Haversine formula
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = (math.sin(dlat / 2) ** 2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * 
             math.sin(dlon / 2) ** 2)
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        distance = R * c
        return round(distance, 2)
    
    def is_within_service_area(
        self,
        customer_lat: float,
        customer_lon: float,
        target_lat: float,
        target_lon: float
    ) -> bool:
        """
        Check if target location is within 5km service radius
        
        Args:
            customer_lat, customer_lon: Customer location
            target_lat, target_lon: Target (vendor/delivery) location
            
        Returns:
            True if within 5km radius
        """
        distance = self.calculate_distance(
            customer_lat, customer_lon,
            target_lat, target_lon
        )
        return distance <= self.service_radius_km
    
    async def get_nearby_vendors(
        self,
        customer_location: Dict[str, float],
        all_vendors: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Get vendors within 5km radius of customer
        
        Args:
            customer_location: {lat, lng} of customer
            all_vendors: List of all vendors with their locations
            
        Returns:
            Filtered vendors with distance information
        """
        customer_lat = customer_location.get('lat')
        customer_lng = customer_location.get('lng')
        
        if not customer_lat or not customer_lng:
            return {
                "error": "Invalid customer location",
                "nearby_vendors": []
            }
        
        nearby_vendors = []
        
        for vendor in all_vendors:
            # Support both 'lat'/'lng' and 'latitude'/'longitude' formats
            vendor_location = vendor.get('location', {})
            vendor_lat = vendor_location.get('lat') or vendor_location.get('latitude') or vendor.get('latitude') or vendor.get('lat')
            vendor_lng = vendor_location.get('lng') or vendor_location.get('longitude') or vendor.get('longitude') or vendor.get('lng')
            
            if not vendor_lat or not vendor_lng:
                continue
            
            distance = self.calculate_distance(
                customer_lat, customer_lng,
                vendor_lat, vendor_lng
            )
            
            if distance <= self.service_radius_km:
                vendor_info = {
                    **vendor,
                    'distance_km': distance,
                    'within_service_area': True
                }
                nearby_vendors.append(vendor_info)
        
        # Sort by distance (closest first)
        nearby_vendors.sort(key=lambda x: x['distance_km'])
        
        # Use AI to provide insights
        prompt = f"""
You are a location intelligence AI for The Local Loop platform.

**Customer Location:** Lat {customer_lat}, Lng {customer_lng}
**Service Radius:** {self.service_radius_km} km
**Vendors Found:** {len(nearby_vendors)}

**Nearby Vendors:**
{self._format_vendors_for_prompt(nearby_vendors[:10])}

**Task:**
Provide intelligent insights about the vendor availability:
1. Assess vendor density in the area
2. Recommend best vendors based on distance and ratings
3. Suggest if customer should expand search radius

**Response Format (JSON):**
{{
  "area_assessment": "good|moderate|limited",
  "recommended_vendors": ["vendor_id1", "vendor_id2"],
  "insights": "brief insights about vendor availability",
  "suggestions": ["suggestion1", "suggestion2"]
}}

Respond in JSON format.
"""
        
        ai_insights = await self.generate_response(prompt, temperature=0.6)
        parsed_insights = self.parse_json_response(ai_insights)
        
        return {
            "customer_location": customer_location,
            "service_radius_km": self.service_radius_km,
            "total_vendors_found": len(nearby_vendors),
            "nearby_vendors": nearby_vendors,
            "ai_insights": parsed_insights
        }
    
    async def get_nearby_delivery_partners(
        self,
        pickup_location: Dict[str, float],
        all_partners: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Get delivery partners within 5km radius of pickup location
        
        Args:
            pickup_location: {lat, lng} of pickup point
            all_partners: List of all delivery partners
            
        Returns:
            Filtered partners with distance and ETA
        """
        pickup_lat = pickup_location.get('lat')
        pickup_lng = pickup_location.get('lng')
        
        if not pickup_lat or not pickup_lng:
            return {
                "error": "Invalid pickup location",
                "nearby_partners": []
            }
        
        nearby_partners = []
        
        for partner in all_partners:
            # Support both 'lat'/'lng' and 'latitude'/'longitude' formats
            partner_location = partner.get('location', {})
            partner_lat = partner_location.get('lat') or partner_location.get('latitude') or partner.get('latitude') or partner.get('lat')
            partner_lng = partner_location.get('lng') or partner_location.get('longitude') or partner.get('longitude') or partner.get('lng')
            
            if not partner_lat or not partner_lng:
                continue
            
            distance = self.calculate_distance(
                pickup_lat, pickup_lng,
                partner_lat, partner_lng
            )
            
            if distance <= self.service_radius_km:
                # Estimate pickup time (assuming 20 km/h average speed)
                estimated_pickup_time = int((distance / 20) * 60)  # minutes
                
                partner_info = {
                    **partner,
                    'distance_km': distance,
                    'estimated_pickup_time_mins': estimated_pickup_time,
                    'within_service_area': True
                }
                nearby_partners.append(partner_info)
        
        # Sort by distance and availability
        nearby_partners.sort(key=lambda x: (
            x.get('active_orders', 0),  # Prefer partners with fewer orders
            x['distance_km']  # Then by distance
        ))
        
        return {
            "pickup_location": pickup_location,
            "service_radius_km": self.service_radius_km,
            "total_partners_found": len(nearby_partners),
            "nearby_partners": nearby_partners,
            "recommendation": nearby_partners[0] if nearby_partners else None
        }
    
    async def validate_service_coverage(
        self,
        customer_location: Dict[str, float],
        vendor_location: Dict[str, float],
        delivery_partner_location: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Validate that customer, vendor, and delivery partner are all within service area
        
        Args:
            customer_location: Customer coordinates
            vendor_location: Vendor coordinates
            delivery_partner_location: Delivery partner coordinates
            
        Returns:
            Validation result with distances
        """
        # Calculate all distances
        customer_to_vendor = self.calculate_distance(
            customer_location['lat'], customer_location['lng'],
            vendor_location['lat'], vendor_location['lng']
        )
        
        vendor_to_delivery = self.calculate_distance(
            vendor_location['lat'], vendor_location['lng'],
            delivery_partner_location['lat'], delivery_partner_location['lng']
        )
        
        delivery_to_customer = self.calculate_distance(
            delivery_partner_location['lat'], delivery_partner_location['lng'],
            customer_location['lat'], customer_location['lng']
        )
        
        # Check if all within service area
        customer_vendor_ok = customer_to_vendor <= self.service_radius_km
        vendor_delivery_ok = vendor_to_delivery <= self.service_radius_km
        delivery_customer_ok = delivery_to_customer <= self.service_radius_km
        
        all_within_area = customer_vendor_ok and vendor_delivery_ok and delivery_customer_ok
        
        # Estimate total delivery time
        # Pickup time + delivery time (assuming 20 km/h)
        pickup_time = int((vendor_to_delivery / 20) * 60)
        delivery_time = int((delivery_to_customer / 20) * 60)
        total_time = pickup_time + delivery_time + 5  # +5 mins for pickup
        
        return {
            "service_coverage_valid": all_within_area,
            "distances": {
                "customer_to_vendor_km": customer_to_vendor,
                "vendor_to_delivery_partner_km": vendor_to_delivery,
                "delivery_partner_to_customer_km": delivery_to_customer
            },
            "within_service_area": {
                "customer_vendor": customer_vendor_ok,
                "vendor_delivery": vendor_delivery_ok,
                "delivery_customer": delivery_customer_ok
            },
            "estimated_times": {
                "pickup_time_mins": pickup_time,
                "delivery_time_mins": delivery_time,
                "total_time_mins": total_time
            },
            "service_radius_km": self.service_radius_km
        }
    
    async def get_area_statistics(
        self,
        center_location: Dict[str, float],
        all_vendors: List[Dict],
        all_customers: List[Dict],
        all_delivery_partners: List[Dict]
    ) -> Dict[str, Any]:
        """
        Get statistics about a specific area
        
        Args:
            center_location: Center point of area
            all_vendors: All vendors in system
            all_customers: All customers in system
            all_delivery_partners: All delivery partners in system
            
        Returns:
            Area statistics and insights
        """
        center_lat = center_location['lat']
        center_lng = center_location['lng']
        
        # Count entities within 5km radius
        vendors_in_area = sum(
            1 for v in all_vendors
            if self.is_within_service_area(
                center_lat, center_lng,
                v.get('latitude', 0), v.get('longitude', 0)
            )
        )
        
        customers_in_area = sum(
            1 for c in all_customers
            if self.is_within_service_area(
                center_lat, center_lng,
                c.get('latitude', 0), c.get('longitude', 0)
            )
        )
        
        partners_in_area = sum(
            1 for p in all_delivery_partners
            if self.is_within_service_area(
                center_lat, center_lng,
                p.get('latitude', 0), p.get('longitude', 0)
            )
        )
        
        # Use AI for insights
        prompt = f"""
You are analyzing area statistics for The Local Loop platform.

**Area Center:** Lat {center_lat}, Lng {center_lng}
**Service Radius:** {self.service_radius_km} km

**Statistics:**
- Vendors in area: {vendors_in_area}
- Customers in area: {customers_in_area}
- Delivery Partners in area: {partners_in_area}

**Task:**
Provide insights about this area:
1. Assess market saturation
2. Identify gaps (need more vendors/partners?)
3. Recommend actions

**Response Format (JSON):**
{{
  "area_health": "excellent|good|needs_improvement",
  "vendor_density": "high|medium|low",
  "delivery_coverage": "excellent|adequate|insufficient",
  "recommendations": ["rec1", "rec2"],
  "growth_potential": "high|medium|low"
}}

Respond in JSON format.
"""
        
        ai_insights = await self.generate_response(prompt, temperature=0.6)
        parsed_insights = self.parse_json_response(ai_insights)
        
        return {
            "area_center": center_location,
            "service_radius_km": self.service_radius_km,
            "statistics": {
                "vendors": vendors_in_area,
                "customers": customers_in_area,
                "delivery_partners": partners_in_area
            },
            "ai_insights": parsed_insights
        }
    
    def _format_vendors_for_prompt(self, vendors: List[Dict]) -> str:
        """Format vendors for AI prompt"""
        if not vendors:
            return "No vendors found"
        
        formatted = []
        for v in vendors:
            formatted.append(
                f"- {v.get('name', 'Unknown')} "
                f"({v.get('distance_km', 0)} km away, "
                f"Rating: {v.get('rating', 0)}/5)"
            )
        return "\n".join(formatted)

