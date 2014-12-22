var gulp = require('gulp')
,   source = require('vinyl-source-stream')
,   browserify = require('browserify')
,   mold = require('mold-source-map')
,   es6ify = require('es6ify')        // client
,   traceur = require('gulp-traceur') // server - TODO: reconcile these two into one dependency
,   sass = require('gulp-sass')
,   sourcemaps = require('gulp-sourcemaps')
,   hogan = require('gulp-hogan-compile')

const JS_SRC = './public/js/src'
,     JS_DIST = './public/js/dist'
,     CSS_SRC = './public/sass'
,     CSS_DIST = './public/css'
,     TEMPLATE_SRC = './public/templates/src'
,     TEMPLATE_DIST = './public/templates/dist'
,     SERVER_SRC = './src/**/*.js'
,     SERVER_DIST = './dist'

gulp.task('templates', function () {
   gulp.src(TEMPLATE_SRC + '/**/*.html')
     .pipe(hogan('templates.js', {
       wrapper: 'commonjs'
     }))
     .pipe(gulp.dest(TEMPLATE_DIST))
})

gulp.task('css', function () {
  gulp.src(CSS_SRC + '/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      sourceComments : false,
      outputStyle : 'compressed'
    }))
    .pipe(sourcemaps.write({ sourceRoot: '/sass'})) // otherwise it comes out as '/source'
    .pipe(gulp.dest(CSS_DIST))
})

gulp.task('js', function () {
  browserify({ debug : true })
    .add(es6ify.runtime)
    .transform(es6ify)
    .require(require.resolve(JS_SRC + '/main.js'), { entry : true })
    .bundle()
    .pipe(mold.transformSourcesRelativeTo(JS_DIST))
    .pipe(source('main.js'))
    .pipe(gulp.dest(JS_DIST))
})

// compile server-side JS into ES5
gulp.task('compile', function () {
  gulp.src(SERVER_SRC)
      .pipe(traceur({ debug: true }))
      .pipe(gulp.dest(SERVER_DIST))
})

gulp.task('watch-server', function () {
  gulp.watch(SERVER_SRC, [ 'compile' ])
})

gulp.task('watch-css', function () {
  gulp.watch(CSS_SRC + '/*.scss', [ 'css' ])
})

gulp.task('watch-js', function () {
  gulp.watch([ JS_SRC + '/**/*.js', TEMPLATE_DIST + '/**/*.js'], [ 'js' ])
})

gulp.task('watch-templates', function () {
  gulp.watch(TEMPLATE_SRC + '/**/*.html', [ 'templates' ])
})

gulp.task('default', [ 'compile', 'js', 'css', 'templates' ])

gulp.task('watch', [ 'default', 'watch-server', 'watch-js', 'watch-css', 'watch-templates' ])
