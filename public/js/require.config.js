require.config({
  paths: {
    'reveal': 'vendor/reveal-js/js/reveal',
    'backbone': 'vendor/backbone/backbone',
    'jquery': 'vendor/jquery/dist/jquery',
    'underscore': 'vendor/underscore/underscore',
    'sprintf': 'vendor/sprintf/src/sprintf'
  },
  shim: {
    'reveal': {
      exports: 'Reveal'
    },
    'backbone': {
      exports: 'Backbone'
    },
    'jquery': {
      exports: ['jQuery', '$']
    },
    'underscore': {
      exports: '_'
    }
  }
});
