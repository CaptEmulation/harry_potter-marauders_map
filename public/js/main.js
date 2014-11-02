

define('main', function (require, exports) {
  'use strict';

  exports.init = function () {
    var $ = require('jquery');
    var build = require('build');
    
    build.init();
  }
  
});
