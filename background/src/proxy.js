var debug = require('./debug')('Proxy');

var Channel = require('./channel');

Proxy = {
  close: function (proxy, proxies, localPeers, remotePeers) {

    // Find all remote peers using this channel
    var remotes = _.filter(remotePeers, { ip: proxy.ip });

    // Disconnect local peers
    _.forEach(remotes, function (r) {
      var locals = Channel.peers({ name: r.channel }, localPeers);
      Channel.disconnectPeers(r, locals);
      _.remove(remotePeers, { id: r.id });
    });

    // Remove proxy
    _.remove(proxies, { ip: proxy.ip });

    return {
      proxies: proxies,
      remotes: remotePeers
    };
  }
}

// var Proxy = function (address, port, channels, debug) {

//   this.httpServer_ = new HttpServer(debug);
//   this.wsServer_ = new WebSocketServer(this.httpServer_);
//   this.httpServer_.listen(port, address);

//   this.channels_ = channels;
//   // this.proxyConnections_ = new ProxyConnections();

//   this.httpServer_.addEventListener('request', function (req) {
//     debug.log('An HTTP request!', req);
//     req.writeHead(404, {});
//     req.end();

//     // Keep socket open until we explicitly
//     // call req.end()
//     return true;
//   });

//   this.wsServer_.addEventListener('request', function (req) {
//     debug.log('WebSocket request', req);
//     var keepConnectionOpen, channelName, socket;

//     if ('url' in req.headers) {
//       channelName = req.headers.url.replace(/^\//, '');
//     }

//     if (!channelName) {
//       req.reject();
//       keepConnectionOpen = false;
//       return keepConnectionOpen;
//     } else {
//       socket = req.accept();
//       keepConnectionOpen = true;
//     }

//     // Associate socket with channel
//     var channel = this.channels_.findOrCreate(channelName);
//     var peer = channel.addSocket(socket);

//     socket.addEventListener('message', function (evt) {
//       debug.log('Message from peer id: ', peer.id);

//       var payload = {}, targetPeer;
//       try {
//         payload = JSON.parse(evt.data);
//       } catch (err) {
//         console.error('Error parsing message', err, evt);
//       }

//       if (payload.action === 'broadcast') {
//         debug.log('Broadcast action: ', payload);
//         channel.broadcastFromPeer(payload.data, peer);
//       }
//       else if (payload.action === 'message') {
//         debug.log('Direct message action: ', payload);
//         targetPeer = channel.getPeerById(payload.target);
//         if (targetPeer) {
//           targetPeer.send( protocol.message(peer, payload.data) );
//         }
//       }
//     });

//     socket.addEventListener('close', function () {
//       debug.log('Socket has closed, removing peer id: ', peer.id);
//       channel.removePeer(peer);
//       debug.log('Channel ', channel.name, ' has ', channel.peers.length, ' connected peers');
//     });

//     debug.log('New peer on channel ', channel.name, ' has ', channel.peers.length, ' connected peers');
//     debug.log('Peer has id ', peer.id);

//     this.emit('peer:add', peer);

//     return keepConnectionOpen;
//   }.bind(this));
// };

// Proxy.prototype = new EventEmitter();

// Proxy.prototype.disconnect = function () {
//   this.httpServer_.disconnect();
// }

module.exports = Proxy;