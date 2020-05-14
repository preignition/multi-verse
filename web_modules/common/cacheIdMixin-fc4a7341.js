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

export { CacheId as C, RelayTo as R };
