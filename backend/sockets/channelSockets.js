'use strict';

const jwt = require('jsonwebtoken');
const { User, Channel, Message } = require('../models');

const channelRoom = (channelId) => `channel:${channelId}`;

const parseChannelId = (value) => {
  const channelId = Number(value);
  return Number.isSafeInteger(channelId) && channelId > 0 ? channelId : null;
};

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token;
      if (!token) {
        token = socket.handshake.headers.authorization?.split(' ')[1];
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user || user._deleted) {
        return next(new Error('Authentication failed'));
      }

      socket.user = {
        id: user.id,
        username: user.username,
        nickname: user.nickname
      };
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const acknowledge = (callback, result) => {
      if (typeof callback === 'function') callback(result);
    };

    const findMemberChannel = async (channelIdValue) => {
      const channelId = parseChannelId(channelIdValue);
      if (!channelId) throw new Error('Invalid channel ID');

      const channel = await Channel.findByPk(channelId);
      if (!channel) throw new Error('Channel not found');
      if (!(await channel.hasUser(socket.user.id))) {
        throw new Error('You are not a member of this channel');
      }

      return channel;
    };

    socket.on('channel:join', async (payload = {}, callback) => {
      try {
        const channel = await findMemberChannel(payload.channelId);
        await socket.join(channelRoom(channel.id));
        acknowledge(callback, { ok: true, channelId: channel.id });
      } catch (error) {
        acknowledge(callback, { ok: false, error: error.message });
      }
    });

    socket.on('channel:leave', async (payload = {}, callback) => {
      const channelId = parseChannelId(payload.channelId);
      if (!channelId) {
        acknowledge(callback, { ok: false, error: 'Invalid channel ID' });
        return;
      }

      await socket.leave(channelRoom(channelId));
      acknowledge(callback, { ok: true, channelId });
    });

    socket.on('message:send', async (payload = {}, callback) => {
      try {
        const channel = await findMemberChannel(payload.channelId);
        const body = typeof payload.body === 'string' ? payload.body.trim() : '';

        if (!body || body.length > 255) {
          throw new Error('Message must be between 1 and 255 characters');
        }

        const message = await Message.create({
          channel_id: channel.id,
          user_id: socket.user.id,
          body,
          file: false
        });

        const messagePayload = {
          id: message.id,
          channel_id: message.channel_id,
          user_id: message.user_id,
          body: message.body,
          file: message.file,
          createdAt: message.createdAt,
          user: socket.user
        };

        io.to(channelRoom(channel.id)).emit('message:new', messagePayload);
        acknowledge(callback, { ok: true, message: messagePayload });
      } catch (error) {
        acknowledge(callback, { ok: false, error: error.message });
      }
    });
  });
};