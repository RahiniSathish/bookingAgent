#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║        🧪 FLIGHT SYSTEM DIAGNOSTIC TEST SUITE               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if backend is running
echo "TEST 1: Backend Server Status"
echo "────────────────────────────────────────"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on port 8000${NC}"
else
    echo -e "${RED}❌ Backend is NOT running${NC}"
    echo "   Start it with: cd backend && python server.py"
fi
echo ""

# Test 2: Test backend API directly
echo "TEST 2: Backend API - Direct Call"
echo "────────────────────────────────────────"
RESPONSE=$(curl -s -X POST http://localhost:8000/api/search-flights \
  -H "Content-Type: application/json" \
  -d '{"origin": "Bangalore", "destination": "Jeddah", "departure_date": "2025-01-15"}')

FLIGHT_COUNT=$(echo $RESPONSE | grep -o '"flights"' | wc -l)

if [ $FLIGHT_COUNT -gt 0 ]; then
    FLIGHTS=$(echo $RESPONSE | jq '.flights | length' 2>/dev/null || echo "N/A")
    echo -e "${GREEN}✅ Backend returned flights: $FLIGHTS${NC}"
    echo "   First flight:"
    echo $RESPONSE | jq '.flights[0] | {airline, flight_number, price}' 2>/dev/null
else
    echo -e "${RED}❌ Backend returned no flights${NC}"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 3: Test city name variations
echo "TEST 3: City Name Normalization"
echo "────────────────────────────────────────"
for ORIGIN in "Bangalore" "Bengaluru" "BLR"; do
    RESPONSE=$(curl -s -X POST http://localhost:8000/api/search-flights \
      -H "Content-Type: application/json" \
      -d "{\"origin\": \"$ORIGIN\", \"destination\": \"Jeddah\", \"departure_date\": \"2025-01-15\"}")
    
    FLIGHTS=$(echo $RESPONSE | jq '.flights | length' 2>/dev/null || echo "0")
    if [ "$FLIGHTS" != "0" ]; then
        echo -e "${GREEN}✅ '$ORIGIN' → $FLIGHTS flights${NC}"
    else
        echo -e "${RED}❌ '$ORIGIN' → 0 flights${NC}"
    fi
done
echo ""

# Test 4: Test date formats
echo "TEST 4: Date Format Handling"
echo "────────────────────────────────────────"
for DATE in "2025-01-15" "20250115" "january 15"; do
    RESPONSE=$(curl -s -X POST http://localhost:8000/api/search-flights \
      -H "Content-Type: application/json" \
      -d "{\"origin\": \"Bangalore\", \"destination\": \"Jeddah\", \"departure_date\": \"$DATE\"}")
    
    FLIGHTS=$(echo $RESPONSE | jq '.flights | length' 2>/dev/null || echo "0")
    if [ "$FLIGHTS" != "0" ]; then
        echo -e "${GREEN}✅ Date '$DATE' → $FLIGHTS flights${NC}"
    else
        echo -e "${RED}❌ Date '$DATE' → 0 flights${NC}"
    fi
done
echo ""

# Test 5: Check mock database routes
echo "TEST 5: Mock Database Available Routes"
echo "────────────────────────────────────────"
echo "Testing known routes..."
for ROUTE in "Bangalore:Jeddah" "Bangalore:Riyadh" "Bangalore:Dubai"; do
    ORIGIN=$(echo $ROUTE | cut -d: -f1)
    DEST=$(echo $ROUTE | cut -d: -f2)
    
    RESPONSE=$(curl -s -X POST http://localhost:8000/api/search-flights \
      -H "Content-Type: application/json" \
      -d "{\"origin\": \"$ORIGIN\", \"destination\": \"$DEST\", \"departure_date\": \"2025-01-15\"}")
    
    FLIGHTS=$(echo $RESPONSE | jq '.flights | length' 2>/dev/null || echo "0")
    if [ "$FLIGHTS" != "0" ]; then
        echo -e "${GREEN}✅ $ORIGIN → $DEST: $FLIGHTS flights${NC}"
    else
        echo -e "${RED}❌ $ORIGIN → $DEST: 0 flights${NC}"
    fi
done
echo ""

# Test 6: Check frontend widget
echo "TEST 6: Frontend Widget Status"
echo "────────────────────────────────────────"
if curl -s http://localhost:4000/custom-widget-simple.html > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend widget is accessible${NC}"
    echo "   URL: http://localhost:4000/custom-widget-simple.html"
else
    echo -e "${YELLOW}⚠️  Frontend not accessible on port 4000${NC}"
    echo "   Start it with: python3 -m http.server 4000"
fi
echo ""

# Test 7: Check ngrok tunnel
echo "TEST 7: Ngrok Tunnel Status"
echo "────────────────────────────────────────"
if curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
    TUNNEL_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url' 2>/dev/null)
    if [ ! -z "$TUNNEL_URL" ]; then
        echo -e "${GREEN}✅ Ngrok tunnel active${NC}"
        echo "   URL: $TUNNEL_URL"
        echo "   Webhook: $TUNNEL_URL/webhooks/vapi"
    else
        echo -e "${RED}❌ Ngrok running but no tunnels${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Ngrok not running${NC}"
    echo "   Start it with: ngrok http 8000"
fi
echo ""

# Summary
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                     📊 TEST SUMMARY                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "If all tests pass:"
echo "  ✅ Backend works"
echo "  ✅ Mock database has flights"
echo "  ✅ API endpoints work"
echo "  ✅ City/date normalization works"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost:4000/custom-widget-simple.html"
echo "  2. Open browser console (F12)"
echo "  3. Say: 'Find flights from Bangalore to Jeddah on January 15'"
echo "  4. Watch console logs for debugging info"
echo ""
