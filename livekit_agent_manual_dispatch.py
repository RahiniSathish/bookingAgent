"""
LiveKit Agent Manual Dispatch
This script monitors for new rooms and manually dispatches the agent
"""

import os
import asyncio
import logging
import aiohttp
from dotenv import load_dotenv
from livekit import api as lk_api

# Load environment
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# LiveKit credentials
LIVEKIT_URL = os.getenv("LIVEKIT_URL", "wss://aiinterviewprod-anr5bvh0.livekit.cloud")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
AGENT_NAME = "A_JbZTEGNYiLHj"

# Convert wss:// to https:// for API calls
API_URL = LIVEKIT_URL.replace("wss://", "https://").replace("ws://", "http://")

# Track rooms we've already dispatched to
dispatched_rooms = set()

async def dispatch_agent_to_room(room_name: str):
    """Dispatch agent to a specific room using LiveKit Agent Dispatch API"""
    try:
        logger.info(f"🤖 Dispatching agent '{AGENT_NAME}' to room: {room_name}")
        
        # Create agent dispatch service
        agent_service = lk_api.agent_dispatch_service.AgentDispatchService(
            API_URL,
            LIVEKIT_API_KEY,
            LIVEKIT_API_SECRET
        )
        
        # Create dispatch request
        dispatch_request = lk_api.CreateAgentDispatchRequest(
            room=room_name,
            agent_name=AGENT_NAME
        )
        
        # Dispatch the agent
        response = await agent_service.create_dispatch(dispatch_request)
        
        logger.info(f"✅ Agent dispatched successfully to room: {room_name}")
        logger.info(f"📋 Dispatch response: {response}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error dispatching agent to room {room_name}: {e}")
        logger.error(f"❌ Error type: {type(e).__name__}")
        return False

async def monitor_rooms():
    """Monitor for new rooms and dispatch agent automatically"""
    logger.info("═══════════════════════════════════════════════════════════════")
    logger.info("🤖 LiveKit Agent Manual Dispatch Monitor")
    logger.info("═══════════════════════════════════════════════════════════════")
    logger.info(f"✅ LiveKit URL: {API_URL}")
    logger.info(f"✅ Agent Name: {AGENT_NAME}")
    logger.info(f"🔍 Monitoring for new rooms...")
    logger.info("═══════════════════════════════════════════════════════════════")
    
    # Create aiohttp session
    async with aiohttp.ClientSession() as session:
        # Create room service
        room_svc = lk_api.room_service.RoomService(
            session,
            API_URL,
            LIVEKIT_API_KEY,
            LIVEKIT_API_SECRET
        )
        
        while True:
            try:
                # List all rooms
                rooms_response = await room_svc.list_rooms(lk_api.ListRoomsRequest())
                
                for room in rooms_response.rooms:
                    room_name = room.name
                    
                    # Skip if already dispatched
                    if room_name in dispatched_rooms:
                        continue
                    
                    # Check if room has participants (excluding agents)
                    if room.num_participants > 0:
                        logger.info(f"🆕 New room detected: {room_name} ({room.num_participants} participants)")
                        
                        # Dispatch agent to this room
                        success = await dispatch_agent_to_room(room_name)
                        
                        if success:
                            # Mark as dispatched
                            dispatched_rooms.add(room_name)
                            logger.info(f"✅ Room {room_name} marked as dispatched")
                        else:
                            logger.warning(f"⚠️ Failed to dispatch to room: {room_name}")
                
                # Sleep for 2 seconds before checking again
                await asyncio.sleep(2)
                
            except Exception as e:
                logger.error(f"❌ Error in room monitoring loop: {e}")
                await asyncio.sleep(5)  # Wait longer on error

if __name__ == "__main__":
    try:
        asyncio.run(monitor_rooms())
    except KeyboardInterrupt:
        logger.info("🛑 Shutting down room monitor...")

