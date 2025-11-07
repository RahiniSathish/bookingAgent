#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           🎴 TEST VAPI NATIVE CARDS FORMAT                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Testing backend with VAPI webhook format..."
echo ""

# Test the VAPI webhook
echo "📤 Sending VAPI function call..."
RESPONSE=$(curl -s -X POST http://localhost:8000/webhooks/vapi \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "type": "function-call",
      "function": {
        "name": "search_flights",
        "parameters": {
          "origin": "Bangalore",
          "destination": "Jeddah",
          "departure_date": "2025-01-15"
        }
      }
    }
  }')

echo "📥 Response received:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if response has correct structure
HAS_TYPE=$(echo "$RESPONSE" | jq -r '.type' 2>/dev/null)
HAS_CARDS=$(echo "$RESPONSE" | jq -r '.cards' 2>/dev/null)
CARD_COUNT=$(echo "$RESPONSE" | jq -r '.cards | length' 2>/dev/null)

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                     VALIDATION RESULTS                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if [ "$HAS_TYPE" == "cards" ]; then
    echo -e "${GREEN}✅ Response has 'type': 'cards'${NC}"
else
    echo -e "${RED}❌ Response missing 'type': 'cards'${NC}"
    echo "   Found type: $HAS_TYPE"
fi

if [ "$HAS_CARDS" != "null" ] && [ "$HAS_CARDS" != "" ]; then
    echo -e "${GREEN}✅ Response has 'cards' array${NC}"
else
    echo -e "${RED}❌ Response missing 'cards' array${NC}"
fi

if [ "$CARD_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Cards array has $CARD_COUNT cards${NC}"
else
    echo -e "${RED}❌ Cards array is empty${NC}"
fi

echo ""

# Show first card structure
echo "📋 First Card Structure:"
echo "$RESPONSE" | jq '.cards[0]' 2>/dev/null || echo "Could not parse first card"
echo ""

# Validate card structure
FIRST_CARD=$(echo "$RESPONSE" | jq '.cards[0]' 2>/dev/null)
HAS_TITLE=$(echo "$FIRST_CARD" | jq -r '.title' 2>/dev/null)
HAS_SUBTITLE=$(echo "$FIRST_CARD" | jq -r '.subtitle' 2>/dev/null)
HAS_FOOTER=$(echo "$FIRST_CARD" | jq -r '.footer' 2>/dev/null)
HAS_BUTTONS=$(echo "$FIRST_CARD" | jq -r '.buttons' 2>/dev/null)

echo "🔍 Card Field Validation:"
if [ "$HAS_TITLE" != "null" ] && [ "$HAS_TITLE" != "" ]; then
    echo -e "${GREEN}✅ title: $HAS_TITLE${NC}"
else
    echo -e "${RED}❌ title missing${NC}"
fi

if [ "$HAS_SUBTITLE" != "null" ] && [ "$HAS_SUBTITLE" != "" ]; then
    echo -e "${GREEN}✅ subtitle: $HAS_SUBTITLE${NC}"
else
    echo -e "${YELLOW}⚠️  subtitle missing (optional)${NC}"
fi

if [ "$HAS_FOOTER" != "null" ] && [ "$HAS_FOOTER" != "" ]; then
    echo -e "${GREEN}✅ footer: $HAS_FOOTER${NC}"
else
    echo -e "${YELLOW}⚠️  footer missing (optional)${NC}"
fi

if [ "$HAS_BUTTONS" != "null" ] && [ "$HAS_BUTTONS" != "" ]; then
    BUTTON_COUNT=$(echo "$FIRST_CARD" | jq '.buttons | length' 2>/dev/null)
    echo -e "${GREEN}✅ buttons: $BUTTON_COUNT button(s)${NC}"
    echo "$FIRST_CARD" | jq '.buttons[0]' 2>/dev/null | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠️  buttons missing (optional)${NC}"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                         SUMMARY                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if [ "$HAS_TYPE" == "cards" ] && [ "$CARD_COUNT" -gt 0 ] && [ "$HAS_TITLE" != "null" ]; then
    echo -e "${GREEN}✅ VAPI Card Format: VALID${NC}"
    echo ""
    echo "Your backend is correctly returning VAPI native card format!"
    echo ""
    echo "Next steps:"
    echo "  1. Update VAPI system prompt (see VAPI_SYSTEM_PROMPT_FOR_CARDS.txt)"
    echo "  2. Test in widget: http://localhost:4000/custom-widget-simple.html"
    echo "  3. Say: 'Find flights from Bangalore to Jeddah on January 15'"
else
    echo -e "${RED}❌ VAPI Card Format: INVALID${NC}"
    echo ""
    echo "Issues detected. Please check:"
    echo "  1. Backend server.py returns correct format"
    echo "  2. Mock database has flights for the route"
    echo "  3. Date format is correct (2025-01-15)"
fi

echo ""
