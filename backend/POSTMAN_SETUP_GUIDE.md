# Leelaverse API - Postman Collection Setup Guide

## 📥 Import Instructions

### Step 1: Import Collection
1. Open Postman
2. Click "Import" button
3. Select `Leelaverse_API_Postman_Collection.json`
4. Click "Import"

### Step 2: Create Environment
1. Click the gear icon (⚙️) in top right
2. Click "Add" to create new environment
3. Name it "Leelaverse Local" or "Leelaverse Production"

### Step 3: Set Environment Variables
Add these variables to your environment:

#### For Local Development:
```
baseUrl: http://localhost:3000/api
accessToken: (will be set automatically after login)
refreshToken: (will be set automatically after login)
userId: (will be set automatically after login)
requestId: (will be set automatically after image generation)
aiGenerationId: (will be set automatically after image generation)
postId: (will be set automatically after post creation)
```

#### For Production:
```
baseUrl: https://www.leelaah.com/api
accessToken: (will be set automatically after login)
refreshToken: (will be set automatically after login)
userId: (will be set automatically after login)
requestId: (will be set automatically after image generation)
aiGenerationId: (will be set automatically after image generation)
postId: (will be set automatically after post creation)
```

## 🚀 Quick Start Workflow

### 1. Test API Health
- Run `System > Health Check` to verify API is running

### 2. Create Account & Login
- Run `Authentication > Register User` (creates account + auto-sets tokens)
- OR Run `Authentication > Login User` (if account exists)

### 3. Test AI Generation Flow
- Run `AI Generation > Generate Image` (starts image generation)
- Wait 15-30 seconds, then run `AI Generation > Check Generation Status`
- Once status is "completed", run `Posts > Create Post from AI Generation`

### 4. Test Regular Posting
- Run `Posts > Create Regular Post` or `Posts > Create Image Post`

### 5. Browse Content
- Run `Posts > Get Feed Posts` to see all public posts
- Run `Posts > Get User Posts` to see posts by specific user

## 🔑 Authentication Flow

The collection automatically handles token management:

1. **Register/Login** → Sets `accessToken`, `refreshToken`, `userId`
2. **Protected Endpoints** → Use `Authorization: Bearer {{accessToken}}`
3. **Token Refresh** → Use `Authentication > Refresh Token` when needed

## 🎨 AI Generation Workflow

1. **Generate Image** → Returns `requestId` and `aiGenerationId`
2. **Check Status** → Poll until status is "completed"
3. **Create Post** → Use `aiGenerationId` to create post from generation
4. **View My Generations** → See all unpublished AI creations

## 📝 Post Types

### Text Post
```json
{
  "caption": "Your text content here",
  "category": "text-post",
  "type": "content"
}
```

### Image Post
```json
{
  "caption": "Image description",
  "category": "image-text-post",
  "imageUrls": ["https://example.com/image.jpg"],
  "type": "content"
}
```

### AI Generated Post
```json
{
  "aiGenerationIds": ["ai_gen_id_123"],
  "caption": "Amazing AI art!",
  "category": "image-post",
  "type": "content"
}
```

## 🛠️ Environment Switching

### Switch to Local Development:
1. Select "Leelaverse Local" environment
2. Ensure `baseUrl` is `http://localhost:3000/api`

### Switch to Production:
1. Select "Leelaverse Production" environment  
2. Ensure `baseUrl` is `https://www.leelaah.com/api`

## ⚡ Pre-request Scripts

The collection includes automatic token management:
- Tokens are saved after successful login/register
- Environment variables are updated automatically
- Request IDs are captured for testing workflows

## 🧪 Testing Scenarios

### Complete User Journey:
1. `Register User` → Auto-login
2. `Generate Image` → Get request ID
3. `Check Generation Status` → Wait for completion
4. `Create Post from AI Generation` → Create post
5. `Get Feed Posts` → See your post in feed

### Content Management:
1. `Create Regular Post` → Create text/image post
2. `Get User Posts` → View your posts
3. `Get Single Post` → View specific post
4. `Delete Post` → Remove post

### Profile Management:
1. `Get User Profile` → View profile
2. `Update User Profile` → Update info
3. `Change Password` → Security update

## 🔍 Debug & Monitoring

- `System > Debug Logs` → View recent API requests
- `System > Clear Debug Logs` → Clean up logs
- `System > Health Check` → Verify API status

## 🚨 Common Issues

### Authentication Errors:
- Check if `accessToken` is set in environment
- Try refreshing token with `Authentication > Refresh Token`
- Re-login if refresh fails

### Generation Timeout:
- AI generation takes 15-30 seconds
- Check status multiple times before assuming failure
- Use `FAL Status (Direct)` for more detailed info

### CORS Issues:
- Ensure you're using correct `baseUrl`
- Local: `http://localhost:3000/api`
- Production: `https://www.leelaah.com/api`

## 📊 Rate Limits

- **General**: 100 requests per 15 minutes
- **Auth**: 5 login attempts per 15 minutes  
- **Account Creation**: 3 attempts per hour
- **Password Reset**: 3 attempts per hour

## 🎯 Testing Tips

1. **Use Random Values**: Collection uses `{{$randomInt}}` for unique usernames/emails
2. **Check Environment**: Always verify correct environment is selected
3. **Monitor Logs**: Use debug endpoints to troubleshoot issues
4. **Sequential Testing**: Some requests depend on previous responses
5. **Wait for AI**: Give image generation enough time to complete

---

*Happy Testing! 🚀*