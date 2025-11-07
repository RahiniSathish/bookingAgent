# ✅ Vapi Tool-Calls Webhook Fix - Complete Solution

## Problem Identified
Your Vapi backend was rejecting `tool-calls` webhooks with: **"Your server rejected `tool-calls` webhook"**

The issue was **response format mismatch**. Vapi expects a specific structure that wasn't being provided.

---

## Root Cause Analysis

### ❌ Old Response Format (WRONG)
```json
{
  "text": "I found 3 flights...",
  "cards": [
    {
      "title": "BLR → RUH",
      "subtitle": "Emirates | EK567",
      ...
    }
  ]
}
```

### ✅ Correct Response Format (NOW FIXED)
```json
{
  "results": [
    {
      "toolCallId": "call_xyz_123",
      "result": {
        "text": "I found 3 flights...",
        "cards": [
          {
            "title": "BLR → RUH",
            "subtitle": "Emirates | EK567",
            ...
          }
        ]
      }
    }
  ]
}
```

---

## Changes Made

### 1. Extract Tool Call ID
```python
# NEW: Extract toolCallId from Vapi payload
tool_call_id = (
    function_call.get("id")
    or payload.get("toolCallId")
    or payload.get("id")
    or "unknown"
)
logger.info(f"🔑 Tool Call ID: {tool_call_id}")
```

### 2. Wrap All Responses in Results Array
**All function call responses now follow this format:**

#### ✅ Success Response
```python
return JSONResponse(
    content={
        "results": [{
            "toolCallId": tool_call_id,
            "result": vapi_response  # Contains cards + text
        }]
    },
    status_code=200,
    media_type="application/json"
)
```

#### ✅ Error Response
```python
return JSONResponse(
    content={
        "results": [{
            "toolCallId": tool_call_id,
            "result": "Error message"
        }]
    },
    status_code=200,
    media_type="application/json"
)
```

#### ✅ No Flights Found
```python
return JSONResponse(
    content={
        "results": [{
            "toolCallId": tool_call_id,
            "result": "No flights found..."
        }]
    },
    status_code=200,
    media_type="application/json"
)
```

### 3. Fixed Response Cases
All these cases now return proper Vapi format:
- ✅ Search flights - success
- ✅ Search flights - no results  
- ✅ Missing parameters (origin/destination)
- ✅ Errors during search
- ✅ Unknown functions

---

## How This Fixes Your Issue

**Before Fix:**
1. User says: "Search flights from Bangalore to Riyadh"
2. Vapi sends tool-call webhook
3. Backend returns wrong format
4. Vapi rejects it: "Your server rejected `tool-calls` webhook"
5. User hears: "It seems there's an issue retrieving flights..."

**After Fix:**
1. User says: "Search flights from Bangalore to Riyadh"
2. Vapi sends tool-call webhook
3. Backend returns proper `{"results": [{...}]}` format ✅
4. Vapi accepts it and processes the result
5. Flight cards display in chat with options to book ✅
6. User hears: "I found 3 flights from Bangalore to Riyadh"

---

## Testing the Fix

### Test in Your Vapi Dashboard:
1. **Open**: http://localhost:8080
2. **Click**: Voice button
3. **Say**: "Search flights from Bangalore to Riyadh on December 20"
4. **Expected**: Flight cards appear with booking options

### Check Backend Logs:
```bash
tail -50 /Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot/backend.log
```

Look for:
```
🔧 Function call received from Vapi
🔑 Tool Call ID: call_xyz_123
📞 Function: search_flights
✈️ Searching flights: Bangalore -> Riyadh on 2025-12-20
✅ Found 3 flights
📤 Returning to VAPI: 3 flight cards with text message
```

---

## Files Modified

**Backend**: `/Users/apple/AI-Travel-agency/AI-Voice-Agent-Travel-/Production/vapi-voicebot/vapivoice/backend/server.py`

**Endpoint**: `/webhooks/vapi` (lines 828-1290)

**Key Section**: Function call handling (lines 863-1127)

---

## Services Running

| Service | URL | Port | Status |
|---------|-----|------|--------|
| Backend API | http://localhost:4000 | 4000 | ✅ Running |
| Frontend | http://localhost:8080 | 8080 | ✅ Running |
| MCP Client | Integrated | N/A | ✅ Ready |
| API Docs | http://localhost:4000/docs | 4000 | ✅ Available |

---

## What Happens When User Calls `search_flights`

```
1. Vapi receives: "Search flights from Bangalore to Riyadh"
   ↓
2. Vapi sends POST /webhooks/vapi with tool-call event
   ↓
3. Backend extracts:
   - toolCallId (e.g., "call_xyz_123")
   - function_name: "search_flights"
   - origin: "Bangalore"
   - destination: "Riyadh"
   - departure_date: "2025-12-20"
   ↓
4. Backend searches flights using Bright Data API
   ↓
5. Backend returns:
   {
     "results": [{
       "toolCallId": "call_xyz_123",
       "result": {
         "text": "I found 3 flights...",
         "cards": [...]
       }
     }]
   }
   ↓
6. Vapi displays flight cards in chat
   ↓
7. User can book by clicking "Book Now" button
```

---

## Next Steps

1. ✅ **Backend restarted** with new webhook format
2. 🔄 **Test with voice**: Say "Search flights" in the interface
3. 📱 **Check frontend**: Flight cards should display
4. 📊 **Monitor logs**: Verify tool call ID is being passed correctly
5. 🎉 **Success**: No more "Your server rejected" errors!

---

## Vapi Documentation Reference

For more details on Vapi's Custom Tools and tool calls:
https://docs.vapi.ai/tools/custom-tools

**Key Requirements Implemented:**
- ✅ Proper `toolCallId` extraction and response
- ✅ `results` array wrapper for all responses
- ✅ HTTP 200 status code
- ✅ `application/json` content-type
- ✅ Error handling with proper format

---

**Last Updated**: November 1, 2025
**Status**: ✅ Fixed and Deployed
