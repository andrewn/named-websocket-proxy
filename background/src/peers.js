var _ = require('lodash'),
    lodashMixin = require('ampersand-collection-lodash-mixin');

var Collection = require('ampersand-collection');

var Peers = Collection.extend(lodashMixin, {
  mainIndex: 'id'
});

Peers.prototype.push = function (peer) {
  var p = this.find('id', peer.id),
      result;

  if (p) {
    throw new Error('Peer already exists: ' + peer.id);
    return;
  }

  result = this.add(peer);

  return result;
};

/*
var Peers = function () {
  this.peers = [];
  this.length = 0;
};

['forEach', 'map'].forEach(function (name) {
  Peers.prototype[name] = function () {
    return _[name].apply(this.peers, )
  };
});

Peers.prototype.push = function (peer) {
  var p = _.find(this.peers, 'id', peer.id),
      result;

  if (p) {
    throw new Error('Peer already exists: ' + peer.id);
    return;
  }
  this.length++;
  result = this.peers.push(peer);

  return result;
};
*/

module.exports = Peers;