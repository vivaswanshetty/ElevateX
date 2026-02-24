const { Server } = require('socket.io');

let io;

const init = (server) => {
    io = new Server(server, {
        cors: {
            origin: function (origin, callback) {
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin) return callback(null, true);

                // Allow localhost for development
                if (origin.includes('localhost')) return callback(null, true);

                // Allow any Vercel deployment
                if (origin.endsWith('.vercel.app')) return callback(null, true);

                // Allow explicit FRONTEND_URL if set
                if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
                    return callback(null, true);
                }

                const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
                return callback(new Error(msg), false);
            },
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        // Broadcast online count
        io.emit('online_users', io.engine.clientsCount);

        socket.on('join_user_room', (userId) => {
            if (userId) {
                socket.userId = userId; // Store userId on socket instance
                socket.join(userId);
                console.log(`👤 User ${userId} joined room ${userId}`);
            }
        });

        // ── Typing Indicators ──
        socket.on('typing', ({ recipientId, senderName }) => {
            // Emit to the recipient's room
            io.to(recipientId).emit('user_typing', { senderId: socket.userId, senderName });
        });

        socket.on('stop_typing', ({ recipientId }) => {
            io.to(recipientId).emit('user_stop_typing', { senderId: socket.userId });
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
            io.emit('online_users', io.engine.clientsCount);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = {
    init,
    getIO
};
