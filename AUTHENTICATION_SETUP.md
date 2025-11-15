# Authentication Modal - Quick Start Guide

This guide will help you set up and test the authentication modal with backend integration.

## 🚀 Setup Instructions

### 1. Frontend Setup

Navigate to the frontend directory:
```powershell
cd Leelaah-frontend
```

Install dependencies (if not already done):
```powershell
npm install
```

Make sure the `.env` file exists with:
```env
VITE_API_URL=http://localhost:3000
```

### 2. Backend Setup

Navigate to the backend directory:
```powershell
cd backend
```

Install dependencies (if not already done):
```powershell
npm install
```

Make sure your `.env` file has:
```env
DATABASE_URL="your-database-url"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-secret"
NODE_ENV=development
```

### 3. Database Setup

If using Prisma, run migrations:
```powershell
npx prisma migrate dev
```

Or generate the Prisma client:
```powershell
npx prisma generate
```

## 🎮 Running the Application

### Start Backend (Terminal 1)
```powershell
cd backend
npm start
# or
npm run dev
```

Backend should be running on: `http://localhost:3000`

### Start Frontend (Terminal 2)
```powershell
cd Leelaah-frontend
npm run dev
```

Frontend should be running on: `http://localhost:5173`

## ✅ Testing the Modal

1. Open your browser and go to `http://localhost:5173`

2. You should see the navbar with **Login** and **Sign up** buttons (since you're not logged in)

3. Click **Login** to open the login modal

4. Click **Sign up** to open the signup modal

5. Try registering a new user:
   - Fill in all required fields
   - Password must be at least 6 characters
   - Username must be at least 3 characters

6. After successful registration/login:
   - Modal will close automatically
   - Navbar will show Featured/Trending/Following tabs
   - User data will be stored in localStorage

## 🔍 Debugging

### Check Backend Logs
The backend logs all requests. You can view them at:
```
http://localhost:3000/api/debug/logs
```

### Check Browser Console
Open DevTools (F12) and check:
- Network tab for API requests
- Console tab for any errors
- Application tab → Local Storage to see stored tokens

### Common Issues

**1. CORS Error**
- Make sure backend is running on port 3000
- Check if `http://localhost:5173` is in the allowed origins in `backend/app.js`

**2. Database Connection Error**
- Verify your DATABASE_URL in backend `.env`
- Run `npx prisma generate` in backend directory

**3. Modal Not Opening**
- Check browser console for errors
- Verify Font Awesome is loaded (for icons)

**4. Form Validation Errors**
- Email must be valid format
- Password minimum 6 characters
- Username minimum 3 characters (signup)

## 📝 API Endpoints

### Register
```
POST http://localhost:3000/api/auth/register

Body:
{
    "email": "user@example.com",
    "password": "password123",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe"
}
```

### Login
```
POST http://localhost:3000/api/auth/login

Body:
{
    "email": "user@example.com",
    "password": "password123"
}
```

### Test with Postman or curl
```powershell
# Register
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"test123\",\"username\":\"testuser\",\"firstName\":\"Test\",\"lastName\":\"User\"}'

# Login
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"test123\"}'
```

## 🎨 Customization

### Changing Colors
Edit `AuthModal.css` and modify the CSS variables:
- Primary color: `#5d5fef`
- Background: `#1a1a2e`
- Success: `#4ab58e`
- Error: `#d60038`

### Adding More Fields
Edit `AuthModal.jsx` and add to `formData` state:
```javascript
const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    // Add your custom fields here
});
```

## 🔐 Security Notes

- Tokens are stored in localStorage (consider using httpOnly cookies for production)
- Always use HTTPS in production
- Implement proper token refresh logic
- Add CSRF protection for production
- Rate limit authentication endpoints (already implemented in backend)

## 📚 Next Steps

- [ ] Implement logout functionality
- [ ] Add profile page
- [ ] Implement password reset flow
- [ ] Add email verification
- [ ] Integrate OAuth providers (Google, Discord)
- [ ] Add password strength indicator
- [ ] Implement "Remember Me" functionality

## 🆘 Support

If you encounter any issues:
1. Check the console for errors
2. Verify backend is running
3. Check API logs at `/api/debug/logs`
4. Ensure all dependencies are installed
5. Verify environment variables are set correctly
