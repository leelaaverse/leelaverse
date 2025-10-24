const rateLimit = require('express-rate-limit');

// General API rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Auth endpoints rate limiting (more restrictive)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful requests
});

// Password reset rate limiting
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset attempts per hour
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again in 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Email verification rate limiting
const emailVerificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 email verification requests per hour
    message: {
        success: false,
        message: 'Too many email verification requests, please try again in 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Account creation rate limiting
const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 account creations per hour
    message: {
        success: false,
        message: 'Too many account creation attempts, please try again in 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    generalLimiter,
    authLimiter,
    passwordResetLimiter,
    emailVerificationLimiter,
    createAccountLimiter
};