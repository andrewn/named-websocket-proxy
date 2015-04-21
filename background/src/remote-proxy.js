var debug = require('./debug')('RemoteProxy'),
    HttpServer = require('../lib/http-server'),
    WebSocketServer = require('../lib/websocket-server'),
    EventEmitter = require('events').EventEmitter;

var ProxyConnections = require('./proxy-connections'),
    Peer = require('./peer'),
    protocol = require('./shim-protocol');

var Proxy = function (address, port, channels, debug) {

  this.httpServer_ = new HttpServer(debug);
  this.wsServer_ = new WebSocketServer(this.httpServer_);
  this.httpServer_.listen(port, address);

  this.channels_ = channels;
  this.proxyConnections_ = new ProxyConnections();

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

    debug.log('channelName', channelName);

    if (!channelName) {
      req.reject();
      keepConnectionOpen = false;
      return keepConnectionOpen;
    } else {
      socket = req.accept();
      keepConnectionOpen = true;
    }

    // Associate socket with channel
    // var channel = this.channels_.findOrCreate(channelName);
    // var peer = channel.addSocket(socket);

    // socket.addEventListener('message', function (evt) {
    //   debug.log('Message from peer id: ', peer.id);

    //   var payload = {}, targetPeer;
    //   try {
    //     payload = JSON.parse(evt.data);
    //   } catch (err) {
    //     console.error('Error parsing message', err, evt);
    //   }

    //   if (payload.action === 'broadcast') {
    //     debug.log('Broadcast action: ', payload);
    //     channel.broadcastFromPeer(payload.data, peer);
    //   }
    //   else if (payload.action === 'message') {
    //     debug.log('Direct message action: ', payload);
    //     targetPeer = channel.getPeerById(payload.target);
    //     if (targetPeer) {
    //       targetPeer.send( protocol.message(peer, payload.data) );
    //     }
    //   }
    // });

    // socket.addEventListener('close', function () {
    //   debug.log('Socket has closed, removing peer id: ', peer.id);
    //   channel.removePeer(peer);
    //   debug.log('Channel ', channel.name, ' has ', channel.peers.length, ' connected peers');
    // });

    // debug.log('New peer on channel ', channel.name, ' has ', channel.peers.length, ' connected peers');
    // debug.log('Peer has id ', peer.id);

    // this.emit('peer:add', peer);

    return keepConnectionOpen;
  }.bind(this));
};

Proxy.prototype = new EventEmitter();

Proxy.prototype.createProxyConnection = function (data) {
  // Existing WS connection?
  var channel = this.channels_.findOrCreate(data.channelName),
      existingPeer = channel.getPeerById(data.peerId),
      proxyConnection = this.proxyConnections_.get(data.ip),
      url,
      socket,
      peerSocket;

  if (existingPeer) {
    debug.log('peer already known, assume connection - nothing to do');
    return;
  }

  if (!proxyConnection) {
    debug.log('proxyConnection does not exist');
    url = 'ws://' + data.ip + ':' + data.port + '/remote';
    debug.log('new connection between remote proxies', url);
    socket = new WebSocket(url);
    proxyConnection = this.proxyConnections_.add({ ip: data.ip, socket: socket });
  } else {
    debug.log('proxyConnection already exists');
  }

  debug.log('Creating new Peer id: ', data.peerId);
  debug.log('Adding to channel name: ', data.channel);
  peerSocket = proxyConnection.socketForPeer(data.peerId);
  channel.addSocket(peerSocket, data.peerId);
};

Proxy.prototype.disconnect = function () {
  this.httpServer_.disconnect();
}

module.exports = Proxy;