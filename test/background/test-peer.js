var helpers = require('../helpers');

var assert = helpers.assert,
    createSocketMock = helpers.createSocketMock,
    createChannelMock = helpers.createChannelMock;


var Peer = require('../../background/src/peer'),
    EventSource = require('../../background/lib/event-source');

describe('Peer', function () {
  describe('creation', function () {
    it('should wrap a web socket object', function () {
      var socket = createSocketMock(),
          peer = new Peer(socket, createChannelMock());

      assert.equal(peer.socket, socket);
    });
    it('should give back a websocket as its value', function () {
      var socket = createSocketMock(),
          peer = new Peer(socket, createChannelMock());

      assert.equal(peer.valueOf(), socket);
    });
    it('should generate an id', function () {
      var UUID_LENGTH = 36,
          socket = createSocketMock(),
          peer = new Peer(socket, createChannelMock());

      assert.isString(peer.id);
      assert.equal(peer.id.length, UUID_LENGTH);
    });
    it('should generate a URL', function () {
      var peer = new Peer(createSocketMock(), createChannelMock());

      assert.equal(peer.url, '/mock-channel/' + peer.id + '/%s');
    });
    it('should allow messages to be sent', function () {
      var socket = createSocketMock(),
          msg = { a:1, b:2 },
          peer = new Peer(socket, createChannelMock());

      peer.send(msg);
      assert.ok(socket.send.called);
      assert.ok(socket.send.calledWith(msg));
    });
    it('should allow messages to be received', function (done) {
      var socket = createSocketMock(),
          msg = { a:1, b:2 },
          peer = new Peer(socket, createChannelMock());

      peer.addEventListener('message', function (data) {
        assert.equal(data, msg);
        done();
      });

      socket.dispatchEvent('message', msg);
    });
  });
});