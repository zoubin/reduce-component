'use strict'

const util = require('../lib/options')
const test = require('tap').test

test('plugin', function (t) {
  t.same(
    util.plugin({ plugin: ['x'] }, './delog'),
    {
      plugin: [ 'x', ['./delog'] ],
    },
    'plugin exists'
  )

  t.same(
    util.plugin({}, require('../lib/delog')),
    {
      plugin: [ [require('../lib/delog')] ],
    },
    'function'
  )

  t.same(
    util.plugin({}, './delog'),
    {
      plugin: [ ['./delog'] ],
    },
    'string'
  )

  t.same(
    util.plugin({}, './delog', 1),
    {
      plugin: [
        ['./delog', 1],
      ],
    },
    'string, single arg'
  )

  t.same(
    util.plugin({}, './delog', [1, 2]),
    {
      plugin: [
        ['./delog', 1, 2],
      ],
    },
    'string, args'
  )

  t.end()
})

test('merge', function (t) {
  t.same(
    util.merge({}),
    {
      reduce: { cache: {}, packageCache: {}, paths: [] },
    },
    'default'
  )

  t.same(
    util.merge({ reduce: { x: 1 } }, { reduce: { x: 2, y: 2 } }).reduce,
    { cache: {}, packageCache: {}, paths: [], x: 1, y: 2 },
    'cascading'
  )

  t.same(
    util.merge({ reduce: { paths: [1] } }, { reduce: { paths: [2] } }).reduce.paths,
    [1, 2],
    'paths'
  )

  var cb1 = function () {}
  var cb2 = function () {}
  t.same(
    util.merge({ on: { error: cb1 } }, { on: { error: cb2, log: cb2 } }).on,
    { error: [cb1, cb2], log: [cb2] },
    'on'
  )

  t.same(
    util.merge({}, { dest: 'build' }).dest,
    'build',
    'dest'
  )

  t.end()
})

test('processPlugins', function (t) {
  var reduce = require('reduce-js')
  t.same(
    util.processPlugins({ plugin: [['dest', 'x']] }, reduce),
    { plugin: [[reduce.dest, 'x']] }
  )

  t.same(
    util.processPlugins({ dest: 'x' }, reduce),
    { plugin: [[reduce.dest, 'x']], dest: 'x' }
  )

  t.end()
})

test('css', function (t) {
  t.same(
    util.css(
      { reduce: { resolve: { paths: 1 }, paths: [2] } }
    ).reduce,
    {
      paths: [2],
      resolve: { paths: [1, 2] },
      cache: {},
      packageCache: {},
    }
  )

  t.end()
})

test('js', function (t) {
  t.same(
    util.js({ reduce: { paths: [1] } }, { reduce: { paths: [2] } }).reduce,
    {
      paths: [1, 2],
      cache: {},
      packageCache: {},
    }
  )

  t.end()
})

test('create', function (t) {
  t.same(
    util.create({}).css.reduce,
    { cache: {}, packageCache: {}, paths: [], resolve: { paths: [] } }
  )

  t.same(
    util.create({}).js.reduce,
    { cache: {}, packageCache: {}, paths: [] }
  )

  t.same(
    util.create({ css: false }).css,
    false
  )

  t.same(
    util.create({ js: false }).js,
    false
  )

  t.end()
})

