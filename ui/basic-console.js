var el = document.querySelector('#log-area');

function log(msg) {
  var output = msg;
  if (typeof msg === 'object') {
    try {
      output = JSON.stringify(msg);
    } catch (e) {
      output = 'Error logging: ' + msg;
    }
  }
  el.innerHTML += output + '\n';
}

