var helpers = require('../helpers');

var assert = helpers.assert,
    stub = helpers.stub,
    createSocketMock = helpers.createSocketMock,
    createChannelMock = helpers.createChannelMock;


var Proxy = require('../../background/src/proxy'),
    protocol = require('../../background/src/shim-protocol');

describe('Proxy', function () {
  describe('close', function () {
    it ('tidies up', function () {
      var a = { id: 'peer-a', channel: 'channel-1', socket: createSocketMock() },
          b = { id: 'peer-b', channel: 'channel-1', socket: createSocketMock() },
          c = { id: 'peer-c', ip: '1.1.1.1', channel: 'channel-1', socket: createSocketMock() };

      var proxy = { ip: '1.1.1.1' },
          proxies = [ proxy ],
          locals = [ a, b ],
          remotes = [ c ],
          expectedMsg = JSON.stringify(protocol.disconnect(c, a));

      Proxy.close(proxy, proxies, locals, remotes);

      // Proxy would be deleted
      assert.deepEqual(proxies, [], 'proxy should be deleted');

      // Remote would be deleted
      assert.deepEqual(remotes, [], 'remote should be deleted');

      // Locals in same channel would have disconnect message sent
      assert.ok(a.socket.send.called, 'send not called');
      assert.ok(a.socket.send.calledWith(expectedMsg), 'disconnect not sent');
      assert.ok(!c.socket.send.called, 'send was called');
    });
  });
});