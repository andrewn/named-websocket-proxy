var Proxy = require('./proxy');

console.log('Background page initialised');

var config = {
  tcp: {
    address: '127.0.0.1',
    port: 9009
  }
};

var proxy;

chrome.app.runtime.onLaunched.addListener(function() {
  console.log('App launched.');
  startProxy(config.tcp.address, config.tcp.port);
  launchWindow();
});

chrome.runtime.onSuspend.addListener(function() {
  console.log('App is being suspended');
  stopProxy();
});

function startProxy(address, port, handler) {
  if (proxy) {
    console.log('Disconnect proxy');
    proxy.disconnect();
  }

  proxy = new Proxy(address, port);
}

function stopProxy() {
  proxy.disconnect();
  proxy = null;
}

function launchWindow() {
  chrome.app.window.create('ui/console.html', {
    id: 'main-window',
    bounds: {
      width: 800,
      height: 600,
      left: 100,
      top: 100
    },
    minWidth: 800,
    minHeight: 600
  });
}