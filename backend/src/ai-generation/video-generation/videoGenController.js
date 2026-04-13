/**
 * Video Generation Controller — Text-to-Video and Image-to-Video
 * Handles video generation across any registered video model.
 */

const prisma = require('../../config/prisma');
const { runModel, extractVideo } = require('../services/falService');
const { getModel, getTextToVideoModels, getImageToVideoModels, validateInput, MODEL_CATEGORIES } = require('../config/modelRegistry');

/**
 * POST /api/ai/video/generate
 * Generate video from text prompt or image using any video model
 */
const generateVideo = async (req, res) => {
    try {
        const userId = req.user.id;
        const { modelId, ...params } = req.body;

        // 1. Validate model exists and is a video generation category
        if (!modelId) {
            return res.status(400).json({ success: false, message: 'modelId is required' });
        }

        const model = getModel(modelId);
        if (!model) {
            return res.status(400).json({ success: false, message: `Model '${modelId}' not found` });
        }
        
        if (model.category !== MODEL_CATEGORIES.TEXT_TO_VIDEO && model.category !== MODEL_CATEGORIES.IMAGE_TO_VIDEO) {
            return res.status(400).json({ success: false, message: `Model '${modelId}' is not a video generation model.` });
        }

        // 2. Validate input against model schema
        // The registry handles aspect ratios internally via options validation
        const { valid, errors, sanitizedInput } = validateInput(modelId, params);
        if (!valid) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors, finalParams: params });
        }

        // 3. Check user credits (coins)
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

        // Determine if there is a prompt or just image/s
        let basePrompt = sanitizedInput.prompt || 'Video generation';
        
        // 5. Create AI generation record
        const generation = await prisma.aIGeneration.create({
            data: {
                userId,
                type: 'video',
                model: model.name,
                prompt: basePrompt,
                style: sanitizedInput.aspect_ratio || null,
                steps: sanitizedInput.num_inference_steps || null,
                quality: sanitizedInput.resolution || null,
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

        // 7. Extract video and update record
        const video = extractVideo(result.data);
        const resultUrl = video ? video.url : null;

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
                    metadata: { prompt: basePrompt, generationTime: result.generationTime }
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
                description: `Video generation with ${model.name}`,
                aiGenerationId: generation.id,
                status: 'completed'
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Video generated successfully',
            data: {
                generationId: generation.id,
                video,
                seed: result.data?.seed,
                prompt: result.data?.prompt || basePrompt,
                model: model.name,
                creditsUsed: model.creditCost,
                generationTime: result.generationTime
            }
        });

    } catch (error) {
        console.error('[VideoGen] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

/**
 * GET /api/ai/video/generate/models
 * List all available text-to-video and image-to-video models
 */
const listVideoGenModels = async (req, res) => {
    try {
        const textToVideoModels = getTextToVideoModels();
        const imageToVideoModels = getImageToVideoModels();
        const allVideoModels = [...textToVideoModels, ...imageToVideoModels];

        const models = allVideoModels.map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
            provider: m.provider,
            creditCost: m.creditCost,
            featured: m.featured,
            category: m.category,
            options: Object.entries(m.inputSchema)
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
        console.error('[VideoGen] Error listing models:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { generateVideo, listVideoGenModels };
