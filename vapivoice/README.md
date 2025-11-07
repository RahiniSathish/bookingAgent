# 🎙️ Vapi Voice Travel Assistant

A modern AI-powered voice travel booking assistant built with React, FastAPI, and Vapi AI. This application enables users to search for flights and hotels through natural voice conversations, with real-time card displays and automated booking confirmations.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Vapi Integration](#vapi-integration)
- [Development Guide](#development-guide)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)

---

## ✨ Features

### 🎙️ Voice Interaction
- Real-time voice conversation with AI assistant (Alex)
- Natural language flight and hotel search
- Transcript display with role indicators
- Visual feedback for listening/speaking states

### ✈️ Flight Booking
- Voice-activated flight search
- Interactive flight cards with:
  - Route information (origin → destination)
  - Airline and flight number
  - Departure/arrival times
  - Pricing and duration
- Automated booking confirmation
- Email notifications

### 🏨 Hotel Booking
- Voice-activated hotel search
- Hotel cards with:
  - Hotel name and location
  - Price per night
  - Ratings and amenities
- Booking management

### 📧 Email Integration
- Booking confirmation emails
- Call summary emails
- Transcript inclusion
- Automated email sending

### 📊 Call Management
- Call summaries
- Session tracking
- Booking history
- Database persistence

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - UI framework
- **Vite** - Build tool and dev server
- **@vapi-ai/web** - Vapi SDK integration
- **React Markdown** - Markdown rendering

### Backend
- **FastAPI** - Python web framework
- **SQLite** - Database for bookings
- **Uvicorn** - ASGI server
- **Python-dotenv** - Environment management

### AI & Voice
- **Vapi AI** - Voice AI platform
- **GPT-4o** - Language model
- **Deepgram Nova-2** - Speech transcription
- **Vapi Voice (Elliot)** - Text-to-speech

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** (Python 3.12 recommended)
- **Node.js 16+** (Node.js 18+ recommended)
- **npm** or **yarn**
- **Git**

### Required Accounts
- **Vapi Account** - Sign up at [dashboard.vapi.ai](https://dashboard.vapi.ai)
- **SendGrid Account** (optional) - For email sending

---

## 🚀 Quick Start

### Option 1: One-Command Start (Recommended)

```bash
# Make start script executable (first time only)
chmod +x start.sh

# Start everything
./start.sh
```

This will:
- ✅ Create Python virtual environment (if needed)
- ✅ Install backend dependencies
- ✅ Install frontend dependencies
- ✅ Start backend server (port 4000)
- ✅ Start frontend server (port 5173)
- ✅ Show status and logs

### Option 2: Manual Setup

#### Backend Setup

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn python-dotenv python-multipart sqlalchemy

# Start backend server
cd backend
uvicorn server:app --host 0.0.0.0 --port 4000 --reload
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access Points

Once started, access:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/docs
- **Interactive API Docs**: http://localhost:4000/redoc

---

## 📁 Project Structure

```
vapivoice/
├── backend/                 # Backend API server
│   ├── server.py           # FastAPI main server
│   ├── bookings.py         # Booking service & database
│   ├── email_service.py    # Email sending service
│   ├── mock_flights.py     # Mock flight database
│   ├── mock_hotels.py       # Mock hotel database
│   └── bookings.db         # SQLite database
│
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # React entry point
│   │   └── components/
│   │       ├── VoiceButton.jsx    # Voice widget
│   │       ├── FlightCard.jsx    # Flight card component
│   │       └── HotelCard.jsx    # Hotel card component
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
│
├── config/                 # Configuration files
├── logs/                   # Application logs
├── scripts/                # Utility scripts
├── venv/                   # Python virtual environment
├── start.sh                # Start script
├── .env                    # Environment variables (create this)
└── README.md              # This file
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# SMTP Configuration (for email sending)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your_sendgrid_api_key_here
FROM_EMAIL=noreply@travel.ai

# Vapi Configuration
VAPI_PUBLIC_KEY=your_vapi_public_key_here
VAPI_ASSISTANT_ID=your_assistant_id_here

# Backend Configuration
BACKEND_PORT=4000
FRONTEND_PORT=5173
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_VAPI_PUBLIC_KEY=your_vapi_public_key_here
VITE_VAPI_ASSISTANT_ID=your_assistant_id_here
VITE_BACKEND_URL=http://localhost:4000
```

### Vapi Dashboard Configuration

1. **Create Assistant**
   - Go to [Vapi Dashboard](https://dashboard.vapi.ai)
   - Create a new assistant
   - Name: "Alex - Travel Assistant"

2. **Configure Model**
   - Model: GPT-4o
   - Temperature: 0.7
   - Max Tokens: 1000

3. **Configure Voice**
   - Provider: Vapi
   - Voice: Elliot

4. **Configure Transcriber**
   - Provider: Deepgram
   - Model: Nova-2
   - Language: English

5. **Add Functions**
   - Go to Tools section
   - Add function server URL: `http://localhost:4000/api/functions`
   - Functions available:
     - `search_flights` - Search for flights
     - `search_hotels` - Search for hotels
     - `create_flight_booking` - Create flight booking

6. **Configure Webhooks**
   - End-of-call URL: `http://localhost:4000/api/vapi-webhook`
   - Status update URL: `http://localhost:4000/api/vapi-webhook`

7. **Publish Assistant**
   - Click "Publish" button
   - Copy Assistant ID and Public Key

---

## 🔌 API Endpoints

### Flight Endpoints

#### Search Flights
```http
POST /api/search-flights
Content-Type: application/json

{
  "origin": "BLR",
  "destination": "JED",
  "departure_date": "2025-12-15",
  "passengers": 1,
  "cabin_class": "economy"
}
```

#### Get Flight Cards
```http
GET /api/flight-cards/{call_id}
```

#### Create Flight Booking
```http
POST /api/create-booking
Content-Type: application/json

{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "flight_details": { ... }
}
```

### Hotel Endpoints

#### Search Hotels
```http
POST /api/search-hotels
Content-Type: application/json

{
  "city": "Riyadh",
  "check_in": "2025-12-15",
  "check_out": "2025-12-20",
  "guests": 2
}
```

#### Get Hotel Cards
```http
GET /api/hotel-cards/{call_id}
```

### Webhook Endpoints

#### Vapi Webhook
```http
POST /api/vapi-webhook
Content-Type: application/json

{
  "type": "end-of-call-report",
  "call": { ... },
  "messages": [ ... ]
}
```

### Email Endpoints

#### Send Booking Confirmation
```http
POST /api/send-booking-confirmation
Content-Type: application/json

{
  "recipient_email": "customer@example.com",
  "recipient_name": "John Doe",
  "booking_reference": "BKREF-12345",
  "booking_details": { ... }
}
```

#### Send Call Summary
```http
POST /api/send-call-summary
Content-Type: application/json

{
  "recipient_email": "customer@example.com",
  "recipient_name": "John Doe",
  "transcript": [ ... ],
  "summary": "Call summary text",
  "call_duration": 300
}
```

### Utility Endpoints

#### Get Call Summary
```http
GET /api/call-summary-latest
```

#### Health Check
```http
GET /health
```

---

## 🎯 Vapi Integration

### System Prompt

The assistant uses a detailed system prompt configured in the Vapi dashboard. Key behaviors:

1. **Flight Search Flow**
   - Collect origin, destination, departure date
   - Ask for passengers, cabin class, seat preference
   - Call `search_flights()` function
   - Display flight cards automatically
   - Wait for user selection
   - Collect booking details
   - Confirm booking

2. **Hotel Search Flow**
   - Collect city, check-in/check-out dates
   - Ask for number of guests
   - Call `search_hotels()` function
   - Display hotel cards automatically
   - Wait for user selection
   - Process booking

### Function Calling

Functions are called automatically by the AI assistant:

- **search_flights**: Searches flights and returns cards
- **search_hotels**: Searches hotels and returns cards
- **create_flight_booking**: Creates booking and sends confirmation

### Card Display

Flight and hotel cards are displayed automatically:
- Cards appear in the voice widget transcript
- Cards also appear on the main page
- Cards are cached by call_id for retrieval

---

## 💻 Development Guide

### Running in Development Mode

#### Backend
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 4000 --reload
```

#### Frontend
```bash
cd frontend
npm run dev
```

### Building for Production

#### Frontend Build
```bash
cd frontend
npm run build
```

The build output will be in `frontend/dist/`.

#### Backend Production
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 4000 --workers 4
```

### Database Management

The SQLite database is automatically created at `backend/bookings.db`.

To reset the database:
```bash
rm backend/bookings.db
# Restart backend - database will be recreated
```

### Logs

Logs are stored in the `logs/` directory:
- `backend.log` - Backend server logs
- `frontend.log` - Frontend server logs

View logs in real-time:
```bash
tail -f logs/backend.log
tail -f logs/frontend.log
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Backend Won't Start

**Error**: `ModuleNotFoundError` or `ImportError`

**Solution**:
```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 2. Frontend Won't Start

**Error**: `npm ERR!` or dependency issues

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### 3. Vapi Call Won't Start

**Error**: 400 Bad Request

**Solutions**:
- Verify Assistant ID is correct
- Check Assistant is published in Vapi dashboard
- Ensure Assistant has model configured
- Ensure Assistant has voice configured
- Verify Public Key matches workspace

#### 4. Flight Cards Not Displaying

**Error**: Cards don't appear after search

**Solutions**:
- Check backend is running on port 4000
- Verify backend received webhook from Vapi
- Check browser console for polling logs
- Verify `callId` is set correctly
- Check backend cache: `GET /api/flight-cards/latest`

#### 5. Email Not Sending

**Error**: Booking confirmed but no email

**Solutions**:
- Check SMTP configuration in `.env`
- Verify SendGrid API key is correct
- Check backend logs for email errors
- Verify recipient email is valid

#### 6. CORS Errors

**Error**: CORS policy blocked

**Solution**: CORS is configured to allow all origins. If issues persist:
- Check backend CORS middleware configuration
- Verify frontend URL matches backend CORS settings

### Debug Mode

Enable detailed logging:

**Backend**: Already enabled - check `logs/backend.log`

**Frontend**: Check browser console (F12) for:
- 🔔 Event logs
- 📞 Call status
- ✈️ Flight card detection
- 🏨 Hotel card detection
- 🔄 Polling status
- ❌ Error details

---

## 🚀 Deployment

### Frontend Deployment

#### Build for Production
```bash
cd frontend
npm run build
```

#### Deploy to Static Hosting
- Upload `frontend/dist/` to:
  - Vercel
  - Netlify
  - AWS S3 + CloudFront
  - GitHub Pages

#### Environment Variables
Set in hosting platform:
- `VITE_VAPI_PUBLIC_KEY`
- `VITE_VAPI_ASSISTANT_ID`
- `VITE_BACKEND_URL`

### Backend Deployment

#### Using Uvicorn
```bash
uvicorn server:app --host 0.0.0.0 --port 4000 --workers 4
```

#### Using Docker
```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY backend/ ./backend/
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 4000

CMD ["uvicorn", "backend.server:app", "--host", "0.0.0.0", "--port", "4000"]
```

#### Using Cloud Platforms
- **Heroku**: Use Procfile
- **AWS**: Use Elastic Beanstalk or ECS
- **Google Cloud**: Use Cloud Run
- **Azure**: Use App Service

### Environment Variables in Production

Set these in your hosting platform:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `FROM_EMAIL`
- `VAPI_PUBLIC_KEY`
- `VAPI_ASSISTANT_ID`

### Webhook URLs

Update Vapi dashboard webhook URLs:
- End-of-call URL: `https://your-backend-url.com/api/vapi-webhook`
- Status update URL: `https://your-backend-url.com/api/vapi-webhook`

---

## 📚 Additional Resources

- [Vapi Documentation](https://docs.vapi.ai)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Vapi Dashboard](https://dashboard.vapi.ai)

---

## 📝 License

This project is proprietary software for Attar Travel Agency.

---

## 🤝 Support

For issues or questions:
1. Check browser console for errors (F12)
2. Review backend logs: `tail -f logs/backend.log`
3. Verify Vapi dashboard configuration
4. Check network tab for API calls
5. Review troubleshooting section above

---

## 📊 Project Status

- ✅ Voice conversation interface
- ✅ Flight search and display
- ✅ Hotel search and display
- ✅ Booking management
- ✅ Email notifications
- ✅ Call summaries
- ✅ Database persistence
- ✅ Production ready

---

**Last Updated**: November 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅

---

## 🎉 Getting Started Checklist

- [ ] Install Python 3.8+ and Node.js 16+
- [ ] Clone repository
- [ ] Create `.env` file with credentials
- [ ] Create Vapi account and assistant
- [ ] Configure Vapi dashboard (model, voice, functions, webhooks)
- [ ] Run `./start.sh` or manual setup
- [ ] Access frontend at http://localhost:5173
- [ ] Test voice conversation
- [ ] Verify flight/hotel search works
- [ ] Check email notifications

---

**Happy Coding! 🚀**

