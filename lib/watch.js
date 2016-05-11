'use strict'

var EventEmitter = require('events')
var reducejs = require('reduce-js')
var reducecss = require('reduce-css')
var depsDiff = require('./deps-diff')
var delog = require('./delog')
var collectCssDeps = require('./collectCssDeps')
var insertExtraDeps = require('./insertExtraDeps')
var combine = require('stream-combiner2')

class Watch extends EventEmitter {
  constructor(opts) {
    super()
    opts = opts || {}

    this.opts = opts
    this.wopts = opts.watch || {}
    this.state = {
      getStyle: opts.getStyle,
      watching: false,
    }
    this._pending = 0
  }

  _browserify(opts) {
    var b = reducejs.create(Object.assign({
      basedir: process.cwd(),
    }, opts))

    var state = this.state
    if (state.getStyle) {
      state.cssDeps = new Promise(resolve => {
        b.on('css-deps', cssDeps => {
          if (!Array.isArray(state.cssDeps)) {
            state.cssDeps = cssDeps
            return resolve(cssDeps)
          }

          // invalidate reduce-css cache
          var diff = depsDiff(cssDeps, state.cssDeps)
          if (diff) {
            state.cssDeps = cssDeps
            this.emit('update-css', diff)
          }
        })
      })
      b.plugin(collectCssDeps, { getStyle: state.getStyle })
    }
    b._type = 'js'
    return b
  }

  _depsify(opts) {
    var b = reducecss.create(Object.assign({
      basedir: process.cwd(),
    }, opts))

    var state = this.state
    if (state.cssDeps) {
      this.on('update-css', function (diff) {
        var cache = b._options.cache
        diff.forEach(function (file) {
          delete cache[file]
        })
        b.emit('update')
      })
      b.plugin(insertExtraDeps, {
        getExtraDeps: function () {
          return state.cssDeps
        },
      })
    }
    b._type = 'css'
    return b
  }

  _watch(reduce, b) {
    var opts = this.opts[b._type]
    this.once('close', () => b.close())

    Object.keys(opts.on || {}).forEach(function (event) {
      [].concat(opts.on[event]).forEach(cb => b.on(event, cb))
    })

    var handleError = function (err) {
      b.emit('error', err)
    }

    var done = (err) => {
      if (--this._pending === 0) {
        this.emit('done', err)
      }
    }

    b.on('error', done)

    b.on('bundle-stream', bundleStream => {
      var pipeline = [].concat(opts.plugin || []).map(function (args) {
        args = [].concat(args)
        return args[0].apply(b, args.slice(1))
      })

      ++this._pending

      bundleStream
        .on('error', handleError)
        .pipe(combine.obj(pipeline))
        .on('error', handleError)
        .on('data', () => {})
        .once('end', done)
    })

    var watchStream = reduce.watch(b, opts.bundleOptions, this.wopts[b._type])
    b.plugin(delog)
    if (opts.entries) {
      reduce.src(opts.entries, { cwd: b._options.basedir })
        .pipe(watchStream)
    } else {
      watchStream.end()
    }
  }

  start() {
    if (this.state.watching) return
    this.state.watching = true
    if (this.opts.js !== false) {
      this._watch(
        reducejs,
        this._browserify(this.opts.js.reduce),
        'js'
      )
    }
    if (this.opts.css !== false) {
      this._watch(
        reducecss,
        this._depsify(this.opts.css.reduce),
        'css'
      )
    }
    return this
  }

  close() {
    if (this.state.watching) {
      this.state.watching = false
      this.emit('close')
    }
    return this
  }

}

module.exports = Watch

