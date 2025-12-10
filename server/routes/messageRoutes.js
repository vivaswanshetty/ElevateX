const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    sendMessage,
    getConversation,
    getConversations,
    getUnreadMessageCount,
    editMessage,
    deleteMessage,
    reactToMessage
} = require('../controllers/messageController');

router.post('/', protect, sendMessage);
router.get('/', protect, getConversations);
router.get('/unread/count', protect, getUnreadMessageCount);
router.get('/:userId', protect, getConversation);
router.put('/:messageId', protect, editMessage);
router.delete('/:messageId', protect, deleteMessage);
router.post('/:messageId/react', protect, reactToMessage);


module.exports = router;
