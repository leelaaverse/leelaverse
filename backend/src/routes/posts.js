const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { auth } = require('../middleware/auth'); // Changed from 'protect' to 'auth'
const { validatePost } = require('../middleware/validation');

/**
 * @route   POST /api/posts/generate-image
 * @desc    Generate image using FAL AI
 * @access  Public (no auth for testing)
 */
router.post('/generate-image', auth, postController.generateImage);

/**
 * @route   GET /api/posts/generation/:requestId
 * @desc    Get image generation status and result
 * @access  Public (no auth for testing)
 */
router.get('/generation/:requestId', auth, postController.getGenerationResult);

/**
 * @route   POST /api/posts/create-from-generation
 * @desc    Create post from generated image
 * @access  Private
 */
router.post('/create-from-generation', auth, postController.createPostFromGeneration);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Public (no auth for testing)
 */
router.post('/', postController.createPost);

/**
 * @route   GET /api/posts/count
 * @desc    Get posts count (for debugging)
 * @access  Public
 */
router.get('/count', postController.getPostsCount);

/**
 * @route   GET /api/posts/feed
 * @desc    Get feed posts (public timeline)
 * @access  Public/Private
 */
router.get('/feed', postController.getFeedPosts);

/**
 * @route   GET /api/posts/my-generations
 * @desc    Get all AI-generated images that haven't been posted yet
 * @access  Private
 */
router.get('/my-generations', auth, postController.getMyGenerations);

/**
 * @route   GET /api/posts/fal-status/:requestId
 * @desc    Get FAL AI request status directly
 * @access  Private
 */
router.get('/fal-status/:requestId', auth, postController.getFalStatus);

/**
 * @route   GET /api/posts/fal-result/:requestId
 * @desc    Get FAL AI result directly
 * @access  Private
 */
router.get('/fal-result/:requestId', auth, postController.getFalResult);

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
