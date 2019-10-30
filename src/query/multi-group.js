import Base from '../base-class.js';
import { html } from 'lit-element';
import { RegisterMixin } from '@preignition/multi-chart';
import MultiVerseQuery from './multi-verse-query-mixin.js';

/**
 * ## MultiGroup
 *
 * `<multi-group>`  will group `universe`  by their `groupBy` property and expose the result data set (so that a chart can render it)
 *
 * `multi-group` are also responsible for listening to `multi-select` events triggered for instance by `multi-chart` instances
 * (e.g. selecting a range of data from a bar chart or clicking on a pie element).
 *
 * ### Exampple
 *  <multi-verse id="universe" data="[[data]]" universe="{{universe}}">
 *    <multi-group universe="[[universe]]" data="{{data-chart-distance}}" group-by="distances">
 *      <multi-chart-bar title="distance" data="[[data-chart-distance]]"> </multi-chart-bar>
 *    </multi-group>
 *  </multi-verse>
 *
 * @memberof MultiChart
 * @customElement
 * @polymer
 * @appliesMixin MultiChart.mixin.Logger
 * @demo
 **/
class MultiGroup extends
RegisterMixin(
  MultiVerseQuery(
    Base)) {

  render() {
    return html `<slot></slot>`;
  }


  constructor() {
    super();
    this.addEventListener('multi-select', this.onSelect);
    this.addEventListener('multi-clear', this.onClear);
  }
  /**
   * `onSelect` filter the `universe` when a `multi-select` event is captured
   */
  onSelect(e) {
    if (this.queryResult) {
      const selection = e.detail.selection;
      // var me = this;
      if (selection && selection.length) {
        // we need to replace the current filter (true as last parameter). otherwise, filtering is not properly working ...
        this.queryResult.universe.filter(this.queryResult.column.key, selection, !!e.detail.isRange, true);
      } else {
        // clear the filter
        this.queryResult.universe.filter(this.queryResult.column.key);
      }
    }
  }

  /*
   * `onClear`  clear the filter
   */
  onClear(e) {
    e.stopPropagation();
    if (this.queryResult) {
      // this.queryResult.universe.clear(this.queryResult.column.key);
      this.queryResult.universe.filter(this.queryResult.column.key);
    }
  }
}

export default MultiGroup;
