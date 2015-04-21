var Collection = require('ampersand-collection'),
    lodashMixin = require('ampersand-collection-lodash-mixin');

var ProxyConnection = require('./proxy-connection');

var instanceMethods = {
};

var ProxyConnections = Collection.extend(instanceMethods, lodashMixin, {
   model: ProxyConnection,
   mainIndex: 'ip'
});

module.exports = ProxyConnections;