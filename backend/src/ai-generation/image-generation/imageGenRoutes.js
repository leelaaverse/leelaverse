/**
 * Image Generation Routes
 * Routes for text-to-image and image-to-image operations
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { generateImage, listModels } = require('./imageGenController');
const { editImage, listEditModels } = require('./imageEditController');

// Text-to-Image
router.post('/generate', auth, generateImage);
router.get('/models', auth, listModels);

// Image-to-Image / Editing
router.post('/edit', auth, editImage);
router.get('/edit/models', auth, listEditModels);

module.exports = router;
