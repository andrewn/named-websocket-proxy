var Collection = require('ampersand-collection'),
    lodashMixin = require('ampersand-collection-lodash-mixin');

var Channel = require('./channel');

var instanceMethods = {
  findOrCreate: function (name) {
    var channel = this.get(name);

    if (!channel) {
      channel = new Channel({ name: name });
      this.add(channel);
    }

    return channel;
  }
};

var Channels = Collection.extend(instanceMethods, lodashMixin, {
   model: Channel,
   mainIndex: 'name'
});

module.exports = Channels;