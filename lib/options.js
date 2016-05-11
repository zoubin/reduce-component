var reducejs = require('reduce-js')
var reducecss = require('reduce-css')

function plugin(opts, p, args) {
  opts.plugin = [].concat(opts.plugin).filter(Boolean)

  if (!Array.isArray(p)) {
    if (arguments.length >= 3) {
      p = [].concat(p, args)
    } else {
      p = [p]
    }
  }

  if (p[0]) {
    opts.plugin.push(p)
  }
  return opts
}

function merge(opts, extra) {
  opts = opts || {}
  extra = extra || {}

  opts.reduce = Object.assign(
    { cache: {}, packageCache: {} },
    extra.reduce, opts.reduce, {
      paths: [].concat(
        opts.reduce && opts.reduce.paths,
        extra.reduce && extra.reduce.paths
      ).filter(Boolean),
    }
  )

  if (extra.on) {
    Object.keys(extra.on).forEach(function (e) {
      addListener(opts, e, extra.on[e])
    })
  }

  if (!opts.dest && extra.dest) {
    opts.dest = extra.dest
  }

  if (extra.plugin) {
    [].concat(extra.plugin).forEach(p => plugin(opts, p))
  }

  return opts
}

function addListener(o, event, listeners) {
  o.on = o.on || Object.create(null)
  if (event) {
    o.on[event] = [].concat(o.on[event], listeners).filter(Boolean)
  }
  return o
}

function processPlugins(opts, reduce) {
  if (Array.isArray(opts.plugin)) {
    opts.plugin.forEach(function (p) {
      // So that we can put reduce.dest at the middle of the pipeline
      if (p[0] === 'dest') {
        p[0] = reduce.dest
      } else if (typeof p[0] === 'string') {
        p[0] = require(p[0])
      }
    })
  }

  // So that we can put reduce.dest at the end of the pipeline
  if (opts.dest) {
    plugin(opts, reduce.dest, opts.dest)
  }
  return opts
}

function css(opts, extra) {
  opts = merge(opts, extra)
  processPlugins(opts, reducecss)

  var reduceOpts = opts.reduce
  if (typeof reduceOpts.resolve !== 'function') {
    reduceOpts.resolve = Object.assign(
      {}, reduceOpts.resolve, {
        paths: [].concat(
          reduceOpts.resolve && reduceOpts.resolve.paths,
          reduceOpts.paths
        ).filter(Boolean),
      }
    )
  }

  /**
   * opts.entries: `String`, `Array` patterns
   * opts.reduce: `Object` options for depsify
   * opts.dest: options passed to `reduce.dest`
   * opts.bundleOptions: options passed to `reduce.bundle`
   * opts.plugin: gulp plugins applied to `reduce.bundle()`
   * opts.on: event listeners to be attached to `b`
   *
   */
  return opts
}

function js(opts, extra) {
  opts = merge(opts, extra)
  processPlugins(opts, reducejs)

  /**
   * opts.entries: patterns for locating entries
   * opts.reduce: options for browserify
   * opts.dest: options passed to `reduce.dest`
   * opts.bundleOptions: options passed to `reduce.bundle`
   * opts.plugin: gulp plugins applied to `reduce.bundle()`
   * opts.on: event listeners to be attached to `b`
   *
   */
  return opts
}

function create(opts) {
  opts = opts || {}

  if (opts.__processed) {
    return opts
  }
  opts.__processed = true

  plugin(opts, './timer')

  if (opts.js !== false) {
    opts.js = js(opts.js, opts)
  }
  if (opts.css !== false) {
    opts.css = css(opts.css, opts)
  }

  return opts
}

module.exports = {
  create,
  css,
  js,

  processPlugins,
  addListener,
  plugin,
  merge,
}

