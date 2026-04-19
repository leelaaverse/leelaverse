/**
 * AI Generation — Master Router
 * Combines all sub-routes under /api/ai
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getAllModels, MODEL_CATEGORIES, getImageInputMetadata } = require('./config/modelRegistry');

// Mount sub-routes
const imageGenRoutes = require('./image-generation/imageGenRoutes');
const imageUtilsRoutes = require('./image-utils/imageUtilsRoutes');
const videoGenRoutes = require('./video-generation/videoGenRoutes');
const { enhancePrompt, enhancePromptSync } = require('../controllers/promptEnhancerController');

// Image Generation & Editing: /api/ai/image/*
router.use('/image', imageGenRoutes);

// Image Utilities (bg removal, upscale): /api/ai/utils/*
router.use('/utils', imageUtilsRoutes);

// Video Generation & Upscale: /api/ai/video/*
router.use('/video', videoGenRoutes);

// Prompt Enhancer (SSE streaming): /api/ai/enhance-prompt
router.post('/enhance-prompt', auth, enhancePrompt);
router.post('/enhance-prompt/sync', auth, enhancePromptSync);

// ============================================
// Master Model Listing Endpoints
// ============================================

/**
 * GET /api/ai/models
 * List ALL available AI models across all categories
 */
router.get('/models', (req, res) => {
    try {
        const { category } = req.query;
        let models = getAllModels();

        if (category) {
            models = models.filter(m => m.category === category);
        }

        const formatted = models.map(m => {
            const imageInputMeta = getImageInputMetadata(m);

            // Build simplified parameters from inputSchema for frontend controls
            const parameters = {};
            if (m.inputSchema) {
                Object.entries(m.inputSchema).forEach(([key, schema]) => {
                    // Only expose useful frontend-facing params (skip prompt — handled separately)
                    if (key === 'prompt') return;
                    parameters[key] = {
                        type: schema.type,
                        default: schema.default,
                        options: schema.options,
                        min: schema.min,
                        max: schema.max,
                        required: !!schema.required
                    };
                });
            }

            return {
                id: m.id,
                name: m.name,
                description: m.description,
                provider: m.provider,
                category: m.category,
                creditCost: m.creditCost,
                featured: m.featured,
                requiresImage: imageInputMeta.requiresImage,
                supportsMultipleImages: imageInputMeta.supportsMultipleImages,
                minImages: imageInputMeta.minImages,
                maxImages: imageInputMeta.maxImages,
                parameters
            };
        });

        return res.status(200).json({
            success: true,
            count: formatted.length,
            categories: Object.values(MODEL_CATEGORIES),
            data: formatted
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

/**
 * GET /api/ai/models/:modelId
 * Get details for a specific model
 */
router.get('/models/:modelId', auth, (req, res) => {
    try {
        const { getModel } = require('./config/modelRegistry');
        const model = getModel(req.params.modelId);

        if (!model) {
            return res.status(404).json({ success: false, message: 'Model not found' });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: model.id,
                name: model.name,
                description: model.description,
                provider: model.provider,
                category: model.category,
                creditCost: model.creditCost,
                featured: model.featured,
                parameters: Object.entries(model.inputSchema).map(([key, schema]) => ({
                    name: key,
                    type: schema.type,
                    required: !!schema.required,
                    default: schema.default,
                    options: schema.options,
                    min: schema.min,
                    max: schema.max
                }))
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
