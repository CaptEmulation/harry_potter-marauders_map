define(function (require, exports) {
  
  var Backbone = require('backbone');
  var ES5Class = require('ES5Class');
  
  exports.Model = ES5Class.$define('Model')
    .$implement(Backbone.Model)
    .$include({
      construct: Backbone.Model,
      describe: function () {
        var description = this.get('description');
        if (description) {
          return description;
        } else if (typeof this._descriptionHelper === 'function') {
          return this._descriptionHelper();
        } else {
          return "Generic model";
        }
      }
    });
  
  exports.View = ES5Class.$define('View')
    .$implement(Backbone.View)
    .$include({
      construct: Backbone.View,
      initialize: function () {
        this.mixins = this.mixins || [];
        this.subscribe();
        this.reset();
      },
      use: function (instance) {
        this.mixins = this.mixins || [];
        this.mixins.push(instance);
        return this;
      },
      subscribe: function () {
        var view = this;
        this.mixins.forEach(function (m) {
          m.subscribe();
        });
      },
      unsubscribe: function () {
        var view = this;
        this.mixins.forEach(function (m) {
          m.unsubscribe();
        });
      },
      reset: function () {
        var view = this;
        this.mixins.forEach(function (m) {
          m.reset();
        });
      },
      dispose: function () {
        this.unsubscribe();
      }
    });
});
