'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Channel extends Model {
        static associate(models) {
            Channel.belongsTo(models.User, { foreignKey: 'admin_id', as: 'admin' });
            Channel.belongsToMany(models.User, { through: 'user_channel', foreignKey: 'channel_id', otherKey: 'user_id' });
            Channel.hasMany(models.Message, { foreignKey: 'channel_id', as: 'messages' });
        }
    }
    Channel.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        admin_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Channel',
        tableName: 'channels',
        underscored: true
    });
    return Channel;
};