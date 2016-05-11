module.exports = function (newDeps, oldDeps) {
  var oldGraph = build(oldDeps)
  var newGraph = build(newDeps)
  var diff = diffKeys(newGraph, oldGraph)
  // No need to invalidate caches for `diff.added`
  var stale = diff.deleted.reduce(function (o, file) {
    o[file] = true
    return o
  }, {})
  var changed = diff.added.length + diff.deleted.length
  diff.unchanged.forEach(function (file) {
    var d = diffKeys(newGraph[file], oldGraph[file])
    // If any deps deleted, we have to invalidate the cache
    if (d.deleted.length) {
      stale[file] = true
    }
    changed += d.added.length + d.deleted.length
  })
  return changed ? Object.keys(stale) : null
}

function build(deps) {
  var graph = {}
  deps.forEach(function (dep) {
    graph[dep.dependenciesFilter] = graph[dep.dependenciesFilter] || {}
    if (!dep.deps) return
    dep.deps.forEach(function (d) {
      graph[dep.dependenciesFilter][d] = true
    })
  })
  return graph
}

function diffKeys(newObj, oldObj) {
  var added = []
  var deleted = []
  var unchanged = []

  Object.keys(newObj).forEach(function (key) {
    if (!has(oldObj, key)) {
      added.push(key)
    } else {
      unchanged.push(key)
    }
  })
  Object.keys(oldObj).forEach(function (key) {
    if (!has(newObj, key)) {
      deleted.push(key)
    } else {
      unchanged.push(key)
    }
  })

  return {
    added: added,
    deleted: deleted,
    unchanged: unchanged,
  }
}

function has(o, k) {
  return Object.prototype.hasOwnProperty.call(o, k)
}

