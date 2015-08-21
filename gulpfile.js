var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var del = require('del');

gulp.task('clean', function (done) {
  del(['dist/*', '!dist/node_modules', '!dist/.git'], done);
});

gulp.task('css', function () {
  return gulp.src('public/scss/*.scss')
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({ outputStyle: 'compressed' }))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('build/public/css/'));
});

gulp.task('watch', function () {
  gulp.watch(['public/scss/**/*.scss'], ['css']);
});

gulp.task('serve', function(callback) {
  runSequence('clean', 'css', 'watch', callback);
});
