# AI Generation Modal - Testing Guide

## Prerequisites
1. Backend running on `http://localhost:3000`
2. Frontend running on `http://localhost:5173`
3. FAL API key configured in backend `.env`
4. Cloudinary credentials configured in backend `.env`
5. User logged in (authentication token present)

## Test Scenarios

### Test 1: Basic FLUX Schnell Generation
**Steps:**
1. Click "Generate" button in main UI
2. Click "Generate AI" option
3. Enter prompt: "A beautiful sunset over mountains"
4. Ensure model is set to "FLUX Schnell (Fast - 15-20s)"
5. Keep aspect ratio as "1:1 Square"
6. Click "Generate" button

**Expected:**
- Modal transitions to "Generating" state
- Progress bar appears with spinner
- Status shows "Initializing AI generation..."
- ETA shows "15-20 seconds (Fast Mode)"
- After ~15-20 seconds, modal shows generated image
- "Post Now" button appears (green)

**Backend Logs:**
```
🎨 Starting AI generation with prompt: A beautiful sunset over mountains
Using model: FLUX Schnell
Steps: 4, Guidance: 3.5
```

---

### Test 2: FLUX.1 SRPO Quality Generation
**Steps:**
1. Click "Generate AI"
2. Enter prompt: "Detailed portrait of a cyberpunk character"
3. Change model to "FLUX.1 SRPO (Quality - 25-35s)"
4. Select aspect ratio "9:16 Portrait"
5. Click "Generate"

**Expected:**
- Generation takes longer (~25-35 seconds)
- ETA shows "25-35 seconds (Quality Mode)"
- Higher quality result
- Correct portrait aspect ratio

**Backend Payload:**
```javascript
{
  selectedModel: "flux-1-srpo",
  numInferenceSteps: 28,
  guidanceScale: 4.5,
  aspectRatio: "9:16"
}
```

---

### Test 3: Post from AI Generation
**Steps:**
1. Complete Test 1 or Test 2
2. On "Generated Image" screen, click "Post Now"
3. Add caption: "My first AI creation!"
4. Keep upload type as "Upload to Profile" (public)
5. Click "Post" button

**Expected:**
- Post created successfully alert
- Modal closes
- Page refreshes
- New post appears on feed with:
  - Generated image
  - Caption
  - AI badge/indicator
  - Tags: ['ai-generated', 'flux-schnell'] or ['ai-generated', 'flux-1-srpo']

**API Call:**
```
POST /api/posts/create-from-generation
{
  aiGenerationIds: ["cm..."],
  caption: "My first AI creation!",
  visibility: "public",
  tags: ["ai-generated", "flux-schnell"]
}
```

---

### Test 4: Generation Error Handling
**Steps:**
1. Stop backend server
2. Click "Generate AI"
3. Enter prompt and click "Generate"

**Expected:**
- Error alert appears
- Modal returns to "AI" configuration state
- User can modify prompt and retry
- No crash or broken state

---

### Test 5: Generation Timeout
**Steps:**
1. Modify `pollGenerationStatus` max attempts to 3 (6 seconds)
2. Generate with slow model
3. Wait for timeout

**Expected:**
- After 6 seconds, timeout alert appears
- Modal returns to "AI" state
- User can retry generation

---

### Test 6: Draft vs Profile Toggle
**Steps:**
1. Generate AI image
2. Go to post screen
3. Toggle "Upload to Draft" (private)
4. Click "Post"

**Expected:**
- Post created with `visibility: "private"`
- Post NOT visible on public feed
- Post visible in user's drafts

---

### Test 7: Multiple Aspect Ratios
Test each aspect ratio:

| Ratio | Description | Expected Result |
|-------|-------------|-----------------|
| 1:1   | Square      | Square image |
| 16:9  | Landscape   | Wide landscape |
| 9:16  | Portrait    | Tall portrait |
| 4:3   | Landscape   | Standard landscape |
| 3:4   | Portrait    | Standard portrait |

**Verify:** Backend `imageSize` parameter is correctly set

---

### Test 8: Empty Prompt Validation
**Steps:**
1. Click "Generate AI"
2. Leave prompt empty
3. Click "Generate"

**Expected:**
- Alert: "Please enter a prompt"
- No API call made
- Modal stays on "AI" state

---

### Test 9: Progress Bar Animation
**Steps:**
1. Start generation
2. Watch progress bar

**Expected:**
- Starts at 10% (initialization)
- Jumps to 30% (generation started)
- Gradually increases to 90% during processing
- Completes at 100% when done
- Smooth animation, no jumps

---

### Test 10: Back Navigation
**Steps:**
1. Generate AI image successfully
2. On "Generated" screen, click back arrow
3. Modify prompt
4. Generate again

**Expected:**
- Returns to "AI" configuration
- Can regenerate with new settings
- Previous generation discarded
- No data loss

---

### Test 11: Concurrent Requests
**Steps:**
1. Generate image
2. While generating, DO NOT close modal
3. Wait for completion

**Expected:**
- Modal properly locked during generation
- No duplicate API calls
- Generation completes normally

---

### Test 12: Failed Generation
**Steps:**
1. Backend simulation: make generation fail
2. Generate image

**Expected:**
- Error alert appears
- Status shows failure reason
- Returns to "AI" configuration
- User can retry

---

## Performance Benchmarks

### FLUX Schnell
- **Target:** 15-20 seconds
- **Acceptable:** < 30 seconds
- **Max polling:** 60 attempts (2 minutes timeout)

### FLUX.1 SRPO
- **Target:** 25-35 seconds
- **Acceptable:** < 45 seconds
- **Max polling:** 60 attempts (2 minutes timeout)

---

## Browser Console Checks

### Successful Generation
```
🎨 Starting AI generation with payload: { ... }
🔄 Poll attempt 1: Status - queued
🔄 Poll attempt 2: Status - processing
🔄 Poll attempt 8: Status - completed
✅ Generation completed successfully!
📤 Creating post from AI generation...
```

### Failed Generation
```
🎨 Starting AI generation with payload: { ... }
❌ AI Generation Error: Failed to start generation
```

---

## API Response Verification

### 1. Generate Image Response
```json
{
  "success": true,
  "message": "1 image generation(s) started",
  "generations": [{
    "requestId": "abc123",
    "model": "FLUX Schnell",
    "aiGenerationId": "cm..."
  }],
  "count": 1,
  "estimatedTime": "15-30 seconds per image"
}
```

### 2. Generation Status Response (Processing)
```json
{
  "success": true,
  "status": "processing",
  "requestId": "abc123",
  "queuePosition": null,
  "logs": []
}
```

### 3. Generation Status Response (Completed)
```json
{
  "success": true,
  "status": "completed",
  "imageUrl": "https://cloudinary.com/...",
  "aiGenerationId": "cm...",
  "model": "FLUX Schnell",
  "seed": 123456
}
```

### 4. Create Post Response
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "id": "cm...",
    "caption": "My first AI creation!",
    "mediaUrls": ["https://..."],
    "aiGenerated": true,
    "author": { ... }
  }
}
```

---

## Common Issues & Troubleshooting

### Issue: Generation stuck at "Processing..."
**Cause:** Backend or FAL API issue
**Solution:**
- Check backend logs
- Verify FAL API key
- Check network connectivity
- Wait for timeout, then retry

### Issue: "Failed to start generation"
**Cause:** Backend error or auth issue
**Solution:**
- Verify user is logged in
- Check access token validity
- Check backend error logs
- Verify FAL API key

### Issue: Image not displaying after generation
**Cause:** Cloudinary upload issue
**Solution:**
- Check Cloudinary credentials
- Verify imageUrl in response
- Check CORS settings
- Test URL directly in browser

### Issue: Post creation fails
**Cause:** Missing aiGenerationId or invalid data
**Solution:**
- Verify generation completed successfully
- Check aiGenerationIds array has values
- Verify user authentication
- Check backend post creation logs

---

## Automated Testing (Future)

### Unit Tests
```javascript
describe('GenerateModal', () => {
  test('validates empty prompt', () => { ... });
  test('calls API with correct payload', () => { ... });
  test('handles generation error', () => { ... });
  test('polls until completion', () => { ... });
  test('creates post from generation', () => { ... });
});
```

### Integration Tests
```javascript
describe('AI Generation Flow', () => {
  test('complete generation and post flow', async () => {
    // 1. Open modal
    // 2. Enter prompt
    // 3. Select model
    // 4. Generate
    // 5. Wait for completion
    // 6. Add caption
    // 7. Post
    // 8. Verify post on feed
  });
});
```

---

## Checklist

Before releasing:
- [ ] All test scenarios pass
- [ ] Error handling works correctly
- [ ] Progress indicators accurate
- [ ] Post creation successful
- [ ] Both models work (Schnell & SRPO)
- [ ] All aspect ratios work
- [ ] Draft vs Profile toggle works
- [ ] Browser console clean (no errors)
- [ ] Backend logs show correct flow
- [ ] Performance within benchmarks
- [ ] Mobile responsive
- [ ] Accessibility verified

---

**Test Date:** _________
**Tested By:** _________
**Status:** ⬜ Pass / ⬜ Fail
**Notes:** _________________________________________

