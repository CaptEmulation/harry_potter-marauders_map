define(function (require, exports, module) {
  var $ = require('jquery');
  var _ = require('underscore');
  
  return function (name) {
    var $tmpl = $(name);
    var text = "";
    if ($tmpl.length > 0) {
      text = $tmpl.html();
    }
    return _.template(text);
  }
})
