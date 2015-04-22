var _ = require('lodash');

// var Channel = require('./channel');

// var instanceMethods = {
//   findOrCreate: function (name) {
//     var channel = this.get(name);

//     if (!channel) {
//       channel = new Channel({ name: name });
//       this.add(channel);
//     }

//     return channel;
//   }
// };

// var Channels = Collection.extend(instanceMethods, lodashMixin, {
//    model: Channel,
//    mainIndex: 'name'
// });

module.exports = {
  find: function (name, channels) {
    return _.find(channels, { name: name });
  }
}