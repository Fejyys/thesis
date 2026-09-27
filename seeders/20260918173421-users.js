'use strict';
const { faker } = require('@faker-js/faker');

function generateRandomUser() {
  const username = faker.internet.username();
  const nickname = faker.person.firstName();
  const statusOptions = ['active', 'inactive', 'busy', 'offline'];
  const status = faker.helpers.arrayElement(statusOptions);
  const statusMessage = faker.lorem.sentence();
  const passwordHash = faker.internet.password();
  const salt = faker.string.alphanumeric(16);
  const admin = faker.datatype.boolean();
  const lastLogin = faker.date.recent();

  return {
    username,
    nickname,
    status,
    status_message: statusMessage,
    password_hash: passwordHash,
    salt,
    _deleted: false,
    _admin: admin,
    _last_login: lastLogin,
    created_at: new Date(),
    updated_at: new Date()
  };
}

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
   for (let i = 0; i < 10; i++) {
    const user = generateRandomUser();
    await queryInterface.bulkInsert('users', [user], {});
  }
   await queryInterface.bulkInsert('users', [
    {
      username: 'admin',
      nickname: 'Admin',
      status: 'active',
      status_message: 'I am the admin!',
      password_hash: 'hashed_password',
      salt: 'random_salt',
      _deleted: false,
      _admin: true,
      _last_login: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }], {});
    
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('users', null, {});
  }
};
