const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(auth);
router.use(authorize('admin'));

// POST /api/admin/models - Add a new AI model
router.post('/models', adminController.addModel);

// GET /api/admin/models - List all AI models
router.get('/models', adminController.getModels);

// PUT /api/admin/models/:id - Update an AI model
router.put('/models/:id', adminController.updateModel);

// DELETE /api/admin/models/:id - Soft-delete (deactivate) an AI model
router.delete('/models/:id', adminController.deleteModel);

module.exports = router;
