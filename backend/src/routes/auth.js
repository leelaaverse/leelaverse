const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');

// Import middleware
const { auth, verifyRefreshToken } = require('../middleware/auth');
const {
    authLimiter,
    createAccountLimiter,
    passwordResetLimiter
} = require('../middleware/rateLimiter');
const {
    validateRegister,
    validateLogin,
    validatePasswordResetRequest,
    validatePasswordReset,
    validateChangePassword,
    validateProfileUpdate,
    validateRefreshToken
} = require('../middleware/validation');

// Public routes (no authentication required)

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register',
    createAccountLimiter,
    validateRegister,
    authController.register
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
    authLimiter,
    validateLogin,
    authController.login
);

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public (but requires valid refresh token)
router.post('/refresh-token',
    validateRefreshToken,
    verifyRefreshToken,
    authController.refreshToken
);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password',
    passwordResetLimiter,
    validatePasswordResetRequest,
    authController.requestPasswordReset
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password',
    validatePasswordReset,
    authController.resetPassword
);

// Protected routes (authentication required)

// @route   POST /api/auth/logout
// @desc    Logout user (remove refresh token)
// @access  Private
router.post('/logout',
    auth,
    authController.logout
);

// @route   POST /api/auth/logout-all
// @desc    Logout from all devices
// @access  Private
router.post('/logout-all',
    auth,
    authController.logoutAll
);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile',
    auth,
    authController.getProfile
);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile',
    auth,
    validateProfileUpdate,
    authController.updateProfile
);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password',
    auth,
    validateChangePassword,
    authController.changePassword
);

module.exports = router;