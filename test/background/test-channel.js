var helpers = require('../helpers');

var assert = helpers.assert,
    createPeerMock = helpers.createPeerMock,
    createSocketMock = helpers.createSocketMock;

var Channel = require('../../background/src/channel');

describe('Channel', function () {
  describe('find', function () {
    it('find a channel in a list of channels', function () {
      var a = { name: 'channel-a' },
          b = { name: 'channel-b' };
      var c = Channel.find('channel-a', [a, b]);
      assert.equal(c, a);
    });
    it('should error if no channels given', function () {
      assert.throws(function () {
        Channel.find('my-channel-name');
      });
    });
  });
  // describe('.addSocket', function () {
  //   it('returns a peer object connected to channel', function () {
  //     var s = createSocketMock();
  //     var c = new Channel({ name: 'my-channel-name' });
  //     var p;

  //     p = c.addSocket(s);

  //     assert.ok(p);
  //   });
  //   it('send `connect` message to all peers', function () {
  //     var c = new Channel({ name: 'my-channel-name' }),
  //         s0 = createSocketMock(),
  //         s1 = createSocketMock(),
  //         s2 = createSocketMock();

  //     // Only one peer, no events fired
  //     console.log('Add socket s0');
  //     c.addSocket(s0);
  //     assert.ok(!s0.send.called, 'connect event sent to first peer');
  //     s0.send.reset();

  //     // 2 peers, connect should fire on both
  //     console.log('Add socket s1');
  //     c.addSocket(s1);
  //     assert.ok(s0.send.called, 'connect event should fire on existing peer');
  //     assert.ok(s1.send.called, 'connect event should fire on new peer');
  //     s0.send.reset();
  //     s1.send.reset();

  //     // 3 peers, connect should fire once on existing
  //     // twice on new peer (1 for each existing peer)
  //     console.log('Add socket s2');
  //     c.addSocket(s2);
  //     assert.ok(s0.send.calledOnce, 'connect event should fire on existing peer');
  //     assert.ok(s1.send.calledOnce, 'connect event should fire on existing peer');
  //     assert.ok(s2.send.calledTwice, 'connect event should fire twice on existing peer');

  //   });
  //   it('validates name');
  // });
  // describe('.removePeer', function () {
  //   it('removes peer from list', function () {
  //     var s = createSocketMock();
  //     var c = new Channel({ name: 'my-channel-name' });
  //     var p;

  //     p = c.addSocket(s);

  //     c.removePeer(p);
  //     assert.equal(c.peers.length, 0);
  //   });
  //   it('fires disconnect event on all connected peers', function () {
  //     var s0 = createSocketMock(),
  //         s1 = createSocketMock(),
  //         c = new Channel({ name: 'my-channel-name' }),
  //         p0, p1;


  //     p0 = c.addSocket(s0);
  //     p1 = c.addSocket(s1);

  //     s0.send.reset();
  //     s1.send.reset();

  //     // Removing p0 should fire disconnect on p1
  //     c.removePeer(p0);
  //     assert.ok(!s0.send.called);
  //     assert.ok( s1.send.called);
  //   });
  // });
  // describe('.broadcast', function () {
  //   it('sends messages to all peers', function () {
  //     var payload = 'message';
  //     var s1 = createSocketMock();
  //     var s2 = createSocketMock();
  //     var c = new Channel({ name: 'my-channel-name' });
  //     var p1, p2;

  //     p1 = c.addSocket(createSocketMock());
  //     p2 = c.addSocket(createSocketMock());

  //     p1.socket = s1;
  //     p2.socket = s2;

  //     c.broadcastFromPeer(payload, p1);

  //     assert.ok(!s1.send.called, 'source socket send was called');
  //     assert.ok(s2.send.called, 'receiver socket send was not called');
  //   });
  // });
  // describe('.receive', function () {
  //   it('receives messages from all peers');
  // });
  // describe('.getPeerById', function () {
  //   it('fetches the peer object by id', function () {
  //     var c = new Channel({ name: 'my-channel-name' });
  //     var p1, p2;

  //     p1 = c.addSocket(createSocketMock());

  //     assert.equal( c.getPeerById(p1.id), p1, 'peer was not found');
  //     assert.isNull( c.getPeerById('abcdef-12345-abcdef'), 'non-existent peer was found');
  //   });
  // });
});