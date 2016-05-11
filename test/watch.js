'use strict'

const reduce = require('../')
const test = require('tap').test
const path = require('path')
const compare = require('compare-directory')
const del = require('del')
const fixtures = path.resolve.bind(path, __dirname, 'fixtures')
const exec = require('child_process').exec

test('watch', function(t) {
  let expected = ['reduce', 'add', 'reduce']
  let change = [
    '',
    function add() {
      exec('cp -R ' + fixtures('src/build/page/hi') + ' ' + fixtures('src/build/page/hey'))
    },
    function remove() {
      del(fixtures('src/build/page/hey'))
    },
  ]
  del([fixtures('build'), fixtures('src/build')]).then(function () {
    exec('cp -R ' + fixtures('src/reduce') + ' ' + fixtures('src/build'), () => {
      let count = 0
      reduce.watch(require(fixtures('watch.config')))
        .on('done', function () {
          compare(
            t,
            ['**/*.css', '**/*.js'],
            fixtures('build'),
            fixtures('expected/' + expected[count++])
          )
          if (change[count]) {
            change[count]()
          } else {
            this.close()
            t.end()
            // FIXME: this.close() can not make the watcher die on linux
            process.exit(0)
          }
        })
    })
  })
})

