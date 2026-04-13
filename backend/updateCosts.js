const fs = require('fs');

const file = './src/ai-generation/config/modelRegistry.js';
let content = fs.readFileSync(file, 'utf8');

const costs = {
    'fal-ai-bytedance-seedance-v1-pro-fast-text-to-video': 75,
    'xai-grok-imagine-video-text-to-video': 35,
    'fal-ai-kling-video-v3-pro-text-to-video': 84,
    'fal-ai-kling-video-lipsync-audio-to-video': 7,
    'fal-ai-kling-video-v1-6-pro-text-to-video': 49,
    'fal-ai-kling-video-v1-6-standard-text-to-video': 28,
    'fal-ai-kling-video-v2-1-master-text-to-video': 140,
    'fal-ai-kling-video-v2-5-turbo-pro-text-to-video': 35,
    'fal-ai-kling-video-v2-6-pro-text-to-video': 70,
    'fal-ai-kling-video-o3-pro-text-to-video': 70,
    'fal-ai-kling-video-v3-standard-text-to-video': 63,
    'fal-ai-ltx-2-3-text-to-video-fast': 20,
    'fal-ai-minimax-hailuo-02-pro-text-to-video': 40,
    'fal-ai-pixverse-c1-text-to-video': 33,
    'bytedance-seedance-2-0-fast-text-to-video': 121,
    'fal-ai-bytedance-seedance-v1-5-pro-text-to-video': 26,
    'fal-ai-veo3-fast': 75,
    'fal-ai-bytedance-seedance-v1-lite-text-to-video': 18,
    'fal-ai-sora-2-text-to-video-pro': 84,
    'fal-ai-kling-video-v2-master-text-to-video': 140,
    'fal-ai-veo3-1-fast': 75,
    'fal-ai-veo3': 200,
    'fal-ai-veo3-1': 200,
    'fal-ai-vidu-q3-text-to-video': 77,
    'fal-ai-wan-25-preview-text-to-video': 50,
    'wan-v2-6-text-to-video': 50,
    'fal-ai-wan-v2-7-text-to-video': 50,
    'bytedance-seedance-2-0-image-to-video': 151,
    'bytedance-seedance-2-0-fast-image-to-video': 121
};

for (const [id, cost] of Object.entries(costs)) {
    // We want to match: id: 'model-id', ... creditCost: 150,
    // It could span multiple lines.
    const regex = new RegExp(`(id:\\s*['"]${id}['"][\\s\\S]*?creditCost:\\s*)150(,)`, 'm');
    content = content.replace(regex, `$1${cost}$2`);
}

fs.writeFileSync(file, content);
console.log('Costs updated successfully.');
