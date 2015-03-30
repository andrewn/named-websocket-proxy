// https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/websocket-server

(function () {

/**
 * Constructs a WebSocketServerSocket using the given socketId. This should be
 * a socket which has already been upgraded from an Http request.
 * @param {number} socketId The socket id with an active websocket connection.
 */
function WebSocketServerSocket(socketId) {
  this.socketId_ = socketId;

  this.data_ = [];
  this.message_ = '';
  this.fragmentedOp_ = 0;
  this.fragmentedMessage_ = '';

  EventSource.apply(this);
  this.readFromSocket_();
}

WebSocketServerSocket.prototype = {
  __proto__: EventSource.prototype,

  readData_: function(readInfo) {
    var t = this;

    if (readInfo.resultCode <= 0) {
      t.close_();
      return;
    }
    if (!readInfo.data.byteLength) {
      console.warn('!readInfo.data.byteLength - needs to read more data');
      // socket.read(t.socketId_, onDataRead);
      return;
    }

    var a = new Uint8Array(readInfo.data);
    for (var i = 0; i < a.length; i++)
      t.data_.push(a[i]);

    while (t.data_.length) {
      var length_code = -1;
      var data_start = 6;
      var mask;
      var fin = (t.data_[0] & 128) >> 7;
      var op = t.data_[0] & 15;

      if (t.data_.length > 1)
        length_code = t.data_[1] & 127;
      if (length_code > 125) {
        if ((length_code == 126 && t.data_.length > 7) ||
            (length_code == 127 && t.data_.length > 14)) {
          if (length_code == 126) {
            length_code = t.data_[2] * 256 + t.data_[3];
            mask = t.data_.slice(4, 8);
            data_start = 8;
          } else if (length_code == 127) {
            length_code = 0;
            for (var i = 0; i < 8; i++) {
              length_code = length_code * 256 + t.data_[2 + i];
            }
            mask = t.data_.slice(10, 14);
            data_start = 14;
          }
        } else {
          length_code = -1; // Insufficient data to compute length
        }
      } else {
        if (t.data_.length > 5)
          mask = t.data_.slice(2, 6);
      }

      if (length_code > -1 && t.data_.length >= data_start + length_code) {
        var decoded = t.data_.slice(data_start, data_start + length_code).map(function(byte, index) {
          return byte ^ mask[index % 4];
        });

        // Assign back to instance data_ var
        t.data_ = t.data_.slice(data_start + length_code);

        if (fin && op > 0) {
          // Unfragmented message.
          if (!t.onFrame_(op, arrayBufferToString(decoded)))
            return;
        } else {
          // Fragmented message.
          this.fragmentedOp_ = this.fragmentedOp_ || op;
          this.fragmentedMessage_ += arrayBufferToString(decoded);
          if (fin) {
            if (!t.onFrame_(this.fragmentedOp_, this.fragmentedMessage_))
              return;
            this.fragmentedOp_ = 0;
            this.fragmentedMessage_ = '';
          }
        }
      } else {
        break; // Insufficient data, wait for more.
      }
    }
    console.warn('Needs to read more data');
    //socket.read(t.socketId_, onDataRead);
  },

  /**
   * Send |data| on the WebSocket.
   * @param {string} data The data to send over the WebSocket.
   */
  send: function(data) {
    this.sendFrame_(1, data);
  },

  /**
   * Begin closing the WebSocket. Note that the WebSocket protocol uses a
   * handshake to close the connection, so this call will begin the closing
   * process.
   */
  close: function() {
    this.sendFrame_(8);
    this.readyState = 2;
  },

  readFromSocket_: function() {
    console.log('readFromSocket_');

    // Create a single callback for incoming socket data and errors
    chrome.sockets.tcp.onReceive.addListener(this.readData_.bind(this));
    chrome.sockets.tcp.onReceiveError.addListener(this.readData_.bind(this));

    /*
    var t = this;
    var data = [];
    var message = '';
    var fragmentedOp = 0;
    var fragmentedMessage = '';

    var onDataRead = function(readInfo) {
      if (readInfo.resultCode <= 0) {
        t.close_();
        return;
      }
      if (!readInfo.data.byteLength) {
        socket.read(t.socketId_, onDataRead);
        return;
      }

      var a = new Uint8Array(readInfo.data);
      for (var i = 0; i < a.length; i++)
        data.push(a[i]);

      while (data.length) {
        var length_code = -1;
        var data_start = 6;
        var mask;
        var fin = (data[0] & 128) >> 7;
        var op = data[0] & 15;

        if (data.length > 1)
          length_code = data[1] & 127;
        if (length_code > 125) {
          if ((length_code == 126 && data.length > 7) ||
              (length_code == 127 && data.length > 14)) {
            if (length_code == 126) {
              length_code = data[2] * 256 + data[3];
              mask = data.slice(4, 8);
              data_start = 8;
            } else if (length_code == 127) {
              length_code = 0;
              for (var i = 0; i < 8; i++) {
                length_code = length_code * 256 + data[2 + i];
              }
              mask = data.slice(10, 14);
              data_start = 14;
            }
          } else {
            length_code = -1; // Insufficient data to compute length
          }
        } else {
          if (data.length > 5)
            mask = data.slice(2, 6);
        }

        if (length_code > -1 && data.length >= data_start + length_code) {
          var decoded = data.slice(data_start, data_start + length_code).map(function(byte, index) {
            return byte ^ mask[index % 4];
          });
          data = data.slice(data_start + length_code);
          if (fin && op > 0) {
            // Unfragmented message.
            if (!t.onFrame_(op, arrayBufferToString(decoded)))
              return;
          } else {
            // Fragmented message.
            fragmentedOp = fragmentedOp || op;
            fragmentedMessage += arrayBufferToString(decoded);
            if (fin) {
              if (!t.onFrame_(fragmentedOp, fragmentedMessage))
                return;
              fragmentedOp = 0;
              fragmentedMessage = '';
            }
          }
        } else {
          break; // Insufficient data, wait for more.
        }
      }
      socket.read(t.socketId_, onDataRead);
    };
    socket.read(this.socketId_, onDataRead);
    */
  },

  onFrame_: function(op, data) {
    if (op == 1) {
      this.dispatchEvent('message', {'data': data});
    } else if (op == 8) {
      // A close message must be confirmed before the websocket is closed.
      if (this.readyState == 1) {
        this.sendFrame_(8);
      } else {
        this.close_();
        return false;
      }
    }
    return true;
  },

  sendFrame_: function(op, data) {
    var t = this;
    var WebsocketFrameString = function(op, str) {
      var length = str.length;
      if (str.length > 65535)
        length += 10;
      else if (str.length > 125)
        length += 4;
      else
        length += 2;
      var lengthBytes = 0;
      var buffer = new ArrayBuffer(length);
      var bv = new Uint8Array(buffer);
      bv[0] = 128 | (op & 15); // Fin and type text.
      bv[1] = str.length > 65535 ? 127 :
              (str.length > 125 ? 126 : str.length);
      if (str.length > 65535)
        lengthBytes = 8;
      else if (str.length > 125)
        lengthBytes = 2;
      var len = str.length;
      for (var i = lengthBytes - 1; i >= 0; i--) {
        bv[2 + i] = len & 255;
        len = len >> 8;
      }
      var dataStart = lengthBytes + 2;
      for (var i = 0; i < str.length; i++) {
        bv[dataStart + i] = str.charCodeAt(i);
      }
      return buffer;
    }

    var array = WebsocketFrameString(op, data || '');
    chrome.sockets.tcp.send(this.socketId_, array, function(writeInfo) {
      if (writeInfo.resultCode < 0 ||
          writeInfo.bytesSent !== array.byteLength) {
        t.close_();
      }
    });
  },

  close_: function() {
    chrome.socket.disconnect(this.socketId_);
    chrome.socket.close(this.socketId_);
    this.readyState = 3;
    this.dispatchEvent('close');
  }
};

this['WebSocketServerSocket'] = WebSocketServerSocket;

}).call(this);