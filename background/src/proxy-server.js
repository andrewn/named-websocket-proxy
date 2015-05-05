var WebSocket = require('faye-websocket'),
    http      = require('http');

// Add custom inspect to socket for logging
WebSocket.prototype.inspect = function () {
  return '<Faye WebSocket>'
};

var debug = require('./debug')('ProxyServer'),
    EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits;

var Peer = require('./peer'),
    protocol = require('./shim-protocol');

var Proxy = function (address, port) {

  this.httpServer_ = http.createServer();

  this.httpServer_.on('upgrade', function(request, socket, body) {
    if (WebSocket.isWebSocket(request)) {
      debug.log('WebSocket request');
      var ws = new WebSocket(request, socket, body);

      if ('url' in request) {
        channelName = request.url.replace(/^\//, '');
      }

      if (!channelName) {
        debug.log('No channel name, closing WS');
        ws.close();
        return;
      } else {
        debug.log('Channel: ', channelName);
      }

      this.emit('connection', channelName, ws, request);
    }
  }.bind(this));

  this.httpServer_.on('listening', function () {
    this.emit('ready', { localPort: this.httpServer_.address().port });
  }.bind(this));

  this.httpServer_.listen(port, address);
};

inherits(Proxy, EventEmitter);

Proxy.prototype.disconnect = function () {
  this.httpServer_.disconnect();
}

module.exports = Proxy;