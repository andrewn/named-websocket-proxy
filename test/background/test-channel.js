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

  describe('connectPeers', function () {
    it('should throw if newPeer not given', function () {
      assert.throws(function () {
        Channel.connectPeers(null, target);
      });
    });
    it('should throw if peers not given', function () {
      assert.throws(function () {
        Channel.connectPeers(source, null);
      });
    });
    it('should send messages to each peer', function () {
      var source = { id: 'peer-a', socket: createSocketMock() },
          target = { id: 'peer-b', socket: createSocketMock() },
          sourceExpectedMsg = JSON.stringify({"action":"connect","source":"peer-a","target":"peer-b","payload":""}),
          targetExpectedMsg = JSON.stringify({"action":"connect","source":"peer-b","target":"peer-a","payload":""});

      Channel.connectPeers(source, [target]);

      // Targets is called abotu source
      assert.ok(target.socket.send.called, 'target not called');
      assert.ok(target.socket.send.calledWith(targetExpectedMsg), 'target message not as expected');

      // Souce is called about target
      assert.ok(source.socket.send.called, 'source not called');
      assert.ok(source.socket.send.calledWith(sourceExpectedMsg), 'source message not as expected');

    });
    it('should error if no channels given', function () {
      assert.throws(function () {
        Channel.find('my-channel-name');
      });
    });
  });

  describe('disconnectPeers', function () {
    it('should throw if newPeer or peers not given', function () {
      assert.throws(function () {
        Channel.disconnectPeers(null, target);
      });
      assert.throws(function () {
        Channel.disconnectPeers(source, null);
      });
    });
    it('should send disconnect message to each peer', function () {
      var source = { id: 'peer-a', socket: createSocketMock() },
          target = { id: 'peer-b', socket: createSocketMock() },
          targetExpectedMsg = JSON.stringify({"action":"disconnect","source":"peer-b","target":"peer-a","payload":""});

      Channel.disconnectPeers(source, [target]);

      // Targets is called abotu source
      assert.ok(target.socket.send.called, 'target not called');
      assert.ok(target.socket.send.calledWith(targetExpectedMsg), 'target message not as expected');

      // Source is not called as it's disconnected
      assert.ok(!source.socket.send.called);
    });
    it('should error if no channels given', function () {
      assert.throws(function () {
        Channel.find('my-channel-name');
      });
    });
  });

  describe('peers', function () {
    it('should find peers for channel', function () {
      var a = { id: 'peer-a', channel: 'channel-1' },
          b = { id: 'peer-b', channel: 'channel-2' },
          c = { id: 'peer-c', channel: 'channel-1' },
          channel = { name: 'channel-1' };

      var actual = Channel.peers(channel, [a, b, c]);

      assert.equal(actual.length, 2, 'wrong number of peers found');
      assert.deepEqual(actual, [a, c]);
    });
  });

  describe('broadcastMessage', function () {
    it('should error if no source, peers or msg given', function () {
      var a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-2', socket: createSocketMock() },
          c = { id: 'peer-c', channel: 'channel-1', socket: createSocketMock() };

      assert.throws(function () {
        Channel.broadcastMessage(null, [a, b], 'hello');
      });
      assert.throws(function () {
        Channel.broadcastMessage(a, undefined, 'hello');
      });
      assert.throws(function () {
        Channel.broadcastMessage(a, [], 'hello');
      });
      assert.throws(function () {
        Channel.broadcastMessage(a, [b, c]);
      });
    });
    it('should send message to all given peers', function () {
      var a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-2', socket: createSocketMock() },
          c = { id: 'peer-c', channel: 'channel-1', socket: createSocketMock() };

      var expectedMsgB = JSON.stringify({"action":"message","source":"peer-a","target":"peer-b","data":"hello"}),
          expectedMsgC = JSON.stringify({"action":"message","source":"peer-a","target":"peer-c","data":"hello"});

      Channel.broadcastMessage(a, [b, c], 'hello');

      assert.ok(!a.socket.send.called, 'source should not be called');
      assert.ok(b.socket.send.calledWith(expectedMsgB), 'b should be called');
      assert.ok(c.socket.send.calledWith(expectedMsgC), 'c should be called');
    })
  });

  describe('directMessage', function () {
    it('should error if no source, target or msg given', function () {
      var a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-1', socket: createSocketMock() };

      assert.throws(function () {
        Channel.directMessage(null, b, 'hello');
      });
      assert.throws(function () {
        Channel.broadcastMessage(a, undefined, 'hello');
      });
      assert.throws(function () {
        Channel.broadcastMessage(a, b);
      });
    });
    it('should send message from source to target', function () {
      var a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-1', socket: createSocketMock() };

      var expectedMsgB = JSON.stringify({"action":"message","source":"peer-a","target":"peer-b","data":"hello"});

      Channel.directMessage(a, b, 'hello');

      assert.ok(!a.socket.send.called);
      assert.ok( b.socket.send.calledWith(expectedMsgB));
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