console.log('Background page initialised');

var config = {
  tcp: {
    address: '127.0.0.1',
    port: 9009
  }
};

var server,
    wsServer;

chrome.app.runtime.onLaunched.addListener(function() {
  console.log('App launched.');

  startServer(config.tcp.address, config.tcp.port);
});


function startServer(address, port, handler) {
    if (server) {
      server.disconnect();
    }

    // server = new TcpServer(address, port);
    server = new HttpServer();
    wsServer = new WebSocketServer(server);
    server.listen(port, address);

    server.addEventListener('request', function (req) {
      console.log('An HTTP request!', req);
      req.writeHead(200, { 'X-Amazing': 'Awesome' });
      req.end();
      //Keep socket open
      return true;
    });

    wsServer.addEventListener('request', function (req) {
      console.log('An WebSocket request!', req);
      var socket = req.accept();

      socket.addEventListener('message', function (e) {
        console.log('Message from client', e);
      });

      socket.addEventListener('close', function () {
        console.log('Socket has closed');
      });

      socket.send('Hello');

      //Keep socket open
      return true;
    });

}

function stopServer() {
  server.disconnect();
  server = null;
}

function handleIncomingConnection(tcpConnection, info) {
  console.log('Incoming connection', arguments);
}