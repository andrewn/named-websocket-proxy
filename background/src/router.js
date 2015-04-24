var _ = require('lodash');

var Channel = require('./channel'),
    debug = require('./debug')('Router');

var Router  = {
  handleLocalMessage: handleLocalMessage
};

module.exports = Router;

function handleLocalMessage(channel, sourcePeer, msg, localPeers, remotePeers) {
  if (!channel) { throw Error('channel not provided'); }
  if (!sourcePeer) { throw Error('sourcePeer not provided'); }
  if (!msg) { throw Error('msg not provided'); }
  if (!localPeers) { throw Error('localPeers not provided'); }

  var locals = Channel.peers(channel, localPeers || []),
      remotes = Channel.peers(channel, remotePeers || []);

  if (msg.action === 'broadcast') {
    debug.log('Broadcast to local peers', sourcePeer, locals, msg.data);
    Channel.broadcastMessage(sourcePeer, locals, msg.data);

    debug.log('Broadcast to remote peers', sourcePeer, remotes, msg.data);
    Channel.remoteBroadcastMessage(sourcePeer, remotes, msg.data);
  }
}