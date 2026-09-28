const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const channelController = require('../controllers/channelController');

router.use(authMiddleware);

router.get('/', channelController.getAllChannels);
router.post('/', channelController.createChannel);

router.post('/invites/accept', channelController.acceptInvite);
router.get('/:id', channelController.getChannelByID);
router.put('/:id', channelController.updateChannel);
router.delete('/:id', channelController.deleteChannel);

router.get('/:id/members', channelController.getChannelMembers);
router.delete('/:id/members/:userId', channelController.removeChannelMember);
router.delete('/:id/membership', channelController.leaveChannel);
router.patch('/:id/owner', channelController.transferChannelOwnership);
router.post('/:id/invites', channelController.createInvite);

module.exports = router;