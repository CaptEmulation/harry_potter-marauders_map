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
      }
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
    },
    
    render: function () {
      this.$el.html(this.template());
      return this;
    }
  });
  
  var FootstepTrailModel = Backbone.Model.extend({
    defaults: {
      direction: 'right',
      numberOfFootsteps: 15,
      speed: 1.0,
      path: function (step) {
        return {
          x: ((step % 6) - 3) * 25,
          y: 0
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
      setInterval(this.onNextFootstep.bind(this), 500);
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
