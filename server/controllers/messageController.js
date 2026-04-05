const Message = require('../models/Message');
const User = require('../models/User');
const { getIO } = require('../utils/socketUtils');
const { sendPushNotification } = require('../utils/pushUtils');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { recipientId, content, media } = req.body;

        if (!recipientId) {
            return res.status(400).json({ message: 'Recipient is required' });
        }

        // Allow messages with content or media, but not both required empty
        if (!content && (!media || media.length === 0)) {
            return res.status(400).json({ message: 'Message must contain text or media' });
        }

        if (req.user._id.toString() === recipientId) {
            return res.status(400).json({ message: 'Cannot send message to yourself' });
        }

        // Check if sender follows the recipient (Instagram-like: you can only message people you follow)
        const sender = await User.findById(req.user._id).select('following');
        if (!sender.following.includes(recipientId)) {
            return res.status(403).json({ message: 'You can only message people you follow' });
        }

        const message = await Message.create({
            sender: req.user._id,
            recipient: recipientId,
            content: content || '',
            media: media || []
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name avatar')
            .populate('recipient', 'name avatar pushToken');

        // Emit socket event to the recipient
        try {
            const io = getIO();
            io.to(recipientId).emit('new_message', populatedMessage);
        } catch (socketErr) {
            console.error('Socket emission failed:', socketErr);
        }

        // Send Push Notification
        if (populatedMessage.recipient && populatedMessage.recipient.pushToken) {
            try {
                await sendPushNotification(
                    populatedMessage.recipient.pushToken,
                    `New message from ${populatedMessage.sender.name}`,
                    content || '📎 Media',
                    { type: 'message', senderId: populatedMessage.sender._id }
                );
            } catch (pushErr) {
                console.error("Push notification failed:", pushErr);
            }
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

// @desc    Get conversation with a specific user
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('🟦 getConversation called');
        console.log('🟦 userId:', userId);
        console.log('🟦 req.user:', req.user);

        if (!req.user) {
            console.error('❌ req.user is undefined - auth failed');
            return res.status(401).json({ message: 'Not authenticated' });
        }

        if (!userId) {
            console.error('❌ userId is missing from params');
            return res.status(400).json({ message: 'User ID is required' });
        }

        const messages = await Message.find({
            $or: [
                { sender: req.user._id, recipient: userId },
                { sender: userId, recipient: req.user._id }
            ]
        })
            .sort({ createdAt: 1 })
            .populate('sender', 'name avatar')
            .populate('recipient', 'name avatar');

        console.log('✅ Found messages:', messages.length);

        // Mark messages as read
        await Message.updateMany(
            { sender: userId, recipient: req.user._id, read: false },
            { read: true, readAt: new Date() }
        );

        res.json(messages);
    } catch (error) {
        console.error('❌ Error fetching conversation:', error.message);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({ message: 'Failed to fetch conversation', error: error.message });
    }
};

// @desc    Get all conversations (recent chats)
// @route   GET /api/messages
// @access  Private
const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all messages involving the user
        const messages = await Message.find({
            $or: [{ sender: userId }, { recipient: userId }]
        })
            .sort({ createdAt: -1 })
            .populate('sender', 'name avatar')
            .populate('recipient', 'name avatar');

        const conversations = [];
        const seenUsers = new Set();

        messages.forEach(msg => {
            // Skip if sender or recipient is null (deleted user)
            if (!msg.sender || !msg.recipient) return;

            // Determine who the "other" user is
            const isSender = msg.sender._id.toString() === userId.toString();
            const otherUser = isSender ? msg.recipient : msg.sender;

            // Skip if user is deleted (null)
            if (!otherUser) return;

            const otherUserId = otherUser._id.toString();

            if (!seenUsers.has(otherUserId)) {
                seenUsers.add(otherUserId);
                conversations.push({
                    _id: otherUserId, // Use user ID as conversation ID
                    user: otherUser,
                    lastMessage: msg.content,
                    timestamp: msg.createdAt,
                    isUnread: !isSender && !msg.read
                });
            }
        });

        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
const getUnreadMessageCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            recipient: req.user._id,
            read: false
        });
        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: 'Failed to fetch unread count' });
    }
};

// @desc    Edit a message
// @route   PUT /api/messages/:messageId
// @access  Private
const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user is the sender
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this message' });
        }

        // Check if message is within 15 minutes edit window
        const messageAge = new Date() - new Date(message.createdAt);
        const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds

        if (messageAge > fifteenMinutes) {
            return res.status(403).json({ message: 'Cannot edit messages older than 15 minutes' });
        }

        message.content = content;
        message.edited = true;
        await message.save();

        const updatedMessage = await Message.findById(messageId)
            .populate('sender', 'name avatar')
            .populate('recipient', 'name avatar');

        res.json(updatedMessage);
    } catch (error) {
        console.error('Error editing message:', error);
        res.status(500).json({ message: 'Failed to edit message' });
    }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user is the sender
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        await Message.findByIdAndDelete(messageId);

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Failed to delete message' });
    }
};

// @desc    React to a message
// @route   POST /api/messages/:messageId/react
// @access  Private
const reactToMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;

        if (!emoji) {
            return res.status(400).json({ message: 'Emoji is required' });
        }

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user already reacted with this emoji
        const existingReactionIndex = message.reactions.findIndex(
            r => r.emoji === emoji
        );

        if (existingReactionIndex !== -1) {
            // Check if user is in the users array
            const userIndex = message.reactions[existingReactionIndex].users.indexOf(req.user._id);
            
            if (userIndex > -1) {
                // Remove user from the reaction
                message.reactions[existingReactionIndex].users.splice(userIndex, 1);
                // If no more users for this reaction, remove the reaction entry
                if (message.reactions[existingReactionIndex].users.length === 0) {
                    message.reactions.splice(existingReactionIndex, 1);
                }
            } else {
                // Add user to existing reaction
                message.reactions[existingReactionIndex].users.push(req.user._id);
            }
        } else {
            // Create new reaction with this emoji containing current user
            message.reactions.push({
                emoji,
                users: [req.user._id]
            });
        }

        await message.save();

        const updatedMessage = await Message.findById(messageId)
            .populate('sender', 'name avatar')
            .populate('recipient', 'name avatar');

        res.json(updatedMessage);
    } catch (error) {
        console.error('Error reacting to message:', error);
        res.status(500).json({ message: 'Failed to react to message' });
    }
};

// @desc    Mark a message as read
// @route   PUT /api/messages/:messageId/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Only the recipient can mark a message as read
        if (message.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to mark this message as read' });
        }

        // Mark as read
        message.read = true;
        message.readAt = new Date();
        await message.save();

        const updatedMessage = await Message.findById(messageId)
            .populate('sender', 'name avatar')
            .populate('recipient', 'name avatar');

        res.json(updatedMessage);
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ message: 'Failed to mark message as read' });
    }
};


// @desc    Upload media file
// @route   POST /api/messages/upload
// @access  Private
const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
        if (req.file.size > MAX_FILE_SIZE) {
            return res.status(400).json({ message: 'File size exceeds 200MB limit' });
        }

        // Determine media type from MIME type
        let mediaType = 'document';
        if (req.file.mimetype.startsWith('image/')) {
            mediaType = 'image';
        } else if (req.file.mimetype.startsWith('video/')) {
            mediaType = 'video';
        } else if (req.file.mimetype.startsWith('audio/')) {
            mediaType = 'audio';
        }

        // File is stored by multer middleware, construct the URL
        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
            url: fileUrl,
            type: mediaType,
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
    } catch (error) {
        console.error('Error uploading media:', error);
        res.status(500).json({ message: 'Failed to upload media' });
    }
};

module.exports = {
    sendMessage,
    getConversation,
    getConversations,
    getUnreadMessageCount,
    editMessage,
    deleteMessage,
    reactToMessage,
    markAsRead,
    uploadMedia
};
