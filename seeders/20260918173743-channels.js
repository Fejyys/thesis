'use strict';
const { faker } = require('@faker-js/faker');
const { User } = require('../models');


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
    await User.findAll().then(async (users) => {
      if (users.length != 0) {
        for (let i = 0; i < 10; i++) {
          const randomUser = users[Math.floor(Math.random() * users.length)];
          const channel = {
            admin_id: randomUser.id,
            name: faker.lorem.words(2),
            created_at: new Date(),
            updated_at: new Date()
          };
          await queryInterface.bulkInsert('channels', [channel], {});
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('channels', null, {});
  }
};
