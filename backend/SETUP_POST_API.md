# Post Generation API - Setup Guide

## Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

This will install the new packages:
- `axios` - For HTTP requests to FAL AI
- `cloudinary` - For image storage
- `@fal-ai/client` - FAL AI SDK (already installed)

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Add these required variables to your `.env`:

```env
# FAL AI API Key (Get from: https://fal.ai/)
FAL_KEY=your-fal-ai-api-key

# Cloudinary Config (Get from: https://cloudinary.com/)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 3. Get API Keys

#### FAL AI API Key
1. Go to https://fal.ai/
2. Sign up/Login
3. Navigate to Dashboard → API Keys
4. Create new API key
5. Copy and paste into `.env` as `FAL_KEY`

#### Cloudinary Credentials
1. Go to https://cloudinary.com/
2. Sign up/Login (Free tier available)
3. Go to Dashboard
4. Copy the following from "Account Details":
   - Cloud Name → `CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

### 4. Update User Model Credits (If Needed)

Make sure your User model has the required credit fields. They should already be there from previous setup:

```javascript
{
  coins: { type: Number, default: 500 },
  aiCredits: {
    imageGeneration: { type: Number, default: 10 },
    videoGeneration: { type: Number, default: 5 }
  },
  credits: {
    total: { type: Number, default: 500 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 500 }
  }
}
```

### 5. Start the Server
```bash
npm run dev
```

The server should start on http://localhost:3000

### 6. Test the API

#### Test Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Leelaverse Backend API is running"
}
```

---

## Frontend Setup

### 1. Add Environment Variable

In `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
```

### 2. Test CreatePostModal

The `CreatePostModal` component has been updated with:
- ✅ Image generation with FAL AI
- ✅ Real-time progress tracking
- ✅ Skeleton loading states
- ✅ Post creation with Cloudinary upload
- ✅ Error handling
- ✅ Caption input after generation

### 3. Usage Flow

1. User opens Create Post Modal
2. Enters prompt (e.g., "A beautiful sunset over mountains")
3. Clicks "Generate Image" button
4. Progress bar shows generation status (0-100%)
5. When complete (100%), image preview appears
6. User can add caption
7. Clicks "Post" button
8. Image uploads to Cloudinary
9. Post saves to database
10. Modal closes, feed refreshes

---

## Testing the Complete Flow

### Test Image Generation

```bash
# Login first to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Use the token from response
export TOKEN="your_jwt_token_here"

# Generate image
curl -X POST http://localhost:3000/api/posts/generate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "A beautiful sunset over mountains with clouds",
    "aspectRatio": "16:9"
  }'

# Response will include generationId
# Use it to check status
curl http://localhost:3000/api/posts/generate-status/gen_1234567890_userId \
  -H "Authorization: Bearer $TOKEN"

# Create post with generated image
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "caption": "Check out this AI-generated sunset!",
    "type": "ai-generated",
    "category": "image-text-post",
    "imageUrl": "https://fal.ai/files/...",
    "aiGenerated": true,
    "aiDetails": {
      "model": "FLUX.1 SRPO",
      "prompt": "A beautiful sunset over mountains"
    }
  }'
```

---

## Troubleshooting

### Issue: "FAL_KEY is not set"
**Solution**: Make sure you added `FAL_KEY` to `.env` file

### Issue: "Cloudinary credentials missing"
**Solution**: Add all three Cloudinary variables to `.env`

### Issue: "Insufficient AI credits"
**Solution**: User doesn't have enough credits. Update user's `aiCredits.imageGeneration` field in database:
```javascript
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { "aiCredits.imageGeneration": 10 } }
)
```

### Issue: "Generation status returns 404"
**Solution**: Generation IDs expire after completion. This is expected. The frontend should stop polling after receiving `completed` or `failed` status.

### Issue: "Image upload to Cloudinary fails"
**Solution**:
1. Verify Cloudinary credentials
2. Check Cloudinary dashboard for errors
3. Ensure you have storage quota available

### Issue: "Cannot POST /api/posts/generate-image"
**Solution**: Make sure you:
1. Installed dependencies: `npm install`
2. Imported routes in `app.js`
3. Server is running

---

## Production Considerations

### 1. Use Redis for Progress Tracking
Replace in-memory Map with Redis:
```javascript
// Instead of:
const generationProgress = new Map();

// Use:
const redis = require('redis');
const client = redis.createClient();
```

### 2. Add Webhook Support
Configure FAL AI webhooks instead of polling:
```javascript
const { request_id } = await fal.queue.submit("fal-ai/flux-1/srpo", {
  input: {...},
  webhookUrl: "https://yourapi.com/webhooks/fal"
});
```

### 3. Enable Cloudinary CDN
Cloudinary automatically provides CDN. Use the returned URLs directly in production.

### 4. Add Image Optimization
Configure Cloudinary transformations:
```javascript
transformation: [
  { quality: 'auto:eco' },
  { fetch_format: 'auto' },
  { width: 1920, crop: 'limit' }
]
```

### 5. Monitor Credit Usage
Add alerts when users run low on credits:
```javascript
if (user.aiCredits.imageGeneration < 3) {
  // Send notification
}
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts/generate-image` | Generate AI image |
| GET | `/api/posts/generate-status/:id` | Check generation status |
| POST | `/api/posts` | Create new post |
| GET | `/api/posts/feed` | Get public feed |
| GET | `/api/posts/user/:userId` | Get user's posts |
| GET | `/api/posts/:postId` | Get single post |
| DELETE | `/api/posts/:postId` | Delete post |

---

## Next Steps

1. ✅ Test image generation locally
2. ✅ Test post creation
3. ✅ Test frontend integration
4. 🔜 Add video generation (similar flow)
5. 🔜 Add prompt enhancement with AI
6. 🔜 Add style presets
7. 🔜 Add batch generation
8. 🔜 Add post editing
9. 🔜 Add post analytics

---

## Support

For issues:
1. Check console logs in both backend and frontend
2. Check browser network tab for API responses
3. Verify all environment variables are set
4. Ensure MongoDB is running
5. Check API documentation: `POST_API_DOCUMENTATION.md`

For FAL AI issues:
- Docs: https://fal.ai/docs
- Models: https://fal.ai/models

For Cloudinary issues:
- Docs: https://cloudinary.com/documentation
- Support: https://support.cloudinary.com/
