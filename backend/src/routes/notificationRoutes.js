const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} = require('../controllers/notificationController');

// All routes require authentication
router.use(auth);

// GET /api/notifications - list notifications
router.get('/', getNotifications);

// GET /api/notifications/unread-count
router.get('/unread-count', getUnreadCount);

// PUT /api/notifications/read-all - mark all as read (must come before /:id routes)
router.put('/read-all', markAllAsRead);

// PUT /api/notifications/:id/read - mark single as read
router.put('/:id/read', markAsRead);

module.exports = router;
