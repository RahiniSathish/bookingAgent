#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# START ALL LIVEKIT VOICE SERVICES
# ═══════════════════════════════════════════════════════════════

echo "🚀 Starting LiveKit Voice Agent System..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Create logs directory
mkdir -p logs

# Stop existing services
echo "🛑 Stopping existing services..."
pkill -9 -f "python backend/server.py" 2>/dev/null
pkill -9 -f "livekit_voice_agent_complete.py" 2>/dev/null
pkill -9 -f "npm run dev" 2>/dev/null
lsof -ti :4000 | xargs kill -9 2>/dev/null
lsof -ti :3002 | xargs kill -9 2>/dev/null
sleep 2

# Activate virtual environment
echo "📦 Activating virtual environment..."
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating..."
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Start Backend
echo "🔧 Starting Backend API Server..."
python backend/server.py > logs/backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

# Check if backend started
if lsof -ti :4000 > /dev/null 2>&1; then
    echo "✅ Backend started successfully (PID: $BACKEND_PID, Port: 4000)"
else
    echo "❌ Backend failed to start. Check logs/backend.log"
    exit 1
fi

# Start LiveKit Agent
echo "🤖 Starting LiveKit Voice Agent..."
python agent/livekit_voice_agent_complete.py dev > logs/agent.log 2>&1 &
AGENT_PID=$!
sleep 5

# Check if agent started
if ps -p $AGENT_PID > /dev/null 2>&1; then
    echo "✅ Agent started successfully (PID: $AGENT_PID)"
else
    echo "❌ Agent failed to start. Check logs/agent.log"
    exit 1
fi

# Start Frontend
echo "🌐 Starting Frontend Widget..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 3

# Check if frontend started
if lsof -ti :3002 > /dev/null 2>&1; then
    echo "✅ Frontend started successfully (PID: $FRONTEND_PID, Port: 3002)"
else
    echo "⚠️  Frontend might still be starting. Check logs/frontend.log"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ ALL SERVICES STARTED!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📊 Access Points:"
echo "   Frontend:  http://localhost:3002"
echo "   Backend:   http://localhost:4000"
echo "   API Docs:  http://localhost:4000/docs"
echo ""
echo "📝 Log Files:"
echo "   Backend:   logs/backend.log"
echo "   Agent:     logs/agent.log"
echo "   Frontend:  logs/frontend.log"
echo ""
echo "🎤 Ready to test! Open http://localhost:3002 and click 'Start Call'"
echo ""
echo "📊 Monitor logs:"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/agent.log"
echo ""
echo "🛑 To stop all services:"
echo "   ./stop_all.sh"
echo ""
echo "═══════════════════════════════════════════════════════════════"


