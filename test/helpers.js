var sinon = require('sinon'),
    chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    EventSource = require('../background/lib/event-source');

chai.use(chaiAsPromised);

module.exports = {
  assert: chai.assert,
  spy: sinon.spy,
  stub: sinon.stub,
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
  createSocketMock: (function () {
    var id = 0;
    return function () {
      var s = new EventSource();
      s._id = 'socket-' + id++;
      s.send = sinon.spy();
      return s;
    }
  })()
}