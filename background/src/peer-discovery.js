var multicastDNS = require('multicast-dns');

var record = require('./peer-discovery-record');

var PeerDiscovery = function (hostname, ip, port, opts) {
  opts = opts || {};

  this.hostname = hostname;
  this.ip = ip;
  this.port = port;

  var mdnsOpts = {
    port: opts.mdnsPort || 5406,
    platform: 'chromeApp'
  };
  this.mdns = opts.mdns ? opts.mdns(mdnsOpts) : multicastDNS(mdnsOpts);

};

PeerDiscovery.prototype.advertisePeer = function (peer) {
  var params = {
    channelName: peer.channelName,
    peerId: peer.id,
    url: peer.url,
    hostname: this.hostname,
    ip: this.ip,
    port: this.port
  };

  this.mdns.response({
    answers: [
      record.ptr(params),
      record.srv(params),
      record.txt(params),
      record.a(params)
    ]
  });
};

module.exports = PeerDiscovery;