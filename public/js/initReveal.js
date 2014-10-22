

define(function (require) {
  'use strict';

  var Reveal = require('reveal');

  // Full list of configuration options available here:
  // https://github.com/hakimel/reveal.js#configuration
  Reveal.initialize({
    controls: true,
    progress: true,
    history: true,
    keyboard: true,
    center: true,

    theme: Reveal.getQueryHash().theme, // available themes are in /css/theme
    transition: Reveal.getQueryHash().transition || 'default', // none/fade/slide/convex/concave/zoom

    // Parallax scrolling
    // parallaxBackgroundImage: 'https://s3.amazonaws.com/hakim-static/reveal-js/reveal-parallax-1.jpg',
    // parallaxBackgroundSize: '2100px 900px',

    // Optional libraries used to extend on reveal.js
    dependencies: [
      { src: 'vendor/reveal-js/lib/js/classList.js', condition: function() { return !document.body.classList; } },
      { src: 'vendor/reveal-js/plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
      { src: 'vendor/reveal-js/plugin/zoom-js/zoom.js', async: true, condition: function() { return !!document.body.classList; } },
      { src: 'vendor/reveal-js/plugin/notes/notes.js', async: true, condition: function() { return !!document.body.classList; } }
    ]
  });


  console.log('Ready for action');
});
