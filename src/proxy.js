(function () {

  var Proxy = function (address, port) {
    EventSource.apply(this);

    this.httpServer_ = new HttpServer();
    this.wsServer_ = new WebSocketServer(this.httpServer_);
    this.httpServer_.listen(port, address);

    this.httpServer_.addEventListener('request', function (req) {
      console.log('An HTTP request!', req);
      req.writeHead(404, {});
      req.end();

      // Keep socket open until we explicitly
      // call req.end()
      return true;
    });

    this.wsServer_.addEventListener('request', function (req) {
      console.log('An WebSocket request!', req);
      var socket = req.accept();

      socket.addEventListener('message', function (e) {
        console.log('Message from client', e);
      });

      socket.addEventListener('close', function () {
        console.log('Socket has closed');
      });

      socket.send('Hello');

      // Keep socket open
      return true;
    });
  };

  Proxy.prototype = {
    __proto__: EventSource.prototype,
    disconnect: function () {
      this.httpServer_.disconnect();
    }
  }

  this['Proxy'] = Proxy;

}).call(this);