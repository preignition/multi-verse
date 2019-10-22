import Base from '../base-class.js';
import { html } from 'lit-element';
import { RegisterableMixin } from '@preignition/multi-chart';


/**
 * ## MultiTop
 *
 * `<multi-top>`  for getting top `number` along a `column`
 *
 * @memberof MultiVerse
 * @customElement
 * @polymer
 * @appliesMixin  MultiChart.mixin.MultiRegisterable
 * @demo
 **/
class MultiTop extends
  RegisterableMixin(
    Base) {

  render() {
    return html `<slot></slot>`
  }

  static get properties() {
    return {

      ...super.properties,

      /**
       * `universe` passed on by a `multi-verse` component
       */
      universe: {
        type: Object
      },

      /**
       * `column` the name of a universe column
       */
      column: {
        type: String
      },

      /**
       * `data` the data part of `queryResult` (`queryResult.data`)
       */
      data: {
        type: Array,
        notify: true
      },

      /**
       * `group` the name of the group (used when to registering this element under a multi-verse)
       */
      group: {
        type: String,
        value: 'default'
      },

      /**
       * `length` total length of the dimension attached
       */
      length: {
        type: Number,
        notify: true
      },

      /**
       * `top` 
       */
      top: {
        type: Number,
        value: 100
      },

      /**
       * `offset` 
       */
      offset: {
        type: Number,
        value: 0
      },


      /**
       * `start`
       */
      start: {
        type: Number,
        value: 0
      },


      dimension: {
        type: Object,
        // computed: '_findDim(universe, column)'
      },

      /* 
       * `fireEventName`  the name of the event to be fired when connected. a contained with multi-register-mixin applied 
       * will listed to this event to register the component.
       * @override multi.registerable
       */
      // fireEventName: {
      //   type: String,
      //   value: 'multi-verse-added'
      // }

    };
  }

  /* 
   * `registerEventName`  the name of the event to be fired when connected. 
   * A container with multi-register-mixin applied 
   * will listen to this event to register the component.
   *
   */
  get registerEventDispatch() {
    return 'multi-verse-added'
  }

  updated(props) {
    super.updated(props)
    if(props.has('column') || props.has('universe')) {
      this.dimension = this.getDimension()
    }
    if (props.has('top') || props.has('offset')) {
      this._computeTop();
    }
  }

  // _findDim(universe, column) {
  getDimension(universe, column) {
    universe = universe || this.universe;
    column = column || this.column;
    
    if (universe && column) {
      const dim = universe.column.find(column).dimension;
      if (!dim) {
        this.log && console.warn('cannot find dimension');
      }
      return dim;
    }
  }

  _computeTop() {
    const dim = this.getDimension(this.universe, this.column);
    if (!dim) {
      this.log && console.warn('dimension not ready');
      return;
    }
    this.data = dim.top(this.top, this.offset);
    this.length = dim.top(Infinity).length;
  }
}

export default MultiTop