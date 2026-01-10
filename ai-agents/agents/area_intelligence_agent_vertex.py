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

