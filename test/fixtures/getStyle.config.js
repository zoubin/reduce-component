const path = require('path')
const fixtures = path.resolve.bind(path, __dirname)

module.exports = {
  getStyle: function (jsFile) {
    return path.dirname(jsFile) + '/index.css'
  },

  reduce: {
    basedir: fixtures('src/getStyle'),
  },

  dest: fixtures('build'),

  js: {
    entries: 'page/**/index.js',
    bundleOptions: {
      groups: 'page/**/index.js',
    },
  },

  css: {
    bundleOptions: {
      groups: 'page/**/index.css',
    },
  },
}

