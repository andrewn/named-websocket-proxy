var State = require('ampersand-state');

var Peers = require('./peers');

var instanceMethods = {
  addPeer: function (p) {
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

module.exports = Channel;