

define('main', function (require) {
  'use strict';

  require('js/initReveal');
  var $ = require('jquery');
  var Footsteps = require('js/footsteps').FootstepTrail;
  
  $('.map').append(new Footsteps().start().render().$el);
  
  
});
