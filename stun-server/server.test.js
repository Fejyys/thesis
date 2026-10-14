'use strict';

const assert = require('node:assert/strict');
const dgram = require('node:dgram');
const { once } = require('node:events');
const test = require('node:test');

const {
    createBindingResponse,
    parseBindingRequest,
    startStunServer
} = require('./server');

const MAGIC_COOKIE = 0x2112a442;

function createBindingRequest(transactionId) {
    const request = Buffer.alloc(20);
    request.writeUInt16BE(0x0001, 0);
    request.writeUInt16BE(0, 2);
    request.writeUInt32BE(MAGIC_COOKIE, 4);
    transactionId.copy(request, 8);
    return request;
}

test('parses a valid STUN Binding Request', () => {
    const transactionId = Buffer.from('00112233445566778899aabb', 'hex');
    const parsed = parseBindingRequest(createBindingRequest(transactionId));

    assert.deepEqual(parsed, transactionId);
});

test('ignores malformed or unsupported STUN messages', () => {
    const transactionId = Buffer.alloc(12);
    const request = createBindingRequest(transactionId);

    assert.equal(parseBindingRequest(Buffer.alloc(10)), null);

    request.writeUInt16BE(0x0002, 0);
    assert.equal(parseBindingRequest(request), null);

    request.writeUInt16BE(0x0001, 0);
    request.writeUInt32BE(0, 4);
    assert.equal(parseBindingRequest(request), null);
});

test('encodes the peer endpoint in an XOR-MAPPED-ADDRESS response', () => {
    const transactionId = Buffer.from('00112233445566778899aabb', 'hex');
    const response = createBindingResponse(transactionId, {
        address: '192.0.2.1',
        port: 54321
    });

    assert.equal(response.readUInt16BE(0), 0x0101);
    assert.equal(response.readUInt16BE(2), 12);
    assert.equal(response.readUInt32BE(4), MAGIC_COOKIE);
    assert.deepEqual(response.subarray(8, 20), transactionId);
    assert.equal(response.readUInt16BE(20), 0x0020);
    assert.equal(response.readUInt16BE(22), 8);
    assert.equal(response[25], 0x01);
    assert.equal(response.readUInt16BE(26), 54321 ^ (MAGIC_COOKIE >>> 16));

    const expectedAddress = Buffer.from([192, 0, 2, 1]);
    const cookie = Buffer.alloc(4);
    cookie.writeUInt32BE(MAGIC_COOKIE);
    const encodedAddress = response.subarray(28, 32);
    assert.deepEqual(
        Buffer.from(encodedAddress.map((byte, index) => byte ^ cookie[index])),
        expectedAddress
    );
});

test('answers a UDP Binding Request with the sender endpoint', async (t) => {
    const quietLogger = { log() {}, error() {} };
    const server = startStunServer({ host: '127.0.0.1', port: 0, logger: quietLogger });
    const client = dgram.createSocket('udp4');
    t.after(() => new Promise((resolve) => server.close(resolve)));
    t.after(() => new Promise((resolve) => client.close(resolve)));

    await once(server, 'listening');
    client.bind(0, '127.0.0.1');
    await once(client, 'listening');

    const transactionId = Buffer.from('00112233445566778899aabb', 'hex');
    const responseReceived = once(client, 'message');
    const request = createBindingRequest(transactionId);
    const serverAddress = server.address();

    await new Promise((resolve, reject) => {
        client.send(request, serverAddress.port, '127.0.0.1', (error) => {
            if (error) reject(error);
            else resolve();
        });
    });

    const [response] = await responseReceived;
    assert.equal(response.readUInt16BE(0), 0x0101);
    assert.deepEqual(response.subarray(8, 20), transactionId);
    assert.equal(
        response.readUInt16BE(26),
        client.address().port ^ (MAGIC_COOKIE >>> 16)
    );
});
