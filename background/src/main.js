var app = require('app');

// Report crashes to our server.
//require('crash-reporter').start();

var debug = require('./debug')('main'),
    NWSProxy = require('./named-websocket-proxy');

console.log('Main process initialised');

// Our proxy application
var nwsProxy = new NWSProxy();

// Quit when all windows are closed.
// Except on Mac as default is for app to stay open
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// Quit when all windows are closed.
app.on('will-quit', function() {
  debug.log('NWSProxy is being quit');
  nwsProxy.destroy();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  nwsProxy.init();
});
