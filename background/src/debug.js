var _ = require('lodash');

module.exports = function (thing) {
  var instance = {};
  ['log', 'info', 'error', 'log'].forEach(function (type) {
    instance[type] = function () {
      console[type].apply(console, [thing].concat( _.toArray(arguments) ));
    };
  });
  return instance;
};