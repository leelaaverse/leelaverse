/**
 * Shared fal.ai Service Wrapper
 * Central service for all fal.ai API calls with error handling,
 * logging, and response normalization.
 */

const { fal } = require('@fal-ai/client');

// Configure fal.ai client with API key
fal.config({
    credentials: process.env.FAL_KEY
});

/**
 * Subscribe to a fal.ai model and wait for result
 * @param {string} modelEndpoint - fal.ai model endpoint (e.g. 'fal-ai/flux/dev')
 * @param {object} input - Model input parameters
 * @param {object} options - Additional options
 * @returns {Promise<object>} Normalized response
 */
const runModel = async (modelEndpoint, input, options = {}) => {
    const startTime = Date.now();

    try {
        console.log(`[FAL] 🚀 Starting: ${modelEndpoint}`);
        console.log(`[FAL] Input keys: ${Object.keys(input).join(', ')}`);

        const result = await fal.subscribe(modelEndpoint, {
            input,
            logs: options.logs !== false,
            onQueueUpdate: (update) => {
                if (update.status === 'IN_PROGRESS' && update.logs) {
                    update.logs.map((log) => log.message).forEach((msg) => {
                        console.log(`[FAL] ⏳ ${modelEndpoint}: ${msg}`);
                    });
                }
            }
        });

        const generationTime = Date.now() - startTime;
        console.log(`[FAL] ✅ Completed: ${modelEndpoint} in ${generationTime}ms`);

        return {
            success: true,
            data: result.data,
            requestId: result.requestId,
            generationTime
        };
    } catch (error) {
        const generationTime = Date.now() - startTime;
        console.error(`[FAL] ❌ Failed: ${modelEndpoint} after ${generationTime}ms`);
        console.error(`[FAL] Error:`, error.message || error);

        return {
            success: false,
            error: error.message || 'Unknown fal.ai error',
            statusCode: error.status || 500,
            generationTime
        };
    }
};

/**
 * Extract image URLs from fal.ai response (handles different response formats)
 * @param {object} data - fal.ai response data
 * @returns {Array<object>} Array of image objects with url, width, height
 */
const extractImages = (data) => {
    if (!data) return [];

    // Most models return `images` array
    if (data.images && Array.isArray(data.images)) {
        return data.images.map((img) => ({
            url: img.url,
            width: img.width || null,
            height: img.height || null,
            content_type: img.content_type || null
        }));
    }

    // Some models (BiRefNet, Bria, Topaz, SeedVR) return single `image`
    if (data.image) {
        return [{
            url: data.image.url,
            width: data.image.width || null,
            height: data.image.height || null,
            content_type: data.image.content_type || null
        }];
    }

    return [];
};

/**
 * Extract video data from fal.ai response
 * @param {object} data - fal.ai response data
 * @returns {object|null} Video object with url, content_type
 */
const extractVideo = (data) => {
    if (!data) return null;

    if (data.video) {
        return {
            url: data.video.url,
            content_type: data.video.content_type || 'video/mp4'
        };
    }

    return null;
};

module.exports = {
    fal,
    runModel,
    extractImages,
    extractVideo
};
