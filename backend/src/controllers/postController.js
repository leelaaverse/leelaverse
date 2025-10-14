const { Post, User, AIGeneration, CoinTransaction } = require('../models');
const { fal } = require("@fal-ai/client");
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const mongoose = require('mongoose');

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

/**
 * Generate Image using FAL AI
 * POST /api/posts/generate-image
 */
exports.generateImage = async (req, res) => {
	try {
		// Create a test user ID that's a valid ObjectId for development
		const testUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
		const userId = req.user?.id || req.user?._id || testUserId;

		const {
			prompt,
			imageSize,
			numInferenceSteps,
			guidanceScale,
			style,
			aspectRatio,
			selectedModel
		} = req.body;

		// Validate prompt
		if (!prompt || prompt.trim().length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Prompt is required'
			});
		}

		// Map image size to FAL format
		const sizeMap = {
			'1:1': 'square_hd',
			'4:3': 'portrait_4_3',
			'16:9': 'landscape_16_9',
			'9:16': 'portrait_16_9',
			'3:4': 'portrait_4_3'
		};
		const falImageSize = sizeMap[aspectRatio] || imageSize || 'landscape_4_3';

		// Determine FAL model endpoint based on selectedModel
		let falModel;
		let modelName;
		let defaultSteps;
		let defaultGuidance;

		switch (selectedModel) {
			case 'flux-schnell':
				falModel = "fal-ai/flux/schnell";
				modelName = 'FLUX Schnell';
				defaultSteps = 4;  // FLUX Schnell uses fewer steps (max 12)
				defaultGuidance = 3.5;  // Different default guidance
				break;
			case 'flux-1-srpo':
			default:
				falModel = "fal-ai/flux-1/srpo";
				modelName = 'FLUX.1 SRPO';
				defaultSteps = 28;
				defaultGuidance = 4.5;
				break;
		}

		// Validate and cap steps for FLUX Schnell
		let finalSteps = numInferenceSteps || defaultSteps;
		if (selectedModel === 'flux-schnell' && finalSteps > 12) {
			console.warn(`FLUX Schnell max steps is 12, capping ${finalSteps} to 12`);
			finalSteps = 12;
		}

		console.log('Starting image generation with prompt:', prompt);
		console.log('Using model:', modelName);
		console.log('Steps:', finalSteps, 'Guidance:', guidanceScale || defaultGuidance);

		// Prepare input parameters based on model
		const inputParams = {
			prompt: prompt.trim(), // Use exact user prompt without modification
			image_size: falImageSize,
			num_inference_steps: finalSteps,
			num_images: 1,
			enable_safety_checker: true,
			output_format: 'jpeg'
		};

		// Add model-specific parameters
		if (selectedModel === 'flux-schnell') {
			// FLUX Schnell specific parameters
			inputParams.guidance_scale = guidanceScale || defaultGuidance;
		} else {
			// FLUX SRPO specific parameters
			inputParams.guidance_scale = guidanceScale || defaultGuidance;
			inputParams.acceleration = 'regular';
		}

		// Submit request to FAL AI Queue to get request_id
		const { request_id } = await fal.queue.submit(falModel, {
			input: inputParams
		});

		// Create AI Generation record with FAL request_id
		const aiGeneration = await AIGeneration.create({
			user: userId,
			type: 'image',
			model: modelName,
			prompt: prompt.trim(), // Store exact user prompt
			parameters: {
				style: style || '',
				aspectRatio: aspectRatio || '16:9',
				steps: finalSteps,
				quality: guidanceScale || defaultGuidance
			},
			status: 'processing',
			falRequestId: request_id
		});

		console.log('Created AI Generation record:', aiGeneration._id);
		console.log('FAL Request ID:', request_id);

		// Return the FAL request_id for tracking
		res.json({
			success: true,
			message: 'Image generation started',
			requestId: request_id, // This is the FAL request_id
			aiGenerationId: aiGeneration._id,
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
 * Check Generation Status and Get Result
 * GET /api/posts/generation/:requestId
 */
exports.getGenerationResult = async (req, res) => {
	try {
		const { requestId } = req.params;

		console.log('Checking generation status for request:', requestId);

		// Find the AI Generation record to determine which model was used
		const aiGeneration = await AIGeneration.findOne({ falRequestId: requestId });

		if (!aiGeneration) {
			return res.status(404).json({
				success: false,
				message: 'Generation request not found'
			});
		}

		// Determine FAL model endpoint based on the stored model
		let falModel;
		if (aiGeneration.model === 'FLUX Schnell') {
			falModel = "fal-ai/flux/schnell";
		} else {
			falModel = "fal-ai/flux-1/srpo"; // Default to SRPO
		}

		console.log('Using FAL model:', falModel);

		// Check status from FAL AI - using correct parameter name
		const status = await fal.queue.status(falModel, {
			requestId: requestId,
			logs: true
		});

		console.log('FAL Status:', status.status);

		// If completed, get the result
		if (status.status === "COMPLETED") {
			const result = await fal.queue.result(falModel, {
				requestId: requestId
			});

			console.log('Generation completed successfully');
			console.log('Result data:', result.data);

			// Update AI Generation record
			await AIGeneration.findOneAndUpdate(
				{ falRequestId: requestId },
				{
					resultUrl: result.data.images[0]?.url,
					status: 'completed',
					'parameters.seed': result.data.seed?.toString()
				}
			);

			return res.json({
				success: true,
				status: 'completed',
				requestId: requestId,
				imageUrl: result.data.images[0]?.url,
				seed: result.data.seed,
				prompt: result.data.prompt,
				data: result.data
			});
		}

		// If failed
		if (status.status === "FAILED") {
			await AIGeneration.findOneAndUpdate(
				{ falRequestId: requestId },
				{
					status: 'failed',
					errorMessage: 'Generation failed'
				}
			);

			return res.json({
				success: false,
				status: 'failed',
				requestId: requestId,
				message: 'Generation failed'
			});
		}

		// If still processing
		res.json({
			success: true,
			status: status.status.toLowerCase(),
			requestId: requestId,
			queuePosition: status.queue_position || null,
			logs: status.logs || []
		});

	} catch (error) {
		console.error('Get generation result error:', error);
		console.error('Error details:', error.body || error);
		res.status(500).json({
			success: false,
			message: 'Failed to get generation result',
			error: error.message,
			details: error.body || null
		});
	}
};

/**
 * Create Post from Generated Image
 * POST /api/posts/create-from-generation
 */
exports.createPostFromGeneration = async (req, res) => {
	try {
		const testUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
		const userId = req.user?.id || req.user?._id || testUserId;

		const {
			requestId,
			caption,
			title,
			type = 'content',
			category = 'image-post',
			tags = [],
			visibility = 'public',
			status = 'published'
		} = req.body;

		// Validate required fields
		if (!requestId) {
			return res.status(400).json({
				success: false,
				message: 'Request ID is required'
			});
		}

		// Find the AI Generation record
		const aiGeneration = await AIGeneration.findOne({ falRequestId: requestId });
		if (!aiGeneration) {
			return res.status(404).json({
				success: false,
				message: 'Generation not found'
			});
		}

		if (aiGeneration.status !== 'completed' || !aiGeneration.resultUrl) {
			return res.status(400).json({
				success: false,
				message: 'Generation is not completed or has no result'
			});
		}

		// Upload image to Cloudinary
		const uploadResult = await uploadToCloudinary(aiGeneration.resultUrl, userId);
		const cloudinaryUrl = uploadResult.secure_url;
		const thumbnailUrl = uploadResult.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill/');

		// Create post
		const post = await Post.create({
			author: userId,
			type,
			category,
			caption: caption || `AI generated image: ${aiGeneration.prompt}`,
			title: title || 'AI Generated Image',
			mediaUrl: cloudinaryUrl,
			thumbnailUrl,
			mediaType: 'image/jpeg',
			aiGenerated: true,
			aiDetails: {
				model: aiGeneration.model, // Use the actual model from AI Generation record
				prompt: aiGeneration.prompt,
				style: aiGeneration.parameters?.style || '',
				aspectRatio: aiGeneration.parameters?.aspectRatio || '16:9',
				steps: aiGeneration.parameters?.steps || 28,
				seed: aiGeneration.parameters?.seed || '',
				requestId: requestId
			},
			tags: tags.map(tag => tag.toLowerCase().trim()),
			visibility,
			status
		});

		// Link AI Generation to Post
		await AIGeneration.findByIdAndUpdate(aiGeneration._id, {
			post: post._id
		});

		// Populate author details (create a basic user object for test)
		const populatedPost = await Post.findById(post._id).populate('author', 'username avatar verified');

		console.log('Post created successfully:', post._id);

		res.status(201).json({
			success: true,
			message: 'Post created successfully from generated image',
			post: populatedPost
		});

	} catch (error) {
		console.error('Create post from generation error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to create post from generation',
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
		const testUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
		const userId = req.user?.id || req.user?._id || testUserId;
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
		// if (userId.toString() !== testUserId.toString()) {
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

/**
 * Get FAL Request Status (Direct FAL API tracking)
 * GET /api/posts/fal-status/:requestId
 */
exports.getFalStatus = async (req, res) => {
	try {
		const { requestId } = req.params;

		// Find the AI Generation record to determine which model was used
		const aiGeneration = await AIGeneration.findOne({ falRequestId: requestId });

		if (!aiGeneration) {
			return res.status(404).json({
				success: false,
				message: 'Generation request not found'
			});
		}

		// Determine FAL model endpoint based on the stored model
		let falModel;
		if (aiGeneration.model === 'FLUX Schnell') {
			falModel = "fal-ai/flux/schnell";
		} else {
			falModel = "fal-ai/flux-1/srpo"; // Default to SRPO
		}

		console.log('Checking FAL status for model:', falModel, 'requestId:', requestId);

		// Get status from FAL AI
		const status = await fal.queue.status(falModel, {
			requestId: requestId,
			logs: true
		});

		res.json({
			success: true,
			falStatus: status.status,
			requestId: requestId,
			logs: status.logs || [],
			queuePosition: status.queue_position || null,
			responseUrl: status.response_url || null
		});

	} catch (error) {
		console.error('FAL status error:', error);
		console.error('Error details:', error.body || error);
		res.status(500).json({
			success: false,
			message: 'Failed to get FAL status',
			error: error.message,
			details: error.body || null
		});
	}
};

/**
 * Get FAL Result (Direct FAL API result)
 * GET /api/posts/fal-result/:requestId
 */
exports.getFalResult = async (req, res) => {
	try {
		const { requestId } = req.params;

		// Find the AI Generation record to determine which model was used
		const aiGeneration = await AIGeneration.findOne({ falRequestId: requestId });

		if (!aiGeneration) {
			return res.status(404).json({
				success: false,
				message: 'Generation request not found'
			});
		}

		// Determine FAL model endpoint based on the stored model
		let falModel;
		if (aiGeneration.model === 'FLUX Schnell') {
			falModel = "fal-ai/flux/schnell";
		} else {
			falModel = "fal-ai/flux-1/srpo"; // Default to SRPO
		}

		console.log('Getting FAL result for model:', falModel, 'requestId:', requestId);

		// Get result from FAL AI
		const result = await fal.queue.result(falModel, {
			requestId: requestId
		});

		console.log('FAL result retrieved successfully');

		res.json({
			success: true,
			requestId: requestId,
			data: result.data,
			images: result.data.images || [],
			seed: result.data.seed,
			prompt: result.data.prompt
		});

	} catch (error) {
		console.error('FAL result error:', error);
		console.error('Error details:', error.body || error);
		res.status(500).json({
			success: false,
			message: 'Failed to get FAL result',
			error: error.message,
			details: error.body || null
		});
	}
};

/**
 * Get My AI Generations (Not Posted)
 * GET /api/posts/my-generations
 */
exports.getMyGenerations = async (req, res) => {
	try {
		// Extract user ID - handles both User object and JWT payload
		const userId = req.user?._id || req.user?.id || req.user?.userId;

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'User not authenticated'
			});
		}

		console.log('Fetching generations for user:', userId);

		// Query parameters for pagination
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const skip = (page - 1) * limit;

		// Find all completed AI generations that haven't been posted yet
		const generations = await AIGeneration.find({
			user: userId,
			status: 'completed',
			post: { $exists: false } // No post associated
		})
			.sort({ createdAt: -1 }) // Most recent first
			.skip(skip)
			.limit(limit)
			.select('prompt model resultUrl thumbnailUrl parameters createdAt type userRating');

		// Get total count for pagination
		const total = await AIGeneration.countDocuments({
			user: userId,
			status: 'completed',
			post: { $exists: false }
		});

		res.json({
			success: true,
			message: 'AI generations retrieved successfully',
			data: {
				generations,
				pagination: {
					currentPage: page,
					totalPages: Math.ceil(total / limit),
					totalItems: total,
					itemsPerPage: limit
				}
			}
		});

	} catch (error) {
		console.error('Get my generations error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch AI generations',
			error: error.message
		});
	}
};
