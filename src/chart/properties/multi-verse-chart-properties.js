export default {
  /**
   * `path` the path from which the value accessor function is built
   * For instance `+value.count` will create `d => {return +d.value.count}` function.
   */
  path: {
    type: String,
    value: '+value.count'
  },

  /**
   * `keyPath` the path from which the key accessor function is built
   * For instance `key` will create `d => {return d.key}` function.
   */
  keyPath: {
    type: String,
    attribute: 'key-path',
    value: 'key'
  },

  /*
   * `serieLabel` label to apply to the serie
   */
  serieLabel: {
    type: String,
    attribute: 'serie-label',
    value: 'count'
  },

  leftTickArguments: {
    type: Array,
    attribute: 'left-tick-arguments',
    value: [5, '.1s']
  },

  leftMargin: {
    attribute: 'left-margin',
    type: Number,
    value: 40
  }
};
