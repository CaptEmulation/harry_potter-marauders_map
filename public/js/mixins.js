define(function (require, exports) {
  'use strict';
  
  var mixins = exports;
  var ES5Class = require('ES5Class');
  var sprintf = require('sprintf').sprintf;
  var _ = require('underscore');

  exports.SafelyCall = ES5Class.$define('SafelyCall', {
    safelyCall: function (obj, method, args) {
      if (typeof obj[method] === 'function') {
        obj[method].apply(obj, args);
      }
    } 
  });
  
  exports.DefaultRender = ES5Class.$define('DefaultRender', {
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  exports.BackgroundImg = ES5Class.$define('BackgroundImg', {
    construct: function (view) {
      this.view = view;
    },
    
    subscribe: function ($super) {
      this.view.model.on('change:background', this.onBackgroundImage, this);
      $super();
    },
    
    unsubscribe: function ($super) {
      this.view.model.off('change:background', this.onBackgroundImage, this);
      $super();
    },
    
    reset: function ($super) {
      this.onBackgroundImage();
      $super();
    },
      
    onBackgroundImage: function () {
      var image = this.view.model.get('background');
      if (image) {
        this.view.$el.css('background-image', image.url);
      }
    }
  });

  exports.StaticRect = ES5Class.$define('StaticRect', {
    construct: function (view) {
      this.view = view;
    },
    
    subscribe: function ($super) {
      this.view.model.on('change:width change:height', this.resize, this);
      $super();
    },
    
    unsubscribe: function ($super) {
      this.view.model.off('change:width change:height', this.resize, this);
      $super();
    },
    
    reset: function ($super) {
      this.resize();
      $super();
    },
      
    resize: function () {
      var model = this.view.model;
      this.view.$el.css(['width', 'height'].reduce(function (prev, cur) {
        prev[cur] = model.get(cur) + 'px';
        return prev;
      }, {}));
    }
  });

  exports.TransformsCss = ES5Class.$define('TransformCss', {
    construct: function (view) {
      this.view = view;
    },
    
    subscribe: function ($super) {
      this.view.model.on('change:rotation change:position change:scale', this.reposition, this);
      $super();
    },
    
    unsubscribe: function ($super) {
      this.view.model.off('change:rotation change:position change:scale', this.reposition, this);
      $super();
    },
    
    reset: function ($super) {
      this.reposition();
      $super();
    },
      
    reposition: function () {
      var model = this.view.model;
      var rot = model.get('rotation');
      var pos = model.get('position');
      var scale = model.get('scale');
      var translate = sprintf('translate(%dpx ,%dpx) rotate(%ddeg) scale(%f)', pos.x, pos.y, rot, scale);
      console.log(sprintf('Transforming %s to [%s]', model.describe(), translate));
      this.view.$el.css('transform', translate);
    }
  })
    .$implement(exports.SafelyCall);
  
  exports.Options = ES5Class.$define('Options', function () {
    var OptionsDsl = ES5Class.$define('OptionsDsl', function () {
      var safelyCall = mixins.SafelyCall.$create();
      
      var isDefined = function (options) {
        return !!options;
      };
      
      var expect = function (options, key) {
        if (!isDefined(options)) {
          throw new Error(sprintf('Undefined options can not contain a %s key', key));
        }
        if (!this.options.hasOwnProperty(key)) {
          throw new Error(sprintf('Expect options: %s to have argument: %s', JSON.stringify(this.options), key));
        }
        return this.options[key];
      };
      
      var defaultVal = function (options, key, value) {
        if (!isDefined(options) || !options.hasOwnProperty(key)) {
          return value;
        }
        return options[key];
      };
      
      return {
        construct: function () {
          this.__opts = {
            __opts: this
          };
          this.__defaults = {
            
          }
        },
        expect: function (key) {
          this.__opts[key] = function () {
            return expect(this._rawOpts, key);
          }.bind(this)
          return this;
        },
        default: function (key, value) {
          this.__defaults[key] = value;
          return this;
        },
        options: function (options) {
          // Don't double convert
          if (options.__opts === this) {
            return options;
          }
          
          this._rawOpts = options;
          var val, exposedOptions = this._expOpts;
          
          Object.keys(options).forEach(function (key) {
            // Can throw exception
            options[key] = safelyCall(this.__opts, key, [key]);
          });
          
          return _(options).defaults(this.__defaults);
        }
      };
    });
    
    return {
      options: function () {
        return OptionsDsl.$create();
      }
    }
  })
});
