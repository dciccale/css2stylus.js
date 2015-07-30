'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();

var $ = require('gulp-load-plugins')();

var htmlminOpts = {
  removeComments: true,
  collapseWhitespace: true,
  removeEmptyAttributes: false,
  collapseBooleanAttributes: true,
  removeRedundantAttributes: true
};

gulp.task('scripts', function () {
  return gulp.src(['src/js/css2stylus.js', 'src/js/kimbo.min.js', 'src/js/demo.js'])
    .pipe($.concat('demo.js'))
    .pipe($.uglify())
    .pipe(gulp.dest('./js'));
});

gulp.task('stylus', function () {
  return gulp.src(['src/styl/css.styl'])
    .pipe($.stylus())
    .pipe(gulp.dest('./css'));
});

gulp.task('styles', ['stylus'], function () {
  return gulp.src(['./css/css.css'])
    .pipe($.minifyCss())
    .pipe(gulp.dest('./css'));
});

gulp.task('index', function () {
  return gulp.src('./src/index.html')
    .pipe($.htmlmin(htmlminOpts))
    .pipe(gulp.dest('.'));
});

gulp.task('serve', function () {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });

  gulp.watch(['./src/js/*.js'], ['scripts']);
  gulp.watch(['./src/styl/*.styl'], ['styles']);
  gulp.watch(['./src/index.html'], ['index']);
  gulp.watch(['./js/*.js', './css/*.css', 'index.html']).on('change', browserSync.reload);
});
