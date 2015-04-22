var debug = require('./debug')('ProxyServer'),
    HttpServer = require('../lib/http-server'),
    WebSocketServer = require('../lib/websocket-server'),
    EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits;

var ProxyConnections = require('./proxy-connections'),
    Peer = require('./peer'),
    protocol = require('./shim-protocol');

var Proxy = function (address, port) {

  this.httpServer_ = new HttpServer(debug);
  this.wsServer_ = new WebSocketServer(this.httpServer_);

  this.httpServer_.addEventListener('ready', function (info) {
    this.emit('ready', info);
  }.bind(this));

  this.httpServer_.listen(port, address);

  this.httpServer_.addEventListener('request', function (req) {
    debug.log('An HTTP request!', req);
    req.writeHead(404, {});
    req.end();

    // Keep socket open until we explicitly
    // call req.end()
    return true;
  });

  this.wsServer_.addEventListener('request', function (req) {
    debug.log('WebSocket request', req);
    var keepConnectionOpen, channelName, socket;

    if ('url' in req.headers) {
      channelName = req.headers.url.replace(/^\//, '');
    }

    if (!channelName) {
      req.reject();
      keepConnectionOpen = false;
      return keepConnectionOpen;
    } else {
      socket = req.accept();
      keepConnectionOpen = true;
    }

    this.emit('connection', channelName, socket, req);

    return keepConnectionOpen;
  }.bind(this));
};

inherits(Proxy, EventEmitter);

Proxy.prototype.disconnect = function () {
  this.httpServer_.disconnect();
}

module.exports = Proxy;