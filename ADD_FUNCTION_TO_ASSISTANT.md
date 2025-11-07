# ✅ ADD search_flights FUNCTION TO YOUR ASSISTANT

## 🎯 Your Function is PERFECT!

I can see from your screenshot:
- ✅ search_flights is a **Function** (yellow F icon)
- ✅ Server URL is set: https://872444cf83d2.ngrok-free.app/webhooks/vapi
- ✅ Parameters configured correctly
- ✅ Timeout set to 20 seconds

**BUT:** The function is not being called because it's not enabled in your Assistant!

---

## 🔧 CRITICAL STEP - Add Function to Assistant

### **Go to Vapi Dashboard:**

```
1. Click: Assistants (in left sidebar)
2. Find your assistant (the one you're using)
3. Click on it to open
```

### **Find the Functions/Tools Section:**

Look for one of these sections:
- "Functions"
- "Tools"
- "Function Calling"
- "Available Functions"

It might be:
- At the top of the page
- In a tab at the top
- In the settings area
- Need to scroll down

### **Add search_flights:**

```
1. Look for: "+ Add Function" or "+ Add Tool" button
2. Click it
3. A list of functions will appear
4. Find and SELECT: search_flights (Function)
5. Make sure it shows as ENABLED (checkmark or toggle ON)
6. Click: Save
```

### **Alternative Method (if no "+ Add" button):**

```
1. Look for a dropdown or multi-select field
2. It might say "Select functions" or "Available tools"
3. Check the box next to: search_flights
4. Click: Save
```

---

## 📝 Set System Prompt (CRITICAL!)

While in your Assistant settings:

**Go to:** Instructions or System Prompt section

**Replace with:**

```
You are ATAR Travel's AI assistant named Alex.

CRITICAL: When user asks about flights:
1. Call search_flights function
2. Extract: origin, destination, departure_date
3. Say: "Let me search for flights from [origin] to [destination]"

EXAMPLES:
User: "Find flights from Bangalore to Riyadh"
YOU say: "Let me search for flights from Bangalore to Riyadh"
YOU call: search_flights(origin="Bangalore", destination="Riyadh", departure_date="2025-12-20")

User: "Show me flights from Delhi to Jeddah"
YOU say: "I'll search for flights from Delhi to Jeddah"
YOU call: search_flights(origin="Delhi", destination="Jeddah", departure_date="2025-12-20")

RULES:
- ALWAYS call the function for flight requests
- NEVER apologize about temporary issues
- Wait for function response before speaking results
```

**Click: Save**

---

## 🚀 PUBLISH ASSISTANT

**THIS IS CRITICAL - DO NOT SKIP!**

```
1. Look for: "Publish" button (usually top right)
2. Click: Publish
3. Wait for: "✅ Published successfully" message
```

Changes won't work until you publish!

---

## 🧪 TEST IMMEDIATELY

### Terminal: Watch Logs
```bash
cd /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot
tail -f vapivoice/logs/backend.log
```

### Browser: Test Widget
```
1. Go to: http://localhost:8080
2. Refresh page (Ctrl+R or Cmd+R)
3. Click: "TALK WITH AI"
4. Click: "Start"
5. Say: "Find flights from Bangalore to Riyadh"
```

### ✅ Expected Backend Logs:
```
📞 Vapi webhook received: function-call
📞 Function call received: search_flights
Parameters received: {"origin": "Bangalore", "destination": "Riyadh", "departure_date": "2025-12-20"}
🌐 Bright Data Flight Search: BLR → RUH on 2025-12-20
📤 Returning to VAPI: 6 flight cards
✅ Success!
```

### ✅ Expected Widget:
```
You: "Find flights from Bangalore to Riyadh"
Assistant: "Let me search for flights from Bangalore to Riyadh"
Assistant: "I found 6 flights from Bangalore to Riyadh"
[6 Flight Cards Display]
```

---

## 📋 Verification Checklist

Before testing:

- [ ] search_flights function exists (✅ DONE - I saw it!)
- [ ] Server URL set (✅ DONE - https://872444cf83d2.ngrok-free.app/webhooks/vapi)
- [ ] search_flights ADDED to Assistant (⏳ DO THIS NOW!)
- [ ] search_flights ENABLED in Assistant (⏳ DO THIS NOW!)
- [ ] System Prompt set (⏳ DO THIS NOW!)
- [ ] Assistant PUBLISHED (⏳ DO THIS NOW!)

---

## 🎯 TO ANSWER YOUR QUESTION:

> "where i should add the bright data see url?"

**You already added it correctly!** ✅

The Server URL in your screenshot shows:
```
https://872444cf83d2.ngrok-free.app/webhooks/vapi
```

This is PERFECT! ✅

**You DON'T need to add Bright Data URL separately.**

Your backend handles Bright Data automatically. The flow is:
```
Vapi calls → Your ngrok URL → Your backend → Bright Data/Mock DB
```

---

## 🚨 The ONLY Thing Missing:

**The search_flights function needs to be ENABLED in your Assistant!**

Go do these 3 things:
1. Add search_flights to Assistant
2. Set System Prompt
3. Publish

Then test and it WILL WORK! 🎉

---

**Do this now and share the result! 🚀**

