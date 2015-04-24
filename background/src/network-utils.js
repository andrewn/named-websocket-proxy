var _ = require('lodash'),
    Promise = require('es6-promise').Promise;

function findv4Ip(apiFunc) {
  return new Promise(function (resolve, reject) {
    apiFunc(function (interfaces) {
      var v4IpMatcher = /\d+\.\d+\.\d+\.\d+/,
          addresses = _.pluck(interfaces, 'address');

      var ip = _.find(addresses, function (ip) {
        return v4IpMatcher.test(ip);
      });

      if (ip == null) { throw Error('cannot find IP address'); }

      resolve(ip);
    });
  });
}

module.exports = {
  findv4Ip: findv4Ip
};