#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║              🔐 CREATING ENVIRONMENT FILES                                 ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# ════════════════════════════════════════════════════════════════════════
# CREATE BACKEND .env FILE
# ════════════════════════════════════════════════════════════════════════

echo "📝 Creating backend .env file..."

cat > .env << 'EOF'
# ════════════════════════════════════════════════════════════════════════
# BACKEND CONFIGURATION
# ════════════════════════════════════════════════════════════════════════

# Server Configuration
PORT=4000
HOST=0.0.0.0
API_PORT=4000
ENVIRONMENT=development
DEBUG=true

# LiveKit Configuration
LIVEKIT_URL=wss://aiinterviewprod-anr5bvh0.livekit.cloud
LIVEKIT_API_KEY=APIiwNSMd2Nsxvq
LIVEKIT_API_SECRET=KWkVh4Z01q4Sbx9xJegB1fE7iyGijslBNCvogi1Igpb

# Vapi Configuration (if using Vapi widget)
VAPI_PUBLIC_KEY=577ae6b3-53b9-4a37-b6f6-74e8e8808368
VAPI_ASSISTANT_ID=e1c04a87-a8cf-4438-a91b-5888f69d1ef2

# OpenAI (Optional - for advanced AI features)
# OPENAI_API_KEY=your_openai_api_key_here

# Bright Data (Optional - for real-time flights)
# BRIGHTDATA_API_KEY=your_brightdata_api_key_here

# Database
DATABASE_URL=sqlite:///./bookings.db

# Logging
LOG_LEVEL=INFO
LOG_FILE=backend.log
EOF

if [ -f ".env" ]; then
    echo "✅ Backend .env created successfully!"
else
    echo "❌ Failed to create backend .env"
    exit 1
fi

echo ""

# ════════════════════════════════════════════════════════════════════════
# CREATE CUSTOM WIDGET .env FILE
# ════════════════════════════════════════════════════════════════════════

echo "📝 Creating custom widget .env file..."

cat > custom-livekit-widget/.env << 'EOF'
# ════════════════════════════════════════════════════════════════════════
# CUSTOM LIVEKIT WIDGET CONFIGURATION
# ════════════════════════════════════════════════════════════════════════

# Backend API URL
VITE_BACKEND_URL=http://localhost:4000

# LiveKit Configuration (Your Credentials)
VITE_LIVEKIT_URL=wss://aiinterviewprod-anr5bvh0.livekit.cloud
VITE_LIVEKIT_API_KEY=APIiwNSMd2Nsxvq
VITE_LIVEKIT_API_SECRET=KWkVh4Z01q4Sbx9xJegB1fE7iyGijslBNCvogi1Igpb

# OpenAI (Optional - for better AI responses)
# VITE_OPENAI_API_KEY=your_openai_api_key_here
EOF

if [ -f "custom-livekit-widget/.env" ]; then
    echo "✅ Custom widget .env created successfully!"
else
    echo "❌ Failed to create custom widget .env"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║              ✅ ENVIRONMENT FILES CREATED!                                 ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📁 Files created:"
echo "   ✅ .env (backend)"
echo "   ✅ custom-livekit-widget/.env (widget)"
echo ""
echo "🔐 Your LiveKit credentials are configured!"
echo ""
echo "🚀 Next steps:"
echo "   1. Backend: python backend/server.py"
echo "   2. Widget: cd custom-livekit-widget && npm install && npm run dev"
echo ""
echo "⚠️  Note: The backend works WITHOUT .env (uses mock data)"
echo "   The custom widget NEEDS .env for LiveKit connection"
echo ""

