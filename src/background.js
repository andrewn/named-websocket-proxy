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

  startServer(config.tcp.address, config.tcp.port, handleIncomingConnection)
});


function startServer(address, port, handler) {
    if (server) {
      server.disconnect();
    }

    server = new TcpServer(address, port);
    server.listen(handler);
}

function stopServer() {
  server.disconnect();
  server = null;
}

function handleIncomingConnection(tcpConnection, info) {
  console.log('Incoming connection', arguments);
}