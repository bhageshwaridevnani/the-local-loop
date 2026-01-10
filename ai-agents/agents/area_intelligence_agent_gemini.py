import os
import google.generativeai as genai
from typing import Optional, Dict
import json

class AreaIntelligenceAgent:
    """
    Area Intelligence Agent (Google Gemini Version)
    
    Purpose:
    - Validates whether user belongs to Area 1 (service area)
    - Prevents cross-area ordering
    
    AI Logic:
    - Uses address similarity analysis
    - Pincode matching (40% weight)
    - Address text similarity (30% weight)
    - Geolocation clustering (30% weight)
    """
    
    def __init__(self):
        # Configure Gemini
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Define Area 1 (Service Area) - ALL OF AHMEDABAD
        self.area_1_config = {
            "name": "Ahmedabad",
            "city": "Ahmedabad",
            "pincodes": [
                # All major Ahmedabad pincodes
                "380001", "380002", "380003", "380004", "380005", "380006", "380007", "380008", "380009",
                "380013", "380014", "380015", "380016", "380018", "380019", "380021", "380022", "380023",
                "380024", "380025", "380026", "380027", "380028", "380050", "380051", "380052", "380053",
                "380054", "380055", "380058", "380059", "380060", "380061", "380063", "382110", "382115",
                "382120", "382130", "382140", "382150", "382170", "382210", "382213", "382220", "382230",
                "382240", "382250", "382260", "382305", "382315", "382320", "382325", "382330", "382340",
                "382345", "382350", "382355", "382405", "382410", "382415", "382418", "382421", "382424",
                "382425", "382427", "382428", "382430", "382433", "382435", "382440", "382443", "382445",
                "382449", "382450", "382455", "382460", "382465", "382470", "382475", "382480", "382481"
            ],
            "landmarks": [
                # Major landmarks across Ahmedabad
                "Sabarmati Ashram", "Kankaria Lake", "Sardar Patel Stadium", "ISRO", "IIM Ahmedabad",
                "Manek Chowk", "Law Garden", "CG Road", "SG Highway", "Ashram Road", "Paldi", "Vastrapur",
                "Satellite", "Bodakdev", "Thaltej", "Gota", "Chandkheda", "Motera", "Naroda", "Nikol",
                "Vastral", "Odhav", "Narol", "Vatva", "Maninagar", "Isanpur", "Bapunagar", "Saraspur"
            ],
            "boundaries": {
                "description": "Entire Ahmedabad city limits"
            }
        }
    
    async def validate_area(
        self,
        address: str,
        pincode: str,
        city: str,
        coordinates: Optional[Dict] = None
    ) -> Dict:
        """
        Validate if the address is in Area 1 using AI
        
        Returns:
        {
            "status": "approved" | "rejected" | "uncertain",
            "confidence": 0.0-1.0,
            "message": str,
            "area_name": str,
            "reasoning": str
        }
        """
        
        # Step 1: Pincode validation (40% weight)
        pincode_score = self._validate_pincode(pincode)
        
        # Step 2: AI-powered address similarity (30% weight)
        address_score = await self._validate_address_similarity(address, city)
        
        # Step 3: Geolocation validation (30% weight) - if coordinates provided
        geo_score = 0.5  # Default neutral score
        if coordinates:
            geo_score = self._validate_geolocation(coordinates)
        
        # Calculate final confidence score
        confidence = (
            pincode_score * 0.4 +
            address_score * 0.3 +
            geo_score * 0.3
        )
        
        # Determine status based on confidence
        if confidence >= 0.75:
            status = "approved"
            message = f"Great! You're in {self.area_1_config['name']}. We deliver to your area!"
        elif confidence >= 0.4:
            status = "uncertain"
            message = "We need to manually verify your location. Our team will contact you."
        else:
            status = "rejected"
            message = f"Sorry, we currently only serve {self.area_1_config['name']}. We'll expand soon!"
        
        return {
            "status": status,
            "confidence": round(confidence, 2),
            "message": message,
            "area_name": self.area_1_config["name"],
            "reasoning": f"Pincode: {pincode_score:.2f}, Address: {address_score:.2f}, Geo: {geo_score:.2f}",
            "scores": {
                "pincode": round(pincode_score, 2),
                "address": round(address_score, 2),
                "geolocation": round(geo_score, 2)
            }
        }
    
    def _validate_pincode(self, pincode: str) -> float:
        """
        Validate pincode against Area 1 pincodes
        Returns score 0.0-1.0
        """
        if pincode in self.area_1_config["pincodes"]:
            return 1.0
        
        # Check if pincode is nearby (first 4 digits match)
        for valid_pincode in self.area_1_config["pincodes"]:
            if pincode[:4] == valid_pincode[:4]:
                return 0.6
        
        return 0.0
    
    async def _validate_address_similarity(self, address: str, city: str) -> float:
        """
        Use Gemini AI to analyze address similarity with Area 1
        Returns score 0.0-1.0
        """
        try:
            prompt = f"""
You are an area validation expert for a hyperlocal delivery service.

Our Service Area (Area 1): {self.area_1_config['name']}
Known Landmarks: {', '.join(self.area_1_config['landmarks'])}
Boundaries: {json.dumps(self.area_1_config['boundaries'])}

User's Address: {address}, {city}

Task: Analyze if this address is likely within our service area.

Consider:
1. Landmark mentions
2. Street names common in the area
3. Neighborhood indicators
4. City match

Respond with ONLY a JSON object (no markdown, no code blocks):
{{
    "score": 0.0-1.0,
    "reasoning": "brief explanation"
}}

Score Guidelines:
- 1.0: Definitely in Area 1
- 0.7-0.9: Very likely in Area 1
- 0.4-0.6: Possibly in Area 1
- 0.0-0.3: Unlikely in Area 1
"""
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if result_text.startswith('```'):
                result_text = result_text.split('```')[1]
                if result_text.startswith('json'):
                    result_text = result_text[4:]
                result_text = result_text.strip()
            
            result = json.loads(result_text)
            return float(result.get("score", 0.5))
            
        except Exception as e:
            print(f"Gemini AI validation error: {e}")
            return 0.5  # Neutral score on error
    
    def _validate_geolocation(self, coordinates: Dict) -> float:
        """
        Validate coordinates against Area 1 boundaries
        Returns score 0.0-1.0
        
        Note: This is a simplified version. In production, use proper
        geospatial libraries like shapely or geopy
        """
        # Example Area 1 boundaries (Andheri West)
        # In production, use actual polygon boundaries
        area_1_bounds = {
            "lat_min": 19.120,
            "lat_max": 19.145,
            "lon_min": 72.825,
            "lon_max": 72.850
        }
        
        try:
            lat = coordinates.get("latitude")
            lon = coordinates.get("longitude")
            
            if not lat or not lon:
                return 0.5
            
            # Check if within bounds
            if (area_1_bounds["lat_min"] <= lat <= area_1_bounds["lat_max"] and
                area_1_bounds["lon_min"] <= lon <= area_1_bounds["lon_max"]):
                return 1.0
            
            # Calculate distance from center (simplified)
            center_lat = (area_1_bounds["lat_min"] + area_1_bounds["lat_max"]) / 2
            center_lon = (area_1_bounds["lon_min"] + area_1_bounds["lon_max"]) / 2
            
            distance = ((lat - center_lat) ** 2 + (lon - center_lon) ** 2) ** 0.5
            
            # Score based on distance (closer = higher score)
            if distance < 0.01:
                return 0.8
            elif distance < 0.02:
                return 0.5
            else:
                return 0.2
                
        except Exception as e:
            print(f"Geolocation validation error: {e}")
            return 0.5

