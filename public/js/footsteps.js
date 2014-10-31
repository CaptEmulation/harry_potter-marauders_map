define(function (require, exports) {
  'use strict';
  
  var Backbone = require('backbone');
  var _ = require('underscore');
  var $ = require('jquery');
  var sprintf = require('sprintf').sprintf;
  var paths = require('js/paths');
  
  var NameTagModel = Backbone.Model.extend({
    defaults: {
      name: "Harry Potter",
      position: {
        x: 0,
        y: 0
      }
    }
  });
  
  var NameTag = Backbone.View.extend({
    template: _.template($('#tmpl-_name-tag').html()),
    className: 'name-tag',
    initialize: function (options) {
      options = options || {};
      this.model = options.model || new NameTagModel();
      this.model.on('change:position', this.reposition, this);
    },
    reposition: function () {
      var pos = this.model.get('position');
      var translate = sprintf('translate(%dpx ,%dpx)', pos.x, pos.y);
      this.$el.css('transform', translate);
    },
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
  
  var FootstepsModel = Backbone.Model.extend({
    defaults: {
      direction: null,
      rotation: 0,
      scale: 1.0,
      position: {
        x: 0,
        y: 0
      },
      hidden: false
    }
  });
  
  var Footsteps = Backbone.View.extend({
    template: _.template($('#tmpl-_footsteps').html()),
    className: 'footstep',
    initialize: function (options) {
      options = options || {};
      this.model = options.model || new FootstepsModel();
      this.model.on('change:position change:rotation change:scale', this.reposition, this);
      this.reposition();
    },
    
    reposition: function () {
      var rot = this.model.get('rotation');
      var pos = this.model.get('position');
      var scale = this.model.get('scale');
      var translate = sprintf('translate(%dpx ,%dpx) rotate(%ddeg) scale(%f)', pos.x, pos.y, rot, scale);
      this.$el.css('transform', translate);
    },
    
    render: function () {
      this.$el.html(this.template());
      setTimeout(function () {
        var left = this.$el.find('.left');
        var right = this.$el.find('.right');
        
        left.removeClass('hide');
        setTimeout(function () {
          left.addClass('fades');
          right.addClass('fades');
          right.addClass('hide');
          setTimeout(function () {
            left.removeClass('show');
            left.addClass('hide');
            left.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
              this.model.set('hidden', true);
            }.bind(this));
          }.bind(this), 500);
        }.bind(this), 500);
      }.bind(this), 500);
      return this;
    },
    
    dispose: function () {
      this.$el.remove();
      this.model.off();
    }
  });
  
  var FootstepTrailModel = Backbone.Model.extend({
    defaults: {
      numberOfFootsteps: 25,
      speed: 1.0,
      scale: 0.7,
      offset: {
        x: 0,
        y: 0
      },
      path: function () {
        return {
          position: {
            x: 0,
            y: 0
          },
          rotation: 0
        };
      },
      stepCount: 0,
      previousPos: null
    }
  });
  
  var FootstepTrail = Backbone.View.extend({
    initialize: function (options) {
      options = options || {};
      this.model = options.model || new FootstepTrailModel({
        path: paths.improvedVertBackAndForth()
      });
      this.nameTag = new NameTag();
    },
    
    start: function () {
      this.onNextFootstep();
      this._intervalId = setInterval(this.onNextFootstep.bind(this), 1000);
      return this;
    },
    
    stop: function () {
      clearInterval(this._intervalId);
      return this;
    },
    
    onNextFootstep: function () {
      var nextFootstepModel = new FootstepsModel({
        scale: this.model.get('scale')
      });
      var footsteps = new Footsteps({model: nextFootstepModel});
      this.model.set('stepCount', this.model.get('stepCount') + 1);
      var nextFootstepPosition = this.model.get('path')(this.model.get('stepCount'), this.model.get('previousPos'));
      var offset = this.model.get('offset');
      var pos = {
        x: nextFootstepPosition.x + offset.x,
        y: nextFootstepPosition.y + offset.y
      };
      this.nameTag.model.set('position', pos);
      nextFootstepModel.set({
        position: pos,
        rotation: nextFootstepPosition.rotation
      });
      nextFootstepModel.once('change:hidden', function () {
        footsteps.dispose();
      });
      this.$el.append(footsteps.render().$el);  
      this.model.set('previousPos', nextFootstepPosition);
    },

    render: function () {
      this.$el.append(this.nameTag.render().$el);
      return this;
    }
  });
  
  exports.Footsteps = Footsteps;
  exports.FootstepsModel = FootstepsModel;
  exports.FootstepTrail = FootstepTrail;
  exports.FootstepTrailModel = FootstepTrailModel;  
});
