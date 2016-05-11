'use strict'

const test = require('tap').test
const diff = require('../lib/deps-diff')

test('empty', function(t) {
  t.equal(diff([], []), null)
  t.end()
})

test('added', function(t) {
  t.same(
    diff(
      [
        { dependenciesFilter: '/a', deps: ['/b', '/c'] },
      ],
      []
    ),
    [],
    'new module'
  )
  t.same(
    diff(
      [
        { dependenciesFilter: '/a', deps: ['/b', '/c'] },
      ],
      [
        { dependenciesFilter: '/a', deps: ['/b'] },
      ]
    ),
    [],
    'new deps'
  )
  t.end()
})

test('deleted', function(t) {
  t.same(
    diff(
      [],
      [
        { dependenciesFilter: '/a', deps: ['/b', '/c'] },
      ]
    ),
    ['/a'],
    'module deleted'
  )
  t.same(
    diff(
      [
        { dependenciesFilter: '/a', deps: ['/b'] },
      ],
      [
        { dependenciesFilter: '/a', deps: ['/b', '/c'] },
      ]
    ),
    ['/a'],
    'deps deleted'
  )
  t.end()
})

test('multiple items for the same file', function(t) {
  t.same(
    diff(
      [
        { dependenciesFilter: '/a', deps: ['/b'] },
        { dependenciesFilter: '/a', deps: ['/c'] },
      ],
      [
        { dependenciesFilter: '/a', deps: ['/b'] },
      ]
    ),
    [],
    'added'
  )
  t.same(
    diff(
      [
        { dependenciesFilter: '/a', deps: ['/b'] },
      ],
      [
        { dependenciesFilter: '/a', deps: ['/b'] },
        { dependenciesFilter: '/a', deps: ['/c'] },
      ]
    ),
    ['/a'],
    'deleted'
  )

  t.end()
})

