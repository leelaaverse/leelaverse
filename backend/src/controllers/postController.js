const prisma = require('../models');
const { fal } = require("@fal-ai/client");
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

// Debug: Log Cloudinary configuration (remove in production)
console.log('Cloudinary Config:', {
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing',
	api_key: process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing',
	api_secret: process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing'
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
		// Use authenticated user ID or fallback to existing user
		const userId = req.user?.id || 'cmh0b61s30000oadwipl47rkk'; // mainikhilhun

		const {
			prompt,
			imageSize,
			numInferenceSteps,
			guidanceScale,
			style,
			aspectRatio,
			selectedModel,
			numImages = 1 // Number of images to generate (1-4)
		} = req.body;

		// Validate prompt
		if (!prompt || prompt.trim().length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Prompt is required'
			});
		}

		// Validate numImages
		const imageCount = Math.min(Math.max(parseInt(numImages) || 1, 1), 4);
		console.log(`Generating ${imageCount} image(s)`);


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

		// Generate multiple images by submitting multiple requests
		const generations = [];

		for (let i = 0; i < imageCount; i++) {
			// Submit request to FAL AI Queue to get request_id
			const { request_id } = await fal.queue.submit(falModel, {
				input: inputParams
			});

			// Create AI Generation record with FAL request_id using Prisma
			const aiGeneration = await prisma.aIGeneration.create({
				data: {
					userId: userId,
					type: 'image',
					model: modelName,
					prompt: prompt.trim(),
					style: style || null,
					aspectRatio: aspectRatio || '16:9',
					steps: finalSteps,
					quality: (guidanceScale || defaultGuidance).toString(),
					status: 'processing',
					falRequestId: request_id
				}
			});

			console.log(`Created AI Generation record ${i + 1}/${imageCount}:`, aiGeneration.id);
			console.log('FAL Request ID:', request_id);

			generations.push({
				requestId: request_id,
				aiGenerationId: aiGeneration.id
			});
		}

		// Return array of request IDs for tracking
		res.json({
			success: true,
			message: `${imageCount} image generation(s) started`,
			generations: generations,
			count: imageCount,
			estimatedTime: '15-30 seconds per image'
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
		const aiGeneration = await prisma.aIGeneration.findFirst({ where: { falRequestId: requestId } });
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
			await prisma.aIGeneration.updateMany({
				where: { falRequestId: requestId },
				data: {
					resultUrl: result.data.images[0]?.url,
					status: 'completed',
					seed: result.data.seed?.toString()
				}
			});

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
			await prisma.aIGeneration.updateMany({
				where: { falRequestId: requestId },
				data: {
					status: 'failed',
					errorMessage: 'Generation failed'
				}
			});

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
 * Create Post from Generated Images (Multiple Support)
 * POST /api/posts/create-from-generation
 */
exports.createPostFromGeneration = async (req, res) => {
	try {
		// Use authenticated user ID or fallback to existing user
		const userId = req.user?.id || 'cmh0b61s30000oadwipl47rkk'; // mainikhilhun

		const {
			aiGenerationIds = [], // Array of AI generation IDs
			caption,
			title,
			type = 'content',
			category = 'image-post',
			tags = [],
			visibility = 'public'
		} = req.body;

		// Validate required fields
		if (!aiGenerationIds || aiGenerationIds.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'At least one AI generation ID is required'
			});
		}

		console.log(`Creating post from ${aiGenerationIds.length} AI generation(s)`);

		// Find all AI Generation records
		const aiGenerations = await prisma.aIGeneration.findMany({
			where: {
				id: { in: aiGenerationIds },
				userId: userId
			}
		});

		if (aiGenerations.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'No generations found'
			});
		}

		// Check if all generations are completed
		const incompleteGens = aiGenerations.filter(g => g.status !== 'completed' || !g.resultUrl);
		if (incompleteGens.length > 0) {
			return res.status(400).json({
				success: false,
				message: `${incompleteGens.length} generation(s) are not completed or have no result`
			});
		}

		// Upload all images to Cloudinary
		const imageUrls = aiGenerations.map(g => g.resultUrl);

		// Use the createPost function with these images
		const postData = {
			caption: caption || `AI generated image${aiGenerations.length > 1 ? 's' : ''}: ${aiGenerations[0].prompt}`,
			title: title || 'AI Generated Image',
			type,
			category,
			imageUrls,
			aiGenerationIds,
			aiGenerated: true,
			aiDetails: {
				model: aiGenerations[0].model,
				prompt: aiGenerations[0].prompt,
				style: aiGenerations[0].style,
				aspectRatio: aiGenerations[0].aspectRatio,
				steps: aiGenerations[0].steps,
				seed: aiGenerations[0].seed
			},
			tags: tags.map(tag => tag.toLowerCase().trim()),
			visibility
		};

		// Reuse createPost logic
		req.body = postData;
		return await exports.createPost(req, res);

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
		console.log('Downloading image from FAL:', imageUrl);
		// Download image from FAL
		const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
		const buffer = Buffer.from(response.data);
		console.log('Image downloaded, size:', buffer.length, 'bytes');

		console.log('Uploading to Cloudinary with config:', {
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			folder: `leelaverse/posts/${userId}`,
		});

		// Upload to Cloudinary
		return new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: `leelaverse/posts/${userId}`,
					resource_type: 'image'
				},
				(error, result) => {
					if (error) {
						console.error('Cloudinary upload error:', error);
						reject(error);
					} else {
						console.log('Cloudinary upload success:', result.secure_url);
						resolve(result);
					}
				}
			);

			uploadStream.end(buffer);
		});
	} catch (error) {
		console.error('Cloudinary upload error:', error);
		throw new Error(`Failed to upload image to storage: ${error.message}`);
	}
}

/**
 * Create Post with Multiple Images Support (Prisma)
 * POST /api/posts
 */
exports.createPost = async (req, res) => {
	try {
		// Use authenticated user ID or fallback to existing user
		const userId = req.user?.id || 'cmh0b61s30000oadwipl47rkk'; // mainikhilhun
		const {
			caption,
			title,
			type = 'content',
			category = 'image-post',
			imageUrls = [], // Array of image URLs from FAL AI or direct URLs
			aiGenerationIds = [], // Array of AI generation IDs to link
			aiGenerated = false,
			aiDetails = {},
			tags = [],
			visibility = 'public'
		} = req.body;

		console.log('Creating post:', { userId, category, imageCount: imageUrls.length, aiGenerated });

		// Validate content based on category
		if (category === 'text-post' && !caption) {
			return res.status(400).json({
				success: false,
				message: 'Caption is required for text posts'
			});
		}

		if ((category === 'image-post' || category === 'image-text-post') && imageUrls.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'At least one image is required for image posts'
			});
		}

		let cloudinaryUrls = [];
		let thumbnailUrl = null;

		// Upload images to Cloudinary if provided
		if (imageUrls.length > 0) {
			console.log(`Uploading ${imageUrls.length} image(s) to Cloudinary...`);

			for (let i = 0; i < imageUrls.length; i++) {
				try {
					const uploadResult = await uploadToCloudinary(imageUrls[i], userId);
					cloudinaryUrls.push(uploadResult.secure_url);
					console.log(`Uploaded image ${i + 1}/${imageUrls.length} to Cloudinary`);

					// Use first image as thumbnail (just use the same URL without transformation)
					if (i === 0) {
						thumbnailUrl = uploadResult.secure_url;
					}
				} catch (uploadError) {
					console.error(`Failed to upload image ${i + 1}:`, uploadError);
					throw new Error(`Failed to upload image ${i + 1}: ${uploadError.message}`);
				}
			}
		}

		// Prepare post data
		const postData = {
			authorId: userId,
			type: type,
			category: category,
			caption: caption || null,
			title: title || null,
			mediaUrls: cloudinaryUrls, // Store multiple URLs
			mediaUrl: cloudinaryUrls[0] || null, // First image for backward compatibility
			thumbnailUrl: thumbnailUrl,
			mediaType: cloudinaryUrls.length > 0 ? 'image/jpeg' : null,
			aiGenerated: aiGenerated,
			tags: tags.map(tag => tag.toLowerCase().trim()),
			visibility: visibility
		};

		// Add AI details if applicable
		if (aiGenerated && aiDetails) {
			postData.aiModel = aiDetails.model || null;
			postData.aiPrompt = aiDetails.prompt || null;
			postData.aiEnhancedPrompt = aiDetails.enhancedPrompt || null;
			postData.aiStyle = aiDetails.style || null;
			postData.aiAspectRatio = aiDetails.aspectRatio || null;
			postData.aiSteps = aiDetails.steps || null;
			postData.aiGenerationTime = aiDetails.generationTime || null;
			postData.aiSeed = aiDetails.seed || null;
		}

		// Create post using Prisma
		const post = await prisma.post.create({
			data: postData,
			include: {
				author: {
					select: {
						id: true,
						username: true,
						firstName: true,
						lastName: true,
						avatar: true,
						verificationStatus: true
					}
				}
			}
		});

		console.log('Post created successfully:', post.id);

		// Link AI Generations to Post if provided
		if (aiGenerated && aiGenerationIds.length > 0) {
			await prisma.aIGeneration.updateMany({
				where: {
					id: { in: aiGenerationIds }
				},
				data: {
					postId: post.id
				}
			});
			console.log(`Linked ${aiGenerationIds.length} AI generation(s) to post`);
		}

		// Update user stats (increment totalCreations)
		await prisma.user.update({
			where: { id: userId },
			data: {
				totalCreations: {
					increment: 1
				}
			}
		});

		res.status(201).json({
			success: true,
			message: 'Post created successfully',
			post: post
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
 * Get User Posts (Prisma)
 * GET /api/posts/user/:userId
 */
exports.getUserPosts = async (req, res) => {
	try {
		const { userId } = req.params;
		const { category, page = 1, limit = 20 } = req.query;

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const whereClause = {
			authorId: userId,
			isApproved: true
		};

		if (category) {
			whereClause.category = category;
		}

		const posts = await prisma.post.findMany({
			where: whereClause,
			include: {
				author: {
					select: {
						id: true,
						username: true,
						firstName: true,
						lastName: true,
						avatar: true,
						verificationStatus: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			},
			skip: skip,
			take: parseInt(limit)
		});

		const total = await prisma.post.count({
			where: whereClause
		});

		res.json({
			success: true,
			posts,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / parseInt(limit))
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
 * Get Feed Posts (Prisma)
 * GET /api/posts/feed
 */
exports.getFeedPosts = async (req, res) => {
	try {
		const userId = req.user?.id;
		const { category, page = 1, limit = 20 } = req.query;

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const whereClause = {
			isApproved: true,
			visibility: {
				in: ['public', 'followers']
			}
		};

		if (category) {
			whereClause.category = category;
		}

		const posts = await prisma.post.findMany({
			where: whereClause,
			include: {
				author: {
					select: {
						id: true,
						username: true,
						firstName: true,
						lastName: true,
						avatar: true,
						verificationStatus: true,
						totalCreations: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			},
			skip: skip,
			take: parseInt(limit)
		});

		const total = await prisma.post.count({
			where: whereClause
		});

		res.json({
			success: true,
			posts,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / parseInt(limit))
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
 * Get Single Post (Prisma)
 * GET /api/posts/:postId
 */
exports.getPost = async (req, res) => {
	try {
		const { postId } = req.params;

		const post = await prisma.post.findUnique({
			where: {
				id: postId
			},
			include: {
				author: {
					select: {
						id: true,
						username: true,
						firstName: true,
						lastName: true,
						avatar: true,
						verificationStatus: true,
						totalCreations: true
					}
				}
			}
		});

		if (!post) {
			return res.status(404).json({
				success: false,
				message: 'Post not found'
			});
		}

		// Increment views
		await prisma.post.update({
			where: { id: postId },
			data: {
				viewsCount: {
					increment: 1
				}
			}
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
 * Delete Post (Prisma)
 * DELETE /api/posts/:postId
 */
exports.deletePost = async (req, res) => {
	try {
		const { postId } = req.params;
		const userId = req.user.id;

		const post = await prisma.post.findFirst({
			where: {
				id: postId,
				authorId: userId
			}
		});

		if (!post) {
			return res.status(404).json({
				success: false,
				message: 'Post not found or unauthorized'
			});
		}

		// Delete post (hard delete or you could add a deletedAt field)
		await prisma.post.delete({
			where: {
				id: postId
			}
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
		const userId = req.user?.id || req.user?.userId;

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

		// Find all completed AI generations that haven't been posted yet using Prisma
		const generations = await prisma.aIGeneration.findMany({
			where: {
				userId: userId,
				status: 'completed',
				postId: null // No post associated
			},
			orderBy: {
				createdAt: 'desc' // Most recent first
			},
			skip: skip,
			take: limit,
			select: {
				id: true,
				prompt: true,
				model: true,
				resultUrl: true,
				thumbnailUrl: true,
				style: true,
				aspectRatio: true,
				steps: true,
				quality: true,
				seed: true,
				createdAt: true,
				type: true
			}
		});

		// Get total count for pagination
		const total = await prisma.aIGeneration.count({
			where: {
				userId: userId,
				status: 'completed',
				postId: null
			}
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
