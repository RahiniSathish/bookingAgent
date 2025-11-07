"""
LiveKit Token Generation
Creates proper JWT tokens for LiveKit room connections
"""

import os
from livekit import api
from dotenv import load_dotenv

load_dotenv()

LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

def generate_token(room_name: str, participant_identity: str) -> str:
    """
    Generate a LiveKit access token
    
    Args:
        room_name: Name of the room to join
        participant_identity: Unique identifier for the participant
        
    Returns:
        JWT token string
    """
    token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
    
    token.with_identity(participant_identity).with_name(participant_identity).with_grants(
        api.VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=True,
            can_subscribe=True,
            can_publish_data=True,
        )
    )
    
    return token.to_jwt()


