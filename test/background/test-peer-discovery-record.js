var helpers = require('../helpers');

var assert = helpers.assert;


var PeerDiscoveryRecord = require('../../background/src/peer-discovery-record');

describe('PeerDiscoveryRecord', function () {
  describe('PTR', function () {
    it('should create record data', function () {
      var actual = PeerDiscoveryRecord.ptr({
            channelName: 'my-channel-name',
            peerId: 'my-peer-id'
          }),
          expected = {
            'name': '_ws._tcp.local',
            'type': 'PTR',
            'data': 'my-channel-name[my-peer-id]._ws._tcp.local'
          };

      assert.deepEqual(actual, expected);
    });
  });
  describe('SRV', function () {
    it('should create record data', function () {
      var actual = PeerDiscoveryRecord.srv({
            channelName: 'a-channel-name',
            peerId: 'abc123-peer-id',
            port: 12345,
            hostname: 'a-host-name'
          }),
          expected = {
            'name': 'a-channel-name[abc123-peer-id]._ws._tcp.local',
            'type': 'SRV',
            'data': {
              'port': 12345,
              'target': 'a-host-name.local.'
            }
          };

      assert.deepEqual(actual, expected);
    });
  });
  describe('TXT', function () {
    it('should create record data', function () {
      var actual = PeerDiscoveryRecord.txt({
              channelName: 'a-channel-name',
              peerId: 'abc123-peer-id',
              url: '/a-channel-name/abc123-peer-id/%s'
            }),
          expected = {
            'name': 'a-channel-name[abc123-peer-id]._ws._tcp.local',
            'type': 'TXT',
            'data': 'path=/a-channel-name/abc123-peer-id/%s'
          };

      assert.deepEqual(actual, expected);
    });
  });
  describe('A', function () {
    it('should create record data', function () {
      var actual = PeerDiscoveryRecord.a({ hostname: 'a-host-name', ip: '1.1.2.19' }),
          expected = {
            'name': 'a-host-name.local.',
            'type': 'A',
            'data': '1.1.2.19'
          };

      assert.deepEqual(actual, expected);
    });
  });
});