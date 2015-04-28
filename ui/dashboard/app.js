var ipc = require('ipc'),
    _   = require('lodash')

init();

ipc.on('internals', update);

var isInitialised = false,
    root;

function init() {
  root = d3.select('#vis').append('ul');
}

// var id = _.partial(_.pluck, _, 'id');

function key(d) { return d.id || d.name || d.ip; }

function update(obj) {
  var datas = _.pairs(obj);
  // Div for each data type
  var div = root.selectAll('div').data(datas, function (d) { return d[0]; });
  var divEnter = div
    .enter()
    .append('div');

  divEnter
    .append('p')
    .text(function (d) { return d[0]; });

  divEnter
    .append('ul');

  var li = div.select('ul').selectAll('li').data(function (d) { return d[1]; }, key);
  var liEnter = li
    .enter()
    .append('li')
    .text(key);
}