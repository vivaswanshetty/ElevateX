const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
// const mongoSanitize = require('express-mongo-sanitize'); // incompatible with Express 5 (req.query is read-only)
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');
// const runMigrations = require('./scripts/migrateUsers');

dotenv.config();

// Connect to DB and run migrations
connectDB().then(() => {
    console.log('✅ Database connected');
    // Skip migrations for now
    // runMigrations()
    //     .then((result) => {
    //         if (result.alreadyApplied) {
    //             console.log('✅ All migrations up to date');
    //         } else {
    //             console.log(`✅ Migrations completed: ${result.updatedCount} users updated`);
    //         }
    //     })
    //     .catch((error) => {
    //         console.error('⚠️  Migration error:', error.message);
    //         console.log('Server will continue running...');
    //     });
});

const http = require('http');
const socketUtils = require('./utils/socketUtils');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketUtils.init(server);

// Enable trust proxy for Render/Vercel (required for rate limiting behind a proxy)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// CORS configuration — allowed origins from env or defaults
const allowedOrigins = (process.env.CORS_ORIGINS || 'https://elevatex-one.vercel.app,http://localhost:5173,http://localhost:3000').split(',').map(s => s.trim());
const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body parsing middleware — limit payload sizes to prevent abuse
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// Serve static uploads
const path = require('path');
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, 'uploads')));

// Sanitize data to prevent NoSQL injection
// app.use(mongoSanitize()); // disabled — incompatible with Express 5

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
app.use('/api/payments', require('./routes/paymentRoutes'));
// app.use('/api/matches', require('./routes/matchRoutes'));
// app.use('/api/alchemy', require('./routes/alchemyRoutes'));
app.use('/api/waitlist', require('./routes/waitlistRoutes'));
// app.use('/api/seasons', require('./routes/seasonRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'ElevateX API is running',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Global error handler — never leak stack traces in production
app.use((err, req, res, next) => {
    console.error('Error:', err);
    const isProd = process.env.NODE_ENV === 'production';
    res.status(err.status || 500).json({
        success: false,
        message: isProd ? 'Internal server error' : (err.message || 'Internal server error'),
        ...(isProd ? {} : { error: err.toString(), stack: err.stack }),
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

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Email service: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}`);
});
