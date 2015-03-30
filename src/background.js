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

  createTcpServerAndBindToPort(config.tcp.address, config.tcp.port)
    .then(success, fail);
});

function createTcpServerAndBindToPort(address, port) {
  console.log('createTcpServerAndBindToPort(address %o, port %o)', address, port);
  return new Promise(function (resolve, reject) {
    if (server) {
      server.disconnect();
    }

    server = new TcpServer(address, port);
    server.listen(function () { console.log('Listening'); });
  });
}



function success() {
  console.log('Success', arguments);
}

function fail() {
  console.error('Fail', arguments);
}