const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/users/:userId/profile
 * @desc    Get public user profile
 * @access  Public (optional auth for follow status)
 */
router.get('/:userId/profile', optionalAuth, userController.getPublicProfile);

/**
 * @route   POST /api/users/:userId/follow
 * @desc    Follow a user
 * @access  Private
 */
router.post('/:userId/follow', auth, userController.followUser);

/**
 * @route   DELETE /api/users/:userId/follow
 * @desc    Unfollow a user
 * @access  Private
 */
router.delete('/:userId/follow', auth, userController.unfollowUser);

/**
 * @route   GET /api/users/:userId/follow-status
 * @desc    Check if current user is following another user
 * @access  Public (optional auth)
 */
router.get('/:userId/follow-status', optionalAuth, userController.checkFollowStatus);

/**
 * @route   GET /api/users/following
 * @desc    Get list of users current user is following
 * @access  Private
 */
router.get('/following', auth, userController.getFollowing);

module.exports = router;
