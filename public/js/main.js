

define('main', function (require, exports) {
  'use strict';

  exports.init = function () {
    var $ = require('jquery');
    var Footsteps = require('footsteps').FootstepTrail;
    var map = require('map');
    var core = require('core');
    var mixins = require('mixins');
    var template = require('template');
    var footsteps = require('footsteps');
    var paths = require('paths');
    require('jquery.dragpan');
    var MapView = map.MapView;
    
    var mapView = MapView.$create();
    mapView.build()
      .horizontal({
        right: {
          background: {
            url: 'url("img/h2048_mm_front_right_1.png")'
          },
          width: 535,
          height: 2048
        },
        left: {
          background: {
            url: 'url("img/h2048_mm_front_left_1.png")'
          },
          width: 535,
          height: 2048
        }
      })
      .horizontal({
        right: {
          background: {
            url: 'url("img/h2048_mm_front_right_2.png")'
          },
          width: 535,
          height: 2048
        },
        left: {
          background: {
            url: 'url("img/h2048_mm_front_left_2.png")'
          },
          width: 535,
          height: 2048
        }
      })
      .horizontal({
        right: {
          background: {
            url: 'url("img/h2048_mm_front_right_3.png")'
          },
          width: 535,
          height: 2048,
          footsteps: [
            footsteps.factory({ 
              footstep: {
                scale: 0.1,
                path: paths.page3rightHallway()
              },
              tag: {
                name: 'Severous Snape',
                offset: {
                  
                }
              }
            })
          ]
        },
        left: {
          background: {
            url: 'url("img/h2048_mm_front_left_3.png")'
          },
          width: 535,
          height: 2048
        }
      });
      
    var MapPage = core.View.$define('MapPage', {
      initialize: function ($super) {
        this.use(mixins.ZoomableView.$create(this, mapView));
        $super();
      },
      
    });
    
    var mapPage = MapPage.$create({
      el: '.marauder-map'
    });
    mapPage.$el.append(mapView.render().$el);
    mapView.model.on('scale', function (model, scale) {
      mapPage.$el.dragpan({
        speedx: 100 * scale,
        speedY: 100 * scale
      });
    });
    mapPage.$el.dragpan();
    mapView.click();
    mapView.click();
    var openButton = map.Button.$create({
      className: 'button',
      template: template('#tmpl-_open'),
      model: core.Model.$create({
        title: 'Open'
      })
    });
    
    var closeButton = map.Button.$create({
      className: 'button',
      template: template('#tmpl-_open'),
      model: core.Model.$create({
        title: 'Close'
      })
    });
    openButton.on('click', mapView.click, mapView);
    //closeButton.on('click', mapView.close, mapView);
    $('.button-bar').append(openButton.render().$el);
    //$('.button-bar').append(closeButton.render().$el);
    
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
    
    //$('.map').append();
  }
  
});
