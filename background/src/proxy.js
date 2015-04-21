var HttpServer = require('../lib/http-server'),
    WebSocketServer = require('../lib/websocket-server'),
    EventSource = require('../lib/event-source');

var Channels = require('./channels'),
    PeerDiscovery = require('./peer-discovery'),
    ProxyConnections = require('./proxy-connections'),
    Peer = require('./peer'),
    protocol = require('./shim-protocol');

var Proxy = function (address, port) {
  EventSource.apply(this);

  this.httpServer_ = new HttpServer();
  this.wsServer_ = new WebSocketServer(this.httpServer_);
  this.httpServer_.listen(port, address);

  this.channels_ = new Channels();
  this.proxyConnections_ = new ProxyConnections();
  this.peerDiscovery_ = new PeerDiscovery('andrewn', '192.168.0.4', 9009);
  var self = this;

  this.channels_.on('add', function (channel) {
    console.log('Channel added', channel);
    channel.on('peer:add', function (peer) {
      console.log('Peer added', peer);
      self.peerDiscovery_.advertisePeer(peer);
    });
    channel.on('peer:remove', function (peer) {
      console.log('Peer removed', peer);
    });
    channel.on('peer:change', function (peer) {
      console.log('Peer changed', peer);
    });
  });

  this.peerDiscovery_.on('peer:discover', function (data) {
    var channel = this.channels_.findOrCreate(data.channelName);
    var existingPeer = channel.getPeerById(data.peerId);
    var url, socket, proxyConnection, peer;
    console.log('New remote peer discovered for channelName: ', data.channelName);
    console.log('New remote peer exists? ', existingPeer);
    if (existingPeer) {
      // ignore?
    } else {
      // see if connection to remote proxy already exists
      proxyConnection = this.proxyConnections_.get(data.ip);

      if (!proxyConnection) {
        console.log('No existing proxyConnection to remore peer exists:', data.ip);
        url = 'ws://' + data.ip + ':' + data.port + '/remote-proxy-connection-channel';
        console.log('new connection between remotes', url);
        socket = new WebSocket(url);
        proxyConnection = this.proxyConnections_.add({ ip: data.ip, socket: socket });
      }

      console.log('Create new peer using this connection', proxyConnection);
      peer = new Peer(channel, proxyConnection.socketForPeer(data.peerId), data.peerId);
    }
  }.bind(this));

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