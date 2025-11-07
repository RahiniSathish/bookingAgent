#!/usr/bin/env python3
"""
LiveKit Voice Agent Backend with Alex System Prompt
Real-time multilingual travel assistant for Attar Travel Agency
"""

import asyncio
import logging
import os
from datetime import datetime
from typing import Optional, Dict, Any

import aiohttp
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import JobContext, WorkerOptions, cli

# Import the system prompt from central file
from SYSTEM_PROMPT import ALEX_SYSTEM_PROMPT

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("VoiceAssistant")

# ═══════════════════════════════════════════════════════════════
# VOICE ASSISTANT CLASS
# ═══════════════════════════════════════════════════════════════
class VoiceAssistant:
    def __init__(self):
        logger.info("🤖 Voice Assistant initialized")
        logger.info(f"📋 Using system prompt from SYSTEM_PROMPT.py")
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:4000")
        self.system_prompt = ALEX_SYSTEM_PROMPT
        logger.info(f"✅ System prompt loaded: {len(self.system_prompt)} characters")

    async def entrypoint(self, ctx: JobContext):
        """Main entry point for LiveKit voice agent"""
        logger.info(f"🚀 Joining LiveKit room: {ctx.room.name}")
        logger.info(f"🎤 Alex System Prompt Active - Ready for conversations!")
        await ctx.connect()

# ═══════════════════════════════════════════════════════════════
# JOB REQUEST HANDLER
# ═══════════════════════════════════════════════════════════════
async def request_handler(job_request: agents.JobRequest):
    """Accept incoming LiveKit room job requests"""
    logger.info(f"📨 Job request for room: {job_request.room.name}")
    await job_request.accept()

# ═══════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    # Load credentials
    LIVEKIT_URL = os.getenv("LIVEKIT_URL")
    LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
    LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
    
    if not all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
        raise ValueError("❌ Missing LiveKit credentials")
    
    logger.info("═══════════════════════════════════════════════════════════════")
    logger.info("✅ All credentials configured")
    logger.info("✅ Alex System Prompt loaded from SYSTEM_PROMPT.py")
    logger.info("✅ Ready to serve travel conversations!")
    logger.info("═══════════════════════════════════════════════════════════════")
    
    assistant = VoiceAssistant()
    
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=assistant.entrypoint,
            request_fnc=request_handler,
            agent_name="A_JbZTEGNYiLHj",  # Agent ID from LiveKit Cloud Dashboard
            ws_url=LIVEKIT_URL,
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET,
        )
    )
