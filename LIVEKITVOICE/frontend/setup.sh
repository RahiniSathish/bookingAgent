#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║           🎙️  CUSTOM LIVEKIT TRAVEL WIDGET - SETUP                       ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo "✅ node found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                            ║"
    echo "║                      ✅ SETUP COMPLETE!                                    ║"
    echo "║                                                                            ║"
    echo "╚════════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🚀 To start the app:"
    echo ""
    echo "   npm run dev"
    echo ""
    echo "📖 Or read README.md for more details"
    echo ""
    echo "🌐 App will run on: http://localhost:3002"
    echo ""
    echo "⚠️  IMPORTANT: Make sure backend is running on port 4000"
    echo "   cd .. && python backend/server.py"
    echo ""
else
    echo ""
    echo "❌ Installation failed. Please check the errors above."
    exit 1
fi

