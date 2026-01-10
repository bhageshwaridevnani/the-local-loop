#!/bin/bash

# The Local Loop - Installation Script
# This script automates the setup process for all team members

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   🏪 The Local Loop - Installation Script           ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Print colored message
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

if command_exists python3; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python installed: $PYTHON_VERSION"
else
    print_error "Python is not installed. Please install Python 3.11+ from https://www.python.org/"
    exit 1
fi

if command_exists psql; then
    print_success "PostgreSQL is installed"
else
    print_error "PostgreSQL is not installed. Please install PostgreSQL 15+ from https://www.postgresql.org/"
    exit 1
fi

echo ""
print_info "All prerequisites met!"
echo ""

# Ask for database credentials
echo "═══════════════════════════════════════════════════════"
echo "Database Configuration"
echo "═══════════════════════════════════════════════════════"
read -p "Enter PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Enter PostgreSQL password: " DB_PASSWORD
echo ""

read -p "Enter database name (default: localloop): " DB_NAME
DB_NAME=${DB_NAME:-localloop}

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"

echo ""
print_info "Database URL: postgresql://${DB_USER}:****@localhost:5432/${DB_NAME}"
echo ""

# Ask for OpenAI API key
echo "═══════════════════════════════════════════════════════"
echo "AI Configuration"
echo "═══════════════════════════════════════════════════════"
read -p "Enter OpenAI API Key (or press Enter to skip): " OPENAI_KEY
echo ""

# Create database
echo "═══════════════════════════════════════════════════════"
echo "Creating database..."
echo "═══════════════════════════════════════════════════════"
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || print_info "Database already exists"
print_success "Database ready"
echo ""

# Setup Backend
echo "═══════════════════════════════════════════════════════"
echo "Setting up Backend..."
echo "═══════════════════════════════════════════════════════"
cd backend

print_info "Installing backend dependencies..."
npm install

print_info "Creating .env file..."
cat > .env << EOF
PORT=5000
NODE_ENV=development
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
AI_AGENT_URL=http://localhost:8000
EOF

print_success "Backend .env created"

print_info "Running database migrations..."
npx prisma migrate dev --name init

print_info "Generating Prisma client..."
npx prisma generate

print_success "Backend setup complete!"
cd ..
echo ""

# Setup Frontend
echo "═══════════════════════════════════════════════════════"
echo "Setting up Frontend..."
echo "═══════════════════════════════════════════════════════"
cd frontend

print_info "Installing frontend dependencies..."
npm install

print_info "Creating .env file..."
cat > .env << EOF
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
EOF

print_success "Frontend setup complete!"
cd ..
echo ""

# Setup AI Agents
echo "═══════════════════════════════════════════════════════"
echo "Setting up AI Agents..."
echo "═══════════════════════════════════════════════════════"
cd ai-agents

print_info "Creating Python virtual environment..."
python3 -m venv venv

print_info "Activating virtual environment..."
source venv/bin/activate

print_info "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

print_info "Creating .env file..."
cat > .env << EOF
OPENAI_API_KEY=${OPENAI_KEY}
DATABASE_URL=${DATABASE_URL}
BACKEND_URL=http://localhost:5000
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
EOF

print_success "AI Agents setup complete!"
cd ..
echo ""

# Create start script
echo "═══════════════════════════════════════════════════════"
echo "Creating start scripts..."
echo "═══════════════════════════════════════════════════════"

cat > start-all.sh << 'EOF'
#!/bin/bash

echo "Starting all services..."

# Start backend
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Start AI agents
cd ai-agents
source venv/bin/activate
python main.py &
AI_PID=$!
cd ..

echo ""
echo "All services started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "AI Agents PID: $AI_PID"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID $AI_PID; exit" INT
wait
EOF

chmod +x start-all.sh

print_success "Start script created: ./start-all.sh"
echo ""

# Installation complete
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   ✅ Installation Complete!                          ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Start all services:"
echo "   ./start-all.sh"
echo ""
echo "Or start services individually:"
echo ""
echo "2. Start Backend:"
echo "   cd backend && npm run dev"
echo ""
echo "3. Start Frontend (new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Start AI Agents (new terminal):"
echo "   cd ai-agents && source venv/bin/activate && python main.py"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  AI Agents: http://localhost:8000"
echo ""
print_success "Happy coding! 🚀"

