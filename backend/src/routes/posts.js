const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { auth, optionalAuth } = require('../middleware/auth'); // Changed from 'protect' to 'auth'
const { validatePost } = require('../middleware/validation');

/**
 * @route   GET /api/posts/models
 * @desc    Get available AI models for image and video generation
 * @access  Public
 */
router.get('/models', postController.getAvailableModels);

/**
 * @route   POST /api/posts/generate-image
 * @desc    Generate image using FAL AI
 * @access  Public (no auth for testing)
 */
router.post('/generate-image', auth, postController.generateImage);

/**
 * @route   POST /api/posts/generate-video
 * @desc    Generate video using FAL AI
 * @access  Public (no auth for testing)
 */
router.post('/generate-video', auth, postController.generateVideo);

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
 * @route   POST /api/posts/upload
 * @desc    Upload image directly to Cloudinary and create post
 * @access  Private
 */
router.post('/upload', auth, postController.uploadAndCreatePost);

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
 * @route   GET /api/posts/bloops
 * @desc    Get video posts (bloops)
 * @access  Public
 */
router.get('/bloops', postController.getBloops);

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

// ============================================
// LIKE ROUTES
// ============================================

/**
 * @route   POST /api/posts/:postId/like
 * @desc    Like a post
 * @access  Private
 */
router.post('/:postId/like', auth, postController.likePost);

/**
 * @route   DELETE /api/posts/:postId/like
 * @desc    Unlike a post
 * @access  Private
 */
router.delete('/:postId/like', auth, postController.unlikePost);

/**
 * @route   GET /api/posts/:postId/like-status
 * @desc    Check if user has liked a post
 * @access  Public (returns isLiked: false if not logged in)
 */
router.get('/:postId/like-status', optionalAuth, postController.checkLikeStatus);

// ============================================
// COMMENT ROUTES
// ============================================

/**
 * @route   POST /api/posts/:postId/comments
 * @desc    Add comment to a post
 * @access  Private
 */
router.post('/:postId/comments', auth, postController.addComment);

/**
 * @route   GET /api/posts/:postId/comments
 * @desc    Get comments for a post
 * @access  Public
 */
router.get('/:postId/comments', postController.getComments);

/**
 * @route   DELETE /api/posts/:postId/comments/:commentId
 * @desc    Delete a comment
 * @access  Private
 */
router.delete('/:postId/comments/:commentId', auth, postController.deleteComment);

module.exports = router;
