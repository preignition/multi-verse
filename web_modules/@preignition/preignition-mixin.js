import '../common/directive-5915da03.js';
import '../common/index-281dba67.js';
import { s as select } from '../common/select-590e1e63.js';
import '../common/lit-html-b7332d35.js';
import { unsafeCSS } from '../lit-element.js';
import '../common/index-5180defa.js';
import '../common/rgb-e876f481.js';
import '../common/string-793e1444.js';
export { d as DefaultValueMixin, a as DoNotSetUndefinedValue } from '../common/defaultValueMixin-08d4cab8.js';
export { C as CacheId, R as RelayTo } from '../common/cacheIdMixin-8becc002.js';

const selectShadow = (selector, el) => {
  return select(el.renderRoot.querySelector(selector));
};
const queryShadow = (selector, el) => {
  return el.renderRoot.querySelector(selector);
};

/**
 * applies style to a already registered custom element
 * @param  {String } css      css to apply
 * @param  {String} element   element name
 */
const cssTheme = (css, element) => {
  const cls = customElements.get(element);
  if (!cls) {
    throw new Error(`custom element for ${element} is not yet registered`)
  }
  cls._styles.push(unsafeCSS(css));
};

const selectMixin = (superclass) => class extends superclass {
  
  selectShadow(selector) {
    return selectShadow(selector, this);
  }
  
  queryShadow(selector) {
    return queryShadow(selector, this);
  }
};

export { selectMixin as SelectMixin, cssTheme, selectShadow };
