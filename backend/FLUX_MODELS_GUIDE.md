# FLUX Models - Quick Reference Guide

## Parameter Limits & Defaults

### FLUX Schnell (Fast Mode) ⚡
| Parameter | Min | Max | Default | Notes |
|-----------|-----|-----|---------|-------|
| `num_inference_steps` | 1 | **12** | 4 | ⚠️ Hard limit at 12 |
| `guidance_scale` | 0 | 20 | 3.5 | Lower = faster |
| `num_images` | 1 | 4 | 1 | Multiple outputs |
| `image_size` | - | - | landscape_4_3 | See sizes below |

**Speed**: ~4-8 seconds  
**Use for**: Quick iterations, previews, testing prompts

### FLUX SRPO (Quality Mode) 🎨
| Parameter | Min | Max | Default | Notes |
|-----------|-----|-----|---------|-------|
| `num_inference_steps` | 1 | 50+ | 28 | Higher = better quality |
| `guidance_scale` | 0 | 20 | 4.5 | Prompt adherence |
| `num_images` | 1 | 4 | 1 | Multiple outputs |
| `acceleration` | - | - | regular | none/regular/high |
| `image_size` | - | - | landscape_4_3 | See sizes below |

**Speed**: ~15-30 seconds  
**Use for**: Final renders, production, high-quality outputs

## Image Sizes

All supported sizes for both models:

```javascript
// Preset sizes
"square_hd"        // 1024x1024
"square"           // 512x512
"portrait_4_3"     // 768x1024
"portrait_16_9"    // 576x1024
"landscape_4_3"    // 1024x768
"landscape_16_9"   // 1024x576

// Custom sizes
{
  width: 1280,
  height: 720
}
```

## API Request Examples

### FLUX Schnell - Minimal
```javascript
POST /api/posts/generate-image

{
  "prompt": "A cat wearing a hat",
  "selectedModel": "flux-schnell"
}

// Uses defaults:
// - steps: 4
// - guidance: 3.5
// - aspect: 16:9
```

### FLUX Schnell - Custom
```javascript
POST /api/posts/generate-image

{
  "prompt": "A cat wearing a hat",
  "selectedModel": "flux-schnell",
  "aspectRatio": "1:1",
  "numInferenceSteps": 8,    // Will be capped at 12
  "guidanceScale": 4.0
}
```

### FLUX SRPO - Quality
```javascript
POST /api/posts/generate-image

{
  "prompt": "A cat wearing a hat",
  "selectedModel": "flux-1-srpo",
  "aspectRatio": "16:9",
  "numInferenceSteps": 28,
  "guidanceScale": 4.5
}
```

## Response Flow

```
1. Submit Request
   POST /api/posts/generate-image
   ↓
   Response: { requestId: "xxx-xxx-xxx" }

2. Poll Status (every 2 seconds)
   GET /api/posts/generation/:requestId
   ↓
   Response: { status: "in_progress" }
   ↓
   Response: { status: "completed", imageUrl: "..." }

3. Create Post
   POST /api/posts/create-from-generation
   ↓
   Response: { post: {...} }
```

## Frontend Integration

```javascript
// 1. Generate Image
const generateImage = async () => {
  const response = await fetch('/api/posts/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: userPrompt,
      selectedModel: 'flux-schnell', // or 'flux-1-srpo'
      aspectRatio: '16:9',
      numInferenceSteps: 4,          // Auto-capped at 12 for schnell
      guidanceScale: 3.5
    })
  });
  
  const { requestId } = await response.json();
  return requestId;
};

// 2. Poll for Result
const pollResult = async (requestId) => {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/posts/generation/${requestId}`);
    const data = await response.json();
    
    if (data.status === 'completed') {
      clearInterval(interval);
      displayImage(data.imageUrl);
    } else if (data.status === 'failed') {
      clearInterval(interval);
      showError('Generation failed');
    }
  }, 2000); // Poll every 2 seconds
};

// 3. Create Post
const createPost = async (requestId) => {
  const response = await fetch('/api/posts/create-from-generation', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      requestId,
      caption: 'My AI artwork',
      title: 'Beautiful Creation',
      tags: ['ai', 'art']
    })
  });
  
  const { post } = await response.json();
  return post;
};
```

## Guidance Scale Tips

| Value | Effect | Use Case |
|-------|--------|----------|
| 1-2 | Very loose interpretation | Abstract, creative |
| 3-4 | Balanced | General use (Schnell default) |
| 4-5 | Strong adherence | Detailed prompts (SRPO default) |
| 6-8 | Very strict | Specific requirements |
| 9+ | Extreme adherence | Technical/precise outputs |

## Steps Guide

### FLUX Schnell
- **4 steps**: Fast, good quality (recommended)
- **6 steps**: Slightly better detail
- **8 steps**: Good balance
- **12 steps**: Maximum quality (but slower)

### FLUX SRPO
- **14 steps**: Fast draft
- **28 steps**: High quality (recommended)
- **40 steps**: Maximum quality
- **50+ steps**: Diminishing returns

## Troubleshooting

### Error: "Input should be less than or equal to 12"
**Fix**: Use `numInferenceSteps: 4-12` for FLUX Schnell

### Error: "Generation request not found"
**Fix**: Ensure AI Generation record was created in database

### Error: "Timeout"
**Fix**: FLUX Schnell should complete in 4-8 seconds. Check:
- FAL API status
- Network connection
- Request ID validity

## Cost Estimation (Approximate)

| Model | Steps | Avg Cost |
|-------|-------|----------|
| Schnell | 4 | ~$0.003 |
| Schnell | 12 | ~$0.005 |
| SRPO | 28 | ~$0.010 |
| SRPO | 40 | ~$0.015 |

*Costs are estimates and may vary*
