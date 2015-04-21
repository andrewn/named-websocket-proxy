var debug = require('./debug')('App'),
    Proxy = require('./proxy'),
    Channels = require('./channels'),
    PeerDiscovery = require('./peer-discovery');

var App = function () {
  this.initialized = false;
};

App.prototype.init = function () {
  debug.info('init');

  if (this.initialized) {
    debug.warn('Already initialized');
    return;
  }

  // Create shared channels object, representing Channels
  // and Peers on the network, either local or remote
  this.channels = new Channels();

  // Create a discovery client for discovering other proxies on
  // the local network
  this.peerDiscovery = new PeerDiscovery('andrewn', '192.168.0.4', 9009);

  // Connect to the local interface on a specific port
  this.localProxy = new Proxy('127.0.0.1', 9009, this.channels, require('./debug')('LocalProxy'));
  this.localProxy.on('peer:add', function (p) {
    debug.log('LocalProxy: New peer added', p);
    this.peerDiscovery.advertisePeer(p);
  }.bind(this));

  // Connect to the remote interface on any available port
  this.remoteProxy = new Proxy('192.168.0.4', 0, this.channels, require('./debug')('RemoteProxy'));

  this.peerDiscovery.on('peer:discover', function (data) {
    debug.log('A remote peer has been discovered', data);

    // Existing WS connection?
    //   Y: create new shim
    //   N: create connection
  });

  /*
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
    console.log('peer:discover', data);
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
      peer = new Peer(proxyConnection.socketForPeer(data.peerId), channel, data.peerId);
    }
  }.bind(this));
  */

};

App.prototype.destroy = function () {
  debug.info('destroy');
  this.localProxy.disconnect();
  // this.remotelProxy.disconnect();
  this.peerDiscovery;
};

module.exports = App;