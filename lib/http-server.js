// https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/websocket-server

(function () {

/**
 * HttpServer provides a lightweight Http web server. Currently it only
 * supports GET requests and upgrading to other protocols (i.e. WebSockets).
 * @constructor
 */
function HttpServer() {
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

    // The serve listens on a port and runs a callback
    // every time a new socket is connected
    t.tcp = new TcpServer(opt_host || '0.0.0.0', port);
    t.tcp.listen(function (tcpConnection, info) {
      console.log('Connection', arguments);
      t.onConnection_(tcpConnection, info);
    });
    t.readyState_ = 1;

    // Create a single callback for incoming socket data
    chrome.sockets.tcp.onReceive.addListener(this.handleIncomingData_.bind(t));

    // socket.create('tcp', {}, function(socketInfo) {
    //   t.socketInfo_ = socketInfo;
    //   socket.listen(t.socketInfo_.socketId, opt_host || '0.0.0.0', port, 50,
    //                 function(result) {
    //     t.readyState_ = 1;
    //     t.acceptConnection_(t.socketInfo_.socketId);
    //   });
    // });
  },
  disconnect: function () {
    this.tcp.disconnect();
  },
/*
  acceptConnection_: function(socketId) {
    var t = this;
    socket.accept(this.socketInfo_.socketId, function(acceptInfo) {
      t.onConnection_(acceptInfo);
      t.acceptConnection_(socketId);
    });
  },
*/
  onConnection_: function(acceptInfo, info) {
    console.log('onConnection_(acceptInfo %o, info %o)', acceptInfo, info);
    chrome.sockets.tcp.setPaused(acceptInfo.socketId, false /* paused */);
    // this.readRequestFromSocket_(acceptInfo.socketId, info);
  },

  handleIncomingData_: function (info) {
    var socketId = info.socketId,
        chunk = info.data,
        cached = { data: '', endIndex: 0 },
        isEnded;

    if (!this.incoming[socketId]) {
      // New connection
      this.incoming[socketId] = cached;
    } else {
      // Fetch existing data
      cached = this.incoming[socketId];
    }

    // Append data
    cached.data += arrayBufferToString(chunk).replace(/\r\n/g, '\n');

    cached.endIndex = cached.data.indexOf('\n\n', cached.endIndex);

    isEnded = cached.endIndex > -1;

    if (!isEnded) {
      console.log('Not end of request', socketId);
      cached.endIndex = cached.data.length - 1;
    } else {
      console.log('Found end of request', socketId);
      this.createHttpRequest_(socketId, cached);
      this.incoming[socketId] = null;
    }
  },

  createHttpRequest_: function (socketId, info) {
    console.log('createHttpRequest_', info);

    var headers = info.data.substring(0, info.endIndex).split('\n'),
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

  readRequestFromSocket_: function(socketId, peerInfo) {
    console.log('readRequestFromSocket_(socketId %o, peerInfo %o)', socketId, peerInfo);

    // chrome.sockets.tcp.onReceive.addListener(function (info) {
    //   console.log('onReceive', arrayBufferToString(info.data));
    // });

    // chrome.sockets.tcp.setPaused(socketId, false /* paused */);
  /*
    var t = this;
    var requestData = '';
    var endIndex = 0;
    var onDataRead = function(readInfo) {
      // Check if connection closed.
      if (readInfo.resultCode <= 0) {
        socket.disconnect(socketId);
        socket.destroy(socketId);
        return;
      }
      requestData += arrayBufferToString(readInfo.data).replace(/\r\n/g, '\n');
      // Check for end of request.
      endIndex = requestData.indexOf('\n\n', endIndex);
      if (endIndex == -1) {
        endIndex = requestData.length - 1;
        socket.read(socketId, onDataRead);
        return;
      }

      var headers = requestData.substring(0, endIndex).split('\n');
      var headerMap = {};
      // headers[0] should be the Request-Line
      var requestLine = headers[0].split(' ');
      headerMap['method'] = requestLine[0];
      headerMap['url'] = requestLine[1];
      headerMap['Http-Version'] = requestLine[2];
      for (var i = 1; i < headers.length; i++) {
        requestLine = headers[i].split(':', 2);
        if (requestLine.length == 2)
          headerMap[requestLine[0]] = requestLine[1].trim();
      }
      var request = new HttpRequest(headerMap, socketId);
      t.onRequest_(request);
    }
    socket.read(socketId, onDataRead);
    */
  },

  onRequest_: function(request) {
    var type = request.headers['Upgrade'] ? 'upgrade' : 'request';
    var keepAlive = request.headers['Connection'] == 'keep-alive';
    if (!this.dispatchEvent(type, request)){
      request.close();
    } else if (keepAlive){
      console.log('keepAlive requested by not implemented');
      //this.readRequestFromSocket_(request.socketId_);
    }
  },

};

this['HttpServer'] = HttpServer;

}).call(this);