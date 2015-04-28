var app = require('app'),
    BrowserWindow = require('browser-window'),
    path = require('path');

// Report crashes to our server.
//require('crash-reporter').start();

var mainWindow = null;

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
  openMainWindow();
});

setInterval(sync, 1000);

function sync() {
  if (nwsProxy && mainWindow) {
    mainWindow.send('internals', {
      channels: nwsProxy.channels,
      locals  : nwsProxy.localPeers,
      remotes : nwsProxy.remotePeers,
      proxies : nwsProxy.proxies,
      adverts : nwsProxy.discoveryAdverts
    });
  }
}

function openMainWindow() {
  var p = path.join(__dirname, '..', '..', 'ui/dashboard/index.html');
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + p);

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}
