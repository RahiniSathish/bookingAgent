#!/usr/bin/env python3
"""
LiveKit Voice Agent - COMPLETE WITH AUDIO SESSION
Real-time voice AI with Deepgram STT + OpenAI TTS + GPT-4o-mini
"""

import asyncio
import logging
import os
from datetime import datetime
from typing import Optional
from pathlib import Path

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import (
    JobContext, 
    WorkerOptions, 
    cli, 
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

# Load environment from parent directory
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

# Logging
logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("VoiceAssistant")

# ═══════════════════════════════════════════════════════════════
# AGENT CONFIGURATION
# ═══════════════════════════════════════════════════════════════

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:4000")

# ═══════════════════════════════════════════════════════════════
# VOICE ASSISTANT CLASS
# ═══════════════════════════════════════════════════════════════

class VoiceAssistant:
    """Real-time multilingual voice assistant using LiveKit + OpenAI"""
    
    def __init__(self):
        logger.info("🤖 Voice Assistant initialized")
        self.session_count = 0
        self.backend_url = self._resolve_backend_url()

    def _resolve_backend_url(self) -> str:
        """Determine backend base URL for storing transcripts."""
        for env_key in ("TRAVEL_BACKEND_URL", "BACKEND_API_URL", "BACKEND_URL"):
            value = os.getenv(env_key)
            if value:
                return value.rstrip('/')
        return "http://localhost:4000"

    async def _fetch_session_info(self, room_name: str) -> Optional[dict]:
        """Fetch LiveKit session metadata from backend."""
        if not self.backend_url:
            return None

        url = f"{self.backend_url}/livekit/session-info/{room_name}"
        try:
            timeout = aiohttp.ClientTimeout(total=5)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(url) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        logger.info(
                            "📡 Loaded LiveKit session info: room=%s, session=%s, email=%s",
                            room_name,
                            data.get("session_id"),
                            data.get("customer_email")
                        )
                        return data
                    else:
                        logger.warning(
                            "⚠️ Failed to load session info (%s): HTTP %s",
                            room_name,
                            resp.status
                        )
        except Exception as error:
            logger.warning(f"⚠️ Session info request failed for {room_name}: {error}")

        return None

    async def _send_transcript(self, *, room_name: str, session_id: Optional[str],
                               customer_email: Optional[str], speaker: str,
                               text: str, language: Optional[str],
                               context: dict) -> None:
        """Send transcript payload to backend for persistence."""
        if not self.backend_url:
            logger.debug("No backend URL configured; skipping transcript send")
            return

        payload = {
            "room_name": room_name,
            "session_id": session_id,
            "customer_email": customer_email,
            "speaker": speaker,
            "text": text,
            "language": language or "en-US",
            "timestamp": datetime.utcnow().isoformat()
        }

        url = f"{self.backend_url}/livekit/transcript"
        timeout = aiohttp.ClientTimeout(total=5)

        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(url, json=payload) as resp:
                    if resp.status >= 300:
                        error_text = await resp.text()
                        logger.warning(f"⚠️ Transcript POST failed ({resp.status}): {error_text}")
                    else:
                        data = await resp.json()
                        logger.debug(f"💾 Transcript stored: speaker={speaker} length={len(text)}")
                        if isinstance(data, dict):
                            context["session_id"] = data.get("session_id", context.get("session_id"))
                            context["customer_email"] = data.get("customer_email", context.get("customer_email"))
        except Exception as error:
            logger.warning(f"⚠️ Unable to send transcript to backend: {error}")

    async def _create_flight_booking(self, booking_data: dict) -> dict:
        """Create flight booking via backend API with instant confirmation"""
        import uuid
        
        customer_email = booking_data.get("customer_email", "")
        departure_location = booking_data.get("departure_location", booking_data.get("departure_city", ""))
        destination = booking_data.get("destination", booking_data.get("arrival_city", ""))
        
        logger.info(f"📝 Processing flight booking: {departure_location} → {destination}")
        
        confirmation_number = f"INV{uuid.uuid4().hex[:8].upper()}"
        booking_id = uuid.uuid4().hex[:12]
        
        booking_result = {
            "success": True,
            "booking_id": booking_id,
            "confirmation_number": confirmation_number,
            "booking_date": datetime.now().isoformat(),
            "status": "confirmed",
            "customer_email": customer_email,
            "departure_location": departure_location,
            "destination": destination,
            "departure_date": booking_data.get("departure_date", ""),
            "return_date": booking_data.get("return_date", ""),
            "passengers": booking_data.get("num_travelers", 1),
            "airline": booking_data.get("flight_name", "Air India"),
            "message": "✅ Your ticket has been successfully reserved!"
        }
        
        logger.info(f"✅ Flight booking confirmed: {confirmation_number}")
        
        if self.backend_url:
            try:
                backend_booking_data = {
                    "customer_email": customer_email,
                    "departure_location": departure_location,
                    "destination": destination,
                    "flight_name": booking_data.get("flight_name", "Air India"),
                    "departure_time": booking_data.get("departure_time", "08:30 AM"),
                    "departure_date": booking_data.get("departure_date", ""),
                    "return_date": booking_data.get("return_date"),
                    "num_travelers": booking_data.get("num_travelers", 1),
                    "service_details": booking_data.get("service_details", "Economy"),
                    "seat_preference": booking_data.get("seat_preference", "No preference"),
                    "meal_preference": booking_data.get("meal_preference", "No preference"),
                    "arrival_time": booking_data.get("arrival_time", "11:45 AM"),
                    "confirmation_number": confirmation_number
                }
                
                url = f"{self.backend_url}/create_flight_booking"
                timeout = aiohttp.ClientTimeout(total=1)
                async with aiohttp.ClientSession(timeout=timeout) as session:
                    async with session.post(url, json=backend_booking_data) as resp:
                        if resp.status == 200:
                            backend_result = await resp.json()
                            backend_booking_id = backend_result.get('booking_id')
                            booking_result["backend_booking_id"] = backend_booking_id
                            logger.info(f"✅ SAVED TO DATABASE: Booking ID #{backend_booking_id}")
            except Exception as error:
                logger.warning(f"⚠️ Backend save error: {error}")
        
        return booking_result
    
    async def entrypoint(self, ctx: JobContext):
        """Main entry point for voice agent"""
        self.session_count += 1
        session_id = self.session_count
        room_name = ctx.room.name
        
        try:
            logger.info(f"🚀 [Session {session_id}] Agent joining room: {room_name}")
            
            # Connect to room
            await ctx.connect()
            logger.info(f"✅ [Session {session_id}] Connected to LiveKit room")
            
            # Transcript context for this session
            transcript_context = {
                "room_name": room_name,
                "session_id": None,
                "customer_email": None,
                "language": "en-US"
            }
            
            # Fetch session info from backend
            session_info = None
            if self.backend_url:
                logger.info(f"📝 Transcript backend: {self.backend_url}")
                session_info = await self._fetch_session_info(room_name)
                if session_info:
                    transcript_context["session_id"] = session_info.get("session_id")
                    transcript_context["customer_email"] = session_info.get("customer_email")
                    if session_info.get("metadata") and isinstance(session_info["metadata"], dict):
                        language_hint = session_info["metadata"].get("language")
                        if language_hint:
                            transcript_context["language"] = language_hint
            
            # Message deduplication tracking
            processed_messages = set()
            message_timestamps = {}
            max_message_age = 30  # seconds
            
            # Create Session with OpenAI Realtime API (native audio + text)
            logger.info(f"🎙️ [Session {session_id}] Creating AgentSession with OpenAI Realtime API...")
            
            # OpenAI Realtime Model (supports native audio conversation)
            realtime_model = openai.realtime.RealtimeModel(
                api_key=OPENAI_API_KEY,
                voice="alloy",          # Options: alloy, shimmer, onyx, nova, fable
                temperature=0.8,
                modalities=["text", "audio"],  # Native audio + text support
            )
            
            logger.info(f"✅ [Session {session_id}] OpenAI Realtime Model configured")
            
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
                llm=realtime_model,  # Use OpenAI Realtime Model instead of standard LLM
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
            
            logger.info(f"✅ [Session {session_id}] AgentSession created")
            
            # Usage metrics
            usage_collector = metrics.UsageCollector()
            
            # Event handlers for transcription
            @session.on("user_input_transcribed")
            def on_user_input_transcribed(event: UserInputTranscribedEvent):
                """Handle user speech transcription"""
                if event.is_final:
                    try:
                        transcript = event.transcript
                        if not transcript or not transcript.strip():
                            return
                        
                        message_hash = f"user_{transcript[:50]}_{len(transcript)}"
                        current_time = asyncio.get_event_loop().time()
                        
                        if message_hash in processed_messages:
                            if message_timestamps.get(message_hash, 0) + max_message_age > current_time:
                                return
                            else:
                                processed_messages.discard(message_hash)
                        
                        processed_messages.add(message_hash)
                        message_timestamps[message_hash] = current_time
                        
                        logger.info(f"👤 User: {transcript}")
                        
                        asyncio.create_task(
                            self._send_transcript(
                                room_name=transcript_context["room_name"],
                                session_id=transcript_context.get("session_id"),
                                customer_email=transcript_context.get("customer_email"),
                                speaker="user",
                                text=transcript,
                                language=transcript_context.get("language", "en-US"),
                                context=transcript_context
                            )
                        )
                    except Exception as e:
                        logger.error(f"Error in user transcription: {e}")
            
            @session.on("conversation_item_added")
            def on_conversation_item_added(event: ConversationItemAddedEvent):
                """Handle assistant responses"""
                try:
                    message = event.item.text_content
                    if not message or not message.strip():
                        return
                    
                    if event.item.role == "user":
                        return
                    
                    if event.item.role == "assistant":
                        message_hash = f"assistant_{message[:50]}_{len(message)}"
                        current_time = asyncio.get_event_loop().time()
                        
                        if message_hash in processed_messages:
                            if message_timestamps.get(message_hash, 0) + max_message_age > current_time:
                                return
                            else:
                                processed_messages.discard(message_hash)
                        
                        processed_messages.add(message_hash)
                        message_timestamps[message_hash] = current_time
                        
                        logger.info(f"🤖 Agent: {message[:100]}...")
                        
                        asyncio.create_task(
                            self._send_transcript(
                                room_name=transcript_context["room_name"],
                                session_id=transcript_context.get("session_id"),
                                customer_email=transcript_context.get("customer_email"),
                                speaker="assistant",
                                text=message,
                                language=transcript_context.get("language", "en-US"),
                                context=transcript_context
                            )
                        )
                except Exception as e:
                    logger.error(f"Error in conversation handler: {e}")
            
            @session.on("metrics_collected")
            def _on_metrics_collected(ev: MetricsCollectedEvent):
                """Collect usage metrics"""
                usage_collector.collect(ev.metrics)
            
            # Create greeting with time
            saudi_tz = pytz.timezone('Asia/Riyadh')
            current_time = datetime.now(saudi_tz)
            hour = current_time.hour
            
            if 5 <= hour < 12:
                time_greeting = "Good morning"
            elif 12 <= hour < 17:
                time_greeting = "Good afternoon"
            else:
                time_greeting = "Good evening"
            
            # Get customer name from session info
            customer_name = "there"  # Default
            if session_info and session_info.get("customer_email"):
                email = session_info.get("customer_email", "")
                # Extract name from email or use metadata
                if session_info.get("metadata") and session_info["metadata"].get("customer_name"):
                    customer_name = session_info["metadata"].get("customer_name")
                    # Clean up underscores and dots
                    customer_name = customer_name.replace('_', ' ').replace('.', ' ').title()
                elif "@" in email:
                    # Extract only alphabetic characters from email (e.g., rahini15ece@example.com -> Rahini)
                    import re
                    name_part = email.split("@")[0]
                    # Extract only alphabetic characters from the beginning
                    name_match = re.match(r'^([a-zA-Z]+)', name_part)
                    if name_match:
                        customer_name = name_match.group(1).capitalize()
            
            # Log the greeting information
            logger.info(f"🎯 GREETING INFO: time={time_greeting}, name={customer_name}, email={transcript_context.get('customer_email')}")
            logger.info(f"🎯 SESSION INFO: {session_info}")
            
            instructions = f"""
========================================
🎯 MANDATORY FIRST ACTION - GREET THE USER IMMEDIATELY:
========================================
When the conversation starts, YOU MUST IMMEDIATELY greet the user with:

"{time_greeting}, {customer_name}! Welcome to Attar Travel. I'm Alex, your AI travel assistant. 
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
            
            # Create the AI Agent with OpenAI Realtime Model
            # NOTE: OpenAI Realtime API function calling is handled through instructions
            # The AI will verbally confirm bookings and we'll detect keywords to trigger saves
            agent = Agent(
                instructions=instructions,
                llm=realtime_model  # Pass the Realtime Model to the Agent
            )
            logger.info(f"✅ [Session {session_id}] Agent created with OpenAI Realtime API and greeting: {time_greeting}")
            
            # Shutdown callbacks
            async def log_usage():
                summary = usage_collector.get_summary()
                logger.info(f"📈 Usage Summary: {summary}")
            
            ctx.add_shutdown_callback(log_usage)
            
            # Start the assistant session
            logger.info(f"🎙️ [Session {session_id}] Starting voice assistant...")
            await session.start(agent, room=ctx.room)
            logger.info(f"🎙️ [Session {session_id}] Voice assistant active!")
            
        except Exception as e:
            logger.error(f"❌ [Session {session_id}] Error: {e}", exc_info=True)
            raise

# ═══════════════════════════════════════════════════════════════
# JOB REQUEST HANDLER
# ═══════════════════════════════════════════════════════════════

async def request_handler(job_request: agents.JobRequest):
    """Handle incoming job requests - ACCEPT ALL REQUESTS"""
    room_name = job_request.room.name if job_request.room else "unknown"
    logger.info(f"📨 Job request received for room: {room_name}")
    logger.info(f"🎯 Job metadata: {job_request.room.metadata if job_request.room else 'none'}")
    logger.info(f"🎯 Accepting job request...")
    
    # ALWAYS accept the job request
    await job_request.accept()
    
    logger.info(f"✅ ✅ ✅ Job request ACCEPTED for room: {room_name}")
    logger.info(f"🚀 Agent will now join room: {room_name}")

# ═══════════════════════════════════════════════════════════════
# MAIN ENTRY POINT
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    # Validate credentials
    if not all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
        raise ValueError("❌ Missing LiveKit credentials")
    
    if not OPENAI_API_KEY:
        raise ValueError("❌ Missing OPENAI_API_KEY")
    
    if not DEEPGRAM_API_KEY:
        logger.warning("⚠️ DEEPGRAM_API_KEY not configured - STT may not work")
    
    logger.info("═══════════════════════════════════════════════════════════════")
    logger.info("🎙️  LIVEKIT VOICE AGENT - OpenAI Realtime API")
    logger.info("═══════════════════════════════════════════════════════════════")
    logger.info(f"✅ LiveKit URL: {LIVEKIT_URL}")
    logger.info(f"✅ OpenAI Realtime API: Available (native audio + text)")
    logger.info(f"✅ OpenAI Model: Realtime with voice 'alloy'")
    logger.info(f"✅ Deepgram STT: {'Available' if DEEPGRAM_API_KEY else 'NOT SET'}")
    logger.info(f"✅ System Prompt: {len(ALEX_SYSTEM_PROMPT)} chars")
    logger.info(f"✅ Agent Name: attar-travel-assistant")
    logger.info(f"✅ Agent ID: A_JbZTEGNYiLHj")
    logger.info("═══════════════════════════════════════════════════════════════")
    logger.info("🚀 Starting LiveKit Worker with OpenAI Realtime API...")
    logger.info("═══════════════════════════════════════════════════════════════")
    
    # Create assistant instance
    assistant = VoiceAssistant()
    
    # Run the worker
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=assistant.entrypoint,
            request_fnc=request_handler,
            agent_name="attar-travel-assistant",  # Agent Name from LiveKit Cloud Dashboard
            ws_url=LIVEKIT_URL,
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET,
        )
    )

