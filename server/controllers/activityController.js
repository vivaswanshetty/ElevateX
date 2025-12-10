const Activity = require('../models/Activity');

// Get all activities for the logged-in user
const getActivities = async (req, res) => {
    try {
        const activities = await Activity.find({ recipient: req.user._id })
            .populate('actor', 'name avatar')
            .populate('post', 'content image')
            .populate('task', 'title')
            .populate('duel', 'type target')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Failed to fetch activities' });
    }
};

// Get unread activity count
const getUnreadCount = async (req, res) => {
    try {
        const count = await Activity.countDocuments({
            recipient: req.user._id,
            read: false
        });

        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: 'Failed to fetch unread count' });
    }
};

// Mark activity as read
const markAsRead = async (req, res) => {
    try {
        const { activityId } = req.params;

        const activity = await Activity.findById(activityId);

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (activity.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        activity.read = true;
        await activity.save();

        res.json(activity);
    } catch (error) {
        console.error('Error marking activity as read:', error);
        res.status(500).json({ message: 'Failed to mark as read' });
    }
};

// Mark all activities as read
const markAllAsRead = async (req, res) => {
    try {
        await Activity.updateMany(
            { recipient: req.user._id, read: false },
            { read: true }
        );

        res.json({ message: 'All activities marked as read' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: 'Failed to mark all as read' });
    }
};

// Create activity (used internally by other controllers)
const createActivity = async (recipientId, actorId, type, data = {}) => {
    try {
        // Don't create activity if actor and recipient are the same
        if (recipientId.toString() === actorId.toString()) {
            return null;
        }

        const activity = await Activity.create({
            recipient: recipientId,
            actor: actorId,
            type,
            ...data
        });

        return activity;
    } catch (error) {
        console.error('Error creating activity:', error);
        return null;
    }
};

// Clear all activities
const clearAllActivities = async (req, res) => {
    try {
        await Activity.deleteMany({ recipient: req.user._id });
        res.json({ message: 'All activities cleared' });
    } catch (error) {
        console.error('Error clearing activities:', error);
        res.status(500).json({ message: 'Failed to clear activities' });
    }
};

module.exports = {
    getActivities,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    createActivity,
    clearAllActivities
};
