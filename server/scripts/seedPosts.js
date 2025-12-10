const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Post = require('../models/Post');
const User = require('../models/User');
const Activity = require('../models/Activity');

dotenv.config({ path: path.join(__dirname, '../.env') });

const DEMO_POSTS = [
    {
        content: "Just completed my first 30-day coding challenge! 🚀 Learned so much about consistency and discipline. Who else is working on their programming skills?",
        likes: []
    },
    {
        content: "Morning productivity tip: Start your day with the hardest task. Everything else feels easier after that! ☀️💪 #ProductivityHacks",
        likes: []
    },
    {
        content: "Excited to announce I'm starting a new project using React and Node.js! Looking for collaborators who are interested in building something awesome together. 💻✨",
        likes: []
    },
    {
        content: "Just hit 100 tasks completed on ElevateX! 🎉 This platform has completely transformed how I manage my daily goals. Thank you to everyone who's been part of this journey!",
        likes: []
    },
    {
        content: "Quick question: What's your favorite productivity tool? I'm currently using Notion and ElevateX, but always looking for new recommendations! 🤔",
        likes: []
    },
    {
        content: "Reminder: Taking breaks is just as important as working hard. Don't forget to rest, hydrate, and take care of yourself! 💙🌿 #SelfCare",
        likes: []
    },
    {
        content: "Just finished reading 'Atomic Habits' by James Clear. Absolutely life-changing! 📚 The 1% improvement concept is so powerful. Anyone else read this?",
        likes: []
    },
    {
        content: "Challenge accepted! 💪 Planning to complete 5 tasks before noon today. Who wants to join me in this productivity sprint? Let's motivate each other!",
        likes: []
    },
    {
        content: "Loving the new productivity duel feature! Just challenged my friend to a study marathon. Competition really does bring out the best in us! ⚔️🔥",
        likes: []
    },
    {
        content: "Pro tip: Use the Pomodoro Technique (25 min work, 5 min break) to stay focused. Been using it for a week and my productivity has skyrocketed! ⏰",
        likes: []
    },
    {
        content: "Grateful for this amazing community! You all inspire me every day to be better and do better. Let's keep elevating together! 🙌❤️ #ElevateX",
        likes: []
    },
    {
        content: "Weekend goals: Finish 3 online courses, work on my side project, and get some exercise. What are your weekend productivity goals? 🎯",
        likes: []
    }
];

const seedPosts = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📦 Connected to MongoDB');

        // Get all users
        const users = await User.find({}).limit(10);

        if (users.length === 0) {
            console.log('⚠️  No users found. Please create some users first.');
            process.exit(1);
        }

        console.log(`Found ${users.length} users`);

        // Check if posts already exist
        const existingPosts = await Post.countDocuments();
        if (existingPosts > 0) {
            console.log(`⚠️  ${existingPosts} posts already exist.`);
            console.log('🗑️  Deleting all existing posts to re-seed...');
            await Post.deleteMany({});
            await createPosts(users);
        } else {
            await createPosts(users);
        }

    } catch (error) {
        console.error('❌ Error seeding posts:', error);
        process.exit(1);
    }
};

const createPosts = async (users) => {
    try {
        // Clear existing activities first
        await Activity.deleteMany({});
        console.log('🗑️  Cleared existing activities');

        // Create posts with random authors
        const posts = DEMO_POSTS.map((postData, index) => ({
            ...postData,
            author: users[index % users.length]._id,
            likes: [] // We'll add likes separately to create activities
        }));

        const createdPosts = await Post.insertMany(posts);
        console.log(`✅ Successfully created ${createdPosts.length} demo posts!`);

        // Add likes and create activities
        for (const post of createdPosts) {
            // Randomly add some likes
            const numLikes = Math.floor(Math.random() * 5);
            const likers = users
                .filter(u => u._id.toString() !== post.author.toString()) // Don't like own post
                .sort(() => 0.5 - Math.random())
                .slice(0, numLikes);

            for (const liker of likers) {
                post.likes.push(liker._id);

                // Create activity
                await Activity.create({
                    recipient: post.author,
                    actor: liker._id,
                    type: 'like',
                    post: post._id,
                    read: false
                });
            }
            await post.save();
        }
        console.log('✅ Added likes and activities');

        // Add comments and create activities
        const postsWithComments = createdPosts.slice(0, 8); // More posts with comments

        for (const post of postsWithComments) {
            const numComments = Math.floor(Math.random() * 3) + 1;
            const commentTexts = [
                "This is so inspiring! 💪",
                "Great job! Keep it up! 🎉",
                "Thanks for sharing this!",
                "I totally agree with this! 👍",
                "This is exactly what I needed to hear today!",
                "Amazing work! 🔥",
                "Love this! Can't wait to try it myself!",
                "So true! Thanks for the reminder! ❤️"
            ];

            for (let i = 0; i < numComments; i++) {
                const randomUser = users.filter(u => u._id.toString() !== post.author.toString())[Math.floor(Math.random() * (users.length - 1))];

                if (randomUser) {
                    const text = commentTexts[Math.floor(Math.random() * commentTexts.length)];

                    post.comments.push({
                        user: randomUser._id,
                        text
                    });

                    // Create activity
                    await Activity.create({
                        recipient: post.author,
                        actor: randomUser._id,
                        type: 'comment',
                        post: post._id,
                        comment: text,
                        read: false
                    });
                }
            }
            await post.save();
        }

        console.log(`✅ Added comments and activities to ${postsWithComments.length} posts!`);
        console.log('\n🎉 Seeding completed successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating posts:', error);
        process.exit(1);
    }
};

// Run the seeder
seedPosts();
