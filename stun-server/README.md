# Learning STUN server

This folder contains a standalone, small UDP STUN server. It is separate from
the application server and does not change or add application dependencies.

It handles IPv4 STUN Binding Requests and returns a Binding Success Response
with the sender's endpoint encoded as `XOR-MAPPED-ADDRESS`. This is enough to
demonstrate how a WebRTC client can discover the public address and port that
the network sees.

## Run locally

From the repository root:

```powershell
node .\stun-server\server.js
```

The server listens on UDP port `3478` on all IPv4 interfaces by default.
Configure the bind address and port before starting if needed:

```powershell
$env:STUN_HOST = '127.0.0.1'
$env:STUN_PORT = '3479'
node .\stun-server\server.js
```

Run its tests with Node's built-in test runner:

```powershell
node --test .\stun-server\server.test.js
```

For a Flutter WebRTC client, the ICE server entry will look approximately like:

```dart
final iceServers = [
  {'urls': 'stun:YOUR_PUBLIC_IP_OR_HOSTNAME:3478'},
];
```

Use the ICE-server configuration shape required by the Flutter WebRTC package
and version in your app. For a remote client to reach this example, host it on
a machine with a public/reachable address and allow inbound UDP on its port.

## Scope and limitations

- This is a learning implementation, not a production STUN service.
- It supports IPv4 Binding Requests only. It does not support IPv6, STUN
  authentication, integrity/fingerprint attributes, or other STUN methods.
- It demonstrates server-reflexive address discovery; it is not a complete ICE
  connectivity-check server. A full WebRTC deployment needs ICE-compatible
  STUN behavior and usually TURN for networks where direct peer connections
  fail.
- STUN helps peers discover network mappings; it does not relay voice traffic.
  Some networks prevent direct peer-to-peer connections, so real deployments
  also need a TURN relay.
- WebRTC media security is provided by the WebRTC stack (DTLS-SRTP), not by
  this STUN server.
