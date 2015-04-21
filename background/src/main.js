var debug = require('./debug')('main'),
    App = require('./app');

console.log('Background page initialised');

var config = {
  tcp: {
    address: '0.0.0.0', // bind to all interfaces
    port: 9009
  },
  consoleType: 'basic' // 'advanced' or 'basic'
};

var app = new App();

chrome.app.runtime.onLaunched.addListener(function() {
  debug.log('App launched.');
  app.init();
  launchWindow();
});

chrome.runtime.onSuspend.addListener(function() {
  debug.log('App is being suspended');
  app.destroy();
});

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