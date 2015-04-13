var State = require('ampersand-state');

var Peers = require('./peers'),
    Peer = require('./peer');

var Channel = function (params) {
  this.name = params.name;
  if (!this.name) {
    throw new Error('name is required');
  }

  this.peers = new Peers();
}

Channel.prototype.addSocket = function (s) {
  var p = new Peer(s, this);
  this.peers.forEach(connectPeer(p));
  this.peers.push(p);
  return p;
}

Channel.prototype.removePeer = function (p) {
  this.peers.remove({ id: p.id });
  return p;
}

Channel.prototype.broadcastFromPeer = function (msg, peer) {
  this.peers.reject(peer).forEach(broadcastMsgFromPeer(msg, peer));
}

function broadcastMsgFromPeer(payload, sourcePeer) {
  return function (targetPeer) {
    var msg = JSON.stringify({
        action: 'broadcast',
        source: sourcePeer.id,
        target: targetPeer.id,
        data  : payload,
      });
    targetPeer.send(msg);
  }
}

function connectPeer(sourcePeer) {
  return function (targetPeer) {
    var msg = JSON.stringify({
        action:  'connect',
        source:  sourcePeer.id,
        target:  targetPeer.id,
        payload: /* payload */ '',
      });
    targetPeer.send(msg);
  }
}

module.exports = Channel;