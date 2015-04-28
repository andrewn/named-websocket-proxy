var _ = require('lodash'),
    Promise = require('es6-promise').Promise,
    os = require('os');

function findv4Ip() {
  return new Promise(function (resolve, reject) {
    var interfaces =  _(os.networkInterfaces()).values().flatten().value();

    var v4IpMatcher = /\d+\.\d+\.\d+\.\d+/,
        addresses = _.filter(interfaces, { internal: false, family: 'IPv4' });

    if (addresses == null || addresses.length === 0) { throw Error('cannot find IP address'); }

    resolve(addresses[0].address);
  });
}

module.exports = {
  findv4Ip: findv4Ip
};