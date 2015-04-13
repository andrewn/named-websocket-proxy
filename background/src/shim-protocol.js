var _ = require('lodash');

var Message = function (props) {
  _.assign(this, props);
}

Message.prototype.valueOf = function () {
  var value = {};
  _.assign(value, this);
  return value;
}

Message.prototype.toString = function () {
  return JSON.stringify(this);
}

module.exports = {
  Message: Message,
  connect: function (sourcePeer, targetPeer) {
    return new Message({
      action:  'connect',
      source:  targetPeer.id,
      target:  sourcePeer.id,
      payload: '',
    });
  },
  disconnect: function (sourcePeer) {
    return new Message({
      action:  'disconnect',
      target:  sourcePeer.id,
      payload: '',
    });
  },
  broadcast: function (sourcePeer, targetPeer, message) {
    return new Message({
      action:  'broadcast',
      source:  sourcePeer.id,
      target:  targetPeer.id,
      data: message
    });
  },
  message: function (sourcePeer, message) {
    return new Message({
      action:  'message',
      source:  sourcePeer.id,
      data: message
    });
  }
};