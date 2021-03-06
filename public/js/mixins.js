define(function (require, exports) {
  'use strict';
  
  var ES5Class = require('ES5Class');
  var sprintf = require('sprintf').sprintf;

  exports.SafelyCall = ES5Class.$define('SafelyCall', {
    safelyCall: function (obj, method, args) {
      if (typeof obj[method] === 'function') {
        obj[method].apply(obj, args);
      }
    } 
  });
  
  exports.DefaultRender = ES5Class.$define('DefaultRender', {
    render: function () {
      var data = this.model && this.model.toJSON() || {};
      var template = this.template || function () {
        return '';
      } 
      this.$el.html(template.call(this, data));
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

  exports.DynamicRect = ES5Class.$define('StaticRect', {
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
  
  exports.ZoomableView = ES5Class.$define('ZoomableView', {
    construct: function (view, target) {
      this._scrollView = view;
      this._targetView = target;
    },

    subscribe: function ($super) {
      this._scrollView.$el.on('mousewheel', this.onMouseWheel.bind(this));
      $super();
    },

    unsubscribe: function ($super) {
      this.$el.off('mousewheel');
      $super();
    },

    reset: function ($super) {
      $super();
    },
      
    onMouseWheel: function (event) {
      var delta = (event.originalEvent.wheelDelta / 2048);
      var scale = this._targetView.model.get('scale');
      scale += delta;
      this._targetView.model.set('scale', scale);
      
      if (scale > 1) {
        
      }
      var width = this._targetView.$el.width() *scale;
      var zoomerWidth = this._scrollView.$el.width();
      var horMargin = zoomerWidth - width / 2;
      // if (horMargin > 0) {
      //   this._targetView.$el.css({
      //     'margin-left': horMargin + 'px',
      //     'margin-right': horMargin + 'px'
      //   });
      //   return false;
      // } else {
      //   this._targetView.$el.css({
      //     'margin-left': '0px',
      //     'margin-right': '0px',
      //     'left': horMargin
      //   });
      // }

    }    
  });

  exports.SaveTransform = ES5Class.$define('TransformCss', {
    construct: function (view) {
      this.view = view;
    },
    
    subscribe: function ($super) {
      this.view.model.on('change:rotation change:position change:scale', this.saveTransform, this);
      $super();
    },
    
    unsubscribe: function ($super) {
      this.view.model.off('change:rotation change:position change:scale', this.saveTransform, this);
      $super();
    },
    
    reset: function ($super) {
      this.loadTransform();
      $super();
    },
      
    loadTransform: function () {
      var model = this.view.model;
      
      var data = JSON.parse(sessionStorage.getItem(this.view.$className + ':transform'));
      if (data) {
        var restore = {
          position: data.position,
          rotation: data.rotation,
          scale: data.scale
        }
        this.view.model.set(restore);
      }
      
    },
      
    saveTransform: function () {
      var model = this.view.model;
      var rot = model.get('rotation');
      var pos = model.get('position');
      var scale = model.get('scale');
      sessionStorage.setItem(this.view.$className + ':transform', JSON.stringify({
        position: pos,
        rotation: rot,
        scale: scale
      }));
    }
  })
  
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
  
  exports.Clickable = ES5Class.$define('Clickable', {
    construct: function (view) {
      this.view = view;
    },
    
    subscribe: function ($super) {
      var view = this.view;
      this.view.$el.click(function (event) {
        view.trigger('click', event);
      });
      $super();
    },
    
    unsubscribe: function ($super) {
      this.view.$el.off('click');
      $super();
    },
    
    reset: function ($super) {
      $super();
    }
  })
  
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
