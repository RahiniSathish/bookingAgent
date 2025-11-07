import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Plane, Phone, PhoneOff } from 'lucide-react'
import FlightCard from './FlightCard'
import './TravelAssistant.css'

const BACKEND_URL = 'http://localhost:4000'

function TravelAssistant() {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)  // NEW: Track if call is active
  const [flights, setFlights] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const isProcessingRef = useRef(false)  // NEW: Prevent duplicate processing
  const messageCountRef = useRef(0)  // Track message count for recovery
  const lastRecoveryRef = useRef(0)  // Track last recovery time

  // Initialize Speech Recognition - Continuous Mode
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.error('❌ Speech Recognition not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true  // ✅ Keep listening continuously
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      console.log('🎤 Continuous listening started')
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      console.log('📝 Recognition result:', event.results.length)
      
      // Get the most recent final result
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        }
      }
      
      if (finalTranscript) {
        console.log('📄 Final transcript:', finalTranscript)
        setInputText(finalTranscript)
      }
    }

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error)
      if (isCallActive) {
        // Auto-restart listening on error if call is still active
        console.log('🔄 Restarting listening due to error...')
        setTimeout(() => {
          try {
            recognition.start()
          } catch (e) {
            console.error('Failed to restart:', e)
          }
        }, 1000)
      }
    }

    recognition.onend = () => {
      console.log('🛑 Speech recognition ended')
      // Don't set isListening to false - restart if call is still active
      if (isCallActive) {
        console.log('🔄 Restarting listening (call still active)...')
        setTimeout(() => {
          try {
            recognition.start()
          } catch (e) {
            console.log('Recognition already running')
          }
        }, 500)
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition
    console.log('✅ Speech recognition initialized for continuous mode')
  }, [isCallActive])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, flights])

  // Auto-process transcript when it changes and listening is active
  useEffect(() => {
    if (inputText.trim() && inputText.length > 3 && isCallActive && !isProcessingRef.current) {
      console.log('🚀 Auto-processing transcript:', inputText)
      isProcessingRef.current = true
      
      setTimeout(() => {
        handleVoiceMessage(inputText.trim())
        setInputText('')
        isProcessingRef.current = false
      }, 200)
    }
  }, [inputText, isCallActive])

  const startCall = () => {
    if (!recognitionRef.current) {
      console.error('❌ Speech Recognition not initialized')
      alert('Speech Recognition is not available in your browser.\nPlease use Chrome, Edge, or Safari.')
      return
    }

    try {
      console.log('📞 Starting continuous voice call...')
      setIsCallActive(true)
      setIsListening(true)
      setInputText('') // Clear previous text
      recognitionRef.current.start()
      
      // Add initial greeting
      setMessages([{
        type: 'assistant',
        text: 'Hello! Welcome to Attar Travel. I\'m Alex, your AI travel assistant. How can I help you today?',
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('❌ Error starting call:', error)
      setIsCallActive(false)
      setIsListening(false)
    }
  }

  const endCall = () => {
    console.log('📞 Ending call...')
    try {
      // Cancel all speech synthesis
      window.speechSynthesis.cancel()
      
      // Stop recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      
      // Reset all states
      setIsCallActive(false)
      setIsListening(false)
      setInputText('')
      setFlights([])
      
      // Reset counters
      messageCountRef.current = 0
      lastRecoveryRef.current = 0
      isProcessingRef.current = false
      
      // Add goodbye message
      setMessages(prev => [...prev, {
        type: 'assistant',
        text: 'Thank you for using Attar Travel! Have a great day!',
        timestamp: new Date()
      }])
      
      console.log('✅ Call ended, all states reset')
    } catch (error) {
      console.error('❌ Error ending call:', error)
      setIsCallActive(false)
    }
  }

  const speak = (text) => {
    try {
      // Cancel any ongoing speech first to prevent queue buildup
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      // Add event listeners for debugging and recovery
      utterance.onstart = () => {
        console.log('🔊 TTS started')
      }
      
      utterance.onend = () => {
        console.log('✅ TTS completed')
        // Ensure recognition is still running after speech
        if (isCallActive && recognitionRef.current && !isListening) {
          console.log('🔄 Restarting recognition after TTS')
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.log('Recognition already active')
          }
        }
      }
      
      utterance.onerror = (event) => {
        console.error('❌ TTS error:', event.error)
        // Try to recover recognition even if TTS fails
        if (isCallActive && recognitionRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current.start()
            } catch (e) {
              console.log('Recognition recovery attempted')
            }
          }, 500)
        }
      }
      
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('❌ Speak error:', error)
    }
  }

  const searchFlights = async (origin, destination) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/search-flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departure_date: '2025-12-15',
          passengers: 1,
          cabin_class: 'economy'
        })
      })

      const data = await response.json()
      if (data.success && data.flights) {
        return data.flights
      }
      return []
    } catch (error) {
      console.error('Flight search error:', error)
      return []
    }
  }

  const extractFlightParams = (text) => {
    const cityMap = {
      'bangalore': 'BLR', 'bengaluru': 'BLR', 'blr': 'BLR',
      'jeddah': 'JED', 'jed': 'JED',
      'riyadh': 'RUH', 'ruh': 'RUH',
      'dubai': 'DXB', 'dxb': 'DXB'
    }

    const textLower = text.toLowerCase()
    const cities = Object.entries(cityMap)
      .filter(([name]) => textLower.includes(name))
      .map(([, code]) => code)

    return {
      origin: cities[0] || null,
      destination: cities[1] || null
    }
  }

  const handleVoiceMessage = async () => {
    if (!inputText.trim()) return

    const userMessage = inputText.trim()
    
    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      text: userMessage,
      timestamp: new Date()
    }])

    // Check if it's a flight search query
    const textLower = userMessage.toLowerCase()
    if (textLower.includes('flight') || textLower.includes('fly') || textLower.includes('show')) {
      setIsLoading(true)
      
      const { origin, destination } = extractFlightParams(userMessage)
      console.log('🔍 Extracted params:', { origin, destination })
      
      if (origin && destination) {
        // Search flights
        const foundFlights = await searchFlights(origin, destination)
        console.log('📊 Found flights:', foundFlights)
        
        if (foundFlights.length > 0) {
          const assistantText = `I found ${foundFlights.length} flights! Check them out below.`
          
          setMessages(prev => [...prev, {
            type: 'assistant',
            text: assistantText,
            timestamp: new Date()
          }])
          
          speak(assistantText)
          setFlights(foundFlights)
        } else {
          const noFlightsText = `Sorry, I couldn't find any flights from ${origin} to ${destination}.`
          setMessages(prev => [...prev, {
            type: 'assistant',
            text: noFlightsText,
            timestamp: new Date()
          }])
          speak(noFlightsText)
        }
      } else {
        const clarifyText = 'I need the origin and destination cities. For example: "Show flights from Bangalore to Jeddah"'
        setMessages(prev => [...prev, {
          type: 'assistant',
          text: clarifyText,
          timestamp: new Date()
        }])
        speak(clarifyText)
      }
      
      setIsLoading(false)
    } else {
      // General response
      const responseText = 'I can help you search for flights! Try saying "Show flights from Bangalore to Jeddah"'
      setMessages(prev => [...prev, {
        type: 'assistant',
        text: responseText,
        timestamp: new Date()
      }])
      speak(responseText)
    }
    
    // Increment message count and perform recovery if needed
    messageCountRef.current += 1
    console.log(`📊 Message count: ${messageCountRef.current}`)
    
    // Perform recovery every 5 messages to prevent Web Speech API fatigue
    if (messageCountRef.current % 5 === 0) {
      const now = Date.now()
      // Only recover if it's been at least 10 seconds since last recovery
      if (now - lastRecoveryRef.current > 10000) {
        console.log('🔧 Performing periodic recovery...')
        lastRecoveryRef.current = now
        performRecovery()
      }
    }
  }
  
  const performRecovery = () => {
    try {
      console.log('🔧 Starting recovery process...')
      
      // 1. Cancel all pending TTS
      window.speechSynthesis.cancel()
      
      // 2. Stop and restart recognition
      if (recognitionRef.current && isCallActive) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.log('Recognition already stopped')
        }
        
        // 3. Restart after a brief pause
        setTimeout(() => {
          if (isCallActive && recognitionRef.current) {
            try {
              recognitionRef.current.start()
              console.log('✅ Recovery complete - recognition restarted')
            } catch (e) {
              console.log('Recognition already running')
            }
          }
        }, 1000)
      }
    } catch (error) {
      console.error('❌ Recovery error:', error)
    }
  }

  return (
    <div className="travel-assistant">
      <div className="assistant-header">
        <Plane className="header-icon" />
        <h1>Attar Travel Assistant</h1>
        <p>{isCallActive ? '🟢 Call Active - Listening Continuously' : 'Voice-powered flight search'}</p>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.type}`}>
              <div className="message-content">
                {msg.text}
              </div>
              <div className="message-time">
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          {flights.length > 0 && (
            <div className="flight-cards-container">
              <div className="cards-header">
                <Plane size={20} />
                <h3>{flights.length} Available Flights</h3>
              </div>
              <div className="flight-cards-grid">
                {flights.map((flight, idx) => (
                  <FlightCard key={idx} flight={flight} />
                ))}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container voice-only">
          {!isCallActive ? (
            <button 
              className="call-button start-call"
              onClick={startCall}
              title="Start voice call"
            >
              <Phone size={24} />
              <span>📞 Start Call</span>
            </button>
          ) : (
            <>
              <button 
                className={`voice-button ${isListening ? 'listening' : ''}`}
                disabled
                title="Listening..."
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                {isListening && <span className="pulse"></span>}
              </button>
              
              <div className="voice-status">
                {isListening ? '🎤 Listening...' : '⏸️ Processing...'}
              </div>

              <button 
                className="call-button end-call"
                onClick={endCall}
                title="End call"
              >
                <PhoneOff size={24} />
                <span>📞 End Call</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TravelAssistant

