import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
/**
 * ##  MultiVerseQuery
 * 
 * mixin for constructyin the query object. used by `multi-group` and `multi-query`
 * 
 * @memberof MultiVerse.mixin
 * @polymer
 * @mixinFunction
 */
const MultiVerseQuery = dedupingMixin(superClass => {

  return class extends superClass {

    static get properties() {
      return {
        /**
         * `universe` passed on by a `multi-verse` component
         */
        universe: {
          type: Object

        },

        /**
         * `queryResult` a result of a `universe` query
         */
        queryResult: {
          type: Object,
          attribute: 'query-result'
        },

        /**
         * `data` the data part of `queryResult` (`queryResult.data`)
         */
        data: {
          type: Array,
          notify: true
        },

        /*
         * `length` number of keys in data
         */
        length: {
          type: Number,
          reflect: true,
          notify: true
        },

        /* 
         * `type` the type of queryObject (`isArray`)
         */
        // type: {
        //   type: String,
        //   value: null
        // },

        /* 
         * `isArray` set to true to treat the column as an array
         */
        isArray: {
          type: Boolean,
          attribute: 'is-array'
        },

        /* 
         * `queryObject` the query object
         */
        queryObject: {
          type: Object,
          attribute: 'query-object'
        },

        /* 
         * `groupBy` 
         */
        groupBy: {
          type: String,
          attribute: 'group-by'
        },

        /* 
         * `select` the select Object
         */
        select: {
          type: Object,
          value: null
        },

        /* 
         * [`filter`] (https://github.com/crossfilter/universe#api-query) the filter Object
         */
        filter: {
          type: Object,
          value: null
        },

       /**
       * `keys` keys for this grouo
       */
      keys: {
        type: Array,
        notify: true
      }
      };
    }


    updated(props) {
      super.updated(props)
      if (props.has('groupBy') || props.has('select') || props.has('filter')) {
        this._observeForQueryObject()
      }
      if (props.has('universe') || props.has('queryObject')) {
        this.observeQueryObject();
      }
    }

    /**
     * `observeQueryObject` when `universe` and `queryObject` are set, perform a query and set `queryResult` and `data` when the query Promise is resolved.
     */
    observeQueryObject() {
      this.log && console.info('observeQueryObject');
      if (this.universe && this.queryObject) {
        this.universe.query(this.queryObject)
          .then(queryResult => {
            this.queryResult = queryResult;
            this.data = queryResult.data;
            this.length = this.data.length;
            if(!this.keys)  {
                this.keys = queryResult.data.map(d => d.key);
            }
            this.log && console.info('observeQueryObject Result', this.data, queryResult);

          })
          .catch(error => {
            console.error('something went wrong in universe query', error, this.queryObject)
          });
      }
    }

    _observeForQueryObject() {

      if (!this.groupBy) { return; }

      this._debounceMultiQuery = Debouncer.debounce(
        this._debounceMultiQuery, // initially undefined
        microTask,
        () => {


          const query = {
            groupBy: this.groupBy
          };

          let filter, select;
          if (this.filter) {
            try {
              filter = typeof this.filter === 'string' ? JSON.parse(this.filter) : this.filter;
            } catch (e) {
              console.error('error with queryObject filter', e); // error in the above string (in this case, yes)!
            }
          }

          if (this.select) {
            try {
              select = typeof this.select === 'string' ? JSON.parse(this.select) : this.select;
            } catch (e) {
              console.error('error with queryObject filter', e); // error in the above string (in this case, yes)!
            }
          }
          if (filter) {
            query.filter = filter;
          }
          if (select) {
            query.select = select;
          }
          // type and isArray is derived from dataSample when universe makes the dimension  column.type = getType(sample) in columns.js. If Sample is an array, the column is an array as well
          // if (this.type) {
          //   query.type = this.type;
          // }
          if (this.isArray) {
            query.array = true;
          }

          this.queryObject = query;

          // this.set('queryObject', query);
          // this.debounce('multi-query-set-object', function() {
          // });
        }, 20);
    }
  };
})

export default MultiVerseQuery