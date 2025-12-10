const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');
const runMigrations = require('./scripts/migrateUsers');

dotenv.config();

// Connect to DB and run migrations
connectDB().then(() => {
    console.log('🔄 Running database migrations...');
    runMigrations()
        .then((result) => {
            if (result.alreadyApplied) {
                console.log('✅ All migrations up to date');
            } else {
                console.log(`✅ Migrations completed: ${result.updatedCount} users updated`);
            }
        })
        .catch((error) => {
            console.error('⚠️  Migration error:', error.message);
            console.log('Server will continue running...');
        });
});

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development; configure properly for production
    crossOriginEmbedderPolicy: false,
}));

// CORS configuration
// CORS configuration
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5174'
    ],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Sanitize data to prevent NoSQL injection
// app.use(mongoSanitize());

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/contact', contactRoutes);
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/duels', require('./routes/duelRoutes'));

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'ElevateX API is running',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Email service: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}`);
});
