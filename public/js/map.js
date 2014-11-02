define('map', function (require, exports) {
  'use strict';
  
  var Backbone = require('backbone');
  var _ = require('underscore');
  var $ = require('jquery');
  var sprintf = require('sprintf').sprintf;
  var paths = require('paths');
  var ES5Class = require('ES5Class');
  var mixins = require('mixins');
  var core = require('core');
  var template = require('template');
  
  var MapModel = ES5Class
    .$define('MapModel')
    .$implement(Backbone.Model)
    .$include(function () {
      return {
        construct: function () {
          Backbone.Model.apply(this, arguments);
        },
        defaults: {
          
        }
      }
    });
  
  var MapContainer = ES5Class.$define('MapContainer')
    .$implement(Backbone.View)
    .$implement(mixins.Options)
    .$include(function () {
    
    var viewDataFactory = function (options, value) {
      return {
        handler: options.default('handler') || function (value) {
          return value;
        } 
      };
    }
    
    return {
      construct: Backbone.View,
      className: 'map-container',
      initialize: function (options) {
        options = this.options(options);
        
        // The shortcut implementation of defineDirection for all alloweds
        var views = this.views = {};
        var allowed = options.default('allowed') || [];
        allowed.forEach(function (allowed) {
          views[allowed] = viewDataFactory(options, allowed);
        });
      },
      allowed: function () {
        return Object.keys(this.views);
      },
      defineDirection: function (options) {
        options = this.options(options);
        var direction = options.expect('direction');
        this.views[direction] = viewDataFactory(options, direction);
        return this;
      },
      inDirection: function (direction) {
        return this.views[direction].pointer;
      },
      setInDirection: function (direction, pointer) {
        var view = this.views[direction]
        var handler = typeof view.handler === 'function' ? view.handler : view.handler[direction]
        view.pointer = handler(pointer);
      },
      add: function (options) {
        options = this.options(options);
        var direction = options.expect('direction');
        var data = options.expect('data')
        
        if (this.allowed().indexOf(direction) === -1) {
          throw new Error(sprintf('%s direction not support.  Supported directions are ' + this.allowed().join(', ')));
        }
        this.setInDirection(direction, data)
        return this;
      },
      render: function () {
        var view = this;
        Object.keys(this.views).forEach(function (dir) {
          view.$el.append(view.views[dir].pointer.render().$el);
        });
        return this;
      }
    };
  });
  
  var HorizontalMapContainer = MapContainer.$define('HorizontalMapContainer', function () {
    
    return {
      construct: function($super, options) {
        $super(_(options || {}).defaults({
          allowed: ['left', 'right']
        }));
      },
      open: function () {
        var right = this.views['right'].pointer;
        var left = this.views['left'].pointer;
        
        right.model.open();
        left.model.open();
      },
      close: function () {
        var right = this.views['right'].pointer;
        var left = this.views['left'].pointer;
        
        right.model.close();
        left.model.close();
      }
    };
  })
  
  var MapView = ES5Class
    .$define('MapView', null, {
      containerForOrientation: function (orientation) {
        var Class;
        if (orientation === 'horizontal') {
          Class = MapView.HorizontalContainer;
        }
        return Class;
      },
      Container: MapContainer,
      HorizontalContainer: HorizontalMapContainer
    })
    .$implement(Backbone.View)
    .$include(function () {
      
      return {
        construct: Backbone.View,
        
        initialize: function (options) {
          this._containerStack = [];
          this._openIndex = 0;
          this._isOpening = true;
          this.$el.click(this.click.bind(this));
        },
        
        containerStack: function () {
          return this._containerStack.slice(0);
        },
        
        openIndex: function () {
          return this._openIndex;
        },
        
        _build_mapContainer: function (orientation, dsl, data) {
          var view = this;
          
          // Get Container class for orientation
          var Container = MapView.containerForOrientation(orientation);
          
          // Create container and add to stack
          this._containerStack.push(Container.$create({
            handler: this._build_mapSection(orientation)
          }));
          
          // Extend DSL
          dsl.addToTopContainer = function (options) {
            view._containerStack.slice(-1)[0].add(options);
            return dsl;
          }
          
          // Short form data entry
          if (data) {
            Object.keys(data).forEach(function(dir) {
              dsl.addToTopContainer({
                direction: dir,
                data: data[dir]
              });
            })
            
          }
          
          return dsl;
        },
        
        _build_mapSection: function (orientation) {
          var directions = (function () {
            if (orientation === 'horizontal') {
              return [{
                direction: 'right',
                openDeltaMultiplier: {
                  x: 1,
                  y: 0
                }
              }, {
                direction: 'left',
                openDeltaMultiplier: {
                  x: -1,
                  y: 0
                }
              }];
            }
          }());
          
          var deltas = directions.reduce(function (prev, cur) {
            prev[cur.direction] = cur.openDeltaMultiplier 
            return prev;
          }, {});
          
          var handler = function (direction) {
            
            return function (data) {
              var model = new MapSectionModel(_(data).defaults({
                openDelta: {
                  x: deltas[direction].x * data.width,
                  y: deltas[direction].y * data.width
                }
              }));
              var section = new MapSectionView({
                model: model
              });
              return section;
            }
          };
          return {
            right: handler('right'),
            left: handler('left')
          };
        },
        
        build: function () {
          var view = this;
          var dsl = {
            render: view.render.bind(view)
          };
          ['horizontal'].forEach(function (orientation) {
            dsl[orientation] = view._build_mapContainer.bind(view, orientation, dsl);
          });
          return dsl;
        },
        render: function () {
          var view = this;
          this.containerStack().forEach(function (container) {
            view.$el.append(container.render().$el);
          });
          return this;
        },
        
        // Event API
        click: function () {
          if (this._isOpening) {
            this.open();
          } else {
            this.close();
          }
          if (this._isOpening && this._openIndex > this._containerStack.length - 2) {
            this._isOpening = false;
          } else if (!this._isOpening && this._openIndex <= 0) {
            this._isOpening = true;
          }
        },
        
        // Map API
        /**
         * Open the next container
         */
        open: function () {
          console.log('-- BEGIN open');
          for (var i = 0; i <= this.openIndex(); i++) {
            var topContainer = this._containerStack[this._containerStack.length - i - 1];
            topContainer.open();
          }
          this._openIndex++;
          console.log('-- END open');
          return this;
        },
        /**
         * Close the most recently opened container
         */
        close: function () {
          console.log('-- BEGIN close');
          for (var i = this.openIndex(); i >= 0; i--) {
            var topContainer = this._containerStack[this._containerStack.length - i - 1];
            topContainer.close();
          }
          this._openIndex--;
          console.log('-- END close');
          return this;
        }
      }
    });

  var MapSectionModel = ES5Class
    .$define('MapSectionModel')
    .$implement(core.Model)
    .$include(function () {
      
      return {
        
        defaults: {
          open: false,
          openDela: {
            x: 0,
            y: 0
          },
          width: 0,
          height: 0,
          position: {
            x: 0,
            y: 0
          },
          rotation: 0,
          scale: 1
        },
        _descriptionHelper: function () {
          var background = this.get('background');
          return background && background.url;
        },
        open: function () {
          var position = this.get('position');
          var openDelta = this.get('openDelta');
          var newPos = {
            x: position.x + openDelta.x,
            y: position.y + openDelta.y
          };
          this.set('position', newPos);
        },
        close: function () {
          var position = this.get('position');
          var openDelta = this.get('openDelta');
          var newPos = {
            x: position.x - openDelta.x,
            y: position.y - openDelta.y
          };
          this.set('position', newPos);
        }
      }
    });
  
  var MapSectionView = ES5Class
    .$define('MapSectionView')
    .$implement(mixins.Options)
    .$implement(core.View)
    .$implement(mixins.DefaultRender)
    .$include(function () {
      
      return {
        construct: Backbone.View,
        className: 'map-section',
        template: template('#tmpl-_map-section'),
        initialize: function ($super, options) {
          options = this.options(options);
          this.model = options.default('model') || MapSectionModel.$create(),
          this.use(mixins.TransformsCss.$create(this))
            .use(mixins.StaticRect.$create(this))
            .use(mixins.BackgroundImg.$create(this));
          $super();
        }
      }
    });

  exports.MapView = MapView;
  exports.MapModel = MapModel;
  exports.MapSectionModel = MapSectionModel;
  exports.MapSectionView = MapSectionView;

});
