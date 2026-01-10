from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import agents
from agents.area_intelligence_agent import AreaIntelligenceAgent

app = FastAPI(title="The Local Loop - AI Agents", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents
area_agent = AreaIntelligenceAgent()

# Request models
class AreaValidationRequest(BaseModel):
    address: str
    pincode: str
    city: str
    coordinates: Optional[dict] = None

# Health check
@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "The Local Loop AI Agents API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-agents"}

# Area validation endpoint
@app.post("/agents/area-validation")
async def validate_area(request: AreaValidationRequest):
    """
    Validate if the user's address is in Area 1 (service area)
    Uses AI to analyze address similarity, pincode, and geolocation
    """
    try:
        result = await area_agent.validate_area(
            address=request.address,
            pincode=request.pincode,
            city=request.city,
            coordinates=request.coordinates
        )
        
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Made with Bob
