# Leelaverse API Documentation

## Base URL
```
https://backend.leelaah.com
```

For development environment:
```
http://localhost:3000
```

---

## Table of Contents
1. [Authentication Overview](#authentication-overview)
2. [Public Endpoints](#public-endpoints)
   - [Health Check](#1-health-check)
   - [Root Endpoint](#2-root-endpoint)
   - [Debug Logs](#3-debug-logs)
   - [Clear Debug Logs](#4-clear-debug-logs)
   - [Register User](#5-register-user)
   - [Login User](#6-login-user)
   - [Refresh Token](#7-refresh-token)
   - [Forgot Password](#8-forgot-password)
   - [Reset Password](#9-reset-password)
3. [Protected Endpoints](#protected-endpoints)
   - [Logout](#10-logout)
   - [Logout All Devices](#11-logout-all-devices)
   - [Get User Profile](#12-get-user-profile)
   - [Update User Profile](#13-update-user-profile)
   - [Change Password](#14-change-password)
4. [Error Handling](#error-handling)
5. [Rate Limits](#rate-limits)
6. [Code Examples](#code-examples)

---

## Authentication Overview

The API uses JWT (JSON Web Token) based authentication with two types of tokens:

- **Access Token**: Short-lived token (15 minutes) used for API requests
- **Refresh Token**: Long-lived token (7 days) used to obtain new access tokens

### Authentication Flow

1. **Register/Login**: Receive both access token and refresh token
2. **API Requests**: Include access token in the `Authorization` header
3. **Token Refresh**: Use refresh token to get new access token when it expires
4. **Logout**: Invalidate refresh tokens

### Using Access Tokens

Include the access token in the Authorization header for protected endpoints:

```
Authorization: Bearer <access_token>
```

---

## Public Endpoints

These endpoints do not require authentication.

---

### 1. Health Check

Check if the API server is running and healthy.

**Endpoint**: `GET /api/health`

**Rate Limit**: 100 requests per 15 minutes

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Leelaverse Backend API is running",
  "timestamp": "2024-01-15T12:30:00.000Z",
  "environment": "production"
}
```

**Example Request**:
```bash
curl -X GET https://backend.leelaah.com/api/health
```

---

### 2. Root Endpoint

Get API information and available endpoints.

**Endpoint**: `GET /`

**Rate Limit**: 100 requests per 15 minutes

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Welcome to Leelaverse Backend API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "logs": "/api/debug/logs",
    "logsViewer": "/public/logs.html",
    "documentation": "See README.md for full API documentation"
  },
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Example Request**:
```bash
curl -X GET https://backend.leelaah.com/
```

---

### 3. Debug Logs

Retrieve recent API request logs for debugging purposes.

**Endpoint**: `GET /api/debug/logs`

**Rate Limit**: 100 requests per 15 minutes

**Request Headers**:
```
Content-Type: application/json
```

**Query Parameters**:
- `limit` (optional): Number of logs to retrieve (default: 50, max: 100)

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Recent request logs",
  "count": 50,
  "logs": [
    {
      "timestamp": "2024-01-15T12:30:00.000Z",
      "type": "REQUEST",
      "message": "POST /api/auth/login",
      "data": {
        "origin": "https://www.leelaaverse.com",
        "referer": "https://www.leelaaverse.com/login",
        "userAgent": "Mozilla/5.0...",
        "contentType": "application/json",
        "authorization": "Present"
      }
    }
  ],
  "allowedOrigins": [
    "https://www.leelaaverse.com",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173"
  ],
  "environment": "production",
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Example Request**:
```bash
curl -X GET "https://backend.leelaah.com/api/debug/logs?limit=20"
```

---

### 4. Clear Debug Logs

Clear all stored debug logs.

**Endpoint**: `POST /api/debug/logs/clear`

**Rate Limit**: 100 requests per 15 minutes

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Cleared 150 logs",
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Example Request**:
```bash
curl -X POST https://backend.leelaah.com/api/debug/logs/clear
```

---

### 5. Register User

Create a new user account.

**Endpoint**: `POST /api/auth/register`

**Rate Limit**: 3 requests per hour per IP

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Request Body Parameters**:

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `username` | string | Yes | 3-30 characters, alphanumeric with underscores and hyphens only | Unique username for the account |
| `email` | string | Yes | Valid email format | Unique email address |
| `password` | string | Yes | Min 8 characters, must contain uppercase, lowercase, number, and special character (@$!%*?&) | Account password |
| `firstName` | string | No | 1-50 characters | User's first name |
| `lastName` | string | No | 1-50 characters | User's last name |

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true,
      "isEmailVerified": false,
      "totalCreations": 0,
      "totalEarnings": 0,
      "followers": [],
      "following": [],
      "isBanned": false,
      "createdAt": "2024-01-15T12:30:00.000Z",
      "updatedAt": "2024-01-15T12:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:

- **400 Bad Request** - Validation Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

- **400 Bad Request** - Email Already Exists:
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

- **400 Bad Request** - Username Taken:
```json
{
  "success": false,
  "message": "Username is already taken"
}
```

**Example Request**:
```bash
curl -X POST https://backend.leelaah.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

---

### 6. Login User

Authenticate a user and receive access tokens.

**Endpoint**: `POST /api/auth/login`

**Rate Limit**: 5 requests per 15 minutes per IP

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Request Body Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | User's email address |
| `password` | string | Yes | User's password |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true,
      "lastLogin": "2024-01-15T12:30:00.000Z",
      "lastActiveAt": "2024-01-15T12:30:00.000Z",
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-15T12:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:

- **401 Unauthorized** - Invalid Credentials:
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

- **423 Locked** - Account Locked:
```json
{
  "success": false,
  "message": "Account is locked. Try again in 25 minutes."
}
```

- **403 Forbidden** - Account Banned:
```json
{
  "success": false,
  "message": "Account is banned until Mon Jan 20 2024"
}
```

**Example Request**:
```bash
curl -X POST https://backend.leelaah.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

**Notes**:
- After 5 failed login attempts, the account will be locked for 30 minutes
- Failed attempts counter is reset upon successful login

---

### 7. Refresh Token

Get a new access token using a valid refresh token.

**Endpoint**: `POST /api/auth/refresh-token`

**Rate Limit**: 100 requests per 15 minutes

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `refreshToken` | string | Yes | Valid refresh token received during login/registration |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:

- **401 Unauthorized** - Invalid Token:
```json
{
  "success": false,
  "message": "Invalid refresh token"
}
```

- **401 Unauthorized** - Expired Token:
```json
{
  "success": false,
  "message": "Refresh token expired"
}
```

**Example Request**:
```bash
curl -X POST https://backend.leelaah.com/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Notes**:
- The old refresh token is invalidated when a new one is issued
- Users can have up to 5 active refresh tokens (different devices)

---

### 8. Forgot Password

Request a password reset token to be sent to user's email.

**Endpoint**: `POST /api/auth/forgot-password`

**Rate Limit**: 3 requests per hour per IP

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "john.doe@example.com"
}
```

**Request Body Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | Email address of the account |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email.",
  "resetToken": "a1b2c3d4e5f6..." 
}
```

**Notes**:
- For security reasons, the same success message is returned even if the email doesn't exist
- The reset token is valid for 10 minutes
- ⚠️ **SECURITY WARNING**: In production, the `resetToken` field MUST be removed from the response and only sent via email. Currently, the token is returned in the response for development/testing purposes only. This is a security risk and should never be deployed to production.

**Example Request**:
```bash
curl -X POST https://backend.leelaah.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

---

### 9. Reset Password

Reset user password using the reset token.

**Endpoint**: `POST /api/auth/reset-password`

**Rate Limit**: 100 requests per 15 minutes

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "token": "a1b2c3d4e5f6...",
  "password": "NewSecurePass123!"
}
```

**Request Body Parameters**:

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `token` | string | Yes | - | Reset token received from forgot-password endpoint |
| `password` | string | Yes | Min 8 characters, must contain uppercase, lowercase, number, and special character | New password for the account |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please log in with your new password."
}
```

**Error Responses**:

- **400 Bad Request** - Invalid or Expired Token:
```json
{
  "success": false,
  "message": "Token is invalid or has expired"
}
```

**Example Request**:
```bash
curl -X POST https://backend.leelaah.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "a1b2c3d4e5f6...",
    "password": "NewSecurePass123!"
  }'
```

**Notes**:
- All active refresh tokens are invalidated after password reset (user must login again on all devices)
- Reset tokens expire after 10 minutes

---

## Protected Endpoints

These endpoints require authentication. Include the access token in the Authorization header.

**Authorization Header**:
```
Authorization: Bearer <access_token>
```

---

### 10. Logout

Logout user from current device or all devices.

**Endpoint**: `POST /api/auth/logout`

**Rate Limit**: 100 requests per 15 minutes

**Authentication**: Required

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `refreshToken` | string | No | Specific refresh token to invalidate. If omitted, all refresh tokens are removed |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Example Request**:
```bash
curl -X POST https://backend.leelaah.com/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Notes**:
- If `refreshToken` is provided, only that specific token is invalidated
- If `refreshToken` is not provided, all refresh tokens are removed (logout from all devices)

---

### 11. Logout All Devices

Logout user from all devices by invalidating all refresh tokens.

**Endpoint**: `POST /api/auth/logout-all`

**Rate Limit**: 100 requests per 15 minutes

**Authentication**: Required

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

**Example Request**:
```bash
curl -X POST https://backend.leelaah.com/api/auth/logout-all \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 12. Get User Profile

Retrieve the current user's profile information.

**Endpoint**: `GET /api/auth/profile`

**Rate Limit**: 100 requests per 15 minutes

**Authentication**: Required

**Request Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "role": "user",
      "avatar": null,
      "isActive": true,
      "isEmailVerified": false,
      "bio": "Software developer passionate about AI",
      "location": "San Francisco, CA",
      "website": "https://johndoe.com",
      "socialLinks": {
        "twitter": "https://twitter.com/johndoe",
        "linkedin": "https://linkedin.com/in/johndoe",
        "github": "https://github.com/johndoe"
      },
      "totalCreations": 42,
      "totalEarnings": 1250.50,
      "followers": [],
      "following": [],
      "followerCount": 0,
      "followingCount": 0,
      "isBanned": false,
      "lastLogin": "2024-01-15T12:30:00.000Z",
      "lastActiveAt": "2024-01-15T12:35:00.000Z",
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-15T12:35:00.000Z"
    }
  }
}
```

**Example Request**:
```bash
curl -X GET https://backend.leelaah.com/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Notes**:
- The `lastActiveAt` timestamp is updated on each profile access
- Password and refresh tokens are never included in the response

---

### 13. Update User Profile

Update the current user's profile information.

**Endpoint**: `PUT /api/auth/profile`

**Rate Limit**: 100 requests per 15 minutes

**Authentication**: Required

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Full-stack developer and AI enthusiast",
  "location": "San Francisco, CA",
  "website": "https://johndoe.com",
  "socialLinks": {
    "twitter": "https://twitter.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe"
  }
}
```

**Request Body Parameters**:

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `firstName` | string | No | 1-50 characters | User's first name |
| `lastName` | string | No | 1-50 characters | User's last name |
| `bio` | string | No | Max 500 characters | User biography |
| `location` | string | No | Max 100 characters | User location |
| `website` | string | No | Valid URL | User's website |
| `socialLinks` | object | No | - | Social media profile links |
| `socialLinks.twitter` | string | No | Valid Twitter URL format | Twitter profile URL |
| `socialLinks.linkedin` | string | No | Valid LinkedIn URL format | LinkedIn profile URL |
| `socialLinks.github` | string | No | Valid GitHub URL format | GitHub profile URL |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "bio": "Full-stack developer and AI enthusiast",
      "location": "San Francisco, CA",
      "website": "https://johndoe.com",
      "socialLinks": {
        "twitter": "https://twitter.com/johndoe",
        "linkedin": "https://linkedin.com/in/johndoe",
        "github": "https://github.com/johndoe"
      },
      "role": "user",
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-15T12:40:00.000Z"
    }
  }
}
```

**Error Responses**:

- **400 Bad Request** - Validation Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "website",
      "message": "Website must be a valid URL",
      "value": "not-a-url"
    }
  ]
}
```

**Example Request**:
```bash
curl -X PUT https://backend.leelaah.com/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Full-stack developer and AI enthusiast",
    "location": "San Francisco, CA"
  }'
```

**Notes**:
- Only provided fields will be updated; omitted fields remain unchanged
- Username and email cannot be changed through this endpoint

---

### 14. Change Password

Change the current user's password.

**Endpoint**: `PUT /api/auth/change-password`

**Rate Limit**: 100 requests per 15 minutes

**Authentication**: Required

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Request Body Parameters**:

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `currentPassword` | string | Yes | - | Current password for verification |
| `newPassword` | string | Yes | Min 8 characters, must contain uppercase, lowercase, number, and special character | New password |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully. Please log in again."
}
```

**Error Responses**:

- **400 Bad Request** - Incorrect Current Password:
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

- **400 Bad Request** - Validation Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "newPassword",
      "message": "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "value": "weakpassword"
    }
  ]
}
```

**Example Request**:
```bash
curl -X PUT https://backend.leelaah.com/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!"
  }'
```

**Notes**:
- All refresh tokens are invalidated after password change (user must login again on all devices)
- User will need to login again with the new password

---

## Error Handling

### Common Error Responses

All error responses follow a consistent structure:

```json
{
  "success": false,
  "message": "Error description",
  "errors": []  // Optional array of detailed errors
}
```

### HTTP Status Codes

| Code | Description | Common Scenarios |
|------|-------------|------------------|
| 200 | OK | Successful GET, PUT, DELETE requests |
| 201 | Created | Successful resource creation (e.g., registration) |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions, banned account |
| 404 | Not Found | Endpoint or resource not found |
| 423 | Locked | Account locked due to failed login attempts |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side errors |

### Error Types

#### 1. Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

#### 2. Authentication Errors (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

```json
{
  "success": false,
  "message": "Token expired."
}
```

#### 3. Authorization Errors (403)
```json
{
  "success": false,
  "message": "Account is permanently banned."
}
```

#### 4. Rate Limit Errors (429)
```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

#### 5. Not Found Errors (404)
```json
{
  "success": false,
  "message": "Endpoint not found",
  "path": "/api/invalid/endpoint"
}
```

#### 6. Server Errors (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limits

The API implements rate limiting to prevent abuse and ensure fair usage.

### Rate Limit Configuration

| Endpoint Category | Limit | Window | Description |
|------------------|-------|--------|-------------|
| General API | 100 requests | 15 minutes | Default limit for most endpoints |
| Authentication | 5 requests | 15 minutes | Login endpoint |
| Account Creation | 3 requests | 1 hour | Registration endpoint |
| Password Reset | 3 requests | 1 hour | Forgot password endpoint |

### Rate Limit Headers

Each response includes rate limit information in the headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000000
```

### Rate Limit Error Response (429)

When rate limit is exceeded:

```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

---

## Code Examples

⚠️ **SECURITY WARNING**: The following JavaScript examples use `localStorage` for demonstration purposes only. In production applications, consider using:
- **HTTP-only cookies** (recommended for web applications)
- **Secure session storage** with encryption
- **Memory-based storage** for sensitive tokens

Never store tokens in localStorage in production as they are vulnerable to XSS attacks.

### JavaScript (Fetch API)

#### Register User
```javascript
const registerUser = async (userData) => {
  try {
    const response = await fetch('https://backend.leelaah.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store tokens
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      console.log('User registered:', data.data.user);
    } else {
      console.error('Registration failed:', data.message);
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage
registerUser({
  username: 'johndoe',
  email: 'john.doe@example.com',
  password: 'SecurePass123!',
  firstName: 'John',
  lastName: 'Doe'
});
```

#### Login User
```javascript
const loginUser = async (email, password) => {
  try {
    const response = await fetch('https://backend.leelaah.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      console.log('Login successful:', data.data.user);
    } else {
      console.error('Login failed:', data.message);
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage
loginUser('john.doe@example.com', 'SecurePass123!');
```

#### Get User Profile (Protected)
```javascript
const getUserProfile = async () => {
  const accessToken = localStorage.getItem('accessToken');
  
  try {
    const response = await fetch('https://backend.leelaah.com/api/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('User profile:', data.data.user);
    } else {
      console.error('Failed to fetch profile:', data.message);
      
      // Token might be expired, try refreshing
      if (response.status === 401) {
        await refreshAccessToken();
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage
getUserProfile();
```

#### Refresh Access Token
```javascript
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  try {
    const response = await fetch('https://backend.leelaah.com/api/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      console.log('Token refreshed successfully');
    } else {
      console.error('Token refresh failed:', data.message);
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Update Profile
```javascript
const updateProfile = async (profileData) => {
  const accessToken = localStorage.getItem('accessToken');
  
  try {
    const response = await fetch('https://backend.leelaah.com/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(profileData),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Profile updated:', data.data.user);
    } else {
      console.error('Update failed:', data.message);
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage
updateProfile({
  firstName: 'John',
  lastName: 'Doe',
  bio: 'Full-stack developer',
  location: 'San Francisco, CA'
});
```

### Python (Requests Library)

#### Register User
```python
import requests

def register_user(user_data):
    url = 'https://backend.leelaah.com/api/auth/register'
    headers = {'Content-Type': 'application/json'}
    
    response = requests.post(url, json=user_data, headers=headers)
    data = response.json()
    
    if data['success']:
        access_token = data['data']['accessToken']
        refresh_token = data['data']['refreshToken']
        print(f"User registered: {data['data']['user']['username']}")
        return access_token, refresh_token
    else:
        print(f"Registration failed: {data['message']}")
        return None, None

# Usage
user_data = {
    'username': 'johndoe',
    'email': 'john.doe@example.com',
    'password': 'SecurePass123!',
    'firstName': 'John',
    'lastName': 'Doe'
}
access_token, refresh_token = register_user(user_data)
```

#### Login User
```python
import requests

def login_user(email, password):
    url = 'https://backend.leelaah.com/api/auth/login'
    headers = {'Content-Type': 'application/json'}
    data = {'email': email, 'password': password}
    
    response = requests.post(url, json=data, headers=headers)
    result = response.json()
    
    if result['success']:
        return result['data']['accessToken'], result['data']['refreshToken']
    else:
        print(f"Login failed: {result['message']}")
        return None, None

# Usage
access_token, refresh_token = login_user('john.doe@example.com', 'SecurePass123!')
```

#### Get User Profile (Protected)
```python
import requests

def get_user_profile(access_token):
    url = 'https://backend.leelaah.com/api/auth/profile'
    headers = {'Authorization': f'Bearer {access_token}'}
    
    response = requests.get(url, headers=headers)
    data = response.json()
    
    if data['success']:
        print(f"User profile: {data['data']['user']}")
        return data['data']['user']
    else:
        print(f"Failed to fetch profile: {data['message']}")
        return None

# Usage
user_profile = get_user_profile(access_token)
```

### cURL Examples

#### Register User
```bash
curl -X POST https://backend.leelaah.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Login User
```bash
curl -X POST https://backend.leelaah.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

#### Get User Profile
```bash
curl -X GET https://backend.leelaah.com/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Update Profile
```bash
curl -X PUT https://backend.leelaah.com/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Software developer",
    "location": "San Francisco, CA"
  }'
```

#### Change Password
```bash
curl -X PUT https://backend.leelaah.com/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!"
  }'
```

#### Refresh Token
```bash
curl -X POST https://backend.leelaah.com/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

#### Logout
```bash
curl -X POST https://backend.leelaah.com/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Additional Information

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

Example valid passwords:
- `SecurePass123!`
- `MyP@ssw0rd`
- `Test123!@#`

### Username Requirements

- 3-30 characters
- Only alphanumeric characters, underscores, and hyphens
- Case-sensitive
- Must be unique

Example valid usernames:
- `johndoe`
- `john_doe`
- `john-doe-123`

### Token Expiration

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days
- **Password Reset Token**: 10 minutes

### Security Best Practices

⚠️ **CRITICAL SECURITY GUIDELINES**:

1. **Never store tokens in localStorage in production** - Use secure HTTP-only cookies instead to prevent XSS attacks
2. **Always use HTTPS** in production - Never transmit tokens over unencrypted connections
3. **Implement token refresh** before access token expires to maintain seamless user experience
4. **Clear tokens on logout** to prevent unauthorized access
5. **Handle 401 errors** by refreshing token or redirecting to login
6. **Don't expose sensitive information** in error messages or API responses
7. **Validate environment variables** - Ensure NODE_ENV is set to "production" in production
8. **Remove development features** - Disable reset token exposure and permissive CORS in production
9. **Use strong secrets** - Ensure JWT_SECRET and JWT_REFRESH_SECRET are cryptographically strong
10. **Enable rate limiting** - Keep rate limits enabled to prevent abuse

### CORS Policy

The API allows requests from the following origins:
- `https://www.leelaaverse.com`
- `http://localhost:5173`
- `http://localhost:3000`
- `http://127.0.0.1:5173`

⚠️ **SECURITY WARNING**: For development purposes, all origins are allowed when `NODE_ENV=development`. **Never deploy to production with NODE_ENV=development** as this disables CORS protection and creates a significant security vulnerability. Always ensure NODE_ENV is set to "production" in production environments.

### Account Security Features

1. **Account Lockout**: After 5 failed login attempts, the account is locked for 30 minutes
2. **Token Rotation**: Refresh tokens are rotated on each use
3. **Token Limit**: Maximum of 5 active refresh tokens per user (one per device)
4. **Password Reset**: Tokens expire after 10 minutes
5. **Force Logout**: Password changes invalidate all refresh tokens

---

## Postman Collection

We provide a complete Postman collection for testing the API:

**[Download Postman Collection](./Leelaverse_API_Collection.postman_collection.json)**

### How to Use

1. **Import the Collection**:
   - Open Postman
   - Click "Import" button
   - Select the `Leelaverse_API_Collection.postman_collection.json` file
   - The collection will be imported with all endpoints pre-configured

2. **Configure Environment Variables**:
   - The collection uses variables for `baseUrl`, `accessToken`, and `refreshToken`
   - Base URL is pre-configured as `https://backend.leelaah.com`
   - Tokens are automatically saved after login/register

3. **Test the API**:
   - Start with "Register User" or "Login User" endpoints
   - Tokens are automatically captured and used in protected endpoints
   - All endpoints include sample request bodies

### Collection Features

- Pre-configured base URL
- Automatic token management
- Sample request bodies for all endpoints
- Organized by endpoint categories
- Test scripts to save tokens automatically

---

## Support & Contact

For API support, issues, or questions:
- Email: support@leelaah.com
- Documentation: https://backend.leelaah.com/
- GitHub Issues: Create an issue in the repository

---

**API Version**: 1.0.0  
**Last Updated**: January 2024  
**Base URL**: https://backend.leelaah.com
