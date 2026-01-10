#!/bin/bash

# The Local Loop - Backend Quick Start Script

echo "🚀 Starting The Local Loop Backend..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo "⚠️  PostgreSQL is not running. Please start PostgreSQL first."
    echo "   macOS: brew services start postgresql"
    echo "   Linux: sudo systemctl start postgresql"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please update it with your configuration."
    else
        echo "❌ .env.example not found. Please create .env manually."
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
fi

# Check if database exists
DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2)
if ! psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "⚠️  Database '$DB_NAME' not found."
    echo "   Creating database..."
    createdb "$DB_NAME"
    
    echo "   Running schema..."
    psql -d "$DB_NAME" -f ../database/schema_v3_distance_based.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Database setup complete"
    else
        echo "❌ Failed to setup database"
        exit 1
    fi
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "🚀 Starting server..."
echo ""

# Start the server
npm run dev

