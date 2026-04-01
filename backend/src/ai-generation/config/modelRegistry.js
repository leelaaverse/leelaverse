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
    VIDEO_UPSCALE: 'video-upscale'
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
            if (rules.default !== undefined) {
                sanitizedInput[key] = rules.default;
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

        // Validate options
        if (rules.options && !rules.options.includes(value)) {
            errors.push(`'${key}' must be one of: ${rules.options.join(', ')}`);
            continue;
        }

        // Validate min/max for numbers
        if (rules.min !== undefined && value < rules.min) {
            errors.push(`'${key}' must be >= ${rules.min}`);
            continue;
        }
        if (rules.max !== undefined && value > rules.max) {
            errors.push(`'${key}' must be <= ${rules.max}`);
            continue;
        }

        sanitizedInput[key] = value;
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
    getAllModels,
    getImageInputMetadata,
    validateInput
};
