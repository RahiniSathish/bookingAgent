# 🚨 CRITICAL: Function Not Being Called - Complete Fix

## ❌ What's Happening:

AI says: "Let me try searching for flights from Bangalore to Riyadh again"

BUT:
- ❌ search_flights function is NOT being called
- ❌ Backend logs show NO function-call events
- ❌ Flight results not appearing in frontend
- ❌ No cards being injected into widget

---

## 🔍 Root Causes (Check All):

### Issue 1: Server URL Not Set ⚠️
**Location:** Tools → search_flights → Look for "Server URL" or "Endpoint"

**Check:** Is there a field showing your webhook URL?
- If BLANK → This is the problem!
- If showing: `https://872444cf83d2.ngrok-free.app/webhooks/vapi` → OK

### Issue 2: Function Not Connected to Assistant ⚠️
**Location:** Assistants → Your Assistant → Settings

**Check:** Is search_flights listed as available?
- Should show under "Functions" or "Tools"
- Should say "Enabled" or have checkmark

### Issue 3: System Prompt Missing ⚠️
**Location:** Assistants → Your Assistant → Instructions/System Prompt

**Check:** Does it mention calling search_flights?
- Should say: "When user asks about flights, call search_flights"
- If missing → Function won't trigger

### Issue 4: Wrong Configuration Type ⚠️
**Check:** What type is search_flights?
- ✅ Should be: **Function** (not MCP Tool)
- ❌ If it's MCP → Won't call your backend

---

## ✅ COMPLETE SETUP - Copy Exactly

### Step 1: Verify search_flights is a FUNCTION (not MCP)

**In Vapi Dashboard:**
```
Tools → search_flights
Should show: "search_flights" with yellow "F" icon (Function)
NOT with pink icon (MCP Tool)
```

If it's showing as MCP Tool, you need to recreate it as a Function.

---

### Step 2: Configure search_flights Function - EXACT STEPS

**Go to:** Tools → search_flights

**Configure:**

```
📝 Name: search_flights
📝 Description: Search for flights between cities

🔧 Type: Function ← IMPORTANT!

📋 Parameters (Add all three):

1. origin
   ├─ Type: string
   ├─ Required: YES
   └─ Description: Departure city (e.g., "Bangalore")

2. destination
   ├─ Type: string
   ├─ Required: YES
   └─ Description: Arrival city (e.g., "Riyadh")

3. departure_date
   ├─ Type: string
   ├─ Required: YES
   └─ Description: Date in YYYY-MM-DD format

⚙️ Options:
├─ Async: ON ✅
└─ Strict: ON ✅

🔗 SERVER CONFIGURATION (CRITICAL!):
├─ Server URL: https://872444cf83d2.ngrok-free.app/webhooks/vapi
├─ HTTP Method: POST
├─ Timeout: 20
└─ Authentication: None
```

**CLICK: Save**

---

### Step 3: Connect Function to Assistant

**Go to:** Assistants → Your Assistant

**Find:** "Functions" or "Tools" section

**Action:** Make sure search_flights is:
- ✅ Listed / Added
- ✅ Enabled (checkmark visible)
- ✅ Not disabled

**CLICK: Save**

---

### Step 4: Set System Prompt to Trigger Function

**Go to:** Assistants → Your Assistant → Settings/Instructions

**Replace entire prompt with:**

```
You are ATAR Travel's AI assistant named Alex.

CRITICAL INSTRUCTION:
When a user asks about flights, hotels, bookings, or travel:
1. ALWAYS call the search_flights function
2. Never apologize or say "technical issue"
3. Extract these from their request:
   - origin (departure city)
   - destination (arrival city)
   - departure_date (date they want to travel)

Examples:
- User: "Show me flights from Bangalore to Riyadh"
  YOU: "Let me search for flights from Bangalore to Riyadh"
  CALL: search_flights(origin="Bangalore", destination="Riyadh", departure_date="2025-12-20")

- User: "I need to fly from Delhi to Jeddah next week"
  YOU: "I'll search for flights from Delhi to Jeddah for next week"
  CALL: search_flights(origin="Delhi", destination="Jeddah", departure_date="2025-11-07")

If user doesn't specify date:
ASK: "What date would you like to travel?"

ALWAYS call the function. Do not make up excuses about technical issues.
```

**CLICK: Save**

---

### Step 5: Publish Assistant

**Click:** Publish (top right corner)

Wait for confirmation: "✅ Published Successfully"

---

## 🧪 Test the Complete Setup

### Terminal 1: Monitor Backend Logs
```bash
cd /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot
tail -f vapivoice/logs/backend.log
```

### Terminal 2: Test in Browser
```
1. Go to: http://localhost:8080
2. Refresh (Ctrl+R or Cmd+R)
3. Click: "TALK WITH AI"
4. Click: "Start"
5. Say: "Show me flights from Bangalore to Riyadh"
6. WAIT 3-5 seconds
```

### Expected Output in Terminal 1:

```
✅ 📞 Vapi webhook received: function-call
✅ 📞 Function call received: search_flights
✅ 📝 Searching flights: Bangalore -> Riyadh
✅ 🌐 Bright Data Flight Search: BLR → RUH on 2025-12-20
✅ 📤 Returning to VAPI: 6 flight cards
```

### Expected in Widget:

```
Assistant: "Let me search for flights from Bangalore to Riyadh"
  ↓
[Widget updates]
  ↓
You: "Show me flights from Bangalore to Riyadh"
  ↓
Assistant: "I found 6 flights from Bangalore to Riyadh"
  ↓
[Flight cards appear below]
```

---

## 🔧 Troubleshooting - If Still Not Working

### Symptom 1: Still seeing "Technical issue" error

**Check:**
```bash
# 1. Are you seeing logs in terminal?
tail -20 vapivoice/logs/backend.log | grep -i "function\|search"

# If NO logs → Function not reaching backend
# If YES logs with error → Backend issue
```

**Fix:**
- [ ] Verify Server URL in search_flights function is EXACTLY: `https://872444cf83d2.ngrok-free.app/webhooks/vapi`
- [ ] Verify HTTP Method is: `POST`
- [ ] Verify Function Type is: `Function` (not MCP)
- [ ] Check ngrok tunnel is running: `ngrok http 4000`

### Symptom 2: Backend logs show error

**If logs show:**
```
Error: origin or destination is empty
```

Fix: System prompt not extracting parameters correctly
- [ ] Update system prompt with exact examples

**If logs show:**
```
400 Bad Request
```

Fix: Parameters wrong type or format
- [ ] Verify all 3 parameters are String type
- [ ] Verify all 3 are marked Required: YES

### Symptom 3: Function called but no results

**Check backend logs:**
```bash
tail -50 vapivoice/logs/backend.log | grep -A5 "search_flights"
```

Look for:
- ✅ "Bright Data Flight Search" → Working
- ❌ "No flights found" → Route not in mock DB
- ❌ Error message → API problem

---

## 📋 Final Verification Checklist

Before testing again, verify ALL:

### search_flights Function Setup:
- [ ] Name: `search_flights`
- [ ] Type: `Function` (yellow F icon, NOT pink MCP)
- [ ] Parameter 1: `origin` (string, required)
- [ ] Parameter 2: `destination` (string, required)
- [ ] Parameter 3: `departure_date` (string, required)
- [ ] Server URL: `https://872444cf83d2.ngrok-free.app/webhooks/vapi`
- [ ] HTTP Method: `POST`
- [ ] Timeout: `20` seconds
- [ ] Async: ON
- [ ] Strict: ON

### Assistant Configuration:
- [ ] search_flights function is ENABLED
- [ ] System prompt includes: "call search_flights"
- [ ] System prompt has examples
- [ ] Assistant is PUBLISHED (not just saved)

### Backend & Frontend:
- [ ] Backend running: `lsof -i :4000 | grep LISTEN`
- [ ] Frontend running: `lsof -i :8080 | grep LISTEN`
- [ ] Ngrok running: `ngrok http 4000` showing active tunnel
- [ ] Ngrok URL matches: `https://872444cf83d2.ngrok-free.app`

### Test Sequence:
- [ ] Open http://localhost:8080
- [ ] Refresh page
- [ ] Click "TALK WITH AI"
- [ ] Click "Start"
- [ ] Say clearly: "Show me flights from Bangalore to Riyadh"
- [ ] Wait 3-5 seconds
- [ ] Check backend logs for function-call

---

## 🎯 If Function STILL Not Called

**Most Common Reason:** Search_flights is configured as **MCP Tool** instead of **Function**

**Fix:**
1. Delete the MCP search_flights tool
2. Create NEW: Tools → Create Tool → Select "Function"
3. Fill in all details above
4. Save & Publish

---

## 💡 Quick Diagnostic Command

Run this to check everything:

```bash
echo "=== System Status ===" && \
echo "Backend: $(lsof -i :4000 | grep LISTEN | wc -l) running" && \
echo "Frontend: $(lsof -i :8080 | grep LISTEN | wc -l) running" && \
echo "" && \
echo "=== Recent Backend Activity ===" && \
tail -10 vapivoice/logs/backend.log | grep -E "function|search"
```

---

## 🚀 DO THIS NOW:

1. **Verify** search_flights is a FUNCTION (not MCP)
2. **Add** Server URL if missing
3. **Set** System Prompt to trigger function
4. **Publish** Assistant
5. **Test** in http://localhost:8080
6. **Share** screenshot or backend logs

---

**The function WILL work once configured correctly! 🎉**

