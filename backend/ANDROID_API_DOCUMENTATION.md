# Leelaverse API Documentation for Android Developers

## Table of Contents
1. [Overview](#overview)
2. [Base Configuration](#base-configuration)
3. [Authentication Flow](#authentication-flow)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Android Integration Examples](#android-integration-examples)
9. [Security Best Practices](#security-best-practices)

---

## Overview

The Leelaverse API is a RESTful API built with Node.js/Express that provides comprehensive user authentication and profile management. This documentation is specifically tailored for Android developers integrating with the Leelaverse backend.

### Key Features
- JWT-based authentication with access and refresh tokens
- User registration and login
- Profile management
- Password reset functionality
- Role-based access control
- Comprehensive security features

### API Version
Current Version: **v1.0**

### Content Type
All requests and responses use `application/json`

---

## Base Configuration

### Base URLs

**Production:**
```
https://www.leelaaverse.com
```

**Development/Testing:**
```
http://localhost:3000
```

### Base API Path
All endpoints are prefixed with `/api`

---

## Authentication Flow

### Overview
The API uses JWT (JSON Web Token) authentication with two types of tokens:

1. **Access Token** - Short-lived (15 minutes), used for API requests
2. **Refresh Token** - Long-lived (7 days), used to obtain new access tokens

### Token Management Flow

```
1. User logs in → Receives access token + refresh token
2. Store both tokens securely
3. Include access token in Authorization header for API requests
4. When access token expires → Use refresh token to get new access token
5. On logout → Invalidate refresh token
```

### Storing Tokens in Android
```kotlin
// Use EncryptedSharedPreferences for secure storage
val sharedPreferences = EncryptedSharedPreferences.create(
    context,
    "leelaverse_prefs",
    MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build(),
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)

// Store tokens
sharedPreferences.edit()
    .putString("access_token", accessToken)
    .putString("refresh_token", refreshToken)
    .apply()
```

---

## API Endpoints

### 1. Health Check

Check if the API is running and accessible.

**Endpoint:** `GET /api/health`

**Authentication:** Not required

**Request Headers:**
```
Content-Type: application/json
```

**Request Payload:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Leelaverse Backend API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

**Android Example (Retrofit):**
```kotlin
@GET("api/health")
suspend fun checkHealth(): Response<HealthResponse>

data class HealthResponse(
    val success: Boolean,
    val message: String,
    val timestamp: String,
    val environment: String
)
```

---

### 2. User Registration

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Authentication:** Not required

**Rate Limit:** 3 requests per hour per IP

**Request Headers:**
```
Content-Type: application/json
```

**Request Payload:**
```json
{
  "username": "string",        // Required, 3-30 chars, alphanumeric + underscore/hyphen
  "email": "string",           // Required, valid email format
  "password": "string",        // Required, min 8 chars, must contain uppercase, lowercase, number, special char
  "firstName": "string",       // Optional, 1-50 chars
  "lastName": "string"         // Optional, 1-50 chars
}
```

**Field Validation Rules:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| username | String | Yes | 3-30 characters, only letters, numbers, underscores, hyphens |
| email | String | Yes | Valid email format |
| password | String | Yes | Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char (@$!%*?&) |
| firstName | String | No | 1-50 characters |
| lastName | String | No | 1-50 characters |

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true,
      "isEmailVerified": false,
      "avatar": null,
      "bio": null,
      "location": null,
      "website": null,
      "socialLinks": {
        "twitter": null,
        "instagram": null,
        "linkedin": null,
        "discord": null
      },
      "totalCreations": 0,
      "totalEarnings": 0,
      "followers": [],
      "following": [],
      "isBanned": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "fullName": "John Doe",
      "followerCount": 0,
      "followingCount": 0
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "User with this email already exists",
      "value": "john@example.com"
    }
  ]
}
```

**Possible Error Messages:**
- "User with this email already exists"
- "Username is already taken"
- "Validation failed" (with detailed errors array)
- "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"

**Android Data Models:**
```kotlin
// Request
data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String,
    val firstName: String? = null,
    val lastName: String? = null
)

// Response
data class RegisterResponse(
    val success: Boolean,
    val message: String,
    val data: AuthData?
)

data class AuthData(
    val user: User,
    val accessToken: String,
    val refreshToken: String
)

data class User(
    @SerializedName("_id")
    val id: String,
    val username: String,
    val email: String,
    val firstName: String?,
    val lastName: String?,
    val role: String,
    val isActive: Boolean,
    val isEmailVerified: Boolean,
    val avatar: String?,
    val bio: String?,
    val location: String?,
    val website: String?,
    val socialLinks: SocialLinks?,
    val totalCreations: Int,
    val totalEarnings: Double,
    val followers: List<String>,
    val following: List<String>,
    val isBanned: Boolean,
    val createdAt: String,
    val updatedAt: String,
    val fullName: String?,
    val followerCount: Int,
    val followingCount: Int
)

data class SocialLinks(
    val twitter: String?,
    val instagram: String?,
    val linkedin: String?,
    val discord: String?
)
```

**Retrofit Interface:**
```kotlin
@POST("api/auth/register")
suspend fun register(@Body request: RegisterRequest): Response<RegisterResponse>
```

---

### 3. User Login

Authenticate a user and receive tokens.

**Endpoint:** `POST /api/auth/login`

**Authentication:** Not required

**Rate Limit:** 5 requests per 15 minutes per IP

**Request Headers:**
```
Content-Type: application/json
```

**Request Payload:**
```json
{
  "email": "string",       // Required, valid email format
  "password": "string"     // Required
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| email | String | Yes | Valid email format |
| password | String | Yes | Any non-empty string |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true,
      "isEmailVerified": false,
      "avatar": null,
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "totalCreations": 5,
      "totalEarnings": 150.50,
      "followers": [],
      "following": [],
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "fullName": "John Doe",
      "followerCount": 10,
      "followingCount": 25
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

**401 Unauthorized - Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**423 Locked - Account Locked:**
```json
{
  "success": false,
  "message": "Account is locked. Try again in 25 minutes."
}
```

**403 Forbidden - Account Banned:**
```json
{
  "success": false,
  "message": "Account is banned until Mon Jan 20 2024"
}
```

**Security Features:**
- Account locks after 5 failed login attempts for 30 minutes
- Login attempts are tracked per user
- Failed attempts increment counter
- Successful login resets counter

**Android Data Models:**
```kotlin
data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val success: Boolean,
    val message: String,
    val data: AuthData?
)
```

**Retrofit Interface:**
```kotlin
@POST("api/auth/login")
suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
```

---

### 4. Refresh Access Token

Obtain a new access token using a valid refresh token.

**Endpoint:** `POST /api/auth/refresh-token`

**Authentication:** Requires valid refresh token in request body

**Rate Limit:** General rate limit applies

**Request Headers:**
```
Content-Type: application/json
```

**Request Payload:**
```json
{
  "refreshToken": "string"   // Required, valid refresh token
}
```

**Success Response (200 OK):**
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

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

**Important Notes:**
- Old refresh token is invalidated when new tokens are issued
- Always store the new refresh token
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Maximum 5 refresh tokens per user (keeps most recent)

**Android Data Models:**
```kotlin
data class RefreshTokenRequest(
    val refreshToken: String
)

data class RefreshTokenResponse(
    val success: Boolean,
    val message: String,
    val data: TokenData?
)

data class TokenData(
    val accessToken: String,
    val refreshToken: String
)
```

**Retrofit Interface:**
```kotlin
@POST("api/auth/refresh-token")
suspend fun refreshToken(@Body request: RefreshTokenRequest): Response<RefreshTokenResponse>
```

---

### 5. Get User Profile

Retrieve the currently authenticated user's profile.

**Endpoint:** `GET /api/auth/profile`

**Authentication:** Required (Bearer token)

**Rate Limit:** General rate limit applies

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Payload:** None

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true,
      "isEmailVerified": false,
      "avatar": null,
      "bio": "Software developer and AI enthusiast",
      "location": "San Francisco, CA",
      "website": "https://johndoe.com",
      "socialLinks": {
        "twitter": "https://twitter.com/johndoe",
        "instagram": null,
        "linkedin": "https://linkedin.com/in/johndoe",
        "discord": "johndoe#1234"
      },
      "totalCreations": 15,
      "totalEarnings": 450.75,
      "followers": ["507f1f77bcf86cd799439012"],
      "following": ["507f1f77bcf86cd799439014"],
      "isBanned": false,
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "fullName": "John Doe",
      "followerCount": 2,
      "followingCount": 1
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

**Android Data Models:**
```kotlin
data class ProfileResponse(
    val success: Boolean,
    val data: ProfileData?
)

data class ProfileData(
    val user: User
)
```

**Retrofit Interface:**
```kotlin
@GET("api/auth/profile")
suspend fun getProfile(
    @Header("Authorization") token: String
): Response<ProfileResponse>

// Usage
val response = apiService.getProfile("Bearer $accessToken")
```

---

### 6. Update User Profile

Update the authenticated user's profile information.

**Endpoint:** `PUT /api/auth/profile`

**Authentication:** Required (Bearer token)

**Rate Limit:** General rate limit applies

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Payload:**
All fields are optional. Only send fields you want to update.

```json
{
  "firstName": "string",           // Optional, 1-50 chars
  "lastName": "string",            // Optional, 1-50 chars
  "bio": "string",                 // Optional, max 500 chars
  "location": "string",            // Optional, max 100 chars
  "website": "string",             // Optional, valid URL
  "socialLinks": {                 // Optional, all nested fields optional
    "twitter": "string",           // Optional, valid Twitter URL
    "instagram": "string",         // Optional
    "linkedin": "string",          // Optional, valid LinkedIn URL
    "discord": "string"            // Optional
  }
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| firstName | String | No | 1-50 characters |
| lastName | String | No | 1-50 characters |
| bio | String | No | Max 500 characters |
| location | String | No | Max 100 characters |
| website | String | No | Valid URL format |
| socialLinks.twitter | String | No | Valid Twitter URL |
| socialLinks.linkedin | String | No | Valid LinkedIn URL |
| socialLinks.instagram | String | No | Any string |
| socialLinks.discord | String | No | Any string |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "bio": "Updated bio text",
      "location": "New York, NY",
      "website": "https://johndoe.com",
      "socialLinks": {
        "twitter": "https://twitter.com/johndoe",
        "instagram": null,
        "linkedin": "https://linkedin.com/in/johndoe",
        "discord": "johndoe#1234"
      },
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

**Android Data Models:**
```kotlin
data class UpdateProfileRequest(
    val firstName: String? = null,
    val lastName: String? = null,
    val bio: String? = null,
    val location: String? = null,
    val website: String? = null,
    val socialLinks: SocialLinksUpdate? = null
)

data class SocialLinksUpdate(
    val twitter: String? = null,
    val instagram: String? = null,
    val linkedin: String? = null,
    val discord: String? = null
)

data class UpdateProfileResponse(
    val success: Boolean,
    val message: String,
    val data: ProfileData?
)
```

**Retrofit Interface:**
```kotlin
@PUT("api/auth/profile")
suspend fun updateProfile(
    @Header("Authorization") token: String,
    @Body request: UpdateProfileRequest
): Response<UpdateProfileResponse>
```

---

### 7. Change Password

Change the authenticated user's password.

**Endpoint:** `PUT /api/auth/change-password`

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Payload:**
```json
{
  "currentPassword": "string",    // Required, current password
  "newPassword": "string"         // Required, must meet password requirements
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| currentPassword | String | Yes | Any non-empty string |
| newPassword | String | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully. Please log in again."
}
```

**Important Notes:**
- All refresh tokens are invalidated when password is changed
- User must log in again after password change

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**Android Data Models:**
```kotlin
data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String
)

data class ChangePasswordResponse(
    val success: Boolean,
    val message: String
)
```

**Retrofit Interface:**
```kotlin
@PUT("api/auth/change-password")
suspend fun changePassword(
    @Header("Authorization") token: String,
    @Body request: ChangePasswordRequest
): Response<ChangePasswordResponse>
```

---

### 8. Logout

Logout the user from the current device.

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Payload:**
```json
{
  "refreshToken": "string"   // Optional, if provided, only this token is removed
}
```

**Behavior:**
- If `refreshToken` is provided: Removes only that specific refresh token
- If `refreshToken` is not provided: Removes all refresh tokens (logout from all devices)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Android Data Models:**
```kotlin
data class LogoutRequest(
    val refreshToken: String? = null
)

data class LogoutResponse(
    val success: Boolean,
    val message: String
)
```

**Retrofit Interface:**
```kotlin
@POST("api/auth/logout")
suspend fun logout(
    @Header("Authorization") token: String,
    @Body request: LogoutRequest? = null
): Response<LogoutResponse>
```

---

### 9. Logout from All Devices

Logout the user from all devices by invalidating all refresh tokens.

**Endpoint:** `POST /api/auth/logout-all`

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Payload:** None

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

**Android Data Models:**
```kotlin
data class LogoutAllResponse(
    val success: Boolean,
    val message: String
)
```

**Retrofit Interface:**
```kotlin
@POST("api/auth/logout-all")
suspend fun logoutAll(
    @Header("Authorization") token: String
): Response<LogoutAllResponse>
```

---

### 10. Forgot Password (Request Reset)

Request a password reset token.

**Endpoint:** `POST /api/auth/forgot-password`

**Authentication:** Not required

**Rate Limit:** 3 requests per hour per IP

**Request Headers:**
```
Content-Type: application/json
```

**Request Payload:**
```json
{
  "email": "string"   // Required, valid email format
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email.",
  "resetToken": "a1b2c3d4e5f6..."  // Only in development
}
```

**Important Notes:**
- Always returns success message even if email doesn't exist (security best practice)
- Reset token is valid for 10 minutes
- In production, `resetToken` field is not returned (sent via email)

**Android Data Models:**
```kotlin
data class ForgotPasswordRequest(
    val email: String
)

data class ForgotPasswordResponse(
    val success: Boolean,
    val message: String,
    val resetToken: String? = null
)
```

**Retrofit Interface:**
```kotlin
@POST("api/auth/forgot-password")
suspend fun forgotPassword(
    @Body request: ForgotPasswordRequest
): Response<ForgotPasswordResponse>
```

---

### 11. Reset Password

Reset user password using the token received.

**Endpoint:** `POST /api/auth/reset-password`

**Authentication:** Not required

**Request Headers:**
```
Content-Type: application/json
```

**Request Payload:**
```json
{
  "token": "string",        // Required, token from email
  "password": "string"      // Required, must meet password requirements
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| token | String | Yes | Valid reset token |
| password | String | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please log in with your new password."
}
```

**Important Notes:**
- Token expires after 10 minutes
- All refresh tokens are invalidated after password reset
- Token is single-use only

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Token is invalid or has expired"
}
```

**Android Data Models:**
```kotlin
data class ResetPasswordRequest(
    val token: String,
    val password: String
)

data class ResetPasswordResponse(
    val success: Boolean,
    val message: String
)
```

**Retrofit Interface:**
```kotlin
@POST("api/auth/reset-password")
suspend fun resetPassword(
    @Body request: ResetPasswordRequest
): Response<ResetPasswordResponse>
```

---

## Error Handling

### HTTP Status Codes

| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| 200 | OK | Successful GET, PUT, POST request |
| 201 | Created | Successful resource creation (e.g., registration) |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Missing/invalid token, invalid credentials |
| 403 | Forbidden | Banned account, insufficient permissions |
| 404 | Not Found | Endpoint doesn't exist |
| 423 | Locked | Account locked due to failed login attempts |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

### Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [                     // Optional, for validation errors
    {
      "field": "fieldName",
      "message": "Error for this field",
      "value": "invalid value"
    }
  ]
}
```

### Android Error Handling Example

```kotlin
sealed class ApiResult<out T> {
    data class Success<T>(val data: T) : ApiResult<T>()
    data class Error(val message: String, val code: Int) : ApiResult<Nothing>()
    data class ValidationError(val errors: List<ValidationError>) : ApiResult<Nothing>()
}

data class ErrorResponse(
    val success: Boolean,
    val message: String,
    val errors: List<ValidationError>?
)

data class ValidationError(
    val field: String,
    val message: String,
    val value: Any?
)

suspend fun <T> safeApiCall(apiCall: suspend () -> Response<T>): ApiResult<T> {
    return try {
        val response = apiCall()
        if (response.isSuccessful && response.body() != null) {
            ApiResult.Success(response.body()!!)
        } else {
            val errorBody = response.errorBody()?.string()
            val errorResponse = Gson().fromJson(errorBody, ErrorResponse::class.java)
            
            if (errorResponse.errors != null) {
                ApiResult.ValidationError(errorResponse.errors)
            } else {
                ApiResult.Error(
                    errorResponse.message ?: "Unknown error",
                    response.code()
                )
            }
        }
    } catch (e: Exception) {
        ApiResult.Error(e.message ?: "Network error", -1)
    }
}

// Usage
when (val result = safeApiCall { apiService.login(loginRequest) }) {
    is ApiResult.Success -> {
        val authData = result.data.data
        tokenManager.saveTokens(authData.accessToken, authData.refreshToken)
    }
    is ApiResult.Error -> {
        showError(result.message)
    }
    is ApiResult.ValidationError -> {
        result.errors.forEach { error ->
            showFieldError(error.field, error.message)
        }
    }
}
```

---

## Rate Limiting

### Rate Limits by Endpoint

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Auth (login) | 5 requests | 15 minutes |
| Account Creation | 3 requests | 1 hour |
| Password Reset | 3 requests | 1 hour |

### Rate Limit Headers

The API includes rate limit information in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

### Rate Limit Exceeded Response (429)

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

### Android Rate Limit Handling

```kotlin
class RateLimitInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val response = chain.proceed(chain.request())
        
        if (response.code == 429) {
            val retryAfter = response.header("Retry-After")?.toLongOrNull() ?: 60
            showRateLimitError("Too many requests. Please wait $retryAfter seconds.")
        }
        
        return response
    }
}
```

---

## Android Integration Examples

### Complete Retrofit Setup

#### 1. Dependencies (build.gradle.kts)

```kotlin
dependencies {
    // Retrofit
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    
    // OkHttp
    implementation("com.squareup.okhttp3:okhttp:4.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // Encrypted SharedPreferences
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    
    // Gson
    implementation("com.google.code.gson:gson:2.10.1")
}
```

#### 2. API Service Interface

```kotlin
interface LeelaverseApiService {
    
    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<RegisterResponse>
    
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
    
    @POST("api/auth/refresh-token")
    suspend fun refreshToken(@Body request: RefreshTokenRequest): Response<RefreshTokenResponse>
    
    @GET("api/auth/profile")
    suspend fun getProfile(@Header("Authorization") token: String): Response<ProfileResponse>
    
    @PUT("api/auth/profile")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @Body request: UpdateProfileRequest
    ): Response<UpdateProfileResponse>
    
    @PUT("api/auth/change-password")
    suspend fun changePassword(
        @Header("Authorization") token: String,
        @Body request: ChangePasswordRequest
    ): Response<ChangePasswordResponse>
    
    @POST("api/auth/logout")
    suspend fun logout(
        @Header("Authorization") token: String,
        @Body request: LogoutRequest? = null
    ): Response<LogoutResponse>
    
    @POST("api/auth/logout-all")
    suspend fun logoutAll(@Header("Authorization") token: String): Response<LogoutAllResponse>
    
    @POST("api/auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<ForgotPasswordResponse>
    
    @POST("api/auth/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): Response<ResetPasswordResponse>
    
    @GET("api/health")
    suspend fun checkHealth(): Response<HealthResponse>
}
```

#### 3. Token Manager

```kotlin
class TokenManager(context: Context) {
    private val sharedPreferences = EncryptedSharedPreferences.create(
        context,
        "leelaverse_secure_prefs",
        MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    fun saveTokens(accessToken: String, refreshToken: String) {
        sharedPreferences.edit()
            .putString("access_token", accessToken)
            .putString("refresh_token", refreshToken)
            .apply()
    }
    
    fun getAccessToken(): String? = sharedPreferences.getString("access_token", null)
    
    fun getRefreshToken(): String? = sharedPreferences.getString("refresh_token", null)
    
    fun clearTokens() {
        sharedPreferences.edit()
            .remove("access_token")
            .remove("refresh_token")
            .apply()
    }
    
    fun hasValidTokens(): Boolean {
        return getAccessToken() != null && getRefreshToken() != null
    }
}
```

#### 4. Auth Interceptor

```kotlin
class AuthInterceptor(private val tokenManager: TokenManager) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        // Skip adding token for public endpoints
        val publicEndpoints = listOf("/register", "/login", "/forgot-password", "/reset-password", "/health")
        val isPublicEndpoint = publicEndpoints.any { originalRequest.url.encodedPath.contains(it) }
        
        if (isPublicEndpoint) {
            return chain.proceed(originalRequest)
        }
        
        val accessToken = tokenManager.getAccessToken()
        val requestWithAuth = if (accessToken != null) {
            originalRequest.newBuilder()
                .addHeader("Authorization", "Bearer $accessToken")
                .build()
        } else {
            originalRequest
        }
        
        return chain.proceed(requestWithAuth)
    }
}
```

#### 5. Token Authenticator (Auto-refresh)

```kotlin
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class TokenAuthenticator(
    private val tokenManager: TokenManager,
    private val apiService: LeelaverseApiService
) : Authenticator {
    
    private val refreshLock = Mutex()
    
    override fun authenticate(route: Route?, response: Response): Request? {
        // Don't retry if we already tried
        if (response.request.header("Authorization-Retry") != null) {
            return null
        }
        
        val refreshToken = tokenManager.getRefreshToken() ?: return null
        
        return runBlocking {
            refreshLock.withLock {
                try {
                    val refreshResponse = apiService.refreshToken(
                        RefreshTokenRequest(refreshToken)
                    )
                    
                    if (refreshResponse.isSuccessful && refreshResponse.body()?.success == true) {
                        val newAccessToken = refreshResponse.body()?.data?.accessToken
                        val newRefreshToken = refreshResponse.body()?.data?.refreshToken
                        
                        if (newAccessToken != null && newRefreshToken != null) {
                            tokenManager.saveTokens(newAccessToken, newRefreshToken)
                            
                            response.request.newBuilder()
                                .header("Authorization", "Bearer $newAccessToken")
                                .header("Authorization-Retry", "true")
                                .build()
                        } else null
                    } else {
                        tokenManager.clearTokens()
                        null
                    }
                } catch (e: Exception) {
                    tokenManager.clearTokens()
                    null
                }
            }
        }
    }
}
```

#### 6. Retrofit Builder

```kotlin
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import com.google.gson.GsonBuilder
import java.util.concurrent.TimeUnit

object RetrofitClient {
    private const val BASE_URL = "https://www.leelaaverse.com/"
    
    fun create(context: Context): LeelaverseApiService {
        val tokenManager = TokenManager(context)
        
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }
        
        // Create a simple client for token refresh (avoid recursion)
        val refreshClient = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
        
        val refreshRetrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(refreshClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        val refreshApiService = refreshRetrofit.create(LeelaverseApiService::class.java)
        
        // Main client with auth and authenticator
        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .addInterceptor(AuthInterceptor(tokenManager))
            .authenticator(TokenAuthenticator(tokenManager, refreshApiService))
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
        
        val gson = GsonBuilder()
            .setLenient()
            .create()
        
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
        
        return retrofit.create(LeelaverseApiService::class.java)
    }
}
```

#### 7. Repository Pattern

```kotlin
class AuthRepository(
    private val apiService: LeelaverseApiService,
    private val tokenManager: TokenManager
) {
    
    suspend fun register(
        username: String,
        email: String,
        password: String,
        firstName: String? = null,
        lastName: String? = null
    ): ApiResult<AuthData> {
        return safeApiCall {
            apiService.register(
                RegisterRequest(username, email, password, firstName, lastName)
            )
        }.let { result ->
            if (result is ApiResult.Success && result.data.success) {
                result.data.data?.let { authData ->
                    tokenManager.saveTokens(authData.accessToken, authData.refreshToken)
                    ApiResult.Success(authData)
                } ?: ApiResult.Error("No data received", -1)
            } else {
                result as ApiResult<AuthData>
            }
        }
    }
    
    suspend fun login(email: String, password: String): ApiResult<AuthData> {
        return safeApiCall {
            apiService.login(LoginRequest(email, password))
        }.let { result ->
            if (result is ApiResult.Success && result.data.success) {
                result.data.data?.let { authData ->
                    tokenManager.saveTokens(authData.accessToken, authData.refreshToken)
                    ApiResult.Success(authData)
                } ?: ApiResult.Error("No data received", -1)
            } else {
                result as ApiResult<AuthData>
            }
        }
    }
    
    suspend fun getProfile(): ApiResult<User> {
        val token = tokenManager.getAccessToken() ?: return ApiResult.Error("No token", 401)
        
        return safeApiCall {
            apiService.getProfile("Bearer $token")
        }.let { result ->
            if (result is ApiResult.Success && result.data.success) {
                result.data.data?.user?.let { user ->
                    ApiResult.Success(user)
                } ?: ApiResult.Error("No user data", -1)
            } else {
                result as ApiResult<User>
            }
        }
    }
    
    suspend fun updateProfile(updateRequest: UpdateProfileRequest): ApiResult<User> {
        val token = tokenManager.getAccessToken() ?: return ApiResult.Error("No token", 401)
        
        return safeApiCall {
            apiService.updateProfile("Bearer $token", updateRequest)
        }.let { result ->
            if (result is ApiResult.Success && result.data.success) {
                result.data.data?.user?.let { user ->
                    ApiResult.Success(user)
                } ?: ApiResult.Error("No user data", -1)
            } else {
                result as ApiResult<User>
            }
        }
    }
    
    suspend fun changePassword(currentPassword: String, newPassword: String): ApiResult<String> {
        val token = tokenManager.getAccessToken() ?: return ApiResult.Error("No token", 401)
        
        return safeApiCall {
            apiService.changePassword(
                "Bearer $token",
                ChangePasswordRequest(currentPassword, newPassword)
            )
        }.let { result ->
            if (result is ApiResult.Success && result.data.success) {
                tokenManager.clearTokens()
                ApiResult.Success(result.data.message)
            } else {
                result as ApiResult<String>
            }
        }
    }
    
    suspend fun logout() {
        val accessToken = tokenManager.getAccessToken()
        val refreshToken = tokenManager.getRefreshToken()
        
        if (accessToken != null) {
            try {
                apiService.logout(
                    "Bearer $accessToken",
                    refreshToken?.let { LogoutRequest(it) }
                )
            } catch (e: Exception) {
                // Ignore errors, clear tokens anyway
            }
        }
        
        tokenManager.clearTokens()
    }
    
    suspend fun forgotPassword(email: String): ApiResult<String> {
        return safeApiCall {
            apiService.forgotPassword(ForgotPasswordRequest(email))
        }.let { result ->
            if (result is ApiResult.Success && result.data.success) {
                ApiResult.Success(result.data.message)
            } else {
                result as ApiResult<String>
            }
        }
    }
    
    suspend fun resetPassword(token: String, newPassword: String): ApiResult<String> {
        return safeApiCall {
            apiService.resetPassword(ResetPasswordRequest(token, newPassword))
        }.let { result ->
            if (result is ApiResult.Success && result.data.success) {
                ApiResult.Success(result.data.message)
            } else {
                result as ApiResult<String>
            }
        }
    }
}
```

#### 8. ViewModel Usage

```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.LiveData
import kotlinx.coroutines.launch

class AuthViewModel(
    private val repository: AuthRepository
) : ViewModel() {
    
    private val _loginState = MutableLiveData<UiState<AuthData>>()
    val loginState: LiveData<UiState<AuthData>> = _loginState
    
    private val _registerState = MutableLiveData<UiState<AuthData>>()
    val registerState: LiveData<UiState<AuthData>> = _registerState
    
    private val _profileState = MutableLiveData<UiState<User>>()
    val profileState: LiveData<UiState<User>> = _profileState
    
    fun login(email: String, password: String) {
        viewModelScope.launch {
            _loginState.value = UiState.Loading
            
            when (val result = repository.login(email, password)) {
                is ApiResult.Success -> {
                    _loginState.value = UiState.Success(result.data)
                }
                is ApiResult.Error -> {
                    _loginState.value = UiState.Error(result.message)
                }
                is ApiResult.ValidationError -> {
                    val errorMessage = result.errors.joinToString("\n") { it.message }
                    _loginState.value = UiState.Error(errorMessage)
                }
            }
        }
    }
    
    fun register(username: String, email: String, password: String, firstName: String?, lastName: String?) {
        viewModelScope.launch {
            _registerState.value = UiState.Loading
            
            when (val result = repository.register(username, email, password, firstName, lastName)) {
                is ApiResult.Success -> {
                    _registerState.value = UiState.Success(result.data)
                }
                is ApiResult.Error -> {
                    _registerState.value = UiState.Error(result.message)
                }
                is ApiResult.ValidationError -> {
                    val errorMessage = result.errors.joinToString("\n") { it.message }
                    _registerState.value = UiState.Error(errorMessage)
                }
            }
        }
    }
    
    fun getProfile() {
        viewModelScope.launch {
            _profileState.value = UiState.Loading
            
            when (val result = repository.getProfile()) {
                is ApiResult.Success -> {
                    _profileState.value = UiState.Success(result.data)
                }
                is ApiResult.Error -> {
                    _profileState.value = UiState.Error(result.message)
                }
                is ApiResult.ValidationError -> {
                    _profileState.value = UiState.Error("Validation error")
                }
            }
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            repository.logout()
        }
    }
}

sealed class UiState<out T> {
    object Idle : UiState<Nothing>()
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}
```


#### 9. Dependency Injection with Hilt (Optional)

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideTokenManager(@ApplicationContext context: Context): TokenManager {
        return TokenManager(context)
    }
    
    @Provides
    @Singleton
    fun provideApiService(@ApplicationContext context: Context): LeelaverseApiService {
        return RetrofitClient.create(context)
    }
    
    @Provides
    @Singleton
    fun provideAuthRepository(
        apiService: LeelaverseApiService,
        tokenManager: TokenManager
    ): AuthRepository {
        return AuthRepository(apiService, tokenManager)
    }
}
```

---

## Security Best Practices

### 1. Token Storage
- **Always use EncryptedSharedPreferences** for storing tokens
- Never store tokens in plain SharedPreferences
- Never log tokens in production builds

```kotlin
// Good ✅
val encryptedPrefs = EncryptedSharedPreferences.create(...)
encryptedPrefs.edit().putString("access_token", token).apply()

// Bad ❌
val prefs = context.getSharedPreferences("prefs", Context.MODE_PRIVATE)
prefs.edit().putString("access_token", token).apply()
```

### 2. Network Security

Add network security configuration:

**res/xml/network_security_config.xml:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">leelaaverse.com</domain>
    </domain-config>
</network-security-config>
```

**AndroidManifest.xml:**
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

### 3. ProGuard Rules

Add ProGuard rules for data models:

```proguard
# Keep data models
-keep class com.yourapp.models.** { *; }
-keepclassmembers class com.yourapp.models.** { *; }

# Gson
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.** { *; }

# Retrofit
-keep class retrofit2.** { *; }
-keepattributes Signature
-keepattributes Exceptions
```

### 4. Password Validation

Implement client-side validation before sending requests:

```kotlin
object PasswordValidator {
    private const val MIN_LENGTH = 8
    private val UPPERCASE_REGEX = Regex(".*[A-Z].*")
    private val LOWERCASE_REGEX = Regex(".*[a-z].*")
    private val DIGIT_REGEX = Regex(".*\\d.*")
    private val SPECIAL_CHAR_REGEX = Regex(".*[@$!%*?&].*")
    
    fun validate(password: String): ValidationResult {
        val errors = mutableListOf<String>()
        
        if (password.length < MIN_LENGTH) {
            errors.add("Password must be at least $MIN_LENGTH characters")
        }
        if (!UPPERCASE_REGEX.matches(password)) {
            errors.add("Password must contain at least one uppercase letter")
        }
        if (!LOWERCASE_REGEX.matches(password)) {
            errors.add("Password must contain at least one lowercase letter")
        }
        if (!DIGIT_REGEX.matches(password)) {
            errors.add("Password must contain at least one number")
        }
        if (!SPECIAL_CHAR_REGEX.matches(password)) {
            errors.add("Password must contain at least one special character (@$!%*?&)")
        }
        
        return if (errors.isEmpty()) {
            ValidationResult.Valid
        } else {
            ValidationResult.Invalid(errors)
        }
    }
}

sealed class ValidationResult {
    object Valid : ValidationResult()
    data class Invalid(val errors: List<String>) : ValidationResult()
}
```

### 5. Timeout Configuration

Set appropriate timeouts:

```kotlin
val okHttpClient = OkHttpClient.Builder()
    .connectTimeout(30, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .writeTimeout(30, TimeUnit.SECONDS)
    .callTimeout(60, TimeUnit.SECONDS)
    .build()
```

### 6. Error Logging (Production Safe)

```kotlin
if (BuildConfig.DEBUG) {
    Log.d("API", "Response: $response")
} else {
    // Use Crashlytics or similar for production
    FirebaseCrashlytics.getInstance().log("API Error: ${response.code()}")
}
```

---

## Testing Guidelines

### 1. Unit Testing API Calls

```kotlin
@Test
fun `login with valid credentials returns success`() = runTest {
    // Arrange
    val mockResponse = LoginResponse(
        success = true,
        message = "Login successful",
        data = AuthData(mockUser, "access_token", "refresh_token")
    )
    coEvery { apiService.login(any()) } returns Response.success(mockResponse)
    
    // Act
    val result = repository.login("test@example.com", "Password123!")
    
    // Assert
    assertTrue(result is ApiResult.Success)
    assertEquals("access_token", (result as ApiResult.Success).data.accessToken)
}
```

### 2. Manual Testing with cURL

**Register User:**
```bash
curl -X POST https://www.leelaaverse.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Login:**
```bash
curl -X POST https://www.leelaaverse.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

**Get Profile:**
```bash
curl -X GET https://www.leelaaverse.com/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Common Issues and Solutions

### Issue: 401 Unauthorized on every request
**Solution:** Ensure you're including the Bearer token in the Authorization header:
```kotlin
@Header("Authorization") token: String
// Pass as: "Bearer $accessToken"
```

### Issue: Token refresh not working
**Solution:** Check that:
1. TokenAuthenticator is properly configured in OkHttpClient
2. Refresh token is being stored correctly
3. The refresh endpoint is not triggering the authenticator (use separate client)

### Issue: CORS errors in testing
**Solution:** CORS is a browser issue. For Android apps:
- CORS doesn't apply
- If testing in browser, ensure origin is in allowed origins list

### Issue: Rate limiting in development
**Solution:** Wait for the rate limit window to expire, or use different test accounts

---

## API Response Time Expectations

| Endpoint | Expected Response Time |
|----------|----------------------|
| Health Check | < 100ms |
| Login | < 500ms |
| Register | < 1000ms |
| Get Profile | < 300ms |
| Update Profile | < 500ms |

---

## Quick Start Checklist

- [ ] Add dependencies to build.gradle
- [ ] Create data models (User, AuthData, etc.)
- [ ] Implement TokenManager with EncryptedSharedPreferences
- [ ] Create API service interface
- [ ] Set up Retrofit with interceptors and authenticator
- [ ] Implement Repository layer
- [ ] Create ViewModels
- [ ] Add network security configuration
- [ ] Implement error handling
- [ ] Add password validation
- [ ] Test with health check endpoint
- [ ] Test authentication flow

---

## Endpoint Summary Table

| # | Method | Endpoint | Auth Required | Rate Limit | Description |
|---|--------|----------|---------------|------------|-------------|
| 1 | GET | `/api/health` | No | General | Health check |
| 2 | POST | `/api/auth/register` | No | 3/hour | Register new user |
| 3 | POST | `/api/auth/login` | No | 5/15min | User login |
| 4 | POST | `/api/auth/refresh-token` | No* | General | Refresh access token |
| 5 | GET | `/api/auth/profile` | Yes | General | Get user profile |
| 6 | PUT | `/api/auth/profile` | Yes | General | Update user profile |
| 7 | PUT | `/api/auth/change-password` | Yes | General | Change password |
| 8 | POST | `/api/auth/logout` | Yes | General | Logout from device |
| 9 | POST | `/api/auth/logout-all` | Yes | General | Logout from all devices |
| 10 | POST | `/api/auth/forgot-password` | No | 3/hour | Request password reset |
| 11 | POST | `/api/auth/reset-password` | No | General | Reset password with token |

*Requires refresh token in request body

---

## Support and Resources

- **API Base URL:** https://www.leelaaverse.com
- **Production Base:** https://www.leelaaverse.com/api
- **Development Base:** http://localhost:3000/api
- **Documentation:** This file
- **Support:** Create an issue in the repository

---

## Document Information

**Document Version:** 1.0.0  
**Last Updated:** December 7, 2024  
**API Version:** v1.0  
**Target Platform:** Android  
**Minimum Android SDK:** 24 (Android 7.0)  
**Recommended Language:** Kotlin  

---

## Changelog

### Version 1.0.0 (December 7, 2024)
- Initial documentation release
- Complete API endpoint documentation
- Android integration examples with Retrofit
- Security best practices
- Error handling guidelines
- Testing guidelines

---

For questions or support, please create an issue in the GitHub repository.

**Happy Coding! 🚀**
