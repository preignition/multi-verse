import { default as MultiTop } from './multi-top.js';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';

const deep = (action, obj, keys, id, key) => {
  keys = keys.split(".");
  id = keys.splice(-1, 1);
  for (key in keys) obj = obj[keys[key]] = obj[keys[key]] || {};
  return action(obj, id);
}
const get = (obj, prop) => obj[prop];
const deepget = (obj, path) => deep(get, obj, path);
/**
 * ## MultiDataProvider
 *
 * `<multi-data-provider>`  exposes a dataProvider function to be used with vaadin-grid
 *
 * @memberof MultiVerse
 * @customElement
 * @polymer
 * @appliesMixin  MultiChart.mixin.MultiRegisterable
 * @demo
 **/
class MultiDataProvider extends MultiTop {

  static get properties() {
    return {

      ...super.properties,

      /* 
       * `dataProvider` a dataprovider function that can be reused in Vaadin-grid
       * Function that provides items lazily. Receives arguments `params`, `callback`
       *
       * `params.page` Requested page index
       *
       * `params.pageSize` Current page size
       *
       * `params.filters` Currently applied filters
       *
       * `params.sortOrders` Currently applied sorting orders
       *
       * `params.parentItem` When tree is used, and sublevel items
       * are requested, reference to parent item of the requested sublevel.
       * Otherwise `undefined`.
       *
       * `callback(items, size)` Callback function with arguments:
       *   - `items` Current page of items
       *   - `size` Total number of items. When tree sublevel items
       *     are requested, total number of items in the requested sublevel.
       *     Optional when tree is not used, required for tree.
       */
      dataProvider: {
        type: Function,
        attribute: 'data-provider',
        notify: true

      },

      /* 
       * `grid` the grid where filters and sorters are stored. 
       */
      grid: {
        type: Object,
      }
    };
  }

  updated(props) {
    super.updated(props);
    if(props.has('dimension') || props.has('grid')) {
      this._observeForGrid(this.dimension, this.grid);
    }
  }

  connectedCallback() {
    super.connectedCallback();

    if (!this.grid) {
      this._observer = new FlattenedNodesObserver(this, info => {
        // Note(cg): if we add a Vaadin-Grid,  set it as the grid
        info.addedNodes.forEach(el => {
          if (el.localName === 'vaadin-grid') {
            this.grid = el;
          }
        });
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._observer) {
      this._observer.disconnect();
    }
  }

  getDataProvider(dim, provider) {

    return function(params, cb) {

      const { sortOrders, page, pageSize } = params;
      let offset = page * pageSize;

      // Note(cg): select column sends page = 0 and pageSize = Ininity.
      if (isNaN(offset)) {
        offset = 0;
      }

      let data = dim.bottom(Infinity);
      let filterLength;
      provider.length = data.length;



      if ((this._filters && this._filters.length) || (sortOrders && sortOrders.length)) {
        if (this._filters && this._checkPaths(this._filters, 'filtering', data)) {
          data = this._filter(data);
        }
        filterLength = data.length;
        if (sortOrders.length && this._checkPaths(sortOrders, 'sorting', data)) {
          data = data.sort(this._multiSort.bind(this));
        }
        data = data.slice(offset, offset + pageSize);
      } else {
        data = dim.bottom(pageSize, offset);
      }

      provider.data = data;
      cb(
        data,
        filterLength || provider.length
      );
    };
  }


  //@override multi-top
  _observeForGrid(dim, grid) {
    if (dim && grid) {
      this.dataProvider = this.getDataProvider(dim, this).bind(grid);
    }
  }

  dataChanged() {
    super.dataChanged();
    if (this.dimension && this.grid) {
      this.dataProvider = this.getDataProvider(this.dimension, this).bind(this.grid);
    }
    return;
  }

  /**
   * Check array of filters/sorters for paths validity, console.warn invalid items
   * @param {Array}  arrayToCheck The array of filters/sorters to check
   * @param {string} action       The name of action to include in warning (filtering, sorting)
   * @param {Array}  items
   */
  _checkPaths(arrayToCheck, action, items) {
    if (!items.length) {
      return false;
    }

    let result = true;

    for (var i in arrayToCheck) {
      const path = arrayToCheck[i].path;

      // skip simple paths
      if (!path || path.indexOf('.') === -1) {
        continue;
      }

      const parentProperty = path.replace(/\.[^\.]*$/, ''); // a.b.c -> a.b
      if (deepget(items[0], parentProperty) === undefined) {
        console.warn(`Path "${path}" used for ${action} does not exist in all of the items, ${action} is disabled.`);
        result = false;
      }
    }

    return result;
  }

  _multiSort(a, b) {
    return this._sorters.map(sort => {
      if (sort.direction === 'asc') {
        return this._compare(deepget(a, sort.path), deepget(b, sort.path));
      } else if (sort.direction === 'desc') {
        return this._compare(deepget(b, sort.path), deepget(a, sort.path));
      }
      return 0;
    }).reduce((p, n) => {
      return p ? p : n;
    }, 0);
  }

  _normalizeEmptyValue(value) {
    if ([undefined, null].indexOf(value) >= 0) {
      return '';
    } else if (isNaN(value)) {
      return value.toString();
    } else {
      return value;
    }
  }

  _compare(a, b) {
    a = this._normalizeEmptyValue(a);
    b = this._normalizeEmptyValue(b);

    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }

  _filter(items) {
    return items.filter((item, index) => {
      return this._filters.filter(filter => {
        const value = this._normalizeEmptyValue(deepget(item, filter.path));
        const filterValueLowercase = this._normalizeEmptyValue(filter.value).toString().toLowerCase();
        return value.toString().toLowerCase().indexOf(filterValueLowercase) === -1;
      }).length === 0;
    });
  }
}

export default MultiDataProvider