/**
 * Travel.ai Voice Widget with MCP Function Calling
 * Automatically detects flight queries and calls MCP backend
 */

class TravelVoiceWidget {
    constructor(config = {}) {
        this.config = {
            apiUrl: config.apiUrl || 'http://localhost:8080',
            vapiPublicKey: config.vapiPublicKey || '00ed1b9b-a752-4079-bc72-32986d840d52',
            vapiAssistantId: config.vapiAssistantId || 'e1c04a87-a8cf-4438-a91b-5888f69d1ef2',
            position: config.position || 'bottom-right',
            primaryColor: config.primaryColor || '#14B8A6',
            ...config
        };

        this.isOpen = false;
        this.isListening = false;
        this.vapiClient = null;
        this.vapiReady = false;
        this.messages = [];
        this.lastUserMessage = '';
        this.processingFunction = false;
        this.flightCardsShown = false;
        this.processingFlight = false;
        
        this.init();
    }

    init() {
        this.createWidget();
        this.setupEventListeners();
        this.waitForVapiAndInit();
    }

    async waitForVapiAndInit() {
        console.log('🎙️ Initializing Vapi SDK integration...');
        
        try {
            // SDK should already be loaded by index.html
            if (window.vapiSDK && typeof window.vapiSDK.run === 'function') {
                console.log('✅ Vapi SDK is available');
                console.log('📋 SDK methods:', Object.keys(window.vapiSDK));
                await this.initVapi();
                window.dispatchEvent(new CustomEvent('vapiReady'));
            } else {
                throw new Error('Vapi SDK not properly loaded');
            }
        } catch (error) {
            console.error('❌ Vapi initialization failed:', error);
            console.error('📋 window.vapiSDK:', window.vapiSDK);
            window.dispatchEvent(new CustomEvent('vapiError', { detail: error.message }));
            this.showError('Voice service unavailable. Please refresh the page.');
        }
    }

    createWidget() {
        const button = document.createElement('button');
        button.className = 'mytrip-voice-widget-btn';
        button.innerHTML = '<span class="widget-btn-icon">🎙️</span>';
        button.onclick = () => this.togglePanel();
        button.title = 'Travel.ai Voice Assistant';
        
        const panel = document.createElement('div');
        panel.className = 'mytrip-voice-widget-panel';
        panel.innerHTML = this.getPanelHTML();

        document.body.appendChild(button);
        document.body.appendChild(panel);

        this.button = button;
        this.panel = panel;
    }

    getPanelHTML() {
        return `
            <div class="widget-panel-header">
                <div class="widget-header-content">
                    <div class="widget-header-icon">🎙️</div>
                    <div class="widget-header-text">
                        <h3>Travel.ai Assistant</h3>
                        <p>Your AI travel companion</p>
                    </div>
                </div>
                <button class="widget-close-btn" onclick="window.myTripWidget.togglePanel()">×</button>
            </div>
            <div class="widget-panel-body" id="widgetPanelBody">
                ${this.getInitialStateHTML()}
            </div>
            <div class="widget-panel-footer" style="flex-direction: column; gap: 8px;">
                <div style="display: flex; width: 100%; gap: 12px; align-items: center;">
                    <div class="footer-input-wrapper">
                        <input 
                            type="text" 
                            class="footer-input" 
                            id="widgetTextInput"
                            placeholder="What can I help you?" 
                            onkeypress="if(event.key==='Enter'){window.myTripWidget.sendTextMessage()}"
                        />
                    </div>
                    <button class="footer-send-btn" onclick="window.myTripWidget.sendTextMessage()" title="Send message">
                        ➤
                    </button>
                </div>
                <div class="footer-powered-by">
                    <span>Powered by</span>
                    <span class="footer-logo">Travel.ai</span>
                </div>
            </div>
        `;
    }

    getInitialStateHTML() {
        return `
            <div class="widget-voice-status">
                <div class="voice-status-icon">✈️</div>
                <div class="voice-status-text">Ready to help!</div>
                <div class="voice-status-subtext">Ask me about flights, airports, or travel</div>
            </div>
            <div class="widget-action-buttons">
                <button class="widget-action-btn primary" onclick="window.myTripWidget.startVoiceCall()">
                    🎤 Start Voice Call
                </button>
            </div>
            <div class="widget-examples" style="margin-top: 20px; font-size: 12px; color: #666;">
                <div style="font-weight: bold; margin-bottom: 5px;">Try asking:</div>
                <div>• "Find flights from Mumbai to Dubai"</div>
                <div>• "What's the status of flight AI123?"</div>
                <div>• "Which airport is in Bangalore?"</div>
            </div>
        `;
    }

    getListeningStateHTML() {
        return `
            <div class="widget-voice-status">
                <div class="voice-status-icon listening">🎙️</div>
                <div class="voice-status-text">Listening...</div>
                <div class="voice-status-subtext">Speak now</div>
                <div class="voice-waveform">
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                </div>
            </div>
            <div class="widget-action-buttons">
                <button class="widget-action-btn" onclick="window.myTripWidget.endVoiceCall()">
                    ❌ End Call
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        window.myTripWidget = this;
    }

    async initVapi() {
        try {
            console.log('🔧 Initializing Vapi SDK...');
            
            if (typeof window.vapiSDK === 'undefined') {
                throw new Error('Vapi SDK not loaded');
            }

            this.vapiClient = window.vapiSDK;
            this.vapiReady = true;
            
            // Set up Vapi event listeners
            this.setupVapiEventListeners();
            
            console.log('✅ Vapi SDK ready');
            console.log('📋 Configuration:', {
                publicKey: this.config.vapiPublicKey.substring(0, 10) + '...',
                assistantId: this.config.vapiAssistantId
            });
            
        } catch (error) {
            console.error('❌ Failed to initialize Vapi:', error);
            this.vapiReady = false;
            throw error;
        }
    }
    
    setupVapiEventListeners() {
        console.log('🎧 Setting up Vapi event listeners...');
        
        // Listen for messages from Vapi
        if (window.vapiSDK && window.vapiSDK.on) {
            // User speech detected
            window.vapiSDK.on('speech-start', () => {
                console.log('🎤 User started speaking');
            });
            
            // User finished speaking
            window.vapiSDK.on('speech-end', () => {
                console.log('🎤 User finished speaking');
            });
            
            // Message from user (transcript)
            window.vapiSDK.on('message', async (message) => {
                console.log('💬 Vapi message received:', message);
                
                if (message.type === 'transcript' && message.role === 'user') {
                    const userText = message.transcript || message.text || '';
                    console.log('👤 User said:', userText);
                    this.addMessage(userText, 'user');
                    
                    // Store the last user message for later use
                    this.lastUserMessage = userText;
                    
                    // Check if this is a flight query and process it
                    await this.detectAndProcessFlightQuery(userText);
                }
                
                if (message.type === 'transcript' && message.role === 'assistant') {
                    const aiText = message.transcript || message.text || '';
                    console.log('🤖 AI said:', aiText);
                    
                    // Check if AI is announcing flight results
                    const flightResultPattern = /found.*\d+.*flight|flight.*for you|search.*flight/i;
                    if (flightResultPattern.test(aiText) && this.lastUserMessage) {
                        console.log('✈️ AI announced flights! Fetching flight cards...');
                        console.log('📱 Last user message:', this.lastUserMessage);
                        // Show the AI message first
                        this.addMessage(aiText, 'ai');
                        // Then fetch and show cards
                        await this.detectAndProcessFlightQuery(this.lastUserMessage);
                        return;
                    }
                    
                    // Only add the message if we haven't already shown flight cards
                    if (!this.flightCardsShown) {
                        this.addMessage(aiText, 'ai');
                        this.showMessages();
                    } else {
                        // Reset flag for next interaction
                        this.flightCardsShown = false;
                    }
                }
            });
            
            // Call started
            window.vapiSDK.on('call-start', () => {
                console.log('📞 Call started');
                this.onCallStart();
            });
            
            // Call ended
            window.vapiSDK.on('call-end', () => {
                console.log('📞 Call ended');
                this.onCallEnd();
            });
            
            console.log('✅ Vapi event listeners registered');
        } else {
            console.warn('⚠️ Vapi SDK does not support event listeners');
        }
    }
    
    async detectAndProcessFlightQuery(userText) {
        // Prevent duplicate calls
        if (this.processingFlight) {
            console.log('⏭️ Already processing flight query, skipping...');
            return;
        }
        
        // Detect if user is asking about flights
        const flightKeywords = [
            'flight', 'fly', 'airline', 'ticket', 'travel',
            'bangalore', 'jeddah', 'mumbai', 'delhi', 'dubai',
            'show', 'find', 'search', 'book', 'options'
        ];
        
        const lowerText = userText.toLowerCase();
        const hasFlightKeyword = flightKeywords.some(keyword => lowerText.includes(keyword));
        
        // Check for route patterns (from X to Y)
        const routePattern = /(from|to|→)/i;
        const hasRoute = routePattern.test(lowerText);
        
        if (hasFlightKeyword || hasRoute) {
            console.log('✈️ Flight query detected, fetching flight cards...');
            this.processingFlight = true;
            
            try {
                // Show loading state
                this.showFlightLoading();
                
                // Call backend to get flight cards
                const response = await fetch(`${this.config.apiUrl}/api/process-query`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: userText
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const result = await response.json();
                console.log('✅ Flight data received:', result);
                
                // If we have flights, show cards and suppress the text response
                if (result.flights && result.flights.length > 0) {
                    this.flightCardsShown = true;
                    
                    // Add a brief AI message before cards
                    this.addMessage(
                        `I found ${result.flights.length} flight${result.flights.length !== 1 ? 's' : ''} for you!`, 
                        'ai'
                    );
                    
                    // Show flight cards
                    console.log('🎨 Calling showFlightCards with', result.flights.length, 'flights');
                    this.showFlightCards(result.flights);
                } else {
                    // No flights found, show messages normally
                    this.showMessages();
                }
                
            } catch (error) {
                console.error('❌ Error fetching flights:', error);
                this.showMessages();
            } finally {
                // Reset the flag after a delay
                setTimeout(() => {
                    this.processingFlight = false;
                }, 2000);
            }
        }
    }

    togglePanel() {
        this.isOpen = !this.isOpen;
        this.panel.classList.toggle('open', this.isOpen);
        
        if (this.isOpen && this.messages.length === 0) {
            const welcomeMsg = this.vapiReady 
                ? 'Hi! I\'m your Travel.ai assistant. I can help you search for flights, check flight status, and find airports. Just ask me anything!'
                : 'Hi! Voice service is loading. Please wait a moment...';
            this.addMessage(welcomeMsg, 'ai');
        }
    }

    async startVoiceCall() {
        if (!this.vapiReady || !this.vapiClient) {
            this.showError('Voice service is still loading. Please wait a moment and try again.');
            return;
        }

        try {
            console.log('📞 Starting voice call...');
            this.isListening = true;
            this.button.classList.add('active');
            this.updatePanelBody(this.getListeningStateHTML());
            
            // Use HTML SDK .run() method
            console.log('🎙️ Calling window.vapiSDK.run()...');
            console.log('📋 Configuration:', {
                publicKey: this.config.vapiPublicKey.substring(0, 10) + '...',
                assistantId: this.config.vapiAssistantId
            });
            
            // Start the call
            window.vapiSDK.run({
                apiKey: this.config.vapiPublicKey,
                assistant: this.config.vapiAssistantId
            });
            
            console.log('✅ Voice call started!');
            this.addMessage('🎙️ Voice call started - speak now! The AI will respond with voice.', 'system');
            
        } catch (error) {
            console.error('❌ Failed to start call:', error);
            this.showError(this.getErrorMessage(error));
            this.isListening = false;
            this.button.classList.remove('active');
            this.showMessages();
        }
    }


    async processUserMessage(message) {
        // Process message with OpenAI backend
        console.log('🤖 Processing message with OpenAI:', message);
        
        try {
            // Show loading state
            this.showFlightLoading();
            
            // Call OpenAI backend endpoint
            const response = await fetch(`${this.config.apiUrl}/api/process-query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ OpenAI response:', result);
            
            // Add AI message response
            if (result.message) {
                this.addMessage(result.message, 'ai');
            }
            
            // If we have flights, render them
            if (result.flights && result.flights.length > 0) {
                this.showFlightCards(result.flights);
            } else {
                // No flights found, show messages normally
                this.showMessages();
            }
            
        } catch (error) {
            console.error('❌ Error processing message:', error);
            this.showError('Failed to process your request. Please try again.');
            this.showMessages();
        }
    }
    
    showFlightLoading() {
        const loadingHTML = `
            <div class="flights-loading">
                <div class="flights-loading-spinner"></div>
                <div class="flights-loading-text">Searching for best flights...</div>
            </div>
        `;
        this.updatePanelBody(loadingHTML);
    }
    
    showFlightCards(flights) {
        console.log('✈️ Rendering flight cards:', flights.length);
        
        // Build messages first
        const messagesHTML = this.messages.map(msg => {
            let avatar = '🤖';
            let className = 'ai';
            
            if (msg.type === 'user') {
                avatar = '👤';
                className = 'user';
            } else if (msg.type === 'system') {
                avatar = 'ℹ️';
                className = 'ai';
            }

            return `
                <div class="widget-message ${className}">
                    <div class="message-avatar">${avatar}</div>
                    <div>
                        <div class="message-bubble">${this.escapeHtml(msg.text)}</div>
                        <div class="message-time">${msg.time}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Build flight cards
        const flightCardsHTML = this.renderFlightCards(flights);
        
        // Action buttons
        const actionsHTML = `
            <div class="widget-action-buttons">
                <button class="widget-action-btn primary" onclick="window.myTripWidget.startVoiceCall()">
                    🎤 Talk Again
                </button>
                <button class="widget-action-btn" onclick="window.myTripWidget.clearMessages()">
                    🗑️ Clear
                </button>
            </div>
        `;
        
        console.log('📦 Updating panel with messages and flight cards');
        console.log('📊 Messages HTML length:', messagesHTML.length);
        console.log('✈️ Flight cards HTML length:', flightCardsHTML.length);
        this.updatePanelBody(messagesHTML + flightCardsHTML + actionsHTML);
        console.log('✅ Panel body updated successfully');
    }
    
    renderFlightCards(flights) {
        if (!flights || flights.length === 0) {
            return `
                <div class="flights-empty-state">
                    <div class="empty-state-icon">✈️</div>
                    <div class="empty-state-text">No flights found for this route.</div>
                </div>
            `;
        }
        
        const cardsHTML = flights.map((flight, index) => {
            return this.createFlightCardHTML(flight, index);
        }).join('');
        
        // Add flight count header
        const flightCountHeader = `
            <div class="flight-results-header">
                <div class="results-count">
                    <span class="count-number">${flights.length}</span>
                    <span class="count-text">flight${flights.length !== 1 ? 's' : ''} found</span>
                </div>
                <div class="results-info">Best prices for your route</div>
            </div>
        `;
        
        return `
            ${flightCountHeader}
            <div class="flight-cards-container">
                ${cardsHTML}
            </div>
        `;
    }
    
    createFlightCardHTML(flight, index) {
        const departureTime = flight.from.time || '00:00';
        const arrivalTime = flight.to.time || '00:00';
        
        // Format dates
        const departureDate = flight.date ? new Date(flight.date) : new Date();
        const departureDateStr = departureDate.toLocaleDateString('en-US', { 
            day: '2-digit', 
            month: 'short' 
        }).toUpperCase();
        
        // Calculate arrival date (assuming same day or next day based on times)
        const arrivalDate = new Date(departureDate);
        if (arrivalTime < departureTime) {
            arrivalDate.setDate(arrivalDate.getDate() + 1);
        }
        const arrivalDateStr = arrivalDate.toLocaleDateString('en-US', { 
            day: '2-digit', 
            month: 'short' 
        }).toUpperCase();
        
        // Generate booking reference
        const bookingRef = flight.flight_number || `Q${Math.random().toString(36).substr(2, 5).toUpperCase()}R`;
        
        // Get airline logo/icon
        const airlineIcon = this.getAirlineIcon(flight.airline);
        
        return `
            <div class="flight-card" data-flight-id="${flight.id}" onclick="window.myTripWidget.selectFlight('${flight.id}', ${index})">
                <!-- Price Tag (Top Right) -->
                <div class="flight-price-tag">
                    <span class="price-currency">${flight.currency || '₹'}</span>${flight.price ? flight.price.toLocaleString() : '0'}
                </div>
                
                <!-- Card Header -->
                <div class="flight-card-header">
                    <div class="flight-card-title">Travel</div>
                    <div class="flight-card-menu">⋯</div>
                </div>
                
                <!-- Flight Route (Main Section) -->
                <div class="flight-route">
                    <!-- Departure -->
                    <div class="flight-location departure">
                        <div class="location-date-line">${departureDateStr}</div>
                        <div class="location-time">${departureTime}</div>
                        <div class="location-code">${this.escapeHtml(flight.from.code || 'N/A')}</div>
                    </div>
                    
                    <!-- Arrow -->
                    <div class="flight-arrow">
                        <div class="arrow-line"></div>
                        <div class="arrow-icon">✈️</div>
                        <div class="flight-duration"></div>
                    </div>
                    
                    <!-- Arrival -->
                    <div class="flight-location arrival">
                        <div class="location-date-line">${arrivalDateStr}</div>
                        <div class="location-time">${arrivalTime}</div>
                        <div class="location-code">${this.escapeHtml(flight.to.code || 'N/A')}</div>
                    </div>
                </div>
                
                <!-- Flight Details (Bottom) -->
                <div class="flight-details">
                    <div class="flight-airline-section">
                        <div class="airline-logo-large">${airlineIcon}</div>
                        <div class="airline-name-large">${this.escapeHtml((flight.airline || 'Airline').toUpperCase())}</div>
                    </div>
                    <div class="flight-booking-ref">
                        <div class="booking-label">Booking</div>
                        <div class="booking-number">${this.escapeHtml(bookingRef)}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getAirlineIcon(airlineName) {
        // Map airlines to their logos/icons
        const airlineIcons = {
            'Emirates': '🔺',
            'Delta': '🔺',
            'Saudia': '🟢',
            'IndiGo': '🔵',
            'Air India': '🔴',
            'Flynas': '🟣',
            'Etihad': '🟡',
            'Vistara': '🟣',
            'SpiceJet': '🔴'
        };
        
        return airlineIcons[airlineName] || '✈️';
    }
    
    selectFlight(flightId, index) {
        console.log('✈️ Flight selected:', flightId, index);
        // Highlight the selected card
        const cards = document.querySelectorAll('.flight-card');
        cards.forEach(card => card.style.borderColor = '');
        if (cards[index]) {
            cards[index].style.borderColor = 'var(--widget-primary)';
            cards[index].style.boxShadow = '0 8px 24px rgba(65, 105, 225, 0.25)';
        }
    }
    
    bookFlight(flightId, index) {
        console.log('📝 Booking flight:', flightId, index);
        this.addMessage(`Great choice! I'll help you book flight ${flightId}. Please provide your passenger details.`, 'ai');
        this.showMessages();
        
        // In a real implementation, this would start the booking flow
        // For now, we'll show a message
        setTimeout(() => {
            this.addMessage('Booking flow will be implemented with Vapi voice assistant. Please use voice call to complete booking.', 'system');
        }, 1000);
    }


    speakMessage(text) {
        // Use browser's speech synthesis as fallback
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    }

    endVoiceCall() {
        if (this.isListening) {
            console.log('🛑 Ending voice call...');
            
            // Stop Vapi call
            try {
                if (window.vapiSDK && window.vapiSDK.stop) {
                    window.vapiSDK.stop();
                    console.log('✅ Call stopped');
                }
            } catch (error) {
                console.error('❌ Error stopping call:', error);
            }
            
            this.onCallEnd();
        }
    }

    onCallStart() {
        this.isListening = true;
        this.button.classList.add('active');
        // Message already added in startVoiceCall
    }

    onCallEnd() {
        this.isListening = false;
        this.button.classList.remove('active');
        this.showMessages();
        this.addMessage('Call ended. How else can I help you?', 'system');
    }

    addMessage(text, type) {
        const time = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        this.messages.push({ text, type, time });
        
        // Always show messages if panel is open, even while listening
        if (this.isOpen) {
            this.showMessages();
        }
    }

    showMessages() {
        const messagesHTML = this.messages.map(msg => {
            let avatar = '🤖';
            let className = 'ai';
            
            if (msg.type === 'user') {
                avatar = '👤';
                className = 'user';
            } else if (msg.type === 'system') {
                avatar = 'ℹ️';
                className = 'ai';
            }

            return `
                <div class="widget-message ${className}">
                    <div class="message-avatar">${avatar}</div>
                    <div>
                        <div class="message-bubble">${this.escapeHtml(msg.text)}</div>
                        <div class="message-time">${msg.time}</div>
                    </div>
                </div>
            `;
        }).join('');

        const actionsHTML = `
            <div class="widget-action-buttons">
                <button class="widget-action-btn primary" onclick="window.myTripWidget.startVoiceCall()">
                    🎤 Talk Again
                </button>
                <button class="widget-action-btn" onclick="window.myTripWidget.clearMessages()">
                    🗑️ Clear
                </button>
            </div>
        `;

        this.updatePanelBody(messagesHTML + actionsHTML);
    }

    updatePanelBody(html) {
        const body = document.getElementById('widgetPanelBody');
        if (body) {
            body.innerHTML = html;
            // Scroll to bottom to show latest message
            setTimeout(() => {
                body.scrollTop = body.scrollHeight;
            }, 50);
        }
    }

    clearMessages() {
        this.messages = [];
        this.updatePanelBody(this.getInitialStateHTML());
    }

    async sendTextMessage() {
        const input = document.getElementById('widgetTextInput');
        if (!input || !input.value.trim()) return;

        const message = input.value.trim();
        input.value = '';

        console.log('💬 Text message sent:', message);
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Process the message with OpenAI backend
        await this.processUserMessage(message);
    }

    showError(message) {
        console.error('⚠️ Widget Error:', message);
        this.addMessage(`⚠️ ${message}`, 'system');
        
        if (this.isOpen) {
            this.showMessages();
        }
    }

    getErrorMessage(error) {
        if (error.message) {
            if (error.message.includes('permission') || error.message.includes('Permission')) {
                return 'Microphone permission denied. Please allow microphone access and try again.';
            } else if (error.message.includes('secure') || error.message.includes('HTTPS')) {
                return 'Voice calls require HTTPS. Please use a secure connection.';
            } else if (error.message.includes('assistant')) {
                return 'Voice assistant not configured. Please check your settings.';
            } else {
                return `Error: ${error.message}`;
            }
        }
        return 'Failed to start voice call. Please try again.';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Auto-initialize widget when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
} else {
    initWidget();
}

function initWidget() {
    console.log('🚀 Initializing Travel.ai Voice Widget with MCP...');
    
    const widget = new TravelVoiceWidget({
        apiUrl: 'http://localhost:8080',
        vapiPublicKey: '00ed1b9b-a752-4079-bc72-32986d840d52',
        vapiAssistantId: '15f69bff-0ae1-4b2a-a4f3-aa84c350a73f'
    });

    window.myTripWidget = widget;
    
    console.log('🎙️ Travel.ai Voice Widget with MCP initialized!');
    console.log('✅ Features: Auto function calling, Flight search, Status check, Airport search');
}

export default TravelVoiceWidget;
export { TravelVoiceWidget };

