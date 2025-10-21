const jwt = require('jsonwebtoken');
const UserService = require('../services/UserService');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mock-jwt-secret');

        const user = await UserService.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token is not valid. User not found.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated.'
            });
        }

        if (user.isBanned) {
            if (user.banExpiresAt && new Date(user.banExpiresAt) > new Date()) {
                return res.status(403).json({
                    success: false,
                    message: `Account is banned until ${new Date(user.banExpiresAt).toDateString()}`
                });
            } else if (!user.banExpiresAt) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is permanently banned.'
                });
            }
        }

        // Remove password from user object
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }

        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during authentication.'
        });
    }
};

// Middleware to check if user has required role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please authenticate first.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};

// Middleware to verify refresh token
const verifyRefreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token is required.'
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'mock-refresh-secret');

        // Find the user by ID from the decoded token
        const user = await UserService.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token. User not found.'
            });
        }

        // Check if refresh token exists in database
        const tokenExists = await UserService.findRefreshToken(refreshToken);

        if (!tokenExists) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token.'
            });
        }

        req.user = user;
        req.refreshToken = refreshToken;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token.'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token expired.'
            });
        }

        console.error('Refresh token verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during token verification.'
        });
    }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserService.findById(decoded.id);

        if (user && user.isActive && !user.isBanned) {
            req.user = user;
        }

        next();
    } catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};

module.exports = {
    auth,
    authorize,
    verifyRefreshToken,
    optionalAuth
};
