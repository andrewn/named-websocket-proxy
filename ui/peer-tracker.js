window.peerTracker = function (peers, events) {

  var channel = new NetworkWebSocket('bbc.nws.test');

  channel.onopen = function (evt) {
    log('👪CHANNEL: Connected', evt);
    events.push({ type:'channel', name: 'connected' });
  }

  channel.onmessage = function(evt) {
    log("👪CHANNEL: Broadcast message: " + evt.data, evt);
    events.push({ type:'channel', name: 'message', data: evt.data });
  };

  // Stop
  channel.onclose = function(evt) {
    log("👪CHANNEL: Connection terminated");
    events.push({ type:'channel', name: 'close' });
  };

  channel.onconnect = function(evt) {
    var peer = { id: evt.detail.target.id, socket: evt.detail.target };
    log("👪CHANNEL: Peer connected: " + peer.id, evt);
    attachWebSocketLifecycleEventsAndSayHello(peer);
    peers.push(peer);
  };

  channel.ondisconnect = function(evt) {
    log("👪CHANNEL: Peer disconnected: " + evt.detail.target.id, evt);
    _.remove(peers, { id: evt.detail.target.id });
  };

  log('Started');

  function attachWebSocketLifecycleEventsAndSayHello(peer) {
    var socket = peer.socket;
    socket.onopen = function (evt) {
      log("🚶PEER: Peer connection complete", evt);
    }
    socket.onmessage = function (evt) {
      log("🚶PEER: Direct message from peer: " + evt.data, evt);
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