const express = require('express');
const { getUsers, searchUsers, getUserById, getProfile, updateUserProfile, changePassword, deleteAccount, followUser, unfollowUser, acceptFollowRequest, rejectFollowRequest, getUserFollowers, getUserFollowing, getLeaderboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/profile').get(protect, getProfile).put(protect, updateUserProfile);
router.put('/password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

router.get('/', getUsers);
router.get('/search', searchUsers);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', getUserById);
router.get('/:id/followers', getUserFollowers);
router.get('/:id/following', getUserFollowing);
router.put('/:id/follow', protect, followUser);
router.put('/:id/unfollow', protect, unfollowUser);
router.put('/:id/accept-request', protect, acceptFollowRequest);
router.put('/:id/reject-request', protect, rejectFollowRequest);

module.exports = router;
