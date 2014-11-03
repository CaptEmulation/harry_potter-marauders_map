var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      vendor: {
        files: [
          {
            expand: true, cwd: 'bower_components',
            src: '**', dest: 'public/vendor/'
          }
        ]
      }
    },
    concurrent: {
      dev: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          ignore: [
            'node_modules/**',
            'public/**'
          ],
          ext: 'js'
        }
      }
    },
    watch: {
      clientJS: {
         files: [
          'public/**/*.js', '!public/**/*.min.js',
          'public/**/*.js', '!public/**/*.min.js'
         ],
         tasks: ['newer:jshint:client']
      },
      serverJS: {
         files: ['private/**/*.js'],
         tasks: ['newer:jshint:server']
      },
      clientLess: {
         files: [
          'public/less/**/*.less'
         ],
         tasks: ['newer:less']
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapName: function(filePath) {
          return filePath + '.map';
        }
      }
    },
    jshint: {
      client: {
        options: {
          jshintrc: '.jshintrc-client',
          ignores: [
            'public/js/**/*.min.js'
          ]
        },
        src: [
          'public/js/**/*.js'
        ]
      },
      server: {
        options: {
          jshintrc: '.jshintrc-server'
        },
        src: [
          'private/**/*.js'
        ]
      }
    },
    less: {
      options: {
        compress: true
      },
      layouts: {
      },
      views: {
        files: [{
          expand: true,
          cwd: 'public/less',
          src: ['**/*.less'],
          dest: 'public/css',
          ext: '.min.css'
        }]
      }
    },
    clean: {
      js: {
        src: [
          'public/js/**/*.min.js',
          'public/js/**/*.min.js.map'
        ]
      },
      css: {
        src: [
          'public/css/**/*.min.css'
        ]
      },
      vendor: {
        src: ['public/vendor/**']
      }
    },
    requirejs: {
      compile: {
        options: {
            baseUrl: 'public',
            name: 'vendor/requirejs/require',
            mainConfigFile: "public/js/require.config.js",
            include: ['js/main'],
            out: 'public/main.min.js',
            optimize: 'none'
        }
      }
    },
    '--': '$(ps aux | grep "node app.js" | grep -v "grep"); kill -s USR1 $2'
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-newer');

  grunt.registerTask('default', ['copy:vendor', 'newer:less', 'requirejs:compile', 'concurrent']);
  grunt.registerTask('build', ['copy:vendor', 'uglify', 'less']);
  grunt.registerTask('lint', ['jshint']);
};
