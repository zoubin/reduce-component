module.exports = function (b) {
  b.on('reset', reset)
  reset()
  function reset() {
    var wrap = b.pipeline.get('wrap')
    if (wrap.length === 2) {
      wrap.pop()
    }
  }
}

