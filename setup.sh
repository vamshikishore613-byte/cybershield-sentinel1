#!/bin/bash
# CyberShield Sentinel - Quick Start Script

echo "🛡️  CyberShield Sentinel — AI-Powered Scam Intelligence Platform"
echo "================================================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Setup backend
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Copy .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created backend/.env from example"
fi

cd ..

# Setup frontend
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Copy .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created frontend/.env from example"
fi

cd ..

echo ""
echo "================================================================="
echo "✅ Setup complete! To start the app:"
echo ""
echo "  Terminal 1 (Backend):  cd backend && node server.js"
echo "  Terminal 2 (Frontend): cd frontend && npm start"
echo ""
echo "  Or with nodemon (dev):  cd backend && npx nodemon server.js"
echo ""
echo "  🌐 Frontend: http://localhost:3000"
echo "  🔌 Backend API: http://localhost:5000/api/health"
echo ""
echo "  📞 Emergency Cyber Crime Helpline: 1930"
echo "================================================================="
