# Leelaverse Backend API Documentation

## Base URL
- **Production**: `https://www.leelaah.com/api`
- **Development**: `http://localhost:3000/api`

## Authentication
Most endpoints require authentication using JWT tokens:
- **Header**: `Authorization: Bearer <access_token>`
- **Token Type**: JWT (JSON Web Token)
- **Expiry**: Access tokens expire in 15 minutes, refresh tokens in 7 days

---

## 🔐 Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Description**: Create a new user account

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isEmailVerified": false,
      "createdAt": "2025-10-31T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login User
**POST** `/auth/login`

**Description**: Authenticate user and get tokens

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isEmailVerified": true,
      "lastLoginAt": "2025-10-31T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Refresh Token
**POST** `/auth/refresh-token`

**Description**: Get new access token using refresh token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Logout User
**POST** `/auth/logout`
**Authentication**: Required

**Description**: Logout user and invalidate refresh token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 5. Logout All Devices
**POST** `/auth/logout-all`
**Authentication**: Required

**Description**: Logout from all devices (invalidate all refresh tokens)

**Response**:
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

---

### 6. Get User Profile
**GET** `/auth/profile`
**Authentication**: Required

**Description**: Get current user's profile information

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "bio": "Creative AI enthusiast",
      "avatar": "https://cloudinary.com/avatar.jpg",
      "location": "New York, USA",
      "website": "https://johndoe.com",
      "totalCreations": 15,
      "creditsBalance": 100,
      "verificationStatus": "unverified",
      "createdAt": "2025-10-31T00:00:00.000Z"
    }
  }
}
```

---

### 7. Update User Profile
**PUT** `/auth/profile`
**Authentication**: Required

**Description**: Update user profile information

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Creative AI enthusiast and digital artist",
  "location": "New York, USA",
  "website": "https://johndoe.com",
  "avatar": "https://cloudinary.com/new-avatar.jpg",
  "coverImage": "https://cloudinary.com/cover.jpg",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "twitterLink": "https://twitter.com/johndoe",
  "instagramLink": "https://instagram.com/johndoe",
  "linkedinLink": "https://linkedin.com/in/johndoe",
  "githubLink": "https://github.com/johndoe",
  "discordLink": "johndoe#1234"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "bio": "Creative AI enthusiast and digital artist",
      "location": "New York, USA",
      "website": "https://johndoe.com",
      "avatar": "https://cloudinary.com/new-avatar.jpg"
    }
  }
}
```

---

### 8. Change Password
**PUT** `/auth/change-password`
**Authentication**: Required

**Description**: Change user password

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword456!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password changed successfully. Please login again."
}
```

---

### 9. Request Password Reset
**POST** `/auth/forgot-password`

**Description**: Request password reset token

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

---

### 10. Reset Password
**POST** `/auth/reset-password`

**Description**: Reset password using reset token

**Request Body**:
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePassword789!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset successful. Please login with your new password."
}
```

---

## 🔗 OAuth Endpoints

### 1. Google OAuth Login
**GET** `/oauth/google`

**Description**: Initiate Google OAuth login flow (redirect endpoint)

**Usage**: Redirect user to this URL in browser
```
https://api.leelaah.com/oauth/google
```

---

### 2. Google OAuth Callback
**GET** `/oauth/google/callback`

**Description**: Handle Google OAuth callback (automatic redirect)

**Note**: This is handled automatically by the OAuth flow. User will be redirected to frontend with tokens.

---

### 3. Verify OAuth Token
**POST** `/oauth/verify-oauth-token`

**Description**: Verify OAuth access token

**Request Body**:
```json
{
  "access_token": "oauth_access_token"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Token verified successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "accessToken": "oauth_access_token"
  }
}
```

---

### 4. OAuth Logout
**POST** `/oauth/logout-oauth`
**Authentication**: Required (Bearer token)

**Description**: Logout OAuth user

**Request Body**:
```json
{
  "refresh_token": "oauth_refresh_token"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🎨 Posts & AI Generation Endpoints

### 1. Generate Image
**POST** `/posts/generate-image`
**Authentication**: Required

**Description**: Generate AI image using FAL AI

**Request Body**:
```json
{
  "prompt": "A beautiful sunset over mountains, digital art style",
  "selectedModel": "flux-1-srpo",
  "aspectRatio": "16:9",
  "numInferenceSteps": 28,
  "guidanceScale": 4.5,
  "style": "digital-art",
  "numImages": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "1 image generation(s) started",
  "generations": [
    {
      "requestId": "fal_request_id_123",
      "aiGenerationId": "ai_gen_id_456"
    }
  ],
  "count": 1,
  "estimatedTime": "15-30 seconds per image"
}
```

---

### 2. Check Generation Status
**GET** `/posts/generation/:requestId`
**Authentication**: Required

**Description**: Check AI image generation status and get result

**URL Parameters**:
- `requestId`: FAL AI request ID from generate-image response

**Response (Processing)**:
```json
{
  "success": true,
  "status": "processing",
  "requestId": "fal_request_id_123",
  "queuePosition": 3,
  "logs": ["Starting generation...", "Processing prompt..."]
}
```

**Response (Completed)**:
```json
{
  "success": true,
  "status": "completed",
  "requestId": "fal_request_id_123",
  "imageUrl": "https://fal.media/generated-image.jpg",
  "seed": 1234567890,
  "prompt": "A beautiful sunset over mountains, digital art style",
  "data": {
    "images": [
      {
        "url": "https://fal.media/generated-image.jpg",
        "width": 1024,
        "height": 576
      }
    ],
    "seed": 1234567890,
    "prompt": "A beautiful sunset over mountains, digital art style"
  }
}
```

---

### 3. Create Post from AI Generation
**POST** `/posts/create-from-generation`
**Authentication**: Required

**Description**: Create a post from completed AI generations

**Request Body**:
```json
{
  "aiGenerationIds": ["ai_gen_id_456", "ai_gen_id_789"],
  "caption": "Check out these amazing AI-generated landscapes!",
  "title": "AI Landscapes",
  "type": "content",
  "category": "image-post",
  "tags": ["ai-art", "landscape", "digital"],
  "visibility": "public"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "id": "post_id_123",
    "caption": "Check out these amazing AI-generated landscapes!",
    "title": "AI Landscapes",
    "mediaUrls": [
      "https://cloudinary.com/image1.jpg",
      "https://cloudinary.com/image2.jpg"
    ],
    "thumbnailUrl": "https://cloudinary.com/image1.jpg",
    "aiGenerated": true,
    "author": {
      "id": "user_id",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://cloudinary.com/avatar.jpg"
    },
    "createdAt": "2025-10-31T00:00:00.000Z"
  }
}
```

---

### 4. Create Regular Post
**POST** `/posts`

**Description**: Create a regular post (no authentication for testing)

**Request Body**:
```json
{
  "caption": "Beautiful day at the beach!",
  "title": "Beach Day",
  "type": "content",
  "category": "image-text-post",
  "imageUrls": ["https://example.com/beach.jpg"],
  "tags": ["beach", "summer", "vacation"],
  "visibility": "public"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "id": "post_id_456",
    "caption": "Beautiful day at the beach!",
    "title": "Beach Day",
    "mediaUrls": ["https://cloudinary.com/beach.jpg"],
    "thumbnailUrl": "https://cloudinary.com/beach.jpg",
    "author": {
      "id": "user_id",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2025-10-31T00:00:00.000Z"
  }
}
```

---

### 5. Get Feed Posts
**GET** `/posts/feed`

**Description**: Get public feed posts

**Query Parameters**:
- `category` (optional): Filter by category (image-post, text-post, etc.)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example**: `/posts/feed?category=image-post&page=1&limit=10`

**Response**:
```json
{
  "success": true,
  "posts": [
    {
      "id": "post_id_123",
      "caption": "Amazing AI art!",
      "mediaUrls": ["https://cloudinary.com/image.jpg"],
      "aiGenerated": true,
      "author": {
        "id": "user_id",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://cloudinary.com/avatar.jpg",
        "totalCreations": 15
      },
      "createdAt": "2025-10-31T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### 6. Get User Posts
**GET** `/posts/user/:userId`

**Description**: Get posts by specific user

**URL Parameters**:
- `userId`: User ID

**Query Parameters**:
- `category` (optional): Filter by category
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example**: `/posts/user/user_123?category=image-post&page=1&limit=5`

**Response**:
```json
{
  "success": true,
  "posts": [
    {
      "id": "post_id_789",
      "caption": "My latest creation",
      "mediaUrls": ["https://cloudinary.com/creation.jpg"],
      "author": {
        "id": "user_123",
        "username": "artist",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "createdAt": "2025-10-31T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 12,
    "pages": 3
  }
}
```

---

### 7. Get Single Post
**GET** `/posts/:postId`

**Description**: Get single post details

**URL Parameters**:
- `postId`: Post ID

**Response**:
```json
{
  "success": true,
  "post": {
    "id": "post_id_123",
    "caption": "Amazing landscape",
    "title": "Mountain View",
    "mediaUrls": ["https://cloudinary.com/mountain.jpg"],
    "thumbnailUrl": "https://cloudinary.com/mountain.jpg",
    "viewsCount": 150,
    "author": {
      "id": "user_id",
      "username": "photographer",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://cloudinary.com/avatar.jpg",
      "totalCreations": 25
    },
    "createdAt": "2025-10-31T00:00:00.000Z"
  }
}
```

---

### 8. Delete Post
**DELETE** `/posts/:postId`
**Authentication**: Required

**Description**: Delete user's own post

**URL Parameters**:
- `postId`: Post ID to delete

**Response**:
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

### 9. Get My AI Generations
**GET** `/posts/my-generations`
**Authentication**: Required

**Description**: Get user's AI generations that haven't been posted yet

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response**:
```json
{
  "success": true,
  "message": "AI generations retrieved successfully",
  "data": {
    "generations": [
      {
        "id": "ai_gen_id_123",
        "prompt": "Futuristic city at night",
        "model": "FLUX.1 SRPO",
        "resultUrl": "https://fal.media/generated-image.jpg",
        "style": "cyberpunk",
        "aspectRatio": "16:9",
        "steps": 28,
        "seed": "1234567890",
        "createdAt": "2025-10-31T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 45,
      "itemsPerPage": 20
    }
  }
}
```

---

### 10. Get FAL Status (Direct)
**GET** `/posts/fal-status/:requestId`
**Authentication**: Required

**Description**: Get direct FAL AI status

**URL Parameters**:
- `requestId`: FAL request ID

**Response**:
```json
{
  "success": true,
  "falStatus": "COMPLETED",
  "requestId": "fal_request_id_123",
  "logs": ["Generation completed"],
  "queuePosition": null,
  "responseUrl": "https://fal.media/result.json"
}
```

---

### 11. Get FAL Result (Direct)
**GET** `/posts/fal-result/:requestId`
**Authentication**: Required

**Description**: Get direct FAL AI result

**URL Parameters**:
- `requestId`: FAL request ID

**Response**:
```json
{
  "success": true,
  "requestId": "fal_request_id_123",
  "data": {
    "images": [
      {
        "url": "https://fal.media/generated-image.jpg",
        "width": 1024,
        "height": 576
      }
    ],
    "seed": 1234567890,
    "prompt": "Futuristic city at night"
  },
  "images": [
    {
      "url": "https://fal.media/generated-image.jpg",
      "width": 1024,
      "height": 576
    }
  ],
  "seed": 1234567890,
  "prompt": "Futuristic city at night"
}
```

---

## 🛠️ System Endpoints

### 1. Health Check
**GET** `/health`

**Description**: Check API health status

**Response**:
```json
{
  "success": true,
  "message": "Leelaverse Backend API is running",
  "timestamp": "2025-10-31T00:00:00.000Z",
  "environment": "development"
}
```

---

### 2. Debug Logs
**GET** `/debug/logs`

**Description**: Get recent request logs (for debugging)

**Query Parameters**:
- `limit` (optional): Number of logs to return (default: 50)

**Response**:
```json
{
  "success": true,
  "message": "Recent request logs",
  "count": 10,
  "logs": [
    {
      "timestamp": "2025-10-31T00:00:00.000Z",
      "type": "REQUEST",
      "message": "POST /api/auth/login",
      "data": {
        "origin": "http://localhost:5173",
        "userAgent": "Mozilla/5.0..."
      }
    }
  ],
  "allowedOrigins": [
    "https://www.leelaah.com",
    "http://localhost:5173"
  ],
  "environment": "development",
  "timestamp": "2025-10-31T00:00:00.000Z"
}
```

---

### 3. Clear Debug Logs
**POST** `/debug/logs/clear`

**Description**: Clear debug logs

**Response**:
```json
{
  "success": true,
  "message": "Cleared 25 logs",
  "timestamp": "2025-10-31T00:00:00.000Z"
}
```

---

## 📝 Request/Response Format

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field specific error"
    }
  ]
}
```

---

## 🔒 Authentication Headers

For protected endpoints, include the JWT token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 🚨 Error Codes

- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Invalid or missing token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **423**: Locked - Account locked due to failed attempts
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error - Server-side error

---

## 🌐 CORS

The API supports CORS for these origins:
- `https://www.leelaah.com`
- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:3000`
- `http://127.0.0.1:5173`

---

## 📊 Rate Limiting

- **General**: 100 requests per 15 minutes
- **Auth**: 5 login attempts per 15 minutes
- **Account Creation**: 3 attempts per hour
- **Password Reset**: 3 attempts per hour

---

## 🎨 AI Generation Models

### Available Models:
1. **FLUX.1 SRPO** (`flux-1-srpo`)
   - Default model
   - Steps: 1-50 (default: 28)
   - Guidance: 1-20 (default: 4.5)

2. **FLUX Schnell** (`flux-schnell`)
   - Faster generation
   - Steps: 1-12 (default: 4)
   - Guidance: 1-10 (default: 3.5)

### Supported Aspect Ratios:
- `1:1` - Square
- `4:3` - Portrait 4:3
- `16:9` - Landscape 16:9
- `9:16` - Portrait 16:9
- `3:4` - Portrait 3:4

---

## 📱 Post Categories

- `text-post` - Text only posts
- `image-post` - Image only posts
- `image-text-post` - Image with caption
- `video-post` - Video posts
- `mixed-media` - Multiple media types

---

## 🔍 Post Visibility

- `public` - Visible to everyone
- `followers` - Visible to followers only
- `private` - Visible to author only

---

*Last updated: October 31, 2025*