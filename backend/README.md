# Leelaverse Backend API

A scalable Node.js/Express backend API for the Leelaverse platform with JWT authentication, MongoDB integration, and comprehensive user management.

## 🚀 Features

- **Authentication & Authorization**
  - JWT access/refresh token system
  - User registration and login
  - Password hashing with bcryptjs
  - Account lockout after failed attempts
  - Password reset functionality
  - Role-based access control

- **Security**
  - Rate limiting on all endpoints
  - CORS protection
  - Helmet security headers
  - Input validation with express-validator
  - MongoDB injection protection

- **User Management**
  - Complete user profiles
  - Social media links
  - Creator statistics and leveling
  - Account activity tracking

- **Database**
  - MongoDB with Mongoose ODM
  - Comprehensive user schema
  - Optimized queries and indexes

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## 🛠 Installation

1. **Clone the repository and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/leelaverse
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB:**
   - **Local MongoDB:** Ensure MongoDB is running on your system
   - **MongoDB Atlas:** Use the connection string from your Atlas cluster

5. **Run the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── validation.js        # Input validation
│   ├── models/
│   │   └── User.js              # User data model
│   ├── routes/
│   │   └── auth.js              # Authentication routes
│   └── utils/                   # Utility functions
├── app.js                       # Express app setup
├── package.json                 # Dependencies
└── .env.example                 # Environment template
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/register` | Create new user account | 3/hour |
| POST | `/login` | User login | 5/15min |
| POST | `/logout` | Logout user | - |
| POST | `/logout-all` | Logout from all devices | - |
| POST | `/refresh-token` | Refresh access token | - |
| GET | `/profile` | Get user profile | - |
| PUT | `/profile` | Update user profile | - |
| PUT | `/change-password` | Change password | - |
| POST | `/forgot-password` | Request password reset | 3/hour |
| POST | `/reset-password` | Reset password with token | - |

### Request/Response Examples

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Access Protected Route
```bash
GET /api/auth/profile
Authorization: Bearer <access_token>
```

## 🔐 Authentication Flow

1. **Registration/Login:** User receives access token (15min) and refresh token (7 days)
2. **API Requests:** Include access token in Authorization header
3. **Token Refresh:** Use refresh token to get new access token when expired
4. **Logout:** Invalidate refresh tokens

## 🛡 Security Features

- **Rate Limiting:**
  - General API: 100 requests/15min
  - Auth endpoints: 5 attempts/15min
  - Account creation: 3 attempts/hour

- **Account Protection:**
  - Account lockout after 5 failed login attempts
  - Password strength requirements
  - Secure password hashing

- **Token Security:**
  - Short-lived access tokens
  - Refresh token rotation
  - Automatic cleanup of expired tokens

## 📊 User Model Schema

```javascript
{
  username: String,           // Unique username
  email: String,             // Unique email
  password: String,          // Hashed password
  role: String,              // user, admin, moderator
  isActive: Boolean,         // Account status
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    location: String,
    website: String,
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String
    }
  },
  creatorStats: {
    level: Number,
    totalPoints: Number,
    badges: [String]
  },
  // Security fields
  lastLogin: Date,
  loginAttempts: Array,
  failedLoginAttempts: Number,
  lockUntil: Date,
  refreshTokens: Array,
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/leelaverse
JWT_SECRET=very-secure-secret-key
JWT_REFRESH_SECRET=very-secure-refresh-key
FRONTEND_URL=https://yourdomain.com
```

## 🧪 Testing

```bash
# Test server health
curl http://localhost:3000/api/health

# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!"}'
```

## 📈 Monitoring & Logging

- Request/response logging
- Error tracking and handling
- Performance monitoring
- Security event logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints and examples

## 🔄 Version History

- **v1.0.0** - Initial release with JWT authentication
- **v1.1.0** - Added user profiles and creator stats
- **v1.2.0** - Enhanced security and rate limiting