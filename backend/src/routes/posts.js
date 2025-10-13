const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { auth } = require('../middleware/auth'); // Changed from 'protect' to 'auth'
const { validatePost } = require('../middleware/validation');

/**
 * @route   POST /api/posts/generate-image
 * @desc    Generate image using FAL AI
 * @access  Private
 */
router.post('/generate-image', postController.generateImage);

/**
 * @route   GET /api/posts/generate-status/:generationId
 * @desc    Get image generation status
 * @access  Private
 */
router.get('/generate-status/:generationId', auth, postController.getGenerationStatus);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/', auth, validatePost, postController.createPost);

/**
 * @route   GET /api/posts/feed
 * @desc    Get feed posts (public timeline)
 * @access  Public/Private
 */
router.get('/feed', postController.getFeedPosts);

/**
 * @route   GET /api/posts/user/:userId
 * @desc    Get posts by user
 * @access  Public
 */
router.get('/user/:userId', postController.getUserPosts);

/**
 * @route   GET /api/posts/:postId
 * @desc    Get single post
 * @access  Public
 */
router.get('/:postId', postController.getPost);

/**
 * @route   DELETE /api/posts/:postId
 * @desc    Delete post
 * @access  Private
 */
router.delete('/:postId', auth, postController.deletePost);

module.exports = router;
