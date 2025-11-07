import { Plane, Clock, DollarSign, MapPin, Users, Briefcase, Map, Hotel } from 'lucide-react'
import './FlightCard.css'

function FlightCard({ flight }) {
  // Handle various flight data structures
  const getFlightValue = (obj) => {
    if (typeof obj === 'string' || typeof obj === 'number') return obj
    if (obj && typeof obj === 'object') {
      // Try common property names
      return obj.value || obj.name || obj.text || obj.code || JSON.stringify(obj).substring(0, 20)
    }
    return 'N/A'
  }

  // Extract values safely
  const origin = getFlightValue(flight.origin) || flight.from_code || 'N/A'
  const destination = getFlightValue(flight.destination) || flight.to_code || 'N/A'
  const airline = getFlightValue(flight.airline) || flight.carrier || 'N/A'
  const flightNumber = getFlightValue(flight.flight_number) || flight.flightNumber || 'N/A'
  const departureTime = getFlightValue(flight.departure_time) || flight.departureTime || 'N/A'
  const arrivalTime = getFlightValue(flight.arrival_time) || flight.arrivalTime || 'N/A'
  const duration = getFlightValue(flight.duration) || flight.duration_formatted || 'N/A'
  const price = flight.price ? `₹${Number(flight.price).toLocaleString()}` : 'N/A'
  const stops = flight.stops === 0 || flight.stops === '0' ? 'Non-stop' : `${getFlightValue(flight.stops)} stop(s)`
  const gate = getFlightValue(flight.gate) || 'TBD'
  const seat = getFlightValue(flight.seat) || 'TBD'
  const cabin = getFlightValue(flight.cabin_class) || getFlightValue(flight.cabin) || 'Economy'
  const terminal = getFlightValue(flight.terminal) || 'N/A'
  const baggage = getFlightValue(flight.baggage) || getFlightValue(flight.baggage_allowance) || '23kg'
  const passengers = getFlightValue(flight.passengers) || getFlightValue(flight.pax) || '1'

  // Get city names for rich links
  const destinationCity = getFlightValue(flight.destination_city) || 'Destination'

  const handleBook = () => {
    alert(`Booking ${airline} ${flightNumber} for ${price}`)
  }

  // Rich text link builders
  const getMapsLink = (city) => {
    return `https://www.google.com/maps/search/${encodeURIComponent(city)}/@0,0,4z`
  }

  const getHotelsLink = (city) => {
    return `https://www.google.com/travel/hotels/entity/${encodeURIComponent(city)}?g2lb=4100529%2C4100568%2C4149940%2C4150612%2C4206979%2C4207258%2C4208993%2C4217180%2C4223281&hl=en`
  }

  return (
    <div className="flight-card-wrapper">
      {/* Header Section - Gradient Background */}
      <div className="flight-card-header">
        <div className="flight-route-hero">
          <div className="route-city">
            <div className="city-label">FROM</div>
            <div className="city-code-large">{origin}</div>
            <div className="city-name">{flight.origin_city || 'Origin'}</div>
            <div className="flight-time">{departureTime}</div>
          </div>
          
          <div className="route-middle">
            <Plane className="plane-hero" />
            <div className="route-arrow">→</div>
          </div>
          
          <div className="route-city">
            <div className="city-label">TO</div>
            <div className="city-code-large">{destination}</div>
            <div className="city-name">{destinationCity}</div>
            <div className="flight-time">{arrivalTime}</div>
          </div>
        </div>

        <div className="flight-meta">
          <span className="airline-badge">{airline}</span>
          <span className="stops-badge">{stops}</span>
        </div>
      </div>

      {/* Main Details Section */}
      <div className="flight-card-body">
        <div className="flight-info-row">
          <div className="info-item">
            <div className="info-label">Flight</div>
            <div className="info-value">{flightNumber}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Gate</div>
            <div className="info-value">{gate}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Class</div>
            <div className="info-value">{cabin}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Seat</div>
            <div className="info-value">{seat}</div>
          </div>
        </div>

        <div className="flight-info-row">
          <div className="info-item">
            <div className="info-label">Terminal</div>
            <div className="info-value">{terminal}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Duration</div>
            <div className="info-value">
              <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {duration}
            </div>
          </div>
          <div className="info-item">
            <div className="info-label">Baggage</div>
            <div className="info-value">{baggage}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Pax</div>
            <div className="info-value">{passengers}</div>
          </div>
        </div>
      </div>

      {/* Rich Text Links Section - Maps & Hotels */}
      <div className="flight-card-links">
        <a href={getMapsLink(destinationCity)} target="_blank" rel="noopener noreferrer" className="rich-link maps-link">
          <Map size={16} />
          <span>View {destinationCity} on Maps</span>
        </a>
        <a href={getHotelsLink(destinationCity)} target="_blank" rel="noopener noreferrer" className="rich-link hotels-link">
          <Hotel size={16} />
          <span>Find Hotels in {destinationCity}</span>
        </a>
      </div>

      {/* Price and Action */}
      <div className="flight-card-footer">
        <div className="price-display">
          <div className="price-label">Total Price</div>
          <div className="price-amount">{price}</div>
        </div>
        <button className="book-now-btn" onClick={handleBook}>
          <span>✈️ Book Now</span>
        </button>
      </div>

      {/* Boarding Pass Style Details */}
      <div className="flight-boarding-pass">
        <div className="boarding-title">Booking Reference</div>
        <div className="boarding-barcode">||||||||||||||||</div>
        <div className="boarding-reference">{flight.booking_ref || 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
      </div>
    </div>
  )
}

export default FlightCard

