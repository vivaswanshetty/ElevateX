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
    getPostById
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, createPost).get(getPosts);
router.get('/feed', protect, getFeed);
router.get('/interactions', protect, getUserInteractions);
router.get('/user/:userId', getUserPosts);
router.put('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);
router.route('/:id').get(getPostById).delete(protect, deletePost);

module.exports = router;
