'use strict'


const { Channel, User, Message } = require('../models')
const multer = require('multer');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    }
    
});
const upload = multer({ storage: storage });


exports.getMessages = async (req, res) => {
    let user = req.user;
    let messages = user._admin ? await Message.findAll() : await user.getMessages();
    res.status(200).json(messages);
}

exports.createTextMessage = async (req, res) => {
    let channel = await Channel.findByPk(req.params.id);
    if (!channel) {
        return res.status(404).json({ message: 'Channel not found' });
    }
    if (!req.user._admin && !(await channel.hasUser(req.user.id))) {
        return res.status(403).json({ message: 'You are not a member of this channel' });
    }
    let content = typeof (req.body || {}).content === 'string' ? req.body.content.trim() : '';
    if (!content || content.length > 1000) {
        return res.status(400).json({ message: 'Message content must be between 1 and 1000 characters' });
    }
    let message = await Message.create({user_id: req.user.id, channel_id: channel.id, body: content});
    res.status(201).json(message);
}
exports.createFileMessage = async (req, res) => {
    let channel = await Channel.findByPk(req.params.id);
    if (!channel) {
        return res.status(404).json({ message: 'Channel not found' });
    }
    if (!req.user._admin && !(await channel.hasUser(req.user.id))) {
        return res.status(403).json({ message: 'You are not a member of this channel' });
    }
    upload.single('file')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: 'File upload error' });
        } else if (err) {
            return res.status(500).json({ message: 'Unknown error occurred during file upload' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const ext = path.extname(req.file.originalname);

        let message = await Message.create({user_id: req.user.id, channel_id: channel.id, body: finalPath, file: true});
        let finalFileName = crypto.hash('sha256').update(message.id.toString()).digest('hex') + ext;
        const finalPath = path.join('uploads', finalFileName);
        message.body = finalPath;
        await message.save();
        res.status(201).json(message);
    });
}

exports.getMessagesByChannel = async (req, res) => {
    let channel = await Channel.findByPk(req.params.id);
    if (!channel) {
        return res.status(404).json({ message: 'Channel not found' });
    }
    if (!req.user._admin && !(await channel.hasUser(req.user.id))) {
        return res.status(403).json({ message: 'You are not a member of this channel' });
    }
    let messages = await channel.getMessages();
    res.status(200).json(messages);
}

exports.updateMessage = async (req, res) => {
    let channel = await Channel.findByPk(req.params.id);
    if (!channel) {
        return res.status(404).json({ message: 'Channel not found' });
    }
    if (!req.user._admin && !(await channel.hasUser(req.user.id))) {
        return res.status(403).json({ message: 'You are not a member of this channel' });
    }
    let message = await Message.findByPk(req.params.messageId);
    if (!message) {
        return res.status(404).json({ message: 'Message not found' });
    }
    if (message.channel_id !== channel.id) {
        return res.status(400).json({ message: 'Message does not belong to this channel' });
    }
    if (!req.user._admin && message.user_id !== req.user.id) {
        return res.status(403).json({ message: 'You are not the owner of this message' });
    }
    let content = typeof (req.body || {}).content === 'string' ? req.body.content.trim() : '';
    if (!content || content.length > 1000) {
        return res.status(400).json({ message: 'Message content must be between 1 and 1000 characters' });
    }
    await message.update({ body: content });
    res.status(200).json(message);

}

exports.deleteMessage = async (req, res) => {
    let channel = await Channel.findByPk(req.params.id);
    if (!channel) {
        return res.status(404).json({ message: 'Channel not found' });
    }
    if (!req.user._admin && !(await channel.hasUser(req.user.id))) {
        return res.status(403).json({ message: 'You are not a member of this channel' });
    }
    let message = await Message.findByPk(req.params.messageId);
    if (!message) {
        return res.status(404).json({ message: 'Message not found' });
    }
    if (!req.user._admin && message.user_id !== req.user.id) {
        return res.status(403).json({ message: 'You are not the owner of this message' });
    }
    await message.destroy();
    res.status(200).json({ message: 'Message deleted successfully' });

}

exports.getMessagesByUser = async (req, res) => {
    let user = await User.findByPk(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    let messages = await user.getMessages();
    res.status(200).json(messages);
}
