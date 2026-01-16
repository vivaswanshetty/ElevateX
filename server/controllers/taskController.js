const Task = require('../models/Task');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { sendEmail, emailTemplates } = require('../services/emailService');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    try {
        const { title, category, sub, rewardId, coins, desc, deadline, files } = req.body;

        if (!title || !category || !sub || !coins || !desc || !deadline) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const user = await User.findById(req.user._id);
        if (user.coins < coins) {
            return res.status(400).json({ message: 'Insufficient coins' });
        }

        const task = await Task.create({
            title,
            category,
            subcategory: sub,
            rewardTier: rewardId,
            coins,
            description: desc,
            deadline,
            attachments: files,
            createdBy: req.user._id
        });

        if (task) {
            // Create Transaction
            await Transaction.create({
                user: req.user._id,
                type: 'escrow-lock',
                amount: coins,
                task: task._id,
                description: `Escrow lock for task: ${title}`
            });

            // Deduct coins
            user.coins -= coins;
            user.xp += 10;
            await user.save();

            // Notify all other users (Async)
            User.find({ _id: { $ne: req.user._id } }).select('email name').then(users => {
                users.forEach(u => {
                    const emailData = emailTemplates.newTaskAvailable(u.name, title, coins);
                    sendEmail({
                        to: u.email,
                        subject: emailData.subject,
                        html: emailData.html,
                        text: emailData.text
                    }).catch(err => console.error(`Failed to send new task email to ${u.email}`, err));
                });
            });

            res.status(201).json(task);
        } else {
            res.status(400).json({ message: 'Invalid task data' });
        }
    } catch (error) {
        console.error('Create Task Error:', error);
        res.status(500).json({ message: error.message || 'Server error while creating task' });
    }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
const getTasks = async (req, res) => {
    const tasks = await Task.find({})
        .populate('createdBy', 'name avatar')
        .sort({ createdAt: -1 });
    res.json(tasks);
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Public
const getTaskById = async (req, res) => {
    const task = await Task.findById(req.params.id)
        .populate('createdBy', 'name avatar email')
        .populate('applicants.user', 'name avatar');

    if (task) {
        res.json(task);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

// @desc    Apply for a task
// @route   PUT /api/tasks/:id/apply
// @access  Private
const applyForTask = async (req, res) => {
    // Populate createdBy to get email
    const task = await Task.findById(req.params.id).populate('createdBy', 'name email');

    if (task) {
        if (task.status !== 'Open') {
            return res.status(400).json({ message: 'Task is not open' });
        }

        const alreadyApplied = task.applicants.find(
            (app) => app.user.toString() === req.user._id.toString()
        );

        if (alreadyApplied) {
            return res.status(400).json({ message: 'Already applied' });
        }

        task.applicants.push({ user: req.user._id });
        await task.save();

        // Create in-app notification for task creator
        try {
            const Activity = require('../models/Activity');
            await Activity.create({
                recipient: task.createdBy._id,
                actor: req.user._id,
                type: 'task_apply',
                task: task._id
            });
        } catch (error) {
            console.error('Failed to create activity notification:', error);
            // Continue execution, don't fail the request
        }

        // Notify task creator via email
        try {
            const applicant = await User.findById(req.user._id).select('name');
            const emailData = emailTemplates.taskApplicationReceived(task.createdBy.name, applicant.name, task.title);

            // Send email asynchronously
            sendEmail({
                to: task.createdBy.email,
                subject: emailData.subject,
                html: emailData.html,
                text: emailData.text
            });
        } catch (error) {
            console.error('Failed to send application notification email:', error);
            // Continue execution, don't fail the request
        }

        res.json(task);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

// @desc    Assign a task
// @route   PUT /api/tasks/:id/assign
// @access  Private
const assignTask = async (req, res) => {
    const { applicantId } = req.body;
    const task = await Task.findById(req.params.id);

    if (task) {
        if (task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        task.assignedTo = applicantId;
        task.status = 'In Progress';
        await task.save();

        // Create in-app notification for assigned user
        try {
            const Activity = require('../models/Activity');
            await Activity.create({
                recipient: applicantId,
                actor: req.user._id,
                type: 'task_assign',
                task: task._id
            });
        } catch (error) {
            console.error('Failed to create task assignment notification:', error);
        }

        res.json(task);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

const { getIO } = require('../utils/socketUtils');

// @desc    Complete a task
// @route   PUT /api/tasks/:id/complete
// @access  Private
const completeTask = async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        // Allow both task creator and assigned user to mark complete
        const isCreator = task.createdBy.toString() === req.user._id.toString();
        const isAssignedUser = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

        if (!isCreator && !isAssignedUser) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (task.status === 'Completed') {
            return res.status(400).json({ message: 'Task already completed' });
        }

        if (!task.assignedTo) {
            return res.status(400).json({ message: 'Task must be assigned before completion' });
        }

        task.status = 'Completed';
        await task.save();

        // Transfer coins to fulfiller and give XP to both users
        const fulfiller = await User.findById(task.assignedTo);
        const creator = await User.findById(task.createdBy);

        if (fulfiller) {
            // Give coins and XP to fulfiller
            fulfiller.coins = (fulfiller.coins || 0) + task.coins;
            fulfiller.xp = (fulfiller.xp || 0) + 30; // XP for completing task

            // Focus Alchemy: Award a random essence
            const essenceTypes = ['focus', 'creativity', 'discipline'];
            const randomEssence = essenceTypes[Math.floor(Math.random() * essenceTypes.length)];
            if (!fulfiller.essences) {
                fulfiller.essences = { focus: 0, creativity: 0, discipline: 0 };
            }
            fulfiller.essences[randomEssence] += 1;

            await fulfiller.save();

            // Create Transaction for fulfiller (receiving payment)
            await Transaction.create({
                user: fulfiller._id,
                type: 'escrow-release',
                amount: task.coins,
                task: task._id,
                description: `Payment received for completing: ${task.title}`
            });

            // Emit resonance event
            try {
                const io = getIO();
                io.emit('resonance_event', {
                    user: fulfiller.name,
                    task: task.title,
                    timestamp: new Date()
                });
            } catch (err) {
                console.error('Socket emit error:', err);
            }
        }

        if (creator) {
            // Give XP to task creator for successful task posting
            creator.xp = (creator.xp || 0) + 10;
            await creator.save();
        }

        // Notify task creator that their task is complete
        if (fulfiller) {
            try {
                const Activity = require('../models/Activity');
                await Activity.create({
                    recipient: task.createdBy,
                    actor: fulfiller._id,
                    type: 'task_complete',
                    task: task._id
                });
            } catch (error) {
                console.error('Failed to create task completion notification:', error);
            }
        }

        res.json(task);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

// @desc    Add a message to task chat
// @route   POST /api/tasks/:id/chat
// @access  Private
const addTaskMessage = async (req, res) => {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);

    if (task) {
        const newMessage = {
            user: req.user._id,
            from: req.user.name,
            avatar: req.user.avatar,
            text,
            at: new Date(),
            readBy: [req.user._id] // Creator has read their own message
        };

        task.chat.push(newMessage);
        await task.save();

        // Populate the task before sending response
        const populatedTask = await Task.findById(task._id)
            .populate('createdBy', 'name avatar')
            .populate('applicants.user', 'name avatar');

        res.json(populatedTask);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

// @desc    Edit a message in task chat
// @route   PUT /api/tasks/:id/chat/:messageId
// @access  Private
const editTaskMessage = async (req, res) => {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);

    if (task) {
        const message = task.chat.id(req.params.messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check authorization - handle both old messages (from field) and new messages (user field)
        const isAuthorized = message.user
            ? message.user.toString() === req.user._id.toString()
            : message.from === req.user.name;

        if (!isAuthorized) {
            return res.status(401).json({ message: 'Not authorized to edit this message' });
        }

        message.text = text;
        message.edited = true;
        message.editedAt = new Date();

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('createdBy', 'name avatar')
            .populate('applicants.user', 'name avatar');

        res.json(populatedTask);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

// @desc    Delete a message from task chat
// @route   DELETE /api/tasks/:id/chat/:messageId
// @access  Private
const deleteTaskMessage = async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        const message = task.chat.id(req.params.messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check authorization - handle both old messages (from field) and new messages (user field)
        const isMessageOwner = message.user
            ? message.user.toString() === req.user._id.toString()
            : message.from === req.user.name;

        const isTaskCreator = task.createdBy.toString() === req.user._id.toString();

        if (!isMessageOwner && !isTaskCreator) {
            return res.status(401).json({ message: 'Not authorized to delete this message' });
        }

        message.remove();
        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('createdBy', 'name avatar')
            .populate('applicants.user', 'name avatar');

        res.json(populatedTask);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

// @desc    Add reaction to a message
// @route   POST /api/tasks/:id/chat/:messageId/react
// @access  Private
const reactToMessage = async (req, res) => {
    const { emoji } = req.body;
    const task = await Task.findById(req.params.id);

    if (task) {
        const message = task.chat.id(req.params.messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find(
            r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
        );

        if (existingReaction) {
            // Remove reaction if already exists (toggle)
            message.reactions = message.reactions.filter(
                r => !(r.user.toString() === req.user._id.toString() && r.emoji === emoji)
            );
        } else {
            // Add new reaction
            message.reactions.push({
                user: req.user._id,
                emoji
            });
        }

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('createdBy', 'name avatar')
            .populate('applicants.user', 'name avatar');

        res.json(populatedTask);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

// @desc    Mark messages as read
// @route   PUT /api/tasks/:id/chat/read
// @access  Private
const markMessagesAsRead = async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        // Mark all messages as read by current user
        task.chat.forEach(message => {
            if (!message.readBy.includes(req.user._id)) {
                message.readBy.push(req.user._id);
            }
        });

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('createdBy', 'name avatar')
            .populate('applicants.user', 'name avatar');

        res.json(populatedTask);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    const { title, desc, deadline, category, sub, coins, rewardId, newAttachments, removedAttachmentIds } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    // Only creator can edit
    if (task.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    // 1. Handle Coin Adjustments
    if (typeof coins === 'number' && coins !== task.coins) {
        const coinDiff = coins - task.coins;
        const user = await User.findById(req.user._id);

        if (coinDiff > 0) {
            // Charging more - check balance
            if (user.coins < coinDiff) {
                return res.status(400).json({ message: `Insufficient coins. You need ${coinDiff} more coins.` });
            }
            user.coins -= coinDiff;
            await Transaction.create({
                user: user._id,
                type: 'withdraw',
                amount: coinDiff,
                description: `Increased reward for task: ${task.title}`
            });
        } else if (coinDiff < 0) {
            // Refund
            const refundAmount = Math.abs(coinDiff);
            user.coins += refundAmount;
            await Transaction.create({
                user: user._id,
                type: 'deposit',
                amount: refundAmount,
                description: `Refund from task adjustment: ${task.title}`
            });
        }
        await user.save();
        task.coins = coins;
    }

    // 2. Update Basic Fields
    if (title) task.title = title;
    if (desc) task.description = desc;
    if (deadline) task.deadline = deadline;
    if (category) task.category = category;
    if (sub) task.subcategory = sub;
    if (rewardId) task.rewardTier = rewardId;

    // 3. Handle Attachments
    // Remove deleted ones
    if (removedAttachmentIds && removedAttachmentIds.length > 0) {
        // Filter out attachments whose IDs are in the removed list
        task.attachments = task.attachments.filter(att => !removedAttachmentIds.includes(att._id.toString()));
    }
    // Add new ones
    if (newAttachments && newAttachments.length > 0) {
        task.attachments.push(...newAttachments);
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
        .populate('createdBy', 'name avatar')
        .populate('applicants.user', 'name avatar');

    res.json(populatedTask);
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        if (task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (task.status === 'Completed') {
            return res.status(400).json({ message: 'Cannot delete completed task' });
        }

        // Refund coins to creator
        const user = await User.findById(req.user._id);
        if (user) {
            user.coins += task.coins;
            await user.save();

            // Create refund transaction
            await Transaction.create({
                user: req.user._id,
                type: 'deposit', // Simplified type
                amount: task.coins,
                // task: task._id, // task might be optional depending on schema
                description: `Refund for deleted task: ${task.title}`
            });
        }

        await Task.deleteOne({ _id: req.params.id });
        res.json({ message: 'Task removed' });
        res.json({ message: 'Task removed' });
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    applyForTask,
    assignTask,
    completeTask,
    addTaskMessage,
    editTaskMessage,
    deleteTaskMessage,
    reactToMessage,
    markMessagesAsRead,
    updateTask,
    deleteTask
};
