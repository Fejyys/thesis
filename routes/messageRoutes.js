const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const channelController = require('../controllers/channelController');

router.use(authMiddleware);

// TODO: Messages
// See All messages, see by channel, post new message, edit message, delete message

router.get('/')
module.exports = router;