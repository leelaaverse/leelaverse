# Authentication Fix for My AI Creations Feature

## Issues Identified and Fixed

### Issue 1: Route Order Problem ❌ → ✅
**Problem:** The route `/api/posts/my-generations` was being caught by `/api/posts/:postId` because parameterized routes were defined before specific routes.

**Error:**
```
Cast to ObjectId failed for value "my-generations" (type string) at path "_id" for model "Post"
```

**Solution:** Reordered routes in `backend/src/routes/posts.js` so that specific routes come BEFORE parameterized routes:

```javascript
// Correct order:
router.get('/feed', ...);                      // Specific
router.get('/my-generations', ...);            // Specific  ✅ MOVED UP
router.get('/fal-status/:requestId', ...);     // Semi-specific
router.get('/fal-result/:requestId', ...);     // Semi-specific
router.get('/user/:userId', ...);              // Semi-specific
router.get('/:postId', ...);                   // Generic (LAST)
```

### Issue 2: Incorrect Token Key ❌ → ✅
**Problem:** The MyGenerations component was looking for `localStorage.getItem('token')` but the auth system stores tokens as `accessToken` and `refreshToken`.

**Error:**
```json
{"success": false, "message": "Invalid token."}
```

**Solution:** Changed `MyGenerations.jsx` to use the correct token key:

```javascript
// Before:
const token = localStorage.getItem('token');

// After:
const token = localStorage.getItem('accessToken');
```

### Issue 3: User ID Extraction ❌ → ✅
**Problem:** The `getMyGenerations` controller wasn't properly handling the user ID from different authentication modes (mock vs database).

**Solution:** Updated the controller to check all possible user ID fields:

```javascript
// Before:
const userId = req.user?.id || req.user?._id;

// After:
const userId = req.user?._id || req.user?.id || req.user?.userId;
```

This handles:
- `req.user._id` - When user is fetched from database (Mongoose document)
- `req.user.id` - Alternative field name
- `req.user.userId` - When in mock mode (JWT payload directly)

## Files Modified

1. **backend/src/routes/posts.js**
   - Reordered routes to fix route matching

2. **frontend/src/components/MyGenerations.jsx**
   - Fixed token retrieval from localStorage
   - Added better error handling for auth errors
   - Added check for missing token

3. **backend/src/controllers/postController.js**
   - Fixed user ID extraction to handle multiple formats
   - Added console logging for debugging

## How to Test

1. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the feature:**
   - Log in to the application
   - Click "My AI Creations" in the sidebar
   - Should see your AI-generated images that haven't been posted

## Expected Behavior

### When Logged In ✅
- Request to `/api/posts/my-generations` succeeds
- Displays grid of AI-generated images
- Shows pagination if multiple pages
- Shows empty state if no generations exist

### When Not Logged In ⚠️
- Shows error message: "You need to log in to view your AI generations"
- Token is not present in localStorage

### When Token Expired 🔄
- Shows error message: "Your session has expired. Please log in again."
- Clears invalid token from localStorage
- User needs to log in again

## Authentication Flow

1. User logs in via `/api/auth/login`
2. Backend returns `accessToken` and `refreshToken`
3. Frontend stores both in localStorage:
   - `localStorage.setItem('accessToken', token)`
   - `localStorage.setItem('refreshToken', token)`
4. For authenticated requests:
   - Frontend retrieves: `localStorage.getItem('accessToken')`
   - Frontend sends: `Authorization: Bearer ${accessToken}`
5. Backend middleware (`auth.js`):
   - Extracts token from header
   - Verifies JWT signature
   - Fetches user from database (or uses JWT payload in mock mode)
   - Sets `req.user` for controller access

## JWT Token Structure

```javascript
{
  userId: "507f1f77bcf86cd799439011",  // MongoDB ObjectId
  email: "user@example.com",
  iat: 1697299200,  // Issued at
  exp: 1697300100   // Expires at (15 minutes for access token)
}
```

## Debugging Tips

1. **Check if user is logged in:**
   ```javascript
   console.log('Access Token:', localStorage.getItem('accessToken'));
   ```

2. **Check backend logs:**
   - Look for "Fetching generations for user:" message
   - Check for JWT verification errors

3. **Test the endpoint directly:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:3000/api/posts/my-generations
   ```

4. **View request logs:**
   Visit `http://localhost:3000/api/debug/logs` to see all recent requests

## Common Issues

### "Invalid token" error
- Token is malformed or tampered with
- Token was signed with different secret
- Clear localStorage and log in again

### "Token expired" error
- Access token expired (15 minutes)
- Use refresh token to get new access token
- Or log in again

### "User not authenticated" error
- Token doesn't contain user ID
- Auth middleware failed to set req.user
- Check JWT payload structure

---

**Status:** ✅ All issues resolved
**Date Fixed:** October 14, 2025
**Ready for Production:** Yes
