# Leelaverse API Documentation for Android Developers

## Base URL
**Production:** `https://www.leelaah.com`
**Development:** `http://localhost:3000`

## Table of Contents
1. [Authentication](#authentication)
2. [Authorization](#authorization)
3. [Error Handling](#error-handling)
4. [Authentication Endpoints](#authentication-endpoints)
5. [OAuth Endpoints](#oauth-endpoints)
6. [Profile Management](#profile-management)
7. [User Management](#user-management)
8. [Post Management](#post-management)
9. [AI Generation](#ai-generation)
10. [Social Features](#social-features)
11. [Data Models](#data-models)

---

## Authentication

All protected endpoints require a JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Types
- **Access Token:** Short-lived (15 minutes), used for API requests
- **Refresh Token:** Long-lived (7 days), used to obtain new access tokens

### Token Refresh Flow
When access token expires (401 error), use the refresh token endpoint to get a new access token.

---

## Authorization

### Authentication Levels
- **Public:** No authentication required
- **Optional Auth:** Works with or without authentication (enhanced data when authenticated)
- **Private:** Requires valid access token

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message",
      "value": "provided value"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `423` - Locked (account locked)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Authentication Endpoints

### 1. Register New User
**POST** `/api/auth/register`

**Access:** Public
**Rate Limit:** Strict (create account limiter)

**Request Body:**
```json
{
  "username": "johndoe123",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation Rules:**
- `username`: 3-30 characters, alphanumeric with underscores/hyphens only
- `email`: Valid email format
- `password`: Minimum 8 characters, must contain uppercase, lowercase, number, and special character
- `firstName`: Optional, 1-50 characters
- `lastName`: Optional, 1-50 characters

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cm123abc...",
      "username": "johndoe123",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": null,
      "bio": null,
      "role": "user",
      "isEmailVerified": false,
      "coinBalance": 100,
      "createdAt": "2025-12-07T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**
- `400` - Email or username already exists
- `400` - Validation failed

---

### 2. Login
**POST** `/api/auth/login`

**Access:** Public
**Rate Limit:** Standard auth limiter

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cm123abc...",
      "username": "johndoe123",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://cloudinary.com/...",
      "bio": "Creative developer",
      "role": "user",
      "coinBalance": 150,
      "totalCreations": 5,
      "isEmailVerified": true,
      "lastLogin": "2025-12-07T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**
- `401` - Invalid email or password
- `423` - Account locked (too many failed attempts)
- `403` - Account banned

---

### 3. Refresh Access Token
**POST** `/api/auth/refresh-token`

**Access:** Public (requires valid refresh token)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Response:**
- `401` - Invalid or expired refresh token

---

### 4. Logout
**POST** `/api/auth/logout`

**Access:** Private

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 5. Logout from All Devices
**POST** `/api/auth/logout-all`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

---

### 6. Get Current User Profile
**GET** `/api/auth/profile`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm123abc...",
      "username": "johndoe123",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://cloudinary.com/...",
      "coverImage": "https://cloudinary.com/...",
      "bio": "Creative developer",
      "location": "New York, USA",
      "website": "https://johndoe.com",
      "phoneNumber": "+1234567890",
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "twitterLink": "https://twitter.com/johndoe",
      "instagramLink": "https://instagram.com/johndoe",
      "linkedinLink": "https://linkedin.com/in/johndoe",
      "githubLink": "https://github.com/johndoe",
      "discordLink": "johndoe#1234",
      "role": "user",
      "verificationStatus": "verified",
      "coinBalance": 150,
      "totalCreations": 5,
      "totalCoinsEarned": 200,
      "totalCoinsSpent": 50,
      "subscriptionTier": "pro",
      "dailyGenerationsUsed": 3,
      "dailyGenerationsLimit": 50,
      "monthlyGenerationsUsed": 15,
      "monthlyGenerationsLimit": 500,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 7. Update User Profile
**PUT** `/api/auth/profile`

**Access:** Private

**Request Body (all fields optional):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "location": "New York, USA",
  "website": "https://johndoe.com",
  "avatar": "https://cloudinary.com/...",
  "coverImage": "https://cloudinary.com/...",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "twitterLink": "https://twitter.com/johndoe",
  "instagramLink": "https://instagram.com/johndoe",
  "linkedinLink": "https://linkedin.com/in/johndoe",
  "githubLink": "https://github.com/johndoe",
  "discordLink": "johndoe#1234"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { /* updated user object */ }
  }
}
```

---

### 8. Change Password
**PUT** `/api/auth/change-password`

**Access:** Private

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully. Please login again."
}
```

**Note:** This logs out all devices. User must login again.

---

### 9. Request Password Reset
**POST** `/api/auth/forgot-password`

**Access:** Public
**Rate Limit:** Password reset limiter

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

**Note:** Response is same whether email exists or not (security measure).

---

### 10. Reset Password
**POST** `/api/auth/reset-password`

**Access:** Public

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPass456!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful. Please login with your new password."
}
```

**Error Response:**
- `400` - Invalid or expired reset token

---

## OAuth Endpoints

### 1. Google OAuth Login
**GET** `/api/oauth/google`

**Access:** Public

Redirects user to Google OAuth consent screen. After user authorizes, Google redirects back to the callback URL.

---

### 2. Google OAuth Callback
**GET** `/api/oauth/google/callback`

**Access:** Public (handled by server)

Server receives OAuth code, exchanges it for user info, and redirects to frontend with tokens:

**Redirect URL:**
```
${FRONTEND_URL}/auth/callback?success=true&access_token=...&refresh_token=...&user=...
```

---

### 3. Verify OAuth Token
**POST** `/api/oauth/verify-oauth-token`

**Access:** Public

**Request Body:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token verified successfully",
  "data": {
    "user": { /* user object */ },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 4. OAuth Logout
**POST** `/api/oauth/logout-oauth`

**Access:** Private

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Profile Management

### 1. Upload Avatar (Base64)
**POST** `/api/profile/avatar/upload`

**Access:** Private

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "user": { /* updated user */ },
    "upload": {
      "url": "https://res.cloudinary.com/...",
      "publicId": "leelaverse/avatars/cm123abc...",
      "format": "jpg"
    }
  }
}
```

---

### 2. Update Avatar (URL)
**PUT** `/api/profile/avatar`

**Access:** Private

**Request Body:**
```json
{
  "avatar": "https://res.cloudinary.com/..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "data": {
    "user": { /* updated user */ }
  }
}
```

---

### 3. Upload Cover Image (Base64)
**POST** `/api/profile/cover/upload`

**Access:** Private

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cover image uploaded successfully",
  "data": {
    "user": { /* updated user */ },
    "upload": {
      "url": "https://res.cloudinary.com/...",
      "publicId": "leelaverse/covers/cm123abc...",
      "format": "jpg"
    }
  }
}
```

---

### 4. Update Cover Image (URL)
**PUT** `/api/profile/cover`

**Access:** Private

**Request Body:**
```json
{
  "coverImage": "https://res.cloudinary.com/..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cover image updated successfully",
  "data": {
    "user": { /* updated user */ }
  }
}
```

---

### 5. Update Username
**PUT** `/api/profile/username`

**Access:** Private

**Request Body:**
```json
{
  "username": "newusername123"
}
```

**Validation:** 3-20 characters, letters, numbers, underscores only

**Success Response (200):**
```json
{
  "success": true,
  "message": "Username updated successfully",
  "data": {
    "user": { /* updated user */ }
  }
}
```

**Error Response:**
- `400` - Username already taken or invalid format

---

### 6. Update Bio
**PUT** `/api/profile/bio`

**Access:** Private

**Request Body:**
```json
{
  "bio": "New bio text (max 500 characters)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bio updated successfully",
  "data": {
    "user": { /* updated user */ }
  }
}
```

---

### 7. Update Social Links
**PUT** `/api/profile/social`

**Access:** Private

**Request Body (all optional):**
```json
{
  "twitterLink": "https://twitter.com/username",
  "instagramLink": "https://instagram.com/username",
  "linkedinLink": "https://linkedin.com/in/username",
  "githubLink": "https://github.com/username",
  "discordLink": "username#1234"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Social links updated successfully",
  "data": {
    "user": { /* updated user */ }
  }
}
```

---

### 8. Update Settings
**PUT** `/api/profile/settings`

**Access:** Private

**Request Body:**
```json
{
  "notificationSettings": {
    "likes": true,
    "comments": true,
    "follows": true,
    "aiComplete": true
  },
  "privacySettings": {
    "profileVisibility": "public",
    "showEmail": false,
    "showLocation": true
  },
  "displaySettings": {
    "theme": "dark",
    "language": "en"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "user": { /* updated user */ }
  }
}
```

---

### 9. Check Username Availability
**GET** `/api/profile/check-username/:username`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "available": true,
  "message": "Username is available"
}
```

or

```json
{
  "success": true,
  "available": false,
  "message": "Username is already taken"
}
```

---

### 10. Get Profile Statistics
**GET** `/api/profile/stats`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "userId": "cm123abc...",
      "username": "johndoe123",
      "memberSince": "2025-01-01T00:00:00.000Z",
      "counts": {
        "posts": 25,
        "followers": 150,
        "following": 80,
        "likesGiven": 450,
        "commentsGiven": 120,
        "savedPosts": 35,
        "aiGenerations": 40
      },
      "engagement": {
        "totalLikesReceived": 1200,
        "totalCommentsReceived": 340,
        "totalSavesReceived": 85,
        "totalEngagement": 1625
      },
      "creator": {
        "totalCreations": 40,
        "totalEarnings": 250.50,
        "coinBalance": 150,
        "subscriptionTier": "pro"
      },
      "aiUsage": {
        "dailyUsed": 3,
        "dailyLimit": 50,
        "monthlyUsed": 15,
        "monthlyLimit": 500
      }
    }
  }
}
```

---

## User Management

### 1. Get Public User Profile
**GET** `/api/users/:userId/profile`

**Access:** Optional Auth (enhanced data when authenticated)

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "cm123abc...",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe123",
    "avatar": "https://cloudinary.com/...",
    "coverImage": "https://cloudinary.com/...",
    "bio": "Creative developer",
    "location": "New York, USA",
    "website": "https://johndoe.com",
    "twitterLink": "https://twitter.com/johndoe",
    "instagramLink": "https://instagram.com/johndoe",
    "linkedinLink": "https://linkedin.com/in/johndoe",
    "githubLink": "https://github.com/johndoe",
    "discordLink": "johndoe#1234",
    "verificationStatus": "verified",
    "totalCreations": 40,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "_count": {
      "followers": 150,
      "following": 80,
      "posts": 25
    },
    "isFollowing": true,
    "isOwnProfile": false
  },
  "posts": [
    {
      "id": "post123",
      "title": "Amazing Art",
      "caption": "Check out my latest creation",
      "mediaUrl": "https://cloudinary.com/...",
      "thumbnailUrl": "https://cloudinary.com/...",
      "aiGenerated": true,
      "createdAt": "2025-12-07T10:00:00.000Z",
      "likesCount": 45,
      "commentsCount": 12
    }
  ]
}
```

---

### 2. Follow User
**POST** `/api/users/:userId/follow`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "message": "Now following @johndoe123",
  "follow": {
    "id": "follow123",
    "followingId": "cm123abc...",
    "createdAt": "2025-12-07T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Already following or can't follow self
- `404` - User not found

---

### 3. Unfollow User
**DELETE** `/api/users/:userId/follow`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "message": "Unfollowed user successfully"
}
```

**Error Responses:**
- `400` - Not following this user or can't unfollow self

---

### 4. Check Follow Status
**GET** `/api/users/:userId/follow-status`

**Access:** Optional Auth

**Success Response (200):**
```json
{
  "success": true,
  "isFollowing": true,
  "isOwnProfile": false
}
```

---

## Post Management

### 1. Get Feed Posts
**GET** `/api/posts/feed`

**Access:** Public

**Query Parameters:**
- `category` (optional): Filter by category
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Posts per page

**Categories:**
- `image-post` - Single or multiple images
- `video-post` - Video content
- `text-post` - Text only
- `image-text-post` - Images with text
- `short` - Short video (Bloops)

**Example Request:**
```
GET /api/posts/feed?category=image-post&page=1&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "posts": [
    {
      "id": "post123",
      "createdAt": "2025-12-07T10:00:00.000Z",
      "updatedAt": "2025-12-07T10:00:00.000Z",
      "authorId": "user123",
      "type": "image",
      "category": "image-post",
      "caption": "Beautiful sunset captured today!",
      "title": "Golden Hour",
      "mediaUrl": "https://cloudinary.com/image1.jpg",
      "mediaUrls": [
        "https://cloudinary.com/image1.jpg",
        "https://cloudinary.com/image2.jpg"
      ],
      "thumbnailUrl": "https://cloudinary.com/thumb.jpg",
      "mediaType": "image/jpeg",
      "aiGenerated": false,
      "aiModel": null,
      "aiPrompt": null,
      "likesCount": 145,
      "commentsCount": 23,
      "sharesCount": 5,
      "savesCount": 12,
      "viewsCount": 890,
      "tags": ["sunset", "photography", "nature"],
      "visibility": "public",
      "isApproved": true,
      "author": {
        "id": "user123",
        "username": "johndoe123",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://cloudinary.com/avatar.jpg",
        "verificationStatus": "verified",
        "totalCreations": 40
      },
      "likes": [
        { "userId": "user456" },
        { "userId": "user789" }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 245,
    "pages": 13,
    "hasMore": true
  }
}
```

---

### 2. Get Bloops (Video Posts)
**GET** `/api/posts/bloops`

**Access:** Public

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Success Response:** Same structure as feed posts, filtered for video content

---

### 3. Get Single Post
**GET** `/api/posts/:postId`

**Access:** Public

**Success Response (200):**
```json
{
  "success": true,
  "post": {
    "id": "post123",
    "createdAt": "2025-12-07T10:00:00.000Z",
    "caption": "Amazing artwork!",
    "mediaUrl": "https://cloudinary.com/...",
    "likesCount": 145,
    "commentsCount": 23,
    "viewsCount": 891,
    "author": {
      "id": "user123",
      "username": "johndoe123",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://cloudinary.com/..."
    }
  }
}
```

---

### 4. Get User Posts
**GET** `/api/posts/user/:userId`

**Access:** Public

**Query Parameters:**
- `category` (optional): Filter by category
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Success Response:** Same structure as feed posts

---

### 5. Create Post
**POST** `/api/posts`

**Access:** Public (Private for AI-generated)

**Request Body:**
```json
{
  "caption": "Check out this amazing creation!",
  "title": "My Latest Work",
  "type": "content",
  "category": "image-post",
  "imageUrls": [
    "https://fal.ai/generated-image-url.jpg"
  ],
  "videoUrls": [],
  "mediaItems": [],
  "aiGenerationIds": ["gen123", "gen456"],
  "aiGenerated": true,
  "aiDetails": {
    "model": "FLUX.1 SRPO",
    "prompt": "A beautiful sunset over mountains",
    "enhancedPrompt": "A stunning golden hour sunset...",
    "style": "photorealistic",
    "aspectRatio": "16:9",
    "steps": 28,
    "generationTime": 25,
    "seed": "12345"
  },
  "tags": ["ai-art", "landscape", "sunset"],
  "visibility": "public"
}
```

**Field Descriptions:**
- `caption`: Post description (required for text-post)
- `title`: Post title (optional)
- `type`: "content" (default)
- `category`: "image-post", "video-post", "text-post", "image-text-post"
- `imageUrls`: Array of image URLs (will be uploaded to Cloudinary)
- `videoUrls`: Array of video URLs
- `mediaItems`: Mixed media array `[{type: 'image'|'video', url: string}]`
- `aiGenerationIds`: Array of AI generation IDs to link to this post
- `aiGenerated`: Boolean indicating AI-generated content
- `aiDetails`: AI generation metadata
- `tags`: Array of tags
- `visibility`: "public", "followers", "private"

**Success Response (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "id": "post123",
    "authorId": "user123",
    "caption": "Check out this amazing creation!",
    "mediaUrl": "https://cloudinary.com/...",
    "mediaUrls": ["https://cloudinary.com/..."],
    "thumbnailUrl": "https://cloudinary.com/...",
    "category": "image-post",
    "aiGenerated": true,
    "visibility": "public",
    "isApproved": true,
    "createdAt": "2025-12-07T10:30:00.000Z",
    "author": {
      "id": "user123",
      "username": "johndoe123",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://cloudinary.com/..."
    }
  }
}
```

---

### 6. Delete Post
**DELETE** `/api/posts/:postId`

**Access:** Private (owner only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

**Error Response:**
- `404` - Post not found or unauthorized

---

### 7. Upload and Create Post
**POST** `/api/posts/upload`

**Access:** Private

Upload image directly (base64) and create post in one request.

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",
  "caption": "Direct upload test",
  "title": "My Photo",
  "category": "image-post",
  "tags": ["photography", "art"],
  "visibility": "public"
}
```

**Success Response (201):** Same as Create Post

---

## AI Generation

### 1. Get Available AI Models
**GET** `/api/posts/models`

**Access:** Public

**Query Parameters:**
- `type` (optional): "image" or "video"
- `featured` (optional): "true" to get only featured models

**Success Response (200):**
```json
{
  "success": true,
  "models": {
    "image": [
      {
        "id": "flux-schnell",
        "name": "FLUX Schnell",
        "description": "Fast generation (15-20s)",
        "provider": "Black Forest Labs",
        "falEndpoint": "fal-ai/flux/schnell",
        "defaultSteps": 4,
        "maxSteps": 12,
        "defaultGuidance": 3.5,
        "speed": "fast",
        "quality": "good",
        "creditCost": 50,
        "featured": true
      },
      {
        "id": "flux-1-srpo",
        "name": "FLUX.1 SRPO",
        "description": "High quality (25-35s)",
        "provider": "Black Forest Labs",
        "falEndpoint": "fal-ai/flux-1/srpo",
        "defaultSteps": 28,
        "maxSteps": 50,
        "defaultGuidance": 4.5,
        "speed": "medium",
        "quality": "excellent",
        "creditCost": 100,
        "featured": true
      }
    ],
    "video": [
      {
        "id": "kling-v1-5-pro",
        "name": "Kling v1.5 Pro",
        "description": "Professional video generation",
        "provider": "Kuaishou",
        "creditCost": 200,
        "featured": true
      }
    ]
  },
  "message": "Available AI models retrieved successfully"
}
```

---

### 2. Generate Image
**POST** `/api/posts/generate-image`

**Access:** Private

**Request Body:**
```json
{
  "prompt": "A majestic dragon flying over mountains at sunset",
  "selectedModel": "flux-1-srpo",
  "aspectRatio": "16:9",
  "imageSize": "landscape_4_3",
  "numInferenceSteps": 28,
  "guidanceScale": 4.5,
  "style": "photorealistic",
  "numImages": 2
}
```

**Field Descriptions:**
- `prompt`: Text description of desired image (required)
- `selectedModel`: Model ID from /models endpoint
- `aspectRatio`: "1:1", "4:3", "16:9", "9:16", "3:4"
- `imageSize`: Mapped automatically from aspectRatio
- `numInferenceSteps`: Number of generation steps (model-specific limits)
- `guidanceScale`: How closely to follow prompt (typically 3-7)
- `style`: Optional style modifier
- `numImages`: Number of images to generate (1-4)

**Success Response (200):**
```json
{
  "success": true,
  "message": "2 image generation(s) started",
  "generations": [
    {
      "requestId": "fal-request-id-1",
      "aiGenerationId": "gen123"
    },
    {
      "requestId": "fal-request-id-2",
      "aiGenerationId": "gen456"
    }
  ],
  "count": 2,
  "estimatedTime": "15-30 seconds per image"
}
```

---

### 3. Generate Video
**POST** `/api/posts/generate-video`

**Access:** Private

**Request Body:**
```json
{
  "prompt": "A cat playing with a ball of yarn",
  "selectedModel": "kling-v1-5-pro",
  "aspectRatio": "16:9",
  "duration": "5"
}
```

**Field Descriptions:**
- `prompt`: Video description (required)
- `selectedModel`: Video model ID
- `aspectRatio`: "16:9", "9:16", "1:1"
- `duration`: "5" or "10" seconds (model-dependent)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Video generation started",
  "generations": [
    {
      "requestId": "fal-video-request-id",
      "aiGenerationId": "gen789"
    }
  ],
  "estimatedTime": "60-120 seconds"
}
```

---

### 4. Check Generation Status
**GET** `/api/posts/generation/:requestId`

**Access:** Private

**Success Response (200) - In Progress:**
```json
{
  "success": true,
  "status": "in_progress",
  "requestId": "fal-request-id",
  "queuePosition": 3,
  "logs": [
    "Initializing generation...",
    "Processing prompt...",
    "Generating image..."
  ]
}
```

**Success Response (200) - Completed:**
```json
{
  "success": true,
  "status": "completed",
  "requestId": "fal-request-id",
  "imageUrl": "https://fal.ai/files/generated-image.jpg",
  "videoUrl": "https://fal.ai/files/generated-video.mp4",
  "seed": "12345",
  "prompt": "A majestic dragon...",
  "data": {
    "images": [
      {
        "url": "https://fal.ai/files/image.jpg",
        "width": 1024,
        "height": 768
      }
    ],
    "seed": 12345
  }
}
```

**Success Response (200) - Failed:**
```json
{
  "success": false,
  "status": "failed",
  "requestId": "fal-request-id"
}
```

---

### 5. Get My AI Generations
**GET** `/api/posts/my-generations`

**Access:** Private

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "generations": [
    {
      "id": "gen123",
      "createdAt": "2025-12-07T10:00:00.000Z",
      "type": "image",
      "model": "FLUX.1 SRPO",
      "prompt": "A beautiful sunset",
      "resultUrl": "https://fal.ai/files/image.jpg",
      "thumbnailUrl": "https://fal.ai/files/thumb.jpg",
      "status": "completed",
      "postId": null,
      "aspectRatio": "16:9",
      "steps": 28,
      "seed": "12345"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### 6. Create Post from Generation
**POST** `/api/posts/create-from-generation`

**Access:** Private

**Request Body:**
```json
{
  "generationId": "gen123",
  "caption": "Check out my AI-generated art!",
  "title": "Dragon Sunset",
  "tags": ["ai-art", "dragon", "fantasy"],
  "visibility": "public"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Post created from generation successfully",
  "post": { /* post object */ }
}
```

---

### 7. Get FAL Status (Direct)
**GET** `/api/posts/fal-status/:requestId`

**Access:** Private

Direct FAL AI status check (alternative to generation status endpoint).

**Success Response (200):**
```json
{
  "success": true,
  "status": "IN_PROGRESS",
  "queue_position": 2
}
```

---

### 8. Get FAL Result (Direct)
**GET** `/api/posts/fal-result/:requestId`

**Access:** Private

Direct FAL AI result retrieval.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "url": "https://fal.ai/files/image.jpg",
        "width": 1024,
        "height": 768
      }
    ],
    "seed": 12345
  }
}
```

---

## Social Features

### 1. Like Post
**POST** `/api/posts/:postId/like`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "message": "Post liked successfully",
  "isLiked": true,
  "likesCount": 146
}
```

**Error Response:**
- `400` - Post already liked
- `404` - Post not found

---

### 2. Unlike Post
**DELETE** `/api/posts/:postId/like`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "message": "Post unliked successfully",
  "isLiked": false,
  "likesCount": 145
}
```

**Error Response:**
- `400` - Post not liked
- `404` - Post not found

---

### 3. Check Like Status
**GET** `/api/posts/:postId/like-status`

**Access:** Optional Auth

**Success Response (200):**
```json
{
  "success": true,
  "isLiked": true,
  "likesCount": 145
}
```

---

### 4. Add Comment
**POST** `/api/posts/:postId/comments`

**Access:** Private

**Request Body:**
```json
{
  "text": "Amazing work! Love the colors.",
  "parentCommentId": null
}
```

**Field Descriptions:**
- `text`: Comment content (required, 1-2200 characters)
- `parentCommentId`: ID of parent comment (for replies, null for top-level)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "comment": {
    "id": "comment123",
    "postId": "post123",
    "authorId": "user123",
    "text": "Amazing work! Love the colors.",
    "parentCommentId": null,
    "replyLevel": 0,
    "likesCount": 0,
    "repliesCount": 0,
    "createdAt": "2025-12-07T10:30:00.000Z",
    "author": {
      "id": "user123",
      "username": "johndoe123",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://cloudinary.com/..."
    }
  },
  "commentsCount": 24
}
```

---

### 5. Get Comments
**GET** `/api/posts/:postId/comments`

**Access:** Public

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `parentCommentId` (optional): Get replies to specific comment

**Example - Get top-level comments:**
```
GET /api/posts/post123/comments?page=1&limit=20
```

**Example - Get replies to a comment:**
```
GET /api/posts/post123/comments?parentCommentId=comment123
```

**Success Response (200):**
```json
{
  "success": true,
  "comments": [
    {
      "id": "comment123",
      "postId": "post123",
      "authorId": "user123",
      "text": "Amazing work!",
      "parentCommentId": null,
      "replyLevel": 0,
      "likesCount": 5,
      "repliesCount": 2,
      "createdAt": "2025-12-07T10:00:00.000Z",
      "author": {
        "id": "user123",
        "username": "johndoe123",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://cloudinary.com/..."
      },
      "replies": [
        {
          "id": "reply123",
          "text": "Thanks!",
          "replyLevel": 1,
          "createdAt": "2025-12-07T10:05:00.000Z",
          "author": { /* author object */ }
        }
      ]
    }
  ],
  "commentsCount": 24,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 24,
    "pages": 2
  }
}
```

---

### 6. Delete Comment
**DELETE** `/api/posts/:postId/comments/:commentId`

**Access:** Private (owner only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Comment deleted successfully",
  "commentsCount": 23
}
```

**Note:** Deleting a comment also deletes all its replies.

**Error Response:**
- `403` - You can only delete your own comments
- `404` - Comment not found

---

## Data Models

### User Model
```javascript
{
  id: "string",                    // Unique identifier
  createdAt: "Date",
  updatedAt: "Date",

  // Basic Info
  firstName: "string",             // Default: "User"
  lastName: "string",              // Default: "OAuth"
  username: "string",              // Unique
  email: "string",                 // Unique
  password: "string | null",       // Nullable for OAuth users

  // Profile
  avatar: "string | null",
  bio: "string | null",
  location: "string | null",
  website: "string | null",
  coverImage: "string | null",
  phoneNumber: "string | null",    // Unique
  dateOfBirth: "Date | null",
  twitterLink: "string | null",
  instagramLink: "string | null",
  linkedinLink: "string | null",
  githubLink: "string | null",
  discordLink: "string | null",

  // OAuth
  googleId: "string | null",       // Unique
  oauthProviders: ["string"],      // ['google', 'github', etc.]

  // Role & Verification
  role: "string",                  // 'user', 'admin', 'moderator'
  isEmailVerified: "boolean",
  verificationStatus: "string",    // 'unverified', 'pending', 'verified'

  // Security
  lastLogin: "Date | null",
  loginAttempts: "number",
  lockUntil: "Date | null",

  // Account Status
  isActive: "boolean",
  isBanned: "boolean",
  banReason: "string | null",
  banExpiresAt: "Date | null",

  // Creator Stats
  totalCreations: "number",
  totalEarnings: "number",         // Decimal stored as number

  // Coin System
  coinBalance: "number",           // Default: 100
  totalCoinsEarned: "number",
  totalCoinsSpent: "number",

  // Subscription
  subscriptionTier: "string | null", // 'free', 'basic', 'pro', 'enterprise'
  subscriptionStatus: "string | null",

  // AI Usage Limits
  monthlyGenerationsUsed: "number",
  monthlyGenerationsLimit: "number",
  dailyGenerationsUsed: "number",
  dailyGenerationsLimit: "number",

  // Settings (JSON)
  notificationSettings: "object | null",
  privacySettings: "object | null",
  displaySettings: "object | null"
}
```

---

### Post Model
```javascript
{
  id: "string",
  createdAt: "Date",
  updatedAt: "Date",

  // Author
  authorId: "string",
  author: "User",                 // User object

  // Content Type
  type: "string",                // 'image', 'video', 'text'
  category: "string",            // 'short', 'normal-video', 'image-post', etc.

  // Text Content
  caption: "string | null",
  title: "string | null",

  // Media
  mediaUrl: "string | null",     // Single media (backward compatibility)
  mediaUrls: ["string"],         // Multiple media URLs
  thumbnailUrl: "string | null",
  mediaType: "string | null",    // 'image/jpeg', 'video/mp4', etc.
  mediaItems: "object | null",   // Mixed media JSON

  // AI Generation
  aiGenerated: "boolean",
  aiModel: "string | null",
  aiPrompt: "string | null",
  aiEnhancedPrompt: "string | null",
  aiStyle: "string | null",
  aiAspectRatio: "string | null",
  aiSteps: "number | null",
  aiGenerationTime: "number | null",
  aiSeed: "string | null",

  // Engagement Stats
  likesCount: "number",
  commentsCount: "number",
  sharesCount: "number",
  savesCount: "number",
  viewsCount: "number",

  // Tags & Location
  tags: ["string"],
  locationName: "string | null",
  locationLat: "number | null",  // Decimal stored as number
  locationLng: "number | null",  // Decimal stored as number

  // Visibility
  visibility: "string",          // 'public', 'followers', 'private'

  // Moderation
  isApproved: "boolean",
  isFlagged: "boolean",

  // Monetization
  isPremium: "boolean",
  premiumPrice: "number | null", // Decimal stored as number

  // Scheduling
  isScheduled: "boolean",
  scheduledFor: "Date | null",
  publishedAt: "Date"
}
```

---

### Comment Model
```javascript
{
  id: "string",
  createdAt: "Date",
  updatedAt: "Date",

  // References
  postId: "string",
  authorId: "string",
  author: "User",                // User object

  // Content
  text: "string",

  // Reply Structure
  parentCommentId: "string | null",
  parentComment: "Comment | null",
  replies: ["Comment"],          // Array of Comment objects
  replyLevel: "number",          // 0 for top-level, 1+ for nested

  // Engagement
  likesCount: "number",
  repliesCount: "number",

  // Moderation
  isEdited: "boolean",
  editedAt: "Date | null",
  isHidden: "boolean",
  isFlagged: "boolean"
}
```

---

### AIGeneration Model
```javascript
{
  id: "string",
  createdAt: "Date",
  updatedAt: "Date",

  // User
  userId: "string",
  user: "User",                  // User object

  // Generation Type
  type: "string",                // 'image', 'video', 'text-enhancement'
  model: "string",               // 'FLUX.1 SRPO', 'Kling v1.5', etc.

  // Input
  prompt: "string",
  enhancedPrompt: "string | null",

  // Parameters
  style: "string | null",
  aspectRatio: "string | null",
  steps: "number | null",
  seed: "string | null",
  quality: "string | null",

  // Output
  resultUrl: "string | null",
  thumbnailUrl: "string | null",

  // FAL AI Tracking
  falRequestId: "string | null",

  // Related Post
  postId: "string | null",
  post: "Post | null",           // Post object

  // Performance
  generationTime: "number | null", // milliseconds
  cost: "number | null",          // Decimal stored as number

  // Status
  status: "string",              // 'pending', 'processing', 'completed', 'failed'
  errorMessage: "string | null",

  // User Feedback
  userRating: "number | null"    // 1-5
}
```

---

### Like Model
```javascript
{
  id: "string",
  createdAt: "Date",

  // User
  userId: "string",
  user: "User",                  // User object

  // Polymorphic Reference
  postId: "string | null",
  post: "Post | null",           // Post object
  commentId: "string | null",
  comment: "Comment | null"      // Comment object
}
```

---

### Follow Model
```javascript
{
  id: "string",
  createdAt: "Date",

  // Follower
  followerId: "string",
  follower: "User",              // User object

  // Following
  followingId: "string",
  following: "User",             // User object

  // Settings
  notificationsEnabled: "boolean"
}
```

---

## Rate Limiting

The API implements rate limiting on certain endpoints:

- **General Requests:** 100 requests per 15 minutes per IP
- **Authentication:** 5 requests per 15 minutes per IP
- **Account Creation:** 3 requests per hour per IP
- **Password Reset:** 3 requests per hour per IP

When rate limited, you'll receive a `429 Too Many Requests` response:

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```
---

**Last Updated:** December 7, 2025
**API Version:** 1.0.0
**Base URL:** https://backend.leelaah.com
