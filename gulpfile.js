var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    apidoc = require('gulp-apidoc');
var gulpDocumentation = require('gulp-documentation');

var env = process.env.NODE_ENV || "development";

gulp.task('default', function() {
    apidoc({
        src: ["responses/", "controllers/", "core/", "user/"],
        dest: "doc/",
        debug: true,
        includeFilters: [".*\\.js$"]
    }, function done() {
        console.log("Api docs built successfully!!")
    });

    nodemon({
            script: 'app.js',
            ext: 'js',
            ignore: [],
            tasks: [],
            "env": {
                "NODE_ENV": env
            }
        })
        .on('restart', function() {
            console.log('Server restarted successfully!')
        })
      //   .on('crash', function(error) {
      //       console.error('Application has crashed!\n', error)
      //       stream.emit('restart', 10)  // restart the server in 10 seconds
      // })
});

// Generating a pretty HTML documentation site
gulp.task('code-docs', function () {
  return gulp.src('./app.js')
    .pipe(gulpDocumentation('html'))
    .pipe(gulp.dest('code-docs'));
});
