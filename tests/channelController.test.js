const test = require('node:test');
const assert = require('node:assert/strict');
const channelController = require('../controllers/channelController');
const { Channel } = require('../models');

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
    send(value) {
      this.payload = value;
      return this;
    },
  };
}

test('getAllChannels returns all channels for admins', async () => {
  const req = { user: { _admin: true } };
  const res = makeRes();
  const originalFindAll = Channel.findAll;

  try {
    Channel.findAll = async () => [{ id: 1, name: 'general' }];

    await channelController.getAllChannels(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, [{ id: 1, name: 'general' }]);
  } finally {
    Channel.findAll = originalFindAll;
  }
});

test('getChannelByID rejects access for non-members', async () => {
  const originalFindByPk = Channel.findByPk;

  try {
    Channel.findByPk = async () => ({
      id: 5,
      admin_id: 2,
      hasUser: async () => false,
    });

    const req = {
      params: { id: '5' },
      user: { _admin: false, id: 99 },
    };
    const res = makeRes();

    await channelController.getChannelByID(req, res);

    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.payload, {
      message: 'You are not a member of this channel',
    });
  } finally {
    Channel.findByPk = originalFindByPk;
  }
});

test('getChannelByID allows admins to view any channel', async () => {
  const originalFindByPk = Channel.findByPk;

  try {
    Channel.findByPk = async () => ({
      id: 21,
      admin_id: 2,
      name: 'private',
      hasUser: async () => false,
    });

    const req = {
      params: { id: '21' },
      user: { _admin: true, id: 1 },
    };
    const res = makeRes();

    await channelController.getChannelByID(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.id, 21);
    assert.equal(res.payload.name, 'private');
  } finally {
    Channel.findByPk = originalFindByPk;
  }
});
