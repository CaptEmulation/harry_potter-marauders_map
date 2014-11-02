define('map', function (require, exports) {
  'use strict';
  
  var Backbone = require('backbone');
  var _ = require('underscore');
  var $ = require('jquery');
  require('jquery.elevatezoom');
  var sprintf = require('sprintf').sprintf;
  var paths = require('paths');
  var ES5Class = require('ES5Class');
  var mixins = require('mixins');
  var core = require('core');
  var template = require('template');
  
  var MapContainerModel = ES5Class.$define('MapContainerModel')
    .$implement(core.Model)
    .$include({
      defaults: {
        next: null
      }
    });
  
  var MapContainer = ES5Class.$define('MapContainer')
    .$implement(core.View)
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
      className: 'map-container',
      initialize: function ($super, options) {
        options = this.options(options);
        this.model = options.default('model') || new MapContainerModel();
        // The shortcut implementation of defineDirection for all alloweds
        var views = this.views = {};
        var allowed = options.default('allowed') || [];
        allowed.forEach(function (allowed) {
          views[allowed] = viewDataFactory(options, allowed);
        });
        
        $super();
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
          var viewDir = view.views[dir].pointer.render();
          var iterateDir = viewDir;
          var nextContDir = view.model.get('next');
          while (nextContDir) {
            var nextViewDir = nextContDir.views[dir].pointer;
            iterateDir.$el.append(nextViewDir.render().$el);
            nextContDir = nextContDir.model.get('next');
            iterateDir = nextViewDir;
          }
          view.$el.append(viewDir.$el);
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
  
  var MapModel = core.Model
    .$define('MapModel')
    .$include({
      defaults: {
        position: {
          x: 0,
          y: 0
        },
        rotation: 0,
        scale: 1
      }
    });
  
  var MapView = core.View
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
    .$implement(mixins.Options)
    .$include(function () {
      
      return {
        
        initialize: function ($super, options) {
          options = this.options(options);
          this._containerStack = [];
          this._openIndex = 0;
          this._isOpening = true;
          this.model = options.default('model') || MapModel.$create();
          this.use(mixins.TransformsCss.$create(this));
          $super(options);
        },
        
        subscribe: function ($super) {
          this.$el.click(this.click.bind(this));
          //this.$el.on('mousewheel', this.onMouseWheel.bind(this));
          $super();
        },
        
        unsubscribe: function ($super) {
          $super();
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
          var container = MapView.containerForOrientation(orientation).$create({
            handler: this._build_mapSection(orientation)
          });
          
          // Link containers
          if (this._containerStack.length) {
            container.model.set('next', this._containerStack.slice(-1)[0]);
          }
            
          // Create container and add to stack
          this._containerStack.push(container);
          
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
            };
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
          var topContainer = this.containerStack().pop();
          this.$el.append(topContainer.render().$el);
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
            this._openIndex--;
          } else if (!this._isOpening && this._openIndex < 0) {
            this._isOpening = true;
            this._openIndex++;
          }
        },
        
        onMouseWheel: function (event) {
          var scale = this.model.get('scale');
          scale += (event.originalEvent.wheelDelta / 1024);
          this.model.set('scale', scale);
          
          var offset = this.$el.offset();
          var offsetTop = offset.top;
          var offsetLeft = offset.left;
          var width = this.$el.width();
          var height = this.$el.height();
          var midX = offsetLeft + (width / 2);
          var midY = offsetTop + (height/ 2);
          var position = this.model.get('position');
          var deltaX = event.pageX - midX;
          var deltaY = event.pageY - midY;
          var newPos = {
            x: position.x - deltaX,
            y: position.y - deltaY
          };
          this.model.set('position', newPos);
          return false;
        },
        
        // Map API
        /**
         * Open the next container
         */
        open: function () {
          console.log('-- BEGIN open');
          var topContainer = this._containerStack[this._openIndex];
          topContainer.open();
          this._openIndex++;
          console.log('-- END open');
          return this;
        },
        /**
         * Close the most recently opened container
         */
        close: function () {
          console.log('-- BEGIN close');
          var topContainer = this._containerStack[this._openIndex];
          topContainer.close();
          this._openIndex--;
          console.log('-- END close');
          return this;
        }
      }
    });

  var MapSectionModel = core.Model
    .$define('MapSectionModel')
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
  
  var MapSectionView = core.View
    .$define('MapSectionView')
    .$implement(mixins.Options)
    .$implement(mixins.DefaultRender)
    .$include(function () {
      
      return {
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
