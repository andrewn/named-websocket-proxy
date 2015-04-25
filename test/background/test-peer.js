var helpers = require('../helpers');

var assert = helpers.assert,
    stub = helpers.stub,
    createSocketMock = helpers.createSocketMock,
    createChannelMock = helpers.createChannelMock;


var Peer = require('../../background/src/peer'),
    EventSource = require('../../background/lib/event-source');

describe('Peer', function () {
  describe('create', function () {
    it ('creates a peer data structure', function () {
      var socket = createSocketMock(),
          channel = { name: 'channel-1' },
          expected = {
            id: 'abc-123',
            ip: '102.01.203.1',
            channel: 'channel-1',
            socket: socket
          };
      assert.deepEqual(Peer.create(channel, socket, '102.01.203.1', 'abc-123'), expected);
    });
    it ('throws if id given but not ip (implies remote peer)', function () {
      var socket = createSocketMock(),
          channel = { name: 'channel-1' };

      assert.throws(function () {
        Peer.create(channel, socket, undefined, 'id-123');
      });
    });
    it ('generates id if not provided', function () {
      var oldIdFunc = Peer.id;

      Peer.id = stub().returns('uuid-id');

      var socket = createSocketMock(),
          channel = { name: 'channel-1' },
          expected = {
            id: 'uuid-id',
            channel: 'channel-1',
            socket: socket
          };
      assert.deepEqual(Peer.create(channel, socket), expected);
      Peer.id = oldIdFunc;
    });
  });
  describe('id', function () {
    it('should generate an id', function () {
      var UUID_LENGTH = 36,
          id = Peer.id();

      assert.isString(id);
      assert.equal(id.length, UUID_LENGTH);
    });
  });
  describe('find', function () {
    it('throws if no id or list given', function () {
      assert.throws(function () {
        Peer.find('peer-1');
      });
      assert.throws(function () {
        Peer.find(undefined, []);
      });
    });
    it('finds peer by id', function () {
        var a = { id: 'peer-a', channel: 'channel-1' },
            b = { id: 'peer-b', channel: 'channel-2' },
            c = { id: 'peer-c', channel: 'channel-1' };

        var actual = Peer.find('peer-b', [a, b, c]);

        assert.equal(actual, b);
    });
  });
  describe('remove', function () {
    it('removes peer from list', function () {
      var a = { id: 'peer-a', channel: 'channel-1' },
          b = { id: 'peer-b', channel: 'channel-2' },
          c = { id: 'peer-c', channel: 'channel-1' },
          list = [a, b, c];

      Peer.remove(b, list);

      assert.deepEqual(list, [a, c]);
    });
  });
});