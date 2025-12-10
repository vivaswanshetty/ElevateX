const mongoose = require('mongoose');
const User = require('../models/User');
const Migration = require('../models/Migration');
require('dotenv').config({ path: '../.env' }); // Adjust path to env if valid, otherwise assumes PWD

const MIGRATION_NAME = 'update_avatars_to_bottts_2025';

async function migrateAvatars() {
    try {
        // Only connect if not already connected
        if (mongoose.connection.readyState === 0) {
            console.log('Connecting to MongoDB...');
            // Try to load env from parent dir if not found (since script is in scripts/)
            if (!process.env.MONGO_URI) {
                require('dotenv').config({ path: __dirname + '/../.env' });
            }
            await mongoose.connect(process.env.MONGO_URI);
            console.log('✅ Connected to MongoDB');
        }

        // Check if migration already applied
        const existingMigration = await Migration.findOne({ name: MIGRATION_NAME });
        if (existingMigration) {
            console.log(`✅ Migration "${MIGRATION_NAME}" already applied on ${existingMigration.appliedAt}`);
            // return { alreadyApplied: true }; // Commented out to force run if user wants to re-run manually or we can remove the check. 
            // Ideally migrations run once. But for this specific task, let's allow it to run logic but just log if migration record exists.
        }

        const users = await User.find({});
        console.log(`📊 Found ${users.length} users to check`);

        let updatedCount = 0;

        for (const user of users) {
            let needsUpdate = false;

            // Check if avatar is from dicebear (old style or any dicebear)
            // We want to force update to bottts if it's a dicebear avatar, or if it's missing
            if (!user.avatar || user.avatar.includes('api.dicebear.com')) {
                const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`;

                // Only update if it's actually different
                if (user.avatar !== newAvatar) {
                    user.avatar = newAvatar;
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await user.save();
                process.stdout.write('.'); // Progress indicator
                updatedCount++;
            }
        }

        console.log('\n');

        if (updatedCount > 0) {
            // Record migration if we actually did something and it exists
            if (!existingMigration) {
                await Migration.create({
                    name: MIGRATION_NAME,
                    appliedAt: new Date()
                });
            }
        }

        console.log(`\n🎉 Migration complete!`);
        console.log(`📈 Updated ${updatedCount} users to new Bottts avatars`);

        return { success: true, updatedCount };

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
        }
    }
}

// Run if called directly
if (require.main === module) {
    migrateAvatars();
}

module.exports = migrateAvatars;
