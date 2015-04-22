var AmpersandState = require('ampersand-state'),
    EventSource = require('../lib/event-source');

var ShimSocket = function (sharedSocket, peerId) {
  var self = this;
  this.sharedSocket = sharedSocket;
  this.peerId = peerId;
  this.messageQueue = [];

  this.sharedSocket.addEventListener('message', function (msg) {
    console.log('ShimSocket.message:', msg);
  });

  this.sharedSocket.addEventListener('open', function () {
    console.log('ProxyConnection - sharedSocket open, sending queued messages');
    self.messageQueue.forEach(function (msg) {
      self.send(msg);
    });
  });

  this.sharedSocket.addEventListener('close', function () {
    console.warn('ProxyConnection - sharedSocket close!');
  });
};

ShimSocket.prototype = new EventSource();

ShimSocket.prototype.send = function (msg) {
  if (this.sharedSocket.readyState !== 1) {
    console.log('ProxyConnection - shimSocket.send connection not ready, queueing');
    this.messageQueue.push(msg);
  }
  console.log('ProxyConnection - shimSocket.send', this.peerId, msg);
  this.sharedSocket.send(msg);
};

/*
  Represents a WebSocket connection
  between two proxies
*/
var ProxyConnection = AmpersandState.extend({
  props: {
    ip: 'string',
    socket: 'object'
  },
  initialize: function () {
    console.log('ProxyConnection.initialize', this.socket);
  }
});

/*
  Returns a shim socket connection that emits events
  only for this peer and sends messages down the socket
  to that peer's proxy
*/
ProxyConnection.prototype.socketForPeer = function (id) {
  return new ShimSocket(this.socket, id);
}

module.exports = ProxyConnection;