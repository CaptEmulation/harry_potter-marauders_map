define(function (require, exports) {

  exports.init = function () {
    var $ = require('jquery');
    require('jquery.dragpan');
    var map = require('map');
    var core = require('core');
    var mixins = require('mixins');
    var template = require('template');
    var footsteps = require('footsteps');
    var paths = require('paths');

    var mapView = map.MapView.$create();
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
                path: paths.walker()
                  .goTo(172, 690, 150)
                  .walk(25, 120, 9)
                  .walk(187, -32, 18)
                  .walk(-15, -50, 6)
                  .walk(25, -15, 3)
                  .walk(-15, -50, 5)
                  .walk(-128, -5, 12)
                  .walk(-74, 48, 8)
                  .walk(50, 320, 36)
                  .walk(5, 5, 1)
                  .walk(45, -5, 5)
                  .walk(0, -8, 2)
                  .walk(75, -9, 6)
                  .walk(-43, -220, 24)
                  .walk(-50, 10, 5)
                  .walk(-5, -104, 10)
                  .walk(-64, -5, 5)
                  .footsteps()
              },
              tag: {
                name: 'Severous Snape'
              }
            }),
            footsteps.factory({
              footstep: {
                scale: 0.1,
                path: paths.walker()
                  .goTo(220, 1000, 150)
                  .walk(20, 105, 9)
                  .walk(187, -32, 18)
                  .walk(-20, -80, 7)
                  .walk(75, -45, 14)
                  .walk(15, 0, 2)
                  .walk(-10, 10, 2)
                  .walk(-45, 22, 7)
                  .walk(-187, 55, 18)
                  .footsteps()
              },
              tag: {
                name: 'Peter Pettigrew'
              }
            }),
            footsteps.factory({
              footstep: {
                scale: 0.1,
                path: paths.walker()
                  .goTo(320,1075 ,90 )
                  .walk(75, -45, 14)
                  .walk(15, 0, 2)
                  .walk(-10, 10, 2)
                  .walk(-45, 22, 7)
                  .walk(-55, 22, 18)
                  .footsteps()
              },
              tag: {
                name: 'Harry Potter'
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

    openButton.on('click', mapView.click, mapView);
    $('.button-bar').append(openButton.render().$el);
    footsteps.speed(10);

  }

});
