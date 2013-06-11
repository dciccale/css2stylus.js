"use strict"

module.exports = ->

  @initConfig
    uglify:
      dist:
        files:
          'js/demo.min.js': ['src/js/css2stylus.js', 'src/js/kimbo.min.js', 'src/js/demo.js']

    stylus:
      compile:
        files:
          'css/css.css': ['src/styl/css.styl']

    jade:
      compile:
        files:
          'index.html': ['src/jade/index.jade']

    cssmin:
      dist:
        files:
          'css/css.min.css': ['css/css.css']

    htmlmin:
      options:
        removeComments: true
        collapseWhitespace: true
        collapseBooleanAttributes: true
        removeAttributeQuotes: true
        removeRedundantAttributes: true
        removeEmptyAttributes: true
        removeOptionalTags: true

      dist:
        files:
          'index.html': ['index.html']

    watch:
      stylus:
        files: ['src/styl/css.styl']
        tasks: ['stylus', 'cssmin']

      jade:
        files: ['src/jade/index.jade']
        tasks: ['jade']

      js:
        files: ['<%= uglify.dist.src %>']
        tasks: ['uglify']

  @loadNpmTasks 'grunt-contrib-uglify'
  @loadNpmTasks 'grunt-contrib-stylus'
  @loadNpmTasks 'grunt-contrib-jade'
  @loadNpmTasks 'grunt-contrib-cssmin'
  @loadNpmTasks 'grunt-contrib-htmlmin'

  @registerTask 'default', ['uglify', 'stylus', 'jade', 'cssmin', 'htmlmin']
