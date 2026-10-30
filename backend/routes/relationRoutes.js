const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const relationController = require('../controllers/relationController');

router.use(authMiddleware);

router.get('/', relationController.getAllRelations);

router.post('/:id/friend', relationController.addFriend);
router.delete('/:id/friend', relationController.removeFriend);

router.post('/:id/block', relationController.blockUser);
router.delete('/:id/block', relationController.unblockUser);

module.exports = router;