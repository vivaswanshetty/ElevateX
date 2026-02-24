const Post = require('../models/Post');
const User = require('../models/User');
const { createActivity } = require('./activityController');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

        if (!content && !image) {
            return res.status(400).json({ message: 'Content or image is required' });
        }

        const post = await Post.create({
            author: req.user._id,
            content: content || ' ', // Allow image-only posts
            image: image || ''
        });

        const populatedPost = await Post.findById(post._id)
            .populate('author', 'name avatar');

        res.status(201).json(populatedPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post' });
    }
};

// @desc    Get all posts (feed)
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({})
            .populate('author', 'name avatar')
            .populate('comments.user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
};

// @desc    Get feed posts (from followed users)
// @route   GET /api/posts/feed
// @access  Private
const getFeed = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('following');

        // Include posts from followed users + own posts
        const posts = await Post.find({
            author: { $in: [...user.following, req.user._id] }
        })
            .populate('author', 'name avatar')
            .populate('comments.user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(posts);
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ message: 'Failed to fetch feed' });
    }
};

// @desc    Get user posts
// @route   GET /api/posts/user/:userId
// @access  Public
const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.params.userId })
            .populate('author', 'name avatar')
            .populate('comments.user', 'name avatar')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
};

// @desc    Like/Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const isLiked = post.likes.includes(req.user._id);

        if (isLiked) {
            // Unlike
            post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            // Like
            post.likes.push(req.user._id);

            // Create activity notification for post author
            await createActivity(post.author, req.user._id, 'like', { post: post._id });
        }

        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('author', 'name avatar')
            .populate('comments.user', 'name avatar');

        res.json(updatedPost);
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: 'Failed to like post' });
    }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({
            user: req.user._id,
            text
        });

        await post.save();

        // Create activity notification for post author
        await createActivity(post.author, req.user._id, 'comment', {
            post: post._id,
            comment: text
        });

        const updatedPost = await Post.findById(post._id)
            .populate('author', 'name avatar')
            .populate('comments.user', 'name avatar');

        res.json(updatedPost);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Failed to add comment' });
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Failed to delete post' });
    }
};

// @desc    Get posts liked or commented by user
// @route   GET /api/posts/interactions
// @access  Private
const getUserInteractions = async (req, res) => {
    try {
        const posts = await Post.find({
            $or: [
                { likes: req.user._id },
                { 'comments.user': req.user._id }
            ]
        })
            .populate('author', 'name avatar')
            .populate('comments.user', 'name avatar')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching user interactions:', error);
        res.status(500).json({ message: 'Failed to fetch interactions' });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/posts/:id/comment/:commentId
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this comment' });
        }

        post.comments.pull(req.params.commentId);
        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('author', 'name avatar')
            .populate('comments.user', 'name avatar');

        res.json(updatedPost);
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Failed to delete comment' });
    }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name avatar')
            .populate('comments.user', 'name avatar');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'Failed to fetch post' });
    }
};

// @desc    Get users who liked a post
// @route   GET /api/posts/:id/likes
// @access  Public
const getPostLikes = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('likes', 'name avatar xp');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post.likes);
    } catch (error) {
        console.error('Error fetching post likes:', error);
        res.status(500).json({ message: 'Failed to fetch likes' });
    }
};

module.exports = {
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
};
