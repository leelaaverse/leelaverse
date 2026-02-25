const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// All routes require authentication
router.use(auth);

// GET /api/payments/plans - Get available coin plans
router.get('/plans', paymentController.getPlans);

// POST /api/payments/create-order - Create a Razorpay order
router.post('/create-order', paymentController.createOrder);

// POST /api/payments/verify - Verify payment and credit coins
router.post('/verify', paymentController.verifyPayment);

// GET /api/payments/history - Get transaction history
router.get('/history', paymentController.getTransactionHistory);

module.exports = router;
