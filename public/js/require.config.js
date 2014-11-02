require.config({
  baseUrl: 'js',
  paths: {
    'reveal': '../vendor/reveal-js/js/reveal',
    'backbone': '../vendor/backbone/backbone',
    'jquery': '../vendor/jquery/dist/jquery',
    'underscore': '../vendor/underscore/underscore',
    'sprintf': '../vendor/sprintf/src/sprintf',
    'ES5Class': '../vendor/es5class/index',
    'better-curry': '../vendor/better-curry/index',
    'es5-shim': '../vendor/es5-shim/es5-shim',
    'jquery.dragpan': '../vendor/jquery-dragpan/src/dragpan',
    
    // Test dependencies
    'chai': '../vendor/chai/chai',
    'sinon': '../vendor/sinon/lib/sinon',
    'mocha': '../vendor/mocha/mocha'
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
    'jquery.dragpan': {
      deps: ['jquery', '../vendor/jquery-dragpan/libs/jquery-ui/jquery-ui', 'sinon']
    },
    'underscore': {
      exports: '_'
    },
    '/testem.js': {
      deps: ['mocha']
    }
  }
});
