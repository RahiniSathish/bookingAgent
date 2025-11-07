# 🚨 FIX: "Your server rejected 'tool-calls' webhook" Error

## ✅ What's Working:

From your screenshots:
- ✅ search_flights function is added to Tools
- ✅ Function IS being called by Vapi
- ✅ Backend is running

## ❌ What's Not Working:

Error shown: **"Your server rejected 'tool-calls' webhook. Error: Request..."**

**Root Cause:** Vapi cannot reach your backend webhook URL

---

## 🔧 IMMEDIATE FIX - Check Ngrok Tunnel

Your function has this Server URL:
```
https://872444cf83d2.ngrok-free.app/webhooks/vapi
```

**This ngrok tunnel might be down or expired!**

### **Step 1: Check if Ngrok is Running**

Run this command:
```bash
curl https://872444cf83d2.ngrok-free.app/webhooks/vapi
```

If you see:
- ❌ "ERR_NGROK_108" or "Tunnel not found" → Ngrok is down
- ❌ "Connection refused" → Ngrok needs to be restarted
- ✅ Any other response → Ngrok is working

### **Step 2: Restart Ngrok Tunnel**

```bash
# Stop any existing ngrok
pkill ngrok

# Start new ngrok tunnel to port 4000
ngrok http 4000
```

You'll see output like:
```
Forwarding  https://NEW-URL-HERE.ngrok-free.app -> http://localhost:4000
```

**Copy the NEW ngrok URL!**

### **Step 3: Update Server URL in Vapi**

1. Go to: Vapi Dashboard → Tools → search_flights
2. Find: Server Settings → Server URL
3. Replace with: `https://NEW-URL-HERE.ngrok-free.app/webhooks/vapi`
4. Click: Save
5. Go to: Assistants → Your Assistant
6. Click: Publish

---

## 🧪 TEST AFTER FIXING

### Terminal 1: Watch Logs
```bash
tail -f /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot/vapivoice/logs/backend.log
```

### Terminal 2: Test
```
http://localhost:8080
Click: TALK WITH AI → Start
Say: "Find flights from Bangalore to Riyadh"
```

### ✅ Expected Logs:
```
📞 Vapi webhook received: tool-calls ✅
🔧 Function call received from Vapi ✅
📦 Event type: tool-calls ✅
🔍 Function: search_flights ✅
Parameters: origin=Bangalore, destination=Riyadh ✅
🌐 Bright Data Flight Search: BLR → RUH ✅
📤 Returning to VAPI: 6 flight cards ✅
```

---

## 📋 Alternative Fix - Use localhost.run (if ngrok keeps failing)

```bash
# Install localhost.run (no account needed)
ssh -R 80:localhost:4000 nokey@localhost.run

# You'll get a URL like:
# https://random-id.lhr.life

# Use this URL in Vapi instead:
# https://random-id.lhr.life/webhooks/vapi
```

---

## ⚠️ Common Ngrok Issues

### Issue 1: Ngrok tunnel expired
**Fix:** Restart ngrok (ngrok free tunnels expire after 2 hours)

### Issue 2: Ngrok not running
**Fix:** Start ngrok: `ngrok http 4000`

### Issue 3: Wrong ngrok URL in Vapi
**Fix:** Copy NEW ngrok URL and update in Vapi dashboard

### Issue 4: Firewall blocking ngrok
**Fix:** Allow ngrok through firewall or use localhost.run

---

## 🎯 SUMMARY

**The function is configured correctly!**

The only issue is: **Vapi can't reach your backend because ngrok tunnel is down**

**Fix:**
1. Restart ngrok: `ngrok http 4000`
2. Copy new URL
3. Update Server URL in search_flights function
4. Publish assistant
5. Test

---

## �� Quick Check Script

Run this to diagnose:
```bash
echo "=== Ngrok Status ===" && \
curl -s https://872444cf83d2.ngrok-free.app/webhooks/vapi -I | head -3 && \
echo "" && \
echo "=== Backend Status ===" && \
lsof -i :4000 | grep LISTEN && echo "✅ Backend running" || echo "❌ Backend not running"
```

---

**Fix ngrok and it will work! 🚀**

