Named Websocket Proxy
===

A desktop and command-line proxy implementing [Named Websockets](https://github.com/namedwebsockets/networkwebsockets).

Install
---

1. Run `npm install` in this directory

Running desktop app
---

1. Type `npm start` in this directory

A window will appear showing the debugging dashboard view. The terminal will log any debug messages from the main process.

To quit the app, press `Ctl+C`.

Running command-line app
---

1. Type `bin/cli` in this directory

The terminal will log any debug messages from the main process.

To quit the app, press `Ctl+C`.

Demo
---

Load [ui/vis.html](ui/vis.html) from a local webserver to see the proxy in action. Circles will appear as new pages join the channel `mediascape.test`. Selecting a circle sends a message to that page. The target of the message should animate to show it has received the message.

Development
---

The app uses [Electron](http://electron.atom.io/), a node.js/Chromium application runner.

The file `backround/src/main.js` is the entry-point to the application and run in the `node.js` execution context.

Tests
---

After installing the test harness using `npm install`, you can run tests using `npm test`.

For a more visual way to test, use [./test-multi-peers.html](./test-multi-peers.html). This allows you to quickly launch and remove test pages.

The app will launch a dashboard window showing the internal state of the proxy allowing you to observe what the proxy thinks is currently available and connected.

Authors and License
---

The code in /lib is from various sources. The individual files contain links to the source and the license terms.

If no license terms given in individual files then the license in [LICENSE](LICENSE) will apply.

See [AUTHORS](AUTHORS) for the source of code not in `lib/`.
