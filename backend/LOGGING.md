# 🔍 Leelaverse Backend Logging System

## Overview
This logging system helps you debug CORS issues and monitor API requests in production (Vercel serverless environment).

## Endpoints

### 1. View Logs (HTML Interface)
**URL:** `https://leelaverse.vercel.app/public/logs.html`

**Features:**
- 🎨 Beautiful dark-themed interface
- 🔄 Auto-refresh every 3 seconds (toggle on/off)
- 🔍 Filter by log type (CORS, REQUEST, SYSTEM)
- 📊 Real-time statistics
- 🗑️ Clear logs functionality

### 2. Get Logs (JSON API)
**URL:** `https://leelaverse.vercel.app/api/debug/logs`

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 50, max: 100)

**Example:**
```bash
curl https://leelaverse.vercel.app/api/debug/logs?limit=20
```

**Response:**
```json
{
  "success": true,
  "message": "Recent request logs",
  "count": 45,
  "logs": [
    {
      "timestamp": "2025-10-01T10:30:45.123Z",
      "type": "CORS",
      "message": "✅ Origin allowed",
      "data": {
        "origin": "https://www.leelaaverse.com"
      }
    }
  ],
  "allowedOrigins": [
    "https://www.leelaaverse.com",
    "http://localhost:5173"
  ],
  "environment": "production",
  "timestamp": "2025-10-01T10:31:00.000Z"
}
```

### 3. Clear Logs
**URL:** `https://leelaverse.vercel.app/api/debug/logs/clear`
**Method:** POST

**Example:**
```bash
curl -X POST https://leelaverse.vercel.app/api/debug/logs/clear
```

## Log Types

### CORS Logs
- **When:** Every CORS preflight and actual request
- **Contains:** Origin, allowed/blocked status, environment
- **Example Messages:**
  - `✅ Origin allowed`
  - `❌ Origin blocked`
  - `No origin - allowing request`

### REQUEST Logs
- **When:** Every API request
- **Contains:** HTTP method, path, headers (origin, referer, user-agent, content-type, authorization)
- **Example Messages:**
  - `POST /api/auth/login`
  - `GET /api/auth/profile`

### SYSTEM Logs
- **When:** System events (logs cleared, errors, etc.)
- **Contains:** Event details
- **Example Messages:**
  - `Logs cleared`

## What Gets Logged

### For Login/Signup:
```javascript
{
  "timestamp": "2025-10-01T10:30:45.123Z",
  "type": "REQUEST",
  "message": "POST /api/auth/register",
  "data": {
    "origin": "https://www.leelaaverse.com",
    "referer": "https://www.leelaaverse.com/",
    "userAgent": "Mozilla/5.0 ...",
    "contentType": "application/json",
    "authorization": "None"
  }
}
```

Additionally in console logs:
```
🔐 REGISTER attempt: { email: 'user@example.com', username: 'user', origin: 'https://www.leelaaverse.com', ip: '123.45.67.89' }
🔐 LOGIN attempt: { email: 'user@example.com', origin: 'https://www.leelaaverse.com', ip: '123.45.67.89' }
```

## Storage

- **Type:** In-memory storage
- **Limit:** Last 100 logs
- **Persistence:** Logs are lost on serverless function restart
- **Note:** This is intentional for debugging without persistent storage

## Usage for Debugging CORS

1. **Visit the logs viewer:**
   ```
   https://leelaverse.vercel.app/public/logs.html
   ```

2. **Enable auto-refresh** to see real-time requests

3. **Try to login/signup from your frontend**

4. **Check the logs for:**
   - ❌ **Blocked origins** - Your frontend origin is not in the allowed list
   - ✅ **Allowed origins** - CORS is working correctly
   - Request details showing the actual origin being sent

5. **Filter by "CORS Only"** to focus on CORS-specific issues

## Security Note

⚠️ **These endpoints are PUBLIC for debugging purposes.**

For production, consider:
- Adding authentication to the logs endpoints
- Removing or securing these endpoints after debugging
- Using proper logging services (Datadog, LogRocket, etc.)

## Example Debugging Flow

1. User reports login not working
2. Visit `https://leelaverse.vercel.app/public/logs.html`
3. Enable auto-refresh
4. Ask user to try logging in again
5. Watch logs appear in real-time
6. Check for CORS blocks or other errors
7. Fix the issue (add origin to allowedOrigins)
8. Redeploy and verify

## Removing the Logging System

When you're done debugging, you can remove:

1. The log viewer: `backend/public/logs.html`
2. The logging code in `backend/app.js`:
   - `requestLogs` array
   - `addLog` function
   - `/api/debug/logs` endpoints
3. Console logs in `authController.js`
