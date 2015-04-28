var _ = require('lodash');

var logLevels = ['log', 'info', 'warn', 'error', 'log'],
    logLevel = 'log',
    currentLevelIndex = logLevels.indexOf(logLevel);

module.exports = function (thing) {
  var instance = {};
  logLevels.forEach(function (type) {
    instance[type] = function () {
      var indexOfLevel = logLevels.indexOf(type);
      if (indexOfLevel >= currentLevelIndex) {
        console[type].apply(console, [thing + ': '].concat( _.toArray(arguments) ));
      }
    };
  });
  return instance;
};

module.exports.setLogLevel = function (level) {
  logLevel = level;
  currentLevelIndex = logLevels.indexOf(logLevel);
};