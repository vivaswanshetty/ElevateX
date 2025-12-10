const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;

        if (!content || !recipientId) {
            return res.status(400).json({ message: 'Recipient and content are required' });
        }

        const message = await Message.create({
            sender: req.user._id,
            recipient: recipientId,
            content
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name avatar')
            .populate('recipient', 'name avatar');

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

        const messages = await Message.find({
            $or: [
                { sender: req.user._id, recipient: userId },
                { sender: userId, recipient: req.user._id }
            ]
        })
            .sort({ createdAt: 1 })
            .populate('sender', 'name avatar')
            .populate('recipient', 'name avatar');

        // Mark messages as read
        await Message.updateMany(
            { sender: userId, recipient: req.user._id, read: false },
            { read: true }
        );

        res.json(messages);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ message: 'Failed to fetch conversation' });
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
            r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
        );

        if (existingReactionIndex !== -1) {
            // Remove reaction if already exists (toggle)
            message.reactions.splice(existingReactionIndex, 1);
        } else {
            // Add new reaction
            message.reactions.push({
                emoji,
                user: req.user._id
            });
        }

        await message.save();

        const updatedMessage = await Message.findById(messageId)
            .populate('sender', 'name avatar')
            .populate('recipient', 'name avatar')
            .populate('reactions.user', 'name');

        res.json(updatedMessage);
    } catch (error) {
        console.error('Error reacting to message:', error);
        res.status(500).json({ message: 'Failed to react to message' });
    }
};

module.exports = {
    sendMessage,
    getConversation,
    getConversations,
    getUnreadMessageCount,
    editMessage,
    deleteMessage,
    reactToMessage
};
