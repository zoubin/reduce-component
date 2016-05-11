var reduce = require('../')
var test = require('tap').test
var path = require('path')
var fs = require('fs')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var src = fixtures.bind(null, 'src', 'reduce')

test('inputMap', function(t) {
  var opts = require(fixtures('reduce.config'))
  opts.map = {
    basedir: src(),
    file: fixtures('deps.js'),
  }
  return reduce.bundle(opts).then(function() {
    var data = fs.readFileSync(opts.map.file)
    fs.unlinkSync(opts.map.file)
    var o = JSON.parse(data)
    t.same(
      o['page/hi'],
      {
        css: [
          'common.css',
          'page/hi/index.css',
        ],
        js: [
          'common.js',
          'page/hi/index.js',
        ],
      }
    )
    t.same(
      o['page/hello'],
      {
        css: [
          'common.css',
          'page/hello/index.css',
        ],
        js: [
          'common.js',
          'page/hello/index.js',
        ],
      }
    )
  })
})
