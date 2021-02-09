import './common/index-6ba82f3a.js';
import { S as SCHEDULED, T as Transition } from './common/index-39b8d771.js';
export { i as interrupt, t as transition } from './common/index-39b8d771.js';
import './common/rgb-7b9e8ed5.js';
import './common/string-25a4a3cd.js';

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
