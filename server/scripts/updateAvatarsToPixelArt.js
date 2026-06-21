const mongoose = require('mongoose');
const User = require('../models/User');
const Migration = require('../models/Migration');
require('dotenv').config({ path: '../.env' });

const MIGRATION_NAME = 'update_avatars_to_pixel_art_2025';

async function migrateAvatars() {
    try {
        if (mongoose.connection.readyState === 0) {
            console.log('Connecting to MongoDB...');
            if (!process.env.MONGO_URI) {
                require('dotenv').config({ path: __dirname + '/../.env' });
            }
            await mongoose.connect(process.env.MONGO_URI);
            console.log('✅ Connected to MongoDB');
        }

        const existingMigration = await Migration.findOne({ name: MIGRATION_NAME });
        if (existingMigration) {
            console.log(`✅ Migration "${MIGRATION_NAME}" already applied on ${existingMigration.appliedAt}`);
        }

        const users = await User.find({});
        console.log(`📊 Found ${users.length} users to check`);

        let updatedCount = 0;

        for (const user of users) {
            let needsUpdate = false;

            // Update if avatar contains dicebear
            if (!user.avatar || user.avatar.includes('api.dicebear.com')) {
                const newAvatar = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(user.email)}`;

                if (user.avatar !== newAvatar) {
                    user.avatar = newAvatar;
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await user.save();
                process.stdout.write('.');
                updatedCount++;
            }
        }

        console.log('\n');

        if (updatedCount > 0 && !existingMigration) {
            await Migration.create({
                name: MIGRATION_NAME,
                appliedAt: new Date()
            });
        }

        console.log(`\n🎉 Migration complete!`);
        console.log(`📈 Updated ${updatedCount} users to new Pixel Art avatars`);

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

if (require.main === module) {
    migrateAvatars();
}

module.exports = migrateAvatars;
