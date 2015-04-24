var EventSource = require('../lib/event-source'),
    uuid = require('node-uuid');
    _ = require('lodash'),
    debug = require('./debug')('Peer');

var Peer = {
  find: function (id, peers) {
    if (id == null) { throw Error('no peer id given'); }
    if (peers == null) { throw Error('no peer list given'); }

    return _.find(peers, { id: id });
  },
  id: function () {
    var id = uuid.v4();
    return id;
  },
  create: function (channel, socket, optIpAddr, optId) {
    if (optId && !optIpAddr) {
      throw Error('If id provided, ip must also be supplied');
    }

    var peer = {
        id: optId || Peer.id(),
        channel: channel.name,
        socket: socket
      };

    if (optIpAddr) { peer.ip = optIpAddr; }

    return peer;
  },
  remove: function (peer, peers) {
    return _.remove(peers, { id: peer.id });
  },
  send: function (peer, payload) {
    var data = JSON.stringify(payload);
    debug.log('Peer id: ', peer.id, ' send data: ', data);
    peer.socket.send(data);
  }
}

module.exports = Peer;