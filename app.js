var express = require('express');
var app = express();

// Create a static web route to public folder
app.use(express.static(__dirname + '/public'));

// Start listening on port 3000
app.listen(3000, function (err) {
  if (err) {
    throw new Error(err)
  }

  console.log('Harry Potter\'s adventure begins....');
});
