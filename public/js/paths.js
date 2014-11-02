define('paths', function (require, exports) {
  'use strict';
  
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
      
      return details;
    };
  };
  
  var walker = function (course) {
    var course = course || [];
    var dsl = {
      goTo: function (x, y, rotation) {
        course.push({
          x: x,
          y: y,
          rotation: rotation
        });
        return dsl;
      },
      walkTo: function (x, y, steps) {
        var lastPos = course.slice(-1)[0];
        var deltaX = x - lastPos.x;
        var deltaY = y - lastPos.y;
        var rotation = Math.atan2(deltaY,deltaX) * 180 / Math.PI - 270;
        var deltaRot = rotation - lastPos.rotation;
        var stepX = deltaX / steps;
        var stepY = deltaY / steps;
        for(var i = 1; i <= steps; i++) {
          course.push({
            x: lastPos.x + i * stepX,
            y: lastPos.y + i * stepY,
            rotation: rotation
          });
        }
        return dsl;
      },
      walk: function (deltaX, deltaY, steps) {
        var lastPos = course.slice(-1)[0];
        return this.walkTo(lastPos.x + deltaX, lastPos.y + deltaY, steps);
      }
    };
    
    return dsl;
  }
  
  exports.page3rightHallway = function () {
    var course = [];
    
    walker(course).goTo(172, 690, 150).walk(25, 120, 9).walk(200, -40, 18);
    
    course.forEach(function (c) {
      console.log(JSON.stringify(c));
    })
    
    var index = 0;
    
    return function () {
      var details = course[index++];
      if (index >= course.length) {
        index = 0;
      }
      
      return details;
    };
  };
});
