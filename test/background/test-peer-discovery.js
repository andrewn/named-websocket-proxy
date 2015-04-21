var helpers = require('../helpers');

var assert = helpers.assert,
    spy    = helpers.spy,
    createSocketMock = helpers.createSocketMock,
    createChannelMock = helpers.createChannelMock;


var PeerDiscovery = require('../../background/src/peer-discovery'),
    Peer = require('../../background/src/peer'),
    createMdnsMock;

createMdnsMock = function () {
  var constructor = function (opts) {
    opts = opts || {};

    var instance = spy();
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
  describe('advertise', function () {
    it('should construct Named WebSocket DNS-SD records for Peer', function () {
      var mdns = createMdnsMock(),
          c = createChannelMock(),
          p = new Peer(createSocketMock(), c),
          pd = new PeerDiscovery('my-computer', '123.123.1.1', 5678, { mdns: mdns });

      pd.advertisePeer(p);

      assert.ok(mdns.instance.response.called);
    });
  });
});