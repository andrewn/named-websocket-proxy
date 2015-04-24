var helpers = require('../helpers');

var assert = helpers.assert,
    createPeerMock = helpers.createPeerMock;

var Channels = require('../../background/src/channels');

describe.skip('Channels', function () {
  describe('.findOrCreate', function () {
    beforeEach(function () {
      this.c = new Channels();
    });
    it('should create a new Channel if none exists', function () {
      var channelA = this.c.findOrCreate('channel-a');
      assert.ok(channelA);

      var channelB = this.c.findOrCreate('channel-b');
      assert.ok(channelB);

      assert.notEqual(channelA, channelB);
    });
  });
});