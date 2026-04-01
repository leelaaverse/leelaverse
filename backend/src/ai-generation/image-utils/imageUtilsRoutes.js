/**
 * Image Utils Routes
 * Routes for background removal and image upscaling
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { removeBackground, listBgRemovalModels } = require('./backgroundRemovalController');
const { upscaleImage, listUpscaleModels } = require('./upscaleController');

// Background Removal
router.post('/remove-background', auth, removeBackground);
router.get('/remove-background/models', auth, listBgRemovalModels);

// Image Upscale
router.post('/upscale', auth, upscaleImage);
router.get('/upscale/models', auth, listUpscaleModels);

module.exports = router;
