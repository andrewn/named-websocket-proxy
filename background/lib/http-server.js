// https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/websocket-server

var debug  = require('../src/debug')('HttpServer'),
    EventSource = require('./event-source'),
    TcpServer   = require('./tcp-server').TcpServer,
    HttpRequest = require('./http-request'),
    arrayBufferToString = require('./buffer-utils').arrayBufferToString;

/**
 * HttpServer provides a lightweight Http web server. Currently it only
 * supports GET requests and upgrading to other protocols (i.e. WebSockets).
 * @constructor
 */
function HttpServer(injectDebug) {
  this.debug = injectDebug || debug;
  EventSource.apply(this);
  this.readyState_ = 0;
  this.tcp = null;
  this.incoming = {};
}

HttpServer.prototype = {
  __proto__: EventSource.prototype,

  /**
   * Listen for connections on |port| using the interface |host|.
   * @param {number} port The port to listen for incoming connections on.
   * @param {string=} opt_host The host interface to listen for connections on.
   *     This will default to 0.0.0.0 if not specified which will listen on
   *     all interfaces.
   */
  listen: function(port, opt_host) {
    var t = this;

    if (t.tcp) {
      t.tcp.disconnect();
    }

    t.debug.log('Port: ', port, 'host: ', opt_host);

    // The serve listens on a port and runs a callback
    // every time a new socket is connected
    t.tcp = new TcpServer(opt_host || '0.0.0.0', port, { debug: this.debug });
    t.tcp.listen(function (tcpConnection, info) {
      debug.log('Connection. tcpConnection: ', tcpConnection, 'info: ', info);
      t.onConnection_(tcpConnection, info);
    });
    t.readyState_ = 1;
  },
  disconnect: function () {
    this.tcp.disconnect();
  },
  onConnection_: function(tcpConnection, info) {
    this.debug.log('onConnection_');
    tcpConnection.once('receive', function (data) {
      this.createHttpRequest_(tcpConnection.socketId, data);
      tcpConnection.revoke();
    }.bind(this));
    tcpConnection.startListening();
  },

  createHttpRequest_: function (socketId, data/*socketId, info*/) {
    this.debug.log('createHttpRequest_', socketId, data);

    var headers = data.substring(0).split('\n'),
        headerMap = {},
        // headers[0] should be the Request-Line
        requestLine = headers[0].split(' '),
        request;

    headerMap['method'] = requestLine[0];
    headerMap['url'] = requestLine[1];
    headerMap['Http-Version'] = requestLine[2];

    for (var i = 1; i < headers.length; i++) {
      requestLine = headers[i].split(':', 2);
      if (requestLine.length == 2) {
        headerMap[requestLine[0]] = requestLine[1].trim();
      }
    }
    request = new HttpRequest(headerMap, socketId);
    this.onRequest_(request);
  },

  onRequest_: function(request) {
    var type = request.headers['Upgrade'] ? 'upgrade' : 'request';
    var keepAlive = request.headers['Connection'] == 'keep-alive';
    if (!this.dispatchEvent(type, request)){
      this.debug.log('onRequest listener complete, will close');
      request.close();
    } else if (keepAlive){
      this.debug.log('keepAlive requested by not implemented');
    }
  },

};

module.exports = HttpServer;