import './common/index-281dba67.js';
import { S as SCHEDULED, T as Transition } from './common/index-5180defa.js';
export { i as interrupt, t as transition } from './common/index-5180defa.js';
import './common/rgb-e876f481.js';
import './common/string-793e1444.js';

var root = [null];

function active(node, name) {
  var schedules = node.__transition,
      schedule,
      i;

  if (schedules) {
    name = name == null ? null : name + "";
    for (i in schedules) {
      if ((schedule = schedules[i]).state > SCHEDULED && schedule.name === name) {
        return new Transition([[node]], root, name, +i);
      }
    }
  }

  return null;
}

export { active };
