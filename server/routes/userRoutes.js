const express = require('express');
const { getUsers, searchUsers, getUserById, getProfile, updateUserProfile, changePassword, deleteAccount, followUser, unfollowUser, acceptFollowRequest, rejectFollowRequest, getUserFollowers, getUserFollowing, getLeaderboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { avatarUpload } = require('../middleware/cloudinaryUpload');
const { profileUpdateValidation, searchValidation, changePasswordValidation, mongoIdParam, validate } = require('../middleware/validation');
const { writeLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.route('/profile')
    .get(protect, getProfile)
    .put(protect, uploadLimiter, ...avatarUpload, profileUpdateValidation, validate, updateUserProfile);
router.put('/password', protect, writeLimiter, changePasswordValidation, validate, changePassword);
router.delete('/account', protect, writeLimiter, deleteAccount);

router.get('/', getUsers);
router.get('/search', searchValidation, validate, searchUsers);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', mongoIdParam(), validate, getUserById);
router.get('/:id/followers', mongoIdParam(), validate, getUserFollowers);
router.get('/:id/following', mongoIdParam(), validate, getUserFollowing);
router.put('/:id/follow', protect, writeLimiter, mongoIdParam(), validate, followUser);
router.put('/:id/unfollow', protect, writeLimiter, mongoIdParam(), validate, unfollowUser);
router.put('/:id/accept-request', protect, mongoIdParam(), validate, acceptFollowRequest);
router.put('/:id/reject-request', protect, mongoIdParam(), validate, rejectFollowRequest);

module.exports = router;
