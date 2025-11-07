"""
OpenAI Service - Integrates OpenAI for structured flight data extraction
Uses function calling to get clean JSON responses for flight queries
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class OpenAIService:
    """OpenAI service for intelligent flight data extraction"""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment")
        
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o"  # Latest GPT-4 Optimized model
        
        # Define the function schema for flight extraction
        self.flight_extraction_function = {
            "name": "extract_flight_info",
            "description": "Extract structured flight information from user query",
            "parameters": {
                "type": "object",
                "properties": {
                    "origin": {
                        "type": "string",
                        "description": "Origin city or airport code (e.g., 'Mumbai', 'BOM', 'SFO')"
                    },
                    "destination": {
                        "type": "string",
                        "description": "Destination city or airport code (e.g., 'Dubai', 'DXB', 'JFK')"
                    },
                    "departure_date": {
                        "type": "string",
                        "description": "Departure date in YYYY-MM-DD format"
                    },
                    "return_date": {
                        "type": "string",
                        "description": "Return date in YYYY-MM-DD format (optional for one-way)"
                    },
                    "passengers": {
                        "type": "integer",
                        "description": "Number of passengers",
                        "default": 1
                    },
                    "cabin_class": {
                        "type": "string",
                        "enum": ["economy", "premium_economy", "business", "first"],
                        "description": "Cabin class preference",
                        "default": "economy"
                    },
                    "intent": {
                        "type": "string",
                        "enum": ["search_flights", "flight_status", "general_inquiry"],
                        "description": "User's intent"
                    }
                },
                "required": ["intent"]
            }
        }
    
    def extract_flight_query(self, user_message: str) -> Dict[str, Any]:
        """
        Extract structured flight information from user's natural language query
        
        Args:
            user_message: User's message (e.g., "I want to fly from Mumbai to Dubai tomorrow")
            
        Returns:
            Dictionary with extracted flight parameters
        """
        try:
            # Ensure user_message is a string
            if not isinstance(user_message, str):
                logger.error(f"❌ user_message is not a string: {type(user_message)} = {user_message}")
                user_message = str(user_message)
            
            # Safe logging with truncation
            log_msg = user_message if len(user_message) <= 100 else user_message[:100] + "..."
            logger.info(f"🤖 Processing query with OpenAI: {log_msg}")
            
            # Call OpenAI with function calling
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are a travel assistant that extracts flight search parameters from user queries.
                        
Extract flight details from the user's message:
- Origin and destination (city names or airport codes)
- Departure date and return date (convert relative dates like 'tomorrow', 'next week' to YYYY-MM-DD)
- Number of passengers
- Cabin class preference
- User intent (search_flights, flight_status, or general_inquiry)

Current date: {current_date}

Examples:
- "I want to fly from Mumbai to Dubai tomorrow" → origin: Mumbai, destination: Dubai, departure_date: tomorrow's date
- "Find business class flights for 2 from NYC to London next Monday" → origin: NYC, destination: London, passengers: 2, cabin_class: business
- "What's the status of flight AI 123?" → intent: flight_status
""".format(current_date=datetime.now().strftime("%Y-%m-%d"))
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ],
                functions=[self.flight_extraction_function],
                function_call={"name": "extract_flight_info"},
                temperature=0.1  # Low temperature for consistent extraction
            )
            
            # Parse the function call response
            function_call = response.choices[0].message.function_call
            
            if function_call and function_call.name == "extract_flight_info":
                extracted_data = json.loads(function_call.arguments)
                logger.info(f"✅ Extracted data: {extracted_data}")
                
                return {
                    "success": True,
                    "data": extracted_data,
                    "raw_query": user_message
                }
            else:
                logger.warning("⚠️ No function call in response")
                return {
                    "success": False,
                    "error": "Could not extract flight information",
                    "raw_query": user_message
                }
                
        except Exception as e:
            logger.error(f"❌ OpenAI extraction error: {e}")
            return {
                "success": False,
                "error": str(e),
                "raw_query": user_message
            }
    
    def generate_flight_response(
        self,
        user_message: str,
        flights: Optional[List[Dict]] = None,
        context: Optional[str] = None
    ) -> str:
        """
        Generate a natural language response about flights
        
        Args:
            user_message: User's original message
            flights: List of flight options
            context: Additional context
            
        Returns:
            Natural language response
        """
        try:
            system_message = """You are a friendly travel assistant. 
            Provide helpful, concise responses about flights.
            Keep responses under 2 sentences unless detailed information is needed."""
            
            user_content = user_message
            if flights:
                user_content += f"\n\nAvailable flights: {json.dumps(flights[:3])}"
            if context:
                user_content += f"\n\nContext: {context}"
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_content}
                ],
                temperature=0.7,
                max_tokens=200
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I can help you search for flights. Please provide your origin, destination, and travel dates."
    
    def format_flights_for_display(self, flights: List[Dict]) -> List[Dict]:
        """
        Format flight data for beautiful card display
        
        Args:
            flights: Raw flight data from API
            
        Returns:
            Formatted flight cards data
        """
        formatted_flights = []
        
        for flight in flights[:5]:  # Limit to top 5 results
            formatted_flight = {
                "id": flight.get("flight_id"),
                "airline": flight.get("airline"),
                "flight_number": flight.get("flight_number"),
                "from": {
                    "code": flight.get("origin"),
                    "time": flight.get("departure_time")
                },
                "to": {
                    "code": flight.get("destination"),
                    "time": flight.get("arrival_time")
                },
                "date": flight.get("departure_date"),
                "duration": flight.get("duration"),
                "stops": flight.get("stops", 0),
                "price": flight.get("price"),
                "currency": flight.get("currency", "₹"),
                "cabin_class": flight.get("cabin_class", "Economy"),
                "seats_available": flight.get("seats_available", 0)
            }
            formatted_flights.append(formatted_flight)
        
        return formatted_flights


# Singleton instance
openai_service = OpenAIService()


if __name__ == "__main__":
    # Test the OpenAI service
    service = OpenAIService()
    
    print("🧪 Testing OpenAI Flight Extraction Service\n")
    
    test_queries = [
        "I want to fly from Mumbai to Dubai tomorrow",
        "Find flights from New York to London for 2 passengers next Monday",
        "Business class tickets from San Francisco to Tokyo",
        "What's the status of flight AI 123?",
        "Book me a round trip from Delhi to Singapore leaving Dec 15 and returning Dec 22"
    ]
    
    for query in test_queries:
        print(f"\n📝 Query: {query}")
        result = service.extract_flight_query(query)
        
        if result["success"]:
            print(f"✅ Extracted: {json.dumps(result['data'], indent=2)}")
        else:
            print(f"❌ Error: {result['error']}")
    
    print("\n✅ OpenAI service test completed")

