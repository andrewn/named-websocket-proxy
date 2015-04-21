// https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/websocket-server

var debug = require('../src/debug')('WebSocketServer'),
    EventSource = require('./event-source'),
    WebSocketRequest = require('./websocket-request');

/**
 * Constructs a server which is capable of accepting WebSocket connections.
 * @param {HttpServer} httpServer The Http Server to listen and handle
 *     WebSocket upgrade requests on.
 * @constructor
 */
function WebSocketServer(httpServer) {
  EventSource.apply(this);
  httpServer.addEventListener('upgrade', this.upgradeToWebSocket_.bind(this));
}

WebSocketServer.prototype = {
  __proto__: EventSource.prototype,

  upgradeToWebSocket_: function(request) {
    debug.log('upgradeToWebSocket_(request %o)', request);

    if (request.headers['Upgrade'] != 'websocket' ||
        !request.headers['Sec-WebSocket-Key']) {
      debug.log('upgradeToWebSocket_() headers not met, close connection');
      return false;
    }

    if (this.dispatchEvent('request', new WebSocketRequest(request))) {
      debug.log('dispatching websocketserver request event');

      if (request.socketId_)
        request.reject();
      return true;
    }

    return false;
  }
};

module.exports = WebSocketServer;
