#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║         🎙️  STARTING CUSTOM LIVEKIT TRAVEL WIDGET                        ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Navigate to custom widget folder
cd /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot/custom-livekit-widget

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies first..."
    npm install
    echo ""
fi

# Check if backend is running
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend is running on port 4000"
else
    echo "⚠️  Backend is NOT running!"
    echo "   Start it in another terminal:"
    echo "   cd /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot"
    echo "   python backend/server.py"
    echo ""
fi

echo "🚀 Starting custom widget on port 3002..."
echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║   🌐 Custom Widget: http://localhost:3002                                 ║"
echo "║   🔧 Backend API:   http://localhost:4000                                 ║"
echo "║                                                                            ║"
echo "║   ✅ Flight cards appear INSIDE the chat                                  ║"
echo "║   ✅ Full voice support (mic + speaker)                                   ║"
echo "║   ✅ 100% customizable                                                    ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

npm run dev

