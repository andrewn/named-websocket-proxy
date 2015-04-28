Named Websocket Proxy
===

A desktop proxy implementing [Named Websockets](https://github.com/namedwebsockets/networkwebsockets).

Install
---

1. Run `npm install` in this directory

Running
---

1. Type `npm start` in this directory

The application currently launches no windows, but the terminal that you start from will output logging information.

Load [ui/vis.html](ui/vis.html) from a local webserver to see the proxy in action. Circles will appear as new pages join the channel `mediascape.test`. Selecting a circle sends a message to that page. The target of the message should animate to show it has received the message.


Development
---

The app uses [Electron](http://electron.atom.io/), a node.js/Chromium application runner.

The file `backround/src/main.js` is the entry-point to the application and run in the `node.js` execution context.

Tests
---

After installing the test harness using `npm install`, you can run tests using `npm test`.

Authors and License
---

The code in /lib is from various sources. The individual files contain links to the source and the license terms.

If no license terms given in individual files then the license in [LICENSE](LICENSE) will apply.

See [AUTHORS](AUTHORS) for the source of code not in `lib/`.
