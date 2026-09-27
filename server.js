const http = require('http');
const express = require('express');
const app = express();

app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
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
server.listen(3000);
console.log("Server started successfully!")