var debug = require('./debug')('App'),
    ProxyServer = require('./proxy-server'),
    Channel = require('./channel'),
    Peer = require('./peer');

var App = function () {
  this.initialized = false;
};

App.prototype.init = function () {
  debug.info('init');

  if (this.initialized) {
    debug.warn('Already initialized');
    return;
  }

  this.initialized = true;

  this.publicIp = '192.168.0.7';
  this.publicPort = 0;

  this.localIp   = '127.0.0.1';
  this.localPort = 9009;

  // Channels that this proxy is participating in.
  // If a peer exists in either list, a channel
  // should be in here
  this.channels    = [];

  // All connected sockets on this machine
  this.localPeers  = [];

  // All remote peers that concern this proxy.
  // If no local peers exists for a channel then
  // any remote peers in that channel will be removed also.
  this.remotePeers = [];

  // A cache of adverts about peers on the network
  this.discoveryAdverts = [];

  // WebSocket connections to other proxies
  this.proxies = [];

  this.proxyServer = new ProxyServer(this.localIp, this.localPort);
  this.proxyServer.on('connection', function (channelName, socket) {
    var channel = Channel.find(channelName, this.channels),
        peer;

    if (!channel) {
      channel = { name: channelName };
      this.channels.push(channel);
    }

    peer = { id: Peer.id(), socket: socket, channel: channelName };

    debug.log('New local peer', peer);

    debug.log('before localPeers', this.localPeers.length);

    Channel.connectPeers(peer, this.localPeers);
    this.localPeers.push(peer);

    debug.log('after localPeers', this.localPeers.length);

    socket.addEventListener('message', function (evt) {
      debug.log('socket.message: ', evt);

      var peers = Channel.peers(channel, this.localPeers);

      var payload = {}, target;
      try {
        payload = JSON.parse(evt.data);
      } catch (err) {
        console.error('Error parsing message', err, evt);
      }

      if (payload.action === 'broadcast') {
        debug.log('Broadcast action: ', payload);
        Channel.broadcastMessage(peer, peers, payload.data);
      }
      else if (payload.action === 'message') {
        debug.log('Direct message action: ', payload);
        target = Peer.find(payload.target, this.localPeers);
        if (target) {
          debug.log('Sending to local peer: ', payload);
          Channel.directMessage(peer, target, payload.data);
          return;
        }

        target = Peer.find(payload.target, this.remotePeers);
        if (target) {
          debug.log('Sending to remote peer: ', payload);
          // Channel.directMessage(channel, payload.data, this.localPeers);
          return;
        }

        debug.warn('Message for peer that cannot be found: ', payload);

        targetPeer = channel.getPeerById(payload.target);
        if (targetPeer) {
          targetPeer.send( protocol.message(peer, payload.data) );
        }
      }

    }.bind(this));

    socket.addEventListener('close', function (evt) {
      debug.log('socket.close: before remove', peer, this.localPeers.length, this.localPeers);

      // Remove this peer
      Peer.remove(peer, this.localPeers);

      debug.log('after remove', peer, this.localPeers.length, this.localPeers);

      // Disconnect localPeers in channel
      Channel.disconnectPeers(peer, Channel.peers(channel, this.localPeers));

      debug.log('Removed local peer', peer);
    }.bind(this));


  }.bind(this));

};

App.prototype.destroy = function () {
  debug.info('destroy');
};

module.exports = App;