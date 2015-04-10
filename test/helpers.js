var sinon = require('sinon'),
    EventSource = require('../background/lib/event-source');

module.exports = {
  assert: require('chai').assert,
  spy: sinon.spy,
  mock: sinon.mock,
  createPeerMock: function () {
    return { send: sinon.spy() };
  },
  createSocketMock: function () {
    var s = new EventSource();
    s.send = sinon.spy();
    return s;
  }
}