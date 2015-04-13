var HttpServer = require('../lib/http-server'),
    WebSocketServer = require('../lib/websocket-server'),
    EventSource = require('../lib/event-source');

var Channels = require('./channels'),
    Peer = require('./peer'),
    protocol = require('./shim-protocol');

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

    // Associate socket with channel
    var channel = this.channels_.findOrCreate(channelName);
    var peer = channel.addSocket(socket);

    console.log('New peer on channel ', channel.name, ' has ', channel.peers.length, ' connected peers');
    console.log('Peer has id ', peer.id);

    socket.addEventListener('message', function (evt) {
      console.log('Message from peer id: ', peer.id);

      var payload = {}, targetPeer;
      try {
        payload = JSON.parse(evt.data);
      } catch (err) {
        console.error('Error parsing message', err, evt);
      }

      if (payload.action === 'broadcast') {
        console.log('Broadcast action: ', payload);
        channel.broadcastFromPeer(payload.data, peer);
      }
      else if (payload.action === 'message') {
        console.log('Direct message action: ', payload);
        targetPeer = channel.getPeerById(payload.target);
        if (targetPeer) {
          targetPeer.send( protocol.message(peer, payload.data) );
        }
      }
    });

    socket.addEventListener('close', function () {
      console.log('Socket has closed, removing peer id: ', peer.id);
      channel.removePeer(peer);
      console.log('Channel ', channel.name, ' has ', channel.peers.length, ' connected peers');
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