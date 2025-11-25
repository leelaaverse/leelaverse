# Avatar Upload Feature - Testing Guide

## ✅ Implementation Complete

### Backend Changes
1. ✅ Created `src/config/cloudinary.js` with upload utilities
2. ✅ Added Cloudinary upload integration to `profileController.js`
3. ✅ Added new routes in `src/routes/profile.js`:
   - `POST /api/profile/avatar/upload` - Upload avatar with base64 image
   - `POST /api/profile/cover/upload` - Upload cover with base64 image
4. ✅ Environment variables already configured in `.env`

### Frontend Changes
1. ✅ Added file upload functions to `api.js`:
   - `uploadAvatar(image)` - POST to `/api/profile/avatar/upload`
   - `uploadCover(image)` - POST to `/api/profile/cover/upload`
2. ✅ Updated `EditProfileModal.jsx`:
   - Added file input handlers for avatar and cover
   - Added image preview functionality
   - Added upload progress indicators
   - Integrated with Redux state updates
3. ✅ Updated `EditProfileModal.css`:
   - Added styles for image upload containers
   - Added styles for image previews
   - Added upload button and hint styles
   - Added upload overlay for loading state

## 🧪 How to Test

### Step 1: Start Backend Server
```powershell
cd c:\Users\vega6\Desktop\leelaverse\backend
npm run dev
```

### Step 2: Start Frontend Server
```powershell
cd c:\Users\vega6\Desktop\leelaverse\Leelaah-frontend
npm run dev
```

### Step 3: Test Avatar Upload
1. Login to the application
2. Go to your profile page
3. Click "Edit Profile" button
4. You should see two new upload sections at the top of Basic Info tab:
   - **Avatar section**: Shows current avatar with "Upload Avatar" button
   - **Cover section**: Shows current cover with "Upload Cover" button
5. Click "Upload Avatar" button
6. Select an image file (JPG, PNG, or GIF, max 5MB)
7. Watch for:
   - Image preview updates immediately
   - "Uploading..." overlay appears
   - Success message: "Avatar uploaded successfully!"
   - Avatar updates in navbar and profile immediately

### Step 4: Test Cover Upload
1. Still in Edit Profile modal
2. Click "Upload Cover" button
3. Select an image file (JPG, PNG, or GIF, max 10MB)
4. Watch for:
   - Image preview updates immediately
   - "Uploading..." overlay appears
   - Success message: "Cover image uploaded successfully!"
   - Cover image updates on profile immediately

## 🔍 Validation Tests

### File Size Limits
- ❌ Avatar > 5MB → Error: "Image size must be less than 5MB"
- ❌ Cover > 10MB → Error: "Image size must be less than 10MB"

### File Type Validation
- ✅ JPG, PNG, GIF → Should work
- ❌ PDF, TXT, etc. → Error: "Please select an image file"

### Network Tests
- Check browser Network tab for POST requests to:
  - `/api/profile/avatar/upload`
  - `/api/profile/cover/upload`
- Response should include:
  ```json
  {
    "success": true,
    "message": "Avatar uploaded successfully",
    "data": {
      "user": {...},
      "upload": {
        "url": "https://res.cloudinary.com/...",
        "publicId": "leelaverse/avatars/USER_ID"
      }
    }
  }
  ```

## 🎨 Features

### Avatar Upload
- 📁 **Max Size**: 5MB
- 🖼️ **Formats**: JPG, PNG, GIF
- 📏 **Transform**: Auto-optimized quality
- 📂 **Storage**: `leelaverse/avatars/{userId}`
- 🔄 **Auto-Update**: Redux state + localStorage + UI refresh

### Cover Upload
- 📁 **Max Size**: 10MB
- 🖼️ **Formats**: JPG, PNG, GIF
- 📏 **Transform**: Auto-optimized quality
- 📂 **Storage**: `leelaverse/covers/{userId}`
- 🔄 **Auto-Update**: Redux state + localStorage + UI refresh

## 📝 API Endpoints

### Upload Avatar
```
POST /api/profile/avatar/upload
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}

Response:
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "user": { ... },
    "upload": {
      "url": "https://res.cloudinary.com/.../image.jpg",
      "publicId": "leelaverse/avatars/12345"
    }
  }
}
```

### Upload Cover Image
```
POST /api/profile/cover/upload
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}

Response:
{
  "success": true,
  "message": "Cover image uploaded successfully",
  "data": {
    "user": { ... },
    "upload": {
      "url": "https://res.cloudinary.com/.../cover.jpg",
      "publicId": "leelaverse/covers/12345"
    }
  }
}
```

## 🔐 Security Features

1. **Authentication Required**: All upload endpoints require valid JWT token
2. **File Validation**: Type and size checks on frontend and backend
3. **Base64 Processing**: Images converted to base64 before upload
4. **Unique Storage**: Images stored with userId to prevent conflicts
5. **Auto-optimization**: Cloudinary auto-optimizes images for web

## 🎯 User Experience

### Loading States
- ⏳ Spinner overlay during upload
- 📊 Upload progress indicator
- ✅ Success message with auto-dismiss (3 seconds)
- ❌ Error messages with clear instructions

### Preview System
- 👁️ Immediate preview after file selection
- 🔄 Live update after successful upload
- 📱 Responsive preview images
- 🎨 Styled preview containers

### Error Handling
- 📏 File size validation
- 🖼️ File type validation
- 🌐 Network error handling
- 🔐 Authentication error handling

## 🐛 Troubleshooting

### Upload Fails
1. Check Cloudinary credentials in `.env`
2. Verify JWT token is valid
3. Check file size/type restrictions
4. Check browser console for errors
5. Check backend logs for Cloudinary errors

### Image Not Updating
1. Check Redux state update in devtools
2. Verify localStorage update
3. Check if component re-renders
4. Clear browser cache

### Network Errors
1. Verify backend server is running on port 3000
2. Check CORS configuration
3. Verify API URL in frontend `.env`
4. Check browser network tab for request details

## 📦 Dependencies

### Backend
- `cloudinary`: ^1.41.3 ✅ Already installed
- Environment variables configured ✅

### Frontend
- File reader API (built-in) ✅
- Axios for API calls ✅
- Redux for state management ✅

## 🚀 Next Steps

1. Test the feature in production
2. Monitor Cloudinary usage/quota
3. Add image cropping functionality (optional)
4. Add more image formats support (optional)
5. Implement image compression before upload (optional)
