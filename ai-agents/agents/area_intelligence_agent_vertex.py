import os
from typing import Dict, Optional
from vertexai.generative_models import GenerativeModel
import vertexai

class AreaIntelligenceAgentVertex:
    """
    Area Intelligence Agent using Google Vertex AI (uses GCP credits)
    Validates if a user's address belongs to the service area
    """
    
    def __init__(self):
        # Initialize Vertex AI with your GCP project
        project_id = os.getenv("GCP_PROJECT_ID")
        location = os.getenv("GCP_LOCATION", "us-central1")
        
        vertexai.init(project=project_id, location=location)
        self.model = GenerativeModel('gemini-2.0-flash-exp')
        
        # Define Area 1 (Service Area) - Ahmedabad, Gujarat
        self.area_1_config = {
            "name": "Gota, Ahmedabad",
            "pincodes": ["382481", "382470", "382424"],
            "landmarks": [
                "Silver Oak University",
                "Gota Gam",
                "Gota Circle",
                "Ognaj",
                "Sargasan"
            ],
            "boundaries": {
                "north": "Vaishnodevi Circle",
                "south": "Sola",
                "east": "Tragad",
                "west": "Ognaj"
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
        Validate if the address belongs to Area 1 using Vertex AI
        
        Returns:
            Dict with status, confidence, message, and reasoning
        """
        try:
            # Multi-factor validation
            scores = {
                "pincode": self._validate_pincode(pincode),
                "address": await self._validate_address_with_ai(address, city),
                "geolocation": self._validate_geolocation(coordinates) if coordinates else 0.5
            }
            
            # Weighted scoring
            total_score = (
                scores["pincode"] * 0.4 +
                scores["address"] * 0.3 +
                scores["geolocation"] * 0.3
            )
            
            # Decision logic
            if total_score >= 0.8:
                status = "approved"
                message = f"Welcome! You're in our service area: {self.area_1_config['name']}"
            elif total_score >= 0.5:
                status = "uncertain"
                message = "We need to manually verify your location. Our team will contact you."
            else:
                status = "rejected"
                message = "Sorry, we're not in your area yet. We'll notify you when we expand!"
            
            return {
                "status": status,
                "confidence": round(total_score, 2),
                "message": message,
                "area_name": self.area_1_config["name"],
                "reasoning": f"Pincode: {scores['pincode']:.2f}, Address: {scores['address']:.2f}, Geo: {scores['geolocation']:.2f}",
                "scores": scores
            }
            
        except Exception as e:
            print(f"Vertex AI validation error: {str(e)}")
            # Fallback to basic validation
            return self._fallback_validation(pincode)
    
    def _validate_pincode(self, pincode: str) -> float:
        """Check if pincode matches service area"""
        return 1.0 if pincode in self.area_1_config["pincodes"] else 0.0
    
    async def _validate_address_with_ai(self, address: str, city: str) -> float:
        """Use Vertex AI to validate address similarity"""
        try:
            prompt = f"""
You are a location validator for {self.area_1_config['name']}.

Service Area Details:
- Name: {self.area_1_config['name']}
- Landmarks: {', '.join(self.area_1_config['landmarks'])}
- Boundaries: {self.area_1_config['boundaries']}

User Address: {address}, {city}

Task: Analyze if this address is likely within our service area.
Consider:
1. Landmark mentions
2. Area name similarity
3. Locality indicators

Respond with ONLY a number between 0.0 and 1.0:
- 1.0 = Definitely in service area
- 0.5 = Uncertain, needs verification
- 0.0 = Definitely outside service area

Response (number only):"""

            response = self.model.generate_content(prompt)
            score_text = response.text.strip()
            
            # Extract number from response
            score = float(score_text)
            return max(0.0, min(1.0, score))
            
        except Exception as e:
            print(f"AI address validation error: {str(e)}")
            # Fallback: check for landmark mentions
            address_lower = address.lower()
            for landmark in self.area_1_config["landmarks"]:
                if landmark.lower() in address_lower:
                    return 0.8
            return 0.3
    
    def _validate_geolocation(self, coordinates: Dict) -> float:
        """Validate based on GPS coordinates (if provided)"""
        if not coordinates or "lat" not in coordinates or "lng" not in coordinates:
            return 0.5
        
        # Gota, Ahmedabad approximate center
        area_center = {"lat": 23.1167, "lng": 72.5667}
        
        # Calculate simple distance (rough approximation)
        lat_diff = abs(coordinates["lat"] - area_center["lat"])
        lng_diff = abs(coordinates["lng"] - area_center["lng"])
        distance = (lat_diff ** 2 + lng_diff ** 2) ** 0.5
        
        # Within ~5km radius
        if distance < 0.05:
            return 1.0
        elif distance < 0.1:
            return 0.7
        else:
            return 0.3
    
    def _fallback_validation(self, pincode: str) -> Dict:
        """Fallback validation when AI fails"""
        if pincode in self.area_1_config["pincodes"]:
            return {
                "status": "uncertain",
                "confidence": 0.7,
                "message": "We need to manually verify your location. Our team will contact you.",
                "area_name": self.area_1_config["name"],
                "reasoning": "Pincode match, but AI validation unavailable",
                "scores": {"pincode": 1.0, "address": 0.5, "geolocation": 0.5}
            }
        else:
            return {
                "status": "rejected",
                "confidence": 0.9,
                "message": "Sorry, we're not in your area yet. We'll notify you when we expand!",
                "area_name": self.area_1_config["name"],
                "reasoning": "Pincode mismatch",
                "scores": {"pincode": 0.0, "address": 0.0, "geolocation": 0.0}
            }

# Made with Bob
