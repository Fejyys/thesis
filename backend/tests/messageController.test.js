const test = require('node:test');
const assert = require('node:assert/strict');
const messageController = require('../controllers/messageController');
const { Channel, Message } = require('../models');

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

test('getMessages returns user messages for non-admin users', async () => {
  const req = {
    user: {
      _admin: false,
      id: 7,
      getMessages: async () => [{ id: 1, body: 'hello' }],
    },
  };
  const res = makeRes();

  await messageController.getMessages(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.payload, [{ id: 1, body: 'hello' }]);
});

test('createTextMessage rejects empty content', async () => {
  const originalFindByPk = Channel.findByPk;
  const originalHasUser = Channel.prototype.hasUser;

  try {
    Channel.findByPk = async () => ({
      id: 3,
      hasUser: async () => true,
    });
    Channel.prototype.hasUser = async () => true;

    const req = {
      params: { id: '3' },
      user: { id: 1, _admin: false },
      body: { content: '   ' },
    };
    const res = makeRes();

    await messageController.createTextMessage(req, res);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.payload, {
      message: 'Message content must be between 1 and 1000 characters',
    });
  } finally {
    Channel.findByPk = originalFindByPk;
    Channel.prototype.hasUser = originalHasUser;
  }
});

test('createTextMessage blocks non-member users', async () => {
  const originalFindByPk = Channel.findByPk;

  try {
    Channel.findByPk = async () => ({
      id: 3,
      hasUser: async () => false,
    });

    const req = {
      params: { id: '3' },
      user: { id: 99, _admin: false },
      body: { content: 'hello' },
    };
    const res = makeRes();

    await messageController.createTextMessage(req, res);

    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.payload, {
      message: 'You are not a member of this channel',
    });
  } finally {
    Channel.findByPk = originalFindByPk;
  }
});

test('createTextMessage allows admin to post without channel membership', async () => {
  const originalFindByPk = Channel.findByPk;
  const originalCreate = Message.create;

  try {
    Channel.findByPk = async () => ({
      id: 7,
      hasUser: async () => false,
    });
    Message.create = async ({ user_id, channel_id, body }) => ({
      id: 88,
      user_id,
      channel_id,
      body,
    });

    const req = {
      params: { id: '7' },
      user: { id: 4, _admin: true },
      body: { content: 'Admin message' },
    };
    const res = makeRes();

    await messageController.createTextMessage(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.payload.body, 'Admin message');
  } finally {
    Channel.findByPk = originalFindByPk;
    Message.create = originalCreate;
  }
});

test('createTextMessage creates a valid message', async () => {
  const originalFindByPk = Channel.findByPk;
  const originalCreate = Message.create;

  try {
    Channel.findByPk = async () => ({
      id: 9,
      hasUser: async () => true,
    });
    Message.create = async ({ user_id, channel_id, body }) => ({
      id: 55,
      user_id,
      channel_id,
      body,
    });

    const req = {
      params: { id: '9' },
      user: { id: 10, _admin: false },
      body: { content: 'Valid message' },
    };
    const res = makeRes();

    await messageController.createTextMessage(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.payload.body, 'Valid message');
    assert.equal(res.payload.user_id, 10);
    assert.equal(res.payload.channel_id, 9);
  } finally {
    Channel.findByPk = originalFindByPk;
    Message.create = originalCreate;
  }
});
