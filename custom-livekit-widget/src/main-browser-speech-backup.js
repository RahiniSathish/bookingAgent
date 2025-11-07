import './index.css'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import TravelAssistant from './components/TravelAssistant'
import ALEX_SYSTEM_PROMPT from './ALEX_PROMPT.js'
import COMPLETE_ALEX_INSTRUCTIONS from './COMPLETE_ALEX_INSTRUCTIONS.js'

// Get DOM elements
const floatingBtn = document.getElementById('floatingBtn')
const widgetOverlay = document.getElementById('widgetOverlay')
const widgetContainer = document.getElementById('widgetContainer')
const closeWidget = document.getElementById('closeWidget')
const startBtn = document.getElementById('startBtn')
const endBtn = document.getElementById('endBtn')
const micButton = document.getElementById('micButton')
const statusText = document.getElementById('statusText')
const messagesContainer = document.getElementById('messagesContainer')

let isCallActive = false
let recognition = null
let messageCount = 0

// User Context Memory - Alex remembers conversation
let userContext = {
  lastOrigin: null,
  lastDestination: null,
  conversationMode: 'initial', // initial, searching, booking, planning
  bookingDetails: {
    flightNumber: null,
    passengers: null,
    seatPreference: null, // window/aisle
    mealPreference: null, // veg/non-veg/vegan
    roundTrip: false,
    returnDate: null,
    email: null,
    phone: null,
    passengerName: null,
    selectedFlight: null
  },
  bookingStep: 0, // Track which booking question we're on
  currentFlights: [] // Store available flights for booking
}

// Initialize Speech Recognition
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  
  if (!SpeechRecognition) {
    console.error('❌ Speech Recognition not supported')
    statusText.textContent = 'Speech recognition not supported in this browser'
    return null
  }

  const rec = new SpeechRecognition()
  rec.continuous = true
  rec.interimResults = true
  rec.lang = 'en-US'

  rec.onstart = () => {
    console.log('🎤 Listening...')
    micButton.classList.add('listening')
    statusText.textContent = '🎤 Listening... Speak now!'
  }

  rec.onresult = (event) => {
    let finalTranscript = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript
      }
    }
    
    if (finalTranscript) {
      console.log('📝 Transcript:', finalTranscript)
      addMessage('user', finalTranscript)
      processVoiceInput(finalTranscript)
    }
  }

  rec.onerror = (event) => {
    console.error('❌ Recognition error:', event.error)
    if (isCallActive) {
      setTimeout(() => {
        try {
          rec.start()
        } catch (e) {
          console.log('Recognition restart attempted')
        }
      }, 1000)
    }
  }

  rec.onend = () => {
    console.log('🛑 Recognition ended')
    micButton.classList.remove('listening')
    if (isCallActive) {
      setTimeout(() => {
        try {
          rec.start()
        } catch (e) {
          console.log('Recognition already running')
        }
      }, 500)
    }
  }

  return rec
}

// Open Widget
function openWidget() {
  widgetOverlay.classList.add('active')
  widgetContainer.classList.add('active')
}

// Close Widget
function closeWidgetFunc() {
  widgetOverlay.classList.remove('active')
  widgetContainer.classList.remove('active')
  
  // Stop call if active
  if (isCallActive) {
    stopCall()
  }
}

// Start Call
function startCall() {
  console.log('📞 Starting call...')
  
  if (!recognition) {
    recognition = initSpeechRecognition()
    if (!recognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }
  }

  try {
    recognition.start()
    isCallActive = true
    startBtn.disabled = true
    endBtn.disabled = false
    messagesContainer.classList.add('active')
    document.querySelector('.widget-body').classList.add('call-active')
    statusText.textContent = '🟢 Call Active - Listening...'
    
    // Check MCP connection
    checkMCPConnection()
    
    // Add greeting from Alex System Prompt
    const greeting = ALEX_SYSTEM_PROMPT.responses.greeting
    addMessage('assistant', greeting)
    speak(greeting)
    console.log('✅ Using Alex System Prompt:', ALEX_SYSTEM_PROMPT.identity.name)
    console.log('✅ Complete Instructions Loaded:', COMPLETE_ALEX_INSTRUCTIONS.length, 'characters')
    console.log('📋 Instructions include: Flight Search, 10-Step Booking, Trip Planning, Context Memory')
  } catch (error) {
    console.error('❌ Error starting call:', error)
    alert('Failed to start voice recognition. Please check microphone permissions.')
  }
}

// Stop Call
function stopCall() {
  console.log('📞 Ending call...')
  
  try {
    if (recognition) {
      recognition.stop()
    }
    
    window.speechSynthesis.cancel()
    
    isCallActive = false
    startBtn.disabled = false
    endBtn.disabled = true
    messageCount = 0
    micButton.classList.remove('listening')
    document.querySelector('.widget-body').classList.remove('call-active')
    statusText.textContent = 'Click the start button to begin a conversation'
    
    // Add goodbye
    addMessage('assistant', 'Thank you for using Attar Travel! Have a great day!')
  } catch (error) {
    console.error('❌ Error ending call:', error)
  }
}

// Check MCP Connection
async function checkMCPConnection() {
  try {
    const response = await fetch('http://localhost:4000/mcp/status')
    const data = await response.json()
    
    if (data.mcp_connected) {
      console.log('✅ MCP Connected - Real-time flights available')
      addMessage('assistant', '✅ Real-time flight search enabled via MCP')
    } else {
      console.log('⚠️ MCP Not Connected - Using mock database')
      addMessage('assistant', '⚠️ Using demo flight data (MCP not connected)')
    }
  } catch (error) {
    console.error('❌ MCP connection check failed:', error)
    addMessage('assistant', '⚠️ Using demo flight data')
  }
}

// Add Message
function addMessage(type, text) {
  const messageDiv = document.createElement('div')
  messageDiv.className = `message ${type}`
  messageDiv.textContent = text
  messagesContainer.appendChild(messageDiv)
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

// Display Flight Cards
function displayFlightCards(flights) {
  console.log('📊 Displaying', flights.length, 'flight cards')
  
  // Create cards container
  const cardsContainer = document.createElement('div')
  cardsContainer.className = 'flight-cards-container'
  cardsContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 16px 0;
    width: 100%;
  `
  
  flights.forEach((flight, index) => {
    const card = createFlightCard(flight, index)
    cardsContainer.appendChild(card)
  })
  
  messagesContainer.appendChild(cardsContainer)
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

// Create Flight Card
function createFlightCard(flight, index) {
  const card = document.createElement('div')
  card.className = 'flight-card'
  card.style.cssText = `
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(20, 184, 166, 0.2);
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `
  
  // Get flight values safely
  const getVal = (obj) => {
    if (typeof obj === 'string' || typeof obj === 'number') return obj
    if (obj && typeof obj === 'object') return obj.value || obj.name || obj.code || 'N/A'
    return 'N/A'
  }
  
  const origin = getVal(flight.origin) || flight.from_code || 'N/A'
  const destination = getVal(flight.destination) || flight.to_code || 'N/A'
  const airline = getVal(flight.airline) || flight.carrier || 'Unknown'
  const flightNumber = getVal(flight.flight_number) || flight.flightNumber || 'N/A'
  const departureTime = getVal(flight.departure_time) || flight.departureTime || 'N/A'
  const arrivalTime = getVal(flight.arrival_time) || flight.arrivalTime || 'N/A'
  const duration = getVal(flight.duration) || flight.duration_formatted || 'N/A'
  const price = flight.price ? `₹${Number(flight.price).toLocaleString()}` : 'N/A'
  const stops = flight.stops === 0 || flight.stops === '0' ? 'Non-stop' : `${getVal(flight.stops)} stop(s)`
  
  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
      <div>
        <div style="font-size: 18px; font-weight: 700; color: #10b981; margin-bottom: 6px;">
          ${airline} ${flightNumber}
        </div>
        <div style="font-size: 13px; color: rgba(255, 255, 255, 0.6); font-weight: 500;">
          ${stops}
        </div>
      </div>
      <div style="font-size: 24px; font-weight: 800; color: #10b981;">
        ${price}
      </div>
    </div>
    
    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 16px;">
      <div style="flex: 1;">
        <div style="font-size: 32px; font-weight: 800; color: #e2e8f0; letter-spacing: 1px;">${origin}</div>
        <div style="font-size: 16px; color: rgba(255, 255, 255, 0.7); margin-top: 4px;">${departureTime}</div>
      </div>
      
      <div style="flex: 0 0 auto; text-align: center;">
        <div style="font-size: 24px; color: #10b981;">✈️</div>
        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.5); margin-top: 4px; font-weight: 500;">${duration}</div>
      </div>
      
      <div style="flex: 1; text-align: right;">
        <div style="font-size: 32px; font-weight: 800; color: #e2e8f0; letter-spacing: 1px;">${destination}</div>
        <div style="font-size: 16px; color: rgba(255, 255, 255, 0.7); margin-top: 4px;">${arrivalTime}</div>
      </div>
    </div>
    
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 12px; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
      <div>
        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.5); margin-bottom: 2px;">Flight</div>
        <div style="font-size: 16px; color: #10b981; font-weight: 700;">${flightNumber}</div>
      </div>
      <div>
        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.5); margin-bottom: 2px;">Class</div>
        <div style="font-size: 16px; color: #10b981; font-weight: 700;">Economy</div>
      </div>
    </div>
    
    <button style="
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(16, 185, 129, 0.5)'" 
       onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.3)'">
      ✈️ Book Flight
    </button>
  `
  
  // Hover effect
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-4px)'
    card.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.4)'
    card.style.borderColor = 'rgba(16, 185, 129, 0.5)'
  })
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = ''
    card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
    card.style.borderColor = 'rgba(20, 184, 166, 0.2)'
  })
  
  return card
}

// Speak (TTS)
function speak(text) {
  try {
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    utterance.onend = () => {
      console.log('✅ TTS completed - Restarting recognition...')
      if (isCallActive && recognition) {
        setTimeout(() => {
          if (!micButton.classList.contains('listening')) {
            try {
              recognition.start()
              console.log('✅ Recognition restarted after TTS')
            } catch (e) {
              console.log('Recognition already active or error:', e.message)
            }
          }
        }, 500) // Small delay to ensure TTS fully completes
      }
    }
    
    utterance.onerror = (event) => {
      console.error('❌ TTS error:', event.error)
      // Try to restart recognition even on error
      if (isCallActive && recognition) {
        setTimeout(() => {
          try {
            recognition.start()
          } catch (e) {
            console.log('Recognition restart attempted after TTS error')
          }
        }, 500)
      }
    }
    
    window.speechSynthesis.speak(utterance)
  } catch (error) {
    console.error('❌ Speak error:', error)
  }
}

// NEW: Search Flights Function (Only called after collecting all required info)
async function searchFlights(origin, destination, date) {
  userContext.conversationMode = 'searching'
  statusText.textContent = '🔍 Searching real-time flights via Bright Data MCP...'
  
  try {
    console.log(`🔍 Searching flights: ${origin} → ${destination} on ${date}`)
    
    // Connect to real-time MCP Bright Data flights
    const response = await fetch('http://localhost:4000/mcp/search-flights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        departure_date: date,
        passengers: userContext.passengers || 1,
        cabin_class: userContext.cabinClass || 'economy'
      })
    })
    
    const data = await response.json()
    
    if (data.success && data.flights && data.flights.length > 0) {
      // Follow Alex's rules: brief acknowledgment ONLY
      const responseText = `I found ${data.flights.length} real-time flights from ${origin} to ${destination}! Check the flight cards above.`
      addMessage('assistant', responseText)
      speak(responseText)
      
      // Display flight cards IN THE CHAT
      displayFlightCards(data.flights)
      
      // Store flights for booking
      userContext.currentFlights = data.flights
      
      messageCount++
      performRecoveryIfNeeded()
      
      // Continue booking flow after showing cards
      setTimeout(() => {
        const bookPrompt = "Would you like to book any of these flights? Just say which flight number you prefer."
        addMessage('assistant', bookPrompt)
        speak(bookPrompt)
        userContext.conversationMode = 'booking'
        messageCount++
        performRecoveryIfNeeded()
      }, 2000)
      
      return true
    } else {
      // Try fallback mock API
      console.log('⚠️ MCP returned no flights, trying fallback...')
      const fallbackResponse = await fetch('http://localhost:4000/api/search-flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departure_date: date,
          passengers: userContext.passengers || 1,
          cabin_class: userContext.cabinClass || 'economy'
        })
      })
      
      const fallbackData = await fallbackResponse.json()
      
      if (fallbackData.success && fallbackData.flights && fallbackData.flights.length > 0) {
        const responseText = `I found ${fallbackData.flights.length} flights from ${origin} to ${destination}! Check the cards above.`
        addMessage('assistant', responseText)
        speak(responseText)
        displayFlightCards(fallbackData.flights)
        
        userContext.currentFlights = fallbackData.flights
        messageCount++
        performRecoveryIfNeeded()
        return true
      } else {
        throw new Error('No flights found in fallback')
      }
    }
  } catch (error) {
    console.error('❌ Flight search error:', error)
    const errorText = `I'm having trouble finding flights right now. Let me try again in a moment.`
    addMessage('assistant', errorText)
    speak(errorText)
    messageCount++
    performRecoveryIfNeeded()
    return false
  } finally {
    statusText.textContent = '🟢 Call Active - Listening...'
    console.log('✅ Flight search complete, conversation continues...')
  }
}

// Process Voice Input (Enhanced with Full Alex Behavior - Context Memory)
async function processVoiceInput(text) {
  const textLower = text.toLowerCase()
  
  // If in booking mode, handle booking flow
  if (userContext.conversationMode === 'booking') {
    await handleBookingFlow(text)
    messageCount++
    performRecoveryIfNeeded()
    return
  }
  
  // 🚨 CRITICAL: Extract cities from user input FIRST
  const { origin, destination } = extractFlightParams(text)
  
  // Store extracted cities in context (NEVER forget these!)
  if (origin) userContext.lastOrigin = origin
  if (destination) userContext.lastDestination = destination
  
  // Check if user mentions flights OR just mentions two cities (e.g., "Bangalore to Riyadh")
  const isFlightRequest = textLower.includes('flight') || textLower.includes('fly') || 
                          textLower.includes('travel') || textLower.includes('show') || 
                          textLower.includes('search') || textLower.includes('find') || 
                          textLower.includes('need') || textLower.includes('book') ||
                          textLower.includes('trip') || textLower.includes('package') ||
                          // 🚨 NEW: If user says "City to City", treat as flight request!
                          (origin && destination && (textLower.includes(' to ') || textLower.includes(' from ')))
  
  if (isFlightRequest) {
    // 🚨 CRITICAL RULE: DO NOT IMMEDIATELY SEARCH!
    // Follow the prompt - collect ALL details first: origin → destination → DATE → search
    
    const hasOrigin = userContext.lastOrigin
    const hasDestination = userContext.lastDestination
    const hasDate = userContext.departureDate
    
    console.log(`📋 Flight request - Origin: ${hasOrigin}, Destination: ${hasDestination}, Date: ${hasDate}`)
    
    // Step 1: Check if we have origin
    if (!hasOrigin) {
      const response = "I'd be delighted to help you with your flight booking. Could you tell me which city or airport you'll be departing from?"
      addMessage('assistant', response)
      speak(response)
      userContext.conversationMode = 'collecting_info'
      userContext.bookingStep = 'origin'
      messageCount++
      performRecoveryIfNeeded()
      return
    }
    
    // Step 2: Check if we have destination
    if (!hasDestination) {
      const response = `Excellent! Flying from ${hasOrigin}. Now, where are you planning to travel to? Please share your destination city.`
      addMessage('assistant', response)
      speak(response)
      userContext.conversationMode = 'collecting_info'
      userContext.bookingStep = 'destination'
      messageCount++
      performRecoveryIfNeeded()
      return
    }
    
    // Step 3: 🚨 CRITICAL - Ask for DATE before searching!
    if (!hasDate) {
      const response = `Perfect! Flying from ${hasOrigin} to ${hasDestination}. When are you planning to make this journey? Please share your preferred departure date.`
      addMessage('assistant', response)
      speak(response)
      userContext.conversationMode = 'collecting_info'
      userContext.bookingStep = 'date'
      messageCount++
      performRecoveryIfNeeded()
      return
    }
    
    // NOW we have origin + destination + date - SEARCH!
    console.log(`✅ All info collected! Searching: ${hasOrigin} → ${hasDestination} on ${hasDate}`)
    await searchFlights(hasOrigin, hasDestination, hasDate)
    return
  }
  
  // If user is answering a question about date
  if (userContext.bookingStep === 'date' && userContext.conversationMode === 'collecting_info') {
    // Extract date from user response
    const datePattern = /(\d{1,2})\s*(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i
    const match = text.match(datePattern)
    
    if (match) {
      const day = match[1]
      const month = match[2]
      const monthMap = {
        'january': '01', 'jan': '01',
        'february': '02', 'feb': '02',
        'march': '03', 'mar': '03',
        'april': '04', 'apr': '04',
        'may': '05',
        'june': '06', 'jun': '06',
        'july': '07', 'jul': '07',
        'august': '08', 'aug': '08',
        'september': '09', 'sep': '09',
        'october': '10', 'oct': '10',
        'november': '11', 'nov': '11',
        'december': '12', 'dec': '12'
      }
      
      const monthNum = monthMap[month.toLowerCase()]
      userContext.departureDate = `2025-${monthNum}-${day.padStart(2, '0')}`
      
      console.log(`📅 Date extracted: ${userContext.departureDate}`)
      
      // NOW search for flights!
      await searchFlights(userContext.lastOrigin, userContext.lastDestination, userContext.departureDate)
      return
    } else {
      // Couldn't parse date, ask again
      const response = "I didn't catch the date. Could you please tell me when you'd like to travel? For example, you can say 'December 15th' or 'January 20th'."
      addMessage('assistant', response)
      speak(response)
      messageCount++
      performRecoveryIfNeeded()
      return
    }
  }
  
  // PRIORITY 2: TRIP PLANNING REQUEST (only if not already a flight request)
  if ((textLower.includes('plan') || textLower.includes('itinerary')) && !origin && !destination) {
    userContext.conversationMode = 'planning'
    const planText = 'I\'d love to help you plan your trip! How many days are you planning for?'
    addMessage('assistant', planText)
    speak(planText)
    messageCount++
    performRecoveryIfNeeded()
    return
  }
  
  // PRIORITY 3: GENERAL HELP (only if no cities mentioned and no specific request)
  // 🚨 DO NOT show generic message if cities were mentioned!
  if (!origin && !destination) {
    const responseText = 'I can help you with flights, bookings, and trip planning. What would you like to do?'
    addMessage('assistant', responseText)
    speak(responseText)
    messageCount++
    performRecoveryIfNeeded()
  } else {
    // If we have cities but haven't handled it yet, just acknowledge
    console.log('⚠️ Cities mentioned but no action taken - this should not happen!')
  }
}

// Handle Booking Flow - Sophisticated Questions Following Alex's Prompt
async function handleBookingFlow(userInput) {
  const textLower = userInput.toLowerCase()
  const booking = userContext.bookingDetails
  
  // Step 1: Ask for number of passengers
  if (userContext.bookingStep === 0) {
    // Extract number from user input
    const match = userInput.match(/\d+/)
    if (match) {
      booking.passengers = parseInt(match[0])
      userContext.bookingStep = 1
      
      const msg = 'Perfect! For your ' + booking.passengers + ' passenger(s), would you prefer window seats for the view, or aisle seats for easier access?'
      addMessage('assistant', msg)
      speak(msg)
    } else {
      const clarify = 'Could you tell me the number of passengers? For example, you could say "2 passengers" or just "2".'
      addMessage('assistant', clarify)
      speak(clarify)
    }
    return
  }
  
  // Step 2: Ask for seat preference
  if (userContext.bookingStep === 1) {
    if (textLower.includes('window')) {
      booking.seatPreference = 'window'
      userContext.bookingStep = 2
      
      const msg = 'Great choice! Window seats are wonderful for viewing the landscape. Now, regarding your in-flight dining, would you prefer vegetarian meals, non-vegetarian, or do you have any vegan requirements?'
      addMessage('assistant', msg)
      speak(msg)
    } else if (textLower.includes('aisle')) {
      booking.seatPreference = 'aisle'
      userContext.bookingStep = 2
      
      const msg = 'Perfect! Aisle seats give you more flexibility. Now, regarding your in-flight dining, would you prefer vegetarian meals, non-vegetarian, or do you have any vegan requirements?'
      addMessage('assistant', msg)
      speak(msg)
    } else {
      const ask = 'Would you prefer window or aisle seats?'
      addMessage('assistant', ask)
      speak(ask)
    }
    return
  }
  
  // Step 3: Ask for meal preference
  if (userContext.bookingStep === 2) {
    if (textLower.includes('vegetarian') || textLower.includes('veg')) {
      booking.mealPreference = 'vegetarian'
      userContext.bookingStep = 3
      
      const msg = 'Excellent! Vegetarian meals will be arranged. Is this a one-way trip, or will you be returning? And if you\'re returning, when would you like to come back?'
      addMessage('assistant', msg)
      speak(msg)
    } else if (textLower.includes('non-vegetarian') || textLower.includes('non veg') || textLower.includes('meat')) {
      booking.mealPreference = 'non-vegetarian'
      userContext.bookingStep = 3
      
      const msg = 'Perfect! Non-vegetarian meals will be arranged. Is this a one-way trip, or will you be returning? And if you\'re returning, when would you like to come back?'
      addMessage('assistant', msg)
      speak(msg)
    } else if (textLower.includes('vegan')) {
      booking.mealPreference = 'vegan'
      userContext.bookingStep = 3
      
      const msg = 'Great! We\'ll arrange vegan meals for you. Is this a one-way trip, or will you be returning? And if you\'re returning, when would you like to come back?'
      addMessage('assistant', msg)
      speak(msg)
    } else {
      const ask = 'Would you prefer vegetarian, non-vegetarian, or vegan meals?'
      addMessage('assistant', ask)
      speak(ask)
    }
    return
  }
  
  // Step 4: Ask for round trip details
  if (userContext.bookingStep === 3) {
    if (textLower.includes('round') || textLower.includes('return')) {
      booking.roundTrip = true
      // Extract date if possible
      userContext.bookingStep = 4
      
      const msg = 'Wonderful! For your return flight, when would you like to head back?'
      addMessage('assistant', msg)
      speak(msg)
    } else if (textLower.includes('one way') || textLower.includes('one-way')) {
      booking.roundTrip = false
      userContext.bookingStep = 5 // Skip return date
      
      const msg = 'Perfect! One-way trip confirmed. Now, could you please provide your email address for the booking confirmation?'
      addMessage('assistant', msg)
      speak(msg)
    } else {
      const ask = 'Is this a one-way trip or a round trip?'
      addMessage('assistant', ask)
      speak(ask)
    }
    return
  }
  
  // Step 5: Get return date if round trip
  if (userContext.bookingStep === 4 && booking.roundTrip) {
    booking.returnDate = userInput // Store the date the user said
    userContext.bookingStep = 5
    
    const msg = 'Thank you! Your return date is noted. Now, could you please provide your email address for the booking confirmation?'
    addMessage('assistant', msg)
    speak(msg)
    return
  }
  
  // Step 6: Get email
  if (userContext.bookingStep === 5) {
    booking.email = userInput
    userContext.bookingStep = 6
    
    const msg = 'Perfect! Your email is saved. Could you also provide your name and phone number for the booking?'
    addMessage('assistant', msg)
    speak(msg)
    return
  }
  
  // Step 7: Get name and phone
  if (userContext.bookingStep === 6) {
    // Try to extract name and phone
    booking.passengerName = userInput
    userContext.bookingStep = 7
    
    const msg = 'Thank you! Now could you please share your phone number for contact purposes?'
    addMessage('assistant', msg)
    speak(msg)
    return
  }
  
  // Step 8: Get phone and confirm
  if (userContext.bookingStep === 7) {
    booking.phone = userInput
    
    // Summarize booking
    const summary = `Perfect! Let me confirm your booking:
    
Flight: ${booking.flightNumber || 'Selected flight'}
Passengers: ${booking.passengers}
Seat Preference: ${booking.seatPreference}
Meal: ${booking.mealPreference}
${booking.roundTrip ? `Return Date: ${booking.returnDate}` : 'One-way trip'}
Email: ${booking.email}
Name: ${booking.passengerName}
Phone: ${booking.phone}

Shall I proceed with this booking?`
    
    addMessage('assistant', summary)
    speak(`Let me confirm: ${booking.passengers} passenger with ${booking.seatPreference} seat, ${booking.mealPreference} meal. Email ${booking.email}, name ${booking.passengerName}, phone ${booking.phone}. Should I go ahead with the booking?`)
    
    userContext.bookingStep = 8
    return
  }
  
  // Step 8: Final confirmation
  if (userContext.bookingStep === 8) {
    if (textLower.includes('yes') || textLower.includes('confirm') || textLower.includes('proceed') || textLower.includes('book')) {
      // Send booking to backend
      await sendBookingToBackend()
      
      const confirmation = `Excellent! Your flight has been successfully booked! 🎉
      
Confirmation Details:
✓ Booking Reference: ATTAR${Math.random().toString(36).substr(2, 9).toUpperCase()}
✓ Flight: ${booking.flightNumber}
✓ Passengers: ${booking.passengers}
✓ Email: ${booking.email}

A detailed confirmation email has been sent to ${booking.email} with payment instructions and all booking information.

Is there anything else I can help you with today?`
      
      addMessage('assistant', confirmation)
      speak('Your booking is confirmed! A confirmation email has been sent to ' + booking.email + '. Thank you for booking with Attar Travel!')
      
      userContext.bookingStep = 0
      userContext.conversationMode = 'initial'
    } else {
      const retry = 'Should I go ahead with the booking?'
      addMessage('assistant', retry)
      speak(retry)
    }
  }
}

// Send Booking to Backend
async function sendBookingToBackend() {
  try {
    const booking = userContext.bookingDetails
    const response = await fetch('http://localhost:4000/create-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_email: booking.email,
        passenger_name: booking.passengerName,
        phone: booking.phone,
        departure_location: userContext.lastOrigin,
        destination: userContext.lastDestination,
        flight_number: booking.flightNumber,
        num_travelers: booking.passengers,
        seat_preference: booking.seatPreference,
        meal_preference: booking.mealPreference,
        round_trip: booking.roundTrip,
        return_date: booking.returnDate
      })
    })
    
    const result = await response.json()
    console.log('✅ Booking created:', result)
    
    return result
  } catch (error) {
    console.error('❌ Booking error:', error)
    return null
  }
}

// Extract Flight Parameters (Enhanced - Smarter Detection)
function extractFlightParams(text) {
  const cityMap = {
    'bangalore': 'BLR', 'bengaluru': 'BLR', 'blr': 'BLR',
    'jeddah': 'JED', 'jed': 'JED', 'jada': 'JED', 'jedda': 'JED',
    'riyadh': 'RUH', 'ruh': 'RUH',
    'dubai': 'DXB', 'dxb': 'DXB',
    'delhi': 'DEL', 'del': 'DEL',
    'mumbai': 'BOM', 'bom': 'BOM',
    'chennai': 'MAA', 'maa': 'MAA',
    'hyderabad': 'HYD', 'hyd': 'HYD',
    'kolkata': 'CCU', 'ccu': 'CCU',
    'mecca': 'JED', 'medina': 'MED',
    'dammam': 'DMM', 'dmm': 'DMM',
    'abha': 'AHB', 'ahb': 'AHB',
    'goa': 'GOI', 'goi': 'GOI',
    'kochi': 'COK', 'cochin': 'COK', 'cok': 'COK'
  }

  const textLower = text.toLowerCase()
  
  // Find all mentioned cities
  const cities = Object.entries(cityMap)
    .filter(([name]) => textLower.includes(name))
    .map(([, code]) => code)

  let origin = cities[0] || userContext.lastOrigin || null
  let destination = cities[1] || userContext.lastDestination || null
  
  // Save to context for next time
  if (origin) userContext.lastOrigin = origin
  if (destination) userContext.lastDestination = destination

  return { origin, destination }
}

// Periodic Recovery
let lastRecoveryTime = 0

function performRecoveryIfNeeded() {
  // Only perform recovery every 10 messages (not 5) to avoid interrupting conversation
  if (messageCount % 10 === 0 && messageCount > 0) {
    const now = Date.now()
    // Only recover if more than 30 seconds since last recovery (not 10)
    if (now - lastRecoveryTime > 30000) {
      console.log('🔧 Performing recovery check...')
      lastRecoveryTime = now
      
      try {
        // DO NOT cancel speech synthesis - let it complete naturally
        // window.speechSynthesis.cancel() ← Removed! This was causing AI to stop speaking
        
        // Only restart recognition if it's truly stuck
        if (recognition && isCallActive) {
          // Check if recognition is actually listening
          if (!micButton.classList.contains('listening')) {
            console.log('⚠️ Recognition not active, restarting...')
            try {
              recognition.start()
              console.log('✅ Recognition restarted')
            } catch (e) {
              console.log('Recognition already running or error:', e.message)
            }
          } else {
            console.log('✅ Recognition active, no recovery needed')
          }
        }
      } catch (error) {
        console.error('❌ Recovery error:', error)
      }
    }
  }
}

// Event Listeners
floatingBtn.addEventListener('click', openWidget)
widgetOverlay.addEventListener('click', closeWidgetFunc)
closeWidget.addEventListener('click', closeWidgetFunc)
startBtn.addEventListener('click', startCall)
endBtn.addEventListener('click', stopCall)

// Microphone button click (visual feedback only)
micButton.addEventListener('click', () => {
  if (!isCallActive) {
    alert('Please click the Start button first to begin a conversation.')
  }
})

console.log('✅ Attar Travel Assistant loaded!')

