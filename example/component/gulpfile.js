const del = require('del')
const gulp = require('gulp')
const reduce = require('reduce-web-component')
const bundler = reduce(require('./reduce.config'))

gulp.task('clean', function () {
  return del('build')
})

gulp.task('build', ['clean'], bundler)
gulp.task('watch', ['clean'], function (cb) {
  bundler.watch()
    .on('close', cb)
    .on('done', () => console.log('-'.repeat(40)))
})

