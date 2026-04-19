/**
 * Prompt Enhancer Controller
 * Uses OpenRouter (Gemma 4 31B) to enhance prompts for video and audio generation
 * Streams the response via SSE for real-time typing effect on frontend
 */

const { OpenRouter } = require('@openrouter/sdk');

const openrouter = new OpenRouter({
    apiKey: process.env.OPEN_ROUTER_KEY
});

// System prompts tailored for each media type
const SYSTEM_PROMPTS = {
    video: `You are an expert AI video prompt engineer. Your job is to take a user's basic video idea and transform it into a rich, detailed prompt that will produce stunning cinematic video output from AI video generation models like Sora, Kling, Seedance, and Veo.

Rules:
- Analyze the user's intent and expand it into a vivid, cinematic description
- Include specific details about: camera movement (dolly, pan, tracking, crane), lighting (golden hour, neon, volumetric), mood/atmosphere, color palette, film style (documentary, cinematic, anime, etc.)
- Add temporal progression — describe what happens over time in the video
- Include details about environment, textures, weather, time of day
- If the prompt mentions people, describe their appearance, expressions, clothing, and actions naturally
- Keep the enhanced prompt concise but powerful — aim for 2-4 sentences max
- Do NOT add any explanations, notes, or meta-commentary — output ONLY the enhanced prompt text
- Do NOT wrap in quotes or add prefixes like "Enhanced:" — just the raw prompt
- Write in present tense, describing the scene as it unfolds`,

    audio: `You are an expert AI audio/music prompt engineer. Your job is to take a user's basic audio idea and transform it into a detailed prompt that will produce high-quality audio from AI music and sound generation models.

Rules:
- Analyze the user's intent and expand it into a rich audio description
- Include specific details about: genre, tempo (BPM), mood, instrumentation, production style
- Describe the sonic texture — warm, crisp, lo-fi, polished, gritty, ethereal
- If it's music, describe the structure — intro, build, drop, outro progression
- If it's ambient/SFX, describe the environment, spatial characteristics, layering
- Include details about dynamics, reverb, stereo field, frequency characteristics
- Keep the enhanced prompt concise but powerful — aim for 2-4 sentences max
- Do NOT add any explanations, notes, or meta-commentary — output ONLY the enhanced prompt text
- Do NOT wrap in quotes or add prefixes like "Enhanced:" — just the raw prompt`
};

/**
 * POST /api/ai/enhance-prompt
 * Streams enhanced prompt via SSE
 * Body: { prompt: string, type: 'video' | 'audio' }
 */
const enhancePrompt = async (req, res) => {
    try {
        const { prompt, type = 'video' } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        if (!process.env.OPEN_ROUTER_KEY) {
            return res.status(500).json({ success: false, message: 'OpenRouter API key not configured' });
        }

        const systemPrompt = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.video;

        // Set SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        });

        // Stream from OpenRouter
        const stream = await openrouter.chat.send({
            chatRequest: {
                model: 'google/gemma-4-31b-it',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Enhance this ${type} generation prompt:\n\n"${prompt.trim()}"` }
                ],
                stream: true,
                max_tokens: 500,
                temperature: 0.8,
            }
        });

        let fullResponse = '';

        for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
                fullResponse += content;
                // Send each token as SSE event
                res.write(`data: ${JSON.stringify({ token: content })}\n\n`);
            }
        }

        // Send completion event
        res.write(`data: ${JSON.stringify({ done: true, fullText: fullResponse.trim() })}\n\n`);
        res.end();

    } catch (error) {
        console.error('Prompt enhance error:', error);

        // If headers not sent yet, send JSON error
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Failed to enhance prompt',
                error: error.message
            });
        }

        // If already streaming, send error event and close
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
};

/**
 * POST /api/ai/enhance-prompt/sync
 * Non-streaming version for simpler clients
 */
const enhancePromptSync = async (req, res) => {
    try {
        const { prompt, type = 'video' } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        const systemPrompt = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.video;

        const stream = await openrouter.chat.send({
            chatRequest: {
                model: 'google/gemma-4-31b-it',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Enhance this ${type} generation prompt:\n\n"${prompt.trim()}"` }
                ],
                stream: true,
                max_tokens: 500,
                temperature: 0.8,
            }
        });

        let fullResponse = '';
        for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) fullResponse += content;
        }

        res.json({
            success: true,
            data: { enhancedPrompt: fullResponse.trim(), originalPrompt: prompt.trim() }
        });
    } catch (error) {
        console.error('Prompt enhance sync error:', error);
        res.status(500).json({ success: false, message: 'Failed to enhance prompt', error: error.message });
    }
};

module.exports = { enhancePrompt, enhancePromptSync };
