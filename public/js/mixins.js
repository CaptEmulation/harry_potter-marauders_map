define(function (require, exports) {
  'use strict';
  
  var ES5Class = require('ES5Class');
  var sprintf = require('sprintf').sprintf;

  exports.SafelyCall = ES5Class.$define('SafelyCall', {
    safelyCall: function ($super, method, args) {
      if (typeof $super[method] === 'function') {
        $super[method].apply(this, args);
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
      return {
        construct: function (options) {
          this.isDefined = !!options;
          this.options = options;
        },
        expect: function (key) {
          if (!this.isDefined) {
            throw new Error(sprintf('Undefined options can not contain a %s key', key));
          }
          if (!this.options.hasOwnProperty(key)) {
            throw new Error(sprintf('Expect options: %s to have argument: %s', JSON.stringify(this.options), key));
          }
          return this.options[key];
        },
        default: function (key, value) {
          if (!this.isDefined || !this.options.hasOwnProperty(key)) {
            return value;
          }
          return this.options[key];
        }
      };
    });
    
    return {
      options: function (options) {
        if (options && options.$className && options.$className === OptionsDsl.$className) {
          return options;
        }
        return OptionsDsl.$create(options);
      }
    }
  })
});
