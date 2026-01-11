"""
The Local Loop - AI Agents Service
Main entry point for the AI autonomous agents system
Powered by Google Vertex AI (Gemini 2.0 Flash)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Import AI Agents
from agents.customer_agent import CustomerAgent
from agents.vendor_agent import VendorAgent
from agents.delivery_agent import DeliveryAgent
from agents.area_intelligence_agent import AreaIntelligenceAgent
from agents.location_matcher_agent import LocationMatcherAgent

# Initialize FastAPI app
app = FastAPI(
    title="The Local Loop AI Agents",
    description="AI-powered autonomous agents for hyperlocal commerce using Google Vertex AI",
    version="2.0.0"
)

# CORS middleware - Allow frontend and backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("BACKEND_URL", "http://localhost:5000"),
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Agents
customer_agent = CustomerAgent()
vendor_agent = VendorAgent()
delivery_agent = DeliveryAgent()
area_agent = AreaIntelligenceAgent()
location_matcher = LocationMatcherAgent()

# Pydantic models
class OrderRequest(BaseModel):
    order_id: str
    customer_id: str
    vendor_id: str
    items: List[dict]
    total_amount: float
    delivery_address: str

class DeliveryAssignment(BaseModel):
    order_id: str
    available_partners: List[dict]

class VendorOptimization(BaseModel):
    vendor_id: str
    products: List[dict]

# Health check endpoint
@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "The Local Loop AI Agents Service - Powered by Google Vertex AI",
        "version": "2.0.0",
        "ai_model": "Gemini 2.0 Flash",
        "agents": ["customer", "vendor", "delivery", "area_intelligence"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "agents": {
            "customer_agent": "active",
            "vendor_agent": "active",
            "delivery_agent": "active",
            "area_intelligence": "active"
        },
        "ai_backend": "Google Vertex AI"
    }

# ============================================================================
# CUSTOMER AGENT ENDPOINTS
# ============================================================================

@app.post("/agents/customer/recommendations")
async def get_customer_recommendations(request: Dict[str, Any]):
    """
    Get personalized product recommendations for customer
    """
    try:
        result = await customer_agent.get_personalized_recommendations(
            customer_id=request.get("customer_id"),
            purchase_history=request.get("purchase_history", []),
            current_time=request.get("current_time", datetime.now().isoformat()),
            area_id=request.get("area_id", "")
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/customer/query")
async def answer_customer_query(request: Dict[str, Any]):
    """
    Answer customer questions using AI
    """
    try:
        result = await customer_agent.answer_customer_query(
            query=request.get("query"),
            context=request.get("context", {})
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/customer/predict-needs")
async def predict_customer_needs(request: Dict[str, Any]):
    """
    Predict what customer might need next
    """
    try:
        result = await customer_agent.predict_customer_needs(
            customer_id=request.get("customer_id"),
            behavior_data=request.get("behavior_data", {})
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# VENDOR AGENT ENDPOINTS
# ============================================================================

@app.post("/agents/vendor/pricing-optimization")
async def optimize_vendor_pricing(request: Dict[str, Any]):
    """
    AI-powered pricing optimization for vendors
    """
    try:
        result = await vendor_agent.optimize_pricing(
            vendor_id=request.get("vendor_id", ""),
            products=request.get("products", []),
            market_data=request.get("market_data", {})
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/vendor/inventory-management")
async def manage_vendor_inventory(request: Dict[str, Any]):
    """
    AI-powered inventory management suggestions
    """
    try:
        result = await vendor_agent.inventory_management(
            vendor_id=request.get("vendor_id", ""),
            inventory=request.get("inventory", []),
            sales_history=request.get("sales_history", [])
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/vendor/business-insights")
async def get_vendor_insights(request: Dict[str, Any]):
    """
    Generate business insights for vendors
    """
    try:
        result = await vendor_agent.business_insights(
            vendor_id=request.get("vendor_id", ""),
            performance_data=request.get("performance_data", {})
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/vendor/demand-prediction")
async def predict_product_demand(request: Dict[str, Any]):
    """
    Predict future demand for products
    """
    try:
        result = await vendor_agent.demand_prediction(
            vendor_id=request.get("vendor_id", ""),
            product_id=request.get("product_id", ""),
            historical_data=request.get("historical_data", [])
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# DELIVERY AGENT ENDPOINTS
# ============================================================================

@app.post("/agents/delivery/assignment")
async def assign_delivery_partner(request: Dict[str, Any]):
    """
    AI-powered delivery partner assignment
    """
    try:
        result = await delivery_agent.optimize_delivery_assignment(
            order_id=request.get("order_id", ""),
            pickup_location=request.get("pickup_location", {}),
            delivery_location=request.get("delivery_location", {}),
            available_partners=request.get("available_partners", [])
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/delivery/route-optimization")
async def optimize_delivery_route(request: Dict[str, Any]):
    """
    Optimize delivery route for multiple orders
    """
    try:
        result = await delivery_agent.optimize_route(
            partner_id=request.get("partner_id", ""),
            current_location=request.get("current_location", {}),
            pending_deliveries=request.get("pending_deliveries", [])
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/delivery/time-prediction")
async def predict_delivery_time(request: Dict[str, Any]):
    """
    Predict accurate delivery time
    """
    try:
        result = await delivery_agent.predict_delivery_time(
            pickup_location=request.get("pickup_location", {}),
            delivery_location=request.get("delivery_location", {}),
            current_time=request.get("current_time", datetime.now().isoformat()),
            traffic_data=request.get("traffic_data", {})
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/delivery/performance-analysis")
async def analyze_partner_performance(request: Dict[str, Any]):
    """
    Analyze delivery partner performance
    """
    try:
        result = await delivery_agent.partner_performance_analysis(
            partner_id=request.get("partner_id", ""),
            performance_data=request.get("performance_data", {})
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/delivery/issue-resolution")
async def resolve_delivery_issue(request: Dict[str, Any]):
    """
    AI-powered delivery issue resolution
    """
    try:
        result = await delivery_agent.handle_delivery_issue(
            issue_type=request.get("issue_type", ""),
            issue_details=request.get("issue_details", {})
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# AREA INTELLIGENCE AGENT ENDPOINTS
# ============================================================================

@app.post("/agents/area-validation")
async def validate_service_area(request: Dict[str, Any]):
    """
    Validate if address is in serviceable area using AI
    """
    try:
        result = await area_agent.validate_area(
            address=request.get("address", ""),
            pincode=request.get("pincode", ""),
            city=request.get("city", "")
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/area/expansion-analysis")
async def analyze_area_expansion(request: Dict[str, Any]):
    """
    Analyze potential for area expansion
    """
    try:
        result = await area_agent.suggest_area_expansion(
            new_address=request.get("new_address", ""),
            demand_data=request.get("demand_data", {})
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/area/parse-address")
async def parse_address(request: Dict[str, Any]):
    """
    Parse unstructured address into components
    """
    try:
        result = await area_agent.parse_address_components(
            address=request.get("address", "")
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# LOCATION MATCHER AGENT ENDPOINTS (5KM RADIUS MATCHING)
# ============================================================================

@app.post("/agents/location/nearby-vendors")
async def get_nearby_vendors(request: Dict[str, Any]):
    """
    Get vendors within 5km radius of customer location
    """
    try:
        result = await location_matcher.get_nearby_vendors(
            customer_location=request.get("customer_location", {}),
            all_vendors=request.get("all_vendors", [])
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/location/nearby-delivery-partners")
async def get_nearby_delivery_partners(request: Dict[str, Any]):
    """
    Get delivery partners within 5km radius of pickup location
    """
    try:
        result = await location_matcher.get_nearby_delivery_partners(
            pickup_location=request.get("pickup_location", {}),
            all_partners=request.get("all_partners", [])
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/location/validate-coverage")
async def validate_service_coverage(request: Dict[str, Any]):
    """
    Validate that customer, vendor, and delivery partner are within service area
    """
    try:
        result = await location_matcher.validate_service_coverage(
            customer_location=request.get("customer_location", {}),
            vendor_location=request.get("vendor_location", {}),
            delivery_partner_location=request.get("delivery_partner_location", {})
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/location/area-statistics")
async def get_area_statistics(request: Dict[str, Any]):
    """
    Get statistics about vendors, customers, and delivery partners in an area
    """
    try:
        result = await location_matcher.get_area_statistics(
            center_location=request.get("center_location", {}),
            all_vendors=request.get("all_vendors", []),
            all_customers=request.get("all_customers", []),
            all_delivery_partners=request.get("all_delivery_partners", [])
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/location/calculate-distance")
async def calculate_distance(request: Dict[str, Any]):
    """
    Calculate distance between two locations using Haversine formula
    """
    try:
        loc1 = request.get("location1", {})
        loc2 = request.get("location2", {})
        
        distance = location_matcher.calculate_distance(
            loc1.get("lat", 0),
            loc1.get("lng", 0),
            loc2.get("lat", 0),
            loc2.get("lng", 0)
        )
        
        within_service_area = distance <= location_matcher.service_radius_km
        
        return {
            "success": True,
            "data": {
                "distance_km": distance,
                "within_service_area": within_service_area,
                "service_radius_km": location_matcher.service_radius_km
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# SERVER STARTUP
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"""
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🤖 The Local Loop AI Agents Service                ║
║                                                       ║
║   Server running on: http://{host}:{port}            ║
║   Environment: {os.getenv('ENVIRONMENT', 'development')}                      ║
║                                                       ║
║   AI Agents Ready! 🚀                                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(app, host=host, port=port)
