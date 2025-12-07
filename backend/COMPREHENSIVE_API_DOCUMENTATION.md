# Leelaverse API - Comprehensive Developer Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Rate Limiting](#rate-limiting)
5. [Error Handling](#error-handling)
6. [Endpoints](#endpoints)
   - [Authentication Endpoints](#authentication-endpoints)
   - [OAuth Endpoints](#oauth-endpoints)
   - [Profile Management Endpoints](#profile-management-endpoints)
   - [Post Endpoints](#post-endpoints)
   - [AI Generation Endpoints](#ai-generation-endpoints)
   - [Social Interaction Endpoints](#social-interaction-endpoints)
   - [User Endpoints](#user-endpoints)
   - [System Endpoints](#system-endpoints)

---

## Introduction

The Leelaverse API is a RESTful API that provides comprehensive functionality for a social media platform with AI image and video generation capabilities. This documentation provides detailed information about all available endpoints, including request/response formats, authentication requirements, and payload structures.

## Base URL

**Production:** `https://backend.leelaah.com/api`

All API requests should be prefixed with this base URL unless otherwise specified.

## Authentication

Most endpoints require authentication using JWT (JSON Web Token) bearer tokens.

### Authentication Header Format
```
Authorization: Bearer <your_access_token_here>
```

### Token Types
- **Access Token**: Short-lived token (15 minutes) for API requests
- **Refresh Token**: Long-lived token (7 days) for obtaining new access tokens

### Token Refresh Flow
1. Login or register to receive both access and refresh tokens
2. Use access token for authenticated requests
3. When access token expires, use refresh token to get a new access token
4. If refresh token expires, user must login again


## Rate Limiting

The API implements rate limiting to prevent abuse:

| Endpoint Type | Limit |
|--------------|-------|
| General API | 100 requests per 15 minutes |
| Login | 5 attempts per 15 minutes |
| Registration | 3 attempts per hour |
| Password Reset | 3 attempts per hour |

### Rate Limit Response
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 423 | Locked - Account locked (failed login attempts) |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

# Endpoints

## Authentication Endpoints

### 1. Register User

Create a new user account.

**Endpoint:** `POST /auth/register`  
**Authentication:** Not required  
**Rate Limit:** 3 requests per hour

#### Request Body
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | Unique username (3-30 characters, alphanumeric and underscore) |
| email | string | Yes | Valid email address |
| password | string | Yes | Password (minimum 8 characters, must include uppercase, lowercase, number, and special character) |
| firstName | string | Yes | User's first name |
| lastName | string | Yes | User's last name |

#### Success Response (201 Created)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cm4abc123xyz",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isEmailVerified": false,
      "avatar": null,
      "bio": null,
      "location": null,
      "website": null,
      "totalCreations": 0,
      "creditsBalance": 100,
      "verificationStatus": "unverified",
      "createdAt": "2025-12-07T13:15:29.025Z",
      "updatedAt": "2025-12-07T13:15:29.025Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtNGFiYzEyM3h5eiIsImlhdCI6MTczMzU4MjEyOSwiZXhwIjoxNzMzNTgzMDI5fQ.signature",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtNGFiYzEyM3h5eiIsImlhdCI6MTczMzU4MjEyOSwiZXhwIjoxNzM0MTg2OTI5fQ.signature"
  }
}
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

**400 Bad Request - Duplicate User**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

### 2. Login User

Authenticate a user and receive access tokens.

**Endpoint:** `POST /auth/login`  
**Authentication:** Not required  
**Rate Limit:** 5 requests per 15 minutes

#### Request Body
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cm4abc123xyz",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isEmailVerified": true,
      "avatar": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/avatars/johndoe.jpg",
      "bio": "AI enthusiast and digital creator",
      "location": "New York, USA",
      "website": "https://johndoe.com",
      "totalCreations": 25,
      "creditsBalance": 75,
      "lastLoginAt": "2025-12-07T13:15:29.025Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**400 Bad Request - Invalid Credentials**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**423 Locked - Account Locked**
```json
{
  "success": false,
  "message": "Account temporarily locked due to multiple failed login attempts. Try again in 15 minutes.",
  "lockedUntil": "2025-12-07T13:30:29.025Z"
}
```

---

### 3. Refresh Access Token

Obtain a new access token using a refresh token.

**Endpoint:** `POST /auth/refresh-token`  
**Authentication:** Refresh token required  
**Rate Limit:** General rate limit applies

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| refreshToken | string | Yes | Valid refresh token from login/register |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**401 Unauthorized - Invalid Token**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

---

### 4. Logout User

Logout from current device (invalidate refresh token).

**Endpoint:** `POST /auth/logout`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| refreshToken | string | Yes | Refresh token to invalidate |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 5. Logout All Devices

Logout from all devices (invalidate all refresh tokens).

**Endpoint:** `POST /auth/logout-all`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

---

### 6. Get Current User Profile

Retrieve the authenticated user's profile information.

**Endpoint:** `GET /auth/profile`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm4abc123xyz",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "bio": "AI enthusiast and digital creator",
      "avatar": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/avatars/johndoe.jpg",
      "coverImage": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/covers/johndoe.jpg",
      "location": "New York, USA",
      "website": "https://johndoe.com",
      "phoneNumber": "+1234567890",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "twitterLink": "https://twitter.com/johndoe",
      "instagramLink": "https://instagram.com/johndoe",
      "linkedinLink": "https://linkedin.com/in/johndoe",
      "githubLink": "https://github.com/johndoe",
      "discordLink": "johndoe#1234",
      "totalCreations": 25,
      "creditsBalance": 75,
      "verificationStatus": "unverified",
      "role": "user",
      "isEmailVerified": true,
      "createdAt": "2025-11-01T00:00:00.000Z",
      "updatedAt": "2025-12-07T13:15:29.025Z",
      "lastLoginAt": "2025-12-07T13:15:29.025Z"
    }
  }
}
```

---

### 7. Update User Profile (Auth Route)

Update user profile information via auth route.

**Endpoint:** `PUT /auth/profile`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "AI enthusiast and digital creator | Exploring the intersection of art and technology",
  "location": "San Francisco, CA",
  "website": "https://johndoe.com",
  "avatar": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/avatars/johndoe.jpg",
  "coverImage": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/covers/johndoe.jpg",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "twitterLink": "https://twitter.com/johndoe",
  "instagramLink": "https://instagram.com/johndoe",
  "linkedinLink": "https://linkedin.com/in/johndoe",
  "githubLink": "https://github.com/johndoe",
  "discordLink": "johndoe#1234"
}
```

#### Request Body Fields (All Optional)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | No | First name |
| lastName | string | No | Last name |
| bio | string | No | User biography (max 500 characters) |
| location | string | No | User location |
| website | string | No | Personal website URL |
| avatar | string | No | Avatar image URL |
| coverImage | string | No | Cover image URL |
| phoneNumber | string | No | Phone number |
| dateOfBirth | string | No | Date of birth (ISO 8601 format) |
| twitterLink | string | No | Twitter profile URL |
| instagramLink | string | No | Instagram profile URL |
| linkedinLink | string | No | LinkedIn profile URL |
| githubLink | string | No | GitHub profile URL |
| discordLink | string | No | Discord username |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "cm4abc123xyz",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "bio": "AI enthusiast and digital creator | Exploring the intersection of art and technology",
      "avatar": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/avatars/johndoe.jpg",
      "coverImage": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/covers/johndoe.jpg",
      "location": "San Francisco, CA",
      "website": "https://johndoe.com",
      "updatedAt": "2025-12-07T13:15:29.025Z"
    }
  }
}
```

---

### 8. Change Password

Change the authenticated user's password.

**Endpoint:** `PUT /auth/change-password`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword456!"
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currentPassword | string | Yes | User's current password |
| newPassword | string | Yes | New password (min 8 chars, must include uppercase, lowercase, number, special char) |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Password changed successfully. Please login again."
}
```

#### Error Responses

**400 Bad Request - Incorrect Current Password**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

### 9. Request Password Reset

Request a password reset token via email.

**Endpoint:** `POST /auth/forgot-password`  
**Authentication:** Not required  
**Rate Limit:** 3 requests per hour

#### Request Body
```json
{
  "email": "john@example.com"
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Email address of the account |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

> **Note:** For security reasons, this endpoint always returns success even if the email doesn't exist.

---

### 10. Reset Password

Reset password using the token received via email.

**Endpoint:** `POST /auth/reset-password`  
**Authentication:** Not required  
**Rate Limit:** General rate limit applies

#### Request Body
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "newPassword": "NewSecurePassword789!"
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Reset token from email |
| newPassword | string | Yes | New password (min 8 chars, must include uppercase, lowercase, number, special char) |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Password reset successful. Please login with your new password."
}
```

#### Error Responses

**400 Bad Request - Invalid/Expired Token**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

---

## OAuth Endpoints

### 1. Google OAuth Login

Initiate Google OAuth login flow.

**Endpoint:** `GET /oauth/google`  
**Authentication:** Not required  
**Rate Limit:** General rate limit applies

#### Usage
Redirect the user to this URL in their browser:
```
https://backend.leelaah.com/oauth/google
```

This will redirect the user to Google's authorization page.

---

### 2. Google OAuth Callback

Handle Google OAuth callback (automatic).

**Endpoint:** `GET /oauth/google/callback`  
**Authentication:** Not required (handled by OAuth flow)  
**Rate Limit:** General rate limit applies

#### Behavior
After user authorizes on Google, they are automatically redirected to your frontend with tokens:
```
https://yourfrontend.com/?success=true&access_token=...&refresh_token=...&user=...
```

---

### 3. Verify OAuth Token

Verify an OAuth access token.

**Endpoint:** `POST /oauth/verify-oauth-token`  
**Authentication:** Not required  
**Rate Limit:** General rate limit applies

#### Request Body
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| access_token | string | Yes | OAuth access token to verify |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Token verified successfully",
  "data": {
    "user": {
      "id": "cm4abc123xyz",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://lh3.googleusercontent.com/..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. OAuth Logout

Logout OAuth user.

**Endpoint:** `POST /oauth/logout-oauth`  
**Authentication:** Required (Bearer token)  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| refresh_token | string | Yes | OAuth refresh token to invalidate |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Profile Management Endpoints

### 1. Update Profile

Update complete profile information.

**Endpoint:** `PUT /profile`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "AI enthusiast and digital creator",
  "location": "San Francisco, CA",
  "website": "https://johndoe.com",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-15"
}
```

#### Request Body Fields (All Optional)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | No | First name |
| lastName | string | No | Last name |
| bio | string | No | User biography |
| location | string | No | User location |
| website | string | No | Personal website URL |
| phoneNumber | string | No | Phone number |
| dateOfBirth | string | No | Date of birth (YYYY-MM-DD) |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "cm4abc123xyz",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "bio": "AI enthusiast and digital creator",
      "location": "San Francisco, CA",
      "website": "https://johndoe.com",
      "updatedAt": "2025-12-07T13:15:29.025Z"
    }
  }
}
```

---

### 2. Upload Avatar

Upload user avatar image (base64 encoded).

**Endpoint:** `POST /profile/avatar/upload`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| image | string | Yes | Base64 encoded image data (with data URI prefix) |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatarUrl": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/avatars/cm4abc123xyz.jpg"
  }
}
```

---

### 3. Update Avatar URL

Update avatar using a URL.

**Endpoint:** `PUT /profile/avatar`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "avatar": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/avatars/johndoe.jpg"
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| avatar | string | Yes | Avatar image URL |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "data": {
    "user": {
      "id": "cm4abc123xyz",
      "avatar": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/avatars/johndoe.jpg"
    }
  }
}
```

---

### 4. Upload Cover Image

Upload cover image (base64 encoded).

**Endpoint:** `POST /profile/cover/upload`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| image | string | Yes | Base64 encoded image data (with data URI prefix) |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Cover image uploaded successfully",
  "data": {
    "coverImageUrl": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/covers/cm4abc123xyz.jpg"
  }
}
```

---

### 5. Update Cover Image URL

Update cover image using a URL.

**Endpoint:** `PUT /profile/cover`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "coverImage": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/covers/johndoe.jpg"
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| coverImage | string | Yes | Cover image URL |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Cover image updated successfully",
  "data": {
    "user": {
      "id": "cm4abc123xyz",
      "coverImage": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/covers/johndoe.jpg"
    }
  }
}
```

---

### 6. Update Username

Update username.

**Endpoint:** `PUT /profile/username`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "username": "newusername"
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | New username (3-30 characters, alphanumeric and underscore) |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Username updated successfully",
  "data": {
    "user": {
      "id": "cm4abc123xyz",
      "username": "newusername"
    }
  }
}
```

#### Error Responses

**400 Bad Request - Username Taken**
```json
{
  "success": false,
  "message": "Username is already taken"
}
```

---

### 7. Update Bio

Update user biography.

**Endpoint:** `PUT /profile/bio`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "bio": "AI enthusiast and digital creator | Exploring the intersection of art and technology"
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bio | string | Yes | User biography (max 500 characters) |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Bio updated successfully",
  "data": {
    "user": {
      "id": "cm4abc123xyz",
      "bio": "AI enthusiast and digital creator | Exploring the intersection of art and technology"
    }
  }
}
```

---

### 8. Update Social Links

Update social media links.

**Endpoint:** `PUT /profile/social`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "twitterLink": "https://twitter.com/johndoe",
  "instagramLink": "https://instagram.com/johndoe",
  "linkedinLink": "https://linkedin.com/in/johndoe",
  "githubLink": "https://github.com/johndoe",
  "discordLink": "johndoe#1234"
}
```

#### Request Body Fields (All Optional)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| twitterLink | string | No | Twitter profile URL |
| instagramLink | string | No | Instagram profile URL |
| linkedinLink | string | No | LinkedIn profile URL |
| githubLink | string | No | GitHub profile URL |
| discordLink | string | No | Discord username with discriminator |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Social links updated successfully",
  "data": {
    "user": {
      "id": "cm4abc123xyz",
      "twitterLink": "https://twitter.com/johndoe",
      "instagramLink": "https://instagram.com/johndoe",
      "linkedinLink": "https://linkedin.com/in/johndoe",
      "githubLink": "https://github.com/johndoe",
      "discordLink": "johndoe#1234"
    }
  }
}
```

---

### 9. Update Settings

Update user settings (notifications, privacy, display preferences).

**Endpoint:** `PUT /profile/settings`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "emailNotifications": true,
  "pushNotifications": false,
  "privateProfile": false,
  "showEmail": false,
  "showLocation": true
}
```

#### Request Body Fields (All Optional)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| emailNotifications | boolean | No | Enable email notifications |
| pushNotifications | boolean | No | Enable push notifications |
| privateProfile | boolean | No | Make profile private |
| showEmail | boolean | No | Display email on profile |
| showLocation | boolean | No | Display location on profile |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "settings": {
      "emailNotifications": true,
      "pushNotifications": false,
      "privateProfile": false,
      "showEmail": false,
      "showLocation": true
    }
  }
}
```

---

### 10. Check Username Availability

Check if a username is available.

**Endpoint:** `GET /profile/check-username/:username`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| username | string | Username to check |

#### Example
```
GET /profile/check-username/newusername
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "available": true,
  "message": "Username is available"
}
```

#### Username Taken Response (200 OK)
```json
{
  "success": true,
  "available": false,
  "message": "Username is already taken"
}
```

---

### 11. Get Profile Statistics

Get detailed profile statistics.

**Endpoint:** `GET /profile/stats`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalPosts": 45,
      "totalFollowers": 1250,
      "totalFollowing": 378,
      "totalLikes": 5432,
      "totalComments": 892,
      "totalViews": 12456,
      "totalCreations": 45,
      "joinedDate": "2025-11-01T00:00:00.000Z"
    }
  }
}
```

---


## AI Generation Endpoints

### 1. Get Available AI Models

Get list of available AI models for image and video generation.

**Endpoint:** `GET /posts/models`  
**Authentication:** Not required  
**Rate Limit:** General rate limit applies

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Available AI models retrieved successfully",
  "data": {
    "allModels": [
      {
        "id": "flux-1-srpo",
        "name": "FLUX.1 SRPO",
        "type": "image",
        "description": "High-quality image generation with detailed control",
        "featured": true,
        "config": {
          "steps": { "min": 1, "max": 50, "default": 28 },
          "guidance": { "min": 1, "max": 20, "default": 4.5 }
        }
      },
      {
        "id": "flux-schnell",
        "name": "FLUX Schnell",
        "type": "image",
        "description": "Fast image generation",
        "featured": true,
        "config": {
          "steps": { "min": 1, "max": 12, "default": 4 }
        }
      }
    ],
    "imageModels": [...],
    "videoModels": [...],
    "featuredModels": [...]
  }
}
```

---

### 2. Generate Image

Generate AI image using FAL AI.

**Endpoint:** `POST /posts/generate-image`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "prompt": "A beautiful sunset over mountains, digital art style, vibrant colors",
  "selectedModel": "flux-1-srpo",
  "aspectRatio": "16:9",
  "numInferenceSteps": 28,
  "guidanceScale": 4.5,
  "style": "digital-art",
  "numImages": 1
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| prompt | string | Yes | Text description of the image to generate |
| selectedModel | string | No | AI model ID (default: "flux-1-srpo") |
| aspectRatio | string | No | Aspect ratio: "1:1", "4:3", "16:9", "9:16", "3:4" (default: "1:1") |
| numInferenceSteps | number | No | Number of inference steps (1-50, default: 28) |
| guidanceScale | number | No | Guidance scale (1-20, default: 4.5) |
| style | string | No | Art style preset |
| numImages | number | No | Number of images to generate (1-4, default: 1) |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "1 image generation(s) started",
  "generations": [
    {
      "requestId": "fal_request_abc123",
      "aiGenerationId": "cm4gen123xyz"
    }
  ],
  "count": 1,
  "estimatedTime": "15-30 seconds per image"
}
```

---

### 3. Generate Video

Generate AI video using FAL AI.

**Endpoint:** `POST /posts/generate-video`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "prompt": "A serene lake with mountains in the background, calm water reflection",
  "selectedModel": "minimax-video",
  "duration": 5
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| prompt | string | Yes | Text description of the video to generate |
| selectedModel | string | No | AI model ID for video generation |
| duration | number | No | Video duration in seconds |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Video generation started",
  "generation": {
    "requestId": "fal_video_abc123",
    "aiGenerationId": "cm4vidgen123xyz"
  },
  "estimatedTime": "2-5 minutes"
}
```

---

### 4. Check Generation Status

Check the status of an AI generation and get the result when complete.

**Endpoint:** `GET /posts/generation/:requestId`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| requestId | string | FAL AI request ID from generate-image or generate-video |

#### Success Response - Processing (200 OK)
```json
{
  "success": true,
  "status": "processing",
  "requestId": "fal_request_abc123",
  "queuePosition": 2,
  "logs": ["Starting generation...", "Processing prompt..."]
}
```

#### Success Response - Completed (200 OK)
```json
{
  "success": true,
  "status": "completed",
  "requestId": "fal_request_abc123",
  "imageUrl": "https://fal.media/files/generated-image.jpg",
  "seed": 1234567890,
  "prompt": "A beautiful sunset over mountains",
  "data": {
    "images": [
      {
        "url": "https://fal.media/files/generated-image.jpg",
        "width": 1024,
        "height": 576,
        "content_type": "image/jpeg"
      }
    ],
    "seed": 1234567890,
    "prompt": "A beautiful sunset over mountains"
  }
}
```

---

### 5. Get My AI Generations

Get user's AI generations that haven't been posted yet.

**Endpoint:** `GET /posts/my-generations`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20, max: 100) |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "AI generations retrieved successfully",
  "data": {
    "generations": [
      {
        "id": "cm4gen123xyz",
        "prompt": "Futuristic city at night, cyberpunk style",
        "model": "FLUX.1 SRPO",
        "resultUrl": "https://fal.media/files/generated-image.jpg",
        "style": "cyberpunk",
        "aspectRatio": "16:9",
        "steps": 28,
        "guidance": 4.5,
        "seed": "1234567890",
        "createdAt": "2025-12-07T13:15:29.025Z",
        "type": "image"
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

### 6. Get FAL Status (Direct)

Get FAL AI request status directly from FAL.

**Endpoint:** `GET /posts/fal-status/:requestId`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| requestId | string | FAL AI request ID |

#### Success Response (200 OK)
```json
{
  "success": true,
  "falStatus": "COMPLETED",
  "requestId": "fal_request_abc123",
  "logs": ["Generation completed successfully"],
  "queuePosition": null,
  "responseUrl": "https://fal.run/result/abc123"
}
```

---

### 7. Get FAL Result (Direct)

Get FAL AI generation result directly.

**Endpoint:** `GET /posts/fal-result/:requestId`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| requestId | string | FAL AI request ID |

#### Success Response (200 OK)
```json
{
  "success": true,
  "requestId": "fal_request_abc123",
  "data": {
    "images": [
      {
        "url": "https://fal.media/files/generated-image.jpg",
        "width": 1024,
        "height": 576,
        "content_type": "image/jpeg"
      }
    ],
    "seed": 1234567890,
    "prompt": "Futuristic city at night"
  },
  "images": [...],
  "seed": 1234567890,
  "prompt": "Futuristic city at night"
}
```

---

## Post Endpoints

### 1. Create Post from AI Generation

Create a post from completed AI generations.

**Endpoint:** `POST /posts/create-from-generation`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "aiGenerationIds": ["cm4gen123xyz", "cm4gen456abc"],
  "caption": "Check out these amazing AI-generated landscapes! #AIArt #DigitalArt",
  "title": "Mountain Landscapes",
  "type": "content",
  "category": "image-post",
  "tags": ["ai-art", "landscape", "digital", "mountains"],
  "visibility": "public"
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| aiGenerationIds | array | Yes | Array of AI generation IDs to create post from |
| caption | string | No | Post caption/description |
| title | string | No | Post title |
| type | string | No | Post type (default: "content") |
| category | string | No | Post category: "image-post", "text-post", "image-text-post", "video-post", "mixed-media" |
| tags | array | No | Array of tag strings |
| visibility | string | No | Visibility: "public", "followers", "private" (default: "public") |

#### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "id": "cm4post123xyz",
    "caption": "Check out these amazing AI-generated landscapes!",
    "title": "Mountain Landscapes",
    "mediaUrls": [
      "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/posts/image1.jpg",
      "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/posts/image2.jpg"
    ],
    "thumbnailUrl": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/posts/image1.jpg",
    "aiGenerated": true,
    "category": "image-post",
    "visibility": "public",
    "tags": ["ai-art", "landscape", "digital", "mountains"],
    "viewsCount": 0,
    "likesCount": 0,
    "commentsCount": 0,
    "author": {
      "id": "cm4abc123xyz",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/avatars/johndoe.jpg",
      "totalCreations": 26
    },
    "createdAt": "2025-12-07T13:15:29.025Z",
    "updatedAt": "2025-12-07T13:15:29.025Z"
  }
}
```

---

### 2. Upload and Create Post

Upload image directly and create a post.

**Endpoint:** `POST /posts/upload`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "imageUrl": "https://example.com/myimage.jpg",
  "caption": "Beautiful sunset at the beach!",
  "title": "Sunset Views",
  "category": "image-post",
  "tags": ["sunset", "beach", "nature"],
  "visibility": "public"
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| imageUrl | string | Yes | URL of the image to upload |
| caption | string | No | Post caption |
| title | string | No | Post title |
| category | string | No | Post category |
| tags | array | No | Array of tags |
| visibility | string | No | Visibility level |

#### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "id": "cm4post456abc",
    "caption": "Beautiful sunset at the beach!",
    "mediaUrls": ["https://res.cloudinary.com/leelaverse/image/upload/v1733582129/posts/beach.jpg"],
    "aiGenerated": false,
    "author": {...},
    "createdAt": "2025-12-07T13:15:29.025Z"
  }
}
```

---

### 3. Create Regular Post

Create a regular post (for testing, no auth required in current implementation).

**Endpoint:** `POST /posts`  
**Authentication:** Optional (but recommended)  
**Rate Limit:** General rate limit applies

#### Request Body
```json
{
  "caption": "Just finished a great workout! Feeling energized! 💪",
  "title": "Morning Workout",
  "type": "content",
  "category": "text-post",
  "imageUrls": ["https://example.com/workout.jpg"],
  "tags": ["fitness", "workout", "healthy"],
  "visibility": "public"
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| caption | string | No | Post caption |
| title | string | No | Post title |
| type | string | No | Post type |
| category | string | No | Post category |
| imageUrls | array | No | Array of image URLs |
| tags | array | No | Array of tags |
| visibility | string | No | Visibility level |

#### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "id": "cm4post789def",
    "caption": "Just finished a great workout! Feeling energized! 💪",
    "title": "Morning Workout",
    "category": "text-post",
    "tags": ["fitness", "workout", "healthy"],
    "author": {...},
    "createdAt": "2025-12-07T13:15:29.025Z"
  }
}
```

---

### 4. Get Feed Posts

Get public feed posts with pagination and filtering.

**Endpoint:** `GET /posts/feed`  
**Authentication:** Optional  
**Rate Limit:** General rate limit applies

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by category |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20, max: 100) |

#### Example
```
GET /posts/feed?category=image-post&page=1&limit=10
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "posts": [
    {
      "id": "cm4post123xyz",
      "caption": "Amazing AI generated art!",
      "title": "Digital Dreams",
      "mediaUrls": ["https://res.cloudinary.com/leelaverse/image/upload/v1733582129/posts/art1.jpg"],
      "thumbnailUrl": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/posts/art1.jpg",
      "aiGenerated": true,
      "category": "image-post",
      "visibility": "public",
      "viewsCount": 245,
      "likesCount": 38,
      "commentsCount": 12,
      "author": {
        "id": "cm4abc123xyz",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/avatars/johndoe.jpg",
        "totalCreations": 26
      },
      "createdAt": "2025-12-07T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

---

### 5. Get Bloops (Video Posts)

Get video posts (bloops) feed.

**Endpoint:** `GET /posts/bloops`  
**Authentication:** Optional  
**Rate Limit:** General rate limit applies

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |

#### Success Response (200 OK)
```json
{
  "success": true,
  "posts": [
    {
      "id": "cm4video123",
      "caption": "Amazing AI generated video!",
      "mediaUrls": ["https://res.cloudinary.com/leelaverse/video/upload/v1733582129/videos/video1.mp4"],
      "category": "video-post",
      "aiGenerated": true,
      "author": {...},
      "viewsCount": 1250,
      "likesCount": 145,
      "commentsCount": 34,
      "createdAt": "2025-12-07T11:00:00.000Z"
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

### 6. Get User Posts

Get posts by a specific user.

**Endpoint:** `GET /posts/user/:userId`  
**Authentication:** Optional  
**Rate Limit:** General rate limit applies

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by category |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |

#### Example
```
GET /posts/user/cm4abc123xyz?category=image-post&page=1&limit=10
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "posts": [
    {
      "id": "cm4post789",
      "caption": "My latest creation",
      "mediaUrls": ["https://res.cloudinary.com/leelaverse/image/upload/v1733582129/posts/creation.jpg"],
      "author": {
        "id": "cm4abc123xyz",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/avatars/johndoe.jpg"
      },
      "createdAt": "2025-12-07T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 26,
    "pages": 3
  }
}
```

---

### 7. Get Single Post

Get details of a single post.

**Endpoint:** `GET /posts/:postId`  
**Authentication:** Optional  
**Rate Limit:** General rate limit applies

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| postId | string | Post ID |

#### Success Response (200 OK)
```json
{
  "success": true,
  "post": {
    "id": "cm4post123xyz",
    "caption": "Amazing landscape",
    "title": "Mountain View",
    "mediaUrls": ["https://res.cloudinary.com/leelaverse/image/upload/v1733582129/posts/mountain.jpg"],
    "thumbnailUrl": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/posts/mountain.jpg",
    "aiGenerated": true,
    "category": "image-post",
    "visibility": "public",
    "tags": ["landscape", "mountains", "nature"],
    "viewsCount": 345,
    "likesCount": 52,
    "commentsCount": 18,
    "author": {
      "id": "cm4abc123xyz",
      "username": "photographer",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/avatars/johndoe.jpg",
      "totalCreations": 45
    },
    "createdAt": "2025-12-07T09:15:00.000Z",
    "updatedAt": "2025-12-07T09:15:00.000Z"
  }
}
```

---

### 8. Get Posts Count

Get total posts count (for debugging).

**Endpoint:** `GET /posts/count`  
**Authentication:** Not required  
**Rate Limit:** General rate limit applies

#### Success Response (200 OK)
```json
{
  "success": true,
  "count": 1523,
  "message": "Total posts count"
}
```

---

### 9. Delete Post

Delete a post (only by the author).

**Endpoint:** `DELETE /posts/:postId`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| postId | string | Post ID to delete |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

#### Error Response - Not Authorized
```json
{
  "success": false,
  "message": "You are not authorized to delete this post"
}
```

---

## Social Interaction Endpoints

### 1. Like Post

Like a post.

**Endpoint:** `POST /posts/:postId/like`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| postId | string | Post ID to like |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Post liked successfully",
  "data": {
    "isLiked": true,
    "likesCount": 53
  }
}
```

---

### 2. Unlike Post

Remove like from a post.

**Endpoint:** `DELETE /posts/:postId/like`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| postId | string | Post ID to unlike |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Post unliked successfully",
  "data": {
    "isLiked": false,
    "likesCount": 52
  }
}
```

---

### 3. Check Like Status

Check if current user has liked a post.

**Endpoint:** `GET /posts/:postId/like-status`  
**Authentication:** Optional  
**Rate Limit:** General rate limit applies

#### Request Headers (Optional)
```
Authorization: Bearer <access_token>
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| postId | string | Post ID |

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likesCount": 52
  }
}
```

#### Response Without Auth
```json
{
  "success": true,
  "data": {
    "isLiked": false,
    "likesCount": 52
  }
}
```

---

### 4. Add Comment

Add a comment to a post.

**Endpoint:** `POST /posts/:postId/comments`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| postId | string | Post ID |

#### Request Body
```json
{
  "text": "This is an amazing post! Love the creativity! 🎨"
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | Yes | Comment text content |

#### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "comment": {
      "id": "cm4comment123",
      "text": "This is an amazing post! Love the creativity! 🎨",
      "author": {
        "id": "cm4abc123xyz",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/avatars/johndoe.jpg"
      },
      "createdAt": "2025-12-07T13:15:29.025Z"
    },
    "commentsCount": 19
  }
}
```

---

### 5. Get Comments

Get comments for a post.

**Endpoint:** `GET /posts/:postId/comments`  
**Authentication:** Not required  
**Rate Limit:** General rate limit applies

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| postId | string | Post ID |

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "cm4comment123",
        "text": "This is an amazing post! Love the creativity! 🎨",
        "author": {
          "id": "cm4abc123xyz",
          "username": "johndoe",
          "firstName": "John",
          "lastName": "Doe",
          "avatar": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/avatars/johndoe.jpg"
        },
        "createdAt": "2025-12-07T13:15:29.025Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 19,
      "pages": 1
    }
  }
}
```

---

### 6. Delete Comment

Delete a comment (only by comment author or post author).

**Endpoint:** `DELETE /posts/:postId/comments/:commentId`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| postId | string | Post ID |
| commentId | string | Comment ID to delete |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Comment deleted successfully",
  "data": {
    "commentsCount": 18
  }
}
```

---

## User Endpoints

### 1. Get Public User Profile

Get public profile of any user.

**Endpoint:** `GET /users/:userId/profile`  
**Authentication:** Optional (for follow status)  
**Rate Limit:** General rate limit applies

#### Request Headers (Optional)
```
Authorization: Bearer <access_token>
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm4abc123xyz",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "bio": "AI enthusiast and digital creator",
      "avatar": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/avatars/johndoe.jpg",
      "coverImage": "https://res.cloudinary.com/leelaverse/image/upload/v1733582129/covers/johndoe.jpg",
      "location": "San Francisco, CA",
      "website": "https://johndoe.com",
      "totalCreations": 45,
      "followersCount": 1250,
      "followingCount": 378,
      "verificationStatus": "verified",
      "isFollowing": false,
      "createdAt": "2025-11-01T00:00:00.000Z"
    }
  }
}
```

---

### 2. Follow User

Follow a user.

**Endpoint:** `POST /users/:userId/follow`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID to follow |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "User followed successfully",
  "data": {
    "isFollowing": true,
    "followersCount": 1251
  }
}
```

---

### 3. Unfollow User

Unfollow a user.

**Endpoint:** `DELETE /users/:userId/follow`  
**Authentication:** Required  
**Rate Limit:** General rate limit applies

#### Request Headers
```
Authorization: Bearer <access_token>
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID to unfollow |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "User unfollowed successfully",
  "data": {
    "isFollowing": false,
    "followersCount": 1250
  }
}
```

---

### 4. Check Follow Status

Check if current user is following another user.

**Endpoint:** `GET /users/:userId/follow-status`  
**Authentication:** Optional  
**Rate Limit:** General rate limit applies

#### Request Headers (Optional)
```
Authorization: Bearer <access_token>
```

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "isFollowing": true
  }
}
```

---

## System Endpoints

### 1. Health Check

Check API health status.

**Endpoint:** `GET /health`  
**Authentication:** Not required  
**Rate Limit:** General rate limit applies

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "leelaah Backend API is running",
  "timestamp": "2025-12-07T13:15:29.025Z",
  "environment": "production"
}
```

---

### 2. Get Debug Logs

Get recent request logs (for debugging).

**Endpoint:** `GET /debug/logs`  
**Authentication:** Not required  
**Rate Limit:** General rate limit applies

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Number of logs to return (default: 50, max: 100) |

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Recent request logs",
  "count": 25,
  "logs": [
    {
      "timestamp": "2025-12-07T13:15:29.025Z",
      "type": "REQUEST",
      "message": "POST /api/auth/login",
      "data": {
        "origin": "https://www.leelaah.com",
        "userAgent": "Mozilla/5.0..."
      }
    }
  ],
  "allowedOrigins": [
    "https://www.leelaah.com",
    "http://localhost:5173"
  ],
  "environment": "production",
  "timestamp": "2025-12-07T13:15:29.025Z"
}
```

---

### 3. Clear Debug Logs

Clear debug logs.

**Endpoint:** `POST /debug/logs/clear`  
**Authentication:** Not required  
**Rate Limit:** General rate limit applies

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Cleared 25 logs",
  "timestamp": "2025-12-07T13:15:29.025Z"
}
```

---

## Appendix

### Post Categories
- `text-post` - Text only posts
- `image-post` - Image only posts
- `image-text-post` - Image with caption
- `video-post` - Video posts
- `mixed-media` - Multiple media types

### Post Visibility Options
- `public` - Visible to everyone
- `followers` - Visible to followers only
- `private` - Visible to author only

### AI Models - Image Generation
- `flux-1-srpo` - FLUX.1 SRPO (default, high quality)
- `flux-schnell` - FLUX Schnell (fast generation)

### Aspect Ratios
- `1:1` - Square (1024x1024)
- `4:3` - Portrait 4:3
- `16:9` - Landscape 16:9 (1024x576)
- `9:16` - Portrait 16:9 (576x1024)
- `3:4` - Portrait 3:4

### Common Error Messages
| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid or expired token" | Access token expired or invalid | Refresh token or login again |
| "User not found" | User ID doesn't exist | Verify user ID |
| "Post not found" | Post ID doesn't exist | Verify post ID |
| "You are not authorized" | Insufficient permissions | Use correct user account |
| "Validation failed" | Invalid input data | Check request body format |
| "Too many requests" | Rate limit exceeded | Wait and retry |

---

## Contact & Support

For API support and issues, please contact:
- **Email**: support@leelaah.com
- **Documentation**: https://backend.leelaah.com/api
- **Version**: 1.0.0
- **Last Updated**: December 7, 2025

---

*This documentation covers all available endpoints in the Leelaverse API. For the latest updates, please refer to the official API documentation.*
