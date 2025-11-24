const express = require('express');
const router = express.Router();

// Import controller
const profileController = require('../controllers/profileController');

// Import middleware
const { auth } = require('../middleware/auth');
const {
    validateProfileUpdate,
    validateUsernameUpdate,
    validateBioUpdate,
    validateSocialLinksUpdate,
    validateAvatarUpdate
} = require('../middleware/validation');

// All routes require authentication
router.use(auth);

// @route   PUT /api/profile
// @desc    Update complete profile (firstName, lastName, bio, location, website, phone, dob)
// @access  Private
router.put('/',
    validateProfileUpdate,
    profileController.updateProfile
);

// @route   PUT /api/profile/avatar
// @desc    Update user avatar
// @access  Private
router.put('/avatar',
    validateAvatarUpdate,
    profileController.updateAvatar
);

// @route   PUT /api/profile/cover
// @desc    Update cover image
// @access  Private
router.put('/cover',
    validateAvatarUpdate, // Reuse same validation
    profileController.updateCoverImage
);

// @route   PUT /api/profile/username
// @desc    Update username
// @access  Private
router.put('/username',
    validateUsernameUpdate,
    profileController.updateUsername
);

// @route   PUT /api/profile/bio
// @desc    Update bio
// @access  Private
router.put('/bio',
    validateBioUpdate,
    profileController.updateBio
);

// @route   PUT /api/profile/social
// @desc    Update social media links
// @access  Private
router.put('/social',
    validateSocialLinksUpdate,
    profileController.updateSocialLinks
);

// @route   PUT /api/profile/settings
// @desc    Update user settings (notifications, privacy, display)
// @access  Private
router.put('/settings',
    profileController.updateSettings
);

// @route   GET /api/profile/check-username/:username
// @desc    Check if username is available
// @access  Private
router.get('/check-username/:username',
    profileController.checkUsernameAvailability
);

// @route   GET /api/profile/stats
// @desc    Get detailed profile statistics
// @access  Private
router.get('/stats',
    profileController.getProfileStats
);

module.exports = router;
