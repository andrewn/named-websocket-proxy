var Peer = function (socket) {
  this.socket = socket;
};

Peer.prototype.valueOf = function () {
  return this.socket;
}

module.exports = Peer;