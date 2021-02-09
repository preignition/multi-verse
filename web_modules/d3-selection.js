import { e as creator } from './common/index-6ba82f3a.js';
export { e as creator, m as matcher, n as namespace, f as namespaces, s as selection, b as selector, c as selectorAll, d as style, g as window } from './common/index-6ba82f3a.js';
import { s as select, b as sourceEvent, p as pointer } from './common/selectAll-d64cc7a5.js';
export { p as pointer, s as select, a as selectAll } from './common/selectAll-d64cc7a5.js';

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

function pointers(events, node) {
  if (events.target) { // i.e., instanceof Event, not TouchList or iterable
    events = sourceEvent(events);
    if (node === undefined) node = events.currentTarget;
    events = events.touches || [events];
  }
  return Array.from(events, event => pointer(event, node));
}

export { create, local, pointers };
