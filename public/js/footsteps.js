define(function (require, exports) {
  'use strict';
  
  var Backbone = require('backbone');
  var _ = require('underscore');
  var $ = require('jquery');
  
  var FootstepsModel = Backbone.Model.extend({
    defaults: {
      direction: 'right',
      position: {
        x: 0,
        y: 0
      },
      hide: false
    }
  });
  
  var Footsteps = Backbone.View.extend({
    template: _.template($('#tmpl-_footsteps').html()),
    className: 'footstep',
    initialize: function (options) {
      options = options || {};
      this.model = options.model || new FootstepsModel();
      this.model.on('change:position', function () {
        var pos = this.model.get('position');
        this.$el.css('right', pos.x + 'px');
        this.$el.css('top', pos.y + 'px');
      }, this);
      this.model.on('change:hide', function () {
        if (this.model.get('hide')) {
          this.$el.addClass('hide');
        } else {
          this.$el.removeClass('hide');
        }
      }, this);
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
          }.bind(this), 500)
        }.bind(this), 500);
      }.bind(this), 500);
      return this;
    }
  });
  
  var FootstepTrailModel = Backbone.Model.extend({
    defaults: {
      direction: 'right',
      numberOfFootsteps: 25,
      speed: 1.0,
      path: function (step) {
        return {
          x: 50,
          y: 100 -(((step % 7) - 3) * 80)
        };
      },
      stepCount: 0,
      footsteps: [],
      lastPositions: []
    }
  });
  
  var FootstepTrail = Backbone.View.extend({
    initialize: function (options) {
      options = options || {};
      this.model = options.model || new FootstepTrailModel();
      setInterval(this.onNextFootstep.bind(this), 1000);
    },
    
    onNextFootstep: function () {
      if (this.model.get('footsteps').length < this.model.get('numberOfFootsteps')) {
        var nextFootstepModel = new FootstepsModel();
        this.model.get('footsteps').push(nextFootstepModel);
        var footsteps = new Footsteps({model: nextFootstepModel});
        var nextFootstepPosition = this.model.get('path')(this.model.get('stepCount'));
        this.model.set('stepCount', this.model.get('stepCount') + 1);
        nextFootstepModel.set('position', nextFootstepPosition);
        this.model.get('lastPositions').push(nextFootstepPosition);
        
        this.$el.append(footsteps.render().$el);  
      }
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
