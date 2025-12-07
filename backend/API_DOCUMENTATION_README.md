# Leelaverse API Documentation

This directory contains comprehensive API documentation and Postman collection for the Leelaverse Backend API.

## 📚 Documentation Files

### 1. **COMPREHENSIVE_API_DOCUMENTATION.md**
Complete developer documentation covering all API endpoints with:
- Detailed endpoint descriptions
- Request/response payload structures
- Field-by-field explanations
- Error handling examples
- Authentication requirements
- Rate limiting information
- Example requests and responses for every endpoint

**Total Coverage**: 2500+ lines covering 40+ endpoints

### 2. **Leelaverse_Complete_API_Collection.json**
Importable Postman collection with:
- All API endpoints organized in folders
- Pre-configured request payloads
- Environment variables setup
- Automatic token management scripts
- Test scripts for response validation

**Base URL**: `https://backend.leelaah.com/api`

## 🚀 Quick Start

### Using the Documentation

1. **Read the comprehensive documentation**:
   ```bash
   open COMPREHENSIVE_API_DOCUMENTATION.md
   ```

2. **Find endpoint details**:
   - Authentication endpoints: Section "Authentication Endpoints"
   - OAuth flow: Section "OAuth Endpoints"
   - Profile management: Section "Profile Management Endpoints"
   - Posts & AI generation: Section "Post Endpoints" and "AI Generation Endpoints"
   - Social features: Section "Social Interaction Endpoints"
   - User management: Section "User Endpoints"

### Importing Postman Collection

1. **Open Postman**

2. **Import the collection**:
   - Click "Import" button in Postman
   - Select `Leelaverse_Complete_API_Collection.json`
   - Click "Import"

3. **Set up environment variables** (Optional but recommended):
   - Create a new environment in Postman
   - Add variables:
     - `baseUrl`: `https://backend.leelaah.com/api`
     - `accessToken`: (will be auto-filled after login)
     - `refreshToken`: (will be auto-filled after login)
     - `userId`: (will be auto-filled after login)
     - `postId`: (manually set when testing post endpoints)

4. **Test the API**:
   - Start with "Register User" or "Login User" in the Authentication folder
   - Tokens will be automatically saved to environment variables
   - Use the saved tokens for authenticated requests

## 📂 API Endpoint Categories

### 🔐 Authentication (11 endpoints)
- User registration and login
- Token refresh and logout
- Password management
- Profile access

### 🔗 OAuth (3 endpoints)
- Google OAuth flow
- Token verification
- OAuth logout

### 👤 Profile Management (11 endpoints)
- Profile updates
- Avatar and cover image management
- Username and bio updates
- Social links configuration
- Settings management
- Profile statistics

### 🎨 AI Generation (7 endpoints)
- Image generation with multiple models
- Video generation
- Generation status checking
- Managing AI generations

### 📝 Posts (9 endpoints)
- Creating posts from AI generations
- Direct image uploads
- Feed and user posts
- Post management (view, delete)
- Video posts (bloops)

### ❤️ Social Interactions (6 endpoints)
- Like/unlike posts
- Comments management
- Like status checking

### 👥 Users & Follow (4 endpoints)
- User profiles
- Follow/unfollow users
- Follow status checking

### 🛠️ System (3 endpoints)
- Health check
- Debug logs
- System status

## 🔑 Authentication Flow

### 1. Register or Login
```bash
POST /api/auth/register
POST /api/auth/login
```

### 2. Receive Tokens
Response includes:
- `accessToken`: Valid for 15 minutes
- `refreshToken`: Valid for 7 days

### 3. Use Access Token
Include in headers:
```
Authorization: Bearer <your_access_token>
```

### 4. Refresh When Expired
```bash
POST /api/auth/refresh-token
Body: { "refreshToken": "<your_refresh_token>" }
```

## 📊 Rate Limits

| Endpoint Type | Limit |
|--------------|-------|
| General API | 100 requests per 15 minutes |
| Login | 5 attempts per 15 minutes |
| Registration | 3 attempts per hour |
| Password Reset | 3 attempts per hour |

## 🌐 Base URL

**Production**: `https://backend.leelaah.com/api`

All endpoints should be prefixed with this base URL.

## 📝 Example Usage

### Register a New User
```bash
curl -X POST https://backend.leelaah.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Generate AI Image
```bash
curl -X POST https://backend.leelaah.com/api/posts/generate-image \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset over mountains, digital art style",
    "selectedModel": "flux-1-srpo",
    "aspectRatio": "16:9",
    "numInferenceSteps": 28,
    "guidanceScale": 4.5,
    "numImages": 1
  }'
```

### Like a Post
```bash
curl -X POST https://backend.leelaah.com/api/posts/{postId}/like \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🆘 Support

For API support and issues:
- **Documentation**: See COMPREHENSIVE_API_DOCUMENTATION.md
- **Email**: support@leelaah.com
- **Base URL**: https://backend.leelaah.com/api

## 📅 Version History

- **v3.0.0** (December 2025): Complete documentation with all endpoints
- **v2.0.0**: Added social interactions and user management
- **v1.0.0**: Initial API release

## 📋 Checklist for Developers

- [ ] Read COMPREHENSIVE_API_DOCUMENTATION.md
- [ ] Import Leelaverse_Complete_API_Collection.json into Postman
- [ ] Set up environment variables
- [ ] Test authentication endpoints
- [ ] Test AI generation endpoints
- [ ] Test post creation and management
- [ ] Test social interactions (likes, comments, follows)

## 🔒 Security Notes

- Always use HTTPS in production
- Never commit access tokens or API keys
- Refresh tokens before they expire
- Use strong passwords (min 8 chars, uppercase, lowercase, number, special char)
- Rate limits apply - implement proper retry logic

---

**Last Updated**: December 7, 2025  
**API Version**: 1.0.0  
**Documentation Version**: 3.0.0
