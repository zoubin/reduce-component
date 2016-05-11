'use strict'

const path = require('path')

module.exports = {
  getStyle: function (jsFile) {
    return path.dirname(jsFile) + '/index.css'
  },

  map: ['reduce.map.json', 'page/**/index.+(jsx|css)'],

  reduce: {
    transform: [
      ['babelify', {presets: ["es2015", "react"]}],
    ],
    extensions: '.jsx',
    basedir: path.resolve(__dirname, 'src'),
  },

  on: {
    log: console.log.bind(console),
    error: function (err) {
      console.error(err.stack)
    },
    'reduce.end': function (bytes, duration) {
      console.log(
        '[%s done] %d bytes written (%d seconds)',
        this._type, bytes, (duration / 1000).toFixed(2)
      )
    },
  },

  dest: 'build',

  js: {
    entries: 'page/**/index.jsx',
    bundleOptions: 'bundle.js',
  },

  css: {
    // No need to specify entries,
    // because we have done that implicitly by setting getStyle.
    //entries: 'page/**/index.css',
    bundleOptions: 'bundle.css',
  },

  watch: {
    js: { entryGlob: 'page/**/index.jsx' },
    css: { entryGlob: 'page/**/index.css' },
  },
}

