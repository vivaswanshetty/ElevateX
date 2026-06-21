const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Activity = require('../models/Activity');
const Follow = require('../models/Follow');
const Transaction = require('../models/Transaction');
require('dotenv').config();

const identifier = process.argv[2];

if (!identifier) {
    console.log('\n❌ Error: Please provide an email, username, or pass "--all" to delete.');
    console.log('\nUsage:');
    console.log('  node scripts/deleteUser.js <email_or_username>');
    console.log('  node scripts/deleteUser.js --all\n');
    process.exit(1);
}

async function run() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected successfully.');

        if (identifier === '--all') {
            const count = await User.countDocuments();
            console.log(`\n⚠️ WARNING: You are about to delete ALL ${count} users in the database.`);
            console.log('Deleting users in 5 seconds... Press Ctrl+C to cancel.');
            await new Promise(resolve => setTimeout(resolve, 5000));

            const userRes = await User.deleteMany({});
            const postRes = await Post.deleteMany({});
            const activityRes = await Activity.deleteMany({});
            const followRes = await Follow.deleteMany({});
            const txRes = await Transaction.deleteMany({});

            console.log('\n💥 Cleaned database:');
            console.log(`- Deleted ${userRes.deletedCount} users.`);
            console.log(`- Deleted ${postRes.deletedCount} posts.`);
            console.log(`- Deleted ${activityRes.deletedCount} activities.`);
            console.log(`- Deleted ${followRes.deletedCount} follow relationships.`);
            console.log(`- Deleted ${txRes.deletedCount} transactions.`);
        } else {
            // Find user by email or username
            const query = identifier.trim();
            const user = await User.findOne({
                $or: [
                    { email: query.toLowerCase() },
                    { username: { $regex: new RegExp(`^${query}$`, 'i') } }
                ]
            });

            if (!user) {
                console.log(`❌ User not found with email or username: "${identifier}"`);
                process.exit(1);
            }

            console.log(`\n👤 Found user: ${user.name} (${user.email}) [ID: ${user._id}]`);
            console.log('Deleting user and their associated data...');

            const userId = user._id;

            // Delete user's posts
            const postsDeleted = await Post.deleteMany({ author: userId });
            
            // Delete user's activities (both actor and recipient)
            const activitiesDeleted = await Activity.deleteMany({
                $or: [{ actor: userId }, { recipient: userId }]
            });

            // Delete follow relationships
            const followsDeleted = await Follow.deleteMany({
                $or: [{ follower: userId }, { following: userId }]
            });

            // Delete transactions
            const txDeleted = await Transaction.deleteMany({ user: userId });

            // Delete user document
            await User.deleteOne({ _id: userId });

            console.log('\n✅ Deletion complete:');
            console.log(`- Deleted user account.`);
            console.log(`- Deleted ${postsDeleted.deletedCount} posts.`);
            console.log(`- Deleted ${activitiesDeleted.deletedCount} activities.`);
            console.log(`- Deleted ${followsDeleted.deletedCount} follow records.`);
            console.log(`- Deleted ${txDeleted.deletedCount} transactions.`);
        }

        mongoose.connection.close();
        console.log('\n👋 Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during deletion:', error);
        process.exit(1);
    }
}

run();
