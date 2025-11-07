#!/bin/bash

################################################################################
# RUN ALL SERVICES - LiveKit Voice Agent Complete Setup
################################################################################
# This script starts all required services:
# 1. MCP Realtime Flight Data Server
# 2. FastAPI Backend Server (port 4000)
# 3. LiveKit Voice Agent (livekit_voice_agent.py)
# 4. Frontend Vite Dev Server (port 3003+)
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  ATTAR TRAVEL - LiveKit Voice Agent - COMPLETE STARTUP${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    echo -e "${RED}All services stopped.${NC}"
}

trap cleanup EXIT

# ═══════════════════════════════════════════════════════════════
# 1. Check Python virtual environment
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[1/4] Checking Python environment...${NC}"
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate
echo -e "${GREEN}✅ Virtual environment activated${NC}"

# Install requirements
echo -e "${YELLOW}Installing dependencies...${NC}"
pip install -q -r requirements.txt
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# 2. Check .env file
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[2/4] Checking environment configuration...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}Create .env file with required credentials:${NC}"
    echo ""
    echo "OPENAI_API_KEY=your_key"
    echo "DEEPGRAM_API_KEY=your_key"
    echo "LIVEKIT_URL=your_url"
    echo "LIVEKIT_API_KEY=your_key"
    echo "LIVEKIT_API_SECRET=your_secret"
    echo "BRIGHTDATA_API_KEY=your_key"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ .env file found${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# 3. Start MCP Realtime Flight Data Server
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[3/4] Starting MCP Realtime Flight Data Server...${NC}"
python3 mcp_client.py &
MCP_PID=$!
sleep 2
echo -e "${GREEN}✅ MCP Server started (PID: $MCP_PID)${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# 4. Start FastAPI Backend Server
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[4/4] Starting FastAPI Backend Server...${NC}"
cd backend
python3 -m uvicorn server:app --reload --host 0.0.0.0 --port 4000 &
BACKEND_PID=$!
cd ..
sleep 3
echo -e "${GREEN}✅ Backend server started on http://localhost:4000 (PID: $BACKEND_PID)${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# 5. Start LiveKit Voice Agent
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[5/5] Starting LiveKit Voice Agent...${NC}"
python3 livekit_voice_agent.py &
AGENT_PID=$!
sleep 2
echo -e "${GREEN}✅ LiveKit Voice Agent started (PID: $AGENT_PID)${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# 6. Start Frontend Vite Dev Server
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}[6/5] Starting Frontend Vite Dev Server...${NC}"
cd custom-livekit-widget
npm run dev &
FRONTEND_PID=$!
cd ..
sleep 3
echo -e "${GREEN}✅ Frontend dev server started (PID: $FRONTEND_PID)${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# 7. Summary
# ═══════════════════════════════════════════════════════════════
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ ALL SERVICES RUNNING!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 SERVICE STATUS:${NC}"
echo -e "  ${GREEN}✓${NC} MCP Realtime Flight Server          (PID: $MCP_PID)"
echo -e "  ${GREEN}✓${NC} FastAPI Backend                     (http://localhost:4000)"
echo -e "  ${GREEN}✓${NC} LiveKit Voice Agent                 (PID: $AGENT_PID)"
echo -e "  ${GREEN}✓${NC} Frontend Dev Server                 (http://localhost:3003)"
echo ""
echo -e "${BLUE}📋 SYSTEM PROMPT:${NC}"
echo -e "  ${GREEN}✓${NC} Loaded from: SYSTEM_PROMPT.py"
echo -e "  ${GREEN}✓${NC} Alex AI Assistant with full instructions"
echo -e "  ${GREEN}✓${NC} Flight search, booking, and trip planning enabled"
echo ""
echo -e "${YELLOW}🚀 QUICK LINKS:${NC}"
echo -e "  • Frontend:       ${BLUE}http://localhost:3003${NC}"
echo -e "  • Backend API:    ${BLUE}http://localhost:4000${NC}"
echo -e "  • API Docs:       ${BLUE}http://localhost:4000/docs${NC}"
echo ""
echo -e "${YELLOW}📝 SERVICES RUNNING IN BACKGROUND:${NC}"
echo -e "  Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait

echo -e "${RED}Services stopped.${NC}"

