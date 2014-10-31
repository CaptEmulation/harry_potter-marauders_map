define(function (require, exports) {
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
});
