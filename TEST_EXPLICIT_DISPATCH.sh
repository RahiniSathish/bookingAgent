#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# TEST EXPLICIT AGENT DISPATCH - OPTION 2
# ═══════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════"
echo "🧪 TESTING EXPLICIT AGENT DISPATCH"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if services are running
echo "📊 Checking running services..."
echo ""

# Check Backend
if lsof -ti :4000 > /dev/null 2>&1; then
    echo "✅ Backend API: Running on port 4000"
else
    echo "❌ Backend API: NOT running"
    echo "   Start with: cd /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot && source venv/bin/activate && python backend/server.py"
fi

# Check Agent Worker
if ps aux | grep "livekit_voice_agent_complete.py dev" | grep -v grep > /dev/null 2>&1; then
    echo "✅ LiveKit Agent: Running"
else
    echo "❌ LiveKit Agent: NOT running"
    echo "   Start with: cd /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot && source venv/bin/activate && python livekit_voice_agent_complete.py dev"
fi

# Check Frontend
if lsof -ti :3002 > /dev/null 2>&1; then
    echo "✅ Frontend: Running on port 3002"
else
    echo "❌ Frontend: NOT running"
    echo "   Start with: cd /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot/custom-livekit-widget && npm run dev"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🧪 TEST INSTRUCTIONS:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Open: http://localhost:3002"
echo "2. Click: 'Start Call'"
echo "3. Grant microphone permission"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📊 WATCH LOGS:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Backend Logs:"
echo "  tail -f /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot/backend_dispatch.log"
echo ""
echo "Agent Logs:"
echo "  tail -f /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot/livekit_agent_explicit_dispatch.log"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ EXPECTED RESULTS:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Backend Log:"
echo "  ✅ AGENT DISPATCHED SUCCESSFULLY to room: travel-room-xxxxx"
echo ""
echo "Agent Log:"
echo "  📨 Job request received for room: travel-room-xxxxx"
echo "  ✅ Job request accepted"
echo "  🚀 Agent joining room..."
echo "  ✅ Connected to LiveKit room"
echo "  🎙️ Voice assistant active!"
echo ""
echo "Browser:"
echo "  🔊 You should hear Alex's greeting!"
echo ""
echo "═══════════════════════════════════════════════════════════════"


