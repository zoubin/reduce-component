const test = require('tap').test
const reduce = require('reduce-css')
const insertExtraDeps = require('../lib/insertExtraDeps')

test('empty file', function (t) {
  var basedir = '/path/to/src'
  var b = reduce.create({ basedir })
  b.add({ file: './a', source: '' })
  b.add({ file: './b', source: 'b{}' })
  b.plugin(reduce.bundler, { groups: '**/*' })
  b.plugin(insertExtraDeps, { getExtraDeps: Function.prototype })
  b.bundle().on('data', function (file) {
    t.equal(file.relative, 'b')
  }).on('end', () => t.end())
})

