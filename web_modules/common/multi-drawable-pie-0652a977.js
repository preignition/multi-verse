import { dedupingMixin } from '../@polymer/polymer/lib/utils/mixin.js';
import { s as selection } from './index-6ba82f3a.js';
import { s as select, p as pointer, a as selectAll } from './selectAll-d64cc7a5.js';
import { h as html$1 } from './lit-html-f57783b7.js';
import { LitElement, css } from '../lit-element.js';
import { i as interrupt, t as transition } from './index-39b8d771.js';
import { d as defaultValue, a as doNotSetUndefinedValue } from './defaultValueMixin-cb2ff445.js';
import { s as selectMixin, C as CacheId, R as RelayTo } from './cacheIdMixin-1fa4fd13.js';
import { R as Resizable } from './resizable-mixin-496c6a25.js';

/**
 * ## MultiRegister
 * 
 * The responsibility of this mixin is to observe nodes added to `#obseveNodes`. 
 * It adds elements fireing a`multi-register to `_registeredItems` and elements 
 * fireing `multi-serie-register` to `series`.
 * 
 *
 * @memberof MultiChart.mixin
 * @polymer
 * @mixinFunction
 */

const MultiRegister = dedupingMixin(superClass => {

  /*
   * @polymer
   * @mixinClass
   */
  class Register extends superClass {

    static get properties() {

      return {

        ...super.properties,

        /* 
         * `registerContainerName` the name of the container set to registered items. This is needed because
         * some items can be registered agains mutiple domain. For instance, multi-g : as an resizable svg item 
         * and against multi-verse.
         */
        registerContainerName: {
          type: String,
          attribute: 'register-container-name',
          value: 'svgHost'
        },

        /*
         * `subGroup` needed when we want to register child element under a separate group,
         * needed for instance for  multi-container-layer
         */
        subGroup: {
          type: String,
          attribute: 'sub-group'
        },

      };
    }

    /* 
     * `registerEventListen` the name of the event that will trigger 
     * a registration. This event is fired by an element applying 
     * Resiterable Mixin
     *
     */
    get registerEventListen() {
      return 'multi-register'
    }

    /* 
     * `unregisterEventListen` the name of the event that will trigger 
     * a unregistration.
     *
     */
    // get unregisterEventListen() {
    //   return 'multi-unregister'
    // }

    constructor() {
      super();
      this.addEventListener(this.registerEventListen, this._onMultiRegister);
    }

    _registerItem(name, item) {
      if (!this[name]) { this[name] = []; }
      // Note(cg): we remove all elements that have been removed from the dom.
      // we need to have a non mutable fitler
      for (let i = this[name].length - 1; i > -1; i--) {
        if (!this[name][i].isConnected) {this[name].splice(i, 1);}
      }

      if (!this[name].includes(item)) {
        this[name].push(item);
        if (this.onRegister) {
          this.onRegister(item, name);
        }
        if (item.afterRegister) {
          item.afterRegister(this, this.registerContainerName);
        }
      }
    }

    _onMultiRegister(e) {
      this.log && console.info('Register', e, e.composedPath()[0]);
      // Note(cg): only react if group is not set or is the same.
      // 
      // Note(cg): multi-container-layer can register sub-groups.
      const group = this.subGroup || this.group;
      if (e.detail === group) {
        // Note(cg): make sure we are not self-registering
        // (this can be the case for elements that are registerable and also register like multi-container-layer).
        const target = e.composedPath()[0];
        if (target !== this) {
          e.stopPropagation();
          this._registerItem('_registeredItems', target);
          // Note(cg): if data is set before items are registered, they are not drawn.
          // this.debouceRefresh();
        }
      }
    }

    // _onMultiUnregister(e) {
    //   this.log && console.info('Unregister', e, e.composedPath()[0]);
    // }


    unregister(registered) {
      if (this.onUnegister) {
        this.onUnregister(registered);
      }

      if (this._registeredItems && this._registeredItems.filter) {
        this._registeredItems = this._registeredItems.filter(item => item !== registered);
      }

      if (registered.afterUnregister) {
        registered.afterUnregister(this, this.registerContainerName);
      }
    }

    get registeredItems() {
      return this._registeredItems;
    }

    callRegistered(methodName) {
      // we replace `methodName`` with `this host` as the first argument 
      [].splice.call(arguments, 0, 1);
      const args = arguments;

      (this.registeredItems || [])
        .filter(el => {
          return el.isConnected && el[methodName];
        })
        // Note(cg): we make sure that some registered elements (for instance `multi-select`) are called later.
        .sort((a, b) => {
          return a.registerOrder - b.registerOrder;
        })
        .forEach(el => {
          el[methodName].apply(el, args);
        });
    }

  }
  return Register;
});

/**
 * ##  Registerable
 * 
 * Allow component to be registerable by containters that will listen to `multi-register` event
 * 
 * ### Events
 * Fired when the component is attached so that container can register it
 *
 * @event multi-register
 * @param {string} the namee of the curret group.
 *
 * @memberof MultiChart.mixin   
 * @polymer
 * @mixinFunction
 */

const Registerable = superClass => {

  return class extends superClass {

    /* 
     * `registerEventDispatch`  the name of the event to be fired when connected. 
     * A container with multi-register-mixin applied 
     * will listen to this event to register the component.
     *
     */
    get registerEventDispatch() {
      return 'multi-register';
    }

    /* 
     * `unregisterEventDispatch`  the name of the event to be fired when disconnected. 
     *
     */
    // get unregisterEventDispatch() {
    //   return 'multi-unregister';
    // }

    // Note(cg): some registerable (in particular multi-data-group) need to register before
    // Othewise, multi-data-mixin_onMultiRegister fail to correctly proceed with onRegister 
    // as seriGroup do not yet exist.
    get registerAtConnected() {
      return false;
    }

    static get properties() {

      return {

        ...super.properties,

        /*
         * `group` against which the drawable object is registered. 
         * A chart can have multiple group (e.g. one displayed against right axis, 
         * the other against the left axis). 
         * Set another group name for objects belonging to alternate chart settings.
         */
        group: {
          type: String,
          value: 'default'
        },

        /*
         * `multiPosition` position used to re-order items when appended by dispatch-svg
         * nodePosition larger than 0 will render on top. 
         */
        multiPosition: {
          type: Number,
          attribute: 'multi-position',
          value: 0
        },
      };
    }

    /* 
     * `registerOrder` - registerable elements are sorted on the basis of this property. 
     */
    get registerOrder() {
      return 0;
    }

    // Note(cg): we fire under first Updated and not connectedCallback so as to make sure nested slots have had time to 
    // be effective. .
    firstUpdated(props) {
      if (!this.registerAtConnected) {
        this.dispatchEvent(new CustomEvent(this.registerEventDispatch, { detail: this.group, bubbles: true, composed: true }));
      }
      super.firstUpdated(props);
    }

    connectedCallback() {
      super.connectedCallback();
      if (this.registerAtConnected || this._registerableWasDisconnected) {
        delete this._registerableWasDisconnected;
        this.dispatchEvent(new CustomEvent(this.registerEventDispatch, { detail: this.group, bubbles: true, composed: true }));
      }
    }

    disconnectedCallback() {
      // Note(cg): this is already detached from DOM. event will not bubble up.
      // fireing on parentNode.host will 
      // if (this.unregisterEventDispatch && this.parentNode && this.parentNode.host) {
      //   this.parentNode.host.dispatchEvent(new CustomEvent(this.unregisterEventDispatch, { detail: this.group, disconnected: this, bubbles: true, composed: true }));
      // }
      this._registerableWasDisconnected = true;
      this.postRemove && this.postRemove();
      super.disconnectedCallback();
    }
  };
};

function formatDecimal(x) {
  return Math.abs(x = Math.round(x)) >= 1e21
      ? x.toLocaleString("en").replace(/,/g, "")
      : x.toString(10);
}

// Computes the decimal coefficient and exponent of the specified number x with
// significant digits p, where x is positive and p is in [1, 21] or undefined.
// For example, formatDecimalParts(1.23) returns ["123", 0].
function formatDecimalParts(x, p) {
  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
  var i, coefficient = x.slice(0, i);

  // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
  // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x.slice(i + 1)
  ];
}

function exponent(x) {
  return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
}

function formatGroup(grouping, thousands) {
  return function(value, width) {
    var i = value.length,
        t = [],
        j = 0,
        g = grouping[0],
        length = 0;

    while (i > 0 && g > 0) {
      if (length + g + 1 > width) g = Math.max(1, width - length);
      t.push(value.substring(i -= g, i + g));
      if ((length += g + 1) > width) break;
      g = grouping[j = (j + 1) % grouping.length];
    }

    return t.reverse().join(thousands);
  };
}

function formatNumerals(numerals) {
  return function(value) {
    return value.replace(/[0-9]/g, function(i) {
      return numerals[+i];
    });
  };
}

// [[fill]align][sign][symbol][0][width][,][.precision][~][type]
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

function formatSpecifier(specifier) {
  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
  var match;
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10]
  });
}

formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

function FormatSpecifier(specifier) {
  this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
  this.align = specifier.align === undefined ? ">" : specifier.align + "";
  this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
  this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
  this.zero = !!specifier.zero;
  this.width = specifier.width === undefined ? undefined : +specifier.width;
  this.comma = !!specifier.comma;
  this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
  this.trim = !!specifier.trim;
  this.type = specifier.type === undefined ? "" : specifier.type + "";
}

FormatSpecifier.prototype.toString = function() {
  return this.fill
      + this.align
      + this.sign
      + this.symbol
      + (this.zero ? "0" : "")
      + (this.width === undefined ? "" : Math.max(1, this.width | 0))
      + (this.comma ? "," : "")
      + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
      + (this.trim ? "~" : "")
      + this.type;
};

// Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
function formatTrim(s) {
  out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
    switch (s[i]) {
      case ".": i0 = i1 = i; break;
      case "0": if (i0 === 0) i0 = i; i1 = i; break;
      default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
    }
  }
  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}

var prefixExponent;

function formatPrefixAuto(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d) return x + "";
  var coefficient = d[0],
      exponent = d[1],
      i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
      n = coefficient.length;
  return i === n ? coefficient
      : i > n ? coefficient + new Array(i - n + 1).join("0")
      : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
      : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
}

function formatRounded(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d) return x + "";
  var coefficient = d[0],
      exponent = d[1];
  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
      : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
      : coefficient + new Array(exponent - coefficient.length + 2).join("0");
}

var formatTypes = {
  "%": (x, p) => (x * 100).toFixed(p),
  "b": (x) => Math.round(x).toString(2),
  "c": (x) => x + "",
  "d": formatDecimal,
  "e": (x, p) => x.toExponential(p),
  "f": (x, p) => x.toFixed(p),
  "g": (x, p) => x.toPrecision(p),
  "o": (x) => Math.round(x).toString(8),
  "p": (x, p) => formatRounded(x * 100, p),
  "r": formatRounded,
  "s": formatPrefixAuto,
  "X": (x) => Math.round(x).toString(16).toUpperCase(),
  "x": (x) => Math.round(x).toString(16)
};

function identity(x) {
  return x;
}

var map = Array.prototype.map,
    prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

function formatLocale(locale) {
  var group = locale.grouping === undefined || locale.thousands === undefined ? identity : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
      currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
      currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
      decimal = locale.decimal === undefined ? "." : locale.decimal + "",
      numerals = locale.numerals === undefined ? identity : formatNumerals(map.call(locale.numerals, String)),
      percent = locale.percent === undefined ? "%" : locale.percent + "",
      minus = locale.minus === undefined ? "−" : locale.minus + "",
      nan = locale.nan === undefined ? "NaN" : locale.nan + "";

  function newFormat(specifier) {
    specifier = formatSpecifier(specifier);

    var fill = specifier.fill,
        align = specifier.align,
        sign = specifier.sign,
        symbol = specifier.symbol,
        zero = specifier.zero,
        width = specifier.width,
        comma = specifier.comma,
        precision = specifier.precision,
        trim = specifier.trim,
        type = specifier.type;

    // The "n" type is an alias for ",g".
    if (type === "n") comma = true, type = "g";

    // The "" type, and any invalid type, is an alias for ".12~g".
    else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

    // If zero fill is specified, padding goes after sign and before digits.
    if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

    // Compute the prefix and suffix.
    // For SI-prefix, the suffix is lazily computed.
    var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
        suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

    // What format function should we use?
    // Is this an integer type?
    // Can this type generate exponential notation?
    var formatType = formatTypes[type],
        maybeSuffix = /[defgprs%]/.test(type);

    // Set the default precision if not specified,
    // or clamp the specified precision to the supported range.
    // For significant precision, it must be in [1, 21].
    // For fixed precision, it must be in [0, 20].
    precision = precision === undefined ? 6
        : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
        : Math.max(0, Math.min(20, precision));

    function format(value) {
      var valuePrefix = prefix,
          valueSuffix = suffix,
          i, n, c;

      if (type === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;

        // Determine the sign. -0 is not less than 0, but 1 / -0 is!
        var valueNegative = value < 0 || 1 / value < 0;

        // Perform the initial formatting.
        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

        // Trim insignificant zeros.
        if (trim) value = formatTrim(value);

        // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
        if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

        // Compute the prefix and suffix.
        valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
        valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

        // Break the formatted value into the integer “value” part that can be
        // grouped, and fractional or exponential “suffix” part that is not.
        if (maybeSuffix) {
          i = -1, n = value.length;
          while (++i < n) {
            if (c = value.charCodeAt(i), 48 > c || c > 57) {
              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }

      // If the fill character is not "0", grouping is applied before padding.
      if (comma && !zero) value = group(value, Infinity);

      // Compute the padding.
      var length = valuePrefix.length + value.length + valueSuffix.length,
          padding = length < width ? new Array(width - length + 1).join(fill) : "";

      // If the fill character is "0", grouping is applied after padding.
      if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

      // Reconstruct the final output based on the desired alignment.
      switch (align) {
        case "<": value = valuePrefix + value + valueSuffix + padding; break;
        case "=": value = valuePrefix + padding + value + valueSuffix; break;
        case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
        default: value = padding + valuePrefix + value + valueSuffix; break;
      }

      return numerals(value);
    }

    format.toString = function() {
      return specifier + "";
    };

    return format;
  }

  function formatPrefix(specifier, value) {
    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
        e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
        k = Math.pow(10, -e),
        prefix = prefixes[8 + e / 3];
    return function(value) {
      return f(k * value) + prefix;
    };
  }

  return {
    format: newFormat,
    formatPrefix: formatPrefix
  };
}

var locale;
var format;
var formatPrefix;

defaultLocale({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});

function defaultLocale(definition) {
  locale = formatLocale(definition);
  format = locale.format;
  formatPrefix = locale.formatPrefix;
  return locale;
}

function precisionFixed(step) {
  return Math.max(0, -exponent(Math.abs(step)));
}

function precisionPrefix(step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
}

function precisionRound(step, max) {
  step = Math.abs(step), max = Math.abs(max) - step;
  return Math.max(0, exponent(max) - exponent(step)) + 1;
}

var t0 = new Date,
    t1 = new Date;

function newInterval(floori, offseti, count, field) {

  function interval(date) {
    return floori(date = arguments.length === 0 ? new Date : new Date(+date)), date;
  }

  interval.floor = function(date) {
    return floori(date = new Date(+date)), date;
  };

  interval.ceil = function(date) {
    return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
  };

  interval.round = function(date) {
    var d0 = interval(date),
        d1 = interval.ceil(date);
    return date - d0 < d1 - date ? d0 : d1;
  };

  interval.offset = function(date, step) {
    return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
  };

  interval.range = function(start, stop, step) {
    var range = [], previous;
    start = interval.ceil(start);
    step = step == null ? 1 : Math.floor(step);
    if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
    do range.push(previous = new Date(+start)), offseti(start, step), floori(start);
    while (previous < start && start < stop);
    return range;
  };

  interval.filter = function(test) {
    return newInterval(function(date) {
      if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
    }, function(date, step) {
      if (date >= date) {
        if (step < 0) while (++step <= 0) {
          while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
        } else while (--step >= 0) {
          while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
        }
      }
    });
  };

  if (count) {
    interval.count = function(start, end) {
      t0.setTime(+start), t1.setTime(+end);
      floori(t0), floori(t1);
      return Math.floor(count(t0, t1));
    };

    interval.every = function(step) {
      step = Math.floor(step);
      return !isFinite(step) || !(step > 0) ? null
          : !(step > 1) ? interval
          : interval.filter(field
              ? function(d) { return field(d) % step === 0; }
              : function(d) { return interval.count(0, d) % step === 0; });
    };
  }

  return interval;
}

var millisecond = newInterval(function() {
  // noop
}, function(date, step) {
  date.setTime(+date + step);
}, function(start, end) {
  return end - start;
});

// An optimized implementation for this simple case.
millisecond.every = function(k) {
  k = Math.floor(k);
  if (!isFinite(k) || !(k > 0)) return null;
  if (!(k > 1)) return millisecond;
  return newInterval(function(date) {
    date.setTime(Math.floor(date / k) * k);
  }, function(date, step) {
    date.setTime(+date + step * k);
  }, function(start, end) {
    return (end - start) / k;
  });
};

var durationSecond = 1e3;
var durationMinute = 6e4;
var durationHour = 36e5;
var durationDay = 864e5;
var durationWeek = 6048e5;

var second = newInterval(function(date) {
  date.setTime(date - date.getMilliseconds());
}, function(date, step) {
  date.setTime(+date + step * durationSecond);
}, function(start, end) {
  return (end - start) / durationSecond;
}, function(date) {
  return date.getUTCSeconds();
});

var minute = newInterval(function(date) {
  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond);
}, function(date, step) {
  date.setTime(+date + step * durationMinute);
}, function(start, end) {
  return (end - start) / durationMinute;
}, function(date) {
  return date.getMinutes();
});

var hour = newInterval(function(date) {
  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
}, function(date, step) {
  date.setTime(+date + step * durationHour);
}, function(start, end) {
  return (end - start) / durationHour;
}, function(date) {
  return date.getHours();
});

var day = newInterval(
  date => date.setHours(0, 0, 0, 0),
  (date, step) => date.setDate(date.getDate() + step),
  (start, end) => (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay,
  date => date.getDate() - 1
);

function weekday(i) {
  return newInterval(function(date) {
    date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setDate(date.getDate() + step * 7);
  }, function(start, end) {
    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
  });
}

var sunday = weekday(0);
var monday = weekday(1);
var tuesday = weekday(2);
var wednesday = weekday(3);
var thursday = weekday(4);
var friday = weekday(5);
var saturday = weekday(6);

var month = newInterval(function(date) {
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setMonth(date.getMonth() + step);
}, function(start, end) {
  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
}, function(date) {
  return date.getMonth();
});

var year = newInterval(function(date) {
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setFullYear(date.getFullYear() + step);
}, function(start, end) {
  return end.getFullYear() - start.getFullYear();
}, function(date) {
  return date.getFullYear();
});

// An optimized implementation for this simple case.
year.every = function(k) {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
    date.setFullYear(Math.floor(date.getFullYear() / k) * k);
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setFullYear(date.getFullYear() + step * k);
  });
};

var utcMinute = newInterval(function(date) {
  date.setUTCSeconds(0, 0);
}, function(date, step) {
  date.setTime(+date + step * durationMinute);
}, function(start, end) {
  return (end - start) / durationMinute;
}, function(date) {
  return date.getUTCMinutes();
});

var utcHour = newInterval(function(date) {
  date.setUTCMinutes(0, 0, 0);
}, function(date, step) {
  date.setTime(+date + step * durationHour);
}, function(start, end) {
  return (end - start) / durationHour;
}, function(date) {
  return date.getUTCHours();
});

var utcDay = newInterval(function(date) {
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCDate(date.getUTCDate() + step);
}, function(start, end) {
  return (end - start) / durationDay;
}, function(date) {
  return date.getUTCDate() - 1;
});

function utcWeekday(i) {
  return newInterval(function(date) {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCDate(date.getUTCDate() + step * 7);
  }, function(start, end) {
    return (end - start) / durationWeek;
  });
}

var utcSunday = utcWeekday(0);
var utcMonday = utcWeekday(1);
var utcTuesday = utcWeekday(2);
var utcWednesday = utcWeekday(3);
var utcThursday = utcWeekday(4);
var utcFriday = utcWeekday(5);
var utcSaturday = utcWeekday(6);

var utcMonth = newInterval(function(date) {
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCMonth(date.getUTCMonth() + step);
}, function(start, end) {
  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
}, function(date) {
  return date.getUTCMonth();
});

var utcYear = newInterval(function(date) {
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCFullYear(date.getUTCFullYear() + step);
}, function(start, end) {
  return end.getUTCFullYear() - start.getUTCFullYear();
}, function(date) {
  return date.getUTCFullYear();
});

// An optimized implementation for this simple case.
utcYear.every = function(k) {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCFullYear(date.getUTCFullYear() + step * k);
  });
};

function localDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
    date.setFullYear(d.y);
    return date;
  }
  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}

function utcDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
    date.setUTCFullYear(d.y);
    return date;
  }
  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}

function newDate(y, m, d) {
  return {y: y, m: m, d: d, H: 0, M: 0, S: 0, L: 0};
}

function formatLocale$1(locale) {
  var locale_dateTime = locale.dateTime,
      locale_date = locale.date,
      locale_time = locale.time,
      locale_periods = locale.periods,
      locale_weekdays = locale.days,
      locale_shortWeekdays = locale.shortDays,
      locale_months = locale.months,
      locale_shortMonths = locale.shortMonths;

  var periodRe = formatRe(locale_periods),
      periodLookup = formatLookup(locale_periods),
      weekdayRe = formatRe(locale_weekdays),
      weekdayLookup = formatLookup(locale_weekdays),
      shortWeekdayRe = formatRe(locale_shortWeekdays),
      shortWeekdayLookup = formatLookup(locale_shortWeekdays),
      monthRe = formatRe(locale_months),
      monthLookup = formatLookup(locale_months),
      shortMonthRe = formatRe(locale_shortMonths),
      shortMonthLookup = formatLookup(locale_shortMonths);

  var formats = {
    "a": formatShortWeekday,
    "A": formatWeekday,
    "b": formatShortMonth,
    "B": formatMonth,
    "c": null,
    "d": formatDayOfMonth,
    "e": formatDayOfMonth,
    "f": formatMicroseconds,
    "g": formatYearISO,
    "G": formatFullYearISO,
    "H": formatHour24,
    "I": formatHour12,
    "j": formatDayOfYear,
    "L": formatMilliseconds,
    "m": formatMonthNumber,
    "M": formatMinutes,
    "p": formatPeriod,
    "q": formatQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatSeconds,
    "u": formatWeekdayNumberMonday,
    "U": formatWeekNumberSunday,
    "V": formatWeekNumberISO,
    "w": formatWeekdayNumberSunday,
    "W": formatWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatYear,
    "Y": formatFullYear,
    "Z": formatZone,
    "%": formatLiteralPercent
  };

  var utcFormats = {
    "a": formatUTCShortWeekday,
    "A": formatUTCWeekday,
    "b": formatUTCShortMonth,
    "B": formatUTCMonth,
    "c": null,
    "d": formatUTCDayOfMonth,
    "e": formatUTCDayOfMonth,
    "f": formatUTCMicroseconds,
    "g": formatUTCYearISO,
    "G": formatUTCFullYearISO,
    "H": formatUTCHour24,
    "I": formatUTCHour12,
    "j": formatUTCDayOfYear,
    "L": formatUTCMilliseconds,
    "m": formatUTCMonthNumber,
    "M": formatUTCMinutes,
    "p": formatUTCPeriod,
    "q": formatUTCQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatUTCSeconds,
    "u": formatUTCWeekdayNumberMonday,
    "U": formatUTCWeekNumberSunday,
    "V": formatUTCWeekNumberISO,
    "w": formatUTCWeekdayNumberSunday,
    "W": formatUTCWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatUTCYear,
    "Y": formatUTCFullYear,
    "Z": formatUTCZone,
    "%": formatLiteralPercent
  };

  var parses = {
    "a": parseShortWeekday,
    "A": parseWeekday,
    "b": parseShortMonth,
    "B": parseMonth,
    "c": parseLocaleDateTime,
    "d": parseDayOfMonth,
    "e": parseDayOfMonth,
    "f": parseMicroseconds,
    "g": parseYear,
    "G": parseFullYear,
    "H": parseHour24,
    "I": parseHour24,
    "j": parseDayOfYear,
    "L": parseMilliseconds,
    "m": parseMonthNumber,
    "M": parseMinutes,
    "p": parsePeriod,
    "q": parseQuarter,
    "Q": parseUnixTimestamp,
    "s": parseUnixTimestampSeconds,
    "S": parseSeconds,
    "u": parseWeekdayNumberMonday,
    "U": parseWeekNumberSunday,
    "V": parseWeekNumberISO,
    "w": parseWeekdayNumberSunday,
    "W": parseWeekNumberMonday,
    "x": parseLocaleDate,
    "X": parseLocaleTime,
    "y": parseYear,
    "Y": parseFullYear,
    "Z": parseZone,
    "%": parseLiteralPercent
  };

  // These recursive directive definitions must be deferred.
  formats.x = newFormat(locale_date, formats);
  formats.X = newFormat(locale_time, formats);
  formats.c = newFormat(locale_dateTime, formats);
  utcFormats.x = newFormat(locale_date, utcFormats);
  utcFormats.X = newFormat(locale_time, utcFormats);
  utcFormats.c = newFormat(locale_dateTime, utcFormats);

  function newFormat(specifier, formats) {
    return function(date) {
      var string = [],
          i = -1,
          j = 0,
          n = specifier.length,
          c,
          pad,
          format;

      if (!(date instanceof Date)) date = new Date(+date);

      while (++i < n) {
        if (specifier.charCodeAt(i) === 37) {
          string.push(specifier.slice(j, i));
          if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
          else pad = c === "e" ? " " : "0";
          if (format = formats[c]) c = format(date, pad);
          string.push(c);
          j = i + 1;
        }
      }

      string.push(specifier.slice(j, i));
      return string.join("");
    };
  }

  function newParse(specifier, Z) {
    return function(string) {
      var d = newDate(1900, undefined, 1),
          i = parseSpecifier(d, specifier, string += "", 0),
          week, day$1;
      if (i != string.length) return null;

      // If a UNIX timestamp is specified, return it.
      if ("Q" in d) return new Date(d.Q);
      if ("s" in d) return new Date(d.s * 1000 + ("L" in d ? d.L : 0));

      // If this is utcParse, never use the local timezone.
      if (Z && !("Z" in d)) d.Z = 0;

      // The am-pm flag is 0 for AM, and 1 for PM.
      if ("p" in d) d.H = d.H % 12 + d.p * 12;

      // If the month was not specified, inherit from the quarter.
      if (d.m === undefined) d.m = "q" in d ? d.q : 0;

      // Convert day-of-week and week-of-year to day-of-year.
      if ("V" in d) {
        if (d.V < 1 || d.V > 53) return null;
        if (!("w" in d)) d.w = 1;
        if ("Z" in d) {
          week = utcDate(newDate(d.y, 0, 1)), day$1 = week.getUTCDay();
          week = day$1 > 4 || day$1 === 0 ? utcMonday.ceil(week) : utcMonday(week);
          week = utcDay.offset(week, (d.V - 1) * 7);
          d.y = week.getUTCFullYear();
          d.m = week.getUTCMonth();
          d.d = week.getUTCDate() + (d.w + 6) % 7;
        } else {
          week = localDate(newDate(d.y, 0, 1)), day$1 = week.getDay();
          week = day$1 > 4 || day$1 === 0 ? monday.ceil(week) : monday(week);
          week = day.offset(week, (d.V - 1) * 7);
          d.y = week.getFullYear();
          d.m = week.getMonth();
          d.d = week.getDate() + (d.w + 6) % 7;
        }
      } else if ("W" in d || "U" in d) {
        if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
        day$1 = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
        d.m = 0;
        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day$1 + 5) % 7 : d.w + d.U * 7 - (day$1 + 6) % 7;
      }

      // If a time zone is specified, all fields are interpreted as UTC and then
      // offset according to the specified time zone.
      if ("Z" in d) {
        d.H += d.Z / 100 | 0;
        d.M += d.Z % 100;
        return utcDate(d);
      }

      // Otherwise, all fields are in local time.
      return localDate(d);
    };
  }

  function parseSpecifier(d, specifier, string, j) {
    var i = 0,
        n = specifier.length,
        m = string.length,
        c,
        parse;

    while (i < n) {
      if (j >= m) return -1;
      c = specifier.charCodeAt(i++);
      if (c === 37) {
        c = specifier.charAt(i++);
        parse = parses[c in pads ? specifier.charAt(i++) : c];
        if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
      } else if (c != string.charCodeAt(j++)) {
        return -1;
      }
    }

    return j;
  }

  function parsePeriod(d, string, i) {
    var n = periodRe.exec(string.slice(i));
    return n ? (d.p = periodLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }

  function parseShortWeekday(d, string, i) {
    var n = shortWeekdayRe.exec(string.slice(i));
    return n ? (d.w = shortWeekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }

  function parseWeekday(d, string, i) {
    var n = weekdayRe.exec(string.slice(i));
    return n ? (d.w = weekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }

  function parseShortMonth(d, string, i) {
    var n = shortMonthRe.exec(string.slice(i));
    return n ? (d.m = shortMonthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }

  function parseMonth(d, string, i) {
    var n = monthRe.exec(string.slice(i));
    return n ? (d.m = monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }

  function parseLocaleDateTime(d, string, i) {
    return parseSpecifier(d, locale_dateTime, string, i);
  }

  function parseLocaleDate(d, string, i) {
    return parseSpecifier(d, locale_date, string, i);
  }

  function parseLocaleTime(d, string, i) {
    return parseSpecifier(d, locale_time, string, i);
  }

  function formatShortWeekday(d) {
    return locale_shortWeekdays[d.getDay()];
  }

  function formatWeekday(d) {
    return locale_weekdays[d.getDay()];
  }

  function formatShortMonth(d) {
    return locale_shortMonths[d.getMonth()];
  }

  function formatMonth(d) {
    return locale_months[d.getMonth()];
  }

  function formatPeriod(d) {
    return locale_periods[+(d.getHours() >= 12)];
  }

  function formatQuarter(d) {
    return 1 + ~~(d.getMonth() / 3);
  }

  function formatUTCShortWeekday(d) {
    return locale_shortWeekdays[d.getUTCDay()];
  }

  function formatUTCWeekday(d) {
    return locale_weekdays[d.getUTCDay()];
  }

  function formatUTCShortMonth(d) {
    return locale_shortMonths[d.getUTCMonth()];
  }

  function formatUTCMonth(d) {
    return locale_months[d.getUTCMonth()];
  }

  function formatUTCPeriod(d) {
    return locale_periods[+(d.getUTCHours() >= 12)];
  }

  function formatUTCQuarter(d) {
    return 1 + ~~(d.getUTCMonth() / 3);
  }

  return {
    format: function(specifier) {
      var f = newFormat(specifier += "", formats);
      f.toString = function() { return specifier; };
      return f;
    },
    parse: function(specifier) {
      var p = newParse(specifier += "", false);
      p.toString = function() { return specifier; };
      return p;
    },
    utcFormat: function(specifier) {
      var f = newFormat(specifier += "", utcFormats);
      f.toString = function() { return specifier; };
      return f;
    },
    utcParse: function(specifier) {
      var p = newParse(specifier += "", true);
      p.toString = function() { return specifier; };
      return p;
    }
  };
}

var pads = {"-": "", "_": " ", "0": "0"},
    numberRe = /^\s*\d+/, // note: ignores next directive
    percentRe = /^%/,
    requoteRe = /[\\^$*+?|[\]().{}]/g;

function pad(value, fill, width) {
  var sign = value < 0 ? "-" : "",
      string = (sign ? -value : value) + "",
      length = string.length;
  return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
}

function requote(s) {
  return s.replace(requoteRe, "\\$&");
}

function formatRe(names) {
  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}

function formatLookup(names) {
  return new Map(names.map((name, i) => [name.toLowerCase(), i]));
}

function parseWeekdayNumberSunday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.w = +n[0], i + n[0].length) : -1;
}

function parseWeekdayNumberMonday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.u = +n[0], i + n[0].length) : -1;
}

function parseWeekNumberSunday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.U = +n[0], i + n[0].length) : -1;
}

function parseWeekNumberISO(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.V = +n[0], i + n[0].length) : -1;
}

function parseWeekNumberMonday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.W = +n[0], i + n[0].length) : -1;
}

function parseFullYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 4));
  return n ? (d.y = +n[0], i + n[0].length) : -1;
}

function parseYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
}

function parseZone(d, string, i) {
  var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
}

function parseQuarter(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
}

function parseMonthNumber(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
}

function parseDayOfMonth(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.d = +n[0], i + n[0].length) : -1;
}

function parseDayOfYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
}

function parseHour24(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.H = +n[0], i + n[0].length) : -1;
}

function parseMinutes(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.M = +n[0], i + n[0].length) : -1;
}

function parseSeconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.S = +n[0], i + n[0].length) : -1;
}

function parseMilliseconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.L = +n[0], i + n[0].length) : -1;
}

function parseMicroseconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 6));
  return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
}

function parseLiteralPercent(d, string, i) {
  var n = percentRe.exec(string.slice(i, i + 1));
  return n ? i + n[0].length : -1;
}

function parseUnixTimestamp(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.Q = +n[0], i + n[0].length) : -1;
}

function parseUnixTimestampSeconds(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.s = +n[0], i + n[0].length) : -1;
}

function formatDayOfMonth(d, p) {
  return pad(d.getDate(), p, 2);
}

function formatHour24(d, p) {
  return pad(d.getHours(), p, 2);
}

function formatHour12(d, p) {
  return pad(d.getHours() % 12 || 12, p, 2);
}

function formatDayOfYear(d, p) {
  return pad(1 + day.count(year(d), d), p, 3);
}

function formatMilliseconds(d, p) {
  return pad(d.getMilliseconds(), p, 3);
}

function formatMicroseconds(d, p) {
  return formatMilliseconds(d, p) + "000";
}

function formatMonthNumber(d, p) {
  return pad(d.getMonth() + 1, p, 2);
}

function formatMinutes(d, p) {
  return pad(d.getMinutes(), p, 2);
}

function formatSeconds(d, p) {
  return pad(d.getSeconds(), p, 2);
}

function formatWeekdayNumberMonday(d) {
  var day = d.getDay();
  return day === 0 ? 7 : day;
}

function formatWeekNumberSunday(d, p) {
  return pad(sunday.count(year(d) - 1, d), p, 2);
}

function dISO(d) {
  var day = d.getDay();
  return (day >= 4 || day === 0) ? thursday(d) : thursday.ceil(d);
}

function formatWeekNumberISO(d, p) {
  d = dISO(d);
  return pad(thursday.count(year(d), d) + (year(d).getDay() === 4), p, 2);
}

function formatWeekdayNumberSunday(d) {
  return d.getDay();
}

function formatWeekNumberMonday(d, p) {
  return pad(monday.count(year(d) - 1, d), p, 2);
}

function formatYear(d, p) {
  return pad(d.getFullYear() % 100, p, 2);
}

function formatYearISO(d, p) {
  d = dISO(d);
  return pad(d.getFullYear() % 100, p, 2);
}

function formatFullYear(d, p) {
  return pad(d.getFullYear() % 10000, p, 4);
}

function formatFullYearISO(d, p) {
  var day = d.getDay();
  d = (day >= 4 || day === 0) ? thursday(d) : thursday.ceil(d);
  return pad(d.getFullYear() % 10000, p, 4);
}

function formatZone(d) {
  var z = d.getTimezoneOffset();
  return (z > 0 ? "-" : (z *= -1, "+"))
      + pad(z / 60 | 0, "0", 2)
      + pad(z % 60, "0", 2);
}

function formatUTCDayOfMonth(d, p) {
  return pad(d.getUTCDate(), p, 2);
}

function formatUTCHour24(d, p) {
  return pad(d.getUTCHours(), p, 2);
}

function formatUTCHour12(d, p) {
  return pad(d.getUTCHours() % 12 || 12, p, 2);
}

function formatUTCDayOfYear(d, p) {
  return pad(1 + utcDay.count(utcYear(d), d), p, 3);
}

function formatUTCMilliseconds(d, p) {
  return pad(d.getUTCMilliseconds(), p, 3);
}

function formatUTCMicroseconds(d, p) {
  return formatUTCMilliseconds(d, p) + "000";
}

function formatUTCMonthNumber(d, p) {
  return pad(d.getUTCMonth() + 1, p, 2);
}

function formatUTCMinutes(d, p) {
  return pad(d.getUTCMinutes(), p, 2);
}

function formatUTCSeconds(d, p) {
  return pad(d.getUTCSeconds(), p, 2);
}

function formatUTCWeekdayNumberMonday(d) {
  var dow = d.getUTCDay();
  return dow === 0 ? 7 : dow;
}

function formatUTCWeekNumberSunday(d, p) {
  return pad(utcSunday.count(utcYear(d) - 1, d), p, 2);
}

function UTCdISO(d) {
  var day = d.getUTCDay();
  return (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d);
}

function formatUTCWeekNumberISO(d, p) {
  d = UTCdISO(d);
  return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
}

function formatUTCWeekdayNumberSunday(d) {
  return d.getUTCDay();
}

function formatUTCWeekNumberMonday(d, p) {
  return pad(utcMonday.count(utcYear(d) - 1, d), p, 2);
}

function formatUTCYear(d, p) {
  return pad(d.getUTCFullYear() % 100, p, 2);
}

function formatUTCYearISO(d, p) {
  d = UTCdISO(d);
  return pad(d.getUTCFullYear() % 100, p, 2);
}

function formatUTCFullYear(d, p) {
  return pad(d.getUTCFullYear() % 10000, p, 4);
}

function formatUTCFullYearISO(d, p) {
  var day = d.getUTCDay();
  d = (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d);
  return pad(d.getUTCFullYear() % 10000, p, 4);
}

function formatUTCZone() {
  return "+0000";
}

function formatLiteralPercent() {
  return "%";
}

function formatUnixTimestamp(d) {
  return +d;
}

function formatUnixTimestampSeconds(d) {
  return Math.floor(+d / 1000);
}

var locale$1;
var timeFormat;
var timeParse;
var utcFormat;
var utcParse;

defaultLocale$1({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});

function defaultLocale$1(definition) {
  locale$1 = formatLocale$1(definition);
  timeFormat = locale$1.format;
  timeParse = locale$1.parse;
  utcFormat = locale$1.utcFormat;
  utcParse = locale$1.utcParse;
  return locale$1;
}

const Format = dedupingMixin(superClass => {

  return class extends superClass {

    get _format() {
      return this.isTime ? timeFormat(this.specifier) : format(this.specifier);
    }

    static get properties() {

      return {

        ...super.properties,

        /*
         * true to indicate the use of d3.timeFormat (instead of d3.format)
         */
        isTime: {
          type: Boolean,
          attribute: 'is-time'
        },

        /**
         * `specifier` for the format function (as per https://github.com/d3/d3-format#locale_format)
         */
        specifier: {
          type: String,
          value: '.1f'
        }
      };
    }
  };
});

/**
 * ##  DispatchSVG
 * 
 * dispatch template elements marked as slot-svg="svgID" to svgHost.to
 * Is mixed to multi-drawble;
 * 
 */

const DispatchSVG = dedupingMixin(superClass => {

  return class extends superClass {

    static get properties() {

      return {

        ...super.properties,

        /* 
         * `svgHost` the host to which [slog-svg] nodes must be stamped
         */
        svgHost: {
          type: Object,
          attribute: 'svg-host'
        }

      };
    }

    constructor() {
      super();
      this._hostedNodes = {};
    }

    getHostedNode(target) {
      return this._hostedNodes[target] || null;
    }

    update(props) {
      if (props.has('svgHost')) {
        if (this.svgHost && this.resize) {
          this.resize(this.svgHost.width, this.svgHost.height);
        }
        this.observeSvgHost(this.svgHost, props.get('svgHost'));
      }
      super.update(props);
    }

    observeSvgHost(host, old) {
      if (host && this.renderRoot) {
        this.renderRoot.querySelectorAll('[slot-svg]').forEach(node => {
          const target = node.getAttribute('slot-svg');
          const parent = (host.$ && host.$[target]) || host.renderRoot.querySelector(`#${target}`);
          if (parent) {
            this._hostedNodes[node.id || target] = node;
            const position = node.dataset.multiPosition;
            const appended = [...parent.childNodes].some(n => {
              if (node.dataset.multiPosition >= position) {
                parent.insertBefore(node, n);
                return true;
              }
            });
            if (!appended) {
              parent.appendChild(node);
            }

            // parent.appendChild(node);
            // Note(cg): reorder according to multi-position
            return;
            // select(targetNode).selectAll('>*').sort((a,b) => a.dataset.multiPosition - b.dataset.multiPosition);
            // return;
          }
          throw new Error(`cannot dispatch node ${target}`);
        });
        this.setHostStyle(host, old);
      }
      // Note(cg): .
      if (host === null && old) {
        Object.keys(this._hostedNodes).forEach(k => {
          this.renderRoot.appendChild(this._hostedNodes[k]);
          delete this._hostedNodes[k];
        });
      }
    }

    getRootHost(host) {
      while (host.svgHost) {
        host = host.svgHost;
      }
      return host;
    }

    // Note(cg): hack to inject style in host.
    setHostStyle(host) {
      if (this.constructor.hostStyles) {
        const name = this.constructor.name;
        host = this.getRootHost(host);
        if (!host.renderRoot.querySelector(`style[id=${name}]`)) {
          const st = document.createElement('style');
          st.id = name;
          st.innerHTML = this.constructor.hostStyles.cssText;
          host.renderRoot.appendChild(st);

        }
      }
    }

    // Note(cg): after Register is called by `multi-register-mixin` (multi-container-svg) once 
    afterRegister(host, containerName = 'svgHost') {
      this[containerName] = host;
    }

    afterUnregister(host, containerName = 'svgHost') {
      this[containerName] = null;
    }

    /* 
     * `postRemove` is called by `multi-registerable-mixin` on disconnectedCallback. 
     * It unregisters this element from svgHost. 
     */
    postRemove() {
      if (this.svgHost && this.svgHost.unregister) {
        this.svgHost.unregister(this);
      }
      super.postRemove && super.postRemove();
    }

  };
});

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/* eslint-disable no-unused-vars */
/**
 * When using Closure Compiler, JSCompiler_renameProperty(property, object) is replaced by the munged name for object[property]
 * We cannot alias this function, so we have to use a small shim that has the same behavior when not compiling.
 *
 * @param {?} prop Property name
 * @param {*} obj Reference object
 * @return {string} Potentially renamed property name
 */
window.JSCompiler_renameProperty = function(prop, obj) {
  return prop;
};

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

const caseMap = {};
const DASH_TO_CAMEL = /-[a-z]/g;
const CAMEL_TO_DASH = /([A-Z])/g;

/**
 * @fileoverview Module with utilities for converting between "dash-case" and
 * "camelCase" identifiers.
 */

/**
 * Converts "dash-case" identifier (e.g. `foo-bar-baz`) to "camelCase"
 * (e.g. `fooBarBaz`).
 *
 * @param {string} dash Dash-case identifier
 * @return {string} Camel-case representation of the identifier
 */
function dashToCamelCase(dash) {
  return caseMap[dash] || (
    caseMap[dash] = dash.indexOf('-') < 0 ? dash : dash.replace(DASH_TO_CAMEL,
      (m) => m[1].toUpperCase()
    )
  );
}

/**
 * Converts "camelCase" identifier (e.g. `fooBarBaz`) to "dash-case"
 * (e.g. `foo-bar-baz`).
 *
 * @param {string} camel Camel-case identifier
 * @return {string} Dash-case representation of the identifier
 */
function camelToDashCase(camel) {
  return caseMap[camel] || (
    caseMap[camel] = camel.replace(CAMEL_TO_DASH, '-$1').toLowerCase()
  );
}

// Capitalize the first letter od a word.
const capitalize = str => str[0].toUpperCase() + str.slice(1);

//  fitTo set transform attribute of source so that it fits target container.
const fitTo = (source, target, factor = 0.95, duration) => {

  let sel = select(source);

  if (duration) {
    sel = sel.transition().duration(duration);
  }

  if (!target) {
    // Note(cg): reset.
    return sel.attr('transform', 'translate(0,0)scale(1)');
  }

  sel.attr('transform', null);

  const sourceRect = source.getBoundingClientRect(),
    dx = sourceRect.width,
    dy = sourceRect.height;

  if (!dx || !dy) {
    return;
  }
  const targetRect = target.getBoundingClientRect(),
    x = (-sourceRect.left + sourceRect.right) / 2,
    y = (-sourceRect.top + sourceRect.bottom) / 2,
    xOffset = targetRect.x - sourceRect.x,
    yOffset = targetRect.y - sourceRect.y,
    scale = factor / Math.max(dx / targetRect.width, dy / targetRect.height),
    translate = [xOffset * scale + (targetRect.width / 2 - scale * x), yOffset * scale + (targetRect.height / 2 - scale * y)];

  sel.attr('transform', 'translate(' + translate[0] + ',' + translate[1] + ') scale(' + scale + ')');
};

const shapeProperties = (keys, props = {}) => {
  keys.forEach(key => {
    if (!props[key]) {
      props[key] = {
        type: Function,
        attribute: camelToDashCase(key)
      };
    }
  });
  return props;
};

// Note(cg): from https://bl.ocks.org/mbostock/7555321.
const wrap = (text, width) => {
  text.each(function() {

    const text = select(this),
      words = text.text().split(/\s+/).reverse(),
      lineHeight = 1.1, // ems
      y = text.attr('y'),
      x = text.attr('x'),
      dy = parseFloat(text.attr('dy'));
   
    let word,
      line = [],
      lineNumber = 0,
      tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        // tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
        tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
      }
    }
  });
};

/**
 * ## AxisProperty
 *
 * a mixin for constructing `top`, `left`, `bottom` and `right` properties
 *
 */
const extendProperty = (name, ...props) => {
  const namedProperties = {};
  const properties = Object.assign({}, ...props);
  Object.keys(properties).forEach(k => {
    // Note(cg): properties that need to be exported as named properies (e.g. `bottomElastic`, `rightDomain`) are marked as _multiFactory: true .
    namedProperties[`${name}${capitalize(k)}`] = Object.assign({}, properties[k]);
    namedProperties[`${name}${capitalize(k)}`].attribute = `${name}-${properties[k].attribute || k}`;
  });
  return namedProperties;
};

const ExtendProperty = (superClass, name, ...props) => {

  const namedProperties = extendProperty(name, ...props);

  /*
   * @polymer
   * @mixinClass
   */
  class Mixin extends superClass {

    static get properties() {
      return Object.assign(super.properties || {}, namedProperties);
    }
  }

  return Mixin;
};

var slice = Array.prototype.slice;

function identity$1(x) {
  return x;
}

var top = 1,
    right = 2,
    bottom = 3,
    left = 4,
    epsilon = 1e-6;

function translateX(x) {
  return "translate(" + (x + 0.5) + ",0)";
}

function translateY(y) {
  return "translate(0," + (y + 0.5) + ")";
}

function number(scale) {
  return d => +scale(d);
}

function center(scale) {
  var offset = Math.max(0, scale.bandwidth() - 1) / 2; // Adjust for 0.5px offset.
  if (scale.round()) offset = Math.round(offset);
  return function(d) {
    return +scale(d) + offset;
  };
}

function entering() {
  return !this.__axis;
}

function axis(orient, scale) {
  var tickArguments = [],
      tickValues = null,
      tickFormat = null,
      tickSizeInner = 6,
      tickSizeOuter = 6,
      tickPadding = 3,
      k = orient === top || orient === left ? -1 : 1,
      x = orient === left || orient === right ? "x" : "y",
      transform = orient === top || orient === bottom ? translateX : translateY;

  function axis(context) {
    var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
        format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity$1) : tickFormat,
        spacing = Math.max(tickSizeInner, 0) + tickPadding,
        range = scale.range(),
        range0 = +range[0] + 0.5,
        range1 = +range[range.length - 1] + 0.5,
        position = (scale.bandwidth ? center : number)(scale.copy()),
        selection = context.selection ? context.selection() : context,
        path = selection.selectAll(".domain").data([null]),
        tick = selection.selectAll(".tick").data(values, scale).order(),
        tickExit = tick.exit(),
        tickEnter = tick.enter().append("g").attr("class", "tick"),
        line = tick.select("line"),
        text = tick.select("text");

    path = path.merge(path.enter().insert("path", ".tick")
        .attr("class", "domain")
        .attr("stroke", "currentColor"));

    tick = tick.merge(tickEnter);

    line = line.merge(tickEnter.append("line")
        .attr("stroke", "currentColor")
        .attr(x + "2", k * tickSizeInner));

    text = text.merge(tickEnter.append("text")
        .attr("fill", "currentColor")
        .attr(x, k * spacing)
        .attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));

    if (context !== selection) {
      path = path.transition(context);
      tick = tick.transition(context);
      line = line.transition(context);
      text = text.transition(context);

      tickExit = tickExit.transition(context)
          .attr("opacity", epsilon)
          .attr("transform", function(d) { return isFinite(d = position(d)) ? transform(d) : this.getAttribute("transform"); });

      tickEnter
          .attr("opacity", epsilon)
          .attr("transform", function(d) { var p = this.parentNode.__axis; return transform(p && isFinite(p = p(d)) ? p : position(d)); });
    }

    tickExit.remove();

    path
        .attr("d", orient === left || orient == right
            ? (tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H0.5V" + range1 + "H" + k * tickSizeOuter : "M0.5," + range0 + "V" + range1)
            : (tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V0.5H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + ",0.5H" + range1));

    tick
        .attr("opacity", 1)
        .attr("transform", function(d) { return transform(position(d)); });

    line
        .attr(x + "2", k * tickSizeInner);

    text
        .attr(x, k * spacing)
        .text(format);

    selection.filter(entering)
        .attr("fill", "none")
        .attr("font-size", 10)
        .attr("font-family", "sans-serif")
        .attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");

    selection
        .each(function() { this.__axis = position; });
  }

  axis.scale = function(_) {
    return arguments.length ? (scale = _, axis) : scale;
  };

  axis.ticks = function() {
    return tickArguments = slice.call(arguments), axis;
  };

  axis.tickArguments = function(_) {
    return arguments.length ? (tickArguments = _ == null ? [] : slice.call(_), axis) : tickArguments.slice();
  };

  axis.tickValues = function(_) {
    return arguments.length ? (tickValues = _ == null ? null : slice.call(_), axis) : tickValues && tickValues.slice();
  };

  axis.tickFormat = function(_) {
    return arguments.length ? (tickFormat = _, axis) : tickFormat;
  };

  axis.tickSize = function(_) {
    return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
  };

  axis.tickSizeInner = function(_) {
    return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
  };

  axis.tickSizeOuter = function(_) {
    return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
  };

  axis.tickPadding = function(_) {
    return arguments.length ? (tickPadding = +_, axis) : tickPadding;
  };

  return axis;
}

function axisTop(scale) {
  return axis(top, scale);
}

function axisRight(scale) {
  return axis(right, scale);
}

function axisBottom(scale) {
  return axis(bottom, scale);
}

function axisLeft(scale) {
  return axis(left, scale);
}

var axis$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  axisTop: axisTop,
  axisRight: axisRight,
  axisBottom: axisBottom,
  axisLeft: axisLeft
});

const instance = axisTop();
const keys = Object.keys(instance || {});
const props = shapeProperties(keys);

/**
 * A litElement wrapper around [d3.axis](https://github.com/d3/d3-axis). 
 * 
 * @element d3-axis
 * @fires axis-changed - fires when axis value changes (and need to be re-rendered)
 *
 * 
 * 
 */
class D3Axis extends LitElement {

  static get properties() {

    return {

      ...props,

      /**
       * type of axis
       * @type {'top'|'bottom'|'left'|'right'}
       */
      type: {
        type: String,
      },

      domain: {
        type: Array
      },
      
      range: {
        type: Array
      }
    };
  }
  constructor() {
    super();
    this.__init = true;
  }

  update(props) {
    let refreshed; 
    this.log && console.info(`d3-axis ${this.type} update`, props);
    if (!this.type && !props.has('type')) {
      this.type = 'bottom';
    }

    // Note(cg): ensure number for ticks.
    if (props.has('ticks') && typeof this.ticks === 'string') {
      this.ticks = this.ticks * 1;
    }

    if (this.axis || props.has('type')) {
      this.axis = axis$1[`axis${capitalize(this.type)}`]();
      refreshed = true;
    }

    if (this.axis) {
      this.updateWrapper(props, this.__init || refreshed);
    }
    super.update(props);
  }

  updateWrapper(props, shallNotify) {
    Object.keys(this.axis).forEach(key => {
      if ((this[key] !== undefined)) {
        shallNotify = true;
        this.axis[key](this[key]);
      }
    });
    if (shallNotify) {
      this.dispatchEvent(new CustomEvent(`axis-changed`, { detail: { value: this.axis, type: this.type }, bubbles: true, composed: true }));
      delete this.__init;
    }
  }
}

/**
 * Lit-Element wrapper around d3.transiton
 *
 * anytime the transition is changed, will expose a `transition-changed` event, 
 * dispatching a function applying duration, delay or ease - if they exist - to 
 * a existing transition (see https://github.com/d3/d3-transition#transition_call)
 * 
 */

class Transition extends LitElement {

  static get properties() {

    return {

      delay: { type: Object },
      duration: { type: Object },
      ease: { type: Object }

    };
  }

  update(props) {
    this.log && console.info(`d3-transition ${this.type} update`, props);
    const value = (transition) => {
      Object.keys(this.constructor.properties).forEach(pr => {
        if (this[pr] && transition[pr]) {
          transition[pr](this[pr]);
        }
      });
    };
    super.update(props);
    this.dispatchEvent(new CustomEvent(`transition-changed`, { detail: { value: value }, bubbles: true, composed: true }));
  }
}

function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function bisector(f) {
  let delta = f;
  let compare = f;

  if (f.length === 1) {
    delta = (d, x) => f(d) - x;
    compare = ascendingComparator(f);
  }

  function left(a, x, lo, hi) {
    if (lo == null) lo = 0;
    if (hi == null) hi = a.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (compare(a[mid], x) < 0) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function right(a, x, lo, hi) {
    if (lo == null) lo = 0;
    if (hi == null) hi = a.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (compare(a[mid], x) > 0) hi = mid;
      else lo = mid + 1;
    }
    return lo;
  }

  function center(a, x, lo, hi) {
    if (lo == null) lo = 0;
    if (hi == null) hi = a.length;
    const i = left(a, x, lo, hi - 1);
    return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
  }

  return {left, center, right};
}

function ascendingComparator(f) {
  return (d, x) => ascending(f(d), x);
}

function number$1(x) {
  return x === null ? NaN : +x;
}

function* numbers(values, valueof) {
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        yield value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        yield value;
      }
    }
  }
}

const ascendingBisect = bisector(ascending);
const bisectRight = ascendingBisect.right;
const bisectCenter = bisector(number$1).center;

function extent(values, valueof) {
  let min;
  let max;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null) {
        if (min === undefined) {
          if (value >= value) min = max = value;
        } else {
          if (min > value) min = value;
          if (max < value) max = value;
        }
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null) {
        if (min === undefined) {
          if (value >= value) min = max = value;
        } else {
          if (min > value) min = value;
          if (max < value) max = value;
        }
      }
    }
  }
  return [min, max];
}

var e10 = Math.sqrt(50),
    e5 = Math.sqrt(10),
    e2 = Math.sqrt(2);

function ticks(start, stop, count) {
  var reverse,
      i = -1,
      n,
      ticks,
      step;

  stop = +stop, start = +start, count = +count;
  if (start === stop && count > 0) return [start];
  if (reverse = stop < start) n = start, start = stop, stop = n;
  if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

  if (step > 0) {
    start = Math.ceil(start / step);
    stop = Math.floor(stop / step);
    ticks = new Array(n = Math.ceil(stop - start + 1));
    while (++i < n) ticks[i] = (start + i) * step;
  } else {
    step = -step;
    start = Math.ceil(start * step);
    stop = Math.floor(stop * step);
    ticks = new Array(n = Math.ceil(stop - start + 1));
    while (++i < n) ticks[i] = (start + i) / step;
  }

  if (reverse) ticks.reverse();

  return ticks;
}

function tickIncrement(start, stop, count) {
  var step = (stop - start) / Math.max(0, count),
      power = Math.floor(Math.log(step) / Math.LN10),
      error = step / Math.pow(10, power);
  return power >= 0
      ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
      : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}

function tickStep(start, stop, count) {
  var step0 = Math.abs(stop - start) / Math.max(0, count),
      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
      error = step0 / step1;
  if (error >= e10) step1 *= 10;
  else if (error >= e5) step1 *= 5;
  else if (error >= e2) step1 *= 2;
  return stop < start ? -step1 : step1;
}

function max(values, valueof) {
  let max;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null
          && (max < value || (max === undefined && value >= value))) {
        max = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (max < value || (max === undefined && value >= value))) {
        max = value;
      }
    }
  }
  return max;
}

function min(values, valueof) {
  let min;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null
          && (min > value || (min === undefined && value >= value))) {
        min = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (min > value || (min === undefined && value >= value))) {
        min = value;
      }
    }
  }
  return min;
}

// Based on https://github.com/mourner/quickselect
// ISC license, Copyright 2018 Vladimir Agafonkin.
function quickselect(array, k, left = 0, right = array.length - 1, compare = ascending) {
  while (right > left) {
    if (right - left > 600) {
      const n = right - left + 1;
      const m = k - left + 1;
      const z = Math.log(n);
      const s = 0.5 * Math.exp(2 * z / 3);
      const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
      const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
      const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
      quickselect(array, k, newLeft, newRight, compare);
    }

    const t = array[k];
    let i = left;
    let j = right;

    swap(array, left, k);
    if (compare(array[right], t) > 0) swap(array, left, right);

    while (i < j) {
      swap(array, i, j), ++i, --j;
      while (compare(array[i], t) < 0) ++i;
      while (compare(array[j], t) > 0) --j;
    }

    if (compare(array[left], t) === 0) swap(array, left, j);
    else ++j, swap(array, j, right);

    if (j <= k) left = j + 1;
    if (k <= j) right = j - 1;
  }
  return array;
}

function swap(array, i, j) {
  const t = array[i];
  array[i] = array[j];
  array[j] = t;
}

function quantile(values, p, valueof) {
  values = Float64Array.from(numbers(values, valueof));
  if (!(n = values.length)) return;
  if ((p = +p) <= 0 || n < 2) return min(values);
  if (p >= 1) return max(values);
  var n,
      i = (n - 1) * p,
      i0 = Math.floor(i),
      value0 = max(quickselect(values, i0).subarray(0, i0 + 1)),
      value1 = min(values.subarray(i0 + 1));
  return value0 + (value1 - value0) * (i - i0);
}

function quantileSorted(values, p, valueof = number$1) {
  if (!(n = values.length)) return;
  if ((p = +p) <= 0 || n < 2) return +valueof(values[0], 0, values);
  if (p >= 1) return +valueof(values[n - 1], n - 1, values);
  var n,
      i = (n - 1) * p,
      i0 = Math.floor(i),
      value0 = +valueof(values[i0], i0, values),
      value1 = +valueof(values[i0 + 1], i0 + 1, values);
  return value0 + (value1 - value0) * (i - i0);
}

function range(start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

  var i = -1,
      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
      range = new Array(n);

  while (++i < n) {
    range[i] = start + i * step;
  }

  return range;
}

function initRange(domain, range) {
  switch (arguments.length) {
    case 0: break;
    case 1: this.range(domain); break;
    default: this.range(range).domain(domain); break;
  }
  return this;
}

function initInterpolator(domain, interpolator) {
  switch (arguments.length) {
    case 0: break;
    case 1: {
      if (typeof domain === "function") this.interpolator(domain);
      else this.range(domain);
      break;
    }
    default: {
      this.domain(domain);
      if (typeof interpolator === "function") this.interpolator(interpolator);
      else this.range(interpolator);
      break;
    }
  }
  return this;
}

const implicit = Symbol("implicit");

function ordinal() {
  var index = new Map(),
      domain = [],
      range = [],
      unknown = implicit;

  function scale(d) {
    var key = d + "", i = index.get(key);
    if (!i) {
      if (unknown !== implicit) return unknown;
      index.set(key, i = domain.push(d));
    }
    return range[(i - 1) % range.length];
  }

  scale.domain = function(_) {
    if (!arguments.length) return domain.slice();
    domain = [], index = new Map();
    for (const value of _) {
      const key = value + "";
      if (index.has(key)) continue;
      index.set(key, domain.push(value));
    }
    return scale;
  };

  scale.range = function(_) {
    return arguments.length ? (range = Array.from(_), scale) : range.slice();
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.copy = function() {
    return ordinal(domain, range).unknown(unknown);
  };

  initRange.apply(scale, arguments);

  return scale;
}

function band() {
  var scale = ordinal().unknown(undefined),
      domain = scale.domain,
      ordinalRange = scale.range,
      r0 = 0,
      r1 = 1,
      step,
      bandwidth,
      round = false,
      paddingInner = 0,
      paddingOuter = 0,
      align = 0.5;

  delete scale.unknown;

  function rescale() {
    var n = domain().length,
        reverse = r1 < r0,
        start = reverse ? r1 : r0,
        stop = reverse ? r0 : r1;
    step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
    if (round) step = Math.floor(step);
    start += (stop - start - step * (n - paddingInner)) * align;
    bandwidth = step * (1 - paddingInner);
    if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
    var values = range(n).map(function(i) { return start + step * i; });
    return ordinalRange(reverse ? values.reverse() : values);
  }

  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };

  scale.range = function(_) {
    return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
  };

  scale.rangeRound = function(_) {
    return [r0, r1] = _, r0 = +r0, r1 = +r1, round = true, rescale();
  };

  scale.bandwidth = function() {
    return bandwidth;
  };

  scale.step = function() {
    return step;
  };

  scale.round = function(_) {
    return arguments.length ? (round = !!_, rescale()) : round;
  };

  scale.padding = function(_) {
    return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
  };

  scale.paddingInner = function(_) {
    return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
  };

  scale.paddingOuter = function(_) {
    return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
  };

  scale.align = function(_) {
    return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
  };

  scale.copy = function() {
    return band(domain(), [r0, r1])
        .round(round)
        .paddingInner(paddingInner)
        .paddingOuter(paddingOuter)
        .align(align);
  };

  return initRange.apply(rescale(), arguments);
}

function pointish(scale) {
  var copy = scale.copy;

  scale.padding = scale.paddingOuter;
  delete scale.paddingInner;
  delete scale.paddingOuter;

  scale.copy = function() {
    return pointish(copy());
  };

  return scale;
}

function point() {
  return pointish(band.apply(null, arguments).paddingInner(1));
}

function define(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}

function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

function Color() {}

var darker = 0.7;
var brighter = 1 / darker;

var reI = "\\s*([+-]?\\d+)\\s*",
    reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
    reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
    reHex = /^#([0-9a-f]{3,8})$/,
    reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
    reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
    reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
    reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
    reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
    reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

var named = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};

define(Color, color, {
  copy: function(channels) {
    return Object.assign(new this.constructor, this, channels);
  },
  displayable: function() {
    return this.rgb().displayable();
  },
  hex: color_formatHex, // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});

function color_formatHex() {
  return this.rgb().formatHex();
}

function color_formatHsl() {
  return hslConvert(this).formatHsl();
}

function color_formatRgb() {
  return this.rgb().formatRgb();
}

function color(format) {
  var m, l;
  format = (format + "").trim().toLowerCase();
  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
      : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
      : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
      : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
      : null) // invalid hex
      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
      : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
      : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
      : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
      : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
      : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
      : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
      : null;
}

function rgbn(n) {
  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
}

function rgba(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}

function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb;
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}

function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}

function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}

define(Rgb, rgb, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb: function() {
    return this;
  },
  displayable: function() {
    return (-0.5 <= this.r && this.r < 255.5)
        && (-0.5 <= this.g && this.g < 255.5)
        && (-0.5 <= this.b && this.b < 255.5)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex, // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));

function rgb_formatHex() {
  return "#" + hex(this.r) + hex(this.g) + hex(this.b);
}

function rgb_formatRgb() {
  var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
  return (a === 1 ? "rgb(" : "rgba(")
      + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
      + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
      + Math.max(0, Math.min(255, Math.round(this.b) || 0))
      + (a === 1 ? ")" : ", " + a + ")");
}

function hex(value) {
  value = Math.max(0, Math.min(255, Math.round(value) || 0));
  return (value < 16 ? "0" : "") + value.toString(16);
}

function hsla(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a);
}

function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl;
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      h = NaN,
      s = max - min,
      l = (max + min) / 2;
  if (s) {
    if (r === max) h = (g - b) / s + (g < b) * 6;
    else if (g === max) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}

function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}

function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define(Hsl, hsl, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = this.h % 360 + (this.h < 0) * 360,
        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
        l = this.l,
        m2 = l + (l < 0.5 ? l : 1 - l) * s,
        m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  displayable: function() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
        && (0 <= this.l && this.l <= 1)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl: function() {
    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "hsl(" : "hsla(")
        + (this.h || 0) + ", "
        + (this.s || 0) * 100 + "%, "
        + (this.l || 0) * 100 + "%"
        + (a === 1 ? ")" : ", " + a + ")");
  }
}));

/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60
      : h < 180 ? m2
      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
      : m1) * 255;
}

var constant = x => () => x;

function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}

function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}

function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
  };
}

function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant(isNaN(a) ? b : a);
}

var rgb$1 = (function rgbGamma(y) {
  var color = gamma(y);

  function rgb$1(start, end) {
    var r = color((start = rgb(start)).r, (end = rgb(end)).r),
        g = color(start.g, end.g),
        b = color(start.b, end.b),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  rgb$1.gamma = rgbGamma;

  return rgb$1;
})(1);

function numberArray(a, b) {
  if (!b) b = [];
  var n = a ? Math.min(b.length, a.length) : 0,
      c = b.slice(),
      i;
  return function(t) {
    for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
    return c;
  };
}

function isNumberArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}

function genericArray(a, b) {
  var nb = b ? b.length : 0,
      na = a ? Math.min(nb, a.length) : 0,
      x = new Array(na),
      c = new Array(nb),
      i;

  for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
  for (; i < nb; ++i) c[i] = b[i];

  return function(t) {
    for (i = 0; i < na; ++i) c[i] = x[i](t);
    return c;
  };
}

function date(a, b) {
  var d = new Date;
  return a = +a, b = +b, function(t) {
    return d.setTime(a * (1 - t) + b * t), d;
  };
}

function interpolateNumber(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}

function object(a, b) {
  var i = {},
      c = {},
      k;

  if (a === null || typeof a !== "object") a = {};
  if (b === null || typeof b !== "object") b = {};

  for (k in b) {
    if (k in a) {
      i[k] = interpolate(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }

  return function(t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
}

var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
    reB = new RegExp(reA.source, "g");

function zero(b) {
  return function() {
    return b;
  };
}

function one(b) {
  return function(t) {
    return b(t) + "";
  };
}

function string(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
      am, // current match in a
      bm, // current match in b
      bs, // string preceding current number in b, if any
      i = -1, // index in s
      s = [], // string constants and placeholders
      q = []; // number interpolators

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(a))
      && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) { // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
      if (s[i]) s[i] += bm; // coalesce with previous string
      else s[++i] = bm;
    } else { // interpolate non-matching numbers
      s[++i] = null;
      q.push({i: i, x: interpolateNumber(am, bm)});
    }
    bi = reB.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs; // coalesce with previous string
    else s[++i] = bs;
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? (q[0]
      ? one(q[0].x)
      : zero(b))
      : (b = q.length, function(t) {
          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        });
}

function interpolate(a, b) {
  var t = typeof b, c;
  return b == null || t === "boolean" ? constant(b)
      : (t === "number" ? interpolateNumber
      : t === "string" ? ((c = color(b)) ? (b = c, rgb$1) : string)
      : b instanceof color ? rgb$1
      : b instanceof Date ? date
      : isNumberArray(b) ? numberArray
      : Array.isArray(b) ? genericArray
      : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
      : interpolateNumber)(a, b);
}

function interpolateRound(a, b) {
  return a = +a, b = +b, function(t) {
    return Math.round(a * (1 - t) + b * t);
  };
}

var epsilon2 = 1e-12;

function cosh(x) {
  return ((x = Math.exp(x)) + 1 / x) / 2;
}

function sinh(x) {
  return ((x = Math.exp(x)) - 1 / x) / 2;
}

function tanh(x) {
  return ((x = Math.exp(2 * x)) - 1) / (x + 1);
}

var interpolateZoom = (function zoomRho(rho, rho2, rho4) {

  // p0 = [ux0, uy0, w0]
  // p1 = [ux1, uy1, w1]
  function zoom(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
        ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
        dx = ux1 - ux0,
        dy = uy1 - uy0,
        d2 = dx * dx + dy * dy,
        i,
        S;

    // Special case for u0 ≅ u1.
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(rho * t * S)
        ];
      };
    }

    // General case.
    else {
      var d1 = Math.sqrt(d2),
          b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
          b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
          r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
          r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s = t * S,
            coshr0 = cosh(r0),
            u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0)
        ];
      };
    }

    i.duration = S * 1000 * rho / Math.SQRT2;

    return i;
  }

  zoom.rho = function(_) {
    var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
    return zoomRho(_1, _2, _4);
  };

  return zoom;
})(Math.SQRT2, 2, 4);

function piecewise(interpolate$1, values) {
  if (values === undefined) values = interpolate$1, interpolate$1 = interpolate;
  var i = 0, n = values.length - 1, v = values[0], I = new Array(n < 0 ? 0 : n);
  while (i < n) I[i] = interpolate$1(v, v = values[++i]);
  return function(t) {
    var i = Math.max(0, Math.min(n - 1, Math.floor(t *= n)));
    return I[i](t - i);
  };
}

function constants(x) {
  return function() {
    return x;
  };
}

function number$2(x) {
  return +x;
}

var unit = [0, 1];

function identity$2(x) {
  return x;
}

function normalize(a, b) {
  return (b -= (a = +a))
      ? function(x) { return (x - a) / b; }
      : constants(isNaN(b) ? NaN : 0.5);
}

function clamper(a, b) {
  var t;
  if (a > b) t = a, a = b, b = t;
  return function(x) { return Math.max(a, Math.min(b, x)); };
}

// normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
// interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
function bimap(domain, range, interpolate) {
  var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
  if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
  else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
  return function(x) { return r0(d0(x)); };
}

function polymap(domain, range, interpolate) {
  var j = Math.min(domain.length, range.length) - 1,
      d = new Array(j),
      r = new Array(j),
      i = -1;

  // Reverse descending domains.
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }

  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1]);
    r[i] = interpolate(range[i], range[i + 1]);
  }

  return function(x) {
    var i = bisectRight(domain, x, 1, j) - 1;
    return r[i](d[i](x));
  };
}

function copy(source, target) {
  return target
      .domain(source.domain())
      .range(source.range())
      .interpolate(source.interpolate())
      .clamp(source.clamp())
      .unknown(source.unknown());
}

function transformer() {
  var domain = unit,
      range = unit,
      interpolate$1 = interpolate,
      transform,
      untransform,
      unknown,
      clamp = identity$2,
      piecewise,
      output,
      input;

  function rescale() {
    var n = Math.min(domain.length, range.length);
    if (clamp !== identity$2) clamp = clamper(domain[0], domain[n - 1]);
    piecewise = n > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }

  function scale(x) {
    return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
  }

  scale.invert = function(y) {
    return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
  };

  scale.domain = function(_) {
    return arguments.length ? (domain = Array.from(_, number$2), rescale()) : domain.slice();
  };

  scale.range = function(_) {
    return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
  };

  scale.rangeRound = function(_) {
    return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
  };

  scale.clamp = function(_) {
    return arguments.length ? (clamp = _ ? true : identity$2, rescale()) : clamp !== identity$2;
  };

  scale.interpolate = function(_) {
    return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  return function(t, u) {
    transform = t, untransform = u;
    return rescale();
  };
}

function continuous() {
  return transformer()(identity$2, identity$2);
}

function tickFormat(start, stop, count, specifier) {
  var step = tickStep(start, stop, count),
      precision;
  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
      return formatPrefix(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return format(specifier);
}

function linearish(scale) {
  var domain = scale.domain;

  scale.ticks = function(count) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
  };

  scale.tickFormat = function(count, specifier) {
    var d = domain();
    return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
  };

  scale.nice = function(count) {
    if (count == null) count = 10;

    var d = domain();
    var i0 = 0;
    var i1 = d.length - 1;
    var start = d[i0];
    var stop = d[i1];
    var prestep;
    var step;
    var maxIter = 10;

    if (stop < start) {
      step = start, start = stop, stop = step;
      step = i0, i0 = i1, i1 = step;
    }
    
    while (maxIter-- > 0) {
      step = tickIncrement(start, stop, count);
      if (step === prestep) {
        d[i0] = start;
        d[i1] = stop;
        return domain(d);
      } else if (step > 0) {
        start = Math.floor(start / step) * step;
        stop = Math.ceil(stop / step) * step;
      } else if (step < 0) {
        start = Math.ceil(start * step) / step;
        stop = Math.floor(stop * step) / step;
      } else {
        break;
      }
      prestep = step;
    }

    return scale;
  };

  return scale;
}

function linear$1() {
  var scale = continuous();

  scale.copy = function() {
    return copy(scale, linear$1());
  };

  initRange.apply(scale, arguments);

  return linearish(scale);
}

function identity$3(domain) {
  var unknown;

  function scale(x) {
    return isNaN(x = +x) ? unknown : x;
  }

  scale.invert = scale;

  scale.domain = scale.range = function(_) {
    return arguments.length ? (domain = Array.from(_, number$2), scale) : domain.slice();
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.copy = function() {
    return identity$3(domain).unknown(unknown);
  };

  domain = arguments.length ? Array.from(domain, number$2) : [0, 1];

  return linearish(scale);
}

function nice(domain, interval) {
  domain = domain.slice();

  var i0 = 0,
      i1 = domain.length - 1,
      x0 = domain[i0],
      x1 = domain[i1],
      t;

  if (x1 < x0) {
    t = i0, i0 = i1, i1 = t;
    t = x0, x0 = x1, x1 = t;
  }

  domain[i0] = interval.floor(x0);
  domain[i1] = interval.ceil(x1);
  return domain;
}

function transformLog(x) {
  return Math.log(x);
}

function transformExp(x) {
  return Math.exp(x);
}

function transformLogn(x) {
  return -Math.log(-x);
}

function transformExpn(x) {
  return -Math.exp(-x);
}

function pow10(x) {
  return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
}

function powp(base) {
  return base === 10 ? pow10
      : base === Math.E ? Math.exp
      : function(x) { return Math.pow(base, x); };
}

function logp(base) {
  return base === Math.E ? Math.log
      : base === 10 && Math.log10
      || base === 2 && Math.log2
      || (base = Math.log(base), function(x) { return Math.log(x) / base; });
}

function reflect(f) {
  return function(x) {
    return -f(-x);
  };
}

function loggish(transform) {
  var scale = transform(transformLog, transformExp),
      domain = scale.domain,
      base = 10,
      logs,
      pows;

  function rescale() {
    logs = logp(base), pows = powp(base);
    if (domain()[0] < 0) {
      logs = reflect(logs), pows = reflect(pows);
      transform(transformLogn, transformExpn);
    } else {
      transform(transformLog, transformExp);
    }
    return scale;
  }

  scale.base = function(_) {
    return arguments.length ? (base = +_, rescale()) : base;
  };

  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };

  scale.ticks = function(count) {
    var d = domain(),
        u = d[0],
        v = d[d.length - 1],
        r;

    if (r = v < u) i = u, u = v, v = i;

    var i = logs(u),
        j = logs(v),
        p,
        k,
        t,
        n = count == null ? 10 : +count,
        z = [];

    if (!(base % 1) && j - i < n) {
      i = Math.floor(i), j = Math.ceil(j);
      if (u > 0) for (; i <= j; ++i) {
        for (k = 1, p = pows(i); k < base; ++k) {
          t = p * k;
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      } else for (; i <= j; ++i) {
        for (k = base - 1, p = pows(i); k >= 1; --k) {
          t = p * k;
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      }
      if (z.length * 2 < n) z = ticks(u, v, n);
    } else {
      z = ticks(i, j, Math.min(j - i, n)).map(pows);
    }

    return r ? z.reverse() : z;
  };

  scale.tickFormat = function(count, specifier) {
    if (specifier == null) specifier = base === 10 ? ".0e" : ",";
    if (typeof specifier !== "function") specifier = format(specifier);
    if (count === Infinity) return specifier;
    if (count == null) count = 10;
    var k = Math.max(1, base * count / scale.ticks().length); // TODO fast estimate?
    return function(d) {
      var i = d / pows(Math.round(logs(d)));
      if (i * base < base - 0.5) i *= base;
      return i <= k ? specifier(d) : "";
    };
  };

  scale.nice = function() {
    return domain(nice(domain(), {
      floor: function(x) { return pows(Math.floor(logs(x))); },
      ceil: function(x) { return pows(Math.ceil(logs(x))); }
    }));
  };

  return scale;
}

function log() {
  var scale = loggish(transformer()).domain([1, 10]);

  scale.copy = function() {
    return copy(scale, log()).base(scale.base());
  };

  initRange.apply(scale, arguments);

  return scale;
}

function transformSymlog(c) {
  return function(x) {
    return Math.sign(x) * Math.log1p(Math.abs(x / c));
  };
}

function transformSymexp(c) {
  return function(x) {
    return Math.sign(x) * Math.expm1(Math.abs(x)) * c;
  };
}

function symlogish(transform) {
  var c = 1, scale = transform(transformSymlog(c), transformSymexp(c));

  scale.constant = function(_) {
    return arguments.length ? transform(transformSymlog(c = +_), transformSymexp(c)) : c;
  };

  return linearish(scale);
}

function symlog() {
  var scale = symlogish(transformer());

  scale.copy = function() {
    return copy(scale, symlog()).constant(scale.constant());
  };

  return initRange.apply(scale, arguments);
}

function transformPow(exponent) {
  return function(x) {
    return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
  };
}

function transformSqrt(x) {
  return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
}

function transformSquare(x) {
  return x < 0 ? -x * x : x * x;
}

function powish(transform) {
  var scale = transform(identity$2, identity$2),
      exponent = 1;

  function rescale() {
    return exponent === 1 ? transform(identity$2, identity$2)
        : exponent === 0.5 ? transform(transformSqrt, transformSquare)
        : transform(transformPow(exponent), transformPow(1 / exponent));
  }

  scale.exponent = function(_) {
    return arguments.length ? (exponent = +_, rescale()) : exponent;
  };

  return linearish(scale);
}

function pow() {
  var scale = powish(transformer());

  scale.copy = function() {
    return copy(scale, pow()).exponent(scale.exponent());
  };

  initRange.apply(scale, arguments);

  return scale;
}

function sqrt() {
  return pow.apply(null, arguments).exponent(0.5);
}

function square(x) {
  return Math.sign(x) * x * x;
}

function unsquare(x) {
  return Math.sign(x) * Math.sqrt(Math.abs(x));
}

function radial() {
  var squared = continuous(),
      range = [0, 1],
      round = false,
      unknown;

  function scale(x) {
    var y = unsquare(squared(x));
    return isNaN(y) ? unknown : round ? Math.round(y) : y;
  }

  scale.invert = function(y) {
    return squared.invert(square(y));
  };

  scale.domain = function(_) {
    return arguments.length ? (squared.domain(_), scale) : squared.domain();
  };

  scale.range = function(_) {
    return arguments.length ? (squared.range((range = Array.from(_, number$2)).map(square)), scale) : range.slice();
  };

  scale.rangeRound = function(_) {
    return scale.range(_).round(true);
  };

  scale.round = function(_) {
    return arguments.length ? (round = !!_, scale) : round;
  };

  scale.clamp = function(_) {
    return arguments.length ? (squared.clamp(_), scale) : squared.clamp();
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.copy = function() {
    return radial(squared.domain(), range)
        .round(round)
        .clamp(squared.clamp())
        .unknown(unknown);
  };

  initRange.apply(scale, arguments);

  return linearish(scale);
}

function quantile$1() {
  var domain = [],
      range = [],
      thresholds = [],
      unknown;

  function rescale() {
    var i = 0, n = Math.max(1, range.length);
    thresholds = new Array(n - 1);
    while (++i < n) thresholds[i - 1] = quantileSorted(domain, i / n);
    return scale;
  }

  function scale(x) {
    return isNaN(x = +x) ? unknown : range[bisectRight(thresholds, x)];
  }

  scale.invertExtent = function(y) {
    var i = range.indexOf(y);
    return i < 0 ? [NaN, NaN] : [
      i > 0 ? thresholds[i - 1] : domain[0],
      i < thresholds.length ? thresholds[i] : domain[domain.length - 1]
    ];
  };

  scale.domain = function(_) {
    if (!arguments.length) return domain.slice();
    domain = [];
    for (let d of _) if (d != null && !isNaN(d = +d)) domain.push(d);
    domain.sort(ascending);
    return rescale();
  };

  scale.range = function(_) {
    return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.quantiles = function() {
    return thresholds.slice();
  };

  scale.copy = function() {
    return quantile$1()
        .domain(domain)
        .range(range)
        .unknown(unknown);
  };

  return initRange.apply(scale, arguments);
}

function quantize() {
  var x0 = 0,
      x1 = 1,
      n = 1,
      domain = [0.5],
      range = [0, 1],
      unknown;

  function scale(x) {
    return x <= x ? range[bisectRight(domain, x, 0, n)] : unknown;
  }

  function rescale() {
    var i = -1;
    domain = new Array(n);
    while (++i < n) domain[i] = ((i + 1) * x1 - (i - n) * x0) / (n + 1);
    return scale;
  }

  scale.domain = function(_) {
    return arguments.length ? ([x0, x1] = _, x0 = +x0, x1 = +x1, rescale()) : [x0, x1];
  };

  scale.range = function(_) {
    return arguments.length ? (n = (range = Array.from(_)).length - 1, rescale()) : range.slice();
  };

  scale.invertExtent = function(y) {
    var i = range.indexOf(y);
    return i < 0 ? [NaN, NaN]
        : i < 1 ? [x0, domain[0]]
        : i >= n ? [domain[n - 1], x1]
        : [domain[i - 1], domain[i]];
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : scale;
  };

  scale.thresholds = function() {
    return domain.slice();
  };

  scale.copy = function() {
    return quantize()
        .domain([x0, x1])
        .range(range)
        .unknown(unknown);
  };

  return initRange.apply(linearish(scale), arguments);
}

function threshold() {
  var domain = [0.5],
      range = [0, 1],
      unknown,
      n = 1;

  function scale(x) {
    return x <= x ? range[bisectRight(domain, x, 0, n)] : unknown;
  }

  scale.domain = function(_) {
    return arguments.length ? (domain = Array.from(_), n = Math.min(domain.length, range.length - 1), scale) : domain.slice();
  };

  scale.range = function(_) {
    return arguments.length ? (range = Array.from(_), n = Math.min(domain.length, range.length - 1), scale) : range.slice();
  };

  scale.invertExtent = function(y) {
    var i = range.indexOf(y);
    return [domain[i - 1], domain[i]];
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.copy = function() {
    return threshold()
        .domain(domain)
        .range(range)
        .unknown(unknown);
  };

  return initRange.apply(scale, arguments);
}

var durationSecond$1 = 1000,
    durationMinute$1 = durationSecond$1 * 60,
    durationHour$1 = durationMinute$1 * 60,
    durationDay$1 = durationHour$1 * 24,
    durationWeek$1 = durationDay$1 * 7,
    durationMonth = durationDay$1 * 30,
    durationYear = durationDay$1 * 365;

function date$1(t) {
  return new Date(t);
}

function number$3(t) {
  return t instanceof Date ? +t : +new Date(+t);
}

function calendar(year, month, week, day, hour, minute, second, millisecond, format) {
  var scale = continuous(),
      invert = scale.invert,
      domain = scale.domain;

  var formatMillisecond = format(".%L"),
      formatSecond = format(":%S"),
      formatMinute = format("%I:%M"),
      formatHour = format("%I %p"),
      formatDay = format("%a %d"),
      formatWeek = format("%b %d"),
      formatMonth = format("%B"),
      formatYear = format("%Y");

  var tickIntervals = [
    [second,  1,      durationSecond$1],
    [second,  5,  5 * durationSecond$1],
    [second, 15, 15 * durationSecond$1],
    [second, 30, 30 * durationSecond$1],
    [minute,  1,      durationMinute$1],
    [minute,  5,  5 * durationMinute$1],
    [minute, 15, 15 * durationMinute$1],
    [minute, 30, 30 * durationMinute$1],
    [  hour,  1,      durationHour$1  ],
    [  hour,  3,  3 * durationHour$1  ],
    [  hour,  6,  6 * durationHour$1  ],
    [  hour, 12, 12 * durationHour$1  ],
    [   day,  1,      durationDay$1   ],
    [   day,  2,  2 * durationDay$1   ],
    [  week,  1,      durationWeek$1  ],
    [ month,  1,      durationMonth ],
    [ month,  3,  3 * durationMonth ],
    [  year,  1,      durationYear  ]
  ];

  function tickFormat(date) {
    return (second(date) < date ? formatMillisecond
        : minute(date) < date ? formatSecond
        : hour(date) < date ? formatMinute
        : day(date) < date ? formatHour
        : month(date) < date ? (week(date) < date ? formatDay : formatWeek)
        : year(date) < date ? formatMonth
        : formatYear)(date);
  }

  function tickInterval(interval, start, stop) {
    if (interval == null) interval = 10;

    // If a desired tick count is specified, pick a reasonable tick interval
    // based on the extent of the domain and a rough estimate of tick size.
    // Otherwise, assume interval is already a time interval and use it.
    if (typeof interval === "number") {
      var target = Math.abs(stop - start) / interval,
          i = bisector(function(i) { return i[2]; }).right(tickIntervals, target),
          step;
      if (i === tickIntervals.length) {
        step = tickStep(start / durationYear, stop / durationYear, interval);
        interval = year;
      } else if (i) {
        i = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
        step = i[1];
        interval = i[0];
      } else {
        step = Math.max(tickStep(start, stop, interval), 1);
        interval = millisecond;
      }
      return interval.every(step);
    }

    return interval;
  }

  scale.invert = function(y) {
    return new Date(invert(y));
  };

  scale.domain = function(_) {
    return arguments.length ? domain(Array.from(_, number$3)) : domain().map(date$1);
  };

  scale.ticks = function(interval) {
    var d = domain(),
        t0 = d[0],
        t1 = d[d.length - 1],
        r = t1 < t0,
        t;
    if (r) t = t0, t0 = t1, t1 = t;
    t = tickInterval(interval, t0, t1);
    t = t ? t.range(t0, t1 + 1) : []; // inclusive stop
    return r ? t.reverse() : t;
  };

  scale.tickFormat = function(count, specifier) {
    return specifier == null ? tickFormat : format(specifier);
  };

  scale.nice = function(interval) {
    var d = domain();
    return (interval = tickInterval(interval, d[0], d[d.length - 1]))
        ? domain(nice(d, interval))
        : scale;
  };

  scale.copy = function() {
    return copy(scale, calendar(year, month, week, day, hour, minute, second, millisecond, format));
  };

  return scale;
}

function time() {
  return initRange.apply(calendar(year, month, sunday, day, hour, minute, second, millisecond, timeFormat).domain([new Date(2000, 0, 1), new Date(2000, 0, 2)]), arguments);
}

function utcTime() {
  return initRange.apply(calendar(utcYear, utcMonth, utcSunday, utcDay, utcHour, utcMinute, second, millisecond, utcFormat).domain([Date.UTC(2000, 0, 1), Date.UTC(2000, 0, 2)]), arguments);
}

function transformer$1() {
  var x0 = 0,
      x1 = 1,
      t0,
      t1,
      k10,
      transform,
      interpolator = identity$2,
      clamp = false,
      unknown;

  function scale(x) {
    return isNaN(x = +x) ? unknown : interpolator(k10 === 0 ? 0.5 : (x = (transform(x) - t0) * k10, clamp ? Math.max(0, Math.min(1, x)) : x));
  }

  scale.domain = function(_) {
    return arguments.length ? ([x0, x1] = _, t0 = transform(x0 = +x0), t1 = transform(x1 = +x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0), scale) : [x0, x1];
  };

  scale.clamp = function(_) {
    return arguments.length ? (clamp = !!_, scale) : clamp;
  };

  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };

  function range(interpolate) {
    return function(_) {
      var r0, r1;
      return arguments.length ? ([r0, r1] = _, interpolator = interpolate(r0, r1), scale) : [interpolator(0), interpolator(1)];
    };
  }

  scale.range = range(interpolate);

  scale.rangeRound = range(interpolateRound);

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  return function(t) {
    transform = t, t0 = t(x0), t1 = t(x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0);
    return scale;
  };
}

function copy$1(source, target) {
  return target
      .domain(source.domain())
      .interpolator(source.interpolator())
      .clamp(source.clamp())
      .unknown(source.unknown());
}

function sequential() {
  var scale = linearish(transformer$1()(identity$2));

  scale.copy = function() {
    return copy$1(scale, sequential());
  };

  return initInterpolator.apply(scale, arguments);
}

function sequentialLog() {
  var scale = loggish(transformer$1()).domain([1, 10]);

  scale.copy = function() {
    return copy$1(scale, sequentialLog()).base(scale.base());
  };

  return initInterpolator.apply(scale, arguments);
}

function sequentialSymlog() {
  var scale = symlogish(transformer$1());

  scale.copy = function() {
    return copy$1(scale, sequentialSymlog()).constant(scale.constant());
  };

  return initInterpolator.apply(scale, arguments);
}

function sequentialPow() {
  var scale = powish(transformer$1());

  scale.copy = function() {
    return copy$1(scale, sequentialPow()).exponent(scale.exponent());
  };

  return initInterpolator.apply(scale, arguments);
}

function sequentialSqrt() {
  return sequentialPow.apply(null, arguments).exponent(0.5);
}

function sequentialQuantile() {
  var domain = [],
      interpolator = identity$2;

  function scale(x) {
    if (!isNaN(x = +x)) return interpolator((bisectRight(domain, x, 1) - 1) / (domain.length - 1));
  }

  scale.domain = function(_) {
    if (!arguments.length) return domain.slice();
    domain = [];
    for (let d of _) if (d != null && !isNaN(d = +d)) domain.push(d);
    domain.sort(ascending);
    return scale;
  };

  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };

  scale.range = function() {
    return domain.map((d, i) => interpolator(i / (domain.length - 1)));
  };

  scale.quantiles = function(n) {
    return Array.from({length: n + 1}, (_, i) => quantile(domain, i / n));
  };

  scale.copy = function() {
    return sequentialQuantile(interpolator).domain(domain);
  };

  return initInterpolator.apply(scale, arguments);
}

function transformer$2() {
  var x0 = 0,
      x1 = 0.5,
      x2 = 1,
      s = 1,
      t0,
      t1,
      t2,
      k10,
      k21,
      interpolator = identity$2,
      transform,
      clamp = false,
      unknown;

  function scale(x) {
    return isNaN(x = +x) ? unknown : (x = 0.5 + ((x = +transform(x)) - t1) * (s * x < s * t1 ? k10 : k21), interpolator(clamp ? Math.max(0, Math.min(1, x)) : x));
  }

  scale.domain = function(_) {
    return arguments.length ? ([x0, x1, x2] = _, t0 = transform(x0 = +x0), t1 = transform(x1 = +x1), t2 = transform(x2 = +x2), k10 = t0 === t1 ? 0 : 0.5 / (t1 - t0), k21 = t1 === t2 ? 0 : 0.5 / (t2 - t1), s = t1 < t0 ? -1 : 1, scale) : [x0, x1, x2];
  };

  scale.clamp = function(_) {
    return arguments.length ? (clamp = !!_, scale) : clamp;
  };

  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };

  function range(interpolate) {
    return function(_) {
      var r0, r1, r2;
      return arguments.length ? ([r0, r1, r2] = _, interpolator = piecewise(interpolate, [r0, r1, r2]), scale) : [interpolator(0), interpolator(0.5), interpolator(1)];
    };
  }

  scale.range = range(interpolate);

  scale.rangeRound = range(interpolateRound);

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  return function(t) {
    transform = t, t0 = t(x0), t1 = t(x1), t2 = t(x2), k10 = t0 === t1 ? 0 : 0.5 / (t1 - t0), k21 = t1 === t2 ? 0 : 0.5 / (t2 - t1), s = t1 < t0 ? -1 : 1;
    return scale;
  };
}

function diverging() {
  var scale = linearish(transformer$2()(identity$2));

  scale.copy = function() {
    return copy$1(scale, diverging());
  };

  return initInterpolator.apply(scale, arguments);
}

function divergingLog() {
  var scale = loggish(transformer$2()).domain([0.1, 1, 10]);

  scale.copy = function() {
    return copy$1(scale, divergingLog()).base(scale.base());
  };

  return initInterpolator.apply(scale, arguments);
}

function divergingSymlog() {
  var scale = symlogish(transformer$2());

  scale.copy = function() {
    return copy$1(scale, divergingSymlog()).constant(scale.constant());
  };

  return initInterpolator.apply(scale, arguments);
}

function divergingPow() {
  var scale = powish(transformer$2());

  scale.copy = function() {
    return copy$1(scale, divergingPow()).exponent(scale.exponent());
  };

  return initInterpolator.apply(scale, arguments);
}

function divergingSqrt() {
  return divergingPow.apply(null, arguments).exponent(0.5);
}

var scales = /*#__PURE__*/Object.freeze({
  __proto__: null,
  scaleBand: band,
  scalePoint: point,
  scaleIdentity: identity$3,
  scaleLinear: linear$1,
  scaleLog: log,
  scaleSymlog: symlog,
  scaleOrdinal: ordinal,
  scaleImplicit: implicit,
  scalePow: pow,
  scaleSqrt: sqrt,
  scaleRadial: radial,
  scaleQuantile: quantile$1,
  scaleQuantize: quantize,
  scaleThreshold: threshold,
  scaleTime: time,
  scaleUtc: utcTime,
  scaleSequential: sequential,
  scaleSequentialLog: sequentialLog,
  scaleSequentialPow: sequentialPow,
  scaleSequentialSqrt: sequentialSqrt,
  scaleSequentialSymlog: sequentialSymlog,
  scaleSequentialQuantile: sequentialQuantile,
  scaleDiverging: diverging,
  scaleDivergingLog: divergingLog,
  scaleDivergingPow: divergingPow,
  scaleDivergingSqrt: divergingSqrt,
  scaleDivergingSymlog: divergingSymlog,
  tickFormat: tickFormat
});

// Note(cg): allowed scales
const scaleNames = {
  'linear': 'continuous',
  'pow': 'continuous',
  'sqrt': 'continuous',
  'log': 'continuous',
  'identity': 'continuous',
  'time': 'continuous',
  'sequential': 'sequential',
  'quantize': 'quantize',
  'quantile': 'quantile',
  'threshold': 'threshold',
  'ordinal': 'ordinal',
  'band': 'ordinal',
  'point': 'ordinal'
};


const hasChanged = (val, old) => {
  return (val !== old) || (JSON.stringify(val || []) !== JSON.stringify(old || []))
};

const props$1 = {};
Object.keys(scaleNames).forEach(name => {
  const instance = scales[`scale${capitalize(name)}`]();
  const keys = Object.keys(instance || {});
  shapeProperties(keys, props$1);
});


class D3Scale extends LitElement {

  get family() {
    if (this.type) {
      return scaleNames[this.type];
    }
    return null;
  }

  static get properties() {

    return {

      ...props$1,

      scaleType: {
        type: String,
        attribute: 'scale-type'
      },

      domain: {
        type: Array,
        hasChanged: hasChanged
      },
      
      range: {
        type: Array,
        hasChanged: hasChanged
      },

      clamp: {
        type: Boolean
      }
    };
  }

  constructor() {
    super();
    this.__init = true;
  }

  update(props) {
    if (!this.scaleType && !props.has('scaleType')) {
      this.scaleType = 'linear';
    }

    if (!this.scale || props.has('scaleType')) {
      this.scale = scales[`scale${capitalize(this.scaleType)}`]();
      // Note(cg): we need a way to know the type of scale (e.g. to know if a scale is contiuous in multi-group)
      this.scale.scaleType = this.scaleType;
      this.scale.category = scaleNames[this.scaleType];
    }

    if (this.scale) {
      this.updateWrapper(props);
    }
    super.update(props);
  }

  updateWrapper(props, shallNotify) {
    // let shallNotify = this.__init;
    // props.forEach((value, key) => {
    //   if ((this[key] !== undefined) && key !== 'scale' && key !== 'scaleType' && this.scale[key]) {
    //     shallNotify = true;
    //     this.log && console.info(`d3-scale ${this.type} updates ${key} to ${JSON.stringify(this[key])}`);
    //     this.scale[key](this[key]);
    //   }
    // });
    Object.keys(this.scale).filter(key => key !== 'scaleType' && key !== 'category').forEach(key => {
      if ((this[key] !== undefined)) {
        shallNotify = true;
        this.scale[key](this[key]);
      }
    });
    if (shallNotify) {
      this.dispatchEvent(new CustomEvent(`scale-changed`, { detail: { value: this.scale, type: this.scaleType }, bubbles: true, composed: true }));
      delete this.__init;
    }
  }
}

// Computes the decimal coefficient and exponent of the specified number x with
// significant digits p, where x is positive and p is in [1, 21] or undefined.
// For example, formatDecimal(1.23) returns ["123", 0].
function formatDecimal$1(x, p) {
  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
  var i, coefficient = x.slice(0, i);

  // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
  // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x.slice(i + 1)
  ];
}

function exponent$1(x) {
  return x = formatDecimal$1(Math.abs(x)), x ? x[1] : NaN;
}

function formatGroup$1(grouping, thousands) {
  return function(value, width) {
    var i = value.length,
        t = [],
        j = 0,
        g = grouping[0],
        length = 0;

    while (i > 0 && g > 0) {
      if (length + g + 1 > width) g = Math.max(1, width - length);
      t.push(value.substring(i -= g, i + g));
      if ((length += g + 1) > width) break;
      g = grouping[j = (j + 1) % grouping.length];
    }

    return t.reverse().join(thousands);
  };
}

function formatDefault(x, p) {
  x = x.toPrecision(p);

  out: for (var n = x.length, i = 1, i0 = -1, i1; i < n; ++i) {
    switch (x[i]) {
      case ".": i0 = i1 = i; break;
      case "0": if (i0 === 0) i0 = i; i1 = i; break;
      case "e": break out;
      default: if (i0 > 0) i0 = 0; break;
    }
  }

  return i0 > 0 ? x.slice(0, i0) + x.slice(i1 + 1) : x;
}

var prefixExponent$1;

function formatPrefixAuto$1(x, p) {
  var d = formatDecimal$1(x, p);
  if (!d) return x + "";
  var coefficient = d[0],
      exponent = d[1],
      i = exponent - (prefixExponent$1 = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
      n = coefficient.length;
  return i === n ? coefficient
      : i > n ? coefficient + new Array(i - n + 1).join("0")
      : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
      : "0." + new Array(1 - i).join("0") + formatDecimal$1(x, Math.max(0, p + i - 1))[0]; // less than 1y!
}

function formatRounded$1(x, p) {
  var d = formatDecimal$1(x, p);
  if (!d) return x + "";
  var coefficient = d[0],
      exponent = d[1];
  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
      : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
      : coefficient + new Array(exponent - coefficient.length + 2).join("0");
}

var formatTypes$1 = {
  "": formatDefault,
  "%": function(x, p) { return (x * 100).toFixed(p); },
  "b": function(x) { return Math.round(x).toString(2); },
  "c": function(x) { return x + ""; },
  "d": function(x) { return Math.round(x).toString(10); },
  "e": function(x, p) { return x.toExponential(p); },
  "f": function(x, p) { return x.toFixed(p); },
  "g": function(x, p) { return x.toPrecision(p); },
  "o": function(x) { return Math.round(x).toString(8); },
  "p": function(x, p) { return formatRounded$1(x * 100, p); },
  "r": formatRounded$1,
  "s": formatPrefixAuto$1,
  "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
  "x": function(x) { return Math.round(x).toString(16); }
};

// [[fill]align][sign][symbol][0][width][,][.precision][type]
var re$1 = /^(?:(.)?([<>=^]))?([+\-\( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?([a-z%])?$/i;

function formatSpecifier$1(specifier) {
  return new FormatSpecifier$1(specifier);
}

function FormatSpecifier$1(specifier) {
  if (!(match = re$1.exec(specifier))) throw new Error("invalid format: " + specifier);

  var match,
      fill = match[1] || " ",
      align = match[2] || ">",
      sign = match[3] || "-",
      symbol = match[4] || "",
      zero = !!match[5],
      width = match[6] && +match[6],
      comma = !!match[7],
      precision = match[8] && +match[8].slice(1),
      type = match[9] || "";

  // The "n" type is an alias for ",g".
  if (type === "n") comma = true, type = "g";

  // Map invalid types to the default format.
  else if (!formatTypes$1[type]) type = "";

  // If zero fill is specified, padding goes after sign and before digits.
  if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

  this.fill = fill;
  this.align = align;
  this.sign = sign;
  this.symbol = symbol;
  this.zero = zero;
  this.width = width;
  this.comma = comma;
  this.precision = precision;
  this.type = type;
}

FormatSpecifier$1.prototype.toString = function() {
  return this.fill
      + this.align
      + this.sign
      + this.symbol
      + (this.zero ? "0" : "")
      + (this.width == null ? "" : Math.max(1, this.width | 0))
      + (this.comma ? "," : "")
      + (this.precision == null ? "" : "." + Math.max(0, this.precision | 0))
      + this.type;
};

var prefixes$1 = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

function identity$4(x) {
  return x;
}

function formatLocale$2(locale) {
  var group = locale.grouping && locale.thousands ? formatGroup$1(locale.grouping, locale.thousands) : identity$4,
      currency = locale.currency,
      decimal = locale.decimal;

  function newFormat(specifier) {
    specifier = formatSpecifier$1(specifier);

    var fill = specifier.fill,
        align = specifier.align,
        sign = specifier.sign,
        symbol = specifier.symbol,
        zero = specifier.zero,
        width = specifier.width,
        comma = specifier.comma,
        precision = specifier.precision,
        type = specifier.type;

    // Compute the prefix and suffix.
    // For SI-prefix, the suffix is lazily computed.
    var prefix = symbol === "$" ? currency[0] : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
        suffix = symbol === "$" ? currency[1] : /[%p]/.test(type) ? "%" : "";

    // What format function should we use?
    // Is this an integer type?
    // Can this type generate exponential notation?
    var formatType = formatTypes$1[type],
        maybeSuffix = !type || /[defgprs%]/.test(type);

    // Set the default precision if not specified,
    // or clamp the specified precision to the supported range.
    // For significant precision, it must be in [1, 21].
    // For fixed precision, it must be in [0, 20].
    precision = precision == null ? (type ? 6 : 12)
        : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
        : Math.max(0, Math.min(20, precision));

    function format(value) {
      var valuePrefix = prefix,
          valueSuffix = suffix,
          i, n, c;

      if (type === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;

        // Convert negative to positive, and compute the prefix.
        // Note that -0 is not less than 0, but 1 / -0 is!
        var valueNegative = (value < 0 || 1 / value < 0) && (value *= -1, true);

        // Perform the initial formatting.
        value = formatType(value, precision);

        // If the original value was negative, it may be rounded to zero during
        // formatting; treat this as (positive) zero.
        if (valueNegative) {
          i = -1, n = value.length;
          valueNegative = false;
          while (++i < n) {
            if (c = value.charCodeAt(i), (48 < c && c < 58)
                || (type === "x" && 96 < c && c < 103)
                || (type === "X" && 64 < c && c < 71)) {
              valueNegative = true;
              break;
            }
          }
        }

        // Compute the prefix and suffix.
        valuePrefix = (valueNegative ? (sign === "(" ? sign : "-") : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
        valueSuffix = valueSuffix + (type === "s" ? prefixes$1[8 + prefixExponent$1 / 3] : "") + (valueNegative && sign === "(" ? ")" : "");

        // Break the formatted value into the integer “value” part that can be
        // grouped, and fractional or exponential “suffix” part that is not.
        if (maybeSuffix) {
          i = -1, n = value.length;
          while (++i < n) {
            if (c = value.charCodeAt(i), 48 > c || c > 57) {
              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }

      // If the fill character is not "0", grouping is applied before padding.
      if (comma && !zero) value = group(value, Infinity);

      // Compute the padding.
      var length = valuePrefix.length + value.length + valueSuffix.length,
          padding = length < width ? new Array(width - length + 1).join(fill) : "";

      // If the fill character is "0", grouping is applied after padding.
      if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

      // Reconstruct the final output based on the desired alignment.
      switch (align) {
        case "<": return valuePrefix + value + valueSuffix + padding;
        case "=": return valuePrefix + padding + value + valueSuffix;
        case "^": return padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
      }
      return padding + valuePrefix + value + valueSuffix;
    }

    format.toString = function() {
      return specifier + "";
    };

    return format;
  }

  function formatPrefix(specifier, value) {
    var f = newFormat((specifier = formatSpecifier$1(specifier), specifier.type = "f", specifier)),
        e = Math.max(-8, Math.min(8, Math.floor(exponent$1(value) / 3))) * 3,
        k = Math.pow(10, -e),
        prefix = prefixes$1[8 + e / 3];
    return function(value) {
      return f(k * value) + prefix;
    };
  }

  return {
    format: newFormat,
    formatPrefix: formatPrefix
  };
}

var locale$2;
var format$1;
var formatPrefix$1;

defaultLocale$2({
  decimal: ".",
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});

function defaultLocale$2(definition) {
  locale$2 = formatLocale$2(definition);
  format$1 = locale$2.format;
  formatPrefix$1 = locale$2.formatPrefix;
  return locale$2;
}

function precisionFixed$1(step) {
  return Math.max(0, -exponent$1(Math.abs(step)));
}

function precisionPrefix$1(step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent$1(value) / 3))) * 3 - exponent$1(Math.abs(step)));
}

function precisionRound$1(step, max) {
  step = Math.abs(step), max = Math.abs(max) - step;
  return Math.max(0, exponent$1(max) - exponent$1(step)) + 1;
}

const d3_identity = d => d;

const d3_reverse = arr => {
  const mirror = [];
  for (let i = 0, l = arr.length; i < l; i++) {
    mirror[i] = arr[l - i - 1];
  }
  return mirror
};

//Text wrapping code adapted from Mike Bostock
const d3_textWrapping = (text, width) => {
  text.each(function() {
    var text = select(this),
      words = text
        .text()
        .split(/\s+/)
        .reverse(),
      word,
      line = [],
      lineHeight = 1.2, //ems
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")) || 0,
      tspan = text
        .text(null)
        .append("tspan")
        .attr("x", 0)
        .attr("dy", dy + "em");

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width && line.length > 1) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", 0)
          .attr("dy", lineHeight + dy + "em")
          .text(word);
      }
    }
  });
};

const d3_mergeLabels = (gen = [], labels, domain, range, labelDelimiter) => {
  if (typeof labels === "object") {
    if (labels.length === 0) return gen

    let i = labels.length;
    for (; i < gen.length; i++) {
      labels.push(gen[i]);
    }
    return labels
  } else if (typeof labels === "function") {
    const customLabels = [];
    const genLength = gen.length;
    for (let i = 0; i < genLength; i++) {
      customLabels.push(
        labels({
          i,
          genLength,
          generatedLabels: gen,
          domain,
          range,
          labelDelimiter
        })
      );
    }
    return customLabels
  }

  return gen
};

const d3_linearLegend = (scale, cells, labelFormat) => {
  let data = [];

  if (cells.length > 1) {
    data = cells;
  } else {
    const domain = scale.domain(),
      increment = (domain[domain.length - 1] - domain[0]) / (cells - 1);
    let i = 0;

    for (; i < cells; i++) {
      data.push(domain[0] + i * increment);
    }
  }

  const labels = data.map(labelFormat);
  return {
    data: data,
    labels: labels,
    feature: d => scale(d)
  }
};

const d3_quantLegend = (scale, labelFormat, labelDelimiter) => {
  const labels = scale.range().map(d => {
    const invert = scale.invertExtent(d);
    return (
      labelFormat(invert[0]) +
      " " +
      labelDelimiter +
      " " +
      labelFormat(invert[1])
    )
  });

  return {
    data: scale.range(),
    labels: labels,
    feature: d3_identity
  }
};

const d3_ordinalLegend = scale => ({
  data: scale.domain(),
  labels: scale.domain(),
  feature: d => scale(d)
});

const d3_cellOver = (cellDispatcher, d, obj) => {
  cellDispatcher.call("cellover", obj, d);
};

const d3_cellOut = (cellDispatcher, d, obj) => {
  cellDispatcher.call("cellout", obj, d);
};

const d3_cellClick = (cellDispatcher, d, obj) => {
  cellDispatcher.call("cellclick", obj, d);
};

var helper = {
  d3_drawShapes: (
    shape,
    shapes,
    shapeHeight,
    shapeWidth,
    shapeRadius,
    path
  ) => {
    if (shape === "rect") {
      shapes.attr("height", shapeHeight).attr("width", shapeWidth);
    } else if (shape === "circle") {
      shapes.attr("r", shapeRadius);
    } else if (shape === "line") {
      shapes
        .attr("x1", 0)
        .attr("x2", shapeWidth)
        .attr("y1", 0)
        .attr("y2", 0);
    } else if (shape === "path") {
      shapes.attr("d", path);
    }
  },

  d3_addText: function(svg, enter, labels, classPrefix, labelWidth) {
    return Promise.all(labels).then(resolvedLabels => {
      enter.append("text").attr("class", classPrefix + "label");
      const text = svg
        .selectAll(`g.${classPrefix}cell text.${classPrefix}label`)
        .data(resolvedLabels)
        .text(d3_identity);

      text.exit().remove();

      if (labelWidth) {
        svg
          .selectAll(`g.${classPrefix}cell text.${classPrefix}label`)
          .call(d3_textWrapping, labelWidth);
      }
      return text
    })
  },

  d3_calcType: function(
    scale,
    ascending,
    cells,
    labels,
    labelFormat,
    labelDelimiter
  ) {
    const type = scale.invertExtent
      ? d3_quantLegend(scale, labelFormat, labelDelimiter)
      : scale.ticks
        ? d3_linearLegend(scale, cells, labelFormat)
        : d3_ordinalLegend(scale);

    //for d3.scaleSequential that doesn't have a range function
    const range = (scale.range && scale.range()) || scale.domain();
    type.labels = d3_mergeLabels(
      type.labels,
      labels,
      scale.domain(),
      range,
      labelDelimiter
    );

    if (ascending) {
      type.labels = d3_reverse(type.labels);
      type.data = d3_reverse(type.data);
    }

    return type
  },

  d3_filterCells: (type, cellFilter) => {
    let filterCells = type.data
      .map((d, i) => ({ data: d, label: type.labels[i] }))
      .filter(cellFilter);
    const dataValues = filterCells.map(d => d.data);
    const labelValues = filterCells.map(d => d.label);
    type.data = type.data.filter(d => dataValues.indexOf(d) !== -1);
    type.labels = type.labels.filter(d => labelValues.indexOf(d) !== -1);
    return type
  },

  d3_placement: (orient, cell, cellTrans, text, textTrans, labelAlign) => {
    cell.attr("transform", cellTrans);
    text.attr("transform", textTrans);
    if (orient === "horizontal") {
      text.style("text-anchor", labelAlign);
    }
  },

  d3_addEvents: function(cells, dispatcher) {
    cells
      .on("mouseover.legend", function(d) {
        d3_cellOver(dispatcher, d, this);
      })
      .on("mouseout.legend", function(d) {
        d3_cellOut(dispatcher, d, this);
      })
      .on("click.legend", function(d) {
        d3_cellClick(dispatcher, d, this);
      });
  },

  d3_title: (svg, title, classPrefix, titleWidth) => {
    if (title !== "") {
      const titleText = svg.selectAll("text." + classPrefix + "legendTitle");

      titleText
        .data([title])
        .enter()
        .append("text")
        .attr("class", classPrefix + "legendTitle");

      svg.selectAll("text." + classPrefix + "legendTitle").text(title);

      if (titleWidth) {
        svg
          .selectAll("text." + classPrefix + "legendTitle")
          .call(d3_textWrapping, titleWidth);
      }

      const cellsSvg = svg.select("." + classPrefix + "legendCells");
      const yOffset = svg
          .select("." + classPrefix + "legendTitle")
          .nodes()
          .map(d => d.getBBox().height)[0],
        xOffset = -cellsSvg.nodes().map(function(d) {
          return d.getBBox().x
        })[0];
      cellsSvg.attr("transform", "translate(" + xOffset + "," + yOffset + ")");
    }
  },

  d3_defaultLocale: {
    format: format$1,
    formatPrefix: formatPrefix$1
  },

  d3_defaultFormatSpecifier: ".01f",

  d3_defaultDelimiter: "to"
};

var noop = {value: function() {}};

function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || (t in _)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}

function Dispatch(_) {
  this._ = _;
}

function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return {type: t, name: name};
  });
}

Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._,
        T = parseTypenames(typename + "", _),
        t,
        i = -1,
        n = T.length;

    // If no callback was specified, return the callback of the given type and name.
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
      return;
    }

    // If a type was specified, set the callback for the given type and name.
    // Otherwise, if a null callback was specified, remove callbacks of the given name.
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
    }

    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};

function get(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}

function set(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({name: name, value: callback});
  return type;
}

function ascending$1(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function bisector$1(compare) {
  if (compare.length === 1) compare = ascendingComparator$1(compare);
  return {
    left: function(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) < 0) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    },
    right: function(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) > 0) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    }
  };
}

function ascendingComparator$1(f) {
  return function(d, x) {
    return ascending$1(f(d), x);
  };
}

var ascendingBisect$1 = bisector$1(ascending$1);
var bisectRight$1 = ascendingBisect$1.right;

function sequence(start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

  var i = -1,
      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
      range = new Array(n);

  while (++i < n) {
    range[i] = start + i * step;
  }

  return range;
}

var e10$1 = Math.sqrt(50),
    e5$1 = Math.sqrt(10),
    e2$1 = Math.sqrt(2);

function ticks$1(start, stop, count) {
  var step = tickStep$1(start, stop, count);
  return sequence(
    Math.ceil(start / step) * step,
    Math.floor(stop / step) * step + step / 2, // inclusive
    step
  );
}

function tickStep$1(start, stop, count) {
  var step0 = Math.abs(stop - start) / Math.max(0, count),
      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
      error = step0 / step1;
  if (error >= e10$1) step1 *= 10;
  else if (error >= e5$1) step1 *= 5;
  else if (error >= e2$1) step1 *= 2;
  return stop < start ? -step1 : step1;
}

function max$1(array, f) {
  var i = -1,
      n = array.length,
      a,
      b;

  if (f == null) {
    while (++i < n) if ((b = array[i]) != null && b >= b) { a = b; break; }
    while (++i < n) if ((b = array[i]) != null && b > a) a = b;
  }

  else {
    while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = b; break; }
    while (++i < n) if ((b = f(array[i], i, array)) != null && b > a) a = b;
  }

  return a;
}

function sum(array, f) {
  var s = 0,
      n = array.length,
      a,
      i = -1;

  if (f == null) {
    while (++i < n) if (a = +array[i]) s += a; // Note: zero and null are equivalent.
  }

  else {
    while (++i < n) if (a = +f(array[i], i, array)) s += a;
  }

  return s;
}

var prefix = "$";

function Map$1() {}

Map$1.prototype = map$1.prototype = {
  constructor: Map$1,
  has: function(key) {
    return (prefix + key) in this;
  },
  get: function(key) {
    return this[prefix + key];
  },
  set: function(key, value) {
    this[prefix + key] = value;
    return this;
  },
  remove: function(key) {
    var property = prefix + key;
    return property in this && delete this[property];
  },
  clear: function() {
    for (var property in this) if (property[0] === prefix) delete this[property];
  },
  keys: function() {
    var keys = [];
    for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
    return keys;
  },
  values: function() {
    var values = [];
    for (var property in this) if (property[0] === prefix) values.push(this[property]);
    return values;
  },
  entries: function() {
    var entries = [];
    for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
    return entries;
  },
  size: function() {
    var size = 0;
    for (var property in this) if (property[0] === prefix) ++size;
    return size;
  },
  empty: function() {
    for (var property in this) if (property[0] === prefix) return false;
    return true;
  },
  each: function(f) {
    for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
  }
};

function map$1(object, f) {
  var map = new Map$1;

  // Copy constructor.
  if (object instanceof Map$1) object.each(function(value, key) { map.set(key, value); });

  // Index array by numeric index or specified key function.
  else if (Array.isArray(object)) {
    var i = -1,
        n = object.length,
        o;

    if (f == null) while (++i < n) map.set(i, object[i]);
    else while (++i < n) map.set(f(o = object[i], i, object), o);
  }

  // Convert object to map.
  else if (object) for (var key in object) map.set(key, object[key]);

  return map;
}

function Set$1() {}

var proto = map$1.prototype;

Set$1.prototype = set$1.prototype = {
  constructor: Set$1,
  has: proto.has,
  add: function(value) {
    value += "";
    this[prefix + value] = value;
    return this;
  },
  remove: proto.remove,
  clear: proto.clear,
  values: proto.keys,
  size: proto.size,
  empty: proto.empty,
  each: proto.each
};

function set$1(object, f) {
  var set = new Set$1;

  // Copy constructor.
  if (object instanceof Set$1) object.each(function(value) { set.add(value); });

  // Otherwise, assume it’s an array.
  else if (object) {
    var i = -1, n = object.length;
    if (f == null) while (++i < n) set.add(object[i]);
    else while (++i < n) set.add(f(object[i], i, object));
  }

  return set;
}

var array = Array.prototype;

var map$2 = array.map;
var slice$1 = array.slice;

function define$1(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}

function extend$1(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

function Color$1() {}

var darker$1 = 0.7;
var brighter$1 = 1 / darker$1;

var reI$1 = "\\s*([+-]?\\d+)\\s*",
    reN$1 = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
    reP$1 = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
    reHex$1 = /^#([0-9a-f]{3,8})$/,
    reRgbInteger$1 = new RegExp("^rgb\\(" + [reI$1, reI$1, reI$1] + "\\)$"),
    reRgbPercent$1 = new RegExp("^rgb\\(" + [reP$1, reP$1, reP$1] + "\\)$"),
    reRgbaInteger$1 = new RegExp("^rgba\\(" + [reI$1, reI$1, reI$1, reN$1] + "\\)$"),
    reRgbaPercent$1 = new RegExp("^rgba\\(" + [reP$1, reP$1, reP$1, reN$1] + "\\)$"),
    reHslPercent$1 = new RegExp("^hsl\\(" + [reN$1, reP$1, reP$1] + "\\)$"),
    reHslaPercent$1 = new RegExp("^hsla\\(" + [reN$1, reP$1, reP$1, reN$1] + "\\)$");

var named$1 = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};

define$1(Color$1, color$1, {
  copy: function(channels) {
    return Object.assign(new this.constructor, this, channels);
  },
  displayable: function() {
    return this.rgb().displayable();
  },
  hex: color_formatHex$1, // Deprecated! Use color.formatHex.
  formatHex: color_formatHex$1,
  formatHsl: color_formatHsl$1,
  formatRgb: color_formatRgb$1,
  toString: color_formatRgb$1
});

function color_formatHex$1() {
  return this.rgb().formatHex();
}

function color_formatHsl$1() {
  return hslConvert$1(this).formatHsl();
}

function color_formatRgb$1() {
  return this.rgb().formatRgb();
}

function color$1(format) {
  var m, l;
  format = (format + "").trim().toLowerCase();
  return (m = reHex$1.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn$1(m) // #ff0000
      : l === 3 ? new Rgb$1((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
      : l === 8 ? rgba$1(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
      : l === 4 ? rgba$1((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
      : null) // invalid hex
      : (m = reRgbInteger$1.exec(format)) ? new Rgb$1(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
      : (m = reRgbPercent$1.exec(format)) ? new Rgb$1(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
      : (m = reRgbaInteger$1.exec(format)) ? rgba$1(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
      : (m = reRgbaPercent$1.exec(format)) ? rgba$1(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
      : (m = reHslPercent$1.exec(format)) ? hsla$1(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
      : (m = reHslaPercent$1.exec(format)) ? hsla$1(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
      : named$1.hasOwnProperty(format) ? rgbn$1(named$1[format]) // eslint-disable-line no-prototype-builtins
      : format === "transparent" ? new Rgb$1(NaN, NaN, NaN, 0)
      : null;
}

function rgbn$1(n) {
  return new Rgb$1(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
}

function rgba$1(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb$1(r, g, b, a);
}

function rgbConvert$1(o) {
  if (!(o instanceof Color$1)) o = color$1(o);
  if (!o) return new Rgb$1;
  o = o.rgb();
  return new Rgb$1(o.r, o.g, o.b, o.opacity);
}

function rgb$2(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert$1(r) : new Rgb$1(r, g, b, opacity == null ? 1 : opacity);
}

function Rgb$1(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}

define$1(Rgb$1, rgb$2, extend$1(Color$1, {
  brighter: function(k) {
    k = k == null ? brighter$1 : Math.pow(brighter$1, k);
    return new Rgb$1(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker$1 : Math.pow(darker$1, k);
    return new Rgb$1(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb: function() {
    return this;
  },
  displayable: function() {
    return (-0.5 <= this.r && this.r < 255.5)
        && (-0.5 <= this.g && this.g < 255.5)
        && (-0.5 <= this.b && this.b < 255.5)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex$1, // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex$1,
  formatRgb: rgb_formatRgb$1,
  toString: rgb_formatRgb$1
}));

function rgb_formatHex$1() {
  return "#" + hex$1(this.r) + hex$1(this.g) + hex$1(this.b);
}

function rgb_formatRgb$1() {
  var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
  return (a === 1 ? "rgb(" : "rgba(")
      + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
      + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
      + Math.max(0, Math.min(255, Math.round(this.b) || 0))
      + (a === 1 ? ")" : ", " + a + ")");
}

function hex$1(value) {
  value = Math.max(0, Math.min(255, Math.round(value) || 0));
  return (value < 16 ? "0" : "") + value.toString(16);
}

function hsla$1(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl$1(h, s, l, a);
}

function hslConvert$1(o) {
  if (o instanceof Hsl$1) return new Hsl$1(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color$1)) o = color$1(o);
  if (!o) return new Hsl$1;
  if (o instanceof Hsl$1) return o;
  o = o.rgb();
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      h = NaN,
      s = max - min,
      l = (max + min) / 2;
  if (s) {
    if (r === max) h = (g - b) / s + (g < b) * 6;
    else if (g === max) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl$1(h, s, l, o.opacity);
}

function hsl$1(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert$1(h) : new Hsl$1(h, s, l, opacity == null ? 1 : opacity);
}

function Hsl$1(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define$1(Hsl$1, hsl$1, extend$1(Color$1, {
  brighter: function(k) {
    k = k == null ? brighter$1 : Math.pow(brighter$1, k);
    return new Hsl$1(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker$1 : Math.pow(darker$1, k);
    return new Hsl$1(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = this.h % 360 + (this.h < 0) * 360,
        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
        l = this.l,
        m2 = l + (l < 0.5 ? l : 1 - l) * s,
        m1 = 2 * l - m2;
    return new Rgb$1(
      hsl2rgb$1(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb$1(h, m1, m2),
      hsl2rgb$1(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  displayable: function() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
        && (0 <= this.l && this.l <= 1)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl: function() {
    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "hsl(" : "hsla(")
        + (this.h || 0) + ", "
        + (this.s || 0) * 100 + "%, "
        + (this.l || 0) * 100 + "%"
        + (a === 1 ? ")" : ", " + a + ")");
  }
}));

/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb$1(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60
      : h < 180 ? m2
      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
      : m1) * 255;
}

var deg2rad = Math.PI / 180;
var rad2deg = 180 / Math.PI;

var A = -0.14861,
    B = +1.78277,
    C = -0.29227,
    D = -0.90649,
    E = +1.97294,
    ED = E * D,
    EB = E * B,
    BC_DA = B * C - D * A;

function cubehelixConvert(o) {
  if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Rgb$1)) o = rgbConvert$1(o);
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
      bl = b - l,
      k = (E * (g - l) - C * bl) / D,
      s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
      h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
  return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
}

function cubehelix(h, s, l, opacity) {
  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
}

function Cubehelix(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define$1(Cubehelix, cubehelix, extend$1(Color$1, {
  brighter: function(k) {
    k = k == null ? brighter$1 : Math.pow(brighter$1, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker$1 : Math.pow(darker$1, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
        l = +this.l,
        a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
        cosh = Math.cos(h),
        sinh = Math.sin(h);
    return new Rgb$1(
      255 * (l + a * (A * cosh + B * sinh)),
      255 * (l + a * (C * cosh + D * sinh)),
      255 * (l + a * (E * cosh)),
      this.opacity
    );
  }
}));

function constant$1(x) {
  return function() {
    return x;
  };
}

function linear$2(a, d) {
  return function(t) {
    return a + t * d;
  };
}

function exponential$1(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}

function hue(a, b) {
  var d = b - a;
  return d ? linear$2(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant$1(isNaN(a) ? b : a);
}

function gamma$1(y) {
  return (y = +y) === 1 ? nogamma$1 : function(a, b) {
    return b - a ? exponential$1(a, b, y) : constant$1(isNaN(a) ? b : a);
  };
}

function nogamma$1(a, b) {
  var d = b - a;
  return d ? linear$2(a, d) : constant$1(isNaN(a) ? b : a);
}

var rgb$3 = (function rgbGamma(y) {
  var color = gamma$1(y);

  function rgb(start, end) {
    var r = color((start = rgb$2(start)).r, (end = rgb$2(end)).r),
        g = color(start.g, end.g),
        b = color(start.b, end.b),
        opacity = nogamma$1(start.opacity, end.opacity);
    return function(t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  rgb.gamma = rgbGamma;

  return rgb;
})(1);

function numberArray$1(a, b) {
  if (!b) b = [];
  var n = a ? Math.min(b.length, a.length) : 0,
      c = b.slice(),
      i;
  return function(t) {
    for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
    return c;
  };
}

function isNumberArray$1(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}

function genericArray$1(a, b) {
  var nb = b ? b.length : 0,
      na = a ? Math.min(nb, a.length) : 0,
      x = new Array(na),
      c = new Array(nb),
      i;

  for (i = 0; i < na; ++i) x[i] = interpolateValue(a[i], b[i]);
  for (; i < nb; ++i) c[i] = b[i];

  return function(t) {
    for (i = 0; i < na; ++i) c[i] = x[i](t);
    return c;
  };
}

function date$2(a, b) {
  var d = new Date;
  return a = +a, b = +b, function(t) {
    return d.setTime(a * (1 - t) + b * t), d;
  };
}

function reinterpolate(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}

function object$1(a, b) {
  var i = {},
      c = {},
      k;

  if (a === null || typeof a !== "object") a = {};
  if (b === null || typeof b !== "object") b = {};

  for (k in b) {
    if (k in a) {
      i[k] = interpolateValue(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }

  return function(t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
}

var reA$1 = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
    reB$1 = new RegExp(reA$1.source, "g");

function zero$1(b) {
  return function() {
    return b;
  };
}

function one$1(b) {
  return function(t) {
    return b(t) + "";
  };
}

function string$1(a, b) {
  var bi = reA$1.lastIndex = reB$1.lastIndex = 0, // scan index for next number in b
      am, // current match in a
      bm, // current match in b
      bs, // string preceding current number in b, if any
      i = -1, // index in s
      s = [], // string constants and placeholders
      q = []; // number interpolators

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Interpolate pairs of numbers in a & b.
  while ((am = reA$1.exec(a))
      && (bm = reB$1.exec(b))) {
    if ((bs = bm.index) > bi) { // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
      if (s[i]) s[i] += bm; // coalesce with previous string
      else s[++i] = bm;
    } else { // interpolate non-matching numbers
      s[++i] = null;
      q.push({i: i, x: reinterpolate(am, bm)});
    }
    bi = reB$1.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs; // coalesce with previous string
    else s[++i] = bs;
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? (q[0]
      ? one$1(q[0].x)
      : zero$1(b))
      : (b = q.length, function(t) {
          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        });
}

function interpolateValue(a, b) {
  var t = typeof b, c;
  return b == null || t === "boolean" ? constant$1(b)
      : (t === "number" ? reinterpolate
      : t === "string" ? ((c = color$1(b)) ? (b = c, rgb$3) : string$1)
      : b instanceof color$1 ? rgb$3
      : b instanceof Date ? date$2
      : isNumberArray$1(b) ? numberArray$1
      : Array.isArray(b) ? genericArray$1
      : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object$1
      : reinterpolate)(a, b);
}

function interpolateRound$1(a, b) {
  return a = +a, b = +b, function(t) {
    return Math.round(a * (1 - t) + b * t);
  };
}

function cubehelix$1(hue) {
  return (function cubehelixGamma(y) {
    y = +y;

    function cubehelix$1(start, end) {
      var h = hue((start = cubehelix(start)).h, (end = cubehelix(end)).h),
          s = nogamma$1(start.s, end.s),
          l = nogamma$1(start.l, end.l),
          opacity = nogamma$1(start.opacity, end.opacity);
      return function(t) {
        start.h = h(t);
        start.s = s(t);
        start.l = l(Math.pow(t, y));
        start.opacity = opacity(t);
        return start + "";
      };
    }

    cubehelix$1.gamma = cubehelixGamma;

    return cubehelix$1;
  })(1);
}

cubehelix$1(hue);
var cubehelixLong = cubehelix$1(nogamma$1);

function constant$2(x) {
  return function() {
    return x;
  };
}

function number$4(x) {
  return +x;
}

var unit$1 = [0, 1];

function deinterpolateLinear(a, b) {
  return (b -= (a = +a))
      ? function(x) { return (x - a) / b; }
      : constant$2(b);
}

function deinterpolateClamp(deinterpolate) {
  return function(a, b) {
    var d = deinterpolate(a = +a, b = +b);
    return function(x) { return x <= a ? 0 : x >= b ? 1 : d(x); };
  };
}

function reinterpolateClamp(reinterpolate) {
  return function(a, b) {
    var r = reinterpolate(a = +a, b = +b);
    return function(t) { return t <= 0 ? a : t >= 1 ? b : r(t); };
  };
}

function bimap$1(domain, range, deinterpolate, reinterpolate) {
  var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
  if (d1 < d0) d0 = deinterpolate(d1, d0), r0 = reinterpolate(r1, r0);
  else d0 = deinterpolate(d0, d1), r0 = reinterpolate(r0, r1);
  return function(x) { return r0(d0(x)); };
}

function polymap$1(domain, range, deinterpolate, reinterpolate) {
  var j = Math.min(domain.length, range.length) - 1,
      d = new Array(j),
      r = new Array(j),
      i = -1;

  // Reverse descending domains.
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }

  while (++i < j) {
    d[i] = deinterpolate(domain[i], domain[i + 1]);
    r[i] = reinterpolate(range[i], range[i + 1]);
  }

  return function(x) {
    var i = bisectRight$1(domain, x, 1, j) - 1;
    return r[i](d[i](x));
  };
}

function copy$2(source, target) {
  return target
      .domain(source.domain())
      .range(source.range())
      .interpolate(source.interpolate())
      .clamp(source.clamp());
}

// deinterpolate(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
// reinterpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding domain value x in [a,b].
function continuous$1(deinterpolate, reinterpolate) {
  var domain = unit$1,
      range = unit$1,
      interpolate = interpolateValue,
      clamp = false,
      piecewise,
      output,
      input;

  function rescale() {
    piecewise = Math.min(domain.length, range.length) > 2 ? polymap$1 : bimap$1;
    output = input = null;
    return scale;
  }

  function scale(x) {
    return (output || (output = piecewise(domain, range, clamp ? deinterpolateClamp(deinterpolate) : deinterpolate, interpolate)))(+x);
  }

  scale.invert = function(y) {
    return (input || (input = piecewise(range, domain, deinterpolateLinear, clamp ? reinterpolateClamp(reinterpolate) : reinterpolate)))(+y);
  };

  scale.domain = function(_) {
    return arguments.length ? (domain = map$2.call(_, number$4), rescale()) : domain.slice();
  };

  scale.range = function(_) {
    return arguments.length ? (range = slice$1.call(_), rescale()) : range.slice();
  };

  scale.rangeRound = function(_) {
    return range = slice$1.call(_), interpolate = interpolateRound$1, rescale();
  };

  scale.clamp = function(_) {
    return arguments.length ? (clamp = !!_, rescale()) : clamp;
  };

  scale.interpolate = function(_) {
    return arguments.length ? (interpolate = _, rescale()) : interpolate;
  };

  return rescale();
}

function tickFormat$1(domain, count, specifier) {
  var start = domain[0],
      stop = domain[domain.length - 1],
      step = tickStep$1(start, stop, count == null ? 10 : count),
      precision;
  specifier = formatSpecifier$1(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = precisionPrefix$1(step, value))) specifier.precision = precision;
      return formatPrefix$1(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = precisionRound$1(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = precisionFixed$1(step))) specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return format$1(specifier);
}

function linearish$1(scale) {
  var domain = scale.domain;

  scale.ticks = function(count) {
    var d = domain();
    return ticks$1(d[0], d[d.length - 1], count == null ? 10 : count);
  };

  scale.tickFormat = function(count, specifier) {
    return tickFormat$1(domain(), count, specifier);
  };

  scale.nice = function(count) {
    var d = domain(),
        i = d.length - 1,
        n = count == null ? 10 : count,
        start = d[0],
        stop = d[i],
        step = tickStep$1(start, stop, n);

    if (step) {
      step = tickStep$1(Math.floor(start / step) * step, Math.ceil(stop / step) * step, n);
      d[0] = Math.floor(start / step) * step;
      d[i] = Math.ceil(stop / step) * step;
      domain(d);
    }

    return scale;
  };

  return scale;
}

function linear$3() {
  var scale = continuous$1(deinterpolateLinear, reinterpolate);

  scale.copy = function() {
    return copy$2(scale, linear$3());
  };

  return linearish$1(scale);
}

function colors(s) {
  return s.match(/.{6}/g).map(function(x) {
    return "#" + x;
  });
}

colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

colors("393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6");

colors("3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9");

colors("1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5");

cubehelixLong(cubehelix(300, 0.5, 0.0), cubehelix(-240, 0.5, 1.0));

var warm = cubehelixLong(cubehelix(-100, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

var cool = cubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

var rainbow = cubehelix();

function ramp(range) {
  var n = range.length;
  return function(t) {
    return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
  };
}

ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

var magma = ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

var inferno = ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

var plasma = ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

function color$2() {
  let scale = linear$3(),
    shape = "rect",
    shapeWidth = 15,
    shapeHeight = 15,
    shapeRadius = 10,
    shapePadding = 2,
    cells = [5],
    cellFilter,
    labels = [],
    classPrefix = "",
    useClass = false,
    title = "",
    locale = helper.d3_defaultLocale,
    specifier = helper.d3_defaultFormatSpecifier,
    labelOffset = 10,
    labelAlign = "middle",
    labelDelimiter = helper.d3_defaultDelimiter,
    labelWrap,
    orient = "vertical",
    ascending = false,
    path,
    titleWidth,
    legendDispatcher = dispatch("cellover", "cellout", "cellclick");

  function legend(svg) {
    const type = helper.d3_calcType(
        scale,
        ascending,
        cells,
        labels,
        locale.format(specifier),
        labelDelimiter
      ),
      legendG = svg.selectAll("g").data([scale]);

    legendG
      .enter()
      .append("g")
      .attr("class", classPrefix + "legendCells");

    if (cellFilter) {
      helper.d3_filterCells(type, cellFilter);
    }

    let cell = svg
      .select("." + classPrefix + "legendCells")
      .selectAll("." + classPrefix + "cell")
      .data(type.data);

    const cellEnter = cell
      .enter()
      .append("g")
      .attr("class", classPrefix + "cell");
    cellEnter.append(shape).attr("class", classPrefix + "swatch");

    let shapes = svg
      .selectAll(
        "g." + classPrefix + "cell " + shape + "." + classPrefix + "swatch"
      )
      .data(type.data);

    //add event handlers
    helper.d3_addEvents(cellEnter, legendDispatcher);

    cell
      .exit()
      .transition()
      .style("opacity", 0)
      .remove();
    
    shapes
      .exit()
      .transition()
      .style("opacity", 0)
      .remove();

    shapes = shapes.merge(shapes);
    // we need to merge the selection, otherwise changes in the legend (e.g. change of orientation) are applied only to the new cells and not the existing ones.
    cell = cellEnter.merge(cell);

    helper.d3_drawShapes(
      shape,
      shapes,
      shapeHeight,
      shapeWidth,
      shapeRadius,
      path
    );
    
    helper.d3_addText(
      svg,
      cellEnter,
      type.labels,
      classPrefix,
      labelWrap
    )
    .then(text => {

      // sets placement
      const textSize = text.nodes().map(d => d.getBBox()),
        shapeSize = shapes.nodes().map(d => d.getBBox());
      //sets scale
      //everything is fill except for line which is stroke,
      if (!useClass) {
        if (shape == "line") {
          shapes.style("stroke", type.feature);
        } else {
          shapes.style("fill", type.feature);
        }
      } else {
        shapes.attr("class", d => `${classPrefix}swatch ${type.feature(d)}`);
      }

      let cellTrans,
        textTrans,
        textAlign = labelAlign == "start" ? 0 : labelAlign == "middle" ? 0.5 : 1;

      //positions cells and text
      if (orient === "vertical") {
        const cellSize = textSize.map((d, i) => {
            if (!shapeSize[i]) {return 0}
            return Math.max(d.height, shapeSize[i].height)
        });

        cellTrans = (d, i) => {
          const height = sum(cellSize.slice(0, i));
          return `translate(0, ${height + i * shapePadding})`
        };

        textTrans = (d, i) => {
          if (!shapeSize[i]) {return ''}
          return `translate( ${shapeSize[i].width +
            shapeSize[i].x +
            labelOffset}, ${shapeSize[i].y + shapeSize[i].height / 2 + 5})`};
      } else if (orient === "horizontal") {
        cellTrans = (d, i) => {
          if (!shapeSize[i]) {return ''}
          return `translate(${i * (shapeSize[i].width + shapePadding)},0)`
        };
        textTrans = (d, i) => {
          if (!shapeSize[i]) {return ''}
          return `translate(${shapeSize[i].width * textAlign + shapeSize[i].x},
                    ${shapeSize[i].height + shapeSize[i].y + labelOffset + 8})`
        };
      }

      helper.d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign);
      helper.d3_title(svg, title, classPrefix, titleWidth);

      cell.transition().style("opacity", 1);
    });
  }

  legend.scale = function(_) {
    if (!arguments.length) return scale
    scale = _;
    return legend
  };

  legend.cells = function(_) {
    if (!arguments.length) return cells
    if (_.length > 1 || _ >= 2) {
      cells = _;
    }
    return legend
  };

  legend.cellFilter = function(_) {
    if (!arguments.length) return cellFilter
    cellFilter = _;
    return legend
  };

  legend.shape = function(_, d) {
    if (!arguments.length) return shape
    if (
      _ == "rect" ||
      _ == "circle" ||
      _ == "line" ||
      (_ == "path" && typeof d === "string")
    ) {
      shape = _;
      path = d;
    }
    return legend
  };

  legend.shapeWidth = function(_) {
    if (!arguments.length) return shapeWidth
    shapeWidth = +_;
    return legend
  };

  legend.shapeHeight = function(_) {
    if (!arguments.length) return shapeHeight
    shapeHeight = +_;
    return legend
  };

  legend.shapeRadius = function(_) {
    if (!arguments.length) return shapeRadius
    shapeRadius = +_;
    return legend
  };

  legend.shapePadding = function(_) {
    if (!arguments.length) return shapePadding
    shapePadding = +_;
    return legend
  };

  legend.labels = function(_) {
    if (!arguments.length) return labels
    labels = _;
    return legend
  };

  legend.labelAlign = function(_) {
    if (!arguments.length) return labelAlign
    if (_ == "start" || _ == "end" || _ == "middle") {
      labelAlign = _;
    }
    return legend
  };

  legend.locale = function(_) {
    if (!arguments.length) return locale
    locale = formatLocale$2(_);
    return legend
  };

  legend.labelFormat = function(_) {
    if (!arguments.length) return legend.locale().format(specifier)
    specifier = formatSpecifier$1(_);
    return legend
  };

  legend.labelOffset = function(_) {
    if (!arguments.length) return labelOffset
    labelOffset = +_;
    return legend
  };

  legend.labelDelimiter = function(_) {
    if (!arguments.length) return labelDelimiter
    labelDelimiter = _;
    return legend
  };

  legend.labelWrap = function(_) {
    if (!arguments.length) return labelWrap
    labelWrap = _;
    return legend
  };

  legend.useClass = function(_) {
    if (!arguments.length) return useClass
    if (_ === true || _ === false) {
      useClass = _;
    }
    return legend
  };

  legend.orient = function(_) {
    if (!arguments.length) return orient
    _ = _.toLowerCase();
    if (_ == "horizontal" || _ == "vertical") {
      orient = _;
    }
    return legend
  };

  legend.ascending = function(_) {
    if (!arguments.length) return ascending
    ascending = !!_;
    return legend
  };

  legend.classPrefix = function(_) {
    if (!arguments.length) return classPrefix
    classPrefix = _;
    return legend
  };

  legend.title = function(_) {
    if (!arguments.length) return title
    title = _;
    return legend
  };

  legend.titleWidth = function(_) {
    if (!arguments.length) return titleWidth
    titleWidth = _;
    return legend
  };

  legend.textWrap = function(_) {
    if (!arguments.length) return textWrap
    textWrap = _;
    return legend
  };

  legend.on = function() {
    const value = legendDispatcher.on.apply(legendDispatcher, arguments);
    return value === legendDispatcher ? legend : value
  };

  return legend
}

function size() {
  let scale = linear$3(),
    shape = "rect",
    shapeWidth = 15,
    shapePadding = 2,
    cells = [5],
    cellFilter,
    labels = [],
    classPrefix = "",
    title = "",
    locale = helper.d3_defaultLocale,
    specifier = helper.d3_defaultFormatSpecifier,
    labelOffset = 10,
    labelAlign = "middle",
    labelDelimiter = helper.d3_defaultDelimiter,
    labelWrap,
    orient = "vertical",
    ascending = false,
    path,
    titleWidth,
    legendDispatcher = dispatch("cellover", "cellout", "cellclick");

  function legend(svg) {
    const type = helper.d3_calcType(
        scale,
        ascending,
        cells,
        labels,
        locale.format(specifier),
        labelDelimiter
      ),
      legendG = svg.selectAll("g").data([scale]);

    if (cellFilter) {
      helper.d3_filterCells(type, cellFilter);
    }

    legendG
      .enter()
      .append("g")
      .attr("class", classPrefix + "legendCells");

    let cell = svg
      .select("." + classPrefix + "legendCells")
      .selectAll("." + classPrefix + "cell")
      .data(type.data);
    const cellEnter = cell
      .enter()
      .append("g")
      .attr("class", classPrefix + "cell");
    cellEnter.append(shape).attr("class", classPrefix + "swatch");

    let shapes = svg.selectAll(
      "g." + classPrefix + "cell " + shape + "." + classPrefix + "swatch"
    );

    //add event handlers
    helper.d3_addEvents(cellEnter, legendDispatcher);

    cell
      .exit()
      .transition()
      .style("opacity", 0)
      .remove();

    shapes
      .exit()
      .transition()
      .style("opacity", 0)
      .remove();
    
    shapes = shapes.merge(shapes);
    // we need to merge the selection, otherwise changes in the legend (e.g. change of orientation) are applied only to the new cells and not the existing ones.
    cell = cellEnter.merge(cell);

    //creates shape
    if (shape === "line") {
      helper.d3_drawShapes(shape, shapes, 0, shapeWidth);
      shapes.attr("stroke-width", type.feature);
    } else {
      helper.d3_drawShapes(
        shape,
        shapes,
        type.feature,
        type.feature,
        type.feature,
        path
      );
    }

    helper.d3_addText(
      svg,
      cellEnter,
      type.labels,
      classPrefix,
      labelWrap
    )
    .then(text => {

      //sets placement
      const textSize = text.nodes().map(d => d.getBBox()),
        shapeSize = shapes.nodes().map((d, i) => {
          const bbox = d.getBBox();
          const stroke = scale(type.data[i]);

          if (shape === "line" && orient === "horizontal") {
            bbox.height = bbox.height + stroke;
          } else if (shape === "line" && orient === "vertical") {
            bbox.width = bbox.width;
          }
          return bbox
        });

      const maxH = max$1(shapeSize, d => d.height + d.y),
        maxW = max$1(shapeSize, d => d.width + d.x);

      let cellTrans,
        textTrans,
        textAlign = labelAlign == "start" ? 0 : labelAlign == "middle" ? 0.5 : 1;

      //positions cells and text
      if (orient === "vertical") {
        const cellSize = textSize.map((d, i) => {
            if (!shapeSize[i]) { return 0 }
            return Math.max(d.height, shapeSize[i].height)
          }
        );
        const y =
          shape == "circle" || shape == "line" ? shapeSize[0].height / 2 : 0;
        cellTrans = (d, i) => {
          const height = sum(cellSize.slice(0, i));

          return `translate(0, ${y + height + i * shapePadding})`
        };

        textTrans = (d, i) => {
          if (!shapeSize[i]) {return ''}
          return `translate( ${maxW + labelOffset}, ${shapeSize[i].y + shapeSize[i].height / 2 + 5})`
        };
      } else if (orient === "horizontal") {
        cellTrans = (d, i) => {
          const width = sum(shapeSize.slice(0, i), d => d.width);
          const y = shape == "circle" || shape == "line" ? maxH / 2 : 0;
          return `translate(${width + i * shapePadding}, ${y})`
        };

        const offset = shape == "line" ? maxH / 2 : maxH;
        textTrans = (d, i) => {
          if (!shapeSize[i]) {return ''}
          return `translate( ${shapeSize[i].width * textAlign + shapeSize[i].x},
                ${offset + labelOffset})`
        };
      }

      helper.d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign);
      helper.d3_title(svg, title, classPrefix, titleWidth);

      cell.transition().style("opacity", 1);
     });
  }

  legend.scale = function(_) {
    if (!arguments.length) return scale
    scale = _;
    return legend
  };

  legend.cells = function(_) {
    if (!arguments.length) return cells
    if (_.length > 1 || _ >= 2) {
      cells = _;
    }
    return legend
  };

  legend.cellFilter = function(_) {
    if (!arguments.length) return cellFilter
    cellFilter = _;
    return legend
  };

  legend.shape = function(_, d) {
    if (!arguments.length) return shape
    if (_ == "rect" || _ == "circle" || _ == "line") {
      shape = _;
      path = d;
    }
    return legend
  };

  legend.shapeWidth = function(_) {
    if (!arguments.length) return shapeWidth
    shapeWidth = +_;
    return legend
  };

  legend.shapePadding = function(_) {
    if (!arguments.length) return shapePadding
    shapePadding = +_;
    return legend
  };

  legend.labels = function(_) {
    if (!arguments.length) return labels
    labels = _;
    return legend
  };

  legend.labelAlign = function(_) {
    if (!arguments.length) return labelAlign
    if (_ == "start" || _ == "end" || _ == "middle") {
      labelAlign = _;
    }
    return legend
  };

  legend.locale = function(_) {
    if (!arguments.length) return locale
    locale = formatLocale$2(_);
    return legend
  };

  legend.labelFormat = function(_) {
    if (!arguments.length) return legend.locale().format(specifier)
    specifier = formatSpecifier$1(_);
    return legend
  };

  legend.labelOffset = function(_) {
    if (!arguments.length) return labelOffset
    labelOffset = +_;
    return legend
  };

  legend.labelDelimiter = function(_) {
    if (!arguments.length) return labelDelimiter
    labelDelimiter = _;
    return legend
  };

  legend.labelWrap = function(_) {
    if (!arguments.length) return labelWrap
    labelWrap = _;
    return legend
  };

  legend.orient = function(_) {
    if (!arguments.length) return orient
    _ = _.toLowerCase();
    if (_ == "horizontal" || _ == "vertical") {
      orient = _;
    }
    return legend
  };

  legend.ascending = function(_) {
    if (!arguments.length) return ascending
    ascending = !!_;
    return legend
  };

  legend.classPrefix = function(_) {
    if (!arguments.length) return classPrefix
    classPrefix = _;
    return legend
  };

  legend.title = function(_) {
    if (!arguments.length) return title
    title = _;
    return legend
  };

  legend.titleWidth = function(_) {
    if (!arguments.length) return titleWidth
    titleWidth = _;
    return legend
  };

  legend.on = function() {
    const value = legendDispatcher.on.apply(legendDispatcher, arguments);
    return value === legendDispatcher ? legend : value
  };

  return legend
}

function symbol() {
  let scale = linear$3(),
    shape = "path",
    shapeWidth = 15,
    shapeHeight = 15,
    shapeRadius = 10,
    shapePadding = 5,
    cells = [5],
    cellFilter,
    labels = [],
    classPrefix = "",
    title = "",
    locale = helper.d3_defaultLocale,
    specifier = helper.d3_defaultFormatSpecifier,
    labelAlign = "middle",
    labelOffset = 10,
    labelDelimiter = helper.d3_defaultDelimiter,
    labelWrap,
    orient = "vertical",
    ascending = false,
    titleWidth,
    legendDispatcher = dispatch("cellover", "cellout", "cellclick");

  function legend(svg) {
    const type = helper.d3_calcType(
        scale,
        ascending,
        cells,
        labels,
        locale.format(specifier),
        labelDelimiter
      ),
      legendG = svg.selectAll("g").data([scale]);

    if (cellFilter) {
      helper.d3_filterCells(type, cellFilter);
    }

    legendG
      .enter()
      .append("g")
      .attr("class", classPrefix + "legendCells");

    let cell = svg
      .select("." + classPrefix + "legendCells")
      .selectAll("." + classPrefix + "cell")
      .data(type.data);
    const cellEnter = cell
      .enter()
      .append("g")
      .attr("class", classPrefix + "cell");
    cellEnter.append(shape).attr("class", classPrefix + "swatch");

    let shapes = svg.selectAll("g." + classPrefix + "cell " + shape + "." + classPrefix + "swatch");

    //add event handlers
    helper.d3_addEvents(cellEnter, legendDispatcher);

    //remove old shapes
    cell
      .exit()
      .transition()
      .style("opacity", 0)
      .remove();
    shapes
      .exit()
      .transition()
      .style("opacity", 0)
      .remove();

    shapes = shapes.merge(shapes);
    // we need to merge the selection, otherwise changes in the legend (e.g. change of orientation) are applied only to the new cells and not the existing ones.
    cell = cellEnter.merge(cell);

    helper.d3_drawShapes(
      shape,
      shapes,
      shapeHeight,
      shapeWidth,
      shapeRadius,
      type.feature
    );
    
    helper.d3_addText(
      svg,
      cellEnter,
      type.labels,
      classPrefix,
      labelWrap
    )
    .then(text => {

      // sets placement
      const textSize = text.nodes().map(d => d.getBBox()),
        shapeSize = shapes.nodes().map(d => d.getBBox());

      const maxH = max$1(shapeSize, d => d.height),
        maxW = max$1(shapeSize, d => d.width);

      let cellTrans,
        textTrans,
        textAlign = labelAlign == "start" ? 0 : labelAlign == "middle" ? 0.5 : 1;

      //positions cells and text
      if (orient === "vertical") {
        const cellSize = textSize.map((d, i) => Math.max(maxH, d.height));

        cellTrans = (d, i) => {
          const height = sum(cellSize.slice(0, i));
          return `translate(0, ${height + i * shapePadding} )`
        };
        textTrans = (d, i) => { 
          if (!shapeSize[i]) {return ''}
          return `translate( ${maxW + labelOffset},${shapeSize[i].y + shapeSize[i].height / 2 + 5})`
        };
      } else if (orient === "horizontal") {
        cellTrans = (d, i) => `translate( ${i * (maxW + shapePadding)},0)`;
        textTrans = (d, i) => {
          if (!shapeSize[i]) {return ''}
          return `translate( ${shapeSize[i].width * textAlign + shapeSize[i].x}, ${maxH + labelOffset})`
        };
      }

      helper.d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign);
      helper.d3_title(svg, title, classPrefix, titleWidth);
      cell.transition().style("opacity", 1);
    });
  }

  legend.scale = function(_) {
    if (!arguments.length) return scale
    scale = _;
    return legend
  };

  legend.cells = function(_) {
    if (!arguments.length) return cells
    if (_.length > 1 || _ >= 2) {
      cells = _;
    }
    return legend
  };

  legend.cellFilter = function(_) {
    if (!arguments.length) return cellFilter
    cellFilter = _;
    return legend
  };

  legend.shapePadding = function(_) {
    if (!arguments.length) return shapePadding
    shapePadding = +_;
    return legend
  };

  legend.labels = function(_) {
    if (!arguments.length) return labels
    labels = _;
    return legend
  };

  legend.labelAlign = function(_) {
    if (!arguments.length) return labelAlign
    if (_ == "start" || _ == "end" || _ == "middle") {
      labelAlign = _;
    }
    return legend
  };

  legend.locale = function(_) {
    if (!arguments.length) return locale
    locale = formatLocale$2(_);
    return legend
  };

  legend.labelFormat = function(_) {
    if (!arguments.length) return legend.locale().format(specifier)
    specifier = formatSpecifier$1(_);
    return legend
  };

  legend.labelOffset = function(_) {
    if (!arguments.length) return labelOffset
    labelOffset = +_;
    return legend
  };

  legend.labelDelimiter = function(_) {
    if (!arguments.length) return labelDelimiter
    labelDelimiter = _;
    return legend
  };

  legend.labelWrap = function(_) {
    if (!arguments.length) return labelWrap
    labelWrap = _;
    return legend
  };

  legend.orient = function(_) {
    if (!arguments.length) return orient
    _ = _.toLowerCase();
    if (_ == "horizontal" || _ == "vertical") {
      orient = _;
    }
    return legend
  };

  legend.ascending = function(_) {
    if (!arguments.length) return ascending
    ascending = !!_;
    return legend
  };

  legend.classPrefix = function(_) {
    if (!arguments.length) return classPrefix
    classPrefix = _;
    return legend
  };

  legend.title = function(_) {
    if (!arguments.length) return title
    title = _;
    return legend
  };

  legend.titleWidth = function(_) {
    if (!arguments.length) return titleWidth
    titleWidth = _;
    return legend
  };

  legend.on = function() {
    const value = legendDispatcher.on.apply(legendDispatcher, arguments);
    return value === legendDispatcher ? legend : value
  };

  return legend
}

const thresholdLabels = function({
  i,
  genLength,
  generatedLabels,
  labelDelimiter
}) {
  if (i === 0) {
    const values = generatedLabels[i].split(` ${labelDelimiter} `);
    return `Less than ${values[1]}`
  } else if (i === genLength - 1) {
    const values = generatedLabels[i].split(` ${labelDelimiter} `);
    return `${values[0]} or more`
  }
  return generatedLabels[i]
};

var legendHelpers = {
  thresholdLabels
};

var index = {
  legendColor: color$2,
  legendSize: size,
  legendSymbol: symbol,
  legendHelpers
};

var legend = /*#__PURE__*/Object.freeze({
  __proto__: null,
  legendColor: color$2,
  legendSize: size,
  legendSymbol: symbol,
  legendHelpers: legendHelpers,
  'default': index
});

// Note(cg): allowed scales
const legendNames = ['color', 'size', 'symbol'];

const props$2 = {};
legendNames.forEach(name => {
  const instance = legend[`legend${capitalize(name)}`]();
  const keys = Object.keys(instance || {});
  shapeProperties(keys, props$2);
});

/**
 * ## D3Legend
 *
 * a wrapper around  [`d3-svg-legend`](https://d3-legend.susielu.com/)
 *
 * @prop {Function} scale - d3.scale to use for the legend
 */
class D3Legend extends LitElement {

  static get properties() {

    return {

      ...props$2,

      type: { type: String }

    };
  }

  constructor() {
    super();
    this.__init = true;
  }

  update(props) {
    if (!this.type && !props.has('type')) {
      this.type = 'color';
    }

    if (!this.legend || props.has('type')) {
      this.legend = legend[`legend${capitalize(this.type)}`]();
    }

    if (this.legend) {
      this.updateWrapper(props);
    }
    super.update(props);
  }

  updateWrapper(props) {
    let shallNotify = this.__init;
    props.forEach((value, key) => {
      if ((this[key] !== undefined) && this.legend[key]) {
        shallNotify = true;
        this.legend[key](this[key]);
      }
    });
    if (shallNotify) {
      this.dispatchEvent(new CustomEvent(`legend-changed`, { detail: { value: this.legend }, bubbles: true, composed: true }));
      delete this.__init;
    }
  }
}

var noop$1 = {value: () => {}};

function dispatch$1() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch$1(_);
}

function Dispatch$1(_) {
  this._ = _;
}

function parseTypenames$1(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return {type: t, name: name};
  });
}

Dispatch$1.prototype = dispatch$1.prototype = {
  constructor: Dispatch$1,
  on: function(typename, callback) {
    var _ = this._,
        T = parseTypenames$1(typename + "", _),
        t,
        i = -1,
        n = T.length;

    // If no callback was specified, return the callback of the given type and name.
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
      return;
    }

    // If a type was specified, set the callback for the given type and name.
    // Otherwise, if a null callback was specified, remove callbacks of the given name.
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set$2(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set$2(_[t], typename.name, null);
    }

    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch$1(copy);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};

function get$1(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}

function set$2(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop$1, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({name: name, value: callback});
  return type;
}

function noevent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

function dragDisable(view) {
  var root = view.document.documentElement,
      selection = select(view).on("dragstart.drag", noevent, true);
  if ("onselectstart" in root) {
    selection.on("selectstart.drag", noevent, true);
  } else {
    root.__noselect = root.style.MozUserSelect;
    root.style.MozUserSelect = "none";
  }
}

function yesdrag(view, noclick) {
  var root = view.document.documentElement,
      selection = select(view).on("dragstart.drag", null);
  if (noclick) {
    selection.on("click.drag", noevent, true);
    setTimeout(function() { selection.on("click.drag", null); }, 0);
  }
  if ("onselectstart" in root) {
    selection.on("selectstart.drag", null);
  } else {
    root.style.MozUserSelect = root.__noselect;
    delete root.__noselect;
  }
}

var constant$3 = x => () => x;

function BrushEvent(type, {
  sourceEvent,
  target,
  selection,
  mode,
  dispatch
}) {
  Object.defineProperties(this, {
    type: {value: type, enumerable: true, configurable: true},
    sourceEvent: {value: sourceEvent, enumerable: true, configurable: true},
    target: {value: target, enumerable: true, configurable: true},
    selection: {value: selection, enumerable: true, configurable: true},
    mode: {value: mode, enumerable: true, configurable: true},
    _: {value: dispatch}
  });
}

function nopropagation(event) {
  event.stopImmediatePropagation();
}

function noevent$1(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

var MODE_DRAG = {name: "drag"},
    MODE_SPACE = {name: "space"},
    MODE_HANDLE = {name: "handle"},
    MODE_CENTER = {name: "center"};

const {abs, max: max$2, min: min$1} = Math;

function number1(e) {
  return [+e[0], +e[1]];
}

function number2(e) {
  return [number1(e[0]), number1(e[1])];
}

var X = {
  name: "x",
  handles: ["w", "e"].map(type),
  input: function(x, e) { return x == null ? null : [[+x[0], e[0][1]], [+x[1], e[1][1]]]; },
  output: function(xy) { return xy && [xy[0][0], xy[1][0]]; }
};

var Y = {
  name: "y",
  handles: ["n", "s"].map(type),
  input: function(y, e) { return y == null ? null : [[e[0][0], +y[0]], [e[1][0], +y[1]]]; },
  output: function(xy) { return xy && [xy[0][1], xy[1][1]]; }
};

var XY = {
  name: "xy",
  handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
  input: function(xy) { return xy == null ? null : number2(xy); },
  output: function(xy) { return xy; }
};

var cursors = {
  overlay: "crosshair",
  selection: "move",
  n: "ns-resize",
  e: "ew-resize",
  s: "ns-resize",
  w: "ew-resize",
  nw: "nwse-resize",
  ne: "nesw-resize",
  se: "nwse-resize",
  sw: "nesw-resize"
};

var flipX = {
  e: "w",
  w: "e",
  nw: "ne",
  ne: "nw",
  se: "sw",
  sw: "se"
};

var flipY = {
  n: "s",
  s: "n",
  nw: "sw",
  ne: "se",
  se: "ne",
  sw: "nw"
};

var signsX = {
  overlay: +1,
  selection: +1,
  n: null,
  e: +1,
  s: null,
  w: -1,
  nw: -1,
  ne: +1,
  se: +1,
  sw: -1
};

var signsY = {
  overlay: +1,
  selection: +1,
  n: -1,
  e: null,
  s: +1,
  w: null,
  nw: -1,
  ne: -1,
  se: +1,
  sw: +1
};

function type(t) {
  return {type: t};
}

// Ignore right-click, since that should open the context menu.
function defaultFilter(event) {
  return !event.ctrlKey && !event.button;
}

function defaultExtent() {
  var svg = this.ownerSVGElement || this;
  if (svg.hasAttribute("viewBox")) {
    svg = svg.viewBox.baseVal;
    return [[svg.x, svg.y], [svg.x + svg.width, svg.y + svg.height]];
  }
  return [[0, 0], [svg.width.baseVal.value, svg.height.baseVal.value]];
}

function defaultTouchable() {
  return navigator.maxTouchPoints || ("ontouchstart" in this);
}

// Like d3.local, but with the name “__brush” rather than auto-generated.
function local(node) {
  while (!node.__brush) if (!(node = node.parentNode)) return;
  return node.__brush;
}

function empty(extent) {
  return extent[0][0] === extent[1][0]
      || extent[0][1] === extent[1][1];
}

function brushSelection(node) {
  var state = node.__brush;
  return state ? state.dim.output(state.selection) : null;
}

function brushX() {
  return brush$1(X);
}

function brushY() {
  return brush$1(Y);
}

function brush() {
  return brush$1(XY);
}

function brush$1(dim) {
  var extent = defaultExtent,
      filter = defaultFilter,
      touchable = defaultTouchable,
      keys = true,
      listeners = dispatch$1("start", "brush", "end"),
      handleSize = 6,
      touchending;

  function brush(group) {
    var overlay = group
        .property("__brush", initialize)
      .selectAll(".overlay")
      .data([type("overlay")]);

    overlay.enter().append("rect")
        .attr("class", "overlay")
        .attr("pointer-events", "all")
        .attr("cursor", cursors.overlay)
      .merge(overlay)
        .each(function() {
          var extent = local(this).extent;
          select(this)
              .attr("x", extent[0][0])
              .attr("y", extent[0][1])
              .attr("width", extent[1][0] - extent[0][0])
              .attr("height", extent[1][1] - extent[0][1]);
        });

    group.selectAll(".selection")
      .data([type("selection")])
      .enter().append("rect")
        .attr("class", "selection")
        .attr("cursor", cursors.selection)
        .attr("fill", "#777")
        .attr("fill-opacity", 0.3)
        .attr("stroke", "#fff")
        .attr("shape-rendering", "crispEdges");

    var handle = group.selectAll(".handle")
      .data(dim.handles, function(d) { return d.type; });

    handle.exit().remove();

    handle.enter().append("rect")
        .attr("class", function(d) { return "handle handle--" + d.type; })
        .attr("cursor", function(d) { return cursors[d.type]; });

    group
        .each(redraw)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mousedown.brush", started)
      .filter(touchable)
        .on("touchstart.brush", started)
        .on("touchmove.brush", touchmoved)
        .on("touchend.brush touchcancel.brush", touchended)
        .style("touch-action", "none")
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  brush.move = function(group, selection) {
    if (group.tween) {
      group
          .on("start.brush", function(event) { emitter(this, arguments).beforestart().start(event); })
          .on("interrupt.brush end.brush", function(event) { emitter(this, arguments).end(event); })
          .tween("brush", function() {
            var that = this,
                state = that.__brush,
                emit = emitter(that, arguments),
                selection0 = state.selection,
                selection1 = dim.input(typeof selection === "function" ? selection.apply(this, arguments) : selection, state.extent),
                i = interpolate(selection0, selection1);

            function tween(t) {
              state.selection = t === 1 && selection1 === null ? null : i(t);
              redraw.call(that);
              emit.brush();
            }

            return selection0 !== null && selection1 !== null ? tween : tween(1);
          });
    } else {
      group
          .each(function() {
            var that = this,
                args = arguments,
                state = that.__brush,
                selection1 = dim.input(typeof selection === "function" ? selection.apply(that, args) : selection, state.extent),
                emit = emitter(that, args).beforestart();

            interrupt(that);
            state.selection = selection1 === null ? null : selection1;
            redraw.call(that);
            emit.start().brush().end();
          });
    }
  };

  brush.clear = function(group) {
    brush.move(group, null);
  };

  function redraw() {
    var group = select(this),
        selection = local(this).selection;

    if (selection) {
      group.selectAll(".selection")
          .style("display", null)
          .attr("x", selection[0][0])
          .attr("y", selection[0][1])
          .attr("width", selection[1][0] - selection[0][0])
          .attr("height", selection[1][1] - selection[0][1]);

      group.selectAll(".handle")
          .style("display", null)
          .attr("x", function(d) { return d.type[d.type.length - 1] === "e" ? selection[1][0] - handleSize / 2 : selection[0][0] - handleSize / 2; })
          .attr("y", function(d) { return d.type[0] === "s" ? selection[1][1] - handleSize / 2 : selection[0][1] - handleSize / 2; })
          .attr("width", function(d) { return d.type === "n" || d.type === "s" ? selection[1][0] - selection[0][0] + handleSize : handleSize; })
          .attr("height", function(d) { return d.type === "e" || d.type === "w" ? selection[1][1] - selection[0][1] + handleSize : handleSize; });
    }

    else {
      group.selectAll(".selection,.handle")
          .style("display", "none")
          .attr("x", null)
          .attr("y", null)
          .attr("width", null)
          .attr("height", null);
    }
  }

  function emitter(that, args, clean) {
    var emit = that.__brush.emitter;
    return emit && (!clean || !emit.clean) ? emit : new Emitter(that, args, clean);
  }

  function Emitter(that, args, clean) {
    this.that = that;
    this.args = args;
    this.state = that.__brush;
    this.active = 0;
    this.clean = clean;
  }

  Emitter.prototype = {
    beforestart: function() {
      if (++this.active === 1) this.state.emitter = this, this.starting = true;
      return this;
    },
    start: function(event, mode) {
      if (this.starting) this.starting = false, this.emit("start", event, mode);
      else this.emit("brush", event);
      return this;
    },
    brush: function(event, mode) {
      this.emit("brush", event, mode);
      return this;
    },
    end: function(event, mode) {
      if (--this.active === 0) delete this.state.emitter, this.emit("end", event, mode);
      return this;
    },
    emit: function(type, event, mode) {
      var d = select(this.that).datum();
      listeners.call(
        type,
        this.that,
        new BrushEvent(type, {
          sourceEvent: event,
          target: brush,
          selection: dim.output(this.state.selection),
          mode,
          dispatch: listeners
        }),
        d
      );
    }
  };

  function started(event) {
    if (touchending && !event.touches) return;
    if (!filter.apply(this, arguments)) return;

    var that = this,
        type = event.target.__data__.type,
        mode = (keys && event.metaKey ? type = "overlay" : type) === "selection" ? MODE_DRAG : (keys && event.altKey ? MODE_CENTER : MODE_HANDLE),
        signX = dim === Y ? null : signsX[type],
        signY = dim === X ? null : signsY[type],
        state = local(that),
        extent = state.extent,
        selection = state.selection,
        W = extent[0][0], w0, w1,
        N = extent[0][1], n0, n1,
        E = extent[1][0], e0, e1,
        S = extent[1][1], s0, s1,
        dx = 0,
        dy = 0,
        moving,
        shifting = signX && signY && keys && event.shiftKey,
        lockX,
        lockY,
        points = Array.from(event.touches || [event], t => {
          const i = t.identifier;
          t = pointer(t, that);
          t.point0 = t.slice();
          t.identifier = i;
          return t;
        });

    if (type === "overlay") {
      if (selection) moving = true;
      const pts = [points[0], points[1] || points[0]];
      state.selection = selection = [[
          w0 = dim === Y ? W : min$1(pts[0][0], pts[1][0]),
          n0 = dim === X ? N : min$1(pts[0][1], pts[1][1])
        ], [
          e0 = dim === Y ? E : max$2(pts[0][0], pts[1][0]),
          s0 = dim === X ? S : max$2(pts[0][1], pts[1][1])
        ]];
      if (points.length > 1) move();
    } else {
      w0 = selection[0][0];
      n0 = selection[0][1];
      e0 = selection[1][0];
      s0 = selection[1][1];
    }

    w1 = w0;
    n1 = n0;
    e1 = e0;
    s1 = s0;

    var group = select(that)
        .attr("pointer-events", "none");

    var overlay = group.selectAll(".overlay")
        .attr("cursor", cursors[type]);

    interrupt(that);
    var emit = emitter(that, arguments, true).beforestart();

    if (event.touches) {
      emit.moved = moved;
      emit.ended = ended;
    } else {
      var view = select(event.view)
          .on("mousemove.brush", moved, true)
          .on("mouseup.brush", ended, true);
      if (keys) view
          .on("keydown.brush", keydowned, true)
          .on("keyup.brush", keyupped, true);

      dragDisable(event.view);
    }

    redraw.call(that);
    emit.start(event, mode.name);

    function moved(event) {
      for (const p of event.changedTouches || [event]) {
        for (const d of points)
          if (d.identifier === p.identifier) d.cur = pointer(p, that);
      }
      if (shifting && !lockX && !lockY && points.length === 1) {
        const point = points[0];
        if (abs(point.cur[0] - point[0]) > abs(point.cur[1] - point[1]))
          lockY = true;
        else
          lockX = true;
      }
      for (const point of points)
        if (point.cur) point[0] = point.cur[0], point[1] = point.cur[1];
      moving = true;
      noevent$1(event);
      move(event);
    }

    function move(event) {
      const point = points[0], point0 = point.point0;
      var t;

      dx = point[0] - point0[0];
      dy = point[1] - point0[1];

      switch (mode) {
        case MODE_SPACE:
        case MODE_DRAG: {
          if (signX) dx = max$2(W - w0, min$1(E - e0, dx)), w1 = w0 + dx, e1 = e0 + dx;
          if (signY) dy = max$2(N - n0, min$1(S - s0, dy)), n1 = n0 + dy, s1 = s0 + dy;
          break;
        }
        case MODE_HANDLE: {
          if (points[1]) {
            if (signX) w1 = max$2(W, min$1(E, points[0][0])), e1 = max$2(W, min$1(E, points[1][0])), signX = 1;
            if (signY) n1 = max$2(N, min$1(S, points[0][1])), s1 = max$2(N, min$1(S, points[1][1])), signY = 1;
          } else {
            if (signX < 0) dx = max$2(W - w0, min$1(E - w0, dx)), w1 = w0 + dx, e1 = e0;
            else if (signX > 0) dx = max$2(W - e0, min$1(E - e0, dx)), w1 = w0, e1 = e0 + dx;
            if (signY < 0) dy = max$2(N - n0, min$1(S - n0, dy)), n1 = n0 + dy, s1 = s0;
            else if (signY > 0) dy = max$2(N - s0, min$1(S - s0, dy)), n1 = n0, s1 = s0 + dy;
          }
          break;
        }
        case MODE_CENTER: {
          if (signX) w1 = max$2(W, min$1(E, w0 - dx * signX)), e1 = max$2(W, min$1(E, e0 + dx * signX));
          if (signY) n1 = max$2(N, min$1(S, n0 - dy * signY)), s1 = max$2(N, min$1(S, s0 + dy * signY));
          break;
        }
      }

      if (e1 < w1) {
        signX *= -1;
        t = w0, w0 = e0, e0 = t;
        t = w1, w1 = e1, e1 = t;
        if (type in flipX) overlay.attr("cursor", cursors[type = flipX[type]]);
      }

      if (s1 < n1) {
        signY *= -1;
        t = n0, n0 = s0, s0 = t;
        t = n1, n1 = s1, s1 = t;
        if (type in flipY) overlay.attr("cursor", cursors[type = flipY[type]]);
      }

      if (state.selection) selection = state.selection; // May be set by brush.move!
      if (lockX) w1 = selection[0][0], e1 = selection[1][0];
      if (lockY) n1 = selection[0][1], s1 = selection[1][1];

      if (selection[0][0] !== w1
          || selection[0][1] !== n1
          || selection[1][0] !== e1
          || selection[1][1] !== s1) {
        state.selection = [[w1, n1], [e1, s1]];
        redraw.call(that);
        emit.brush(event, mode.name);
      }
    }

    function ended(event) {
      nopropagation(event);
      if (event.touches) {
        if (event.touches.length) return;
        if (touchending) clearTimeout(touchending);
        touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
      } else {
        yesdrag(event.view, moving);
        view.on("keydown.brush keyup.brush mousemove.brush mouseup.brush", null);
      }
      group.attr("pointer-events", "all");
      overlay.attr("cursor", cursors.overlay);
      if (state.selection) selection = state.selection; // May be set by brush.move (on start)!
      if (empty(selection)) state.selection = null, redraw.call(that);
      emit.end(event, mode.name);
    }

    function keydowned(event) {
      switch (event.keyCode) {
        case 16: { // SHIFT
          shifting = signX && signY;
          break;
        }
        case 18: { // ALT
          if (mode === MODE_HANDLE) {
            if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX;
            if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY;
            mode = MODE_CENTER;
            move();
          }
          break;
        }
        case 32: { // SPACE; takes priority over ALT
          if (mode === MODE_HANDLE || mode === MODE_CENTER) {
            if (signX < 0) e0 = e1 - dx; else if (signX > 0) w0 = w1 - dx;
            if (signY < 0) s0 = s1 - dy; else if (signY > 0) n0 = n1 - dy;
            mode = MODE_SPACE;
            overlay.attr("cursor", cursors.selection);
            move();
          }
          break;
        }
        default: return;
      }
      noevent$1(event);
    }

    function keyupped(event) {
      switch (event.keyCode) {
        case 16: { // SHIFT
          if (shifting) {
            lockX = lockY = shifting = false;
            move();
          }
          break;
        }
        case 18: { // ALT
          if (mode === MODE_CENTER) {
            if (signX < 0) e0 = e1; else if (signX > 0) w0 = w1;
            if (signY < 0) s0 = s1; else if (signY > 0) n0 = n1;
            mode = MODE_HANDLE;
            move();
          }
          break;
        }
        case 32: { // SPACE
          if (mode === MODE_SPACE) {
            if (event.altKey) {
              if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX;
              if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY;
              mode = MODE_CENTER;
            } else {
              if (signX < 0) e0 = e1; else if (signX > 0) w0 = w1;
              if (signY < 0) s0 = s1; else if (signY > 0) n0 = n1;
              mode = MODE_HANDLE;
            }
            overlay.attr("cursor", cursors[type]);
            move();
          }
          break;
        }
        default: return;
      }
      noevent$1(event);
    }
  }

  function touchmoved(event) {
    emitter(this, arguments).moved(event);
  }

  function touchended(event) {
    emitter(this, arguments).ended(event);
  }

  function initialize() {
    var state = this.__brush || {selection: null};
    state.extent = number2(extent.apply(this, arguments));
    state.dim = dim;
    return state;
  }

  brush.extent = function(_) {
    return arguments.length ? (extent = typeof _ === "function" ? _ : constant$3(number2(_)), brush) : extent;
  };

  brush.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant$3(!!_), brush) : filter;
  };

  brush.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant$3(!!_), brush) : touchable;
  };

  brush.handleSize = function(_) {
    return arguments.length ? (handleSize = +_, brush) : handleSize;
  };

  brush.keyModifiers = function(_) {
    return arguments.length ? (keys = !!_, brush) : keys;
  };

  brush.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? brush : value;
  };

  return brush;
}

var brush$2 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  brush: brush,
  brushX: brushX,
  brushY: brushY,
  brushSelection: brushSelection
});

const instance$1 = brush();
const keys$1 = Object.keys(instance$1 || {});
const props$3 = shapeProperties(keys$1);

class D3Brush extends LitElement {

  static get properties() {

    return {

      ...props$3,

      type: {
        type: String
      },

      
    };
  }
  
  constructor() {
    super();
    this.__init = true;
  }

  update(props) {
    this.log && console.info(`d3-brush${this.type} update`, props);
    if (!this.type && !props.has('type')) {
      this.type = 'brushX';
    }

    if (!this.brush || props.has('type')) {
      this.brush = brush$2[this.type]();
    }

    if (this.brush) {
      this.updateWrapper(props);
    }
    super.update(props);
  }

  updateWrapper(props) {
    let shallNotify = this.__init;
    props.forEach((value, key) => {
      if ((this[key] !== undefined) && key !== 'brush' && this.brush[key]) {
        shallNotify = true;
        this.brush[key](this[key]);
      }
    });
    if (shallNotify) {
      this.dispatchEvent(new CustomEvent(`brush-changed`, { detail: { value: this.brush, type: this.type }, bubbles: true, composed: true }));
       delete this.__init;
    }
  }
}

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// Microtask implemented using Mutation Observer
let microtaskCurrHandle = 0;
let microtaskLastHandle = 0;
let microtaskCallbacks = [];
let microtaskNodeContent = 0;
let microtaskScheduled = false;
let microtaskNode = document.createTextNode('');
new window.MutationObserver(microtaskFlush).observe(microtaskNode, {characterData: true});

function microtaskFlush() {
  microtaskScheduled = false;
  const len = microtaskCallbacks.length;
  for (let i = 0; i < len; i++) {
    let cb = microtaskCallbacks[i];
    if (cb) {
      try {
        cb();
      } catch (e) {
        setTimeout(() => { throw e; });
      }
    }
  }
  microtaskCallbacks.splice(0, len);
  microtaskLastHandle += len;
}

/**
 * Async interface wrapper around `setTimeout`.
 *
 * @namespace
 * @summary Async interface wrapper around `setTimeout`.
 */
const timeOut = {
  /**
   * Returns a sub-module with the async interface providing the provided
   * delay.
   *
   * @memberof timeOut
   * @param {number=} delay Time to wait before calling callbacks in ms
   * @return {!AsyncInterface} An async timeout interface
   */
  after(delay) {
    return {
      run(fn) { return window.setTimeout(fn, delay); },
      cancel(handle) {
        window.clearTimeout(handle);
      }
    };
  },
  /**
   * Enqueues a function called in the next task.
   *
   * @memberof timeOut
   * @param {!Function} fn Callback to run
   * @param {number=} delay Delay in milliseconds
   * @return {number} Handle used for canceling task
   */
  run(fn, delay) {
    return window.setTimeout(fn, delay);
  },
  /**
   * Cancels a previously enqueued `timeOut` callback.
   *
   * @memberof timeOut
   * @param {number} handle Handle returned from `run` of callback to cancel
   * @return {void}
   */
  cancel(handle) {
    window.clearTimeout(handle);
  }
};

/**
 * Async interface for enqueuing callbacks that run at microtask timing.
 *
 * Note that microtask timing is achieved via a single `MutationObserver`,
 * and thus callbacks enqueued with this API will all run in a single
 * batch, and not interleaved with other microtasks such as promises.
 * Promises are avoided as an implementation choice for the time being
 * due to Safari bugs that cause Promises to lack microtask guarantees.
 *
 * @namespace
 * @summary Async interface for enqueuing callbacks that run at microtask
 *   timing.
 */
const microTask = {

  /**
   * Enqueues a function called at microtask timing.
   *
   * @memberof microTask
   * @param {!Function=} callback Callback to run
   * @return {number} Handle used for canceling task
   */
  run(callback) {
    if (!microtaskScheduled) {
      microtaskScheduled = true;
      microtaskNode.textContent = microtaskNodeContent++;
    }
    microtaskCallbacks.push(callback);
    return microtaskCurrHandle++;
  },

  /**
   * Cancels a previously enqueued `microTask` callback.
   *
   * @memberof microTask
   * @param {number} handle Handle returned from `run` of callback to cancel
   * @return {void}
   */
  cancel(handle) {
    const idx = handle - microtaskLastHandle;
    if (idx >= 0) {
      if (!microtaskCallbacks[idx]) {
        throw new Error('invalid async handle: ' + handle);
      }
      microtaskCallbacks[idx] = null;
    }
  }

};

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
 * @summary Collapse multiple callbacks into one invocation after a timer.
 */
class Debouncer {
  constructor() {
    this._asyncModule = null;
    this._callback = null;
    this._timer = null;
  }
  /**
   * Sets the scheduler; that is, a module with the Async interface,
   * a callback and optional arguments to be passed to the run function
   * from the async module.
   *
   * @param {!AsyncInterface} asyncModule Object with Async interface.
   * @param {function()} callback Callback to run.
   * @return {void}
   */
  setConfig(asyncModule, callback) {
    this._asyncModule = asyncModule;
    this._callback = callback;
    this._timer = this._asyncModule.run(() => {
      this._timer = null;
      debouncerQueue.delete(this);
      this._callback();
    });
  }
  /**
   * Cancels an active debouncer and returns a reference to itself.
   *
   * @return {void}
   */
  cancel() {
    if (this.isActive()) {
      this._cancelAsync();
      // Canceling a debouncer removes its spot from the flush queue,
      // so if a debouncer is manually canceled and re-debounced, it
      // will reset its flush order (this is a very minor difference from 1.x)
      // Re-debouncing via the `debounce` API retains the 1.x FIFO flush order
      debouncerQueue.delete(this);
    }
  }
  /**
   * Cancels a debouncer's async callback.
   *
   * @return {void}
   */
  _cancelAsync() {
    if (this.isActive()) {
      this._asyncModule.cancel(/** @type {number} */(this._timer));
      this._timer = null;
    }
  }
  /**
   * Flushes an active debouncer and returns a reference to itself.
   *
   * @return {void}
   */
  flush() {
    if (this.isActive()) {
      this.cancel();
      this._callback();
    }
  }
  /**
   * Returns true if the debouncer is active.
   *
   * @return {boolean} True if active.
   */
  isActive() {
    return this._timer != null;
  }
  /**
   * Creates a debouncer if no debouncer is passed as a parameter
   * or it cancels an active debouncer otherwise. The following
   * example shows how a debouncer can be called multiple times within a
   * microtask and "debounced" such that the provided callback function is
   * called once. Add this method to a custom element:
   *
   * ```js
   * import {microTask} from '@polymer/polymer/lib/utils/async.js';
   * import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
   * // ...
   *
   * _debounceWork() {
   *   this._debounceJob = Debouncer.debounce(this._debounceJob,
   *       microTask, () => this._doWork());
   * }
   * ```
   *
   * If the `_debounceWork` method is called multiple times within the same
   * microtask, the `_doWork` function will be called only once at the next
   * microtask checkpoint.
   *
   * Note: In testing it is often convenient to avoid asynchrony. To accomplish
   * this with a debouncer, you can use `enqueueDebouncer` and
   * `flush`. For example, extend the above example by adding
   * `enqueueDebouncer(this._debounceJob)` at the end of the
   * `_debounceWork` method. Then in a test, call `flush` to ensure
   * the debouncer has completed.
   *
   * @param {Debouncer?} debouncer Debouncer object.
   * @param {!AsyncInterface} asyncModule Object with Async interface
   * @param {function()} callback Callback to run.
   * @return {!Debouncer} Returns a debouncer object.
   */
  static debounce(debouncer, asyncModule, callback) {
    if (debouncer instanceof Debouncer) {
      // Cancel the async callback, but leave in debouncerQueue if it was
      // enqueued, to maintain 1.x flush order
      debouncer._cancelAsync();
    } else {
      debouncer = new Debouncer();
    }
    debouncer.setConfig(asyncModule, callback);
    return debouncer;
  }
}

let debouncerQueue = new Set();

/**
 * ##  Draw
 *
 * handles drawable drawing mechanism
 *
 * @memberof MultiChart.mixin
 * @polymer
 * @mixinFunction
 */
const Draw = superClass => {

  return class extends superClass {

    static get properties() {

      return {

        ...super.properties,

        /*
         * `data`  to draw the chart from
         */
        data: {
          type: Array
        },

        /*
         * `transition` a transition composer function
         */
        transition: {
          type: Function,
          value: function() {
            return function(transition) {
              return transition.duration(200);
            };
          }
        },

        /*
         * `filter` a way to filter data passed to draw method
         *
         */
        filter: {
          type: Function
        },

        /*
         * `decorate` the chart once drawn
         */
        decorate: {
          type: Function
        }

      };
    }

    constructor() {
      super();
      super.decorate = chart => chart;
    }

    /*
     * `getDrawable` allows to specify which data to use for generating the chart.
     * This is usefull for multi-geo where chart is generated by topojson feature and not by raw data.
     */
    get drawableData() {
      return this._shaped;
    }

    setData(data) {
      if (data) {
        // Note(cg): filter allows to dispay only a subset of the data.
        // This is usefull for instance when we want to display multiple groups.
        if (this.filter) {
          this.data = data.filter(this.filter);
        } else { this.data = data; }
      }
    }

    update(props) {
      this.log && console.info('update props', props, this);
      if (props.has('data')) {
        this._shaped = this.shape(this.data);
      }
      super.update(props);
    }

    updated(props) {
      this.log && console.info('updated props', props, this);
      this.debounceDraw();
      super.updated(props);
    }

    /*
     * `shape` some charts are easier to draw is data is reshaped (for instance, stack chart)
     */
    shape(data) {
      return data;
    }

    debounceDraw() {
      this.log && console.info('debounce', this);
      this._debounceDraw = Debouncer.debounce(
        this._debounceDraw, // initially undefined
        timeOut.after(10),
        () => {
          this.log && console.info('debounced', this);
          const isDrawn = this.draw();
          this._isDrawn = !!isDrawn;
          if (this.decorate && this._isDrawn) {
            this.decorate(isDrawn, this.drawableData);
          }
          this.dispatchEvent(new CustomEvent('multi-drawn', { detail: {}, bubbles: true, composed: true }));
        });
    }

    /*
     * `draw` this is where do the work !
     */
    draw() {
      this.log && console.error(`draw method shall be overriden in subClasses.`);
    }

    /*
     * `shallTransition` called within the draw function to know if transition shall be applied
     */
    get shallTransition() {
      // Note(cg): by default, we skip the transition for first draw.
      return this.transition && this._isDrawn === true;
    }

    dataChanged(data, transition) {
      this.log && console.info('dataChanged', this.data === data);
      this.data = data;
      if (transition) {
        this.transition = transition;
      }

    }
    /*
     * `applyTransition`  applies a transition to chart
     */
    applyTransition(chart, transition) {
      return chart.transition().call(transition)
        .on('end', this.onEndTransition);
    }

    onEndTransition() {}


  };
};

/**
 * Returns the event name for the given property.
 * @param  {string}                       name    property name
 * @param  {PropertyDeclaration} options property declaration
 * @return                                event name to fire
 */
function eventNameForProperty(name, { notify, attribute } = {}) {
    if (notify && typeof notify === 'string') {
        return notify;
    } else if (attribute && typeof attribute === 'string') {
        return `${attribute}-changed`;
    } else {
        return `${name.toLowerCase()}-changed`;
    }
}

// eslint-disable-next-line valid-jsdoc
/**
 * Enables the nofity option for properties to fire change notification events
 *
 * @template TBase
 * @param {Constructor<TBase>} baseElement
 */
const LitNotify = (baseElement) => class NotifyingElement extends baseElement {
    /**
     * check for changed properties with notify option and fire the events
     */
    update(changedProps) {
        super.update(changedProps);

        for (const prop of changedProps.keys()) {
            const declaration = this.constructor._classProperties.get(prop);
            if (!declaration || !declaration.notify) continue;
            const type = eventNameForProperty(prop, declaration);
            const value = this[prop];
            this.dispatchEvent(new CustomEvent(type, { detail: { value } }));
        }
    }
};

/**
 * ## MultiChartBase
 *
 * `<multi-chart-base>` base class for multi-chart other elements
 *
 * @memberof MultiChart
 * @customElement
 * @polymer
 * @appliesMixin MultiChart.mixin.Logger
 * @appliesMixin MultiChart.mixin.PolymerExtends
 * @demo
 **/

const deep = (action, obj, keys, id, key) => {
  keys = keys.split('.');
  id = keys.splice(-1, 1);
  for (key in keys) obj = obj[keys[key]] = obj[keys[key]] || {};
  return action(obj, id);
};

const get$2 = (obj, prop) => obj[prop];
const set$3 = n => (obj, prop) => (obj[prop] = n);

class Base extends
defaultValue(
  selectMixin(
    doNotSetUndefinedValue(
      LitElement))) {

  dispatch(name) {
    this.dispatchEvent(new CustomEvent(`${name}-changed`, {
      detail: {
        value: this[name]
      },
      bubbles: true,
      composed: true
    }));
  }

  get(path) {
    return deep(get$2, this, path);
  }

  set(path, value) {
    return deep(set$3(value), this, path);
  }

  static get properties() {
    return {
      ...super.properties,

      /*
       * `log`  true to show log
       */
      log: {
        type: Boolean,
      },
    }
  }

}

class MultiNotify extends LitNotify(Base) {}
class MultiChartBase extends MultiNotify {}

function colors$1(specifier) {
  var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
  while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
  return colors;
}

var schemeCategory10 = colors$1("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

// import { SVGHelper } from '../helper/svg-helper-mixin.js';


/**
 * ## MultiDrawable
 *
 * `<multi-drawable>` it a base Class for chart element that can be drawn (e.g. line, circle ...)
 *
 **/
class MultiDrawable extends(
    DispatchSVG(
        Draw(
          Registerable(
            CacheId(
              MultiChartBase))))) {

  static get styles() {
    return css`
     :host {
        display: none;
      }`;
    }
    
    // Note(cg): Hack allowing extend multi-container
    // in other libraries
    get html() {
      return html$1;
    }

  static get properties() {

    return {

      ...super.properties,

      /* 
       * `key`  some drawable need to have a key (for example lines in a line chart, to as to apply a colorScale)
       */
      key: {
        type: String
      },

      /* 
       * `colorScale` colorScale to use for the chart (example d3.scaleOrdinal().range(d3.schemeCategory10);)
       */
      colorScale: {
        type: Function, 
        attribute: 'color-scale',
        value: function() {
          return ordinal().range(schemeCategory10);
        }
      },
      
      width: {
        type: Number,
      }, 


      height: {
        type: Number,
      }


    };
  }

  /*
   * `dataProcessType` the type of data processing. Stacked data (e.g. for bar chart) will be stacked
   */
  get dataProcessType() {
    return '';
  }

  /**
   * `targetElement` getter override lifecycle Behavior and called during attached
   */
  get targetElement() {
    return this.$.drawable;
  }

  get minSize() {
    if (this.width && this.height) {
      return Math.min(this.width, this.height);
    }
    return null;

  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

}

var axisProps = {
  /**
   * `text` text for the axis 
   */
  text: { type: String },

  /**
   * `textAngle` rotation angle to be applied to text axis
   */
  textAngle: { type: Number, attribute: 'text-angle' },
  
  dx: { type: String },
  dy: { type: String },
  x: { type: String },
  y: { type: String },
  xText: { type: String, attribute: 'x-text' },
  yText: { type: String, attribute: 'y-text' },

  decorate: {type: Function}
};

class MultiAxis extends 
  CacheId(
    RelayTo(
      MultiDrawable)) {

  // Note(cg): style to add to svghost while dispatching SVG.
  static get hostStyles() {
    return css`

      #axis.axis line,
      #axis.axis path {
        stroke: var(--multi-axis-color, var(--secondary-text-color));
      }

      #axis.axis text {
        fill: var(--multi-axis-color, var(--secondary-text-color));
      }`;
  } 

  /**
   * Implement `render` to define a template for your element.
   */
  render() {
    return html$1 `
      <d3-axis 
        id="d3-axis"
        .type="${this.type}" 
        @axis-changed="${e => this.axis = e.detail.value}"></d3-axis>
      <svg>
        <g id="axis" part="axis-${this.type}" slot-svg="slot-axis" type="${this.type}" class="axis ${this.type}" transform="translate(${this._x}, ${this._y})">
          <text class="axis-text" 
            transform="rotate(${this.textAngle || 0})" 
            x="${this._xText}" 
            y="${this._yText}" 
            dx="${this.dx || 0}" 
            dy="${this.dy || 0}" 
            text-anchor="end">${this.text}</text>
        </g>
      </svg>
    `;
  }

  get _x() {
    return this.x || (this.width && this.type && this.type === 'right' ? this.width : 0);
  }

  get _y() {
    return this.y || (this.height && this.type && this.type === 'bottom' ? this.height : 0);
  }

  get _xText() {
    return this.xText || (this.width && this.type && (this.type === 'right' || this.type === 'bottom') ? this.width : 0);
  }

  get _yText() {
    // return this.yText || (this.height && this.type && this.type === 'bottom' ? this.height : 0);
    return this.yText || 0;
  }

  static get properties() {

    return {

      ...super.properties,

      ...D3Axis.properties,

      ...axisProps,

      /**
       * `axis` the [d3 axis](https://github.com/d3/d3-axis) function 
       */
      axis: {
        type: Function,
      },


      /* 
       * `scale`  the [d3-scale](https://github.com/d3/d3-axis) to use for this axis
       */
      scale: {
        type: Function,
      },

      /**
       * `type` axis type 'left'. 'right', 'top' or 'bottom'
       */
      type: {
        type: String,
        reflect: true
      }
    };

  }

/**
   * From RelayTo mixin, used to automatically relay properties to child components
   */
   shallRelayTo(key, name) {
    if (name === 'd3-axis') {
      return D3Axis.properties[key];
    }
  }

  update(props) {
    super.update(props);
    this.relayTo(props, 'd3-axis');
  }

  draw(data) {
    const sel = select(this.$.axis);
    if (sel && this.scale && this.axis) {

      // Note(cg): we skip transition first time we draw.
      if (this.shallTransition) {
        sel.transition().call(this.transition).call(this.axis.scale(this.scale));
      } else {
        sel.call(this.axis.scale(this.scale));
      }
      return sel;
    }
  }

}
// Register the new element with the browser.
// customElements.define('multi-axis', MultiAxis);

function attrsFunction(selection, map) {
  return selection.each(function() {
    var x = map.apply(this, arguments), s = select(this);
    for (var name in x) s.attr(name, x[name]);
  });
}

function attrsObject(selection, map) {
  for (var name in map) selection.attr(name, map[name]);
  return selection;
}

function selection_attrs(map) {
  return (typeof map === "function" ? attrsFunction : attrsObject)(this, map);
}

function stylesFunction(selection, map, priority) {
  return selection.each(function() {
    var x = map.apply(this, arguments), s = select(this);
    for (var name in x) s.style(name, x[name], priority);
  });
}

function stylesObject(selection, map, priority) {
  for (var name in map) selection.style(name, map[name], priority);
  return selection;
}

function selection_styles(map, priority) {
  return (typeof map === "function" ? stylesFunction : stylesObject)(this, map, priority == null ? "" : priority);
}

function propertiesFunction(selection, map) {
  return selection.each(function() {
    var x = map.apply(this, arguments), s = select(this);
    for (var name in x) s.property(name, x[name]);
  });
}

function propertiesObject(selection, map) {
  for (var name in map) selection.property(name, map[name]);
  return selection;
}

function selection_properties(map) {
  return (typeof map === "function" ? propertiesFunction : propertiesObject)(this, map);
}

function attrsFunction$1(transition, map) {
  return transition.each(function() {
    var x = map.apply(this, arguments), t = select(this).transition(transition);
    for (var name in x) t.attr(name, x[name]);
  });
}

function attrsObject$1(transition, map) {
  for (var name in map) transition.attr(name, map[name]);
  return transition;
}

function transition_attrs(map) {
  return (typeof map === "function" ? attrsFunction$1 : attrsObject$1)(this, map);
}

function stylesFunction$1(transition, map, priority) {
  return transition.each(function() {
    var x = map.apply(this, arguments), t = select(this).transition(transition);
    for (var name in x) t.style(name, x[name], priority);
  });
}

function stylesObject$1(transition, map, priority) {
  for (var name in map) transition.style(name, map[name], priority);
  return transition;
}

function transition_styles(map, priority) {
  return (typeof map === "function" ? stylesFunction$1 : stylesObject$1)(this, map, priority == null ? "" : priority);
}

selection.prototype.attrs = selection_attrs;
selection.prototype.styles = selection_styles;
selection.prototype.properties = selection_properties;
transition.prototype.attrs = transition_attrs;
transition.prototype.styles = transition_styles;

class MultiRadarAxes extends
CacheId(
  RelayTo(
    MultiDrawable)) {

  // Note(cg): style to add to svghost while dispatching SVG.
  static get hostStyles() {
    return css `

      #axes.axis line,
      #axes.axis path {
        stroke: var(--multi-axis-color, var(--secondary-text-color));
      }

      #axes.axis text {
        fill: var(--multi-axis-color, var(--secondary-text-color));
      }`;
  }

  /**
   * Implement `render` to define a template for your element.
   */
  render() {
    return html$1 `
     
      <svg>
        <g id="axes" part="axes-group" slot-svg="slot-background" transform="translate(${this.width / 2 || 0}, ${this.height / 2 || 0})">
          <g id="axisWrapper"></g>
        </g>
      </svg>
    `;
  }

  static get properties() {

    return {

      ...super.properties,

      /**
       * `axes` array of axis for radat chart
       *  {label: 'label', key: 'key', max: max, class: 'class', xOffset, offset, yOffset: offset}
       */
      axes: {
        type: Array,
      },

      /*
       * `labelAccessor` accessor to get text labels
       */
      labelAccessor: {
        type: Function,
        value: () => {
          return (d) => d.label || d;
        }
      },

      /*
       * `radius` - radius of the chart. Set by multi-chart-radar when scale is calculated (onDataGroupRescaled)
       */
      // radius: {
      //   type: Number,
      // },

      /*
       * `levels` How many levels or inner circles should there be drawn
       */
      levels: {
        type: Number,
        value: 3
      },

      hideAxis: {
        type: Boolean,
        value: false
      },

      hideCircles: {
        type: Boolean,
        value: false
      },

      /*
       * `circleConfig` config applied to circles
       */
      circleConfig: {
        type: Object,
        value: {
          'fill': '#cdcdcd',
          'stroke': '#fff',
          'stroke-width': 2,
          'stroke-dasharray': 10,
          'fill-opacity': 0.15
        }
      },

      /*
       * `axisTextConfig` config to be applied to axis text
       */
      axisTextConfig: {
        type: Object,
        value: {
          'dy': '0.4em',
          'font-size': '10',
          'fill': '#737373'
        }
      },

      /*
       * `axisLineConfig` config to be applied to axis line
       */
      axisLineConfig: {
        type: Object,
        value: {
          'stroke': '#fff',
          'stroke-width': '3'
        }
      },

      /*
       * `axisLabelConfig` config to be applied to axis label
       */
      axisLabelConfig: {
        type: Object,
        value: {
          'font-size': '11',
          'text-anchor': 'middle',
          'dy': '0.35em'
        }
      },

      /*
       * `wrapWidth`
       */
      wrapWidth: {
        type: Number,
        value: 50
      },

      /*
       * `labelFactor` How much farther than the radius of the outer circle should the labels be placed
       */
      labelFactor: {
        type: Number,
        value: 1.1
      },

      /*
       * `scaleFactor` factor by which we reduce the size of the chart so that labels
       * do not overflow
       */
      scaleFactor: {
        type: Number,
        value: 0.8
      },

      /*
       * `format` d3.format to use for grid circles labels
       */
      format: {
        type: String,
        // value: '.0%'
        value: '.2s'
      },

      radialDomain: {
        type: Array,
      },

      radialScale: {
        type: Function,
      }

    };

  }

  draw(data) {
    const axisWrapper = select(this.$.axisWrapper);
    if (!this.width || !this.height) {
      return;
    }
    if (!this.axes || !this.axes.length || !this.radialScale) {
      return;
    }

    // Wrapper for the grid & axes
    // const axisGrid = sel.append('g').attr('class', 'axisWrapper');
    // const radius = this.minSize / 2 * this.scaleFactor;
    const scale = this.radialScale;
    const radius = scale.range()[1];
    const maxValue = scale.domain()[1];
    const Format = format(this.format);
    const angleSlice = Math.PI * 2 / this.axes.length;


    // Draw the background circles
    if (!this.hideCircles) {
      let levels = axisWrapper.selectAll('.gridCircle')
        .data(range(1, (this.levels + 1)).reverse());

      levels.exit().remove();

      levels = levels
        .enter()
        .append('circle')
        .merge(levels)
        .attr('class', 'gridCircle')
        .attr('r', (d, i) => { return radius / this.levels * d; })
        .attrs(this.circleConfig);
    }

    if (!this.hideAxis) {
      // Text indicating at what % each level is
      let grids = axisWrapper.selectAll('.axisLabel')
        .data(range(1, (this.levels + 1)).reverse());

      grids.exit().remove();

      grids = grids
        .enter()
        .append('text')
        .merge(grids)
        .attr('class', 'axisLabel')
        .attr('x', 4)
        .attr('y', (d) => { return -d * radius / this.levels; })
        .attrs(this.axisTextConfig)
        .text((d, i) => { return Format(maxValue * d / this.levels); });

      // Create the straight lines radiating outward from the center
      let axis = axisWrapper.selectAll('.axis')
        .data(this.axes);

      axis.exit().remove();

      axis = axis
        .enter()
        .append('g')
        .merge(axis)
        .attr('class', 'axis');

      axis.selectAll('*').remove();

      axis.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d, i) => { return scale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2); })
        .attr('y2', (d, i) => { return scale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2); })
        .attrs(this.axisLineConfig)
        .attr('class', 'line');

      // Append the labels at each axis
      axis.append('text')
        .attr('class', 'legend')
        .attrs(this.axisTextConfig)
        .attr('x', (d, i) => { return scale(maxValue * this.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2); })
        .attr('y', (d, i) => { return scale(maxValue * this.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2); })
        .attr('text-anchor', function(d, i) {
          return this.getAttribute('x') * 1 < 0 ? 'end' : '';
        })
        .text(this.labelAccessor)
        .call(wrap, this.wrapWidth);
    }
  }
}

const MultiDrawableSerie = dedupingMixin( superClass => {

  return class extends superClass {

    static get properties() {
      return {

        ...super.properties,

        /*
         * `selectSerie` if true, will set the `selectable` attribute at serie level. Default (falsy) will
         * add `selectable` attribute to each individual shape (rect in car chart, circle in bubble chart)
         */
        selectSerie: {
          type: Boolean,
          attribute: 'select-serie'
        },

        /*
         * `colorSerie` if true, all elements of the serie will have the same color.
         * Otherwise, will color serie elements individually
         */
        // colorSerie: {
        //   type: Boolean,
        //   attribute: 'color-serie'
        // }
      };
    }

    get shapeClass() {
      this.log && console.warn('shapeClass need to be overriden in subClass.');
      return 'serie';
    }

    get shapeName() {
      return 'path';
    }

    drawSerieElement(chart, data) {
      this.log && console.warn('drawing serie element shall be implemented in subclass');
      return chart;
    }

    /*
     * `drawSerieGroup` builds one level of data  binding -> remove superfluous -> append new -> merge -> return chart
     * We can hence call this function for first grouping all keys and then build individual shapes (see multi-drawable-bubble)
     */
    drawSerieGroup(data, shapeName, shapeClass, chart, transition$1) {
      const isTransition = chart && chart instanceof transition;
      const cls = chart ? 'shape' : 'shape-group';
      chart = chart ?
        isTransition ?
        chart.selection().selectAll(`${shapeName}.${shapeClass}`).data(d => d.data || d) :
        chart.selectAll(`${shapeName}.${shapeClass}`).data(d => d.data || d) :
        select(this.targetElement).selectAll(`${shapeName}.${shapeClass}`).data(data);

      chart.exit().remove();

      chart = chart.enter().append(shapeName)
        .attr('class', `${shapeClass} ${cls}`)
        .merge(chart);

      if (this.shallTransition && transition$1) {
        chart = this.applyTransition(chart, transition$1);
      }
      return chart;
    }

    /*
     * `draw` serie data, which are in the form of [{key, label, data: [dataValues]}]
     */
    draw() {
      const data = this.drawableData;
      if (!this.width || !this.height || !data) {
        return;
      }

      const chart = this.drawSerieGroup(data, this.shapeName, this.shapeClass, null, this.transition);

      // Note(cg): individual serie members (e.g. draw individual line or bar) are handled by subclasses .
      return this.drawSerieElement(chart, data);

    }
  };
});

/**
 * ##  MultiDrawableSerie
 * 
 * a Mixin to implement generic draw function for seriest
 * 
 * @memberof MultiChart.mixin
 * @polymer
 * @mixinFunction
 */
const Shaper = dedupingMixin( superClass => {

  return class extends superClass {

    static get properties() {
      return {

        ...super.properties,

        /* 
         * `shaper`  shaper function for generating path ([for instance, pie](https://github.com/d3/d3-shape#lines)
         */
        shaper: {
          type: Function
        }


      };
    }

    onSetShaper(e) {

      // Note(cg): allow the event to further propagate and assign proper group.
      e.detail.group = this.group;
      this.shaper = e.detail.value;
    }

  };
});

const pi = Math.PI,
    tau = 2 * pi,
    epsilon$1 = 1e-6,
    tauEpsilon = tau - epsilon$1;

function Path() {
  this._x0 = this._y0 = // start of current subpath
  this._x1 = this._y1 = null; // end of current subpath
  this._ = "";
}

function path() {
  return new Path;
}

Path.prototype = path.prototype = {
  constructor: Path,
  moveTo: function(x, y) {
    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
  },
  closePath: function() {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0;
      this._ += "Z";
    }
  },
  lineTo: function(x, y) {
    this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  quadraticCurveTo: function(x1, y1, x, y) {
    this._ += "Q" + (+x1) + "," + (+y1) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  bezierCurveTo: function(x1, y1, x2, y2, x, y) {
    this._ += "C" + (+x1) + "," + (+y1) + "," + (+x2) + "," + (+y2) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  arcTo: function(x1, y1, x2, y2, r) {
    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
    var x0 = this._x1,
        y0 = this._y1,
        x21 = x2 - x1,
        y21 = y2 - y1,
        x01 = x0 - x1,
        y01 = y0 - y1,
        l01_2 = x01 * x01 + y01 * y01;

    // Is the radius negative? Error.
    if (r < 0) throw new Error("negative radius: " + r);

    // Is this path empty? Move to (x1,y1).
    if (this._x1 === null) {
      this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
    }

    // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
    else if (!(l01_2 > epsilon$1));

    // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
    // Equivalently, is (x1,y1) coincident with (x2,y2)?
    // Or, is the radius zero? Line to (x1,y1).
    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon$1) || !r) {
      this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
    }

    // Otherwise, draw an arc!
    else {
      var x20 = x2 - x0,
          y20 = y2 - y0,
          l21_2 = x21 * x21 + y21 * y21,
          l20_2 = x20 * x20 + y20 * y20,
          l21 = Math.sqrt(l21_2),
          l01 = Math.sqrt(l01_2),
          l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
          t01 = l / l01,
          t21 = l / l21;

      // If the start tangent is not coincident with (x0,y0), line to.
      if (Math.abs(t01 - 1) > epsilon$1) {
        this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
      }

      this._ += "A" + r + "," + r + ",0,0," + (+(y01 * x20 > x01 * y20)) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
    }
  },
  arc: function(x, y, r, a0, a1, ccw) {
    x = +x, y = +y, r = +r, ccw = !!ccw;
    var dx = r * Math.cos(a0),
        dy = r * Math.sin(a0),
        x0 = x + dx,
        y0 = y + dy,
        cw = 1 ^ ccw,
        da = ccw ? a0 - a1 : a1 - a0;

    // Is the radius negative? Error.
    if (r < 0) throw new Error("negative radius: " + r);

    // Is this path empty? Move to (x0,y0).
    if (this._x1 === null) {
      this._ += "M" + x0 + "," + y0;
    }

    // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
    else if (Math.abs(this._x1 - x0) > epsilon$1 || Math.abs(this._y1 - y0) > epsilon$1) {
      this._ += "L" + x0 + "," + y0;
    }

    // Is this arc empty? We’re done.
    if (!r) return;

    // Does the angle go the wrong way? Flip the direction.
    if (da < 0) da = da % tau + tau;

    // Is this a complete circle? Draw two arcs to complete the circle.
    if (da > tauEpsilon) {
      this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
    }

    // Is this arc non-empty? Draw an arc!
    else if (da > epsilon$1) {
      this._ += "A" + r + "," + r + ",0," + (+(da >= pi)) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
    }
  },
  rect: function(x, y, w, h) {
    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + (+w) + "v" + (+h) + "h" + (-w) + "Z";
  },
  toString: function() {
    return this._;
  }
};

function constant$4(x) {
  return function constant() {
    return x;
  };
}

var abs$1 = Math.abs;
var atan2 = Math.atan2;
var cos = Math.cos;
var max$3 = Math.max;
var min$2 = Math.min;
var sin = Math.sin;
var sqrt$1 = Math.sqrt;

var epsilon$2 = 1e-12;
var pi$1 = Math.PI;
var halfPi = pi$1 / 2;
var tau$1 = 2 * pi$1;

function acos(x) {
  return x > 1 ? 0 : x < -1 ? pi$1 : Math.acos(x);
}

function asin(x) {
  return x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x);
}

function arcInnerRadius(d) {
  return d.innerRadius;
}

function arcOuterRadius(d) {
  return d.outerRadius;
}

function arcStartAngle(d) {
  return d.startAngle;
}

function arcEndAngle(d) {
  return d.endAngle;
}

function arcPadAngle(d) {
  return d && d.padAngle; // Note: optional!
}

function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
  var x10 = x1 - x0, y10 = y1 - y0,
      x32 = x3 - x2, y32 = y3 - y2,
      t = y32 * x10 - x32 * y10;
  if (t * t < epsilon$2) return;
  t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t;
  return [x0 + t * x10, y0 + t * y10];
}

// Compute perpendicular offset line of length rc.
// http://mathworld.wolfram.com/Circle-LineIntersection.html
function cornerTangents(x0, y0, x1, y1, r1, rc, cw) {
  var x01 = x0 - x1,
      y01 = y0 - y1,
      lo = (cw ? rc : -rc) / sqrt$1(x01 * x01 + y01 * y01),
      ox = lo * y01,
      oy = -lo * x01,
      x11 = x0 + ox,
      y11 = y0 + oy,
      x10 = x1 + ox,
      y10 = y1 + oy,
      x00 = (x11 + x10) / 2,
      y00 = (y11 + y10) / 2,
      dx = x10 - x11,
      dy = y10 - y11,
      d2 = dx * dx + dy * dy,
      r = r1 - rc,
      D = x11 * y10 - x10 * y11,
      d = (dy < 0 ? -1 : 1) * sqrt$1(max$3(0, r * r * d2 - D * D)),
      cx0 = (D * dy - dx * d) / d2,
      cy0 = (-D * dx - dy * d) / d2,
      cx1 = (D * dy + dx * d) / d2,
      cy1 = (-D * dx + dy * d) / d2,
      dx0 = cx0 - x00,
      dy0 = cy0 - y00,
      dx1 = cx1 - x00,
      dy1 = cy1 - y00;

  // Pick the closer of the two intersection points.
  // TODO Is there a faster way to determine which intersection to use?
  if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;

  return {
    cx: cx0,
    cy: cy0,
    x01: -ox,
    y01: -oy,
    x11: cx0 * (r1 / r - 1),
    y11: cy0 * (r1 / r - 1)
  };
}

function arc() {
  var innerRadius = arcInnerRadius,
      outerRadius = arcOuterRadius,
      cornerRadius = constant$4(0),
      padRadius = null,
      startAngle = arcStartAngle,
      endAngle = arcEndAngle,
      padAngle = arcPadAngle,
      context = null;

  function arc() {
    var buffer,
        r,
        r0 = +innerRadius.apply(this, arguments),
        r1 = +outerRadius.apply(this, arguments),
        a0 = startAngle.apply(this, arguments) - halfPi,
        a1 = endAngle.apply(this, arguments) - halfPi,
        da = abs$1(a1 - a0),
        cw = a1 > a0;

    if (!context) context = buffer = path();

    // Ensure that the outer radius is always larger than the inner radius.
    if (r1 < r0) r = r1, r1 = r0, r0 = r;

    // Is it a point?
    if (!(r1 > epsilon$2)) context.moveTo(0, 0);

    // Or is it a circle or annulus?
    else if (da > tau$1 - epsilon$2) {
      context.moveTo(r1 * cos(a0), r1 * sin(a0));
      context.arc(0, 0, r1, a0, a1, !cw);
      if (r0 > epsilon$2) {
        context.moveTo(r0 * cos(a1), r0 * sin(a1));
        context.arc(0, 0, r0, a1, a0, cw);
      }
    }

    // Or is it a circular or annular sector?
    else {
      var a01 = a0,
          a11 = a1,
          a00 = a0,
          a10 = a1,
          da0 = da,
          da1 = da,
          ap = padAngle.apply(this, arguments) / 2,
          rp = (ap > epsilon$2) && (padRadius ? +padRadius.apply(this, arguments) : sqrt$1(r0 * r0 + r1 * r1)),
          rc = min$2(abs$1(r1 - r0) / 2, +cornerRadius.apply(this, arguments)),
          rc0 = rc,
          rc1 = rc,
          t0,
          t1;

      // Apply padding? Note that since r1 ≥ r0, da1 ≥ da0.
      if (rp > epsilon$2) {
        var p0 = asin(rp / r0 * sin(ap)),
            p1 = asin(rp / r1 * sin(ap));
        if ((da0 -= p0 * 2) > epsilon$2) p0 *= (cw ? 1 : -1), a00 += p0, a10 -= p0;
        else da0 = 0, a00 = a10 = (a0 + a1) / 2;
        if ((da1 -= p1 * 2) > epsilon$2) p1 *= (cw ? 1 : -1), a01 += p1, a11 -= p1;
        else da1 = 0, a01 = a11 = (a0 + a1) / 2;
      }

      var x01 = r1 * cos(a01),
          y01 = r1 * sin(a01),
          x10 = r0 * cos(a10),
          y10 = r0 * sin(a10);

      // Apply rounded corners?
      if (rc > epsilon$2) {
        var x11 = r1 * cos(a11),
            y11 = r1 * sin(a11),
            x00 = r0 * cos(a00),
            y00 = r0 * sin(a00),
            oc;

        // Restrict the corner radius according to the sector angle.
        if (da < pi$1 && (oc = intersect(x01, y01, x00, y00, x11, y11, x10, y10))) {
          var ax = x01 - oc[0],
              ay = y01 - oc[1],
              bx = x11 - oc[0],
              by = y11 - oc[1],
              kc = 1 / sin(acos((ax * bx + ay * by) / (sqrt$1(ax * ax + ay * ay) * sqrt$1(bx * bx + by * by))) / 2),
              lc = sqrt$1(oc[0] * oc[0] + oc[1] * oc[1]);
          rc0 = min$2(rc, (r0 - lc) / (kc - 1));
          rc1 = min$2(rc, (r1 - lc) / (kc + 1));
        }
      }

      // Is the sector collapsed to a line?
      if (!(da1 > epsilon$2)) context.moveTo(x01, y01);

      // Does the sector’s outer ring have rounded corners?
      else if (rc1 > epsilon$2) {
        t0 = cornerTangents(x00, y00, x01, y01, r1, rc1, cw);
        t1 = cornerTangents(x11, y11, x10, y10, r1, rc1, cw);

        context.moveTo(t0.cx + t0.x01, t0.cy + t0.y01);

        // Have the corners merged?
        if (rc1 < rc) context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

        // Otherwise, draw the two corners and the ring.
        else {
          context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
          context.arc(0, 0, r1, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), !cw);
          context.arc(t1.cx, t1.cy, rc1, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
        }
      }

      // Or is the outer ring just a circular arc?
      else context.moveTo(x01, y01), context.arc(0, 0, r1, a01, a11, !cw);

      // Is there no inner ring, and it’s a circular sector?
      // Or perhaps it’s an annular sector collapsed due to padding?
      if (!(r0 > epsilon$2) || !(da0 > epsilon$2)) context.lineTo(x10, y10);

      // Does the sector’s inner ring (or point) have rounded corners?
      else if (rc0 > epsilon$2) {
        t0 = cornerTangents(x10, y10, x11, y11, r0, -rc0, cw);
        t1 = cornerTangents(x01, y01, x00, y00, r0, -rc0, cw);

        context.lineTo(t0.cx + t0.x01, t0.cy + t0.y01);

        // Have the corners merged?
        if (rc0 < rc) context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

        // Otherwise, draw the two corners and the ring.
        else {
          context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
          context.arc(0, 0, r0, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), cw);
          context.arc(t1.cx, t1.cy, rc0, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
        }
      }

      // Or is the inner ring just a circular arc?
      else context.arc(0, 0, r0, a10, a00, cw);
    }

    context.closePath();

    if (buffer) return context = null, buffer + "" || null;
  }

  arc.centroid = function() {
    var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2,
        a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - pi$1 / 2;
    return [cos(a) * r, sin(a) * r];
  };

  arc.innerRadius = function(_) {
    return arguments.length ? (innerRadius = typeof _ === "function" ? _ : constant$4(+_), arc) : innerRadius;
  };

  arc.outerRadius = function(_) {
    return arguments.length ? (outerRadius = typeof _ === "function" ? _ : constant$4(+_), arc) : outerRadius;
  };

  arc.cornerRadius = function(_) {
    return arguments.length ? (cornerRadius = typeof _ === "function" ? _ : constant$4(+_), arc) : cornerRadius;
  };

  arc.padRadius = function(_) {
    return arguments.length ? (padRadius = _ == null ? null : typeof _ === "function" ? _ : constant$4(+_), arc) : padRadius;
  };

  arc.startAngle = function(_) {
    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant$4(+_), arc) : startAngle;
  };

  arc.endAngle = function(_) {
    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant$4(+_), arc) : endAngle;
  };

  arc.padAngle = function(_) {
    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant$4(+_), arc) : padAngle;
  };

  arc.context = function(_) {
    return arguments.length ? ((context = _ == null ? null : _), arc) : context;
  };

  return arc;
}

var slice$2 = Array.prototype.slice;

function array$1(x) {
  return typeof x === "object" && "length" in x
    ? x // Array, TypedArray, NodeList, array-like
    : Array.from(x); // Map, Set, iterable, string, or anything else
}

function Linear(context) {
  this._context = context;
}

Linear.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; // proceed
      default: this._context.lineTo(x, y); break;
    }
  }
};

function curveLinear(context) {
  return new Linear(context);
}

function x(p) {
  return p[0];
}

function y(p) {
  return p[1];
}

function line(x$1, y$1) {
  var defined = constant$4(true),
      context = null,
      curve = curveLinear,
      output = null;

  x$1 = typeof x$1 === "function" ? x$1 : (x$1 === undefined) ? x : constant$4(x$1);
  y$1 = typeof y$1 === "function" ? y$1 : (y$1 === undefined) ? y : constant$4(y$1);

  function line(data) {
    var i,
        n = (data = array$1(data)).length,
        d,
        defined0 = false,
        buffer;

    if (context == null) output = curve(buffer = path());

    for (i = 0; i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) output.lineStart();
        else output.lineEnd();
      }
      if (defined0) output.point(+x$1(d, i, data), +y$1(d, i, data));
    }

    if (buffer) return output = null, buffer + "" || null;
  }

  line.x = function(_) {
    return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant$4(+_), line) : x$1;
  };

  line.y = function(_) {
    return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant$4(+_), line) : y$1;
  };

  line.defined = function(_) {
    return arguments.length ? (defined = typeof _ === "function" ? _ : constant$4(!!_), line) : defined;
  };

  line.curve = function(_) {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
  };

  line.context = function(_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
  };

  return line;
}

function area(x0, y0, y1) {
  var x1 = null,
      defined = constant$4(true),
      context = null,
      curve = curveLinear,
      output = null;

  x0 = typeof x0 === "function" ? x0 : (x0 === undefined) ? x : constant$4(+x0);
  y0 = typeof y0 === "function" ? y0 : (y0 === undefined) ? constant$4(0) : constant$4(+y0);
  y1 = typeof y1 === "function" ? y1 : (y1 === undefined) ? y : constant$4(+y1);

  function area(data) {
    var i,
        j,
        k,
        n = (data = array$1(data)).length,
        d,
        defined0 = false,
        buffer,
        x0z = new Array(n),
        y0z = new Array(n);

    if (context == null) output = curve(buffer = path());

    for (i = 0; i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) {
          j = i;
          output.areaStart();
          output.lineStart();
        } else {
          output.lineEnd();
          output.lineStart();
          for (k = i - 1; k >= j; --k) {
            output.point(x0z[k], y0z[k]);
          }
          output.lineEnd();
          output.areaEnd();
        }
      }
      if (defined0) {
        x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
        output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
      }
    }

    if (buffer) return output = null, buffer + "" || null;
  }

  function arealine() {
    return line().defined(defined).curve(curve).context(context);
  }

  area.x = function(_) {
    return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$4(+_), x1 = null, area) : x0;
  };

  area.x0 = function(_) {
    return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$4(+_), area) : x0;
  };

  area.x1 = function(_) {
    return arguments.length ? (x1 = _ == null ? null : typeof _ === "function" ? _ : constant$4(+_), area) : x1;
  };

  area.y = function(_) {
    return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$4(+_), y1 = null, area) : y0;
  };

  area.y0 = function(_) {
    return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$4(+_), area) : y0;
  };

  area.y1 = function(_) {
    return arguments.length ? (y1 = _ == null ? null : typeof _ === "function" ? _ : constant$4(+_), area) : y1;
  };

  area.lineX0 =
  area.lineY0 = function() {
    return arealine().x(x0).y(y0);
  };

  area.lineY1 = function() {
    return arealine().x(x0).y(y1);
  };

  area.lineX1 = function() {
    return arealine().x(x1).y(y0);
  };

  area.defined = function(_) {
    return arguments.length ? (defined = typeof _ === "function" ? _ : constant$4(!!_), area) : defined;
  };

  area.curve = function(_) {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), area) : curve;
  };

  area.context = function(_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area) : context;
  };

  return area;
}

function descending(a, b) {
  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}

function identity$5(d) {
  return d;
}

function pie() {
  var value = identity$5,
      sortValues = descending,
      sort = null,
      startAngle = constant$4(0),
      endAngle = constant$4(tau$1),
      padAngle = constant$4(0);

  function pie(data) {
    var i,
        n = (data = array$1(data)).length,
        j,
        k,
        sum = 0,
        index = new Array(n),
        arcs = new Array(n),
        a0 = +startAngle.apply(this, arguments),
        da = Math.min(tau$1, Math.max(-tau$1, endAngle.apply(this, arguments) - a0)),
        a1,
        p = Math.min(Math.abs(da) / n, padAngle.apply(this, arguments)),
        pa = p * (da < 0 ? -1 : 1),
        v;

    for (i = 0; i < n; ++i) {
      if ((v = arcs[index[i] = i] = +value(data[i], i, data)) > 0) {
        sum += v;
      }
    }

    // Optionally sort the arcs by previously-computed values or by data.
    if (sortValues != null) index.sort(function(i, j) { return sortValues(arcs[i], arcs[j]); });
    else if (sort != null) index.sort(function(i, j) { return sort(data[i], data[j]); });

    // Compute the arcs! They are stored in the original data's order.
    for (i = 0, k = sum ? (da - n * pa) / sum : 0; i < n; ++i, a0 = a1) {
      j = index[i], v = arcs[j], a1 = a0 + (v > 0 ? v * k : 0) + pa, arcs[j] = {
        data: data[j],
        index: i,
        value: v,
        startAngle: a0,
        endAngle: a1,
        padAngle: p
      };
    }

    return arcs;
  }

  pie.value = function(_) {
    return arguments.length ? (value = typeof _ === "function" ? _ : constant$4(+_), pie) : value;
  };

  pie.sortValues = function(_) {
    return arguments.length ? (sortValues = _, sort = null, pie) : sortValues;
  };

  pie.sort = function(_) {
    return arguments.length ? (sort = _, sortValues = null, pie) : sort;
  };

  pie.startAngle = function(_) {
    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant$4(+_), pie) : startAngle;
  };

  pie.endAngle = function(_) {
    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant$4(+_), pie) : endAngle;
  };

  pie.padAngle = function(_) {
    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant$4(+_), pie) : padAngle;
  };

  return pie;
}

var curveRadialLinear = curveRadial(curveLinear);

function Radial(curve) {
  this._curve = curve;
}

Radial.prototype = {
  areaStart: function() {
    this._curve.areaStart();
  },
  areaEnd: function() {
    this._curve.areaEnd();
  },
  lineStart: function() {
    this._curve.lineStart();
  },
  lineEnd: function() {
    this._curve.lineEnd();
  },
  point: function(a, r) {
    this._curve.point(r * Math.sin(a), r * -Math.cos(a));
  }
};

function curveRadial(curve) {

  function radial(context) {
    return new Radial(curve(context));
  }

  radial._curve = curve;

  return radial;
}

function lineRadial(l) {
  var c = l.curve;

  l.angle = l.x, delete l.x;
  l.radius = l.y, delete l.y;

  l.curve = function(_) {
    return arguments.length ? c(curveRadial(_)) : c()._curve;
  };

  return l;
}

function lineRadial$1() {
  return lineRadial(line().curve(curveRadialLinear));
}

function areaRadial() {
  var a = area().curve(curveRadialLinear),
      c = a.curve,
      x0 = a.lineX0,
      x1 = a.lineX1,
      y0 = a.lineY0,
      y1 = a.lineY1;

  a.angle = a.x, delete a.x;
  a.startAngle = a.x0, delete a.x0;
  a.endAngle = a.x1, delete a.x1;
  a.radius = a.y, delete a.y;
  a.innerRadius = a.y0, delete a.y0;
  a.outerRadius = a.y1, delete a.y1;
  a.lineStartAngle = function() { return lineRadial(x0()); }, delete a.lineX0;
  a.lineEndAngle = function() { return lineRadial(x1()); }, delete a.lineX1;
  a.lineInnerRadius = function() { return lineRadial(y0()); }, delete a.lineY0;
  a.lineOuterRadius = function() { return lineRadial(y1()); }, delete a.lineY1;

  a.curve = function(_) {
    return arguments.length ? c(curveRadial(_)) : c()._curve;
  };

  return a;
}

function pointRadial(x, y) {
  return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
}

function linkSource(d) {
  return d.source;
}

function linkTarget(d) {
  return d.target;
}

function link(curve) {
  var source = linkSource,
      target = linkTarget,
      x$1 = x,
      y$1 = y,
      context = null;

  function link() {
    var buffer, argv = slice$2.call(arguments), s = source.apply(this, argv), t = target.apply(this, argv);
    if (!context) context = buffer = path();
    curve(context, +x$1.apply(this, (argv[0] = s, argv)), +y$1.apply(this, argv), +x$1.apply(this, (argv[0] = t, argv)), +y$1.apply(this, argv));
    if (buffer) return context = null, buffer + "" || null;
  }

  link.source = function(_) {
    return arguments.length ? (source = _, link) : source;
  };

  link.target = function(_) {
    return arguments.length ? (target = _, link) : target;
  };

  link.x = function(_) {
    return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant$4(+_), link) : x$1;
  };

  link.y = function(_) {
    return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant$4(+_), link) : y$1;
  };

  link.context = function(_) {
    return arguments.length ? ((context = _ == null ? null : _), link) : context;
  };

  return link;
}

function curveHorizontal(context, x0, y0, x1, y1) {
  context.moveTo(x0, y0);
  context.bezierCurveTo(x0 = (x0 + x1) / 2, y0, x0, y1, x1, y1);
}

function curveVertical(context, x0, y0, x1, y1) {
  context.moveTo(x0, y0);
  context.bezierCurveTo(x0, y0 = (y0 + y1) / 2, x1, y0, x1, y1);
}

function curveRadial$1(context, x0, y0, x1, y1) {
  var p0 = pointRadial(x0, y0),
      p1 = pointRadial(x0, y0 = (y0 + y1) / 2),
      p2 = pointRadial(x1, y0),
      p3 = pointRadial(x1, y1);
  context.moveTo(p0[0], p0[1]);
  context.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
}

function linkHorizontal() {
  return link(curveHorizontal);
}

function linkVertical() {
  return link(curveVertical);
}

function linkRadial() {
  var l = link(curveRadial$1);
  l.angle = l.x, delete l.x;
  l.radius = l.y, delete l.y;
  return l;
}

var circle = {
  draw: function(context, size) {
    var r = Math.sqrt(size / pi$1);
    context.moveTo(r, 0);
    context.arc(0, 0, r, 0, tau$1);
  }
};

var cross = {
  draw: function(context, size) {
    var r = Math.sqrt(size / 5) / 2;
    context.moveTo(-3 * r, -r);
    context.lineTo(-r, -r);
    context.lineTo(-r, -3 * r);
    context.lineTo(r, -3 * r);
    context.lineTo(r, -r);
    context.lineTo(3 * r, -r);
    context.lineTo(3 * r, r);
    context.lineTo(r, r);
    context.lineTo(r, 3 * r);
    context.lineTo(-r, 3 * r);
    context.lineTo(-r, r);
    context.lineTo(-3 * r, r);
    context.closePath();
  }
};

var tan30 = Math.sqrt(1 / 3),
    tan30_2 = tan30 * 2;

var diamond = {
  draw: function(context, size) {
    var y = Math.sqrt(size / tan30_2),
        x = y * tan30;
    context.moveTo(0, -y);
    context.lineTo(x, 0);
    context.lineTo(0, y);
    context.lineTo(-x, 0);
    context.closePath();
  }
};

var ka = 0.89081309152928522810,
    kr = Math.sin(pi$1 / 10) / Math.sin(7 * pi$1 / 10),
    kx = Math.sin(tau$1 / 10) * kr,
    ky = -Math.cos(tau$1 / 10) * kr;

var star = {
  draw: function(context, size) {
    var r = Math.sqrt(size * ka),
        x = kx * r,
        y = ky * r;
    context.moveTo(0, -r);
    context.lineTo(x, y);
    for (var i = 1; i < 5; ++i) {
      var a = tau$1 * i / 5,
          c = Math.cos(a),
          s = Math.sin(a);
      context.lineTo(s * r, -c * r);
      context.lineTo(c * x - s * y, s * x + c * y);
    }
    context.closePath();
  }
};

var square$1 = {
  draw: function(context, size) {
    var w = Math.sqrt(size),
        x = -w / 2;
    context.rect(x, x, w, w);
  }
};

var sqrt3 = Math.sqrt(3);

var triangle = {
  draw: function(context, size) {
    var y = -Math.sqrt(size / (sqrt3 * 3));
    context.moveTo(0, y * 2);
    context.lineTo(-sqrt3 * y, -y);
    context.lineTo(sqrt3 * y, -y);
    context.closePath();
  }
};

var c = -0.5,
    s = Math.sqrt(3) / 2,
    k = 1 / Math.sqrt(12),
    a = (k / 2 + 1) * 3;

var wye = {
  draw: function(context, size) {
    var r = Math.sqrt(size / a),
        x0 = r / 2,
        y0 = r * k,
        x1 = x0,
        y1 = r * k + r,
        x2 = -x1,
        y2 = y1;
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(c * x0 - s * y0, s * x0 + c * y0);
    context.lineTo(c * x1 - s * y1, s * x1 + c * y1);
    context.lineTo(c * x2 - s * y2, s * x2 + c * y2);
    context.lineTo(c * x0 + s * y0, c * y0 - s * x0);
    context.lineTo(c * x1 + s * y1, c * y1 - s * x1);
    context.lineTo(c * x2 + s * y2, c * y2 - s * x2);
    context.closePath();
  }
};

var symbols = [
  circle,
  cross,
  diamond,
  square$1,
  star,
  triangle,
  wye
];

function symbol$1(type, size) {
  var context = null;
  type = typeof type === "function" ? type : constant$4(type || circle);
  size = typeof size === "function" ? size : constant$4(size === undefined ? 64 : +size);

  function symbol() {
    var buffer;
    if (!context) context = buffer = path();
    type.apply(this, arguments).draw(context, +size.apply(this, arguments));
    if (buffer) return context = null, buffer + "" || null;
  }

  symbol.type = function(_) {
    return arguments.length ? (type = typeof _ === "function" ? _ : constant$4(_), symbol) : type;
  };

  symbol.size = function(_) {
    return arguments.length ? (size = typeof _ === "function" ? _ : constant$4(+_), symbol) : size;
  };

  symbol.context = function(_) {
    return arguments.length ? (context = _ == null ? null : _, symbol) : context;
  };

  return symbol;
}

function noop$2() {}

function point$1(that, x, y) {
  that._context.bezierCurveTo(
    (2 * that._x0 + that._x1) / 3,
    (2 * that._y0 + that._y1) / 3,
    (that._x0 + 2 * that._x1) / 3,
    (that._y0 + 2 * that._y1) / 3,
    (that._x0 + 4 * that._x1 + x) / 6,
    (that._y0 + 4 * that._y1 + y) / 6
  );
}

function Basis(context) {
  this._context = context;
}

Basis.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 =
    this._y0 = this._y1 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 3: point$1(this, this._x1, this._y1); // proceed
      case 2: this._context.lineTo(this._x1, this._y1); break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; break;
      case 2: this._point = 3; this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6); // proceed
      default: point$1(this, x, y); break;
    }
    this._x0 = this._x1, this._x1 = x;
    this._y0 = this._y1, this._y1 = y;
  }
};

function basis(context) {
  return new Basis(context);
}

function BasisClosed(context) {
  this._context = context;
}

BasisClosed.prototype = {
  areaStart: noop$2,
  areaEnd: noop$2,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 =
    this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x2, this._y2);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3);
        this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x2, this._y2);
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        break;
      }
    }
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._x2 = x, this._y2 = y; break;
      case 1: this._point = 2; this._x3 = x, this._y3 = y; break;
      case 2: this._point = 3; this._x4 = x, this._y4 = y; this._context.moveTo((this._x0 + 4 * this._x1 + x) / 6, (this._y0 + 4 * this._y1 + y) / 6); break;
      default: point$1(this, x, y); break;
    }
    this._x0 = this._x1, this._x1 = x;
    this._y0 = this._y1, this._y1 = y;
  }
};

function basisClosed(context) {
  return new BasisClosed(context);
}

function BasisOpen(context) {
  this._context = context;
}

BasisOpen.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 =
    this._y0 = this._y1 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; break;
      case 1: this._point = 2; break;
      case 2: this._point = 3; var x0 = (this._x0 + 4 * this._x1 + x) / 6, y0 = (this._y0 + 4 * this._y1 + y) / 6; this._line ? this._context.lineTo(x0, y0) : this._context.moveTo(x0, y0); break;
      case 3: this._point = 4; // proceed
      default: point$1(this, x, y); break;
    }
    this._x0 = this._x1, this._x1 = x;
    this._y0 = this._y1, this._y1 = y;
  }
};

function basisOpen(context) {
  return new BasisOpen(context);
}

function Bundle(context, beta) {
  this._basis = new Basis(context);
  this._beta = beta;
}

Bundle.prototype = {
  lineStart: function() {
    this._x = [];
    this._y = [];
    this._basis.lineStart();
  },
  lineEnd: function() {
    var x = this._x,
        y = this._y,
        j = x.length - 1;

    if (j > 0) {
      var x0 = x[0],
          y0 = y[0],
          dx = x[j] - x0,
          dy = y[j] - y0,
          i = -1,
          t;

      while (++i <= j) {
        t = i / j;
        this._basis.point(
          this._beta * x[i] + (1 - this._beta) * (x0 + t * dx),
          this._beta * y[i] + (1 - this._beta) * (y0 + t * dy)
        );
      }
    }

    this._x = this._y = null;
    this._basis.lineEnd();
  },
  point: function(x, y) {
    this._x.push(+x);
    this._y.push(+y);
  }
};

var bundle = (function custom(beta) {

  function bundle(context) {
    return beta === 1 ? new Basis(context) : new Bundle(context, beta);
  }

  bundle.beta = function(beta) {
    return custom(+beta);
  };

  return bundle;
})(0.85);

function point$2(that, x, y) {
  that._context.bezierCurveTo(
    that._x1 + that._k * (that._x2 - that._x0),
    that._y1 + that._k * (that._y2 - that._y0),
    that._x2 + that._k * (that._x1 - x),
    that._y2 + that._k * (that._y1 - y),
    that._x2,
    that._y2
  );
}

function Cardinal(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}

Cardinal.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 =
    this._y0 = this._y1 = this._y2 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2: this._context.lineTo(this._x2, this._y2); break;
      case 3: point$2(this, this._x1, this._y1); break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; this._x1 = x, this._y1 = y; break;
      case 2: this._point = 3; // proceed
      default: point$2(this, x, y); break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
  }
};

var cardinal = (function custom(tension) {

  function cardinal(context) {
    return new Cardinal(context, tension);
  }

  cardinal.tension = function(tension) {
    return custom(+tension);
  };

  return cardinal;
})(0);

function CardinalClosed(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}

CardinalClosed.prototype = {
  areaStart: noop$2,
  areaEnd: noop$2,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 =
    this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.lineTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        this.point(this._x5, this._y5);
        break;
      }
    }
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._x3 = x, this._y3 = y; break;
      case 1: this._point = 2; this._context.moveTo(this._x4 = x, this._y4 = y); break;
      case 2: this._point = 3; this._x5 = x, this._y5 = y; break;
      default: point$2(this, x, y); break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
  }
};

var curveCardinalClosed = (function custom(tension) {

  function cardinal(context) {
    return new CardinalClosed(context, tension);
  }

  cardinal.tension = function(tension) {
    return custom(+tension);
  };

  return cardinal;
})(0);

function CardinalOpen(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}

CardinalOpen.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 =
    this._y0 = this._y1 = this._y2 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; break;
      case 1: this._point = 2; break;
      case 2: this._point = 3; this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2); break;
      case 3: this._point = 4; // proceed
      default: point$2(this, x, y); break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
  }
};

var cardinalOpen = (function custom(tension) {

  function cardinal(context) {
    return new CardinalOpen(context, tension);
  }

  cardinal.tension = function(tension) {
    return custom(+tension);
  };

  return cardinal;
})(0);

function point$3(that, x, y) {
  var x1 = that._x1,
      y1 = that._y1,
      x2 = that._x2,
      y2 = that._y2;

  if (that._l01_a > epsilon$2) {
    var a = 2 * that._l01_2a + 3 * that._l01_a * that._l12_a + that._l12_2a,
        n = 3 * that._l01_a * (that._l01_a + that._l12_a);
    x1 = (x1 * a - that._x0 * that._l12_2a + that._x2 * that._l01_2a) / n;
    y1 = (y1 * a - that._y0 * that._l12_2a + that._y2 * that._l01_2a) / n;
  }

  if (that._l23_a > epsilon$2) {
    var b = 2 * that._l23_2a + 3 * that._l23_a * that._l12_a + that._l12_2a,
        m = 3 * that._l23_a * (that._l23_a + that._l12_a);
    x2 = (x2 * b + that._x1 * that._l23_2a - x * that._l12_2a) / m;
    y2 = (y2 * b + that._y1 * that._l23_2a - y * that._l12_2a) / m;
  }

  that._context.bezierCurveTo(x1, y1, x2, y2, that._x2, that._y2);
}

function CatmullRom(context, alpha) {
  this._context = context;
  this._alpha = alpha;
}

CatmullRom.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 =
    this._y0 = this._y1 = this._y2 = NaN;
    this._l01_a = this._l12_a = this._l23_a =
    this._l01_2a = this._l12_2a = this._l23_2a =
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2: this._context.lineTo(this._x2, this._y2); break;
      case 3: this.point(this._x2, this._y2); break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;

    if (this._point) {
      var x23 = this._x2 - x,
          y23 = this._y2 - y;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
    }

    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; break;
      case 2: this._point = 3; // proceed
      default: point$3(this, x, y); break;
    }

    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
  }
};

var catmullRom = (function custom(alpha) {

  function catmullRom(context) {
    return alpha ? new CatmullRom(context, alpha) : new Cardinal(context, 0);
  }

  catmullRom.alpha = function(alpha) {
    return custom(+alpha);
  };

  return catmullRom;
})(0.5);

function CatmullRomClosed(context, alpha) {
  this._context = context;
  this._alpha = alpha;
}

CatmullRomClosed.prototype = {
  areaStart: noop$2,
  areaEnd: noop$2,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 =
    this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
    this._l01_a = this._l12_a = this._l23_a =
    this._l01_2a = this._l12_2a = this._l23_2a =
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.lineTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        this.point(this._x5, this._y5);
        break;
      }
    }
  },
  point: function(x, y) {
    x = +x, y = +y;

    if (this._point) {
      var x23 = this._x2 - x,
          y23 = this._y2 - y;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
    }

    switch (this._point) {
      case 0: this._point = 1; this._x3 = x, this._y3 = y; break;
      case 1: this._point = 2; this._context.moveTo(this._x4 = x, this._y4 = y); break;
      case 2: this._point = 3; this._x5 = x, this._y5 = y; break;
      default: point$3(this, x, y); break;
    }

    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
  }
};

var catmullRomClosed = (function custom(alpha) {

  function catmullRom(context) {
    return alpha ? new CatmullRomClosed(context, alpha) : new CardinalClosed(context, 0);
  }

  catmullRom.alpha = function(alpha) {
    return custom(+alpha);
  };

  return catmullRom;
})(0.5);

function CatmullRomOpen(context, alpha) {
  this._context = context;
  this._alpha = alpha;
}

CatmullRomOpen.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 =
    this._y0 = this._y1 = this._y2 = NaN;
    this._l01_a = this._l12_a = this._l23_a =
    this._l01_2a = this._l12_2a = this._l23_2a =
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;

    if (this._point) {
      var x23 = this._x2 - x,
          y23 = this._y2 - y;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
    }

    switch (this._point) {
      case 0: this._point = 1; break;
      case 1: this._point = 2; break;
      case 2: this._point = 3; this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2); break;
      case 3: this._point = 4; // proceed
      default: point$3(this, x, y); break;
    }

    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
  }
};

var catmullRomOpen = (function custom(alpha) {

  function catmullRom(context) {
    return alpha ? new CatmullRomOpen(context, alpha) : new CardinalOpen(context, 0);
  }

  catmullRom.alpha = function(alpha) {
    return custom(+alpha);
  };

  return catmullRom;
})(0.5);

function LinearClosed(context) {
  this._context = context;
}

LinearClosed.prototype = {
  areaStart: noop$2,
  areaEnd: noop$2,
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._point) this._context.closePath();
  },
  point: function(x, y) {
    x = +x, y = +y;
    if (this._point) this._context.lineTo(x, y);
    else this._point = 1, this._context.moveTo(x, y);
  }
};

function linearClosed(context) {
  return new LinearClosed(context);
}

function sign(x) {
  return x < 0 ? -1 : 1;
}

// Calculate the slopes of the tangents (Hermite-type interpolation) based on
// the following paper: Steffen, M. 1990. A Simple Method for Monotonic
// Interpolation in One Dimension. Astronomy and Astrophysics, Vol. 239, NO.
// NOV(II), P. 443, 1990.
function slope3(that, x2, y2) {
  var h0 = that._x1 - that._x0,
      h1 = x2 - that._x1,
      s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0),
      s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0),
      p = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
}

// Calculate a one-sided slope.
function slope2(that, t) {
  var h = that._x1 - that._x0;
  return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
}

// According to https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Representations
// "you can express cubic Hermite interpolation in terms of cubic Bézier curves
// with respect to the four values p0, p0 + m0 / 3, p1 - m1 / 3, p1".
function point$4(that, t0, t1) {
  var x0 = that._x0,
      y0 = that._y0,
      x1 = that._x1,
      y1 = that._y1,
      dx = (x1 - x0) / 3;
  that._context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1);
}

function MonotoneX(context) {
  this._context = context;
}

MonotoneX.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 =
    this._y0 = this._y1 =
    this._t0 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2: this._context.lineTo(this._x1, this._y1); break;
      case 3: point$4(this, this._t0, slope2(this, this._t0)); break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    var t1 = NaN;

    x = +x, y = +y;
    if (x === this._x1 && y === this._y1) return; // Ignore coincident points.
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; break;
      case 2: this._point = 3; point$4(this, slope2(this, t1 = slope3(this, x, y)), t1); break;
      default: point$4(this, this._t0, t1 = slope3(this, x, y)); break;
    }

    this._x0 = this._x1, this._x1 = x;
    this._y0 = this._y1, this._y1 = y;
    this._t0 = t1;
  }
};

function MonotoneY(context) {
  this._context = new ReflectContext(context);
}

(MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function(x, y) {
  MonotoneX.prototype.point.call(this, y, x);
};

function ReflectContext(context) {
  this._context = context;
}

ReflectContext.prototype = {
  moveTo: function(x, y) { this._context.moveTo(y, x); },
  closePath: function() { this._context.closePath(); },
  lineTo: function(x, y) { this._context.lineTo(y, x); },
  bezierCurveTo: function(x1, y1, x2, y2, x, y) { this._context.bezierCurveTo(y1, x1, y2, x2, y, x); }
};

function monotoneX(context) {
  return new MonotoneX(context);
}

function monotoneY(context) {
  return new MonotoneY(context);
}

function Natural(context) {
  this._context = context;
}

Natural.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = [];
    this._y = [];
  },
  lineEnd: function() {
    var x = this._x,
        y = this._y,
        n = x.length;

    if (n) {
      this._line ? this._context.lineTo(x[0], y[0]) : this._context.moveTo(x[0], y[0]);
      if (n === 2) {
        this._context.lineTo(x[1], y[1]);
      } else {
        var px = controlPoints(x),
            py = controlPoints(y);
        for (var i0 = 0, i1 = 1; i1 < n; ++i0, ++i1) {
          this._context.bezierCurveTo(px[0][i0], py[0][i0], px[1][i0], py[1][i0], x[i1], y[i1]);
        }
      }
    }

    if (this._line || (this._line !== 0 && n === 1)) this._context.closePath();
    this._line = 1 - this._line;
    this._x = this._y = null;
  },
  point: function(x, y) {
    this._x.push(+x);
    this._y.push(+y);
  }
};

// See https://www.particleincell.com/2012/bezier-splines/ for derivation.
function controlPoints(x) {
  var i,
      n = x.length - 1,
      m,
      a = new Array(n),
      b = new Array(n),
      r = new Array(n);
  a[0] = 0, b[0] = 2, r[0] = x[0] + 2 * x[1];
  for (i = 1; i < n - 1; ++i) a[i] = 1, b[i] = 4, r[i] = 4 * x[i] + 2 * x[i + 1];
  a[n - 1] = 2, b[n - 1] = 7, r[n - 1] = 8 * x[n - 1] + x[n];
  for (i = 1; i < n; ++i) m = a[i] / b[i - 1], b[i] -= m, r[i] -= m * r[i - 1];
  a[n - 1] = r[n - 1] / b[n - 1];
  for (i = n - 2; i >= 0; --i) a[i] = (r[i] - a[i + 1]) / b[i];
  b[n - 1] = (x[n] + a[n - 1]) / 2;
  for (i = 0; i < n - 1; ++i) b[i] = 2 * x[i + 1] - a[i + 1];
  return [a, b];
}

function natural(context) {
  return new Natural(context);
}

function Step(context, t) {
  this._context = context;
  this._t = t;
}

Step.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = this._y = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y);
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; // proceed
      default: {
        if (this._t <= 0) {
          this._context.lineTo(this._x, y);
          this._context.lineTo(x, y);
        } else {
          var x1 = this._x * (1 - this._t) + x * this._t;
          this._context.lineTo(x1, this._y);
          this._context.lineTo(x1, y);
        }
        break;
      }
    }
    this._x = x, this._y = y;
  }
};

function step(context) {
  return new Step(context, 0.5);
}

function stepBefore(context) {
  return new Step(context, 0);
}

function stepAfter(context) {
  return new Step(context, 1);
}

function none(series, order) {
  if (!((n = series.length) > 1)) return;
  for (var i = 1, j, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
    s0 = s1, s1 = series[order[i]];
    for (j = 0; j < m; ++j) {
      s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1];
    }
  }
}

function none$1(series) {
  var n = series.length, o = new Array(n);
  while (--n >= 0) o[n] = n;
  return o;
}

function stackValue(d, key) {
  return d[key];
}

function stackSeries(key) {
  const series = [];
  series.key = key;
  return series;
}

function stack() {
  var keys = constant$4([]),
      order = none$1,
      offset = none,
      value = stackValue;

  function stack(data) {
    var sz = Array.from(keys.apply(this, arguments), stackSeries),
        i, n = sz.length, j = -1,
        oz;

    for (const d of data) {
      for (i = 0, ++j; i < n; ++i) {
        (sz[i][j] = [0, +value(d, sz[i].key, j, data)]).data = d;
      }
    }

    for (i = 0, oz = array$1(order(sz)); i < n; ++i) {
      sz[oz[i]].index = i;
    }

    offset(sz, oz);
    return sz;
  }

  stack.keys = function(_) {
    return arguments.length ? (keys = typeof _ === "function" ? _ : constant$4(Array.from(_)), stack) : keys;
  };

  stack.value = function(_) {
    return arguments.length ? (value = typeof _ === "function" ? _ : constant$4(+_), stack) : value;
  };

  stack.order = function(_) {
    return arguments.length ? (order = _ == null ? none$1 : typeof _ === "function" ? _ : constant$4(Array.from(_)), stack) : order;
  };

  stack.offset = function(_) {
    return arguments.length ? (offset = _ == null ? none : _, stack) : offset;
  };

  return stack;
}

function expand(series, order) {
  if (!((n = series.length) > 0)) return;
  for (var i, n, j = 0, m = series[0].length, y; j < m; ++j) {
    for (y = i = 0; i < n; ++i) y += series[i][j][1] || 0;
    if (y) for (i = 0; i < n; ++i) series[i][j][1] /= y;
  }
  none(series, order);
}

function diverging$1(series, order) {
  if (!((n = series.length) > 0)) return;
  for (var i, j = 0, d, dy, yp, yn, n, m = series[order[0]].length; j < m; ++j) {
    for (yp = yn = 0, i = 0; i < n; ++i) {
      if ((dy = (d = series[order[i]][j])[1] - d[0]) > 0) {
        d[0] = yp, d[1] = yp += dy;
      } else if (dy < 0) {
        d[1] = yn, d[0] = yn += dy;
      } else {
        d[0] = 0, d[1] = dy;
      }
    }
  }
}

function silhouette(series, order) {
  if (!((n = series.length) > 0)) return;
  for (var j = 0, s0 = series[order[0]], n, m = s0.length; j < m; ++j) {
    for (var i = 0, y = 0; i < n; ++i) y += series[i][j][1] || 0;
    s0[j][1] += s0[j][0] = -y / 2;
  }
  none(series, order);
}

function wiggle(series, order) {
  if (!((n = series.length) > 0) || !((m = (s0 = series[order[0]]).length) > 0)) return;
  for (var y = 0, j = 1, s0, m, n; j < m; ++j) {
    for (var i = 0, s1 = 0, s2 = 0; i < n; ++i) {
      var si = series[order[i]],
          sij0 = si[j][1] || 0,
          sij1 = si[j - 1][1] || 0,
          s3 = (sij0 - sij1) / 2;
      for (var k = 0; k < i; ++k) {
        var sk = series[order[k]],
            skj0 = sk[j][1] || 0,
            skj1 = sk[j - 1][1] || 0;
        s3 += skj0 - skj1;
      }
      s1 += sij0, s2 += s3 * sij0;
    }
    s0[j - 1][1] += s0[j - 1][0] = y;
    if (s1) y -= s2 / s1;
  }
  s0[j - 1][1] += s0[j - 1][0] = y;
  none(series, order);
}

function appearance(series) {
  var peaks = series.map(peak);
  return none$1(series).sort(function(a, b) { return peaks[a] - peaks[b]; });
}

function peak(series) {
  var i = -1, j = 0, n = series.length, vi, vj = -Infinity;
  while (++i < n) if ((vi = +series[i][1]) > vj) vj = vi, j = i;
  return j;
}

function ascending$2(series) {
  var sums = series.map(sum$1);
  return none$1(series).sort(function(a, b) { return sums[a] - sums[b]; });
}

function sum$1(series) {
  var s = 0, i = -1, n = series.length, v;
  while (++i < n) if (v = +series[i][1]) s += v;
  return s;
}

function descending$1(series) {
  return ascending$2(series).reverse();
}

function insideOut(series) {
  var n = series.length,
      i,
      j,
      sums = series.map(sum$1),
      order = appearance(series),
      top = 0,
      bottom = 0,
      tops = [],
      bottoms = [];

  for (i = 0; i < n; ++i) {
    j = order[i];
    if (top < bottom) {
      top += sums[j];
      tops.push(j);
    } else {
      bottom += sums[j];
      bottoms.push(j);
    }
  }

  return bottoms.reverse().concat(tops);
}

function reverse(series) {
  return none$1(series).reverse();
}

var shapes = /*#__PURE__*/Object.freeze({
  __proto__: null,
  arc: arc,
  area: area,
  line: line,
  pie: pie,
  areaRadial: areaRadial,
  radialArea: areaRadial,
  lineRadial: lineRadial$1,
  radialLine: lineRadial$1,
  pointRadial: pointRadial,
  linkHorizontal: linkHorizontal,
  linkVertical: linkVertical,
  linkRadial: linkRadial,
  symbol: symbol$1,
  symbols: symbols,
  symbolCircle: circle,
  symbolCross: cross,
  symbolDiamond: diamond,
  symbolSquare: square$1,
  symbolStar: star,
  symbolTriangle: triangle,
  symbolWye: wye,
  curveBasisClosed: basisClosed,
  curveBasisOpen: basisOpen,
  curveBasis: basis,
  curveBundle: bundle,
  curveCardinalClosed: curveCardinalClosed,
  curveCardinalOpen: cardinalOpen,
  curveCardinal: cardinal,
  curveCatmullRomClosed: catmullRomClosed,
  curveCatmullRomOpen: catmullRomOpen,
  curveCatmullRom: catmullRom,
  curveLinearClosed: linearClosed,
  curveLinear: curveLinear,
  curveMonotoneX: monotoneX,
  curveMonotoneY: monotoneY,
  curveNatural: natural,
  curveStep: step,
  curveStepAfter: stepAfter,
  curveStepBefore: stepBefore,
  stack: stack,
  stackOffsetExpand: expand,
  stackOffsetDiverging: diverging$1,
  stackOffsetNone: none,
  stackOffsetSilhouette: silhouette,
  stackOffsetWiggle: wiggle,
  stackOrderAppearance: appearance,
  stackOrderAscending: ascending$2,
  stackOrderDescending: descending$1,
  stackOrderInsideOut: insideOut,
  stackOrderNone: none$1,
  stackOrderReverse: reverse
});

// Note(cg): shapes that we want to expose.
const shapeNames = ['pie', 'arc', 'stack', 'line', 'lineRadial', 'area'];
const shapeType = {
  padAngle: Number,
  innerRadius: Number,
  outerRadius: Number
};
const classes = {};

class WrapperBase extends LitElement {

  get wrapper() {
    return this[this.name];
  }

  constructor() {
    super();
    this.__init = true;
    this[this.name] = shapes[this.name]();
  }

  update(props) {
    this.log && console.info(`d3-shape ${this.name} update`, props);
    this.updateWrapper(props);
    super.update(props);
  }

  updateWrapper(props) {
    let shallNotify = this.__init;
    props.forEach((value, key) => {
      if ((this[key] !== undefined) && key !== this.name) {
        shallNotify = true;
        this[this.name][key](this[key]);
      }
    });
    if (shallNotify) {
      this.dispatchEvent(new CustomEvent(`shape-changed`, { detail: { value: this[this.name], name: this.name }, bubbles: true, composed: true }));
      delete this.__init;
    }
  }
}

shapeNames.forEach(name => {
  const instance = shapes[name]();
  const keys = Object.keys(instance);
  const props = {
    // [`${name}`]: {
    //   type: Function
    // }
  };

  keys.forEach(key => {
    props[key] = {
      type: shapeType[key] || Function,
      attribute: camelToDashCase(key)
    };
  });

  classes[name] = class extends WrapperBase {

    get name() {
      return name;
    }

    static get properties() {
      return props;
    }
  };
});

// console.info(classes);
const Pie = classes.pie;
const Arc = classes.arc;
const Area = classes.area;
const Stack = classes.stack;
const Line = classes.line;
const LineRadial = classes.lineRadial;

// TODO(cg): Make this as a sublcass ot MultiDrawableLinePath.
class MultiDrawableRadar extends
  MultiDrawableSerie(
    Shaper(
      MultiDrawable)) {

    // Note(cg): style to add to svghost while dispatching SVG.
    static get hostStyles() {
      return css`
        
        #drawable.line .shape:not([fill]) {
          fill: var(--drawable-line-fill);
        }
        #drawable.line .shape:not([stroke]) {
          stroke: var(--drawable-line-stroke);
        }
      `;
    }

  render() {
    return html$1`
  	<d3-shape-line-radial 
      @shape-changed="${this.onSetShaper}" 
      .angle="${this.angle}" 
      .radius="${this.radius}" 
      .defined="${this.defined}"
      .curve="${this.curve}"
    ></d3-shape-line-radial>
    <svg>
      <g id="drawable" 
        slot-svg="slot-chart" 
        part="drawable-line-radial"  
        class="drawable line-radial" 
        transform="translate(${this.width / 2 || 0}, ${this.height / 2 || 0})"></g>
    </svg>
`;
  }

  static get properties() {
    return {

       ...super.properties,

      ...LineRadial.properties,

      /*
       * `hideCircles` 
       */
      hideCircles: {
        type: String,
        value: false,
        attribute: 'hide-circles'
      },

    };
  }

  get shapeClass() {
    return 'line-radial';
  }

  get shapeName() {
    return 'g';
  }

  drawSerieElement(chart, data) {

    chart = chart
      .attr('class', `${this.shapeClass} selectable`)
      .attr('title', d => d.label)
      .attr('key', d => d.key)
      .attr('tabindex', 0)
      .attr('stroke', d => this.colorScale(d.key))
      .attr('stroke-width', 2);
      
    // TODO(cg): improve handling of transition 
    // chart.append is when we don't have a transition.
    if (chart.append) {
      chart.append('path')
        .attr('fill', d => this.colorScale(d.key))
        .attr('fill-opacity', 0.1)
        .attr('d', d => {
          return this.shaper(d.data);
        });
    } else {
      chart.selectAll('path')
        .attr('fill', d => this.colorScale(d.key))
        .attr('fill-opacity', 0.1)
        .attr('d', d => {
          return this.shaper(d.data);
        });
    } 

    const {angle, radius } = this;
    if (!this.hideCircles) {
      const circles = this.drawSerieGroup(data, 'circle', `${this.shapeClass}-circle`, chart, this.transition);
      circles
        .attr('cx', function(d, i) {
          return radius(d) * Math.cos(angle(d) - Math.PI / 2);
        })
        .attr('cy', function(d, i) {
          return radius(d) * Math.sin(angle(d) - Math.PI / 2);
        })
        .attr('fill', '#fff')
        .attr('r', 4)
        .attr('index', (d, i) => i);
    }

    return chart;
  }
}

/**
 * ## MultiAccessor
 *
 * `<multi-accessor>` creates an accessor function from a String path. This element is mostly for internal use.
 *
 * ### Eample
 * ```html
 *   <multi-accessor path="+count"></multi-accessor>
 * ```
 *
 *  @element multi-accessor
 *  @fires accessor-changed - Event fired when the accessor function changes
 *  
 **/
class MultiAccessor extends
doNotSetUndefinedValue(LitElement) {

  static get properties() {
    return {
      /**
       * the accessor function
       * example function : `d => {return +d.count}`
       */
      accessor: {
        type: Function
      },

      /**
       * path from which tha accessor function is built
       * For instance `+count` will create `d => {return +d.count}` function.
       */
      path: {
        type: String,
        reflect: true
      },

      /**
       * when set, will generate an accessor function that includes a subpath
       * 
       * For example `<multi-accessor path="+count" sub-path="sub"></multi-accessor>`
       * will create `d => {return +d.count.sub}`
       * @type {Object}
       */
      subPath: {
        type: Boolean,
        attribute: 'sub-path'
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    // Note(cg): we need to make sure accessor is initiated soon enough.
    // Otherwise call to series.accessor fail in multi-data.
    // we cannot process this in constructor because  attribute and values have
    // not yet been assigned.
    if (this.path) {
      this._observePath(this.path, this.subPath);
    }
  }

  update(props) {
    if (props.has('path') || props.has('subPath')) {
      this._observePath(this.path, this.subPath);
    }
    super.update(props);
  }

  _observePath(path, subPath) {
    if (path && (!this.accessor || (this.accessor && this.accessor._signature !== `${path}${subPath}`))) {
      let isAdd = path.substring(0, 1) === '+';
      let p = isAdd ? path.substring(1) : path;
      p = p.split('.').join("']['");
      let fn;
      if (subPath) {
        fn = new Function('d', 'k', isAdd ? `return +d['${p}'][k]` : `return d['${p}'][k]`);
      } else {
        fn = new Function('d', isAdd ? `return +d['${p}']` : `return d['${p}']`);
      }
      this.accessor = fn;
      this.accessor._signature = `${path}${subPath}`;
      this.dispatchEvent(new CustomEvent('accessor-changed', { detail: { value: this.accessor }, bubbles: true, composed: true }));

    }
  }
}

/**
 * ## MultiDrawablePie
 *
 * `<multi-drawable-pie>` draws a pie
 *
 * @memberof MultiChart
 * @element multi-drawable-chart
 * @customElement
 * @polymer
 * @appliesMixin MultiChart.mixin.D3PieProperty
 * @demo index.html#multi-pie-demo
 **/
class MultiDrawablePie extends 
  Shaper(
    MultiDrawable) {
  render() {
    return html$1`
     ${this.valuePath ? html$1`
        <multi-accessor 
          .path="${this.valuePath}"
          @accessor-changed="${e => this.value = e.detail.value}" 
        ></multi-accessor>` : ''}
         <d3-shape-pie 
          .value="${this.value}" 
          .padAngle="${this.padAngle}" 
          .sort="${this.sort}" 
          .sortValues="${this.sortValues}"
          @shape-changed="${this.onSetShaper}" 
         ></d3-shape-pie>
         <d3-shape-arc 
          .innerRadius="${this.getPieWidth() || this.innerRadius}" 
          .outerRadius="${this.getOuterRadius() || this.outerRadius}" 
          .cornerRadius="${this.cornerRadius}" 
          @shape-changed="${e => this.arc = e.detail.value}" 
        ></d3-shape-arc>
        <svg>
          <g id="drawable" 
            slot-svg="slot-chart" 
            class="drawable pie" 
            transform="translate(${this.width / 2 || 0}, ${this.height / 2 || 0})"></g>
        </svg>
    `;
  }

  static get properties() {
    return {

      ...super.properties,

      ...Pie.properties,

      ...Arc.properties,

      /**
       * `pieWidth` a way to indicate the width of the radius (either in % or absolute value).
       * If set, inner radius will be inferred.
       */
      pieWidth: {
        type: String
      },

      arc: {
        type: Function,
      },

      /*
       * `valuePath` path for creating value accessor
       */
       valuePath: {
         type: String,
         attribute: 'value-path'
        },
    };
  }

  getOuterRadius() {
    if (typeof this.outerRadius !== 'function' && this.minSize) {
      return this.minSize / 2;
    }
  }

  getPieWidth() {
    if (this.pieWidth) {
        const outerRadius = this.getOuterRadius();
        return (this.pieWidth + '').endsWith('%') ? outerRadius * (1 - parseFloat(this.pieWidth) / 100) : outerRadius - parseFloat(this.pieWidth);
    }
  }

  get shapeClass() {
    return 'pie';
  }
  get shapeName() {
    return 'path';
  }

  draw() {
   const data = this.drawableData;
    if (!this.width || !this.height || !data) {
      return;
    }

    let chart = select(this.targetElement).selectAll(`${this.shapeName}.${this.shapeClass}`);

    if (this.shallTransition) {
      chart.each(function(d) {
        this._current = Object.assign({}, d);
      });
    }

    // var arcs = this.pie(data);
    const arcs = this.shaper(data); // this.$.shaper.shapedData;
    const arc = this.arc;
    const colorScale = this.colorScale;

    chart = chart.data(arcs);

    chart.exit().remove();

    chart = chart.enter().append(this.shapeName)
      .attr('class', `${this.shapeClass} selectable shape`)
      .merge(chart);

    if (this.shallTransition) {
      //as in https://bl.ocks.org/mbostock/5100636
      function arcTween(a) {
        var i = interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
          return arc(i(t));
        };
      }

      chart = this.applyTransition(chart, this.transition);

      chart
        .attrTween('d', arcTween);

    } else {
      chart
        .attr('d', arc);
    }

    chart.attr('key', function(d) {
        return d.data.key;
      })
      .attr('fill', function(d) {
        return colorScale(d.data.key);
      });

    return chart;
  }
}

// TODO(cg): Make this as a sublcass ot MultiDrawableLinePath.
class MultiDrawableLine extends
  MultiDrawableSerie(
    Shaper(
      MultiDrawable)) {

    // Note(cg): style to add to svghost while dispatching SVG.
    static get hostStyles() {
      return css`
        
        #drawable.line .shape:not([fill])  {
          fill: var(--drawable-line-fill);
        }
        #drawable.line .shape:not([stroke])  {
          stroke: var(--drawable-line-stroke);
        }
      `;
    };

  render() {
    return html$1`
  	<d3-shape-line 
      @shape-changed="${this.onSetShaper}" 
      .y="${this.y}" 
      .x="${this.x}" 
      .defined="${this.defined}"
    ></d3-shape-line>
    <svg>
      <g id="drawable" slot-svg="slot-chart" part="drawable-line"  class="drawable line"></g>
    </svg>
`;
  }

  static get properties() {
    return {

       ...super.properties,

      ...Line.properties,

    };
  }

  get shapeClass() {
    return 'line';
  }

  drawSerieElement(chart) {
    return chart.attr('stroke', d => this.colorScale(d.key))
      .attr('class', `${this.shapeClass} selectable`)
      .attr('title', d => d.label)
      .attr('key', d => d.key)
      .attr('d', d => this.shaper(d.data));
  }
}

/**
 * ## MultiDrawableLinePath
 *
 * `<multi-drawable-line-path>` draws a line in a single svg path element
 *
 * @memberof MultiChart
 * @customElement
 * @polymer
 * @demo
 **/
class MultiDrawableLinePath extends  
  Shaper(
    MultiDrawable) {
  render() {
    return html$1`
    <d3-shape-line 
      @shape-changed="${this.onSetShaper}" 
      .y="${this.y}" 
      .x="${this.x}" 
      .defined="${this.defined}"
    ></d3-shape-line>
    <svg>
      <path id="drawable" slot-svg="slot-chart" class="drawable selectable line"> </path>
    </svg>
`;
  }

  static get is() { return 'multi-drawable-line-path'; }

  static get properties() {

    return {
      ...super.properties, 

      // ...coordinateProperties,

      ...Line.properties

    };
  }

  draw() {
    const data = this.drawableData;
    if (!this.width || !this.height || !data) {
      return;
    }

    let chart = select(this.targetElement).datum(data);

    if (this.shallTransition) {
      chart = this.applyTransition(chart, this.transition);
    }

    chart.attr('stroke', this.colorScale(this.key))
      .attr('key', this.key)
      .attr('d', this.shaper);

   return chart;

  }
}

/**
 * ## MultiDrawableBubble
 *
 * `<multi-drawable-bubble>` draw bubbles from serie data
 *     
 * ### Styling
 * 
 * The following custom properties and mixins are available for styling:
 * 
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--drawable-bubble` | mixin applied to drawable | `{}`
 * `--drawable-bubble-fill` | fill color applied to bubble | `none`
 * `--drawable-bubble-strole` | stroke color applied to bubble | `none`
 *
 * @memberof MultiChart
 * @customElement
 * @polymer
 * @appliesMixin MultiChart.mixin.MultiDrawableSerie
 * @appliesMixin MultiChart.mixin.D3ShapeCoordinate
 * @demo
 **/
class MultiDrawableBubble extends
  MultiDrawableSerie(
    MultiDrawable) {

  static get hostStyles() {
    return css `
      #drawable.bubble .shape:not([fill]) {
        fill: var(--drawable-bubble-fill);
      }
      #drawable.bubble .shape:not([stroke]) {
        stroke: var(--drawable-bubble-stroke);
      }
    `;
  }
  render() {
    return html$1 `
    <svg>
      <g id="drawable" slot-svg="slot-chart" part="drawable-bubble"  class="drawable bubble"></g>
    </svg>
`;
  }

  
  static get properties() {
    return {

      ...super.properties,

      
      ...Line.properties,

      /* 
       * `z` calculating radius for all data point radius = z(d,i)
       */
      z: {
        type: Function,
      }

    };
  }

  get shapeClass() {
    return 'bubble';
  }

  get shapeName() {
    return 'g';
  }

  drawSerieElement(chart, data) {
    chart
      .attr('fill', d => this.colorScale(d.key))
      .attr('class', `${this.shapeClass} selectable`)
      .attr('key', d => d.key);

    chart = this.drawSerieGroup(data, 'circle', this.shapeClass, chart, this.transition);

    return chart.attr('cx', this.x || 0)
      .attr('cy', this.y || 0)
      .attr('r', this.z || 0)
      .attr('index', (d, i) => i);
  }
}

/** ## MultiDrawableBar
 *
 * `<multi-drawable-bar>` draws bar as in https://github.com/d3/d3-shape#bar
 * 
 * ### Styling
 * 
 * The following custom properties and mixins are available for styling:
 * 
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--drawable-bar` | mixin applied to drawable | `{}`
 * `--drawable-bar-fill` | fill color applied to bar | `none`
 * `--drawable-bar-strole` | stroke color applied to bar | `none`
 *
 * @memberof MultiChart
 * @customElement
 * @polymer
 * @appliesMixin MultiChart.mixin.MultiDrawableSerie
 * @appliesMixin MultiChart.mixin.D3ShapeCoordinate
 * @appliesMixin MultiChart.mixin.D3StackProperty
 * @demo index.html#multi-bar-demo
 **/
// class MultiDrawableBar extends
// MultiDrawableSerie(
//   D3StackProperty(
//     D3ShapeCoordinate(
//       MultiDrawable))) {  
//       
class MultiDrawableBar extends
MultiDrawableSerie(
  Shaper(
    MultiDrawable)) {

  /*
   * `dataProcessType` the type of data processing. 
   * @override multi-drawable
   */
  get dataProcessType() {
    return 'stack';
  }

  static get hostStyles() {
    return css `
      #drawable.bar .shape:not([fill]) {
        fill: var(--drawable-bar-fill);
      }
      
      #drawable.bar .shape:not([stroke]) {
        stroke: var(--drawable-bar-stroke);
      }
    `;
  }
  render() {
    return html$1 `
    ${this.valuePath ? html$1`
      <multi-accessor 
        .path="${this.valuePath}"
        @accessor-changed="${e => this.value = e.detail.value}" 
      ></multi-accessor>` : '' }
     <d3-shape-stack 
      .value="${this.value}" 
      .keys="${this.keys}" 
      .order="${this.order}" 
      .offset="${this.offset}" 
      @shape-changed="${this.onSetShaper}" 
     ></d3-shape-stack>
    <svg>
      <g id="drawable" slot-svg="slot-chart" part="drawable-bar" class="drawable bar"></g>
    </svg>
    `;
  }

  static get properties() {
    return {

      ...super.properties,

      ...Stack.properties,

      /*
       * `stacked` if true, draw a stack chart, otherwise, default bar chart
       */
      stacked: {
        type: Boolean
      },

      /*
       * `serieName` used for resetting value domain.
       */
      serieName: {
        type: String,
        value: 'default'
      },

      xScale: { type: Function },
      yScale: { type: Function },

      /*
       * `valuePath` path for creating value accessor
       */
       valuePath: {
         type: String,
         attribute: 'value-path'
        },
    };
  }

  get shapeClass() {
    return 'bar';
  }


  get shapeName() {
    return 'g';
  }

  drawSerieElement(chart, data) {

    chart
      .attr('class', `${this.shapeClass} ${this.selectSerie ? 'selectable' : ''}`)
      .attr('fill', d => this.colorScale(d.key))
      .attr('key', d => d.key);

    chart = this.drawSerieGroup(data, 'rect', this.shapeClass, chart, this.transition);

    // Note(cg): we add selectable to shape only if selectSerie is not true.
    if (!this.selectSerie) {
      chart instanceof transition
      ? chart.selection().classed('selectable', true)
      : chart.classed('selectable', true);
    }

    let bandwidth = this.xScale.bandwidth;
    let align = 0;
    const xScale = this.xScale;
    // we might have an x-scale that does not have a bandwidth, e.g. when we have date on x-axis and use a timeScale
    if (!bandwidth) {
      if (xScale.interval && xScale.interval.range) {
        const d = xScale.domain();
        bandwidth = band().domain(xScale.interval.range(d[0], d[1]))
          .range(xScale.range())
          .padding(0.2)
          .bandwidth;
      } else {
        bandwidth = band().domain(data[0].map((d, i) => xScale(d[3] || i)))
          .range(xScale.range())
          .padding(0.2)
          .bandwidth;
      }
      align = bandwidth() / 2;
    }

    if (this.stacked) {
      chart = chart
            .attr('y', d => this.yScale(d[1]) || 0)
            .attr('height', d => this.yScale(d[0]) - this.yScale(d[1]) || 0);

     return chart
          .attr('x', (d, i) => {
            return xScale(d[3] || i) - align;
          })
          .attr('width', bandwidth())
          .attr('key', d => d[3]);
    }

    const n = data.length;
    chart = chart
      .attr('x', (d, i) => xScale(d[3] || i) + bandwidth() / n * d[2] - align)
      .attr('width', bandwidth() / n)
      .attr('key', d => d[3]);

    return chart
      .attr('y', d => this.yScale(d[1] - d[0]) || 0)
      .attr('height', d => this.yScale(0) - this.yScale(d[1] - d[0]) || 0)
      .attr('index', (d, i) => i);

  }
}

/** ## MultiDrawableBarHorizontal
 *
 * `<multi-drawable-bar>` draws bar as in https://github.com/d3/d3-shape#bar
 * 
 */
  
class MultiDrawableBarHorizontal extends MultiDrawableBar {


  drawSerieElement(chart, data) {

    chart
      .attr('fill', d => this.colorScale(d.key))
      .attr('class', `${this.shapeClass} ${this.selectSerie ? 'selectable' : ''}`)
      .attr('key', d => d.key);

    
    chart = this.drawSerieGroup(data, 'rect', this.shapeClass, chart, this.transition);

    // Note(cg): we add selectable to shape only if selectSerie is not true.
    if (!this.selectSerie) {
      chart instanceof transition
      ? chart.selection().classed('selectable', true)
      : chart.classed('selectable', true);
    }

    let bandwidth = this.yScale.bandwidth;
    let align = 0;
    const yScale = this.yScale;
    // we might have an x-scale that does not have a bandwidth, e.g. when we have date on x-axis and use a timeScale
    if (!bandwidth) {
      if (yScale.interval && yScale.interval.range) {
        const d = yScale.domain();
        bandwidth = band().domain(yScale.interval.range(d[0], d[1]))
          .range(yScale.range())
          .padding(0.2)
          .bandwidth;
      } else {
        bandwidth = band().domain(data[0].map((d, i) => yScale(d[3] || i)))
          .range(yScale.range())
          .padding(0.2)
          .bandwidth;
      }
      align = bandwidth() / 2;
    }

    if (this.stacked) {
      chart = chart
            .attr('x', d => this.xScale(d[0]) || 0)
            .attr('width', d => (this.xScale(d[1]) - this.xScale(d[0])) || 0);
      
     return chart
          .attr('y', (d, i) => {
            return yScale(d[3] || i) - align;
          })
          .attr('height', bandwidth())
          .attr('key', d => d[3]);
    }

    const n = data.length;
    chart = chart
      .attr('y', (d, i) => yScale(d[3] || i) + bandwidth() / n * d[2] - align)
      .attr('height', bandwidth() / n)
      .attr('key', d => d[3]);

    return chart
      .attr('x', d => this.xScale(0))
      .attr('width', d => this.xScale(d[1] - d[0]) || 0)
      .attr('index', (d, i) => i);

  }
}

const key= (d) => {return d.key;};
const value= (d) => {return d.value;};

/**
   * ##  MultiData
   *
   * Mixin for reacting to dataChange. Used by multi-container-layer and multi-container-svg
   * 
   */
  const MultiData = superClass => {

    return class extends superClass {

      static get properties() {

        return {

          ...super.properties,

          /*
           * the data to display
           */
          data: {
            type: Array
          },

          /*
           * `transition` to apply while drawing
           */
          transition: {
            type: Function
          }
        };
      }

      constructor() {
        super();

        this._serieGroup = {}; // Note(cg): we will map the serie group by name.

        this.addEventListener('multi-serie-register', this._onMultiSerieRegister);
        this.addEventListener('multi-data-group-register', this._onMultiSerieGroupRegister);
        this.addEventListener('shape-changed', this._onShapeChanged);
      }

      _onShapeChanged(e) {
        const serieGroup = this._serieGroup[e.detail.group];
        if (serieGroup) {
          serieGroup.shaper = e.detail.value;
        }
      }

      disconnectedCallback() {
        this._wasDisconnected = true;
        super.disconnectedCallback();
      }

      _onMultiSerieGroupRegister(e) {
        e.stopPropagation();
        const serieGroup = e.composedPath()[0];
        const group = serieGroup.group;

        if (!group) {
          throw new Error(`serieGroup must have a group`);
        }

        // Note(cg): we cn only register once.
        if (this._serieGroup[group] && !this._wasDisconnected) {
          throw new Error(`serieGroup with group name ${group} has already been registered. Choose another group name.`);
        }
        delete this._wasDisconnected;

        if (!this[`_series.${group}`]) {
          this[`_series.${group}`] = [];
        }
        if (!this[`_registeredItems.${group}`]) {
          this[`_registeredItems.${group}`] = [];
        }
        serieGroup.series = this[`_series.${group}`];
        // XXX(cg): the consequence of this is that all registered items for a chart
        // ends up being registered for the serieGroup (multi-data-group).
        serieGroup._registeredItems = this[`_registeredItems.${group}`];
        this._serieGroup[group] = serieGroup;

      }

      _onMultiSerieRegister(e) {
        e.stopPropagation();
        const group = e.detail || 'default';
        this._registerItem(`_series.${group}`, e.composedPath()[0]);
      }

      /**
       * `register-item` event callback. Register all item, in contrast
       * with the original function.
       * 
       * @override MultiRegisterMixin because of multi-data-group
       * @param  {Event} e
       * @return {[type]}   [description]
       */
      _onMultiRegister(e) {
        // Note(cg): only react if groupName is not set or is the same.
        const group = e.detail || 'default';

        // XXX(cg): we should only register proper group. 

        // Note(cg): make sure we are not self-registering
        // (this can be the case for elements that are registerable and also register like multi-container-layer).
        const target = e.composedPath()[0];
        if (target !== this) {
          e.stopPropagation();
          this._registerItem(`_registeredItems.${group}`, target);
          if (this._serieGroup[group]) {
            this._serieGroup[group].onRegister(target);
          }
        }
      }

      // Note(cg): loop through _serieGroup.
      get registeredItems() {
        return (Object.keys(this._serieGroup || {}).map(k => this._serieGroup[k]._registeredItems)).flat();
      }

      unregister(registered) {
        const group = registered.group;

        if (group) {
          if (this[`_series.${group}`]) {
            this[`_series.${group}`] = this[`_series.${group}`].filter((s => s !== registered));
          }
          if (this[`_registeredItems.${group}`]) {
            this[`_registeredItems.${group}`] = this[`_registeredItems.${group}`].filter((s => s !== registered));
          }
        }
        super.unregister && super.unregister(registered);
      }

      /*
       * `dataChanged` might be called by parents to reset the entied chart.
       * For instance, this is called by multi-verse, once a new filter is applies
       * and data to display have changed.
       */
      dataChanged() {
        this._processDataChanged();
      }

      _processDataChanged() {
        Object.keys(this._serieGroup || {}).forEach(k => {
          this._serieGroup[k]._processDataChanged();
        });
      }
    };
  };

var zoomableProperty = {
  
  /* 
   * `enableZoom` set true to enable zoom behaviors
   */
  enableZoom: {
    type: Boolean,
    attribute: 'enable-zoom'
  },

  /* 
   * [`extent`] (https://github.com/d3/d3-zoom#zoom_extent) sets the viewport extent to the specified array of points [[x0, y0], [x1, y1]]
   */
  extent: {
    type: Array
  },

  /* 
   * [`scaleExtent`](https://github.com/d3/d3-zoom#zoom_scaleExtent) sets the scale extent to the specified array of numbers [k0, k1] where k0 is the minimum allowed scale factor and k1 is the maximum allowed scale factor, and returns this zoom behavior.
   */
  scaleExtent: {
    type: Array,
    attribute: 'scale-extent'
  }
};

var constant$5 = x => () => x;

function ZoomEvent(type, {
  sourceEvent,
  target,
  transform,
  dispatch
}) {
  Object.defineProperties(this, {
    type: {value: type, enumerable: true, configurable: true},
    sourceEvent: {value: sourceEvent, enumerable: true, configurable: true},
    target: {value: target, enumerable: true, configurable: true},
    transform: {value: transform, enumerable: true, configurable: true},
    _: {value: dispatch}
  });
}

function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}

Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x, y) {
    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  },
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function(x) {
    return x * this.k + this.x;
  },
  applyY: function(y) {
    return y * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x) {
    return (x - this.x) / this.k;
  },
  invertY: function(y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function(x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function(y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};

var identity$6 = new Transform(1, 0, 0);

function nopropagation$1(event) {
  event.stopImmediatePropagation();
}

function noevent$2(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

// Ignore right-click, since that should open the context menu.
// except for pinch-to-zoom, which is sent as a wheel+ctrlKey event
function defaultFilter$1(event) {
  return (!event.ctrlKey || event.type === 'wheel') && !event.button;
}

function defaultExtent$1() {
  var e = this;
  if (e instanceof SVGElement) {
    e = e.ownerSVGElement || e;
    if (e.hasAttribute("viewBox")) {
      e = e.viewBox.baseVal;
      return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
    }
    return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
  }
  return [[0, 0], [e.clientWidth, e.clientHeight]];
}

function defaultTransform() {
  return this.__zoom || identity$6;
}

function defaultWheelDelta(event) {
  return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * (event.ctrlKey ? 10 : 1);
}

function defaultTouchable$1() {
  return navigator.maxTouchPoints || ("ontouchstart" in this);
}

function defaultConstrain(transform, extent, translateExtent) {
  var dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0],
      dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0],
      dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1],
      dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1];
  return transform.translate(
    dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
    dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
  );
}

function zoom() {
  var filter = defaultFilter$1,
      extent = defaultExtent$1,
      constrain = defaultConstrain,
      wheelDelta = defaultWheelDelta,
      touchable = defaultTouchable$1,
      scaleExtent = [0, Infinity],
      translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]],
      duration = 250,
      interpolate = interpolateZoom,
      listeners = dispatch$1("start", "zoom", "end"),
      touchstarting,
      touchfirst,
      touchending,
      touchDelay = 500,
      wheelDelay = 150,
      clickDistance2 = 0,
      tapDistance = 10;

  function zoom(selection) {
    selection
        .property("__zoom", defaultTransform)
        .on("wheel.zoom", wheeled)
        .on("mousedown.zoom", mousedowned)
        .on("dblclick.zoom", dblclicked)
      .filter(touchable)
        .on("touchstart.zoom", touchstarted)
        .on("touchmove.zoom", touchmoved)
        .on("touchend.zoom touchcancel.zoom", touchended)
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  zoom.transform = function(collection, transform, point, event) {
    var selection = collection.selection ? collection.selection() : collection;
    selection.property("__zoom", defaultTransform);
    if (collection !== selection) {
      schedule(collection, transform, point, event);
    } else {
      selection.interrupt().each(function() {
        gesture(this, arguments)
          .event(event)
          .start()
          .zoom(null, typeof transform === "function" ? transform.apply(this, arguments) : transform)
          .end();
      });
    }
  };

  zoom.scaleBy = function(selection, k, p, event) {
    zoom.scaleTo(selection, function() {
      var k0 = this.__zoom.k,
          k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return k0 * k1;
    }, p, event);
  };

  zoom.scaleTo = function(selection, k, p, event) {
    zoom.transform(selection, function() {
      var e = extent.apply(this, arguments),
          t0 = this.__zoom,
          p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p,
          p1 = t0.invert(p0),
          k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
    }, p, event);
  };

  zoom.translateBy = function(selection, x, y, event) {
    zoom.transform(selection, function() {
      return constrain(this.__zoom.translate(
        typeof x === "function" ? x.apply(this, arguments) : x,
        typeof y === "function" ? y.apply(this, arguments) : y
      ), extent.apply(this, arguments), translateExtent);
    }, null, event);
  };

  zoom.translateTo = function(selection, x, y, p, event) {
    zoom.transform(selection, function() {
      var e = extent.apply(this, arguments),
          t = this.__zoom,
          p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
      return constrain(identity$6.translate(p0[0], p0[1]).scale(t.k).translate(
        typeof x === "function" ? -x.apply(this, arguments) : -x,
        typeof y === "function" ? -y.apply(this, arguments) : -y
      ), e, translateExtent);
    }, p, event);
  };

  function scale(transform, k) {
    k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
    return k === transform.k ? transform : new Transform(k, transform.x, transform.y);
  }

  function translate(transform, p0, p1) {
    var x = p0[0] - p1[0] * transform.k, y = p0[1] - p1[1] * transform.k;
    return x === transform.x && y === transform.y ? transform : new Transform(transform.k, x, y);
  }

  function centroid(extent) {
    return [(+extent[0][0] + +extent[1][0]) / 2, (+extent[0][1] + +extent[1][1]) / 2];
  }

  function schedule(transition, transform, point, event) {
    transition
        .on("start.zoom", function() { gesture(this, arguments).event(event).start(); })
        .on("interrupt.zoom end.zoom", function() { gesture(this, arguments).event(event).end(); })
        .tween("zoom", function() {
          var that = this,
              args = arguments,
              g = gesture(that, args).event(event),
              e = extent.apply(that, args),
              p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point,
              w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]),
              a = that.__zoom,
              b = typeof transform === "function" ? transform.apply(that, args) : transform,
              i = interpolate(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
          return function(t) {
            if (t === 1) t = b; // Avoid rounding error on end.
            else { var l = i(t), k = w / l[2]; t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k); }
            g.zoom(null, t);
          };
        });
  }

  function gesture(that, args, clean) {
    return (!clean && that.__zooming) || new Gesture(that, args);
  }

  function Gesture(that, args) {
    this.that = that;
    this.args = args;
    this.active = 0;
    this.sourceEvent = null;
    this.extent = extent.apply(that, args);
    this.taps = 0;
  }

  Gesture.prototype = {
    event: function(event) {
      if (event) this.sourceEvent = event;
      return this;
    },
    start: function() {
      if (++this.active === 1) {
        this.that.__zooming = this;
        this.emit("start");
      }
      return this;
    },
    zoom: function(key, transform) {
      if (this.mouse && key !== "mouse") this.mouse[1] = transform.invert(this.mouse[0]);
      if (this.touch0 && key !== "touch") this.touch0[1] = transform.invert(this.touch0[0]);
      if (this.touch1 && key !== "touch") this.touch1[1] = transform.invert(this.touch1[0]);
      this.that.__zoom = transform;
      this.emit("zoom");
      return this;
    },
    end: function() {
      if (--this.active === 0) {
        delete this.that.__zooming;
        this.emit("end");
      }
      return this;
    },
    emit: function(type) {
      var d = select(this.that).datum();
      listeners.call(
        type,
        this.that,
        new ZoomEvent(type, {
          sourceEvent: this.sourceEvent,
          target: zoom,
          type,
          transform: this.that.__zoom,
          dispatch: listeners
        }),
        d
      );
    }
  };

  function wheeled(event, ...args) {
    if (!filter.apply(this, arguments)) return;
    var g = gesture(this, args).event(event),
        t = this.__zoom,
        k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))),
        p = pointer(event);

    // If the mouse is in the same location as before, reuse it.
    // If there were recent wheel events, reset the wheel idle timeout.
    if (g.wheel) {
      if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
        g.mouse[1] = t.invert(g.mouse[0] = p);
      }
      clearTimeout(g.wheel);
    }

    // If this wheel event won’t trigger a transform change, ignore it.
    else if (t.k === k) return;

    // Otherwise, capture the mouse point and location at the start.
    else {
      g.mouse = [p, t.invert(p)];
      interrupt(this);
      g.start();
    }

    noevent$2(event);
    g.wheel = setTimeout(wheelidled, wheelDelay);
    g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));

    function wheelidled() {
      g.wheel = null;
      g.end();
    }
  }

  function mousedowned(event, ...args) {
    if (touchending || !filter.apply(this, arguments)) return;
    var g = gesture(this, args, true).event(event),
        v = select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true),
        p = pointer(event, currentTarget),
        currentTarget = event.currentTarget,
        x0 = event.clientX,
        y0 = event.clientY;

    dragDisable(event.view);
    nopropagation$1(event);
    g.mouse = [p, this.__zoom.invert(p)];
    interrupt(this);
    g.start();

    function mousemoved(event) {
      noevent$2(event);
      if (!g.moved) {
        var dx = event.clientX - x0, dy = event.clientY - y0;
        g.moved = dx * dx + dy * dy > clickDistance2;
      }
      g.event(event)
       .zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = pointer(event, currentTarget), g.mouse[1]), g.extent, translateExtent));
    }

    function mouseupped(event) {
      v.on("mousemove.zoom mouseup.zoom", null);
      yesdrag(event.view, g.moved);
      noevent$2(event);
      g.event(event).end();
    }
  }

  function dblclicked(event, ...args) {
    if (!filter.apply(this, arguments)) return;
    var t0 = this.__zoom,
        p0 = pointer(event.changedTouches ? event.changedTouches[0] : event, this),
        p1 = t0.invert(p0),
        k1 = t0.k * (event.shiftKey ? 0.5 : 2),
        t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, args), translateExtent);

    noevent$2(event);
    if (duration > 0) select(this).transition().duration(duration).call(schedule, t1, p0, event);
    else select(this).call(zoom.transform, t1, p0, event);
  }

  function touchstarted(event, ...args) {
    if (!filter.apply(this, arguments)) return;
    var touches = event.touches,
        n = touches.length,
        g = gesture(this, args, event.changedTouches.length === n).event(event),
        started, i, t, p;

    nopropagation$1(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      p = [p, this.__zoom.invert(p), t.identifier];
      if (!g.touch0) g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
      else if (!g.touch1 && g.touch0[2] !== p[2]) g.touch1 = p, g.taps = 0;
    }

    if (touchstarting) touchstarting = clearTimeout(touchstarting);

    if (started) {
      if (g.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() { touchstarting = null; }, touchDelay);
      interrupt(this);
      g.start();
    }
  }

  function touchmoved(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event),
        touches = event.changedTouches,
        n = touches.length, i, t, p, l;

    noevent$2(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
      else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
    }
    t = g.that.__zoom;
    if (g.touch1) {
      var p0 = g.touch0[0], l0 = g.touch0[1],
          p1 = g.touch1[0], l1 = g.touch1[1],
          dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp,
          dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
      t = scale(t, Math.sqrt(dp / dl));
      p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
    }
    else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
    else return;

    g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
  }

  function touchended(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event),
        touches = event.changedTouches,
        n = touches.length, i, t;

    nopropagation$1(event);
    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() { touchending = null; }, touchDelay);
    for (i = 0; i < n; ++i) {
      t = touches[i];
      if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
      else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
    }
    if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
    if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
    else {
      g.end();
      // If this was a dbltap, reroute to the (optional) dblclick.zoom handler.
      if (g.taps === 2) {
        t = pointer(t, this);
        if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
          var p = select(this).on("dblclick.zoom");
          if (p) p.apply(this, arguments);
        }
      }
    }
  }

  zoom.wheelDelta = function(_) {
    return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant$5(+_), zoom) : wheelDelta;
  };

  zoom.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant$5(!!_), zoom) : filter;
  };

  zoom.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant$5(!!_), zoom) : touchable;
  };

  zoom.extent = function(_) {
    return arguments.length ? (extent = typeof _ === "function" ? _ : constant$5([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent;
  };

  zoom.scaleExtent = function(_) {
    return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom) : [scaleExtent[0], scaleExtent[1]];
  };

  zoom.translateExtent = function(_) {
    return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
  };

  zoom.constrain = function(_) {
    return arguments.length ? (constrain = _, zoom) : constrain;
  };

  zoom.duration = function(_) {
    return arguments.length ? (duration = +_, zoom) : duration;
  };

  zoom.interpolate = function(_) {
    return arguments.length ? (interpolate = _, zoom) : interpolate;
  };

  zoom.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom : value;
  };

  zoom.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom) : Math.sqrt(clickDistance2);
  };

  zoom.tapDistance = function(_) {
    return arguments.length ? (tapDistance = +_, zoom) : tapDistance;
  };

  return zoom;
}

// import { selectMixin } from '/web_modules/@preignition/preignition-mixin.js';

/**
 * ##  Zoomable
 * 
 * allows charts to be zoomable
 * 
 * @memberof MultiChart.mixin
 * @polymer
 * @mixinFunction
 */
const Zoomable = superClass => {

  return class extends superClass {

    static get properties() {

      return {

        ...super.properties,

        ...zoomableProperty,

        /*
         * `enableZoom` set true to enable zoom behaviors
         */
        enableZoom: {
          type: Boolean,
          reflect: true,
          attribute: 'enable-zoom',
        },


      };
    }

    updated(props) {
      if (props.has('enableZoom')) {
        this._observeEnableZoom(this.enableZoom);
      }

      if (props.has('extent') && this._zoom) {
        this._zoom.extent(this.extent);
      }

      if (props.has('scaleExtent') && this._zoom) {
        this._zoom.scaleExtent(this.scaleExtent);
      }
      super.updated(props);

    }

    get zoomedEl() {
      return select(this.renderRoot.querySelector('#slot-zoom'));
      // return d3.select(this.renderRoot.querySelector('#slot-zoom'));
    }

    _observeEnableZoom(enable) {
      if (enable) {
        const zoomed = ({transform}) => {
          this.zoomedEl.attr('transform', transform);
        };

        this._zoom = zoom().on('zoom', zoomed);
        select(this.renderRoot.querySelector('#svg')).call(this._zoom);
        // d3.select(this.$.svg).call(this._zoom);

      }
      if (!enable) {
        this._zoom = null;
      }

    }
  };
};

const pattern =  html$1 `
    <!-- we include patterns in the template so as to be able to use them in css (mask: url(#mask-stripe-thick)) -->
    <svg style="position:absolute; top:-100000px;" viewBox="0 0 1000 1000">
      <defs>
        <pattern id="pattern-stripe" width="5" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="0.5" height="4" transform="translate(0,0)" fill="white"></rect>
        </pattern>
        <pattern id="pattern-stripe-thick" width="5" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="2.5" height="4" transform="translate(0,0)" fill="white"></rect>
        </pattern>
        <pattern id="pattern-stripe-light" width="5" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="4" height="4" transform="translate(0,0)" fill="white"></rect>
        </pattern>
        <pattern id="pattern-stripe-hor" width="5" height="4" patternUnits="userSpaceOnUse">
          <rect width="0.5" height="4" transform="translate(0,0)" fill="white"></rect>
        </pattern>
        <pattern id="pattern-stripe-inverse" width="5" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="0.5" height="4" transform="translate(0,0)" fill="white"></rect>
        </pattern>
        <pattern id="pattern-stripe-thick-inverse" width="5" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="2.5" height="4" transform="translate(0,0)" fill="white"></rect>
        </pattern>
        <mask id="mask-stripe">
          <rect x="-200" y="-200" width="10000" height="10000" fill="url(#pattern-stripe)"></rect>
        </mask>
        <mask id="mask-stripe-thick">
          <rect x="-200" y="-200" width="10000" height="10000" fill="url(#pattern-stripe-thick)"></rect>
        </mask>
          <mask id="mask-stripe-light">
          <rect x="-200" y="-200" width="10000" height="10000" fill="url(#pattern-stripe-light)"></rect>
        </mask>
        <mask id="mask-stripe-inverse">
          <rect x="-200" y="-200" width="10000" height="10000" fill="url(#pattern-stripe-inverse)"></rect>
        </mask>
        <mask id="mask-stripe-thick-inverse">
          <rect x="-200" y="-200" width="10000" height="10000" fill="url(#pattern-stripe-thick-inverse)"></rect>
        </mask>
        <mask id="mask-stripe-hor">
          <rect x="-200" y="-200" width="10000" height="10000" fill="url(#pattern-stripe-hor)"></rect>
        </mask>
      </defs>
    </svg>`;

const props$4 = {

  /*
   * `valueAccessor` accessor function for value (y)
   */
  valueAccessor: {
    type: Function
  },

  /*
   * `keyAccessor` accessor function for key (x)
   */
  keyAccessor: {
    type: Function
  },

  /*
   * `valuePosition` position of value axis and scale (x)
   */
  valuePosition: {
    type: String,
    notify: true,
    attribute: 'value-position'
  },

  /*
   * `keyPosition` position of key axis and scale (x)
   */
  keyPosition: {
    type: String,
    notify: true,
    attribute: 'key-position'
  },

  /*
   * `stacked` true when data is stacked
   */
  stacked: { type: Boolean },

  /*
   * `min` minimum value to apply to domain
   */
  min: { type: Number },

  /*
   * `max` minimum value to apply to domain
   */
  max: { type: Number },

  /*
   * `continuous` true to set continuous ordinal domain for this group
   * For instance, time series are continusou
   */
  continuous: { type: Boolean },

  /*
   * `adjustOrdinalDomain` a function to re-adjust  ordinal domain
   * for instance when time axis is too small
   */
  adjustOrdinalDomain: {
    type: Function,
    attribute: 'adjust-ordinal-domain',
    value: () => (domain) => domain
   },

   /*
    * `ordinalScaleInterval` interval for the ordinal scale. 
    * This is usefull when we have a timescale and set the interval as
    * time.timeDay 
    */
   ordinalScaleInterval: {
     attribute: 'ordinal-scale-interval',
     type: Object,
   },
};

// Note(cg): setting default values for some properties .
const values = {
  valuePosition: 'left',
  keyPosition: 'bottom',
  valueAccessor: () => value,
  keyAccessor: () => key,
};

const valueProperties = Object.assign({}, props$4);
Object.keys(values).forEach(k => valueProperties[k].value = values[k]);

/**
 * # MultiContainer
 *
 * `<multi-chart-base>` is a base element for buiding charts
 *
 *
 * ### Events
 * Fired when `multi-container` is attached .
 *
 * @event multi-verse-added
 * @param {string} the name of the current group.
 *
 * Fired when `multi-container` is removed .
 *
 * @event multi-container-removed
 * @param {string} the name of the current group.
 *
 *
 * @memberof MultiChart
 * @appliesMixin  Vaadin.ThemableMixin
 * @appliesMixin  MultiChart.mixin.MultiRegister
 * @appliesMixin  MultiChart.mixin.SVGHelper
 * @appliesMixin MultiChart.mixin.Accessor
 * @appliesMixin  MultiChart.mixin.Zoomable
 * @customElement
 * @polymer
 **/


class MultiContainer extends
MultiData(
  Resizable(
    MultiRegister(
      CacheId(
        Zoomable(
          MultiChartBase))))) {

  // Note(cg): Hack allowing extend multi-container
  // in other libraries
  get html() {
    return html$1;
  }

  static get styles() {
    return css `
     :host {
        display: flex;
        flex-direction: column;
      }

      ::slotted([slot=header]),
      ::slotted([slot=footer]) {
        margin: 0;
      }

      #observedNode {
        display: none;
      }

      #svg {
        /* need width here, otherwise the size of this svg is not properly calculated on resize*/
        width: 100%;
        flex: 1;
      }

      #background {
        fill: var(--multi-chart-background-color, var(--light-theme-background-color));
      }

      .drawable {
         fill: none;
      }

      slot[name="svg"] {
        display: none;
      }

      .highlighted {
        fill-opacity: 0.9;
        opacity: 1;
        stroke: #FFF;
        stroke-width: 0;
        mask: var(--multi-highlight-mask);
        fill: var(--multi-highlight-fill);
      }
 
    `;
  }

  render() {
    return html$1 `
      <slot name="header"></slot>
      <div id="observedNode">
        ${this.getContentRender()}
        <multi-data-group 
          group="default" 
          .processType="${this.processType}"
          .valuePosition="${this.valuePosition}"
          .keyPosition="${this.keyPosition}"
          .valueAccessor="${this.valueAccessor}"
          .keyAccessor="${this.keyAccessor}"
          .stacked="${this.stacked}"
          .adjustOrdinalDomain="${this.adjustOrdinalDomain}"
          .ordinalScaleInterval="${this.ordinalScaleInterval}"
          .min="${this.min}"
          .max="${this.max}"
          .data="${this.data}"
          ></multi-data-group>
        <slot></slot>
      </div>
      ${this.renderSVG()}
      <slot name="footer"></slot>
      <slot name="svg"></slot>
      ${this.pattern ? pattern : ''}
    `;
  }

  renderSVG() {
    return html$1 `
      <svg id="svg" part="svg">
        <g transform="translate(${this.leftMargin || 0}, ${this.topMargin || 0})">
          <g id="slot-background" part="background">
          </g>
          <g id="slot-chart-content">
            <g id="slot-zoom">
              <g id="slot-chart" part="chart"></g>
              <g id="slot-top-chart" part="chart"></g>
              <g id="slot-brush" part="brush"></g>
            </g>
            <g id="slot-axis" part="axis"></g>
          </g>
        </g>
        <g id="slot-legend" part="legend"></g>
      </svg>`;
  }

  /**
   * used when subclassing `multi-container` and add content to the chart
   * @return {TemplateResult} content to be added
   */
  getContentRender() {
    return '';
  }

  /**
   * return a scaled accessor function
   * @param  {d3Scale} scale    scale as
   * @param  {Function} accessor function (exampe: `(d,i) => d.value.x``)
   * @return {Function} an accessor function
   */
  getAccessor(scale, accessor) {
    if (scale && accessor) {
      return (d, i) => scale(accessor(d, i));
    }
    return () => {};
  }


  static get properties() {

    return {

      ...super.properties,

      ...valueProperties,

      topMargin: { type: Number, attribute: 'top-margin' },
      rightMargin: { type: Number, attribute: 'right-margin' },
      bottomMargin: { type: Number, attribute: 'bottom-margin' },
      leftMargin: { type: Number, attribute: 'left-margin' },



      /*
       * `width`  of the chart area. Equals actual width of component - margins
       */
      width: { type: Number, },

      /*
       * `height`  of the chart area. Equals actual height of component - margins
       */
      height: { type: Number, },

      /**
       * `group` the name of the group (used when to registering this element under a multi-verse)
       */
      group: { type: String },

      /*
       * `multiVerseGroup` group name send along with `multi-verse-added`
       */
      multiVerseGroup: {
        type: String,
        attribute: 'multi-verse-group',
        value: 'default'
      },

      /*
       * colorScale for the chart
       */
      colorScale: { type: Function },

      /*
       * `pattern` set true for charts using patterns (e.g. geo charts)
       */
      pattern: { type: Boolean },

      /*
       * `processType`  the type of process type, e.g. stack for bar Chart
       */
      processType: {
        type: String,
        attribute: 'process-type'
      },

      /*
       * `decorate` the chart once drawn in draw-mixin. This will be passed to drawable 
       * elements
       */
      decorate: {
        type: Function
      }

    };
  }


  constructor() {
    super();
    // Note(cg): allow drawble elements to be registered in this container.
    this.addEventListener('multi-drawn', this.onDrawn);
    this.addEventListener('multi-refresh', this.refresh);

    // Note(cg): multi-data-group notify value-position. We need to make sure
    // a scale exist for used position (left, bottom,...)
    this.addEventListener('value-position-changed', this._onScalePosition);
    this.addEventListener('key-position-changed', this._onScalePosition);
  }

  updated(props) {
    if (props.has('topMargin') || props.has('rightMargin') || props.has('bottomMargin') || props.has('leftMargin')) {
      this.onResize();
    }
    super.updated(props);
  }

  firstUpdated(changedProperties) {
    // Note(cg): chart container might be registered against multi-verse. We nee to notify their creation upwards.
    this.dispatchEvent(new CustomEvent('multi-verse-added', { detail: this.multiVerseGroup, bubbles: true, composed: true }));
    this.onResize();
    this.assignSlottedSVG();
    super.firstUpdated(changedProperties);
  }

  // disconnectedCallback() {
  //   // TODO(cg): replace multi-removed -> multi-verse-remover
  //   // XXX(cg): this event will never be caught! unregister from host instead like for drawablse
  //   this.dispatchEvent(new CustomEvent('multi-verse-removed', { detail: this.multiVerseGroup, bubbles: true, composed: true }));
  //   super.disconnectedCallback();
  // }

  // Note(cg): refresh drawable components for the chart.
  refresh() {
    this.callRegistered('debounceDraw');
  }

  getSize() {
    const svg = this.renderRoot.querySelector('#svg');
    return {
      width: svg && svg.width.baseVal.value,
      height: svg && svg.height.baseVal.value
    };
  }

  onRegister(item) {
    super.onRegister && super.onRegister(item);
    if (this.width && this.height && item.resize) {
      item.resize(this.width, this.height);
    }
  }

  onResize(rect, entry) {
    const { width, height } = this.getSize();
    // Note(cg): if width or height is 0 (as it is the case when char is hiddem -> do nothing).
    if (width && height) {
      // Note(cg): as we cannot use offsetWidth and offsetHeight for svg, we take the value of $0.$.svg.height.baseVal.
      this.width = Math.floor(width - (this.leftMargin || 0) - (this.rightMargin || 0));
      this.height = Math.floor(height - (this.bottomMargin || 0) - (this.topMargin || 0));
      this.callRegistered('resize', this.width, this.height);
    }
  }

  onDrawn() {
    // Note(cg): a container is responsible for notifying resize events to the registered elements.
    this.callRegistered('onDrawn');
  }

  _onScalePosition(e) {
    const position = e.detail.value;
    // Note(cg): construct the scale is axis not existing;.
    if (position && !this[`${position}Axis`]) {
      this[`${position}HasScale`] = true;
    }
  }

  assignSlottedSVG() {
    const nodes = [];
    const treeWalker = (root) => {
      return document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, { acceptNode: function(node) { return NodeFilter.FILTER_ACCEPT; } }, false);
    };

    const assignedNodes = (node) => {
      let n = node;
      while (n.assignedNodes && n.assignedNodes()[0]) {
        n = n.assignedNodes()[0];
      }
      return n;
    };

    const loop = (node) => {
      const walker = treeWalker(node);
      while (walker.nextNode()) {
        const currentNode = walker.currentNode;
        if (currentNode.getAttribute('slot-svg')) {
          // Note(cg): we push slot-svg here.
          nodes.push(currentNode);
        }
        // Note(cg): slotted assigned elements are not catched by try treewalker.
        if (currentNode.localName === 'slot') {
          loop(assignedNodes(currentNode));
        }
      }
    };
    loop(this);

    nodes.forEach(node => {
      const target = node.getAttribute('slot-svg');
      const parent = this.$[target];
      if (parent) {
        const position = node.dataset.multiPosition;
        const appended = [...parent.childNodes].some(n => {
          if (node.dataset.multiPosition >= position) {
            parent.insertBefore(node, n);
            return true;
          }
        });
        if (!appended) {
          parent.appendChild(node);
        }
        // select(this.$[target]).selectAll('>*').sort((a,b) => a.multiPosition - b.multiPosition);
      }
      this.log && console.warn(`cannot dispatch node ${target}`);
    });
    // console.info('NODES', nodes);
  }
}

/**
 * ##  ScaleRender
 *
 * Mixin for rendering scale, depending on their type
 *
 */
const ScaleRender = superClass => {

  return class extends superClass {

    // static get properties() {
    //   return {

    //     ...super.properties,

    //     radius: {
    //       type: Number,
    //     }
    //   };
    // }

    getScaleRender(type, axis) {
      return html$1 `
     <d3-scale 
        .scaleType="${this[`${type}ScaleType`]}" 
        .range="${this.getRange(type)}" 
        .domain="${this[`${type}Domain`]}" 
        .unknown="${this[`${type}Unknown`]}" 
        .padding="${this[`${type}Padding`]}" 
        .paddingOuter="${this[`${type}PaddingOuter`]}" 
        .paddingInner="${this[`${type}PaddingInner`]}" 
        .align="${this[`${type}Align`]}" 

        @scale-changed="${e => {this[`${type}Scale`] = e.detail.value; this.refresh();}}"></d3-scale>`;
    }

    // get radius() {
    //   if (this.width && this.height) {
    //     return Math.min(this.width, this.height) / 2 * this.scaleFactor;
    //   }
    //   return 0;
    // }

    getRange(type) {
      if (type) {
        return type === 'radial' ? [0, Math.min(this.width || 0, this.height) / 2 * this.scaleFactor] :
          type === 'left' || type === 'right' ? [this.height, 0] : [0, this.width];
      }
      return [0, 1];
    }
  };
};

const props$5 = {


  /* 
   * `margin` applied to svg container (not css margin, wich can also be applied as per normal css rules)
   * By default margins are slightly bigger than for simple `multi-container-svg`
   */
  topMargin: { type: Number, attribute: 'top-margin' },
  rightMargin: { type: Number, attribute: 'right-margin' },
  bottomMargin: { type: Number, attribute: 'bottom-margin' },
  leftMargin: { type: Number, attribute: 'left-margin' },

  /* 
   * `topAxis` true to display top axis
   */
  topAxis: {
    type: Boolean,
    attribute: 'top-axis',
    value: false
  },

  /* 
   * `rightAxis` true to display right axis
   */
  rightAxis: {
    type: Boolean,
    attribute: 'right-axis',
    value: false
  },

  /* 
   * `bottomAxis` true to display bottom axis
   */
  bottomAxis: {
    type: Boolean,
    attribute: 'bottom-axis',
    value: false
  },

  /* 
   * `leftAxis` true to display bottom axis
   */
  leftAxis: {
    type: Boolean,
    attribute: 'left-axis',
    value: false
  },


  /* 
   * `topHasScale` true to create top scale
   */
  topHasScale: {
    type: Boolean,
    attribute: 'top-has-scale',
    value: false
  },

  /* 
   * `rightHasScale` true to create right scale
   */
  rightHasScale: {
    type: Boolean,
    attribute: 'right-has-scale',
    value: false
  },
  /* 
   * `bottomHasScale` true to create bottom scale
   */
  bottomHasScale: {
    type: Boolean,
    attribute: 'bottom-has-scale',
    value: false
  },

  /* 
   * `leftHasScale` true to create left scale
   */
  leftHasScale: {
    type: Boolean,
    attribute: 'left-has-scale',
    value: false
  },


  leftTextAngle: {
    type: Number,
    attribute: 'left-axis-angle'
  },

  leftYText: {
    type: Number,
    attribute: 'left-ytext'
  },

  leftDy: {
    type: String,
    attribute: 'left-dy'
  },

  bottomDy: {
    type: String,
    attribute: 'bottom-dy'
  }
};



// Note(cg): setting default values for some properties .
const values$1 = {
  topMargin: 20,
  rightMargin: 20,
  bottomMargin: 20,
  leftMargin: 30,

  leftTextAngle: -90,
  leftYText: 6,
  leftDy: '0.6em',
  bottomDy: '-0.6em'
};

const valueProperties$1 = Object.assign({}, props$5);
Object.keys(values$1).forEach(k => valueProperties$1[k].value = values$1[k]);

class MultiContainerAxis extends ScaleRender(MultiContainer) {

  getContentRender() {
    return html$1 `
      ${super.getContentRender && super.getContentRender()}
      ${this.topHasScale || this.topAxis ? this.getScaleRender('top') : ''}
      ${this.rightHasScale || this.rightAxis ? this.getScaleRender('right') : ''}
      ${this.bottomHasScale || this.bottomAxis ? this.getScaleRender('bottom') : ''}
      ${this.leftHasScale || this.leftAxis ? this.getScaleRender('left') : ''}
      ${this.topAxis ? this.getAxisRender('top') : ''}
      ${this.rightAxis ? this.getAxisRender('right') : ''}
      ${this.bottomAxis ? this.getAxisRender('bottom') : ''}
      ${this.leftAxis ? this.getAxisRender('left') : ''}
    `;
  }

  static get properties() {

    return {

      ...super.properties,

      ...extendProperty('top', D3Axis.properties, D3Scale.properties, axisProps),
      ...extendProperty('right', D3Axis.properties, D3Scale.properties, axisProps),
      ...extendProperty('bottom', D3Axis.properties, D3Scale.properties, axisProps),
      ...extendProperty('left', D3Axis.properties, D3Scale.properties, axisProps),

      ...valueProperties$1,
    };
  }

  getAxis(type) {
    return this.renderRoot.querySelector(`multi-axis[type=${type}]`);
  }

  getAxisRender(type) {
    // const tagName = `d3-axis-${type}`;
    return html$1 `
      <multi-axis 
        type="${type}"
        .decorate="${this[`${type}Decorate`]}"
        .scale="${this[`${type}Scale`]}" 
        .xText="${this[`${type}XText`]}" 
        .yText="${this[`${type}YText`]}" 
        .text="${this[`${type}Text`]}" 
        .dx="${this[`${type}Dx`]}" 
        .dy="${this[`${type}Dy`]}" 
        .textAngle="${this[`${type}TextAngle`]}" 
        .tickSize="${this[`${type}TickSize`]}" 
        .tickPadding="${this[`${type}TickPadding`]}" 
        .ticks="${this[`${type}Ticks`]}" 
        .tickFormat="${this[`${type}TickFormat`]}"         
        .tickArguments="${this[`${type}TickArguments`]}" 
        ></multi-axis>
     `;
  }
}

// import { default as Scale } from '../d3-wrapper/d3-scale.js';
// import { default as Axis } from '../d3-wrapper/d3-axis.js';
// import { extendProperty } from '../helper/extend-property-mixin.js';
// import { valueProperties as axisValueProperties } from './properties/container-axis.js';
// import { default as axisProps } from '../drawable/properties/axis.js';


/**
 * ## MultiContainerRadat
 *
 * A container for radar chart. It is responsible for drawing axes.
 *
 * @element multi-container-radar
 *
 * @prop {Array} axes - array of axis for radar chart. Example {label: 'label', key: 'key', max: max, class: 'class', xOffset, offset, yOffset: offset}
 */
class MultiContainerRadar extends 
  RelayTo(
    ScaleRender(
      MultiContainer)) {

  getContentRender() {
    return html$1 `
      ${super.getContentRender && super.getContentRender()}
      ${this.getAxisRender()}
      ${this.getScaleRender('radial')}
    `;
  }

  static get properties() {

    return {

      ...super.properties,

      ...MultiRadarAxes.properties,

      /*
       * `min` minumum value
       * we need to set it, otherwise will be inferred  frmo data
       */
      min: {
        type: Number,
        value: 0
      },

      /*
       * `valuePosition` position type for values.
       * this is used to calculate scale vor values in `multi-data-group`
       */
      valuePosition: {
        type: String,
        attribute: 'value-position',
        notify: true,
        value: 'radial'
      },
      
      /*
       * `keyPosition` position type for keys.
       * this is used to calculate scale vor values in `multi-data-group`
       */
      keyPosition: {
        type: String,
        attribute: 'key-position',
        notify: true,
        value: 'angle'
      },


    };
  }

  update(props) {
    super.update(props);
    this.relayTo(props, 'radar-axes');
  }
  // Note(cg): only relay properties (to multi-radar-axis) if they are 
  // part of multi-radar-axis properties.
  shallRelayTo(key, name) {
    this.log && console.info(`relaying ${key} to ${name}`);
    return (key in MultiRadarAxes.properties) && name === 'radar-axes';
  }

  getAxisRender() {
    return html$1 `
      <multi-radar-axes id="radar-axes"></multi-radar-axes>
     `;
  }
}

/**
 * ## MultiHighlight
 * 
 *   adds a highlight class on shapes with same keys as `highlightedKeys`
 * 
 * @memberof MultiChart.mixin
 * @polymer
 * @mixinFunction
 */
const MultiHighlight = dedupingMixin(superClass => {

  /*
   * @polymer
   * @mixinClass
   */
  class Mixin extends superClass {

    static get properties() {
      return {

        ...super.properties,

        highlightedKeys: {
          type: Array,
          attribute: 'highlighted-keys'
        },

        highlightedCls: {
          type: String,
          value: 'highlighted',
          attribute: 'highlighted-cls'
        },

        /* 
         * `layerId` id of the layer containing elements to be highlighted.
         */
        layerId: {
          type: String,
          value: 'slot-layer',
          attribute: 'layer-id'
        },

        /* 
         * `highlightAccessor` accessor function to fetch keys to be highlighted
         * default value supposes that we have elements like `<path data-key="tyhKey"></path>`
         */
        highlightAccessor: {
          type: Function,
          attribute: 'highlight-accessor',
          value: function() {
            return function(d) {
              return this.getAttribute('key');
            };
          }
        }
      };
    }

    get highlightedLayer() {
      return this.$[this.layerId];
    }

    updated(props) {
      if(props.has('highlightedKeys')) {
        this._observeHighlightedKeys();
      }
      super.updated(props);
    }

    // static get observers() {
    //   return [
    //     '_observeHighlightedKeys(highlightedKeys, layer)'
    //   ];
    // }

     _observeHighlightedKeys() {

      if (!this.highlightedLayer) {
        console.error('cannot get layer in highlightedKeys');
      }
      
      const {highlightAccessor, highlightedKeys} = this;

      select(this.highlightedLayer).selectAll('.selectable')
        .classed(this.highlightedCls, function(d) {
          return highlightedKeys.indexOf(highlightAccessor.call(this, d)) > -1;
        });

    }
  }

  return Mixin;
});

/**
 * # MultiContainerLayer
 * 
 * `<multi-container-layer>` is a proxy for svg g element. 
 * It will be inserted within `multi-container-svg#slot-chart` and can contain other svg content like geo layer. 
 *
 *
 * ### Events
 * Fired when `multi-container-layer` is attached .
 *
 * @event multi-verse-added
 * @param {string} the name of the curret group.
 *
 * Fired when `multi-container-layer` is removed .
 *
 * @event multi-verse-removed
 * @param {string} the name of the current group.
 *
 *
 *
 * @memberof MultiChart
 * @appliesMixin  MultiChart.mixin.SVGHelper    
 * @appliesMixin  MultiChart.mixin.MultiRegister    
 * @appliesMixin  MultiChart.mixin.MultiRegisterable    
 * @appliesMixin  MultiChart.mixin.DispatchSVG    
 * @appliesMixin  MultiChart.mixin.SVGHelper    
 * @appliesMixin  MultiChart.mixin.Resizable    
 * @appliesMixin MultiChart.mixin.Accessor
 * @appliesMixin  MultiChart.mixin.MultiData    
 * @appliesMixin  MultiChart.mixin.PolymerExtends    
 * @customElement
 * @polymer
 **/
class MultiContainerLayer
// extends Polymer.mixinBehaviors([Polymer.IronResizableBehavior],
extends 
// SVGHelper(
  DispatchSVG(
      CacheId(
        MultiHighlight(
          // MultiData(
            MultiRegister(
              Registerable(
                Base))))) {
render() {
  return html$1 `
    <slot></slot>
    <svg id="svg">
      <g slot-svg="slot-chart" data-multi-position="${this.multiPosition}" id="slot-layer" .class="${this.layer}"></g>
    </svg>
`;
  }

  static get properties() {
    return {

      ...super.properties,

      /**
       * `group` the name of the group (used when to registering this element under a multi-verse)
       */
      group: {
        type: String,
        value: 'default'
      },

      /* 
       * `layer` the name of the layer - is set to g#svg-slot
       */
      layer: {
        type: String
      }


    };
  }


  firstUpdated(props) {
    // Note(cg): chart container might be registered against multi-verse. We nee to notify their creation upwards.
    this.dispatchEvent(new CustomEvent('multi-verse-added', { detail: this.group, bubbles: true, composed: true }));
    super.firstUpdated(props);
  }
  
  // disconnectedCallback() {
  //   // TODO(cg): replace multi-removed -> multi-verse-remover
  //   // XXX(cg): this event will never be caught! unregister from host instead like for drawablse
  //   this.dispatchEvent(new CustomEvent('multi-verse-removed', { detail: this.group, bubbles: true, composed: true }));
  //   super.disconnectedCallback();
  // }

  /* 
   * `dataChanges` relay dataChanged to registeredItems
   */
  dataChanged() {
    this.callRegistered('dataChanged', ...arguments);
  }

  // Note(cg): refresh drawable components for the chart. 
  debounceDraw() {
    this.callRegistered('debounceDraw', ...arguments);
  }

  resize(width, height) {
    super.resize && super.resize();
    this.callRegistered('resize', width, height);
  }
}

// Note(cg): yet to do
//
// - [x] remove loops over groupName
// - [x] remove groupName
// - [x] force creation of scale depending on position (top / bottom / ...)
// - [ ] integrate stack
// - [x] properly bind config: it should be easy to set it from multi-container.
//       easyt to set min max
// - [x] remove config object
// - [x] review axis listeners.

// .

class MultiSerieGroup extends
Registerable(
  MultiRegister(
    defaultValue(
      LitNotify(
        doNotSetUndefinedValue(
          LitElement))))) {

  /*
   * `registerEventDispatch`  the name of the event to be fired when connected.
   * A container with multi-register-mixin applied
   * will listen to this event to register the component.
   *
   * @override Registerable
   */
  get registerEventDispatch() {
    return 'multi-data-group-register';
  }
  
  get registerAtConnected() {
    return true;
  }

  static get properties() {

    return {

      ...super.properties,

      ...props$4,

      log: { type: Boolean },

      /*
       * `data` to display the chart
       */
      data: { type: Array },

      /*
       * `group` the name of the group. default for default group
       */
      group: { type: String },

      /*
       * `_registeredItems` the list of registerd Items under this group.
       */
      _registeredItems: { type: Array },

      /*
       * `series` the series belonging to this serie group
       * `series` the list of data serie registered for this container.
       * We can eiher pass a serie array like [{key: 'apple', label:'apple'}, accessor: d => +d.value.apple}, {key: 'orange', label:'orange'}, accessor: d => +d.value.orange}], 
       *  or use `<multi-serie>` component to register series via markup
       *
       */
      series: {
        type: Array,
        value: []
      },

      /*
       * `processType`  the type of process type, e.g. stack for bar Chart
       */
      processType: {
        type: String,
        attribute: 'process-type'
      },

    };
  }
  
  // connectedCallback() {
  //   super.connectedCallback();
  //   this.dispatchEvent(new CustomEvent(this.registerEventDispatch, { detail: this.group, bubbles: true, composed: true }));
  // }

  updated(props) {
    if (props.has('data') || props.has('series')) {
      this._debouceDataChanged();
    }
    if (props.has('min') || props.has('max')) {
      this.setHostDomain(this.valuePosition, [...this.getDomainMinMax()]);
    }
    if (props.has('stacked')) {
      this._handleStackedChanged();
    }
    super.updated(props);
  }

  _debouceDataChanged() {
    this._debounceDataChanged = Debouncer.debounce(
      this._debounceDataChanged, // initially undefined
      timeOut.after(40),
      () => {
        this._processDataChanged();
      });
  }

  // Note(cg): we need to re-set min-max value domain when stacked changes.
  _handleStackedChanged() {
    this.setHostDomain(this.valuePosition, [0, this.stacked ? this._stackedMax : this._max]);
  }

  _processDataChanged() {
    if (!this.group) {
      throw new Error(`group name has to be set for multi-data-group. `);
    }
    if (Array.isArray(this.data) && this.data.length) {

      let multiData;

      if (this.processType) {
        multiData = this._processByType(this.processType, this.data);
      } else if (this.series && this.series.length) {
        multiData = this._processSeries();
      }

      // Note(cg): processByType and processSeries returns a new array
      // we need to make sure charts will respond to mutation when
      // no series and no processType (e.g. pie).
      this._multiData = multiData || [...this.data];
      this._callDataChanged(this._multiData);
    }

  }

  _processByType(processType, data) {

    if (processType === 'stack') {
      const keyAccessor = this.keyAccessor;

        // Note(cg): series and shaper stack data.
        let tmpMax = -Infinity;
        const _multiData = this.shaper(data).map((data, i) => {
          const ret = data.map(([y0, y1], ii) => {
            if ((y1 - y0) > tmpMax) {
              tmpMax = (y1 - y0);
            }
            // return [y0, y1, i, data[ii].data.__key__];
            return [y0, y1, i, keyAccessor(data[ii].data)];
          });
          ret.index = data.index;
          ret.key = data.key;
          return ret;
        });

        // Note(cg): cache domains to re-use when stacked changes eventually.
        this._max = this.max ? this.max : tmpMax;
        this._stackedMax = this.max ? this.max : max(_multiData[_multiData.length - 1], d => d[1]);

      const valueScale = this.getHostValue(`${this.valuePosition}Scale`);
      const keyScale = this.getHostValue(`${this.keyPosition}Scale`);
      const isContinuous = keyScale.category === 'continuous';
      
      if (this.ordinalScaleInterval) {
        keyScale.interval = this.ordinalScaleInterval;
      }

      this.setHostDomain(this.keyPosition, this.adjustOrdinalDomain(this.getOrdinalDomain(this.data, this.keyAccessor, this.accessor, isContinuous)));
      this.setHostDomain(this.valuePosition, [0, this.stacked ? this._stackedMax : this._max]);

      this.dispatchEvent(new CustomEvent('data-group-rescaled', {
        detail: {
          group: this.group,
          xScale: keyScale,
          yScale: valueScale
          // xAccessor: accessor.key,
          // yAccessor: accessor.value
        },
        bubbles: true,
        composed: true
      }));

      return _multiData;
    }

    if (processType === 'choropleth') {

      const map = new Map();
      const valueAccessor = this.valueAccessor;
      const keyAccessor = this.keyAccessor;
      const valuePosition = this.valuePosition;
      const valueScale = this.getHostValue(`${valuePosition}Scale`);
      
      let min = Infinity;
      let max = -Infinity;

      this.data.forEach(d => {
        const value = valueAccessor(d);
        map.set(keyAccessor(d), value);
        if (value < min) {
          min = value;
        }
        if (value > max) {
          max = value;
        }
      });

      const domain = this.getDomainMinMax([min, max]);
      if (valueScale) {
        valueScale.domain(domain);
      }
      this.setValueDomain(domain);

      this.dispatchEvent(new CustomEvent('data-group-rescaled', {
        detail: {
          group: this.group,
          colorScale: valueScale,
          colorDomain: domain,
        },
        bubbles: true,
        composed: true
      }));

      // this._mapProcessed = true;
      this.choroplethMap = map;
      return map;

    }
    throw new Error(`Trying to process data throught an unknown type (${processType})`);
  }

  _processSeries() {
    // Note(cg): we transform serie data differently for charts that expect stacked data or not.
    const keyAccessor = this.keyAccessor;

    // Note(cg): series, no stack.

    const valueDomain = [Infinity, -Infinity];
    const _multiData = this.series.map((serie, i) => {
      if (!serie.key) {
        this.log && console.warn('serie is missing a key', serie);
        serie.key = i;
      }
      const data = this.data.map((d, i) => {
        return {
          key: keyAccessor(d, i),
          value: serie.accessor(d, i)
        };
      });
      const ext = extent(data, d => d.value);
      if (ext[0] < valueDomain[0]) { valueDomain[0] = ext[0]; }
      if (ext[1] > valueDomain[1]) { valueDomain[1] = ext[1]; }
      return { key: serie.key, label: serie.label || serie.key, group: this.group, data: data };
    });
    if (valueDomain[0] === Infinity || valueDomain[1] === -Infinity) {
      throw new Error('problem while computing value domain');
    }
    const ordinalDomain = this.getOrdinalDomain(this.data, keyAccessor);
    // const cfg = this.serieConfig[name];
    const valuePosition = this.valuePosition;
    const keyPosition = this.keyPosition;
    const valueScale = this.getHostValue(`${valuePosition}Scale`);
    const keyScale = this.getHostValue(`${keyPosition}Scale`);

    // Note(cg): resset domains.
    this.setHostDomain(valuePosition, this.getDomainMinMax(valueDomain));
    this.setHostDomain(keyPosition, ordinalDomain);

    this.dispatchEvent(new CustomEvent('data-group-rescaled', {
      detail: {
        group: this.group,
        xScale: keyScale,
        yScale: valueScale,
        xAccessor: key,
        yAccessor: value
      },
      bubbles: true,
      composed: true
    }));

    return _multiData;
  }

  getDomainMinMax(domain) {
    const host = this.getRootNode().host; // Note(cg): this will be chart container.
    const position = this.valuePosition;
    domain = domain || host[`${position}Domain`];

    if (!domain) {
      console.warn('domain not yet instantiated');
      return [];
    }

    const { min, max } = this;
    if (min || min === 0) {
      domain[0] = min;
    }
    if (max || max === 0) {
      domain[1] = max;
    }
    return domain;
  }

  getHostValue(name) {
    return this.getRootNode().host[name];
  }

  setValueDomain(domain) {
    this.setHostDomain(this.valuePosition, domain);
  }

  setHostDomain(position, domain) {
    const host = this.getRootNode().host; // Note(cg): this will be chart container.
    host[`${position}Domain`] = domain;
  }

  // Note(cg): called by container while registering item.
  onRegister(item) {
    if (item.dataProcessType && !this.processType) {
      this.processType = item.dataProcessType;
    }
    if (this._multiData && item.dataChanged) {
      item.dataChanged(this._multiData, this.transition);
    }
  }

  /*
   * `shallNotify` should return true to actually render the component
   */
  shallNotify(data) {
    return !!data;
  }

  _callDataChanged() {
    // XXX(cg): we need to apply dataChanged to registeredItems of the same group 
    // as this multi-data-group.
    if (this.shallNotify(this._multiData)) {
      this.callRegistered('dataChanged', this._multiData, this.transition);
    }
  }

  getOrdinalDomain(data, keyAccessor, valueAccessor, continuous) {
    // Note(cg): for continuous scales (e.g. timeseries), domain is [min, max].
    let map = [];
    if (keyAccessor) {
      data.forEach((d, i) => {
        d.__key__ = keyAccessor(d, i);
        if (valueAccessor) {
          d.__value__ = valueAccessor(d, i);
        }
        map.push(d.__key__);
      });
    } else {
      map = range(data.length);

    }
    if (continuous) {
      map = [map[0], map[map.length - 1]];
    }
    return map;
  }
}

/**
 * ## MultiChartPie
 *
 *
 * @element multi-chart-pie
 * 
 **/
class MultiChartPie extends MultiContainer {
    
    getContentRender() {
    
      return html$1`
        <multi-drawable-pie 
          .log="${this.log}"
          .decorate="${this.decorate}"
          .transition="${this.transition}" 
          .value="${this.value}" 
          .valuePath="${this.valuePath}" 
          .padAngle="${this.padAngle}" 
          .sort="${this.sort}" 
          .sortValues="${this.sortValues}" 
          .innerRadius="${this.innerRadius}" 
          .outerRadius="${this.outerRadius}" 
          .cornerRadius="${this.cornerRadius}" 
          .pieWidth="${this.pieWidth}" 
          .colorScale="${this.colorScale}"
        ></multi-drawable-pie>
    `;
  }


  static get properties() {
    return {

      ...super.properties,

      ...Pie.properties,

      ...Arc.properties,


      valuePath: {
        type: String,
        attribute: 'value-path'
      },

      /**
       * `pieWidth` a way to indicate the width of the radius (either in % or absolute value). 
       * If set, inner radius will be inferred.
       */
      pieWidth: {
        type: String,
        attribute: 'pie-width'
      }

    };
  }
}

/**
 * ## MultiChartLine
 *
 * `<multi-chart-line>` an element for displaying data as a line chart.
 *
 * ### Example
 *
 * ```html
 *    <multi-chart-line
 *        id="chart"
 *        color-scale="[[colorScale]]"
 *        data="[[data]]"
 *        left-tick-format="[[leftTickFormat]]">
 *      <dom-repeat items="{{keys}}">
 *        <template>
 *         <!-- set the series inthe markup. We can also pass a series object directly to the chart. -->
 *         <multi-serie key="[[item.key]]" label="[[item.label]]" accessor="{{item.accessor}}"></multi-serie>
 *         <!-- we need a accessor for y-scale -->
 *         <multi-accessor accessor="{{item.accessor}}" path="+value.[[item.key]]"></multi-accessor>
 *        </template>
 *      </dom-repeat>
 *    </multi-chart-line>
 * ```

 **/
class MultiChartLine extends MultiContainerAxis {

  getContentRender() {
    return html$1`
      ${super.getContentRender()}
      <multi-drawable-line 
         id="drawable"
         .decorate="${this.decorate}"
         .log="${this.log}"
         .colorScale="${this.colorScale}"
         .x="${this.x}"
         .y="${this.y}"
      ></multi-drawable-line>
    `;
  }

  constructor() {
    super();
    this.addEventListener('data-group-rescaled', this.onDataGroupRescaled);
  }

  onDataGroupRescaled(e) {
    this.log && console.log('data-group-rescaled', e);
    this.x = this.getAccessor(e.detail.xScale, e.detail.xAccessor);
    this.y = this.getAccessor(e.detail.yScale, e.detail.yAccessor);
  }

  static get properties() {
    return {
      ...super.properties,

      ...Line.properties,

      bottomScaleType: {
        type: String,
        value: 'point'
      }
    };
  }

}

var minMax = {
  
  /* 
   * `min` min value for the domain
   */
  min: {
    type: Object,
    notify: true
  },

  /* 
   * `min` min value for the domain
   */
  max: {
    type: Object,
    notify: true
  }

  
};

/**
 * ## MultiChartLine
 *
 * `<multi-chart-line>` an element for displaying data as a line chart. 
 * 
 * ### Example
 *
 * ```html
 *    <multi-chart-line 
 *        id="chart"  
 *        color-scale="[[colorScale]]"
 *        data="[[data]]"
 *        left-tick-format="[[leftTickFormat]]">
 *      <dom-repeat items="{{keys}}">
 *        <template>
 *         <!-- set the series inthe markup. We can also pass a series object directly to the chart. -->
 *         <multi-serie key="[[item.key]]" label="[[item.label]]" accessor="{{item.accessor}}"></multi-serie>
 *         <!-- we need a accessor for y-scale -->
 *         <multi-accessor accessor="{{item.accessor}}" path="+value.[[item.key]]"></multi-accessor>
 *        </template>
 *      </dom-repeat>
 *    </multi-chart-line>   
 * ```

 **/

const zProperties = { ...extendProperty('z', D3Scale.properties, MultiAccessor.properties, minMax)};
  
class MultiChartLine$1 extends MultiContainerAxis {
  
  getContentRender() {
    return html$1`
     ${super.getContentRender()}
      <d3-scale 
        id="zScale"
        .scaleType="${this.zScaleType}"
        .domain="${this.zDomain}"
        .range="${this.zRange}"
        @scale-changed="${e => this.zScale = e.detail.value}"
      ></d3-scale>
      <multi-accessor 
        .path="${this.zPath}"
        @accessor-changed="${e => this.zAccessor = e.detail.value}" 
     ></multi-accessor>
      <multi-drawable-bubble 
         id="drawable"
         .decorate="${this.decorate}"
         .log="${this.log}"
         .colorScale="${this.colorScale}"
         .x="${this.x}"
         .y="${this.y}"
         .z="${this.getAccessor(this.zScale, this.zAccessor)}"
      ></multi-drawable-bubble>
    `
  }

  constructor() {
    super();
    this.addEventListener('data-group-rescaled', this.onDataGroupRescaled);
  }

  onDataGroupRescaled(e) {
    this.x = this.getAccessor(e.detail.xScale, e.detail.xAccessor) ;
    this.y = this.getAccessor(e.detail.yScale, e.detail.yAccessor) ;
  }

  // updated(props) {
  //   super.updated(props)
  //   if((props.has('zScale') && this.zScale) || props.has('zAccessor') && this.zAccessor) {
  //     this.z = this.getAccessor(this.zScale, this.zAccessor) ;
  //   }
  // }

  static get properties() {
    return {
      ...super.properties,

      ...Line.properties,

      ...zProperties,

      zScaleType: {
        type: String, 
        value: 'sqrt'
      },

      zScale: {
        type: Function
      },

      bottomScaleType: {
        type: String,
        value: 'point'
      }
    };
  }

}

/**
 * ## MultiChartBar
 *
 * `<multi-chart-line>` an element for displaying data as a line chart. 
 * 
 * ### Example (Polymer)
 *
 * ```html
 *    <multi-chart-bar 
 *        color-scale="[[colorScale]]"
 *        data="[[data]]"
 *        left-tick-format="[[leftTickFormat]]">
 *      <dom-repeat items="{{keys}}">
 *        <template>
 *         <!-- set the series inthe markup. We can also pass a series object directly to the chart. -->
 *         <multi-serie key="[[item.key]]" label="[[item.label]]" accessor="{{item.accessor}}"></multi-serie>
 *         <!-- we need a accessor for y-scale -->
 *         <multi-accessor accessor="{{item.accessor}}" path="+value.[[item.key]]"></multi-accessor>
 *        </template>
 *      </dom-repeat>
 *    </multi-chart-bar>   
 * ```
 *
 * @element multi-chart-bar

 **/
class MultiChartBar extends MultiContainerAxis {
  
  getContentRender() {
    return html$1`
      ${super.getContentRender()}
      ${this.orientation === 'horizontal' 
        ? html$1 `
            <multi-drawable-bar-horizontal 
               id="drawable"
               .log="${this.log}"
               .decorate="${this.decorate}"
               .colorScale="${this.colorScale}"
               .colorSerie="${this.colorSerie}"
               .value="${this.value}" 
               .valuePath="${this.valuePath}" 
               .keys="${this.keys}" 
               .order="${this.order}" 
               .offset="${this.offset}" 
               .stacked="${this.stacked}"
               .orientation="${this.orientation}"
               .xScale="${this.yScale}"
               .yScale="${this.xScale}"
            ></multi-drawable-bar-horizontal>
           `
        : html$1 `
            <multi-drawable-bar 
               id="drawable"
               .log="${this.log}"
               .decorate="${this.decorate}"
               .colorScale="${this.colorScale}"
               .colorSerie="${this.colorSerie}"
               .value="${this.value}" 
               .valuePath="${this.valuePath}" 
               .keys="${this.keys}" 
               .order="${this.order}" 
               .offset="${this.offset}" 
               .stacked="${this.stacked}"
               .orientation="${this.orientation}"
               .xScale="${this.xScale}"
               .yScale="${this.yScale}"
            ></multi-drawable-bar>
           `
    }
    `;
  }

  constructor() {
    super();
    this.addEventListener('data-group-rescaled', this.onDataGroupRescaled);
  }

  onDataGroupRescaled(e) {
    this.log && console.log('data-group-rescaled for Bar', e);
    this.xScale = e.detail.xScale;
    this.yScale = e.detail.yScale;
  }

  updated(props) {
    if (props.has('keyPosition')) {
      // Note(cg): we set scaletype for key scale to band by default 
      // if none is set
      if (this.keyPosition && !this[`${this.keyPosition}ScaleType`]) {
        this[`${this.keyPosition}ScaleType`] = 'band';
      }
    }
    super.updated(props);
  }

  static get properties() {
    return {

      ...super.properties,

      ...Stack.properties,

      /*
       * `stacked` if true, draw a stack chart, otherwise, default bar chart
       */
      stacked: {
        type: Boolean
      },
      /*
       * `valuePath` we can pass a value path to calculate value accessor
       */
      valuePath: {
        type: String,
        attribute: 'value-path'
      },
      /*
       * `orientation` {'vertical'|'horizontal'}
       */
      orientation: {
        value: 'vertical',
        type: String
      },
    };
  }

}

/**
 * ## Radar Chart
 * A radar chart is a graphical method of displaying multivariate data in the form of a two-dimensional chart of three or more quantitative variables represented on axes starting from the same point. The relative position and angle of the axes is typically uninformative, but various heuristics, such as algorithms that plot data as the maximal total area, can be applied to sort the variables (axes) into relative positions that reveal distinct correlations, trade-offs, and a multitude of other comparative measures.
 *
 * @element multi-chart-radar
 */
class MultiChartRadar extends MultiContainerRadar {

  getContentRender() {

    return html$1 `
       ${super.getContentRender()}
       <multi-drawable-radar 
         id="drawable"
         .decorate="${this.decorate}"
         .log="${this.log}"
         .colorScale="${this.colorScale}"
         .angle="${this.angle}"
         .radius="${this.radius}"
         .curve="${curveCardinalClosed.tension(this.tension)}"
      ></multi-drawable-radar>
    `;
  }


  static get properties() {
    return {

      ...super.properties,

      ...LineRadial.properties,

      /*
       * `tension` tension for [curveCardinalClosed](https://github.com/d3/d3-shape#curveCardinalClosed)
       * value between 0 an 1.
       */
      tension: {
        type: Number,
        value: 0.6
      }
    };
  }

  constructor() {
    super();
    this.addEventListener('data-group-rescaled', this.onDataGroupRescaled);
  }
 
  onDataGroupRescaled(e) {
    this.log && console.log('data-group-rescaled', e);
    const angleScale = linear$1().domain([0, this.axes.length]).range([0, 2 * Math.PI]);
    this.angle = this.getAccessor(angleScale, e.detail.xAccessor);
    this.radius = this.getAccessor(e.detail.yScale, e.detail.yAccessor);
  }
}

// import * as format from 'd3-format';
// import * as time from 'd3-time-format';

/**
 * ## d3-format
 *
 *  A lit-element wrapper around [d3-format](https://github.com/d3/d3-format).
 *  d3-format helps format numbers for human consumption. See also https://observablehq.com/@d3/d3-format.
 
 * ### Example
 * `<d3-format specifier=".1f" value="12.2135"></d3-format>` will display `12.2`.
 *
 * ### Examples from [d3-format](https://github.com/d3/d3-format)
 * ```js
 * d3.format(".0%")(0.123);  // rounded percentage, "12%"
 * d3.format("($.2f")(-3.5); // localized fixed-point currency, "(£3.50)"
 * d3.format("+20")(42);     // space-filled and signed, "                 +42"
 * d3.format(".^20")(42);    // dot-filled and centered, ".........42........."
 * d3.format(".2s")(42e6);   // SI-prefix with two significant digits, "42M"
 * d3.format("#x")(48879);   // prefixed lowercase hexadecimal, "0xbeef"
 * d3.format(",.2r")(4223);  // grouped thousands with two significant digits, "4,200"
 * ```
 *
 * @element d3-format
 **/
class D3Format extends
defaultValue(
  doNotSetUndefinedValue(
    Format(
      LitElement))) {

  render() {
    return html$1 `${this.value !== undefined && this.value !== '' ? this._format(this.isTime ? new Date(this.value) : this.value) : ''}`;
  }

  static get properties() {
    return {

      /*
       * the value to be formated
       */
      value: {
        type: String
      }

    };
  }
}

function responseBlob(response) {
  if (!response.ok) throw new Error(response.status + " " + response.statusText);
  return response.blob();
}

function blob(input, init) {
  return fetch(input, init).then(responseBlob);
}

function responseArrayBuffer(response) {
  if (!response.ok) throw new Error(response.status + " " + response.statusText);
  return response.arrayBuffer();
}

function buffer(input, init) {
  return fetch(input, init).then(responseArrayBuffer);
}

var EOL = {},
    EOF = {},
    QUOTE = 34,
    NEWLINE = 10,
    RETURN = 13;

function objectConverter(columns) {
  return new Function("d", "return {" + columns.map(function(name, i) {
    return JSON.stringify(name) + ": d[" + i + "] || \"\"";
  }).join(",") + "}");
}

function customConverter(columns, f) {
  var object = objectConverter(columns);
  return function(row, i) {
    return f(object(row), i, columns);
  };
}

// Compute unique columns in order of discovery.
function inferColumns(rows) {
  var columnSet = Object.create(null),
      columns = [];

  rows.forEach(function(row) {
    for (var column in row) {
      if (!(column in columnSet)) {
        columns.push(columnSet[column] = column);
      }
    }
  });

  return columns;
}

function pad$1(value, width) {
  var s = value + "", length = s.length;
  return length < width ? new Array(width - length + 1).join(0) + s : s;
}

function formatYear$1(year) {
  return year < 0 ? "-" + pad$1(-year, 6)
    : year > 9999 ? "+" + pad$1(year, 6)
    : pad$1(year, 4);
}

function formatDate(date) {
  var hours = date.getUTCHours(),
      minutes = date.getUTCMinutes(),
      seconds = date.getUTCSeconds(),
      milliseconds = date.getUTCMilliseconds();
  return isNaN(date) ? "Invalid Date"
      : formatYear$1(date.getUTCFullYear()) + "-" + pad$1(date.getUTCMonth() + 1, 2) + "-" + pad$1(date.getUTCDate(), 2)
      + (milliseconds ? "T" + pad$1(hours, 2) + ":" + pad$1(minutes, 2) + ":" + pad$1(seconds, 2) + "." + pad$1(milliseconds, 3) + "Z"
      : seconds ? "T" + pad$1(hours, 2) + ":" + pad$1(minutes, 2) + ":" + pad$1(seconds, 2) + "Z"
      : minutes || hours ? "T" + pad$1(hours, 2) + ":" + pad$1(minutes, 2) + "Z"
      : "");
}

function dsvFormat(delimiter) {
  var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
      DELIMITER = delimiter.charCodeAt(0);

  function parse(text, f) {
    var convert, columns, rows = parseRows(text, function(row, i) {
      if (convert) return convert(row, i - 1);
      columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
    });
    rows.columns = columns || [];
    return rows;
  }

  function parseRows(text, f) {
    var rows = [], // output rows
        N = text.length,
        I = 0, // current character index
        n = 0, // current line number
        t, // current token
        eof = N <= 0, // current token followed by EOF?
        eol = false; // current token followed by EOL?

    // Strip the trailing newline.
    if (text.charCodeAt(N - 1) === NEWLINE) --N;
    if (text.charCodeAt(N - 1) === RETURN) --N;

    function token() {
      if (eof) return EOF;
      if (eol) return eol = false, EOL;

      // Unescape quotes.
      var i, j = I, c;
      if (text.charCodeAt(j) === QUOTE) {
        while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
        if ((i = I) >= N) eof = true;
        else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
        else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
        return text.slice(j + 1, i - 1).replace(/""/g, "\"");
      }

      // Find next delimiter or newline.
      while (I < N) {
        if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
        else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
        else if (c !== DELIMITER) continue;
        return text.slice(j, i);
      }

      // Return last token before EOF.
      return eof = true, text.slice(j, N);
    }

    while ((t = token()) !== EOF) {
      var row = [];
      while (t !== EOL && t !== EOF) row.push(t), t = token();
      if (f && (row = f(row, n++)) == null) continue;
      rows.push(row);
    }

    return rows;
  }

  function preformatBody(rows, columns) {
    return rows.map(function(row) {
      return columns.map(function(column) {
        return formatValue(row[column]);
      }).join(delimiter);
    });
  }

  function format(rows, columns) {
    if (columns == null) columns = inferColumns(rows);
    return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
  }

  function formatBody(rows, columns) {
    if (columns == null) columns = inferColumns(rows);
    return preformatBody(rows, columns).join("\n");
  }

  function formatRows(rows) {
    return rows.map(formatRow).join("\n");
  }

  function formatRow(row) {
    return row.map(formatValue).join(delimiter);
  }

  function formatValue(value) {
    return value == null ? ""
        : value instanceof Date ? formatDate(value)
        : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
        : value;
  }

  return {
    parse: parse,
    parseRows: parseRows,
    format: format,
    formatBody: formatBody,
    formatRows: formatRows,
    formatRow: formatRow,
    formatValue: formatValue
  };
}

var csv = dsvFormat(",");

var csvParse = csv.parse;

var tsv = dsvFormat("\t");

var tsvParse = tsv.parse;

function responseText(response) {
  if (!response.ok) throw new Error(response.status + " " + response.statusText);
  return response.text();
}

function text(input, init) {
  return fetch(input, init).then(responseText);
}

function dsvParse(parse) {
  return function(input, init, row) {
    if (arguments.length === 2 && typeof init === "function") row = init, init = undefined;
    return text(input, init).then(function(response) {
      return parse(response, row);
    });
  };
}

function dsv(delimiter, input, init, row) {
  if (arguments.length === 3 && typeof init === "function") row = init, init = undefined;
  var format = dsvFormat(delimiter);
  return text(input, init).then(function(response) {
    return format.parse(response, row);
  });
}

var csv$1 = dsvParse(csvParse);
var tsv$1 = dsvParse(tsvParse);

function image(input, init) {
  return new Promise(function(resolve, reject) {
    var image = new Image;
    for (var key in init) image[key] = init[key];
    image.onerror = reject;
    image.onload = function() { resolve(image); };
    image.src = input;
  });
}

function responseJson(response) {
  if (!response.ok) throw new Error(response.status + " " + response.statusText);
  if (response.status === 204 || response.status === 205) return;
  return response.json();
}

function json(input, init) {
  return fetch(input, init).then(responseJson);
}

function parser(type) {
  return (input, init) => text(input, init)
    .then(text => (new DOMParser).parseFromString(text, type));
}

var xml = parser("application/xml");

var html = parser("text/html");

var svg = parser("image/svg+xml");

var fetch$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  blob: blob,
  buffer: buffer,
  dsv: dsv,
  csv: csv$1,
  tsv: tsv$1,
  image: image,
  json: json,
  text: text,
  xml: xml,
  html: html,
  svg: svg
});

/**
 * ## d3-fetch
 *
 * A wrapper aroud [d3-fetch](https://github.com/d3/d3-fetch), a module providing convenient parsing on top of [Fetch](https://fetch.spec.whatwg.org/).
 *
 * @fires loading-changed - Event fired when loading property changes
 * @fires data-changed - Event fired when data is set
 * @fires error-changed - Event fired when there is an error
 * @element d3-fetch
 */
class Fetch extends MultiNotify {

  static get properties() {

    return {

      /*
       * expected data type
       * @type {'blob'|'buffer'|'csv'|'dsv'|'html'|'image'|'json'|'svg'|'text'|'tsv'|'xml'}
       */
      type: {
        type: String
      },

      /*
       * the url to fetch data from
       */
      url: {
        type: String
      },

      /*
       * `loading` true when loading
       */
      loading: {
        type: Boolean,
        value: false,
        notify: true
      },

      /*
       * `data` fetched data
       */
      data: {
        type: Array,
        notify: true,
        attribute: false
      },

      /*
       * `error`
       */
      error: {
        type: Object,
        notify: true
      }
    };
  }

  update(props) {
    this.log && console.info(`d3-fetch ${this.type} update`, props);
    if (!this.type && !props.has('type')) {
      this.type = 'json';
    }

    if (!this.fetcher || props.has('type')) {
      this.fetcher = fetch$1[this.type];
    }

    if (props.has('url')) {
      if (this.url) {
        this.loading = true;
        this.fetcher(this.url)
          .then(data => {
            this.loading = false;
            this.error = null;
            this.data = data;
          })
          .catch(error => {
            this.log && console.error(error);
            this.loading = false;
            this.error = error;
            this.data = null;
          });
      } else {
        this.error = null;
        this.data = null;
      }
    }
    super.update(props);
  }
}

class MultiSerie extends
Registerable(
  defaultValue(
    doNotSetUndefinedValue(
      LitElement))) {

  /*
   * `registerEventDispatch`  the name of the event to be fired when connected.
   * A container with multi-register-mixin applied
   * will listen to this event to register the component.
   *
   * @override Registerable
   */
  get registerEventDispatch() {
    return 'multi-serie-register';
  }

  render() {
    return html$1 `
        ${this.path ? this.getPathRender() : ''}
        ${this.keyPath ? this.getKeyPathRender() : ''}
      `;
  }
  getPathRender() {
    return html$1 `
       <multi-accessor 
        @accessor-changed="${e => this.accessor = e.detail.value}"
        path="${this.path}" 
        ></multi-accessor>
    `;
  }
  getKeyPathRender() {
    return html$1 `
       <multi-accessor 
        @accessor-changed="${e => this.keyAccessor = e.detail.value}"
        path="${this.keyPath}" 
        ></multi-accessor>
    `;
  }


  static get properties() {

    return {

      ...super.properties,

      /*
       * `key` the key used for this data serie
       */
      key: { type: String },


      /*
       * `label` a label describing the serie
       */
      label: { type: String },

      /**
       * `path` the path from which the value accessor function is built
       * For instance `+value.count` will create `d => {return +d.value.count}` function.
       */
      path: { type: String, reflect: true },

      subPath: { type: Boolean },

      /*
       * `accessor` the accessor function for transforming data.
       */
      accessor: {
        type: Function
      },

      /**
       * `keyPath` the path from which the key accessor function is built
       * For instance `key` will create `d => {return d.key}` function.
       */
      keyPath: {
        type: String,
        attribute: 'key-path'
      },

      /*
       * `keyAccessor` the accessor function for accessiong key.
       * Data will be reshaped as  `[{key: key, label: label, value: data.map(d=>accessor(d))}]
       */
      keyAccessor: {
        type: Function,
        attribute: 'key-accessor'
      },

      /*
       * `group` name of the group against which this serie is registered
       */
      group: { type: String }
    };
  }
}

/**
 * ##  TrackHover
 * 
 * track which element is being hovered
 * 
 * @memberof MultiChart.mixin
 * @polymer
 * @mixinFunction
 */
const TrackHover = dedupingMixin(superClass => {

  return class extends superClass {

    static get properties() {
      return {

        ...super.properties,

        /* 
         * `trackHover` set true if selector listen to mouseenter/mouseleave events and set hoveredItem accordingly. 
         * When true, this element also and fires `multi-mouseenter` and multi-mouseleave. 
         */
        trackHover: {
          type: Boolean,
          value: false,
          attribute: 'track-hover'
        },

        /* 
         * `hovered` the hovered item, tracked when `trackHover` is set to true. 
         * This is usefull for instance when we want to highlight the legend being hovered
         */
        hovered: {
          type: String,
          notify: true,
        },
      };
    }

    /* 
     * `attachListeners` listen to click, mouseenter and mouseleave and 
     * fires their respective `multi` events (`multi-tap`, `multi-mouse-enter` and `multi-mouse-leave`)
     */
    attachListeners(sel) {
      const me = this;
      if (this.trackHover) {
        sel
          .on('mouseenter', function(d, i) { me.onMouseenter(d, i, this); })
          .on('mouseleave', function(d, i) { me.onMouseleave(d, i, this); });
      }
    }

    detatchListeners(sel) {
      sel
        .on('mouseenter', null)
        .on('mouseleave', null);
    }

    onMouseenter(d, i, el) {
      this.hovered = this.getKey(d, el);
      this.dispatchEvent(new CustomEvent('multi-mouseenter', { detail: { data: d, index: i, element: el }, bubbles: true, composed: true }));
    }

    onMouseleave(d, i, el) {
      this.hovered = null;
      this.dispatchEvent(new CustomEvent('multi-mouseleave', { detail: { data: d, index: i, element: el }, bubbles: true, composed: true }));
    }

    getKey(d) {
      return d.data ? d.data.key : d.key ? d.key : d;
    }

    updated(props) {
      if (props.has('hovered')) {
        this._observerHovered(this.hovered);
      }
      super.updated(props);
    }

    /* 
     * `_observerHoveredItem` add `.hovered` class to all items with same key as hovered
     */
    _observerHovered(hovered) {
      if (this.svgHost) {
        const me = this;
        select(this.svgHost).attr('is-hovered', hovered ? true : null);
        select(this.svgHost.renderRoot).selectAll('.selectable, .cell')
          .attr('hovered', function(d) {
            return me.getKey(d, this) === hovered ? true : null;
          });
      }
    }
  };
});

/**
 * ## MultiLegend
 *
 * `<multi-legend>` a element for displaying chart legends
 * Relying on [d3-legend](https://d3-legend.susielu.com/), A library to make legends in svg-land easy as pie.
 *
 * @element multi-legend
 *
 * @cssprop --multi-legend-color -  text color for legends (#292929)
 * @cssprop --multi-legend-background -  background color for legenx box (`#efefef`)
 * @cssprop --multi-legend-stroke -  stroke color for legend box
 * @cssprop --multi-legend-opacity -  opacity for legend box  (`0.6`)
 *
 * @fires width-changed - Event fired when width changes
 * @fires height-changed - Event fired when height changes
 *
 **/
class MultiLegend extends
DispatchSVG(
  TrackHover(
    RelayTo(
      CacheId(
        Registerable(
          MultiChartBase))))) {

  // Note(cg): style to add to svghost while dispatching SVG.
  static get hostStyles() {
    return css `

    #legend.legend .legendCells {
      fill: var(--multi-legend-color, #292929);
    }

    #legend .legendTitle {
      transform: translate(0px,12px);
    }

    #legendRect {
      pointer-events: none;
      fill: var(--multi-legend-background, #efefef);
      stroke: var(--multi-legend-stroke, none);
      opacity: var(--multi-legend-opacity, 0.6);
    }`;
  }

  render() {
    return html$1 `

    <d3-legend
      id="d3-legend"
      @legend-changed="${e => this.setLegend(e.detail.value)}"
     ></d3-legend>

    <svg>
      <rect id="legendRect" opacity="${this._opacity}"  slot-svg="slot-legend" class="legend-rect"></rect>
      <g id="legend" part="legend" opacity="${this._opacity}" slot-svg="slot-legend" transform="translate(${this._x || 0},${this._y || 0})scale(${this.scaleFactor || 1})" class="legend"></g>
    </svg>
`;
  }


  static get properties() {
    return {

      ...super.properties,

      ...D3Legend.properties,

      /**
       * legend `type` the type of legend 
       * @type {'color'|'size'|'symbol'}
       * for instantiating the legend ([d3-legend](http://d3-legend.susielu.com/).
       */
      type: {
        type: String,
        value: 'color'
      },

      /**
       * legend width
       */
      width: {
        type: Number,
        notify: true
      },

      /**
       * legend height
       */
      height: {
        type: Number,
        notify: true
      },

      /**
       * opacity used to hide legend before its size is 
       * computed 
       */
      _opacity: {
        type: Number,
        value: 0
      },

      /*
       * `retOffset` the offset for legend rect
       */
      rectOffset: {
        type: Number,
        attribute: 'rect-offset',
        value: 5
      },

      /**
       * factor between 0 to 1 to help make legend smaller
       */
      scaleFactor: {
        type: Number,
        attribute: 'scale-factor',
        value: 0.7
      },

      /**
       * `position` this position within the chart. e.g. top-right, bottom-left
       * position is recalculated on resize.
       */
      position: {
        type: String,
        value: 'top-right'
      },

      /**
       * `padding` the padding to be applied when calculation the position
       */
      padding: {
        type: Number,
        value: 10
      },

      /**
       * x position
       */
      _x: {
        type: Number,
        value: 0
      },

      /**
       * y position
       */
      _y: {
        type: Number,
        value: 0
      },

    };
  }

  /**
   * From RelayTo mixin, used to automatically relay properties to child components
   */
  shallRelayTo(key, name) {
    if (name === 'd3-legend') {
      return D3Legend.properties[key];
    }
  }

  update(props) {
    this.relayTo(props, 'd3-legend');
    super.update(props);
  }

  updated(props) {
    if (props.has('position')) {
      this.debounceDraw();
    }
    super.updated(props);
  }

  resize() {
    this.debounceDraw();
  }

  debounceDraw() {
    this._debounceDraw = Debouncer.debounce(
      this._debounceDraw, // initially undefined
      timeOut.after(10),
      () => {
        this.draw(this._shaped);
        // this._isDrawn = true;
      });
  }

  dataChanged() {
    this.debounceDraw();
  }

  draw() {
    setTimeout(() => {
      // Note(cg): async as we need to make sure legend is drawn before we can calculate real size and adjust position.
      select(this.$.legend).call(this.legend);
      setTimeout(() => { this.setPosition(); }, 60);
    }, 50);
    // if (!this._isDrawn) {
    // } else {
    //   setTimeout(() => { this.setPosition(); }, 60);
    // }
  }

  setLegend(legend) {
    if (legend) {
      legend.on('cellclick', d => {
        this.dispatchEvent(new CustomEvent('multi-cell-click', { detail: d, bubbles: true, composed: true }));
      });
      legend.on('cellover', d => { this.hovered = d; });
      legend.on('cellout', d => { this.hovered = null; });
      this.legend = legend;
      this.debounceDraw();
    }
  }

  setPosition() {

    const legendEl = this.$.legend;
    const size = legendEl.getBoundingClientRect();
    //if (!size.width || !size.height || !this.svgHost) {
    if (!size.width || !size.height) {
      return;
    }

    const position = this.position;
    const isRight = ~position.indexOf('right');
    const isBottom = ~position.indexOf('bottom');

    const chartSize = legendEl.ownerSVGElement.getBoundingClientRect();

    this._y = this.rectOffset + this.padding;
    this._x = this.rectOffset + this.padding;

    if (isRight) {
      // console.info('SIZE: ', size,chartWidth, padding )
      this._x = chartSize.width - size.width - this.padding + this.rectOffset;
    }


    if (isBottom) {
      this._y = chartSize.height - size.height - this.padding + this.rectOffset;
    }
    this._isDrawn = true;
    this._opacity = 1;
    select(this.$.legendRect)
      .attr('transform', `translate(${this._x - this.rectOffset}, ${this._y - this.rectOffset})`)
      .attr('width', size.width + 2 * this.rectOffset)
      .attr('height', size.height + 2 * this.rectOffset - 3);

    this.width = size.width;
    this.height = size.height;
  }
}

const properties = {
  /**
   * Gets or sets the selected element. The default is to use the index of the
   * item.
   * @type {string|number}
   */
  selected: { type: String, notify: true },

  /**
   * Returns the currently selected item.
   *
   * @type {?Object}
   */
  selectedItem: { type: Object, notify: true },

  /**
   * If true, multiple selections are allowed.
   */
  multi: { type: Boolean, value: false },

  /**
   * Gets or sets the selected elements. This is used instead of `selected`
   * when `multi` is true.
   */
  selectedValues: {
    type: Array,
    attribute: 'selected-values',
    notify: true,
    value: []
  },

  /**
   * Returns an array of currently selected items.
   */
  selectedItems: {
    type: Array,
    attribute: 'selected-items',
    notify: true,
    value: []
  },

  /* 
   * `selecType` for charts that can implement brush and select at the same time (e.g. bar), set 'brush' to acticate brush. 
   * Otherwise, default behavior is 'select'
   */
  selectType: {
    attribute: 'select-type',
    type: String,
    value: ''
  }

};

/**
 * ## MultiSelect
 *
 * `<multi-select>` is an element for selecting ranges or chart shapes. 
 *  
 *
 * @memberof MultiChart
 * @customElement
 * @polymer
 * @appliesMixin MultiChart.mixin.DispatchSVG
 * @appliesMixin MultiChart.mixin.MultiRegisterable
 * @appliesMixin MultiChart.mixin.TrackHover
 * @demo
 **/
class MultiSelect extends
DispatchSVG(
  Registerable(
    TrackHover(
      MultiChartBase))) {

  // Note(cg): style to add to svghost while dispatching SVG.
  static get hostStyles() {
    return css `
      .selectable {
        cursor: pointer;
      }
      
      :host([has-selection]) .selectable {
        opacity: 0.7;
      }

      :host([has-selection]) [selected] {
        opacity: 1;
      }

      :host([is-hovered]) rect, :host([is-hovered]) .selectable
      {
        opacity: 0.7;
      }    

      :host([is-hovered]) [hovered] rect,  :host([is-hovered]) .selectable[hovered] {
        opacity: 1;
      }    

    `
  }

  static get properties() {
    return {

      ...super.properties,

      ...properties,

      /**
       * If you want to use an attribute value or property of an element for
       * `selected` instead of the index, set this to the name of the attribute
       * or property. Hyphenated values are converted to camel case when used to
       * look up the property of a selectable element. Camel cased values are
       * *not* converted to hyphenated values for attribute lookup. It's
       * recommended that you provide the hyphenated form of the name so that
       * selection works in both cases. (Use `attr-or-property-name` instead of
       * `attrOrPropertyName`.)
       */
      attrForSelected: {
        type: String,
        attribute: 'attr-for-selected',
        value: 'key'
      },


      /**
       * The attribute to set on elements when selected.
       */
      selectedAttribute: {
        type: String,
        attribute: 'selected-attribute',
        value: 'selected'
      }
    };
  }
  /* 
   * `registerOrder` - registerable elements are sorted on the basis of this property. 
   * `multi-select` need to be last in the list of registered items, so that we attach 
   * events after all shapes are drawn.
   */
  get registerOrder() {
    return 100;
  }

  update(props) {
    if (props.has('selectedValues')) {
      this.updateSelectedValues();
    }
    if (props.has('selected')) {
      this.updateSelected();
    }
    super.update(props);
  }

  dataChanged() {
    this.attachListeners();
  }

  onDrawn() {
    this.attachListeners();
    this.reSelect();
  }

  reSelect() {
    if (this.multi) {
      this.updateSelectedValues(true);
    } else {
      this.updateSelected(true);
    }

    // if (this.selectedItems.length) {
    //   this.selectedItems.forEach(item => this.select(item));
    // } else if (this.selected) {
    //   const s = this.selected;
    //   this.select(null);
    //   this.select(s);
    // }

  }

  postRemove() {
    this.detatchListeners();
  }

  /* 
   * `attachListeners` listen to click, mouseenter and mouseleave and 
   * fires their respective `multi` events (`multi-tap`, `multi-mouse-enter` and `multi-mouse-leave`)
   */
  attachListeners() {
    const me = this;
    const sel = this.selectableItems
      .on('click', function(d, i) { me.onClick(d, i, this); });

    // attach Listeners in TrackHover
    if (super.attachListeners) {
      super.attachListeners(sel);
    }
  }

  detatchListeners() {
    const sel = this.selectableItems.on('click', null);

    // detatch Listeners in TrackHover
    if (super.detatchListeners) {
      super.detatchListeners(sel);
    }
  }

  getKey(d, el) {
    const keyHolder = this.attrForSelected;
    return d.data ? d.data[keyHolder] : d[keyHolder] || d.__key__ || el.getAttribute(keyHolder) || el.dataset[keyHolder] || d;
  }

  onClick(d, i, el) {
    // handle selection 
    const key = this.getKey(d, el);
    if (!key) {
      this._error(`unable to fetch key`);
    }
    if (!this.multi && key === this.selected) {
      this.select(null);
    } else {
      this.select(key);
    }
    // let the world know we have a multi-tap event.
    this.dispatchEvent(new CustomEvent('multi-tap', { detail: { data: d, index: i, element: el }, bubbles: true, composed: true }));
  }

  select(value) {
    if (this.multi) {
      let wasSelected = false;
      const selectedValues = this.selectedValues.filter(val => {
        if (val === value) {
          wasSelected = true;
          return false
        }
        return true
      });
      if (!wasSelected) {
        selectedValues.push(value);
      }
      this.selectedValues = selectedValues;
      return;
    }
    this.selected = value;
  }

  get selectableItems() {
    return this.svgHost && select(this.svgHost.renderRoot).selectAll('.selectable') || selectAll();
  }

  updateSelected(silent) {
    const selected = this.selected;
    const me = this;
    let item = null;
    this.selectableItems.attr(this.selectedAttribute, function(d, i) {
      if (me.getKey(d, this) === selected) {
        item = this;
        return true;
      }
      return null;
    });
    this.selectedItem = item;
    this._updateSelected(silent);
  }

  updateSelectedValues(silent) {
    const selected = this.selectedValues;
    const me = this;
    const items = [];
    this.selectableItems.attr(this.selectedAttribute, function(d, i) {
      if (selected.indexOf(me.getKey(d, this)) > -1) {
        items.push(this);
        return true;
      }
      return null;
    });
    this.selectedItems = items;
    this._updateSelected(silent);
  }

  get _hasSelection() {
    return this.multi ? this.selectedValues && this.selectedValues.length : !!this.selected;
  }
  /* 
   * `_updateSelected` will set `has-selection` attribute to svgHost. 
   * This is used in multi-container-svg css rules.
   */
  _updateSelected(silent) {
    if (this.svgHost) {
      select(this.svgHost).attr('has-selection', this._hasSelection ? true : null);
    }
    // Note(cg): use multi select event to potentially inform multi-verse elementes that we have a selection
    // this should not happen when we relesect onDraw (infinite loop otherwise.)
    if (!silent) {
      this.dispatchEvent(new CustomEvent('multi-select', {
        detail: {
          isRange: false,
          selection: this.multi ? [...this.selectedValues] : this.selected
        },
        bubbles: true,
        composed: true
      }));
    }
  }
}

/**
 * ## MultiBrush
 *
 * `<multi-brush>` implements a brush selection as in  [d3-brush](https://github.com/d3/d3-brush)
 *
 * @element multi-brush
 * @fires selected-values-changed - Event fired when selectedValues changes
 * @fires is-range-changed - Event fired when isRange changes
 * @fires has-selection-changed - Event fired when selection changes
 * 
 **/
class MultiBrush extends
DispatchSVG(
  Registerable(
    CacheId(
      RelayTo(
        MultiChartBase)))) {

  // Note(cg): style to add to svghost while dispatching SVG.
  static get hostStyles() {
    return css `
      #brush rect.extent {
        fill: steelblue;
        fill-opacity: .125;
      }

      #brush .resize path {
        fill: #eee;
        stroke: #666;
      }
    `;
  }
  render() {
    return html$1 `
    <d3-brush
      id="d3-brush"
      @brush-changed="${e => this.setBrush(e.detail.value)}"
     ></d3-legend>

    <svg>
      <g id="brush" slot-svg="slot-brush" class="selector brush">
      </g>
    </svg>
`;
  }


  static get properties() {

    return {


      ...super.properties,

      ...D3Brush.properties,


      /**
       * Returns an array of currently selected items.
       */
      selectedValues: {
        type: Array,
        notify: true,
        value: []
      },

      xScale: { type: Function, },

      yScale: { type: Function, },


      /**
       * `brush` brushing for mouse or touch event implementation [d3-brush](https://github.com/d3/d3-brush) 
       */
      brush: { type: Function, },

      /**
       * extent of the brush  as per https://github.com/d3/d3-brush#brush_extent
       */
      extent: { type: Array },

      /**
       * `isSelection` is true when a selection is being done (e.g. by brushing). The attribute is used for css rules.
       * This property is aimed at being bound to a multi-container-svg
       */
      isSelecting: {
        type: Boolean,
        value: false
      },

      /**
       * `hasSelection`  is true when a selection exists. The attribute is used for css rules.
       * This property is aimed at being bound to a multi-container-svg
       */
      hasSelection: {
        type: Boolean,
        notify: true
      },

      /**
       * true when brush is implemented with a range scale
       * @type {Object}
       */
      isRange: {
        type: Boolean,
        notify: true,
      },
      /**
       * `xContinuous` indicate true if we have a `continuous` scale on X when the xScale is `ordinal` (e.g. a scaleBand for bar charts). If true a `xContinuousScale` is computed
       */
      xContinuous: {
        type: Boolean,
        attribute: 'x-continuous'
      },

      /**
       * `xContinuousScale` the continuous scale to use when selecting ranges 
       */
      xContinuousScale: {
        type: Function,
        value: function() {
          return linear$1();
        }
      },
    };
  }

  /**
   * From RelayTo mixin, used to automatically relay properties to child components
   */
  shallRelayTo(key, name) {
    if (name === 'd3-brush') {
      return D3Brush.properties[key];
    }
  }

  update(props) {
    super.update(props);
    this.relayTo(props, 'd3-brush');
    if (props.has('isSelecting')) {
      this.reflectToHost('isSelecting');
    }
    if (props.has('hasSelection')) {
      this.reflectToHost('hasSelection');
    }
    if (props.has('selectedValues')) {
      this._observeSelectedValues();
    }


  }

  _observeSelectedValues() {
    this._debounceSelect = Debouncer.debounce(
      this._debounceSelect, // initially undefined
      microTask,
      () => {
        this.log && console.log('brush selection', this.selectedValues);
        this.dispatchEvent(new CustomEvent('multi-select', {
          detail: {
            isRange: this.isRange,
            selection: this.selectedValues
          },
          bubbles: true,
          composed: true
        }));
      });
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.extent = [
      [0, 0],
      [this.width, this.height]
    ];
  }

  get targetElement() {
    return this.$.brush;
  }

  reflectToHost(name) {
    if (this.svgHost) {
      select(this.svgHost).attr(camelToDashCase(name), this[name] ? true : null);
    }
  }

  clearSelection() {
    // this.brush.move(null);
    if (this.brush && this.brush.move) {
      select(this.targetElement).call(this.brush.move, null);
    }
    this.selectedValues = [];
  }

  setBrush(brush) {
    if (brush) {
      var me = this;

      brush
        .on('start', function() {
          me.onMultiBrushStart();
        })
        .on('end', function() {
          me.onMultiBrushEnd();
        })
        .on('brush', function() {
          me.onMultiBrush();
        });
      select(this.targetElement).call(brush);
    } else {
      select(this.targetElement).selectAll('*').remove();
    }
  }

  onMultiBrush() {
    if (this._clearing) {
      return;
    }
    const selection = brushSelection(this.targetElement);

    if (!selection) {
      return this.clearSelection();
    }

    let scale = this.effectiveScale;

    const xScale = this.xScale;
    let sel;

    if (scale = scale.x) {
      sel = scale.y ? selection[0] : selection;
      if (scale.invert) {
        // isRange = true;
        this.isRange = true;
        sel = sel.map(scale.invert);
        // console.info('SEL', sel);
        if (this.selectedValues[0] !== sel[0] || this.selectedValues[1] !== sel[1]) {
          // only call the splice when needed 
          this.selectedValues = [sel[0], sel[1]];
        }
      } else {
        sel = xScale.domain().filter(function(d) {
          return sel[0] <= (d = xScale(d)) && d <= sel[1];
        });
        if (this.selectedValues.length !== sel.length || this.selectedValues[0] !== sel[0] || this.selectedValues[1] !== sel[1]) {
          // only call the splice when needed 
          this.selectedValues = [...sel];
          // this.splice.apply(this, ['selectedValues', 0, this.selectedValues.length + 1].concat(sel));
        }
      }
    }
  }

  onMultiBrushStart() {
    this._refreshContiunousScale(this.xScale);
    // this.effectiveScale = this._getEffectiveScale();
    this.isSelecting = true;
  }

  onMultiBrushEnd() {
    if (brushSelection(this.targetElement) && !this._clearing) {
      this._clearing = true;
      this.clearSelection();
    }

    delete this._clearing;
    this.isSelecting = false;
  }

  _refreshContiunousScale(scale) {
    if (scale) {
      if (scale && !scale.invert && this.xContinuous) {
        var range = scale.range();
        if (scale.bandwidth) {
          // it is a scaleBand; we need to re-adjust the range taking bandWIdth and padding into account (see https://github.com/d3/d3-scale#band-scales)
          var step = scale.step();
          range = [range[0] + step / 2, range[1] - step / 2];
        }
        this.__xContinuous = this.xContinuousScale.domain(extent(scale.domain())).range(range);
      } else {
        this.__xContinuous = null;
      }
    }
  }

  get effectiveScale() {
    return {
      x: (this.brushType === 'brushY') ? null : this.__xContinuous || this.xScale,
      y: (this.brushType === 'brushX') ? null : this.__yContinuous || this.yScale,
    };
  }
}

const define$2 = (name, cls) => {
  if (customElements.get(name)) {
    return console.warn(`custom element ${name} has already been registered`);
  }
  customElements.define(name, cls);
};

const d3 = 'd3';
const multi = 'multi';

define$2(`${d3}-axis`, D3Axis);

define$2(`${d3}-legend`, D3Legend);

define$2(`${d3}-shape-line`, Line);

define$2(`${d3}-shape-line-radial`, LineRadial);

define$2(`${multi}-accessor`, MultiAccessor);

define$2(`${multi}-chart-bubble`, MultiChartLine$1);

define$2(`${multi}-container`, MultiContainer);

define$2(`${multi}-drawable-bubble`, MultiDrawableBubble);

define$2(`${multi}-legend`, MultiLegend);

define$2(`${d3}-brush`, D3Brush);

define$2(`${d3}-scale`, D3Scale);

define$2(`${d3}-shape-pie`, Pie);

define$2(`${multi}-axis`, MultiAxis);

define$2(`${multi}-radar-axes`, MultiRadarAxes);

define$2(`${multi}-drawable-radar`, MultiDrawableRadar);

define$2(`${multi}-chart-line`, MultiChartLine);

define$2(`${multi}-chart-radar`, MultiChartRadar);

define$2(`${multi}-container-layer`, MultiContainerLayer);

define$2(`${multi}-drawable-line`, MultiDrawableLine);

define$2(`${multi}-select`, MultiSelect);

define$2(`${d3}-fetch`, Fetch);

define$2(`${d3}-shape-arc`, Arc);

define$2(`${d3}-shape-stack`, Stack);

define$2(`${multi}-brush`, MultiBrush);

define$2(`${multi}-chart-pie`, MultiChartPie);

define$2(`${multi}-data-group`, MultiSerieGroup);

define$2(`${multi}-drawable-line-path`, MultiDrawableLinePath);

define$2(`${multi}-serie`, MultiSerie);

define$2(`${d3}-format`, D3Format);

define$2(`${d3}-shape-area`, Area);

define$2(`${d3}-transition`, Transition);

define$2(`${multi}-chart-bar`, MultiChartBar);

define$2(`${multi}-container-axis`, MultiContainerAxis);

define$2(`${multi}-container-radar`, MultiContainerRadar);

define$2(`${multi}-drawable-bar`, MultiDrawableBar);

define$2(`${multi}-drawable-bar-horizontal`, MultiDrawableBarHorizontal);

define$2(`${multi}-drawable-pie`, MultiDrawablePie);

export { Fetch as A, MultiAccessor as B, MultiSerie as C, DispatchSVG as D, ExtendProperty as E, Format as F, MultiLegend as G, MultiSelect as H, MultiBrush as I, fitTo as J, capitalize as K, camelToDashCase as L, MultiRegister as M, dashToCamelCase as N, shapeProperties as O, wrap as P, Registerable as R, Transition as T, D3Axis as a, D3Scale as b, D3Legend as c, define$2 as d, D3Brush as e, MultiAxis as f, MultiRadarAxes as g, MultiDrawableRadar as h, MultiDrawablePie as i, MultiDrawableLine as j, MultiDrawableLinePath as k, MultiDrawableBubble as l, MultiDrawableBar as m, MultiDrawableBarHorizontal as n, MultiDrawable as o, MultiContainer as p, MultiContainerAxis as q, MultiContainerRadar as r, MultiContainerLayer as s, MultiSerieGroup as t, MultiChartPie as u, MultiChartLine as v, MultiChartLine$1 as w, MultiChartBar as x, MultiChartRadar as y, D3Format as z };
