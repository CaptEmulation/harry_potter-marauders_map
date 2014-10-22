define(function (require, exports) {
  'use strict';
  
  var Backbone = require('backbone');
  var _ = require('underscore');
  var $ = require('jquery');
  var sprintf = require('sprintf').sprintf;
  var paths = require('js/paths');
  
  var FootstepsModel = Backbone.Model.extend({
    defaults: {
      direction: null,
      rotation: 0,
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
      this.model.on('change:position change:rotation', this.reposition, this);
      this.reposition();
    },
    
    reposition: function () {
      var rot = this.model.get('rotation');
      var pos = this.model.get('position');
      var translate = sprintf('translate(%dpx ,%dpx) rotate(%ddeg)', pos.x, pos.y, rot);
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
    }
  });
  
  var FootstepTrailModel = Backbone.Model.extend({
    defaults: {
      numberOfFootsteps: 25,
      speed: 1.0,
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
      setInterval(this.onNextFootstep.bind(this), 1000);
    },
    
    onNextFootstep: function () {
      var nextFootstepModel = new FootstepsModel();
      var footsteps = new Footsteps({model: nextFootstepModel});
      this.model.set('stepCount', this.model.get('stepCount') + 1);
      var nextFootstepPosition = this.model.get('path')(this.model.get('stepCount'), this.model.get('previousPos'));
      nextFootstepModel.set({
        position: nextFootstepPosition.position,
        rotation: nextFootstepPosition.rotation
      });
      nextFootstepModel.once('change:hidden', function () {
        footsteps.$el.remove();
      });
      this.$el.append(footsteps.render().$el);  
      this.model.set('previousPos', nextFootstepPosition);
    },

    render: function () {
      
      return this;
    }
  });
  
  exports.Footsteps = Footsteps;
  exports.FootstepsModel = FootstepsModel;
  exports.FootstepTrail = FootstepTrail;
  exports.FootstepTrailModel = FootstepTrailModel;  
});
