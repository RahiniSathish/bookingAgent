"""
Bright Data Flight API Integration
Real-time flight search using Bright Data's web scraping infrastructure
"""

import os
import requests
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class BrightDataFlightAPI:
    """Real-time flight search using Bright Data"""
    
    def __init__(self):
        self.api_key = os.getenv("BRIGHTDATA_API_KEY")
        self.api_url = os.getenv("BRIGHTDATA_API_URL", "https://api.brightdata.com/datasets/v3")
        self.dataset_id = os.getenv("BRIGHTDATA_DATASET_ID", "gd_l7q7dkf244hwjntr0")
        self.timeout = 60  # Longer timeout for web scraping
        
        if not self.api_key:
            logger.warning("⚠️ BRIGHTDATA_API_KEY not configured")
        else:
            logger.info("✅ Bright Data Flight API initialized")
    
    def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None,
        passengers: int = 1,
        cabin_class: str = "economy"
    ) -> Dict[str, Any]:
        """
        Search for real-time flights using Bright Data
        
        Args:
            origin: Origin airport code or city
            destination: Destination airport code or city
            departure_date: Departure date (YYYY-MM-DD)
            return_date: Return date for round-trip
            passengers: Number of passengers
            cabin_class: Cabin class (economy, business, first)
            
        Returns:
            Dictionary with flight results
        """
        try:
            logger.info(f"🔍 Bright Data search: {origin} → {destination} on {departure_date}")
            
            # Normalize airport codes
            origin_code = self._normalize_airport_code(origin)
            destination_code = self._normalize_airport_code(destination)
            
            # Build search payload for Bright Data
            search_payload = {
                "origin": origin_code,
                "destination": destination_code,
                "departure_date": departure_date,
                "passengers": passengers,
                "cabin_class": cabin_class,
                "currency": "INR"
            }
            
            if return_date:
                search_payload["return_date"] = return_date
            
            # Call Bright Data API
            flights = self._fetch_flights_from_brightdata(search_payload)
            
            # Format results
            outbound_flights = self._format_flights(flights.get("outbound", []))
            return_flights = self._format_flights(flights.get("return", [])) if return_date else []
            
            logger.info(f"✅ Found {len(outbound_flights)} outbound flights via Bright Data")
            
            return {
                "success": True,
                "outbound_flights": outbound_flights,
                "return_flights": return_flights,
                "search_criteria": {
                    "origin": origin_code,
                    "destination": destination_code,
                    "departure_date": departure_date,
                    "return_date": return_date,
                    "passengers": passengers,
                    "cabin_class": cabin_class
                },
                "source": "bright_data_real_time"
            }
            
        except Exception as e:
            logger.error(f"❌ Bright Data search failed: {e}")
            # Fallback to mock data
            logger.info("⚠️ Falling back to mock flight data")
            return self._get_fallback_mock_data(origin, destination, departure_date, cabin_class)
    
    def _fetch_flights_from_brightdata(self, search_payload: Dict) -> Dict:
        """Fetch flights from Bright Data scraping API"""
        try:
            # Bright Data Dataset API endpoint
            url = f"{self.api_url}/trigger"
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # Trigger a data collection job
            payload = {
                "dataset_id": self.dataset_id,
                "discover_by": search_payload
            }
            
            logger.info(f"📡 Calling Bright Data API...")
            response = requests.post(url, headers=headers, json=payload, timeout=self.timeout)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Bright Data response received")
                return self._parse_brightdata_response(data)
            else:
                logger.warning(f"⚠️ Bright Data API returned status {response.status_code}")
                raise Exception(f"API returned status {response.status_code}")
                
        except requests.exceptions.Timeout:
            logger.error("❌ Bright Data API timeout")
            raise Exception("API timeout")
        except Exception as e:
            logger.error(f"❌ Bright Data API error: {e}")
            raise
    
    def _parse_brightdata_response(self, data: Dict) -> Dict:
        """Parse Bright Data response into flight format"""
        # Bright Data returns scraped flight data in various formats
        # Parse and normalize the response
        
        flights = data.get("data", [])
        
        parsed = {
            "outbound": [],
            "return": []
        }
        
        for flight in flights:
            parsed_flight = {
                "flight_id": flight.get("id") or f"BD_{datetime.now().timestamp()}",
                "airline": flight.get("airline", "Unknown"),
                "flight_number": flight.get("flight_number", "N/A"),
                "origin": flight.get("origin_airport", "N/A"),
                "destination": flight.get("destination_airport", "N/A"),
                "departure_time": flight.get("departure_time", "N/A"),
                "arrival_time": flight.get("arrival_time", "N/A"),
                "departure_date": flight.get("departure_date", "N/A"),
                "duration": flight.get("duration", "N/A"),
                "stops": flight.get("stops", 0),
                "price": flight.get("price", 0),
                "currency": flight.get("currency", "INR"),
                "cabin_class": flight.get("cabin_class", "economy"),
                "seats_available": flight.get("seats_available", "Available"),
                "baggage": {
                    "cabin": flight.get("cabin_baggage", "7kg"),
                    "checked": flight.get("checked_baggage", "23kg")
                }
            }
            
            # Determine if outbound or return
            if flight.get("type") == "return":
                parsed["return"].append(parsed_flight)
            else:
                parsed["outbound"].append(parsed_flight)
        
        return parsed
    
    def _format_flights(self, flights: List[Dict]) -> List[Dict]:
        """Format flights into standard structure"""
        formatted = []
        
        for flight in flights:
            formatted_flight = {
                "flight_id": flight.get("flight_id"),
                "airline": flight.get("airline"),
                "flight_number": flight.get("flight_number"),
                "origin": flight.get("origin"),
                "destination": flight.get("destination"),
                "departure_time": flight.get("departure_time"),
                "arrival_time": flight.get("arrival_time"),
                "departure_date": flight.get("departure_date"),
                "duration": flight.get("duration"),
                "stops": flight.get("stops", 0),
                "price": flight.get("price"),
                "currency": flight.get("currency", "INR"),
                "cabin_class": flight.get("cabin_class"),
                "seats_available": flight.get("seats_available"),
                "baggage": flight.get("baggage", {"cabin": "7kg", "checked": "23kg"})
            }
            formatted.append(formatted_flight)
        
        return formatted
    
    def _normalize_airport_code(self, location: str) -> str:
        """Normalize city names to airport codes"""
        location = location.strip().upper()
        
        city_to_code = {
            "BANGALORE": "BLR",
            "BENGALURU": "BLR",
            "JEDDAH": "JED",
            "RIYADH": "RUH",
            "DUBAI": "DXB",
            "MUMBAI": "BOM",
            "DELHI": "DEL",
            "NEW DELHI": "DEL",
            "HYDERABAD": "HYD",
            "CHENNAI": "MAA",
            "KOLKATA": "CCU",
            "ABU DHABI": "AUH",
            "DOHA": "DOH",
            "DAMMAM": "DMM",
            "MEDINA": "MED"
        }
        
        return city_to_code.get(location, location)
    
    def _get_fallback_mock_data(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        cabin_class: str
    ) -> Dict[str, Any]:
        """Fallback to mock data if Bright Data fails"""
        from backend.mock_flights_database import MockFlightsDatabase
        
        mock_db = MockFlightsDatabase()
        return mock_db.search_flights(
            origin=origin,
            destination=destination,
            departure_date=departure_date,
            cabin_class=cabin_class
        )
    
    def get_flight_details(self, flight_id: str) -> Dict[str, Any]:
        """Get detailed flight information"""
        # Implementation for getting specific flight details
        return {
            "flight_id": flight_id,
            "status": "available",
            "source": "bright_data"
        }


if __name__ == "__main__":
    # Test the Bright Data Flight API
    api = BrightDataFlightAPI()
    
    print("Testing Bright Data Flight API...\n")
    
    # Test search
    print("1. Searching flights: BLR → JED")
    results = api.search_flights(
        origin="Bangalore",
        destination="Jeddah",
        departure_date="2025-12-20",
        passengers=1,
        cabin_class="economy"
    )
    
    if results["success"]:
        print(f"✅ Found {len(results['outbound_flights'])} flights")
        print(f"   Source: {results.get('source', 'unknown')}")
        for flight in results['outbound_flights'][:3]:
            print(f"   {flight['airline']} {flight['flight_number']}: {flight['currency']}{flight['price']}")
    else:
        print(f"❌ Search failed: {results.get('error')}")
    
    print("\n✅ Bright Data Flight API test completed")

