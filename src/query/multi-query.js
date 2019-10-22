import Base from '../base-class.js';
import { html } from 'lit-element';
import MultiVerseQuery from './multi-verse-query-mixin.js';

/**
 * ## MultiQuery
 *
 * `<multi-query>`  performs a query against `universe` and store the result under `queryResult`
 *
 * @memberof MultiVerse
 * @customElement
 * @polymer
 * @demo
 **/
class MultiQuery extends
MultiVerseQuery(
  Base) {


  render() {
    return html `<slot></slot>`
  }

  static get properties() {
    return {

      ...super.properties,
      /**
       * `keys` keys of data which value is not 0
       */
      keys: {
        type: Array,
        notify: true
      }
    };
  }
  /**
   * `observeQueryObject` when `universe` and `queryObject` are set, perform a query and set `queryResult` and `data` when the query Promise is resolved.
   */
  observeQueryObject() {
    if (this.universe && this.queryObject) {
      this.universe.query(this.queryObject)
        .then(queryResult => {
          this.queryResult = queryResult;
          this.data = queryResult.data;
          // this.length = this.data.length;
          this.keys = queryResult.data.filter(d => d.value.count).map(d => d.key);

        })
        .catch(error => {
          console.error('something went wrong in universe query', error, this.queryObject)
        });
    }
  }

}

export default MultiQuery