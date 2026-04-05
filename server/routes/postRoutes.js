const express = require('express');
const {
    createPost,
    getPosts,
    getFeed,
    getUserPosts,
    likePost,
    addComment,
    deletePost,
    getUserInteractions,
    deleteComment,
    getPostById,
    getPostLikes
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { postValidation, commentValidation, mongoIdParam, validate } = require('../middleware/validation');
const { writeLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.route('/')
    .post(protect, uploadLimiter, upload.single('image'), postValidation, validate, createPost)
    .get(getPosts);
router.get('/feed', protect, getFeed);
router.get('/interactions', protect, getUserInteractions);
router.get('/user/:userId', getUserPosts);
router.get('/:id/likes', mongoIdParam(), validate, getPostLikes);
router.put('/:id/like', protect, writeLimiter, mongoIdParam(), validate, likePost);
router.post('/:id/comment', protect, writeLimiter, mongoIdParam(), validate, commentValidation, validate, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);
router.route('/:id').get(mongoIdParam(), validate, getPostById).delete(protect, mongoIdParam(), validate, deletePost);

module.exports = router;
