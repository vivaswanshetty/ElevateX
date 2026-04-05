const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { messageValidation, validate } = require('../middleware/validation');
const { writeLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const {
    sendMessage,
    getConversation,
    getConversations,
    getUnreadMessageCount,
    editMessage,
    deleteMessage,
    reactToMessage,
    markAsRead,
    uploadMedia
} = require('../controllers/messageController');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Allow common media and document types
    const allowedMimes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/x-msvideo',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB — reduced from 200MB
});

router.post('/', protect, writeLimiter, messageValidation, validate, sendMessage);
router.post('/upload', protect, uploadLimiter, upload.single('media'), uploadMedia);
router.get('/', protect, getConversations);
router.get('/unread/count', protect, getUnreadMessageCount);
router.get('/:userId', protect, getConversation);
router.put('/:messageId', protect, writeLimiter, editMessage);
router.put('/:messageId/read', protect, markAsRead);
router.delete('/:messageId', protect, deleteMessage);
router.post('/:messageId/react', protect, writeLimiter, reactToMessage);


module.exports = router;
