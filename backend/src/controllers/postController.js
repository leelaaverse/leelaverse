const prisma = require('../models');
const { fal } = require("@fal-ai/client");
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const { getAllModels, getModelsByType, getFeaturedModels, getModelById, getModelConfig } = require('../config/aiModels');
const { createNotification } = require('../utils/notificationService');

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
 * Get Available AI Models
 * GET /api/posts/models
 */
exports.getAvailableModels = async (req, res) => {
	try {
		const { type, featured } = req.query;

		let models;
		if (type) {
			models = featured === 'true'
				? getFeaturedModels(type)
				: getModelsByType(type);
		} else {
			models = getAllModels();
		}

		res.json({
			success: true,
			models,
			message: 'Available AI models retrieved successfully'
		});
	} catch (error) {
		console.error('Get models error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get available models',
			error: error.message
		});
	}
};

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

		// Calculate total cost
		const modelConfig = getModelConfig(selectedModel);
		const creditCostPerImage = modelConfig ? modelConfig.creditCost : (selectedModel === 'flux-schnell' ? 50 : 100);
		const totalCreditCost = creditCostPerImage * imageCount;

		// Verify User has enough coins before generating
		const dbUser = await prisma.user.findUnique({
			where: { id: userId }
		});

		if (!dbUser || dbUser.coinBalance < totalCreditCost) {
			return res.status(400).json({
				success: false,
				message: `Insufficient coins. You need ${totalCreditCost} coins to generate ${imageCount} ${modelName} image(s), but you currently have ${dbUser?.coinBalance || 0}.`
			});
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

		// Deduct coins and log transaction
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				coinBalance: {
					decrement: totalCreditCost
				},
				totalCoinsSpent: {
					increment: totalCreditCost
				}
			}
		});

		await prisma.coinTransaction.create({
			data: {
				userId: userId,
				type: 'spend',
				amount: totalCreditCost,
				balanceAfter: updatedUser.coinBalance,
				description: `Generated ${imageCount} AI Image(s) using ${modelName}`
			}
		});

		// Return array of request IDs for tracking
		res.json({
			success: true,
			message: `${imageCount} image generation(s) started. ${totalCreditCost} coins deducted.`,
			generations: generations,
			count: imageCount,
			estimatedTime: '15-30 seconds per image',
			newBalance: updatedUser.coinBalance
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
 * Generate Video using FAL AI
 * POST /api/posts/generate-video
 */
exports.generateVideo = async (req, res) => {
	try {
		// Use authenticated user ID or fallback to existing user (same as image for now)
		const userId = req.user?.id || 'cmh0b61s30000oadwipl47rkk';

		const {
			prompt,
			selectedModel,
			aspectRatio,
			duration
		} = req.body;

		if (!prompt || prompt.trim().length === 0) {
			return res.status(400).json({ success: false, message: 'Prompt is required' });
		}

		const modelConfig = getModelConfig(selectedModel);
		if (!modelConfig) {
			return res.status(400).json({ success: false, message: 'Invalid model selected' });
		}

		const falModel = modelConfig.falEndpoint;
		const modelName = getModelById(selectedModel)?.name || selectedModel;

		console.log(`Starting VIDEO generation with model: ${modelName} (${falModel})`);

		// construct input based on model requirements
		const inputParams = {
			prompt: prompt.trim()
		};

		// Ratio mapping for video
		const aspectMap = {
			'16:9': '16:9',
			'9:16': '9:16',
			'1:1': '1:1',
			'custom': '16:9'
		};

		// Add model-specific params
		if (selectedModel.includes('kling')) {
			inputParams.aspect_ratio = aspectMap[aspectRatio] || '16:9';
			inputParams.duration = duration || '5'; // Kling usually takes string '5' or '10'
		} else if (selectedModel.includes('minimax') || selectedModel.includes('hailuo')) {
			// Minimax params
			// Usually just prompt, but check docs if needed. Defaulting to basic prompt.
		} else if (selectedModel.includes('luma')) {
			inputParams.aspect_ratio = aspectMap[aspectRatio] || '16:9';
		} else {
			// Default fallback for generic params
			inputParams.aspect_ratio = aspectMap[aspectRatio] || '16:9';
		}

		// Calculate total cost
		const creditCost = modelConfig.creditCost || 150; // default for unknown models
		const totalCreditCost = creditCost; // Currently we only generate one video at a time

		// Verify User has enough coins before generating
		const dbUser = await prisma.user.findUnique({
			where: { id: userId }
		});

		if (!dbUser || dbUser.coinBalance < totalCreditCost) {
			return res.status(400).json({
				success: false,
				message: `Insufficient coins. You need ${totalCreditCost} coins to generate a ${modelName} video, but you currently have ${dbUser?.coinBalance || 0}.`
			});
		}

		// Submit to FAL
		const { request_id } = await fal.queue.submit(falModel, {
			input: inputParams
		});

		// Deduct coins and log transaction
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				coinBalance: {
					decrement: totalCreditCost
				},
				totalCoinsSpent: {
					increment: totalCreditCost
				}
			}
		});

		await prisma.coinTransaction.create({
			data: {
				userId: userId,
				type: 'spend',
				amount: totalCreditCost,
				balanceAfter: updatedUser.coinBalance,
				description: `Generated AI Video using ${modelName}`
			}
		});

		// Create record
		const aiGeneration = await prisma.aIGeneration.create({
			data: {
				userId: userId,
				type: 'video',
				model: modelName,
				prompt: prompt.trim(),
				aspectRatio: aspectRatio || '16:9',
				status: 'processing',
				falRequestId: request_id
			}
		});

		res.json({
			success: true,
			message: 'Video generation started',
			generations: [{
				requestId: request_id,
				aiGenerationId: aiGeneration.id
			}],
			estimatedTime: '60-120 seconds'
		});

	} catch (error) {
		console.error('Generate video error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to start video generation',
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

		// Find the AI Generation to look up model & type
		const aiGeneration = await prisma.aIGeneration.findFirst({ where: { falRequestId: requestId } });
		if (!aiGeneration) {
			return res.status(404).json({
				success: false,
				message: 'Generation request not found'
			});
		}

		// Find model config dynamically or fallback
		const allModels = getAllModels();
		const foundModel = [...allModels.image, ...allModels.video].find(m => m.name === aiGeneration.model);

		let falModel;
		if (foundModel) {
			falModel = foundModel.falEndpoint;
		} else {
			// Legacy fallbacks
			if (aiGeneration.model === 'FLUX Schnell') falModel = "fal-ai/flux/schnell";
			else falModel = "fal-ai/flux-1/srpo"; // default fallback
		}

		// Check status
		const status = await fal.queue.status(falModel, {
			requestId: requestId,
			logs: true
		});

		if (status.status === "COMPLETED") {
			const result = await fal.queue.result(falModel, {
				requestId: requestId
			});

			// Extract URL based on type
			let resultUrl = null;
			let seed = null;

			// Handle video vs image output format
			if (result.data.video?.url) {
				resultUrl = result.data.video.url;
			} else if (result.data.video_url) {
				resultUrl = result.data.video_url;
			} else if (result.data.url) { // some models return direct url at root
				resultUrl = result.data.url;
			} else if (result.data.images && result.data.images[0]?.url) {
				resultUrl = result.data.images[0].url;
			}

			if (result.data.seed) {
				seed = result.data.seed;
			}

			// Update record
			await prisma.aIGeneration.updateMany({
				where: { falRequestId: requestId },
				data: {
					resultUrl: resultUrl,
					status: 'completed',
					seed: seed ? seed.toString() : null
				}
			});

			return res.json({
				success: true,
				status: 'completed',
				requestId: requestId,
				imageUrl: resultUrl, // Keep property name consistent for frontend
				videoUrl: resultUrl, // Add this for clarity
				seed: seed,
				prompt: result.data.prompt,
				data: result.data
			});
		}

		if (status.status === "FAILED") {
			await prisma.aIGeneration.updateMany({
				where: { falRequestId: requestId },
				data: {
					status: 'failed',
					errorMessage: 'Generation failed'
				}
			});
			return res.json({ success: false, status: 'failed', requestId: requestId });
		}

		res.json({
			success: true,
			status: status.status.toLowerCase(),
			requestId: requestId,
			queuePosition: status.queue_position || null,
			logs: status.logs || []
		});

	} catch (error) {
		console.error('Get result error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get generation result',
			error: error.message
		});
	}
};

/**
 * Create Post from Generated Images (Multiple Support)
 * POST /api/posts/create-from-generation
 */
exports.createPostFromGeneration = async (req, res) => {
	try {
		// MUST have authenticated user - no fallback for post creation
		const userId = req.user?.id;

		console.log('🔐 Authentication Check:', {
			hasReqUser: !!req.user,
			userId: userId,
			userObject: req.user
		});

		// Validate user authentication FIRST
		if (!userId) {
			console.error('❌ No authenticated user found. Cannot create post.');
			return res.status(401).json({
				success: false,
				message: 'Authentication required. Please log in to create a post.'
			});
		}

		const {
			aiGenerationIds = [], // Array of AI generation IDs
			caption,
			title,
			type = 'content',
			category = 'image-post',
			tags = [],
			visibility = 'public'
		} = req.body;

		console.log('🔍 Request Body Debug:', {
			receivedVisibility: req.body.visibility,
			defaultedVisibility: visibility,
			fullBody: req.body
		});

		// Validate required fields
		if (!aiGenerationIds || aiGenerationIds.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'At least one AI generation ID is required'
			});
		}

		console.log(`Creating post from ${aiGenerationIds.length} AI generation(s)`);		// Find all AI Generation records
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

		console.log('📦 Post Data Being Passed to createPost:', {
			visibility: postData.visibility,
			aiGenerated: postData.aiGenerated,
			imageCount: postData.imageUrls.length
		});

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
 * Upload Image and Create Post (Direct File Upload)
 * POST /api/posts/upload
 */
exports.uploadAndCreatePost = async (req, res) => {
	try {
		// MUST have authenticated user
		const userId = req.user?.id;

		console.log('📤 Upload and Create Post - Auth Check:', {
			hasReqUser: !!req.user,
			userId: userId
		});

		if (!userId) {
			console.error('❌ No authenticated user found. Cannot upload.');
			return res.status(401).json({
				success: false,
				message: 'Authentication required. Please log in to upload.'
			});
		}

		const {
			image, // Base64 encoded image or video
			caption,
			title,
			tags = [],
			locationName,
			visibility = 'public'
		} = req.body;

		// Validate media
		if (!image) {
			return res.status(400).json({
				success: false,
				message: 'Media data is required'
			});
		}

		// Detect if it's a video or image from base64 data
		const isVideo = image.startsWith('data:video/');
		const resourceType = isVideo ? 'video' : 'image';

		console.log(`📤 Uploading ${resourceType} to Cloudinary for user:`, userId);

		// Upload to Cloudinary directly using base64
		const uploadOptions = {
			folder: `leelaverse/posts/${userId}`,
			resource_type: resourceType
		};

		// Add transformations based on type
		if (isVideo) {
			// Video-specific options
			uploadOptions.eager = [
				{ width: 1280, height: 720, crop: 'limit', quality: 'auto:good', format: 'mp4' }
			];
			uploadOptions.eager_async = true;
		} else {
			// Image-specific transformations
			uploadOptions.transformation = [
				{ quality: 'auto:good' },
				{ fetch_format: 'auto' }
			];
		}

		const uploadResult = await cloudinary.uploader.upload(image, uploadOptions);

		console.log('✅ Cloudinary upload success:', uploadResult.secure_url);

		// Determine media type and category
		let mediaType, category, postTitle;
		if (isVideo) {
			mediaType = 'video/mp4';
			category = 'video-post';
			postTitle = title || 'Uploaded Video';
		} else {
			mediaType = 'image/jpeg';
			category = 'image-post';
			postTitle = title || 'Uploaded Image';
		}

		// Create post with the uploaded media
		const postData = {
			authorId: userId,
			type: 'content',
			category: category,
			caption: caption || null,
			title: postTitle,
			mediaUrls: [uploadResult.secure_url],
			mediaUrl: uploadResult.secure_url,
			thumbnailUrl: uploadResult.secure_url,
			mediaType: mediaType,
			aiGenerated: false,
			tags: tags.map(tag => tag.toLowerCase().trim()),
			locationName: locationName || null,
			visibility: visibility,
			isApproved: true
		};

		console.log('💾 Creating post with data:', {
			authorId: postData.authorId,
			category: postData.category,
			visibility: postData.visibility,
			hasMediaUrl: !!postData.mediaUrl
		});

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

		console.log('✅ Post created successfully!', post.id);

		// Update user stats
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
			message: `${isVideo ? 'Video' : 'Image'} uploaded and post created successfully`,
			post: post,
			upload: {
				url: uploadResult.secure_url,
				publicId: uploadResult.public_id,
				width: uploadResult.width,
				height: uploadResult.height,
				duration: uploadResult.duration || null, // Video duration if applicable
				format: uploadResult.format,
				resourceType: uploadResult.resource_type
			}
		});

	} catch (error) {
		console.error('❌ Upload and create post error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to upload image and create post',
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
		// Get user ID from request - require authentication for AI-generated posts
		const userId = req.user?.id;

		const {
			caption,
			title,
			type = 'content',
			category = 'image-post',
			imageUrls = [], // Array of image URLs from FAL AI or direct URLs
			videoUrls = [], // Array of video URLs for mixed media
			mediaItems = [], // Mixed media array: [{type: 'image'|'video', url: string}]
			aiGenerationIds = [], // Array of AI generation IDs to link
			aiGenerated = false,
			aiDetails = {},
			tags = [],
			visibility = 'public'
		} = req.body;

		// Require authentication for AI-generated posts (no fallback)
		if (aiGenerated && !userId) {
			console.error('❌ Authentication required for AI-generated posts');
			return res.status(401).json({
				success: false,
				message: 'Authentication required to post AI-generated content'
			});
		}

		// For non-AI posts, use fallback (backward compatibility)
		const finalUserId = userId || 'cmh0b61s30000oadwipl47rkk';

		console.log('📝 Creating post:', {
			userId: finalUserId,
			authenticated: !!userId,
			category,
			imageCount: imageUrls.length,
			aiGenerated,
			visibility: visibility,
			receivedVisibility: req.body.visibility
		});		// Validate content based on category
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
					const uploadResult = await uploadToCloudinary(imageUrls[i], finalUserId);
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
			authorId: finalUserId,
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
			visibility: visibility,
			isApproved: true // Explicitly set to true so posts appear in feed immediately
		};

		console.log('💾 Final Post Data Before DB Insert:', {
			visibility: postData.visibility,
			isApproved: postData.isApproved,
			authorId: postData.authorId,
			category: postData.category
		});		// Add mixed media items if provided (store as JSON)
		if (mediaItems && mediaItems.length > 0) {
			postData.mediaItems = mediaItems;
		}

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

		console.log('✅ Post created successfully!');
		console.log('📋 Post Details:', {
			id: post.id,
			authorId: post.authorId,
			isApproved: post.isApproved,
			visibility: post.visibility,
			category: post.category,
			hasMediaUrl: !!post.mediaUrl,
			hasMediaUrls: !!post.mediaUrls,
			hasThumbnail: !!post.thumbnailUrl,
			aiGenerated: post.aiGenerated
		});

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
			console.log(`✅ Linked ${aiGenerationIds.length} AI generation(s) to post`);
		}

		// Update user stats (increment totalCreations)
		await prisma.user.update({
			where: { id: finalUserId },
			data: {
				totalCreations: {
					increment: 1
				}
			}
		});

		console.log('✅ Post creation complete! Should appear in feed immediately.');

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
 * Get All Posts Count (for debugging)
 * GET /api/posts/count
 */
exports.getPostsCount = async (req, res) => {
	try {
		const totalPosts = await prisma.post.count();
		const approvedPosts = await prisma.post.count({ where: { isApproved: true } });
		const publicPosts = await prisma.post.count({
			where: {
				isApproved: true,
				visibility: 'public'
			}
		});

		// Get the 5 most recent posts to verify data
		const recentPosts = await prisma.post.findMany({
			where: { isApproved: true },
			include: {
				author: {
					select: {
						username: true,
						firstName: true,
						lastName: true
					}
				}
			},
			orderBy: [
				{ createdAt: 'desc' },
				{ id: 'desc' }
			],
			take: 5
		});

		const now = new Date();

		res.json({
			success: true,
			currentServerTime: now.toISOString(),
			counts: {
				total: totalPosts,
				approved: approvedPosts,
				public: publicPosts
			},
			recentPosts: recentPosts.map(p => ({
				id: p.id,
				createdAt: p.createdAt,
				ageInSeconds: Math.floor((now - new Date(p.createdAt)) / 1000),
				category: p.category,
				hasImage: !!(p.mediaUrl || p.thumbnailUrl || (p.mediaUrls && p.mediaUrls.length > 0)),
				author: p.author?.username,
				isApproved: p.isApproved,
				visibility: p.visibility
			}))
		});
	} catch (error) {
		console.error('Get posts count error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get posts count',
			error: error.message
		});
	}
};

/**
 * Get Feed Posts (Prisma)
 * GET /api/posts/feed
 */
exports.getBloops = async (req, res) => {
	try {
		const { page = 1, limit = 5 } = req.query;
		const skip = (parseInt(page) - 1) * parseInt(limit);

		console.log('🎬 Bloops Request:', { page, limit });

		const whereClause = {
			isApproved: true,
			category: 'video-post',
			visibility: {
				in: ['public', 'followers']
			}
		};

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
				},
				likes: {
					select: {
						userId: true
					}
				}
			},
			orderBy: [
				{ createdAt: 'desc' },
				{ id: 'desc' }
			],
			skip: skip,
			take: parseInt(limit)
		});

		const total = await prisma.post.count({
			where: whereClause
		});

		console.log('🎬 Bloops Response:', {
			postsCount: posts.length,
			total,
			firstPostCategory: posts[0]?.category,
			firstPostMediaType: posts[0]?.mediaType
		});

		res.json({
			success: true,
			data: {
				posts,
				pagination: {
					page: parseInt(page),
					limit: parseInt(limit),
					total,
					pages: Math.ceil(total / parseInt(limit)),
					hasMore: parseInt(page) < Math.ceil(total / parseInt(limit))
				}
			}
		});

	} catch (error) {
		console.error('Get bloops error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get bloops',
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

		const skip = (parseInt(page) - 1) * parseInt(limit);

		console.log('📡 Feed Posts Request:', {
			category,
			page: parseInt(page),
			limit: parseInt(limit),
			skip
		});

		// Build where clause - more flexible
		const whereClause = {
			isApproved: true
		};

		// Only filter by category if it's explicitly provided and not empty
		if (category && category !== '' && category !== 'featured') {
			whereClause.category = category;
		}

		// Include both public and followers visibility
		whereClause.visibility = {
			in: ['public', 'followers']
		};

		console.log('🔍 Where Clause:', JSON.stringify(whereClause, null, 2));
		console.log('⏰ Current Server Time:', new Date().toISOString());

		// Force fresh query without caching
		let posts = await prisma.post.findMany({
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
				},
				likes: {
					select: {
						userId: true
					}
				}
			},
			orderBy: [
				{ createdAt: 'desc' },
				{ id: 'desc' } // Secondary sort by ID for consistent ordering
			],
			skip: skip,
			take: parseInt(limit)
		});

		let total = await prisma.post.count({
			where: whereClause
		});

		// If no posts found with category filter, try without category
		if (posts.length === 0 && category) {
			console.log('⚠️ No posts found with category filter, trying without category...');
			const fallbackWhere = {
				isApproved: true,
				visibility: {
					in: ['public', 'followers']
				}
			};

			posts = await prisma.post.findMany({
				where: fallbackWhere,
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
					},
					likes: {
						select: {
							userId: true
						}
					}
				},
				orderBy: {
					createdAt: 'desc'
				},
				skip: skip,
				take: parseInt(limit)
			});

			total = await prisma.post.count({
				where: fallbackWhere
			});
		}

		console.log(`✅ Found ${posts.length} posts (Total: ${total})`);

		// Log first and last post for debugging
		if (posts.length > 0) {
			const now = new Date();
			const firstPostAge = Math.floor((now - new Date(posts[0].createdAt)) / 1000); // seconds
			const lastPostAge = Math.floor((now - new Date(posts[posts.length - 1].createdAt)) / 1000);

			console.log('📸 First post (NEWEST):', {
				id: posts[0].id,
				createdAt: posts[0].createdAt,
				ageInSeconds: firstPostAge,
				ageHumanReadable: firstPostAge < 60 ? `${firstPostAge}s ago` : `${Math.floor(firstPostAge / 60)}m ago`,
				hasMediaUrl: !!posts[0].mediaUrl,
				category: posts[0].category,
				authorName: posts[0].author?.username,
				isApproved: posts[0].isApproved,
				visibility: posts[0].visibility
			});
			console.log('📸 Last post (OLDEST in this page):', {
				id: posts[posts.length - 1].id,
				createdAt: posts[posts.length - 1].createdAt,
				ageInSeconds: lastPostAge,
				ageHumanReadable: lastPostAge < 60 ? `${lastPostAge}s ago` : `${Math.floor(lastPostAge / 60)}m ago`,
				authorName: posts[posts.length - 1].author?.username
			});
			console.log('📊 All post IDs with timestamps:', posts.map(p => ({
				id: p.id.substring(0, 8),
				created: new Date(p.createdAt).toISOString().substring(11, 19) // HH:MM:SS
			})));
		}

		const response = {
			success: true,
			posts,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / parseInt(limit)),
				hasMore: parseInt(page) < Math.ceil(total / parseInt(limit))
			}
		};

		console.log('📤 Sending response with', response.posts.length, 'posts');

		res.json(response);

	} catch (error) {
		console.error('❌ Get feed posts error:', error);
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

/**
 * Like a Post
 * POST /api/posts/:postId/like
 */
exports.likePost = async (req, res) => {
	try {
		const { postId } = req.params;
		const userId = req.user.id;

		// Check if post exists
		const post = await prisma.post.findUnique({
			where: { id: postId }
		});

		if (!post) {
			return res.status(404).json({
				success: false,
				message: 'Post not found'
			});
		}

		// Check if already liked
		const existingLike = await prisma.like.findUnique({
			where: {
				userId_postId: {
					userId: userId,
					postId: postId
				}
			}
		});

		if (existingLike) {
			return res.status(400).json({
				success: false,
				message: 'Post already liked',
				isLiked: true,
				likesCount: post.likesCount
			});
		}

		// Create like and increment count in a transaction
		const [like, updatedPost] = await prisma.$transaction([
			prisma.like.create({
				data: {
					userId: userId,
					postId: postId
				}
			}),
			prisma.post.update({
				where: { id: postId },
				data: {
					likesCount: {
						increment: 1
					}
				}
			})
		]);

		console.log(`✅ User ${userId} liked post ${postId}. New count: ${updatedPost.likesCount}`);

		// Send notification
		await createNotification(req, {
			recipientId: post.authorId,
			senderId: userId,
			type: 'like',
			content: 'liked your post',
			postId: postId,
			link: `/post/${postId}`
		});

		res.json({
			success: true,
			message: 'Post liked successfully',
			isLiked: true,
			likesCount: updatedPost.likesCount
		});

	} catch (error) {
		console.error('Like post error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to like post',
			error: error.message
		});
	}
};

/**
 * Unlike a Post
 * DELETE /api/posts/:postId/like
 */
exports.unlikePost = async (req, res) => {
	try {
		const { postId } = req.params;
		const userId = req.user.id;

		// Check if post exists
		const post = await prisma.post.findUnique({
			where: { id: postId }
		});

		if (!post) {
			return res.status(404).json({
				success: false,
				message: 'Post not found'
			});
		}

		// Check if like exists
		const existingLike = await prisma.like.findUnique({
			where: {
				userId_postId: {
					userId: userId,
					postId: postId
				}
			}
		});

		if (!existingLike) {
			return res.status(400).json({
				success: false,
				message: 'Post not liked',
				isLiked: false,
				likesCount: post.likesCount
			});
		}

		// Delete like and decrement count in a transaction
		const [_, updatedPost] = await prisma.$transaction([
			prisma.like.delete({
				where: {
					userId_postId: {
						userId: userId,
						postId: postId
					}
				}
			}),
			prisma.post.update({
				where: { id: postId },
				data: {
					likesCount: {
						decrement: 1
					}
				}
			})
		]);

		console.log(`✅ User ${userId} unliked post ${postId}. New count: ${updatedPost.likesCount}`);

		res.json({
			success: true,
			message: 'Post unliked successfully',
			isLiked: false,
			likesCount: updatedPost.likesCount
		});

	} catch (error) {
		console.error('Unlike post error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to unlike post',
			error: error.message
		});
	}
};

/**
 * Check Like Status
 * GET /api/posts/:postId/like-status
 */
exports.checkLikeStatus = async (req, res) => {
	try {
		const { postId } = req.params;
		const userId = req.user?.id;

		// Get post with like count
		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: {
				id: true,
				likesCount: true
			}
		});

		if (!post) {
			return res.status(404).json({
				success: false,
				message: 'Post not found'
			});
		}

		// If user is not logged in, return just the count
		if (!userId) {
			return res.json({
				success: true,
				isLiked: false,
				likesCount: post.likesCount
			});
		}

		// Check if user has liked the post
		const like = await prisma.like.findUnique({
			where: {
				userId_postId: {
					userId: userId,
					postId: postId
				}
			}
		});

		res.json({
			success: true,
			isLiked: !!like,
			likesCount: post.likesCount
		});

	} catch (error) {
		console.error('Check like status error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to check like status',
			error: error.message
		});
	}
};

/**
 * Add Comment to Post
 * POST /api/posts/:postId/comments
 */
exports.addComment = async (req, res) => {
	try {
		const { postId } = req.params;
		const userId = req.user.id;
		const { text, parentCommentId } = req.body;

		// Validate text
		if (!text || text.trim().length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Comment text is required'
			});
		}

		// Check if post exists
		const post = await prisma.post.findUnique({
			where: { id: postId }
		});

		if (!post) {
			return res.status(404).json({
				success: false,
				message: 'Post not found'
			});
		}

		// Prepare comment data
		const commentData = {
			postId: postId,
			authorId: userId,
			text: text.trim()
		};

		// Handle reply to another comment
		if (parentCommentId) {
			const parentComment = await prisma.comment.findUnique({
				where: { id: parentCommentId }
			});

			if (!parentComment) {
				return res.status(404).json({
					success: false,
					message: 'Parent comment not found'
				});
			}

			commentData.parentCommentId = parentCommentId;
			commentData.replyLevel = parentComment.replyLevel + 1;

			// Also increment repliesCount on parent
			await prisma.comment.update({
				where: { id: parentCommentId },
				data: {
					repliesCount: {
						increment: 1
					}
				}
			});
		}

		// Create comment and increment count in a transaction
		const [comment, updatedPost] = await prisma.$transaction([
			prisma.comment.create({
				data: commentData,
				include: {
					author: {
						select: {
							id: true,
							username: true,
							firstName: true,
							lastName: true,
							avatar: true
						}
					}
				}
			}),
			prisma.post.update({
				where: { id: postId },
				data: {
					commentsCount: {
						increment: 1
					}
				}
			})
		]);

		console.log(`✅ User ${userId} commented on post ${postId}. New count: ${updatedPost.commentsCount}`);

		// Send notification
		await createNotification(req, {
			recipientId: post.authorId,
			senderId: userId,
			type: 'comment',
			content: 'commented on your post',
			postId: postId,
			commentId: comment.id,
			link: `/post/${postId}`
		});

		res.status(201).json({
			success: true,
			message: 'Comment added successfully',
			comment: comment,
			commentsCount: updatedPost.commentsCount
		});

	} catch (error) {
		console.error('Add comment error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to add comment',
			error: error.message
		});
	}
};

/**
 * Get Comments for Post
 * GET /api/posts/:postId/comments
 */
exports.getComments = async (req, res) => {
	try {
		const { postId } = req.params;
		const { page = 1, limit = 20, parentCommentId = null } = req.query;

		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Check if post exists
		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: {
				id: true,
				commentsCount: true
			}
		});

		if (!post) {
			return res.status(404).json({
				success: false,
				message: 'Post not found'
			});
		}

		// Build where clause
		const whereClause = {
			postId: postId,
			isHidden: false
		};

		// If parentCommentId is provided, get replies, otherwise get top-level comments
		if (parentCommentId && parentCommentId !== 'null') {
			whereClause.parentCommentId = parentCommentId;
		} else {
			whereClause.parentCommentId = null;
		}

		// Get comments with author info
		const comments = await prisma.comment.findMany({
			where: whereClause,
			include: {
				author: {
					select: {
						id: true,
						username: true,
						firstName: true,
						lastName: true,
						avatar: true
					}
				},
				replies: {
					take: 3, // Show first 3 replies
					orderBy: {
						createdAt: 'asc'
					},
					include: {
						author: {
							select: {
								id: true,
								username: true,
								firstName: true,
								lastName: true,
								avatar: true
							}
						}
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			},
			skip: skip,
			take: parseInt(limit)
		});

		const total = await prisma.comment.count({
			where: whereClause
		});

		res.json({
			success: true,
			comments: comments,
			commentsCount: post.commentsCount,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total: total,
				pages: Math.ceil(total / parseInt(limit))
			}
		});

	} catch (error) {
		console.error('Get comments error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get comments',
			error: error.message
		});
	}
};

/**
 * Delete Comment
 * DELETE /api/posts/:postId/comments/:commentId
 */
exports.deleteComment = async (req, res) => {
	try {
		const { postId, commentId } = req.params;
		const userId = req.user.id;

		// Find comment
		const comment = await prisma.comment.findUnique({
			where: { id: commentId }
		});

		if (!comment) {
			return res.status(404).json({
				success: false,
				message: 'Comment not found'
			});
		}

		// Check if user is the author
		if (comment.authorId !== userId) {
			return res.status(403).json({
				success: false,
				message: 'You can only delete your own comments'
			});
		}

		// If this is a reply, decrement parent's repliesCount
		if (comment.parentCommentId) {
			await prisma.comment.update({
				where: { id: comment.parentCommentId },
				data: {
					repliesCount: {
						decrement: 1
					}
				}
			});
		}

		// Count all nested replies that will be deleted
		const allRepliesCount = await prisma.comment.count({
			where: {
				OR: [
					{ id: commentId },
					{ parentCommentId: commentId }
				]
			}
		});

		// Delete comment and all replies (CASCADE handles this)
		const [_, updatedPost] = await prisma.$transaction([
			prisma.comment.delete({
				where: { id: commentId }
			}),
			prisma.post.update({
				where: { id: postId },
				data: {
					commentsCount: {
						decrement: allRepliesCount
					}
				}
			})
		]);

		console.log(`✅ User ${userId} deleted comment ${commentId}. ${allRepliesCount} comment(s) removed.`);

		res.json({
			success: true,
			message: 'Comment deleted successfully',
			commentsCount: updatedPost.commentsCount
		});

	} catch (error) {
		console.error('Delete comment error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to delete comment',
			error: error.message
		});
	}
};
