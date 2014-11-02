

define('main', function (require, exports) {
  'use strict';

  exports.init = function () {
    var $ = require('jquery');
    var Footsteps = require('footsteps').FootstepTrail;
    var map = require('map');
    var MapView = map.MapView;
    
    var mapView = MapView.$create();
    mapView.build()
      .horizontal({
        right: {
          background: {
            url: 'url("img/h768_mm_front_right_1.png")'
          },
          width: 200,
          height: 768
        },
        left: {
          background: {
            url: 'url("img/h768_mm_front_left_1.png")'
          },
          width: 200,
          height: 768
        }
      })
      .horizontal({
        right: {
          background: {
            url: 'url("img/h768_mm_front_right_2.png")'
          },
          width: 200,
          height: 768
        },
        left: {
          background: {
            url: 'url("img/h768_mm_front_left_2.png")'
          },
          width: 200,
          height: 768
        }
      })
      .horizontal({
        right: {
          background: {
            url: 'url("img/h768_mm_front_right_3.png")'
          },
          width: 200,
          height: 768
        },
        left: {
          background: {
            url: 'url("img/h768_mm_front_left_3.png")'
          },
          width: 200,
          height: 768
        }
      });
    
    
    $('.marauder-map').append(mapView.render().$el);
    
    
    // setTimeout(function () {
    //   mapView.open();
    //   setTimeout(function () {
    //     mapView.open();
    //     setTimeout(function () {
    //       mapView.close();
    //       setTimeout(function () {
    //         mapView.close();
    //       }, 2000)
    //     }, 2000)
    //   }, 2000)
    // }, 2000)
    
    //$('.map').append(new Footsteps().start().render().$el);
  }
  
});
