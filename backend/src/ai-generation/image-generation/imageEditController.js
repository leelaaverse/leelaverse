/**
 * Image Edit Controller — Image-to-Image
 * Handles all image editing / transformation across any registered model.
 */

const prisma = require('../../config/prisma');
const { runModel, extractImages } = require('../services/falService');
const { getModel, getImageToImageModels, validateInput, MODEL_CATEGORIES } = require('../config/modelRegistry');

const normalizeImageEditParams = (model, params) => {
    const normalizedParams = { ...params };
    const schema = model?.inputSchema || {};
    const expectsImageUrl = Boolean(schema.image_url);
    const expectsImageUrls = Boolean(schema.image_urls);

    if (!schema.prompt && schema.additional_prompt && typeof normalizedParams.prompt === 'string' && normalizedParams.prompt.trim()) {
        normalizedParams.additional_prompt = normalizedParams.prompt.trim();
        delete normalizedParams.prompt;
    }

    if (expectsImageUrls) {
        const rawImageUrls = Array.isArray(normalizedParams.image_urls)
            ? normalizedParams.image_urls
            : (normalizedParams.image_url ? [normalizedParams.image_url] : []);
        const cleanedImageUrls = rawImageUrls.filter(value => typeof value === 'string' && value.trim().length > 0);

        if (cleanedImageUrls.length > 0) {
            normalizedParams.image_urls = cleanedImageUrls;
        }

        delete normalizedParams.image_url;
    }

    if (expectsImageUrl && !expectsImageUrls && Array.isArray(normalizedParams.image_urls)) {
        const [firstImageUrl] = normalizedParams.image_urls.filter(value => typeof value === 'string' && value.trim().length > 0);

        if (firstImageUrl) {
            normalizedParams.image_url = firstImageUrl;
        }

        delete normalizedParams.image_urls;
    }

    return normalizedParams;
};

/**
 * POST /api/ai/image/edit
 * Edit/transform image using any image-to-image model
 */
const editImage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { modelId, ...params } = req.body;

        // 1. Validate model
        if (!modelId) {
            return res.status(400).json({ success: false, message: 'modelId is required' });
        }

        const model = getModel(modelId);
        if (!model) {
            return res.status(400).json({ success: false, message: `Model '${modelId}' not found` });
        }
        if (model.category !== MODEL_CATEGORIES.IMAGE_TO_IMAGE) {
            return res.status(400).json({ success: false, message: `Model '${modelId}' is not an image-to-image model. Use the correct endpoint.` });
        }

        // 2. Validate input
        const normalizedParams = normalizeImageEditParams(model, params);
        const { valid, errors, sanitizedInput } = validateInput(modelId, normalizedParams);
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
                prompt: sanitizedInput.prompt || 'Image edit',
                style: sanitizedInput.aspect_ratio || null,
                steps: sanitizedInput.num_inference_steps || null,
                quality: sanitizedInput.quality || null,
                status: 'processing'
            }
        });

        // 6. Call fal.ai
        const result = await runModel(model.falEndpoint, sanitizedInput);

        if (!result.success) {
            // Refund
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
                message: 'Image editing failed',
                error: result.error
            });
        }

        // 7. Extract and update
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

        // 9. Coin transaction
        await prisma.coinTransaction.create({
            data: {
                userId,
                type: 'spend',
                amount: -model.creditCost,
                balanceAfter: user.coinBalance - model.creditCost,
                description: `Image edit with ${model.name}`,
                aiGenerationId: generation.id,
                status: 'completed'
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Image edited successfully',
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
        console.error('[ImageEdit] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

/**
 * GET /api/ai/image/edit/models
 * List all available image-to-image models
 */
const listEditModels = async (req, res) => {
    try {
        const models = getImageToImageModels().map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
            provider: m.provider,
            creditCost: m.creditCost,
            featured: m.featured,
            options: Object.entries(m.inputSchema)
                .filter(([key]) => !['prompt', 'image_url', 'image_urls'].includes(key))
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
        console.error('[ImageEdit] Error listing models:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { editImage, listEditModels };
