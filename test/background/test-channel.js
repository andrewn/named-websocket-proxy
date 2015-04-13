var helpers = require('../helpers');

var assert = helpers.assert,
    createPeerMock = helpers.createPeerMock,
    createSocketMock = helpers.createSocketMock;

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
  describe('.addSocket', function () {
    it('returns a peer object connected to channel', function () {
      var s = createSocketMock();
      var c = new Channel({ name: 'my-channel-name' });
      var p;

      p = c.addSocket(s);

      assert.ok(p);
    });
    it('send `connect` message on all peers', function () {
      var c = new Channel({ name: 'my-channel-name' }),
          s1 = createSocketMock(),
          s2 = createSocketMock();

      c.addSocket(s1); // no conect fired
      c.addSocket(s2); // connect fired on s1

      assert.ok(s1.send.called, 'first peer not called');
      assert.ok(s2.send.notCalled, 'second peer called');
    });
    it('validates name');
  });
  describe('.removePeer', function () {
    it('removes peer from list', function () {
      var s = createSocketMock();
      var c = new Channel({ name: 'my-channel-name' });
      var p;

      p = c.addSocket(s);

      c.removePeer(p);
      assert.equal(c.peers.length, 0);
    });
    it('fires disconnect event on all connected peers', function () {
      var s = createSocketMock();
      var c = new Channel({ name: 'my-channel-name' });
      var p;

      p = c.addSocket(s);

      c.removePeer(p);
      assert.equal(c.peers.length, 0);
    });
  });
  describe('.send', function () {
    it('sends messages to all peers');
  });
  describe('.receive', function () {
    it('receives messages from all peers');
  });
});