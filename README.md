# Leelaaverse 🌟

AI-powered social media platform for creators, built with modern web technologies. Connect, share, and collaborate in a vibrant community of artists and innovators.

## ✨ Features

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Zod schema validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests

### 👥 Social Features
- **User Profiles**: Customizable profiles with avatars and bios
- **Posts & Content**: Rich text posts with media support
- **Comments System**: Interactive commenting on posts
- **Like System**: Heart posts and show appreciation
- **Follow System**: Follow users and build your network
- **Real-time Notifications**: Stay updated with activity

### 📱 Modern Frontend
- **React 18**: Latest React with hooks and concurrent features
- **TypeScript**: Type-safe development experience
- **Vite**: Lightning-fast development and building
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Progressive Web App**: Offline functionality and native app feel

### ⚡ Backend API
- **Express.js**: Fast and minimalist web framework
- **Prisma ORM**: Type-safe database access with SQLite
- **RESTful API**: Well-structured endpoints
- **File Upload**: Image upload with Sharp processing
- **Logging**: Winston-based comprehensive logging
- **Error Handling**: Centralized error management

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM and database toolkit
- **SQLite** - Database (development)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Zod** - Schema validation
- **Winston** - Logging

### Development Tools
- **ESLint** - Code linting
- **Jest** - Testing framework
- **Docker** - Containerization
- **Concurrently** - Running multiple scripts

## 📁 Project Structure

```
leelaverse/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API service functions
│   │   └── utils/          # Utility functions
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── backend/                 # Express backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Data models (Prisma)
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── logs/               # Application logs
├── shared/                  # Shared utilities and types
├── scripts/                 # Build and deployment scripts
└── package.json            # Root package.json with workspaces
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/leelaaverse/leelaverse.git
   cd leelaverse
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 📖 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### User Endpoints

#### GET /api/users/profile
Get current user profile (requires authentication).

#### PUT /api/users/profile
Update user profile (requires authentication).

#### GET /api/users/:id
Get user profile by ID.

### Posts Endpoints

#### GET /api/posts
Get paginated list of posts.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

#### POST /api/posts
Create a new post (requires authentication).

**Request Body:**
```json
{
  "content": "Hello world!",
  "mediaUrl": "https://example.com/image.jpg"
}
```

#### GET /api/posts/:id
Get post by ID.

#### PUT /api/posts/:id
Update post (requires authentication, owner only).

#### DELETE /api/posts/:id
Delete post (requires authentication, owner only).

### Social Endpoints

#### POST /api/posts/:id/like
Like/unlike a post (requires authentication).

#### POST /api/posts/:id/comments
Add comment to post (requires authentication).

#### POST /api/users/:id/follow
Follow/unfollow user (requires authentication).

## 🧪 Testing

### Backend Tests
```bash
npm run test:backend
```

### Frontend Tests
```bash
npm run test:frontend
```

### All Tests
```bash
npm run test
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📜 Available Scripts

### Root Level Scripts
- `npm run dev` - Start both frontend and backend in development
- `npm run build` - Build both frontend and backend for production
- `npm run test` - Run tests for both frontend and backend
- `npm run lint` - Lint both frontend and backend code
- `npm run setup` - Install dependencies and set up both projects

### Backend Scripts
- `npm run dev` - Start backend with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run test` - Run Jest tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio

### Frontend Scripts
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories.

#### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production` in backend
2. Configure production database URL
3. Set secure JWT secret
4. Configure CORS for your domain

### Build Process
```bash
npm run build
```

### Production Database
For production, consider using PostgreSQL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/leelaverse"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the creative community
- Inspired by the limitless potential of AI and human creativity

---

**Leelaaverse** - Where imagination meets technology 🚀