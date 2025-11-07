#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "🔍 VERIFY AUDIO SETUP"
echo "═══════════════════════════════════════════════════════════════"

echo ""
echo "1️⃣  Checking Backend (Flask/FastAPI on 4000)..."
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Backend running on port 4000"
else
    echo "❌ Backend NOT running on port 4000"
fi

echo ""
echo "2️⃣  Checking Frontend (Node/Vite on 3003)..."
if lsof -Pi :3003 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Frontend running on port 3003"
else
    echo "❌ Frontend NOT running on port 3003"
fi

echo ""
echo "3️⃣  Checking LiveKit Agent..."
if pgrep -f "livekit_voice_agent_complete.py" > /dev/null; then
    echo "✅ LiveKit Agent running"
    echo "   Process:"
    ps aux | grep "livekit_voice_agent_complete.py" | grep -v grep | awk '{print "   "$2" - "$11" "$12}'
else
    echo "❌ LiveKit Agent NOT running"
fi

echo ""
echo "4️⃣  Environment Variables..."
if grep -q "DEEPGRAM_API_KEY" /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot/.env 2>/dev/null; then
    echo "✅ Deepgram API key configured"
else
    echo "❌ Deepgram API key NOT configured"
fi

if grep -q "OPENAI_API_KEY" /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot/.env 2>/dev/null; then
    echo "✅ OpenAI API key configured"
else
    echo "❌ OpenAI API key NOT configured"
fi

if grep -q "LIVEKIT_URL" /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot/.env 2>/dev/null; then
    echo "✅ LiveKit URL configured"
else
    echo "❌ LiveKit URL NOT configured"
fi

echo ""
echo "5️⃣  Recent Agent Logs (last 15 lines)..."
if [ -f "/Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot/livekit_agent.log" ]; then
    tail -15 /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot/livekit_agent.log
else
    echo "❌ No agent logs found yet"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ VERIFICATION COMPLETE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Frontend URL: http://localhost:3003"
echo "💬 Backend URL: http://localhost:4000"
echo ""
