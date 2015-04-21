var AmpersandState = require('ampersand-state');

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
    this.socket.addEventListener('message', function () {
      console.log('ProxyConnection.message', this.ip);
    }.bind(this));
  }
});

/*
  Returns a shim socket connection that emits events
  only for this peer
*/
ProxyConnection.prototype.socketForPeer = function (id) {
  return {
    send: function (msg) {
      console.log('ProxyConnection - shimSocket.send', id, msg);
    },
    addEventListener: function (eventName) {
      console.log('ProxyConnection - shimSocket.listen', eventName);
    }
  };
}

module.exports = ProxyConnection;