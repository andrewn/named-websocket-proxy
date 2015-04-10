var helpers = require('../helpers');

var assert = helpers.assert,
    createPeerMock = helpers.createPeerMock;

var Peers = require('../../background/src/peers');

describe('Peers', function () {
  describe('creation', function () {
    it('is initially empty', function () {
      var peers = new Peers();
      assert.equal(0, peers.length);
    });
  });
  describe('push', function () {
    it('throws if peer is already added', function () {
      var peers = new Peers();
      var p = createPeerMock();

      peers.push(p);
      assert.equal(1, peers.length);

      assert.throws(function () {
        peers.push(p);
      });
    });
  });
});