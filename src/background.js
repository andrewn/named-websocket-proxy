console.log('Background page initialised');

var config = {
  tcp: {
    address: '127.0.0.1',
    port: 9009
  }
};

var server;

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
    server.listen(port, address);

    server.addEventListener('request', function (req) {
      console.log('A request!', req);
      req.writeHead(200, { 'X-Amazing': 'Awesome' });
      req.end();

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