(function () {
  "use strict";
  var ns;

  // Create utils in namespace
  this['utils'] = this['utils'] || {};
  ns = this['utils'];

  ns.success = function success() {
    console.log('Success', arguments);
  }

  ns.fail = function fail() {
    console.error('Fail', arguments);
  }

}).call(this);