"""
Vapi MCP (Model Context Protocol) Client Integration
Connects to Vapi's MCP server via SSE for real-time communication
"""

import os
import json
import logging
import asyncio
from typing import Dict, Any, Optional
import aiohttp
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class VapiMCPClient:
    """Client for Vapi MCP Server using SSE transport"""
    
    def __init__(self):
        self.vapi_token = os.getenv("VAPI_PUBLIC_KEY") or os.getenv("VAPI_API_KEY")
        self.mcp_url = "https://mcp.vapi.ai/sse"
        self.session = None
        self.connected = False
        
        if not self.vapi_token:
            logger.warning("⚠️ VAPI_API_KEY not configured - MCP client disabled")
        else:
            logger.info("✅ Vapi MCP Client initialized")
    
    async def connect(self):
        """Connect to Vapi MCP server"""
        if not self.vapi_token:
            logger.error("❌ Cannot connect to Vapi MCP - API key missing")
            return False
        
        try:
            self.session = aiohttp.ClientSession()
            headers = {
                "Authorization": f"Bearer {self.vapi_token}",
                "Accept": "text/event-stream"
            }
            
            logger.info("🔌 Connecting to Vapi MCP server...")
            
            # Test connection
            async with self.session.get(self.mcp_url, headers=headers) as response:
                if response.status == 200:
                    self.connected = True
                    logger.info("✅ Connected to Vapi MCP server")
                    return True
                else:
                    logger.error(f"❌ Failed to connect: Status {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"❌ MCP connection error: {e}")
            return False
    
    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Optional[Dict]:
        """Call a tool on the Vapi MCP server"""
        if not self.connected or not self.session:
            logger.warning("⚠️ Not connected to MCP server")
            return None
        
        try:
            headers = {
                "Authorization": f"Bearer {self.vapi_token}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "name": tool_name,
                "arguments": arguments
            }
            
            logger.info(f"🔧 Calling MCP tool: {tool_name}")
            
            async with self.session.post(
                f"{self.mcp_url}/call-tool",
                headers=headers,
                json=payload
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"✅ Tool {tool_name} executed successfully")
                    return result
                else:
                    logger.error(f"❌ Tool call failed: Status {response.status}")
                    return None
                    
        except Exception as e:
            logger.error(f"❌ Tool call error: {e}")
            return None
    
    async def list_assistants(self) -> Optional[list]:
        """List available Vapi assistants"""
        result = await self.call_tool("list_assistants", {})
        if result and "content" in result:
            try:
                # Parse response
                content = result["content"]
                if isinstance(content, list) and len(content) > 0:
                    text_content = content[0].get("text", "{}")
                    return json.loads(text_content)
            except Exception as e:
                logger.error(f"❌ Error parsing assistants: {e}")
        return None
    
    async def create_call(
        self,
        assistant_id: str,
        customer_phone: str,
        phone_number_id: Optional[str] = None
    ) -> Optional[Dict]:
        """Create a new call via Vapi"""
        arguments = {
            "assistantId": assistant_id,
            "customer": {"phoneNumber": customer_phone}
        }
        
        if phone_number_id:
            arguments["phoneNumberId"] = phone_number_id
        
        return await self.call_tool("create_call", arguments)
    
    async def send_flight_results(
        self,
        call_id: str,
        flights: list
    ) -> bool:
        """Send flight results to an active Vapi call"""
        try:
            # Format flights for Vapi cards
            cards = []
            for flight in flights[:6]:
                card = {
                    "title": f"{flight.get('origin')} → {flight.get('destination')}",
                    "subtitle": f"{flight.get('airline')} | {flight.get('flight_number')}",
                    "footer": f"⏰ {flight.get('departure_time')} - {flight.get('arrival_time')} | 💰 {flight.get('currency')}{flight.get('price'):,}",
                    "buttons": [
                        {
                            "text": "Book Now ✈️",
                            "url": f"https://booking.example.com/flight/{flight.get('flight_id')}"
                        }
                    ]
                }
                cards.append(card)
            
            # Send cards to Vapi
            result = await self.call_tool("send_message", {
                "callId": call_id,
                "type": "cards",
                "cards": cards
            })
            
            return result is not None
            
        except Exception as e:
            logger.error(f"❌ Error sending flight results: {e}")
            return False
    
    async def close(self):
        """Close the MCP connection"""
        if self.session:
            await self.session.close()
            self.connected = False
            logger.info("🔌 Disconnected from Vapi MCP server")


# Singleton instance
_vapi_mcp_client = None


def get_vapi_mcp_client() -> VapiMCPClient:
    """Get or create the singleton Vapi MCP client"""
    global _vapi_mcp_client
    if _vapi_mcp_client is None:
        _vapi_mcp_client = VapiMCPClient()
    return _vapi_mcp_client


# Test function
async def test_vapi_mcp():
    """Test the Vapi MCP client"""
    client = get_vapi_mcp_client()
    
    # Connect
    connected = await client.connect()
    if not connected:
        print("❌ Failed to connect to Vapi MCP")
        return
    
    print("✅ Connected to Vapi MCP")
    
    # List assistants
    assistants = await client.list_assistants()
    if assistants:
        print(f"✅ Found {len(assistants)} assistants")
        for assistant in assistants:
            print(f"   - {assistant.get('name')} ({assistant.get('id')})")
    
    # Close
    await client.close()


if __name__ == "__main__":
    asyncio.run(test_vapi_mcp())

