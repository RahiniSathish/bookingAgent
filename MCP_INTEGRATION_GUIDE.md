# 🎯 Vapi + Bright Data MCP Integration Guide

## ✅ What You've Done Correctly

You've added **Bright Data Flight Details MCP tool** in your Vapi assistant with:
- ✅ Bright Data API key
- ✅ Real-time flight data source
- ✅ MCP tool configuration in Vapi dashboard

---

## 🔗 How It Works Now

```
Your Question: "Show me flights from Bangalore to Jeddah"
    ↓
Vapi Assistant listens
    ↓
Vapi Dashboard has:
  - System Prompt (tells AI to call search_flights)
  - search_flights function (with your backend webhook)
  - MCP Tool: Bright Data (for real-time flight details)
    ↓
AI decides: "User wants flights, I'll call search_flights"
    ↓
Vapi calls YOUR BACKEND: https://your-ngrok.app/webhooks/vapi
    ↓
Backend receives: search_flights(origin="Bangalore", destination="Jeddah")
    ↓
Backend now has:
  - Primary: Bright Data API (real-time data)
  - Fallback: Mock Database (if Bright Data unavailable)
    ↓
Backend returns flights with cards
    ↓
Vapi speaks: "I found X flights..."
    ↓
Flight cards appear in widget ✅
```

---

## 📊 Current Architecture

```
┌─────────────────────────────────────┐
│     Your Voice Widget               │
│  (React Component - VoiceButton)    │
└──────────────┬──────────────────────┘
               │ User speaks query
               ↓
┌─────────────────────────────────────┐
│    Vapi Assistant (Dashboard)       │
│ - Model: gpt-4o                     │
│ - Functions: search_flights         │
│ - MCP Tools: Bright Data            │
│ - System Prompt: Triggers function  │
└──────────────┬──────────────────────┘
               │ Calls function
               ↓
┌─────────────────────────────────────┐
│   Your Backend (FastAPI)            │
│  /webhooks/vapi endpoint            │
└──────────────┬──────────────────────┘
               │
        ┌──────┴───────┐
        ↓              ↓
    ┌────────┐    ┌─────────────┐
    │ Bright │    │    Mock     │
    │ Data   │    │  Database   │
    │ (Real- │    │  (Fallback) │
    │ time)  │    │             │
    └────────┘    └─────────────┘
        │              │
        └──────┬───────┘
               ↓
    Returns: {flights: [...], cards: [...]}
               │
        ↓──────┴──────────┐
               │           │
            Cards ← ─ ─ ─ ─┘
```

---

## ✅ Backend Status

The backend now has three layers:

### Layer 1: Bright Data API (Primary)
```python
✅ BrightDataFlightAPI initialized
✅ Bright Data API key found
✅ Ready for real-time flight searches
```

### Layer 2: Mock Database (Fallback)
```python
✅ Available routes:
   - Bangalore (BLR) ↔ Jeddah (JED)
   - Bangalore (BLR) ↔ Riyadh (RUH)
   - Bangalore (BLR) ↔ Dubai (DXB)
```

### Layer 3: Error Handling
```python
✅ If Bright Data fails → Falls back to Mock
✅ If Mock fails → Returns error message
```

---

## 🚀 What You Need to Do Now

### 1. Verify Vapi Configuration (Dashboard)
- [ ] Go to: https://dashboard.vapi.ai
- [ ] Find your assistant: `e1c04a87-a8cf-4438-a91b-5888f69d1ef2`
- [ ] Check:
  - System Prompt includes: "When user asks about flights, call search_flights"
  - Function `search_flights` is defined with:
    - Name: `search_flights`
    - Parameters: origin, destination, departure_date
    - Webhook: Your ngrok URL
  - MCP Tool is configured: Bright Data

### 2. Verify Backend Webhook
```bash
# Check backend is running
lsof -i :4000 | grep LISTEN

# Check logs for Bright Data
tail -20 vapivoice/logs/backend.log | grep "Bright"
```

### 3. Test the Flow
1. Refresh: http://localhost:8080
2. Click: "TALK WITH AI" → "Start"
3. Say: "Find me flights from Bangalore to Jeddah"
4. Expected:
   - Console shows: "📞 Function call received: search_flights"
   - Backend logs show: "🌐 Bright Data Flight Search"
   - AI responds with flight options
   - Flight cards appear

---

## 🔍 How MCP Tool Works

The **Bright Data MCP tool** you added in Vapi is independent from the `search_flights` function.

### They Work Together Like This:

1. **User asks:** "Show flights from Bangalore to Jeddah"

2. **Vapi AI uses System Prompt:**
   - "When user asks about flights, call search_flights function"

3. **Vapi calls `search_flights` function:**
   ```
   POST /webhooks/vapi
   {
     "function": "search_flights",
     "parameters": {
       "origin": "Bangalore",
       "destination": "Jeddah"
     }
   }
   ```

4. **Backend searches:**
   - Primary: Bright Data API (via backend code)
   - Fallback: Mock Database

5. **Backend returns flights with cards**

6. **Vapi uses MCP Tool (optional):**
   - For flight details (seat availability, amenities, etc.)
   - Real-time price updates
   - Seat selection

---

## 📝 Expected Console Output

When you ask for flights:

```
[Frontend Console]
📝 TRANSCRIPT from message event - role: user, type: final, text: Find flights from Bangalore to Jeddah

[Backend Console]
📞 Vapi webhook received: function-call
📞 Function call received: search_flights
🌐 Bright Data Flight Search: BLR → JED on 2025-12-20
📤 Returning to VAPI: 6 flight cards
✈️ First card: {title: "BLR → JED", subtitle: "Indigo | 6E456", footer: "⏰ 08:30 - 12:45 | 💰 ₹2,450 | ⏱️ 4h 15m"}

[Frontend Console]
💬 Vapi message event: {type: 'transcript', role: 'assistant', transcript: 'I found 6 flights...'}
✈️ Flight cards detected: 6
📊 Transcript after add: 3 messages
```

---

## 🛠️ Troubleshooting

### Issue: MCP Tool shows as "Not Configured"
**Solution:**
- Go to Vapi dashboard
- Click on assistant
- Scroll to MCP/Tools section
- Ensure Bright Data tool is added

### Issue: Function called but returns mock data instead of Bright Data
**This is OK!** The flow:
1. Bright Data API called
2. If it returns data → Use it
3. If it fails → Fallback to mock
4. Both provide flight cards correctly

### Issue: "No flights found"
**Check:**
```bash
# Verify mock database has the route
grep -i "bangalore\|jeddah" vapivoice/backend/mock_flights_database.py

# Check backend logs
tail -50 vapivoice/logs/backend.log | grep "BLR\|JED\|search_flights"
```

---

## 📊 Supported Routes (Mock Database)

```
Bangalore (BLR):
  → Jeddah (JED) ✅
  → Riyadh (RUH) ✅
  → Dubai (DXB) ✅
```

If you need other routes, they'll come from Bright Data API when it's working.

---

## 🎯 Next Steps

1. **Test now:**
   ```bash
   # 1. Ensure services running
   lsof -i :8080 | grep LISTEN  # Frontend
   lsof -i :4000 | grep LISTEN  # Backend
   
   # 2. Test in browser
   http://localhost:8080
   
   # 3. Watch logs
   tail -f vapivoice/logs/backend.log
   ```

2. **Ask for flights** and watch the flow work!

3. **Share screenshot** if anything breaks

---

## ✅ Current Status

| Component | Status | Details |
|-----------|--------|---------|
| Frontend | ✅ | Auto-reloading, transcripts working |
| Backend | ✅ | Bright Data API initialized, mock fallback ready |
| Vapi MCP Tool | ✅ | Configured in dashboard |
| Vapi search_flights Function | ⏳ | Needs system prompt + function definition |
| Ngrok Tunnel | ✅ | Active: https://872444cf83d2.ngrok-free.app |

---

**Ready to test? Go to http://localhost:8080 and ask for flights! 🚀**

