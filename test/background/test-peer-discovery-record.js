var helpers = require('../helpers');

var assert = helpers.assert;


var PeerDiscoveryRecord = require('../../background/src/peer-discovery-record');

describe('PeerDiscoveryRecord', function () {
  describe('PTR', function () {
    it('should create record data', function () {
      var actual = PeerDiscoveryRecord.ptr.encode({
            channelName: 'my-channel-name',
            peerId: 'my-peer-id'
          }),
          expected = {
            'name': '_ws._tcp.local',
            'type': 'PTR',
            'ttl' : 75 * 60,
            'data': 'my-channel-name[my-peer-id]._ws._tcp.local'
          };

      assert.deepEqual(actual, expected);
    });
  });
  describe('SRV', function () {
    it('should create record data', function () {
      var actual = PeerDiscoveryRecord.srv.encode({
            channelName: 'a-channel-name',
            peerId: 'abc123-peer-id',
            port: 12345,
            hostname: 'a-host-name'
          }),
          expected = {
            'name': 'a-channel-name[abc123-peer-id]._ws._tcp.local',
            'type': 'SRV',
            'ttl' : 75 * 60,
            'data': {
              'port': 12345,
              'target': 'a-host-name.local'
            }
          };

      assert.deepEqual(actual, expected);
    });
  });
  describe('TXT', function () {
    it('should create record data', function () {
      var actual = PeerDiscoveryRecord.txt.encode({
              channelName: 'a-channel-name',
              peerId: 'abc123-peer-id',
              url: '/a-channel-name/abc123-peer-id/%s'
            }),
          expected = {
            'name': 'a-channel-name[abc123-peer-id]._ws._tcp.local',
            'type': 'TXT',
            'ttl' : 75 * 60,
            'data': 'path=/a-channel-name/abc123-peer-id/%s'
          };

      assert.deepEqual(actual, expected);
    });
  });
  describe('A', function () {
    it('should create record data', function () {
      var actual = PeerDiscoveryRecord.a.encode({ hostname: 'a-host-name', ip: '1.1.2.19' }),
          expected = {
            'name': 'a-host-name.local',
            'type': 'A',
            'ttl' : 120,
            'data': '1.1.2.19'
          };

      assert.deepEqual(actual, expected);
    });
  });
  describe('.parse()', function () {
    it('should extract data from records', function () {
      var data = require('../fixtures/peer-new.json').answers,
          actual = PeerDiscoveryRecord.parse(data[0], data[1], data[2], data[3]),
          expected = {
            peerId: 'b2c5b427-823a-4161-978e-ba3830a7d556',
            channelName: 'bbc.nws.test',
            port: 9009,
            ip: '192.168.0.4'
          };

      assert.deepEqual(actual, expected);
    });
  });
});