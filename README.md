Chrome Named Websocket Proxy
===

A Google Chrome App proxy implementing [Named Websockets](https://github.com/namedwebsockets/networkwebsockets).

Install
---

See `Development` below for instructions on building the JavaScript for the extension.

1. Open [Chrome Extensions page](chrome://extensions/);
2. Select "Load unpacked extension..."
3. Navigate to this directory
4. "Select"
5. The "Named WebSocket Proxy" application appears in the list

Running
---

TBD

Development
---

[Browserify]() is used to bundle all JavaScript into a single file. When developing, you must do the following:

1. Have a working node and npm installation
2. Run `npm install` in this directory
3. Run `npm run build` to generate the `dist/background.js` file.

Tests
---

After installing the test harness using `npm install`, you can run tests using `npm test`.

Authors and License
---

The code in /lib is from various sources. The individual files contain links to the source and the license terms.

If no license terms given in individual files then the license in [LICENSE](LICENSE) will apply.

See [AUTHORS](AUTHORS) for the source of code not in `lib/`.
