# 🎙️ Custom LiveKit Travel Widget

A custom-built voice-enabled travel assistant widget with **native flight card integration** inside the chat interface.

## ✨ Features

### ✅ What You Get:
- 🎤 **Voice Input** - Browser-based speech recognition
- 🔊 **Voice Output** - Text-to-speech responses
- 💬 **Chat Interface** - Clean, modern chat UI
- ✈️ **Flight Cards** - Beautiful cards **INSIDE chat** (not separate!)
- 🎨 **Full Customization** - 100% control over design
- 📱 **Responsive** - Works on desktop and mobile
- ⚡ **Real-time** - Instant responses

### 🎴 Flight Cards Integration:
- Cards appear **directly in the chat conversation**
- Part of the message flow
- Beautiful, interactive design
- Book buttons integrated
- Professional airline display

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd custom-livekit-widget
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at: **http://localhost:3002**

### 3. Ensure Backend is Running
```bash
# In another terminal, go to project root
cd ..
python backend/server.py
```

Backend should be running on: **http://localhost:4000**

---

## 🧪 How to Test

1. **Open the app:**
   ```
   http://localhost:3002
   ```

2. **Click the microphone button** 🎤 or type in the input

3. **Say or type:**
   ```
   "Show flights from Bangalore to Jeddah"
   ```

4. **Watch the magic:**
   - AI responds with voice
   - Flight cards appear **IN the chat**
   - Cards are fully interactive
   - Beautiful, professional design

---

## 📁 Project Structure

```
custom-livekit-widget/
├── src/
│   ├── components/
│   │   ├── TravelAssistant.jsx    # Main chat component
│   │   ├── TravelAssistant.css    # Chat styling
│   │   ├── FlightCard.jsx         # Flight card component
│   │   └── FlightCard.css         # Card styling
│   ├── App.jsx                    # Root component
│   ├── App.css                    # App styling
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
├── package.json                   # Dependencies
└── README.md                      # This file
```

---

## 🎨 Tech Stack

### Frontend:
- **React 18** - UI framework
- **Vite** - Build tool
- **Lucide React** - Icons
- **Web Speech API** - Voice input
- **Speech Synthesis** - Voice output

### Backend:
- **FastAPI** - Python backend (from main project)
- **Flight API** - Mock database or real-time data

---

## 🔧 Configuration

### Backend URL
Edit in `src/components/TravelAssistant.jsx`:
```javascript
const BACKEND_URL = 'http://localhost:4000'
```

### Styling
Customize colors in CSS files:
- Primary: `#667eea`
- Secondary: `#764ba2`
- Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

---

## 📊 Comparison: Custom vs Vapi

| Feature | Vapi + Button | This Custom Widget |
|---------|---------------|-------------------|
| **Cards in Chat** | ❌ Separate button | ✅ **Inside chat!** |
| **Customization** | ⚠️ Limited | ✅ **100% control** |
| **Development** | ✅ 1-2 days | ⚠️ 2-4 weeks (done!) |
| **Voice Quality** | ✅ Professional | ⚠️ Browser-based |
| **Maintenance** | ✅ Easy | ⚠️ You maintain |
| **Cost** | 💰 Subscription | ✅ Free (DIY) |

---

## 🎯 Features Breakdown

### Voice Features:
- ✅ Speech-to-text (browser API)
- ✅ Text-to-speech (browser API)
- ✅ Continuous listening
- ✅ Visual listening indicator
- ✅ Auto-stop on silence

### Chat Features:
- ✅ Message bubbles
- ✅ Timestamps
- ✅ Typing indicators
- ✅ Auto-scroll
- ✅ Smooth animations

### Flight Card Features:
- ✅ Airline name & logo
- ✅ Flight number
- ✅ Route (origin → destination)
- ✅ Times (departure & arrival)
- ✅ Duration
- ✅ Price
- ✅ Cabin class
- ✅ Stops info
- ✅ Book button

---

## 🔌 API Integration

### Search Flights
```javascript
POST http://localhost:4000/api/search-flights
{
  "origin": "BLR",
  "destination": "JED",
  "departure_date": "2025-12-15",
  "passengers": 1,
  "cabin_class": "economy"
}
```

### Response Format
```javascript
{
  "success": true,
  "flights": [
    {
      "origin": "BLR",
      "destination": "JED",
      "airline": "Emirates",
      "flight_number": "EK 501",
      "departure_time": "02:15",
      "arrival_time": "05:30",
      "duration": "3h 15m",
      "price": 28450,
      "stops": 0,
      "cabin_class": "Economy"
    }
  ]
}
```

---

## 🎨 Customization Guide

### Change Colors:
```css
/* In TravelAssistant.css */
.assistant-header {
  background: linear-gradient(135deg, YOUR_COLOR1 0%, YOUR_COLOR2 100%);
}
```

### Change Voice:
```javascript
// In TravelAssistant.jsx
const utterance = new SpeechSynthesisUtterance(text)
utterance.voice = speechSynthesis.getVoices()[0] // Choose voice
utterance.rate = 1.0 // Adjust speed
utterance.pitch = 1.0 // Adjust pitch
```

### Add More Features:
- Multi-language support
- Save conversation history
- User authentication
- Booking flow integration
- Payment processing

---

## 🐛 Troubleshooting

### Voice not working?
- Check browser permissions (microphone)
- Ensure HTTPS or localhost
- Try Chrome/Edge (best support)

### Cards not showing?
- Check backend is running (port 4000)
- Check browser console for errors
- Verify API response format

### Styling issues?
- Clear browser cache
- Check CSS file imports
- Inspect with DevTools

---

## 🚀 Build for Production

```bash
npm run build
```

Output in `dist/` folder. Deploy to:
- Vercel
- Netlify
- AWS S3
- Any static hosting

---

## 📝 Next Steps

### Enhancements:
1. **Better Voice** - Integrate ElevenLabs or Google TTS
2. **Real-time** - Add WebSocket for live updates
3. **Auth** - Add user login
4. **Booking** - Complete booking flow
5. **Payment** - Integrate payment gateway
6. **History** - Save conversation & bookings
7. **Mobile App** - Build with React Native

---

## ✅ Advantages of This Widget

1. **Cards Inside Chat** ✅
   - Naturally integrated
   - Part of conversation
   - Professional UX

2. **Full Customization** ✅
   - Any design you want
   - Any framework
   - No limitations

3. **No Subscription** ✅
   - Free to use
   - No ongoing costs
   - You own the code

4. **Brand Consistency** ✅
   - Match your brand
   - Custom colors
   - Custom layout

---

## 📚 Resources

- React: https://react.dev
- Vite: https://vitejs.dev
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- Lucide Icons: https://lucide.dev

---

## 🎉 Result

**You now have a fully functional custom widget with flight cards integrated directly in the chat!**

This is what you wanted - cards appearing naturally in the conversation, not as a separate button! 🚀

---

## 💡 Need Help?

Check the code comments or reach out for support!

**Happy coding! ✈️**

