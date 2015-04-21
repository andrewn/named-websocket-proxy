var Proxy = require('./proxy');

console.log('Background page initialised');

var config = {
  tcp: {
    address: '0.0.0.0', // bind to all interfaces
    port: 9009
  },
  consoleType: 'basic' // 'advanced' or 'basic'
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

function pathForConsoleType(type) {
  return config.consoleType === 'basic'
          ? 'ui/main.html'
          : 'ui/console.html';
}

function launchWindow() {
  chrome.app.window.create(pathForConsoleType(config.consoleType), {
    id: 'main-window',
    bounds: {
      width: 800,
      height: 300,
      left: 100,
      top: 100
    },
    minWidth: 800,
    minHeight: 600
  });
}