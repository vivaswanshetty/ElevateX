const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('❌ MONGO_URI is not defined in server/.env');
            process.exit(1);
        }

        // Hook up connection monitoring event listeners
        mongoose.connection.on('error', (err) => {
            console.error(`❌ Mongoose connection error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ Mongoose disconnected from MongoDB');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ Mongoose reconnected to MongoDB');
        });

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);

        if (error.message.includes('authentication failed')) {
            console.error('\n🔎 Troubleshooting authentication:');
            console.error('1. Check your database username and password in server/.env');
            console.error("2. Ensure your password doesn't have special characters like @, :, or # unencoded.");
            console.error('   (e.g., replace @ with %40, : with %3A)');
            console.error('3. Make sure you are using a Database User, not your Atlas login email.');
            console.error('4. Check if your current IP is whitelisted in Atlas (Network Access).\n');
        }

        process.exit(1);
    }
};

module.exports = connectDB;
