const mongoose = require('mongoose');
const User = require('../models/User');
const Migration = require('../models/Migration');
require('dotenv').config();

const MIGRATION_NAME = 'add_user_social_features_v2_2025';

async function migrateUsers() {
    try {
        // Only connect if not already connected (when running as script)
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('✅ Connected to MongoDB');
        }

        // Check if migration already applied
        const existingMigration = await Migration.findOne({ name: MIGRATION_NAME });
        if (existingMigration) {
            // console.log(`✅ Migration "${MIGRATION_NAME}" already applied on ${existingMigration.appliedAt}`);
            return { alreadyApplied: true };
        }

        const users = await User.find({});
        console.log(`📊 Found ${users.length} users to migrate`);

        let updatedCount = 0;

        for (const user of users) {
            let needsUpdate = false;

            // Check if user needs social features
            if (!user.followers) {
                user.followers = [];
                needsUpdate = true;
            }
            if (!user.following) {
                user.following = [];
                needsUpdate = true;
            }
            if (!user.followRequests) {
                user.followRequests = [];
                needsUpdate = true;
            }
            if (user.isPrivate === undefined) {
                user.isPrivate = false;
                needsUpdate = true;
            }
            if (!user.socials) {
                user.socials = {};
                needsUpdate = true;
            }
            if (!user.work) {
                user.work = [];
                needsUpdate = true;
            }
            if (!user.education) {
                user.education = [];
                needsUpdate = true;
            }
            if (!user.bio) {
                user.bio = '';
                needsUpdate = true;
            }
            if (user.xp === undefined) {
                user.xp = 0;
                needsUpdate = true;
            }
            if (user.coins === undefined) {
                user.coins = 0;
                needsUpdate = true;
            }
            if (!user.avatar || user.avatar === '') {
                user.avatar = `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(user.email)}&mouth=smile,laughing,smirk`;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await user.save();
                console.log(`✅ Updated user: ${user.name} (${user.email})`);
                updatedCount++;
            }
        }

        // Mark migration as complete
        await Migration.create({
            name: MIGRATION_NAME,
            appliedAt: new Date()
        });

        console.log(`\n🎉 Migration complete!`);
        console.log(`📈 Updated ${updatedCount} users`);
        console.log(`✅ Migration "${MIGRATION_NAME}" marked as applied`);

        return { success: true, updatedCount };
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateUsers();
}

module.exports = migrateUsers;
