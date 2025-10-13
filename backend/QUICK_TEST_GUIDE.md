# 🧪 Quick Test Guide

## Prerequisites Checklist

```bash
# 1. Environment Variables Set
✓ FAL_KEY
✓ CLOUDINARY_CLOUD_NAME
✓ CLOUDINARY_API_KEY
✓ CLOUDINARY_API_SECRET
✓ MONGODB_URI
✓ JWT_SECRET

# 2. Dependencies Installed
✓ npm install (backend)
✓ axios & cloudinary installed

# 3. Database Running
✓ MongoDB running
✓ User with credits exists

# 4. Servers Running
✓ Backend: npm run dev (port 3000)
✓ Frontend: npm run dev (port 5173)
```

---

## Quick Test Commands

### 1. Seed User Credits
```bash
cd backend
node src/utils/seedUserCredits.js
```

Expected output:
```
✅ Updated X users with default credits
📊 Current User Credits:
1. testuser (test@leelaverse.com)
   Coins: 500
   Image Gen: 10
   ...
```

### 2. Test Health Check
```bash
curl http://localhost:3000/api/health
```

Expected:
```json
{"success": true, "message": "Leelaverse Backend API is running"}
```

### 3. Login & Get Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@leelaverse.com","password":"Test123!@#"}'
```

Copy the `token` from response.

### 4. Test Image Generation
```bash
# Replace YOUR_TOKEN with actual token
curl -X POST http://localhost:3000/api/posts/generate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "aspectRatio": "16:9"
  }'
```

Expected:
```json
{
  "success": true,
  "message": "Image generation started",
  "generationId": "gen_1234567890_userId",
  "estimatedTime": "15-30 seconds"
}
```

### 5. Check Generation Status
```bash
# Replace GEN_ID with actual generationId
curl http://localhost:3000/api/posts/generate-status/GEN_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Poll this every 2-3 seconds until `status: "completed"`

Expected when complete:
```json
{
  "success": true,
  "status": "completed",
  "progress": 100,
  "imageUrl": "https://fal.ai/files/...",
  "message": "Image generated successfully!"
}
```

### 6. Create Post
```bash
# Replace IMAGE_URL with actual imageUrl from step 5
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "caption": "My first AI-generated image!",
    "type": "ai-generated",
    "category": "image-text-post",
    "imageUrl": "IMAGE_URL",
    "aiGenerated": true,
    "aiDetails": {
      "model": "FLUX.1 SRPO",
      "prompt": "A beautiful sunset over mountains"
    }
  }'
```

Expected:
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "_id": "...",
    "author": {...},
    "mediaUrl": "https://res.cloudinary.com/...",
    ...
  }
}
```

### 7. Get Feed
```bash
curl http://localhost:3000/api/posts/feed
```

Your new post should appear!

---

## Frontend Testing

### 1. Open Browser
```
http://localhost:5173
```

### 2. Login
- Email: `test@leelaverse.com`
- Password: `Test123!@#`

### 3. Open Create Post Modal
Click the "Create Post" or "+" button

### 4. Generate Image
1. Enter prompt: "A beautiful sunset over mountains"
2. Click "Generate Image"
3. Watch progress bar (0% → 100%)
4. Wait 15-30 seconds

### 5. Create Post
1. Image preview appears
2. Add caption: "My first AI post!"
3. Click "Post" button
4. Modal closes
5. Post appears in feed

---

## Expected Timeline

| Action | Expected Time |
|--------|--------------|
| Login | < 1 second |
| Start Generation | < 1 second |
| Image Generation | 15-30 seconds |
| Cloudinary Upload | 2-5 seconds |
| Save to DB | < 1 second |
| **Total** | **~20-35 seconds** |

---

## Common Test Scenarios

### Scenario 1: Simple Image Post
```
1. Open modal
2. Enter: "A cat in space"
3. Generate (wait 20s)
4. No caption
5. Post
6. ✅ Image post created
```

### Scenario 2: Image + Caption Post
```
1. Open modal
2. Enter: "A futuristic city"
3. Generate (wait 20s)
4. Add caption: "Welcome to 2050!"
5. Post
6. ✅ Image-text post created
```

### Scenario 3: Text Only Post
```
1. Open modal
2. Select "Text" type
3. Enter caption
4. Post
5. ✅ Text post created
```

### Scenario 4: Upload Image
```
1. Open modal
2. Select "Upload Image"
3. Choose file
4. Add caption
5. Post
6. ✅ User-generated post created
```

---

## Validation Tests

### Test Insufficient Credits
```javascript
// In MongoDB, set user credits to 0
db.users.updateOne(
  { email: "test@leelaverse.com" },
  { $set: { "aiCredits.imageGeneration": 0 } }
)

// Try to generate
// Expected: 403 Forbidden, "Insufficient AI credits"
```

### Test Empty Prompt
```javascript
// Try to generate with empty prompt
// Expected: 400 Bad Request, "Prompt is required"
```

### Test Missing Image
```javascript
// Try to create image post without imageUrl
// Expected: 400 Bad Request, "Image is required"
```

### Test Unauthorized Access
```javascript
// Try to generate without token
// Expected: 401 Unauthorized
```

---

## Success Indicators

✅ **Generation Works**
- Progress bar animates 0% → 100%
- Status messages update
- Image appears in preview

✅ **Upload Works**
- Image saves to Cloudinary
- Thumbnail generated
- URL in database starts with `https://res.cloudinary.com/`

✅ **Post Works**
- Post appears in database
- Feed shows new post
- Stats initialized to 0

✅ **Credits Work**
- Credits deducted after generation
- Transaction recorded
- User balance updated

---

## Debug Checklist

If something fails, check:

1. **Environment Variables**
   ```bash
   # In backend
   echo $FAL_KEY
   echo $CLOUDINARY_CLOUD_NAME
   ```

2. **MongoDB Connection**
   ```bash
   # Check MongoDB is running
   mongosh
   ```

3. **Server Logs**
   - Check backend terminal for errors
   - Check frontend browser console

4. **Network Tab**
   - Open DevTools → Network
   - Check API responses
   - Look for 400/500 errors

5. **Database State**
   ```javascript
   // Check user credits
   db.users.findOne({ email: "test@leelaverse.com" })

   // Check posts
   db.posts.find().sort({ createdAt: -1 }).limit(5)

   // Check AI generations
   db.aigenerations.find().sort({ createdAt: -1 }).limit(5)

   // Check transactions
   db.cointransactions.find().sort({ createdAt: -1 }).limit(5)
   ```

---

## Performance Benchmarks

### Generation Times (FAL AI)
- Simple prompt: 15-20 seconds
- Complex prompt: 20-30 seconds
- With enhancements: 25-35 seconds

### Upload Times (Cloudinary)
- Small image (<1MB): 1-2 seconds
- Medium image (1-5MB): 2-4 seconds
- Large image (5-10MB): 4-7 seconds

### Database Operations
- Create post: < 100ms
- Get feed: < 200ms
- Update stats: < 50ms

---

## Monitoring

### What to Watch
1. **Credit Balance** - Should decrease by 10 per generation
2. **Transaction Log** - Should record each generation
3. **Progress Updates** - Should update smoothly
4. **Error Messages** - Should be user-friendly
5. **Loading States** - Should show for all async operations

### Success Metrics
- ✅ Generation success rate: > 95%
- ✅ Upload success rate: > 99%
- ✅ Average generation time: < 30s
- ✅ Average total time: < 35s

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "FAL_KEY not set" | Add to `.env` |
| "Generation 404" | Stop polling after complete |
| "No credits" | Run seed script |
| "Upload failed" | Check Cloudinary creds |
| "Token invalid" | Re-login |
| "Image not showing" | Check CORS, check URL |

---

## Next Steps After Testing

1. ✅ Verify all features work
2. 🔄 Test error scenarios
3. 📊 Check database records
4. 🎨 Test UI in different browsers
5. 📱 Test on mobile viewport
6. 🚀 Deploy to staging
7. 📈 Monitor production metrics

---

**Happy Testing! 🎉**

For issues, check:
- POST_API_DOCUMENTATION.md
- SETUP_POST_API.md
- IMPLEMENTATION_SUMMARY.md
