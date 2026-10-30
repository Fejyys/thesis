const http = require('http');
const express = require('express');
require('dotenv').config();
const app = express();
const configuredFrontendOrigins = (process.env.FRONTEND_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const channelRoutes = require('./routes/channelRoutes');
const messageRoutes = require('./routes/messageRoutes');
const relationRoutes = require('./routes/relationRoutes');
const { Server } = require('socket.io');
const configureChannelSockets = require('./sockets/channelSockets');

app.use((req, res, next) => {
    const origin = req.get('Origin');
    if (!origin) return next();

    let frontendUrl;
    try {
        frontendUrl = new URL(origin);
    } catch {
        return res.status(403).json({ message: 'Origin not allowed' });
    }

    const isLocalDevelopmentOrigin =
        ['http:', 'https:'].includes(frontendUrl.protocol) &&
        ['localhost', '127.0.0.1', '[::1]'].includes(frontendUrl.hostname);
    if (!isLocalDevelopmentOrigin && !configuredFrontendOrigins.includes(origin)) {
        return res.status(403).json({ message: 'Origin not allowed' });
    }

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/channels', channelRoutes);
app.use('/messages', messageRoutes);
app.use('/relations', relationRoutes);
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
}
);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
}
);
app.set('port', process.env.PORT || 3000);
const server = http.createServer(app);
const io = new Server(server);
configureChannelSockets(io);
server.listen(app.get('port'));
console.log("Server started successfully on port" + app.get('port') + "!");