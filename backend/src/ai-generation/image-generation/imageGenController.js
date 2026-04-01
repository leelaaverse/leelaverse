/**
 * Image Generation Controller — Text-to-Image
 * Handles all text-to-image generation across any registered model.
 */

const prisma = require('../../config/prisma');
const { runModel, extractImages } = require('../services/falService');
const { getModel, getTextToImageModels, validateInput, MODEL_CATEGORIES } = require('../config/modelRegistry');

/**
 * POST /api/ai/image/generate
 * Generate image from text prompt using any text-to-image model
 */
const generateImage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { modelId, ...params } = req.body;

        // 1. Validate model exists and is correct category
        if (!modelId) {
            return res.status(400).json({ success: false, message: 'modelId is required' });
        }

        const model = getModel(modelId);
        if (!model) {
            return res.status(400).json({ success: false, message: `Model '${modelId}' not found` });
        }
        if (model.category !== MODEL_CATEGORIES.TEXT_TO_IMAGE) {
            return res.status(400).json({ success: false, message: `Model '${modelId}' is not a text-to-image model. Use the correct endpoint.` });
        }

        // --- Aspect Ratio Normalization Adapter ---
        if (params.aspect_ratio && model.inputSchema) {
            const ratio = params.aspect_ratio; // e.g. '9:16', '16:9', '1:1'
            // If the model schema expects aspect_ratio, we keep it. Otherwise:
            if (!model.inputSchema.aspect_ratio && model.inputSchema.image_size) {
                const imgSizeSchema = model.inputSchema.image_size;
                if (imgSizeSchema.type === 'string') {
                    if (imgSizeSchema.options && imgSizeSchema.options.includes('portrait_16_9')) {
                        // It's a FLUX model expecting text enums
                        const map = {
                            '1:1': 'square',
                            '16:9': 'landscape_16_9',
                            '9:16': 'portrait_16_9',
                            '4:3': 'landscape_4_3',
                            '3:4': 'portrait_4_3',
                            '3:2': 'landscape_4_3', // fallback
                            '2:3': 'portrait_4_3', // fallback
                            '21:9': 'landscape_16_9' // fallback
                        };
                        params.image_size = map[ratio] || 'square';
                        delete params.aspect_ratio;
                    } else if (imgSizeSchema.default && imgSizeSchema.default.includes('1024x1024')) {
                        // Expects literal dimensions string (seedream or gpt)
                        const map = {
                            '1:1': '1024x1024',
                            '16:9': '1536x1024',
                            '9:16': '1024x1536',
                            '4:3': '1024x768',
                            '3:4': '768x1024'
                        };
                        params.image_size = map[ratio] || '1024x1024';
                        delete params.aspect_ratio;
                    }
                } else if (imgSizeSchema.type === 'object') {
                    // Expects { width, height } (Dreamina)
                    const map = {
                        '1:1': { width: 1024, height: 1024 },
                        '16:9': { width: 1536, height: 864 },
                        '9:16': { width: 864, height: 1536 },
                        '4:3': { width: 1152, height: 864 },
                        '3:4': { width: 864, height: 1152 }
                    };
                    params.image_size = map[ratio] || { width: 1024, height: 1024 };
                    delete params.aspect_ratio;
                }
            }
        }

        // 2. Validate input against model schema
        const { valid, errors, sanitizedInput } = validateInput(modelId, params);
        if (!valid) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors, finalParams: params });
        }

        // 3. Check user credits
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { coinBalance: true } });
        if (!user || user.coinBalance < model.creditCost) {
            return res.status(402).json({
                success: false,
                message: 'Insufficient credits',
                required: model.creditCost,
                balance: user?.coinBalance || 0
            });
        }

        // 4. Deduct credits
        await prisma.user.update({
            where: { id: userId },
            data: {
                coinBalance: { decrement: model.creditCost },
                totalCoinsSpent: { increment: model.creditCost }
            }
        });

        // 5. Create AI generation record
        const generation = await prisma.aIGeneration.create({
            data: {
                userId,
                type: 'image',
                model: model.name,
                prompt: sanitizedInput.prompt,
                style: sanitizedInput.aspect_ratio || sanitizedInput.image_size || null,
                steps: sanitizedInput.num_inference_steps || null,
                quality: sanitizedInput.quality || null,
                status: 'processing'
            }
        });

        // 6. Call fal.ai
        const result = await runModel(model.falEndpoint, sanitizedInput);

        if (!result.success) {
            // Refund credits on failure
            await prisma.user.update({
                where: { id: userId },
                data: {
                    coinBalance: { increment: model.creditCost },
                    totalCoinsSpent: { decrement: model.creditCost }
                }
            });

            await prisma.aIGeneration.update({
                where: { id: generation.id },
                data: { status: 'failed', errorMessage: result.error }
            });

            return res.status(result.statusCode || 500).json({
                success: false,
                message: 'Generation failed',
                error: result.error
            });
        }

        // 7. Extract images and update record
        const images = extractImages(result.data);
        const resultUrl = images.length > 0 ? images[0].url : null;

        await prisma.aIGeneration.update({
            where: { id: generation.id },
            data: {
                status: 'completed',
                resultUrl,
                falRequestId: result.requestId,
                generationTime: result.generationTime,
                seed: result.data?.seed?.toString() || null
            }
        });

        // 8. Log usage
        const aiModel = await prisma.aIModel.findUnique({ where: { modelId: model.falEndpoint } });
        if (aiModel) {
            await prisma.modelUsageLog.create({
                data: {
                    userId,
                    aiModelId: aiModel.id,
                    coinsCharged: model.creditCost,
                    status: 'completed',
                    metadata: { prompt: sanitizedInput.prompt, generationTime: result.generationTime }
                }
            });
        }

        // 9. Create coin transaction
        await prisma.coinTransaction.create({
            data: {
                userId,
                type: 'spend',
                amount: -model.creditCost,
                balanceAfter: user.coinBalance - model.creditCost,
                description: `Image generation with ${model.name}`,
                aiGenerationId: generation.id,
                status: 'completed'
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Image generated successfully',
            data: {
                generationId: generation.id,
                images,
                seed: result.data?.seed,
                prompt: result.data?.prompt || sanitizedInput.prompt,
                model: model.name,
                creditsUsed: model.creditCost,
                generationTime: result.generationTime
            }
        });

    } catch (error) {
        console.error('[ImageGen] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

/**
 * GET /api/ai/image/models
 * List all available text-to-image models
 */
const listModels = async (req, res) => {
    try {
        const models = getTextToImageModels().map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
            provider: m.provider,
            creditCost: m.creditCost,
            featured: m.featured,
            options: Object.entries(m.inputSchema)
                .filter(([key]) => key !== 'prompt')
                .map(([key, schema]) => ({
                    name: key,
                    type: schema.type,
                    required: !!schema.required,
                    default: schema.default,
                    options: schema.options,
                    min: schema.min,
                    max: schema.max
                }))
        }));

        return res.status(200).json({ success: true, count: models.length, data: models });
    } catch (error) {
        console.error('[ImageGen] Error listing models:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { generateImage, listModels };
