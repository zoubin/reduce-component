const del = require('del')
const gulp = require('gulp')
const reduce = require('reduce-web-component')
const conf = __dirname + '/reduce.config.js'

gulp.task('clean', function () {
  return del('build')
})

gulp.task('build', ['clean'], function () {
  return reduce.bundle(conf)
})
gulp.task('watch', ['clean'], function (cb) {
  var count = 0
  reduce.watch(conf)
    .on('close', cb)
    .on('done', () => {
      console.log('-'.repeat(40), ++count + '')
    })
})
gulp.task('str-deps', function () {
  return reduce.getDeps('**/page/hello/index.*', conf)
    .then(res => console.log(res))
})

gulp.task('obj-deps', function () {
  return reduce.getDeps('**/page/hello/index.*', require(conf))
    .then(res => console.log(res))
})

