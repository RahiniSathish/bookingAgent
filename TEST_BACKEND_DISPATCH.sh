#!/bin/bash

# Test Backend Agent Dispatch
# This script tests if the backend correctly creates rooms and triggers agent dispatch

echo "🧪 Testing Backend Agent Dispatch..."
echo ""

# Test room creation via token endpoint
echo "📝 Step 1: Request LiveKit token (this should create room)"
echo ""

curl -X POST http://localhost:4000/api/livekit/token \
  -H "Content-Type: application/json" \
  -d '{
    "room_name": "test-room-'$(date +%s)'",
    "participant_identity": "test-user-'$(date +%s)'"
  }' | jq .

echo ""
echo "✅ Check backend logs for room creation:"
echo "   tail -20 backend.log | grep -E 'Creating room|Room created|agent dispatch'"
echo ""
echo "✅ Check agent logs for job request:"
echo "   tail -20 livekit_agent.log | grep -E 'Job request|Agent joining'"
echo ""


