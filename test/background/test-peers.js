var chai = require('chai');

var assert = chai.assert;

var Peers = require('../../background/src/peers');

describe('Peers', function () {
  describe('creation', function () {
    it('is initially empty', function () {
      var peers = new Peers();
      assert.equal(0, peers.length);
    });
  });
  describe('add', function () {
    it('ignores peer if it\'s already added', function () {
      var peers = new Peers();
      var p = {};
      peers.add(p);
      assert.equal(1, peers.length);

      peers.add(p);
      assert.equal(1, peers.length);
    });
  });
});