# ✅ Vapi Function Setup Verification Guide

## What You Have Set Up:

### ✅ Tools Created:
1. **flightgo** (MCP Tool) - Bright Data real-time flights
2. **search_flights** (Function Tool) - Your backend endpoint
3. **flight_detail** (MCP Tool) - Bright Data flight details

### ✅ search_flights Function:
- Name: `search_flights`
- Type: Function (not MCP)
- Description: "Search flights"
- Parameters: origin, destination, departure_date (all required strings)
- Async: ON ✅
- Strict: ON ✅

---

## ⚠️ What's MISSING - The Critical Part:

### You need to ADD the Server URL (Webhook):

**In the search_flights function page, scroll down to find:**

1. **Server URL** (or Webhook URL)
   - Add: `https://872444cf83d2.ngrok-free.app/webhooks/vapi`

2. **HTTP Method**
   - Select: `POST`

3. **Timeout**
   - Set: `20` seconds (or higher)

---

## 📋 Complete search_flights Function Setup:

```
Function Name: search_flights
Description: Search flights
Type: Function

Parameters:
✅ origin (string, required)
✅ destination (string, required)
✅ departure_date (string, required)

Server Configuration:
□ Server URL: https://872444cf83d2.ngrok-free.app/webhooks/vapi
□ HTTP Method: POST
□ Timeout: 20 seconds

Options:
✅ Async: ON
✅ Strict: ON
```

---

## 🔗 How to Add Server URL:

1. Go to: Tools → search_flights (Function)
2. Scroll down to "Server Configuration" or "Webhook"
3. Click "Add Server URL" or similar
4. Paste: `https://872444cf83d2.ngrok-free.app/webhooks/vapi`
5. Method: POST
6. Save

---

## 📊 Function vs MCP Tool - What Do You Need?

### search_flights (Function) ← YOU NEED THIS ✅
```
Purpose: Call YOUR BACKEND webhook
Returns: Flight search results
Webhook: https://872444cf83d2.ngrok-free.app/webhooks/vapi
When called: Vapi sends parameters to your backend
```

### flightgo (MCP Tool) - Optional
```
Purpose: Real-time Bright Data integration
Returns: Live flight data
When called: Direct Bright Data API call (backup)
```

### flight_detail (MCP Tool) - Optional
```
Purpose: Get detailed flight information
Returns: Seat availability, amenities, etc.
When called: Direct Bright Data API call
```

---

## 🎯 Connection Strategy:

```
User: "Show me flights from Bangalore to Riyadh"
   ↓
Vapi AI processes
   ↓
AI calls: search_flights function ← PRIMARY ✅
   ↓
Your Backend receives webhook
   ↓
Backend uses: Bright Data or Mock DB
   ↓
Returns: Flight cards + response
   ↓
Vapi speaks: "I found X flights"
   ↓
If Bright Data needed: Vapi can also call flightgo MCP tool ← BACKUP
```

---

## 🚀 What to Do RIGHT NOW:

1. **Open Vapi Dashboard**
2. **Go to:** Tools → search_flights
3. **Add Server URL:** `https://872444cf83d2.ngrok-free.app/webhooks/vapi`
4. **Set HTTP Method:** POST
5. **Click:** Save
6. **Go to:** Assistants → Your Assistant
7. **Set System Prompt** (if not done):
```
You are ATAR Travel's AI assistant.
When user asks about flights, call search_flights function.
Extract: origin, destination, departure_date.
```
8. **Click:** Save & Publish
9. **Test:** http://localhost:8080 → Ask for flights

---

## ✅ Checklist:

- [ ] search_flights function has Server URL set
- [ ] Server URL is: https://872444cf83d2.ngrok-free.app/webhooks/vapi
- [ ] HTTP Method: POST
- [ ] Async: ON
- [ ] Strict: ON
- [ ] System Prompt mentions "search_flights"
- [ ] All saved & published

---

## 🧪 Test After Adding Server URL:

```bash
# Watch logs
tail -f vapivoice/logs/backend.log

# Go to: http://localhost:8080
# Click: TALK WITH AI → Start
# Say: "Find flights from Bangalore to Riyadh"

# Expected:
# 📞 Vapi webhook received: function-call
# 📞 Function call received: search_flights
# 🌐 Bright Data Flight Search
# 📤 Returning to VAPI: 6 flight cards
```

---

## ⚠️ If Server URL Not Set:

- ❌ search_flights won't call your backend
- ❌ Vapi will try to call Bright Data directly (if available)
- ❌ Your backend won't receive the webhook
- ❌ "Technical issue" error appears

**This is likely why you're getting the error!**

---

## 🎯 PRIORITY:

### Add Server URL to search_flights function ← DO THIS NOW!

That's the missing piece!

