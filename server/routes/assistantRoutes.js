const express = require('express');
const router = express.Router();
const {
    getConversations,
    getConversationDetails,
    createConversation,
    deleteConversation,
    chatWithAssistant
} = require('../controllers/assistantController');
const { protect } = require('../middleware/authMiddleware');
const { writeLimiter, assistantLimiter } = require('../middleware/rateLimiter');

router.route('/conversations')
    .get(protect, getConversations)
    .post(protect, writeLimiter, createConversation);

router.route('/conversations/:id')
    .get(protect, getConversationDetails)
    .delete(protect, deleteConversation);

router.route('/conversations/:id/chat')
    .post(protect, assistantLimiter, chatWithAssistant);

module.exports = router;
