var EventSource = require('../lib/event-source'),
    _ = require('lodash');

var Peer = function (socket) {
  EventSource.apply(this);
  this.socket = socket;
  this.socket.addEventListener('message', this.handleEvent.bind(this));
};

Peer.prototype.__proto__ = EventSource.prototype;

Peer.prototype.handleEvent = function () {
  var eventArgs = ['message'].concat( _.toArray(arguments) );
  return this.dispatchEvent.apply(this, eventArgs);
};

Peer.prototype.send = function () {
  return this.socket.send.apply(this, arguments);
};

Peer.prototype.valueOf = function () {
  return this.socket;
};

module.exports = Peer;