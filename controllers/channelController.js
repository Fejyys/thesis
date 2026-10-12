'use strict';

const jwt = require('jsonwebtoken');
const { UniqueConstraintError } = require('sequelize');
const { Channel, User, sequelize } = require('../models');
require('dotenv').config();
const inviteIssuer = 'thesis-api';
const inviteAudience = 'channel-invite';
const inviteTtl = process.env.INVITE_TOKEN_TTL || '7d';

const parseId = (value) => {
	if (typeof value !== 'number' && (typeof value !== 'string' || !/^[1-9]\d*$/.test(value))) {
		return null;
	}
	const id = Number(value);
	return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const getInviteSecret = (res) => {
	const secret = process.env.INVITE_JWT_SECRET;
	if (!secret) {
		res.status(503).json({ message: 'Invite service is not configured' });
		return null;
	}
	return secret;
};

const findChannel = async (value, res) => {
	const channelId = parseId(value);
	if (!channelId) {
		res.status(400).json({ message: 'Invalid channel ID' });
		return null;
	}

	const channel = await Channel.findByPk(channelId);
	if (!channel) {
		res.status(404).json({ message: 'Channel not found' });
		return null;
	}
	return channel;
};

const isChannelOwner = (channel, user) => Number(channel.admin_id) === Number(user.id);

const requireOwner = async (req, res) => {
	const channel = await findChannel(req.params.id, res);
	if (!channel) return null;
	if (!isChannelOwner(channel, req.user)) {
		res.status(403).json({ message: 'Only the channel owner can perform this action' });
		return null;
	}
	return channel;
};


exports.getAllChannels = async (req, res) => {
    const user = req.user;
    const channels = user._admin ? await Channel.findAll() : await user.getChannels();
    res.json(channels);
}

exports.getChannelByID = async (req, res) => {
	const channel = await findChannel(req.params.id, res);
	if (!channel) return res.status(404).json({message: 'Channel not found'});

	if (!req.user._admin && !(await channel.hasUser(req.user.id))) {
		return res.status(403).json({ message: 'You are not a member of this channel' });
	}
	res.json(channel);
};

exports.createChannel = async (req, res) => {
	const name = typeof (req.body || {}).name === 'string' ? req.body.name.trim() : '';
	const participants = req.participants;
	if (!name || name.length > 100) {
		return res.status(400).json({ message: 'Channel name must be between 1 and 100 characters' });
	}

	const channel = await sequelize.transaction(async t => {
		const createdChannel = await Channel.create(
			{ name, admin_id: req.user.id },
			{ transaction: t }
		);
		await createdChannel.addUser(req.user, { transaction: t });
		for (const participant in participants) {
			let user = User.findByPk(participant)
			if(user)
			{
				await createdChannel.addUser(user, { transaction: t});
			}
			
		}
		return createdChannel;
	});
	res.status(201).json(channel);
};

exports.updateChannel = async (req, res) => {
	const channel = await requireOwner(req, res);
	if (!channel) return;

	const name = typeof (req.body || {}).name === 'string' ? req.body.name.trim() : '';
	if (!name || name.length > 100) {
		return res.status(400).json({ message: 'Channel name must be between 1 and 100 characters' });
	}

	await channel.update({ name });
	res.json(channel);
};

exports.deleteChannel = async (req, res) => {
	const channel = await requireOwner(req, res);
	if (!channel) return;
	await channel.destroy();
	res.json({ message: 'Channel deleted successfully' });
};

exports.getChannelMembers = async (req, res) => {
	const channel = await findChannel(req.params.id, res);
	if (!channel) return;
	if (!req.user._admin && !(await channel.hasUser(req.user.id))) {
		return res.status(403).json({ message: 'You are not a member of this channel' });
	}

	const members = await channel.getUsers({
		attributes: ['id', 'username', 'nickname', 'status']
	});
	res.json(members);
};

exports.removeChannelMember = async (req, res) => {
	const channel = await requireOwner(req, res);
	if (!channel) return;

	const userId = parseId(req.params.userId);
	if (!userId) return res.status(400).json({ message: 'Invalid user ID' });
	if (userId === Number(channel.admin_id)) {
		return res.status(400).json({ message: 'The channel owner cannot be removed' });
	}
	if (!(await channel.hasUser(userId))) {
		return res.status(404).json({ message: 'Channel member not found' });
	}

	await channel.removeUser(userId);
	res.json({ message: 'Channel member removed successfully' });
};

exports.leaveChannel = async (req, res) => {
	const channel = await findChannel(req.params.id, res);
	if (!channel) return;
	if (isChannelOwner(channel, req.user)) {
		return res.status(409).json({ message: 'Transfer channel ownership before leaving' });
	}
	if (!(await channel.hasUser(req.user.id))) {
		return res.status(404).json({ message: 'Channel membership not found' });
	}

	await channel.removeUser(req.user);
	res.json({ message: 'You left the channel' });
};

exports.transferChannelOwnership = async (req, res) => {
	const channel = await requireOwner(req, res);
	if (!channel) return;

	const newOwnerId = parseId((req.body || {}).userId);
	if (!newOwnerId) return res.status(400).json({ message: 'Invalid user ID' });
	if (!(await channel.hasUser(newOwnerId))) {
		return res.status(400).json({ message: 'New owner must be a channel member' });
	}

	const newOwner = await User.findByPk(newOwnerId);
	if (!newOwner || newOwner._deleted) {
		return res.status(404).json({ message: 'User not found' });
	}

	await channel.update({ admin_id: newOwnerId });
	res.json(channel);
};

exports.createInvite = async (req, res) => {
	const channel = await requireOwner(req, res);
	if (!channel) return;

	const secret = getInviteSecret(res);
	if (!secret) return;

	const token = jwt.sign(
		{ channelId: channel.id, purpose: 'channel-invite' },
		secret,
		{
			algorithm: 'HS256',
			expiresIn: inviteTtl,
			issuer: inviteIssuer,
			audience: inviteAudience
		}
	);
	const claims = jwt.decode(token);
	res.status(201).json({ token, expiresAt: new Date(claims.exp * 1000).toISOString() });
};

exports.acceptInvite = async (req, res) => {
	if (req.user._deleted) {
		return res.status(403).json({ message: 'Deleted accounts cannot join channels' });
	}
	const token = typeof (req.body || {}).token === 'string' ? req.body.token : '';
	if (!token) return res.status(400).json({ message: 'Invite token is required' });

	const secret = getInviteSecret(res);
	if (!secret) return;

	let claims;
	try {
		claims = jwt.verify(token, secret, {
			algorithms: ['HS256'],
			issuer: inviteIssuer,
			audience: inviteAudience
		});
	} catch (error) {
		return res.status(400).json({ message: 'Invite token is invalid or expired' });
	}

	const channelId = claims.purpose === 'channel-invite' ? parseId(claims.channelId) : null;
	if (!channelId) return res.status(400).json({ message: 'Invite token is invalid' });

	const channel = await Channel.findByPk(channelId);
	if (!channel) return res.status(404).json({ message: 'Channel not found' });
	if (!(await channel.hasUser(req.user.id))) {
		try {
			await channel.addUser(req.user);
		} catch (error) {
			if (!(error instanceof UniqueConstraintError)) throw error;
		}
	}

	res.json({ message: 'You joined the channel', channel: { id: channel.id, name: channel.name } });
};
