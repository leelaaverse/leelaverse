const { Post, User, AIGeneration, CoinTransaction } = require('../models');
const { fal } = require("@fal-ai/client");
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure FAL AI
fal.config({
	credentials: process.env.FAL_KEY
});

// In-memory store for generation progress (use Redis in production)
const generationProgress = new Map();

/**
 * Generate Image using FAL AI
 * POST /api/posts/generate-image
 */
exports.generateImage = async (req, res) => {
	try {
		// Get userId from auth or use test user for development
		const userId = req.user?.id || req.user?._id || 'test-user-id';

		const {
			prompt,
			imageSize = 'landscape_4_3',
			numInferenceSteps = 28,
			guidanceScale = 4.5,
			style = 'auto',
			aspectRatio = '16:9',
			selectedModel = 'flux-1-srpo'
		} = req.body;

		// Validate prompt
		if (!prompt || prompt.trim().length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Prompt is required'
			});
		}

		// ============================================
		// CREDIT SYSTEM COMMENTED OUT - TO BE IMPLEMENTED LATER
		// ============================================
		// let user = null;
		// if (userId !== 'test-user-id') {
		// 	user = await User.findById(userId);
		// 	if (!user) {
		// 		return res.status(404).json({
		// 			success: false,
		// 			message: 'User not found'
		// 		});
		// 	}

		// 	// Check AI credits
		// 	const requiredCredits = 10; // Cost for image generation
		// 	if (user.aiCredits.imageGeneration < 1) {
		// 		return res.status(403).json({
		// 			success: false,
		// 			message: 'Insufficient AI credits for image generation',
		// 			credits: user.aiCredits
		// 		});
		// 	}
		// }
		// ============================================

		// Map image size to FAL format
		const sizeMap = {
			'1:1': 'square_hd',
			'4:3': 'portrait_4_3',
			'16:9': 'landscape_16_9',
			'9:16': 'portrait_16_9',
			'3:4': 'portrait_4_3'
		};
		const falImageSize = sizeMap[aspectRatio] || imageSize;

		// Create generation ID for tracking
		const generationId = `gen_${Date.now()}_${userId}`;

		// Initialize progress tracking
		generationProgress.set(generationId, {
			status: 'queued',
			progress: 0,
			message: 'Queuing generation...',
			userId,
			prompt
		});

		// Start generation process (don't await - respond immediately)
		processImageGeneration(generationId, {
			prompt,
			imageSize: falImageSize,
			numInferenceSteps,
			guidanceScale,
			userId,
			selectedModel,
			style,
			aspectRatio
			// requiredCredits - COMMENTED OUT
		});

		// Return generation ID immediately
		res.json({
			success: true,
			message: 'Image generation started',
			generationId,
			estimatedTime: '15-30 seconds'
		});

	} catch (error) {
		console.error('Generate image error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to start image generation',
			error: error.message
		});
	}
};

/**
 * Process Image Generation (Background)
 */
async function processImageGeneration(generationId, config) {
	try {
		const {
			prompt,
			imageSize,
			numInferenceSteps,
			guidanceScale,
			userId,
			selectedModel,
			style,
			aspectRatio
			// requiredCredits - COMMENTED OUT
		} = config;

		// Update progress: Starting
		generationProgress.set(generationId, {
			status: 'processing',
			progress: 10,
			message: 'Initializing AI model...',
			userId,
			prompt
		});

		// Create AI Generation record
		const aiGeneration = await AIGeneration.create({
			user: userId,
			type: 'image',
			model: selectedModel === 'flux-1-srpo' ? 'FLUX.1 SRPO' : 'DALL-E 3',
			prompt,
			parameters: {
				style,
				aspectRatio,
				steps: numInferenceSteps,
				quality: guidanceScale
			},
			status: 'processing'
			// cost: requiredCredits  // COMMENTED OUT - TO BE IMPLEMENTED LATER
		});

		// Update progress: Generating
		generationProgress.set(generationId, {
			status: 'processing',
			progress: 30,
			message: 'Generating image with AI...',
			userId,
			prompt,
			aiGenerationId: aiGeneration._id
		});

		// Call FAL AI API with streaming
		const stream = await fal.stream("fal-ai/flux-1/srpo", {
			input: {
				prompt,
				image_size: imageSize,
				num_inference_steps: numInferenceSteps,
				guidance_scale: guidanceScale,
				num_images: 1,
				enable_safety_checker: true,
				output_format: 'jpeg',
				acceleration: 'regular'
			}
		});

		// Track progress from stream
		let lastProgress = 30;
		for await (const event of stream) {
			if (event.type === 'progress') {
				lastProgress = Math.min(30 + (event.progress * 60), 90);
				generationProgress.set(generationId, {
					status: 'processing',
					progress: lastProgress,
					message: event.message || 'Generating image...',
					userId,
					prompt,
					aiGenerationId: aiGeneration._id
				});
			}
		}

		// Get final result
		const result = await stream.done();

		// Update progress: Processing result
		generationProgress.set(generationId, {
			status: 'processing',
			progress: 95,
			message: 'Finalizing image...',
			userId,
			prompt,
			aiGenerationId: aiGeneration._id
		});

		// Extract image URL from result
		const imageUrl = result.data.images[0]?.url;
		const seed = result.data.seed;

		if (!imageUrl) {
			throw new Error('No image generated');
		}

		// Update AI Generation record
		aiGeneration.resultUrl = imageUrl;
		aiGeneration.parameters.seed = seed?.toString();
		aiGeneration.status = 'completed';
		aiGeneration.generationTime = Math.floor((Date.now() - aiGeneration.createdAt) / 1000);
		await aiGeneration.save();

		// ============================================
		// CREDIT DEDUCTION COMMENTED OUT - TO BE IMPLEMENTED LATER
		// ============================================
		// let creditsRemaining = 0;
		// let imageGenerationCredits = 0;

		// if (userId !== 'test-user-id') {
		// 	const user = await User.findById(userId);
		// 	user.aiCredits.imageGeneration -= 1;
		// 	user.credits.used += 10; // requiredCredits
		// 	user.credits.remaining -= 10;
		// 	await user.save();

		// 	creditsRemaining = user.credits.remaining;
		// 	imageGenerationCredits = user.aiCredits.imageGeneration;

		// 	// Record transaction
		// 	await CoinTransaction.create({
		// 		user: userId,
		// 		type: 'spend',
		// 		amount: -10, // requiredCredits
		// 		balanceAfter: user.credits.remaining,
		// 		description: 'AI Image Generation',
		// 		relatedModel: 'AIGeneration',
		// 		relatedId: aiGeneration._id,
		// 		metadata: {
		// 			aiModel: selectedModel,
		// 			generationType: 'image'
		// 		}
		// 	});
		// }
		// ============================================

		// Update progress: Completed
		generationProgress.set(generationId, {
			status: 'completed',
			progress: 100,
			message: 'Image generated successfully!',
			userId,
			prompt,
			aiGenerationId: aiGeneration._id,
			imageUrl,
			seed
			// credits: {  // COMMENTED OUT
			// 	remaining: creditsRemaining,
			// 	imageGeneration: imageGenerationCredits
			// }
		});

	} catch (error) {
		console.error('Image generation error:', error);

		// Update progress: Failed
		generationProgress.set(generationId, {
			status: 'failed',
			progress: 0,
			message: error.message || 'Image generation failed',
			userId: config.userId,
			prompt: config.prompt,
			error: error.message
		});

		// Update AI Generation record if exists
		try {
			const progress = generationProgress.get(generationId);
			if (progress?.aiGenerationId) {
				await AIGeneration.findByIdAndUpdate(progress.aiGenerationId, {
					status: 'failed',
					errorMessage: error.message
				});
			}
		} catch (updateError) {
			console.error('Failed to update AI Generation:', updateError);
		}
	}
}

/**
 * Get Generation Status
 * GET /api/posts/generate-status/:generationId
 */
exports.getGenerationStatus = async (req, res) => {
	try {
		const { generationId } = req.params;
		const userId = req.user.id;

		const progress = generationProgress.get(generationId);

		if (!progress) {
			return res.status(404).json({
				success: false,
				message: 'Generation not found or expired'
			});
		}

		// Verify user owns this generation
		if (progress.userId.toString() !== userId) {
			return res.status(403).json({
				success: false,
				message: 'Unauthorized'
			});
		}

		res.json({
			success: true,
			...progress
		});

	} catch (error) {
		console.error('Get generation status error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get generation status',
			error: error.message
		});
	}
};

/**
 * Upload Image to Cloudinary
 */
async function uploadToCloudinary(imageUrl, userId) {
	try {
		// Download image from FAL
		const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
		const buffer = Buffer.from(response.data);

		// Upload to Cloudinary
		return new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: `leelaverse/posts/${userId}`,
					resource_type: 'image',
					transformation: [
						{ quality: 'auto:good' },
						{ fetch_format: 'auto' }
					]
				},
				(error, result) => {
					if (error) reject(error);
					else resolve(result);
				}
			);

			uploadStream.end(buffer);
		});
	} catch (error) {
		console.error('Cloudinary upload error:', error);
		throw new Error('Failed to upload image to storage');
	}
}

/**
 * Create Post
 * POST /api/posts
 */
exports.createPost = async (req, res) => {
	try {
		const userId = req.user?.id || req.user?._id || 'test-user-id';
		const {
			caption,
			title,
			type,
			category,
			imageUrl, // From FAL AI
			aiGenerated = false,
			aiDetails = {},
			tags = [],
			visibility = 'public',
			status = 'published'
		} = req.body;

		// Validate required fields
		if (!type || !category) {
			return res.status(400).json({
				success: false,
				message: 'Post type and category are required'
			});
		}

		// Validate content based on category
		if (category === 'text-post' && !caption) {
			return res.status(400).json({
				success: false,
				message: 'Caption is required for text posts'
			});
		}

		if ((category === 'image-post' || category === 'image-text-post') && !imageUrl) {
			return res.status(400).json({
				success: false,
				message: 'Image is required for image posts'
			});
		}

		let cloudinaryUrl = null;
		let thumbnailUrl = null;

		// Upload image to Cloudinary if provided
		if (imageUrl) {
			const uploadResult = await uploadToCloudinary(imageUrl, userId);
			cloudinaryUrl = uploadResult.secure_url;
			thumbnailUrl = uploadResult.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill/');
		}

		// Create post
		const post = await Post.create({
			author: userId,
			type,
			category,
			caption,
			title,
			mediaUrl: cloudinaryUrl,
			thumbnailUrl,
			mediaType: cloudinaryUrl ? 'image/jpeg' : null,
			aiGenerated,
			aiDetails: aiGenerated ? {
				model: aiDetails.model || 'FLUX.1 SRPO',
				prompt: aiDetails.prompt || '',
				enhancedPrompt: aiDetails.enhancedPrompt || '',
				style: aiDetails.style || '',
				aspectRatio: aiDetails.aspectRatio || '16:9',
				steps: aiDetails.steps || 28,
				generationTime: aiDetails.generationTime || 0,
				// cost: aiDetails.cost || 10,  // COMMENTED OUT - TO BE IMPLEMENTED LATER
				seed: aiDetails.seed || ''
			} : {},
			tags: tags.map(tag => tag.toLowerCase().trim()),
			visibility,
			status
		});

		// ============================================
		// USER STATS UPDATE COMMENTED OUT - TO BE IMPLEMENTED LATER
		// ============================================
		// if (userId !== 'test-user-id') {
		// 	await User.findByIdAndUpdate(userId, {
		// 		$inc: {
		// 			'stats.postsCount': 1,
		// 			totalCreations: 1
		// 		}
		// 	});
		// }
		// ============================================

		// Link AI Generation to Post if applicable
		if (aiGenerated && aiDetails.aiGenerationId) {
			await AIGeneration.findByIdAndUpdate(aiDetails.aiGenerationId, {
				post: post._id
			});
		}

		// Populate author details
		await post.populate('author', 'username avatar verified');

		res.status(201).json({
			success: true,
			message: 'Post created successfully',
			post
		});

	} catch (error) {
		console.error('Create post error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to create post',
			error: error.message
		});
	}
};

/**
 * Get User Posts
 * GET /api/posts/user/:userId
 */
exports.getUserPosts = async (req, res) => {
	try {
		const { userId } = req.params;
		const { category, page = 1, limit = 20 } = req.query;

		const query = {
			author: userId,
			deletedAt: null,
			status: 'published'
		};

		if (category) {
			query.category = category;
		}

		const posts = await Post.find(query)
			.populate('author', 'username avatar verified')
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(parseInt(limit))
			.lean();

		const total = await Post.countDocuments(query);

		res.json({
			success: true,
			posts,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit)
			}
		});

	} catch (error) {
		console.error('Get user posts error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get user posts',
			error: error.message
		});
	}
};

/**
 * Get Feed Posts
 * GET /api/posts/feed
 */
exports.getFeedPosts = async (req, res) => {
	try {
		const userId = req.user?.id;
		const { category, page = 1, limit = 20 } = req.query;

		const query = {
			deletedAt: null,
			status: 'published',
			visibility: { $in: ['public', 'followers'] }
		};

		if (category) {
			query.category = category;
		}

		const posts = await Post.find(query)
			.populate('author', 'username avatar verified stats')
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(parseInt(limit))
			.lean();

		const total = await Post.countDocuments(query);

		res.json({
			success: true,
			posts,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit)
			}
		});

	} catch (error) {
		console.error('Get feed posts error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get feed posts',
			error: error.message
		});
	}
};

/**
 * Get Single Post
 * GET /api/posts/:postId
 */
exports.getPost = async (req, res) => {
	try {
		const { postId } = req.params;

		const post = await Post.findById(postId)
			.populate('author', 'username avatar verified stats')
			.lean();

		if (!post || post.deletedAt) {
			return res.status(404).json({
				success: false,
				message: 'Post not found'
			});
		}

		// Increment views
		await Post.findByIdAndUpdate(postId, {
			$inc: { 'stats.views': 1 }
		});

		res.json({
			success: true,
			post
		});

	} catch (error) {
		console.error('Get post error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get post',
			error: error.message
		});
	}
};

/**
 * Delete Post
 * DELETE /api/posts/:postId
 */
exports.deletePost = async (req, res) => {
	try {
		const { postId } = req.params;
		const userId = req.user.id;

		const post = await Post.findOne({ _id: postId, author: userId });

		if (!post) {
			return res.status(404).json({
				success: false,
				message: 'Post not found or unauthorized'
			});
		}

		// Soft delete
		post.deletedAt = new Date();
		await post.save();

		// Update user stats
		await User.findByIdAndUpdate(userId, {
			$inc: { 'stats.postsCount': -1 }
		});

		res.json({
			success: true,
			message: 'Post deleted successfully'
		});

	} catch (error) {
		console.error('Delete post error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to delete post',
			error: error.message
		});
	}
};
