'use strict'


const { Channel, User, Message } = require('../models')



exports.getMessages = async (req, res) => {
    let user = req.user;
    const messages = user.getMessages();
    res.status(200).json(messages);
}

exports.getMessagesByID = async (req, res) => {
    
}