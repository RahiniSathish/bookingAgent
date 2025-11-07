# Frontend Documentation - Vapi Voice Travel Assistant

## 📋 Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Components](#components)
- [Configuration](#configuration)
- [Features](#features)
- [Development Guide](#development-guide)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This is a React-based frontend application for a voice-powered travel booking assistant using Vapi AI. The application provides an interactive voice interface for searching flights and hotels, displaying results as cards, and managing bookings.

### Key Technologies
- **React 18.2.0** - UI framework
- **Vite** - Build tool and dev server
- **@vapi-ai/web** - Vapi SDK for voice AI integration
- **React Markdown** - Markdown rendering support

### Key Features
- 🎙️ Voice conversation interface
- ✈️ Flight search and display
- 🏨 Hotel search and display
- 📧 Email notifications for bookings
- 📊 Call summaries
- 💬 Real-time transcript display

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend server running on `http://localhost:4000`
- Vapi account with Assistant ID and Public Key

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will start on `http://localhost:5173` (default Vite port).

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
frontend/
├── index.html              # HTML entry point
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies and scripts
├── src/
│   ├── main.jsx           # React entry point
│   ├── App.jsx            # Main application component
│   ├── App.css            # Main app styles
│   ├── index.css          # Global styles
│   └── components/
│       ├── VoiceButton.jsx    # Voice assistant widget
│       ├── VoiceButton.css    # Voice widget styles
│       ├── FlightCard.jsx     # Flight card component
│       ├── FlightCard.css     # Flight card styles
│       ├── HotelCard.jsx      # Hotel card component
│       └── HotelCard.css      # Hotel card styles
```

---

## 🧩 Components

### 1. App.jsx
**Main application component** that orchestrates the entire UI.

**Key Responsibilities:**
- Manages flight and hotel state
- Handles Vapi event messages
- Displays flight/hotel cards
- Shows booking confirmations
- Displays call summaries
- Sends email notifications

**Key State:**
```javascript
- flights: Array of flight objects
- hotels: Array of hotel objects
- isCallActive: Boolean for call status
- transcript: Array of conversation messages
- showFlights/showHotels: Display flags
- bookingDetails: Current booking info
- callSummary: Call summary data
```

**Key Functions:**
- `searchFlightsFromTranscript()` - Extract flight search from transcript
- `sendBookingConfirmation()` - Send booking email
- `sendCallSummary()` - Send call summary email
- `requestCallSummary()` - Fetch call summary from backend

### 2. VoiceButton.jsx
**Voice assistant widget component** - The core voice interaction interface.

**Key Features:**
- Floating button UI
- Vapi SDK integration
- Real-time transcript display
- Call controls (start/end/mute)
- Backend polling for flight/hotel cards
- Event handling for Vapi messages

**Key Props:**
```javascript
{
  publicKey: string,      // Vapi public key
  assistantId: string     // Vapi assistant ID
}
```

**Key State:**
```javascript
- isOpen: Widget open/closed state
- isConnected: Call connection status
- isListening: User speaking indicator
- isAssistantSpeaking: AI speaking indicator
- isMuted: Microphone mute state
- transcript: Conversation transcript
- callId: Current call ID for polling
- shouldPollFlights/Hotels: Polling triggers
```

**Key Functions:**
- `handleStartCall()` - Initialize Vapi call
- `handleEndCall()` - End call and cleanup
- `handleToggleMute()` - Toggle microphone mute
- Backend polling for flight/hotel cards

**Event Listeners:**
- `call-start` - Call initialization
- `call-end` - Call termination
- `message` - Transcript messages
- `function-call-result` - Function execution results
- `conversation-update` - Conversation state updates

### 3. FlightCard.jsx
**Flight card display component** for showing flight search results.

**Props:**
```javascript
{
  flight: {
    id: string,
    origin: string,
    destination: string,
    airline: string,
    flight_number: string,
    departure_time: string,
    arrival_time: string,
    price: number,
    duration: string,
    from: { code, time },
    to: { code, time }
  }
}
```

### 4. HotelCard.jsx
**Hotel card display component** for showing hotel search results.

**Props:**
```javascript
{
  hotel: {
    id: string,
    name: string,
    location: string,
    price: number,
    rating: number,
    amenities: string[]
  }
}
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_VAPI_PUBLIC_KEY=your_vapi_public_key_here
VITE_VAPI_ASSISTANT_ID=your_assistant_id_here
VITE_BACKEND_URL=http://localhost:4000
```

### Default Values (in App.jsx)

If environment variables are not set, the app uses these defaults:

```javascript
VAPI_PUBLIC_KEY: '577ae6b3-53b9-4a37-b6f6-74e8e8808368'
VAPI_ASSISTANT_ID: 'e1c04a87-a8cf-4438-a91b-5888f69d1ef2'
BACKEND_URL: 'http://localhost:4000'
```

### Vite Configuration

`vite.config.js`:
```javascript
{
  server: {
    port: 5173,
    host: true,
    open: true
  }
}
```

---

## ✨ Features

### 1. Voice Conversation
- Real-time voice interaction with AI assistant
- Transcript display with role indicators (user/assistant)
- Visual indicators for listening/speaking states
- Mute/unmute functionality

### 2. Flight Search
- Automatic flight search from conversation
- Flight cards display with:
  - Route (origin → destination)
  - Airline and flight number
  - Departure/arrival times
  - Price
  - Duration
- Backend polling to fetch flight cards
- Card injection via global functions

### 3. Hotel Search
- Hotel search triggered by conversation
- Hotel cards display with:
  - Hotel name and location
  - Price per night
  - Rating
  - Amenities
- Backend polling for hotel cards

### 4. Booking Management
- Booking confirmation display
- Booking reference number
- Email notifications
- Call summary generation

### 5. Email Integration
- Booking confirmation emails
- Call summary emails
- Transcript inclusion
- Automatic email sending on booking/call end

---

## 💻 Development Guide

### Adding New Components

1. Create component file in `src/components/`
2. Create corresponding CSS file
3. Import and use in `App.jsx` or parent component

Example:
```javascript
// src/components/NewComponent.jsx
import React from 'react';
import './NewComponent.css';

const NewComponent = ({ prop1, prop2 }) => {
  return (
    <div className="new-component">
      {/* Component JSX */}
    </div>
  );
};

export default NewComponent;
```

### Handling Vapi Events

Listen for Vapi events in `VoiceButton.jsx`:

```javascript
vapiClientRef.current.on('event-name', (data) => {
  // Handle event
  console.log('Event received:', data);
});
```

### Posting Messages Between Components

Use `window.postMessage` for cross-component communication:

```javascript
// Send message
window.postMessage({
  type: 'custom-event-type',
  data: { /* your data */ }
}, '*');

// Listen for message
window.addEventListener('message', (event) => {
  if (event.data.type === 'custom-event-type') {
    // Handle message
  }
});
```

### Backend API Integration

All API calls go through the backend URL:

```javascript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Example API call
const response = await fetch(`${BACKEND_URL}/api/endpoint`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ /* data */ })
});

const data = await response.json();
```

---

## 🔌 API Integration

### Backend Endpoints Used

1. **Flight Search**
   - `POST /api/search-flights`
   - Body: `{ origin, destination, departure_date, passengers, cabin_class }`

2. **Flight Cards**
   - `GET /api/flight-cards/:callId`
   - Returns: `{ success, cards: [...] }`

3. **Hotel Cards**
   - `GET /api/hotel-cards/:callId`
   - Returns: `{ success, cards: [...] }`

4. **Booking Confirmation**
   - `POST /api/send-booking-confirmation`
   - Body: `{ recipient_email, recipient_name, booking_reference, booking_details, transcript }`

5. **Call Summary**
   - `GET /api/call-summary-latest`
   - `POST /api/send-call-summary`
   - Body: `{ recipient_email, recipient_name, transcript, summary, call_duration, session_id, timestamp }`

### Polling Mechanism

The app polls the backend for flight/hotel cards:

```javascript
// Polling starts when:
// 1. Function call detected (search_flights/search_hotels)
// 2. AI mentions "flight options" or "hotel options"
// 3. Function call result received

// Polling configuration:
- Interval: 2 seconds
- Max attempts: 45 (90 seconds total)
- Endpoint: /api/flight-cards/:callId or /api/hotel-cards/:callId
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Vapi SDK Not Loading
**Symptoms:** Button doesn't appear, console errors

**Solutions:**
- Check internet connection
- Verify `@vapi-ai/web` is installed: `npm install @vapi-ai/web`
- Check browser console for errors
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

#### 2. Call Won't Start (400 Error)
**Symptoms:** Error when clicking "Start" button

**Solutions:**
- Verify Assistant ID is correct
- Check Assistant is published in Vapi dashboard
- Ensure Assistant has model configured (e.g., GPT-4o)
- Ensure Assistant has voice configured
- Verify Public Key matches workspace

#### 3. Flight Cards Not Displaying
**Symptoms:** AI says flights found but cards don't appear

**Solutions:**
- Check backend is running on port 4000
- Verify backend received webhook from Vapi
- Check browser console for polling logs
- Verify `callId` is set correctly
- Check backend cache has cards: `GET /api/flight-cards/latest`

#### 4. Microphone Permission Denied
**Symptoms:** Can't start call, microphone error

**Solutions:**
- Grant microphone permission in browser
- Check browser settings → Privacy → Microphone
- Try different browser (Chrome/Edge recommended)
- Check HTTPS requirement (some browsers require HTTPS for microphone)

#### 5. Backend Connection Failed
**Symptoms:** API calls fail, CORS errors

**Solutions:**
- Verify backend is running: `http://localhost:4000`
- Check CORS configuration in backend
- Verify `VITE_BACKEND_URL` matches backend URL
- Check network tab in browser DevTools

#### 6. Email Not Sending
**Symptoms:** Booking confirmed but no email received

**Solutions:**
- Check backend email service configuration
- Verify email credentials in backend
- Check backend logs for email errors
- Verify recipient email is valid

### Debug Mode

Enable detailed logging:

```javascript
// Already enabled in VoiceButton.jsx
// Check browser console for:
- 🔔 Event logs
- 📞 Call status
- ✈️ Flight card detection
- 🏨 Hotel card detection
- 🔄 Polling status
- ❌ Error details
```

### Browser Compatibility

**Recommended:**
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

**Not Supported:**
- Internet Explorer
- Older mobile browsers

---

## 📝 Code Examples

### Injecting Flight Cards Programmatically

```javascript
// From browser console or external script
window.injectFlightCard({
  id: 'flight-1',
  origin: 'BLR',
  destination: 'JED',
  airline: 'Air India',
  flight_number: 'IX 881',
  departure_time: '02:15',
  arrival_time: '05:30',
  price: 28450,
  duration: '5h 45m',
  from: { code: 'BLR', time: '02:15' },
  to: { code: 'JED', time: '05:30' }
});

// Inject multiple flights
window.injectFlightCards([
  { /* flight 1 */ },
  { /* flight 2 */ },
  { /* flight 3 */ }
]);
```

### Custom Event Handling

```javascript
// In App.jsx or any component
useEffect(() => {
  const handleCustomEvent = (event) => {
    if (event.data.type === 'custom-event-type') {
      // Handle event
      console.log('Custom event:', event.data);
    }
  };

  window.addEventListener('message', handleCustomEvent);
  return () => window.removeEventListener('message', handleCustomEvent);
}, []);
```

---

## 📚 Additional Resources

- [Vapi Documentation](https://docs.vapi.ai)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Vapi Dashboard](https://dashboard.vapi.ai)

---

## 🔄 Version History

- **v1.0.0** - Initial release
  - Voice conversation interface
  - Flight and hotel search
  - Card display system
  - Email notifications
  - Call summaries

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Review backend logs
3. Verify Vapi dashboard configuration
4. Check network tab for API calls

---

**Last Updated:** November 2024  
**Status:** Production Ready ✅

