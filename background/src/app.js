var debug = require('./debug'),
    appLogger = debug('App'),
    ProxyServer = require('./proxy-server'),
    PeerDiscovery = require('./peer-discovery'),
    Channel = require('./channel'),
    Peer = require('./peer'),
    _ = require('lodash');

var App = function () {
  this.initialized = false;


};

App.prototype.init = function () {
  appLogger.info('init');

  if (this.initialized) {
    appLogger.warn('Already initialized');
    return;
  }

  chrome.system.network.getNetworkInterfaces(function (interfaces) {
    console.log('interfaces', interfaces);
    var ip = _.find(interfaces, { prefixLength: 24 });
    if (!ip) { throw Error('cannot find IP address'); }

    this.startWithPublicIp(ip.address);
  }.bind(this));
}

App.prototype.startWithPublicIp = function (publicIp) {
  appLogger.info('starting with public IP', publicIp);

  this.initialized = true;

  this.publicIp   = publicIp;
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

  this.createLocalProxy();
  this.createExternalProxy();
};

App.prototype.createLocalProxy = function () {
  /*
    Proxy server listens on well-known port 9009.
    Handles incoming websockets from the same device and routes
    them to where they needs to go.
  */
  var proxyLogger = debug('LocalProxy');
  this.proxyServer = new ProxyServer(this.localIp, this.localPort);
  this.proxyServer.on('connection', function (channelName, socket) {
    var channel = Channel.find(channelName, this.channels),
        peer;

    if (!channel) {
      channel = { name: channelName };
      this.channels.push(channel);
    }

    peer = { id: Peer.id(), socket: socket, channel: channelName };

    proxyLogger.log('New local peer', peer);

    proxyLogger.log('before localPeers', this.localPeers.length);

    Channel.connectPeers(peer, this.localPeers);
    this.localPeers.push(peer);

    proxyLogger.log('after localPeers', this.localPeers.length);

    socket.addEventListener('message', function (evt) {
      proxyLogger.log('socket.message: ', evt);

      var peers = Channel.peers(channel, this.localPeers);

      var payload = {}, target;
      try {
        payload = JSON.parse(evt.data);
      } catch (err) {
        console.error('Error parsing message', err, evt);
      }

      if (payload.action === 'broadcast') {
        proxyLogger.log('Broadcast action: ', payload);
        Channel.broadcastMessage(peer, peers, payload.data);
      }
      else if (payload.action === 'message') {
        proxyLogger.log('Direct message action: ', payload);
        target = Peer.find(payload.target, this.localPeers);
        if (target) {
          proxyLogger.log('Sending to local peer: ', payload);
          Channel.directMessage(peer, target, payload.data);
          return;
        }

        target = Peer.find(payload.target, this.remotePeers);
        if (target) {
          proxyLogger.log('Sending to remote peer: ', payload);
          // TODO:
          // Channel.directMessage(channel, payload.data, this.localPeers);
          return;
        }

        proxyLogger.warn('Message for peer that cannot be found: ', payload);

        targetPeer = channel.getPeerById(payload.target);
        if (targetPeer) {
          targetPeer.send( protocol.message(peer, payload.data) );
        }
      }

    }.bind(this));

    socket.addEventListener('close', function (evt) {
      proxyLogger.log('socket.close: before remove', peer, this.localPeers.length, this.localPeers);

      // Remove this peer
      Peer.remove(peer, this.localPeers);

      proxyLogger.log('after remove', peer, this.localPeers.length, this.localPeers);

      // Disconnect localPeers in channel
      Channel.disconnectPeers(peer, Channel.peers(channel, this.localPeers));

      proxyLogger.log('Removed local peer', peer);
    }.bind(this));
  }.bind(this));
}

App.prototype.createExternalProxy = function () {
  /*
    External Proxy server listens on any available port and on
    the external interface.
    Handles incoming websockets from the other proxies and removes
    disconnections
  */
  var externalLogger = debug('ExternalProxy');
  this.externalServer = new ProxyServer(this.publicIp, this.publicPort);
  this.externalServer.on('connection', function (url, socket, request) {

    externalLogger.log('New external request', socket, url, request);

    var ip = request.headers.Host,
        proxy = _.find(this.proxies, { ip: ip, socket: socket });

    if (proxy) {
      throw Error('Proxy from ip ' + proxy.ip + ' already exists');
      return;
    }

    externalLogger.log('New connection from ip:', ip);
    proxy = { ip: ip, socket: socket };
    this.proxies.push(proxy);

    socket.addEventListener('message', function (evt) {
      externalLogger.log('socket.message: ', evt);
      // TODO: route message to localPeers on this message
    }.bind(this));

    socket.addEventListener('close', function (evt) {
      externalLogger.log('socket.close, removing proxy connection');
      _.remove(this.proxies, { ip: ip });
      // TODO: Remove remote peers using this connection?
      // TODO: Notify local peers

    }.bind(this));

  }.bind(this));

};

App.prototype.destroy = function () {
  appLogger.info('destroy');
};

module.exports = App;