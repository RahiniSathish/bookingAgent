#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# STOP ALL LIVEKIT VOICE SERVICES
# ═══════════════════════════════════════════════════════════════

echo "🛑 Stopping all LiveKit Voice services..."
echo ""

# Stop Backend
echo "⏹️  Stopping Backend..."
pkill -9 -f "python backend/server.py"
lsof -ti :4000 | xargs kill -9 2>/dev/null

# Stop Agent
echo "⏹️  Stopping LiveKit Agent..."
pkill -9 -f "livekit_voice_agent_complete.py"

# Stop Frontend
echo "⏹️  Stopping Frontend..."
pkill -9 -f "npm run dev"
pkill -9 -f "vite"
lsof -ti :3002 | xargs kill -9 2>/dev/null

sleep 2

echo ""
echo "✅ All services stopped!"
echo ""


