/**
 * Video Upscale Controller
 * Handles SeedVR2 video upscaling
 */

const prisma = require('../../config/prisma');
const { runModel, extractVideo } = require('../services/falService');
const { getModel, getVideoUpscaleModels, validateInput, MODEL_CATEGORIES } = require('../config/modelRegistry');

/**
 * POST /api/ai/video/upscale
 * Upscale video using SeedVR2
 */
const upscaleVideo = async (req, res) => {
    try {
        const userId = req.user.id;
        const { modelId = 'seedvr-upscale-video', ...params } = req.body;

        // 1. Validate model
        const model = getModel(modelId);
        if (!model) {
            return res.status(400).json({ success: false, message: `Model '${modelId}' not found` });
        }
        if (model.category !== MODEL_CATEGORIES.VIDEO_UPSCALE) {
            return res.status(400).json({ success: false, message: `Model '${modelId}' is not a video upscale model` });
        }

        // 2. Validate input
        const { valid, errors, sanitizedInput } = validateInput(modelId, params);
        if (!valid) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        // 3. Check credits
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

        // 5. Create generation record
        const generation = await prisma.aIGeneration.create({
            data: {
                userId,
                type: 'video',
                model: model.name,
                prompt: `Video upscale ${sanitizedInput.upscale_factor || 2}x`,
                status: 'processing'
            }
        });

        // 6. Call fal.ai
        const result = await runModel(model.falEndpoint, sanitizedInput);

        if (!result.success) {
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
            return res.status(result.statusCode || 500).json({ success: false, message: 'Video upscale failed', error: result.error });
        }

        // 7. Extract result
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
                    metadata: { upscaleFactor: sanitizedInput.upscale_factor, generationTime: result.generationTime }
                }
            });
        }

        // 9. Coin transaction
        await prisma.coinTransaction.create({
            data: {
                userId,
                type: 'spend',
                amount: -model.creditCost,
                balanceAfter: user.coinBalance - model.creditCost,
                description: `Video upscale with ${model.name}`,
                aiGenerationId: generation.id,
                status: 'completed'
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Video upscaled successfully',
            data: {
                generationId: generation.id,
                video,
                seed: result.data?.seed,
                model: model.name,
                creditsUsed: model.creditCost,
                generationTime: result.generationTime
            }
        });

    } catch (error) {
        console.error('[VideoUpscale] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

/**
 * GET /api/ai/video/upscale/models
 * List video upscale models
 */
const listVideoUpscaleModels = async (req, res) => {
    try {
        const models = getVideoUpscaleModels().map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
            provider: m.provider,
            creditCost: m.creditCost,
            featured: m.featured
        }));
        return res.status(200).json({ success: true, count: models.length, data: models });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { upscaleVideo, listVideoUpscaleModels };
