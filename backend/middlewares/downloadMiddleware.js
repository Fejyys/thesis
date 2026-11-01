const { Channel, Message } = require('../models');
module.exports = async (req, res, next) => {
    const message = await Message.findByPk(req.params.messageId);
    if (!message) {
        return res.status(404).json({ message: 'Message not found' });
    }
    if (!message.file) {
        return res.status(404).json({ message: 'File not found' });
    }

    const channel = await Channel.findByPk(message.channel_id);
    if (!channel) {
        return res.status(404).json({ message: 'Channel not found' });
    }
    if (!req.user._admin && !(await channel.hasUser(req.user.id))) {
        return res.status(403).json({ message: 'You are not authorized to download files from this channel' });
    }
    res.locals.message = message;
    next();
};