"""
Test LiveKit Dispatch API directly
This will help us determine if the dispatch endpoint is available
"""

import os
import asyncio
import aiohttp
from dotenv import load_dotenv
from livekit.api import AccessToken, VideoGrants

load_dotenv()

LIVEKIT_URL = os.getenv("LIVEKIT_URL", "wss://aiinterviewprod-anr5bvh0.livekit.cloud")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

async def test_dispatch():
    """Test the LiveKit Dispatch API"""
    
    # Convert wss:// to https://
    api_url = LIVEKIT_URL.replace("wss://", "https://").replace("ws://", "http://")
    project_domain = api_url.replace("https://", "").replace("http://", "")
    
    # Test room
    test_room = "test-dispatch-" + str(int(asyncio.get_event_loop().time()))
    
    print("=" * 70)
    print("🧪 TESTING LIVEKIT DISPATCH API")
    print("=" * 70)
    print(f"✅ LiveKit URL: {LIVEKIT_URL}")
    print(f"✅ API Domain: {project_domain}")
    print(f"✅ Test Room: {test_room}")
    print(f"✅ Agent Name: A_JbZTEGNYiLHj")
    print("=" * 70)
    
    # Generate Bearer token
    print("\n🔑 Generating Bearer token...")
    access_token = AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
    access_token.video_grant = VideoGrants(
        room_join=True,
        room=test_room,
        can_publish=True,
        can_subscribe=True
    )
    bearer_token = access_token.to_jwt()
    print(f"✅ Token generated: {bearer_token[:50]}...")
    
    # Test dispatch endpoint
    dispatch_url = f"https://{project_domain}/api/dispatch"
    print(f"\n📡 Testing dispatch endpoint: {dispatch_url}")
    
    dispatch_data = {
        "agent_name": "A_JbZTEGNYiLHj",
        "room": test_room
    }
    
    print(f"📦 Payload: {dispatch_data}")
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                dispatch_url,
                json=dispatch_data,
                headers={
                    "Authorization": f"Bearer {bearer_token}",
                    "Content-Type": "application/json"
                },
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                status = response.status
                text = await response.text()
                
                print(f"\n📊 RESPONSE:")
                print(f"   Status Code: {status}")
                print(f"   Response: {text}")
                
                if status in [200, 201]:
                    print(f"\n✅ ✅ ✅ DISPATCH API IS WORKING!")
                    print(f"✅ Agent dispatch successful!")
                    return True
                elif status == 404:
                    print(f"\n❌ DISPATCH API NOT AVAILABLE")
                    print(f"❌ The /api/dispatch endpoint does not exist")
                    print(f"❌ Your LiveKit Cloud plan might not support programmatic dispatch")
                    print(f"\n💡 SOLUTION:")
                    print(f"   1. Contact LiveKit Support to enable dispatch API")
                    print(f"   2. OR use dashboard-based Agent Dispatch (OPTION 1)")
                    print(f"   3. OR upgrade your LiveKit Cloud plan")
                    return False
                elif status == 401:
                    print(f"\n❌ AUTHENTICATION FAILED")
                    print(f"❌ Bearer token is invalid or expired")
                    return False
                elif status == 403:
                    print(f"\n❌ PERMISSION DENIED")
                    print(f"❌ API key doesn't have agent dispatch permissions")
                    return False
                else:
                    print(f"\n❌ UNKNOWN ERROR: HTTP {status}")
                    return False
                    
        except aiohttp.ClientConnectorError as e:
            print(f"\n❌ CONNECTION ERROR: {e}")
            print(f"❌ Cannot connect to LiveKit Cloud")
            return False
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            return False

if __name__ == "__main__":
    print("\n🚀 Starting dispatch API test...\n")
    result = asyncio.run(test_dispatch())
    
    print("\n" + "=" * 70)
    if result:
        print("✅ TEST PASSED - Dispatch API is working!")
        print("✅ Your backend should be able to dispatch agents successfully")
    else:
        print("❌ TEST FAILED - Dispatch API is NOT available")
        print("❌ You need to use dashboard-based dispatch (OPTION 1) instead")
    print("=" * 70)

