const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Channel, Message } = require('../models');
const downloadMiddleware = require('../middlewares/downloadMiddleware');
const messageController = require('../controllers/messageController');

function makeRes() {
  return {
    statusCode: 200,
    locals: {},
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

test('download middleware denies non-members', async () => {
  const originalFindByPkMessage = Message.findByPk;
  const originalFindByPkChannel = Channel.findByPk;

  try {
    Message.findByPk = async () => ({ file: true, channel_id: 3 });
    Channel.findByPk = async () => ({ hasUser: async () => false });

    const req = { params: { messageId: '5' }, user: { id: 8, _admin: false } };
    const res = makeRes();
    let nextCalled = false;

    await downloadMiddleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 403);
    assert.equal(nextCalled, false);
  } finally {
    Message.findByPk = originalFindByPkMessage;
    Channel.findByPk = originalFindByPkChannel;
  }
});

test('download middleware allows channel members and stores the message', async () => {
  const originalFindByPkMessage = Message.findByPk;
  const originalFindByPkChannel = Channel.findByPk;
  const message = { file: true, channel_id: 3, body: 'uploads/hash.bin' };

  try {
    Message.findByPk = async id => {
      assert.equal(id, '5');
      return message;
    };
    Channel.findByPk = async () => ({ hasUser: async id => id === 8 });

    const req = { params: { messageId: '5' }, user: { id: 8, _admin: false } };
    const res = makeRes();
    let nextCalled = false;

    await downloadMiddleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(res.locals.message, message);
  } finally {
    Message.findByPk = originalFindByPkMessage;
    Channel.findByPk = originalFindByPkChannel;
  }
});

test('download controller serves the stored file with its original filename', () => {
  const res = makeRes();
  res.locals.message = {
    body: 'uploads\\hash.bin',
    filename: 'report original.bin',
  };

  res.download = (filePath, filename) => {
    assert.equal(filePath, path.join(__dirname, '..', 'uploads', 'hash.bin'));
    assert.equal(filename, 'report original.bin');
  };

  messageController.downloadFile({}, res, error => {
    if (error) throw error;
  });
});
