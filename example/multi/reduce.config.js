'use strict'

const path = require('path')
const fixtures = path.resolve.bind(path, __dirname, 'src')
const Clean = require('clean-remains')

module.exports = {
  getStyle: function (jsFile) {
    return path.dirname(jsFile) + '/index.css'
  },

  reduce: {
    basedir: fixtures(),
    paths: [fixtures('web_modules')],
  },

  on: {
    log: console.log.bind(console),
    error: function (err) {
      console.log(err.stack)
    },
    'common.map': function (map) {
      console.log('[%s bundles] %s', this._type.toUpperCase(), Object.keys(map).join(', '))
    },
    'reduce.end': function (bytes, duration) {
      console.log(
        '[%s done] %d bytes written (%d seconds)',
        this._type.toUpperCase(), bytes, (duration / 1000).toFixed(2)
      )
    },
  },

  js: {
    entries: 'page/**/index.js',
    bundleOptions: {
      groups: 'page/**/index.js',
      common: 'common.js',
    },
    reduce: {
      plugin: 'dedupify',
    },
    plugin: [
      ['dest', 'build'],
      [Clean([])],
    ],
  },

  css: {
    //entries: 'page/**/index.css',
    reduce: {
      atRuleName: 'external',
    },
    bundleOptions: {
      groups: 'page/**/index.css',
      common: 'common.css',
    },
    plugin: [
      ['dest', 'build'],
      [Clean([])],
    ],
  },

  watch: {
    js: {
      entryGlob: 'page/**/index.js',
      // do not watch files under node_modules
      ignoreWatch: true,
    },
    css: {
      entryGlob: 'page/**/index.css',
      // do not watch files under node_modules
      ignoreWatch: true,
    },
  },
}

