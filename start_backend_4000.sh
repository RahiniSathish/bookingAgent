#!/bin/bash

# Start Backend Server on Port 4000 with Bright Data Integration
# This script ensures the server runs on the correct port

echo "🚀 Starting Travel AI Backend Server on Port 4000..."
echo "🌐 Using Bright Data for real-time flight data"
echo ""

# Kill any existing processes on port 4000 or 8080
echo "🧹 Cleaning up existing processes..."
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
pkill -f "python server.py" 2>/dev/null || true
sleep 2

# Navigate to backend directory
cd "$(dirname "$0")/backend" || exit 1

# Set environment variables
export PORT=4000
export HOST=0.0.0.0
export PYTHONUNBUFFERED=1

# Check if virtual environment exists
if [ ! -d "../venv" ]; then
    echo "⚠️  Virtual environment not found. Creating one..."
    python3 -m venv ../venv
fi

# Activate virtual environment
source ../venv/bin/activate 2>/dev/null || true

# Install/update requirements
echo "📦 Installing dependencies..."
pip install -q -r ../requirements.txt 2>/dev/null || pip install -q aiohttp requests python-dotenv fastapi uvicorn openai || true

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║   Starting Travel AI Backend Server...           ║"
echo "║   Port: 4000                                      ║"
echo "║   Flight API: Bright Data Real-Time               ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Start the server
python server.py

