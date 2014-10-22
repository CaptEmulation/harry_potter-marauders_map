define(function (require, exports) {
  'use strict';
  
  exports.vertBackAndForth = function () {
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
        rotation: direction === 'up' ? 0 : 180 
      };
    };
  };
  
  
  exports.improvedVertBackAndForth = function () {
    var course = [
      { x: 0, y: 0, rotation: 180 },
      { x: 0, y: 90, rotation: 180 },
      { x: 0, y: 180, rotation: 180 },
      { x: 20, y: 270, rotation: 135 },
      { x: 110, y: 300, rotation: 90 },
      { x: 200, y: 300, rotation: 90 }
    ];
    
    var index = 0;
    
    return function () {
      var details = course[index++];
      if (index >= course.length) {
        index = 0;
      }
      
      return {
        position: {
          x: details.x,
          y: details.y
        },
        rotation: details.rotation
      };
    };
  };
});
