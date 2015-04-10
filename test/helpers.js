var sinon = require('sinon'),
    EventSource = require('../background/lib/event-source');

module.exports = {
  assert: require('chai').assert,
  spy: sinon.spy,
  mock: sinon.mock,
  createPeerMock: (function () {
    var id = 0;
    return function () {
      return { id: 'peer-' + id++, send: sinon.spy() };
    }
  })(),
  createChannelMock: function () {
    return { name: 'mock-channel' };
  },
  createSocketMock: function () {
    var s = new EventSource();
    s.send = sinon.spy();
    return s;
  }
}