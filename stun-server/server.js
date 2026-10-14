'use strict';

const dgram = require('node:dgram');
const net = require('node:net');

const HEADER_LENGTH = 20;
const MAGIC_COOKIE = 0x2112a442;
const BINDING_REQUEST = 0x0001;
const BINDING_SUCCESS_RESPONSE = 0x0101;
const XOR_MAPPED_ADDRESS = 0x0020;

function parseBindingRequest(message) {
    if (!Buffer.isBuffer(message) || message.length < HEADER_LENGTH) {
        return null;
    }

    const messageType = message.readUInt16BE(0);
    const messageLength = message.readUInt16BE(2);
    if (
        messageType !== BINDING_REQUEST ||
        (message[0] & 0xc0) !== 0 ||
        messageLength % 4 !== 0 ||
        message.length !== HEADER_LENGTH + messageLength ||
        message.readUInt32BE(4) !== MAGIC_COOKIE
    ) {
        return null;
    }

    return message.subarray(8, HEADER_LENGTH);
}

function createBindingResponse(transactionId, peer) {
    if (!Buffer.isBuffer(transactionId) || transactionId.length !== 12) {
        throw new TypeError('A STUN transaction ID must be exactly 12 bytes');
    }
    if (net.isIP(peer.address) !== 4) {
        throw new TypeError('This learning server supports IPv4 peers only');
    }
    if (!Number.isInteger(peer.port) || peer.port < 0 || peer.port > 65535) {
        throw new RangeError('Peer port must be an integer from 0 to 65535');
    }

    const response = Buffer.alloc(HEADER_LENGTH + 12);
    response.writeUInt16BE(BINDING_SUCCESS_RESPONSE, 0);
    response.writeUInt16BE(12, 2);
    response.writeUInt32BE(MAGIC_COOKIE, 4);
    transactionId.copy(response, 8);

    response.writeUInt16BE(XOR_MAPPED_ADDRESS, HEADER_LENGTH);
    response.writeUInt16BE(8, HEADER_LENGTH + 2);
    response[HEADER_LENGTH + 4] = 0;
    response[HEADER_LENGTH + 5] = 0x01;
    response.writeUInt16BE(peer.port ^ (MAGIC_COOKIE >>> 16), HEADER_LENGTH + 6);

    const addressBytes = Buffer.from(peer.address.split('.').map(Number));
    const cookieBytes = Buffer.alloc(4);
    cookieBytes.writeUInt32BE(MAGIC_COOKIE);
    for (let i = 0; i < 4; i += 1) {
        response[HEADER_LENGTH + 8 + i] = addressBytes[i] ^ cookieBytes[i];
    }

    return response;
}

function startStunServer({ host = '0.0.0.0', port = 3478, logger = console } = {}) {
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
        throw new RangeError('Port must be an integer from 0 to 65535');
    }

    const socket = dgram.createSocket('udp4');

    socket.on('message', (message, peer) => {
        const transactionId = parseBindingRequest(message);
        if (!transactionId) {
            return;
        }

        const response = createBindingResponse(transactionId, peer);
        socket.send(response, peer.port, peer.address, (error) => {
            if (error) {
                logger.error(`Could not send STUN response: ${error.message}`);
            }
        });
    });

    socket.on('error', (error) => {
        logger.error(`STUN server socket error: ${error.message}`);
        socket.close();
    });

    socket.bind(port, host, () => {
        const address = socket.address();
        logger.log(`STUN server listening on ${address.address}:${address.port}/udp`);
    });

    return socket;
}

if (require.main === module) {
    const port = Number(process.env.STUN_PORT || 3478);
    const host = process.env.STUN_HOST || '0.0.0.0';

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        console.error('STUN_PORT must be an integer from 1 to 65535');
        process.exitCode = 1;
    } else {
        startStunServer({ host, port });
    }
}

module.exports = {
    createBindingResponse,
    parseBindingRequest,
    startStunServer
};
