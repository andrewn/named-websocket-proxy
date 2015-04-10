var HttpServer = require('../lib/http-server'),
    WebSocketServer = require('../lib/websocket-server'),
    EventSource = require('../lib/event-source');

var Channels = require('./channels'),
    Peer = require('./peer');

var Proxy = function (address, port) {
  EventSource.apply(this);

  this.httpServer_ = new HttpServer();
  this.wsServer_ = new WebSocketServer(this.httpServer_);
  this.httpServer_.listen(port, address);

  this.channels_ = new Channels();

  this.httpServer_.addEventListener('request', function (req) {
    console.log('An HTTP request!', req);
    req.writeHead(404, {});
    req.end();

    // Keep socket open until we explicitly
    // call req.end()
    return true;
  });

  this.wsServer_.addEventListener('request', function (req) {
    console.log('WebSocket request', req);
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

    console.log('channelName: ', channelName);

    // Associate socket with channel
    var channel = this.channels_.findOrCreate(channelName);
    var peer = channel.addSocket(socket);

    socket.addEventListener('message', function (e) {
      console.log('Message from client', e);
    });

    socket.addEventListener('close', function () {
      console.log('Socket has closed');
      channel.removePeer(peer);
    });

    // socket.send('Hello');

    return keepConnectionOpen;
  }.bind(this));
};

Proxy.prototype = {
  __proto__: EventSource.prototype,
  disconnect: function () {
    this.httpServer_.disconnect();
  }
}

module.exports = Proxy;