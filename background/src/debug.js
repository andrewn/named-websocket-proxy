var _ = require('lodash'),
    inspect = require('util').inspect;

var logLevels = ['log', 'info', 'warn', 'error', 'log'],
    logLevel = 'log',
    currentLevelIndex = logLevels.indexOf(logLevel);

module.exports = function (thing) {
  var instance = {};
  logLevels.forEach(function (type) {
    instance[type] = function () {
      var indexOfLevel = logLevels.indexOf(type);
      if (indexOfLevel >= currentLevelIndex) {
        var objsToLog = [thing + ': '].concat( _.toArray(arguments) ).map(prepareForOutput);
        console[type].apply(console, objsToLog);
      }
    };
  });
  return instance;
};

function prepareForOutput(obj) {
  switch(typeof obj) {
    case 'string':
      return obj;
    default:
      return inspect(obj, { depth: 0, colors: true });
  }
}

module.exports.setLogLevel = function (level) {
  logLevel = level;
  currentLevelIndex = logLevels.indexOf(logLevel);
};