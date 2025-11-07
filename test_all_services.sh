#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║              🧪 TESTING ALL SERVICES                                       ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service
check_service() {
    local service_name=$1
    local check_command=$2
    
    echo -n "Checking $service_name... "
    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ WORKING${NC}"
        return 0
    else
        echo -e "${RED}❌ NOT WORKING${NC}"
        return 1
    fi
}

# ════════════════════════════════════════════════════════════════════════
# TEST 1: Check .env Files Exist
# ════════════════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════════════════════"
echo "TEST 1: Configuration Files"
echo "═══════════════════════════════════════════════════════════════════════════"

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Backend .env exists${NC}"
else
    echo -e "${RED}❌ Backend .env missing${NC}"
fi

if [ -f "custom-livekit-widget/.env" ]; then
    echo -e "${GREEN}✅ Widget .env exists${NC}"
else
    echo -e "${RED}❌ Widget .env missing${NC}"
fi

echo ""

# ════════════════════════════════════════════════════════════════════════
# TEST 2: Check Credentials in .env
# ════════════════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════════════════════"
echo "TEST 2: Credentials Configuration"
echo "═══════════════════════════════════════════════════════════════════════════"

check_credential() {
    local cred_name=$1
    local env_var=$2
    
    if grep -q "^${env_var}=.*[a-zA-Z0-9]" .env 2>/dev/null; then
        echo -e "${GREEN}✅ $cred_name configured${NC}"
    else
        echo -e "${YELLOW}⚠️  $cred_name not configured or empty${NC}"
    fi
}

check_credential "Azure OpenAI" "AZURE_OPENAI_API_KEY"
check_credential "Azure Speech" "AZURE_SPEECH_KEY"
check_credential "OpenAI API" "OPENAI_API_KEY"
check_credential "LiveKit" "LIVEKIT_API_KEY"
check_credential "Bright Data MCP" "BRIGHTDATA_API_KEY"
check_credential "SMTP Email" "SMTP_PASSWORD"

echo ""

# ════════════════════════════════════════════════════════════════════════
# TEST 3: Backend Server
# ════════════════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════════════════════"
echo "TEST 3: Backend Server"
echo "═══════════════════════════════════════════════════════════════════════════"

if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✅ Backend server is running on port 4000${NC}"
    
    # Test health endpoint
    echo -n "Testing health endpoint... "
    if curl -s http://localhost:4000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ WORKING${NC}"
    else
        echo -e "${RED}❌ NOT RESPONDING${NC}"
    fi
else
    echo -e "${RED}❌ Backend server is NOT running on port 4000${NC}"
    echo "   Start with: python backend/server.py"
fi

echo ""

# ════════════════════════════════════════════════════════════════════════
# TEST 4: Flight Search API
# ════════════════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════════════════════"
echo "TEST 4: Flight Search API"
echo "═══════════════════════════════════════════════════════════════════════════"

if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "Testing flight search API..."
    
    response=$(curl -s -X POST http://localhost:4000/api/search-flights \
      -H "Content-Type: application/json" \
      -d '{"origin":"BLR","destination":"JED","departure_date":"2025-12-15"}')
    
    if echo "$response" | grep -q '"success"'; then
        echo -e "${GREEN}✅ Flight search API is WORKING${NC}"
        
        # Check data source
        if echo "$response" | grep -q '"bright_data_real_time"'; then
            echo -e "${GREEN}   ✨ Using Bright Data (REAL-TIME flights!)${NC}"
        elif echo "$response" | grep -q '"mock_database"'; then
            echo -e "${YELLOW}   ⚠️  Using Mock Database (sample flights)${NC}"
            echo "      To enable Bright Data: Check BRIGHTDATA_API_KEY in .env"
        fi
        
        # Count flights
        flight_count=$(echo "$response" | grep -o '"flight_number"' | wc -l)
        echo "   Found $flight_count flights"
    else
        echo -e "${RED}❌ Flight search API FAILED${NC}"
        echo "   Response: $response"
    fi
else
    echo -e "${YELLOW}⚠️  Backend not running, skipping test${NC}"
fi

echo ""

# ════════════════════════════════════════════════════════════════════════
# TEST 5: Widget Files
# ════════════════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════════════════════"
echo "TEST 5: Widget Files"
echo "═══════════════════════════════════════════════════════════════════════════"

if [ -d "custom-livekit-widget" ]; then
    echo -e "${GREEN}✅ Custom widget folder exists${NC}"
    
    if [ -f "custom-livekit-widget/package.json" ]; then
        echo -e "${GREEN}✅ package.json exists${NC}"
    else
        echo -e "${RED}❌ package.json missing${NC}"
    fi
    
    if [ -d "custom-livekit-widget/node_modules" ]; then
        echo -e "${GREEN}✅ node_modules installed${NC}"
    else
        echo -e "${YELLOW}⚠️  node_modules not installed${NC}"
        echo "   Run: cd custom-livekit-widget && npm install"
    fi
    
    if [ -f "custom-livekit-widget/src/components/TravelAssistant.jsx" ]; then
        echo -e "${GREEN}✅ Main widget component exists${NC}"
    else
        echo -e "${RED}❌ Main widget component missing${NC}"
    fi
else
    echo -e "${RED}❌ Custom widget folder missing${NC}"
fi

echo ""

# ════════════════════════════════════════════════════════════════════════
# TEST 6: Check Backend Logs
# ════════════════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════════════════════"
echo "TEST 6: Backend Logs (Last 5 lines)"
echo "═══════════════════════════════════════════════════════════════════════════"

if [ -f "backend.log" ]; then
    echo "Last 5 log entries:"
    tail -5 backend.log | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠️  No backend.log file found${NC}"
fi

echo ""

# ════════════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════════════
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║                          📊 TEST SUMMARY                                   ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Count results
total_tests=6
passed_tests=0

[ -f ".env" ] && ((passed_tests++))
[ -f "custom-livekit-widget/.env" ] && ((passed_tests++))
lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1 && ((passed_tests++))

echo "Tests completed: $passed_tests/$total_tests basic checks passed"
echo ""

# Recommendations
echo "📋 RECOMMENDATIONS:"
echo "════════════════════════════════════════════════════════════════════════════"

if ! lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Backend not running${NC}"
    echo "   Start: python backend/server.py"
    echo ""
fi

if [ ! -d "custom-livekit-widget/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Widget dependencies not installed${NC}"
    echo "   Install: cd custom-livekit-widget && npm install"
    echo ""
fi

if grep -q "Using MOCK FLIGHTS DATABASE" backend.log 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Using mock flight data${NC}"
    echo "   To enable Bright Data:"
    echo "   1. Verify BRIGHTDATA_API_KEY in .env"
    echo "   2. Restart backend"
    echo ""
fi

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║  🚀 TO START YOUR APP:                                                     ║"
echo "║                                                                            ║"
echo "║  Terminal 1: python backend/server.py                                     ║"
echo "║  Terminal 2: cd custom-livekit-widget && npm run dev                      ║"
echo "║                                                                            ║"
echo "║  Open: http://localhost:3002                                              ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

