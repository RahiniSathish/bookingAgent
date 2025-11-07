# 🎯 VAPI Assistant Configuration Guide

## Problem
Your Vapi assistant is NOT calling the `search_flights` function when users ask about flights.

## Solution
You need to configure your Vapi assistant in the Vapi Dashboard.

---

## Step 1: Get Your Current Vapi Keys

Your current keys (from `.env`):
```
VITE_VAPI_PUBLIC_KEY=577ae6b3-53b9-4a37-b6f6-74e8e8808368
VITE_VAPI_ASSISTANT_ID=e1c04a87-a8cf-4438-a91b-5888f69d1ef2
```

---

## Step 2: Go to Vapi Dashboard

1. Open: https://dashboard.vapi.ai
2. Log in with your Vapi account
3. Click on "Assistants" in the left sidebar
4. Find and click on your assistant: **"e1c04a87-a8cf-4438-a91b-5888f69d1ef2"**

---

## Step 3: Configure the Assistant Settings

### A. Model Settings
- **Model**: Select `gpt-4o` or `gpt-3.5-turbo`
- **Voice**: Select any voice (e.g., "Charon")
- **Language**: English

### B. System Prompt (IMPORTANT!)
Set this system prompt in the "Instructions" or "System Prompt" field:

```
You are ATAR Travel's AI assistant named Alex. You help users with:
- Flight bookings and search
- Travel packages
- Trip planning
- Hotel reservations
- Booking management

When a user asks about flights, ALWAYS use the search_flights function.
Extract the origin city, destination city, and departure date from their request.

Examples:
- "I want to go from Bangalore to Delhi" → Call search_flights(origin="Bangalore", destination="Delhi")
- "Show me flights from Mumbai to Goa next month" → Call search_flights with extracted dates
- "Find flights for tomorrow" → Ask for destination if not provided

Always confirm the details before calling the function.
```

### C. Functions (CRITICAL!)
Add the `search_flights` function:

1. Click "Add Function" or "Functions"
2. **Function Name**: `search_flights`
3. **Description**: `Search for flights between two cities`
4. **Server URL**: Your ngrok URL + `/webhooks/vapi`
   - Example: `https://872444cf83d2.ngrok-free.app/webhooks/vapi`

5. **Parameters** (Add these as function parameters):
   ```
   origin (string, required): The departure city/airport code
   destination (string, required): The arrival city/airport code
   departure_date (string, required): Date in YYYY-MM-DD format
   return_date (string, optional): Return date in YYYY-MM-DD format
   passengers (number, optional): Number of passengers, default 1
   cabin_class (string, optional): Cabin class (economy/business), default economy
   ```

6. **Function Calling**: Make sure function calling is enabled

---

## Step 4: Enable Webhooks

1. Go to "Settings" or "Webhooks" section
2. **Webhook URL**: Set to your ngrok URL
   - `https://872444cf83d2.ngrok-free.app/webhooks/vapi`

3. **Events to Enable**:
   - ✅ `call.started`
   - ✅ `call.ended`
   - ✅ `function-call`
   - ✅ `message`

---

## Step 5: Test the Configuration

1. Refresh your frontend: http://localhost:8080
2. Click "TALK WITH AI"
3. Click "Start"
4. Say: **"I want to book a flight from Bangalore to Jeddah"**

### Expected Flow:
```
You: "I want to book a flight from Bangalore to Jeddah"
   ↓
AI recognizes flight query
   ↓
AI calls search_flights function
   ↓
Backend receives webhook
   ↓
Backend searches mock flights database
   ↓
AI responds with flight options
   ↓
Flight cards appear in widget ✅
```

---

## Step 6: Verify Backend Webhook Reception

Check backend logs:
```bash
tail -50 vapivoice/logs/backend.log | grep "search_flights\|function"
```

You should see:
```
📞 Function call received: search_flights
✈️ Searching flights: Bangalore -> Jeddah on 2025-12-20
📤 Returning to VAPI: 6 flight cards
```

---

## Troubleshooting

### Issue: "Function not being called"
**Solution**: 
- Check system prompt includes instruction to call `search_flights`
- Verify function is added in the Functions section
- Check function name matches exactly: `search_flights`

### Issue: "400 Error when calling function"
**Solution**:
- Verify ngrok URL is running: `ngrok http 4000`
- Check webhook URL in Vapi matches your active ngrok URL
- Verify backend is running: `python vapivoice/backend/server.py`

### Issue: "Function called but no flights returned"
**Solution**:
- Check backend logs for errors
- Verify mock flights database is working
- Check if backend received the function parameters correctly

### Issue: "Ngrok URL expired"
**Solution**:
- Start new ngrok tunnel: `ngrok http 4000`
- Copy new URL
- Update Vapi webhook URL with new ngrok URL
- Restart backend if needed

---

## 🚀 Quick Checklist

Before testing, verify:
- [ ] Vapi assistant has `gpt-4o` or `gpt-3.5-turbo` model
- [ ] System prompt includes instruction to call `search_flights`
- [ ] `search_flights` function is added with all parameters
- [ ] Webhook URL is set to your active ngrok URL
- [ ] Backend is running on port 4000
- [ ] Frontend is running on port 8080
- [ ] Ngrok tunnel is active

---

## Need Help?

Check:
1. Browser console (F12) for frontend errors
2. Backend logs: `tail -100 vapivoice/logs/backend.log`
3. Vapi dashboard function test option (if available)

