var helpers = require('../helpers');

var assert = helpers.assert,
    createPeerMock = helpers.createPeerMock;

var Channel = require('../../background/src/channel');

describe('Channel', function () {
  describe('new', function () {
    it('should have a name', function () {
      var c = new Channel({ name: 'my-channel-name' });
      assert.equal('my-channel-name', c.name);
    });
    it('should validate name');
    it('should have an empty peer list', function () {
      var c = new Channel({ name: 'my-channel-name' });
      assert.equal(0, c.peers.length);
    });
  });
  describe('.addPeer', function () {
    it.skip('does nothing if it\'s already added', function () {
      var c = new Channel({ name: 'my-channel-name' });
      var p = createPeerMock();
      c.addPeer(p);
      assert.equal(1, c.peers.length);

      c.addPeer(p);
      assert.equal(1, c.peers.length);
    });
    it('fires `connect` event on all other peers', function () {
      var c = new Channel({ name: 'my-channel-name' }),
          p1 = createPeerMock(),
          p2 = createPeerMock();

      c.addPeer(p1);
      c.addPeer(p2);

      assert.ok(p1.send.called, 'first peer not called');
      assert.ok(p2.send.notCalled, 'second peer called');
    });
    it('validates name');
  });
  describe('.send', function () {
    it('sends messages to all peers');
  });
  describe('.receive', function () {
    it('receives messages from all peers');
  });
});