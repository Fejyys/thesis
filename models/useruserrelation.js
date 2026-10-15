'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserUserRelation extends Model {
        static associate(models) {
            UserUserRelation.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
            UserUserRelation.belongsTo(models.User, { foreignKey: 'related_user_id', as: 'relatedUser' });
        }
      }
      UserUserRelation.init({
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        related_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        relation_type: {
            type: DataTypes.ENUM('friend', 'blocked'),
            allowNull: false
        }
    }, {
        tableName: 'user_user_relations',
        underscored: true,
        sequelize,
        modelName: 'UserUserRelation',
        
    });
    return UserUserRelation;
}