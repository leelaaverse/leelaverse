/**
 * Video Generation Routes
 * Routes for video upscale (and future text-to-video, image-to-video)
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { upscaleVideo, listVideoUpscaleModels } = require('./videoUpscaleController');

// Video Upscale
router.post('/upscale', auth, upscaleVideo);
router.get('/upscale/models', auth, listVideoUpscaleModels);

// Future: Text-to-Video
// router.post('/generate', auth, generateVideo);
// router.get('/generate/models', auth, listVideoGenModels);

// Future: Image-to-Video
// router.post('/animate', auth, animateImage);
// router.get('/animate/models', auth, listAnimateModels);

module.exports = router;
