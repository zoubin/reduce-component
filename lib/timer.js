var through = require('./through')
var combine = require('stream-combiner2')
var buffer = require('vinyl-buffer')

module.exports = function () {
  var b = this
  var time = Date.now()
  var bytes = 0
  var ret = combine.obj(buffer(), through(write, end))

  function write(file, enc, next) {
    if (!file.isNull()) {
      bytes += file.contents.length
    }
    next(null, file)
  }

  function end(next) {
    b.emit('reduce.end', bytes, Date.now() - time)
    next()
  }

  return ret
}

