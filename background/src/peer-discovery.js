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
    port: this.opts.mdnsPort || 5407,
    loopback: false // do not receive our own packets
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

PeerDiscovery.prototype.cancelPeerAdvert = function (peer) {
  var params = {
      channelName: peer.channel,
      peerId: peer.id,
      url: '/nourl', //peer.url,
      hostname: this.hostname,
      ip: this.ip,
      port: this.port
    },
    ptr = record.ptr.encode(params),
    srv = record.srv.encode(params),
    txt = record.txt.encode(params),
    answers;

    ptr.ttl = 0;
    srv.ttl = 0;
    txt.ttl = 0;

    this.mdns.response({
      answers: [ptr, srv, txt]
    });
};

PeerDiscovery.prototype.handleResponse = function (dns) {
  var ptr, srv, txt, a, data, peer;

  if (dns.answers.length == 0) {
    return;
  }

  // TODO: This code currently assumes that all
  //       answers will be for the same resource.
  //       Should cache records and allow
  //       expiry/goodbye messages. Also, re-query
  //       when TTL expires.
  ptr = _.find(dns.answers, { type: 'PTR' });
  srv = _.find(dns.answers, { type: 'SRV' });
  txt = _.find(dns.answers, { type: 'TXT' });
  a   = _.find(dns.answers, { type: 'A' });

  data = record.parse(ptr, srv, txt, a);

  if (data.ip && data.ip === this.ip) {
    console.log('Ignoring advert from this proxy');
    return;
  }

  // FIXME: Won't work since `data` is already parsed
  //        into a data structure by this time.
  if ( record.isGoodbye(data)  ) {
    this.emit('goodbye', data);
  } else if ( record.isAdvert(data) ) {
    this.emit('discover', data);
  } else {
    console.warn('Advertising packet did not contain a whole peer advert', data);
  }
};

module.exports = PeerDiscovery;