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
    send: function () {
      console.log('ProxyConnection.ShimSocket', id);
    }
  };
}

module.exports = ProxyConnection;