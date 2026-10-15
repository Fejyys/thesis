const http = require('http');
const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const channelRoutes = require('./routes/channelRoutes');
const messageRoutes = require('./routes/messageRoutes');
const relationRoutes = require('./routes/relationRoutes');
const { Server } = require('socket.io');
const configureChannelSockets = require('./sockets/channelSockets');

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