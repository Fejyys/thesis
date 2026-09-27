'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            // define association here
            User.belongsToMany(models.Channel, { through: 'user_channel', foreignKey: 'user_id', otherKey: 'channel_id' });
        }
    }
    User.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'busy', 'offline'),
            allowNull: false,
            defaultValue: 'active'
        },
        status_message: {
            type: DataTypes.STRING,
            allowNull: true
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        salt: {
            type: DataTypes.STRING,
            allowNull: false
        },
        _deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: '_deleted'
        },
        _admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: '_admin'
        },
        _last_login: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: '_last_login'
        },
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        underscored: true
    });
    return User;
}