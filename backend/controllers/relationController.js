const { Op } = require('sequelize');
const { UserUserRelation, User } = require('../models');

exports.getAllRelations = async (req, res) => {
    let user = req.user;
    let relations;
    if(user._admin) {
        relations = await UserUserRelation.findAll();
    } else {
        relations = await UserUserRelation.findAll({
            where: {
                [Op.or]: [
                    { user_id: req.user.id },
                    { related_user_id: req.user.id }
                ]
            }
        });
    }
    res.status(200).json(relations);
}


exports.addFriend = async (req, res) => {
    let related_user_id = req.params.id;
    let user = req.user;
    let relatedUser = await User.findByPk(related_user_id);
    if(!relatedUser) {
        return res.status(404).json({ message: 'Related user not found' });
    }
    let relation = await UserUserRelation.findOne({
        where: {
            user_id: user.id,
            related_user_id: relatedUser.id
        }
    });
    if(!relation) {
        relation = await UserUserRelation.create({
            user_id: user.id,
            related_user_id: relatedUser.id,
            relation_type: 'friend'
        });
        return res.status(201).json(relation);
    }
    if(relation.relation_type === 'blocked') {
        return res.status(400).json({ message: 'Cannot add a blocked user as a friend' });
    }
    else {
        return res.status(400).json({ message: 'Relation already exists' });
    }
}


exports.removeFriend = async (req, res) => {
    let related_user_id = req.params.id;
    let user = req.user;
    let relatedUser = await User.findByPk(related_user_id);
    if(!relatedUser) {
        return res.status(404).json({ message: 'Related user not found' });
    }
    let relation = await UserUserRelation.findOne({
        where: {
            user_id: user.id,
            related_user_id: relatedUser.id,
            relation_type: 'friend'
        }
    });
    if(relation) {
        await relation.destroy();
        return res.status(200).json({ message: 'Friend removed' });
    }
    return res.status(404).json({ message: 'Friend relation not found' });
}

exports.blockUser = async (req, res) => {
    let related_user_id = req.params.id;
    let user = req.user;
    let relatedUser = await User.findByPk(related_user_id);
    if(!relatedUser) {
        return res.status(404).json({ message: 'Related user not found' });
    }
    let relation = await UserUserRelation.findOne({
        where: {
            user_id: user.id,
            related_user_id: relatedUser.id
        }
    });
    if(!relation) {
        relation = await UserUserRelation.create({
            user_id: user.id,
            related_user_id: relatedUser.id,
            relation_type: 'blocked'
        });
        return res.status(201).json(relation);
    }
    if(relation.relation_type === 'friend') {
        return res.status(400).json({ message: 'Cannot block a friend. Remove friend first.' });
    }
    return res.status(400).json({ message: 'Relation already exists' });
}


exports.unblockUser = async (req, res) => {
    let related_user_id = req.params.id;
    let user = req.user;
    let relatedUser = await User.findByPk(related_user_id);
    if(!relatedUser) {
        return res.status(404).json({ message: 'Related user not found' });
    }
    let relation = await UserUserRelation.findOne({
        where: {
            user_id: user.id,
            related_user_id: relatedUser.id,
            relation_type: 'blocked'
        }
    });
    if(relation) {
        await relation.destroy();
        return res.status(200).json({ message: 'User unblocked' });
    }
    return res.status(404).json({ message: 'Blocked relation not found' });
}
