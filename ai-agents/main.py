from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import agents - Priority: Vertex AI > Gemini > OpenAI
if os.getenv("GCP_PROJECT_ID"):
    print("🤖 Using Google Vertex AI (GCP)")
    print(f"✅ GCP Project: {os.getenv('GCP_PROJECT_ID')}")
    print(f"✅ Location: {os.getenv('GCP_LOCATION', 'us-central1')}")
    from agents.area_intelligence_agent_vertex import AreaIntelligenceAgentVertex as AreaIntelligenceAgent
elif os.getenv("GEMINI_API_KEY"):
    print("🤖 Using Google Gemini AI")
    from agents.area_intelligence_agent_gemini import AreaIntelligenceAgent
elif os.getenv("OPENAI_API_KEY"):
    print("🤖 Using OpenAI GPT-4o")
    from agents.area_intelligence_agent import AreaIntelligenceAgent
else:
    print("⚠️  No API key found. Please set GCP_PROJECT_ID, GEMINI_API_KEY, or OPENAI_API_KEY in .env file")
    # Use a dummy agent for testing
    class AreaIntelligenceAgent:
        async def validate_area(self, address, pincode, city, coordinates=None):
            return {
                "status": "approved",
                "confidence": 0.85,
                "message": "Demo mode - Area validation bypassed",
                "area_name": "Demo Area",
                "reasoning": "No API key configured",
                "scores": {"pincode": 0.85, "address": 0.85, "geolocation": 0.85}
            }

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
    api_status = "Gemini" if os.getenv("GEMINI_API_KEY") else "OpenAI" if os.getenv("OPENAI_API_KEY") else "Demo Mode"
    return {
        "status": "success",
        "message": "The Local Loop AI Agents API",
        "version": "1.0.0",
        "ai_provider": api_status
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
        print(f"Error in area validation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("🚀 Starting The Local Loop AI Agents Service")
    print("="*50)
    if os.getenv("GEMINI_API_KEY"):
        print("✅ Google Gemini API Key found")
    elif os.getenv("OPENAI_API_KEY"):
        print("✅ OpenAI API Key found")
    else:
        print("⚠️  No API key found - Running in demo mode")
        print("   Set GEMINI_API_KEY or OPENAI_API_KEY in .env file")
    print("="*50 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)

