const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./src/config/database');

// Import passport configuration
require('./src/config/passport');

// Import middleware
const { generalLimiter } = require('./src/middleware/rateLimiter');

// Import routes
const authRoutes = require('./src/routes/auth');
const oauthRoutes = require('./src/routes/oauth');
const postRoutes = require('./src/routes/posts');

const app = express();
const port = process.env.PORT || 3000;

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
    'https://www.leelaaverse.com',
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
        message: 'Leelaverse Backend API is running',
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
        message: 'Welcome to Leelaverse Backend API',
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

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

const server = app.listen(port, () => {
    console.log(`🚀 Leelaverse Backend API is running on http://localhost:${port}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

module.exports = app;
