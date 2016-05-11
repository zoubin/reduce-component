'use strict'

const reduce = require('../')
const test = require('tap').test
const path = require('path')
const compare = require('compare-directory')
const del = require('del')
const fixtures = path.resolve.bind(path, __dirname, 'fixtures')

test('getStyle', function(t) {
  return del(fixtures('build'))
    .then(() => reduce.bundle(fixtures('getStyle.config')))
    .then(function () {
      compare(
        t,
        ['**/*.css', '**/*.js'],
        fixtures('build'),
        fixtures('expected/getStyle')
      )
    })
})

