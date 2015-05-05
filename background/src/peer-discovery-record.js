var _ = require('lodash');

module.exports = {
  ptr: {
    encode: function (params) {
      var channelName = params.channelName,
          peerId      = params.peerId;

      if (channelName == null || peerId == null) {
        throw new Error('channelName or peerId not provided');
      }

      return {
        type: 'PTR',
        name: '_ws._tcp.local',
        ttl : 75 * 60,
        data: instanceName(channelName, peerId)
      }
    },
    decode: function (record) {
      var matcher = /(.*)\[(.*)\]\._ws\._tcp\.local/,
          matches;

      if (!record && !record.data) {  return null; }

      matches = matcher.exec(record.data);
      if (matches && matches.length === 3) {
        return {
          channelName: matches[1],
          peerId: matches[2]
        };
      } else {
        return null;
      }
    }
  },
  srv: {
    encode: function (params) {
      var channelName = params.channelName,
          peerId      = params.peerId,
          port        = params.port,
          hostname    = params.hostname;

      if (channelName == null || peerId == null || port == null ||  hostname == null) {
        throw new Error('channelName, peerId, port or hostname not provided');
      }

      return {
        type: 'SRV',
        name: instanceName(channelName, peerId),
        ttl : 75 * 60,
        data: {
          port: port,
          target: host(hostname)
        }
      };
    },
    decode: function (record) {
      if (record && record.data && record.data.port) {
        return {
          port: record.data.port,
          isGoodbye: record.ttl === 0
        }
      } else {
        return null;
      }
    }
  },
  txt: {
    encode: function (params) {
      var channelName = params.channelName,
          peerId      = params.peerId,
          url         = params.url;

      if (channelName == null || peerId == null || url == null) {
        throw new Error('channelName, peerId or url not provided');
      }

      return {
        type: 'TXT',
        name: instanceName(channelName, peerId),
        ttl : 75 * 60,
        data: "path=" + url
      };
    },
    decode: function (record) {
      if (record && record.data) {
        return {
          url: record.data.replace('path=', '')
        };
      } else {
        return null;
      }
    }
  },
  a: {
    encode: function (params) {
      var hostname = params.hostname,
          ip = params.ip;

      if (hostname == null || ip == null) {
        throw new Error('channelName or ip not provided');
      }

      return {
        type: 'A',
        name: host(hostname),
        ttl : 120,
        data: ip
      };
    },
    decode: function (record) {
      if (record && record.data) {
        return {
          ip: record.data
        };
      } else {
        return null;
      }
    }
  },
  parse: function (ptr, srv, txt, a) {
    var r = module.exports,
        peerId, channelName, url, ip, port;

    if (ptr == null || srv == null || txt == null || a == null) {
      return null;
    }

    return _.merge(
      {},
      r.ptr.decode(ptr),
      r.srv.decode(srv),
      r.srv.decode(txt),
      r.a.decode(a)
    );
  },
  isGoodbye: function (data) {
    return data.isGoodbye;
  },
  isAdvert: function (data) {
    var requiredKeys = ['ip', 'port', 'channelName', 'peerId'];
    return _.every( requiredKeys, _.partial(_.has, data) );
  }
}

function instanceName(channelName, peerId) {
  return '{channelName}[{peerId}]._ws._tcp.local'
              .replace('{channelName}', channelName)
              .replace('{peerId}', peerId)
}

function host(name) {
  return name + '.local';
}