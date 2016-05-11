var path = require('path')
var Watch = require('./lib/watch')
var reduce = require('./lib/reduce')
var Options = require('./lib/options')
var inputMap = require('./lib/input-map')

function bundle(opts) {
  if (typeof opts === 'string') {
    opts = require(path.resolve(opts))
  }
  inputMap.create(opts)
  return reduce(Options.create(opts))
}

function watch(opts) {
  if (typeof opts === 'string') {
    opts = require(path.resolve(opts))
  }
  inputMap.create(opts)
  return new Watch(Options.create(opts)).start()
}

module.exports = {
  bundle,
  watch,
}

