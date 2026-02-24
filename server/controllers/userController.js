const User = require('../models/User');
const { createActivity } = require('./activityController');

// @desc    Get all users (for leaderboard)
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
};

// @desc    Search users by name or email
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.json([]);
        }

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        })
            .select('name email avatar username')
            .limit(10);

        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
    const user = await User.findById(req.user._id)
        .select('-password')
        .populate('followRequests', 'name avatar');

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            xp: user.xp,
            coins: user.coins,
            socials: user.socials,
            work: user.work,
            education: user.education,
            isPrivate: user.isPrivate,
            followRequests: user.followRequests,
            essences: user.essences,
            relics: user.relics,
            chatSettings: user.chatSettings,
            token: req.token,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.bio = req.body.bio || user.bio;
        user.avatar = req.body.avatar || user.avatar;
        user.socials = req.body.socials || user.socials;
        user.work = req.body.work || user.work;
        user.education = req.body.education || user.education;

        if (req.body.coins !== undefined) {
            user.coins = req.body.coins;
        }
        if (req.body.xp !== undefined) {
            user.xp = req.body.xp;
        }

        if (req.body.isPrivate !== undefined) {
            user.isPrivate = req.body.isPrivate;
        }

        if (req.body.chatSettings) {
            user.chatSettings = req.body.chatSettings;
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        // Populate followRequests for the response
        await updatedUser.populate('followRequests', 'name avatar');

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
            xp: updatedUser.xp,
            coins: updatedUser.coins,
            socials: updatedUser.socials,
            work: updatedUser.work,
            education: updatedUser.education,
            isPrivate: updatedUser.isPrivate,
            followRequests: updatedUser.followRequests,
            essences: updatedUser.essences,
            relics: updatedUser.relics,
            chatSettings: updatedUser.chatSettings,
            token: req.token, // Keep the same token
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if current password is correct
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Failed to change password' });
    }
};

// @desc    Delete user account permanently
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete user's transactions
        const Transaction = require('../models/Transaction');
        await Transaction.deleteMany({ user: req.user._id });

        // Delete user's tasks (as creator)
        const Task = require('../models/Task');
        await Task.deleteMany({ creator: req.user._id });

        // Remove user from tasks they applied to or are assigned to
        await Task.updateMany(
            { $or: [{ applicants: req.user._id }, { assignedTo: req.user._id }] },
            { $pull: { applicants: req.user._id }, $unset: { assignedTo: 1 } }
        );

        // Delete the user
        await User.findByIdAndDelete(req.user._id);

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Failed to delete account' });
    }
};

// @desc    Follow a user
// @route   PUT /api/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        // Check if already following
        if (currentUser.following.includes(req.params.id)) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        // Check if request already sent
        if (userToFollow.followRequests && userToFollow.followRequests.includes(req.user._id)) {
            return res.status(400).json({ message: 'Follow request already sent' });
        }

        // If user is private, send request
        if (userToFollow.isPrivate) {
            userToFollow.followRequests.push(req.user._id);
            await userToFollow.save();

            // Create activity notification for request
            await createActivity(req.params.id, req.user._id, 'follow_request');

            return res.json({ message: 'Follow request sent', status: 'requested' });
        }

        // Public account - Follow directly
        // Add to following
        currentUser.following.push(req.params.id);
        await currentUser.save();

        // Add to followers
        userToFollow.followers.push(req.user._id);
        await userToFollow.save();

        // Create activity notification
        await createActivity(req.params.id, req.user._id, 'follow');

        res.json({ message: 'User followed successfully', status: 'following' });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ message: 'Failed to follow user' });
    }
};

// @desc    Accept follow request
// @route   PUT /api/users/:id/accept-request
// @access  Private
const acceptFollowRequest = async (req, res) => {
    try {
        const requesterId = req.params.id;
        const currentUser = await User.findById(req.user._id);
        const requester = await User.findById(requesterId);

        if (!requester) {
            // User deleted their account, remove the request
            currentUser.followRequests = currentUser.followRequests.filter(
                id => id.toString() !== requesterId
            );
            await currentUser.save();
            return res.status(404).json({ message: 'This user has deleted their account' });
        }

        // Check if request exists
        if (!currentUser.followRequests.includes(requesterId)) {
            return res.status(400).json({ message: 'No follow request from this user' });
        }

        // Remove from requests
        currentUser.followRequests = currentUser.followRequests.filter(
            id => id.toString() !== requesterId
        );

        // Add to followers (current user)
        currentUser.followers.push(requesterId);
        await currentUser.save();

        // Add to following (requester)
        requester.following.push(currentUser._id);
        await requester.save();

        // Create activity notification for requester
        await createActivity(requesterId, currentUser._id, 'follow_accept');

        res.json({ message: 'Follow request accepted' });
    } catch (error) {
        console.error('Error accepting follow request:', error);
        res.status(500).json({ message: 'Failed to accept request' });
    }
};

// @desc    Reject follow request
// @route   PUT /api/users/:id/reject-request
// @access  Private
const rejectFollowRequest = async (req, res) => {
    try {
        const requesterId = req.params.id;
        const currentUser = await User.findById(req.user._id);

        // Check if request exists
        if (!currentUser.followRequests.includes(requesterId)) {
            return res.status(400).json({ message: 'No follow request from this user' });
        }

        // Remove from requests
        currentUser.followRequests = currentUser.followRequests.filter(
            id => id.toString() !== requesterId
        );
        await currentUser.save();

        res.json({ message: 'Follow request rejected' });
    } catch (error) {
        console.error('Error rejecting follow request:', error);
        res.status(500).json({ message: 'Failed to reject request' });
    }
};

// @desc    Unfollow a user
// @route   PUT /api/users/:id/unfollow
// @access  Private
const unfollowUser = async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot unfollow yourself' });
        }

        // Check if there's a pending follow request (for private accounts)
        const hasRequestPending = userToUnfollow.followRequests &&
            userToUnfollow.followRequests.includes(req.user._id);

        if (hasRequestPending) {
            // Withdraw follow request
            userToUnfollow.followRequests = userToUnfollow.followRequests.filter(
                id => id.toString() !== req.user._id.toString()
            );
            await userToUnfollow.save();
            return res.json({ message: 'Follow request withdrawn', status: 'withdrawn' });
        }

        // Check if not following
        if (!currentUser.following.includes(req.params.id)) {
            return res.status(400).json({ message: 'Not following this user' });
        }

        // Remove from following
        currentUser.following = currentUser.following.filter(
            id => id.toString() !== req.params.id
        );
        await currentUser.save();

        // Remove from followers
        userToUnfollow.followers = userToUnfollow.followers.filter(
            id => id.toString() !== req.user._id.toString()
        );
        await userToUnfollow.save();

        res.json({ message: 'User unfollowed successfully', status: 'unfollowed' });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ message: 'Failed to unfollow user' });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
};

// @desc    Get user followers
// @route   GET /api/users/:id/followers
// @access  Public
const getUserFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('followers', 'name avatar xp');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.followers);
    } catch (error) {
        console.error('Error fetching followers:', error);
        res.status(500).json({ message: 'Failed to fetch followers' });
    }
};

// @desc    Get user following
// @route   GET /api/users/:id/following
// @access  Public
const getUserFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('following', 'name avatar xp');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.following);
    } catch (error) {
        console.error('Error fetching following:', error);
        res.status(500).json({ message: 'Failed to fetch following' });
    }
};

// @desc    Get leaderboard (sorted users)
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
    try {
        const sort = req.query.sort || 'xp';
        const validSorts = ['xp', 'coins', 'level'];
        const sortField = validSorts.includes(sort) ? sort : 'xp';

        const users = await User.find({})
            .select('name username avatar xp coins level tasksCompleted rankChange')
            .sort({ [sortField]: -1 })
            .limit(50);

        res.json(users);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
};

module.exports = {
    getUsers,
    searchUsers,
    getUserById,
    getProfile,
    updateUserProfile,
    changePassword,
    deleteAccount,
    followUser,
    unfollowUser,
    acceptFollowRequest,
    rejectFollowRequest,
    getUserFollowers,
    getUserFollowing,
    getLeaderboard
};
