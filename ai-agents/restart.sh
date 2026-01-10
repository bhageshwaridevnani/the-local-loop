#!/bin/bash

echo "🔄 Restarting AI Service with fixed Gemini model..."
echo ""

# Kill any existing python processes running main.py
pkill -f "python.*main.py"

sleep 2

# Start the AI service
cd /Users/bhageshwaridevnani/Documents/the-local-loop/ai-agents
/Library/Developer/CommandLineTools/usr/bin/python3 main.py

