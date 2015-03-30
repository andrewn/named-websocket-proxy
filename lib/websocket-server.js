// https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/websocket-server

(function () {

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
    console.log('upgradeToWebSocket_(request %o)', request);

    if (request.headers['Upgrade'] != 'websocket' ||
        !request.headers['Sec-WebSocket-Key']) {
      console.log('upgradeToWebSocket_() headers not met, close connection');
      return false;
    }

    if (this.dispatchEvent('request', new WebSocketRequest(request))) {
      console.log('dispatching websocketserver request event');

      if (request.socketId_)
        request.reject();
      return true;
    }

    return false;
  }
};

this['WebSocketServer'] = WebSocketServer;

}).call(this);