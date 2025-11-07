#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# RUN LIVEKIT VOICE AGENT SYSTEM - SIMPLE START
# ═══════════════════════════════════════════════════════════════

echo "🚀 Starting LiveKit Voice Agent System..."
echo ""

cd /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot

# Kill existing processes
echo "🛑 Stopping existing services..."
pkill -9 -f "livekit_voice_agent_complete.py" 2>/dev/null
pkill -9 -f "backend/server.py" 2>/dev/null
lsof -ti :4000 | xargs kill -9 2>/dev/null
lsof -ti :3002 | xargs kill -9 2>/dev/null
sleep 2

# Activate venv
source venv/bin/activate

# Start Backend
echo ""
echo "🔧 Starting Backend API..."
python backend/server.py > backend_running.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 4

# Check backend
if lsof -ti :4000 > /dev/null 2>&1; then
    echo "✅ Backend running on port 4000"
else
    echo "❌ Backend failed to start"
    tail -20 backend_running.log
    exit 1
fi

# Start LiveKit Agent
echo ""
echo "🤖 Starting LiveKit Voice Agent with OpenAI Realtime API..."
python livekit_voice_agent_complete.py dev > livekit_agent_running.log 2>&1 &
AGENT_PID=$!
echo "Agent PID: $AGENT_PID"
sleep 3

# Check agent
if ps -p $AGENT_PID > /dev/null 2>&1; then
    echo "✅ LiveKit Agent started"
else
    echo "❌ Agent failed to start"
    tail -20 livekit_agent_running.log
    exit 1
fi

# Start Frontend
echo ""
echo "🌐 Starting Frontend Widget..."
cd custom-livekit-widget
npm run dev > ../frontend_running.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "Frontend PID: $FRONTEND_PID"
sleep 3

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
echo "   Backend:   backend_running.log"
echo "   Agent:     livekit_agent_running.log"
echo "   Frontend:  frontend_running.log"
echo ""
echo "📊 Monitor logs:"
echo "   tail -f backend_running.log"
echo "   tail -f livekit_agent_running.log"
echo ""
echo "🛑 To stop all:"
echo "   pkill -9 -f 'livekit_voice_agent_complete.py'"
echo "   pkill -9 -f 'backend/server.py'"
echo "   pkill -9 -f 'npm run dev'"
echo ""
echo "═══════════════════════════════════════════════════════════════"


