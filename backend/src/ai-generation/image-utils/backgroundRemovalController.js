/**
 * Background Removal Controller
 * Handles BiRefNet v2 and Bria RMBG 2.0
 */

const prisma = require('../../config/prisma');
const { runModel, extractImages } = require('../services/falService');
const { getModel, getBackgroundRemovalModels, validateInput, MODEL_CATEGORIES } = require('../config/modelRegistry');

/**
 * POST /api/ai/image/remove-background
 * Remove background using BiRefNet or Bria
 */
const removeBackground = async (req, res) => {
    try {
        const userId = req.user.id;
        const { modelId = 'birefnet-v2', ...params } = req.body;

        // 1. Validate model
        const model = getModel(modelId);
        if (!model) {
            return res.status(400).json({ success: false, message: `Model '${modelId}' not found` });
        }
        if (model.category !== MODEL_CATEGORIES.BACKGROUND_REMOVAL) {
            return res.status(400).json({ success: false, message: `Model '${modelId}' is not a background removal model` });
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
                type: 'image',
                model: model.name,
                prompt: 'Background removal',
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
            return res.status(result.statusCode || 500).json({ success: false, message: 'Background removal failed', error: result.error });
        }

        // 7. Extract result
        const images = extractImages(result.data);
        const resultUrl = images.length > 0 ? images[0].url : null;

        await prisma.aIGeneration.update({
            where: { id: generation.id },
            data: {
                status: 'completed',
                resultUrl,
                falRequestId: result.requestId,
                generationTime: result.generationTime
            }
        });

        // 8. Log usage
        const aiModel = await prisma.aIModel?.findUnique({ where: { modelId: model.falEndpoint } });
        if (aiModel) {
            await prisma.modelUsageLog.create({
                data: {
                    userId,
                    aiModelId: aiModel.id,
                    coinsCharged: model.creditCost,
                    status: 'completed',
                    metadata: { generationTime: result.generationTime }
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
                description: `Background removal with ${model.name}`,
                aiGenerationId: generation.id,
                status: 'completed'
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Background removed successfully',
            data: {
                generationId: generation.id,
                image: images[0] || null,
                maskImage: result.data?.mask_image || null,
                model: model.name,
                creditsUsed: model.creditCost,
                generationTime: result.generationTime
            }
        });

    } catch (error) {
        console.error('[BgRemoval] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

/**
 * GET /api/ai/image/remove-background/models
 * List background removal models
 */
const listBgRemovalModels = async (req, res) => {
    try {
        const models = getBackgroundRemovalModels().map(m => ({
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

module.exports = { removeBackground, listBgRemovalModels };
