var helpers = require('../helpers');

var assert = helpers.assert,
    spy    = helpers.spy,
    createSocketMock = helpers.createSocketMock,
    createChannelMock = helpers.createChannelMock;

var PeerDiscovery = require('../../background/src/peer-discovery'),
    EventEmitter = require('events').EventEmitter,
    Peer = require('../../background/src/peer'),
    createMdnsMock;

var newPeerMdnsData = require('../fixtures/peer-new.json'),
    peerGoodbyeMdnsData = require('../fixtures/peer-goodbye.json');

createMdnsMock = function () {
  var constructor = function (opts) {
    opts = opts || {};

    var instance = new EventEmitter();
    instance.port = opts.port;
    instance.responseSpy = spy();
    instance.respond = function (params, cb) {
      if(cb) { cb(); }
      instance.responseSpy.apply(instance.responseSpy, arguments);
    };
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
          pd = new PeerDiscovery('my-computer', { mdns: mdns });
      pd.init();
      assert.equal(pd.mdns, mdns.instance);
    });
    it('should allow mdns port to be specified', function () {
      var mdns = createMdnsMock();
      var pd = new PeerDiscovery('my-computer', { mdnsPort: 1234, mdns: mdns });
      pd.init('0.0.0.0', 5678);
      assert.equal(mdns.instance.port, 1234);
    });
  });
  describe('init', function () {
    it('should allow host address and port to be specified', function () {
      var mdns = createMdnsMock(),
          pd = new PeerDiscovery('my-computer', { mdns: mdns });

      pd.init('123.123.1.1', 5678);

      assert.equal(pd.ip, '123.123.1.1');
      assert.equal(pd.port, 5678);
    });
  });
  describe('.advertisePeer()', function () {
    it('should construct Named WebSocket DNS-SD records for Peer', function (done) {
      // Increase timeout since spread 1 sec apart
      this.timeout(2100);

      var mdns = createMdnsMock(),
          c = createChannelMock(),
          p = { id: 'peer-a', channel: 'channel-a', socket: createSocketMock() },
          pd = new PeerDiscovery('my-computer', { mdns: mdns });

      pd.init('123.123.1.1', 5678);

      pd.advertisePeer(p)
        .then(function () {
          assert.ok(mdns.instance.responseSpy.called);
          assert.equal(mdns.instance.responseSpy.callCount, 3);
          done();
        });
    });
  });
  describe('.cancelPeerAdvert()', function () {
    it('should construct goodbye DNS-SD PTR, SRV and TXT records for Peer with TTL 0', function (done) {
      // Increase timeout since spread 1 sec apart
      this.timeout(2100);

      var mdns = createMdnsMock(),
          c = createChannelMock(),
          p = { id: 'peer-a', channel: 'channel-a', socket: createSocketMock() },
          pd = new PeerDiscovery('my-computer', { mdns: mdns });

      pd.init('123.123.1.1', 5678);

      pd.cancelPeerAdvert(p)
        .then(function () {
          assert.ok(mdns.instance.responseSpy.called);
          assert.equal(mdns.instance.responseSpy.callCount, 3);
          assert.equal(mdns.instance.responseSpy.firstCall.args[0].answers.length, 3);
          done();
        });
    });
  });
  describe('.on discover', function () {
    it('should parse incoming DNS-SD responses into Peer', function (done) {
      mdns = createMdnsMock();
      pd = new PeerDiscovery('my-computer', { mdns: mdns });

      pd.init('123.123.1.1', 5678);

      pd.on('discover', function (data) {
        assert.equal(data.peerId, 'b2c5b427-823a-4161-978e-ba3830a7d556');
        assert.equal(data.channelName, 'bbc.nws.test');

        done();
      });

      mdns.instance.emit('response', newPeerMdnsData);
    })
  });
  describe('.on goodbye', function () {
    it('should parse incoming DNS-SD responses into Peer', function (done) {
      mdns = createMdnsMock();
      pd = new PeerDiscovery('my-computer', { mdns: mdns });

      pd.init('123.123.1.1', 5678);

      pd.on('goodbye', function (data) {
        assert.equal(data.peerId, 'b2c5b427-823a-4161-978e-ba3830a7d556');
        assert.equal(data.channelName, 'bbc.nws.test');

        done();
      });

      mdns.instance.emit('response', peerGoodbyeMdnsData);
    })
  });
});