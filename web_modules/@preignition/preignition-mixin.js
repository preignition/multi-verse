import '../common/directive-9885f5ff.js';
import { select } from '../d3-selection.js';
import '../d3-transition.js';
import '../common/index-841dc6c2.js';
import '../common/lit-html-a0bff75d.js';
import { unsafeCSS } from '../lit-element.js';

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

/**
 * a mixin for avoiding that undefined attributes or properties values set by parent 
 * are applied to the element
 * @param  {LiElement Class} baseElement 
 * @return {LitElement Class}             
 */

/**
 * Change function that returns true if `value` is different from `oldValue`.
 * This method is used as the default for a property's `hasChanged` function.
 */
const notEqual = (value, old) => {
  // This ensures (old==NaN, value==NaN) always returns false
  return old !== value && (old === old || value === value);
};

const defaultConverter = {
  toAttribute(value, type) {
    switch (type) {
      case Boolean:
        return value ? '' : null;
      case Object:
      case Array:
        // if the value is `null` or `undefined` pass this through
        // to allow removing/no change behavior.
        return value == null ? value : JSON.stringify(value);
    }
    return value;
  },
  fromAttribute(value, type) {
    switch (type) {
      case Boolean:
        return value !== null;
      case Number:
        return value === null ? null : Number(value);
      case Object:
      case Array:
        return JSON.parse(value);
    }
    return value;
  }
};

const defaultPropertyDeclaration = {
  attribute: true,
  type: String,
  converter: defaultConverter,
  reflect: false,
  hasChanged: notEqual
};

const doNotSetUndefinedValue = (baseElement) => class extends baseElement {

  /**
   * Override the LitElement `createProperty` method to avoid undefined values to be set
   *
   * Creates a property accessor on the element prototype if one does not exist.
   * The property setter calls the property's `hasChanged` property option
   * or uses a strict identity check to determine whether or not to request
   * an update.
   * @nocollapse
   */
  static createProperty(name, options = defaultPropertyDeclaration) {
    // Note, since this can be called by the `@property` decorator which
    // is called before `finalize`, we ensure storage exists for property
    // metadata.
    this._ensureClassProperties();
    this._classProperties.set(name, options);
    // Do not generate an accessor if the prototype already has one, since
    // it would be lost otherwise and that would never be the user's intention;
    // Instead, we expect users to call `requestUpdate` themselves from
    // user-defined accessors. Note that if the super has an accessor we will
    // still overwrite it
    if (options.noAccessor || this.prototype.hasOwnProperty(name)) {
      return;
    }
    const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
    Object.defineProperty(this.prototype, name, {
      // tslint:disable-next-line:no-any no symbol in index
      get() {
        return this[key];
      },
      set(value) {
        // Note(cg): prevent undefined value to be set.
        if (value === undefined) {
          return;
        }
        const oldValue = this[name];
        this[key] = value;
        this._requestUpdate(name, oldValue);
      },
      configurable: true,
      enumerable: true
    });
  }
};

const selectMixin = (superclass) => class extends superclass {
  
  selectShadow(selector) {
    return selectShadow(selector, this);
  }
  
  queryShadow(selector) {
    return queryShadow(selector, this);
  }
};

/**
 * Enables the default option for properties to be applied as initial property values
 *
 * @param {LitElement} baseElement - the LitElement to extend
 */
const defaultValue = (baseElement) => class extends baseElement {
  
  constructor() {
    super();
    if (this.constructor.properties) {
      const { properties } = this.constructor;
      const propertyNames = Object.keys(properties);
      propertyNames.forEach((propertyName) => {
        if (!this.hasOwnProperty(propertyName) && properties[propertyName].hasOwnProperty('value')) {
          this[propertyName] = properties[propertyName].value instanceof Function ? properties[propertyName].value() : properties[propertyName].value;
        }
      });
    }
  }
  
};

// import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';

/**
 * RelayTo mixin, used to automatically relay properties to child components
 */

const RelayTo = superClass => {

  return class extends superClass {
    
    shallRelayTo() {
      this.log && console.warn(`shallPassTo method has to be overriden`);
      return false;
      
    }

    relayTo(props, name) {
      if (!this[`__${name}`]) {
        this[`__${name}`] = this.queryShadow(`#${name}`);
        if (!this[`__${name}`]) {
          throw new Error(`Failed to get ${name} from shadowDom!`)
        }
      }
      props.forEach((value, key) => {
        if (this.shallRelayTo(key, name)) {
          this.log && console.log('Change', key);
          this[`__${name}`][key] = this[key];
        }
      });
    }
  }

};

/**
 * Cache template nodes with an id so that we can call this.$.id
 */

const CacheId = superClass => {

  return class extends superClass {

    constructor() {
      super();
      this.$ = {};
    }

    // Note(cg): stores all ids under this.$
    firstUpdated(props) {
      super.firstUpdated(props);
      [...this.renderRoot.querySelectorAll('[id]')].forEach(node => {
        this.$[node.id] = node;
      });
    }
  }
};

export { CacheId, defaultValue as DefaultValueMixin, doNotSetUndefinedValue as DoNotSetUndefinedValue, RelayTo, selectMixin as SelectMixin, cssTheme, selectShadow };
