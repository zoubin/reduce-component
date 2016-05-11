var combine = require('stream-combiner2')
var collectCssDeps = require('./collectCssDeps')
var insertExtraDeps = require('./insertExtraDeps')

module.exports = function (opts) {
  opts = opts || {}
  if (opts.js === false && opts.css === false) {
    return Promise.resolve()
  }

  var state = { getStyle: opts.getStyle }
  var ret = []
  if (opts.js !== false) {
    ret.push(bundleJs(state, opts.js))
  }
  if (opts.css !== false) {
    ret.push(bundleCss(state, opts.css))
  }
  return Promise.all(ret)
}

function bundleJs(state, opts) {
  var reduce = require('reduce-js')
  var b = reduce.create(Object.assign({
    basedir: process.cwd(),
  }, opts.reduce))

  if (state.getStyle) {
    state.cssDeps = new Promise(function (resolve) {
      b.once('css-deps', resolve)
    })
    b.plugin(collectCssDeps, { getStyle: state.getStyle })
  }

  b._type = 'js'
  return bundle(reduce, b, opts)
}

function bundleCss(state, opts) {
  var reduce = require('reduce-css')
  var b = reduce.create(Object.assign({
    basedir: process.cwd(),
  }, opts.reduce))

  if (state.cssDeps) {
    b.plugin(insertExtraDeps, {
      getExtraDeps: function () {
        return state.cssDeps
      },
    })
  }
  b._type = 'css'
  return bundle(reduce, b, opts)
}

function bundle(reduce, b, opts) {
  return new Promise(function (resolve, reject) {
    b.on('error', reject)
    Object.keys(opts.on || {}).forEach(function (event) {
      [].concat(opts.on[event]).forEach(cb => b.on(event, cb))
    })

    var pipeline = []
    pipeline.push(reduce.bundle(b, opts.bundleOptions))
    pipeline = pipeline.concat(
      [].concat(opts.plugin || []).map(function (args) {
        args = [].concat(args)
        return args[0].apply(b, args.slice(1))
      })
    )
    pipeline = combine.obj(pipeline)
      .on('error', err => b.emit('error', err))
      .on('data', () => {})
      .once('end', resolve)
    if (opts.entries) {
      reduce.src(opts.entries, { cwd: b._options.basedir })
        .pipe(pipeline)
    } else {
      pipeline.end()
    }
  })
}

