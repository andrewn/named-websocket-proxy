var helpers = require('../helpers');

var assert = helpers.assert,
    stub = helpers.stub,
    createSocketMock = helpers.createSocketMock;


var Router = require('../../background/src/router'),
    protocol = require('../../background/src/shim-protocol');

describe('Router', function () {
  describe('handleLocalMessage', function () {
    it('broadcasts to local peers', function () {
      var channel = { name: 'channel-1' },
          a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-1', socket: createSocketMock() },
          msg = { "action":"broadcast", "data":"all" };


      Router.handleLocalMessage(channel, a, msg, [a, b]);

      assert.ok(!a.socket.send.called);
      assert.ok( b.socket.send.called);
    });
    it('broadcasts to remote peers', function () {
      var channel = { name: 'channel-1' },
          a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-1', ip: '1.2.1.1', socket: createSocketMock() },
          msg = { "action":"broadcast", "data":"all" };

      Router.handleLocalMessage(channel, a, msg, [a], [b]);

      assert.ok(!a.socket.send.called);
      assert.ok( b.socket.send.called);
    });
    it('broadcasts to both types of peers', function () {
      var channel = { name: 'channel-1' },
          a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-1', socket: createSocketMock() },
          c = { id: 'peer-c', channel: 'channel-1', ip: '1.2.1.1', socket: createSocketMock() },
          msg = { "action":"broadcast", "data":"all" };

      Router.handleLocalMessage(channel, a, msg, [a, b], [c]);

      assert.ok(!a.socket.send.called);
      assert.ok( b.socket.send.called);
      assert.ok( c.socket.send.called);
    });
    it('sends direct message to local peer', function () {
      var channel = { name: 'channel-1' },
          a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-1', socket: createSocketMock() },
          msg = {"action":"message","target":"peer-b","data":"blah"};

      Router.handleLocalMessage(channel, a, msg, [a, b]);

      assert.ok(!a.socket.send.called);
      assert.ok( b.socket.send.called);
    });
    it('sends direct message to remote peer', function () {
      var channel = { name: 'channel-1' },
          a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-1', ip: '1.2.1.1', socket: createSocketMock() },
          msg = {"action":"message","target":"peer-b","data":"blah"};

      Router.handleLocalMessage(channel, a, msg, [a], [b]);

      assert.ok(!a.socket.send.called);
      assert.ok( b.socket.send.called);
    });
  });

  describe('handleLocalDisconnection', function () {
    it('sends disconnect to local and remote peers', function () {
      var channel = { name: 'channel-1' },
          a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-1', socket: createSocketMock() },
          c = { id: 'peer-c', channel: 'channel-1', ip: '1.2.1.1', socket: createSocketMock() },
          msg = { "action":"broadcast", "data":"all" },
          locals = [a, b],
          channels = [channel];

      Router.handleLocalDisconnection(channel, a, locals, [c], channels);

      assert.ok(!a.socket.send.called, 'a was called');
      assert.ok( b.socket.send.called, 'b was not called');
      assert.ok( c.socket.send.called, 'c was not called');

      assert.deepEqual(locals, [b]);
      assert.deepEqual(channels, [channel]);
    });
    it('removes channel if no local peers left', function () {
      var channel = { name: 'channel-1' },
          a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-1', socket: createSocketMock() },
          channels = [channel],
          msg = { "action":"broadcast", "data":"all" };

     Router.handleLocalDisconnection(channel, a, [a], [], channels);

      assert.deepEqual(channels, []);
    });
  });

  describe('handleRemoteMessage', function () {
    it('re-broadcasts to local peers', function () {
      var channel = { name: 'channel-1' },
          a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-1', socket: createSocketMock() },
          msg = { "action":"broadcast", "data":"all", "source": "peer-a", "target": "peer-b" };


      Router.handleRemoteMessage(msg, [b]);

      assert.ok(!a.socket.send.called);
      assert.ok( b.socket.send.called);
    });
    it('routes direct message to local peer', function () {
      var channel = { name: 'channel-1' },
          a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-1', socket: createSocketMock() },
          msg = {"action":"message","target":"peer-b","data":"blah"};

      Router.handleRemoteMessage(msg, [b]);

      assert.ok(!a.socket.send.called);
      assert.ok( b.socket.send.called);
    });
    it('connects a new remote peer', function () {
      var channel = { name: 'channel-1' },
          a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          locals = [a],
          remotes = [],
          socket = createSocketMock(),
          msg = {"action":"connect","source":"peer-a","target":"peer-b","data":"blah"};

      Router.handleRemoteMessage(msg, locals, remotes, { ip: '1.1.1.1', socket: socket });

      assert.ok(a.socket.send.called, 'a was not called');
      assert.ok(socket.send.called, 'proxy socket was called');

      assert.equal(remotes.length, 1);
      assert.equal(remotes[0].id, 'peer-b');
    });
    it('disconnects a remote peer', function () {
      var channel = { name: 'channel-1' },
          a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-1', ip: '1.2.3.4', socket: createSocketMock() },
          socket = createSocketMock(),
          locals = [a],
          remotes = [b],
          msg = {"action":"disconnect","source":"peer-a","target":"peer-b","data":""};

      Router.handleRemoteMessage(msg, locals, remotes, { ip: '1.1.1.1', socket: socket });

      assert.ok(a.socket.send.called, 'a was not called');
      assert.ok(!socket.send.called, 'proxy socket was called');

      assert.equal(remotes.length, 0);
    });
  });
});