# Quick Reference - AI Generation Modal

## 🚀 Quick Start

### For Developers
```javascript
// The modal now handles AI generation automatically
<GenerateModal isOpen={isOpen} onClose={handleClose} />
```

### For Users
1. Click "Generate" button
2. Click "Generate AI"
3. Type prompt
4. Select model (Schnell = fast, SRPO = quality)
5. Click "Generate"
6. Wait 15-35 seconds
7. Click "Post Now"
8. Add caption
9. Click "Post"

## 🔑 Key Points

### Models
- **flux-schnell** → Fast (15-20s)
- **flux-1-srpo** → Quality (25-35s)

### Aspect Ratios
- 1:1, 16:9, 9:16, 4:3, 3:4

### API Endpoints
```
POST /api/posts/generate-image          (start)
GET  /api/posts/generation/:requestId   (poll)
POST /api/posts/create-from-generation  (post)
```

### Modal States
```
generate → ai → generating → generated → next → ✅
```

## 🎨 Component Props
```javascript
{
  isOpen: boolean,      // Control modal visibility
  onClose: () => void   // Called when modal closes
}
```

## 📦 Dependencies
```javascript
import apiService from '../../services/api';
```

## 🔄 Data Flow
```
User Input
    ↓
Generate API (with prompt, model, aspect ratio)
    ↓
Poll Status (every 2s, max 2 min)
    ↓
Image URL + AI Generation ID
    ↓
Post Creation API
    ↓
✅ Done!
```

## 💡 Tips

### For Best Results
- Be descriptive in prompts
- Use FLUX Schnell for speed
- Use FLUX.1 SRPO for quality
- Choose appropriate aspect ratio

### Troubleshooting
- **Empty prompt:** Enter text first
- **Timeout:** Wait 2 minutes max, then retry
- **Error:** Check backend logs
- **Stuck:** Refresh and try again

## 📱 Features

✅ Real-time progress tracking
✅ ETA display
✅ Multiple models
✅ Multiple aspect ratios
✅ Error recovery
✅ Draft/Profile toggle
✅ AI badge on posts
✅ Auto-caption from prompt

## 🎯 Success Metrics

- Generation time: < 30s (Schnell), < 45s (SRPO)
- Success rate: > 95%
- User satisfaction: Smooth UX
- Error rate: < 5%

---

**Need Help?** See `AI_GENERATION_IMPLEMENTATION.md` for full docs.
