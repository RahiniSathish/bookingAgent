import React, { useState, useEffect } from 'react';
import FlightCard from './FlightCard';
import '../styles/vapi-flight-widget.css';

const VapiFlightWidget = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCards, setShowCards] = useState(false);
  const BACKEND_URL = 'http://localhost:8000';

  // Listen to VAPI events
  useEffect(() => {
    const handleVapiMessage = (event) => {
      if (!event.data || event.data.action !== 'app-message') return;

      try {
        const payload = JSON.parse(event.data.data);
        console.log('📦 VAPI Message:', payload);

        // Handle all VAPI structured outputs
        if (
          payload.type === 'function-call' ||
          payload.type === 'tool_response' ||
          payload.type === 'structured_output' ||
          payload.functionCall ||
          payload.tool === 'search_flights'
        ) {
          console.log('✈️ Structured result received');

          // Normalize structure
          const functionCall = payload.functionCall || payload;
          const name = functionCall.name || functionCall.tool || functionCall.function || payload.tool;
          const result = functionCall.result || functionCall.data || functionCall.content || functionCall;

          if (name === 'search_flights') {
            const flightData = result.flights || payload.flights || payload.data?.flights || [];

            if (flightData.length > 0) {
              console.log(`✅ ${flightData.length} flights found!`);
              setFlights(flightData);
              setShowCards(true);
              setError(null);
            } else {
              console.warn('⚠️ No flights found');
              setError('No flights found for your search');
              setFlights([]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    window.addEventListener('message', handleVapiMessage);
    return () => window.removeEventListener('message', handleVapiMessage);
  }, []);

  // Fetch flights directly from backend
  const fetchFlights = async (query) => {
    setLoading(true);
    setError(null);
    setShowCards(false);

    try {
      const flightInfo = extractFlightInfo(query);
      
      if (!flightInfo.origin || !flightInfo.destination) {
        setError('Could not extract flight information from query');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/search-flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: flightInfo.origin,
          destination: flightInfo.destination,
          departure_date: flightInfo.date || '2025-01-15',
          passengers: 1,
          cabin_class: 'economy'
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      if (data.flights && data.flights.length > 0) {
        setFlights(data.flights);
        setShowCards(true);
        console.log(`✅ Found ${data.flights.length} flights`);
      } else {
        setError('No flights found');
        setFlights([]);
      }
    } catch (err) {
      console.error('Error fetching flights:', err);
      setError(`Error: ${err.message}`);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  // Extract flight info from query
  const extractFlightInfo = (query) => {
    const originMatch = query.match(/from\s+([a-zA-Z]+)/i) || query.match(/^([a-zA-Z]+)\s+to/i);
    const destMatch = query.match(/to\s+([a-zA-Z]+)/i);
    const dateMatch = query.match(/(\d{4}-\d{2}-\d{2}|january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})?/i);

    return {
      origin: originMatch ? originMatch[1] : '',
      destination: destMatch ? destMatch[1] : '',
      date: dateMatch ? dateMatch[0] : ''
    };
  };

  return (
    <div className="vapi-flight-widget">
      <div className="widget-header">
        <h2>✈️ Flight Search Results</h2>
        <p className="subtitle">{flights.length} flights found</p>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️</span> {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Searching flights...</p>
        </div>
      )}

      {showCards && flights.length > 0 && (
        <div className="flights-container">
          <div className="flights-header">
            <h3>Available Flights</h3>
            <span className="flight-count">{flights.length} results</span>
          </div>
          <div className="flights-grid">
            {flights.map((flight, index) => (
              <FlightCard key={index} flight={flight} />
            ))}
          </div>
        </div>
      )}

      {showCards && flights.length === 0 && !loading && (
        <div className="empty-state">
          <p>No flights available</p>
        </div>
      )}
    </div>
  );
};

export default VapiFlightWidget;
