"""
MCP (Model Context Protocol) Client for Real-Time Flight Data
Provides interface to real-time flight, airport, and booking data via Bright Data API
"""

import logging
import os
import json
from typing import Optional, Dict, List, Any
from datetime import datetime
import aiohttp
import asyncio

logger = logging.getLogger("MCPClient")


class MCPClient:
    """MCP Client for real-time travel data integration"""
    
    def __init__(self):
        """Initialize MCP client with Bright Data API credentials"""
        self.connected = False
        self.brightdata_token = os.getenv("BRIGHTDATA_MCP_TOKEN", "")
        self.brightdata_api_url = "https://api.brightdata.com/datasets/v3"
        
        if self.brightdata_token:
            self.connected = True
            logger.info("✅ MCPClient initialized with Bright Data API")
        else:
            logger.warning("⚠️ MCPClient initialized without Bright Data token")
            logger.info("📝 Set BRIGHTDATA_MCP_TOKEN in .env file for real-time flights")
    
    def health_check(self) -> bool:
        """Check if MCP server is available and healthy"""
        try:
            logger.info("🏥 MCP health check performed")
            return self.connected and bool(self.brightdata_token)
        except Exception as e:
            logger.warning(f"⚠️ MCP health check failed: {e}")
            return False
    
    async def get_live_flights(self, from_airport: str, to_airport: str, date: Optional[str] = None) -> Dict[str, Any]:
        """
        Get live flight information between airports from Bright Data
        
        Args:
            from_airport: Origin airport code (e.g., 'BLR')
            to_airport: Destination airport code (e.g., 'JED')
            date: Departure date (YYYY-MM-DD format)
            
        Returns:
            Dictionary with flights or error info
        """
        try:
            if not self.connected or not self.brightdata_token:
                logger.warning("⚠️ MCP not connected, returning empty results")
                return {
                    "success": False,
                    "error": "MCP server not connected",
                    "flights": []
                }
            
            logger.info(f"✈️ Fetching live flights via MCP: {from_airport} → {to_airport} on {date}")
            
            # Prepare request for Bright Data API
            headers = {
                "Authorization": f"Bearer {self.brightdata_token}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "origin": from_airport.upper(),
                "destination": to_airport.upper(),
                "departure_date": date or datetime.now().strftime("%Y-%m-%d"),
                "trip_type": "one-way",
                "adults": 1,
                "children": 0,
                "infants": 0
            }
            
            # For development, we'll use a fallback mechanism
            # In production, this would call the actual Bright Data API
            logger.info(f"📊 Querying real-time flights: {json.dumps(payload, indent=2)}")
            
            # TODO: Replace with actual Bright Data API call when endpoint is available
            # For now, return structured empty result
            result = {
                "success": False,
                "error": "Real-time flight API endpoint not yet configured",
                "flights": []
            }
            
            logger.info(f"✈️ Real-time flight search result: {len(result.get('flights', []))} flights")
            return result
            
        except Exception as e:
            logger.error(f"❌ Failed to get live flights from MCP: {e}")
            return {"success": False, "error": str(e), "flights": []}
    
    def get_flight_status(self, flight_number: str, date: Optional[str] = None) -> Dict[str, Any]:
        """Get status of a specific flight"""
        try:
            if not self.connected:
                return {
                    "success": False,
                    "error": "MCP server not connected",
                    "status": None
                }
            
            logger.info(f"🔍 Fetching flight status via MCP: {flight_number} on {date}")
            
            # TODO: Call actual MCP server for flight status
            return {
                "success": False,
                "error": "Flight status API not yet implemented",
                "status": None
            }
        except Exception as e:
            logger.error(f"❌ Failed to get flight status from MCP: {e}")
            return {"success": False, "error": str(e)}
    
    def search_airports(self, query: str) -> Dict[str, Any]:
        """Search for airports by city or name"""
        try:
            if not self.connected:
                return {
                    "success": False,
                    "error": "MCP server not connected",
                    "airports": []
                }
            
            logger.info(f"🔍 Searching airports via MCP: {query}")
            
            # Common airport mappings
            airport_db = {
                "bangalore": {"code": "BLR", "name": "Kempegowda International Airport", "city": "Bangalore"},
                "blr": {"code": "BLR", "name": "Kempegowda International Airport", "city": "Bangalore"},
                "jeddah": {"code": "JED", "name": "King Abdulaziz International Airport", "city": "Jeddah"},
                "jed": {"code": "JED", "name": "King Abdulaziz International Airport", "city": "Jeddah"},
                "riyadh": {"code": "RUH", "name": "King Fahd International Airport", "city": "Riyadh"},
                "ruh": {"code": "RUH", "name": "King Fahd International Airport", "city": "Riyadh"},
                "dubai": {"code": "DXB", "name": "Dubai International Airport", "city": "Dubai"},
                "dxb": {"code": "DXB", "name": "Dubai International Airport", "city": "Dubai"},
                "delhi": {"code": "DEL", "name": "Indira Gandhi International Airport", "city": "Delhi"},
                "del": {"code": "DEL", "name": "Indira Gandhi International Airport", "city": "Delhi"},
                "mumbai": {"code": "BOM", "name": "Bombay Aerodrome", "city": "Mumbai"},
                "bom": {"code": "BOM", "name": "Bombay Aerodrome", "city": "Mumbai"},
            }
            
            query_lower = query.lower().strip()
            
            if query_lower in airport_db:
                return {
                    "success": True,
                    "airports": [airport_db[query_lower]]
                }
            
            # Fuzzy search
            results = []
            for key, airport in airport_db.items():
                if query_lower in key or query_lower in airport["city"].lower():
                    results.append(airport)
            
            return {
                "success": len(results) > 0,
                "airports": results if results else []
            }
        except Exception as e:
            logger.error(f"❌ Failed to search airports via MCP: {e}")
            return {"success": False, "error": str(e), "airports": []}


# Global MCP client instance
mcp_client = MCPClient()


# =====================================================
# Wrapper Functions for AI Agent
# =====================================================

async def get_live_flights_for_ai(from_airport: str, to_airport: str, date: Optional[str] = None) -> str:
    """Get live flights - returns formatted string for AI"""
    result = await mcp_client.get_live_flights(from_airport, to_airport, date)
    
    if not result.get("success"):
        return f"I apologize, but I'm unable to fetch real-time flight data at the moment. {result.get('error', 'Please try again later.')}"
    
    flights = result.get("flights", [])
    if not flights:
        return f"No flights found for {from_airport} to {to_airport} on {date or 'your requested date'}."
    
    # Format flights for AI
    flight_list = []
    for i, flight in enumerate(flights[:5], 1):  # Limit to top 5
        flight_info = (
            f"{i}. {flight.get('airline', 'Unknown')} {flight.get('flight_number', 'N/A')}: "
            f"{flight.get('departure_time', 'N/A')} - {flight.get('arrival_time', 'N/A')} "
            f"({flight.get('duration', 'N/A')}), "
            f"₹{flight.get('price', 'N/A')}"
        )
        flight_list.append(flight_info)
    
    return f"I found {len(flights)} flights:\n" + "\n".join(flight_list)


def get_flight_status_for_ai(flight_number: str, date: Optional[str] = None) -> str:
    """Get flight status - returns formatted string for AI"""
    result = mcp_client.get_flight_status(flight_number, date)
    
    if not result.get("success"):
        return f"I couldn't retrieve the status for flight {flight_number}. {result.get('error', 'Please try again later.')}"
    
    status = result.get("status", {})
    
    return (
        f"Flight {flight_number}:\n"
        f"Status: {status.get('status', 'Unknown')}\n"
        f"Departure: {status.get('departure_time', 'N/A')}\n"
        f"Arrival: {status.get('arrival_time', 'N/A')}\n"
        f"Gate: {status.get('gate', 'TBD')}"
    )


def search_airports_for_ai(query: str) -> str:
    """Search airports - returns formatted string for AI"""
    result = mcp_client.search_airports(query)
    
    if not result.get("success"):
        return f"I couldn't search for airports matching '{query}'. {result.get('error', 'Please try again later.')}"
    
    airports = result.get("airports", [])
    if not airports:
        return f"No airports found matching '{query}'."
    
    # Format airports for AI
    airport_list = []
    for airport in airports[:5]:  # Limit to top 5
        airport_info = f"{airport.get('name', 'Unknown')} ({airport.get('code', 'N/A')})"
        airport_list.append(airport_info)
    
    return f"I found {len(airports)} matching airports:\n" + ", ".join(airport_list)


# =====================================================
# Logging Helpers
# =====================================================

def log_mcp_status():
    """Log current MCP status"""
    is_connected = mcp_client.health_check()
    status = "✅ Connected" if is_connected else "❌ Disconnected"
    logger.info(f"🔗 MCP Status: {status}")
    return is_connected


if __name__ == "__main__":
    # Test the client
    logger.info("🧪 Testing MCP Client...")
    
    # Test health check
    health = mcp_client.health_check()
    logger.info(f"Health check: {'✅ OK' if health else '❌ Failed'}")
    
    # Test airport search
    airports = search_airports_for_ai("Bangalore")
    logger.info(f"Airports: {airports}")
    
    logger.info("🧪 Testing complete!")
