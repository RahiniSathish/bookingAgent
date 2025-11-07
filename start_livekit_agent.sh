#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# START LIVEKIT VOICE AGENT - Quick Start Script
# ═══════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════"
echo "🎙️  STARTING LIVEKIT VOICE AGENT"
echo "═══════════════════════════════════════════════════════════════"

# Change to project directory
cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with required credentials"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "⚠️  Virtual environment not found, creating..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check and install dependencies
echo "📦 Checking dependencies..."
pip list | grep -q "livekit-agents" || {
    echo "📦 Installing LiveKit dependencies..."
    pip install livekit livekit-agents livekit-plugins-deepgram livekit-plugins-openai livekit-plugins-silero aiohttp python-dotenv
}

# Check if backend is running
echo "🔍 Checking backend status..."
if lsof -ti:4000 > /dev/null 2>&1; then
    echo "✅ Backend is running on port 4000"
else
    echo "⚠️  Backend is NOT running on port 4000"
    echo "❌ Please start backend first:"
    echo "   cd backend && python server.py"
    exit 1
fi

# Check for required API keys
echo "🔑 Checking API keys..."
source .env

if [ -z "$LIVEKIT_URL" ] || [ -z "$LIVEKIT_API_KEY" ] || [ -z "$LIVEKIT_API_SECRET" ]; then
    echo "❌ Error: Missing LiveKit credentials in .env"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: Missing OPENAI_API_KEY in .env"
    exit 1
fi

if [ -z "$DEEPGRAM_API_KEY" ] || [ "$DEEPGRAM_API_KEY" = "your_deepgram_key_here" ]; then
    echo "⚠️  WARNING: DEEPGRAM_API_KEY not configured!"
    echo "⚠️  Speech-to-Text may not work properly"
    echo ""
    echo "To fix:"
    echo "1. Sign up at https://console.deepgram.com/signup"
    echo "2. Get your API key"
    echo "3. Add to .env: DEEPGRAM_API_KEY=your_key"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ All credentials found"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🚀 STARTING LIVEKIT VOICE AGENT..."
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Agent will:"
echo "  ✅ Join LiveKit rooms automatically"
echo "  ✅ Use Alex personality from SYSTEM_PROMPT.py"
echo "  ✅ Search real-time flights via MCP Bright Data"
echo "  ✅ Provide natural voice conversations"
echo ""
echo "Press Ctrl+C to stop"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Start the agent
python livekit_voice_agent_complete.py


