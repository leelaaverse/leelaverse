/**
 * Central Model Registry
 * Single source of truth for ALL AI models available.
 * To add a new model, just add an entry here — controllers auto-pick it up.
 */

const MODEL_CATEGORIES = {
    TEXT_TO_IMAGE: 'text-to-image',
    IMAGE_TO_IMAGE: 'image-to-image',
    BACKGROUND_REMOVAL: 'background-removal',
    IMAGE_UPSCALE: 'image-upscale',
    VIDEO_UPSCALE: 'video-upscale',
    TEXT_TO_VIDEO: 'text-to-video',
    IMAGE_TO_VIDEO: 'image-to-video'
};

const DEFAULT_MULTI_IMAGE_LIMIT = 10;

const MODELS = {

    // =====================================================================
    // TEXT-TO-IMAGE MODELS
    // =====================================================================

    'flux-dev': {
        id: 'flux-dev',
        name: 'FLUX.1 Dev',
        description: '12B param flow transformer, great balance of speed and quality',
        provider: 'Black Forest Labs',
        falEndpoint: 'fal-ai/flux/dev',
        category: MODEL_CATEGORIES.TEXT_TO_IMAGE,
        creditCost: 80,
        featured: true,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_size: { type: 'string', default: 'landscape_4_3' },
            num_inference_steps: { type: 'integer', default: 28, min: 1, max: 50 },
            seed: { type: 'integer' },
            guidance_scale: { type: 'float', default: 3.5, min: 1, max: 20 },
            num_images: { type: 'integer', default: 1, min: 1, max: 4 },
            enable_safety_checker: { type: 'boolean', default: true },
            output_format: { type: 'string', default: 'jpeg', options: ['jpeg', 'png'] }
        }
    },

    'flux-schnell': {
        id: 'flux-schnell',
        name: 'FLUX.1 Schnell',
        description: 'Ultra-fast 1-4 step generation, best for quick previews',
        provider: 'Black Forest Labs',
        falEndpoint: 'fal-ai/flux/schnell',
        category: MODEL_CATEGORIES.TEXT_TO_IMAGE,
        creditCost: 30,
        featured: true,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_size: { type: 'string', default: 'landscape_4_3' },
            num_inference_steps: { type: 'integer', default: 4, min: 1, max: 12 },
            seed: { type: 'integer' },
            guidance_scale: { type: 'float', default: 3.5, min: 1, max: 20 },
            num_images: { type: 'integer', default: 1, min: 1, max: 4 },
            enable_safety_checker: { type: 'boolean', default: true },
            output_format: { type: 'string', default: 'jpeg', options: ['jpeg', 'png'] }
        }
    },

    'flux-kontext-max-t2i': {
        id: 'flux-kontext-max-t2i',
        name: 'FLUX Kontext Max (Text-to-Image)',
        description: 'Premium prompt adherence & typography, top-tier quality',
        provider: 'Black Forest Labs',
        falEndpoint: 'fal-ai/flux-pro/kontext/max/text-to-image',
        category: MODEL_CATEGORIES.TEXT_TO_IMAGE,
        creditCost: 150,
        featured: true,
        inputSchema: {
            prompt: { type: 'string', required: true },
            seed: { type: 'integer' },
            guidance_scale: { type: 'float', default: 3.5, min: 1, max: 20 },
            num_images: { type: 'integer', default: 1, min: 1, max: 4 },
            output_format: { type: 'string', default: 'jpeg', options: ['jpeg', 'png'] },
            safety_tolerance: { type: 'string', default: '2', options: ['1', '2', '3', '4', '5', '6'] },
            enhance_prompt: { type: 'boolean', default: false },
            aspect_ratio: { type: 'string', default: '1:1', options: ['21:9', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '9:21'] }
        }
    },

    'flux2-pro': {
        id: 'flux2-pro',
        name: 'FLUX 2 Pro',
        description: 'Maximum quality photorealism and artistic images',
        provider: 'Black Forest Labs',
        falEndpoint: 'fal-ai/flux-2-pro',
        category: MODEL_CATEGORIES.TEXT_TO_IMAGE,
        creditCost: 120,
        featured: true,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_size: { type: 'string', default: 'landscape_4_3' },
            seed: { type: 'integer' },
            safety_tolerance: { type: 'string', default: '2', options: ['1', '2', '3', '4', '5'] },
            enable_safety_checker: { type: 'boolean', default: true },
            output_format: { type: 'string', default: 'jpeg', options: ['jpeg', 'png'] }
        }
    },

    'gpt-image-1.5': {
        id: 'gpt-image-1.5',
        name: 'GPT Image 1.5',
        description: 'High-fidelity with strong prompt adherence and fine detail',
        provider: 'OpenAI',
        falEndpoint: 'fal-ai/gpt-image-1.5',
        category: MODEL_CATEGORIES.TEXT_TO_IMAGE,
        creditCost: 200,
        featured: true,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_size: { type: 'string', default: '1024x1024', options: ['1024x1024', '1536x1024', '1024x1536'] },
            background: { type: 'string', default: 'auto', options: ['auto', 'transparent', 'opaque'] },
            quality: { type: 'string', default: 'high', options: ['low', 'medium', 'high'] },
            num_images: { type: 'integer', default: 1, min: 1, max: 4 },
            output_format: { type: 'string', default: 'png', options: ['jpeg', 'png', 'webp'] }
        }
    },

    'nano-banana-pro': {
        id: 'nano-banana-pro',
        name: 'Nano Banana Pro',
        description: "Google's state-of-the-art realism and typography",
        provider: 'Google',
        falEndpoint: 'fal-ai/nano-banana-pro',
        category: MODEL_CATEGORIES.TEXT_TO_IMAGE,
        creditCost: 180,
        featured: true,
        inputSchema: {
            prompt: { type: 'string', required: true },
            num_images: { type: 'integer', default: 1, min: 1, max: 4 },
            seed: { type: 'integer' },
            aspect_ratio: { type: 'string', default: '1:1', options: ['auto', '21:9', '16:9', '3:2', '4:3', '5:4', '1:1', '4:5', '3:4', '2:3', '9:16'] },
            output_format: { type: 'string', default: 'png', options: ['jpeg', 'png', 'webp'] },
            safety_tolerance: { type: 'string', default: '4', options: ['1', '2', '3', '4', '5', '6'] },
            resolution: { type: 'string', default: '1K', options: ['1K', '2K', '4K'] },
            enable_web_search: { type: 'boolean', default: false }
        }
    },

    'seedream-v5-lite-t2i': {
        id: 'seedream-v5-lite-t2i',
        name: 'Seedream 5.0 Lite',
        description: 'ByteDance fast text-to-image with high quality',
        provider: 'ByteDance',
        falEndpoint: 'fal-ai/bytedance/seedream/v5/lite/text-to-image',
        category: MODEL_CATEGORIES.TEXT_TO_IMAGE,
        creditCost: 90,
        featured: false,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_size: { type: 'string', default: 'auto_2K' },
            num_images: { type: 'integer', default: 1, min: 1, max: 6 },
            max_images: { type: 'integer', default: 1, min: 1, max: 6 },
            enable_safety_checker: { type: 'boolean', default: true }
        }
    },

    'dreamina-v3.1': {
        id: 'dreamina-v3.1',
        name: 'Dreamina v3.1',
        description: 'ByteDance superior aesthetics, precise styles, rich details',
        provider: 'ByteDance',
        falEndpoint: 'fal-ai/bytedance/dreamina/v3.1/text-to-image',
        category: MODEL_CATEGORIES.TEXT_TO_IMAGE,
        creditCost: 100,
        featured: false,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_size: { type: 'object', default: { height: 1536, width: 2048 } },
            enhance_prompt: { type: 'boolean', default: false },
            num_images: { type: 'integer', default: 1, min: 1, max: 4 },
            seed: { type: 'integer' }
        }
    },

    // =====================================================================
    // IMAGE-TO-IMAGE / EDITING MODELS
    // =====================================================================

    'flux-dev-i2i': {
        id: 'flux-dev-i2i',
        name: 'FLUX.1 Dev Image-to-Image',
        description: 'Style transfer and image modifications with FLUX quality',
        provider: 'Black Forest Labs',
        falEndpoint: 'fal-ai/flux/dev/image-to-image',
        category: MODEL_CATEGORIES.IMAGE_TO_IMAGE,
        creditCost: 90,
        featured: true,
        inputSchema: {
            image_url: { type: 'string', required: true },
            prompt: { type: 'string', required: true },
            strength: { type: 'float', default: 0.95, min: 0.01, max: 1 },
            num_inference_steps: { type: 'integer', default: 40, min: 10, max: 50 },
            seed: { type: 'integer' },
            guidance_scale: { type: 'float', default: 3.5, min: 1, max: 20 },
            num_images: { type: 'integer', default: 1, min: 1, max: 4 },
            enable_safety_checker: { type: 'boolean', default: true },
            output_format: { type: 'string', default: 'jpeg', options: ['jpeg', 'png'] }
        }
    },

    'flux-dev-redux': {
        id: 'flux-dev-redux',
        name: 'FLUX.1 Dev Redux',
        description: 'Image variation generation from reference image',
        provider: 'Black Forest Labs',
        falEndpoint: 'fal-ai/flux/dev/redux',
        category: MODEL_CATEGORIES.IMAGE_TO_IMAGE,
        creditCost: 80,
        featured: false,
        inputSchema: {
            image_url: { type: 'string', required: true },
            image_size: { type: 'string', default: 'landscape_4_3' },
            num_inference_steps: { type: 'integer', default: 28, min: 1, max: 50 },
            seed: { type: 'integer' },
            guidance_scale: { type: 'float', default: 3.5, min: 1, max: 20 },
            num_images: { type: 'integer', default: 1, min: 1, max: 4 },
            enable_safety_checker: { type: 'boolean', default: true },
            output_format: { type: 'string', default: 'jpeg', options: ['jpeg', 'png'] }
        }
    },

    'flux-kontext-pro': {
        id: 'flux-kontext-pro',
        name: 'FLUX Kontext Pro',
        description: 'Targeted local edits and complex scene transformations',
        provider: 'Black Forest Labs',
        falEndpoint: 'fal-ai/flux-pro/kontext',
        category: MODEL_CATEGORIES.IMAGE_TO_IMAGE,
        creditCost: 100,
        featured: true,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_url: { type: 'string', required: true },
            seed: { type: 'integer' },
            guidance_scale: { type: 'float', default: 3.5, min: 1, max: 20 },
            num_images: { type: 'integer', default: 1, min: 1, max: 4 },
            output_format: { type: 'string', default: 'jpeg', options: ['jpeg', 'png'] },
            safety_tolerance: { type: 'string', default: '2', options: ['1', '2', '3', '4', '5', '6'] },
            enhance_prompt: { type: 'boolean', default: false },
            aspect_ratio: { type: 'string', options: ['21:9', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '9:21'] }
        }
    },

    'flux-kontext-max': {
        id: 'flux-kontext-max',
        name: 'FLUX Kontext Max',
        description: 'Premium consistency for editing, improved prompt adherence',
        provider: 'Black Forest Labs',
        falEndpoint: 'fal-ai/flux-pro/kontext/max',
        category: MODEL_CATEGORIES.IMAGE_TO_IMAGE,
        creditCost: 160,
        featured: true,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_url: { type: 'string', required: true },
            seed: { type: 'integer' },
            guidance_scale: { type: 'float', default: 3.5, min: 1, max: 20 },
            num_images: { type: 'integer', default: 1, min: 1, max: 4 },
            output_format: { type: 'string', default: 'jpeg', options: ['jpeg', 'png'] },
            safety_tolerance: { type: 'string', default: '2', options: ['1', '2', '3', '4', '5', '6'] },
            enhance_prompt: { type: 'boolean', default: false },
            aspect_ratio: { type: 'string', options: ['21:9', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '9:21'] }
        }
    },

    'flux-kontext-max-multi': {
        id: 'flux-kontext-max-multi',
        name: 'FLUX Kontext Max Multi',
        description: 'Multi-image editing — combine multiple reference images',
        provider: 'Black Forest Labs',
        falEndpoint: 'fal-ai/flux-pro/kontext/max/multi',
        category: MODEL_CATEGORIES.IMAGE_TO_IMAGE,
        creditCost: 170,
        featured: false,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_urls: { type: 'array', required: true },
            seed: { type: 'integer' },
            guidance_scale: { type: 'float', default: 3.5, min: 1, max: 20 },
            num_images: { type: 'integer', default: 1, min: 1, max: 4 },
            output_format: { type: 'string', default: 'jpeg', options: ['jpeg', 'png'] },
            safety_tolerance: { type: 'string', default: '2', options: ['1', '2', '3', '4', '5', '6'] },
            enhance_prompt: { type: 'boolean', default: false },
            aspect_ratio: { type: 'string', options: ['21:9', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '9:21'] }
        }
    },

    'flux2-pro-edit': {
        id: 'flux2-pro-edit',
        name: 'FLUX 2 Pro Edit',
        description: 'High-quality image editing and sequential workflows',
        provider: 'Black Forest Labs',
        falEndpoint: 'fal-ai/flux-2-pro/edit',
        category: MODEL_CATEGORIES.IMAGE_TO_IMAGE,
        creditCost: 130,
        featured: true,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_urls: { type: 'array', required: true },
            image_size: { type: 'string', default: 'auto' },
            seed: { type: 'integer' },
            safety_tolerance: { type: 'string', default: '2', options: ['1', '2', '3', '4', '5'] },
            enable_safety_checker: { type: 'boolean', default: true },
            output_format: { type: 'string', default: 'jpeg', options: ['jpeg', 'png'] }
        }
    },

    'gpt-image-1.5-edit': {
        id: 'gpt-image-1.5-edit',
        name: 'GPT Image 1.5 Edit',
        description: 'OpenAI image editing with reference images and masking',
        provider: 'OpenAI',
        falEndpoint: 'fal-ai/gpt-image-1.5/edit',
        category: MODEL_CATEGORIES.IMAGE_TO_IMAGE,
        creditCost: 220,
        featured: true,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_urls: { type: 'array', required: true },
            image_size: { type: 'string', default: 'auto', options: ['auto', '1024x1024', '1536x1024', '1024x1536'] },
            background: { type: 'string', default: 'auto', options: ['auto', 'transparent', 'opaque'] },
            quality: { type: 'string', default: 'high', options: ['low', 'medium', 'high'] },
            input_fidelity: { type: 'string', default: 'high', options: ['low', 'high'] },
            num_images: { type: 'integer', default: 1, min: 1, max: 4 },
            output_format: { type: 'string', default: 'png', options: ['jpeg', 'png', 'webp'] },
            mask_image_url: { type: 'string' }
        }
    },

    'nano-banana-pro-edit': {
        id: 'nano-banana-pro-edit',
        name: 'Nano Banana Pro Edit',
        description: "Google's state-of-the-art image editing with reference images",
        provider: 'Google',
        falEndpoint: 'fal-ai/nano-banana-pro/edit',
        category: MODEL_CATEGORIES.IMAGE_TO_IMAGE,
        creditCost: 190,
        featured: true,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_urls: { type: 'array', required: true },
            num_images: { type: 'integer', default: 1, min: 1, max: 4 },
            seed: { type: 'integer' },
            aspect_ratio: { type: 'string', default: 'auto', options: ['auto', '21:9', '16:9', '3:2', '4:3', '5:4', '1:1', '4:5', '3:4', '2:3', '9:16'] },
            output_format: { type: 'string', default: 'png', options: ['jpeg', 'png', 'webp'] },
            safety_tolerance: { type: 'string', default: '4', options: ['1', '2', '3', '4', '5', '6'] },
            resolution: { type: 'string', default: '1K', options: ['1K', '2K', '4K'] },
            enable_web_search: { type: 'boolean', default: false }
        }
    },

    'seedream-v5-lite-edit': {
        id: 'seedream-v5-lite-edit',
        name: 'Seedream 5.0 Lite Edit',
        description: 'ByteDance intelligent multi-image editing',
        provider: 'ByteDance',
        falEndpoint: 'fal-ai/bytedance/seedream/v5/lite/edit',
        category: MODEL_CATEGORIES.IMAGE_TO_IMAGE,
        creditCost: 95,
        featured: false,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_urls: { type: 'array', required: true },
            image_size: { type: 'string', default: 'auto_2K' },
            num_images: { type: 'integer', default: 1, min: 1, max: 6 },
            max_images: { type: 'integer', default: 1, min: 1, max: 6 },
            enable_safety_checker: { type: 'boolean', default: true }
        }
    },

    'seedream-v4-edit': {
        id: 'seedream-v4-edit',
        name: 'Seedream 4.0 Edit',
        description: 'ByteDance unified generation + editing architecture',
        provider: 'ByteDance',
        falEndpoint: 'fal-ai/bytedance/seedream/v4/edit',
        category: MODEL_CATEGORIES.IMAGE_TO_IMAGE,
        creditCost: 85,
        featured: false,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_urls: { type: 'array', required: true },
            image_size: { type: 'object', default: { height: 2048, width: 2048 } },
            num_images: { type: 'integer', default: 1, min: 1, max: 6 },
            max_images: { type: 'integer', default: 1, min: 1, max: 6 },
            seed: { type: 'integer' },
            enable_safety_checker: { type: 'boolean', default: true },
            enhance_prompt_mode: { type: 'string', default: 'standard', options: ['standard', 'fast'] }
        }
    },

    'sam-3-image': {
        id: 'sam-3-image',
        name: 'Segment Anything Model 3',
        description: 'SAM 3 is a unified foundation model for promptable segmentation in images',
        provider: 'Meta',
        falEndpoint: 'fal-ai/sam-3/image',
        category: MODEL_CATEGORIES.IMAGE_TO_IMAGE,
        creditCost: 10,
        featured: true,
        inputSchema: {
            image_url: { type: 'string', required: true },
            prompt: { type: 'string', default: 'wheel' },
            point_prompts: { type: 'array', default: [] },
            box_prompts: { type: 'array', default: [] },
            apply_mask: { type: 'boolean', default: true },
            output_format: { type: 'string', default: 'png', options: ['jpeg', 'png', 'webp'] },
            return_multiple_masks: { type: 'boolean', default: false },
            max_masks: { type: 'integer', default: 3, min: 1, max: 32 },
            include_scores: { type: 'boolean', default: false },
            include_boxes: { type: 'boolean', default: false }
        }
    },

    'qwen-image-2-pro-edit': {
        id: 'qwen-image-2-pro-edit',
        name: 'Qwen Image 2 Pro Edit',
        description: 'Qwen-Image-2.0 is a next-generation foundational unified generation-and-editing model',
        provider: 'Alibaba',
        falEndpoint: 'fal-ai/qwen-image-2/pro/edit',
        category: MODEL_CATEGORIES.IMAGE_TO_IMAGE,
        creditCost: 80,
        featured: true,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_urls: { type: 'array', required: true },
            negative_prompt: { type: 'string', default: '' },
            enable_prompt_expansion: { type: 'boolean', default: true },
            seed: { type: 'integer' },
            enable_safety_checker: { type: 'boolean', default: true },
            num_images: { type: 'integer', default: 1, min: 1, max: 6 },
            output_format: { type: 'string', default: 'png', options: ['jpeg', 'png', 'webp'] }
        }
    },

    'qwen-image-edit-2511': {
        id: 'qwen-image-edit-2511',
        name: 'Qwen Image Edit 2511',
        description: "Endpoint for Qwen's Image Editing 2511 model.",
        provider: 'Alibaba',
        falEndpoint: 'fal-ai/qwen-image-edit-2511',
        category: MODEL_CATEGORIES.IMAGE_TO_IMAGE,
        creditCost: 40,
        featured: false,
        inputSchema: {
            prompt: { type: 'string', required: true },
            image_urls: { type: 'array', required: true },
            negative_prompt: { type: 'string', default: '' },
            num_inference_steps: { type: 'integer', default: 28, min: 1, max: 50 },
            guidance_scale: { type: 'float', default: 4.5, min: 1, max: 20 },
            seed: { type: 'integer' },
            num_images: { type: 'integer', default: 1, min: 1, max: 4 },
            enable_safety_checker: { type: 'boolean', default: true },
            output_format: { type: 'string', default: 'png', options: ['jpeg', 'png', 'webp'] },
            acceleration: { type: 'string', default: 'regular', options: ['none', 'regular', 'high'] }
        }
    },

    'qwen-image-edit-2511-multiple-angles': {
        id: 'qwen-image-edit-2511-multiple-angles',
        name: 'Qwen Image Edit 2511 multiple Angles',
        description: 'Generates same scene from different angles (azimuth/elevation) with Qwen image Edit 2511',
        provider: 'Alibaba',
        falEndpoint: 'fal-ai/qwen-image-edit-2511-multiple-angles',
        category: MODEL_CATEGORIES.IMAGE_TO_IMAGE,
        creditCost: 50,
        featured: false,
        inputSchema: {
            image_urls: { type: 'array', required: true },
            horizontal_angle: { type: 'float', default: 0, min: 0, max: 360 },
            vertical_angle: { type: 'float', default: 0, min: -30, max: 90 },
            zoom: { type: 'float', default: 5, min: 0, max: 10 },
            additional_prompt: { type: 'string' },
            lora_scale: { type: 'float', default: 1, min: 0, max: 4 },
            guidance_scale: { type: 'float', default: 4.5, min: 1, max: 20 },
            num_inference_steps: { type: 'integer', default: 28, min: 1, max: 50 },
            acceleration: { type: 'string', default: 'regular', options: ['none', 'regular'] },
            negative_prompt: { type: 'string', default: '' },
            seed: { type: 'integer' },
            enable_safety_checker: { type: 'boolean', default: true },
            output_format: { type: 'string', default: 'png', options: ['png', 'jpeg', 'webp'] },
            num_images: { type: 'integer', default: 1, min: 1, max: 4 }
        }
    },

    // =====================================================================
    // BACKGROUND REMOVAL MODELS
    // =====================================================================

    'birefnet-v2': {
        id: 'birefnet-v2',
        name: 'BiRefNet v2',
        description: 'Free high-res background removal with multiple model variants',
        provider: 'BiRefNet',
        falEndpoint: 'fal-ai/birefnet/v2',
        category: MODEL_CATEGORIES.BACKGROUND_REMOVAL,
        creditCost: 10,
        featured: true,
        inputSchema: {
            image_url: { type: 'string', required: true },
            model: { type: 'string', default: 'General Use (Light)', options: ['General Use (Light)', 'General Use (Light 2K)', 'General Use (Heavy)', 'Matting', 'Portrait', 'General Use (Dynamic)'] },
            operating_resolution: { type: 'string', default: '1024x1024', options: ['1024x1024', '2048x2048', '2304x2304'] },
            output_mask: { type: 'boolean', default: false },
            refine_foreground: { type: 'boolean', default: true },
            output_format: { type: 'string', default: 'png', options: ['webp', 'png', 'gif'] },
            mask_only: { type: 'boolean', default: false }
        }
    },

    'bria-rmbg': {
        id: 'bria-rmbg',
        name: 'Bria RMBG 2.0',
        description: 'Commercial-safe background removal trained on licensed data',
        provider: 'Bria',
        falEndpoint: 'fal-ai/bria/background/remove',
        category: MODEL_CATEGORIES.BACKGROUND_REMOVAL,
        creditCost: 15,
        featured: true,
        inputSchema: {
            image_url: { type: 'string', required: true }
        }
    },

    'rembg': {
        id: 'rembg',
        name: 'Remove Background',
        description: 'Remove the background from an image using imageutils',
        provider: 'fal-ai',
        falEndpoint: 'fal-ai/imageutils/rembg',
        category: MODEL_CATEGORIES.BACKGROUND_REMOVAL,
        creditCost: 5,
        featured: false,
        inputSchema: {
            image_url: { type: 'string', required: true },
            crop_to_bbox: { type: 'boolean', default: false }
        }
    },

    // =====================================================================
    // IMAGE UPSCALE MODELS
    // =====================================================================

    'topaz-upscale': {
        id: 'topaz-upscale',
        name: 'Topaz Image Upscale',
        description: 'Industry-leading image enhancement with multiple AI models',
        provider: 'Topaz',
        falEndpoint: 'fal-ai/topaz/upscale/image',
        category: MODEL_CATEGORIES.IMAGE_UPSCALE,
        creditCost: 60,
        featured: true,
        inputSchema: {
            image_url: { type: 'string', required: true },
            model: { type: 'string', default: 'Standard V2', options: ['Low Resolution V2', 'Standard V2', 'CGI', 'High Fidelity V2', 'Text Refine', 'Recovery', 'Redefine', 'Recovery V2', 'Standard MAX', 'Wonder'] },
            upscale_factor: { type: 'float', default: 2, min: 1, max: 4 },
            output_format: { type: 'string', default: 'jpeg', options: ['jpeg', 'png'] },
            subject_detection: { type: 'string', default: 'All', options: ['All', 'Foreground', 'Background'] },
            face_enhancement: { type: 'boolean', default: true },
            face_enhancement_creativity: { type: 'float', default: 0, min: 0, max: 1 },
            face_enhancement_strength: { type: 'float', default: 0.8, min: 0, max: 1 },
            sharpen: { type: 'float', min: 0, max: 1 },
            denoise: { type: 'float', min: 0, max: 1 },
            fix_compression: { type: 'float', min: 0, max: 1 }
        }
    },

    'seedvr-upscale-image': {
        id: 'seedvr-upscale-image',
        name: 'SeedVR2 Image Upscale',
        description: 'Affordable AI upscaling with factor or target resolution modes',
        provider: 'ByteDance',
        falEndpoint: 'fal-ai/seedvr/upscale/image',
        category: MODEL_CATEGORIES.IMAGE_UPSCALE,
        creditCost: 25,
        featured: true,
        inputSchema: {
            image_url: { type: 'string', required: true },
            upscale_mode: { type: 'string', default: 'factor', options: ['target', 'factor'] },
            upscale_factor: { type: 'float', default: 2, min: 1, max: 10 },
            target_resolution: { type: 'string', default: '1080p', options: ['720p', '1080p', '1440p', '2160p'] },
            seed: { type: 'integer' },
            noise_scale: { type: 'float', default: 0.1, min: 0, max: 1 },
            output_format: { type: 'string', default: 'jpg', options: ['png', 'jpg', 'webp'] }
        }
    },

    'clarity-upscaler': {
        id: 'clarity-upscaler',
        name: 'Clarity Upscaler',
        description: 'Clarity upscaler for upscaling images with high very fidelity.',
        provider: 'fal-ai',
        falEndpoint: 'fal-ai/clarity-upscaler',
        category: MODEL_CATEGORIES.IMAGE_UPSCALE,
        creditCost: 40,
        featured: true,
        inputSchema: {
            image_url: { type: 'string', required: true },
            prompt: { type: 'string', default: 'masterpiece, best quality, highres' },
            upscale_factor: { type: 'float', default: 2, min: 1, max: 4 },
            negative_prompt: { type: 'string', default: '(worst quality, low quality, normal quality:2)' },
            creativity: { type: 'float', default: 0.35, min: 0, max: 1 },
            resemblance: { type: 'float', default: 0.6, min: 0, max: 1 },
            guidance_scale: { type: 'float', default: 4, min: 0, max: 20 },
            num_inference_steps: { type: 'integer', default: 18, min: 4, max: 50 },
            seed: { type: 'integer' },
            enable_safety_checker: { type: 'boolean', default: true }
        }
    },

    'esrgan': {
        id: 'esrgan',
        name: 'ESRGAN Upscaler',
        description: 'Upscale images by a given factor with RealESRGAN',
        provider: 'fal-ai',
        falEndpoint: 'fal-ai/esrgan',
        category: MODEL_CATEGORIES.IMAGE_UPSCALE,
        creditCost: 15,
        featured: false,
        inputSchema: {
            image_url: { type: 'string', required: true },
            scale: { type: 'float', default: 2, min: 1, max: 8 },
            tile: { type: 'integer', default: 0 },
            face: { type: 'boolean', default: false },
            model: { type: 'string', default: 'RealESRGAN_x4plus', options: ['RealESRGAN_x4plus', 'RealESRGAN_x2plus', 'RealESRGAN_x4plus_anime_6B', 'RealESRGAN_x4_v3', 'RealESRGAN_x4_wdn_v3', 'RealESRGAN_x4_anime_v3'] },
            output_format: { type: 'string', default: 'png', options: ['png', 'jpeg'] }
        }
    },


    // =====================================================================
    // VIDEO GENERATION MODELS (Text/Image to Video)
    // =====================================================================

    'fal-ai-bytedance-seedance-v1-pro-fast-text-to-video': {
        id: "fal-ai-bytedance-seedance-v1-pro-fast-text-to-video",
        name: "Bytedance",
        description: "Text to Video endpoint for Seedance 1.0 Pro Fast, a next-generation video model designed to deliver maximum performance at minimal cost",
        provider: "ByteDance",
        falEndpoint: "fal-ai/bytedance/seedance/v1/pro/fast/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 75,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "21:9",
                                "16:9",
                                "4:3",
                                "1:1",
                                "3:4",
                                "9:16"
                        ]
                },
                resolution: {
                        type: "string",
                        default: "1080p",
                        options: [
                                "480p",
                                "720p",
                                "1080p"
                        ]
                },
                duration: {
                        type: "string",
                        default: "5",
                        options: [
                                "2",
                                "3",
                                "4",
                                "5",
                                "6",
                                "7",
                                "8",
                                "9",
                                "10",
                                "11",
                                "12"
                        ]
                },
                camera_fixed: {
                        type: "boolean",
                        default: "false"
                },
                seed: {
                        type: "integer"
                },
                enable_safety_checker: {
                        type: "boolean",
                        default: "true"
                },
                num_frames: {
                        type: "integer"
                }
        }
},

    'xai-grok-imagine-video-text-to-video': {
        id: "xai-grok-imagine-video-text-to-video",
        name: "Grok Imagine Video",
        description: "Generate videos with audio from text using Grok Imagine Video.",
        provider: "xAI",
        falEndpoint: "xai/grok-imagine-video/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 35,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                duration: {
                        type: "integer",
                        default: 6
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "4:3",
                                "3:2",
                                "1:1",
                                "2:3",
                                "3:4",
                                "9:16"
                        ]
                },
                resolution: {
                        type: "string",
                        default: "720p",
                        options: [
                                "480p",
                                "720p"
                        ]
                }
        }
},

    'fal-ai-kling-video-v3-pro-text-to-video': {
        id: "fal-ai-kling-video-v3-pro-text-to-video",
        name: "Kling Video v3 Text to Video [Pro]",
        description: "Kling 3.0 Pro: Top-tier text-to-video with cinematic visuals, fluid motion, and native audio generation, with multi-shot support.",
        provider: "Kuaishou",
        falEndpoint: "fal-ai/kling-video/v3/pro/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 84,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string"
                },
                duration: {
                        type: "string",
                        default: "5",
                        options: [
                                "3",
                                "4",
                                "5",
                                "6",
                                "7",
                                "8",
                                "9",
                                "10",
                                "11",
                                "12",
                                "13",
                                "14",
                                "15"
                        ]
                },
                multi_prompt: {
                        type: "string"
                },
                generate_audio: {
                        type: "boolean",
                        default: "true"
                },
                shot_type: {
                        type: "string",
                        default: "customize",
                        options: [
                                "customize",
                                "intelligent"
                        ]
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16",
                                "1:1"
                        ]
                },
                negative_prompt: {
                        type: "string",
                        default: "blur, distort, and low quality"
                },
                cfg_scale: {
                        type: "float",
                        default: null
                }
        }
},

    'fal-ai-kling-video-lipsync-audio-to-video': {
        id: "fal-ai-kling-video-lipsync-audio-to-video",
        name: "Kling LipSync Audio-to-Video",
        description: "Kling LipSync is an audio-to-video model that generates realistic lip movements from audio input.",
        provider: "Kuaishou",
        falEndpoint: "fal-ai/kling-video/lipsync/audio-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 7,
        featured: true,
        inputSchema: {
                video_url: {
                        type: "string",
                        required: true
                },
                audio_url: {
                        type: "string",
                        required: true
                }
        }
},

    'fal-ai-kling-video-v1-6-pro-text-to-video': {
        id: "fal-ai-kling-video-v1-6-pro-text-to-video",
        name: "Kling 1.6",
        description: "Generate video clips from your prompts using Kling 1.6 (pro)",
        provider: "Kuaishou",
        falEndpoint: "fal-ai/kling-video/v1.6/pro/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 49,
        featured: true,
        inputSchema: {
                duration: {
                        type: "string",
                        default: "5",
                        options: [
                                "5",
                                "10"
                        ]
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16",
                                "1:1"
                        ]
                },
                negative_prompt: {
                        type: "string",
                        default: "blur, distort, and low quality"
                },
                cfg_scale: {
                        type: "float",
                        default: null
                }
        }
},

    'fal-ai-kling-video-v1-6-standard-text-to-video': {
        id: "fal-ai-kling-video-v1-6-standard-text-to-video",
        name: "Kling 1.6",
        description: "Generate video clips from your prompts using Kling 1.6 (std)",
        provider: "Kuaishou",
        falEndpoint: "fal-ai/kling-video/v1.6/standard/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 28,
        featured: true,
        inputSchema: {
                duration: {
                        type: "string",
                        default: "5",
                        options: [
                                "5",
                                "10"
                        ]
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16",
                                "1:1"
                        ]
                },
                negative_prompt: {
                        type: "string",
                        default: "blur, distort, and low quality"
                },
                cfg_scale: {
                        type: "float",
                        default: null
                }
        }
},

    'fal-ai-kling-video-v2-1-master-text-to-video': {
        id: "fal-ai-kling-video-v2-1-master-text-to-video",
        name: "Kling 2.1 Master",
        description: "Kling 2.1 Master: The premium endpoint for Kling 2.1, designed for top-tier text-to-video generation with unparalleled motion fluidity, cinematic visuals, and exceptional prompt precision.",
        provider: "Kuaishou",
        falEndpoint: "fal-ai/kling-video/v2.1/master/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 140,
        featured: true,
        inputSchema: {
                duration: {
                        type: "string",
                        default: "5",
                        options: [
                                "5",
                                "10"
                        ]
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16",
                                "1:1"
                        ]
                },
                negative_prompt: {
                        type: "string",
                        default: "blur, distort, and low quality"
                },
                cfg_scale: {
                        type: "float",
                        default: null
                }
        }
},

    'fal-ai-kling-video-v2-5-turbo-pro-text-to-video': {
        id: "fal-ai-kling-video-v2-5-turbo-pro-text-to-video",
        name: "Kling v2.5 Text to Video",
        description: "Kling 2.5 Turbo Pro: Top-tier text-to-video generation with unparalleled motion fluidity, cinematic visuals, and exceptional prompt precision.",
        provider: "Kuaishou",
        falEndpoint: "fal-ai/kling-video/v2.5-turbo/pro/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 35,
        featured: true,
        inputSchema: {
                duration: {
                        type: "string",
                        default: "5",
                        options: [
                                "5",
                                "10"
                        ]
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16",
                                "1:1"
                        ]
                },
                negative_prompt: {
                        type: "string",
                        default: "blur, distort, and low quality"
                },
                cfg_scale: {
                        type: "float",
                        default: null
                }
        }
},

    'fal-ai-kling-video-v2-6-pro-text-to-video': {
        id: "fal-ai-kling-video-v2-6-pro-text-to-video",
        name: "Kling Video v2.6 Text to Video",
        description: "Kling 2.6 Pro: Top-tier text-to-video with cinematic visuals, fluid motion, and native audio generation.",
        provider: "Kuaishou",
        falEndpoint: "fal-ai/kling-video/v2.6/pro/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 70,
        featured: true,
        inputSchema: {
                duration: {
                        type: "string",
                        default: "5",
                        options: [
                                "5",
                                "10"
                        ]
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16",
                                "1:1"
                        ]
                },
                negative_prompt: {
                        type: "string",
                        default: "blur, distort, and low quality"
                },
                cfg_scale: {
                        type: "float",
                        default: null
                },
                generate_audio: {
                        type: "boolean",
                        default: "true"
                }
        }
},

    'fal-ai-kling-video-o3-pro-text-to-video': {
        id: "fal-ai-kling-video-o3-pro-text-to-video",
        name: "Kling O3 Text to Video [Pro]",
        description: "Generate realistic videos using Kling O3 from Kling Team!",
        provider: "Kuaishou",
        falEndpoint: "fal-ai/kling-video/o3/pro/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 70,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string"
                },
                duration: {
                        type: "string",
                        default: "5",
                        options: [
                                "3",
                                "4",
                                "5",
                                "6",
                                "7",
                                "8",
                                "9",
                                "10",
                                "11",
                                "12",
                                "13",
                                "14",
                                "15"
                        ]
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16",
                                "1:1"
                        ]
                },
                generate_audio: {
                        type: "boolean",
                        default: "false"
                },
                multi_prompt: {
                        type: "string"
                },
                shot_type: {
                        type: "string",
                        default: "customize"
                }
        }
},

    'fal-ai-kling-video-v3-standard-text-to-video': {
        id: "fal-ai-kling-video-v3-standard-text-to-video",
        name: "Kling Video v3 Text to Video [Standard]",
        description: "Kling 3.0 Standard: Top-tier text-to-video with cinematic visuals, fluid motion, and native audio generation, with multi-shot support.",
        provider: "Kuaishou",
        falEndpoint: "fal-ai/kling-video/v3/standard/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 63,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string"
                },
                duration: {
                        type: "string",
                        default: "5",
                        options: [
                                "3",
                                "4",
                                "5",
                                "6",
                                "7",
                                "8",
                                "9",
                                "10",
                                "11",
                                "12",
                                "13",
                                "14",
                                "15"
                        ]
                },
                multi_prompt: {
                        type: "string"
                },
                generate_audio: {
                        type: "boolean",
                        default: "true"
                },
                shot_type: {
                        type: "string",
                        default: "customize",
                        options: [
                                "customize",
                                "intelligent"
                        ]
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16",
                                "1:1"
                        ]
                },
                negative_prompt: {
                        type: "string",
                        default: "blur, distort, and low quality"
                },
                cfg_scale: {
                        type: "float",
                        default: null
                }
        }
},

    'fal-ai-ltx-2-3-text-to-video-fast': {
        id: "fal-ai-ltx-2-3-text-to-video-fast",
        name: "LTX 2.3 Video Fast",
        description: "LTX-2.3 is a high-quality, fast AI video model available in Pro and Fast variants for text-to-video, image-to-video, and audio-to-video.",
        provider: "Lightricks",
        falEndpoint: "fal-ai/ltx-2.3/text-to-video/fast",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 20,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                duration: {
                        type: "string",
                        default: "6",
                        options: [
                                "6",
                                "8",
                                "10",
                                "12",
                                "14",
                                "16",
                                "18",
                                "20"
                        ]
                },
                resolution: {
                        type: "string",
                        default: "1080p",
                        options: [
                                "1080p",
                                "1440p",
                                "2160p"
                        ]
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16"
                        ]
                },
                fps: {
                        type: "string",
                        default: "25",
                        options: [
                                "24",
                                "25",
                                "48",
                                "50"
                        ]
                },
                generate_audio: {
                        type: "boolean",
                        default: "true"
                }
        }
},

    'fal-ai-minimax-hailuo-02-pro-text-to-video': {
        id: "fal-ai-minimax-hailuo-02-pro-text-to-video",
        name: "MiniMax Hailuo 02 [Pro] (Text to Video)",
        description: "MiniMax Hailuo-02 Text To Video API (Pro, 1080p): Advanced video generation model with 1080p resolution",
        provider: "MiniMax",
        falEndpoint: "fal-ai/minimax/hailuo-02/pro/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 40,
        featured: true,
        inputSchema: {
                prompt_optimizer: {
                        type: "boolean",
                        default: "true"
                }
        }
},

    'fal-ai-pixverse-c1-text-to-video': {
        id: "fal-ai-pixverse-c1-text-to-video",
        name: "PixVerse C1 Text to Video",
        description: "Generate film-grade videos from text prompts with native audio, up to 1080p and 15 seconds, using PixVerse C1.",
        provider: "PixVerse",
        falEndpoint: "fal-ai/pixverse/c1/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 33,
        featured: true,
        inputSchema: {
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "4:3",
                                "1:1",
                                "3:4",
                                "9:16",
                                "2:3",
                                "3:2",
                                "21:9"
                        ]
                },
                resolution: {
                        type: "string",
                        default: "720p",
                        options: [
                                "360p",
                                "540p",
                                "720p",
                                "1080p"
                        ]
                },
                duration: {
                        type: "integer",
                        default: 5
                },
                seed: {
                        type: "integer"
                },
                generate_audio_switch: {
                        type: "boolean",
                        default: "false"
                }
        }
},

    'bytedance-seedance-2-0-fast-text-to-video': {
        id: "bytedance-seedance-2-0-fast-text-to-video",
        name: "Seedance 2.0 Fast Text to Video",
        description: "ByteDance's most advanced text-to-video model, fast tier. Lower latency and cost with cinematic output, native audio, multi-shot editing, and director-level camera control.",
        provider: "ByteDance",
        falEndpoint: "bytedance/seedance-2.0/fast/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 121,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                resolution: {
                        type: "string",
                        default: "720p",
                        options: [
                                "480p",
                                "720p"
                        ]
                },
                duration: {
                        type: "string",
                        default: "auto",
                        options: [
                                "auto",
                                "4",
                                "5",
                                "6",
                                "7",
                                "8",
                                "9",
                                "10",
                                "11",
                                "12",
                                "13",
                                "14",
                                "15"
                        ]
                },
                aspect_ratio: {
                        type: "string",
                        default: "auto",
                        options: [
                                "auto",
                                "21:9",
                                "16:9",
                                "4:3",
                                "1:1",
                                "3:4",
                                "9:16"
                        ]
                },
                generate_audio: {
                        type: "boolean",
                        default: "true"
                },
                seed: {
                        type: "integer"
                },
                end_user_id: {
                        type: "string"
                }
        }
},

    'bytedance-seedance-2-0-image-to-video': {
        id: "bytedance-seedance-2-0-image-to-video",
        name: "Seedance 2 Image to Video",
        description: "ByteDance's most advanced image-to-video model. Animate still images into cinematic video with synchronized audio, start and end frame control, and motion prompts.",
        provider: "ByteDance",
        falEndpoint: "bytedance/seedance-2.0/image-to-video",
        category: MODEL_CATEGORIES.IMAGE_TO_VIDEO,
        creditCost: 151,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                image_url: {
                        type: "string",
                        required: true
                },
                end_image_url: {
                        type: "string"
                },
                resolution: {
                        type: "string",
                        default: "720p",
                        options: [
                                "480p",
                                "720p"
                        ]
                },
                duration: {
                        type: "string",
                        default: "auto",
                        options: [
                                "auto",
                                "4",
                                "5",
                                "6",
                                "7",
                                "8",
                                "9",
                                "10",
                                "11",
                                "12",
                                "13",
                                "14",
                                "15"
                        ]
                },
                aspect_ratio: {
                        type: "string",
                        default: "auto",
                        options: [
                                "auto",
                                "21:9",
                                "16:9",
                                "4:3",
                                "1:1",
                                "3:4",
                                "9:16"
                        ]
                },
                generate_audio: {
                        type: "boolean",
                        default: "true"
                },
                seed: {
                        type: "integer"
                },
                end_user_id: {
                        type: "string"
                }
        }
},

    'bytedance-seedance-2-0-fast-image-to-video': {
        id: "bytedance-seedance-2-0-fast-image-to-video",
        name: "Seedance 2.0 Fast Image to Video",
        description: "ByteDance's most advanced image-to-video model, fast tier. Lower latency and cost with synchronized audio, start and end frame control, and motion prompts.",
        provider: "ByteDance",
        falEndpoint: "bytedance/seedance-2.0/fast/image-to-video",
        category: MODEL_CATEGORIES.IMAGE_TO_VIDEO,
        creditCost: 121,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                image_url: {
                        type: "string",
                        required: true
                },
                end_image_url: {
                        type: "string"
                },
                resolution: {
                        type: "string",
                        default: "720p",
                        options: [
                                "480p",
                                "720p"
                        ]
                },
                duration: {
                        type: "string",
                        default: "auto",
                        options: [
                                "auto",
                                "4",
                                "5",
                                "6",
                                "7",
                                "8",
                                "9",
                                "10",
                                "11",
                                "12",
                                "13",
                                "14",
                                "15"
                        ]
                },
                aspect_ratio: {
                        type: "string",
                        default: "auto",
                        options: [
                                "auto",
                                "21:9",
                                "16:9",
                                "4:3",
                                "1:1",
                                "3:4",
                                "9:16"
                        ]
                },
                generate_audio: {
                        type: "boolean",
                        default: "true"
                },
                seed: {
                        type: "integer"
                },
                end_user_id: {
                        type: "string"
                }
        }
},

    'fal-ai-bytedance-seedance-v1-5-pro-text-to-video': {
        id: "fal-ai-bytedance-seedance-v1-5-pro-text-to-video",
        name: "Bytedance",
        description: "Generate videos with audio with Seedance 1.5",
        provider: "ByteDance",
        falEndpoint: "fal-ai/bytedance/seedance/v1.5/pro/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 26,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "21:9",
                                "16:9",
                                "4:3",
                                "1:1",
                                "3:4",
                                "9:16",
                                "auto"
                        ]
                },
                resolution: {
                        type: "string",
                        default: "720p",
                        options: [
                                "480p",
                                "720p",
                                "1080p"
                        ]
                },
                duration: {
                        type: "string",
                        default: "5",
                        options: [
                                "4",
                                "5",
                                "6",
                                "7",
                                "8",
                                "9",
                                "10",
                                "11",
                                "12"
                        ]
                },
                camera_fixed: {
                        type: "boolean",
                        default: "false"
                },
                seed: {
                        type: "integer"
                },
                enable_safety_checker: {
                        type: "boolean",
                        default: "true"
                },
                generate_audio: {
                        type: "boolean",
                        default: "true"
                }
        }
},

    'fal-ai-veo3-fast': {
        id: "fal-ai-veo3-fast",
        name: "Veo 3 Fast",
        description: "Faster and more cost effective version of Google's Veo 3!",
        provider: "Google",
        falEndpoint: "fal-ai/veo3/fast",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 75,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16"
                        ]
                },
                duration: {
                        type: "string",
                        default: "8s",
                        options: [
                                "4s",
                                "6s",
                                "8s"
                        ]
                },
                negative_prompt: {
                        type: "string"
                },
                resolution: {
                        type: "string",
                        default: "720p",
                        options: [
                                "720p",
                                "1080p"
                        ]
                },
                generate_audio: {
                        type: "boolean",
                        default: "true"
                },
                seed: {
                        type: "integer"
                },
                auto_fix: {
                        type: "boolean",
                        default: "true"
                },
                safety_tolerance: {
                        type: "string",
                        default: "4",
                        options: [
                                "1",
                                "2",
                                "3",
                                "4",
                                "5",
                                "6"
                        ]
                }
        }
},

    'fal-ai-bytedance-seedance-v1-lite-text-to-video': {
        id: "fal-ai-bytedance-seedance-v1-lite-text-to-video",
        name: "Seedance 1.0 Lite",
        description: "Seedance 1.0 Lite",
        provider: "ByteDance",
        falEndpoint: "fal-ai/bytedance/seedance/v1/lite/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 18,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "21:9",
                                "16:9",
                                "4:3",
                                "1:1",
                                "3:4",
                                "9:16",
                                "9:21"
                        ]
                },
                resolution: {
                        type: "string",
                        default: "720p",
                        options: [
                                "480p",
                                "720p",
                                "1080p"
                        ]
                },
                duration: {
                        type: "string",
                        default: "5",
                        options: [
                                "2",
                                "3",
                                "4",
                                "5",
                                "6",
                                "7",
                                "8",
                                "9",
                                "10",
                                "11",
                                "12"
                        ]
                },
                camera_fixed: {
                        type: "boolean",
                        default: "false"
                },
                seed: {
                        type: "integer"
                },
                enable_safety_checker: {
                        type: "boolean",
                        default: "true"
                },
                num_frames: {
                        type: "integer"
                }
        }
},

    'fal-ai-sora-2-text-to-video-pro': {
        id: "fal-ai-sora-2-text-to-video-pro",
        name: "Sora 2",
        description: "Text-to-video endpoint for Sora 2 Pro, OpenAI's state-of-the-art video model capable of creating richly detailed, dynamic clips with audio from natural language or images.",
        provider: "OpenAI",
        falEndpoint: "fal-ai/sora-2/text-to-video/pro",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 84,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                resolution: {
                        type: "string",
                        default: "1080p",
                        options: [
                                "720p",
                                "1080p",
                                "true_1080p"
                        ]
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "9:16",
                                "16:9"
                        ]
                },
                duration: {
                        type: "string",
                        default: "4",
                        options: [
                                "4",
                                "8",
                                "12",
                                "16",
                                "20"
                        ]
                },
                delete_video: {
                        type: "boolean",
                        default: "true"
                },
                detect_and_block_ip: {
                        type: "boolean",
                        default: "false"
                },
                character_ids: {
                        type: "string"
                }
        }
},

    'fal-ai-kling-video-v2-master-text-to-video': {
        id: "fal-ai-kling-video-v2-master-text-to-video",
        name: "Kling 2.0 Master",
        description: "Generate video clips from your prompts using Kling 2.0 Master",
        provider: "Kuaishou",
        falEndpoint: "fal-ai/kling-video/v2/master/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 140,
        featured: true,
        inputSchema: {
                duration: {
                        type: "string",
                        default: "5",
                        options: [
                                "5",
                                "10"
                        ]
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16",
                                "1:1"
                        ]
                },
                negative_prompt: {
                        type: "string",
                        default: "blur, distort, and low quality"
                },
                cfg_scale: {
                        type: "float",
                        default: null
                }
        }
},

    'fal-ai-veo3-1-fast': {
        id: "fal-ai-veo3-1-fast",
        name: "Veo 3.1 Fast",
        description: "Faster and more cost effective version of Google's Veo 3.1!",
        provider: "Google",
        falEndpoint: "fal-ai/veo3.1/fast",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 75,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16"
                        ]
                },
                duration: {
                        type: "string",
                        default: "8s",
                        options: [
                                "4s",
                                "6s",
                                "8s"
                        ]
                },
                negative_prompt: {
                        type: "string"
                },
                resolution: {
                        type: "string",
                        default: "720p",
                        options: [
                                "720p",
                                "1080p",
                                "4k"
                        ]
                },
                generate_audio: {
                        type: "boolean",
                        default: "true"
                },
                seed: {
                        type: "integer"
                },
                auto_fix: {
                        type: "boolean",
                        default: "true"
                },
                safety_tolerance: {
                        type: "string",
                        default: "4",
                        options: [
                                "1",
                                "2",
                                "3",
                                "4",
                                "5",
                                "6"
                        ]
                }
        }
},

    'fal-ai-veo3': {
        id: "fal-ai-veo3",
        name: "Veo 3",
        description: "Veo 3 by Google, the most advanced AI video generation model in the world. With sound on!",
        provider: "Google",
        falEndpoint: "fal-ai/veo3",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 200,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16"
                        ]
                },
                duration: {
                        type: "string",
                        default: "8s",
                        options: [
                                "4s",
                                "6s",
                                "8s"
                        ]
                },
                negative_prompt: {
                        type: "string"
                },
                resolution: {
                        type: "string",
                        default: "720p",
                        options: [
                                "720p",
                                "1080p"
                        ]
                },
                generate_audio: {
                        type: "boolean",
                        default: "true"
                },
                seed: {
                        type: "integer"
                },
                auto_fix: {
                        type: "boolean",
                        default: "true"
                },
                safety_tolerance: {
                        type: "string",
                        default: "4",
                        options: [
                                "1",
                                "2",
                                "3",
                                "4",
                                "5",
                                "6"
                        ]
                }
        }
},

    'fal-ai-veo3-1': {
        id: "fal-ai-veo3-1",
        name: "Veo 3.1",
        description: "Veo 3.1 by Google, the most advanced AI video generation model in the world. With sound on!",
        provider: "Google",
        falEndpoint: "fal-ai/veo3.1",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 200,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16"
                        ]
                },
                duration: {
                        type: "string",
                        default: "8s",
                        options: [
                                "4s",
                                "6s",
                                "8s"
                        ]
                },
                negative_prompt: {
                        type: "string"
                },
                resolution: {
                        type: "string",
                        default: "720p",
                        options: [
                                "720p",
                                "1080p",
                                "4k"
                        ]
                },
                generate_audio: {
                        type: "boolean",
                        default: "true"
                },
                seed: {
                        type: "integer"
                },
                auto_fix: {
                        type: "boolean",
                        default: "true"
                },
                safety_tolerance: {
                        type: "string",
                        default: "4",
                        options: [
                                "1",
                                "2",
                                "3",
                                "4",
                                "5",
                                "6"
                        ]
                }
        }
},

    'fal-ai-vidu-q3-text-to-video': {
        id: "fal-ai-vidu-q3-text-to-video",
        name: "Vidu",
        description: "Vidu's latest Q3 pro models",
        provider: "Shengshu",
        falEndpoint: "fal-ai/vidu/q3/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 77,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                duration: {
                        type: "integer",
                        default: 5
                },
                seed: {
                        type: "integer"
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16",
                                "4:3",
                                "3:4",
                                "1:1"
                        ]
                },
                resolution: {
                        type: "string",
                        default: "720p",
                        options: [
                                "360p",
                                "540p",
                                "720p",
                                "1080p"
                        ]
                },
                audio: {
                        type: "boolean",
                        default: "true"
                }
        }
},

    'fal-ai-wan-25-preview-text-to-video': {
        id: "fal-ai-wan-25-preview-text-to-video",
        name: "Wan 2.5 Text to Video",
        description: "Wan 2.5 text-to-video model.",
        provider: "Alibaba",
        falEndpoint: "fal-ai/wan-25-preview/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 50,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                audio_url: {
                        type: "string"
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16",
                                "1:1"
                        ]
                },
                resolution: {
                        type: "string",
                        default: "1080p",
                        options: [
                                "480p",
                                "720p",
                                "1080p"
                        ]
                },
                duration: {
                        type: "string",
                        default: "5",
                        options: [
                                "5",
                                "10"
                        ]
                },
                negative_prompt: {
                        type: "string"
                },
                enable_prompt_expansion: {
                        type: "boolean",
                        default: "true"
                },
                seed: {
                        type: "integer"
                },
                enable_safety_checker: {
                        type: "boolean",
                        default: "true"
                }
        }
},

    'wan-v2-6-text-to-video': {
        id: "wan-v2-6-text-to-video",
        name: "Wan v2.6 Text to Video",
        description: "Wan 2.6 text-to-video model.",
        provider: "Alibaba",
        falEndpoint: "wan/v2.6/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 50,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                audio_url: {
                        type: "string"
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16",
                                "1:1",
                                "4:3",
                                "3:4"
                        ]
                },
                resolution: {
                        type: "string",
                        default: "1080p",
                        options: [
                                "720p",
                                "1080p"
                        ]
                },
                duration: {
                        type: "string",
                        default: "5",
                        options: [
                                "5",
                                "10",
                                "15"
                        ]
                },
                negative_prompt: {
                        type: "string",
                        default: ""
                },
                enable_prompt_expansion: {
                        type: "boolean",
                        default: "true"
                },
                multi_shots: {
                        type: "boolean",
                        default: "true"
                },
                seed: {
                        type: "integer"
                },
                enable_safety_checker: {
                        type: "boolean",
                        default: "true"
                }
        }
},

    'fal-ai-wan-v2-7-text-to-video': {
        id: "fal-ai-wan-v2-7-text-to-video",
        name: "Wan Text to Video",
        description: "Wan 2.7 is the latest generation AI video model, delivering enhanced motion smoothness, superior scene fidelity, and greater visual coherence.",
        provider: "Alibaba",
        falEndpoint: "fal-ai/wan/v2.7/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 50,
        featured: true,
        inputSchema: {
                prompt: {
                        type: "string",
                        required: true
                },
                audio_url: {
                        type: "string"
                },
                aspect_ratio: {
                        type: "string",
                        default: "16:9",
                        options: [
                                "16:9",
                                "9:16",
                                "1:1",
                                "4:3",
                                "3:4"
                        ]
                },
                resolution: {
                        type: "string",
                        default: "1080p",
                        options: [
                                "720p",
                                "1080p"
                        ]
                },
                duration: {
                        type: "string",
                        default: "5",
                        options: [
                                "2",
                                "3",
                                "4",
                                "5",
                                "6",
                                "7",
                                "8",
                                "9",
                                "10",
                                "11",
                                "12",
                                "13",
                                "14",
                                "15"
                        ]
                },
                negative_prompt: {
                        type: "string"
                },
                enable_prompt_expansion: {
                        type: "boolean",
                        default: "true"
                },
                seed: {
                        type: "integer"
                },
                enable_safety_checker: {
                        type: "boolean",
                        default: "true"
                }
        }
},
    // =====================================================================
    // NEW TEXT-TO-VIDEO MODELS
    // =====================================================================

    'fal-ai-veo3-1-text-to-video': {
        id: "fal-ai-veo3-1-text-to-video",
        name: "Veo 3.1",
        description: "Google's most advanced AI video generation model with sound. Cinematic 720p/1080p output.",
        provider: "Google",
        falEndpoint: "fal-ai/veo3.1",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 200,
        featured: true,
        inputSchema: {
                prompt: { type: "string", required: true },
                aspect_ratio: { type: "string", default: "16:9", options: ["16:9", "9:16"] },
                duration: { type: "string", default: "8s", options: ["4s", "6s", "8s"] },
                resolution: { type: "string", default: "720p", options: ["720p", "1080p", "4k"] },
                negative_prompt: { type: "string" },
                generate_audio: { type: "boolean", default: true },
                seed: { type: "integer" }
        }
    },

    'fal-ai-veo3-1-fast-text-to-video': {
        id: "fal-ai-veo3-1-fast-text-to-video",
        name: "Veo 3.1 Fast",
        description: "Faster and more cost-effective version of Google's Veo 3.1.",
        provider: "Google",
        falEndpoint: "fal-ai/veo3.1/fast",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 120,
        featured: true,
        inputSchema: {
                prompt: { type: "string", required: true },
                aspect_ratio: { type: "string", default: "16:9", options: ["16:9", "9:16"] },
                duration: { type: "string", default: "8s", options: ["4s", "6s", "8s"] },
                resolution: { type: "string", default: "720p", options: ["720p", "1080p", "4k"] },
                negative_prompt: { type: "string" },
                generate_audio: { type: "boolean", default: true },
                seed: { type: "integer" }
        }
    },

    'bytedance-seedance-2-0-text-to-video': {
        id: "bytedance-seedance-2-0-text-to-video",
        name: "Seedance 2.0",
        description: "ByteDance's most advanced text-to-video model. Cinematic output with native audio, multi-shot editing, and real-world physics.",
        provider: "ByteDance",
        falEndpoint: "bytedance/seedance-2.0/text-to-video",
        category: MODEL_CATEGORIES.TEXT_TO_VIDEO,
        creditCost: 100,
        featured: true,
        inputSchema: {
                prompt: { type: "string", required: true },
                aspect_ratio: { type: "string", default: "16:9", options: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"] },
                resolution: { type: "string", default: "1080p", options: ["480p", "720p", "1080p"] },
                duration: { type: "string", default: "5", options: ["2", "3", "4", "5", "6", "7", "8", "9", "10"] },
                seed: { type: "integer" },
                enable_safety_checker: { type: "boolean", default: true }
        }
    },

    // =====================================================================
    // NEW IMAGE-TO-VIDEO MODELS
    // =====================================================================

    'fal-ai-veo3-1-image-to-video': {
        id: "fal-ai-veo3-1-image-to-video",
        name: "Veo 3.1 Image to Video",
        description: "Google's state-of-the-art image-to-video model from DeepMind.",
        provider: "Google",
        falEndpoint: "fal-ai/veo3.1/image-to-video",
        category: MODEL_CATEGORIES.IMAGE_TO_VIDEO,
        creditCost: 200,
        featured: true,
        inputSchema: {
                prompt: { type: "string", required: true },
                image_url: { type: "string", required: true },
                aspect_ratio: { type: "string", default: "16:9", options: ["16:9", "9:16"] },
                duration: { type: "string", default: "8s", options: ["4s", "6s", "8s"] },
                resolution: { type: "string", default: "720p", options: ["720p", "1080p"] },
                generate_audio: { type: "boolean", default: true },
                seed: { type: "integer" }
        }
    },

    'fal-ai-veo3-1-fast-image-to-video': {
        id: "fal-ai-veo3-1-fast-image-to-video",
        name: "Veo 3.1 Fast Image to Video",
        description: "Fast version of Veo 3.1 for image-to-video generation.",
        provider: "Google",
        falEndpoint: "fal-ai/veo3.1/fast/image-to-video",
        category: MODEL_CATEGORIES.IMAGE_TO_VIDEO,
        creditCost: 120,
        featured: true,
        inputSchema: {
                prompt: { type: "string", required: true },
                image_url: { type: "string", required: true },
                aspect_ratio: { type: "string", default: "16:9", options: ["16:9", "9:16"] },
                duration: { type: "string", default: "8s", options: ["4s", "6s", "8s"] },
                resolution: { type: "string", default: "720p", options: ["720p", "1080p"] },
                generate_audio: { type: "boolean", default: true },
                seed: { type: "integer" }
        }
    },

    'fal-ai-kling-video-v3-pro-image-to-video': {
        id: "fal-ai-kling-video-v3-pro-image-to-video",
        name: "Kling Video v3 Image to Video [Pro]",
        description: "Kling 3.0 Pro: Top-tier image-to-video with cinematic visuals, fluid motion, and native audio.",
        provider: "Kuaishou",
        falEndpoint: "fal-ai/kling-video/v3/pro/image-to-video",
        category: MODEL_CATEGORIES.IMAGE_TO_VIDEO,
        creditCost: 84,
        featured: true,
        inputSchema: {
                prompt: { type: "string" },
                image_url: { type: "string", required: true },
                duration: { type: "string", default: "5", options: ["3", "4", "5", "6", "7", "8", "9", "10"] },
                generate_audio: { type: "boolean", default: true },
                aspect_ratio: { type: "string", default: "16:9", options: ["16:9", "9:16", "1:1"] },
                negative_prompt: { type: "string", default: "blur, distort, and low quality" },
                seed: { type: "integer" }
        }
    },

    'fal-ai-kling-video-v2-6-pro-image-to-video': {
        id: "fal-ai-kling-video-v2-6-pro-image-to-video",
        name: "Kling v2.6 Image to Video [Pro]",
        description: "Kling 2.6 Pro: Top-tier image-to-video with cinematic visuals, fluid motion, and native audio.",
        provider: "Kuaishou",
        falEndpoint: "fal-ai/kling-video/v2.6/pro/image-to-video",
        category: MODEL_CATEGORIES.IMAGE_TO_VIDEO,
        creditCost: 70,
        featured: true,
        inputSchema: {
                prompt: { type: "string" },
                image_url: { type: "string", required: true },
                duration: { type: "string", default: "5", options: ["5", "10"] },
                aspect_ratio: { type: "string", default: "16:9", options: ["16:9", "9:16", "1:1"] },
                negative_prompt: { type: "string", default: "blur, distort, and low quality" },
                generate_audio: { type: "boolean", default: true }
        }
    },

    'fal-ai-kling-video-v2-5-turbo-pro-image-to-video': {
        id: "fal-ai-kling-video-v2-5-turbo-pro-image-to-video",
        name: "Kling v2.5 Turbo Pro Image to Video",
        description: "Kling 2.5 Turbo Pro: Top-tier image-to-video with unparalleled motion fluidity and cinematic visuals.",
        provider: "Kuaishou",
        falEndpoint: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
        category: MODEL_CATEGORIES.IMAGE_TO_VIDEO,
        creditCost: 35,
        featured: true,
        inputSchema: {
                prompt: { type: "string" },
                image_url: { type: "string", required: true },
                duration: { type: "string", default: "5", options: ["5", "10"] },
                aspect_ratio: { type: "string", default: "16:9", options: ["16:9", "9:16", "1:1"] },
                negative_prompt: { type: "string", default: "blur, distort, and low quality" }
        }
    },

    'fal-ai-sora-2-image-to-video': {
        id: "fal-ai-sora-2-image-to-video",
        name: "Sora 2 Image to Video",
        description: "OpenAI's Sora 2 image-to-video model with richly detailed clips and audio.",
        provider: "OpenAI",
        falEndpoint: "fal-ai/sora-2/image-to-video",
        category: MODEL_CATEGORIES.IMAGE_TO_VIDEO,
        creditCost: 150,
        featured: true,
        inputSchema: {
                prompt: { type: "string", required: true },
                image_url: { type: "string", required: true },
                aspect_ratio: { type: "string", default: "16:9", options: ["16:9", "9:16", "1:1"] },
                duration: { type: "integer", default: 10, min: 5, max: 20 },
                seed: { type: "integer" }
        }
    },

    'fal-ai-sora-2-image-to-video-pro': {
        id: "fal-ai-sora-2-image-to-video-pro",
        name: "Sora 2 Pro Image to Video",
        description: "Premium Sora 2 Pro image-to-video with superior quality and audio.",
        provider: "OpenAI",
        falEndpoint: "fal-ai/sora-2/image-to-video/pro",
        category: MODEL_CATEGORIES.IMAGE_TO_VIDEO,
        creditCost: 250,
        featured: true,
        inputSchema: {
                prompt: { type: "string", required: true },
                image_url: { type: "string", required: true },
                aspect_ratio: { type: "string", default: "16:9", options: ["16:9", "9:16", "1:1"] },
                duration: { type: "integer", default: 10, min: 5, max: 20 },
                seed: { type: "integer" }
        }
    },

    'xai-grok-imagine-video-image-to-video': {
        id: "xai-grok-imagine-video-image-to-video",
        name: "Grok Imagine Video I2V",
        description: "Generate videos from images with audio using xAI's Grok Imagine Video.",
        provider: "xAI",
        falEndpoint: "xai/grok-imagine-video/image-to-video",
        category: MODEL_CATEGORIES.IMAGE_TO_VIDEO,
        creditCost: 35,
        featured: true,
        inputSchema: {
                prompt: { type: "string" },
                image_url: { type: "string", required: true },
                duration: { type: "integer", default: 6 },
                aspect_ratio: { type: "string", default: "16:9", options: ["16:9", "4:3", "3:2", "1:1", "2:3", "3:4", "9:16"] },
                resolution: { type: "string", default: "720p", options: ["480p", "720p"] }
        }
    },

    'fal-ai-pixverse-c1-image-to-video': {
        id: "fal-ai-pixverse-c1-image-to-video",
        name: "PixVerse C1 Image to Video",
        description: "Animate images into cinematic videos with PixVerse C1, supporting 1080p and native audio.",
        provider: "PixVerse",
        falEndpoint: "fal-ai/pixverse/c1/image-to-video",
        category: MODEL_CATEGORIES.IMAGE_TO_VIDEO,
        creditCost: 55,
        featured: true,
        inputSchema: {
                prompt: { type: "string" },
                image_url: { type: "string", required: true },
                aspect_ratio: { type: "string", default: "16:9", options: ["16:9", "4:3", "1:1", "3:4", "9:16", "2:3", "3:2", "21:9"] },
                resolution: { type: "string", default: "720p", options: ["360p", "540p", "720p", "1080p"] },
                duration: { type: "integer", default: 5, min: 1, max: 15 },
                seed: { type: "integer" },
                generate_audio_switch: { type: "boolean" }
        }
    },

    'fal-ai-pixverse-v6-image-to-video': {
        id: "fal-ai-pixverse-v6-image-to-video",
        name: "PixVerse V6 Image to Video",
        description: "PixVerse V6 delivers lifelike physics and striking visuals for image-to-video.",
        provider: "PixVerse",
        falEndpoint: "fal-ai/pixverse/v6/image-to-video",
        category: MODEL_CATEGORIES.IMAGE_TO_VIDEO,
        creditCost: 60,
        featured: true,
        inputSchema: {
                prompt: { type: "string" },
                image_url: { type: "string", required: true },
                aspect_ratio: { type: "string", default: "16:9", options: ["16:9", "4:3", "1:1", "3:4", "9:16"] },
                resolution: { type: "string", default: "720p", options: ["360p", "540p", "720p", "1080p"] },
                duration: { type: "integer", default: 5, min: 1, max: 15 },
                seed: { type: "integer" },
                generate_audio_switch: { type: "boolean" }
        }
    },

    'fal-ai-minimax-hailuo-02-standard-image-to-video': {
        id: "fal-ai-minimax-hailuo-02-standard-image-to-video",
        name: "MiniMax Hailuo-02 I2V (Standard)",
        description: "MiniMax Hailuo-02 Image To Video API with 768p and 512p resolutions.",
        provider: "MiniMax",
        falEndpoint: "fal-ai/minimax/hailuo-02/standard/image-to-video",
        category: MODEL_CATEGORIES.IMAGE_TO_VIDEO,
        creditCost: 40,
        featured: true,
        inputSchema: {
                prompt: { type: "string", required: true },
                image_url: { type: "string", required: true },
                resolution: { type: "string", default: "768p", options: ["512p", "768p"] },
                prompt_optimizer: { type: "boolean", default: true }
        }
    },

    'fal-ai-ltx-2-19b-image-to-video': {
        id: "fal-ai-ltx-2-19b-image-to-video",
        name: "LTX-2 19B Image to Video",
        description: "Generate video with audio from images using LTX-2 19B.",
        provider: "Lightricks",
        falEndpoint: "fal-ai/ltx-2-19b/image-to-video",
        category: MODEL_CATEGORIES.IMAGE_TO_VIDEO,
        creditCost: 45,
        featured: true,
        inputSchema: {
                prompt: { type: "string", required: true },
                image_url: { type: "string", required: true },
                aspect_ratio: { type: "string", default: "16:9", options: ["16:9", "9:16", "1:1", "4:3", "3:4"] },
                duration: { type: "string", default: "5", options: ["3", "5", "7", "9"] },
                seed: { type: "integer" }
        }
    },

    // =====================================================================
    // VIDEO UPSCALE MODELS
    // =====================================================================

    'seedvr-upscale-video': {
        id: 'seedvr-upscale-video',
        name: 'SeedVR2 Video Upscale',
        description: 'Video upscaling with temporal consistency',
        provider: 'ByteDance',
        falEndpoint: 'fal-ai/seedvr/upscale/video',
        category: MODEL_CATEGORIES.VIDEO_UPSCALE,
        creditCost: 150,
        featured: true,
        inputSchema: {
            video_url: { type: 'string', required: true },
            upscale_mode: { type: 'string', default: 'factor', options: ['target', 'factor'] },
            upscale_factor: { type: 'float', default: 2, min: 1, max: 10 },
            target_resolution: { type: 'string', default: '1080p', options: ['720p', '1080p', '1440p', '2160p'] },
            seed: { type: 'integer' },
            noise_scale: { type: 'float', default: 0.1, min: 0, max: 1 },
            output_format: { type: 'string', default: 'X264 (.mp4)', options: ['X264 (.mp4)', 'VP9 (.webm)', 'PRORES4444 (.mov)', 'GIF (.gif)'] },
            output_quality: { type: 'string', default: 'high', options: ['low', 'medium', 'high', 'maximum'] },
            output_write_mode: { type: 'string', default: 'balanced', options: ['fast', 'balanced', 'small'] }
        }
    }
};


// =====================================================================
// HELPER FUNCTIONS
// =====================================================================

/**
 * Get model by ID
 */
const getModel = (modelId) => MODELS[modelId] || null;

/**
 * Get all models for a given category
 */
const getModelsByCategory = (category) => {
    return Object.values(MODELS).filter(m => m.category === category);
};

/**
 * Get featured models for a given category
 */
const getFeaturedByCategory = (category) => {
    return Object.values(MODELS).filter(m => m.category === category && m.featured);
};

/**
 * Get all text-to-image models
 */
const getTextToImageModels = () => getModelsByCategory(MODEL_CATEGORIES.TEXT_TO_IMAGE);

/**
 * Get all image-to-image models
 */
const getImageToImageModels = () => getModelsByCategory(MODEL_CATEGORIES.IMAGE_TO_IMAGE);

/**
 * Get all background removal models
 */
const getBackgroundRemovalModels = () => getModelsByCategory(MODEL_CATEGORIES.BACKGROUND_REMOVAL);

/**
 * Get all image upscale models
 */
const getImageUpscaleModels = () => getModelsByCategory(MODEL_CATEGORIES.IMAGE_UPSCALE);

/**
 * Get all video upscale models
 */
const getVideoUpscaleModels = () => getModelsByCategory(MODEL_CATEGORIES.VIDEO_UPSCALE);

/**
 * Get all text-to-video models
 */
const getTextToVideoModels = () => getModelsByCategory(MODEL_CATEGORIES.TEXT_TO_VIDEO);

/**
 * Get all image-to-video models
 */
const getImageToVideoModels = () => getModelsByCategory(MODEL_CATEGORIES.IMAGE_TO_VIDEO);


/**
 * Get ALL models as flat array
 */
const getAllModels = () => Object.values(MODELS);

/**
 * Derive lightweight image attachment metadata for the frontend.
 * When a model exposes `image_urls` without an explicit cap, fall back to a safe UI limit.
 */
const getImageInputMetadata = (model) => {
    const schema = model?.inputSchema || {};
    const singleImageSchema = schema.image_url;
    const multiImageSchema = schema.image_urls;
    const requiresImage = Boolean(singleImageSchema?.required || multiImageSchema?.required);
    const minImages = multiImageSchema
        ? (multiImageSchema.minItems ?? (multiImageSchema.required ? 1 : 0))
        : (singleImageSchema ? 1 : 0);
    const maxImages = multiImageSchema
        ? (multiImageSchema.maxItems ?? multiImageSchema.maxLength ?? DEFAULT_MULTI_IMAGE_LIMIT)
        : (singleImageSchema ? 1 : 0);

    return {
        requiresImage,
        supportsMultipleImages: Boolean(multiImageSchema) && maxImages > 1,
        minImages,
        maxImages
    };
};

/**
 * Validate input against model's inputSchema
 * Returns { valid: boolean, errors: string[], sanitizedInput: object }
 */
const validateInput = (modelId, input) => {
    const model = getModel(modelId);
    if (!model) return { valid: false, errors: ['Model not found'], sanitizedInput: {} };

    const schema = model.inputSchema;
    const errors = [];
    const sanitizedInput = {};

    // Helper: coerce value to the correct type based on schema
    const coerceValue = (value, rules) => {
        if (value === undefined || value === null) return value;
        if (rules.type === 'boolean') {
            if (value === 'true' || value === true) return true;
            if (value === 'false' || value === false) return false;
            return Boolean(value);
        }
        if (rules.type === 'integer' || rules.type === 'number') {
            const num = Number(value);
            return isNaN(num) ? value : (rules.type === 'integer' ? Math.round(num) : num);
        }
        return value;
    };

    for (const [key, rules] of Object.entries(schema)) {
        const value = input[key];
        const isMissingValue = value === undefined || value === null;

        // Check required fields
        if (rules.required && (
            isMissingValue
            || value === ''
            || (rules.type === 'array' && (!Array.isArray(value) || value.length === 0))
        )) {
            errors.push(`'${key}' is required`);
            continue;
        }

        // Skip optional fields that weren't provided
        if (isMissingValue) {
            if (rules.default !== undefined && rules.default !== null) {
                sanitizedInput[key] = coerceValue(rules.default, rules);
            }
            continue;
        }

        if (rules.type === 'array') {
            if (!Array.isArray(value)) {
                errors.push(`'${key}' must be an array`);
                continue;
            }

            const cleanedArray = value.filter(item => item !== undefined && item !== null && item !== '');

            if (rules.required && cleanedArray.length === 0) {
                errors.push(`'${key}' is required`);
                continue;
            }

            if (rules.minItems !== undefined && cleanedArray.length < rules.minItems) {
                errors.push(`'${key}' must contain at least ${rules.minItems} item(s)`);
                continue;
            }

            if (rules.maxItems !== undefined && cleanedArray.length > rules.maxItems) {
                errors.push(`'${key}' must contain no more than ${rules.maxItems} item(s)`);
                continue;
            }

            sanitizedInput[key] = cleanedArray;
            continue;
        }

        // Validate options — for optional fields, fall back to model default instead of hard-failing
        if (rules.options && !rules.options.includes(value)) {
            // Also try coerced string comparison for numeric options
            const strValue = String(value);
            const strOptions = rules.options.map(o => String(o));
            if (strOptions.includes(strValue)) {
                // Match found with string coercion — use the original option value
                const matchIdx = strOptions.indexOf(strValue);
                sanitizedInput[key] = coerceValue(rules.options[matchIdx], rules);
                continue;
            }
            if (!rules.required && rules.default !== undefined) {
                sanitizedInput[key] = coerceValue(rules.default, rules);
                continue;
            }
            errors.push(`'${key}' must be one of: ${rules.options.join(', ')}`);
            continue;
        }

        // Validate min/max for numbers
        const numValue = coerceValue(value, rules);
        if (rules.min !== undefined && numValue < rules.min) {
            errors.push(`'${key}' must be >= ${rules.min}`);
            continue;
        }
        if (rules.max !== undefined && numValue > rules.max) {
            errors.push(`'${key}' must be <= ${rules.max}`);
            continue;
        }

        sanitizedInput[key] = coerceValue(value, rules);
    }

    return { valid: errors.length === 0, errors, sanitizedInput };
};


module.exports = {
    MODELS,
    MODEL_CATEGORIES,
    getModel,
    getModelsByCategory,
    getFeaturedByCategory,
    getTextToImageModels,
    getImageToImageModels,
    getBackgroundRemovalModels,
    getImageUpscaleModels,
    getVideoUpscaleModels,
    getTextToVideoModels,
    getImageToVideoModels,
    getAllModels,
    getImageInputMetadata,
    validateInput
};
