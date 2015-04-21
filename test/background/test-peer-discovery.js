var helpers = require('../helpers');

var assert = helpers.assert,
    spy    = helpers.spy,
    createSocketMock = helpers.createSocketMock,
    createChannelMock = helpers.createChannelMock;

var PeerDiscovery = require('../../background/src/peer-discovery'),
    EventEmitter = require('events').EventEmitter,
    Peer = require('../../background/src/peer'),
    createMdnsMock;

var newPeerMdnsData = require('../fixtures/peer-new.json');

createMdnsMock = function () {
  var constructor = function (opts) {
    opts = opts || {};

    var instance = new EventEmitter();
    instance.port = opts.port;
    instance.respond = spy();
    instance.response = instance.respond;

    constructor.instance = instance;
    return instance;
  };
  return constructor;
};

describe('PeerDiscovery', function () {
  describe('creation', function () {
    it('should allow mdns library injection', function () {
      var mdns = createMdnsMock(),
          pd = new PeerDiscovery('my-computer', '123.123.1.1', 5678, { mdns: mdns });

      assert.equal(pd.mdns, mdns.instance);
    });
    it('should allow mdns port to be specified', function () {
      var mdns = createMdnsMock();
      var pd = new PeerDiscovery('my-computer', '123.123.1.1', 5678, { mdnsPort: 1234, mdns: mdns });
      assert.equal(mdns.instance.port, 1234);
    });
  });
  describe('.advertisePeer()', function () {
    it('should construct Named WebSocket DNS-SD records for Peer', function () {
      var mdns = createMdnsMock(),
          c = createChannelMock(),
          p = new Peer(createSocketMock(), c),
          pd = new PeerDiscovery('my-computer', '123.123.1.1', 5678, { mdns: mdns });

      pd.advertisePeer(p);

      assert.ok(mdns.instance.response.called);
    });
  });
  describe('.on peer:discover', function () {
    it('should parse incoming DNS-SD responses into Peer', function (done) {
      mdns = createMdnsMock();
      pd = new PeerDiscovery('my-computer', '123.123.1.1', 5678, { mdns: mdns });

      pd.on('peer:discover', function (data) {
        assert.equal(data.peerId, 'b2c5b427-823a-4161-978e-ba3830a7d556');
        assert.equal(data.channelName, 'bbc.nws.test');

        done();
      });

      mdns.instance.emit('response', newPeerMdnsData);
    })
  });
});