#!/bin/bash

# Start All Services - Backend (4000) + Frontend (3001)
# This ensures proper HTTP serving to avoid blob/CORS issues

echo "🚀 Starting Attar Travel AI Services..."
echo ""

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
pkill -f "python server.py" 2>/dev/null || true
pkill -f "python -m http.server 3001" 2>/dev/null || true
sleep 2

# Navigate to project root
cd "$(dirname "$0")" || exit 1

# Set up virtual environment
if [ ! -d "venv" ]; then
    echo "⚠️  Virtual environment not found. Creating one..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || true

# Install requirements
echo "📦 Installing dependencies..."
pip install -q -r requirements.txt 2>/dev/null || {
    echo "⚠️  requirements.txt not found, installing core packages..."
    pip install -q fastapi uvicorn requests python-dotenv openai aiohttp
}

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║   Starting Services...                            ║"
echo "║                                                   ║"
echo "║   Backend:  http://localhost:4000                 ║"
echo "║   Frontend: http://localhost:3001                 ║"
echo "║                                                   ║"
echo "║   Widget:   vapi-widget-with-flight-cards.html    ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Start Backend Server (Port 4000)
echo "🔧 Starting Backend Server on port 4000..."
cd backend
PORT=4000 nohup python -c "import uvicorn; uvicorn.run('server:app', host='0.0.0.0', port=4000, reload=False)" > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

sleep 3

# Start Frontend Server (Port 3001)
echo "🌐 Starting Frontend Server on port 3001..."
nohup python3 -m http.server 3001 > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 2

# Check if services are running
echo ""
echo "🔍 Checking services..."

if lsof -i:4000 > /dev/null 2>&1; then
    echo "✅ Backend Server: RUNNING (http://localhost:4000)"
else
    echo "❌ Backend Server: FAILED"
fi

if lsof -i:3001 > /dev/null 2>&1; then
    echo "✅ Frontend Server: RUNNING (http://localhost:3001)"
else
    echo "❌ Frontend Server: FAILED"
fi

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║   🎉 Services Started!                            ║"
echo "║                                                   ║"
echo "║   Open in browser:                                ║"
echo "║   http://localhost:3001/vapi-widget-with-flight-cards.html"
echo "║                                                   ║"
echo "║   API Health Check:                               ║"
echo "║   http://localhost:4000/health                    ║"
echo "║                                                   ║"
echo "║   Logs:                                           ║"
echo "║   - Backend:  logs/backend.log                    ║"
echo "║   - Frontend: logs/frontend.log                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Open widget in browser
echo "🌐 Opening widget in browser..."
sleep 2
open "http://localhost:3001/vapi-widget-with-flight-cards.html"

echo ""
echo "✅ All services running!"
echo "   Press Ctrl+C to stop all services"
echo ""

# Keep script running and handle cleanup on exit
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait indefinitely
wait

