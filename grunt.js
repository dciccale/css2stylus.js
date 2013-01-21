module.exports = function (grunt) {

  grunt.initConfig({
    stylus: {
      compile: {
        files: {
          'css/css.css': ['src/styl/css.styl']
        }
      }
    },
    jade: {
      compile: {
        files: {
          'index.html': ['src/jade/index.jade']
        }
      }
    },
    min: {
      dist: {
        src: ['src/js/*.js'],
        dest: 'js/demo.min.js'
      }
    },
    mincss: {
      dist: {
        src: ['css/css.css'],
        dest: 'css/css.css'
      }
    },
    watch: {
      stylus: {
        files: ['src/styl/css.styl'],
        tasks: 'stylus mincss'
      },
      jade: {
        files: ['src/jade/index.jade'],
        tasks: 'jade'
      },
      min: {
        files: ['<config:min.dist.src>'],
        tasks: 'min'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-mincss');

  grunt.registerTask('default', 'stylus jade min mincss');

};
