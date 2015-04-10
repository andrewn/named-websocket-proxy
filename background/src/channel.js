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
  this.peers.forEach(connect);
  this.peers.push(p);
  return p;
}

function connect(peer) {
  peer.send({
    action: 'connect'
  });
}

/*
function connect(peer) {
  console.log('\n\npeer: ');
  console.log(typeof peer);
  peer.send({
    action: 'connect'
  });
}

var instanceMethods = {
  addPeer: function (p) {
    console.log('addPeer');
    console.log(this.peers.length);

    this.peers.models.forEach(connect);
    this.peers.add(p);
  }
}

var Channel = State.extend(instanceMethods, {
  idAttribute: 'name',
  props: {
    name: {
      type: 'string',
      required: true,
      setOnce: true
    }
  },
  collections: {
    peers: Peers
  }
});
*/

module.exports = Channel;