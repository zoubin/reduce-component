var stream = require('stream')

module.exports = function (write, end) {
  return stream.Transform({
    objectMode: true,
    transform: write,
    flush: end,
  })
}

