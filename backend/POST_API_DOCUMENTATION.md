# Post Generation & Creation API Documentation

## Overview
This API provides endpoints for AI-powered image generation using FAL AI and post creation with Cloudinary storage integration.

## Features
- ✨ AI Image Generation with FAL AI (FLUX.1 SRPO model)
- 📊 Real-time generation progress tracking
- ☁️ Automatic Cloudinary upload
- 💾 Post database integration
- 💰 Credit/coin management
- 🔒 User authentication & authorization

---

## Endpoints

### 1. Generate Image
**POST** `/api/posts/generate-image`

Generate an AI image using FAL AI API.

#### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "prompt": "A beautiful sunset over mountains with clouds",
  "imageSize": "landscape_16_9",
  "numInferenceSteps": 28,
  "guidanceScale": 4.5,
  "style": "auto",
  "aspectRatio": "16:9",
  "selectedModel": "flux-1-srpo"
}
```

#### Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| prompt | string | Yes | The text prompt for image generation |
| imageSize | string | No | Image size preset (default: "landscape_4_3") |
| numInferenceSteps | number | No | Number of inference steps (default: 28) |
| guidanceScale | number | No | CFG scale (default: 4.5) |
| style | string | No | Style preset (default: "auto") |
| aspectRatio | string | No | Aspect ratio (default: "16:9") |
| selectedModel | string | No | Model to use (default: "flux-1-srpo") |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Image generation started",
  "generationId": "gen_1234567890_userId",
  "estimatedTime": "15-30 seconds"
}
```

#### Error Responses
**400 Bad Request**
```json
{
  "success": false,
  "message": "Prompt is required"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Insufficient AI credits for image generation",
  "credits": {
    "imageGeneration": 0,
    "videoGeneration": 0
  }
}
```

---

### 2. Get Generation Status
**GET** `/api/posts/generate-status/:generationId`

Poll the status of an ongoing image generation.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| generationId | string | The generation ID returned from generate-image |

#### Success Response (200)

**Queued State**
```json
{
  "success": true,
  "status": "queued",
  "progress": 0,
  "message": "Queuing generation...",
  "userId": "user_id",
  "prompt": "Your prompt"
}
```

**Processing State**
```json
{
  "success": true,
  "status": "processing",
  "progress": 65,
  "message": "Generating image with AI...",
  "userId": "user_id",
  "prompt": "Your prompt",
  "aiGenerationId": "ai_gen_id"
}
```

**Completed State**
```json
{
  "success": true,
  "status": "completed",
  "progress": 100,
  "message": "Image generated successfully!",
  "userId": "user_id",
  "prompt": "Your prompt",
  "aiGenerationId": "ai_gen_id",
  "imageUrl": "https://fal.ai/files/...",
  "seed": "123456789",
  "credits": {
    "remaining": 490,
    "imageGeneration": 9
  }
}
```

**Failed State**
```json
{
  "success": true,
  "status": "failed",
  "progress": 0,
  "message": "Image generation failed",
  "error": "Error details"
}
```

#### Error Responses
**404 Not Found**
```json
{
  "success": false,
  "message": "Generation not found or expired"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### 3. Create Post
**POST** `/api/posts`

Create a new post with optional AI-generated image.

#### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "caption": "Check out this amazing AI-generated artwork!",
  "title": "Sunset Mountains",
  "type": "ai-generated",
  "category": "image-text-post",
  "imageUrl": "https://fal.ai/files/...",
  "aiGenerated": true,
  "aiDetails": {
    "model": "FLUX.1 SRPO",
    "prompt": "A beautiful sunset over mountains",
    "enhancedPrompt": "A beautiful sunset over mountains, ultra detailed...",
    "style": "auto",
    "aspectRatio": "16:9",
    "steps": 28,
    "generationTime": 18,
    "cost": 10,
    "seed": "123456789",
    "aiGenerationId": "ai_gen_id"
  },
  "tags": ["ai-art", "sunset", "mountains"],
  "visibility": "public",
  "status": "published"
}
```

#### Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | Post type: "user-generated", "ai-generated", "mixed" |
| category | string | Yes | Category: "image-post", "video-post", "text-post", "image-text-post", "ai-art" |
| caption | string | No* | Post caption (max 2200 chars). *Required for text-post |
| title | string | No | Post title (max 200 chars) |
| imageUrl | string | No* | FAL AI image URL. *Required for image-post |
| aiGenerated | boolean | No | Whether image is AI-generated (default: false) |
| aiDetails | object | No* | AI generation details. *Required if aiGenerated=true |
| tags | array | No | Tags (max 10) |
| visibility | string | No | "public", "private", "followers" (default: "public") |
| status | string | No | "published", "draft" (default: "published") |

#### Success Response (201)
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "_id": "post_id",
    "author": {
      "_id": "user_id",
      "username": "johndoe",
      "avatar": "https://...",
      "verified": true
    },
    "type": "ai-generated",
    "category": "image-text-post",
    "caption": "Check out this amazing AI-generated artwork!",
    "title": "Sunset Mountains",
    "mediaUrl": "https://res.cloudinary.com/...",
    "thumbnailUrl": "https://res.cloudinary.com/.../w_400,h_400,c_fill/...",
    "mediaType": "image/jpeg",
    "aiGenerated": true,
    "aiDetails": {
      "model": "FLUX.1 SRPO",
      "prompt": "A beautiful sunset over mountains",
      "enhancedPrompt": "A beautiful sunset over mountains, ultra detailed...",
      "style": "auto",
      "aspectRatio": "16:9",
      "steps": 28,
      "generationTime": 18,
      "cost": 10,
      "seed": "123456789"
    },
    "tags": ["ai-art", "sunset", "mountains"],
    "visibility": "public",
    "status": "published",
    "stats": {
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "saves": 0,
      "views": 0
    },
    "createdAt": "2025-10-13T10:30:00.000Z",
    "updatedAt": "2025-10-13T10:30:00.000Z"
  }
}
```

#### Error Responses
**400 Bad Request**
```json
{
  "success": false,
  "message": "Post type and category are required"
}
```

**400 Bad Request** (Validation)
```json
{
  "success": false,
  "message": "Image is required for image posts"
}
```

---

### 4. Get User Posts
**GET** `/api/posts/user/:userId`

Get all posts by a specific user.

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | The user ID |

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category (optional) |
| page | number | Page number (default: 1) |
| limit | number | Posts per page (default: 20) |

#### Success Response (200)
```json
{
  "success": true,
  "posts": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### 5. Get Feed Posts
**GET** `/api/posts/feed`

Get public feed posts.

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category (optional) |
| page | number | Page number (default: 1) |
| limit | number | Posts per page (default: 20) |

#### Success Response (200)
```json
{
  "success": true,
  "posts": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "pages": 63
  }
}
```

---

### 6. Get Single Post
**GET** `/api/posts/:postId`

Get details of a specific post.

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| postId | string | The post ID |

#### Success Response (200)
```json
{
  "success": true,
  "post": {...}
}
```

---

### 7. Delete Post
**DELETE** `/api/posts/:postId`

Delete a post (soft delete).

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| postId | string | The post ID |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

#### Error Responses
**404 Not Found**
```json
{
  "success": false,
  "message": "Post not found or unauthorized"
}
```

---

## Frontend Integration Flow

### Step 1: Generate Image
```javascript
const response = await fetch(`${API_URL}/api/posts/generate-image`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    prompt: "A beautiful sunset",
    aspectRatio: "16:9"
  })
});

const { generationId } = await response.json();
```

### Step 2: Poll Generation Status
```javascript
const pollInterval = setInterval(async () => {
  const response = await fetch(
    `${API_URL}/api/posts/generate-status/${generationId}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  const data = await response.json();

  if (data.status === 'completed') {
    const imageUrl = data.imageUrl;
    clearInterval(pollInterval);
    // Show image, enable post button
  } else if (data.status === 'failed') {
    clearInterval(pollInterval);
    // Show error
  } else {
    // Update progress: data.progress, data.message
  }
}, 2000);
```

### Step 3: Create Post
```javascript
const response = await fetch(`${API_URL}/api/posts`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    caption: "Check this out!",
    type: "ai-generated",
    category: "image-text-post",
    imageUrl: imageUrl, // From step 2
    aiGenerated: true,
    aiDetails: {
      model: "FLUX.1 SRPO",
      prompt: "A beautiful sunset",
      // ... other details
    }
  })
});

const { post } = await response.json();
// Post created! Redirect to feed
```

---

## Image Processing Pipeline

1. **Generation Request** → FAL AI API
2. **Stream Progress** → Update progress in memory
3. **Generation Complete** → FAL returns image URL
4. **Download Image** → Fetch from FAL
5. **Upload to Cloudinary** → Store permanently
6. **Save to Database** → Create Post record
7. **Return to User** → Post created successfully

---

## Credits & Billing

- **Image Generation Cost**: 10 coins per image
- **Credit Deduction**: Happens after successful generation
- **Failed Generations**: No credits deducted
- **Transaction Records**: All credit usage logged in CoinTransaction collection

---

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient credits)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

All endpoints are rate-limited:
- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **On Limit**: Returns 429 Too Many Requests

---

## Notes

1. **Image URLs**: FAL AI URLs are temporary. Always upload to Cloudinary before saving posts.
2. **Progress Tracking**: Uses in-memory Map. For production, use Redis.
3. **Generation Timeout**: FAL AI typically completes in 15-30 seconds.
4. **Cloudinary Transformation**: Automatically creates thumbnails (400x400).
5. **Post Categories**: Match frontend post types for consistency.

---

## Security

- ✅ JWT authentication required for all mutation endpoints
- ✅ User ownership verification on delete
- ✅ Credit balance validation before generation
- ✅ Input validation on all requests
- ✅ Rate limiting on all endpoints
- ✅ CORS configuration
