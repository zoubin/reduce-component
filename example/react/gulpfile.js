const gulp = require('gulp')
const reduce = require('reduce-web-component')
const options = require('./reduce.config.js')

gulp.task('build', () => {
  return reduce.bundle(options)
})
gulp.task('watch', function (cb) {
  reduce.watch(options)
    .on('close', cb)
    .on('done', () => console.log('-'.repeat(40)))
})
