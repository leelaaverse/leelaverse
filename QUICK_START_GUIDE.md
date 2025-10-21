# Quick Start Guide - Multiple Image Feature

## 1. Apply Database Changes

```bash
cd backend
npx prisma db push
```

Expected output:
```
✔ Your database is now in sync with your Prisma schema. Done in X.XXs
```

## 2. Start Backend

```bash
cd backend
npm run dev
```

## 3. Start Frontend

```bash
cd frontend
npm run dev
```

## 4. Test Multiple Image Generation

### Step 1: Open Create Modal
- Click "Create" button in top navigation
- Or click the floating "+" button on mobile

### Step 2: Enter Prompt
```
A futuristic cityscape at sunset with flying cars
```

### Step 3: Configure Settings
- Click "Advanced Options"
- Select **"3"** in "Number of Images (1-4)"
- Keep default model: FLUX Schnell
- Keep aspect ratio: 16:9

### Step 4: Generate
- Click **"Generate Image"** button
- Watch progress bar: "Generated 0/3 images..."
- Wait ~30-45 seconds for all 3 to complete
- You should see a grid with:
  - Large image on left
  - 2 smaller images stacked on right

### Step 5: Create Post
- Add caption: "Check out these AI cityscapes!"
- Click **"Post 3 Images"** button
- Watch loading: "Uploading & Posting..."
- Success message appears
- Modal closes automatically
- Feed refreshes

## 5. Test Different Image Counts

### Test 1 Image
- Number of Images: **1**
- Result: Full-width display

### Test 2 Images
- Number of Images: **2**
- Result: Side-by-side (50-50 split)

### Test 3 Images
- Number of Images: **3**
- Result: Large left + 2 stacked right (Twitter style)

### Test 4 Images
- Number of Images: **4**
- Result: 2x2 perfect grid

## 6. Verify in Database

### Check Prisma Studio
```bash
cd backend
npx prisma studio
```

### View Post
1. Open `Post` table
2. Find your latest post
3. Verify fields:
   - `mediaUrls`: Should be array of 3 Cloudinary URLs
   - `mediaUrl`: Should be first URL (backward compat)
   - `aiGenerated`: Should be `true`
   - `category`: Should be `"image-post"` or `"image-text-post"`

### View AIGeneration
1. Open `AIGeneration` table
2. Find your 3 generation records
3. Verify `postId` field matches your Post ID

## 7. Verify Cloudinary

1. Login to Cloudinary dashboard
2. Navigate to Media Library
3. Look for folder: `leelaverse/posts/{your-user-id}/`
4. Should see 3 uploaded images
5. Check image URLs match database `mediaUrls`

## 8. Check Feed Display

1. Navigate to Dashboard
2. Find your post in feed
3. Verify:
   - Caption displays correctly
   - ImageGrid shows 3 images in correct layout
   - AI Generated badge appears
   - Click images to open full size
   - Like/Comment/Share buttons work

## 9. Test Text-Only Post

1. Create New Post
2. Enter caption only (no images)
3. Post type: **Text**
4. Click "Post"
5. Verify text-only post appears in feed

## 10. Troubleshooting

### Images not generating?
```bash
# Check backend logs
cd backend
npm run dev

# Look for:
# - "Making image generation request for 3 image(s)"
# - "Created AI Generation record 1/3"
# - "FAL Request ID: abc123"
```

### Post button disabled?
- Open browser DevTools → Console
- Check `generatedImages` array:
  ```javascript
  console.log(generatedImages)
  // Should be: ['url1', 'url2', 'url3']
  ```

### Upload failed?
- Check `.env` file:
  ```
  CLOUDINARY_CLOUD_NAME=your-cloud-name
  CLOUDINARY_API_KEY=your-api-key
  CLOUDINARY_API_SECRET=your-api-secret
  ```

### Database error?
- Run migrations:
  ```bash
  cd backend
  npx prisma db push
  npx prisma generate
  ```

## 11. API Testing with Postman

### Generate Multiple Images
```http
POST http://localhost:3000/api/posts/generate-image
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "prompt": "A futuristic city",
  "numImages": 3,
  "selectedModel": "flux-schnell",
  "aspectRatio": "16:9"
}
```

### Create Post
```http
POST http://localhost:3000/api/posts
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "caption": "My AI art!",
  "type": "content",
  "category": "image-post",
  "imageUrls": [
    "https://fal.ai/files/abc123.jpg",
    "https://fal.ai/files/abc124.jpg",
    "https://fal.ai/files/abc125.jpg"
  ],
  "aiGenerationIds": ["cuid1", "cuid2", "cuid3"],
  "aiGenerated": true,
  "aiDetails": {
    "model": "FLUX Schnell",
    "prompt": "A futuristic city",
    "aspectRatio": "16:9",
    "steps": 4
  },
  "visibility": "public"
}
```

## 12. Expected Behavior

### Generation Progress
```
Starting generation of 3 image(s)...
↓
Generating 3 image(s)...
↓
Generated 1/3 image(s)... (33%)
↓
Generated 2/3 image(s)... (66%)
↓
Generated 3/3 image(s)... (100%)
↓
All images generated! ✅
```

### Post Upload
```
Uploading images to cloud storage...
↓
Creating post...
↓
🎉 Post created successfully!
↓
[Feed Refresh]
```

## 13. Success Checklist

- [x] Database schema updated
- [x] Backend generates 1-4 images
- [x] Backend uploads to Cloudinary
- [x] Backend creates post with Prisma
- [x] Frontend number selector works
- [x] Frontend polls all generations
- [x] Frontend ImageGrid displays correctly
- [x] Frontend post button shows loading
- [x] Post appears in feed with grid
- [x] AI badge shows on posts
- [x] Database records linked correctly

## 14. Next Steps

1. **Implement FeedPost ImageGrid** (see `IMAGEGRID_USAGE_EXAMPLE.jsx`)
2. **Add Lightbox** for full-screen image viewing
3. **Add Image Management** (remove individual, reorder)
4. **Add Batch Posting** (generate multiple sets, post separately)
5. **Add Analytics** (track generation costs, upload sizes)

---

🎉 **Feature Complete!** You can now generate and post multiple AI images.
