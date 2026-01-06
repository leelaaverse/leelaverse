const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

// All message routes require authentication
router.use(auth);

// Send a message
router.post('/send', messageController.sendMessage);

// Get all conversations
router.get('/conversations', messageController.getConversations);

// Get specific conversation with messages
router.get('/conversation/:conversationId', messageController.getConversation);

// Get message requests
router.get('/requests', messageController.getMessageRequests);

// Accept message request
router.post('/requests/:conversationId/accept', messageController.acceptMessageRequest);

// Reject message request
router.delete('/requests/:conversationId/reject', messageController.rejectMessageRequest);

// Mark messages as read
router.patch('/read', messageController.markAsRead);

// Upload chat media
const { uploadChatMedia } = require('../controllers/chatMediaController');
router.post('/upload-media', uploadChatMedia);

module.exports = router;
