import '../common/directive-5915da03.js';
import '../common/lit-html-b7332d35.js';
import { unsafeCSS } from '../lit-element.js';
export { d as DefaultValueMixin, a as DoNotSetUndefinedValue } from '../common/defaultValueMixin-08d4cab8.js';
export { C as CacheId, R as RelayTo, s as SelectMixin } from '../common/cacheIdMixin-b189d397.js';

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

export { cssTheme };
