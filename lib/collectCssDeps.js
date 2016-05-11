var through = require('./through')

module.exports = function (b, opts) {
  function collect() {
    var stream = collectCssDeps(opts)
    stream.once('css-deps', b.emit.bind(b, 'css-deps'))
    b.pipeline.get('deps').push(stream)
  }

  b.on('reset', collect)
  collect()
}
module.exports.collectCssDeps = collectCssDeps

function collectCssDeps(opts) {
  opts = opts || {}
  var cssDeps = []
  function getStyle(jsFile) {
    return Promise.resolve().then(function () {
      if (opts.getStyle) {
        return opts.getStyle(jsFile)
      }
    })
    .catch(function () {})
  }

  function write(row, _, next) {
    getStyle(row.file).then(function (cssFile) {
      if (!cssFile) return next(null, row)

      var deps = Object.keys(row.deps).map(d => row.deps[d])
      if (!deps.length) {
        // No extra deps.
        // But cssFile will be added if not yet.
        cssDeps.push({ dependenciesFilter: cssFile })
        return next(null, row)
      }

      return Promise.all(deps.map(getStyle))
        .then(function (cssFiles) {
          cssFiles = cssFiles.filter(Boolean)
          if (cssFiles.length) {
            cssDeps.push({
              dependenciesFilter: cssFile,
              deps: cssFiles,
            })
          }
          next(null, row)
        })
    })
    .catch(this.emit.bind(this, 'error'))
  }

  function end(done) {
    this.emit('css-deps', cssDeps)
    done()
  }

  return through(write, end)
}

