#!/bin/bash

echo "🚀 Starting The Local Loop (Without AI Agents)"
echo "=============================================="
echo ""

# Add Node.js to PATH
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found in PATH"
    echo "Please install Node.js or add it to PATH"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "🎯 Starting services..."
echo ""
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Start backend
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!


