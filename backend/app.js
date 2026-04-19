const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import database connection (Prisma)
const connectDB = require('./src/config/database');
const prisma = require('./src/config/prisma');

// Import passport configuration
require('./src/config/passport');

// Import middleware
const { generalLimiter } = require('./src/middleware/rateLimiter');

// Import routes
const authRoutes = require('./src/routes/auth');
const oauthRoutes = require('./src/routes/oauth');
const postRoutes = require('./src/routes/posts');
const profileRoutes = require('./src/routes/profile');
const userRoutes = require('./src/routes/users');
const messageRoutes = require('./src/routes/messageRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const aiGenerationRoutes = require('./src/ai-generation');
const communityRoutes = require('./src/routes/communityRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Initialize Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            const allowedOrigins = [
                'https://www.leelaah.com',
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:3000',
                'http://127.0.0.1:5173'
            ];
            if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    }
});

// In-memory log storage for debugging (limited to last 100 entries)
const requestLogs = [];
const MAX_LOGS = 100;

function addLog(type, message, data = {}) {
    const log = {
        timestamp: new Date().toISOString(),
        type,
        message,
        data
    };
    requestLogs.unshift(log);
    if (requestLogs.length > MAX_LOGS) {
        requestLogs.pop();
    }
    console.log(`[${type}] ${message}`, data);
}

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration - Allow multiple origins
const allowedOrigins = [
    'https://www.leelaah.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
];

app.use(cors({
    origin: function (origin, callback) {
        // Log for debugging
        addLog('CORS', 'Request received', { origin, env: process.env.NODE_ENV });

        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) {
            addLog('CORS', 'No origin - allowing request');
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            addLog('CORS', '✅ Origin allowed', { origin });
            callback(null, true);
        } else {
            addLog('CORS', '❌ Origin blocked', { origin, allowedOrigins });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware for OAuth
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Request logger middleware
app.use((req, res, next) => {
    addLog('REQUEST', `${req.method} ${req.path}`, {
        origin: req.headers.origin,
        referer: req.headers.referer,
        userAgent: req.headers['user-agent'],
        contentType: req.headers['content-type'],
        authorization: req.headers.authorization ? 'Present' : 'None'
    });
    next();
});

// Rate limiting
app.use(generalLimiter);

// Trust proxy (for accurate IP addresses behind reverse proxy)
app.set('trust proxy', 1);

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'leelaah Backend API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Debug logs endpoint (publicly accessible for debugging)
app.get('/api/debug/logs', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json({
        success: true,
        message: 'Recent request logs',
        count: requestLogs.length,
        logs: requestLogs.slice(0, limit),
        allowedOrigins,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Clear logs endpoint (for cleanup)
app.post('/api/debug/logs/clear', (req, res) => {
    const clearedCount = requestLogs.length;
    requestLogs.length = 0;
    addLog('SYSTEM', 'Logs cleared', { count: clearedCount });
    res.json({
        success: true,
        message: `Cleared ${clearedCount} logs`,
        timestamp: new Date().toISOString()
    });
});

// Add root route handler
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to leelaah Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            logs: '/api/debug/logs',
            logsViewer: '/public/logs.html',
            documentation: 'See README.md for full API documentation'
        },
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiGenerationRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationRoutes);

// Handle 404 errors
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);

    // Duplicate key error (MongoDB)
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // Validation error (Mongoose)
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Default error
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error'
    });
});

// Socket.IO Authentication Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Join user to their own room
    socket.join(`user:${socket.userId}`);

    // Join conversation room
    socket.on('join:conversation', (conversationId) => {
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave:conversation', (conversationId) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Send message (real-time)
    socket.on('send:message', async (data) => {
        try {
            const { conversationId, content, recipientId } = data;

            // Emit to conversation room
            io.to(`conversation:${conversationId}`).emit('receive:message', {
                conversationId,
                senderId: socket.userId,
                content,
                createdAt: new Date().toISOString()
            });

            // Also emit to recipient's user room (for notification)
            io.to(`user:${recipientId}`).emit('new:message:notification', {
                conversationId,
                senderId: socket.userId,
                content
            });
        } catch (error) {
            console.error('Socket send message error:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Typing indicators
    socket.on('typing:start', ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit('user:typing', {
            userId: socket.userId,
            conversationId
        });
    });

    socket.on('typing:stop', ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit('user:stopped:typing', {
            userId: socket.userId,
            conversationId
        });
    });

    // Mark as read
    socket.on('message:read', ({ conversationId, messageIds }) => {
        socket.to(`conversation:${conversationId}`).emit('messages:read', {
            conversationId,
            messageIds,
            readBy: socket.userId
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.userId}`);
    });
});

// Make io accessible to routes and globally (for notification controller)
app.set('io', io);
global.io = io;

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    io.close();
    await prisma.$disconnect();
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    io.close();
    await prisma.$disconnect();
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

server.listen(port, () => {
    console.log(`🚀 leelaah Backend API is running on http://localhost:${port}`);
    console.log(`💬 Socket.IO server is running for real-time chat`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

module.exports = app;
