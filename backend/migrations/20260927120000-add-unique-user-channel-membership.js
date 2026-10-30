'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint('user_channel', {
      fields: ['user_id', 'channel_id'],
      type: 'unique',
      name: 'user_channel_user_id_channel_id_unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      'user_channel',
      'user_channel_user_id_channel_id_unique'
    );
  }
};