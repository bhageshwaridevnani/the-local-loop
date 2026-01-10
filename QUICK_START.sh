#!/bin/bash

echo "🚀 The Local Loop - Quick Start Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo "1️⃣ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Python
echo ""
echo "2️⃣ Checking Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ Python installed: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}❌ Python not found. Please install Python 3 first.${NC}"
    exit 1
fi

# Check PostgreSQL
echo ""
echo "3️⃣ Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo -e "${GREEN}✅ PostgreSQL installed: $PSQL_VERSION${NC}"
    HAS_POSTGRES=true
else
    echo -e "${YELLOW}⚠️  PostgreSQL not found.${NC}"
    echo ""
    echo "To install PostgreSQL:"
    echo "  macOS:   brew install postgresql@14"
    echo "           brew services start postgresql@14"
    echo ""
    echo "  Linux:   sudo apt-get install postgresql postgresql-contrib"
    echo "           sudo systemctl start postgresql"
    echo ""
    read -p "Do you want to continue without PostgreSQL? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    HAS_POSTGRES=false
fi

# Setup Database
if [ "$HAS_POSTGRES" = true ]; then
    echo ""
    echo "4️⃣ Setting up database..."
    
    # Check if database exists
    if psql -lqt | cut -d \| -f 1 | grep -qw the_local_loop; then
        echo -e "${YELLOW}⚠️  Database 'the_local_loop' already exists${NC}"
        read -p "Do you want to recreate it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            dropdb the_local_loop 2>/dev/null
            createdb the_local_loop
            echo -e "${GREEN}✅ Database recreated${NC}"
        fi
    else
        createdb the_local_loop
        echo -e "${GREEN}✅ Database created${NC}"
    fi
    
    # Load schema
    echo "   Loading schema..."
    psql -d the_local_loop -f database/schema_v3_distance_based.sql > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Schema loaded successfully${NC}"
        
        # Show tables
        echo ""
        echo "   Tables created:"
        psql -d the_local_loop -c "\dt" | grep -E "areas|users|products|orders"
    else
        echo -e "${RED}❌ Failed to load schema${NC}"
    fi
fi

# Install Backend Dependencies
echo ""
echo "5️⃣ Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Backend dependencies already installed${NC}"
fi
cd ..

# Install AI Service Dependencies
echo ""
echo "6️⃣ Checking AI service dependencies..."
cd ai-agents
if python3 -c "import fastapi" 2>/dev/null; then
    echo -e "${GREEN}✅ AI service dependencies already installed${NC}"
else
    echo "   Installing AI service dependencies..."
    pip3 install -r requirements.txt > /dev/null 2>&1
    echo -e "${GREEN}✅ AI service dependencies installed${NC}"
fi
cd ..

# Install Frontend Dependencies
echo ""
echo "7️⃣ Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend dependencies already installed${NC}"
fi
cd ..

echo ""
echo "======================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "======================================"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Update backend/.env with your database password"
echo ""
echo "2. Start services in 3 separate terminals:"
echo ""
echo "   Terminal 1 (AI Service):"
echo "   cd ai-agents && python3 main.py"
echo ""
echo "   Terminal 2 (Backend API):"
echo "   cd backend && npm run dev"
echo ""
echo "   Terminal 3 (Frontend):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open browser: http://localhost:5173"
echo ""
echo "📚 For detailed testing guide, see: LOCAL_TESTING_GUIDE.md"
echo ""

# Made with Bob
