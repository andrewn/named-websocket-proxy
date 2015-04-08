var chai = require('chai');

var assert = chai.assert;

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
    it('does nothing if it\'s already added', function () {
      var c = new Channel({ name: 'my-channel-name' });
      var p = {};
      c.addPeer(p);
      assert.equal(1, c.peers.length);

      c.addPeer(p);
      assert.equal(1, c.peers.length);
    });
    it('fires `connect` event on all peers');
    it('validates name');
  });
  describe('.send', function () {
    it('sends messages to all peers');
  });
  describe('.receive', function () {
    it('receives messages from all peers');
  });
});