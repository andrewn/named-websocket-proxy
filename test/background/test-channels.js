var chai = require('chai');

var assert = chai.assert;

var Channels = require('../../background/src/channels');

describe('Channels', function () {
  describe('.associatePeer', function () {
    beforeEach(function () {
      this.c = new Channels();
    });
    it('should create a new Channel if none exists', function () {
      var channelA = this.c.associatePeer('channel-a', {});
      assert.ok(channelA);

      var channelB = this.c.associatePeer('channel-b', {});
      assert.ok(channelB);

      assert.notEqual(channelA, channelB);
    });
    it('should attach to an existing Channel if it exists', function () {
      var first  = this.c.associatePeer('my-channel-name', {});
      var second = this.c.associatePeer('my-channel-name', {});
      assert.equal(first, second);
    });
  });
});