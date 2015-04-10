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

function connectPeer(sourcePeer) {
  return function (targetPeer) {
    var payload = JSON.stringify({
        action:  'connect',
        source:  sourcePeer.id,
        target:  targetPeer.id,
        payload: /* payload */ '',
      });
    targetPeer.send(payload);
  }
}

module.exports = Channel;