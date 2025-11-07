import './index.css'
import COMPLETE_ALEX_INSTRUCTIONS from './COMPLETE_ALEX_INSTRUCTIONS.js'

// Import LiveKit
import { Room, RoomEvent, Track } from 'livekit-client'

// LiveKit Configuration
const LIVEKIT_URL = 'wss://aiinterviewprod-anr5bvh0.livekit.cloud'
const LIVEKIT_API_KEY = 'APIiwNSMd2Nsxvq'
const LIVEKIT_API_SECRET = 'KWkVh4Z01q4Sbx9xJegB1fE7iyGijslBNCvogi1Igpb'

console.log('✅ Using Alex System Prompt:', COMPLETE_ALEX_INSTRUCTIONS ? 'Loaded' : 'Not loaded')
console.log('📋 Complete Instructions Loaded: ' + (COMPLETE_ALEX_INSTRUCTIONS ? COMPLETE_ALEX_INSTRUCTIONS.substring(0, 100) + '...' : 'None'))

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
let livekitRoom = null
let localAudioTrack = null
let messageCount = 0

// User Context Memory
let userContext = {
  lastOrigin: null,
  lastDestination: null,
  departureDate: null,
  passengers: null,
  cabinClass: null,
  conversationMode: 'initial',
  bookingDetails: {},
  bookingStep: 0,
  currentFlights: []
}

// Open Widget
function openWidget() {
  widgetOverlay.classList.add('active')
  widgetContainer.classList.add('active')
  console.log('✅ Widget opened')
}

// Close Widget
function closeWidgetFunc() {
  widgetOverlay.classList.remove('active')
  widgetContainer.classList.remove('active')
  if (isCallActive) {
    stopCall()
  }
  console.log('✅ Widget closed')
}

// Add Message to Chat
function addMessage(sender, text) {
  const messageDiv = document.createElement('div')
  messageDiv.className = `message ${sender}`
  
  const contentDiv = document.createElement('div')
  contentDiv.className = 'message-content'
  contentDiv.textContent = text
  
  messageDiv.appendChild(contentDiv)
  messagesContainer.appendChild(messageDiv)
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight
  
  console.log(`💬 ${sender}: ${text}`)
}

// Start Call with LiveKit
async function startCall() {
  if (isCallActive) return
  
  try {
    console.log('🚀 Starting LiveKit call...')
    isCallActive = true
    startBtn.disabled = true
    endBtn.disabled = false
    statusText.textContent = '🟡 Connecting to Alex...'
    micButton.classList.add('listening')
    
    // Generate room name
    const roomName = 'travel-room-' + Math.random().toString(36).substring(7)
    console.log('📋 Room name:', roomName)
    
    // Create LiveKit room
    livekitRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
    })
    
    // Set up event listeners
    livekitRoom
      .on(RoomEvent.Connected, () => {
        console.log('✅ Connected to LiveKit room')
        statusText.textContent = '🟢 Connected - Alex will join shortly...'
        addMessage('system', 'Connected! Alex is joining...')
      })
      .on(RoomEvent.Disconnected, () => {
        console.log('❌ Disconnected from room')
        statusText.textContent = '⚫ Disconnected'
        cleanup()
      })
      .on(RoomEvent.ParticipantConnected, (participant) => {
        console.log('👤 Participant joined:', participant.identity)
        if (participant.identity.includes('agent') || participant.identity.includes('alex') || participant.identity.includes('attar')) {
          statusText.textContent = '🟢 Call Active - Alex is here!'
          addMessage('system', '✅ Alex joined the conversation!')
        }
      })
      .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log('🎵 Track subscribed:', track.kind, 'from', participant.identity)
        
        if (track.kind === Track.Kind.Audio) {
          // Attach audio to a hidden audio element
          const audioElement = track.attach()
          audioElement.id = 'livekit-audio-output'
          audioElement.autoplay = true
          audioElement.style.display = 'none'
          document.body.appendChild(audioElement)
          console.log('🔊 Audio track attached and playing')
        }
      })
      .on(RoomEvent.DataReceived, (payload, participant) => {
        try {
          const decoder = new TextDecoder()
          const message = decoder.decode(payload)
          console.log('📨 Data received:', message)
          
          const data = JSON.parse(message)
          
          if (data.type === 'transcript' && data.role === 'assistant') {
            // Agent transcript
            addMessage('assistant', data.text)
          } else if (data.type === 'transcript' && data.role === 'user') {
            // User transcript
            addMessage('user', data.text)
          } else if (data.flights) {
            // Flight data received
            console.log('✈️ Flights received:', data.flights.length)
            displayFlightCards(data.flights)
          }
        } catch (e) {
          console.log('Not JSON data:', e)
        }
      })
      .on(RoomEvent.AudioPlaybackStatusChanged, (playing) => {
        console.log('🔊 Audio playback:', playing ? 'started' : 'stopped')
        if (playing) {
          micButton.classList.add('speaking')
        } else {
          micButton.classList.remove('speaking')
        }
      })
    
    // Connect to room (simplified token for demo)
    console.log('🔗 Connecting to:', LIVEKIT_URL)
    await livekitRoom.connect(LIVEKIT_URL, `${LIVEKIT_API_KEY}:${LIVEKIT_API_SECRET}`, {
      autoSubscribe: true,
    })
    
    console.log('✅ Connected to room')
    
    // Publish microphone
    console.log('🎤 Publishing microphone...')
    localAudioTrack = await livekitRoom.localParticipant.createAudioTrack()
    await livekitRoom.localParticipant.publishTrack(localAudioTrack)
    console.log('✅ Microphone published')
    
    statusText.textContent = '🟢 Call Active - Speak now!'
    
    // Initial greeting (will come from agent)
    setTimeout(() => {
      if (isCallActive && livekitRoom.participants.size === 0) {
        addMessage('system', 'Waiting for Alex to join the room...')
      }
    }, 3000)
    
  } catch (error) {
    console.error('❌ LiveKit connection error:', error)
    statusText.textContent = '❌ Connection failed'
    addMessage('system', 'Connection failed: ' + error.message)
    cleanup()
  }
}

// Stop Call
async function stopCall() {
  if (!isCallActive) return
  
  try {
    console.log('🛑 Stopping call...')
    
    if (livekitRoom) {
      await livekitRoom.disconnect()
    }
    
    cleanup()
    
    statusText.textContent = '⚫ Call ended'
    addMessage('system', 'Call ended')
    
  } catch (error) {
    console.error('❌ Error stopping call:', error)
    cleanup()
  }
}

// Cleanup
function cleanup() {
  isCallActive = false
  
  if (localAudioTrack) {
    localAudioTrack.stop()
    localAudioTrack = null
  }
  
  livekitRoom = null
  
  startBtn.disabled = false
  endBtn.disabled = true
  micButton.classList.remove('listening')
  micButton.classList.remove('speaking')
  
  // Remove audio element
  const audioEl = document.getElementById('livekit-audio-output')
  if (audioEl) {
    audioEl.remove()
  }
  
  console.log('🧹 Cleanup complete')
}

// Display Flight Cards
function displayFlightCards(flights) {
  console.log('📋 Displaying', flights.length, 'flight cards')
  
  // Clear any existing cards
  const existingCardsContainer = document.getElementById('flight-cards-container')
  if (existingCardsContainer) {
    existingCardsContainer.remove()
  }
  
  // Create cards container
  const cardsContainer = document.createElement('div')
  cardsContainer.id = 'flight-cards-container'
  cardsContainer.style.cssText = `
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-height: 500px;
    overflow-y: auto;
  `
  
  // Create each flight card
  flights.forEach((flight, index) => {
    const card = createFlightCard(flight, index)
    cardsContainer.appendChild(card)
  })
  
  // Add to messages container
  messagesContainer.appendChild(cardsContainer)
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

// Create Flight Card
function createFlightCard(flight, index) {
  const card = document.createElement('div')
  card.style.cssText = `
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    border-radius: 16px;
    padding: 20px;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(20, 184, 166, 0.2);
    transition: all 0.3s ease;
    cursor: pointer;
  `
  
  const airline = flight.airline || 'Unknown Airline'
  const flightNumber = flight.flight_number || 'N/A'
  const origin = flight.origin || 'N/A'
  const destination = flight.destination || 'N/A'
  const departureTime = flight.departure_time || 'N/A'
  const arrivalTime = flight.arrival_time || 'N/A'
  const duration = flight.duration || 'N/A'
  const price = flight.price || 0
  const currency = flight.currency || 'INR'
  
  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
      <div>
        <div style="font-size: 20px; font-weight: 700; color: #10b981; margin-bottom: 4px;">${airline}</div>
        <div style="font-size: 14px; color: rgba(255, 255, 255, 0.7);">Flight ${flightNumber}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 24px; font-weight: 800; color: #fbbf24;">${currency} ${price.toLocaleString()}</div>
        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">per person</div>
      </div>
    </div>
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <div style="flex: 1; text-align: left;">
        <div style="font-size: 32px; font-weight: 800; color: #e2e8f0; letter-spacing: 1px;">${origin}</div>
        <div style="font-size: 16px; color: rgba(255, 255, 255, 0.7); margin-top: 4px;">${departureTime}</div>
      </div>
      <div style="flex: 0 0 auto; padding: 0 20px;">
        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.5); margin-bottom: 8px; text-align: center;">${duration}</div>
        <div style="height: 2px; width: 60px; background: rgba(255, 255, 255, 0.3); position: relative;">
          <div style="position: absolute; right: -6px; top: -4px; width: 10px; height: 10px; border-right: 2px solid rgba(255, 255, 255, 0.5); border-top: 2px solid rgba(255, 255, 255, 0.5); transform: rotate(45deg);"></div>
        </div>
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
  
  // Hover effects
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

// Event Listeners
floatingBtn.addEventListener('click', openWidget)
widgetOverlay.addEventListener('click', closeWidgetFunc)
closeWidget.addEventListener('click', closeWidgetFunc)
startBtn.addEventListener('click', startCall)
endBtn.addEventListener('click', stopCall)

// Microphone button (visual only)
micButton.addEventListener('click', () => {
  if (!isCallActive) {
    alert('Please click the Start button first to begin a conversation.')
  }
})

console.log('✅ Attar Travel Assistant (LiveKit) loaded!')
console.log('🎙️ Real-time voice with LiveKit Agent')


