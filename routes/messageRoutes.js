const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const messageController = require('../controllers/messageController');

router.use(authMiddleware);

router.get('/', messageController.getMessages);

router.post('/:id/file', messageController.createFileMessage);
router.put('/:id/:messageId', messageController.updateMessage);
router.delete('/:id/:messageId', messageController.deleteMessage);
router.post('/:id', messageController.createTextMessage);
router.get('/:id', messageController.getMessagesByChannel);

router.use(adminMiddleware);
router.get('/user/:id', messageController.getMessagesByUser);

module.exports = router;