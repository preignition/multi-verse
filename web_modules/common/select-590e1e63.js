import { S as Selection, r as root } from './index-281dba67.js';

function select(selector) {
  return typeof selector === "string"
      ? new Selection([[document.querySelector(selector)]], [document.documentElement])
      : new Selection([[selector]], root);
}

export { select as s };
