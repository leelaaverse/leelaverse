// AI Models Configuration for FAL AI
// This file contains the list of available AI models for image and video generation

const AI_MODELS = {
	image: [
		// FLUX Models - Black Forest Labs
		{
			id: 'flux-schnell',
			name: 'FLUX Schnell',
			description: 'Fast generation (15-20s)',
			provider: 'Black Forest Labs',
			falEndpoint: 'fal-ai/flux/schnell',
			defaultSteps: 4,
			maxSteps: 12,
			defaultGuidance: 3.5,
			speed: 'fast',
			quality: 'good',
			creditCost: 50,
			featured: true
		},
		{
			id: 'flux-1-srpo',
			name: 'FLUX.1 SRPO',
			description: 'High quality (25-35s)',
			provider: 'Black Forest Labs',
			falEndpoint: 'fal-ai/flux-1/srpo',
			defaultSteps: 28,
			maxSteps: 50,
			defaultGuidance: 4.5,
			speed: 'medium',
			quality: 'excellent',
			creditCost: 100,
			featured: true
		},
		{
			id: 'flux-dev',
			name: 'FLUX.1 Dev',
			description: 'Development model, great balance',
			provider: 'Black Forest Labs',
			falEndpoint: 'fal-ai/flux/dev',
			defaultSteps: 28,
			maxSteps: 50,
			defaultGuidance: 3.5,
			speed: 'medium',
			quality: 'excellent',
			creditCost: 80,
			featured: true
		},
		{
			id: 'flux-pro',
			name: 'FLUX.1 Pro',
			description: 'Premium quality, top performer',
			provider: 'Black Forest Labs',
			falEndpoint: 'fal-ai/flux-pro',
			defaultSteps: 25,
			maxSteps: 50,
			defaultGuidance: 3.5,
			speed: 'slow',
			quality: 'premium',
			creditCost: 150,
			featured: true
		},
		{
			id: 'flux-pro-ultra',
			name: 'FLUX.1 Pro Ultra',
			description: '4K resolution, ultra quality',
			provider: 'Black Forest Labs',
			falEndpoint: 'fal-ai/flux-pro/v1.1-ultra',
			defaultSteps: 25,
			maxSteps: 50,
			defaultGuidance: 3.5,
			speed: 'slow',
			quality: 'ultra',
			creditCost: 200,
			featured: false
		},
		// Nano Banana Models
		{
			id: 'nano-banana',
			name: 'Nano Banana',
			description: 'Fast with good text rendering',
			provider: 'Google',
			falEndpoint: 'fal-ai/nano-banana',
			defaultSteps: 20,
			maxSteps: 40,
			defaultGuidance: 4.0,
			speed: 'fast',
			quality: 'good',
			creditCost: 75,
			featured: true
		},
		{
			id: 'nano-banana-pro',
			name: 'Nano Banana Pro',
			description: 'Advanced reasoning, superior text',
			provider: 'Google',
			falEndpoint: 'fal-ai/nano-banana-pro',
			defaultSteps: 25,
			maxSteps: 50,
			defaultGuidance: 4.5,
			speed: 'medium',
			quality: 'excellent',
			creditCost: 120,
			featured: true
		},
		// Stable Diffusion Models
		{
			id: 'sdxl',
			name: 'Stable Diffusion XL',
			description: 'Classic SDXL, highly customizable',
			provider: 'Stability AI',
			falEndpoint: 'fal-ai/fast-sdxl',
			defaultSteps: 25,
			maxSteps: 50,
			defaultGuidance: 7.5,
			speed: 'fast',
			quality: 'good',
			creditCost: 40,
			featured: false
		},
		{
			id: 'sd3',
			name: 'Stable Diffusion 3',
			description: 'Latest SD3 with improved quality',
			provider: 'Stability AI',
			falEndpoint: 'fal-ai/stable-diffusion-v3-medium',
			defaultSteps: 28,
			maxSteps: 50,
			defaultGuidance: 4.5,
			speed: 'medium',
			quality: 'excellent',
			creditCost: 90,
			featured: false
		},
		// Recraft Models
		{
			id: 'recraft-v3',
			name: 'Recraft V3',
			description: 'Great for design and illustrations',
			provider: 'Recraft',
			falEndpoint: 'fal-ai/recraft-v3',
			defaultSteps: 25,
			maxSteps: 50,
			defaultGuidance: 4.0,
			speed: 'medium',
			quality: 'excellent',
			creditCost: 100,
			featured: false
		},
		// Ideogram
		{
			id: 'ideogram-v2',
			name: 'Ideogram V2',
			description: 'Exceptional text in images',
			provider: 'Ideogram',
			falEndpoint: 'fal-ai/ideogram/v2',
			defaultSteps: 25,
			maxSteps: 50,
			defaultGuidance: 4.0,
			speed: 'medium',
			quality: 'excellent',
			creditCost: 110,
			featured: false
		},
		{
			id: 'ideogram-v2-turbo',
			name: 'Ideogram V2 Turbo',
			description: 'Fast Ideogram with text',
			provider: 'Ideogram',
			falEndpoint: 'fal-ai/ideogram/v2/turbo',
			defaultSteps: 20,
			maxSteps: 40,
			defaultGuidance: 4.0,
			speed: 'fast',
			quality: 'good',
			creditCost: 80,
			featured: false
		},
		// Other Popular Models
		{
			id: 'playground-v25',
			name: 'Playground V2.5',
			description: 'Creative and artistic',
			provider: 'Playground',
			falEndpoint: 'fal-ai/playground-v25',
			defaultSteps: 25,
			maxSteps: 50,
			defaultGuidance: 3.5,
			speed: 'medium',
			quality: 'good',
			creditCost: 60,
			featured: false
		},
		{
			id: 'kolors',
			name: 'Kolors',
			description: 'Vibrant colors and style',
			provider: 'Kwai',
			falEndpoint: 'fal-ai/kolors',
			defaultSteps: 25,
			maxSteps: 50,
			defaultGuidance: 5.0,
			speed: 'medium',
			quality: 'good',
			creditCost: 70,
			featured: false
		},
		{
			id: 'pixart-sigma',
			name: 'PixArt Sigma',
			description: '4K capable, detailed',
			provider: 'PixArt',
			falEndpoint: 'fal-ai/pixart-sigma',
			defaultSteps: 20,
			maxSteps: 40,
			defaultGuidance: 4.5,
			speed: 'fast',
			quality: 'excellent',
			creditCost: 80,
			featured: false
		},
		{
			id: 'aura-flow',
			name: 'AuraFlow',
			description: 'Open source, efficient',
			provider: 'Fal',
			falEndpoint: 'fal-ai/aura-flow',
			defaultSteps: 25,
			maxSteps: 50,
			defaultGuidance: 3.5,
			speed: 'fast',
			quality: 'good',
			creditCost: 50,
			featured: false
		},
		{
			id: 'omnigen',
			name: 'OmniGen',
			description: 'Multi-purpose generation',
			provider: 'Fal',
			falEndpoint: 'fal-ai/omnigen-v1',
			defaultSteps: 25,
			maxSteps: 50,
			defaultGuidance: 3.0,
			speed: 'medium',
			quality: 'good',
			creditCost: 70,
			featured: false
		},
		{
			id: 'mochi-v1',
			name: 'Mochi Preview',
			description: 'Stylized art generation',
			provider: 'Genmo',
			falEndpoint: 'fal-ai/mochi-v1',
			defaultSteps: 25,
			maxSteps: 50,
			defaultGuidance: 4.0,
			speed: 'medium',
			quality: 'good',
			creditCost: 65,
			featured: false
		}
	],
	video: [
		// Kling AI Models
		{
			id: 'kling-1.5',
			name: 'Kling 1.5',
			description: 'High quality video (5-10s)',
			provider: 'Kuaishou',
			falEndpoint: 'fal-ai/kling-video/v1.5/standard/image-to-video',
			defaultDuration: 5,
			maxDuration: 10,
			speed: 'medium',
			quality: 'excellent',
			creditCost: 200,
			featured: true,
			inputType: 'image'
		},
		{
			id: 'kling-1.5-pro',
			name: 'Kling 1.5 Pro',
			description: 'Premium video quality',
			provider: 'Kuaishou',
			falEndpoint: 'fal-ai/kling-video/v1.5/pro/image-to-video',
			defaultDuration: 5,
			maxDuration: 10,
			speed: 'slow',
			quality: 'premium',
			creditCost: 350,
			featured: true,
			inputType: 'image'
		},
		{
			id: 'kling-2.0',
			name: 'Kling 2.0',
			description: 'Latest Kling with improvements',
			provider: 'Kuaishou',
			falEndpoint: 'fal-ai/kling-video/v2/standard/text-to-video',
			defaultDuration: 5,
			maxDuration: 10,
			speed: 'medium',
			quality: 'excellent',
			creditCost: 250,
			featured: true,
			inputType: 'text'
		},
		// MiniMax (Hailuo AI)
		{
			id: 'minimax-video',
			name: 'MiniMax Video',
			description: 'Fast video generation (60-90s)',
			provider: 'MiniMax',
			falEndpoint: 'fal-ai/minimax/video-01',
			defaultDuration: 10,
			maxDuration: 10,
			speed: 'fast',
			quality: 'good',
			creditCost: 150,
			featured: true,
			inputType: 'text'
		},
		{
			id: 'minimax-live',
			name: 'MiniMax Live',
			description: 'Real-time video from prompts',
			provider: 'MiniMax',
			falEndpoint: 'fal-ai/minimax/video-01-live',
			defaultDuration: 6,
			maxDuration: 10,
			speed: 'fast',
			quality: 'good',
			creditCost: 180,
			featured: false,
			inputType: 'image'
		},
		// Luma Dream Machine
		{
			id: 'luma-dream-machine',
			name: 'Luma Dream Machine',
			description: 'Dreamy, cinematic videos',
			provider: 'Luma',
			falEndpoint: 'fal-ai/luma-dream-machine',
			defaultDuration: 5,
			maxDuration: 10,
			speed: 'medium',
			quality: 'excellent',
			creditCost: 200,
			featured: true,
			inputType: 'text'
		},
		{
			id: 'luma-dream-machine-i2v',
			name: 'Luma Image to Video',
			description: 'Animate your images',
			provider: 'Luma',
			falEndpoint: 'fal-ai/luma-dream-machine/image-to-video',
			defaultDuration: 5,
			maxDuration: 10,
			speed: 'medium',
			quality: 'excellent',
			creditCost: 220,
			featured: false,
			inputType: 'image'
		},
		// Runway Gen-3
		{
			id: 'runway-gen3',
			name: 'Runway Gen-3 Alpha',
			description: 'Industry-leading quality',
			provider: 'Runway',
			falEndpoint: 'fal-ai/runway-gen3/turbo/image-to-video',
			defaultDuration: 5,
			maxDuration: 10,
			speed: 'medium',
			quality: 'premium',
			creditCost: 300,
			featured: true,
			inputType: 'image'
		},
		// LTX Video
		{
			id: 'ltx-video',
			name: 'LTX Video',
			description: 'Open source, fast',
			provider: 'Lightricks',
			falEndpoint: 'fal-ai/ltx-video',
			defaultDuration: 5,
			maxDuration: 10,
			speed: 'fast',
			quality: 'good',
			creditCost: 100,
			featured: false,
			inputType: 'text'
		},
		{
			id: 'ltx-video-i2v',
			name: 'LTX Image to Video',
			description: 'Animate images affordably',
			provider: 'Lightricks',
			falEndpoint: 'fal-ai/ltx-video/image-to-video',
			defaultDuration: 5,
			maxDuration: 10,
			speed: 'fast',
			quality: 'good',
			creditCost: 120,
			featured: false,
			inputType: 'image'
		},
		// Google Veo
		{
			id: 'veo-2',
			name: 'Veo 2',
			description: 'Google\'s latest video model',
			provider: 'Google',
			falEndpoint: 'fal-ai/veo2',
			defaultDuration: 8,
			maxDuration: 10,
			speed: 'medium',
			quality: 'excellent',
			creditCost: 280,
			featured: false,
			inputType: 'text'
		},
		// CogVideoX
		{
			id: 'cogvideox-5b',
			name: 'CogVideoX 5B',
			description: 'Open source, efficient',
			provider: 'THUDM',
			falEndpoint: 'fal-ai/cogvideox-5b',
			defaultDuration: 6,
			maxDuration: 10,
			speed: 'fast',
			quality: 'good',
			creditCost: 80,
			featured: false,
			inputType: 'text'
		},
		{
			id: 'cogvideox-5b-i2v',
			name: 'CogVideoX Image to Video',
			description: 'Affordable animation',
			provider: 'THUDM',
			falEndpoint: 'fal-ai/cogvideox-5b/image-to-video',
			defaultDuration: 6,
			maxDuration: 10,
			speed: 'fast',
			quality: 'good',
			creditCost: 90,
			featured: false,
			inputType: 'image'
		},
		// Hunyuan
		{
			id: 'hunyuan-video',
			name: 'Hunyuan Video',
			description: 'Tencent\'s video model',
			provider: 'Tencent',
			falEndpoint: 'fal-ai/hunyuan-video',
			defaultDuration: 5,
			maxDuration: 10,
			speed: 'medium',
			quality: 'good',
			creditCost: 150,
			featured: false,
			inputType: 'text'
		}
	]
};

/**
 * Get all available models
 */
const getAllModels = () => AI_MODELS;

/**
 * Get models by type (image or video)
 */
const getModelsByType = (type) => AI_MODELS[type] || [];

/**
 * Get featured models by type
 */
const getFeaturedModels = (type) => {
	return getModelsByType(type).filter(model => model.featured);
};

/**
 * Get model by ID
 */
const getModelById = (modelId) => {
	const allModels = [...AI_MODELS.image, ...AI_MODELS.video];
	return allModels.find(model => model.id === modelId);
};

/**
 * Get model configuration for generation
 */
const getModelConfig = (modelId) => {
	const model = getModelById(modelId);
	if (!model) return null;

	return {
		falEndpoint: model.falEndpoint,
		defaultSteps: model.defaultSteps,
		maxSteps: model.maxSteps,
		defaultGuidance: model.defaultGuidance,
		defaultDuration: model.defaultDuration,
		maxDuration: model.maxDuration,
		creditCost: model.creditCost
	};
};

module.exports = {
	AI_MODELS,
	getAllModels,
	getModelsByType,
	getFeaturedModels,
	getModelById,
	getModelConfig
};
