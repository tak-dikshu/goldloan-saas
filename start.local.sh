#!/bin/bash

echo "🏦 Gold Loan Management System - Starter"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Function to start backend
start_backend() {
    echo "🚀 Starting Backend..."
    cd backend
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    fi
    
    # Check if built
    if [ ! -d "dist" ]; then
        echo "🔨 Building backend..."
        npm run build
    fi
    
    # Check if database exists
    if [ ! -f "data/goldloan.db" ]; then
        echo "🗄️  Initializing database..."
        mkdir -p data
        npm run db:migrate
    fi
    
    echo "✓ Starting backend server on http://localhost:5000"
    npm start &
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
    cd ..
}

# Function to start frontend
start_frontend() {
    echo ""
    echo "🎨 Starting Frontend..."
    cd frontend
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install --legacy-peer-deps
    fi
    
    echo "✓ Starting frontend dev server on http://localhost:5173"
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
    cd ..
}

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    
    if [ -f "backend/backend.pid" ]; then
        kill $(cat backend/backend.pid) 2>/dev/null
        rm backend/backend.pid
    fi
    
    if [ -f "frontend/frontend.pid" ]; then
        kill $(cat frontend/frontend.pid) 2>/dev/null
        rm frontend/frontend.pid
    fi
    
    echo "✓ Shutdown complete"
    exit 0
}

# Trap CTRL+C
trap cleanup SIGINT SIGTERM

# Start services
start_backend
sleep 3
start_frontend

echo ""
echo "========================================"
echo "✅ System Running!"
echo "========================================"
echo ""
echo "🌐 Backend API:  http://localhost:5000"
echo "🌐 Frontend UI:  http://localhost:5173"
echo ""
echo "Press CTRL+C to stop all services"
echo ""

# Wait indefinitely
wait
