  function log(msg) {
    document.getElementById('log').appendChild(document.createTextNode(new Date() + '   ' + msg + '\n'));
  }
  function status(msg) {
    log(msg);
    document.getElementById('status').textContent = msg;
  }

  function getCheckedRadioValue(groupName) {
    var els = document.getElementsByName(groupName);

    for (var i = 0; i < els.length; i++) {
      if (els[i].checked) {
        return els[i].value;
      }
    }
    return '*'; // broadcast value
  }

  var namedsocket;
  var friendlyStatus = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];

  function connect() {
    if (namedsocket && namedsocket.readyState <= 1) {
      log('Already connected.');
      return;
    }
    var serviceName = document.getElementById('name').value;

    namedsocket = new NetworkWebSocket(serviceName);

    status('Connecting to "' + serviceName + '"...');
    namedsocket.onopen = function (event) {
      document.getElementById('readyState').textContent = friendlyStatus[ namedsocket.readyState ];
      document.getElementById('peerCount').textContent = namedsocket.peers.length + "";

      status('Connected to "' + serviceName + '" as peer.');

      document.getElementById('name').setAttribute("disabled", "disabled");
      document.getElementById('connectBtn').setAttribute("disabled", "disabled");

      document.getElementById('text').removeAttribute("disabled");
      document.getElementById('messageBtn').removeAttribute("disabled");
      document.getElementById('disconnectBtn').removeAttribute("disabled");
    };
    namedsocket.onmessage = function (event) {
      log('RCVD: ' + event.data);
    };
    namedsocket.onclose = function (event) {
      refreshPeerList();

      document.getElementById('readyState').textContent = friendlyStatus[ namedsocket.readyState ];
      document.getElementById('peerCount').textContent = '-';

      status('Disconnected.');

      document.getElementById('name').removeAttribute("disabled");
      document.getElementById('connectBtn').removeAttribute("disabled");

      document.getElementById('text').setAttribute("disabled", "disabled");
      document.getElementById('messageBtn').setAttribute("disabled", "disabled");
      document.getElementById('disconnectBtn').setAttribute("disabled", "disabled");
    };
    namedsocket.onconnect = function (event) {
      var peerWebSocket = event.detail.target;

      log('Peer [' + peerWebSocket.id + '] connected.');

      peerWebSocket.onmessage = function (event) {
        log('PRIVATE RCVD FROM [' + peerWebSocket.id + ']: ' + event.data);
      };

      refreshPeerList();
    }
    namedsocket.ondisconnect = function (event) {
      var peerWebSocket = event.detail.target;

      log('Peer [' + peerWebSocket.id + '] disconnected');

      refreshPeerList();
    }
  }
  function disconnect() {
    if (namedsocket && namedsocket.readyState <= 1) {
      status('Disconnecting...');

      namedsocket.peers = [];

      namedsocket.close();
    } else {
      log('Not connected.');
    }
  }
  function send() {
    if (namedsocket) {
      var message = document.getElementById('text').value;
      var selectedTargetId = getCheckedRadioValue("messageTarget");

      if (selectedTargetId == "*") {
        namedsocket.send(message);
        log('SENT: ' + message);
      } else {
        for (var i = 0; i < namedsocket.peers.length; i++) {
          if (namedsocket.peers[i].id == selectedTargetId) {
            namedsocket.peers[i].send(message);
            log('PRIVATE SENT TO [' + namedsocket.peers[i].id + ']: ' + message);
            break;
          }
        }
      }
    } else {
      log('Not connected.');
    }
  }
  function refreshPeerList() {
    if (!namedsocket) {
      return;
    }

    document.getElementById('peerCount').textContent = namedsocket.peers.length + "";

    var peerListEl = document.getElementById('peerList');
    peerListEl.textContent = "";

    if (namedsocket.peers.length == 0) {
      peerListEl.innerHTML = "<em>Not available. No peers connected</em>";
    } else {
      peerListEl.textContent = "Send direct to: ";
      for (var i = 0; i < namedsocket.peers.length; i++) {
          var peerInputEl = document.createElement('input');
          peerInputEl.type  = "radio";
          peerInputEl.value = namedsocket.peers[i].id;
          peerInputEl.name  = "messageTarget";

          var peerLabelEl         = document.createElement('label');
          peerLabelEl.for         = namedsocket.peers[i].id + "";
          peerLabelEl.textContent = " [" + namedsocket.peers[i].id + "] ";

          peerListEl.appendChild(peerInputEl);
          peerListEl.appendChild(peerLabelEl);
      }
    }
  }