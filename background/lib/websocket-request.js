// https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/websocket-server

var HttpRequest = require('./http-request'),
    WebSocketServerSocket = require('./websocket-server-socket'),
    Sha1 = require('./sha1');

/**
 * Constructs a WebSocket request object from an Http request. This invalidates
 * the Http request's socket and offers accept and reject methods for accepting
 * and rejecting the WebSocket upgrade request.
 * @param {HttpRequest} httpRequest The HTTP request to upgrade.
 */
function WebSocketRequest(httpRequest) {
  // We'll assume control of the socket for this request.
  HttpRequest.apply(this, [httpRequest.headers, httpRequest.socketId_]);
  httpRequest.socketId_ = 0;
}

WebSocketRequest.prototype = {
  __proto__: HttpRequest.prototype,

  /**
   * Accepts the WebSocket request.
   * @return {WebSocketServerSocket} The websocket for the accepted request.
   */
  accept: function() {
    // Construct WebSocket response key.
    var clientKey = this.headers['Sec-WebSocket-Key'];
    var toArray = function(str) {
      var a = [];
      for (var i = 0; i < str.length; i++) {
        a.push(str.charCodeAt(i));
      }
      return a;
    }
    var toString = function(a) {
      var str = '';
      for (var i = 0; i < a.length; i++) {
        str += String.fromCharCode(a[i]);
      }
      return str;
    }

    // Magic string used for websocket connection key hashing:
    // http://en.wikipedia.org/wiki/WebSocket
    var magicStr = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

    // clientKey is base64 encoded key.
    clientKey += magicStr;
    var sha1 = new Sha1();
    sha1.reset();
    sha1.update(toArray(clientKey));
    var responseKey = btoa(toString(sha1.digest()));
    var responseHeader = {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
      'Sec-WebSocket-Accept': responseKey};
    if (this.headers['Sec-WebSocket-Protocol'])
      responseHeader['Sec-WebSocket-Protocol'] = this.headers['Sec-WebSocket-Protocol'];
    this.writeHead(101, responseHeader);
    var socket = new WebSocketServerSocket(this.socketId_);
    // Detach the socket so that we don't use it anymore.
    this.socketId_ = 0;
    return socket;
  },

  /**
   * Rejects the WebSocket request, closing the connection.
   */
  reject: function() {
    console.log('Reject WebSocket request - will close');
    this.close();
  }
}

module.exports = WebSocketRequest;