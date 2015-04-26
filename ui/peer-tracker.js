window.peerTracker = function (channels, events) {

  var name = 'bbc.nws.test',
      socket  = new NetworkWebSocket(name),
      channel = { id: name, socket: socket, peers: [] };

  channels.push(channel);

  socket.onopen = function (evt) {
    log('👪CHANNEL: Connected', evt);
    events.push({ type:'channel', name: 'connected' });
  }

  socket.onmessage = function(evt) {
    log("👪CHANNEL: Broadcast message: " + evt.data, evt);
    events.push({ type:'channel', name: 'message', data: evt.data });
  };

  // Stop
  socket.onclose = function(evt) {
    log("👪CHANNEL: Connection terminated");
    events.push({ type:'channel', name: 'close' });
  };

  socket.onconnect = function(evt) {
    var peer = { id: evt.detail.target.id, socket: evt.detail.target };
    log("👪CHANNEL: Peer connected: " + peer.id, evt);
    attachWebSocketLifecycleEventsAndSayHello(peer);
    channel.peers.push(peer);
  };

  socket.ondisconnect = function(evt) {
    log("👪CHANNEL: Peer disconnected: " + evt.detail.target.id, evt);
    _.remove(channel.peers, { id: evt.detail.target.id });
  };

  log('Started');

  function attachWebSocketLifecycleEventsAndSayHello(peer) {
    var socket = peer.socket;
    socket.onopen = function (evt) {
      log("🚶PEER: Peer connection complete", evt);
    }
    socket.onmessage = function (evt) {
      log("🚶PEER: Direct message from peer: " + evt.data, evt);
      events.push({ type:'peer', name: 'ping', id: peer.id });
    }
    socket.onclose = function (evt) {
      log("🚶PEER: Peer disconnected", peer.id);
    }
    socket.onerror = function (evt) {
      log("🚶PEER: Peer error", peer.id);
    }
  }

  function log() {
    console.log.apply(console, arguments);
  }
}