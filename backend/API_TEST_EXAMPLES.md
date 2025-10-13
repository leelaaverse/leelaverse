# 🧪 API Test Examples - Complete Guide

## Prerequisites

### 1. Get Authentication Token
First, you need to login to get a JWT token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@leelaverse.com",
    "password": "Test123!@#"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id_here",
    "username": "testuser",
    "email": "test@leelaverse.com",
    "coins": 500,
    "aiCredits": {
      "imageGeneration": 10,
      "videoGeneration": 5
    }
  }
}
```

**Copy the `token` value - you'll need it for all subsequent requests!**

---

## API 1: Generate Image

### Endpoint
```
POST /api/posts/generate-image
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

### Request Payload (Full Example)
```json
{
  "prompt": "A beautiful sunset over mountains with orange and pink clouds, photorealistic, 8k, ultra detailed",
  "imageSize": "landscape_16_9",
  "numInferenceSteps": 28,
  "guidanceScale": 4.5,
  "style": "auto",
  "aspectRatio": "16:9",
  "selectedModel": "flux-1-srpo"
}
```

### Request Payload (Minimal Example)
```json
{
  "prompt": "A cat wearing sunglasses"
}
```

### cURL Command (Full)
```bash
curl -X POST http://localhost:3000/api/posts/generate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "prompt": "A beautiful sunset over mountains with orange and pink clouds, photorealistic, 8k, ultra detailed",
    "imageSize": "landscape_16_9",
    "numInferenceSteps": 28,
    "guidanceScale": 4.5,
    "style": "auto",
    "aspectRatio": "16:9",
    "selectedModel": "flux-1-srpo"
  }'
```

### cURL Command (Minimal)
```bash
curl -X POST http://localhost:3000/api/posts/generate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "prompt": "A cat wearing sunglasses"
  }'
```

### Response
```json
{
  "success": true,
  "message": "Image generation started",
  "generationId": "gen_1697235600000_user_id",
  "estimatedTime": "15-30 seconds"
}
```

### Field Descriptions

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `prompt` | string | **Yes** | - | The text description of the image you want to generate |
| `imageSize` | string | No | "landscape_4_3" | FAL AI image size preset |
| `numInferenceSteps` | number | No | 28 | Number of generation steps (more = better quality, slower) |
| `guidanceScale` | number | No | 4.5 | How closely to follow the prompt (1-20) |
| `style` | string | No | "auto" | Style preset for the image |
| `aspectRatio` | string | No | "16:9" | Aspect ratio: "1:1", "4:3", "16:9", "9:16", "3:4" |
| `selectedModel` | string | No | "flux-1-srpo" | AI model to use |

### Aspect Ratio Options
- `"1:1"` - Square (Instagram)
- `"4:3"` - Portrait
- `"16:9"` - Landscape (YouTube thumbnail)
- `"9:16"` - Vertical (Stories/Reels)
- `"3:4"` - Portrait

---

## API 1.5: Check Generation Status

After generating, you need to poll this endpoint to check progress.

### Endpoint
```
GET /api/posts/generate-status/:generationId
```

### Headers
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### cURL Command
```bash
# Replace GEN_ID with the generationId from previous response
curl http://localhost:3000/api/posts/generate-status/gen_1697235600000_user_id \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Response (Processing)
```json
{
  "success": true,
  "status": "processing",
  "progress": 65,
  "message": "Generating image with AI...",
  "userId": "user_id",
  "prompt": "A cat wearing sunglasses",
  "aiGenerationId": "ai_gen_id"
}
```

### Response (Completed) ✅
```json
{
  "success": true,
  "status": "completed",
  "progress": 100,
  "message": "Image generated successfully!",
  "userId": "user_id",
  "prompt": "A cat wearing sunglasses",
  "aiGenerationId": "ai_gen_id",
  "imageUrl": "https://fal.ai/files/lion/abcdef123456.jpg",
  "seed": "1234567890",
  "credits": {
    "remaining": 490,
    "imageGeneration": 9
  }
}
```

**⚠️ IMPORTANT: Copy the `imageUrl` - you'll need it for creating the post!**

---

## API 2: Create Post

### Endpoint
```
POST /api/posts
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

### Request Payload (AI-Generated Image with Caption)
```json
{
  "caption": "Just generated this amazing sunset with AI! 🌅✨ What do you think?",
  "title": "AI Sunset Masterpiece",
  "type": "ai-generated",
  "category": "image-text-post",
  "imageUrl": "https://fal.ai/files/lion/abcdef123456.jpg",
  "aiGenerated": true,
  "aiDetails": {
    "model": "FLUX.1 SRPO",
    "prompt": "A beautiful sunset over mountains with orange and pink clouds",
    "enhancedPrompt": "A beautiful sunset over mountains with orange and pink clouds, photorealistic, 8k, ultra detailed",
    "style": "auto",
    "aspectRatio": "16:9",
    "steps": 28,
    "generationTime": 18,
    "cost": 10,
    "seed": "1234567890",
    "aiGenerationId": "ai_gen_id_from_status"
  },
  "tags": ["ai-art", "sunset", "mountains", "nature"],
  "visibility": "public",
  "status": "published"
}
```

### Request Payload (AI-Generated Image Only, No Caption)
```json
{
  "type": "ai-generated",
  "category": "image-post",
  "imageUrl": "https://fal.ai/files/lion/abcdef123456.jpg",
  "aiGenerated": true,
  "aiDetails": {
    "model": "FLUX.1 SRPO",
    "prompt": "A cat wearing sunglasses"
  },
  "visibility": "public",
  "status": "published"
}
```

### Request Payload (Text Post Only)
```json
{
  "caption": "Just finished an amazing project! 🚀 Feeling accomplished and ready for the next challenge. #coding #webdev",
  "type": "user-generated",
  "category": "text-post",
  "tags": ["coding", "webdev", "motivation"],
  "visibility": "public",
  "status": "published"
}
```

### cURL Command (AI-Generated with Caption)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "caption": "Just generated this amazing sunset with AI! 🌅✨",
    "type": "ai-generated",
    "category": "image-text-post",
    "imageUrl": "https://fal.ai/files/lion/abcdef123456.jpg",
    "aiGenerated": true,
    "aiDetails": {
      "model": "FLUX.1 SRPO",
      "prompt": "A beautiful sunset over mountains"
    },
    "tags": ["ai-art", "sunset"],
    "visibility": "public",
    "status": "published"
  }'
```

### Response
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "_id": "670b9f1234567890abcdef12",
    "author": {
      "_id": "user_id",
      "username": "testuser",
      "avatar": "https://avatar.url",
      "verified": false
    },
    "type": "ai-generated",
    "category": "image-text-post",
    "caption": "Just generated this amazing sunset with AI! 🌅✨",
    "title": "AI Sunset Masterpiece",
    "mediaUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/leelaverse/posts/user_id/abc123.jpg",
    "thumbnailUrl": "https://res.cloudinary.com/your-cloud/image/upload/w_400,h_400,c_fill/v1234567890/leelaverse/posts/user_id/abc123.jpg",
    "mediaType": "image/jpeg",
    "aiGenerated": true,
    "aiDetails": {
      "model": "FLUX.1 SRPO",
      "prompt": "A beautiful sunset over mountains",
      "enhancedPrompt": "A beautiful sunset over mountains with orange and pink clouds, photorealistic, 8k, ultra detailed",
      "style": "auto",
      "aspectRatio": "16:9",
      "steps": 28,
      "generationTime": 18,
      "cost": 10,
      "seed": "1234567890"
    },
    "tags": ["ai-art", "sunset", "mountains", "nature"],
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

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | **Yes** | "user-generated", "ai-generated", or "mixed" |
| `category` | string | **Yes** | "image-post", "video-post", "text-post", "image-text-post", "ai-art" |
| `caption` | string | No* | Post caption (max 2200 chars). *Required for text-post |
| `title` | string | No | Post title (max 200 chars) |
| `imageUrl` | string | No* | FAL AI image URL. *Required for image posts |
| `aiGenerated` | boolean | No | Whether image is AI-generated (default: false) |
| `aiDetails` | object | No* | AI generation details. *Required if aiGenerated=true |
| `tags` | array | No | Array of tags (max 10) |
| `visibility` | string | No | "public", "private", or "followers" (default: "public") |
| `status` | string | No | "published" or "draft" (default: "published") |

---

## 📝 Complete Testing Flow

### Step 1: Login
```bash
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@leelaverse.com","password":"Test123!@#"}' \
  | jq -r '.token')

echo "Token: $TOKEN"
```

### Step 2: Generate Image
```bash
GEN_RESPONSE=$(curl -X POST http://localhost:3000/api/posts/generate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "A futuristic cityscape at night with neon lights"
  }')

GEN_ID=$(echo $GEN_RESPONSE | jq -r '.generationId')
echo "Generation ID: $GEN_ID"
```

### Step 3: Poll Status (repeat until completed)
```bash
STATUS=$(curl http://localhost:3000/api/posts/generate-status/$GEN_ID \
  -H "Authorization: Bearer $TOKEN")

echo $STATUS | jq '.'
```

### Step 4: Extract Image URL (when completed)
```bash
IMAGE_URL=$(echo $STATUS | jq -r '.imageUrl')
AI_GEN_ID=$(echo $STATUS | jq -r '.aiGenerationId')
PROMPT=$(echo $STATUS | jq -r '.prompt')

echo "Image URL: $IMAGE_URL"
```

### Step 5: Create Post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"caption\": \"My AI-generated cityscape! 🌃✨\",
    \"type\": \"ai-generated\",
    \"category\": \"image-text-post\",
    \"imageUrl\": \"$IMAGE_URL\",
    \"aiGenerated\": true,
    \"aiDetails\": {
      \"model\": \"FLUX.1 SRPO\",
      \"prompt\": \"$PROMPT\",
      \"aiGenerationId\": \"$AI_GEN_ID\"
    },
    \"tags\": [\"ai-art\", \"cityscape\"],
    \"visibility\": \"public\",
    \"status\": \"published\"
  }" | jq '.'
```

---

## 🔥 Postman Collection

### Import this JSON into Postman:

```json
{
  "info": {
    "name": "Leelaverse Post API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "token",
      "value": "",
      "type": "string"
    },
    {
      "key": "generationId",
      "value": "",
      "type": "string"
    },
    {
      "key": "imageUrl",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "1. Login",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.collectionVariables.set(\"token\", pm.response.json().token);"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@leelaverse.com\",\n  \"password\": \"Test123!@#\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/auth/login",
          "host": ["{{baseUrl}}"],
          "path": ["api", "auth", "login"]
        }
      }
    },
    {
      "name": "2. Generate Image",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.collectionVariables.set(\"generationId\", pm.response.json().generationId);"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"prompt\": \"A beautiful sunset over mountains with clouds\",\n  \"aspectRatio\": \"16:9\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/posts/generate-image",
          "host": ["{{baseUrl}}"],
          "path": ["api", "posts", "generate-image"]
        }
      }
    },
    {
      "name": "3. Check Generation Status",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "if (pm.response.json().status === 'completed') {",
              "  pm.collectionVariables.set(\"imageUrl\", pm.response.json().imageUrl);",
              "}"
            ]
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/posts/generate-status/{{generationId}}",
          "host": ["{{baseUrl}}"],
          "path": ["api", "posts", "generate-status", "{{generationId}}"]
        }
      }
    },
    {
      "name": "4. Create Post",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"caption\": \"My AI-generated image! 🎨✨\",\n  \"type\": \"ai-generated\",\n  \"category\": \"image-text-post\",\n  \"imageUrl\": \"{{imageUrl}}\",\n  \"aiGenerated\": true,\n  \"aiDetails\": {\n    \"model\": \"FLUX.1 SRPO\",\n    \"prompt\": \"A beautiful sunset over mountains\"\n  },\n  \"tags\": [\"ai-art\", \"sunset\"],\n  \"visibility\": \"public\",\n  \"status\": \"published\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/posts",
          "host": ["{{baseUrl}}"],
          "path": ["api", "posts"]
        }
      }
    }
  ]
}
```

---

## ⚡ Quick Test Examples

### Example 1: Simple Cat Image
```bash
# Generate
curl -X POST http://localhost:3000/api/posts/generate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"prompt": "A cute cat playing with yarn"}'
```

### Example 2: Landscape Photo
```bash
# Generate
curl -X POST http://localhost:3000/api/posts/generate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "Mountain landscape with a lake",
    "aspectRatio": "16:9"
  }'
```

### Example 3: Portrait
```bash
# Generate
curl -X POST http://localhost:3000/api/posts/generate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "Professional headshot of a business person",
    "aspectRatio": "4:3"
  }'
```

---

## 🎯 Testing Checklist

- [ ] Test login and get token
- [ ] Test image generation with minimal payload
- [ ] Test image generation with full payload
- [ ] Test status polling (multiple times)
- [ ] Test post creation with AI image + caption
- [ ] Test post creation with AI image only
- [ ] Test post creation with text only
- [ ] Test error: empty prompt
- [ ] Test error: missing token
- [ ] Test error: insufficient credits
- [ ] Test error: invalid image URL

---

## 📚 Additional Resources

- Full API Docs: `POST_API_DOCUMENTATION.md`
- Setup Guide: `SETUP_POST_API.md`
- Quick Test Guide: `QUICK_TEST_GUIDE.md`

**Happy Testing! 🚀**
