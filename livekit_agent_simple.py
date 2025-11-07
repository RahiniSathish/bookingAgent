#!/usr/bin/env python3
"""
LiveKit Voice Agent - SIMPLIFIED VERSION
Simple entrypoint structure as requested
"""

import os
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentSession, Agent
from livekit.plugins import deepgram, openai, silero
from SYSTEM_PROMPT import ALEX_SYSTEM_PROMPT
from datetime import datetime
import pytz

# Load environment
load_dotenv()

# Get credentials
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")


async def entrypoint(ctx: agents.JobContext):
    """Entry point for the agent - SIMPLIFIED VERSION"""
    
    print(f"🚀 Agent joining room: {ctx.room.name}")
    
    # Connect to room
    await ctx.connect()
    print(f"✅ Connected to room")
    
    # Create OpenAI Realtime Model
    realtime_model = openai.realtime.RealtimeModel(
        api_key=OPENAI_API_KEY,
        voice="alloy",
        temperature=0.8,
        modalities=["text", "audio"],
    )
    
    # Configure the voice pipeline with the essentials
    session = AgentSession(
        stt=deepgram.STT(
            api_key=DEEPGRAM_API_KEY,
            model="nova-2",
            language="en-US"
        ),
        llm=realtime_model,  # Use OpenAI Realtime API
        tts=openai.TTS(
            api_key=OPENAI_API_KEY,
            voice="alloy",
            model="tts-1"
        ),
        vad=silero.VAD.load(),
    )
    
    print(f"✅ AgentSession created")
    
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
    
    # Create instructions with greeting
    instructions = f"""
{time_greeting}! Welcome to Attar Travel. I'm Alex, your AI travel assistant.

{ALEX_SYSTEM_PROMPT}
"""
    
    # Create agent
    agent = Agent(
        instructions=instructions,
        llm=realtime_model
    )
    
    print(f"✅ Agent created with greeting: {time_greeting}")
    
    # Start the session
    print(f"🎙️ Starting voice assistant...")
    await session.start(agent, room=ctx.room)
    print(f"🎙️ Voice assistant active!")


if __name__ == "__main__":
    # Validate credentials
    if not all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, OPENAI_API_KEY, DEEPGRAM_API_KEY]):
        raise ValueError("❌ Missing required credentials in .env")
    
    print("═══════════════════════════════════════════════════════════════")
    print("🎙️  LIVEKIT VOICE AGENT - SIMPLIFIED VERSION")
    print("═══════════════════════════════════════════════════════════════")
    print(f"✅ LiveKit URL: {LIVEKIT_URL}")
    print(f"✅ OpenAI Realtime API: Available")
    print(f"✅ Agent Name: attar-travel-assistant")
    print("═══════════════════════════════════════════════════════════════")
    print("🚀 Starting agent...")
    print("═══════════════════════════════════════════════════════════════")
    
    # Run the agent
    agents.cli.run_app(
        agents.WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="attar-travel-assistant",
            ws_url=LIVEKIT_URL,
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET,
        )
    )


