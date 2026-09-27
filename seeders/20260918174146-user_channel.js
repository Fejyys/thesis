'use strict';
const { User, Channel } = require('../models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const users = await User.findAll();
    const channels = await Channel.findAll();
    if (users.length != 0 && channels.length != 0) {
      for (let i = 0; i < 10; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomChannel = channels[Math.floor(Math.random() * channels.length)];
        const userChannel = {
          user_id: randomUser.id,
          channel_id: randomChannel.id,
          created_at: new Date(),
          updated_at: new Date()
        };
        await queryInterface.bulkInsert('user_channel', [userChannel], {});
      }
    }
  },

  async down(queryInterface, Sequelize) {
  /**
   * Add commands to revert seed here.
   *
   * Example:
   * await queryInterface.bulkDelete('People', null, {});
   */
  await queryInterface.bulkDelete('user_channel', null, {});
}
};
