const { body, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.param,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

// Registration validation
const validateRegister = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),

    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),

    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),

    handleValidationErrors
];

// Login validation
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors
];

// Password reset request validation
const validatePasswordResetRequest = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    handleValidationErrors
];

// Password reset validation
const validatePasswordReset = [
    body('token')
        .notEmpty()
        .withMessage('Reset token is required'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    handleValidationErrors
];

// Change password validation
const validateChangePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),

    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),

    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must not exceed 500 characters'),

    body('location')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Location must not exceed 100 characters'),

    body('website')
        .optional()
        .isURL()
        .withMessage('Website must be a valid URL'),

    body('socialLinks.twitter')
        .optional()
        .matches(/^https:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+$/)
        .withMessage('Twitter URL must be a valid Twitter profile URL'),

    body('socialLinks.linkedin')
        .optional()
        .matches(/^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+$/)
        .withMessage('LinkedIn URL must be a valid LinkedIn profile URL'),

    body('socialLinks.github')
        .optional()
        .matches(/^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+$/)
        .withMessage('GitHub URL must be a valid GitHub profile URL'),

    handleValidationErrors
];

// Refresh token validation
const validateRefreshToken = [
    body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required'),

    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validatePasswordResetRequest,
    validatePasswordReset,
    validateChangePassword,
    validateProfileUpdate,
    validateRefreshToken,
    handleValidationErrors
};