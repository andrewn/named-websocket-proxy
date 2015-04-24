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
          msg = { "action":"broadcast", "data":"all" };

      var state = Router.handleLocalDisconnection(channel, a, [a, b], [c], [channel]);

      assert.ok(!a.socket.send.called, 'a was called');
      assert.ok( b.socket.send.called, 'b was not called');
      assert.ok( c.socket.send.called, 'c was not called');

      assert.deepEqual(state.locals, [b]);
      assert.deepEqual(state.channels, [channel]);
    });
    it('removes channel if no local peers left', function () {
      var channel = { name: 'channel-1' },
          a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-1', socket: createSocketMock() },
          msg = { "action":"broadcast", "data":"all" };

      var state = Router.handleLocalDisconnection(channel, a, [a], [], [channel]);

      assert.deepEqual(state.channels, []);
    });
  });
});