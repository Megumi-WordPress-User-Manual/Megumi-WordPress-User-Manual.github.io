var gulp = require('gulp'),
    $    = require('gulp-load-plugins')(),
    spawn = require('child_process').spawn,
    webserver = require('gulp-webserver');

// setting
var SERVER_PORT = 4000;
var SERVER_ROOT = '_site/'

var Logger = function() {
  var logger = function() {
  };

  var _log = function(message) {
    console.log(message);
  };

  var _notify = function(title, message) {
    notifier.$.notify({
      title: title,
      message: message
    });
  };

  logger.prototype = {
    log : _log,
    notify : _notify
  };
  return logger;
}();

// jekyll build task
gulp.task('jekyll', function () {
    var jekyll = spawn('jekyll', ['build']);
    var logger = new Logger();

    jekyll.stderr.on('data', function(data) {
        logger.log("" + data);
        logger.$.notify('Build Error', data);
    });

    jekyll.on('exit', function (code) {
        var message = code ? 'error' : 'success'
        logger.log('Finished Jekyll Build : ' + message);
    });
});

// static server task
gulp.task('serve', function() {
  gulp.src(SERVER_ROOT)
    .pipe(webserver({
      livereload: true,
      open: true,
      port: SERVER_PORT
    }));
});

// compass(sassdev)
gulp.task('compass', function() {
  return gulp.src('_sass/*.scss')
    .pipe($.plumber({
      errorHandler: $.notify.onError("Error: <%= error.message %>")
    }))
    .pipe($.compass({
      sass:      '_sass',
      css:       'assets/css',
      image:     'assets/images',
      style:     'expanded',
      relative:  true,
      sourcemap: true,
      comments:  false
    }))
    .pipe(gulp.dest('assets/css'))
});

// watch
gulp.task('watch', function () {
  gulp.watch('_sass/{,*/}{,*/}*.scss', ['compass']);
  gulp.watch(['*.html', '*/*.html', '*.md', '*/*.md', 'assets/css/*.css', 'assets/js/*.js', '!_site/**', '!_site/*/**'], ['jekyll']);

});

// default task
gulp.task('default',['jekyll', 'serve', 'compass', 'watch']);
