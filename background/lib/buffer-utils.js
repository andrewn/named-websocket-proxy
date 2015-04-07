// https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/websocket-server

/**
 * Convert from an ArrayBuffer to a string.
 * @param {ArrayBuffer} buffer The array buffer to convert.
 * @return {string} The textual representation of the array.
 */
var arrayBufferToString = function(buffer) {
  var array = new Uint8Array(buffer);
  var str = '';
  for (var i = 0; i < array.length; ++i) {
    str += String.fromCharCode(array[i]);
  }
  return str;
};

/**
 * Convert a string to an ArrayBuffer.
 * @param {string} string The string to convert.
 * @return {ArrayBuffer} An array buffer whose bytes correspond to the string.
 */
var stringToArrayBuffer = function(string) {
  var buffer = new ArrayBuffer(string.length);
  var bufferView = new Uint8Array(buffer);
  for (var i = 0; i < string.length; i++) {
    bufferView[i] = string.charCodeAt(i);
  }
  return buffer;
};


module.exports = {
  arrayBufferToString: arrayBufferToString,
  stringToArrayBuffer: stringToArrayBuffer
};