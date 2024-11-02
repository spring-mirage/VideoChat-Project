const { PeerServer } = require('peer');

const peerServer = PeerServer({
  port: 9001,
  path: '/',
  allow_discovery: true,
});

console.log('PeerJS server running on http://localhost:9001');