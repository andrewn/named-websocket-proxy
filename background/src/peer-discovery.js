var multicastDNS = require('multicast-dns'),
    EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    inherits = require('util').inherits;

var record = require('./peer-discovery-record')
    logger = require('./debug')('Discovery');

var PeerDiscovery = function (hostname, opts) {
  this.opts = opts || {};

  this.hostname = hostname;

  this.mdnsOpts = {
    port: this.opts.mdnsPort || 5407
  };
};

inherits(PeerDiscovery, EventEmitter);

PeerDiscovery.prototype.init = function (targetAddress, targetPort) {
  this.ip = targetAddress;
  this.port = targetPort;

  this.mdns = this.opts.mdns ? this.opts.mdns(this.mdnsOpts) : multicastDNS(this.mdnsOpts);
  this.mdns.on('response', this.handleResponse.bind(this));
};

PeerDiscovery.prototype.advertisePeer = function (peer) {
  var params = {
    channelName: peer.channel,
    peerId: peer.id,
    url: '/nourl', //peer.url,
    hostname: this.hostname,
    ip: this.ip,
    port: this.port
  },
    answers = [
      record.ptr.encode(params),
      record.srv.encode(params),
      record.txt.encode(params),
      record.a.encode(params)
    ];

  logger.log('advertisePeer', params, answers);

  this.mdns.response({
    answers: answers
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

  if (data.ip && data.ip === this.ip) {
    console.log('Ignoring advert from this proxy');
    return;
  }

  if ( record.isValid(data)  ) {
    this.emit('discover', data);
  } else {
    console.warn('Advertising packet did not contain a whole peer advert', data);
  }
};

module.exports = PeerDiscovery;