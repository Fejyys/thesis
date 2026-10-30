'use strict';
const { User, Channel } = require('../models');
const { faker } = require('@faker-js/faker');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   await User.findAll().then(async (users) => {
    await Channel.findAll().then(async (channels) => {
      if (users.length != 0 && channels.length != 0) {
        for (let i = 0; i < 10; i++) {
          const randomUser = users[Math.floor(Math.random() * users.length)];
          const randomChannel = channels[Math.floor(Math.random() * channels.length)];
          const message = {
            user_id: randomUser.id,
            channel_id: randomChannel.id,
            body: faker.lorem.sentence(),
            file: faker.datatype.boolean(),
            created_at: new Date(),
            updated_at: new Date()
          };
          await queryInterface.bulkInsert('messages', [message], {});
        }
      }
    });
   });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('messages', null, {});
  }
};
