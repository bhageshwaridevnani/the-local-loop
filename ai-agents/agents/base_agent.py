"""
Base Agent Class
Provides common functionality for all AI agents using Google Vertex AI
"""

import os
import json
from typing import Dict, Any, Optional
from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel, GenerationConfig
import vertexai


class BaseAgent:
    """Base class for all AI agents"""
    
    def __init__(self, agent_name: str):
        """
        Initialize the base agent with Vertex AI
        
        Args:
            agent_name: Name of the agent for logging
        """
        self.agent_name = agent_name
        self.project_id = os.getenv("GCP_PROJECT_ID", "the-local-loop")
        self.location = os.getenv("GCP_LOCATION", "us-central1")
        self.model_name = os.getenv("MODEL_NAME", "gemini-2.0-flash-exp")
        
        # Initialize Vertex AI
        try:
            vertexai.init(project=self.project_id, location=self.location)
            self.model = GenerativeModel(self.model_name)
            print(f"✅ {agent_name} initialized with Vertex AI")
        except Exception as e:
            print(f"⚠️  Warning: Could not initialize Vertex AI for {agent_name}: {e}")
            print(f"   Agent will run in mock mode")
            self.model = None
    
    async def generate_response(
        self, 
        prompt: str, 
        temperature: float = 0.7,
        max_tokens: int = 1024
    ) -> str:
        """
        Generate AI response using Vertex AI
        
        Args:
            prompt: The prompt to send to the AI
            temperature: Creativity level (0-1)
            max_tokens: Maximum response length
            
        Returns:
            AI generated response as string
        """
        if not self.model:
            return self._mock_response(prompt)
        
        try:
            generation_config = GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
            
            response = await self.model.generate_content_async(
                prompt,
                generation_config=generation_config
            )
            
            return response.text
        except Exception as e:
            print(f"Error generating response: {e}")
            return self._mock_response(prompt)
    
    def _mock_response(self, prompt: str) -> str:
        """Fallback mock response when AI is not available"""
        return json.dumps({
            "status": "mock",
            "message": "AI service not configured. Using mock response.",
            "agent": self.agent_name
        })
    
    def parse_json_response(self, response: str) -> Dict[str, Any]:
        """
        Parse JSON response from AI
        
        Args:
            response: AI response string
            
        Returns:
            Parsed JSON as dictionary
        """
        try:
            # Try to extract JSON from markdown code blocks
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            else:
                json_str = response.strip()
            
            return json.loads(json_str)
        except Exception as e:
            print(f"Error parsing JSON response: {e}")
            return {
                "error": "Failed to parse AI response",
                "raw_response": response
            }
    
    def create_system_prompt(self, role: str, context: str) -> str:
        """
        Create a system prompt for the agent
        
        Args:
            role: The role/persona of the agent
            context: Additional context for the agent
            
        Returns:
            Formatted system prompt
        """
        return f"""You are {role} for The Local Loop, an AI-powered hyperlocal commerce platform.

{context}

Always respond in valid JSON format.
Be helpful, accurate, and professional.
Consider the hyperlocal context in all recommendations.
"""

