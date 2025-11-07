#!/usr/bin/env python3
"""
LiveKit Voice Agent - MANUAL ROOM JOIN (No Dashboard Config Needed)
This agent manually joins rooms instead of waiting for dispatch
"""

import asyncio
import logging
import os
from datetime import datetime
from typing import Optional
from pathlib import Path

from dotenv import load_dotenv
from livekit import rtc, api
from livekit.agents import (
    Agent, 
    AgentSession,
    UserInputTranscribedEvent,
    ConversationItemAddedEvent,
    metrics,
    MetricsCollectedEvent
)
from livekit.plugins import deepgram, openai, silero
import aiohttp
import pytz
from collections import defaultdict

# Import system prompt
from SYSTEM_PROMPT import ALEX_SYSTEM_PROMPT

# Load environment
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

# Logging
logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("ManualJoinAgent")

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:4000")

# Track which rooms agent has joined
joined_rooms = set()


class ManualJoinVoiceAgent:
    """Voice agent that manually joins rooms without waiting for dispatch"""
    
    def __init__(self):
        logger.info("🤖 Manual Join Voice Assistant initialized")
        self.backend_url = BACKEND_URL
        self.active_sessions = {}
    
    async def monitor_rooms(self):
        """Monitor for new rooms and join them automatically"""
        logger.info("👀 Starting room monitor...")
        
        livekit_api = api.LiveKitAPI(
            LIVEKIT_URL.replace("wss://", "https://").replace("ws://", "http://"),
            LIVEKIT_API_KEY,
            LIVEKIT_API_SECRET
        )
        
        while True:
            try:
                # List all active rooms
                list_request = api.ListRoomsRequest()
                rooms_response = await livekit_api.room.list_rooms(list_request)
                rooms = rooms_response.rooms
                
                for room in rooms:
                    room_name = room.name
                    
                    # Skip if already joined
                    if room_name in joined_rooms:
                        continue
                    
                    # Check if room has participants (user joined)
                    if room.num_participants > 0:
                        logger.info(f"🎯 New room detected: {room_name} ({room.num_participants} participants)")
                        
                        # Mark as joined (before actually joining to avoid duplicates)
                        joined_rooms.add(room_name)
                        
                        # Join the room
                        asyncio.create_task(self.join_room(room_name))
                
                # Check every 2 seconds
                await asyncio.sleep(2)
                
            except Exception as e:
                logger.error(f"❌ Room monitor error: {e}")
                await asyncio.sleep(5)
    
    async def join_room(self, room_name: str):
        """Manually join a specific room"""
        try:
            logger.info(f"🚀 Manually joining room: {room_name}")
            
            # Generate token for agent
            from livekit.api import AccessToken, VideoGrants
            
            token = AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
            token.with_identity(f"agent-alex-{room_name[-6:]}")
            token.with_name("Alex AI Assistant")
            token.with_grants(VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True
            ))
            
            agent_token = token.to_jwt()
            logger.info(f"✅ Generated agent token for room: {room_name}")
            
            # Create room instance
            room = rtc.Room()
            
            # Connect to room
            await room.connect(LIVEKIT_URL, agent_token)
            logger.info(f"✅ Connected to room: {room_name}")
            
            # Wait a moment for connection to stabilize
            await asyncio.sleep(1)
            
            # Create OpenAI Realtime Model
            realtime_model = openai.realtime.RealtimeModel(
                api_key=OPENAI_API_KEY,
                voice="alloy",
                temperature=0.8,
                modalities=["text", "audio"],
            )
            
            # Create AgentSession
            session = AgentSession(
                stt=deepgram.STT(
                    api_key=DEEPGRAM_API_KEY,
                    model="nova-2",
                    language="en-US"
                ),
                tts=openai.TTS(
                    api_key=OPENAI_API_KEY,
                    voice="alloy",
                    speed=1.0,
                    model="tts-1"
                ),
                llm=realtime_model,
                vad=silero.VAD.load(
                    min_speech_duration=0.1,
                    min_silence_duration=0.5,
                    activation_threshold=0.5,
                    sample_rate=16000,
                    prefix_padding_duration=0.3,
                ),
                allow_interruptions=True,
                min_interruption_duration=0.3,
                min_interruption_words=2,
                discard_audio_if_uninterruptible=True,
                use_tts_aligned_transcript=False,
                min_endpointing_delay=0.4,
                max_endpointing_delay=5.0,
                agent_false_interruption_timeout=2.0,
            )
            
            logger.info(f"✅ AgentSession created for room: {room_name}")
            
            # Create greeting
            saudi_tz = pytz.timezone('Asia/Riyadh')
            current_time = datetime.now(saudi_tz)
            hour = current_time.hour
            
            if 5 <= hour < 12:
                time_greeting = "Good morning"
            elif 12 <= hour < 17:
                time_greeting = "Good afternoon"
            else:
                time_greeting = "Good evening"
            
            instructions = f"""
========================================
🎯 MANDATORY FIRST ACTION - GREET THE USER IMMEDIATELY:
========================================
When the conversation starts, YOU MUST IMMEDIATELY greet the user with:

"{time_greeting}! Welcome to Attar Travel. I'm Alex, your AI travel assistant. 
Are you planning to travel from Saudi Arabia today? I'm here to help you with flights, bookings, 
and all your travel needs!"

CRITICAL RULES:
✅ Say this greeting IMMEDIATELY when you connect
✅ Use the time greeting: "{time_greeting}"
✅ After greeting, WAIT for the user to tell you what they need
✅ DO NOT immediately ask follow-up questions after greeting

AFTER YOUR GREETING:
- WAIT for the user to speak
- Let THEM lead the conversation
- Respond naturally to what they say
========================================

{ALEX_SYSTEM_PROMPT}
"""
            
            # Create agent
            agent = Agent(
                instructions=instructions,
                llm=realtime_model
            )
            logger.info(f"✅ Agent created for room: {room_name}")
            
            # Start the session
            logger.info(f"🎙️ Starting voice assistant in room: {room_name}")
            await session.start(agent, room=room)
            logger.info(f"🎙️ Voice assistant ACTIVE in room: {room_name}")
            
            # Store session
            self.active_sessions[room_name] = {
                "room": room,
                "session": session,
                "agent": agent
            }
            
            # Keep session alive
            while room.connection_state == rtc.ConnectionState.CONN_CONNECTED:
                await asyncio.sleep(1)
            
            logger.info(f"🔚 Session ended for room: {room_name}")
            
            # Cleanup
            if room_name in self.active_sessions:
                del self.active_sessions[room_name]
            if room_name in joined_rooms:
                joined_rooms.remove(room_name)
            
        except Exception as e:
            logger.error(f"❌ Error joining room {room_name}: {e}", exc_info=True)
            # Remove from joined set so it can be retried
            if room_name in joined_rooms:
                joined_rooms.remove(room_name)


async def main():
    """Main entry point"""
    
    # Validate credentials
    if not all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
        raise ValueError("❌ Missing LiveKit credentials")
    
    if not OPENAI_API_KEY:
        raise ValueError("❌ Missing OPENAI_API_KEY")
    
    if not DEEPGRAM_API_KEY:
        logger.warning("⚠️ DEEPGRAM_API_KEY not configured")
    
    logger.info("═══════════════════════════════════════════════════════════════")
    logger.info("🎙️  LIVEKIT MANUAL JOIN AGENT - OpenAI Realtime API")
    logger.info("═══════════════════════════════════════════════════════════════")
    logger.info(f"✅ LiveKit URL: {LIVEKIT_URL}")
    logger.info(f"✅ OpenAI Realtime API: Available")
    logger.info(f"✅ Mode: MANUAL ROOM JOIN (No dashboard config needed)")
    logger.info(f"✅ Agent: attar-travel-assistant")
    logger.info("═══════════════════════════════════════════════════════════════")
    logger.info("🚀 Starting room monitor...")
    logger.info("👀 Will automatically join new rooms with participants")
    logger.info("═══════════════════════════════════════════════════════════════")
    
    # Create agent instance
    agent = ManualJoinVoiceAgent()
    
    # Start monitoring rooms
    await agent.monitor_rooms()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("🛑 Agent stopped by user")
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}", exc_info=True)

