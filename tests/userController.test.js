const test = require('node:test');
const assert = require('node:assert/strict');
const userController = require('../controllers/userController');
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

test('getUserProfile returns safe user fields', async () => {
  const req = {
    user: {
      id: 3,
      username: 'bob',
      nickname: 'Bobby',
      status: 'active',
      status_message: 'hello',
      _last_login: '2026-10-14T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  };
  const res = makeRes();

  await userController.getUserProfile(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.payload, {
    id: 3,
    username: 'bob',
    nickname: 'Bobby',
    status: 'active',
    status_message: 'hello',
    _last_login: '2026-10-14T00:00:00.000Z',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
  });
});

test('deleteUserById marks a user as deleted', async () => {
  const originalFindByPk = User.findByPk;

  try {
    User.findByPk = async () => ({
      id: 10,
      _deleted: false,
      save: async function () {
        this._deleted = true;
      },
    });

    const req = { params: { id: '10' } };
    const res = makeRes();

    await userController.deleteUserById(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, { message: 'User deleted successfully.' });
  } finally {
    User.findByPk = originalFindByPk;
  }
});

test('getUserById returns 404 for missing user', async () => {
  const originalFindOne = User.findOne;

  try {
    User.findOne = async () => null;

    const req = { params: { id: '404' } };
    const res = makeRes();

    await userController.getUserById(req, res);

    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.payload, { message: 'User not found' });
  } finally {
    User.findOne = originalFindOne;
  }
});
