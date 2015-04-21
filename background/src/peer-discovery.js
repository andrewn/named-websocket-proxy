var multicastDNS = require('multicast-dns'),
    EventEmitter = require('events').EventEmitter,
    _ = require('lodash');

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

  this.mdns.on('response', this.handleResponse.bind(this));
};

PeerDiscovery.prototype = new EventEmitter();

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
      record.ptr.encode(params),
      record.srv.encode(params),
      record.txt.encode(params),
      record.a.encode(params)
    ]
  });
};

PeerDiscovery.prototype.handleResponse = function (dns) {
  var ptr, srv, txt, a, data, peer;

  if (dns.answers.length == 0) {
    return;
  }

  ptr = _.find(dns.answers, { type: 'PTR' });
  srv = _.find(dns.answers, { type: 'SRV' });
  txt = _.find(dns.answers, { type: 'TXT' });
  a   = _.find(dns.answers, { type: 'A' });

  data = record.parse(ptr, srv, txt, a);
console.log('data', data);
  if ( record.isValid(data)  ) {
console.log('firing!', data)
    this.emit('peer:discover', data);
  } else {
    console.warn('Advertising packet did not contain a whole peer advert', data);
  }
};

module.exports = PeerDiscovery;