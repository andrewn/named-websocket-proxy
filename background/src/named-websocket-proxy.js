var Promise = require('es6-promise').Promise,
    _ = require('lodash'),
    os = require('os'),
    WebSocket = require('faye-websocket').Client;

var debug = require('./debug'),
    appLogger = debug('App'),
    ProxyServer = require('./proxy-server'),
    PeerDiscovery = require('./peer-discovery'),
    Channel = require('./channel'),
    Peer = require('./peer'),
    Proxy = require('./proxy'),
    Router = require('./router'),
    networkUtils = require('./network-utils');

var App = function () {
  this.initialized = false;
};

App.prototype.init = function () {
  appLogger.info('init');

  if (this.initialized) {
    appLogger.warn('Already initialized');
    return;
  }

  // networkUtils
  //   .findv4Ip(chrome.system.network.getNetworkInterfaces)
  //   .then(this.startWithPublicIp.bind(this), appLogger.error);
  networkUtils
    .findv4Ip()
    .then(this.startWithPublicIp.bind(this), appLogger.error);
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
  this.createExternalProxy()
    .then(function () {
      appLogger.log('External proxy ready with', this.publicPort);
      this.createPeerDiscovery();
    }.bind(this));
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

    // TODO: Move into tested helper?
    var channel = Channel.find(channelName, this.channels),
        peers,
        sourcePeer;

    if (!channel) {
      channel = { name: channelName };
      this.channels.push(channel);
      proxyLogger.log('Creating new channel', channel);
    }

    sourcePeer = Peer.create(channel, socket);

    proxyLogger.log('New local peer', sourcePeer);

    // Connect local peers to new peer
    locals = Channel.peers(channel, this.localPeers);
    Channel.connectPeers(sourcePeer, locals);
    this.localPeers.push(sourcePeer);

    // Connect remote peers to new peer
    remotes = Channel.peers(channel, this.remotePeers);
    Channel.connectPeers(sourcePeer, remotes);

    // Broadcast local peer externally
    this.peerDiscovery.advertisePeer(sourcePeer);

    socket.on('message', function (evt) {

      proxyLogger.log('socket.message: ', evt);

      var payload = {};
      try {
        payload = JSON.parse(evt.data);
      } catch (err) {
        console.error('Error parsing message', err, evt);
      }

      // Router local message to local or remote peers
      Router.handleLocalMessage(channel, sourcePeer, payload, this.localPeers, this.remotePeers);

    }.bind(this));

    socket.on('close', function (evt) {
      proxyLogger.log('socket.close:', sourcePeer);

      Router.handleLocalDisconnection(channel, sourcePeer, this.localPeers, this.remotePeers);

      // TODO: close proxy connection if no one using it?

    }.bind(this));
  }.bind(this));
}

App.prototype.createExternalProxy = function () {
  return new Promise(function (resolve, reject) {
    /*
      External Proxy server listens on any available port and on
      the external interface.
      Handles incoming websockets from the other proxies and removes
      disconnections
    */
    var externalLogger = debug('ExternalProxy');
    this.externalServer = new ProxyServer(this.publicIp, this.publicPort);
    this.externalServer.on('ready', function (info) {
      externalLogger.log('has received public port', info);
      this.publicPort = info.localPort;
      resolve();
    }.bind(this));
    this.externalServer.on('connection', function (url, socket, request) {

      externalLogger.log('New external request', socket, url, request);

      var ip = request.headers.host,
          proxy = _.find(this.proxies, { ip: ip, socket: socket });

      if (proxy) {
        throw Error('Proxy from ip ' + proxy.ip + ' already exists');
        return;
      }

      externalLogger.log('New connection from ip:', ip);
      proxy = { ip: ip, socket: socket };
      this.proxies.push(proxy);

      this.addHandlersForRemoteProxy(proxy, externalLogger);

    }.bind(this));
  }.bind(this));
};

App.prototype.createPeerDiscovery = function () {
  var discoLogger = debug('Discovery');
  // TODO: Use actual hostname: os.hostname()
  this.peerDiscovery = new PeerDiscovery(Peer.id());
  discoLogger.log('Starting with ', this.publicIp, this.publicPort);
  this.peerDiscovery.init(this.publicIp, this.publicPort);
  this.peerDiscovery.on('discover', function (record) {
    discoLogger.log('discover', record);
    // This channel will exist if a local peer is
    // bound to it
    var channel = Channel.find(record.channelName, this.channels),
        peer = Peer.find(record.peerId, this.remotePeers),
        proxy = _.find(this.proxies, { ip: record.ip }),
        socket;

    if (!channel) {
      discoLogger.log('no local peer bound to channel: ', record.channelName);
      this.discoveryAdverts.push(record);
      return;
    }

    if (peer) {
      discoLogger.log('remote peer already exists ', peer);
      return;
    }

    if (!proxy) {
      // Create proxy connection to this proxy
      socket = new WebSocket('ws://' + record.ip + ':' + record.port + '/remote');
      discoLogger.log('creating proxy connection to: ', record.ip + ':' + record.port);

      socket.on('open', function () {
        discoLogger.log('proxy connection open');
        proxy = { ip: record.ip, socket: socket };
        this.proxies.push(proxy);

        createRemotePeer.bind(this)();

        this.addHandlersForRemoteProxy(proxy, discoLogger);
      }.bind(this));
    } else {
      socket = proxy.socket;
      createRemotePeer.bind(this)();
    }

    function createRemotePeer() {
      var peer = Peer.create(channel, socket, record.ip, record.peerId);
      this.remotePeers.push(peer);
      discoLogger.log('created remote peer', peer);
      // Connect remote peer to local peers and vice versa
      Channel.connectPeers(peer, Channel.peers(channel, this.localPeers) );
    };

  }.bind(this));
  this.peerDiscovery.on('query', function (reply) {
    discoLogger.log('query');
    // TODO: call reply to records
  }.bind(this));
};

App.prototype.addHandlersForRemoteProxy = function (proxy, logger) {
  proxy.socket.on('message', function (evt) {
    logger.log('socket.message: ', evt);
    var payload = {}, target;
    try {
      payload = JSON.parse(evt.data);
    } catch (err) {
      console.error('Error parsing message', err, evt);
    }

    Router.handleRemoteMessage(payload, this.localPeers, this.remotePeers, proxy);

    /*if (payload.action === 'broadcast') {
      logger.log('Broadcast action: ', payload);
      // find source peer in remotePeers
      var source = Peer.find(payload.source, this.remotePeers);

      if (!source) {
        logger.warn('Broadcast message from peer that is not in remote peers list', payload);
        return;
      }

      var channel = Channel.find(source.channel, this.channels),
          peers = Channel.peers(channel, this.localPeers);

      if (!channel) {
        logger.warn('Cannot find channel', payload.channel, this.channels);
        return;
      }

      if (!peers || peers.length == 0) {
        logger.warn('No local peers for broadcast message', payload, peers);
        return;
      }

      // Send to all local peers in channel
      Channel.broadcastMessage(source, peers, payload.data);
    }
    else if (payload.action === 'message') {
      logger.log('Direct message action: ', payload, this.remotePeers);
      var source = Peer.find(payload.source, this.remotePeers);
      target = Peer.find(payload.target, this.localPeers);
      if (!source) {
         logger.log('Cannot find remote peer: ', source);
         return;
      }
      if (target) {
        logger.log('Sending to local peer: ', payload);
        Channel.directMessage(source, target, payload.data);
        return;
      }

      logger.warn('Message for peer that cannot be found: ', payload);
    }
    else if (payload.action === 'connect') {
      logger.log('Connect message action: ', payload);

      var channel = Channel.find(payload.channel, this.channels);

      if (!channel) {
        logger.warn('No local channel found', payload.channel);
      }

      var peer = Peer.find(payload.source, this.remotePeers);
      if (peer) {
        logger.warn('Connect message for existing remote peer', peer);
        return;
      }

      peer = Peer.create(channel, proxy.socket, payload.target);
      var target = Peer.find(payload.source, this.localPeers);
      if (!target) {
        logger.warn('Connect message target not found in local peers: ', payload, this.localPeers);
      } else {
        logger.log('Local target peer: ', target);
      }
      Channel.connectPeers(peer, [target]);
      this.remotePeers.push(peer);
      logger.log('Added remote peer: ', peer);
    }*/
  }.bind(this));

  proxy.socket.on('close', function () {
    logger.log('proxy connection closed');
    Proxy.close(proxy, this.proxies, this.remotePeers, this.localPeers);

    logger.log('localPeers', this.localPeers);
    logger.log('remotePeers', this.remotePeers);
    logger.log('proxies', this.proxies);

  }.bind(this));
}

App.prototype.destroy = function () {
  appLogger.info('destroy');
};

module.exports = App;