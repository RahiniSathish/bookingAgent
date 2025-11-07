import React from 'react';
import '../styles/flight-card.css';

const FlightCard = ({ flight }) => {
  const airlineLogos = {
    'Air India Express': '🇮🇳',
    'IndiGo': '🇮🇳',
    'Air India': '🇮🇳',
    'Saudia': '🇸🇦',
    'Emirates': '🇦🇪',
    'Qatar Airways': '🇶🇦',
    'FlyDubai': '🇦🇪'
  };

  const logo = airlineLogos[flight.airline] || '✈️';
  const departureTime = flight.departure_time || flight.from?.time || 'N/A';
  const arrivalTime = flight.arrival_time || flight.to?.time || 'N/A';
  const originCode = flight.origin || flight.from?.code || 'N/A';
  const destCode = flight.destination || flight.to?.code || 'N/A';
  const price = flight.price || 'N/A';

  return (
    <div className="flight-card">
      <div className="flight-header">
        <div className="airline-info">
          <div className="airline-logo">{logo}</div>
          <div>
            <div className="airline-name">{flight.airline}</div>
            <div className="flight-number">{flight.flight_number}</div>
          </div>
        </div>
        <div className="flight-price">₹{typeof price === 'number' ? price.toLocaleString() : price}</div>
      </div>

      <div className="flight-route">
        <div className="route-point">
          <div className="route-time">{departureTime}</div>
          <div className="route-code">{originCode}</div>
        </div>
        <div className="route-arrow">
          <div className="route-duration">{flight.duration || 'N/A'}</div>
          <div className="route-line"></div>
          <div className="route-duration">
            {flight.stops === 0 ? 'Non-stop' : `${flight.stops || 1} stop(s)`}
          </div>
        </div>
        <div className="route-point">
          <div className="route-time">{arrivalTime}</div>
          <div className="route-code">{destCode}</div>
        </div>
      </div>

      <div className="flight-details">
        <div className="detail-item">
          <div className="detail-label">Date</div>
          <div className="detail-value">{flight.departure_date || 'N/A'}</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">Class</div>
          <div className="detail-value">{flight.cabin_class || 'Economy'}</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">Seats</div>
          <div className="detail-value">{flight.seats_available || 'Available'}</div>
        </div>
      </div>

      <button className="book-button">Book Now ✈️</button>
    </div>
  );
};

export default FlightCard;
