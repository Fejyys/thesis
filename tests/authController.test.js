const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
const { User } = require('../models');

function makeRes() {
  return {
    statusCode: 200,
    payload: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.payload = value;
      return this;
    },
  };
}

test('login rejects invalid credentials', async () => {
  process.env.JWT_SECRET = 'test-secret';

  const originalFindOne = User.findOne;
  const originalCompare = bcrypt.compare;

  try {
    User.findOne = async () => ({
      id: 42,
      username: 'alice',
      salt: 'abc',
      password_hash: 'hashed-password',
      _deleted: false,
      _last_login: null,
      save: async () => {},
    });
    bcrypt.compare = async () => false;

    const req = { body: { username: 'alice', password: 'wrong' } };
    const res = makeRes();

    await authController.login(req, res);

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.payload, { message: 'Invalid credentials' });
  } finally {
    User.findOne = originalFindOne;
    bcrypt.compare = originalCompare;
  }
});

test('register rejects weak password', async () => {
  const originalFindOne = User.findOne;

  try {
    User.findOne = async () => null;

    const req = { body: { username: 'alice', password: '123' } };
    const res = makeRes();

    await authController.register(req, res);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.payload, {
      message: 'Password must be at least 6 characters long',
    });
  } finally {
    User.findOne = originalFindOne;
  }
});

test('login rejects deleted users', async () => {
  process.env.JWT_SECRET = 'test-secret';

  const originalFindOne = User.findOne;
  const originalCompare = bcrypt.compare;

  try {
    User.findOne = async () => ({
      id: 43,
      username: 'ghost',
      salt: 'abc',
      password_hash: 'hashed-password',
      _deleted: true,
      _last_login: null,
    });
    bcrypt.compare = async () => true;

    const req = { body: { username: 'ghost', password: 'secret' } };
    const res = makeRes();

    await authController.login(req, res);

    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.payload, { message: 'User account is deleted' });
  } finally {
    User.findOne = originalFindOne;
    bcrypt.compare = originalCompare;
  }
});
