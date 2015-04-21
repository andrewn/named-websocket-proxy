module.exports = {
  ptr: function (params) {
    var channelName = params.channelName,
        peerId      = params.peerId;

    if (channelName == null || peerId == null) {
      throw new Error('channelName or peerId not provided');
    }

    return {
      type: 'PTR',
      name: '_ws._tcp.local',
      data: instanceName(channelName, peerId)
    }
  },
  srv: function (params) {
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
      data: {
        port: port,
        target: host(hostname)
      }
    };
  },
  txt: function (params) {
    var channelName = params.channelName,
        peerId      = params.peerId,
        url         = params.url;

    if (channelName == null || peerId == null || url == null) {
      throw new Error('channelName, peerId or url not provided');
    }

    return {
      type: 'TXT',
      name: instanceName(channelName, peerId),
      data: "path=" + url
    };
  },
  a: function (params) {
    var hostname = params.hostname,
        ip = params.ip;

    if (hostname == null || ip == null) {
      throw new Error('channelName or ip not provided');
    }

    return {
      type: 'A',
      name: host(hostname),
      data: ip
    };
  }
}

function instanceName(channelName, peerId) {
  return '{channelName}[{peerId}]._ws._tcp.local'
              .replace('{channelName}', channelName)
              .replace('{peerId}', peerId)
}

function host(name) {
  return name + '.local.';
}