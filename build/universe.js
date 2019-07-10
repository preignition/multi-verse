// webcomponents.org/polymerEl/multi-verse v2.2.0 Copyright 2019 Christophe Geiser
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.universe = factory());
}(this, (function () { 'use strict';

  /* eslint no-prototype-builtins: 0 */

  var lodash = {
    assign: assign,
    find: find,
    remove: remove,
    isArray: isArray,
    isObject: isObject,
    isBoolean: isBoolean,
    isString: isString,
    isNumber: isNumber,
    isFunction: isFunction,
    get: get,
    set: set,
    map: map,
    keys: keys,
    sortBy: sortBy,
    forEach: forEach,
    isUndefined: isUndefined,
    pick: pick,
    xor: xor,
    clone: clone,
    isEqual: isEqual,
    replaceArray: replaceArray,
    uniq: uniq,
    flatten: flatten,
    sort: sort,
    values: values,
    recurseObject: recurseObject,
  };

  function assign(out) {
    out = out || {};
    for (var i = 1; i < arguments.length; i++) {
      if (!arguments[i]) {
        continue
      }
      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          out[key] = arguments[i][key];
        }
      }
    }
    return out
  }

  function find(a, b) {
    return a.find(b)
  }

  function remove(a, b) {
    return a.filter(function (o, i) {
      var r = b(o);
      if (r) {
        a.splice(i, 1);
        return true
      }
      return false
    })
  }

  function isArray(a) {
    return Array.isArray(a)
  }

  function isObject(d) {
    return typeof d === 'object' && !isArray(d)
  }

  function isBoolean(d) {
    return typeof d === 'boolean'
  }

  function isString(d) {
    return typeof d === 'string'
  }

  function isNumber(d) {
    return typeof d === 'number'
  }

  function isFunction(a) {
    return typeof a === 'function'
  }

  function get(a, b) {
    if (isArray(b)) {
      b = b.join('.');
    }
    return b
      .replace('[', '.').replace(']', '')
      .split('.')
      .reduce(
        function (obj, property) {
          return obj[property]
        }, a
      )
  }

  function set(obj, prop, value) {
    if (typeof prop === 'string') {
      prop = prop
        .replace('[', '.').replace(']', '')
        .split('.');
    }
    if (prop.length > 1) {
      var e = prop.shift();
      assign(obj[e] =
        Object.prototype.toString.call(obj[e]) === '[object Object]' ? obj[e] : {},
      prop,
      value);
    } else {
      obj[prop[0]] = value;
    }
  }

  function map(a, b) {
    var m;
    var key;
    if (isFunction(b)) {
      if (isObject(a)) {
        m = [];
        for (key in a) {
          if (a.hasOwnProperty(key)) {
            m.push(b(a[key], key, a));
          }
        }
        return m
      }
      return a.map(b)
    }
    if (isObject(a)) {
      m = [];
      for (key in a) {
        if (a.hasOwnProperty(key)) {
          m.push(a[key]);
        }
      }
      return m
    }
    return a.map(function (aa) {
      return aa[b]
    })
  }

  function keys(obj) {
    return Object.keys(obj)
  }

  function sortBy(a, b) {
    if (isFunction(b)) {
      return a.sort(function (aa, bb) {
        if (b(aa) > b(bb)) {
          return 1
        }
        if (b(aa) < b(bb)) {
          return -1
        }
        // a must be equal to b
        return 0
      })
    }
  }

  function forEach(a, b) {
    if (isObject(a)) {
      for (var key in a) {
        if (a.hasOwnProperty(key)) {
          b(a[key], key, a);
        }
      }
      return
    }
    if (isArray(a)) {
      return a.forEach(b)
    }
  }

  function isUndefined(a) {
    return typeof a === 'undefined'
  }

  function pick(a, b) {
    var c = {};
    forEach(b, function (bb) {
      if (typeof a[bb] !== 'undefined') {
        c[bb] = a[bb];
      }
    });
    return c
  }

  function xor(a, b) {
    var unique = [];
    forEach(a, function (aa) {
      if (b.indexOf(aa) === -1) {
        return unique.push(aa)
      }
    });
    forEach(b, function (bb) {
      if (a.indexOf(bb) === -1) {
        return unique.push(bb)
      }
    });
    return unique
  }

  function clone(a) {
    return JSON.parse(JSON.stringify(a, function replacer(key, value) {
      if (typeof value === 'function') {
        return value.toString()
      }
      return value
    }))
  }

  function isEqual(x, y) {
    if ((typeof x === 'object' && x !== null) && (typeof y === 'object' && y !== null)) {
      if (Object.keys(x).length !== Object.keys(y).length) {
        return false
      }

      for (var prop in x) {
        if (y.hasOwnProperty(prop)) {
          if (!isEqual(x[prop], y[prop])) {
            return false
          }
        }
        return false
      }

      return true
    } else if (x !== y) {
      return false
    }
    return true
  }

  function replaceArray(a, b) {
    var al = a.length;
    var bl = b.length;
    if (al > bl) {
      a.splice(bl, al - bl);
    } else if (al < bl) {
      a.push.apply(a, new Array(bl - al));
    }
    forEach(a, function (val, key) {
      a[key] = b[key];
    });
    return a
  }

  function uniq(a) {
    var seen = new Set();
    return a.filter(function (item) {
      var allow = false;
      if (!seen.has(item)) {
        seen.add(item);
        allow = true;
      }
      return allow
    })
  }

  function flatten(aa) {
    var flattened = [];
    for (var i = 0; i < aa.length; ++i) {
      var current = aa[i];
      for (var j = 0; j < current.length; ++j) {
        flattened.push(current[j]);
      }
    }
    return flattened
  }

  function sort(arr) {
    for (var i = 1; i < arr.length; i++) {
      var tmp = arr[i];
      var j = i;
      while (arr[j - 1] > tmp) {
        arr[j] = arr[j - 1];
        --j;
      }
      arr[j] = tmp;
    }

    return arr
  }

  function values(a) {
    var values = [];
    for (var key in a) {
      if (a.hasOwnProperty(key)) {
        values.push(a[key]);
      }
    }
    return values
  }

  function recurseObject(obj, cb) {
    _recurseObject(obj, []);
    return obj
    function _recurseObject(obj, path) {
      for (var k in obj) { //  eslint-disable-line guard-for-in
        var newPath = clone(path);
        newPath.push(k);
        if (typeof obj[k] === 'object' && obj[k] !== null) {
          _recurseObject(obj[k], newPath);
        } else {
          if (!obj.hasOwnProperty(k)) {
            continue
          }
          cb(obj[k], k, newPath);
        }
      }
    }
  }

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  function getCjsExportFromNamespace (n) {
  	return n && n.default || n;
  }

  if (typeof Uint8Array !== "undefined") {
    var crossfilter_array8 = function(n) { return new Uint8Array(n); };
    var crossfilter_array16 = function(n) { return new Uint16Array(n); };
    var crossfilter_array32 = function(n) { return new Uint32Array(n); };

    var crossfilter_arrayLengthen = function(array, length) {
      if (array.length >= length) return array;
      var copy = new array.constructor(length);
      copy.set(array);
      return copy;
    };

    var crossfilter_arrayWiden = function(array, width) {
      var copy;
      switch (width) {
        case 16: copy = crossfilter_array16(array.length); break;
        case 32: copy = crossfilter_array32(array.length); break;
        default: throw new Error("invalid array width!");
      }
      copy.set(array);
      return copy;
    };
  }

  function crossfilter_arrayUntyped(n) {
    var array = new Array(n), i = -1;
    while (++i < n) array[i] = 0;
    return array;
  }

  function crossfilter_arrayLengthenUntyped(array, length) {
    var n = array.length;
    while (n < length) array[n++] = 0;
    return array;
  }

  function crossfilter_arrayWidenUntyped(array, width) {
    if (width > 32) throw new Error("invalid array width!");
    return array;
  }

  // An arbitrarily-wide array of bitmasks
  function crossfilter_bitarray(n) {
    this.length = n;
    this.subarrays = 1;
    this.width = 8;
    this.masks = {
      0: 0
    };

    this[0] = crossfilter_array8(n);
  }

  crossfilter_bitarray.prototype.lengthen = function(n) {
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      this[i] = crossfilter_arrayLengthen(this[i], n);
    }
    this.length = n;
  };

  // Reserve a new bit index in the array, returns {offset, one}
  crossfilter_bitarray.prototype.add = function() {
    var m, w, one, i, len;

    for (i = 0, len = this.subarrays; i < len; ++i) {
      m = this.masks[i];
      w = this.width - (32 * i);
      one = ~m & -~m;

      if (w >= 32 && !one) {
        continue;
      }

      if (w < 32 && (one & (1 << w))) {
        // widen this subarray
        this[i] = crossfilter_arrayWiden(this[i], w <<= 1);
        this.width = 32 * i + w;
      }

      this.masks[i] |= one;

      return {
        offset: i,
        one: one
      };
    }

    // add a new subarray
    this[this.subarrays] = crossfilter_array8(this.length);
    this.masks[this.subarrays] = 1;
    this.width += 8;
    return {
      offset: this.subarrays++,
      one: 1
    };
  };

  // Copy record from index src to index dest
  crossfilter_bitarray.prototype.copy = function(dest, src) {
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      this[i][dest] = this[i][src];
    }
  };

  // Truncate the array to the given length
  crossfilter_bitarray.prototype.truncate = function(n) {
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      for (var j = this.length - 1; j >= n; j--) {
        this[i][j] = 0;
      }
    }
    this.length = n;
  };

  // Checks that all bits for the given index are 0
  crossfilter_bitarray.prototype.zero = function(n) {
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      if (this[i][n]) {
        return false;
      }
    }
    return true;
  };

  // Checks that all bits for the given index are 0 except for possibly one
  crossfilter_bitarray.prototype.zeroExcept = function(n, offset, zero) {
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      if (i === offset ? this[i][n] & zero : this[i][n]) {
        return false;
      }
    }
    return true;
  };

  // Checks that all bits for the given indez are 0 except for the specified mask.
  // The mask should be an array of the same size as the filter subarrays width.
  crossfilter_bitarray.prototype.zeroExceptMask = function(n, mask) {
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      if (this[i][n] & mask[i]) {
        return false;
      }
    }
    return true;
  };

  // Checks that only the specified bit is set for the given index
  crossfilter_bitarray.prototype.only = function(n, offset, one) {
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      if (this[i][n] != (i === offset ? one : 0)) {
        return false;
      }
    }
    return true;
  };

  // Checks that only the specified bit is set for the given index except for possibly one other
  crossfilter_bitarray.prototype.onlyExcept = function(n, offset, zero, onlyOffset, onlyOne) {
    var mask;
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      mask = this[i][n];
      if (i === offset)
        mask &= zero;
      if (mask != (i === onlyOffset ? onlyOne : 0)) {
        return false;
      }
    }
    return true;
  };

  var array = {
    array8: crossfilter_arrayUntyped,
    array16: crossfilter_arrayUntyped,
    array32: crossfilter_arrayUntyped,
    arrayLengthen: crossfilter_arrayLengthenUntyped,
    arrayWiden: crossfilter_arrayWidenUntyped,
    bitarray: crossfilter_bitarray
  };

  function crossfilter_filterExact(bisect, value) {
    return function(values) {
      var n = values.length;
      return [bisect.left(values, value, 0, n), bisect.right(values, value, 0, n)];
    };
  }

  function crossfilter_filterRange(bisect, range) {
    var min = range[0],
        max = range[1];
    return function(values) {
      var n = values.length;
      return [bisect.left(values, min, 0, n), bisect.left(values, max, 0, n)];
    };
  }

  function crossfilter_filterAll(values) {
    return [0, values.length];
  }

  var filter = {
    filterExact: crossfilter_filterExact,
    filterRange: crossfilter_filterRange,
    filterAll: crossfilter_filterAll
  };

  function crossfilter_identity(d) {
    return d;
  }

  var identity = crossfilter_identity;

  function crossfilter_null() {
    return null;
  }

  var _null = crossfilter_null;

  function crossfilter_zero() {
    return 0;
  }

  var zero = crossfilter_zero;

  function heap_by(f) {

    // Builds a binary heap within the specified array a[lo:hi]. The heap has the
    // property such that the parent a[lo+i] is always less than or equal to its
    // two children: a[lo+2*i+1] and a[lo+2*i+2].
    function heap(a, lo, hi) {
      var n = hi - lo,
          i = (n >>> 1) + 1;
      while (--i > 0) sift(a, i, n, lo);
      return a;
    }

    // Sorts the specified array a[lo:hi] in descending order, assuming it is
    // already a heap.
    function sort(a, lo, hi) {
      var n = hi - lo,
          t;
      while (--n > 0) t = a[lo], a[lo] = a[lo + n], a[lo + n] = t, sift(a, 1, n, lo);
      return a;
    }

    // Sifts the element a[lo+i-1] down the heap, where the heap is the contiguous
    // slice of array a[lo:lo+n]. This method can also be used to update the heap
    // incrementally, without incurring the full cost of reconstructing the heap.
    function sift(a, i, n, lo) {
      var d = a[--lo + i],
          x = f(d),
          child;
      while ((child = i << 1) <= n) {
        if (child < n && f(a[lo + child]) > f(a[lo + child + 1])) child++;
        if (x <= f(a[lo + child])) break;
        a[lo + i] = a[lo + child];
        i = child;
      }
      a[lo + i] = d;
    }

    heap.sort = sort;
    return heap;
  }

  var heap = heap_by(identity);
  var by = heap_by;
  heap.by = by;

  function heapselect_by(f) {
    var heap$$1 = heap.by(f);

    // Returns a new array containing the top k elements in the array a[lo:hi].
    // The returned array is not sorted, but maintains the heap property. If k is
    // greater than hi - lo, then fewer than k elements will be returned. The
    // order of elements in a is unchanged by this operation.
    function heapselect(a, lo, hi, k) {
      var queue = new Array(k = Math.min(hi - lo, k)),
          min,
          i,
          d;

      for (i = 0; i < k; ++i) queue[i] = a[lo++];
      heap$$1(queue, 0, k);

      if (lo < hi) {
        min = f(queue[0]);
        do {
          if (f(d = a[lo]) > min) {
            queue[0] = d;
            min = f(heap$$1(queue, 0, k)[0]);
          }
        } while (++lo < hi);
      }

      return queue;
    }

    return heapselect;
  }

  var heapselect = heapselect_by(identity);
  var by$1 = heapselect_by; // assign the raw function to the export as well
  heapselect.by = by$1;

  function bisect_by(f) {

    // Locate the insertion point for x in a to maintain sorted order. The
    // arguments lo and hi may be used to specify a subset of the array which
    // should be considered; by default the entire array is used. If x is already
    // present in a, the insertion point will be before (to the left of) any
    // existing entries. The return value is suitable for use as the first
    // argument to `array.splice` assuming that a is already sorted.
    //
    // The returned insertion point i partitions the array a into two halves so
    // that all v < x for v in a[lo:i] for the left side and all v >= x for v in
    // a[i:hi] for the right side.
    function bisectLeft(a, x, lo, hi) {
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (f(a[mid]) < x) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    }

    // Similar to bisectLeft, but returns an insertion point which comes after (to
    // the right of) any existing entries of x in a.
    //
    // The returned insertion point i partitions the array into two halves so that
    // all v <= x for v in a[lo:i] for the left side and all v > x for v in
    // a[i:hi] for the right side.
    function bisectRight(a, x, lo, hi) {
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (x < f(a[mid])) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    }

    bisectRight.right = bisectRight;
    bisectRight.left = bisectLeft;
    return bisectRight;
  }

  var bisect = bisect_by(identity);
  var by$2 = bisect_by; // assign the raw function to the export as well
  bisect.by = by$2;

  function insertionsort_by(f) {

    function insertionsort(a, lo, hi) {
      for (var i = lo + 1; i < hi; ++i) {
        for (var j = i, t = a[i], x = f(t); j > lo && f(a[j - 1]) > x; --j) {
          a[j] = a[j - 1];
        }
        a[j] = t;
      }
      return a;
    }

    return insertionsort;
  }

  var insertionsort = insertionsort_by(identity);
  var by$3 = insertionsort_by;
  insertionsort.by = by$3;

  function permute(array, index, deep) {
    for (var i = 0, n = index.length, copy = deep ? JSON.parse(JSON.stringify(array)) : new Array(n); i < n; ++i) {
      copy[i] = array[index[i]];
    }
    return copy;
  }

  var permute_1 = permute;

  // Algorithm designed by Vladimir Yaroslavskiy.
  // Implementation based on the Dart project; see NOTICE and AUTHORS for details.

  function quicksort_by(f) {
    var insertionsort$$1 = insertionsort.by(f);

    function sort(a, lo, hi) {
      return (hi - lo < quicksort_sizeThreshold
          ? insertionsort$$1
          : quicksort)(a, lo, hi);
    }

    function quicksort(a, lo, hi) {
      // Compute the two pivots by looking at 5 elements.
      var sixth = (hi - lo) / 6 | 0,
          i1 = lo + sixth,
          i5 = hi - 1 - sixth,
          i3 = lo + hi - 1 >> 1,  // The midpoint.
          i2 = i3 - sixth,
          i4 = i3 + sixth;

      var e1 = a[i1], x1 = f(e1),
          e2 = a[i2], x2 = f(e2),
          e3 = a[i3], x3 = f(e3),
          e4 = a[i4], x4 = f(e4),
          e5 = a[i5], x5 = f(e5);

      var t;

      // Sort the selected 5 elements using a sorting network.
      if (x1 > x2) t = e1, e1 = e2, e2 = t, t = x1, x1 = x2, x2 = t;
      if (x4 > x5) t = e4, e4 = e5, e5 = t, t = x4, x4 = x5, x5 = t;
      if (x1 > x3) t = e1, e1 = e3, e3 = t, t = x1, x1 = x3, x3 = t;
      if (x2 > x3) t = e2, e2 = e3, e3 = t, t = x2, x2 = x3, x3 = t;
      if (x1 > x4) t = e1, e1 = e4, e4 = t, t = x1, x1 = x4, x4 = t;
      if (x3 > x4) t = e3, e3 = e4, e4 = t, t = x3, x3 = x4, x4 = t;
      if (x2 > x5) t = e2, e2 = e5, e5 = t, t = x2, x2 = x5, x5 = t;
      if (x2 > x3) t = e2, e2 = e3, e3 = t, t = x2, x2 = x3, x3 = t;
      if (x4 > x5) t = e4, e4 = e5, e5 = t, t = x4, x4 = x5, x5 = t;

      var pivot1 = e2, pivotValue1 = x2,
          pivot2 = e4, pivotValue2 = x4;

      // e2 and e4 have been saved in the pivot variables. They will be written
      // back, once the partitioning is finished.
      a[i1] = e1;
      a[i2] = a[lo];
      a[i3] = e3;
      a[i4] = a[hi - 1];
      a[i5] = e5;

      var less = lo + 1,   // First element in the middle partition.
          great = hi - 2;  // Last element in the middle partition.

      // Note that for value comparison, <, <=, >= and > coerce to a primitive via
      // Object.prototype.valueOf; == and === do not, so in order to be consistent
      // with natural order (such as for Date objects), we must do two compares.
      var pivotsEqual = pivotValue1 <= pivotValue2 && pivotValue1 >= pivotValue2;
      if (pivotsEqual) {

        // Degenerated case where the partitioning becomes a dutch national flag
        // problem.
        //
        // [ |  < pivot  | == pivot | unpartitioned | > pivot  | ]
        //  ^             ^          ^             ^            ^
        // left         less         k           great         right
        //
        // a[left] and a[right] are undefined and are filled after the
        // partitioning.
        //
        // Invariants:
        //   1) for x in ]left, less[ : x < pivot.
        //   2) for x in [less, k[ : x == pivot.
        //   3) for x in ]great, right[ : x > pivot.
        for (var k = less; k <= great; ++k) {
          var ek = a[k], xk = f(ek);
          if (xk < pivotValue1) {
            if (k !== less) {
              a[k] = a[less];
              a[less] = ek;
            }
            ++less;
          } else if (xk > pivotValue1) {

            // Find the first element <= pivot in the range [k - 1, great] and
            // put [:ek:] there. We know that such an element must exist:
            // When k == less, then el3 (which is equal to pivot) lies in the
            // interval. Otherwise a[k - 1] == pivot and the search stops at k-1.
            // Note that in the latter case invariant 2 will be violated for a
            // short amount of time. The invariant will be restored when the
            // pivots are put into their final positions.
            /* eslint no-constant-condition: 0 */
            while (true) {
              var greatValue = f(a[great]);
              if (greatValue > pivotValue1) {
                great--;
                // This is the only location in the while-loop where a new
                // iteration is started.
                continue;
              } else if (greatValue < pivotValue1) {
                // Triple exchange.
                a[k] = a[less];
                a[less++] = a[great];
                a[great--] = ek;
                break;
              } else {
                a[k] = a[great];
                a[great--] = ek;
                // Note: if great < k then we will exit the outer loop and fix
                // invariant 2 (which we just violated).
                break;
              }
            }
          }
        }
      } else {

        // We partition the list into three parts:
        //  1. < pivot1
        //  2. >= pivot1 && <= pivot2
        //  3. > pivot2
        //
        // During the loop we have:
        // [ | < pivot1 | >= pivot1 && <= pivot2 | unpartitioned  | > pivot2  | ]
        //  ^            ^                        ^              ^             ^
        // left         less                     k              great        right
        //
        // a[left] and a[right] are undefined and are filled after the
        // partitioning.
        //
        // Invariants:
        //   1. for x in ]left, less[ : x < pivot1
        //   2. for x in [less, k[ : pivot1 <= x && x <= pivot2
        //   3. for x in ]great, right[ : x > pivot2
        (function () { // isolate scope
        for (var k = less; k <= great; k++) {
          var ek = a[k], xk = f(ek);
          if (xk < pivotValue1) {
            if (k !== less) {
              a[k] = a[less];
              a[less] = ek;
            }
            ++less;
          } else {
            if (xk > pivotValue2) {
              while (true) {
                var greatValue = f(a[great]);
                if (greatValue > pivotValue2) {
                  great--;
                  if (great < k) break;
                  // This is the only location inside the loop where a new
                  // iteration is started.
                  continue;
                } else {
                  // a[great] <= pivot2.
                  if (greatValue < pivotValue1) {
                    // Triple exchange.
                    a[k] = a[less];
                    a[less++] = a[great];
                    a[great--] = ek;
                  } else {
                    // a[great] >= pivot1.
                    a[k] = a[great];
                    a[great--] = ek;
                  }
                  break;
                }
              }
            }
          }
        }
        })(); // isolate scope
      }

      // Move pivots into their final positions.
      // We shrunk the list from both sides (a[left] and a[right] have
      // meaningless values in them) and now we move elements from the first
      // and third partition into these locations so that we can store the
      // pivots.
      a[lo] = a[less - 1];
      a[less - 1] = pivot1;
      a[hi - 1] = a[great + 1];
      a[great + 1] = pivot2;

      // The list is now partitioned into three partitions:
      // [ < pivot1   | >= pivot1 && <= pivot2   |  > pivot2   ]
      //  ^            ^                        ^             ^
      // left         less                     great        right

      // Recursive descent. (Don't include the pivot values.)
      sort(a, lo, less - 1);
      sort(a, great + 2, hi);

      if (pivotsEqual) {
        // All elements in the second partition are equal to the pivot. No
        // need to sort them.
        return a;
      }

      // In theory it should be enough to call _doSort recursively on the second
      // partition.
      // The Android source however removes the pivot elements from the recursive
      // call if the second partition is too large (more than 2/3 of the list).
      if (less < i1 && great > i5) {

        (function () { // isolate scope
        var lessValue, greatValue;
        while ((lessValue = f(a[less])) <= pivotValue1 && lessValue >= pivotValue1) ++less;
        while ((greatValue = f(a[great])) <= pivotValue2 && greatValue >= pivotValue2) --great;

        // Copy paste of the previous 3-way partitioning with adaptions.
        //
        // We partition the list into three parts:
        //  1. == pivot1
        //  2. > pivot1 && < pivot2
        //  3. == pivot2
        //
        // During the loop we have:
        // [ == pivot1 | > pivot1 && < pivot2 | unpartitioned  | == pivot2 ]
        //              ^                      ^              ^
        //            less                     k              great
        //
        // Invariants:
        //   1. for x in [ *, less[ : x == pivot1
        //   2. for x in [less, k[ : pivot1 < x && x < pivot2
        //   3. for x in ]great, * ] : x == pivot2
        for (var k = less; k <= great; k++) {
          var ek = a[k], xk = f(ek);
          if (xk <= pivotValue1 && xk >= pivotValue1) {
            if (k !== less) {
              a[k] = a[less];
              a[less] = ek;
            }
            less++;
          } else {
            if (xk <= pivotValue2 && xk >= pivotValue2) {
              /* eslint no-constant-condition: 0 */
              while (true) {
                greatValue = f(a[great]);
                if (greatValue <= pivotValue2 && greatValue >= pivotValue2) {
                  great--;
                  if (great < k) break;
                  // This is the only location inside the loop where a new
                  // iteration is started.
                  continue;
                } else {
                  // a[great] < pivot2.
                  if (greatValue < pivotValue1) {
                    // Triple exchange.
                    a[k] = a[less];
                    a[less++] = a[great];
                    a[great--] = ek;
                  } else {
                    // a[great] == pivot1.
                    a[k] = a[great];
                    a[great--] = ek;
                  }
                  break;
                }
              }
            }
          }
        }
        })(); // isolate scope

      }

      // The second partition has now been cleared of pivot elements and looks
      // as follows:
      // [  *  |  > pivot1 && < pivot2  | * ]
      //        ^                      ^
      //       less                  great
      // Sort the second partition using recursive descent.

      // The second partition looks as follows:
      // [  *  |  >= pivot1 && <= pivot2  | * ]
      //        ^                        ^
      //       less                    great
      // Simply sort it by recursive descent.

      return sort(a, less, great + 1);
    }

    return sort;
  }

  var quicksort_sizeThreshold = 32;

  var quicksort = quicksort_by(identity);
  var by$4 = quicksort_by;
  quicksort.by = by$4;

  function crossfilter_reduceIncrement(p) {
    return p + 1;
  }

  function crossfilter_reduceDecrement(p) {
    return p - 1;
  }

  function crossfilter_reduceAdd(f) {
    return function(p, v) {
      return p + +f(v);
    };
  }

  function crossfilter_reduceSubtract(f) {
    return function(p, v) {
      return p - f(v);
    };
  }

  var reduce = {
    reduceIncrement: crossfilter_reduceIncrement,
    reduceDecrement: crossfilter_reduceDecrement,
    reduceAdd: crossfilter_reduceAdd,
    reduceSubtract: crossfilter_reduceSubtract
  };

  var _from = "git://github.com/PolymerEl/crossfilter.git";
  var _id = "crossfilter2@1.4.6";
  var _inBundle = false;
  var _integrity = "";
  var _location = "/crossfilter2";
  var _phantomChildren = {
  };
  var _requested = {
  	type: "git",
  	raw: "crossfilter2@git://github.com/PolymerEl/crossfilter.git",
  	name: "crossfilter2",
  	escapedName: "crossfilter2",
  	rawSpec: "git://github.com/PolymerEl/crossfilter.git",
  	saveSpec: "git://github.com/PolymerEl/crossfilter.git",
  	fetchSpec: "git://github.com/PolymerEl/crossfilter.git",
  	gitCommittish: null
  };
  var _requiredBy = [
  	"/",
  	"/reductio",
  	"/universe"
  ];
  var _resolved = "git://github.com/PolymerEl/crossfilter.git#dbf40b6635960a94437cf3ec5aec7838a1d7ce57";
  var _spec = "crossfilter2@git://github.com/PolymerEl/crossfilter.git";
  var _where = "/home/christophe/Programming/Polymer/2.0-wip/bower_components/multi-verse";
  var author = {
  	name: "Mike Bostock",
  	url: "http://bost.ocks.org/mike"
  };
  var bugs = {
  	url: "https://github.com/crossfilter/crossfilter/issues"
  };
  var bundleDependencies = false;
  var contributors = [
  	{
  		name: "Jason Davies",
  		url: "http://www.jasondavies.com/"
  	}
  ];
  var dependencies = {
  	"lodash.result": "^4.4.0"
  };
  var deprecated = false;
  var description = "Fast multidimensional filtering for coordinated views.";
  var devDependencies = {
  	browserify: "^13.0.0",
  	d3: "3.5",
  	eslint: "2.10.2",
  	"package-json-versionify": "1.0.2",
  	semver: "^5.3.0",
  	sinon: "^4.0.2",
  	"uglify-js": "2.4.0",
  	vows: "0.7.0"
  };
  var eslintConfig = {
  	env: {
  		browser: true,
  		node: true
  	},
  	globals: {
  		"Uint8Array": true,
  		"Uint16Array": true,
  		"Uint32Array": true
  	},
  	"extends": "eslint:recommended"
  };
  var files = [
  	"src",
  	"index.js",
  	"index.d.ts",
  	"crossfilter.js",
  	"crossfilter.min.js"
  ];
  var homepage = "https://crossfilter.github.io/crossfilter/";
  var keywords = [
  	"analytics",
  	"visualization",
  	"crossfilter"
  ];
  var license = "Apache-2.0";
  var main = "./index.js";
  var maintainers = [
  	{
  		name: "Gordon Woodhull",
  		url: "https://github.com/gordonwoodhull"
  	},
  	{
  		name: "Tanner Linsley",
  		url: "https://github.com/tannerlinsley"
  	},
  	{
  		name: "Ethan Jewett",
  		url: "https://github.com/esjewett"
  	}
  ];
  var name = "crossfilter2";
  var repository = {
  	type: "git",
  	url: "git+ssh://git@github.com/crossfilter/crossfilter.git"
  };
  var scripts = {
  	benchmark: "node test/benchmark.js",
  	build: "browserify index.js -t package-json-versionify --standalone crossfilter -o crossfilter.js && uglifyjs --compress --mangle --screw-ie8 crossfilter.js -o crossfilter.min.js",
  	clean: "rm -f crossfilter.js crossfilter.min.js",
  	test: "vows --verbose && eslint src/"
  };
  var types = "./index.d.ts";
  var unpkg = "./crossfilter.min.js";
  var version = "1.4.6";
  var _package = {
  	_from: _from,
  	_id: _id,
  	_inBundle: _inBundle,
  	_integrity: _integrity,
  	_location: _location,
  	_phantomChildren: _phantomChildren,
  	_requested: _requested,
  	_requiredBy: _requiredBy,
  	_resolved: _resolved,
  	_spec: _spec,
  	_where: _where,
  	author: author,
  	bugs: bugs,
  	bundleDependencies: bundleDependencies,
  	contributors: contributors,
  	dependencies: dependencies,
  	deprecated: deprecated,
  	description: description,
  	devDependencies: devDependencies,
  	eslintConfig: eslintConfig,
  	files: files,
  	homepage: homepage,
  	keywords: keywords,
  	license: license,
  	main: main,
  	maintainers: maintainers,
  	name: name,
  	repository: repository,
  	scripts: scripts,
  	types: types,
  	unpkg: unpkg,
  	version: version
  };

  var _package$1 = /*#__PURE__*/Object.freeze({
    _from: _from,
    _id: _id,
    _inBundle: _inBundle,
    _integrity: _integrity,
    _location: _location,
    _phantomChildren: _phantomChildren,
    _requested: _requested,
    _requiredBy: _requiredBy,
    _resolved: _resolved,
    _spec: _spec,
    _where: _where,
    author: author,
    bugs: bugs,
    bundleDependencies: bundleDependencies,
    contributors: contributors,
    dependencies: dependencies,
    deprecated: deprecated,
    description: description,
    devDependencies: devDependencies,
    eslintConfig: eslintConfig,
    files: files,
    homepage: homepage,
    keywords: keywords,
    license: license,
    main: main,
    maintainers: maintainers,
    name: name,
    repository: repository,
    scripts: scripts,
    types: types,
    unpkg: unpkg,
    version: version,
    default: _package
  });

  /**
   * lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="npm" -o ./`
   * Copyright jQuery Foundation and other contributors <https://jquery.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */

  /** Used as the `TypeError` message for "Functions" methods. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0;

  /** `Object#toString` result references. */
  var funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      symbolTag = '[object Symbol]';

  /** Used to match property names within property paths. */
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
      reIsPlainProp = /^\w*$/,
      reLeadingDot = /^\./,
      rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to match backslashes in property paths. */
  var reEscapeChar = /\\(\\)?/g;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  /**
   * Checks if `value` is a host object in IE < 9.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
   */
  function isHostObject(value) {
    // Many host objects are `Object` objects that can coerce to strings
    // despite having improperly defined `toString` methods.
    var result = false;
    if (value != null && typeof value.toString != 'function') {
      try {
        result = !!(value + '');
      } catch (e) {}
    }
    return result;
  }

  /** Used for built-in method references. */
  var arrayProto = Array.prototype,
      funcProto = Function.prototype,
      objectProto = Object.prototype;

  /** Used to detect overreaching core-js shims. */
  var coreJsData = root['__core-js_shared__'];

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString = objectProto.toString;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /** Built-in value references. */
  var Symbol = root.Symbol,
      splice = arrayProto.splice;

  /* Built-in method references that are verified to be native. */
  var Map = getNative(root, 'Map'),
      nativeCreate = getNative(Object, 'create');

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = Symbol ? Symbol.prototype : undefined,
      symbolToString = symbolProto ? symbolProto.toString : undefined;

  /**
   * Creates a hash object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Hash(entries) {
    var index = -1,
        length = entries ? entries.length : 0;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  /**
   * Removes all key-value entries from the hash.
   *
   * @private
   * @name clear
   * @memberOf Hash
   */
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
  }

  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @name delete
   * @memberOf Hash
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function hashDelete(key) {
    return this.has(key) && delete this.__data__[key];
  }

  /**
   * Gets the hash value for `key`.
   *
   * @private
   * @name get
   * @memberOf Hash
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : undefined;
  }

  /**
   * Checks if a hash value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Hash
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
  }

  /**
   * Sets the hash `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Hash
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the hash instance.
   */
  function hashSet(key, value) {
    var data = this.__data__;
    data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
    return this;
  }

  // Add methods to `Hash`.
  Hash.prototype.clear = hashClear;
  Hash.prototype['delete'] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;

  /**
   * Creates an list cache object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function ListCache(entries) {
    var index = -1,
        length = entries ? entries.length : 0;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  /**
   * Removes all key-value entries from the list cache.
   *
   * @private
   * @name clear
   * @memberOf ListCache
   */
  function listCacheClear() {
    this.__data__ = [];
  }

  /**
   * Removes `key` and its value from the list cache.
   *
   * @private
   * @name delete
   * @memberOf ListCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function listCacheDelete(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    return true;
  }

  /**
   * Gets the list cache value for `key`.
   *
   * @private
   * @name get
   * @memberOf ListCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function listCacheGet(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    return index < 0 ? undefined : data[index][1];
  }

  /**
   * Checks if a list cache value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf ListCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }

  /**
   * Sets the list cache `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf ListCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the list cache instance.
   */
  function listCacheSet(key, value) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }

  // Add methods to `ListCache`.
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype['delete'] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function MapCache(entries) {
    var index = -1,
        length = entries ? entries.length : 0;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */
  function mapCacheClear() {
    this.__data__ = {
      'hash': new Hash,
      'map': new (Map || ListCache),
      'string': new Hash
    };
  }

  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function mapCacheDelete(key) {
    return getMapData(this, key)['delete'](key);
  }

  /**
   * Gets the map value for `key`.
   *
   * @private
   * @name get
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }

  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }

  /**
   * Sets the map `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache instance.
   */
  function mapCacheSet(key, value) {
    getMapData(this, key).set(key, value);
    return this;
  }

  // Add methods to `MapCache`.
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype['delete'] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;

  /**
   * Gets the index at which the `key` is found in `array` of key-value pairs.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} key The key to search for.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative(value) {
    if (!isObject$1(value) || isMasked(value)) {
      return false;
    }
    var pattern = (isFunction$1(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }

  /**
   * The base implementation of `_.toString` which doesn't convert nullish
   * values to empty strings.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */
  function baseToString(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == 'string') {
      return value;
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }

  /**
   * Casts `value` to a path array if it's not one.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {Array} Returns the cast property path array.
   */
  function castPath(value) {
    return isArray$1(value) ? value : stringToPath(value);
  }

  /**
   * Gets the data for `map`.
   *
   * @private
   * @param {Object} map The map to query.
   * @param {string} key The reference key.
   * @returns {*} Returns the map data.
   */
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key)
      ? data[typeof key == 'string' ? 'string' : 'hash']
      : data.map;
  }

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  /**
   * Checks if `value` is a property name and not a property path.
   *
   * @private
   * @param {*} value The value to check.
   * @param {Object} [object] The object to query keys on.
   * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
   */
  function isKey(value, object) {
    if (isArray$1(value)) {
      return false;
    }
    var type = typeof value;
    if (type == 'number' || type == 'symbol' || type == 'boolean' ||
        value == null || isSymbol(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
      (object != null && value in Object(object));
  }

  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */
  function isKeyable(value) {
    var type = typeof value;
    return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
      ? (value !== '__proto__')
      : (value === null);
  }

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  /**
   * Converts `string` to a property path array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the property path array.
   */
  var stringToPath = memoize(function(string) {
    string = toString(string);

    var result = [];
    if (reLeadingDot.test(string)) {
      result.push('');
    }
    string.replace(rePropName, function(match, number, quote, string) {
      result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
    });
    return result;
  });

  /**
   * Converts `value` to a string key if it's not a string or symbol.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {string|symbol} Returns the key.
   */
  function toKey(value) {
    if (typeof value == 'string' || isSymbol(value)) {
      return value;
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to process.
   * @returns {string} Returns the source code.
   */
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  /**
   * Creates a function that memoizes the result of `func`. If `resolver` is
   * provided, it determines the cache key for storing the result based on the
   * arguments provided to the memoized function. By default, the first argument
   * provided to the memoized function is used as the map cache key. The `func`
   * is invoked with the `this` binding of the memoized function.
   *
   * **Note:** The cache is exposed as the `cache` property on the memoized
   * function. Its creation may be customized by replacing the `_.memoize.Cache`
   * constructor with one whose instances implement the
   * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
   * method interface of `delete`, `get`, `has`, and `set`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to have its output memoized.
   * @param {Function} [resolver] The function to resolve the cache key.
   * @returns {Function} Returns the new memoized function.
   * @example
   *
   * var object = { 'a': 1, 'b': 2 };
   * var other = { 'c': 3, 'd': 4 };
   *
   * var values = _.memoize(_.values);
   * values(object);
   * // => [1, 2]
   *
   * values(other);
   * // => [3, 4]
   *
   * object.a = 2;
   * values(object);
   * // => [1, 2]
   *
   * // Modify the result cache.
   * values.cache.set(object, ['a', 'b']);
   * values(object);
   * // => ['a', 'b']
   *
   * // Replace `_.memoize.Cache`.
   * _.memoize.Cache = WeakMap;
   */
  function memoize(func, resolver) {
    if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments,
          key = resolver ? resolver.apply(this, args) : args[0],
          cache = memoized.cache;

      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result);
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache);
    return memoized;
  }

  // Assign cache to `_.memoize`.
  memoize.Cache = MapCache;

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray$1 = Array.isArray;

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction$1(value) {
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 8-9 which returns 'object' for typed array and other constructors.
    var tag = isObject$1(value) ? objectToString.call(value) : '';
    return tag == funcTag || tag == genTag;
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject$1(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike(value) && objectToString.call(value) == symbolTag);
  }

  /**
   * Converts `value` to a string. An empty string is returned for `null`
   * and `undefined` values. The sign of `-0` is preserved.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */
  function toString(value) {
    return value == null ? '' : baseToString(value);
  }

  /**
   * This method is like `_.get` except that if the resolved value is a
   * function it's invoked with the `this` binding of its parent object and
   * its result is returned.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @param {Array|string} path The path of the property to resolve.
   * @param {*} [defaultValue] The value returned for `undefined` resolved values.
   * @returns {*} Returns the resolved value.
   * @example
   *
   * var object = { 'a': [{ 'b': { 'c1': 3, 'c2': _.constant(4) } }] };
   *
   * _.result(object, 'a[0].b.c1');
   * // => 3
   *
   * _.result(object, 'a[0].b.c2');
   * // => 4
   *
   * _.result(object, 'a[0].b.c3', 'default');
   * // => 'default'
   *
   * _.result(object, 'a[0].b.c3', _.constant('default'));
   * // => 'default'
   */
  function result(object, path, defaultValue) {
    path = isKey(path, object) ? [path] : castPath(path);

    var index = -1,
        length = path.length;

    // Ensure the loop is entered when path is empty.
    if (!length) {
      object = undefined;
      length = 1;
    }
    while (++index < length) {
      var value = object == null ? undefined : object[toKey(path[index])];
      if (value === undefined) {
        index = length;
        value = defaultValue;
      }
      object = isFunction$1(value) ? value.call(object) : value;
    }
    return object;
  }

  var lodash_result = result;

  var packageJson = getCjsExportFromNamespace(_package$1);

  var crossfilter_1 = createCommonjsModule(function (module, exports) {













   // require own package.json for the version field


  // constants
  var REMOVED_INDEX = -1;

  // expose API exports
  exports.crossfilter = crossfilter;
  exports.crossfilter.heap = heap;
  exports.crossfilter.heapselect = heapselect;
  exports.crossfilter.bisect = bisect;
  exports.crossfilter.insertionsort = insertionsort;
  exports.crossfilter.permute = permute_1;
  exports.crossfilter.quicksort = quicksort;
  exports.crossfilter.version = packageJson.version; // please note use of "package-json-versionify" transform

  function crossfilter() {
    var crossfilter = {
      add: add,
      remove: removeData,
      dimension: dimension,
      groupAll: groupAll,
      size: size,
      all: all,
      allFiltered: allFiltered,
      onChange: onChange,
      isElementFiltered: isElementFiltered
    };

    var data = [], // the records
        n = 0, // the number of records; data.length
        filters, // 1 is filtered out
        filterListeners = [], // when the filters change
        dataListeners = [], // when data is added
        removeDataListeners = [], // when data is removed
        callbacks = [];

    filters = new array.bitarray(0);

    // Adds the specified new records to this crossfilter.
    function add(newData) {
      var n0 = n,
          n1 = newData.length;

      // If there's actually new data to add…
      // Merge the new data into the existing data.
      // Lengthen the filter bitset to handle the new records.
      // Notify listeners (dimensions and groups) that new data is available.
      if (n1) {
        data = data.concat(newData);
        filters.lengthen(n += n1);
        dataListeners.forEach(function(l) { l(newData, n0, n1); });
        triggerOnChange('dataAdded');
      }

      return crossfilter;
    }

    // Removes all records that match the current filters, or if a predicate function is passed,
    // removes all records matching the predicate (ignoring filters).
    function removeData(predicate) {
      var // Mapping from old record indexes to new indexes (after records removed)
          newIndex = crossfilter_index(n, n),
          removed = [],
          usePred = typeof predicate === 'function',
          shouldRemove = function (i) {
            return usePred ? predicate(data[i], i) : filters.zero(i)
          };

      for (var index1 = 0, index2 = 0; index1 < n; ++index1) {
        if ( shouldRemove(index1) ) {
          removed.push(index1);
          newIndex[index1] = REMOVED_INDEX;
        } else {
          newIndex[index1] = index2++;
        }
      }

      // Remove all matching records from groups.
      filterListeners.forEach(function(l) { l(-1, -1, [], removed, true); });

      // Update indexes.
      removeDataListeners.forEach(function(l) { l(newIndex); });

      // Remove old filters and data by overwriting.
      for (var index3 = 0, index4 = 0; index3 < n; ++index3) {
        if ( newIndex[index3] !== REMOVED_INDEX ) {
          if (index3 !== index4) filters.copy(index4, index3), data[index4] = data[index3];
          ++index4;
        }
      }

      data.length = n = index4;
      filters.truncate(index4);
      triggerOnChange('dataRemoved');
    }

    function maskForDimensions(dimensions) {
      var n,
          d,
          len,
          id,
          mask = Array(filters.subarrays);
      for (n = 0; n < filters.subarrays; n++) { mask[n] = ~0; }
      for (d = 0, len = dimensions.length; d < len; d++) {
        // The top bits of the ID are the subarray offset and the lower bits are the bit
        // offset of the "one" mask.
        id = dimensions[d].id();
        mask[id >> 7] &= ~(0x1 << (id & 0x3f));
      }
      return mask;
    }

    // Return true if the data element at index i is filtered IN.
    // Optionally, ignore the filters of any dimensions in the ignore_dimensions list.
    function isElementFiltered(i, ignore_dimensions) {
      var mask = maskForDimensions(ignore_dimensions || []);
      return filters.zeroExceptMask(i,mask);
    }

    // Adds a new dimension with the specified value accessor function.
    function dimension(value, iterable) {

      if (typeof value === 'string') {
        var accessorPath = value;
        value = function(d) { return lodash_result(d, accessorPath); };
      }

      var dimension = {
        filter: filter$$1,
        filterExact: filterExact,
        filterRange: filterRange,
        filterFunction: filterFunction,
        filterAll: filterAll,
        currentFilter: currentFilter,
        hasCurrentFilter: hasCurrentFilter,
        top: top,
        bottom: bottom,
        group: group,
        groupAll: groupAll,
        dispose: dispose,
        remove: dispose, // for backwards-compatibility
        accessor: value,
        id: function() { return id; }
      };

      var one, // lowest unset bit as mask, e.g., 00001000
          zero$$1, // inverted one, e.g., 11110111
          offset, // offset into the filters arrays
          id, // unique ID for this dimension (reused when dimensions are disposed)
          values, // sorted, cached array
          index, // maps sorted value index -> record index (in data)
          newValues, // temporary array storing newly-added values
          newIndex, // temporary array storing newly-added index
          iterablesIndexCount,
          newIterablesIndexCount,
          iterablesIndexFilterStatus,
          newIterablesIndexFilterStatus,
          iterablesEmptyRows = [],
          sort = quicksort.by(function(i) { return newValues[i]; }),
          refilter = filter.filterAll, // for recomputing filter
          refilterFunction, // the custom filter function in use
          filterValue, // the value used for filtering (value, array, function or undefined)
          filterValuePresent, // true if filterValue contains something
          indexListeners = [], // when data is added
          dimensionGroups = [],
          lo0 = 0,
          hi0 = 0,
          t = 0,
          k;

      // Updating a dimension is a two-stage process. First, we must update the
      // associated filters for the newly-added records. Once all dimensions have
      // updated their filters, the groups are notified to update.
      dataListeners.unshift(preAdd);
      dataListeners.push(postAdd);

      removeDataListeners.push(removeData);

      // Add a new dimension in the filter bitmap and store the offset and bitmask.
      var tmp = filters.add();
      offset = tmp.offset;
      one = tmp.one;
      zero$$1 = ~one;

      // Create a unique ID for the dimension
      // IDs will be re-used if dimensions are disposed.
      // For internal use the ID is the subarray offset shifted left 7 bits or'd with the
      // bit offset of the set bit in the dimension's "one" mask.
      id = (offset << 7) | (Math.log(one) / Math.log(2));

      preAdd(data, 0, n);
      postAdd(data, 0, n);

      // Incorporates the specified new records into this dimension.
      // This function is responsible for updating filters, values, and index.
      function preAdd(newData, n0, n1) {

        if (iterable){
          // Count all the values
          t = 0;
          j = 0;
          k = [];

          for (var i0 = 0; i0 < newData.length; i0++) {
            for(j = 0, k = value(newData[i0]); j < k.length; j++) {
              t++;
            }
          }

          newValues = [];
          newIterablesIndexCount = crossfilter_range(newData.length);
          newIterablesIndexFilterStatus = crossfilter_index(t,1);
          var unsortedIndex = crossfilter_range(t);

          for (var l = 0, index1 = 0; index1 < newData.length; index1++) {
            k = value(newData[index1]);
            //
            if(!k.length){
              newIterablesIndexCount[index1] = 0;
              iterablesEmptyRows.push(index1 + n0);
              continue;
            }
            newIterablesIndexCount[index1] = k.length;
            for (j = 0; j < k.length; j++) {
              newValues.push(k[j]);
              unsortedIndex[l] = index1;
              l++;
            }
          }

          // Create the Sort map used to sort both the values and the valueToData indices
          var sortMap = sort(crossfilter_range(t), 0, t);

          // Use the sortMap to sort the newValues
          newValues = permute_1(newValues, sortMap);


          // Use the sortMap to sort the unsortedIndex map
          // newIndex should be a map of sortedValue -> crossfilterData
          newIndex = permute_1(unsortedIndex, sortMap);

        } else{
          // Permute new values into natural order using a standard sorted index.
          newValues = newData.map(value);
          newIndex = sort(crossfilter_range(n1), 0, n1);
          newValues = permute_1(newValues, newIndex);
        }

        if(iterable) {
          n1 = t;
        }

        // Bisect newValues to determine which new records are selected.
        var bounds = refilter(newValues), lo1 = bounds[0], hi1 = bounds[1];
        if (refilterFunction) {
          for (var index2 = 0; index2 < n1; ++index2) {
            if (!refilterFunction(newValues[index2], index2)) {
              filters[offset][newIndex[index2] + n0] |= one;
              if(iterable) newIterablesIndexFilterStatus[index2] = 1;
            }
          }
        } else {
          for (var index3 = 0; index3 < lo1; ++index3) {
            filters[offset][newIndex[index3] + n0] |= one;
            if(iterable) newIterablesIndexFilterStatus[index3] = 1;
          }
          for (var index4 = hi1; index4 < n1; ++index4) {
            filters[offset][newIndex[index4] + n0] |= one;
            if(iterable) newIterablesIndexFilterStatus[index4] = 1;
          }
        }

        // If this dimension previously had no data, then we don't need to do the
        // more expensive merge operation; use the new values and index as-is.
        if (!n0) {
          values = newValues;
          index = newIndex;
          iterablesIndexCount = newIterablesIndexCount;
          iterablesIndexFilterStatus = newIterablesIndexFilterStatus;
          lo0 = lo1;
          hi0 = hi1;
          return;
        }



        var oldValues = values,
          oldIndex = index,
          oldIterablesIndexFilterStatus = iterablesIndexFilterStatus,
          old_n0,
          i1 = 0;

        i0 = 0;

        if(iterable){
          old_n0 = n0;
          n0 = oldValues.length;
          n1 = t;
        }

        // Otherwise, create new arrays into which to merge new and old.
        values = iterable ? new Array(n0 + n1) : new Array(n);
        index = iterable ? new Array(n0 + n1) : crossfilter_index(n, n);
        if(iterable) iterablesIndexFilterStatus = crossfilter_index(n0 + n1, 1);

        // Concatenate the newIterablesIndexCount onto the old one.
        if(iterable) {
          var oldiiclength = iterablesIndexCount.length;
          iterablesIndexCount = array.arrayLengthen(iterablesIndexCount, n);
          for(var j=0; j+oldiiclength < n; j++) {
            iterablesIndexCount[j+oldiiclength] = newIterablesIndexCount[j];
          }
        }

        // Merge the old and new sorted values, and old and new index.
        var index5 = 0;
        for (; i0 < n0 && i1 < n1; ++index5) {
          if (oldValues[i0] < newValues[i1]) {
            values[index5] = oldValues[i0];
            if(iterable) iterablesIndexFilterStatus[index5] = oldIterablesIndexFilterStatus[i0];
            index[index5] = oldIndex[i0++];
          } else {
            values[index5] = newValues[i1];
            if(iterable) iterablesIndexFilterStatus[index5] = newIterablesIndexFilterStatus[i1];
            index[index5] = newIndex[i1++] + (iterable ? old_n0 : n0);
          }
        }

        // Add any remaining old values.
        for (; i0 < n0; ++i0, ++index5) {
          values[index5] = oldValues[i0];
          if(iterable) iterablesIndexFilterStatus[index5] = oldIterablesIndexFilterStatus[i0];
          index[index5] = oldIndex[i0];
        }

        // Add any remaining new values.
        for (; i1 < n1; ++i1, ++index5) {
          values[index5] = newValues[i1];
          if(iterable) iterablesIndexFilterStatus[index5] = newIterablesIndexFilterStatus[i1];
          index[index5] = newIndex[i1] + (iterable ? old_n0 : n0);
        }

        // Bisect again to recompute lo0 and hi0.
        bounds = refilter(values), lo0 = bounds[0], hi0 = bounds[1];
      }

      // When all filters have updated, notify index listeners of the new values.
      function postAdd(newData, n0, n1) {
        indexListeners.forEach(function(l) { l(newValues, newIndex, n0, n1); });
        newValues = newIndex = null;
      }

      function removeData(reIndex) {
        if (iterable) {
          for (var i0 = 0, i1 = 0; i0 < iterablesEmptyRows.length; i0++) {
            if (reIndex[iterablesEmptyRows[i0]] !== REMOVED_INDEX) {
              iterablesEmptyRows[i1] = reIndex[iterablesEmptyRows[i0]];
              i1++;
            }
          }
          iterablesEmptyRows.length = i1;
          for (i0 = 0, i1 = 0; i0 < n; i0++) {
            if (reIndex[i0] !== REMOVED_INDEX) {
              if (i1 !== i0) iterablesIndexCount[i1] = iterablesIndexCount[i0];
              i1++;
            }
          }
          iterablesIndexCount.length = i1;
        }
        // Rewrite our index, overwriting removed values
        var n0 = values.length;
        for (var i = 0, j = 0, oldDataIndex; i < n0; ++i) {
          oldDataIndex = index[i];
          if (reIndex[oldDataIndex] !== REMOVED_INDEX) {
            if (i !== j) values[j] = values[i];
            index[j] = reIndex[oldDataIndex];
            if (iterable) {
              iterablesIndexFilterStatus[j] = iterablesIndexFilterStatus[i];
            }
            ++j;
          }
        }
        values.length = j;
        if (iterable) iterablesIndexFilterStatus.length = j;
        while (j < n0) index[j++] = 0;

        // Bisect again to recompute lo0 and hi0.
        var bounds = refilter(values);
        lo0 = bounds[0], hi0 = bounds[1];
      }

      // Updates the selected values based on the specified bounds [lo, hi].
      // This implementation is used by all the public filter methods.
      function filterIndexBounds(bounds) {

        var lo1 = bounds[0],
            hi1 = bounds[1];

        if (refilterFunction) {
          refilterFunction = null;
          filterIndexFunction(function(d, i) { return lo1 <= i && i < hi1; }, bounds[0] === 0 && bounds[1] === values.length);
          lo0 = lo1;
          hi0 = hi1;
          return dimension;
        }

        var i,
            j,
            k,
            added = [],
            removed = [],
            valueIndexAdded = [],
            valueIndexRemoved = [];


        // Fast incremental update based on previous lo index.
        if (lo1 < lo0) {
          for (i = lo1, j = Math.min(lo0, hi1); i < j; ++i) {
            added.push(index[i]);
            valueIndexAdded.push(i);
          }
        } else if (lo1 > lo0) {
          for (i = lo0, j = Math.min(lo1, hi0); i < j; ++i) {
            removed.push(index[i]);
            valueIndexRemoved.push(i);
          }
        }

        // Fast incremental update based on previous hi index.
        if (hi1 > hi0) {
          for (i = Math.max(lo1, hi0), j = hi1; i < j; ++i) {
            added.push(index[i]);
            valueIndexAdded.push(i);
          }
        } else if (hi1 < hi0) {
          for (i = Math.max(lo0, hi1), j = hi0; i < j; ++i) {
            removed.push(index[i]);
            valueIndexRemoved.push(i);
          }
        }

        if(!iterable) {
          // Flip filters normally.

          for(i=0; i<added.length; i++) {
            filters[offset][added[i]] ^= one;
          }

          for(i=0; i<removed.length; i++) {
            filters[offset][removed[i]] ^= one;
          }

        } else {
          // For iterables, we need to figure out if the row has been completely removed vs partially included
          // Only count a row as added if it is not already being aggregated. Only count a row
          // as removed if the last element being aggregated is removed.

          var newAdded = [];
          var newRemoved = [];
          for (i = 0; i < added.length; i++) {
            iterablesIndexCount[added[i]]++;
            iterablesIndexFilterStatus[valueIndexAdded[i]] = 0;
            if(iterablesIndexCount[added[i]] === 1) {
              filters[offset][added[i]] ^= one;
              newAdded.push(added[i]);
            }
          }
          for (i = 0; i < removed.length; i++) {
            iterablesIndexCount[removed[i]]--;
            iterablesIndexFilterStatus[valueIndexRemoved[i]] = 1;
            if(iterablesIndexCount[removed[i]] === 0) {
              filters[offset][removed[i]] ^= one;
              newRemoved.push(removed[i]);
            }
          }

          added = newAdded;
          removed = newRemoved;

          // Now handle empty rows.
          if(bounds[0] === 0 && bounds[1] === values.length) {
            for(i = 0; i < iterablesEmptyRows.length; i++) {
              if((filters[offset][k = iterablesEmptyRows[i]] & one)) {
                // Was not in the filter, so set the filter and add
                filters[offset][k] ^= one;
                added.push(k);
              }
            }
          } else {
            // filter in place - remove empty rows if necessary
            for(i = 0; i < iterablesEmptyRows.length; i++) {
              if(!(filters[offset][k = iterablesEmptyRows[i]] & one)) {
                // Was in the filter, so set the filter and remove
                filters[offset][k] ^= one;
                removed.push(k);
              }
            }
          }
        }

        lo0 = lo1;
        hi0 = hi1;
        filterListeners.forEach(function(l) { l(one, offset, added, removed); });
        triggerOnChange('filtered');
        return dimension;
      }

      // Filters this dimension using the specified range, value, or null.
      // If the range is null, this is equivalent to filterAll.
      // If the range is an array, this is equivalent to filterRange.
      // Otherwise, this is equivalent to filterExact.
      function filter$$1(range) {
        return range == null
            ? filterAll() : Array.isArray(range)
            ? filterRange(range) : typeof range === "function"
            ? filterFunction(range)
            : filterExact(range);
      }

      // Filters this dimension to select the exact value.
      function filterExact(value) {
        filterValue = value;
        filterValuePresent = true;
        return filterIndexBounds((refilter = filter.filterExact(bisect, value))(values));
      }

      // Filters this dimension to select the specified range [lo, hi].
      // The lower bound is inclusive, and the upper bound is exclusive.
      function filterRange(range) {
        filterValue = range;
        filterValuePresent = true;
        return filterIndexBounds((refilter = filter.filterRange(bisect, range))(values));
      }

      // Clears any filters on this dimension.
      function filterAll() {
        filterValue = undefined;
        filterValuePresent = false;
        return filterIndexBounds((refilter = filter.filterAll)(values));
      }

      // Filters this dimension using an arbitrary function.
      function filterFunction(f) {
        filterValue = f;
        filterValuePresent = true;
        
        refilterFunction = f;
        refilter = filter.filterAll;

        filterIndexFunction(f, false);

        var bounds = refilter(values);
        lo0 = bounds[0], hi0 = bounds[1];

        return dimension;
      }

      function filterIndexFunction(f, filterAll) {
        var i,
            k,
            x,
            added = [],
            removed = [],
            valueIndexAdded = [],
            valueIndexRemoved = [],
            indexLength = values.length;

        if(!iterable) {
          for (i = 0; i < indexLength; ++i) {
            if (!(filters[offset][k = index[i]] & one) ^ !!(x = f(values[i], i))) {
              if (x) added.push(k);
              else removed.push(k);
            }
          }
        }

        if(iterable) {
          for(i=0; i < indexLength; ++i) {
            if(f(values[i], i)) {
              added.push(index[i]);
              valueIndexAdded.push(i);
            } else {
              removed.push(index[i]);
              valueIndexRemoved.push(i);
            }
          }
        }

        if(!iterable) {
          for(i=0; i<added.length; i++) {
            if(filters[offset][added[i]] & one) filters[offset][added[i]] &= zero$$1;
          }

          for(i=0; i<removed.length; i++) {
            if(!(filters[offset][removed[i]] & one)) filters[offset][removed[i]] |= one;
          }
        } else {

          var newAdded = [];
          var newRemoved = [];
          for (i = 0; i < added.length; i++) {
            // First check this particular value needs to be added
            if(iterablesIndexFilterStatus[valueIndexAdded[i]] === 1) {
              iterablesIndexCount[added[i]]++;
              iterablesIndexFilterStatus[valueIndexAdded[i]] = 0;
              if(iterablesIndexCount[added[i]] === 1) {
                filters[offset][added[i]] ^= one;
                newAdded.push(added[i]);
              }
            }
          }
          for (i = 0; i < removed.length; i++) {
            // First check this particular value needs to be removed
            if(iterablesIndexFilterStatus[valueIndexRemoved[i]] === 0) {
              iterablesIndexCount[removed[i]]--;
              iterablesIndexFilterStatus[valueIndexRemoved[i]] = 1;
              if(iterablesIndexCount[removed[i]] === 0) {
                filters[offset][removed[i]] ^= one;
                newRemoved.push(removed[i]);
              }
            }
          }

          added = newAdded;
          removed = newRemoved;

          // Now handle empty rows.
          if(filterAll) {
            for(i = 0; i < iterablesEmptyRows.length; i++) {
              if((filters[offset][k = iterablesEmptyRows[i]] & one)) {
                // Was not in the filter, so set the filter and add
                filters[offset][k] ^= one;
                added.push(k);
              }
            }
          } else {
            // filter in place - remove empty rows if necessary
            for(i = 0; i < iterablesEmptyRows.length; i++) {
              if(!(filters[offset][k = iterablesEmptyRows[i]] & one)) {
                // Was in the filter, so set the filter and remove
                filters[offset][k] ^= one;
                removed.push(k);
              }
            }
          }
        }

        filterListeners.forEach(function(l) { l(one, offset, added, removed); });
        triggerOnChange('filtered');
      }
      
      function currentFilter() {
        return filterValue;
      }
      
      function hasCurrentFilter() {
        return filterValuePresent;
      }

      // Returns the top K selected records based on this dimension's order.
      // Note: observes this dimension's filter, unlike group and groupAll.
      function top(k, top_offset) {
        var array$$1 = [],
            i = hi0,
            j,
            toSkip = 0;

        if(top_offset && top_offset > 0) toSkip = top_offset;

        while (--i >= lo0 && k > 0) {
          if (filters.zero(j = index[i])) {
            if(toSkip > 0) {
              //skip matching row
              --toSkip;
            } else {
              array$$1.push(data[j]);
              --k;
            }
          }
        }

        if(iterable){
          for(i = 0; i < iterablesEmptyRows.length && k > 0; i++) {
            // Add row with empty iterable column at the end
            if(filters.zero(j = iterablesEmptyRows[i])) {
              if(toSkip > 0) {
                //skip matching row
                --toSkip;
              } else {
                array$$1.push(data[j]);
                --k;
              }
            }
          }
        }

        return array$$1;
      }

      // Returns the bottom K selected records based on this dimension's order.
      // Note: observes this dimension's filter, unlike group and groupAll.
      function bottom(k, bottom_offset) {
        var array$$1 = [],
            i,
            j,
            toSkip = 0;

        if(bottom_offset && bottom_offset > 0) toSkip = bottom_offset;

        if(iterable) {
          // Add row with empty iterable column at the top
          for(i = 0; i < iterablesEmptyRows.length && k > 0; i++) {
            if(filters.zero(j = iterablesEmptyRows[i])) {
              if(toSkip > 0) {
                //skip matching row
                --toSkip;
              } else {
                array$$1.push(data[j]);
                --k;
              }
            }
          }
        }

        i = lo0;

        while (i < hi0 && k > 0) {
          if (filters.zero(j = index[i])) {
            if(toSkip > 0) {
              //skip matching row
              --toSkip;
            } else {
              array$$1.push(data[j]);
              --k;
            }
          }
          i++;
        }

        return array$$1;
      }

      // Adds a new group to this dimension, using the specified key function.
      function group(key) {
        var group = {
          top: top,
          all: all,
          reduce: reduce$$1,
          reduceCount: reduceCount,
          reduceSum: reduceSum,
          order: order,
          orderNatural: orderNatural,
          size: size,
          dispose: dispose,
          remove: dispose // for backwards-compatibility
        };

        // Ensure that this group will be removed when the dimension is removed.
        dimensionGroups.push(group);

        var groups, // array of {key, value}
            groupIndex, // object id ↦ group id
            groupWidth = 8,
            groupCapacity = crossfilter_capacity(groupWidth),
            k = 0, // cardinality
            select,
            heap$$1,
            reduceAdd,
            reduceRemove,
            reduceInitial,
            update = _null,
            reset = _null,
            resetNeeded = true,
            groupAll = key === _null,
            n0old;

        if (arguments.length < 1) key = identity;

        // The group listens to the crossfilter for when any dimension changes, so
        // that it can update the associated reduce values. It must also listen to
        // the parent dimension for when data is added, and compute new keys.
        filterListeners.push(update);
        indexListeners.push(add);
        removeDataListeners.push(removeData);

        // Incorporate any existing data into the grouping.
        add(values, index, 0, n);

        // Incorporates the specified new values into this group.
        // This function is responsible for updating groups and groupIndex.
        function add(newValues, newIndex, n0, n1) {

          if(iterable) {
            n0old = n0;
            n0 = values.length - newValues.length;
            n1 = newValues.length;
          }

          var oldGroups = groups,
              reIndex = iterable ? [] : crossfilter_index(k, groupCapacity),
              add = reduceAdd,
              remove = reduceRemove,
              initial = reduceInitial,
              k0 = k, // old cardinality
              i0 = 0, // index of old group
              i1 = 0, // index of new record
              j, // object id
              g0, // old group
              x0, // old key
              x1, // new key
              g, // group to add
              x; // key of group to add

          // If a reset is needed, we don't need to update the reduce values.
          if (resetNeeded) add = initial = _null;
          if (resetNeeded) remove = initial = _null;

          // Reset the new groups (k is a lower bound).
          // Also, make sure that groupIndex exists and is long enough.
          groups = new Array(k), k = 0;
          if(iterable){
            groupIndex = k0 ? groupIndex : [];
          }
          else{
            groupIndex = k0 > 1 ? array.arrayLengthen(groupIndex, n) : crossfilter_index(n, groupCapacity);
          }


          // Get the first old key (x0 of g0), if it exists.
          if (k0) x0 = (g0 = oldGroups[0]).key;

          // Find the first new key (x1), skipping NaN keys.
          while (i1 < n1 && !((x1 = key(newValues[i1])) >= x1)) ++i1;

          // While new keys remain…
          while (i1 < n1) {

            // Determine the lesser of the two current keys; new and old.
            // If there are no old keys remaining, then always add the new key.
            if (g0 && x0 <= x1) {
              g = g0, x = x0;

              // Record the new index of the old group.
              reIndex[i0] = k;

              // Retrieve the next old key.
              g0 = oldGroups[++i0];
              if (g0) x0 = g0.key;
            } else {
              g = {key: x1, value: initial()}, x = x1;
            }

            // Add the lesser group.
            groups[k] = g;

            // Add any selected records belonging to the added group, while
            // advancing the new key and populating the associated group index.

            while (x1 <= x) {
              j = newIndex[i1] + (iterable ? n0old : n0);


              if(iterable){
                if(groupIndex[j]){
                  groupIndex[j].push(k);
                }
                else{
                  groupIndex[j] = [k];
                }
              }
              else{
                groupIndex[j] = k;
              }

              // Always add new values to groups. Only remove when not in filter.
              // This gives groups full information on data life-cycle.
              g.value = add(g.value, data[j], true);
              if (!filters.zeroExcept(j, offset, zero$$1)) g.value = remove(g.value, data[j], false);
              if (++i1 >= n1) break;
              x1 = key(newValues[i1]);
            }

            groupIncrement();
          }

          // Add any remaining old groups that were greater th1an all new keys.
          // No incremental reduce is needed; these groups have no new records.
          // Also record the new index of the old group.
          while (i0 < k0) {
            groups[reIndex[i0] = k] = oldGroups[i0++];
            groupIncrement();
          }


          // Fill in gaps with empty arrays where there may have been rows with empty iterables
          if(iterable){
            for (var index1 = 0; index1 < n; index1++) {
              if(!groupIndex[index1]){
                groupIndex[index1] = [];
              }
            }
          }

          // If we added any new groups before any old groups,
          // update the group index of all the old records.
          if(k > i0){
            if(iterable){
              for (i0 = 0; i0 < n0old; ++i0) {
                for (index1 = 0; index1 < groupIndex[i0].length; index1++) {
                  groupIndex[i0][index1] = reIndex[groupIndex[i0][index1]];
                }
              }
            }
            else{
              for (i0 = 0; i0 < n0; ++i0) {
                groupIndex[i0] = reIndex[groupIndex[i0]];
              }
            }
          }

          // Modify the update and reset behavior based on the cardinality.
          // If the cardinality is less than or equal to one, then the groupIndex
          // is not needed. If the cardinality is zero, then there are no records
          // and therefore no groups to update or reset. Note that we also must
          // change the registered listener to point to the new method.
          j = filterListeners.indexOf(update);
          if (k > 1 || iterable) {
            update = updateMany;
            reset = resetMany;
          } else {
            if (!k && groupAll) {
              k = 1;
              groups = [{key: null, value: initial()}];
            }
            if (k === 1) {
              update = updateOne;
              reset = resetOne;
            } else {
              update = _null;
              reset = _null;
            }
            groupIndex = null;
          }
          filterListeners[j] = update;

          // Count the number of added groups,
          // and widen the group index as needed.
          function groupIncrement() {
            if(iterable){
              k++;
              return
            }
            if (++k === groupCapacity) {
              reIndex = array.arrayWiden(reIndex, groupWidth <<= 1);
              groupIndex = array.arrayWiden(groupIndex, groupWidth);
              groupCapacity = crossfilter_capacity(groupWidth);
            }
          }
        }

        function removeData(reIndex) {
          if (k > 1 || iterable) {
            var oldK = k,
                oldGroups = groups,
                seenGroups = crossfilter_index(oldK, oldK),
                i,
                i0,
                j;

            // Filter out non-matches by copying matching group index entries to
            // the beginning of the array.
            if (!iterable) {
              for (i = 0, j = 0; i < n; ++i) {
                if (reIndex[i] !== REMOVED_INDEX) {
                  seenGroups[groupIndex[j] = groupIndex[i]] = 1;
                  ++j;
                }
              }
            } else {
              for (i = 0, j = 0; i < n; ++i) {
                if (reIndex[i] !== REMOVED_INDEX) {
                  groupIndex[j] = groupIndex[i];
                  for (i0 = 0; i0 < groupIndex[j].length; i0++) {
                    seenGroups[groupIndex[j][i0]] = 1;
                  }
                  ++j;
                }
              }
            }

            // Reassemble groups including only those groups that were referred
            // to by matching group index entries.  Note the new group index in
            // seenGroups.
            groups = [], k = 0;
            for (i = 0; i < oldK; ++i) {
              if (seenGroups[i]) {
                seenGroups[i] = k++;
                groups.push(oldGroups[i]);
              }
            }

            if (k > 1 || iterable) {
              // Reindex the group index using seenGroups to find the new index.
              if (!iterable) {
                for (i = 0; i < j; ++i) groupIndex[i] = seenGroups[groupIndex[i]];
              } else {
                for (i = 0; i < j; ++i) {
                  for (i0 = 0; i0 < groupIndex[i].length; ++i0) {
                    groupIndex[i][i0] = seenGroups[groupIndex[i][i0]];
                  }
                }
              }
            } else {
              groupIndex = null;
            }
            filterListeners[filterListeners.indexOf(update)] = k > 1 || iterable
                ? (reset = resetMany, update = updateMany)
                : k === 1 ? (reset = resetOne, update = updateOne)
                : reset = update = _null;
          } else if (k === 1) {
            if (groupAll) return;
            for (var index3 = 0; index3 < n; ++index3) if (reIndex[index3] !== REMOVED_INDEX) return;
            groups = [], k = 0;
            filterListeners[filterListeners.indexOf(update)] =
            update = reset = _null;
          }
        }

        // Reduces the specified selected or deselected records.
        // This function is only used when the cardinality is greater than 1.
        // notFilter indicates a crossfilter.add/remove operation.
        function updateMany(filterOne, filterOffset, added, removed, notFilter) {

          if ((filterOne === one && filterOffset === offset) || resetNeeded) return;

          var i,
              j,
              k,
              n,
              g;

          if(iterable){
            // Add the added values.
            for (i = 0, n = added.length; i < n; ++i) {
              if (filters.zeroExcept(k = added[i], offset, zero$$1)) {
                for (j = 0; j < groupIndex[k].length; j++) {
                  g = groups[groupIndex[k][j]];
                  g.value = reduceAdd(g.value, data[k], false, j);
                }
              }
            }

            // Remove the removed values.
            for (i = 0, n = removed.length; i < n; ++i) {
              if (filters.onlyExcept(k = removed[i], offset, zero$$1, filterOffset, filterOne)) {
                for (j = 0; j < groupIndex[k].length; j++) {
                  g = groups[groupIndex[k][j]];
                  g.value = reduceRemove(g.value, data[k], notFilter, j);
                }
              }
            }
            return;
          }

          // Add the added values.
          for (i = 0, n = added.length; i < n; ++i) {
            if (filters.zeroExcept(k = added[i], offset, zero$$1)) {
              g = groups[groupIndex[k]];
              g.value = reduceAdd(g.value, data[k], false);
            }
          }

          // Remove the removed values.
          for (i = 0, n = removed.length; i < n; ++i) {
            if (filters.onlyExcept(k = removed[i], offset, zero$$1, filterOffset, filterOne)) {
              g = groups[groupIndex[k]];
              g.value = reduceRemove(g.value, data[k], notFilter);
            }
          }
        }

        // Reduces the specified selected or deselected records.
        // This function is only used when the cardinality is 1.
        // notFilter indicates a crossfilter.add/remove operation.
        function updateOne(filterOne, filterOffset, added, removed, notFilter) {
          if ((filterOne === one && filterOffset === offset) || resetNeeded) return;

          var i,
              k,
              n,
              g = groups[0];

          // Add the added values.
          for (i = 0, n = added.length; i < n; ++i) {
            if (filters.zeroExcept(k = added[i], offset, zero$$1)) {
              g.value = reduceAdd(g.value, data[k], false);
            }
          }

          // Remove the removed values.
          for (i = 0, n = removed.length; i < n; ++i) {
            if (filters.onlyExcept(k = removed[i], offset, zero$$1, filterOffset, filterOne)) {
              g.value = reduceRemove(g.value, data[k], notFilter);
            }
          }
        }

        // Recomputes the group reduce values from scratch.
        // This function is only used when the cardinality is greater than 1.
        function resetMany() {
          var i,
              j,
              g;

          // Reset all group values.
          for (i = 0; i < k; ++i) {
            groups[i].value = reduceInitial();
          }

          // We add all records and then remove filtered records so that reducers
          // can build an 'unfiltered' view even if there are already filters in
          // place on other dimensions.
          if(iterable){
            for (i = 0; i < n; ++i) {
              for (j = 0; j < groupIndex[i].length; j++) {
                g = groups[groupIndex[i][j]];
                g.value = reduceAdd(g.value, data[i], true, j);
              }
            }
            for (i = 0; i < n; ++i) {
              if (!filters.zeroExcept(i, offset, zero$$1)) {
                for (j = 0; j < groupIndex[i].length; j++) {
                  g = groups[groupIndex[i][j]];
                  g.value = reduceRemove(g.value, data[i], false, j);
                }
              }
            }
            return;
          }

          for (i = 0; i < n; ++i) {
            g = groups[groupIndex[i]];
            g.value = reduceAdd(g.value, data[i], true);
          }
          for (i = 0; i < n; ++i) {
            if (!filters.zeroExcept(i, offset, zero$$1)) {
              g = groups[groupIndex[i]];
              g.value = reduceRemove(g.value, data[i], false);
            }
          }
        }

        // Recomputes the group reduce values from scratch.
        // This function is only used when the cardinality is 1.
        function resetOne() {
          var i,
              g = groups[0];

          // Reset the singleton group values.
          g.value = reduceInitial();

          // We add all records and then remove filtered records so that reducers
          // can build an 'unfiltered' view even if there are already filters in
          // place on other dimensions.
          for (i = 0; i < n; ++i) {
            g.value = reduceAdd(g.value, data[i], true);
          }

          for (i = 0; i < n; ++i) {
            if (!filters.zeroExcept(i, offset, zero$$1)) {
              g.value = reduceRemove(g.value, data[i], false);
            }
          }
        }

        // Returns the array of group values, in the dimension's natural order.
        function all() {
          if (resetNeeded) reset(), resetNeeded = false;
          return groups;
        }

        // Returns a new array containing the top K group values, in reduce order.
        function top(k) {
          var top = select(all(), 0, groups.length, k);
          return heap$$1.sort(top, 0, top.length);
        }

        // Sets the reduce behavior for this group to use the specified functions.
        // This method lazily recomputes the reduce values, waiting until needed.
        function reduce$$1(add, remove, initial) {
          reduceAdd = add;
          reduceRemove = remove;
          reduceInitial = initial;
          resetNeeded = true;
          return group;
        }

        // A convenience method for reducing by count.
        function reduceCount() {
          return reduce$$1(reduce.reduceIncrement, reduce.reduceDecrement, zero);
        }

        // A convenience method for reducing by sum(value).
        function reduceSum(value) {
          return reduce$$1(reduce.reduceAdd(value), reduce.reduceSubtract(value), zero);
        }

        // Sets the reduce order, using the specified accessor.
        function order(value) {
          select = heapselect.by(valueOf);
          heap$$1 = heap.by(valueOf);
          function valueOf(d) { return value(d.value); }
          return group;
        }

        // A convenience method for natural ordering by reduce value.
        function orderNatural() {
          return order(identity);
        }

        // Returns the cardinality of this group, irrespective of any filters.
        function size() {
          return k;
        }

        // Removes this group and associated event listeners.
        function dispose() {
          var i = filterListeners.indexOf(update);
          if (i >= 0) filterListeners.splice(i, 1);
          i = indexListeners.indexOf(add);
          if (i >= 0) indexListeners.splice(i, 1);
          i = removeDataListeners.indexOf(removeData);
          if (i >= 0) removeDataListeners.splice(i, 1);
          i = dimensionGroups.indexOf(group);
          if (i >= 0) dimensionGroups.splice(i, 1);
          return group;
        }

        return reduceCount().orderNatural();
      }

      // A convenience function for generating a singleton group.
      function groupAll() {
        var g = group(_null), all = g.all;
        delete g.all;
        delete g.top;
        delete g.order;
        delete g.orderNatural;
        delete g.size;
        g.value = function() { return all()[0].value; };
        return g;
      }

      // Removes this dimension and associated groups and event listeners.
      function dispose() {
        dimensionGroups.forEach(function(group) { group.dispose(); });
        var i = dataListeners.indexOf(preAdd);
        if (i >= 0) dataListeners.splice(i, 1);
        i = dataListeners.indexOf(postAdd);
        if (i >= 0) dataListeners.splice(i, 1);
        i = removeDataListeners.indexOf(removeData);
        if (i >= 0) removeDataListeners.splice(i, 1);
        filters.masks[offset] &= zero$$1;
        return filterAll();
      }

      return dimension;
    }

    // A convenience method for groupAll on a dummy dimension.
    // This implementation can be optimized since it always has cardinality 1.
    function groupAll() {
      var group = {
        reduce: reduce$$1,
        reduceCount: reduceCount,
        reduceSum: reduceSum,
        value: value,
        dispose: dispose,
        remove: dispose // for backwards-compatibility
      };

      var reduceValue,
          reduceAdd,
          reduceRemove,
          reduceInitial,
          resetNeeded = true;

      // The group listens to the crossfilter for when any dimension changes, so
      // that it can update the reduce value. It must also listen to the parent
      // dimension for when data is added.
      filterListeners.push(update);
      dataListeners.push(add);

      // For consistency; actually a no-op since resetNeeded is true.
      add(data, 0, n);

      // Incorporates the specified new values into this group.
      function add(newData, n0) {
        var i;

        if (resetNeeded) return;

        // Cycle through all the values.
        for (i = n0; i < n; ++i) {

          // Add all values all the time.
          reduceValue = reduceAdd(reduceValue, data[i], true);

          // Remove the value if filtered.
          if (!filters.zero(i)) {
            reduceValue = reduceRemove(reduceValue, data[i], false);
          }
        }
      }

      // Reduces the specified selected or deselected records.
      function update(filterOne, filterOffset, added, removed, notFilter) {
        var i,
            k,
            n;

        if (resetNeeded) return;

        // Add the added values.
        for (i = 0, n = added.length; i < n; ++i) {
          if (filters.zero(k = added[i])) {
            reduceValue = reduceAdd(reduceValue, data[k], notFilter);
          }
        }

        // Remove the removed values.
        for (i = 0, n = removed.length; i < n; ++i) {
          if (filters.only(k = removed[i], filterOffset, filterOne)) {
            reduceValue = reduceRemove(reduceValue, data[k], notFilter);
          }
        }
      }

      // Recomputes the group reduce value from scratch.
      function reset() {
        var i;

        reduceValue = reduceInitial();

        // Cycle through all the values.
        for (i = 0; i < n; ++i) {

          // Add all values all the time.
          reduceValue = reduceAdd(reduceValue, data[i], true);

          // Remove the value if it is filtered.
          if (!filters.zero(i)) {
            reduceValue = reduceRemove(reduceValue, data[i], false);
          }
        }
      }

      // Sets the reduce behavior for this group to use the specified functions.
      // This method lazily recomputes the reduce value, waiting until needed.
      function reduce$$1(add, remove, initial) {
        reduceAdd = add;
        reduceRemove = remove;
        reduceInitial = initial;
        resetNeeded = true;
        return group;
      }

      // A convenience method for reducing by count.
      function reduceCount() {
        return reduce$$1(reduce.reduceIncrement, reduce.reduceDecrement, zero);
      }

      // A convenience method for reducing by sum(value).
      function reduceSum(value) {
        return reduce$$1(reduce.reduceAdd(value), reduce.reduceSubtract(value), zero);
      }

      // Returns the computed reduce value.
      function value() {
        if (resetNeeded) reset(), resetNeeded = false;
        return reduceValue;
      }

      // Removes this group and associated event listeners.
      function dispose() {
        var i = filterListeners.indexOf(update);
        if (i >= 0) filterListeners.splice(i, 1);
        i = dataListeners.indexOf(add);
        if (i >= 0) dataListeners.splice(i, 1);
        return group;
      }

      return reduceCount();
    }

    // Returns the number of records in this crossfilter, irrespective of any filters.
    function size() {
      return n;
    }

    // Returns the raw row data contained in this crossfilter
    function all(){
      return data;
    }

    // Returns row data with all dimension filters applied, except for filters in ignore_dimensions
    function allFiltered(ignore_dimensions) {
      var array$$1 = [],
          i = 0,
          mask = maskForDimensions(ignore_dimensions || []);

        for (i = 0; i < n; i++) {
          if (filters.zeroExceptMask(i, mask)) {
            array$$1.push(data[i]);
          }
        }

        return array$$1;
    }

    function onChange(cb){
      if(typeof cb !== 'function'){
        /* eslint no-console: 0 */
        console.warn('onChange callback parameter must be a function!');
        return;
      }
      callbacks.push(cb);
      return function(){
        callbacks.splice(callbacks.indexOf(cb), 1);
      };
    }

    function triggerOnChange(eventName){
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](eventName);
      }
    }

    return arguments.length
        ? add(arguments[0])
        : crossfilter;
  }

  // Returns an array of size n, big enough to store ids up to m.
  function crossfilter_index(n, m) {
    return (m < 0x101
        ? array.array8 : m < 0x10001
        ? array.array16
        : array.array32)(n);
  }

  // Constructs a new array of size n, with sequential values from 0 to n - 1.
  function crossfilter_range(n) {
    var range = crossfilter_index(n, n);
    for (var i = -1; ++i < n;) range[i] = i;
    return range;
  }

  function crossfilter_capacity(w) {
    return w === 8
        ? 0x100 : w === 16
        ? 0x10000
        : 0x100000000;
  }
  });
  var crossfilter_2 = crossfilter_1.crossfilter;

  var crossfilter2 = crossfilter_1.crossfilter;

  var crossfilter_1$1 = function (service) {
    return {
      build: build,
      generateColumns: generateColumns,
      add: add,
      remove: remove,
    }

    function build(c) {
      if (lodash.isArray(c)) {
        // This allows support for crossfilter async
        return Promise.resolve(crossfilter2(c))
      }
      if (!c || typeof c.dimension !== 'function') {
        return Promise.reject(new Error('No Crossfilter data or instance found!'))
      }
      return Promise.resolve(c)
    }

    function generateColumns(data) {
      if (!service.options.generatedColumns) {
        return data
      }
      return lodash.map(data, function (d/* , i */) {
        lodash.forEach(service.options.generatedColumns, function (val, key) {
          d[key] = val(d);
        });
        return d
      })
    }

    function add(data) {
      data = generateColumns(data);
      return new Promise(function (resolve, reject) {
        try {
          resolve(service.cf.add(data));
        } catch (err) {
          reject(err);
        }
      })
        .then(function () {
          return lodash.map(service.dataListeners, function (listener) {
            return function () {
              return listener({
                added: data,
              })
            }
          }).reduce(function(promise, data) {
            return promise.then(data)
          }, Promise.resolve(true))
        })

      .then(function() {
        return Promise.all(lodash.map(service.filterListeners, function (listener) {
           return listener()
        }))      
      })

        .then(function () {
          return service
        })
    }

    function remove(predicate) {
      return new Promise(function (resolve, reject) {
        try {
          resolve(service.cf.remove(predicate));
        } catch (err) {
          reject(err);
        }
      })
      
      .then(function() {
        return Promise.all(lodash.map(service.filterListeners, function (listener) {
           return listener()
        }))      
      })
      
      .then(function () {
        return service
      })
    }
  };

  // var moment = require('moment')

  var expressions = {
    // Getters
    $field: $field,
    // Booleans
    $and: $and,
    $or: $or,
    $not: $not,

    // Expressions
    $eq: $eq,
    $gt: $gt,
    $gte: $gte,
    $lt: $lt,
    $lte: $lte,
    $ne: $ne,
    $type: $type,

    // Array Expressions
    $in: $in,
    $nin: $nin,
    $contains: $contains,
    $excludes: $excludes,
    $size: $size,
  };

  // Getters
  function $field(d, child) {
    return d[child]
  }

  // Operators

  function $and(d, child) {
    child = child(d);
    for (var i = 0; i < child.length; i++) {
      if (!child[i]) {
        return false
      }
    }
    return true
  }

  function $or(d, child) {
    child = child(d);
    for (var i = 0; i < child.length; i++) {
      if (child[i]) {
        return true
      }
    }
    return false
  }

  function $not(d, child) {
    child = child(d);
    for (var i = 0; i < child.length; i++) {
      if (child[i]) {
        return false
      }
    }
    return true
  }

  // Expressions

  function $eq(d, child) {
    return d === child()
  }

  function $gt(d, child) {
    return d > child()
  }

  function $gte(d, child) {
    return d >= child()
  }

  function $lt(d, child) {
    return d < child()
  }

  function $lte(d, child) {
    return d <= child()
  }

  function $ne(d, child) {
    return d !== child()
  }

  function $type(d, child) {
    return typeof d === child()
  }

  // Array Expressions

  function $in(d, child) {
    return d.indexOf(child()) > -1
  }

  function $nin(d, child) {
    return d.indexOf(child()) === -1
  }

  function $contains(d, child) {
    return child().indexOf(d) > -1
  }

  function $excludes(d, child) {
    return child().indexOf(d) === -1
  }

  function $size(d, child) {
    return d.length === child()
  }

  var aggregators = {
    // Collections
    $sum: $sum,
    $avg: $avg,
    $max: $max,
    $min: $min,

    // Pickers
    $count: $count,
    $first: $first,
    $last: $last,
    $get: $get,
    $nth: $get, // nth is same as using a get
    $nthLast: $nthLast,
    $nthPct: $nthPct,
    $map: $map,
  };

  var aggregation = {
    makeValueAccessor: makeValueAccessor,
    aggregators: aggregators,
    extractKeyValOrArray: extractKeyValOrArray,
    parseAggregatorParams: parseAggregatorParams,
  };
  // This is used to build aggregation stacks for sub-reductio
  // aggregations, or plucking values for use in filters from the data
  function makeValueAccessor(obj) {
    if (typeof obj === 'string') {
      if (isStringSyntax(obj)) {
        obj = convertAggregatorString(obj);
      } else {
        // Must be a column key. Return an identity accessor
        return obj
      }
    }
    // Must be a column index. Return an identity accessor
    if (typeof obj === 'number') {
      return obj
    }
    // If it's an object, we need to build a custom value accessor function
    if (lodash.isObject(obj)) {
      return make()
    }

    function make() {
      var stack = makeSubAggregationFunction(obj);
      return function topStack(d) {
        return stack(d)
      }
    }
  }

  // A recursive function that walks the aggregation stack and returns
  // a function. The returned function, when called, will recursively invoke
  // with the properties from the previous stack in reverse order
  function makeSubAggregationFunction(obj) {
    // If its an object, either unwrap all of the properties as an
    // array of keyValues, or unwrap the first keyValue set as an object
    obj = lodash.isObject(obj) ? extractKeyValOrArray(obj) : obj;

    // Detect strings
    if (lodash.isString(obj)) {
      // If begins with a $, then we need to convert it over to a regular query object and analyze it again
      if (isStringSyntax(obj)) {
        return makeSubAggregationFunction(convertAggregatorString(obj))
      }
      // If normal string, then just return a an itentity accessor
      return function identity(d) {
        return d[obj]
      }
    }

    // If an array, recurse into each item and return as a map
    if (lodash.isArray(obj)) {
      var subStack = lodash.map(obj, makeSubAggregationFunction);
      return function getSubStack(d) {
        return subStack.map(function(s) {
          return s(d)
        })
      }
    }

    // If object, find the aggregation, and recurse into the value
    if (obj.key) {
      if (aggregators[obj.key]) {
        var subAggregationFunction = makeSubAggregationFunction(obj.value);
        return function getAggregation(d) {
          return aggregators[obj.key](subAggregationFunction(d))
        }
      }
      console.error('Could not find aggregration method', obj);
    }

    return []
  }

  function extractKeyValOrArray(obj) {
    var keyVal;
    var values = [];
    for (var key in obj) {
      if ({}.hasOwnProperty.call(obj, key)) {
        keyVal = {
          key: key,
          value: obj[key],
        };
        var subObj = {};
        subObj[key] = obj[key];
        values.push(subObj);
      }
    }
    return values.length > 1 ? values : keyVal
  }

  function isStringSyntax(str) {
    return ['$', '('].indexOf(str.charAt(0)) > -1
  }

  function parseAggregatorParams(keyString) {
    var params = [];
    var p1 = keyString.indexOf('(');
    var p2 = keyString.indexOf(')');
    var key = p1 > -1 ? keyString.substring(0, p1) : keyString;
    if (!aggregators[key]) {
      return false
    }
    if (p1 > -1 && p2 > -1 && p2 > p1) {
      params = keyString.substring(p1 + 1, p2).split(',');
    }

    return {
      aggregator: aggregators[key],
      params: params,
    }
  }

  function convertAggregatorString(keyString) {
    // var obj = {} // obj is defined but not used

    // 1. unwrap top parentheses
    // 2. detect arrays

    // parentheses
    var outerParens = /\((.+)\)/g;
    // var innerParens = /\(([^\(\)]+)\)/g  // innerParens is defined but not used
    // comma not in ()
    var hasComma = /(?:\([^\(\)]*\))|(,)/g;

    return JSON.parse('{' + unwrapParensAndCommas(keyString) + '}')

    function unwrapParensAndCommas(str) {
      str = str.replace(' ', '');
      return (
        '"' +
        str.replace(outerParens, function(p, pr) {
          if (hasComma.test(pr)) {
            if (pr.charAt(0) === '$') {
              return (
                '":{"' +
                pr.replace(hasComma, function(p2 /* , pr2 */) {
                  if (p2 === ',') {
                    return ',"'
                  }
                  return unwrapParensAndCommas(p2).trim()
                }) +
                '}'
              )
            }
            return (
              ':["' +
              pr.replace(
                hasComma,
                function(/* p2 , pr2 */) {
                  return '","'
                }
              ) +
              '"]'
            )
          }
        })
      )
    }
  }

  // Collection Aggregators

  function $sum(children) {
    return children.reduce(function(a, b) {
      return a + b
    }, 0)
  }

  function $avg(children) {
    return (
      children.reduce(function(a, b) {
        return a + b
      }, 0) / children.length
    )
  }

  function $max(children) {
    return Math.max.apply(null, children)
  }

  function $min(children) {
    return Math.min.apply(null, children)
  }

  function $count(children) {
    return children.length
  }

  /* function $med(children) { // $med is defined but not used
    children.sort(function(a, b) {
      return a - b
    })
    var half = Math.floor(children.length / 2)
    if (children.length % 2)
      return children[half]
    else
      return (children[half - 1] + children[half]) / 2.0
  } */

  function $first(children) {
    return children[0]
  }

  function $last(children) {
    return children[children.length - 1]
  }

  function $get(children, n) {
    return children[n]
  }

  function $nthLast(children, n) {
    return children[children.length - n]
  }

  function $nthPct(children, n) {
    return children[Math.round(children.length * (n / 100))]
  }

  function $map(children, n) {
    return children.map(function(d) {
      return d[n]
    })
  }

  var filters = function (service) {
    return {
      filter: filter,
      filterAll: filterAll,
      applyFilters: applyFilters,
      makeFunction: makeFunction,
      scanForDynamicFilters: scanForDynamicFilters,
    }

    function filter(column, fil, isRange, replace) {
      return getColumn(column)
        .then(function (column) {
        // Clone a copy of the new filters
          var newFilters = lodash.assign({}, service.filters);
          // Here we use the registered column key despite the filter key passed, just in case the filter key's ordering is ordered differently :)
          var filterKey = column.key;
          if (column.complex === 'array') {
            filterKey = JSON.stringify(column.key);
          }
          if (column.complex === 'function') {
            filterKey = column.key.toString();
          }
          // Build the filter object
          newFilters[filterKey] = buildFilterObject(fil, isRange, replace);

          return applyFilters(newFilters)
        })
    }

    function getColumn(column) {
      var exists = service.column.find(column);
      // If the filters dimension doesn't exist yet, try and create it
      return new Promise(function (resolve, reject) {
        try {
          if (!exists) {
            return resolve(service.column({
              key: column,
              temporary: true,
            })
              .then(function () {
                // It was able to be created, so retrieve and return it
                return service.column.find(column)
              })
            )
          } else {
            // It exists, so just return what we found
            resolve(exists);
          }
        } catch (err) {
          reject(err);
        }
      })
    }

    function filterAll(fils) {
      // If empty, remove all filters
      if (!fils) {
        service.columns.forEach(function (col) {
          col.dimension.filterAll();
        });
        return applyFilters({})
      }

      // Clone a copy for the new filters
      var newFilters = lodash.assign({}, service.filters);

      var ds = lodash.map(fils, function (fil) {
        return getColumn(fil.column)
          .then(function (column) {
            // Here we use the registered column key despite the filter key passed, just in case the filter key's ordering is ordered differently :)
            var filterKey = column.complex ? JSON.stringify(column.key) : column.key;
            // Build the filter object
            newFilters[filterKey] = buildFilterObject(fil.value, fil.isRange, fil.replace);
          })
      });

      return Promise.all(ds)
        .then(function () {
          return applyFilters(newFilters)
        })
    }

    function buildFilterObject(fil, isRange, replace) {
      if (lodash.isUndefined(fil)) {
        return false
      }
      if (lodash.isFunction(fil)) {
        return {
          value: fil,
          function: fil,
          replace: true,
          type: 'function',
        }
      }
      if (lodash.isObject(fil)) {
        return {
          value: fil,
          function: makeFunction(fil),
          replace: true,
          type: 'function',
        }
      }
      if (lodash.isArray(fil)) {
        return {
          value: fil,
          replace: isRange || replace,
          type: isRange ? 'range' : 'inclusive',
        }
      }
      return {
        value: fil,
        replace: replace,
        type: 'exact',
      }
    }

    function applyFilters(newFilters) {
      var ds = lodash.map(newFilters, function (fil, i) {
        var existing = service.filters[i];
        // Filters are the same, so no change is needed on this column
        if (fil === existing) {
          return Promise.resolve()
        }
        var column;
        // Retrieve complex columns by decoding the column key as json
        if (i.charAt(0) === '[') {
          column = service.column.find(JSON.parse(i));
        } else {
          // Retrieve the column normally
          column = service.column.find(i);
        }

        // Toggling a filter value is a bit different from replacing them
        if (fil && existing && !fil.replace) {
          newFilters[i] = fil = toggleFilters(fil, existing);
        }

        // If no filter, remove everything from the dimension
        if (!fil) {
          return Promise.resolve(column.dimension.filterAll())
        }
        if (fil.type === 'exact') {
          return Promise.resolve(column.dimension.filterExact(fil.value))
        }
        if (fil.type === 'range') {
          return Promise.resolve(column.dimension.filterRange(fil.value))
        }
        if (fil.type === 'inclusive') {
          return Promise.resolve(column.dimension.filterFunction(function (d) {
            return fil.value.indexOf(d) > -1
          }))
        }
        if (fil.type === 'function') {
          return Promise.resolve(column.dimension.filterFunction(fil.function))
        }
        // By default if something craps up, just remove all filters
        return Promise.resolve(column.dimension.filterAll())
      });

      return Promise.all(ds)
        .then(function () {
          // Save the new filters satate
          service.filters = newFilters;

          // Pluck and remove falsey filters from the mix
          var tryRemoval = [];
          lodash.forEach(service.filters, function (val, key) {
            if (!val) {
              tryRemoval.push({
                key: key,
                val: val,
              });
              delete service.filters[key];
            }
          });

          // If any of those filters are the last dependency for the column, then remove the column
          return Promise.all(lodash.map(tryRemoval, function (v) {
            var column = service.column.find((v.key.charAt(0) === '[') ? JSON.parse(v.key) : v.key);
            if (column.temporary && !column.dynamicReference) {
              return service.clear(column.key)
            }
          }))
        })
        .then(function () {
          // Call the filterListeners and wait for their return
          return Promise.all(lodash.map(service.filterListeners, function (listener) {
            return listener()
          }))
        })
        .then(function () {
          return service
        })
    }

    function toggleFilters(fil, existing) {
      // Exact from Inclusive
      if (fil.type === 'exact' && existing.type === 'inclusive') {
        fil.value = lodash.xor([fil.value], existing.value);
      } else if (fil.type === 'inclusive' && existing.type === 'exact') { // Inclusive from Exact
        fil.value = lodash.xor(fil.value, [existing.value]);
      } else if (fil.type === 'inclusive' && existing.type === 'inclusive') { // Inclusive / Inclusive Merge
        fil.value = lodash.xor(fil.value, existing.value);
      } else if (fil.type === 'exact' && existing.type === 'exact') { // Exact / Exact
        // If the values are the same, remove the filter entirely
        if (fil.value === existing.value) {
          return false
        }
        // They they are different, make an array
        fil.value = [fil.value, existing.value];
      }

      // Set the new type based on the merged values
      if (!fil.value.length) {
        fil = false;
      } else if (fil.value.length === 1) {
        fil.type = 'exact';
        fil.value = fil.value[0];
      } else {
        fil.type = 'inclusive';
      }

      return fil
    }

    function scanForDynamicFilters(query) {
      // Here we check to see if there are any relative references to the raw data
      // being used in the filter. If so, we need to build those dimensions and keep
      // them updated so the filters can be rebuilt if needed
      // The supported keys right now are: $column, $data
      var columns = [];
      walk(query.filter);
      return columns

      function walk(obj) {
        lodash.forEach(obj, function (val, key) {
          // find the data references, if any
          var ref = findDataReferences(val, key);
          if (ref) {
            columns.push(ref);
          }
          // if it's a string
          if (lodash.isString(val)) {
            ref = findDataReferences(null, val);
            if (ref) {
              columns.push(ref);
            }
          }
          // If it's another object, keep looking
          if (lodash.isObject(val)) {
            walk(val);
          }
        });
      }
    }

    function findDataReferences(val, key) {
      // look for the $data string as a value
      if (key === '$data') {
        return true
      }

      // look for the $column key and it's value as a string
      if (key && key === '$column') {
        if (lodash.isString(val)) {
          return val
        }
        console.warn('The value for filter "$column" must be a valid column key', val);
        return false
      }
    }

    function makeFunction(obj, isAggregation) {
      var subGetters;

      // Detect raw $data reference
      if (lodash.isString(obj)) {
        var dataRef = findDataReferences(null, obj);
        if (dataRef) {
          var data = service.cf.all();
          return function () {
            return data
          }
        }
      }

      if (lodash.isString(obj) || lodash.isNumber(obj) || lodash.isBoolean(obj)) {
        return function (d) {
          if (typeof d === 'undefined') {
            return obj
          }
          return expressions.$eq(d, function () {
            return obj
          })
        }
      }

      // If an array, recurse into each item and return as a map
      if (lodash.isArray(obj)) {
        subGetters = lodash.map(obj, function (o) {
          return makeFunction(o, isAggregation)
        });
        return function (d) {
          return subGetters.map(function (s) {
            return s(d)
          })
        }
      }

      // If object, return a recursion function that itself, returns the results of all of the object keys
      if (lodash.isObject(obj)) {
        subGetters = lodash.map(obj, function (val, key) {
          // Get the child
          var getSub = makeFunction(val, isAggregation);

          // Detect raw $column references
          var dataRef = findDataReferences(val, key);
          if (dataRef) {
            var column = service.column.find(dataRef);
            var data = column.values;
            return function () {
              return data
            }
          }

          // If expression, pass the parentValue and the subGetter
          if (expressions[key]) {
            return function (d) {
              return expressions[key](d, getSub)
            }
          }

          var aggregatorObj = aggregation.parseAggregatorParams(key);
          if (aggregatorObj) {
            // Make sure that any further operations are for aggregations
            // and not filters
            isAggregation = true;
            // here we pass true to makeFunction which denotes that
            // an aggregatino chain has started and to stop using $AND
            getSub = makeFunction(val, isAggregation);
            // If it's an aggregation object, be sure to pass in the children, and then any additional params passed into the aggregation string
            return function () {
              return aggregatorObj.aggregator.apply(null, [getSub()].concat(aggregatorObj.params))
            }
          }

          // It must be a string then. Pluck that string key from parent, and pass it as the new value to the subGetter
          return function (d) {
            d = d[key];
            return getSub(d, getSub)
          }
        });

        // All object expressions are basically AND's
        // Return AND with a map of the subGetters
        if (isAggregation) {
          if (subGetters.length === 1) {
            return function (d) {
              return subGetters[0](d)
            }
          }
          return function (d) {
            return lodash.map(subGetters, function (getSub) {
              return getSub(d)
            })
          }
        }
        return function (d) {
          return expressions.$and(d, function (d) {
            return lodash.map(subGetters, function (getSub) {
              return getSub(d)
            })
          })
        }
      }

      console.log('no expression found for ', obj);
      return false
    }
  };

  var dimension = function (service) {
    return {
      make: make,
      makeAccessor: makeAccessor,
    }

    function make(key, type, complex) {
      var accessor = makeAccessor(key, complex);
      // Promise.resolve will handle promises or non promises, so
      // this crossfilter async is supported if present
      return Promise.resolve(service.cf.dimension(accessor, type === 'array'))
    }

    function makeAccessor(key, complex) {
      var accessorFunction;

      if (complex === 'string') {
        accessorFunction = function (d) {
          return lodash.get(d, key)
        };
      } else if (complex === 'function') {
        accessorFunction = key;
      } else if (complex === 'array') {
        var arrayString = lodash.map(key, function (k) {
          return 'd[\'' + k + '\']'
        });
        accessorFunction = new Function('d', String('return ' + JSON.stringify(arrayString).replace(/"/g, '')));  // eslint-disable-line  no-new-func
      } else {
        accessorFunction =
          // Index Dimension
          key === true ? function accessor(d, i) {
            return i
          } :
            // Value Accessor Dimension
            function (d) {
              return d[key]
            };
      }
      return accessorFunction
    }
  };

  var column = function (service) {
    var dimension$$1 = dimension(service);

    var columnFunc = column;
    columnFunc.find = findColumn;

    return columnFunc

    function column(def) {
      // Support groupAll dimension
      if (lodash.isUndefined(def)) {
        def = true;
      }

      // Always deal in bulk.  Like Costco!
      if (!lodash.isArray(def)) {
        def = [def];
      }

      // Mapp all column creation, wait for all to settle, then return the instance
      return Promise.all(lodash.map(def, makeColumn))
        .then(function () {
          return service
        })
    }

    function findColumn(d) {
      return lodash.find(service.columns, function (c) {
        if (lodash.isArray(d)) {
          return !lodash.xor(c.key, d).length
        }
        return c.key === d
      })
    }

    function getType(d) {
      if (lodash.isNumber(d)) {
        return 'number'
      }
      if (lodash.isBoolean(d)) {
        return 'bool'
      }
      if (lodash.isArray(d)) {
        return 'array'
      }
      if (lodash.isObject(d)) {
        return 'object'
      }
      return 'string'
    }

    function makeColumn(d) {
      var column = lodash.isObject(d) ? d : {
        key: d,
      };

      var existing = findColumn(column.key);

      if (existing) {
        existing.temporary = false;
        if (existing.dynamicReference) {
          existing.dynamicReference = false;
        }
        return existing.promise
          .then(function () {
            return service
          })
      }

      // for storing info about queries and post aggregations
      column.queries = [];
      service.columns.push(column);

      column.promise = new Promise(function (resolve, reject) {
        try {
          resolve(service.cf.all());
        } catch (err) {
          reject(err);
        }
      })
        .then(function (all) {
          var sample;

          // Complex column Keys
          if (lodash.isFunction(column.key)) {
            column.complex = 'function';
            sample = column.key(all[0]);
          } else if (lodash.isString(column.key) && (column.key.indexOf('.') > -1 || column.key.indexOf('[') > -1)) {
            column.complex = 'string';
            sample = lodash.get(all[0], column.key);
          } else if (lodash.isArray(column.key)) {
            column.complex = 'array';
            sample = lodash.values(lodash.pick(all[0], column.key));
            if (sample.length !== column.key.length) {
              throw new Error('Column key does not exist in data!', column.key)
            }
          } else {
            sample = all[0][column.key];
          }

          // Index Column
          if (!column.complex && column.key !== true && typeof sample === 'undefined') {
            throw new Error('Column key does not exist in data!', column.key)
          }

          // If the column exists, let's at least make sure it's marked
          // as permanent. There is a slight chance it exists because
          // of a filter, and the user decides to make it permanent

          if (column.key === true) {
            column.type = 'all';
          } else if (column.complex) {
            column.type = 'complex';
          } else if (column.array) {
            column.type = 'array';
          } else {
            column.type = getType(sample);
          }

          return dimension$$1.make(column.key, column.type, column.complex)
        })
        .then(function (dim) {
          column.dimension = dim;
          column.filterCount = 0;
          var stopListeningForData = service.onDataChange(buildColumnKeys);
          column.removeListeners = [stopListeningForData];

          return buildColumnKeys()

          // Build the columnKeys
          function buildColumnKeys(changes) {
            if (column.key === true) {
              return Promise.resolve()
            }

            var accessor = dimension$$1.makeAccessor(column.key, column.complex);
            column.values = column.values || [];

            return new Promise(function (resolve, reject) {
              try {
                if (changes && changes.added) {
                  resolve(changes.added);
                } else {
                  resolve(column.dimension.bottom(Infinity));
                }
              } catch (err) {
                reject(err);
              }
            })
              .then(function (rows) {
                var newValues;
                if (column.complex === 'string' || column.complex === 'function') {
                  newValues = lodash.map(rows, accessor);
                  // console.log(rows, accessor.toString(), newValues)
                } else if (column.type === 'array') {
                  newValues = lodash.flatten(lodash.map(rows, accessor));
                } else {
                  newValues = lodash.map(rows, accessor);
                }
                column.values = lodash.uniq(column.values.concat(newValues));
              })
          }
        });

      return column.promise
        .then(function () {
          return service
        })
    }
  };

  var reductio_filter = {
  	// The big idea here is that you give us a filter function to run on values,
  	// a 'prior' reducer to run (just like the rest of the standard reducers),
  	// and a reference to the last reducer (called 'skip' below) defined before
  	// the most recent chain of reducers.  This supports individual filters for
  	// each .value('...') chain that you add to your reducer.
  	add: function (filter, prior, skip) {
  		return function (p, v, nf) {
  			if (filter(v, nf)) {
  				if (prior) prior(p, v, nf);
  			} else {
  				if (skip) skip(p, v, nf);
  			}
  			return p;
  		};
  	},
  	remove: function (filter, prior, skip) {
  		return function (p, v, nf) {
  			if (filter(v, nf)) {
  				if (prior) prior(p, v, nf);
  			} else {
  				if (skip) skip(p, v, nf);
  			}
  			return p;
  		};
  	}
  };

  var filter$1 = reductio_filter;

  var reductio_count = {
  	add: function(prior, path, propName) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			path(p)[propName]++;
  			return p;
  		};
  	},
  	remove: function(prior, path, propName) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			path(p)[propName]--;
  			return p;
  		};
  	},
  	initial: function(prior, path, propName) {
  		return function (p) {
  			if(prior) p = prior(p);
  			// if(p === undefined) p = {};
  			path(p)[propName] = 0;
  			return p;
  		};
  	}
  };

  var count = reductio_count;

  var reductio_sum = {
  	add: function (a, prior, path) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			path(p).sum = path(p).sum + a(v);
  			return p;
  		};
  	},
  	remove: function (a, prior, path) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			path(p).sum = path(p).sum - a(v);
  			return p;
  		};
  	},
  	initial: function (prior, path) {
  		return function (p) {
  			p = prior(p);
  			path(p).sum = 0;
  			return p;
  		};
  	}
  };

  var sum = reductio_sum;

  var reductio_avg = {
  	add: function (a, prior, path) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			if(path(p).count > 0) {
  				path(p).avg = path(p).sum / path(p).count;
  			} else {
  				path(p).avg = 0;
  			}
  			return p;
  		};
  	},
  	remove: function (a, prior, path) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			if(path(p).count > 0) {
  				path(p).avg = path(p).sum / path(p).count;
  			} else {
  				path(p).avg = 0;
  			}
  			return p;
  		};
  	},
  	initial: function (prior, path) {
  		return function (p) {
  			p = prior(p);
  			path(p).avg = 0;
  			return p;
  		};
  	}
  };

  var avg = reductio_avg;

  var reductio_median = {
  	add: function (prior, path) {
  		var half;
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);

  			half = Math.floor(path(p).valueList.length/2);
   
  			if(path(p).valueList.length % 2) {
  				path(p).median = path(p).valueList[half];
  			} else {
  				path(p).median = (path(p).valueList[half-1] + path(p).valueList[half]) / 2.0;
  			}

  			return p;
  		};
  	},
  	remove: function (prior, path) {
  		var half;
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);

  			half = Math.floor(path(p).valueList.length/2);

  			// Check for undefined.
  			if(path(p).valueList.length === 0) {
  				path(p).median = undefined;
  				return p;
  			}
   
  			if(path(p).valueList.length === 1 || path(p).valueList.length % 2) {
  				path(p).median = path(p).valueList[half];
  			} else {
  				path(p).median = (path(p).valueList[half-1] + path(p).valueList[half]) / 2.0;
  			}

  			return p;
  		};
  	},
  	initial: function (prior, path) {
  		return function (p) {
  			p = prior(p);
  			path(p).median = undefined;
  			return p;
  		};
  	}
  };

  var median = reductio_median;

  var reductio_min = {
  	add: function (prior, path) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
   
  			path(p).min = path(p).valueList[0];

  			return p;
  		};
  	},
  	remove: function (prior, path) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);

  			// Check for undefined.
  			if(path(p).valueList.length === 0) {
  				path(p).min = undefined;
  				return p;
  			}
   
  			path(p).min = path(p).valueList[0];

  			return p;
  		};
  	},
  	initial: function (prior, path) {
  		return function (p) {
  			p = prior(p);
  			path(p).min = undefined;
  			return p;
  		};
  	}
  };

  var min = reductio_min;

  var reductio_max = {
  	add: function (prior, path) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
   
  			path(p).max = path(p).valueList[path(p).valueList.length - 1];

  			return p;
  		};
  	},
  	remove: function (prior, path) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);

  			// Check for undefined.
  			if(path(p).valueList.length === 0) {
  				path(p).max = undefined;
  				return p;
  			}
   
  			path(p).max = path(p).valueList[path(p).valueList.length - 1];

  			return p;
  		};
  	},
  	initial: function (prior, path) {
  		return function (p) {
  			p = prior(p);
  			path(p).max = undefined;
  			return p;
  		};
  	}
  };

  var max = reductio_max;

  var reductio_value_count = {
  	add: function (a, prior, path) {
  		var i, curr;
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			// Not sure if this is more efficient than sorting.
  			i = path(p).bisect(path(p).values, a(v), 0, path(p).values.length);
  			curr = path(p).values[i];
  			if(curr && curr[0] === a(v)) {
  				// Value already exists in the array - increment it
  				curr[1]++;
  			} else {
  				// Value doesn't exist - add it in form [value, 1]
  				path(p).values.splice(i, 0, [a(v), 1]);
  			}
  			return p;
  		};
  	},
  	remove: function (a, prior, path) {
  		var i;
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			i = path(p).bisect(path(p).values, a(v), 0, path(p).values.length);
  			// Value already exists or something has gone terribly wrong.
  			path(p).values[i][1]--;
  			return p;
  		};
  	},
  	initial: function (prior, path) {
  		return function (p) {
  			p = prior(p);
  			// Array[Array[value, count]]
  			path(p).values = [];
  			path(p).bisect = crossfilter2.bisect.by(function(d) { return d[0]; }).left;
  			return p;
  		};
  	}
  };

  var valueCount = reductio_value_count;

  var reductio_value_list = {
  	add: function (a, prior, path) {
  		var i;
  		var bisect = crossfilter2.bisect.by(function(d) { return d; }).left;
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			// Not sure if this is more efficient than sorting.
  			i = bisect(path(p).valueList, a(v), 0, path(p).valueList.length);
  			path(p).valueList.splice(i, 0, a(v));
  			return p;
  		};
  	},
  	remove: function (a, prior, path) {
  		var i;
  		var bisect = crossfilter2.bisect.by(function(d) { return d; }).left;
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			i = bisect(path(p).valueList, a(v), 0, path(p).valueList.length);
  			// Value already exists or something has gone terribly wrong.
  			path(p).valueList.splice(i, 1);
  			return p;
  		};
  	},
  	initial: function (prior, path) {
  		return function (p) {
  			p = prior(p);
  			path(p).valueList = [];
  			return p;
  		};
  	}
  };

  var valueList = reductio_value_list;

  var reductio_exception_count = {
  	add: function (a, prior, path) {
  		var i, curr;
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			// Only count++ if the p.values array doesn't contain a(v) or if it's 0.
  			i = path(p).bisect(path(p).values, a(v), 0, path(p).values.length);
  			curr = path(p).values[i];
  			if((!curr || curr[0] !== a(v)) || curr[1] === 0) {
  				path(p).exceptionCount++;
  			}
  			return p;
  		};
  	},
  	remove: function (a, prior, path) {
  		var i, curr;
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			// Only count-- if the p.values array contains a(v) value of 1.
  			i = path(p).bisect(path(p).values, a(v), 0, path(p).values.length);
  			curr = path(p).values[i];
  			if(curr && curr[0] === a(v) && curr[1] === 1) {
  				path(p).exceptionCount--;
  			}
  			return p;
  		};
  	},
  	initial: function (prior, path) {
  		return function (p) {
  			p = prior(p);
  			path(p).exceptionCount = 0;
  			return p;
  		};
  	}
  };

  var exceptionCount = reductio_exception_count;

  var reductio_exception_sum = {
  	add: function (a, sum, prior, path) {
  		var i, curr;
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			// Only sum if the p.values array doesn't contain a(v) or if it's 0.
  			i = path(p).bisect(path(p).values, a(v), 0, path(p).values.length);
  			curr = path(p).values[i];
  			if((!curr || curr[0] !== a(v)) || curr[1] === 0) {
  				path(p).exceptionSum = path(p).exceptionSum + sum(v);
  			}
  			return p;
  		};
  	},
  	remove: function (a, sum, prior, path) {
  		var i, curr;
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			// Only sum if the p.values array contains a(v) value of 1.
  			i = path(p).bisect(path(p).values, a(v), 0, path(p).values.length);
  			curr = path(p).values[i];
  			if(curr && curr[0] === a(v) && curr[1] === 1) {
  				path(p).exceptionSum = path(p).exceptionSum - sum(v);
  			}
  			return p;
  		};
  	},
  	initial: function (prior, path) {
  		return function (p) {
  			p = prior(p);
  			path(p).exceptionSum = 0;
  			return p;
  		};
  	}
  };

  var exceptionSum = reductio_exception_sum;

  var reductio_histogram = {
  	add: function (a, prior, path) {
  		var bisect = crossfilter2.bisect.by(function(d) { return d; }).left;
  		var bisectHisto = crossfilter2.bisect.by(function(d) { return d.x; }).right;
  		var curr;
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			curr = path(p).histogram[bisectHisto(path(p).histogram, a(v), 0, path(p).histogram.length) - 1];
  			curr.y++;
  			curr.splice(bisect(curr, a(v), 0, curr.length), 0, a(v));
  			return p;
  		};
  	},
  	remove: function (a, prior, path) {
  		var bisect = crossfilter2.bisect.by(function(d) { return d; }).left;
  		var bisectHisto = crossfilter2.bisect.by(function(d) { return d.x; }).right;
  		var curr;
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			curr = path(p).histogram[bisectHisto(path(p).histogram, a(v), 0, path(p).histogram.length) - 1];
  			curr.y--;
  			curr.splice(bisect(curr, a(v), 0, curr.length), 1);
  			return p;
  		};
  	},
  	initial: function (thresholds, prior, path) {
  		return function (p) {
  			p = prior(p);
  			path(p).histogram = [];
  			var arr = [];
  			for(var i = 1; i < thresholds.length; i++) {
  				arr = [];
  				arr.x = thresholds[i - 1];
  				arr.dx = (thresholds[i] - thresholds[i - 1]);
  				arr.y = 0;
  				path(p).histogram.push(arr);
  			}
  			return p;
  		};
  	}
  };

  var histogram = reductio_histogram;

  var reductio_sum_of_sq = {
  	add: function (a, prior, path) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			path(p).sumOfSq = path(p).sumOfSq + a(v)*a(v);
  			return p;
  		};
  	},
  	remove: function (a, prior, path) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			path(p).sumOfSq = path(p).sumOfSq - a(v)*a(v);
  			return p;
  		};
  	},
  	initial: function (prior, path) {
  		return function (p) {
  			p = prior(p);
  			path(p).sumOfSq = 0;
  			return p;
  		};
  	}
  };

  var sumOfSquares = reductio_sum_of_sq;

  var reductio_std = {
  	add: function (prior, path) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			if(path(p).count > 0) {
  				path(p).std = 0.0;
  				var n = path(p).sumOfSq - path(p).sum*path(p).sum/path(p).count;
  				if (n>0.0) path(p).std = Math.sqrt(n/(path(p).count-1));
  			} else {
  				path(p).std = 0.0;
  			}
  			return p;
  		};
  	},
  	remove: function (prior, path) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			if(path(p).count > 0) {
  				path(p).std = 0.0;
  				var n = path(p).sumOfSq - path(p).sum*path(p).sum/path(p).count;
  				if (n>0.0) path(p).std = Math.sqrt(n/(path(p).count-1));
  			} else {
  				path(p).std = 0;
  			}
  			return p;
  		};
  	},
  	initial: function (prior, path) {
  		return function (p) {
  			p = prior(p);
  			path(p).std = 0;
  			return p;
  		};
  	}
  };

  var std = reductio_std;

  var reductio_nest = {
  	add: function (keyAccessors, prior, path) {
  		var arrRef;
  		var newRef;
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);

  			arrRef = path(p).nest;
  			keyAccessors.forEach(function(a) {
  				newRef = arrRef.filter(function(d) { return d.key === a(v); })[0];
  				if(newRef) {
  					// There is another level.
  					arrRef = newRef.values;
  				} else {
  					// Next level doesn't yet exist so we create it.
  					newRef = [];
  					arrRef.push({ key: a(v), values: newRef });
  					arrRef = newRef;
  				}
  			});

  			arrRef.push(v);
  			
  			return p;
  		};
  	},
  	remove: function (keyAccessors, prior, path) {
  		var arrRef;
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);

  			arrRef = path(p).nest;
  			keyAccessors.forEach(function(a) {
  				arrRef = arrRef.filter(function(d) { return d.key === a(v); })[0].values;
  			});

  			// Array contains an actual reference to the row, so just splice it out.
  			arrRef.splice(arrRef.indexOf(v), 1);

  			// If the leaf now has length 0 and it's not the base array remove it.
  			// TODO

  			return p;
  		};
  	},
  	initial: function (prior, path) {
  		return function (p) {
  			p = prior(p);
  			path(p).nest = [];
  			return p;
  		};
  	}
  };

  var nest = reductio_nest;

  var reductio_alias = {
  	initial: function(prior, path, obj) {
  		return function (p) {
  			if(prior) p = prior(p);
  			function buildAliasFunction(key){
  				return function(){
  					return obj[key](path(p));
  				};
  			}
  			for(var prop in obj) {
  				path(p)[prop] = buildAliasFunction(prop);
  			}
  			return p;
  		};
  	}
  };

  var alias = reductio_alias;

  var reductio_alias_prop = {
  	add: function (obj, prior, path) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			for(var prop in obj) {
  				path(p)[prop] = obj[prop](path(p),v);
  			}
  			return p;
  		};
  	}
  };

  var aliasProp = reductio_alias_prop;

  var reductio_data_list = {
  	add: function(a, prior, path) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			path(p).dataList.push(v);
  			return p;
  		};
  	},
  	remove: function(a, prior, path) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			path(p).dataList.splice(path(p).dataList.indexOf(v), 1);
  			return p;
  		};
  	},
  	initial: function(prior, path) {
  		return function (p) {
  			if(prior) p = prior(p);
  			path(p).dataList = [];
  			return p;
  		};
  	}
  };

  var dataList = reductio_data_list;

  var reductio_custom = {
  	add: function(prior, path, addFn) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			return addFn(p, v);
  		};
  	},
  	remove: function(prior, path, removeFn) {
  		return function (p, v, nf) {
  			if(prior) prior(p, v, nf);
  			return removeFn(p, v);
  		};
  	},
  	initial: function(prior, path, initialFn) {
  		return function (p) {	
  			if(prior) p = prior(p);
  			return initialFn(p);
  		};
  	}
  };

  var custom = reductio_custom;

  function build_function(p, f, path) {
  	// We have to build these functions in order. Eventually we can include dependency
  	// information and create a dependency graph if the process becomes complex enough.

  	if(!path) path = function (d) { return d; };

  	// Keep track of the original reducers so that filtering can skip back to
  	// them if this particular value is filtered out.
  	var origF = {
  		reduceAdd: f.reduceAdd,
  		reduceRemove: f.reduceRemove,
  		reduceInitial: f.reduceInitial
  	};

  	if(p.count || p.std) {
      f.reduceAdd = count.add(f.reduceAdd, path, p.count);
      f.reduceRemove = count.remove(f.reduceRemove, path, p.count);
      f.reduceInitial = count.initial(f.reduceInitial, path, p.count);
  	}

  	if(p.sum) {
  		f.reduceAdd = sum.add(p.sum, f.reduceAdd, path);
  		f.reduceRemove = sum.remove(p.sum, f.reduceRemove, path);
  		f.reduceInitial = sum.initial(f.reduceInitial, path);
  	}

  	if(p.avg) {
  		if(!p.count || !p.sum) {
  			console.error("You must set .count(true) and define a .sum(accessor) to use .avg(true).");
  		} else {
  			f.reduceAdd = avg.add(p.sum, f.reduceAdd, path);
  			f.reduceRemove = avg.remove(p.sum, f.reduceRemove, path);
  			f.reduceInitial = avg.initial(f.reduceInitial, path);
  		}
  	}

  	// The unique-only reducers come before the value_count reducers. They need to check if
  	// the value is already in the values array on the group. They should only increment/decrement
  	// counts if the value not in the array or the count on the value is 0.
  	if(p.exceptionCount) {
  		if(!p.exceptionAccessor) {
  			console.error("You must define an .exception(accessor) to use .exceptionCount(true).");
  		} else {
  			f.reduceAdd = exceptionCount.add(p.exceptionAccessor, f.reduceAdd, path);
  			f.reduceRemove = exceptionCount.remove(p.exceptionAccessor, f.reduceRemove, path);
  			f.reduceInitial = exceptionCount.initial(f.reduceInitial, path);
  		}
  	}

  	if(p.exceptionSum) {
  		if(!p.exceptionAccessor) {
  			console.error("You must define an .exception(accessor) to use .exceptionSum(accessor).");
  		} else {
  			f.reduceAdd = exceptionSum.add(p.exceptionAccessor, p.exceptionSum, f.reduceAdd, path);
  			f.reduceRemove = exceptionSum.remove(p.exceptionAccessor, p.exceptionSum, f.reduceRemove, path);
  			f.reduceInitial = exceptionSum.initial(f.reduceInitial, path);
  		}
  	}

  	// Maintain the values array.
  	if(p.valueList || p.median || p.min || p.max) {
  		f.reduceAdd = valueList.add(p.valueList, f.reduceAdd, path);
  		f.reduceRemove = valueList.remove(p.valueList, f.reduceRemove, path);
  		f.reduceInitial = valueList.initial(f.reduceInitial, path);
  	}

  	// Maintain the data array.
  	if(p.dataList) {
  		f.reduceAdd = dataList.add(p.dataList, f.reduceAdd, path);
  		f.reduceRemove = dataList.remove(p.dataList, f.reduceRemove, path);
  		f.reduceInitial = dataList.initial(f.reduceInitial, path);
  	}

  	if(p.median) {
  		f.reduceAdd = median.add(f.reduceAdd, path);
  		f.reduceRemove = median.remove(f.reduceRemove, path);
  		f.reduceInitial = median.initial(f.reduceInitial, path);
  	}

  	if(p.min) {
  		f.reduceAdd = min.add(f.reduceAdd, path);
  		f.reduceRemove = min.remove(f.reduceRemove, path);
  		f.reduceInitial = min.initial(f.reduceInitial, path);
  	}

  	if(p.max) {
  		f.reduceAdd = max.add(f.reduceAdd, path);
  		f.reduceRemove = max.remove(f.reduceRemove, path);
  		f.reduceInitial = max.initial(f.reduceInitial, path);
  	}

  	// Maintain the values count array.
  	if(p.exceptionAccessor) {
  		f.reduceAdd = valueCount.add(p.exceptionAccessor, f.reduceAdd, path);
  		f.reduceRemove = valueCount.remove(p.exceptionAccessor, f.reduceRemove, path);
  		f.reduceInitial = valueCount.initial(f.reduceInitial, path);
  	}

  	// Histogram
  	if(p.histogramValue && p.histogramThresholds) {
  		f.reduceAdd = histogram.add(p.histogramValue, f.reduceAdd, path);
  		f.reduceRemove = histogram.remove(p.histogramValue, f.reduceRemove, path);
  		f.reduceInitial = histogram.initial(p.histogramThresholds ,f.reduceInitial, path);
  	}

  	// Sum of Squares
  	if(p.sumOfSquares) {
  		f.reduceAdd = sumOfSquares.add(p.sumOfSquares, f.reduceAdd, path);
  		f.reduceRemove = sumOfSquares.remove(p.sumOfSquares, f.reduceRemove, path);
  		f.reduceInitial = sumOfSquares.initial(f.reduceInitial, path);
  	}

  	// Standard deviation
  	if(p.std) {
  		if(!p.sumOfSquares || !p.sum) {
  			console.error("You must set .sumOfSq(accessor) and define a .sum(accessor) to use .std(true). Or use .std(accessor).");
  		} else {
  			f.reduceAdd = std.add(f.reduceAdd, path);
  			f.reduceRemove = std.remove(f.reduceRemove, path);
  			f.reduceInitial = std.initial(f.reduceInitial, path);
  		}
  	}

  	// Custom reducer defined by 3 functions : add, remove, initial
  	if (p.custom) {
  		f.reduceAdd = custom.add(f.reduceAdd, path, p.custom.add);
  		f.reduceRemove = custom.remove(f.reduceRemove, path, p.custom.remove);
  		f.reduceInitial = custom.initial(f.reduceInitial, path, p.custom.initial);
  	}

  	// Nesting
  	if(p.nestKeys) {
  		f.reduceAdd = nest.add(p.nestKeys, f.reduceAdd, path);
  		f.reduceRemove = nest.remove(p.nestKeys, f.reduceRemove, path);
  		f.reduceInitial = nest.initial(f.reduceInitial, path);
  	}

  	// Alias functions
  	if(p.aliasKeys) {
  		f.reduceInitial = alias.initial(f.reduceInitial, path, p.aliasKeys);
  	}

  	// Alias properties - this is less efficient than alias functions
  	if(p.aliasPropKeys) {
  		f.reduceAdd = aliasProp.add(p.aliasPropKeys, f.reduceAdd, path);
  		// This isn't a typo. The function is the same for add/remove.
  		f.reduceRemove = aliasProp.add(p.aliasPropKeys, f.reduceRemove, path);
  	}

  	// Filters determine if our built-up priors should run, or if it should skip
  	// back to the filters given at the beginning of this build function.
  	if (p.filter) {
  		f.reduceAdd = filter$1.add(p.filter, f.reduceAdd, origF.reduceAdd, path);
  		f.reduceRemove = filter$1.remove(p.filter, f.reduceRemove, origF.reduceRemove, path);
  	}

  	// Values go last.
  	if(p.values) {
  		Object.getOwnPropertyNames(p.values).forEach(function(n) {
  			// Set up the path on each group.
  			var setupPath = function(prior) {
  				return function (p) {
  					p = prior(p);
  					path(p)[n] = {};
  					return p;
  				};
  			};
  			f.reduceInitial = setupPath(f.reduceInitial);
  			build_function(p.values[n].parameters, f, function (p) { return p[n]; });
  		});
  	}
  }

  var reductio_build = {
  	build: build_function
  };

  var build = reductio_build;

  var reductio_parameters = function() {
  	return {
  		order: false,
  		avg: false,
  		count: false,
  		sum: false,
  		exceptionAccessor: false,
  		exceptionCount: false,
  		exceptionSum: false,
  		filter: false,
  		valueList: false,
  		median: false,
  		histogramValue: false,
  		min: false,
  		max: false,
  		histogramThresholds: false,
  		std: false,
  		sumOfSquares: false,
  		values: false,
  		nestKeys: false,
  		aliasKeys: false,
  		aliasPropKeys: false,
  		groupAll: false,
  		dataList: false,
  		custom: false
  	};
  };

  var parameters = reductio_parameters;

  function assign$1(target) {
  	if (target == null) {
  		throw new TypeError('Cannot convert undefined or null to object');
  	}

  	var output = Object(target);
  	for (var index = 1; index < arguments.length; ++index) {
  		var source = arguments[index];
  		if (source != null) {
  			for (var nextKey in source) {
  				if(source.hasOwnProperty(nextKey)) {
  					output[nextKey] = source[nextKey];
  				}
  			}
  		}
  	}
  	return output;
  }
  function accessor_build(obj, p) {
  	// obj.order = function(value) {
  	// 	if (!arguments.length) return p.order;
  	// 	p.order = value;
  	// 	return obj;
  	// };

  	// Converts a string to an accessor function
  	function accessorify(v) {
  		if( typeof v === 'string' ) {
  			// Rewrite to a function
  			var tempValue = v;
  			var func = function (d) { return d[tempValue]; };
  			return func;
  		} else {
  			return v;
  		}
  	}

  	// Converts a string to an accessor function
  	function accessorifyNumeric(v) {
  		if( typeof v === 'string' ) {
  			// Rewrite to a function
  			var tempValue = v;
  			var func = function (d) { return +d[tempValue]; };
  			return func;
  		} else {
  			return v;
  		}
  	}

  	obj.fromObject = function(value) {
  		if(!arguments.length) return p;
  		assign$1(p, value);
  		return obj;
  	};

  	obj.toObject = function() {
  		return p;
  	};

  	obj.count = function(value, propName) {
  		if (!arguments.length) return p.count;
      if (!propName) {
        propName = 'count';
      }
  		p.count = propName;
  		return obj;
  	};

  	obj.sum = function(value) {
  		if (!arguments.length) return p.sum;

  		value = accessorifyNumeric(value);

  		p.sum = value;
  		return obj;
  	};

  	obj.avg = function(value) {
  		if (!arguments.length) return p.avg;

  		value = accessorifyNumeric(value);

  		// We can take an accessor function, a boolean, or a string
  		if( typeof value === 'function' ) {
  			if(p.sum && p.sum !== value) console.warn('SUM aggregation is being overwritten by AVG aggregation');
  			p.sum = value;
  			p.avg = true;
  			p.count = 'count';
  		} else {
  			p.avg = value;
  		}
  		return obj;
  	};

  	obj.exception = function(value) {
  		if (!arguments.length) return p.exceptionAccessor;

  		value = accessorify(value);

  		p.exceptionAccessor = value;
  		return obj;
  	};

  	obj.filter = function(value) {
  		if (!arguments.length) return p.filter;
  		p.filter = value;
  		return obj;
  	};

  	obj.valueList = function(value) {
  		if (!arguments.length) return p.valueList;

  		value = accessorify(value);

  		p.valueList = value;
  		return obj;
  	};

  	obj.median = function(value) {
  		if (!arguments.length) return p.median;

  		value = accessorifyNumeric(value);

  		if(typeof value === 'function') {
  			if(p.valueList && p.valueList !== value) console.warn('VALUELIST accessor is being overwritten by median aggregation');
  			p.valueList = value;
  		}
  		p.median = value;
  		return obj;
  	};

  	obj.min = function(value) {
  		if (!arguments.length) return p.min;

  		value = accessorifyNumeric(value);

  		if(typeof value === 'function') {
  			if(p.valueList && p.valueList !== value) console.warn('VALUELIST accessor is being overwritten by min aggregation');
  			p.valueList = value;
  		}
  		p.min = value;
  		return obj;
  	};

  	obj.max = function(value) {
  		if (!arguments.length) return p.max;

  		value = accessorifyNumeric(value);

  		if(typeof value === 'function') {
  			if(p.valueList && p.valueList !== value) console.warn('VALUELIST accessor is being overwritten by max aggregation');
  			p.valueList = value;
  		}
  		p.max = value;
  		return obj;
  	};

  	obj.exceptionCount = function(value) {
  		if (!arguments.length) return p.exceptionCount;

  		value = accessorify(value);

  		if( typeof value === 'function' ) {
  			if(p.exceptionAccessor && p.exceptionAccessor !== value) console.warn('EXCEPTION accessor is being overwritten by exception count aggregation');
  			p.exceptionAccessor = value;
  			p.exceptionCount = true;
  		} else {
  			p.exceptionCount = value;
  		}
  		return obj;
  	};

  	obj.exceptionSum = function(value) {
  		if (!arguments.length) return p.exceptionSum;

  		value = accessorifyNumeric(value);

  		p.exceptionSum = value;
  		return obj;
  	};

  	obj.histogramValue = function(value) {
  		if (!arguments.length) return p.histogramValue;

  		value = accessorifyNumeric(value);

  		p.histogramValue = value;
  		return obj;
  	};

  	obj.histogramBins = function(value) {
  		if (!arguments.length) return p.histogramThresholds;
  		p.histogramThresholds = value;
  		return obj;
  	};

  	obj.std = function(value) {
  		if (!arguments.length) return p.std;

  		value = accessorifyNumeric(value);

  		if(typeof(value) === 'function') {
  			p.sumOfSquares = value;
  			p.sum = value;
  			p.count = 'count';
  			p.std = true;
  		} else {
  			p.std = value;
  		}
  		return obj;
  	};

  	obj.sumOfSq = function(value) {
  		if (!arguments.length) return p.sumOfSquares;

  		value = accessorifyNumeric(value);

  		p.sumOfSquares = value;
  		return obj;
  	};

  	obj.value = function(value, accessor) {
  		if (!arguments.length || typeof value !== 'string' ) {
  			console.error("'value' requires a string argument.");
  		} else {
  			if(!p.values) p.values = {};
  			p.values[value] = {};
  			p.values[value].parameters = parameters();
  			accessor_build(p.values[value], p.values[value].parameters);
  			if(accessor) p.values[value].accessor = accessor;
  			return p.values[value];
  		}
  	};

  	obj.nest = function(keyAccessorArray) {
  		if(!arguments.length) return p.nestKeys;

  		keyAccessorArray.map(accessorify);

  		p.nestKeys = keyAccessorArray;
  		return obj;
  	};

  	obj.alias = function(propAccessorObj) {
  		if(!arguments.length) return p.aliasKeys;
  		p.aliasKeys = propAccessorObj;
  		return obj;
  	};

  	obj.aliasProp = function(propAccessorObj) {
  		if(!arguments.length) return p.aliasPropKeys;
  		p.aliasPropKeys = propAccessorObj;
  		return obj;
  	};

  	obj.groupAll = function(groupTest) {
  		if(!arguments.length) return p.groupAll;
  		p.groupAll = groupTest;
  		return obj;
  	};

  	obj.dataList = function(value) {
  		if (!arguments.length) return p.dataList;
  		p.dataList = value;
  		return obj;
  	};

  	obj.custom = function(addRemoveInitialObj) {
  		if (!arguments.length) return p.custom;
  		p.custom = addRemoveInitialObj;
  		return obj;
  	};

  }

  var reductio_accessors = {
  	build: accessor_build
  };

  var accessors = reductio_accessors;

  function postProcess(reductio) {
      return function (group, p, f) {
          group.post = function(){
              var postprocess = function () {
                  return postprocess.all();
              };
              postprocess.all = function () {
                  return group.all();
              };
              var postprocessors = reductio.postprocessors;
              Object.keys(postprocessors).forEach(function (name) {
                  postprocess[name] = function () {
                      var _all = postprocess.all;
                      var args = [].slice.call(arguments);
                      postprocess.all = function () {
                          return postprocessors[name](_all, f, p).apply(null, args);
                      };
                      return postprocess;
                  };
              });
              return postprocess;
          };
      };
  }

  var postprocess = postProcess;

  var pluck = function(n){
      return function(d){
          return d[n];
      };
  };

  // supported operators are sum, avg, and count
  const _grouper = function(path, prior){
      if(!path) path = function(d){return d;};
      return function(p, v){
          if(prior) prior(p, v);
          var x = path(p), y = path(v);
          if(typeof y.count !== 'undefined') x.count += y.count;
          if(typeof y.sum !== 'undefined') x.sum += y.sum;
          if(typeof y.avg !== 'undefined') x.avg = x.sum/x.count;
          return p;
      };
  };

  const reductio_cap = function (prior, f, p) {
      var obj = f.reduceInitial();
      // we want to support values so we'll need to know what those are
      var values = p.values ? Object.keys(p.values) : [];
      var _othersGrouper = _grouper();
      if (values.length) {
          for (var i = 0; i < values.length; ++i) {
              _othersGrouper = _grouper(pluck(values[i]), _othersGrouper);
          }
      }
      return function (cap, othersName) {
          if (!arguments.length) return prior();
          if( cap === Infinity || !cap ) return prior();
          var all = prior();
          var slice_idx = cap-1;
          if(all.length <= cap) return all;
          var data = all.slice(0, slice_idx);
          var others = {key: othersName || 'Others'};
          others.value = f.reduceInitial();
          for (var i = slice_idx; i < all.length; ++i) {
              _othersGrouper(others.value, all[i].value);
          }
          data.push(others);
          return data;
      };
  };

  var cap = reductio_cap;

  var pluck_n = function (n) {
      if (typeof n === 'function') {
          return n;
      }
      if (~n.indexOf('.')) {
          var split = n.split('.');
          return function (d) {
              return split.reduce(function (p, v) {
                  return p[v];
              }, d);
          };
      }
      return function (d) {
          return d[n];
      };
  };

  function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  var comparer = function (accessor, ordering) {
      return function (a, b) {
          return ordering(accessor(a), accessor(b));
      };
  };

  var sortBy$1 = function (prior) {
      return function (value, order) {
          if (arguments.length === 1) {
              order = ascending;
          }
          return prior().sort(comparer(pluck_n(value), order));
      };
  };

  var postprocessors = function(reductio){
      reductio.postprocessors = {};
      reductio.registerPostProcessor = function(name, func){
          reductio.postprocessors[name] = func;
      };

      reductio.registerPostProcessor('cap', cap);
      reductio.registerPostProcessor('sortBy', sortBy$1);
  };

  var reductio_postprocess = postprocess;


  function reductio() {
  	var parameters$$1 = parameters();

  	var funcs = {};

  	function my(group) {
  		// Start fresh each time.
  		funcs = {
  			reduceAdd: function(p) { return p; },
  			reduceRemove: function(p) { return p; },
  			reduceInitial: function () { return {}; },
  		};

  		build.build(parameters$$1, funcs);

  		// If we're doing groupAll
  		if(parameters$$1.groupAll) {
  			if(group.top) {
  				console.warn("'groupAll' is defined but attempting to run on a standard dimension.group(). Must run on dimension.groupAll().");
  			} else {
  				var bisect = crossfilter2.bisect.by(function(d) { return d.key; }).left;
  				var i, j;
  				var keys;
          var keysLength;
          var k; // Key
  				group.reduce(
  					function(p, v, nf) {
  						keys = parameters$$1.groupAll(v);
              keysLength = keys.length;
              for(j=0;j<keysLength;j++) {
                k = keys[j];
                i = bisect(p, k, 0, p.length);
  							if(!p[i] || p[i].key !== k) {
  								// If the group doesn't yet exist, create it first.
  								p.splice(i, 0, { key: k, value: funcs.reduceInitial() });
  							}

  							// Then pass the record and the group value to the reducers
  							funcs.reduceAdd(p[i].value, v, nf);
              }
  						return p;
  					},
  					function(p, v, nf) {
  						keys = parameters$$1.groupAll(v);
              keysLength = keys.length;
              for(j=0;j<keysLength;j++) {
                i = bisect(p, keys[j], 0, p.length);
  							// The group should exist or we're in trouble!
  							// Then pass the record and the group value to the reducers
  							funcs.reduceRemove(p[i].value, v, nf);
              }
  						return p;
  					},
  					function() {
  						return [];
  					}
  				);
  				if(!group.all) {
  					// Add an 'all' method for compatibility with standard Crossfilter groups.
  					group.all = function() { return this.value(); };
  				}
  			}
  		} else {
  			group.reduce(funcs.reduceAdd, funcs.reduceRemove, funcs.reduceInitial);
  		}

  		reductio_postprocess(group, parameters$$1, funcs);

  		return group;
  	}

  	accessors.build(my, parameters$$1);

  	return my;
  }

  postprocessors(reductio);
  reductio_postprocess = reductio_postprocess(reductio);

  var reductio_1 = reductio;

  // var _ = require('./lodash') // _ is defined but never used

  var reductioAggregators = {
    shorthandLabels: {
      $count: 'count',
      $sum: 'sum',
      $avg: 'avg',
      $min: 'min',
      $max: 'max',
      $med: 'med',
      $sumSq: 'sumSq',
      $std: 'std',
    },
    aggregators: {
      $count: $count$1,
      $sum: $sum$1,
      $avg: $avg$1,
      $min: $min$1,
      $max: $max$1,
      $med: $med,
      $sumSq: $sumSq,
      $std: $std,
      $valueList: $valueList,
      $dataList: $dataList,
    },
  };

  // Aggregators

  function $count$1(reducer/* , value */) {
    return reducer.count(true)
  }

  function $sum$1(reducer, value) {
    return reducer.sum(value)
  }

  function $avg$1(reducer, value) {
    return reducer.avg(value)
  }

  function $min$1(reducer, value) {
    return reducer.min(value)
  }

  function $max$1(reducer, value) {
    return reducer.max(value)
  }

  function $med(reducer, value) {
    return reducer.median(value)
  }

  function $sumSq(reducer, value) {
    return reducer.sumOfSq(value)
  }

  function $std(reducer, value) {
    return reducer.std(value)
  }

  function $valueList(reducer, value) {
    return reducer.valueList(value)
  }

  function $dataList(reducer/* , value */) {
    return reducer.dataList(true)
  }

  // var expressions = require('./expressions')  // exporession is defined but never used


  var reductiofy = function (service) {
    var filters$$1 = filters(service);

    return function reductiofy(query) {
      var reducer = reductio_1();
      // var groupBy = query.groupBy // groupBy is defined but never used
      aggregateOrNest(reducer, query.select);

      if (query.filter) {
        var filterFunction = filters$$1.makeFunction(query.filter);
        if (filterFunction) {
          reducer.filter(filterFunction);
        }
      }

      return Promise.resolve(reducer)

      // This function recursively find the first level of reductio methods in
      // each object and adds that reduction method to reductio
      function aggregateOrNest(reducer, selects) {
        // Sort so nested values are calculated last by reductio's .value method
        var sortedSelectKeyValue = lodash.sortBy(
          lodash.map(selects, function (val, key) {
            return {
              key: key,
              value: val,
            }
          }),
          function (s) {
            if (reductioAggregators.aggregators[s.key]) {
              return 0
            }
            return 1
          });

        // dive into each key/value
        return lodash.forEach(sortedSelectKeyValue, function (s) {
          // Found a Reductio Aggregation
          if (reductioAggregators.aggregators[s.key]) {
            // Build the valueAccessorFunction
            var accessor = aggregation.makeValueAccessor(s.value);
            // Add the reducer with the ValueAccessorFunction to the reducer
            reducer = reductioAggregators.aggregators[s.key](reducer, accessor);
            return
          }

          // Found a top level key value that is not an aggregation or a
          // nested object. This is unacceptable.
          if (!lodash.isObject(s.value)) {
            console.error('Nested selects must be an object', s.key);
            return
          }

          // It's another nested object, so just repeat this process on it
          aggregateOrNest(reducer.value(s.key), s.value);
        })
      }
    }
  };

  var postAggregation = function (/* service */) {
    return {
      post: post,
      sortByKey: sortByKey,
      limit: limit,
      squash: squash,
      change: change,
      changeMap: changeMap,
    }

    function post(query, parent, cb) {
      query.data = cloneIfLocked(parent);
      return Promise.resolve(cb(query, parent))
    }

    function sortByKey(query, parent, desc) {
      query.data = cloneIfLocked(parent);
      query.data = lodash.sortBy(query.data, function (d) {
        return d.key
      });
      if (desc) {
        query.data.reverse();
      }
    }

    // Limit results to n, or from start to end
    function limit(query, parent, start, end) {
      query.data = cloneIfLocked(parent);
      if (lodash.isUndefined(end)) {
        end = start || 0;
        start = 0;
      } else {
        start = start || 0;
        end = end || query.data.length;
      }
      query.data = query.data.splice(start, end - start);
    }

    // Squash results to n, or from start to end
    function squash(query, parent, start, end, aggObj, label) {
      query.data = cloneIfLocked(parent);
      start = start || 0;
      end = end || query.data.length;
      var toSquash = query.data.splice(start, end - start);
      var squashed = {
        key: label || 'Other',
        value: {},
      };
      lodash.recurseObject(aggObj, function (val, key, path) {
        var items = [];
        lodash.forEach(toSquash, function (record) {
          items.push(lodash.get(record.value, path));
        });
        lodash.set(squashed.value, path, aggregation.aggregators[val](items));
      });
      query.data.splice(start, 0, squashed);
    }

    function change(query, parent, start, end, aggObj) {
      query.data = cloneIfLocked(parent);
      start = start || 0;
      end = end || query.data.length;
      var obj = {
        key: [query.data[start].key, query.data[end].key],
        value: {},
      };
      lodash.recurseObject(aggObj, function (val, key, path) {
        var changePath = lodash.clone(path);
        changePath.pop();
        changePath.push(key + 'Change');
        lodash.set(obj.value, changePath, lodash.get(query.data[end].value, path) - lodash.get(query.data[start].value, path));
      });
      query.data = obj;
    }

    function changeMap(query, parent, aggObj, defaultNull) {
      defaultNull = lodash.isUndefined(defaultNull) ? 0 : defaultNull;
      query.data = cloneIfLocked(parent);
      lodash.recurseObject(aggObj, function (val, key, path) {
        var changePath = lodash.clone(path);
        var fromStartPath = lodash.clone(path);
        var fromEndPath = lodash.clone(path);

        changePath.pop();
        fromStartPath.pop();
        fromEndPath.pop();

        changePath.push(key + 'Change');
        fromStartPath.push(key + 'ChangeFromStart');
        fromEndPath.push(key + 'ChangeFromEnd');

        var start = lodash.get(query.data[0].value, path, defaultNull);
        var end = lodash.get(query.data[query.data.length - 1].value, path, defaultNull);

        lodash.forEach(query.data, function (record, i) {
          var previous = query.data[i - 1] || query.data[0];
          lodash.set(query.data[i].value, changePath, lodash.get(record.value, path, defaultNull) - (previous ? lodash.get(previous.value, path, defaultNull) : defaultNull));
          lodash.set(query.data[i].value, fromStartPath, lodash.get(record.value, path, defaultNull) - start);
          lodash.set(query.data[i].value, fromEndPath, lodash.get(record.value, path, defaultNull) - end);
        });
      });
    }
  };

  function cloneIfLocked(parent) {
    return parent.locked ? lodash.clone(parent.data) : parent.data
  }

  var query = function (service) {
    var reductiofy$$1 = reductiofy(service);
    var filters$$1 = filters(service);
    var postAggregation$$1 = postAggregation(service);

    var postAggregationMethods = lodash.keys(postAggregation$$1);

    return function doQuery(queryObj) {
      var queryHash = JSON.stringify(queryObj);

      // Attempt to reuse an exact copy of this query that is present elsewhere
      for (var i = 0; i < service.columns.length; i++) {
        for (var j = 0; j < service.columns[i].queries.length; j++) {
          if (service.columns[i].queries[j].hash === queryHash) {
            return new Promise(function (resolve, reject) { // eslint-disable-line no-loop-func
              try {
                resolve(service.columns[i].queries[j]);
              } catch (err) {
                reject(err);
              }
            })
          }
        }
      }

      var query = {
        // Original query passed in to query method
        original: queryObj,
        hash: queryHash,
      };

      // Default queryObj
      if (lodash.isUndefined(query.original)) {
        query.original = {};
      }
      // Default select
      if (lodash.isUndefined(query.original.select)) {
        query.original.select = {
          $count: true,
        };
      }
      // Default to groupAll
      query.original.groupBy = query.original.groupBy || true;

      // Attach the query api to the query object
      query = newQueryObj(query);

      return createColumn(query)
        .then(makeCrossfilterGroup)
        .then(buildRequiredColumns)
        .then(setupDataListeners)
        .then(applyQuery)

      function createColumn(query) {
        // Ensure column is created
        return service.column({
          key: query.original.groupBy,
          type: lodash.isUndefined(query.type) ? null : query.type,
          array: Boolean(query.array),
        })
          .then(function () {
          // Attach the column to the query
            var column = service.column.find(query.original.groupBy);
            query.column = column;
            column.queries.push(query);
            column.removeListeners.push(function () {
              return query.clear()
            });
            return query
          })
      }

      function makeCrossfilterGroup(query) {
        // Create the grouping on the columns dimension
        // Using Promise Resolve allows support for crossfilter async
        // TODO check if query already exists, and use the same base query // if possible
        return Promise.resolve(query.column.dimension.group())
          .then(function (g) {
            query.group = g;
            return query
          })
      }

      function buildRequiredColumns(query) {
        var requiredColumns = filters$$1.scanForDynamicFilters(query.original);
        // We need to scan the group for any filters that would require
        // the group to be rebuilt when data is added or removed in any way.
        if (requiredColumns.length) {
          return Promise.all(lodash.map(requiredColumns, function (columnKey) {
            return service.column({
              key: columnKey,
              dynamicReference: query.group,
            })
          }))
            .then(function () {
              return query
            })
        }
        return query
      }

      function setupDataListeners(query) {
        // Here, we create a listener to recreate and apply the reducer to
        // the group anytime underlying data changes
        var stopDataListen = service.onDataChange(function () {
          return applyQuery(query)
        });
        query.removeListeners.push(stopDataListen);

        // This is a similar listener for filtering which will (if needed)
        // run any post aggregations on the data after each filter action
        var stopFilterListen = service.onFilter(function () {
          return postAggregate(query)
        });
        query.removeListeners.push(stopFilterListen);

        return query
      }

      function applyQuery(query) {
        return buildReducer(query)
          .then(applyReducer)
          .then(attachData)
          .then(postAggregate)
      }

      function buildReducer(query) {
        return reductiofy$$1(query.original)
          .then(function (reducer) {
            query.reducer = reducer;
            return query
          })
      }

      function applyReducer(query) {
        return Promise.resolve(query.reducer(query.group))
          .then(function () {
            return query
          })
      }

      function attachData(query) {
        return Promise.resolve(query.group.all())
          .then(function (data) {
            query.data = data;
            return query
          })
      }

      function postAggregate(query) {
        if (query.postAggregations.length > 1) {
          // If the query is used by 2+ post aggregations, we need to lock
          // it against getting mutated by the post-aggregations
          query.locked = true;
        }
        return Promise.all(lodash.map(query.postAggregations, function (post) {
          return post()
        }))
          .then(function () {
            return query
          })
      }

      function newQueryObj(q, parent) {
        var locked = false;
        if (!parent) {
          parent = q;
          q = {};
          locked = true;
        }

        // Assign the regular query properties
        lodash.assign(q, {
          // The Universe for continuous promise chaining
          universe: service,
          // Crossfilter instance
          crossfilter: service.cf,

          // parent Information
          parent: parent,
          column: parent.column,
          dimension: parent.dimension,
          group: parent.group,
          reducer: parent.reducer,
          original: parent.original,
          hash: parent.hash,
          // array: parent.original.array,

          // It's own removeListeners
          removeListeners: [],

          // It's own postAggregations
          postAggregations: [],

          // Data method
          locked: locked,
          lock: lock,
          unlock: unlock,
          // Disposal method
          clear: clearQuery,
        });

        lodash.forEach(postAggregationMethods, function (method) {
          q[method] = postAggregateMethodWrap(postAggregation$$1[method]);
        });

        return q

        function lock(set) {
          if (!lodash.isUndefined(set)) {
            q.locked = Boolean(set);
            return
          }
          q.locked = true;
        }

        function unlock() {
          q.locked = false;
        }

        function clearQuery() {
          lodash.forEach(q.removeListeners, function (l) {
            l();
          });
          return new Promise(function (resolve, reject) {
            try {
              resolve(q.group.dispose());
            } catch (err) {
              reject(err);
            }
          })
            .then(function () {
              q.column.queries.splice(q.column.queries.indexOf(q), 1);
              // Automatically recycle the column if there are no queries active on it
              if (!q.column.queries.length) {
                return service.clear(q.column.key)
              }
            })
            .then(function () {
              return service
            })
        }

        function postAggregateMethodWrap(postMethod) {
          return function () {
            var args = Array.prototype.slice.call(arguments);
            var sub = {};
            newQueryObj(sub, q);
            args.unshift(sub, q);

            q.postAggregations.push(function () {
              Promise.resolve(postMethod.apply(null, args))
                .then(postAggregateChildren);
            });

            return Promise.resolve(postMethod.apply(null, args))
              .then(postAggregateChildren)

            function postAggregateChildren() {
              return postAggregate(sub)
                .then(function () {
                  return sub
                })
            }
          }
        }
      }
    }
  };

  var clear = function(service) {
    return function clear(def) {
      // Clear a single or multiple column definitions
      if (def) {
        def = lodash.isArray(def) ? def : [def];
      }

      if (!def) {
        // Clear all of the column defenitions
        return Promise.all(
          lodash.map(service.columns, disposeColumn)
        ).then(function() {
          service.columns = [];
          return service
        })
      }

      return Promise.all(
        lodash.map(def, function(d) {
          if (lodash.isObject(d)) {
            d = d.key;
          }
          // Clear the column
          var column = lodash.remove(service.columns, function(c) {
            if (lodash.isArray(d)) {
              return !lodash.xor(c.key, d).length
            }
            if (c.key === d) {
              if (c.dynamicReference) {
                return false
              }
              return true
            }
          })[0];

          if (!column) {
            // console.info('Attempted to clear a column that is required for another query!', c)
            return
          }

          disposeColumn(column);
        })
      ).then(function() {
        return service
      })

      function disposeColumn(column) {
        var disposalActions = [];
        // Dispose the dimension
        if (column.removeListeners) {
          disposalActions = lodash.map(column.removeListeners, function(listener) {
            return Promise.resolve(listener())
          });
        }
        var filterKey = column.key;
        if (column.complex === 'array') {
          filterKey = JSON.stringify(column.key);
        }
        if (column.complex === 'function') {
          filterKey = column.key.toString();
        }
        delete service.filters[filterKey];
        if (column.dimension) {
          disposalActions.push(Promise.resolve(column.dimension.dispose()));
        }
        return Promise.all(disposalActions)
      }
    }
  };

  // var _ = require('./lodash') // _ is defined but never used

  var destroy = function (service) {
    return function destroy() {
      return service.clear()
        .then(function () {
          service.cf.dataListeners = [];
          service.cf.filterListeners = [];
          return Promise.resolve(service.cf.remove())
        })
        .then(function () {
          return service
        })
    }
  };

  var universe_1 = universe;

  function universe(data, options) {
    var service = {
      options: lodash.assign({}, options),
      columns: [],
      filters: {},
      dataListeners: [],
      filterListeners: [],
    };

    var cf = crossfilter_1$1(service);
    var filters$$1 = filters(service);

    data = cf.generateColumns(data);

    return cf.build(data)
      .then(function (data) {
        service.cf = data;
        return lodash.assign(service, {
          add: cf.add,
          remove: cf.remove,
          column: column(service),
          query: query(service),
          filter: filters$$1.filter,
          filterAll: filters$$1.filterAll,
          applyFilters: filters$$1.applyFilters,
          clear: clear(service),
          destroy: destroy(service),
          onDataChange: onDataChange,
          onFilter: onFilter,
        })
      })

    function onDataChange(cb) {
      service.dataListeners.push(cb);
      return function () {
        service.dataListeners.splice(service.dataListeners.indexOf(cb), 1);
      }
    }

    function onFilter(cb) {
      service.filterListeners.push(cb);
      return function () {
        service.filterListeners.splice(service.filterListeners.indexOf(cb), 1);
      }
    }
  }

  // import Universe from "./node_modules/universe/src/universe.js"

  return universe_1;

})));
