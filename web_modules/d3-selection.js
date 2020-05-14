import { f as creator } from './common/index-281dba67.js';
export { f as creator, c as customEvent, e as event, m as matcher, n as namespace, g as namespaces, s as selection, a as selector, b as selectorAll, d as style, h as window } from './common/index-281dba67.js';
import { s as select } from './common/select-590e1e63.js';
export { s as select } from './common/select-590e1e63.js';
import { a as sourceEvent, p as point } from './common/touch-a2188ab8.js';
export { p as clientPoint, m as mouse, s as selectAll, t as touch } from './common/touch-a2188ab8.js';

function create(name) {
  return select(creator(name).call(document.documentElement));
}

var nextId = 0;

function local() {
  return new Local;
}

function Local() {
  this._ = "@" + (++nextId).toString(36);
}

Local.prototype = local.prototype = {
  constructor: Local,
  get: function(node) {
    var id = this._;
    while (!(id in node)) if (!(node = node.parentNode)) return;
    return node[id];
  },
  set: function(node, value) {
    return node[this._] = value;
  },
  remove: function(node) {
    return this._ in node && delete node[this._];
  },
  toString: function() {
    return this._;
  }
};

function touches(node, touches) {
  if (touches == null) touches = sourceEvent().touches;

  for (var i = 0, n = touches ? touches.length : 0, points = new Array(n); i < n; ++i) {
    points[i] = point(node, touches[i]);
  }

  return points;
}

export { create, local, touches };
