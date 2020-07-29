import Base from '../base-class.js';
import { html } from 'lit-element';
import { RegisterMixin } from '@preignition/multi-chart';
import { default as universe } from 'universe';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';

/**
 * ## MultiVerse
 *
 * `<multi-verse>` takes data as input and encapsulate a [`universe`](https://github.com/crossfilter/universe#create-a-new-universe) Object.
 * When `universe` changes (query or filtering), `registeredItems` (e.g. charts rendering `universe` data) are notified of the change and will render accordingly.
 *
 * ### Example
 * ```html
 *  <multi-verse id="universe" data="[[data]]" universe="{{universe}}">
 *    <multi-group universe="[[universe]]" data="{{data-chart-distance}}" group-by="distances">
 *      <multi-chart-bar title="distance" data="[[data-chart-distance]]"> </multi-chart-bar>
 *    </multi-group>
 *    <multi-group universe="[[universe]]" data="{{data-chart-day}}" group-by="day">
 *      <multi-chart-pie title="day (pie)" data="[[data-chart-day]]" color-scale="{{colorScale}}" width="{{width}}">
 *        <multi-legend legend chart-width="[[width]]" scale="[[colorScale]]" position="top-right"></multi-legend>
 *      </multi-chart-pie>
 *    </multi-group>
 *  </multi-verse>
 *
 * @memberof MultiVerse
 * @customElement
 * @polymer
 * @appliesMixin MultiChart.mixin.MultiRegister
 * @appliesMixin MultiChart.mixin.Logger
 * @demo
 **/
class MultiVerse extends
RegisterMixin(
  Base) {

  render() {
    return html `<slot></slot>`;
  }


  static get properties() {
    return {

      ...super.properties,

      /**
       * `data`  the data to pass for creating a new [universe](https://github.com/crossfilter/universe#create-a-new-universe)
       */
      data: {
        type: Array
      },

      /**
       * `universe` expose the created universe instance
       */
      universe: {
        type: Object
      },

      /**
       * [`generatedColumns`](https://github.com/crossfilter/universe#universe-data--config--) optional column configuration to universe instance
       */
      generatedColumns: {
        type: Object,
        attribute: 'generated-columns',
        value: {}
      },

      /**
       * `preProcess` a function that will be called on all data item before the creation of the universe instance
       */
      preProcess: {
        type: Function,
        attribute: 'pre-process'
      },

      /*
       * `postFilter` a function that will be called after each filter `postFilter(universe, data)`
       */
      postFilter: {
        type: Function,
        attribute: 'post-filter'
      },

      /**
       * `group` if set will only register webcomponents with the same `group`. Otherwise, every web-component that fire a `multi-attached` event will be registered
       */
      group: {
        type: String,
        value: 'default'
      },

      /**
       * [`columns`](https://github.com/crossfilter/universe#column-columnkeycolumnobject--)
       */
      columns: {
        type: Object,
        value: function() {
          return {};
        }
      },

      /*
       * `registerContainerName` the name of the container set to registered items. This is needed because
       * some items can be registered agains mutiple domain. For instance, multi-g : as an resizable svg item
       * and against multi-verse.
       */
      registerContainerName: {
        type: String,
        attribute: 'register-container-name',
        value: 'multiVerseHost'
      }
    };
  }

  /*
   * @override Register
   */
  get registerEventListen() {
    return 'multi-verse-added';
  }


  /*
   * @override Register
   */
  // get unregisterEventListen() {
  //   return 'multi-verse-removed';
  // }
  
  updated(props) {
    super.updated(props);
    if (props.has('preProcess') || props.has('data')) {
      this.observeData();
    }
  }

  /**
   * `observeData` create a new `universe` with the provided data
   * TODO: add a `multi-column` web-component to define additional universe.generatedColumns and a processing function
   */
  observeData() {
    this.log && console.log('observeData', this.data);
    if (!this.data || !this.data.length) { return; }

    if (this.preProcess) {
      this.data.forEach(this.preProcess, this);
    }
    this.dispatchEvent(new CustomEvent('filtered-count-changed', {detail: {value: this.data.length}}));
    
    universe(this.data, {
        generatedColumns: this.generatedColumns
      }).then(uni => {

        uni.onFilter(() => {
          this._debounceMultiFilter = Debouncer.debounce(
            this._debounceMultiFilter, // initially undefined
            microTask,
            () => {
              const allFiltered = uni.allFiltered();
              this.log && console.log('dataChanged', allFiltered, this.data);
              this.dispatchEvent(new CustomEvent('filtered-count-changed', {detail: {value: allFiltered.length}}));
              // Note(cg): this will only affect registered elements with dataFilteredChanged method.
              this.callRegistered('dataFilteredChanged', allFiltered);
              this.callRegistered('dataChanged');
            });

          if (this.postFilter) {
            this._debouncePostFilter = Debouncer.debounce(
              this._debouncePostFilter, // initially undefined
              microTask,
              () => {
                this.postFilter(uni, this.data);
              });
          }

        });

        // const columns = this.columns;
        return Promise.all(Object.keys(this.columns).map(k => {
            return uni.column(this.columns[k]);
          }))
          .then(() => {
            this.universe = uni;
            this.dispatch('universe');
            return uni;
          });

        // if (Object.keys(columns).length) {
        //   for (var k in columns) {
        //     if (columns.hasOwnProperty(k)) {
        //       uni.column(columns[k]);
        //     }
        //   }
        // }

        // return uni;
      })

      .catch(error => {
        console.error('MultiVerse Error', error);
      });

  }
}

export default MultiVerse;
