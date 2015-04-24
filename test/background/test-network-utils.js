var helpers = require('../helpers');

var assert = helpers.assert,
    stub = helpers.stub;


var utils = require('../../background/src/network-utils');

describe('network-utils', function () {
  describe('findv4Ip', function () {
    it('should return the IP in a promise', function () {
      var interfaces = [{"address":"fe80::7ed1:c3ff:fedf:5c61","name":"en0","prefixLength":64},{"address":"192.168.0.7","name":"en0","prefixLength":24},{"address":"fe80::4cfe:41ff:fec3:8b7b","name":"awdl0","prefixLength":64},{"address":"fe80::b70a:9d71:17cd:e7dc","name":"utun0","prefixLength":64}];
      var api = stub().returns([interfaces]);
      var promise = utils.findv4Ip(api);
      assert.becomes(promise, '192.168.0.7');
    });
  });
});