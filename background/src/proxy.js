var debug = require('./debug')('Proxy');

var Channel = require('./channel');

Proxy = {
  close: function (proxy, proxies, localPeers, remotePeers) {

    // Find all remote peers using this channel
    var remotes = _.filter(remotePeers, { ip: proxy.ip });

    // Disconnect local peers
    _.forEach(remotes, function (r) {
      var locals = Channel.peers({ name: r.channel }, localPeers);
      Channel.disconnectPeers(r, locals);
      _.remove(remotePeers, { id: r.id });
    });

    // Remove proxy
    _.remove(proxies, { ip: proxy.ip });

    return {
      proxies: proxies,
      remotes: remotePeers
    };
  }
}

module.exports = Proxy;