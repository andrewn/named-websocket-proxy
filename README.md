Chrome Named Websocket Proxy
===

A Google Chrome App proxy implementing [Named Websockets](https://github.com/namedwebsockets/networkwebsockets).

Install
---

*NB:* You must build the JavaScript application for the extension. See `Development` below for instructions.

1. Open [Chrome Extensions page](chrome://extensions/);
2. Select "Load unpacked extension..."
3. Navigate to this directory
4. "Select"
5. The "Named WebSocket Proxy" application appears in the list

Running
---

Once the app is installed into Chrome, you must 'Launch' it by either clicking the "Named WebSocket Proxy" icon from the "Chrome App Launcher Canary" or click "Launch" in the [Chrome Extensions page](chrome://extensions/).

Load [ui/vis.html](ui/vis.html) from a local webserver to see the proxy in action. Circles will appear as new pages join the channel `mediascape.test`. Selecting a circle sends a message to that page. The target of the message should animate to show it has received the message.

Reload
---

If you run into any issues with the app, visit the [Chrome Extensions page](chrome://extensions/) and click "Reload". This will stop the app, close all the windows and then launch it again.

Sometimes you must disable the app by clicking on the "Enabled" checkbox and then clicking again. Then you must "Launch" the app again.

Development
---

[Browserify](http://browserify.org/) is used to bundle all JavaScript into a single file. When developing, you must do the following:

1. Have a working node and npm installation
2. Run `npm install` in this directory
3. Run `npm run build` to generate the `dist/background.js` file.

When developing, it's useful to have the JavaScript rebuilt whenever the source files change. Use `npm run dev` to do that.

Tests
---

After installing the test harness using `npm install`, you can run tests using `npm test`.

Authors and License
---

The code in /lib is from various sources. The individual files contain links to the source and the license terms.

If no license terms given in individual files then the license in [LICENSE](LICENSE) will apply.

See [AUTHORS](AUTHORS) for the source of code not in `lib/`.
