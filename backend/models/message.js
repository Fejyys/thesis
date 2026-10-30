'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      // Define associations here
      Message.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Message.belongsTo(models.Channel, { foreignKey: 'channel_id', as: 'channel' });
    }
    }
    Message.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        channel_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        body: {
            type: DataTypes.STRING,
            allowNull: false
        },
        file: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'Message',
        tableName: 'messages',
        underscored: true
    });
    return Message;
};