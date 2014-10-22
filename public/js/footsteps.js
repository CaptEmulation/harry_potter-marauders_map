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
      hidden: false
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
      this.model.on('change:direction', function () {
        var direction = this.model.get('direction');
        this.$el.removeClass('heading-up');
        this.$el.removeClass('heading-down');
        this.$el.removeClass('heading-right');
        this.$el.removeClass('heading-left');
        this.$el.addClass('heading-' + direction);
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
            setTimeout(function () {
              this.model.set('hidden', true);
            }.bind(this), 2000);
          }.bind(this), 500);
        }.bind(this), 500);
      }.bind(this), 500);
      return this;
    }
  });
  
  var FootstepTrailModel = Backbone.Model.extend({
    defaults: {
      direction: 'up',
      numberOfFootsteps: 25,
      speed: 1.0,
      path: function () {
        return {
          position: {
            x: 0,
            y: 0
          },
          direction: 'up'
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
        path: (function () {
          var direction = 'up';
          
          return function (step, previous) {
            if (step % 4 === 3) {
              direction = direction === 'up' ? 'down':'up';
            }
            var previousPos = previous && previous.position;
            var yDelta = previousPos ? (direction === 'up' ? previousPos.y - 80 : previousPos.y + 80) : 100;
            
            return {
              position: {
                x: 50,
                y: yDelta
              },
              direction: direction 
            };
          };
        }())
      });
      setInterval(this.onNextFootstep.bind(this), 1000);
    },
    
    onNextFootstep: function () {
      var nextFootstepModel = new FootstepsModel();
      var footsteps = new Footsteps({model: nextFootstepModel});
      this.model.set('stepCount', this.model.get('stepCount') + 1);
      var nextFootstepPosition = this.model.get('path')(this.model.get('stepCount'), this.model.get('previousPos'));
      nextFootstepModel.set('position', nextFootstepPosition.position);
      nextFootstepModel.set('direction', nextFootstepPosition.direction);
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
