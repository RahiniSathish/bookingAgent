# 🚨 QUICK FIX - Function Not Being Called

## ❌ What's Happening:

You're getting: *"I'm sorry there was a technical issue searching for flights just now"*

**Root Cause:** Vapi assistant is NOT calling the `search_flights` function

**Proof:** Backend logs show NO `function-call` events - only `end-of-call-report`

---

## ✅ What You MUST Do - STEP BY STEP

### Step 1: Go to Vapi Dashboard
```
1. Open: https://dashboard.vapi.ai
2. Click: Assistants (left sidebar)
3. Find & Click: your assistant ID
   e1c04a87-a8cf-4438-a91b-5888f69d1ef2
```

### Step 2: Configure System Prompt
**Go to:** Settings or Instructions section

**Replace with this exact prompt:**
```
You are ATAR Travel's AI assistant named Alex.

IMPORTANT: When a user asks about flights, you MUST:
1. Call the search_flights function
2. Extract: origin, destination, departure_date from their request
3. Confirm before searching: "Let me search for flights from [origin] to [destination]"

Example user inputs and your response:
- User: "Show me flights from Bangalore to Riyadh"
  Your response: "Let me search for flights from Bangalore to Riyadh"
  Then CALL: search_flights(origin="Bangalore", destination="Riyadh", departure_date="2025-12-20")

- User: "I want to fly from Delhi to Jeddah next week"
  Your response: "I'll search for flights from Delhi to Jeddah"
  Then CALL: search_flights(origin="Delhi", destination="Jeddah", departure_date="2025-11-07")

ALWAYS call the function for flight requests. Do not apologize about technical issues - just call the function.
```

### Step 3: Add the Function (CRITICAL!)
**Go to:** Functions or Tools section

**Click:** "Add Function" or "Add Tool"

**Fill in:**
```
Function Name: search_flights
Description: Search for available flights between two cities

Enable Function Calling: YES ✅

Add Parameters:

1. origin
   - Type: String
   - Required: YES ✅
   - Description: Departure city (e.g., "Bangalore", "BLR")

2. destination
   - Type: String
   - Required: YES ✅
   - Description: Arrival city (e.g., "Riyadh", "RUH")

3. departure_date
   - Type: String
   - Required: YES ✅
   - Description: Departure date in YYYY-MM-DD format (e.g., "2025-12-20")

4. return_date
   - Type: String
   - Required: NO ❌
   - Description: Optional return date in YYYY-MM-DD format

5. passengers
   - Type: Number
   - Required: NO ❌
   - Default: 1
   - Description: Number of passengers

6. cabin_class
   - Type: String
   - Required: NO ❌
   - Default: economy
   - Description: Cabin class (economy, business, first)

Server URL: https://872444cf83d2.ngrok-free.app/webhooks/vapi
HTTP Method: POST
```

### Step 4: Verify Webhook Configuration
**Go to:** Settings or Webhooks section

**Set:**
```
Webhook URL: https://872444cf83d2.ngrok-free.app/webhooks/vapi

Enable Events:
- ✅ call.started
- ✅ call.ended
- ✅ function-call
- ✅ transcript
- ✅ message
```

### Step 5: Save & Publish
- Click: **Save** or **Update**
- Click: **Publish** (if available)
- Wait for confirmation

---

## 🧪 Test Immediately After Configuration

```bash
# 1. Go to: http://localhost:8080

# 2. Click: "TALK WITH AI" button

# 3. Click: "Start"

# 4. Say: "Show me flights from Bangalore to Riyadh"

# 5. Watch backend logs:
tail -f vapivoice/logs/backend.log | grep -E "search_flights|function-call"

# 6. Expected logs:
# 📞 Vapi webhook received: function-call
# 📞 Function call received: search_flights
# 🌐 Bright Data Flight Search: BLR → RUH
# 📤 Returning to VAPI: 6 flight cards
```

---

## 🔍 If Still Not Working - Debug Checklist

### Check 1: Function Name Exact Match
```
In Vapi: search_flights
Backend expects: search_flights
✅ Must be EXACT match (case sensitive)
```

### Check 2: Webhook URL Correct
```
Your ngrok URL: https://872444cf83d2.ngrok-free.app
Backend endpoint: /webhooks/vapi
Full URL: https://872444cf83d2.ngrok-free.app/webhooks/vapi

✅ Make sure ngrok tunnel is still running:
ngrok http 4000
```

### Check 3: Function Enabled
```
In Vapi Dashboard:
- Is the function showing as "Enabled"? ✅
- Are parameters filled in? ✅
- Is webhook URL set? ✅
```

### Check 4: System Prompt Mentions Function
```
Your system prompt should include:
"When user asks about flights, call search_flights"

✅ Check that it's there
```

---

## 📊 Expected Flow After Fix

```
You speak: "Show flights from Bangalore to Riyadh"
   ↓
Vapi hears & processes
   ↓
System Prompt triggers: "This is a flight request, call search_flights"
   ↓
Vapi calls function with parameters:
   {
     "origin": "Bangalore",
     "destination": "Riyadh",
     "departure_date": "2025-12-20"
   }
   ↓
Backend receives webhook:
   📞 Function call received: search_flights ✅
   ↓
Backend searches Bright Data (or mock):
   🌐 Bright Data Flight Search: BLR → RUH ✅
   ↓
Backend returns flights with cards:
   📤 Returning 6 flight cards ✅
   ↓
Vapi speaks: "I found 6 flights from Bangalore to Riyadh"
   ↓
Widget shows flight cards ✅
```

---

## ⚠️ Common Mistakes to Avoid

❌ **Mistake 1:** Function name as "search_flights_function"
✅ **Correct:** "search_flights"

❌ **Mistake 2:** Webhook URL with trailing slash
✅ **Correct:** "https://872444cf83d2.ngrok-free.app/webhooks/vapi"

❌ **Mistake 3:** Origin/destination as full city names only
✅ **Correct:** Accept both "Bangalore" and "BLR"

❌ **Mistake 4:** Not publishing after changes
✅ **Correct:** Always save AND publish

❌ **Mistake 5:** Ngrok tunnel down
✅ **Correct:** Keep ngrok running: `ngrok http 4000`

---

## 🎯 Do This RIGHT NOW:

1. Open Vapi Dashboard
2. Find your assistant
3. Add system prompt (copy from above)
4. Add search_flights function (copy parameters from above)
5. Verify webhook URL
6. Save & Publish
7. Test in http://localhost:8080
8. Share result!

---

**This is the ONLY thing missing! Do it now and it will work! 🚀**

