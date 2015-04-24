var helpers = require('../helpers');

var assert = helpers.assert,
    createPeerMock = helpers.createPeerMock,
    _ = require('lodash');

var protocol = require('../../background/src/shim-protocol');

function assertProperties(obj1, obj2) {
  assert.equal(_.keys(obj1).length, _.keys(obj2).length, 'objects have different keys');
  _.forOwn(obj1, function (value, key) {
    assert.equal(obj1[key], obj2[key], key + ' does not match value ' + value);
  });
}

describe('ShimProtocol', function () {
  describe('class object', function () {
    it('allows property access', function () {
      var message = new protocol.Message({ source: 'hello' });

      assert.equal(message.source, 'hello');
    });
    it('stringfies message', function () {
      var message = new protocol.Message({ source: 'hello' });

      assert.equal(message.toString(), '{"source":"hello"}');
    });
  });
  describe('Message helpers', function () {
    describe('.connect', function () {
      it('returns the right structure', function () {
        var from = createPeerMock(),
            to   = createPeerMock(),
            expected = {
              action:  'connect',
              source:  to.id,
              target:  from.id,
              payload: '',
            },
            actual = protocol.connect(from, to);

        assertProperties(actual, expected);
      });
    });
    describe('.disconnect', function () {
      it('returns the right structure', function () {
        var source = createPeerMock(),
            target = createPeerMock(),
            expected = {
              action:  'disconnect',
              source:  target.id,
              target:  source.id,
              payload: '',
            },
            actual = protocol.disconnect(source, target);

        assertProperties(actual, expected);
      });
    });
    describe('.broadcast', function () {
      it('returns the right structure', function () {
        var source = createPeerMock(),
            target = createPeerMock(),
            expected = {
              action: 'broadcast',
              source: source.id,
              target: target.id,
              data  : 'a message',
            },
            actual = protocol.broadcast(source, target, 'a message');

        assertProperties(actual, expected);
      });
    });
    describe('.message', function () {
      it('returns the right structure', function () {
        var source = createPeerMock(),
            target = createPeerMock(),
            expected = {
              action: 'message',
              source: source.id,
              target: target.id,
              data: 'a direct message'
            },
            actual = protocol.message(source, target, 'a direct message');

        assertProperties(actual, expected);
      });
    });
  });
});