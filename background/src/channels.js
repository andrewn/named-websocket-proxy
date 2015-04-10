var Collection = require('ampersand-collection'),
    lodashMixin = require('ampersand-collection-lodash-mixin');

var Channel = require('./channel');

var instanceMethods = {
  associatePeer: function (name, peer) {
    var channel = this.get(name);

    if (!channel) {
      channel = new Channel({ name: name });
      this.add(channel);
    }
    channel.addPeer(peer);

    return channel;
  }
};

var Channels = Collection.extend(instanceMethods, lodashMixin, {
   model: Channel,
   mainIndex: 'name'
});

module.exports = Channels;