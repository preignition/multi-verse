const queryShadow = (selector, el) => {
  return el.renderRoot.querySelector(selector);
};

const selectMixin = (superclass) => class extends superclass {
  queryShadow(selector) {
    return queryShadow(selector, this);
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

    async relayTo(props, name) {
      if (!this[`__${name}`]) {
        this[`__${name}`] = this.queryShadow(`#${name}`);
        if (!this[`__${name}`]) {
          console.warn(`Failed to get ${name} from shadowDom!`);
          await this.updateComplete;
          return this.relayTo(props, name);
          // throw new Error(`Failed to get ${name} from shadowDom!`)
        }
      }
      props.forEach((value, key) => {
        if (this.shallRelayTo(key, name)) {
          this.log && console.log('Change', key);
          this[`__${name}`][key] = this[key];
        }
      });
    }
  };

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
      [...this.renderRoot.querySelectorAll('[id]')].forEach(node => {
        this.$[node.id] = node;
      });
      super.firstUpdated(props);
    }
  };
};

export { CacheId as C, RelayTo as R, selectMixin as s };
