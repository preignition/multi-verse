import { d as directive } from '../common/directive-651fd9cf.js';
import { h as html$2, n as nothing, A as AttributePart, E as EventPart, N as NodePart, B as BooleanAttributePart, P as PropertyPart } from '../common/lit-html-f57783b7.js';
import { LitElement, css, query, property, customElement, internalProperty, eventOptions, queryAsync, UpdatingElement } from '../lit-element.js';
import { d as defaultValue, a as doNotSetUndefinedValue } from '../common/defaultValueMixin-cb2ff445.js';
import { unsafeHTML } from '../lit-html/directives/unsafe-html.js';
import { p as purify$1, m as marked_1, E as EnableTranslation } from '../common/resizable-mixin-496c6a25.js';
import { __extends, __assign, __decorate, __values, __read } from '../tslib.js';
import { styleMap } from '../lit-html/directives/style-map.js';
import { cache } from '../lit-html/directives/cache.js';

var cfg = {
  ADD_ATTR: [
    'target',
    'width',
    'height',
    'videoid', /* lite-youtube */
    'playlabel', /* lite-youtube */
    'params', /* lite-youtube */
    'term', /* pwi-form-tooltip */
    'message', /* pwi-tooltip */
    'position', /* pwi-tooltip */
    'tipwidth', /* pwi-tooltip */
    ],
  ADD_TAGS: [
  'lite-youtube',
  'pwi-tooltip',
  'pwi-form-tooltip',
  'mwc-icon'
  ]
};

/**
 * safely parse markdown and render to lit-element template
 * @param  {String} markdown markdown string
 * @return {TemplateResult}          lit-element template result
 */
var parse = (markdown, config = cfg) => {
  if (!markdown) {
    return html$2`
      ${nothing}
    `;
  }

  return html$2`
    ${unsafeHTML(purify$1.sanitize(marked_1(markdown), config))}
  `;
};

/**
 * safely parse markdown and render to lit-element template
 * @param  {String} markdown markdown string
 * @return {TemplateResult}          lit-element template result
 */
var parseInline = (markdown, config = cfg) => {
  if (!markdown) {
    return html$2`
      ${nothing}
    `;
  }

  return html$2`
    ${unsafeHTML(purify$1.sanitize(marked_1.parseInline(markdown), config))}
  `;
};

class GridCellFlag extends LitElement {

  static get styles() {
    return css `
     :host {
        display: block;
        text-align: center;
        margin: 0 17px;
      }
    `
  }
  render() {
    return html$2 `
      ${this.flags.map(item => html$2 `<iron-icon icon="flag"></iron-icon>`)}
    `;
  }

  static get properties() {
    return {
      /*
       * `flags` flags to repeat
       */
      flags: {
        type: Array,
      },
    }
  }
}

// Register the new element with the browser.
customElements.define('grid-cell-flag', GridCellFlag);

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

class GridCellNumber extends
defaultValue(
  doNotSetUndefinedValue(
    LitElement)) {

  static get styles() {
    return css `
     :host {
      display: block;
      text-align: center;
      margin: 0 12px;
    }

    :host(.dark) {
      color: var(--primary-background-color);
    }

    `;
  }
  
  render() {
    if (this.backgroundScaleColor) {
      this.style['background-color'] = this.backgroundScaleColor(this.value * 1);
    }
    if (this.scaleColor) {
      this.style['color'] = this.scaleColor(this.value * 1);
    }
    return html$2 ` 
      <span>${this.formatValue(this.value, this.format)}<span>
    `;
  }

  static get properties() {
    return {
      /*
       * `value` value to display
       */
      value: {
        type: String
      },


      /*
       * `scale` d3.scale
       */
      scale: {
        type: Function,
        value: function() {
          return x => x * 1;
        }
      },

      scaleColor: {
        type: Function,
        // value: () => {
        //   // Note(cg): app is no more global in ESM.
        //   const app = document.querySelector('#app');
        //   return scaleLinear().domain([0, 0.5, 1]).range([app.themeColors['--paper-red-400'], app.themeColors['--paper-orange-400'], app.themeColors['--paper-green-400']]);
        // }
      },

      backgroundScaleColor: {
        type: Function
      },

      /*
       * `format` value to be sent to d3.format
       */
      format: {
        type: String
      }
    };
  }

  formatValue(value, stringFormat = '.0f') {
    if (value || value === 0) {
      return format(stringFormat)(this.scale(value));
    }
    return '';
  }
}

// Register the new element with the browser.
customElements.define('grid-cell-number', GridCellNumber);

class GridCellStatus extends LitElement {

  static get styles() {
    return css `
     :host {
      display: block;
      color: var(--cell-color, var(--paper-grey-400));
    }

     .online {
      color: var(--cell-online-color, var(--paper-green-400));
    }

     .idle {
      color: var(--cell-idle-color, var(--paper-orange-400));
    }
    `
  }
  render() {
    return html$2 ` 
      <span class="${this.value}">${this.computeValue(this.value)}<span>
    `;
  }

  static get properties() {
    return {
      /*
       * `value` value to display
       */
      value: {
        type: String
      }
    }
  }

  computeValue(d) {
    if (!d ||(Object(d) === d)) {
      return '';
    }
    var star = d === 'online' ? '★' : d === 'idle' ? '☆' : '';
    var value = d === 'signedout' ? 'signed-out' : d;
    return star + ' ' + value;
  }
}

// Register the new element with the browser.
customElements.define('grid-cell-status', GridCellStatus);

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const previousValues = new WeakMap();
/**
 * For AttributeParts, sets the attribute if the value is defined and removes
 * the attribute if the value is undefined.
 *
 * For other part types, this directive is a no-op.
 */
const ifDefined = directive((value) => (part) => {
    const previousValue = previousValues.get(part);
    if (value === undefined && part instanceof AttributePart) {
        // If the value is undefined, remove the attribute, but only if the value
        // was previously defined.
        if (previousValue !== undefined || !previousValues.has(part)) {
            const name = part.committer.name;
            part.committer.element.removeAttribute(name);
        }
    }
    else if (value !== previousValue) {
        part.setValue(value);
    }
    previousValues.set(part, value);
});

/**
 * @license
 * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Checks binding values against live DOM values, instead of previously bound
 * values, when determining whether to update the value.
 *
 * This is useful for cases where the DOM value may change from outside of
 * lit-html, such as with a binding to an `<input>` element's `value` property,
 * a content editable elements text, or to a custom element that changes it's
 * own properties or attributes.
 *
 * In these cases if the DOM value changes, but the value set through lit-html
 * bindings hasn't, lit-html won't know to update the DOM value and will leave
 * it alone. If this is not what you want—if you want to overwrite the DOM
 * value with the bound value no matter what—use the `live()` directive:
 *
 *     html`<input .value=${live(x)}>`
 *
 * `live()` performs a strict equality check agains the live DOM value, and if
 * the new value is equal to the live value, does nothing. This means that
 * `live()` should not be used when the binding will cause a type conversion. If
 * you use `live()` with an attribute binding, make sure that only strings are
 * passed in, or the binding will update every render.
 */
const live = directive((value) => (part) => {
    let previousValue;
    if (part instanceof EventPart || part instanceof NodePart) {
        throw new Error('The `live` directive is not allowed on text or event bindings');
    }
    if (part instanceof BooleanAttributePart) {
        checkStrings(part.strings);
        previousValue = part.element.hasAttribute(part.name);
        // This is a hack needed because BooleanAttributePart doesn't have a
        // committer and does its own dirty checking after directives
        part.value = previousValue;
    }
    else {
        const { element, name, strings } = part.committer;
        checkStrings(strings);
        if (part instanceof PropertyPart) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            previousValue = element[name];
            if (previousValue === value) {
                return;
            }
        }
        else if (part instanceof AttributePart) {
            previousValue = element.getAttribute(name);
        }
        if (previousValue === String(value)) {
            return;
        }
    }
    part.setValue(value);
});
const checkStrings = (strings) => {
    if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
        throw new Error('`live` bindings can only contain a single expression');
    }
};

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// IE11 doesn't support classList on SVG elements, so we emulate it with a Set
class ClassList {
    constructor(element) {
        this.classes = new Set();
        this.changed = false;
        this.element = element;
        const classList = (element.getAttribute('class') || '').split(/\s+/);
        for (const cls of classList) {
            this.classes.add(cls);
        }
    }
    add(cls) {
        this.classes.add(cls);
        this.changed = true;
    }
    remove(cls) {
        this.classes.delete(cls);
        this.changed = true;
    }
    commit() {
        if (this.changed) {
            let classString = '';
            this.classes.forEach((cls) => classString += cls + ' ');
            this.element.setAttribute('class', classString);
        }
    }
}
/**
 * Stores the ClassInfo object applied to a given AttributePart.
 * Used to unset existing values when a new ClassInfo object is applied.
 */
const previousClassesCache = new WeakMap();
/**
 * A directive that applies CSS classes. This must be used in the `class`
 * attribute and must be the only part used in the attribute. It takes each
 * property in the `classInfo` argument and adds the property name to the
 * element's `class` if the property value is truthy; if the property value is
 * falsey, the property name is removed from the element's `class`. For example
 * `{foo: bar}` applies the class `foo` if the value of `bar` is truthy.
 * @param classInfo {ClassInfo}
 */
const classMap = directive((classInfo) => (part) => {
    if (!(part instanceof AttributePart) || (part instanceof PropertyPart) ||
        part.committer.name !== 'class' || part.committer.parts.length > 1) {
        throw new Error('The `classMap` directive must be used in the `class` attribute ' +
            'and must be the only part in the attribute.');
    }
    const { committer } = part;
    const { element } = committer;
    let previousClasses = previousClassesCache.get(part);
    if (previousClasses === undefined) {
        // Write static classes once
        // Use setAttribute() because className isn't a string on SVG elements
        element.setAttribute('class', committer.strings.join(' '));
        previousClassesCache.set(part, previousClasses = new Set());
    }
    const classList = (element.classList || new ClassList(element));
    // Remove old classes that no longer apply
    // We use forEach() instead of for-of so that re don't require down-level
    // iteration.
    previousClasses.forEach((name) => {
        if (!(name in classInfo)) {
            classList.remove(name);
            previousClasses.delete(name);
        }
    });
    // Add or remove classes based on their classMap value
    for (const name in classInfo) {
        const value = classInfo[name];
        if (value != previousClasses.has(name)) {
            // We explicitly want a loose truthy check of `value` because it seems
            // more convenient that '' and 0 are skipped.
            if (value) {
                classList.add(name);
                previousClasses.add(name);
            }
            else {
                classList.remove(name);
                previousClasses.delete(name);
            }
        }
    }
    if (typeof classList.commit === 'function') {
        classList.commit();
    }
});

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
function matches(element, selector) {
    var nativeMatches = element.matches
        || element.webkitMatchesSelector
        || element.msMatchesSelector;
    return nativeMatches.call(element, selector);
}

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/**
 * Determines whether a node is an element.
 *
 * @param node Node to check
 */
const isNodeElement = (node) => {
    return node.nodeType === Node.ELEMENT_NODE;
};
function findAssignedElement(slot, selector) {
    for (const node of slot.assignedNodes({ flatten: true })) {
        if (isNodeElement(node)) {
            const el = node;
            if (matches(el, selector)) {
                return el;
            }
        }
    }
    return null;
}
function addHasRemoveClass(element) {
    return {
        addClass: (className) => {
            element.classList.add(className);
        },
        removeClass: (className) => {
            element.classList.remove(className);
        },
        hasClass: (className) => element.classList.contains(className),
    };
}
let supportsPassive = false;
const fn = () => { };
const optionsBlock = {
    get passive() {
        supportsPassive = true;
        return false;
    }
};
document.addEventListener('x', fn, optionsBlock);
document.removeEventListener('x', fn);
/**
 * Do event listeners suport the `passive` option?
 */
const supportsPassiveEventListener = supportsPassive;
const deepActiveElementPath = (doc = window.document) => {
    let activeElement = doc.activeElement;
    const path = [];
    if (!activeElement) {
        return path;
    }
    while (activeElement) {
        path.push(activeElement);
        if (activeElement.shadowRoot) {
            activeElement = activeElement.shadowRoot.activeElement;
        }
        else {
            break;
        }
    }
    return path;
};
const doesElementContainFocus = (element) => {
    const activePath = deepActiveElementPath();
    if (!activePath.length) {
        return false;
    }
    const deepActiveElement = activePath[activePath.length - 1];
    const focusEv = new Event('check-if-focused', { bubbles: true, composed: true });
    let composedPath = [];
    const listener = (ev) => {
        composedPath = ev.composedPath();
    };
    document.body.addEventListener('check-if-focused', listener);
    deepActiveElement.dispatchEvent(focusEv);
    document.body.removeEventListener('check-if-focused', listener);
    return composedPath.indexOf(element) !== -1;
};

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/** @soyCompatible */
class BaseElement extends LitElement {
    click() {
        if (this.mdcRoot) {
            this.mdcRoot.focus();
            this.mdcRoot.click();
            return;
        }
        super.click();
    }
    /**
     * Create and attach the MDC Foundation to the instance
     */
    createFoundation() {
        if (this.mdcFoundation !== undefined) {
            this.mdcFoundation.destroy();
        }
        if (this.mdcFoundationClass) {
            this.mdcFoundation = new this.mdcFoundationClass(this.createAdapter());
            this.mdcFoundation.init();
        }
    }
    firstUpdated() {
        this.createFoundation();
    }
}

/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCFoundation = /** @class */ (function () {
    function MDCFoundation(adapter) {
        if (adapter === void 0) { adapter = {}; }
        this.adapter = adapter;
    }
    Object.defineProperty(MDCFoundation, "cssClasses", {
        get: function () {
            // Classes extending MDCFoundation should implement this method to return an object which exports every
            // CSS class the foundation class needs as a property. e.g. {ACTIVE: 'mdc-component--active'}
            return {};
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCFoundation, "strings", {
        get: function () {
            // Classes extending MDCFoundation should implement this method to return an object which exports all
            // semantic strings as constants. e.g. {ARIA_ROLE: 'tablist'}
            return {};
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCFoundation, "numbers", {
        get: function () {
            // Classes extending MDCFoundation should implement this method to return an object which exports all
            // of its semantic numbers as constants. e.g. {ANIMATION_DELAY_MS: 350}
            return {};
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCFoundation, "defaultAdapter", {
        get: function () {
            // Classes extending MDCFoundation may choose to implement this getter in order to provide a convenient
            // way of viewing the necessary methods of an adapter. In the future, this could also be used for adapter
            // validation.
            return {};
        },
        enumerable: true,
        configurable: true
    });
    MDCFoundation.prototype.init = function () {
        // Subclasses should override this method to perform initialization routines (registering events, etc.)
    };
    MDCFoundation.prototype.destroy = function () {
        // Subclasses should override this method to perform de-initialization routines (de-registering events, etc.)
    };
    return MDCFoundation;
}());

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var strings = {
    NOTCH_ELEMENT_SELECTOR: '.mdc-notched-outline__notch',
};
var numbers = {
    // This should stay in sync with $mdc-notched-outline-padding * 2.
    NOTCH_ELEMENT_PADDING: 8,
};
var cssClasses = {
    NO_LABEL: 'mdc-notched-outline--no-label',
    OUTLINE_NOTCHED: 'mdc-notched-outline--notched',
    OUTLINE_UPGRADED: 'mdc-notched-outline--upgraded',
};

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCNotchedOutlineFoundation = /** @class */ (function (_super) {
    __extends(MDCNotchedOutlineFoundation, _super);
    function MDCNotchedOutlineFoundation(adapter) {
        return _super.call(this, __assign(__assign({}, MDCNotchedOutlineFoundation.defaultAdapter), adapter)) || this;
    }
    Object.defineProperty(MDCNotchedOutlineFoundation, "strings", {
        get: function () {
            return strings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCNotchedOutlineFoundation, "cssClasses", {
        get: function () {
            return cssClasses;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCNotchedOutlineFoundation, "numbers", {
        get: function () {
            return numbers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCNotchedOutlineFoundation, "defaultAdapter", {
        /**
         * See {@link MDCNotchedOutlineAdapter} for typing information on parameters and return types.
         */
        get: function () {
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            return {
                addClass: function () { return undefined; },
                removeClass: function () { return undefined; },
                setNotchWidthProperty: function () { return undefined; },
                removeNotchWidthProperty: function () { return undefined; },
            };
            // tslint:enable:object-literal-sort-keys
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds the outline notched selector and updates the notch width calculated based off of notchWidth.
     */
    MDCNotchedOutlineFoundation.prototype.notch = function (notchWidth) {
        var OUTLINE_NOTCHED = MDCNotchedOutlineFoundation.cssClasses.OUTLINE_NOTCHED;
        if (notchWidth > 0) {
            notchWidth += numbers.NOTCH_ELEMENT_PADDING; // Add padding from left/right.
        }
        this.adapter.setNotchWidthProperty(notchWidth);
        this.adapter.addClass(OUTLINE_NOTCHED);
    };
    /**
     * Removes notched outline selector to close the notch in the outline.
     */
    MDCNotchedOutlineFoundation.prototype.closeNotch = function () {
        var OUTLINE_NOTCHED = MDCNotchedOutlineFoundation.cssClasses.OUTLINE_NOTCHED;
        this.adapter.removeClass(OUTLINE_NOTCHED);
        this.adapter.removeNotchWidthProperty();
    };
    return MDCNotchedOutlineFoundation;
}(MDCFoundation));

class NotchedOutlineBase extends BaseElement {
    constructor() {
        super(...arguments);
        this.mdcFoundationClass = MDCNotchedOutlineFoundation;
        this.width = 0;
        this.open = false;
        this.lastOpen = this.open;
    }
    createAdapter() {
        return {
            addClass: (className) => this.mdcRoot.classList.add(className),
            removeClass: (className) => this.mdcRoot.classList.remove(className),
            setNotchWidthProperty: (width) => this.notchElement.style.setProperty('width', `${width}px`),
            removeNotchWidthProperty: () => this.notchElement.style.removeProperty('width'),
        };
    }
    openOrClose(shouldOpen, width) {
        if (!this.mdcFoundation) {
            return;
        }
        if (shouldOpen && width !== undefined) {
            this.mdcFoundation.notch(width);
        }
        else {
            this.mdcFoundation.closeNotch();
        }
    }
    render() {
        this.openOrClose(this.open, this.width);
        const classes = classMap({
            'mdc-notched-outline--notched': this.open,
        });
        return html$2 `
      <span class="mdc-notched-outline ${classes}">
        <span class="mdc-notched-outline__leading"></span>
        <span class="mdc-notched-outline__notch">
          <slot></slot>
        </span>
        <span class="mdc-notched-outline__trailing"></span>
      </span>`;
    }
}
__decorate([
    query('.mdc-notched-outline')
], NotchedOutlineBase.prototype, "mdcRoot", void 0);
__decorate([
    property({ type: Number })
], NotchedOutlineBase.prototype, "width", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], NotchedOutlineBase.prototype, "open", void 0);
__decorate([
    query('.mdc-notched-outline__notch')
], NotchedOutlineBase.prototype, "notchElement", void 0);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style = css `.mdc-notched-outline{display:flex;position:absolute;top:0;right:0;left:0;box-sizing:border-box;width:100%;max-width:100%;height:100%;text-align:left;pointer-events:none}[dir=rtl] .mdc-notched-outline,.mdc-notched-outline[dir=rtl]{text-align:right}.mdc-notched-outline__leading,.mdc-notched-outline__notch,.mdc-notched-outline__trailing{box-sizing:border-box;height:100%;border-top:1px solid;border-bottom:1px solid;pointer-events:none}.mdc-notched-outline__leading{border-left:1px solid;border-right:none;width:12px}[dir=rtl] .mdc-notched-outline__leading,.mdc-notched-outline__leading[dir=rtl]{border-left:none;border-right:1px solid}.mdc-notched-outline__trailing{border-left:none;border-right:1px solid;flex-grow:1}[dir=rtl] .mdc-notched-outline__trailing,.mdc-notched-outline__trailing[dir=rtl]{border-left:1px solid;border-right:none}.mdc-notched-outline__notch{flex:0 0 auto;width:auto;max-width:calc(100% - 12px * 2)}.mdc-notched-outline .mdc-floating-label{display:inline-block;position:relative;max-width:100%}.mdc-notched-outline .mdc-floating-label--float-above{text-overflow:clip}.mdc-notched-outline--upgraded .mdc-floating-label--float-above{max-width:calc(100% / 0.75)}.mdc-notched-outline--notched .mdc-notched-outline__notch{padding-left:0;padding-right:8px;border-top:none}[dir=rtl] .mdc-notched-outline--notched .mdc-notched-outline__notch,.mdc-notched-outline--notched .mdc-notched-outline__notch[dir=rtl]{padding-left:8px;padding-right:0}.mdc-notched-outline--no-label .mdc-notched-outline__notch{display:none}:host{display:block;position:absolute;right:0;left:0;box-sizing:border-box;width:100%;max-width:100%;height:100%;text-align:left;pointer-events:none}[dir=rtl] :host,:host[dir=rtl]{text-align:right}::slotted(.mdc-floating-label){display:inline-block;position:relative;top:17px;bottom:auto;max-width:100%}::slotted(.mdc-floating-label--float-above){text-overflow:clip}.mdc-notched-outline--upgraded ::slotted(.mdc-floating-label--float-above){max-width:calc(100% / .75)}.mdc-notched-outline .mdc-notched-outline__leading{border-top-left-radius:4px;border-top-left-radius:var(--mdc-shape-small, 4px);border-top-right-radius:0;border-bottom-right-radius:0;border-bottom-left-radius:4px;border-bottom-left-radius:var(--mdc-shape-small, 4px)}[dir=rtl] .mdc-notched-outline .mdc-notched-outline__leading,.mdc-notched-outline .mdc-notched-outline__leading[dir=rtl]{border-top-left-radius:0;border-top-right-radius:4px;border-top-right-radius:var(--mdc-shape-small, 4px);border-bottom-right-radius:4px;border-bottom-right-radius:var(--mdc-shape-small, 4px);border-bottom-left-radius:0}@supports(top: max(0%)){.mdc-notched-outline .mdc-notched-outline__leading{width:max(12px, var(--mdc-shape-small, 4px))}}@supports(top: max(0%)){.mdc-notched-outline .mdc-notched-outline__notch{max-width:calc(100% - max(12px, var(--mdc-shape-small, 4px)) * 2)}}.mdc-notched-outline .mdc-notched-outline__trailing{border-top-left-radius:0;border-top-right-radius:4px;border-top-right-radius:var(--mdc-shape-small, 4px);border-bottom-right-radius:4px;border-bottom-right-radius:var(--mdc-shape-small, 4px);border-bottom-left-radius:0}[dir=rtl] .mdc-notched-outline .mdc-notched-outline__trailing,.mdc-notched-outline .mdc-notched-outline__trailing[dir=rtl]{border-top-left-radius:4px;border-top-left-radius:var(--mdc-shape-small, 4px);border-top-right-radius:0;border-bottom-right-radius:0;border-bottom-left-radius:4px;border-bottom-left-radius:var(--mdc-shape-small, 4px)}.mdc-notched-outline__leading,.mdc-notched-outline__notch,.mdc-notched-outline__trailing{border-color:var(--mdc-notched-outline-border-color, var(--mdc-theme-primary, #6200ee));border-width:1px;border-width:var(--mdc-notched-outline-stroke-width, 1px)}.mdc-notched-outline--notched .mdc-notched-outline__notch{padding-top:0;padding-top:var(--mdc-notched-outline-notch-offset, 0)}`;

let NotchedOutline = class NotchedOutline extends NotchedOutlineBase {
};
NotchedOutline.styles = style;
NotchedOutline = __decorate([
    customElement('mwc-notched-outline')
], NotchedOutline);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/** @soyCompatible */
class FormElement extends BaseElement {
    createRenderRoot() {
        return this.attachShadow({ mode: 'open', delegatesFocus: true });
    }
    click() {
        if (this.formElement) {
            this.formElement.focus();
            this.formElement.click();
        }
    }
    setAriaLabel(label) {
        if (this.formElement) {
            this.formElement.setAttribute('aria-label', label);
        }
    }
    firstUpdated() {
        super.firstUpdated();
        this.mdcRoot.addEventListener('change', (e) => {
            this.dispatchEvent(new Event('change', e));
        });
    }
}

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/ // tslint:disable:no-any
/**
 * Specifies an observer callback that is run when the decorated property
 * changes. The observer receives the current and old value as arguments.
 */
const observer = (observer) => 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(proto, propName) => {
    // if we haven't wrapped `updated` in this class, do so
    if (!proto.constructor
        ._observers) {
        proto.constructor._observers = new Map();
        const userUpdated = proto.updated;
        proto.updated = function (changedProperties) {
            userUpdated.call(this, changedProperties);
            changedProperties.forEach((v, k) => {
                const observers = this.constructor
                    ._observers;
                const observer = observers.get(k);
                if (observer !== undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    observer.call(this, this[k], v);
                }
            });
        };
        // clone any existing observers (superclasses)
        // eslint-disable-next-line no-prototype-builtins
    }
    else if (!proto.constructor.hasOwnProperty('_observers')) {
        const observers = proto.constructor._observers;
        proto.constructor._observers = new Map();
        observers.forEach(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (v, k) => proto.constructor._observers.set(k, v));
    }
    // set this method
    proto.constructor._observers.set(propName, observer);
};

/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var cssClasses$1 = {
    LABEL_FLOAT_ABOVE: 'mdc-floating-label--float-above',
    LABEL_REQUIRED: 'mdc-floating-label--required',
    LABEL_SHAKE: 'mdc-floating-label--shake',
    ROOT: 'mdc-floating-label',
};

/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCFloatingLabelFoundation = /** @class */ (function (_super) {
    __extends(MDCFloatingLabelFoundation, _super);
    function MDCFloatingLabelFoundation(adapter) {
        var _this = _super.call(this, __assign(__assign({}, MDCFloatingLabelFoundation.defaultAdapter), adapter)) || this;
        _this.shakeAnimationEndHandler_ = function () { return _this.handleShakeAnimationEnd_(); };
        return _this;
    }
    Object.defineProperty(MDCFloatingLabelFoundation, "cssClasses", {
        get: function () {
            return cssClasses$1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCFloatingLabelFoundation, "defaultAdapter", {
        /**
         * See {@link MDCFloatingLabelAdapter} for typing information on parameters and return types.
         */
        get: function () {
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            return {
                addClass: function () { return undefined; },
                removeClass: function () { return undefined; },
                getWidth: function () { return 0; },
                registerInteractionHandler: function () { return undefined; },
                deregisterInteractionHandler: function () { return undefined; },
            };
            // tslint:enable:object-literal-sort-keys
        },
        enumerable: true,
        configurable: true
    });
    MDCFloatingLabelFoundation.prototype.init = function () {
        this.adapter.registerInteractionHandler('animationend', this.shakeAnimationEndHandler_);
    };
    MDCFloatingLabelFoundation.prototype.destroy = function () {
        this.adapter.deregisterInteractionHandler('animationend', this.shakeAnimationEndHandler_);
    };
    /**
     * Returns the width of the label element.
     */
    MDCFloatingLabelFoundation.prototype.getWidth = function () {
        return this.adapter.getWidth();
    };
    /**
     * Styles the label to produce a shake animation to indicate an error.
     * @param shouldShake If true, adds the shake CSS class; otherwise, removes shake class.
     */
    MDCFloatingLabelFoundation.prototype.shake = function (shouldShake) {
        var LABEL_SHAKE = MDCFloatingLabelFoundation.cssClasses.LABEL_SHAKE;
        if (shouldShake) {
            this.adapter.addClass(LABEL_SHAKE);
        }
        else {
            this.adapter.removeClass(LABEL_SHAKE);
        }
    };
    /**
     * Styles the label to float or dock.
     * @param shouldFloat If true, adds the float CSS class; otherwise, removes float and shake classes to dock the label.
     */
    MDCFloatingLabelFoundation.prototype.float = function (shouldFloat) {
        var _a = MDCFloatingLabelFoundation.cssClasses, LABEL_FLOAT_ABOVE = _a.LABEL_FLOAT_ABOVE, LABEL_SHAKE = _a.LABEL_SHAKE;
        if (shouldFloat) {
            this.adapter.addClass(LABEL_FLOAT_ABOVE);
        }
        else {
            this.adapter.removeClass(LABEL_FLOAT_ABOVE);
            this.adapter.removeClass(LABEL_SHAKE);
        }
    };
    /**
     * Styles the label as required.
     * @param isRequired If true, adds an asterisk to the label, indicating that it is required.
     */
    MDCFloatingLabelFoundation.prototype.setRequired = function (isRequired) {
        var LABEL_REQUIRED = MDCFloatingLabelFoundation.cssClasses.LABEL_REQUIRED;
        if (isRequired) {
            this.adapter.addClass(LABEL_REQUIRED);
        }
        else {
            this.adapter.removeClass(LABEL_REQUIRED);
        }
    };
    MDCFloatingLabelFoundation.prototype.handleShakeAnimationEnd_ = function () {
        var LABEL_SHAKE = MDCFloatingLabelFoundation.cssClasses.LABEL_SHAKE;
        this.adapter.removeClass(LABEL_SHAKE);
    };
    return MDCFloatingLabelFoundation;
}(MDCFoundation));

const createAdapter = (labelElement) => {
    return {
        addClass: (className) => labelElement.classList.add(className),
        removeClass: (className) => labelElement.classList.remove(className),
        getWidth: () => labelElement.scrollWidth,
        registerInteractionHandler: (evtType, handler) => {
            labelElement.addEventListener(evtType, handler);
        },
        deregisterInteractionHandler: (evtType, handler) => {
            labelElement.removeEventListener(evtType, handler);
        },
    };
};
const partToFoundationMap = new WeakMap();
const floatingLabel = directive((label) => (part) => {
    const lastFoundation = partToFoundationMap.get(part);
    if (!lastFoundation) {
        const labelElement = part.committer.element;
        labelElement.classList.add('mdc-floating-label');
        const adapter = createAdapter(labelElement);
        const foundation = new MDCFloatingLabelFoundation(adapter);
        foundation.init();
        part.setValue(foundation);
        partToFoundationMap.set(part, { label, foundation });
    }
});

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var cssClasses$2 = {
    LINE_RIPPLE_ACTIVE: 'mdc-line-ripple--active',
    LINE_RIPPLE_DEACTIVATING: 'mdc-line-ripple--deactivating',
};

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCLineRippleFoundation = /** @class */ (function (_super) {
    __extends(MDCLineRippleFoundation, _super);
    function MDCLineRippleFoundation(adapter) {
        var _this = _super.call(this, __assign(__assign({}, MDCLineRippleFoundation.defaultAdapter), adapter)) || this;
        _this.transitionEndHandler_ = function (evt) { return _this.handleTransitionEnd(evt); };
        return _this;
    }
    Object.defineProperty(MDCLineRippleFoundation, "cssClasses", {
        get: function () {
            return cssClasses$2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCLineRippleFoundation, "defaultAdapter", {
        /**
         * See {@link MDCLineRippleAdapter} for typing information on parameters and return types.
         */
        get: function () {
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            return {
                addClass: function () { return undefined; },
                removeClass: function () { return undefined; },
                hasClass: function () { return false; },
                setStyle: function () { return undefined; },
                registerEventHandler: function () { return undefined; },
                deregisterEventHandler: function () { return undefined; },
            };
            // tslint:enable:object-literal-sort-keys
        },
        enumerable: true,
        configurable: true
    });
    MDCLineRippleFoundation.prototype.init = function () {
        this.adapter.registerEventHandler('transitionend', this.transitionEndHandler_);
    };
    MDCLineRippleFoundation.prototype.destroy = function () {
        this.adapter.deregisterEventHandler('transitionend', this.transitionEndHandler_);
    };
    MDCLineRippleFoundation.prototype.activate = function () {
        this.adapter.removeClass(cssClasses$2.LINE_RIPPLE_DEACTIVATING);
        this.adapter.addClass(cssClasses$2.LINE_RIPPLE_ACTIVE);
    };
    MDCLineRippleFoundation.prototype.setRippleCenter = function (xCoordinate) {
        this.adapter.setStyle('transform-origin', xCoordinate + "px center");
    };
    MDCLineRippleFoundation.prototype.deactivate = function () {
        this.adapter.addClass(cssClasses$2.LINE_RIPPLE_DEACTIVATING);
    };
    MDCLineRippleFoundation.prototype.handleTransitionEnd = function (evt) {
        // Wait for the line ripple to be either transparent or opaque
        // before emitting the animation end event
        var isDeactivating = this.adapter.hasClass(cssClasses$2.LINE_RIPPLE_DEACTIVATING);
        if (evt.propertyName === 'opacity') {
            if (isDeactivating) {
                this.adapter.removeClass(cssClasses$2.LINE_RIPPLE_ACTIVE);
                this.adapter.removeClass(cssClasses$2.LINE_RIPPLE_DEACTIVATING);
            }
        }
    };
    return MDCLineRippleFoundation;
}(MDCFoundation));

const createAdapter$1 = (lineElement) => {
    return {
        addClass: (className) => lineElement.classList.add(className),
        removeClass: (className) => lineElement.classList.remove(className),
        hasClass: (className) => lineElement.classList.contains(className),
        setStyle: (propertyName, value) => lineElement.style.setProperty(propertyName, value),
        registerEventHandler: (evtType, handler) => {
            lineElement.addEventListener(evtType, handler);
        },
        deregisterEventHandler: (evtType, handler) => {
            lineElement.removeEventListener(evtType, handler);
        },
    };
};
const partToFoundationMap$1 = new WeakMap();
const lineRipple = directive(() => (part) => {
    const lastFoundation = partToFoundationMap$1.get(part);
    if (!lastFoundation) {
        const lineElement = part.committer.element;
        lineElement.classList.add('mdc-line-ripple');
        const adapter = createAdapter$1(lineElement);
        const foundation = new MDCLineRippleFoundation(adapter);
        foundation.init();
        part.setValue(foundation);
        partToFoundationMap$1.set(part, foundation);
    }
});

/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var strings$1 = {
    ARIA_CONTROLS: 'aria-controls',
    ARIA_DESCRIBEDBY: 'aria-describedby',
    INPUT_SELECTOR: '.mdc-text-field__input',
    LABEL_SELECTOR: '.mdc-floating-label',
    LEADING_ICON_SELECTOR: '.mdc-text-field__icon--leading',
    LINE_RIPPLE_SELECTOR: '.mdc-line-ripple',
    OUTLINE_SELECTOR: '.mdc-notched-outline',
    PREFIX_SELECTOR: '.mdc-text-field__affix--prefix',
    SUFFIX_SELECTOR: '.mdc-text-field__affix--suffix',
    TRAILING_ICON_SELECTOR: '.mdc-text-field__icon--trailing'
};
var cssClasses$3 = {
    DISABLED: 'mdc-text-field--disabled',
    FOCUSED: 'mdc-text-field--focused',
    HELPER_LINE: 'mdc-text-field-helper-line',
    INVALID: 'mdc-text-field--invalid',
    LABEL_FLOATING: 'mdc-text-field--label-floating',
    NO_LABEL: 'mdc-text-field--no-label',
    OUTLINED: 'mdc-text-field--outlined',
    ROOT: 'mdc-text-field',
    TEXTAREA: 'mdc-text-field--textarea',
    WITH_LEADING_ICON: 'mdc-text-field--with-leading-icon',
    WITH_TRAILING_ICON: 'mdc-text-field--with-trailing-icon',
};
var numbers$1 = {
    LABEL_SCALE: 0.75,
};
/**
 * Whitelist based off of https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
 * under the "Validation-related attributes" section.
 */
var VALIDATION_ATTR_WHITELIST = [
    'pattern', 'min', 'max', 'required', 'step', 'minlength', 'maxlength',
];
/**
 * Label should always float for these types as they show some UI even if value is empty.
 */
var ALWAYS_FLOAT_TYPES = [
    'color', 'date', 'datetime-local', 'month', 'range', 'time', 'week',
];

/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var POINTERDOWN_EVENTS = ['mousedown', 'touchstart'];
var INTERACTION_EVENTS = ['click', 'keydown'];
var MDCTextFieldFoundation = /** @class */ (function (_super) {
    __extends(MDCTextFieldFoundation, _super);
    /**
     * @param adapter
     * @param foundationMap Map from subcomponent names to their subfoundations.
     */
    function MDCTextFieldFoundation(adapter, foundationMap) {
        if (foundationMap === void 0) { foundationMap = {}; }
        var _this = _super.call(this, __assign(__assign({}, MDCTextFieldFoundation.defaultAdapter), adapter)) || this;
        _this.isFocused_ = false;
        _this.receivedUserInput_ = false;
        _this.isValid_ = true;
        _this.useNativeValidation_ = true;
        _this.validateOnValueChange_ = true;
        _this.helperText_ = foundationMap.helperText;
        _this.characterCounter_ = foundationMap.characterCounter;
        _this.leadingIcon_ = foundationMap.leadingIcon;
        _this.trailingIcon_ = foundationMap.trailingIcon;
        _this.inputFocusHandler_ = function () { return _this.activateFocus(); };
        _this.inputBlurHandler_ = function () { return _this.deactivateFocus(); };
        _this.inputInputHandler_ = function () { return _this.handleInput(); };
        _this.setPointerXOffset_ = function (evt) { return _this.setTransformOrigin(evt); };
        _this.textFieldInteractionHandler_ = function () { return _this.handleTextFieldInteraction(); };
        _this.validationAttributeChangeHandler_ = function (attributesList) {
            return _this.handleValidationAttributeChange(attributesList);
        };
        return _this;
    }
    Object.defineProperty(MDCTextFieldFoundation, "cssClasses", {
        get: function () {
            return cssClasses$3;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTextFieldFoundation, "strings", {
        get: function () {
            return strings$1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTextFieldFoundation, "numbers", {
        get: function () {
            return numbers$1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTextFieldFoundation.prototype, "shouldAlwaysFloat_", {
        get: function () {
            var type = this.getNativeInput_().type;
            return ALWAYS_FLOAT_TYPES.indexOf(type) >= 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTextFieldFoundation.prototype, "shouldFloat", {
        get: function () {
            return this.shouldAlwaysFloat_ || this.isFocused_ || !!this.getValue() ||
                this.isBadInput_();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTextFieldFoundation.prototype, "shouldShake", {
        get: function () {
            return !this.isFocused_ && !this.isValid() && !!this.getValue();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTextFieldFoundation, "defaultAdapter", {
        /**
         * See {@link MDCTextFieldAdapter} for typing information on parameters and
         * return types.
         */
        get: function () {
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            return {
                addClass: function () { return undefined; },
                removeClass: function () { return undefined; },
                hasClass: function () { return true; },
                setInputAttr: function () { return undefined; },
                removeInputAttr: function () { return undefined; },
                registerTextFieldInteractionHandler: function () { return undefined; },
                deregisterTextFieldInteractionHandler: function () { return undefined; },
                registerInputInteractionHandler: function () { return undefined; },
                deregisterInputInteractionHandler: function () { return undefined; },
                registerValidationAttributeChangeHandler: function () {
                    return new MutationObserver(function () { return undefined; });
                },
                deregisterValidationAttributeChangeHandler: function () { return undefined; },
                getNativeInput: function () { return null; },
                isFocused: function () { return false; },
                activateLineRipple: function () { return undefined; },
                deactivateLineRipple: function () { return undefined; },
                setLineRippleTransformOrigin: function () { return undefined; },
                shakeLabel: function () { return undefined; },
                floatLabel: function () { return undefined; },
                setLabelRequired: function () { return undefined; },
                hasLabel: function () { return false; },
                getLabelWidth: function () { return 0; },
                hasOutline: function () { return false; },
                notchOutline: function () { return undefined; },
                closeOutline: function () { return undefined; },
            };
            // tslint:enable:object-literal-sort-keys
        },
        enumerable: true,
        configurable: true
    });
    MDCTextFieldFoundation.prototype.init = function () {
        var _this = this;
        if (this.adapter.hasLabel() && this.getNativeInput_().required) {
            this.adapter.setLabelRequired(true);
        }
        if (this.adapter.isFocused()) {
            this.inputFocusHandler_();
        }
        else if (this.adapter.hasLabel() && this.shouldFloat) {
            this.notchOutline(true);
            this.adapter.floatLabel(true);
            this.styleFloating_(true);
        }
        this.adapter.registerInputInteractionHandler('focus', this.inputFocusHandler_);
        this.adapter.registerInputInteractionHandler('blur', this.inputBlurHandler_);
        this.adapter.registerInputInteractionHandler('input', this.inputInputHandler_);
        POINTERDOWN_EVENTS.forEach(function (evtType) {
            _this.adapter.registerInputInteractionHandler(evtType, _this.setPointerXOffset_);
        });
        INTERACTION_EVENTS.forEach(function (evtType) {
            _this.adapter.registerTextFieldInteractionHandler(evtType, _this.textFieldInteractionHandler_);
        });
        this.validationObserver_ =
            this.adapter.registerValidationAttributeChangeHandler(this.validationAttributeChangeHandler_);
        this.setCharacterCounter_(this.getValue().length);
    };
    MDCTextFieldFoundation.prototype.destroy = function () {
        var _this = this;
        this.adapter.deregisterInputInteractionHandler('focus', this.inputFocusHandler_);
        this.adapter.deregisterInputInteractionHandler('blur', this.inputBlurHandler_);
        this.adapter.deregisterInputInteractionHandler('input', this.inputInputHandler_);
        POINTERDOWN_EVENTS.forEach(function (evtType) {
            _this.adapter.deregisterInputInteractionHandler(evtType, _this.setPointerXOffset_);
        });
        INTERACTION_EVENTS.forEach(function (evtType) {
            _this.adapter.deregisterTextFieldInteractionHandler(evtType, _this.textFieldInteractionHandler_);
        });
        this.adapter.deregisterValidationAttributeChangeHandler(this.validationObserver_);
    };
    /**
     * Handles user interactions with the Text Field.
     */
    MDCTextFieldFoundation.prototype.handleTextFieldInteraction = function () {
        var nativeInput = this.adapter.getNativeInput();
        if (nativeInput && nativeInput.disabled) {
            return;
        }
        this.receivedUserInput_ = true;
    };
    /**
     * Handles validation attribute changes
     */
    MDCTextFieldFoundation.prototype.handleValidationAttributeChange = function (attributesList) {
        var _this = this;
        attributesList.some(function (attributeName) {
            if (VALIDATION_ATTR_WHITELIST.indexOf(attributeName) > -1) {
                _this.styleValidity_(true);
                _this.adapter.setLabelRequired(_this.getNativeInput_().required);
                return true;
            }
            return false;
        });
        if (attributesList.indexOf('maxlength') > -1) {
            this.setCharacterCounter_(this.getValue().length);
        }
    };
    /**
     * Opens/closes the notched outline.
     */
    MDCTextFieldFoundation.prototype.notchOutline = function (openNotch) {
        if (!this.adapter.hasOutline() || !this.adapter.hasLabel()) {
            return;
        }
        if (openNotch) {
            var labelWidth = this.adapter.getLabelWidth() * numbers$1.LABEL_SCALE;
            this.adapter.notchOutline(labelWidth);
        }
        else {
            this.adapter.closeOutline();
        }
    };
    /**
     * Activates the text field focus state.
     */
    MDCTextFieldFoundation.prototype.activateFocus = function () {
        this.isFocused_ = true;
        this.styleFocused_(this.isFocused_);
        this.adapter.activateLineRipple();
        if (this.adapter.hasLabel()) {
            this.notchOutline(this.shouldFloat);
            this.adapter.floatLabel(this.shouldFloat);
            this.styleFloating_(this.shouldFloat);
            this.adapter.shakeLabel(this.shouldShake);
        }
        if (this.helperText_ &&
            (this.helperText_.isPersistent() || !this.helperText_.isValidation() ||
                !this.isValid_)) {
            this.helperText_.showToScreenReader();
        }
    };
    /**
     * Sets the line ripple's transform origin, so that the line ripple activate
     * animation will animate out from the user's click location.
     */
    MDCTextFieldFoundation.prototype.setTransformOrigin = function (evt) {
        if (this.isDisabled() || this.adapter.hasOutline()) {
            return;
        }
        var touches = evt.touches;
        var targetEvent = touches ? touches[0] : evt;
        var targetClientRect = targetEvent.target.getBoundingClientRect();
        var normalizedX = targetEvent.clientX - targetClientRect.left;
        this.adapter.setLineRippleTransformOrigin(normalizedX);
    };
    /**
     * Handles input change of text input and text area.
     */
    MDCTextFieldFoundation.prototype.handleInput = function () {
        this.autoCompleteFocus();
        this.setCharacterCounter_(this.getValue().length);
    };
    /**
     * Activates the Text Field's focus state in cases when the input value
     * changes without user input (e.g. programmatically).
     */
    MDCTextFieldFoundation.prototype.autoCompleteFocus = function () {
        if (!this.receivedUserInput_) {
            this.activateFocus();
        }
    };
    /**
     * Deactivates the Text Field's focus state.
     */
    MDCTextFieldFoundation.prototype.deactivateFocus = function () {
        this.isFocused_ = false;
        this.adapter.deactivateLineRipple();
        var isValid = this.isValid();
        this.styleValidity_(isValid);
        this.styleFocused_(this.isFocused_);
        if (this.adapter.hasLabel()) {
            this.notchOutline(this.shouldFloat);
            this.adapter.floatLabel(this.shouldFloat);
            this.styleFloating_(this.shouldFloat);
            this.adapter.shakeLabel(this.shouldShake);
        }
        if (!this.shouldFloat) {
            this.receivedUserInput_ = false;
        }
    };
    MDCTextFieldFoundation.prototype.getValue = function () {
        return this.getNativeInput_().value;
    };
    /**
     * @param value The value to set on the input Element.
     */
    MDCTextFieldFoundation.prototype.setValue = function (value) {
        // Prevent Safari from moving the caret to the end of the input when the
        // value has not changed.
        if (this.getValue() !== value) {
            this.getNativeInput_().value = value;
        }
        this.setCharacterCounter_(value.length);
        if (this.validateOnValueChange_) {
            var isValid = this.isValid();
            this.styleValidity_(isValid);
        }
        if (this.adapter.hasLabel()) {
            this.notchOutline(this.shouldFloat);
            this.adapter.floatLabel(this.shouldFloat);
            this.styleFloating_(this.shouldFloat);
            if (this.validateOnValueChange_) {
                this.adapter.shakeLabel(this.shouldShake);
            }
        }
    };
    /**
     * @return The custom validity state, if set; otherwise, the result of a
     *     native validity check.
     */
    MDCTextFieldFoundation.prototype.isValid = function () {
        return this.useNativeValidation_ ? this.isNativeInputValid_() :
            this.isValid_;
    };
    /**
     * @param isValid Sets the custom validity state of the Text Field.
     */
    MDCTextFieldFoundation.prototype.setValid = function (isValid) {
        this.isValid_ = isValid;
        this.styleValidity_(isValid);
        var shouldShake = !isValid && !this.isFocused_ && !!this.getValue();
        if (this.adapter.hasLabel()) {
            this.adapter.shakeLabel(shouldShake);
        }
    };
    /**
     * @param shouldValidate Whether or not validity should be updated on
     *     value change.
     */
    MDCTextFieldFoundation.prototype.setValidateOnValueChange = function (shouldValidate) {
        this.validateOnValueChange_ = shouldValidate;
    };
    /**
     * @return Whether or not validity should be updated on value change. `true`
     *     by default.
     */
    MDCTextFieldFoundation.prototype.getValidateOnValueChange = function () {
        return this.validateOnValueChange_;
    };
    /**
     * Enables or disables the use of native validation. Use this for custom
     * validation.
     * @param useNativeValidation Set this to false to ignore native input
     *     validation.
     */
    MDCTextFieldFoundation.prototype.setUseNativeValidation = function (useNativeValidation) {
        this.useNativeValidation_ = useNativeValidation;
    };
    MDCTextFieldFoundation.prototype.isDisabled = function () {
        return this.getNativeInput_().disabled;
    };
    /**
     * @param disabled Sets the text-field disabled or enabled.
     */
    MDCTextFieldFoundation.prototype.setDisabled = function (disabled) {
        this.getNativeInput_().disabled = disabled;
        this.styleDisabled_(disabled);
    };
    /**
     * @param content Sets the content of the helper text.
     */
    MDCTextFieldFoundation.prototype.setHelperTextContent = function (content) {
        if (this.helperText_) {
            this.helperText_.setContent(content);
        }
    };
    /**
     * Sets the aria label of the leading icon.
     */
    MDCTextFieldFoundation.prototype.setLeadingIconAriaLabel = function (label) {
        if (this.leadingIcon_) {
            this.leadingIcon_.setAriaLabel(label);
        }
    };
    /**
     * Sets the text content of the leading icon.
     */
    MDCTextFieldFoundation.prototype.setLeadingIconContent = function (content) {
        if (this.leadingIcon_) {
            this.leadingIcon_.setContent(content);
        }
    };
    /**
     * Sets the aria label of the trailing icon.
     */
    MDCTextFieldFoundation.prototype.setTrailingIconAriaLabel = function (label) {
        if (this.trailingIcon_) {
            this.trailingIcon_.setAriaLabel(label);
        }
    };
    /**
     * Sets the text content of the trailing icon.
     */
    MDCTextFieldFoundation.prototype.setTrailingIconContent = function (content) {
        if (this.trailingIcon_) {
            this.trailingIcon_.setContent(content);
        }
    };
    /**
     * Sets character counter values that shows characters used and the total
     * character limit.
     */
    MDCTextFieldFoundation.prototype.setCharacterCounter_ = function (currentLength) {
        if (!this.characterCounter_) {
            return;
        }
        var maxLength = this.getNativeInput_().maxLength;
        if (maxLength === -1) {
            throw new Error('MDCTextFieldFoundation: Expected maxlength html property on text input or textarea.');
        }
        this.characterCounter_.setCounterValue(currentLength, maxLength);
    };
    /**
     * @return True if the Text Field input fails in converting the user-supplied
     *     value.
     */
    MDCTextFieldFoundation.prototype.isBadInput_ = function () {
        // The badInput property is not supported in IE 11 💩.
        return this.getNativeInput_().validity.badInput || false;
    };
    /**
     * @return The result of native validity checking (ValidityState.valid).
     */
    MDCTextFieldFoundation.prototype.isNativeInputValid_ = function () {
        return this.getNativeInput_().validity.valid;
    };
    /**
     * Styles the component based on the validity state.
     */
    MDCTextFieldFoundation.prototype.styleValidity_ = function (isValid) {
        var INVALID = MDCTextFieldFoundation.cssClasses.INVALID;
        if (isValid) {
            this.adapter.removeClass(INVALID);
        }
        else {
            this.adapter.addClass(INVALID);
        }
        if (this.helperText_) {
            this.helperText_.setValidity(isValid);
            // We dynamically set or unset aria-describedby for validation helper text
            // only, based on whether the field is valid
            var helperTextValidation = this.helperText_.isValidation();
            if (!helperTextValidation) {
                return;
            }
            var helperTextVisible = this.helperText_.isVisible();
            var helperTextId = this.helperText_.getId();
            if (helperTextVisible && helperTextId) {
                this.adapter.setInputAttr(strings$1.ARIA_DESCRIBEDBY, helperTextId);
            }
            else {
                this.adapter.removeInputAttr(strings$1.ARIA_DESCRIBEDBY);
            }
        }
    };
    /**
     * Styles the component based on the focused state.
     */
    MDCTextFieldFoundation.prototype.styleFocused_ = function (isFocused) {
        var FOCUSED = MDCTextFieldFoundation.cssClasses.FOCUSED;
        if (isFocused) {
            this.adapter.addClass(FOCUSED);
        }
        else {
            this.adapter.removeClass(FOCUSED);
        }
    };
    /**
     * Styles the component based on the disabled state.
     */
    MDCTextFieldFoundation.prototype.styleDisabled_ = function (isDisabled) {
        var _a = MDCTextFieldFoundation.cssClasses, DISABLED = _a.DISABLED, INVALID = _a.INVALID;
        if (isDisabled) {
            this.adapter.addClass(DISABLED);
            this.adapter.removeClass(INVALID);
        }
        else {
            this.adapter.removeClass(DISABLED);
        }
        if (this.leadingIcon_) {
            this.leadingIcon_.setDisabled(isDisabled);
        }
        if (this.trailingIcon_) {
            this.trailingIcon_.setDisabled(isDisabled);
        }
    };
    /**
     * Styles the component based on the label floating state.
     */
    MDCTextFieldFoundation.prototype.styleFloating_ = function (isFloating) {
        var LABEL_FLOATING = MDCTextFieldFoundation.cssClasses.LABEL_FLOATING;
        if (isFloating) {
            this.adapter.addClass(LABEL_FLOATING);
        }
        else {
            this.adapter.removeClass(LABEL_FLOATING);
        }
    };
    /**
     * @return The native text input element from the host environment, or an
     *     object with the same shape for unit tests.
     */
    MDCTextFieldFoundation.prototype.getNativeInput_ = function () {
        // this.adapter may be undefined in foundation unit tests. This happens when
        // testdouble is creating a mock object and invokes the
        // shouldShake/shouldFloat getters (which in turn call getValue(), which
        // calls this method) before init() has been called from the MDCTextField
        // constructor. To work around that issue, we return a dummy object.
        var nativeInput = this.adapter ? this.adapter.getNativeInput() : null;
        return nativeInput || {
            disabled: false,
            maxLength: -1,
            required: false,
            type: 'input',
            validity: {
                badInput: false,
                valid: true,
            },
            value: '',
        };
    };
    return MDCTextFieldFoundation;
}(MDCFoundation));

const passiveEvents = ['touchstart', 'touchmove', 'scroll', 'mousewheel'];
const createValidityObj = (customValidity = {}) => {
    /*
     * We need to make ValidityState an object because it is readonly and
     * we cannot use the spread operator. Also, we don't export
     * `CustomValidityState` because it is a leaky implementation and the user
     * already has access to `ValidityState` in lib.dom.ts. Also an interface
     * {a: Type} can be casted to {readonly a: Type} so passing any object
     * should be fine.
     */
    const objectifiedCustomValidity = {};
    // eslint-disable-next-line guard-for-in
    for (const propName in customValidity) {
        /*
         * Casting is needed because ValidityState's props are all readonly and
         * thus cannot be set on `onjectifiedCustomValidity`. In the end, the
         * interface is the same as ValidityState (but not readonly), but the
         * function signature casts the output to ValidityState (thus readonly).
         */
        objectifiedCustomValidity[propName] =
            customValidity[propName];
    }
    return Object.assign({ badInput: false, customError: false, patternMismatch: false, rangeOverflow: false, rangeUnderflow: false, stepMismatch: false, tooLong: false, tooShort: false, typeMismatch: false, valid: true, valueMissing: false }, objectifiedCustomValidity);
};
/** @soyCompatible */
class TextFieldBase extends FormElement {
    constructor() {
        super(...arguments);
        this.mdcFoundationClass = MDCTextFieldFoundation;
        this.value = '';
        this.type = 'text';
        this.placeholder = '';
        this.label = '';
        this.icon = '';
        this.iconTrailing = '';
        this.disabled = false;
        this.required = false;
        this.minLength = -1;
        this.maxLength = -1;
        this.outlined = false;
        this.helper = '';
        this.validateOnInitialRender = false;
        this.validationMessage = '';
        this.autoValidate = false;
        this.pattern = '';
        this.min = '';
        this.max = '';
        this.step = null;
        this.size = null;
        this.helperPersistent = false;
        this.charCounter = false;
        this.endAligned = false;
        this.prefix = '';
        this.suffix = '';
        this.name = '';
        this.readOnly = false;
        this.autocapitalize = '';
        this.outlineOpen = false;
        this.outlineWidth = 0;
        this.isUiValid = true;
        this.focused = false;
        this._validity = createValidityObj();
        this._outlineUpdateComplete = null;
        this.validityTransform = null;
    }
    get validity() {
        this._checkValidity(this.value);
        return this._validity;
    }
    get willValidate() {
        return this.formElement.willValidate;
    }
    get selectionStart() {
        return this.formElement.selectionStart;
    }
    get selectionEnd() {
        return this.formElement.selectionEnd;
    }
    focus() {
        const focusEvt = new CustomEvent('focus');
        this.formElement.dispatchEvent(focusEvt);
        this.formElement.focus();
    }
    blur() {
        const blurEvt = new CustomEvent('blur');
        this.formElement.dispatchEvent(blurEvt);
        this.formElement.blur();
    }
    select() {
        this.formElement.select();
    }
    setSelectionRange(selectionStart, selectionEnd, selectionDirection) {
        this.formElement.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
    }
    update(changedProperties) {
        if (changedProperties.has('autoValidate') && this.mdcFoundation) {
            this.mdcFoundation.setValidateOnValueChange(this.autoValidate);
        }
        if (changedProperties.has('value') && typeof this.value !== 'string') {
            this.value = `${this.value}`;
        }
        super.update(changedProperties);
    }
    /** @soyTemplate */
    render() {
        const shouldRenderCharCounter = this.charCounter && this.maxLength !== -1;
        const shouldRenderHelperText = !!this.helper || !!this.validationMessage || shouldRenderCharCounter;
        /** @classMap */
        const classes = {
            'mdc-text-field--disabled': this.disabled,
            'mdc-text-field--no-label': !this.label,
            'mdc-text-field--filled': !this.outlined,
            'mdc-text-field--outlined': this.outlined,
            'mdc-text-field--with-leading-icon': this.icon,
            'mdc-text-field--with-trailing-icon': this.iconTrailing,
            'mdc-text-field--end-aligned': this.endAligned,
        };
        return html$2 `
      <label class="mdc-text-field ${classMap(classes)}">
        ${this.renderRipple()}
        ${this.outlined ? this.renderOutline() : this.renderLabel()}
        ${this.renderLeadingIcon()}
        ${this.renderPrefix()}
        ${this.renderInput(shouldRenderHelperText)}
        ${this.renderSuffix()}
        ${this.renderTrailingIcon()}
        ${this.renderLineRipple()}
      </label>
      ${this.renderHelperText(shouldRenderHelperText, shouldRenderCharCounter)}
    `;
    }
    updated(changedProperties) {
        if (changedProperties.has('value') &&
            changedProperties.get('value') !== undefined) {
            this.mdcFoundation.setValue(this.value);
            if (this.autoValidate) {
                this.reportValidity();
            }
        }
    }
    /** @soyTemplate */
    renderRipple() {
        return this.outlined ? '' : html$2 `
      <span class="mdc-text-field__ripple"></span>
    `;
    }
    /** @soyTemplate */
    renderOutline() {
        return !this.outlined ? '' : html$2 `
      <mwc-notched-outline
          .width=${this.outlineWidth}
          .open=${this.outlineOpen}
          class="mdc-notched-outline">
        ${this.renderLabel()}
      </mwc-notched-outline>`;
    }
    /** @soyTemplate */
    renderLabel() {
        return !this.label ? '' : html$2 `
      <span
          .floatingLabelFoundation=${floatingLabel(this.label)}
          id="label">${this.label}</span>
    `;
    }
    /** @soyTemplate */
    renderLeadingIcon() {
        return this.icon ? this.renderIcon(this.icon) : '';
    }
    /** @soyTemplate */
    renderTrailingIcon() {
        return this.iconTrailing ? this.renderIcon(this.iconTrailing, true) : '';
    }
    /** @soyTemplate */
    renderIcon(icon, isTrailingIcon = false) {
        /** @classMap */
        const classes = {
            'mdc-text-field__icon--leading': !isTrailingIcon,
            'mdc-text-field__icon--trailing': isTrailingIcon
        };
        return html$2 `<i class="material-icons mdc-text-field__icon ${classMap(classes)}">${icon}</i>`;
    }
    /** @soyTemplate */
    renderPrefix() {
        return this.prefix ? this.renderAffix(this.prefix) : '';
    }
    /** @soyTemplate */
    renderSuffix() {
        return this.suffix ? this.renderAffix(this.suffix, true) : '';
    }
    /** @soyTemplate */
    renderAffix(content, isSuffix = false) {
        /** @classMap */
        const classes = {
            'mdc-text-field__affix--prefix': !isSuffix,
            'mdc-text-field__affix--suffix': isSuffix
        };
        return html$2 `<span class="mdc-text-field__affix ${classMap(classes)}">
        ${content}</span>`;
    }
    /** @soyTemplate */
    renderInput(shouldRenderHelperText) {
        const minOrUndef = this.minLength === -1 ? undefined : this.minLength;
        const maxOrUndef = this.maxLength === -1 ? undefined : this.maxLength;
        const autocapitalizeOrUndef = this.autocapitalize ?
            this.autocapitalize :
            undefined;
        const showValidationMessage = this.validationMessage && !this.isUiValid;
        const ariaControlsOrUndef = shouldRenderHelperText ? 'helper-text' : undefined;
        const ariaDescribedbyOrUndef = this.focused || this.helperPersistent || showValidationMessage ?
            'helper-text' :
            undefined;
        const ariaErrortextOrUndef = showValidationMessage ? 'helper-text' : undefined;
        // TODO: live() directive needs casting for lit-analyzer
        // https://github.com/runem/lit-analyzer/pull/91/files
        // TODO: lit-analyzer labels min/max as (number|string) instead of string
        return html$2 `
      <input
          aria-labelledby="label"
          aria-controls="${ifDefined(ariaControlsOrUndef)}"
          aria-describedby="${ifDefined(ariaDescribedbyOrUndef)}"
          aria-errortext="${ifDefined(ariaErrortextOrUndef)}"
          class="mdc-text-field__input"
          type="${this.type}"
          .value="${live(this.value)}"
          ?disabled="${this.disabled}"
          placeholder="${this.placeholder}"
          ?required="${this.required}"
          ?readonly="${this.readOnly}"
          minlength="${ifDefined(minOrUndef)}"
          maxlength="${ifDefined(maxOrUndef)}"
          pattern="${ifDefined(this.pattern ? this.pattern : undefined)}"
          min="${ifDefined(this.min === '' ? undefined : this.min)}"
          max="${ifDefined(this.max === '' ? undefined : this.max)}"
          step="${ifDefined(this.step === null ? undefined : this.step)}"
          size="${ifDefined(this.size === null ? undefined : this.size)}"
          name="${ifDefined(this.name === '' ? undefined : this.name)}"
          inputmode="${ifDefined(this.inputMode)}"
          autocapitalize="${ifDefined(autocapitalizeOrUndef)}"
          @input="${this.handleInputChange}"
          @focus="${this.onInputFocus}"
          @blur="${this.onInputBlur}">`;
    }
    /** @soyTemplate */
    renderLineRipple() {
        return this.outlined ? '' : html$2 `
      <span .lineRippleFoundation=${lineRipple()}></span>
    `;
    }
    /** @soyTemplate */
    renderHelperText(shouldRenderHelperText, shouldRenderCharCounter) {
        const showValidationMessage = this.validationMessage && !this.isUiValid;
        /** @classMap */
        const classes = {
            'mdc-text-field-helper-text--persistent': this.helperPersistent,
            'mdc-text-field-helper-text--validation-msg': showValidationMessage,
        };
        const ariaHiddenOrUndef = this.focused || this.helperPersistent || showValidationMessage ?
            undefined :
            'true';
        const helperText = showValidationMessage ? this.validationMessage : this.helper;
        return !shouldRenderHelperText ? '' : html$2 `
      <div class="mdc-text-field-helper-line">
        <div id="helper-text"
             aria-hidden="${ifDefined(ariaHiddenOrUndef)}"
             class="mdc-text-field-helper-text ${classMap(classes)}"
             >${helperText}</div>
        ${this.renderCharCounter(shouldRenderCharCounter)}
      </div>`;
    }
    /** @soyTemplate */
    renderCharCounter(shouldRenderCharCounter) {
        const length = Math.min(this.value.length, this.maxLength);
        return !shouldRenderCharCounter ? '' : html$2 `
      <span class="mdc-text-field-character-counter"
            >${length} / ${this.maxLength}</span>`;
    }
    onInputFocus() {
        this.focused = true;
    }
    onInputBlur() {
        this.focused = false;
        this.reportValidity();
    }
    checkValidity() {
        const isValid = this._checkValidity(this.value);
        if (!isValid) {
            const invalidEvent = new Event('invalid', { bubbles: false, cancelable: true });
            this.dispatchEvent(invalidEvent);
        }
        return isValid;
    }
    reportValidity() {
        const isValid = this.checkValidity();
        this.mdcFoundation.setValid(isValid);
        this.isUiValid = isValid;
        return isValid;
    }
    _checkValidity(value) {
        const nativeValidity = this.formElement.validity;
        let validity = createValidityObj(nativeValidity);
        if (this.validityTransform) {
            const customValidity = this.validityTransform(value, validity);
            validity = Object.assign(Object.assign({}, validity), customValidity);
            this.mdcFoundation.setUseNativeValidation(false);
        }
        else {
            this.mdcFoundation.setUseNativeValidation(true);
        }
        this._validity = validity;
        return this._validity.valid;
    }
    setCustomValidity(message) {
        this.validationMessage = message;
        this.formElement.setCustomValidity(message);
    }
    handleInputChange() {
        this.value = this.formElement.value;
    }
    createFoundation() {
        if (this.mdcFoundation !== undefined) {
            this.mdcFoundation.destroy();
        }
        this.mdcFoundation = new this.mdcFoundationClass(this.createAdapter());
        this.mdcFoundation.init();
    }
    createAdapter() {
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, this.getRootAdapterMethods()), this.getInputAdapterMethods()), this.getLabelAdapterMethods()), this.getLineRippleAdapterMethods()), this.getOutlineAdapterMethods());
    }
    getRootAdapterMethods() {
        return Object.assign({ registerTextFieldInteractionHandler: (evtType, handler) => this.addEventListener(evtType, handler), deregisterTextFieldInteractionHandler: (evtType, handler) => this.removeEventListener(evtType, handler), registerValidationAttributeChangeHandler: (handler) => {
                const getAttributesList = (mutationsList) => {
                    return mutationsList.map((mutation) => mutation.attributeName)
                        .filter((attributeName) => attributeName);
                };
                const observer = new MutationObserver((mutationsList) => {
                    handler(getAttributesList(mutationsList));
                });
                const config = { attributes: true };
                observer.observe(this.formElement, config);
                return observer;
            }, deregisterValidationAttributeChangeHandler: (observer) => observer.disconnect() }, addHasRemoveClass(this.mdcRoot));
    }
    getInputAdapterMethods() {
        return {
            getNativeInput: () => this.formElement,
            // since HelperTextFoundation is not used, aria-describedby a11y logic
            // is implemented in render method instead of these adapter methods
            setInputAttr: () => undefined,
            removeInputAttr: () => undefined,
            isFocused: () => this.shadowRoot ?
                this.shadowRoot.activeElement === this.formElement :
                false,
            registerInputInteractionHandler: (evtType, handler) => this.formElement.addEventListener(evtType, handler, { passive: evtType in passiveEvents }),
            deregisterInputInteractionHandler: (evtType, handler) => this.formElement.removeEventListener(evtType, handler),
        };
    }
    getLabelAdapterMethods() {
        return {
            floatLabel: (shouldFloat) => this.labelElement &&
                this.labelElement.floatingLabelFoundation.float(shouldFloat),
            getLabelWidth: () => {
                return this.labelElement ?
                    this.labelElement.floatingLabelFoundation.getWidth() :
                    0;
            },
            hasLabel: () => Boolean(this.labelElement),
            shakeLabel: (shouldShake) => this.labelElement &&
                this.labelElement.floatingLabelFoundation.shake(shouldShake),
            setLabelRequired: (isRequired) => {
                if (this.labelElement) {
                    this.labelElement.floatingLabelFoundation.setRequired(isRequired);
                }
            },
        };
    }
    getLineRippleAdapterMethods() {
        return {
            activateLineRipple: () => {
                if (this.lineRippleElement) {
                    this.lineRippleElement.lineRippleFoundation.activate();
                }
            },
            deactivateLineRipple: () => {
                if (this.lineRippleElement) {
                    this.lineRippleElement.lineRippleFoundation.deactivate();
                }
            },
            setLineRippleTransformOrigin: (normalizedX) => {
                if (this.lineRippleElement) {
                    this.lineRippleElement.lineRippleFoundation.setRippleCenter(normalizedX);
                }
            },
        };
    }
    async _getUpdateComplete() {
        await super._getUpdateComplete();
        await this._outlineUpdateComplete;
    }
    async firstUpdated() {
        const outlineElement = this.outlineElement;
        if (outlineElement) {
            this._outlineUpdateComplete = outlineElement.updateComplete;
            await this._outlineUpdateComplete;
        }
        super.firstUpdated();
        this.mdcFoundation.setValidateOnValueChange(this.autoValidate);
        if (this.validateOnInitialRender) {
            this.reportValidity();
        }
    }
    getOutlineAdapterMethods() {
        return {
            closeOutline: () => this.outlineElement && (this.outlineOpen = false),
            hasOutline: () => Boolean(this.outlineElement),
            notchOutline: (labelWidth) => {
                const outlineElement = this.outlineElement;
                if (outlineElement && !this.outlineOpen) {
                    this.outlineWidth = labelWidth;
                    this.outlineOpen = true;
                }
            }
        };
    }
    async layout() {
        await this.updateComplete;
        const labelElement = this.labelElement;
        if (!labelElement) {
            this.outlineOpen = false;
            return;
        }
        const shouldFloat = !!this.label && !!this.value;
        labelElement.floatingLabelFoundation.float(shouldFloat);
        if (!this.outlined) {
            return;
        }
        this.outlineOpen = shouldFloat;
        await this.updateComplete;
        /* When the textfield automatically notches due to a value and label
         * being defined, the textfield may be set to `display: none` by the user.
         * this means that the notch is of size 0px. We provide this function so
         * that the user may manually resize the notch to the floated label's
         * width.
         */
        const labelWidth = labelElement.floatingLabelFoundation.getWidth();
        if (this.outlineOpen) {
            this.outlineWidth = labelWidth;
        }
    }
}
__decorate([
    query('.mdc-text-field')
], TextFieldBase.prototype, "mdcRoot", void 0);
__decorate([
    query('input')
], TextFieldBase.prototype, "formElement", void 0);
__decorate([
    query('.mdc-floating-label')
], TextFieldBase.prototype, "labelElement", void 0);
__decorate([
    query('.mdc-line-ripple')
], TextFieldBase.prototype, "lineRippleElement", void 0);
__decorate([
    query('mwc-notched-outline')
], TextFieldBase.prototype, "outlineElement", void 0);
__decorate([
    query('.mdc-notched-outline__notch')
], TextFieldBase.prototype, "notchElement", void 0);
__decorate([
    property({ type: String })
], TextFieldBase.prototype, "value", void 0);
__decorate([
    property({ type: String })
], TextFieldBase.prototype, "type", void 0);
__decorate([
    property({ type: String })
], TextFieldBase.prototype, "placeholder", void 0);
__decorate([
    property({ type: String }),
    observer(function (_newVal, oldVal) {
        if (oldVal !== undefined && this.label !== oldVal) {
            this.layout();
        }
    })
], TextFieldBase.prototype, "label", void 0);
__decorate([
    property({ type: String })
], TextFieldBase.prototype, "icon", void 0);
__decorate([
    property({ type: String })
], TextFieldBase.prototype, "iconTrailing", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], TextFieldBase.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean })
], TextFieldBase.prototype, "required", void 0);
__decorate([
    property({ type: Number })
], TextFieldBase.prototype, "minLength", void 0);
__decorate([
    property({ type: Number })
], TextFieldBase.prototype, "maxLength", void 0);
__decorate([
    property({ type: Boolean, reflect: true }),
    observer(function (_newVal, oldVal) {
        if (oldVal !== undefined && this.outlined !== oldVal) {
            this.layout();
        }
    })
], TextFieldBase.prototype, "outlined", void 0);
__decorate([
    property({ type: String })
], TextFieldBase.prototype, "helper", void 0);
__decorate([
    property({ type: Boolean })
], TextFieldBase.prototype, "validateOnInitialRender", void 0);
__decorate([
    property({ type: String })
], TextFieldBase.prototype, "validationMessage", void 0);
__decorate([
    property({ type: Boolean })
], TextFieldBase.prototype, "autoValidate", void 0);
__decorate([
    property({ type: String })
], TextFieldBase.prototype, "pattern", void 0);
__decorate([
    property({ type: String })
], TextFieldBase.prototype, "min", void 0);
__decorate([
    property({ type: String })
], TextFieldBase.prototype, "max", void 0);
__decorate([
    property({ type: Number })
], TextFieldBase.prototype, "step", void 0);
__decorate([
    property({ type: Number })
], TextFieldBase.prototype, "size", void 0);
__decorate([
    property({ type: Boolean })
], TextFieldBase.prototype, "helperPersistent", void 0);
__decorate([
    property({ type: Boolean })
], TextFieldBase.prototype, "charCounter", void 0);
__decorate([
    property({ type: Boolean })
], TextFieldBase.prototype, "endAligned", void 0);
__decorate([
    property({ type: String })
], TextFieldBase.prototype, "prefix", void 0);
__decorate([
    property({ type: String })
], TextFieldBase.prototype, "suffix", void 0);
__decorate([
    property({ type: String })
], TextFieldBase.prototype, "name", void 0);
__decorate([
    property({ type: String })
], TextFieldBase.prototype, "inputMode", void 0);
__decorate([
    property({ type: Boolean })
], TextFieldBase.prototype, "readOnly", void 0);
__decorate([
    property({ type: String })
], TextFieldBase.prototype, "autocapitalize", void 0);
__decorate([
    property({ type: Boolean })
], TextFieldBase.prototype, "outlineOpen", void 0);
__decorate([
    property({ type: Number })
], TextFieldBase.prototype, "outlineWidth", void 0);
__decorate([
    property({ type: Boolean })
], TextFieldBase.prototype, "isUiValid", void 0);
__decorate([
    internalProperty()
], TextFieldBase.prototype, "focused", void 0);
__decorate([
    eventOptions({ passive: true })
], TextFieldBase.prototype, "handleInputChange", null);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$1 = css `.mdc-floating-label{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-subtitle1-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:1rem;font-size:var(--mdc-typography-subtitle1-font-size, 1rem);font-weight:400;font-weight:var(--mdc-typography-subtitle1-font-weight, 400);letter-spacing:0.009375em;letter-spacing:var(--mdc-typography-subtitle1-letter-spacing, 0.009375em);text-decoration:inherit;text-decoration:var(--mdc-typography-subtitle1-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-subtitle1-text-transform, inherit);position:absolute;left:0;transform-origin:left top;line-height:1.15rem;text-align:left;text-overflow:ellipsis;white-space:nowrap;cursor:text;overflow:hidden;will-change:transform;transition:transform 150ms cubic-bezier(0.4, 0, 0.2, 1),color 150ms cubic-bezier(0.4, 0, 0.2, 1)}[dir=rtl] .mdc-floating-label,.mdc-floating-label[dir=rtl]{right:0;left:auto;transform-origin:right top;text-align:right}.mdc-floating-label--float-above{cursor:auto}.mdc-floating-label--required::after{margin-left:1px;margin-right:0px;content:"*"}[dir=rtl] .mdc-floating-label--required::after,.mdc-floating-label--required[dir=rtl]::after{margin-left:0;margin-right:1px}.mdc-floating-label--float-above{transform:translateY(-106%) scale(0.75)}.mdc-floating-label--shake{animation:mdc-floating-label-shake-float-above-standard 250ms 1}@keyframes mdc-floating-label-shake-float-above-standard{0%{transform:translateX(calc(0 - 0%)) translateY(-106%) scale(0.75)}33%{animation-timing-function:cubic-bezier(0.5, 0, 0.701732, 0.495819);transform:translateX(calc(4% - 0%)) translateY(-106%) scale(0.75)}66%{animation-timing-function:cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);transform:translateX(calc(-4% - 0%)) translateY(-106%) scale(0.75)}100%{transform:translateX(calc(0 - 0%)) translateY(-106%) scale(0.75)}}.mdc-line-ripple::before,.mdc-line-ripple::after{position:absolute;bottom:0;left:0;width:100%;border-bottom-style:solid;content:""}.mdc-line-ripple::before{border-bottom-width:1px;z-index:1}.mdc-line-ripple::after{transform:scaleX(0);border-bottom-width:2px;opacity:0;z-index:2}.mdc-line-ripple::after{transition:transform 180ms cubic-bezier(0.4, 0, 0.2, 1),opacity 180ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-line-ripple--active::after{transform:scaleX(1);opacity:1}.mdc-line-ripple--deactivating::after{opacity:0}.mdc-notched-outline{display:flex;position:absolute;top:0;right:0;left:0;box-sizing:border-box;width:100%;max-width:100%;height:100%;text-align:left;pointer-events:none}[dir=rtl] .mdc-notched-outline,.mdc-notched-outline[dir=rtl]{text-align:right}.mdc-notched-outline__leading,.mdc-notched-outline__notch,.mdc-notched-outline__trailing{box-sizing:border-box;height:100%;border-top:1px solid;border-bottom:1px solid;pointer-events:none}.mdc-notched-outline__leading{border-left:1px solid;border-right:none;width:12px}[dir=rtl] .mdc-notched-outline__leading,.mdc-notched-outline__leading[dir=rtl]{border-left:none;border-right:1px solid}.mdc-notched-outline__trailing{border-left:none;border-right:1px solid;flex-grow:1}[dir=rtl] .mdc-notched-outline__trailing,.mdc-notched-outline__trailing[dir=rtl]{border-left:1px solid;border-right:none}.mdc-notched-outline__notch{flex:0 0 auto;width:auto;max-width:calc(100% - 12px * 2)}.mdc-notched-outline .mdc-floating-label{display:inline-block;position:relative;max-width:100%}.mdc-notched-outline .mdc-floating-label--float-above{text-overflow:clip}.mdc-notched-outline--upgraded .mdc-floating-label--float-above{max-width:calc(100% / 0.75)}.mdc-notched-outline--notched .mdc-notched-outline__notch{padding-left:0;padding-right:8px;border-top:none}[dir=rtl] .mdc-notched-outline--notched .mdc-notched-outline__notch,.mdc-notched-outline--notched .mdc-notched-outline__notch[dir=rtl]{padding-left:8px;padding-right:0}.mdc-notched-outline--no-label .mdc-notched-outline__notch{display:none}@keyframes mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}.mdc-text-field--filled{--mdc-ripple-fg-size: 0;--mdc-ripple-left: 0;--mdc-ripple-top: 0;--mdc-ripple-fg-scale: 1;--mdc-ripple-fg-translate-end: 0;--mdc-ripple-fg-translate-start: 0;-webkit-tap-highlight-color:rgba(0,0,0,0);will-change:transform,opacity}.mdc-text-field--filled .mdc-text-field__ripple::before,.mdc-text-field--filled .mdc-text-field__ripple::after{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:""}.mdc-text-field--filled .mdc-text-field__ripple::before{transition:opacity 15ms linear,background-color 15ms linear;z-index:1;z-index:var(--mdc-ripple-z-index, 1)}.mdc-text-field--filled .mdc-text-field__ripple::after{z-index:0;z-index:var(--mdc-ripple-z-index, 0)}.mdc-text-field--filled.mdc-ripple-upgraded .mdc-text-field__ripple::before{transform:scale(var(--mdc-ripple-fg-scale, 1))}.mdc-text-field--filled.mdc-ripple-upgraded .mdc-text-field__ripple::after{top:0;left:0;transform:scale(0);transform-origin:center center}.mdc-text-field--filled.mdc-ripple-upgraded--unbounded .mdc-text-field__ripple::after{top:var(--mdc-ripple-top, 0);left:var(--mdc-ripple-left, 0)}.mdc-text-field--filled.mdc-ripple-upgraded--foreground-activation .mdc-text-field__ripple::after{animation:mdc-ripple-fg-radius-in 225ms forwards,mdc-ripple-fg-opacity-in 75ms forwards}.mdc-text-field--filled.mdc-ripple-upgraded--foreground-deactivation .mdc-text-field__ripple::after{animation:mdc-ripple-fg-opacity-out 150ms;transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}.mdc-text-field--filled .mdc-text-field__ripple::before,.mdc-text-field--filled .mdc-text-field__ripple::after{top:calc(50% - 100%);left:calc(50% - 100%);width:200%;height:200%}.mdc-text-field--filled.mdc-ripple-upgraded .mdc-text-field__ripple::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}.mdc-text-field__ripple{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}.mdc-text-field{border-top-left-radius:4px;border-top-left-radius:var(--mdc-shape-small, 4px);border-top-right-radius:4px;border-top-right-radius:var(--mdc-shape-small, 4px);border-bottom-right-radius:0;border-bottom-left-radius:0;display:inline-flex;align-items:baseline;padding:0 16px;position:relative;box-sizing:border-box;overflow:hidden;will-change:opacity,transform,color}.mdc-text-field:not(.mdc-text-field--disabled) .mdc-floating-label{color:rgba(0, 0, 0, 0.6)}.mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__input{color:rgba(0, 0, 0, 0.87)}@media all{.mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__input::placeholder{color:rgba(0, 0, 0, 0.54)}}@media all{.mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__input:-ms-input-placeholder{color:rgba(0, 0, 0, 0.54)}}.mdc-text-field .mdc-text-field__input{caret-color:#6200ee;caret-color:var(--mdc-theme-primary, #6200ee)}.mdc-text-field:not(.mdc-text-field--disabled)+.mdc-text-field-helper-line .mdc-text-field-helper-text{color:rgba(0, 0, 0, 0.6)}.mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field-character-counter,.mdc-text-field:not(.mdc-text-field--disabled)+.mdc-text-field-helper-line .mdc-text-field-character-counter{color:rgba(0, 0, 0, 0.6)}.mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__icon--leading{color:rgba(0, 0, 0, 0.54)}.mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__icon--trailing{color:rgba(0, 0, 0, 0.54)}.mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__affix--prefix{color:rgba(0, 0, 0, 0.6)}.mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__affix--suffix{color:rgba(0, 0, 0, 0.6)}.mdc-text-field .mdc-floating-label{top:50%;transform:translateY(-50%);pointer-events:none}.mdc-text-field__input{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-subtitle1-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:1rem;font-size:var(--mdc-typography-subtitle1-font-size, 1rem);font-weight:400;font-weight:var(--mdc-typography-subtitle1-font-weight, 400);letter-spacing:0.009375em;letter-spacing:var(--mdc-typography-subtitle1-letter-spacing, 0.009375em);text-decoration:inherit;text-decoration:var(--mdc-typography-subtitle1-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-subtitle1-text-transform, inherit);height:28px;transition:opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);width:100%;min-width:0;border:none;border-radius:0;background:none;appearance:none;padding:0}.mdc-text-field__input::-ms-clear{display:none}.mdc-text-field__input::-webkit-calendar-picker-indicator{display:none}.mdc-text-field__input:focus{outline:none}.mdc-text-field__input:invalid{box-shadow:none}@media all{.mdc-text-field__input::placeholder{transition:opacity 67ms cubic-bezier(0.4, 0, 0.2, 1);opacity:0}}@media all{.mdc-text-field__input:-ms-input-placeholder{transition:opacity 67ms cubic-bezier(0.4, 0, 0.2, 1);opacity:0}}@media all{.mdc-text-field--no-label .mdc-text-field__input::placeholder,.mdc-text-field--focused .mdc-text-field__input::placeholder{transition-delay:40ms;transition-duration:110ms;opacity:1}}@media all{.mdc-text-field--no-label .mdc-text-field__input:-ms-input-placeholder,.mdc-text-field--focused .mdc-text-field__input:-ms-input-placeholder{transition-delay:40ms;transition-duration:110ms;opacity:1}}.mdc-text-field__affix{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-subtitle1-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:1rem;font-size:var(--mdc-typography-subtitle1-font-size, 1rem);font-weight:400;font-weight:var(--mdc-typography-subtitle1-font-weight, 400);letter-spacing:0.009375em;letter-spacing:var(--mdc-typography-subtitle1-letter-spacing, 0.009375em);text-decoration:inherit;text-decoration:var(--mdc-typography-subtitle1-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-subtitle1-text-transform, inherit);height:28px;transition:opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);opacity:0;white-space:nowrap}.mdc-text-field--label-floating .mdc-text-field__affix,.mdc-text-field--no-label .mdc-text-field__affix{opacity:1}@supports(-webkit-hyphens: none){.mdc-text-field--outlined .mdc-text-field__affix{align-items:center;align-self:center;display:inline-flex;height:100%}}.mdc-text-field__affix--prefix{padding-left:0;padding-right:2px}[dir=rtl] .mdc-text-field__affix--prefix,.mdc-text-field__affix--prefix[dir=rtl]{padding-left:2px;padding-right:0}.mdc-text-field--end-aligned .mdc-text-field__affix--prefix{padding-left:0;padding-right:12px}[dir=rtl] .mdc-text-field--end-aligned .mdc-text-field__affix--prefix,.mdc-text-field--end-aligned .mdc-text-field__affix--prefix[dir=rtl]{padding-left:12px;padding-right:0}.mdc-text-field__affix--suffix{padding-left:12px;padding-right:0}[dir=rtl] .mdc-text-field__affix--suffix,.mdc-text-field__affix--suffix[dir=rtl]{padding-left:0;padding-right:12px}.mdc-text-field--end-aligned .mdc-text-field__affix--suffix{padding-left:2px;padding-right:0}[dir=rtl] .mdc-text-field--end-aligned .mdc-text-field__affix--suffix,.mdc-text-field--end-aligned .mdc-text-field__affix--suffix[dir=rtl]{padding-left:0;padding-right:2px}.mdc-text-field--filled{height:56px}.mdc-text-field--filled .mdc-text-field__ripple::before,.mdc-text-field--filled .mdc-text-field__ripple::after{background-color:rgba(0, 0, 0, 0.87);background-color:var(--mdc-ripple-color, rgba(0, 0, 0, 0.87))}.mdc-text-field--filled:hover .mdc-text-field__ripple::before,.mdc-text-field--filled.mdc-ripple-surface--hover .mdc-text-field__ripple::before{opacity:0.04;opacity:var(--mdc-ripple-hover-opacity, 0.04)}.mdc-text-field--filled.mdc-ripple-upgraded--background-focused .mdc-text-field__ripple::before,.mdc-text-field--filled:not(.mdc-ripple-upgraded):focus .mdc-text-field__ripple::before{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-focus-opacity, 0.12)}.mdc-text-field--filled::before{display:inline-block;width:0;height:40px;content:"";vertical-align:0}.mdc-text-field--filled:not(.mdc-text-field--disabled){background-color:whitesmoke}.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-line-ripple::before{border-bottom-color:rgba(0, 0, 0, 0.42)}.mdc-text-field--filled:not(.mdc-text-field--disabled):hover .mdc-line-ripple::before{border-bottom-color:rgba(0, 0, 0, 0.87)}.mdc-text-field--filled .mdc-line-ripple::after{border-bottom-color:#6200ee;border-bottom-color:var(--mdc-theme-primary, #6200ee)}.mdc-text-field--filled .mdc-floating-label{left:16px;right:initial}[dir=rtl] .mdc-text-field--filled .mdc-floating-label,.mdc-text-field--filled .mdc-floating-label[dir=rtl]{left:initial;right:16px}.mdc-text-field--filled .mdc-floating-label--float-above{transform:translateY(-106%) scale(0.75)}.mdc-text-field--filled.mdc-text-field--no-label .mdc-text-field__input{height:100%}.mdc-text-field--filled.mdc-text-field--no-label .mdc-floating-label{display:none}.mdc-text-field--filled.mdc-text-field--no-label::before{display:none}@supports(-webkit-hyphens: none){.mdc-text-field--filled.mdc-text-field--no-label .mdc-text-field__affix{align-items:center;align-self:center;display:inline-flex;height:100%}}.mdc-text-field--outlined{height:56px;overflow:visible}.mdc-text-field--outlined .mdc-floating-label--float-above{transform:translateY(-37.25px) scale(1)}.mdc-text-field--outlined .mdc-floating-label--float-above{font-size:.75rem}.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above{transform:translateY(-34.75px) scale(0.75)}.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above{font-size:1rem}.mdc-text-field--outlined .mdc-floating-label--shake{animation:mdc-floating-label-shake-float-above-text-field-outlined 250ms 1}@keyframes mdc-floating-label-shake-float-above-text-field-outlined{0%{transform:translateX(calc(0 - 0%)) translateY(-34.75px) scale(0.75)}33%{animation-timing-function:cubic-bezier(0.5, 0, 0.701732, 0.495819);transform:translateX(calc(4% - 0%)) translateY(-34.75px) scale(0.75)}66%{animation-timing-function:cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);transform:translateX(calc(-4% - 0%)) translateY(-34.75px) scale(0.75)}100%{transform:translateX(calc(0 - 0%)) translateY(-34.75px) scale(0.75)}}.mdc-text-field--outlined .mdc-text-field__input{height:100%}.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__leading,.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__notch,.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing{border-color:rgba(0, 0, 0, 0.38)}.mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-notched-outline .mdc-notched-outline__leading,.mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-notched-outline .mdc-notched-outline__notch,.mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-notched-outline .mdc-notched-outline__trailing{border-color:rgba(0, 0, 0, 0.87)}.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline__leading,.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline__notch,.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline__trailing{border-color:#6200ee;border-color:var(--mdc-theme-primary, #6200ee)}.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__leading{border-top-left-radius:4px;border-top-left-radius:var(--mdc-shape-small, 4px);border-top-right-radius:0;border-bottom-right-radius:0;border-bottom-left-radius:4px;border-bottom-left-radius:var(--mdc-shape-small, 4px)}[dir=rtl] .mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__leading,.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__leading[dir=rtl]{border-top-left-radius:0;border-top-right-radius:4px;border-top-right-radius:var(--mdc-shape-small, 4px);border-bottom-right-radius:4px;border-bottom-right-radius:var(--mdc-shape-small, 4px);border-bottom-left-radius:0}@supports(top: max(0%)){.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__leading{width:max(12px, var(--mdc-shape-small, 4px))}}@supports(top: max(0%)){.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__notch{max-width:calc(100% - max(12px, var(--mdc-shape-small, 4px)) * 2)}}.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__trailing{border-top-left-radius:0;border-top-right-radius:4px;border-top-right-radius:var(--mdc-shape-small, 4px);border-bottom-right-radius:4px;border-bottom-right-radius:var(--mdc-shape-small, 4px);border-bottom-left-radius:0}[dir=rtl] .mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__trailing,.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__trailing[dir=rtl]{border-top-left-radius:4px;border-top-left-radius:var(--mdc-shape-small, 4px);border-top-right-radius:0;border-bottom-right-radius:0;border-bottom-left-radius:4px;border-bottom-left-radius:var(--mdc-shape-small, 4px)}@supports(top: max(0%)){.mdc-text-field--outlined{padding-left:max(16px, calc(var(--mdc-shape-small, 4px) + 4px))}}@supports(top: max(0%)){.mdc-text-field--outlined{padding-right:max(16px, var(--mdc-shape-small, 4px))}}@supports(top: max(0%)){.mdc-text-field--outlined+.mdc-text-field-helper-line{padding-left:max(16px, calc(var(--mdc-shape-small, 4px) + 4px))}}@supports(top: max(0%)){.mdc-text-field--outlined+.mdc-text-field-helper-line{padding-right:max(16px, var(--mdc-shape-small, 4px))}}.mdc-text-field--outlined.mdc-text-field--with-leading-icon{padding-left:0}@supports(top: max(0%)){.mdc-text-field--outlined.mdc-text-field--with-leading-icon{padding-right:max(16px, var(--mdc-shape-small, 4px))}}[dir=rtl] .mdc-text-field--outlined.mdc-text-field--with-leading-icon,.mdc-text-field--outlined.mdc-text-field--with-leading-icon[dir=rtl]{padding-right:0}@supports(top: max(0%)){[dir=rtl] .mdc-text-field--outlined.mdc-text-field--with-leading-icon,.mdc-text-field--outlined.mdc-text-field--with-leading-icon[dir=rtl]{padding-left:max(16px, var(--mdc-shape-small, 4px))}}.mdc-text-field--outlined.mdc-text-field--with-trailing-icon{padding-right:0}@supports(top: max(0%)){.mdc-text-field--outlined.mdc-text-field--with-trailing-icon{padding-left:max(16px, calc(var(--mdc-shape-small, 4px) + 4px))}}[dir=rtl] .mdc-text-field--outlined.mdc-text-field--with-trailing-icon,.mdc-text-field--outlined.mdc-text-field--with-trailing-icon[dir=rtl]{padding-left:0}@supports(top: max(0%)){[dir=rtl] .mdc-text-field--outlined.mdc-text-field--with-trailing-icon,.mdc-text-field--outlined.mdc-text-field--with-trailing-icon[dir=rtl]{padding-right:max(16px, calc(var(--mdc-shape-small, 4px) + 4px))}}.mdc-text-field--outlined.mdc-text-field--with-leading-icon.mdc-text-field--with-trailing-icon{padding-left:0;padding-right:0}.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch{padding-top:1px}.mdc-text-field--outlined .mdc-text-field__ripple::before,.mdc-text-field--outlined .mdc-text-field__ripple::after{content:none}.mdc-text-field--outlined .mdc-floating-label{left:4px;right:initial}[dir=rtl] .mdc-text-field--outlined .mdc-floating-label,.mdc-text-field--outlined .mdc-floating-label[dir=rtl]{left:initial;right:4px}.mdc-text-field--outlined .mdc-text-field__input{display:flex;border:none !important;background-color:transparent}.mdc-text-field--outlined .mdc-notched-outline{z-index:1}.mdc-text-field--textarea{flex-direction:column;align-items:center;width:auto;height:auto;padding:0;transition:none}.mdc-text-field--textarea .mdc-floating-label{top:19px}.mdc-text-field--textarea .mdc-floating-label:not(.mdc-floating-label--float-above){transform:none}.mdc-text-field--textarea .mdc-text-field__input{flex-grow:1;height:auto;min-height:1.5rem;overflow-x:hidden;overflow-y:auto;box-sizing:border-box;resize:none;padding:0 16px;line-height:1.5rem}.mdc-text-field--textarea.mdc-text-field--filled::before{display:none}.mdc-text-field--textarea.mdc-text-field--filled .mdc-floating-label--float-above{transform:translateY(-10.25px) scale(0.75)}.mdc-text-field--textarea.mdc-text-field--filled .mdc-floating-label--shake{animation:mdc-floating-label-shake-float-above-textarea-filled 250ms 1}@keyframes mdc-floating-label-shake-float-above-textarea-filled{0%{transform:translateX(calc(0 - 0%)) translateY(-10.25px) scale(0.75)}33%{animation-timing-function:cubic-bezier(0.5, 0, 0.701732, 0.495819);transform:translateX(calc(4% - 0%)) translateY(-10.25px) scale(0.75)}66%{animation-timing-function:cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);transform:translateX(calc(-4% - 0%)) translateY(-10.25px) scale(0.75)}100%{transform:translateX(calc(0 - 0%)) translateY(-10.25px) scale(0.75)}}.mdc-text-field--textarea.mdc-text-field--filled .mdc-text-field__input{margin-top:23px;margin-bottom:9px}.mdc-text-field--textarea.mdc-text-field--filled.mdc-text-field--no-label .mdc-text-field__input{margin-top:16px;margin-bottom:16px}.mdc-text-field--textarea.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch{padding-top:0}.mdc-text-field--textarea.mdc-text-field--outlined .mdc-floating-label--float-above{transform:translateY(-27.25px) scale(1)}.mdc-text-field--textarea.mdc-text-field--outlined .mdc-floating-label--float-above{font-size:.75rem}.mdc-text-field--textarea.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-text-field--textarea.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above{transform:translateY(-24.75px) scale(0.75)}.mdc-text-field--textarea.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-text-field--textarea.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above{font-size:1rem}.mdc-text-field--textarea.mdc-text-field--outlined .mdc-floating-label--shake{animation:mdc-floating-label-shake-float-above-textarea-outlined 250ms 1}@keyframes mdc-floating-label-shake-float-above-textarea-outlined{0%{transform:translateX(calc(0 - 0%)) translateY(-24.75px) scale(0.75)}33%{animation-timing-function:cubic-bezier(0.5, 0, 0.701732, 0.495819);transform:translateX(calc(4% - 0%)) translateY(-24.75px) scale(0.75)}66%{animation-timing-function:cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);transform:translateX(calc(-4% - 0%)) translateY(-24.75px) scale(0.75)}100%{transform:translateX(calc(0 - 0%)) translateY(-24.75px) scale(0.75)}}.mdc-text-field--textarea.mdc-text-field--outlined .mdc-text-field__input{margin-top:16px;margin-bottom:16px}.mdc-text-field--textarea.mdc-text-field--outlined .mdc-floating-label{top:18px}.mdc-text-field--textarea.mdc-text-field--with-internal-counter .mdc-text-field__input{margin-bottom:2px}.mdc-text-field--textarea.mdc-text-field--with-internal-counter .mdc-text-field-character-counter{align-self:flex-end;padding:0 16px}.mdc-text-field--textarea.mdc-text-field--with-internal-counter .mdc-text-field-character-counter::after{display:inline-block;width:0;height:16px;content:"";vertical-align:-16px}.mdc-text-field--textarea.mdc-text-field--with-internal-counter .mdc-text-field-character-counter::before{display:none}.mdc-text-field__resizer{align-self:stretch;display:inline-flex;flex-direction:column;flex-grow:1;max-height:100%;max-width:100%;min-height:56px;min-width:fit-content;min-width:-moz-available;min-width:-webkit-fill-available;overflow:hidden;resize:both}.mdc-text-field--filled .mdc-text-field__resizer{transform:translateY(-1px)}.mdc-text-field--filled .mdc-text-field__resizer .mdc-text-field__input,.mdc-text-field--filled .mdc-text-field__resizer .mdc-text-field-character-counter{transform:translateY(1px)}.mdc-text-field--outlined .mdc-text-field__resizer{transform:translateX(-1px) translateY(-1px)}[dir=rtl] .mdc-text-field--outlined .mdc-text-field__resizer,.mdc-text-field--outlined .mdc-text-field__resizer[dir=rtl]{transform:translateX(1px) translateY(-1px)}.mdc-text-field--outlined .mdc-text-field__resizer .mdc-text-field__input,.mdc-text-field--outlined .mdc-text-field__resizer .mdc-text-field-character-counter{transform:translateX(1px) translateY(1px)}[dir=rtl] .mdc-text-field--outlined .mdc-text-field__resizer .mdc-text-field__input,.mdc-text-field--outlined .mdc-text-field__resizer .mdc-text-field__input[dir=rtl],[dir=rtl] .mdc-text-field--outlined .mdc-text-field__resizer .mdc-text-field-character-counter,.mdc-text-field--outlined .mdc-text-field__resizer .mdc-text-field-character-counter[dir=rtl]{transform:translateX(-1px) translateY(1px)}.mdc-text-field--with-leading-icon{padding-left:0;padding-right:16px}[dir=rtl] .mdc-text-field--with-leading-icon,.mdc-text-field--with-leading-icon[dir=rtl]{padding-left:16px;padding-right:0}.mdc-text-field--with-leading-icon.mdc-text-field--filled .mdc-floating-label{max-width:calc(100% - 48px);left:48px;right:initial}[dir=rtl] .mdc-text-field--with-leading-icon.mdc-text-field--filled .mdc-floating-label,.mdc-text-field--with-leading-icon.mdc-text-field--filled .mdc-floating-label[dir=rtl]{left:initial;right:48px}.mdc-text-field--with-leading-icon.mdc-text-field--filled .mdc-floating-label--float-above{max-width:calc(100% / 0.75 - 64px / 0.75)}.mdc-text-field--with-leading-icon.mdc-text-field--outlined .mdc-floating-label{left:36px;right:initial}[dir=rtl] .mdc-text-field--with-leading-icon.mdc-text-field--outlined .mdc-floating-label,.mdc-text-field--with-leading-icon.mdc-text-field--outlined .mdc-floating-label[dir=rtl]{left:initial;right:36px}.mdc-text-field--with-leading-icon.mdc-text-field--outlined :not(.mdc-notched-outline--notched) .mdc-notched-outline__notch{max-width:calc(100% - 60px)}.mdc-text-field--with-leading-icon.mdc-text-field--outlined .mdc-floating-label--float-above{transform:translateY(-37.25px) translateX(-32px) scale(1)}[dir=rtl] .mdc-text-field--with-leading-icon.mdc-text-field--outlined .mdc-floating-label--float-above,.mdc-text-field--with-leading-icon.mdc-text-field--outlined .mdc-floating-label--float-above[dir=rtl]{transform:translateY(-37.25px) translateX(32px) scale(1)}.mdc-text-field--with-leading-icon.mdc-text-field--outlined .mdc-floating-label--float-above{font-size:.75rem}.mdc-text-field--with-leading-icon.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-text-field--with-leading-icon.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above{transform:translateY(-34.75px) translateX(-32px) scale(0.75)}[dir=rtl] .mdc-text-field--with-leading-icon.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-text-field--with-leading-icon.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above[dir=rtl],[dir=rtl] .mdc-text-field--with-leading-icon.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-text-field--with-leading-icon.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above[dir=rtl]{transform:translateY(-34.75px) translateX(32px) scale(0.75)}.mdc-text-field--with-leading-icon.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-text-field--with-leading-icon.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above{font-size:1rem}.mdc-text-field--with-leading-icon.mdc-text-field--outlined .mdc-floating-label--shake{animation:mdc-floating-label-shake-float-above-text-field-outlined-leading-icon 250ms 1}@keyframes mdc-floating-label-shake-float-above-text-field-outlined-leading-icon{0%{transform:translateX(calc(0 - 32px)) translateY(-34.75px) scale(0.75)}33%{animation-timing-function:cubic-bezier(0.5, 0, 0.701732, 0.495819);transform:translateX(calc(4% - 32px)) translateY(-34.75px) scale(0.75)}66%{animation-timing-function:cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);transform:translateX(calc(-4% - 32px)) translateY(-34.75px) scale(0.75)}100%{transform:translateX(calc(0 - 32px)) translateY(-34.75px) scale(0.75)}}[dir=rtl] .mdc-text-field--with-leading-icon.mdc-text-field--outlined .mdc-floating-label--shake,.mdc-text-field--with-leading-icon.mdc-text-field--outlined[dir=rtl] .mdc-floating-label--shake{animation:mdc-floating-label-shake-float-above-text-field-outlined-leading-icon 250ms 1}@keyframes mdc-floating-label-shake-float-above-text-field-outlined-leading-icon-rtl{0%{transform:translateX(calc(0 - -32px)) translateY(-34.75px) scale(0.75)}33%{animation-timing-function:cubic-bezier(0.5, 0, 0.701732, 0.495819);transform:translateX(calc(4% - -32px)) translateY(-34.75px) scale(0.75)}66%{animation-timing-function:cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);transform:translateX(calc(-4% - -32px)) translateY(-34.75px) scale(0.75)}100%{transform:translateX(calc(0 - -32px)) translateY(-34.75px) scale(0.75)}}.mdc-text-field--with-trailing-icon{padding-left:16px;padding-right:0}[dir=rtl] .mdc-text-field--with-trailing-icon,.mdc-text-field--with-trailing-icon[dir=rtl]{padding-left:0;padding-right:16px}.mdc-text-field--with-trailing-icon.mdc-text-field--filled .mdc-floating-label{max-width:calc(100% - 64px)}.mdc-text-field--with-trailing-icon.mdc-text-field--filled .mdc-floating-label--float-above{max-width:calc(100% / 0.75 - 64px / 0.75)}.mdc-text-field--with-trailing-icon.mdc-text-field--outlined :not(.mdc-notched-outline--notched) .mdc-notched-outline__notch{max-width:calc(100% - 60px)}.mdc-text-field--with-leading-icon.mdc-text-field--with-trailing-icon{padding-left:0;padding-right:0}.mdc-text-field--with-leading-icon.mdc-text-field--with-trailing-icon.mdc-text-field--filled .mdc-floating-label{max-width:calc(100% - 96px)}.mdc-text-field--with-leading-icon.mdc-text-field--with-trailing-icon.mdc-text-field--filled .mdc-floating-label--float-above{max-width:calc(100% / 0.75 - 96px / 0.75)}.mdc-text-field-helper-line{display:flex;justify-content:space-between;box-sizing:border-box}.mdc-text-field+.mdc-text-field-helper-line{padding-right:16px;padding-left:16px}.mdc-form-field>.mdc-text-field+label{align-self:flex-start}.mdc-text-field--focused:not(.mdc-text-field--disabled) .mdc-floating-label{color:rgba(98, 0, 238, 0.87)}.mdc-text-field--focused .mdc-notched-outline__leading,.mdc-text-field--focused .mdc-notched-outline__notch,.mdc-text-field--focused .mdc-notched-outline__trailing{border-width:2px}.mdc-text-field--focused+.mdc-text-field-helper-line .mdc-text-field-helper-text:not(.mdc-text-field-helper-text--validation-msg){opacity:1}.mdc-text-field--focused.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch{padding-top:2px}.mdc-text-field--focused.mdc-text-field--outlined.mdc-text-field--textarea .mdc-notched-outline--notched .mdc-notched-outline__notch{padding-top:0}.mdc-text-field--invalid:not(.mdc-text-field--disabled):hover .mdc-line-ripple::before{border-bottom-color:#b00020;border-bottom-color:var(--mdc-theme-error, #b00020)}.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-line-ripple::after{border-bottom-color:#b00020;border-bottom-color:var(--mdc-theme-error, #b00020)}.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-floating-label{color:#b00020;color:var(--mdc-theme-error, #b00020)}.mdc-text-field--invalid:not(.mdc-text-field--disabled).mdc-text-field--invalid+.mdc-text-field-helper-line .mdc-text-field-helper-text--validation-msg{color:#b00020;color:var(--mdc-theme-error, #b00020)}.mdc-text-field--invalid .mdc-text-field__input{caret-color:#b00020;caret-color:var(--mdc-theme-error, #b00020)}.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-text-field__icon--trailing{color:#b00020;color:var(--mdc-theme-error, #b00020)}.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-line-ripple::before{border-bottom-color:#b00020;border-bottom-color:var(--mdc-theme-error, #b00020)}.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-notched-outline__leading,.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-notched-outline__notch,.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing{border-color:#b00020;border-color:var(--mdc-theme-error, #b00020)}.mdc-text-field--invalid:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-notched-outline .mdc-notched-outline__leading,.mdc-text-field--invalid:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-notched-outline .mdc-notched-outline__notch,.mdc-text-field--invalid:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-notched-outline .mdc-notched-outline__trailing{border-color:#b00020;border-color:var(--mdc-theme-error, #b00020)}.mdc-text-field--invalid:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline__leading,.mdc-text-field--invalid:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline__notch,.mdc-text-field--invalid:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline__trailing{border-color:#b00020;border-color:var(--mdc-theme-error, #b00020)}.mdc-text-field--invalid+.mdc-text-field-helper-line .mdc-text-field-helper-text--validation-msg{opacity:1}.mdc-text-field--disabled{pointer-events:none}.mdc-text-field--disabled .mdc-text-field__input{color:rgba(0, 0, 0, 0.38)}@media all{.mdc-text-field--disabled .mdc-text-field__input::placeholder{color:rgba(0, 0, 0, 0.38)}}@media all{.mdc-text-field--disabled .mdc-text-field__input:-ms-input-placeholder{color:rgba(0, 0, 0, 0.38)}}.mdc-text-field--disabled .mdc-floating-label{color:rgba(0, 0, 0, 0.38)}.mdc-text-field--disabled+.mdc-text-field-helper-line .mdc-text-field-helper-text{color:rgba(0, 0, 0, 0.38)}.mdc-text-field--disabled .mdc-text-field-character-counter,.mdc-text-field--disabled+.mdc-text-field-helper-line .mdc-text-field-character-counter{color:rgba(0, 0, 0, 0.38)}.mdc-text-field--disabled .mdc-text-field__icon--leading{color:rgba(0, 0, 0, 0.3)}.mdc-text-field--disabled .mdc-text-field__icon--trailing{color:rgba(0, 0, 0, 0.3)}.mdc-text-field--disabled .mdc-text-field__affix--prefix{color:rgba(0, 0, 0, 0.38)}.mdc-text-field--disabled .mdc-text-field__affix--suffix{color:rgba(0, 0, 0, 0.38)}.mdc-text-field--disabled .mdc-line-ripple::before{border-bottom-color:rgba(0, 0, 0, 0.06)}.mdc-text-field--disabled .mdc-notched-outline__leading,.mdc-text-field--disabled .mdc-notched-outline__notch,.mdc-text-field--disabled .mdc-notched-outline__trailing{border-color:rgba(0, 0, 0, 0.06)}@media screen and (-ms-high-contrast: active){.mdc-text-field--disabled .mdc-text-field__input::placeholder{color:GrayText}}@media screen and (-ms-high-contrast: active){.mdc-text-field--disabled .mdc-text-field__input:-ms-input-placeholder{color:GrayText}}@media screen and (-ms-high-contrast: active){.mdc-text-field--disabled .mdc-floating-label{color:GrayText}}@media screen and (-ms-high-contrast: active){.mdc-text-field--disabled+.mdc-text-field-helper-line .mdc-text-field-helper-text{color:GrayText}}@media screen and (-ms-high-contrast: active){.mdc-text-field--disabled .mdc-text-field-character-counter,.mdc-text-field--disabled+.mdc-text-field-helper-line .mdc-text-field-character-counter{color:GrayText}}@media screen and (-ms-high-contrast: active){.mdc-text-field--disabled .mdc-text-field__icon--leading{color:GrayText}}@media screen and (-ms-high-contrast: active){.mdc-text-field--disabled .mdc-text-field__icon--trailing{color:GrayText}}@media screen and (-ms-high-contrast: active){.mdc-text-field--disabled .mdc-text-field__affix--prefix{color:GrayText}}@media screen and (-ms-high-contrast: active){.mdc-text-field--disabled .mdc-text-field__affix--suffix{color:GrayText}}@media screen and (-ms-high-contrast: active){.mdc-text-field--disabled .mdc-line-ripple::before{border-bottom-color:GrayText}}@media screen and (-ms-high-contrast: active){.mdc-text-field--disabled .mdc-notched-outline__leading,.mdc-text-field--disabled .mdc-notched-outline__notch,.mdc-text-field--disabled .mdc-notched-outline__trailing{border-color:GrayText}}.mdc-text-field--disabled .mdc-floating-label{cursor:default}.mdc-text-field--disabled.mdc-text-field--filled{background-color:#fafafa}.mdc-text-field--disabled.mdc-text-field--filled .mdc-text-field__ripple{display:none}.mdc-text-field--disabled .mdc-text-field__input{pointer-events:auto}.mdc-text-field--end-aligned .mdc-text-field__input{text-align:right}[dir=rtl] .mdc-text-field--end-aligned .mdc-text-field__input,.mdc-text-field--end-aligned .mdc-text-field__input[dir=rtl]{text-align:left}[dir=rtl] .mdc-text-field--ltr-text .mdc-text-field__input,[dir=rtl] .mdc-text-field--ltr-text .mdc-text-field__affix,.mdc-text-field--ltr-text[dir=rtl] .mdc-text-field__input,.mdc-text-field--ltr-text[dir=rtl] .mdc-text-field__affix{direction:ltr}[dir=rtl] .mdc-text-field--ltr-text .mdc-text-field__affix--prefix,.mdc-text-field--ltr-text[dir=rtl] .mdc-text-field__affix--prefix{padding-left:0;padding-right:2px}[dir=rtl] .mdc-text-field--ltr-text .mdc-text-field__affix--suffix,.mdc-text-field--ltr-text[dir=rtl] .mdc-text-field__affix--suffix{padding-left:12px;padding-right:0}[dir=rtl] .mdc-text-field--ltr-text .mdc-text-field__icon--leading,.mdc-text-field--ltr-text[dir=rtl] .mdc-text-field__icon--leading{order:1}[dir=rtl] .mdc-text-field--ltr-text .mdc-text-field__affix--suffix,.mdc-text-field--ltr-text[dir=rtl] .mdc-text-field__affix--suffix{order:2}[dir=rtl] .mdc-text-field--ltr-text .mdc-text-field__input,.mdc-text-field--ltr-text[dir=rtl] .mdc-text-field__input{order:3}[dir=rtl] .mdc-text-field--ltr-text .mdc-text-field__affix--prefix,.mdc-text-field--ltr-text[dir=rtl] .mdc-text-field__affix--prefix{order:4}[dir=rtl] .mdc-text-field--ltr-text .mdc-text-field__icon--trailing,.mdc-text-field--ltr-text[dir=rtl] .mdc-text-field__icon--trailing{order:5}[dir=rtl] .mdc-text-field--ltr-text.mdc-text-field--end-aligned .mdc-text-field__input,.mdc-text-field--ltr-text.mdc-text-field--end-aligned[dir=rtl] .mdc-text-field__input{text-align:right}[dir=rtl] .mdc-text-field--ltr-text.mdc-text-field--end-aligned .mdc-text-field__affix--prefix,.mdc-text-field--ltr-text.mdc-text-field--end-aligned[dir=rtl] .mdc-text-field__affix--prefix{padding-right:12px}[dir=rtl] .mdc-text-field--ltr-text.mdc-text-field--end-aligned .mdc-text-field__affix--suffix,.mdc-text-field--ltr-text.mdc-text-field--end-aligned[dir=rtl] .mdc-text-field__affix--suffix{padding-left:2px}.mdc-text-field-helper-text{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-caption-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.75rem;font-size:var(--mdc-typography-caption-font-size, 0.75rem);line-height:1.25rem;line-height:var(--mdc-typography-caption-line-height, 1.25rem);font-weight:400;font-weight:var(--mdc-typography-caption-font-weight, 400);letter-spacing:0.0333333333em;letter-spacing:var(--mdc-typography-caption-letter-spacing, 0.0333333333em);text-decoration:inherit;text-decoration:var(--mdc-typography-caption-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-caption-text-transform, inherit);display:block;margin-top:0;line-height:normal;margin:0;opacity:0;will-change:opacity;transition:opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-text-field-helper-text::before{display:inline-block;width:0;height:16px;content:"";vertical-align:0}.mdc-text-field-helper-text--persistent{transition:none;opacity:1;will-change:initial}.mdc-text-field-character-counter{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-caption-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.75rem;font-size:var(--mdc-typography-caption-font-size, 0.75rem);line-height:1.25rem;line-height:var(--mdc-typography-caption-line-height, 1.25rem);font-weight:400;font-weight:var(--mdc-typography-caption-font-weight, 400);letter-spacing:0.0333333333em;letter-spacing:var(--mdc-typography-caption-letter-spacing, 0.0333333333em);text-decoration:inherit;text-decoration:var(--mdc-typography-caption-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-caption-text-transform, inherit);display:block;margin-top:0;line-height:normal;margin-left:auto;margin-right:0;padding-left:16px;padding-right:0;white-space:nowrap}.mdc-text-field-character-counter::before{display:inline-block;width:0;height:16px;content:"";vertical-align:0}[dir=rtl] .mdc-text-field-character-counter,.mdc-text-field-character-counter[dir=rtl]{margin-left:0;margin-right:auto}[dir=rtl] .mdc-text-field-character-counter,.mdc-text-field-character-counter[dir=rtl]{padding-left:0;padding-right:16px}.mdc-text-field__icon{align-self:center;cursor:pointer}.mdc-text-field__icon:not([tabindex]),.mdc-text-field__icon[tabindex="-1"]{cursor:default;pointer-events:none}.mdc-text-field__icon svg{display:block}.mdc-text-field__icon--leading{margin-left:16px;margin-right:8px}[dir=rtl] .mdc-text-field__icon--leading,.mdc-text-field__icon--leading[dir=rtl]{margin-left:8px;margin-right:16px}.mdc-text-field__icon--trailing{padding:12px;margin-left:0px;margin-right:0px}[dir=rtl] .mdc-text-field__icon--trailing,.mdc-text-field__icon--trailing[dir=rtl]{margin-left:0px;margin-right:0px}.material-icons{font-family:var(--mdc-icon-font, "Material Icons");font-weight:normal;font-style:normal;font-size:var(--mdc-icon-size, 24px);line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga"}:host{display:inline-flex;flex-direction:column;outline:none}.mdc-text-field{width:100%}.mdc-text-field:not(.mdc-text-field--disabled) .mdc-line-ripple::before{border-bottom-color:rgba(0, 0, 0, 0.42);border-bottom-color:var(--mdc-text-field-idle-line-color, rgba(0, 0, 0, 0.42))}.mdc-text-field:not(.mdc-text-field--disabled):hover .mdc-line-ripple::before{border-bottom-color:rgba(0, 0, 0, 0.87);border-bottom-color:var(--mdc-text-field-hover-line-color, rgba(0, 0, 0, 0.87))}.mdc-text-field.mdc-text-field--disabled .mdc-line-ripple::before{border-bottom-color:rgba(0, 0, 0, 0.06);border-bottom-color:var(--mdc-text-field-disabled-line-color, rgba(0, 0, 0, 0.06))}.mdc-text-field.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-line-ripple::before{border-bottom-color:#b00020;border-bottom-color:var(--mdc-theme-error, #b00020)}mwc-notched-outline{--mdc-notched-outline-border-color: var(--mdc-text-field-outlined-idle-border-color, rgba(0, 0, 0, 0.38))}:host(:not([disabled]):hover) :not(.mdc-text-field--invalid):not(.mdc-text-field--focused) mwc-notched-outline{--mdc-notched-outline-border-color: var(--mdc-text-field-outlined-hover-border-color, rgba(0, 0, 0, 0.87))}:host(:not([disabled])) .mdc-text-field:not(.mdc-text-field--outlined){background-color:var(--mdc-text-field-fill-color, whitesmoke)}:host(:not([disabled])) .mdc-text-field.mdc-text-field--invalid mwc-notched-outline{--mdc-notched-outline-border-color: var(--mdc-text-field-error-color, var(--mdc-theme-error, #b00020))}:host(:not([disabled])) .mdc-text-field.mdc-text-field--invalid+.mdc-text-field-helper-line .mdc-text-field-character-counter,:host(:not([disabled])) .mdc-text-field.mdc-text-field--invalid .mdc-text-field__icon{color:var(--mdc-text-field-error-color, var(--mdc-theme-error, #b00020))}:host(:not([disabled])) .mdc-text-field:not(.mdc-text-field--invalid):not(.mdc-text-field--focused) .mdc-floating-label,:host(:not([disabled])) .mdc-text-field:not(.mdc-text-field--invalid):not(.mdc-text-field--focused) .mdc-floating-label::after{color:var(--mdc-text-field-label-ink-color, rgba(0, 0, 0, 0.6))}:host(:not([disabled])) .mdc-text-field.mdc-text-field--focused mwc-notched-outline{--mdc-notched-outline-stroke-width: 2px}:host(:not([disabled])) .mdc-text-field.mdc-text-field--focused:not(.mdc-text-field--invalid) mwc-notched-outline{--mdc-notched-outline-border-color: var(--mdc-text-field-focused-label-color, var(--mdc-theme-primary, rgba(98, 0, 238, 0.87)))}:host(:not([disabled])) .mdc-text-field.mdc-text-field--focused:not(.mdc-text-field--invalid) .mdc-floating-label{color:#6200ee;color:var(--mdc-theme-primary, #6200ee)}:host(:not([disabled])) .mdc-text-field .mdc-text-field__input{color:var(--mdc-text-field-ink-color, rgba(0, 0, 0, 0.87))}:host(:not([disabled])) .mdc-text-field .mdc-text-field__input::placeholder{color:var(--mdc-text-field-label-ink-color, rgba(0, 0, 0, 0.6))}:host(:not([disabled])) .mdc-text-field-helper-line .mdc-text-field-helper-text:not(.mdc-text-field-helper-text--validation-msg),:host(:not([disabled])) .mdc-text-field-helper-line:not(.mdc-text-field--invalid) .mdc-text-field-character-counter{color:var(--mdc-text-field-label-ink-color, rgba(0, 0, 0, 0.6))}:host([disabled]) .mdc-text-field:not(.mdc-text-field--outlined){background-color:var(--mdc-text-field-disabled-fill-color, #fafafa)}:host([disabled]) .mdc-text-field.mdc-text-field--outlined mwc-notched-outline{--mdc-notched-outline-border-color: var(--mdc-text-field-outlined-disabled-border-color, rgba(0, 0, 0, 0.06))}:host([disabled]) .mdc-text-field:not(.mdc-text-field--invalid):not(.mdc-text-field--focused) .mdc-floating-label,:host([disabled]) .mdc-text-field:not(.mdc-text-field--invalid):not(.mdc-text-field--focused) .mdc-floating-label::after{color:var(--mdc-text-field-disabled-ink-color, rgba(0, 0, 0, 0.38))}:host([disabled]) .mdc-text-field .mdc-text-field__input,:host([disabled]) .mdc-text-field .mdc-text-field__input::placeholder{color:var(--mdc-text-field-disabled-ink-color, rgba(0, 0, 0, 0.38))}:host([disabled]) .mdc-text-field-helper-line .mdc-text-field-helper-text,:host([disabled]) .mdc-text-field-helper-line .mdc-text-field-character-counter{color:var(--mdc-text-field-disabled-ink-color, rgba(0, 0, 0, 0.38))}`;

/**
@license
Copyright 2019 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/** @soyCompatible */
let TextField = class TextField extends TextFieldBase {
};
TextField.styles = style$1;
TextField = __decorate([
    customElement('mwc-textfield')
], TextField);

/**
 * small mixin to allow Polymer two-way-binding with mwc-textfield and mwc-textarea
 * 
 */

const TwoWayBinding = (baseElement) => class extends baseElement {
  handleInputChange() {
    super.handleInputChange(...arguments);
    this.dispatchValueChanged();
  }

  dispatchValueChanged() {
    this.dispatchEvent(new CustomEvent('value-changed', { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  // update(changedProperties) {
  //   if (changedProperties.has('value') && this.value === undefined) {
  //     this.value = '';
  //   }
  //   super.update(changedProperties);
  // }
   
  
  // updated(changedProperties) {
  //   const maxLength = changedProperties.get('maxLength');
  //   const maxLengthBecameDefined = maxLength === -1 && this.maxLength !== -1;
  //   const maxLengthBecameUndefined = maxLength !== undefined && maxLength !== -1 && this.maxLength === -1;
  //    We want to recreate the foundation if maxLength changes to defined or
  //    * undefined, because the textfield foundation needs to be instantiated with
  //    * the char counter's foundation, and the char counter's foundation needs
  //    * to have maxLength defined to be instantiated. Additionally, there is no
  //    * exposed API on the MdcTextFieldFoundation to dynamically add a char
  //    * counter foundation, so we must recreate it.
     
  //   if (maxLengthBecameDefined || maxLengthBecameUndefined) {
  //     this.createFoundation();
  //   }
  //   if (changedProperties.has('value')) {
  //     // this.value !== undefined) {
  //     // changedProperties.get('value') !== undefined) {
  //     this.mdcFoundation.setValue(this.value === undefined ? '' : this.value);
  //   }
  // }
};

/**
 * mixin overrideing som methods not playin well with Polymer
 * 
 */

const OverrideTextfield = (baseElement) => class extends baseElement {

  update(changedProperties) {
    if (changedProperties.has('value') && this.value === undefined) {
      this.value = '';
    }
    super.update(changedProperties);
  }
};

/**
 * mixin overriding how mdc-textfiel handle validation message
 * It gets native input validation message when
 * no default validatationMessage is set.
 *
 * Related issue:
 * https://github.com/material-components/material-components-web-components/issues/971
 *
 */

const OverrideTextfielValidityMessage = (baseElement) => class extends baseElement {

  firstUpdated(props) {
    if (this.validationMessage) {
      this._initialValidationMessage = this.validationMessage;
    }
    super.firstUpdated(props);
  }

  reportValidity() {
    const isValid = super.reportValidity();
    // Note(cg): override validationMessage only if no initial message set.
    if (!this._initialValidationMessage && !isValid) {
      this.validationMessage = (this._validity && this._validity.customError) || this.nativeValidationMessage;
    }
    return isValid;
  }

  get nativeValidationMessage() {
    return this.formElement.validationMessage;
  }
};

/**
 * mixin overriding how mdc-textfiel handle readonly
 * 
 * 
 * Related issue:
 * https://github.com/material-components/material-components-web-components/issues/1882
 *
 */

const OverrideTextfielReadonly = (baseElement) => class extends baseElement {

  static get styles() {
    return [super.styles, css`
    :host([readonly]) {
      --mdc-theme-primary: var(--disabled-text-color, rgba(0, 0, 0, 0.6));
    }
    `];
  }

  static get properties() {
    return {
      ...super.properties,

      readonly: {
        type: Boolean,
        reflect: true
      }
    };
  }

  updated(props) {
    if (props.has('readonly')) {
      this.readOnly = this.readonly;
    }
    super.updated(props);
  }

};

/**
 * extension of mwc-textfield emiting a value-changed event when
 * value changes
 */
class PwiTextField extends
TwoWayBinding(
  OverrideTextfield(
    OverrideTextfielValidityMessage(
      OverrideTextfielReadonly(
        TextField)))) {


  // Note(cg): improved aria support on text field: 
  // aria-invalie is set to invalid;
  // aria-errormessage replaces aria-errortext
  // .
   renderInput(shouldRenderHelperText) {
        const minOrUndef = this.minLength === -1 ? undefined : this.minLength;
        const maxOrUndef = this.maxLength === -1 ? undefined : this.maxLength;
        const autocapitalizeOrUndef = this.autocapitalize ?
            this.autocapitalize :
            undefined;
        const showValidationMessage = this.validationMessage && !this.isUiValid;
        const ariaControlsOrUndef = shouldRenderHelperText ? 'helper-text' : undefined;
        const ariaDescribedbyOrUndef = this.focused || this.helperPersistent || showValidationMessage ?
            'helper-text' :
            undefined;
        const ariaErrortextOrUndef = showValidationMessage ? 'helper-text' : undefined;
        // TODO: live() directive needs casting for lit-analyzer
        // https://github.com/runem/lit-analyzer/pull/91/files
        // TODO: lit-analyzer labels min/max as (number|string) instead of string
        return html$2 `
      <input
          aria-labelledby="label"
          aria-controls="${ifDefined(ariaControlsOrUndef)}"
          aria-describedby="${ifDefined(ariaDescribedbyOrUndef)}"
          aria-errormessage="${ifDefined(ariaErrortextOrUndef)}"
          aria-invalid="${ifDefined(this.isUiValid ? undefined : 'true')}"
          class="mdc-text-field__input"
          type="${this.type}"
          .value="${live(this.value)}"
          ?disabled="${this.disabled}"
          placeholder="${this.placeholder}"
          ?required="${this.required}"
          ?readonly="${this.readOnly}"
          minlength="${ifDefined(minOrUndef)}"
          maxlength="${ifDefined(maxOrUndef)}"
          pattern="${ifDefined(this.pattern ? this.pattern : undefined)}"
          min="${ifDefined(this.min === '' ? undefined : this.min)}"
          max="${ifDefined(this.max === '' ? undefined : this.max)}"
          step="${ifDefined(this.step === null ? undefined : this.step)}"
          size="${ifDefined(this.size === null ? undefined : this.size)}"
          name="${ifDefined(this.name === '' ? undefined : this.name)}"
          inputmode="${ifDefined(this.inputMode)}"
          autocapitalize="${ifDefined(autocapitalizeOrUndef)}"
          @input="${this.handleInputChange}"
          @focus="${this.onInputFocus}"
          @blur="${this.onInputBlur}">`;
    }

  // Note(cg): added aria-live. and role
  renderHelperText(shouldRenderHelperText, shouldRenderCharCounter) {
        const showValidationMessage = this.validationMessage && !this.isUiValid;
        /** @classMap */
        const classes = {
            'mdc-text-field-helper-text--persistent': this.helperPersistent,
            'mdc-text-field-helper-text--validation-msg': showValidationMessage,
        };
        const ariaHiddenOrUndef = this.focused || this.helperPersistent || showValidationMessage ?
            undefined :
            'true';
        const helperText = showValidationMessage ? this.validationMessage : this.helper;
        const role = showValidationMessage ? 'alert' : undefined;
        return !shouldRenderHelperText ? '' : html$2 `
      <div class="mdc-text-field-helper-line">
        <div id="helper-text"
            role="${ifDefined(role)}"
            aria-live="${ifDefined(showValidationMessage ? 'assertive' : undefined)}"
             aria-hidden="${ifDefined(ariaHiddenOrUndef)}"
             class="mdc-text-field-helper-text ${classMap(classes)}"
             >${helperText}</div>
        ${this.renderCharCounter(shouldRenderCharCounter)}
      </div>`;
    } 

}

customElements.define('pwi-textfield', PwiTextField);

class PwiLabel extends LitElement {

  static get styles() {
    return css `
    
    :host {
      display: block;
      /* hard-coding padding and margin to make text field same size */
      margin-top: 6px;
      margin-bottom: -2px;
      font-size: var(--mdc-typography-subtitle1-font-size, 1rem);
    }

    :host([required])::after {
      margin-left: 1px;
      margin-right: 0px;
      content: "*";
    }
    `;
  }

  /**
   * render label with terminology 
   * @param  {String} label       [description]
   * @param  {Array} terminology  [{term: definition}]
   * @return {HTMLTemplate || string}             
   */
  renderLabel(label, terminology) {
    if (this.parse) {
      return parseInline(this.label);
    }
    if (terminology) {
      // Note(cg): parse label to get terminolotgy.
      return this.label;
    }
    return this.label;
  }

  render() {
    return html$2 `
      <label>${this.renderLabel(this.label)}</label>
    `;
  }

  static get properties() {
    return {

      required: {
        type: Boolean, 
        reflect: true
      },
      /*
       * `terminology` [{term: definition}]
       */
      terminology: {
        type: Array
      },

      /*
       * `label` 
       */
      label: {
        type: String,
      },

      /*
       * `parse` if true, parse label as markdown
       */
      parse: {
        type: Boolean,
      },

    };
  }
}

// Register the new element with the browser.
customElements.define('pwi-label', PwiLabel);

/**
 * mixin overrideing som methods not playin well with Polymer
 * 
 */

const AccessibleLabel = (baseElement) => class extends baseElement {

  static get properties() {
    return {
      ...super.properties,

      /*
       * `labelAbove` if true, label will be placed above the field, and avoid
       * all material floatin label stuff
       */
      labelAbove: {
        type: Boolean,
        reflect: true,
        attribute: 'label-above'
      },

      /*
       * `terminology` [{term: definition}]
       */
      terminology: {
        type: Array
      },

      /*
       * `parseLabel` if true, parse label as markdown
       */
      parseLabel: {
        type: Boolean,
      },
    };
  }

  renderLabelAbove() {
    return html$2 `
     <pwi-label id="label" class="label-above" .label="${this.label}" .terminology="${this.terminology}" parse ?required="${this.required}" ></pwi-label>
    `;
  }

  renderLabel() {
    if (!this.label) {
      return '';
    }
    if (this.labelAbove) {
      return this.renderLabelAbove();
    }
    return super.renderLabel();
  }
};

var AccessibleLabelStyle = css`
     /* By default, occupy all width*/
     :host {
       width: 100%;
     }  
     /*
     :host([label-above])  {
       line-height: initial;
     }*/

     :host([label-above]) .mdc-text-field {
       flex-direction: column;
       overflow: visible; /* this is to allow tooltip */
     }

     :host([label-above]) .mdc-text-field__ripple {
       overflow: hidden; /* this is to allow tooltip */
     }

     :host([label-above]) input.mdc-text-field__input {
       padding: 1px 0px 4px;
     }

    :host([label-above]) .mdc-text-field--filled::before {
      height: 0;
      position: absolute; /* we need this otherwise we loose space */
    }
    
    :host([label-above]) .mdc-text-field .label-above {
     color: var(--mdc-text-field-label-ink-color, rgba(0, 0, 0, 0.6));
    }

    :host([label-above]:hover):not([focused]) .mdc-text-field:not(.mdc-text-field--focused):not(.mdc-text-field--disabled):not(.mdc-text-field--invalid) .label-above {
     color: var(--mdc-theme-text-primary-on-background);
    }

    :host([label-above]) .mdc-text-field--focused .label-above,
    :host([label-above][focused])  .label-above {
      color: var(--mdc-theme-primary, #6200ee);
    }

    :host([label-above]) .mdc-text-field--disabled .label-above {
       color: var(--mdc-text-field-disabled-ink-color, rgba(0, 0, 0, 0.38));
    }

    :host([label-above]) .mdc-text-field--invalid .label-above {
      color: var(--mdc-theme-error, #b00020);
    }

    :host([label-above]) .mdc-text-field--filled {
      height: unset;
    }

    /* TEXTAREA */
    :host([label-above]) .mdc-text-field--textarea .label-above {
       padding-right: 16px;
       padding-left: 16px;
       align-self: baseline;
     }

    :host([label-above]) .mdc-text-field--textarea.mdc-text-field--filled .mdc-text-field__input {
      margin-top: 9px;
    }

    /* ICON */
    :host([label-above]) .mdc-text-field--with-leading-icon .label-above {
      margin-left: 36px;
    }
    :host([label-above]) .mdc-text-field--with-leading-icon .mdc-text-field__icon--leading {
      left: -10px;
      top: 7px;
    }

    /* HELPER - display when host is [focused]*/

    :host([label-above][focused]) .mdc-text-field-helper-line .mdc-text-field-helper-text:not(.mdc-text-field-helper-text--validation-msg) {
      opacity: 1;
    }



    /* PREFIX - NOT YET WORKING */
    :host([label-above]) .mdc-text-field__affix {
      opacity: 0;
      position: absolute;
    }

    /* RTL */
   :host-context([dir=rtl]) .mdc-text-field--filled .mdc-floating-label {
     right: 16px;
     left: initial;
   }
   .mdc-text-field--filled .mdc-floating-label:dir(rtl) {
     right: 16px;
     left: initial;
   }
}

`;

class PwiAccessibleTextfield extends AccessibleLabel(PwiTextField) {

  static get styles() {
    return [super.styles, AccessibleLabelStyle];
  }
}

// Register the new element with the browser.
customElements.define('pwi-accessible-textfield', PwiAccessibleTextfield);

/**
@license
Copyright 2019 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const booleanOrStringConverter = {
    fromAttribute(value) {
        if (value === null) {
            return false;
        }
        else if (value === '') {
            return true;
        }
        return value;
    },
    toAttribute(value) {
        if (typeof value === 'boolean') {
            return value ? '' : null;
        }
        return value;
    }
};
/** @soyCompatible */
class TextAreaBase extends TextFieldBase {
    constructor() {
        super(...arguments);
        this.rows = 2;
        this.cols = 20;
        this.charCounter = false;
    }
    /** @soyTemplate */
    render() {
        const shouldRenderCharCounter = this.charCounter && this.maxLength !== -1;
        const shouldRenderInternalCharCounter = shouldRenderCharCounter && this.charCounter === 'internal';
        const shouldRenderExternalCharCounter = shouldRenderCharCounter && !shouldRenderInternalCharCounter;
        const shouldRenderHelperText = !!this.helper || !!this.validationMessage ||
            shouldRenderExternalCharCounter;
        /** @classMap */
        const classes = {
            'mdc-text-field--disabled': this.disabled,
            'mdc-text-field--no-label': !this.label,
            'mdc-text-field--filled': !this.outlined,
            'mdc-text-field--outlined': this.outlined,
            'mdc-text-field--end-aligned': this.endAligned,
            'mdc-text-field--with-internal-counter': shouldRenderInternalCharCounter,
        };
        return html$2 `
      <label class="mdc-text-field mdc-text-field--textarea ${classMap(classes)}">
        ${this.renderRipple()}
        ${this.outlined ? this.renderOutline() : this.renderLabel()}
        ${this.renderInput()}
        ${this.renderCharCounter(shouldRenderInternalCharCounter)}
        ${this.renderLineRipple()}
      </label>
      ${this.renderHelperText(shouldRenderHelperText, shouldRenderExternalCharCounter)}
    `;
    }
    /** @soyTemplate */
    renderInput() {
        const minOrUndef = this.minLength === -1 ? undefined : this.minLength;
        const maxOrUndef = this.maxLength === -1 ? undefined : this.maxLength;
        const autocapitalizeOrUndef = this.autocapitalize ?
            this.autocapitalize :
            undefined;
        return html$2 `
      <textarea
          aria-labelledby="label"
          class="mdc-text-field__input"
          .value="${live(this.value)}"
          rows="${this.rows}"
          cols="${this.cols}"
          ?disabled="${this.disabled}"
          placeholder="${this.placeholder}"
          ?required="${this.required}"
          ?readonly="${this.readOnly}"
          minlength="${ifDefined(minOrUndef)}"
          maxlength="${ifDefined(maxOrUndef)}"
          name="${ifDefined(this.name === '' ? undefined : this.name)}"
          inputmode="${ifDefined(this.inputMode)}"
          autocapitalize="${ifDefined(autocapitalizeOrUndef)}"
          @input="${this.handleInputChange}"
          @blur="${this.onInputBlur}">
      </textarea>`;
    }
}
__decorate([
    query('textarea')
], TextAreaBase.prototype, "formElement", void 0);
__decorate([
    property({ type: Number })
], TextAreaBase.prototype, "rows", void 0);
__decorate([
    property({ type: Number })
], TextAreaBase.prototype, "cols", void 0);
__decorate([
    property({ converter: booleanOrStringConverter })
], TextAreaBase.prototype, "charCounter", void 0);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$2 = css `.mdc-text-field{height:100%}.mdc-text-field__input{resize:none}`;

/**
@license
Copyright 2019 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/** @soyCompatible */
let TextArea = class TextArea extends TextAreaBase {
};
TextArea.styles = [style$1, style$2];
TextArea = __decorate([
    customElement('mwc-textarea')
], TextArea);

/**
 * small mixin to prevent navigation keys to propagate
 * This is usefull for instance for textarea in forms
 * Pressing page-up page-down should just be keps on t
 * focused textfield
 */

const PreventNavigationPropagation = (baseElement) => class extends baseElement {
  
  constructor() {
    super();
    this.addEventListener('keydown', this._onKeyDownPropagation);
  }

  _onKeyDownPropagation(e) {
    console.info('keydown');
    const {code} = e;
    const prevent = ['PageDown', 'PageUp', 'End', 'Home'];
    if (prevent.indexOf(code) > -1) {
      e.stopPropagation();
      e.preventDefault();
      const target = e.composedPath()[0];
      const cursorPosition = (code === 'PageUp' || code === 'Home') ? 0 : target.textLength;
      target.setSelectionRange(cursorPosition, cursorPosition);
    }
  }
};

/**
 * extenstion of mwc-textfield emiting a value-changed event when
 * value changes
 */
class PwiTextArea extends
PreventNavigationPropagation(
TwoWayBinding(
  OverrideTextfield(
    OverrideTextfielReadonly(
      TextArea)))) {

  static get styles() {
    return [
      super.styles,

      css `
        :host([ripple]) .mdc-text-field {
          background: transparent !important;
        }
      `
    ];
  }

  static get properties() {
    return {
      ...super.properties,

      ripple: {
        type: Boolean,
        reflect: true
      },

      /*
       * `resize` {'vertical' | 'horizontal' | 'auto'}
       * apply resize css to text area
       * Should be removed when https://github.com/material-components/material-components-web-components/issues/1305 lands
       */
      resize: {
        type: String,
      }
    };
  }

  updated(props) {
    if (props.has('resize')) {
      this.setResize(this.resize);
    }
    super.updated(props);
  }

  setResize(resize) {
    const style = this.renderRoot.querySelector('textarea').style;
    if (resize) {
      style.resize = resize;
    } else {
      style.resize = null;
    }
  }

  // Note(cg): override to improve aria support.
  renderInput() {
    const minOrUndef = this.minLength === -1 ? undefined : this.minLength;
    const maxOrUndef = this.maxLength === -1 ? undefined : this.maxLength;
    const autocapitalizeOrUndef = this.autocapitalize ?
      this.autocapitalize :
      undefined;
    const showValidationMessage = this.validationMessage && !this.isUiValid;
    
    return html$2 `
      <textarea
          aria-labelledby="label"
          aria-controls="${ifDefined(this.shouldRenderHelperText ? 'helper-text' : undefined)}"
          aria-describedby="${ifDefined(this.focused || this.helperPersistent || showValidationMessage ?
            'helper-text' :
            undefined)}"
         aria-errormessage="${ifDefined(showValidationMessage ? 'helper-text' : undefined)}"
         aria-invalid="${ifDefined(this.isUiValid ? undefined : 'true')}"
          class="mdc-text-field__input"
          .value="${live(this.value)}"
          rows="${this.rows}"
          cols="${this.cols}"
          ?disabled="${this.disabled}"
          placeholder="${this.placeholder}"
          ?required="${this.required}"
          ?readonly="${this.readOnly}"
          minlength="${ifDefined(minOrUndef)}"
          maxlength="${ifDefined(maxOrUndef)}"
          name="${ifDefined(this.name === '' ? undefined : this.name)}"
          inputmode="${ifDefined(this.inputMode)}"
          autocapitalize="${ifDefined(autocapitalizeOrUndef)}"
          @input="${this.handleInputChange}"
          @blur="${this.onInputBlur}">
      </textarea>`;
  }
}

customElements.define('pwi-textarea', PwiTextArea);

class PwiAccessibleTextarea extends AccessibleLabel(PwiTextArea) {

  static get styles() {
    return [super.styles, AccessibleLabelStyle];
  }
}

// Register the new element with the browser.
customElements.define('pwi-accessible-textarea', PwiAccessibleTextarea);

class PwiAccessibleDate extends PwiAccessibleTextfield {

  constructor() {
    super();
    this.type = 'date';
  }
}

customElements.define('pwi-accessible-date', PwiAccessibleDate);

class PwiAccessibleEmail extends PwiAccessibleTextfield {

  constructor() {
    super();
    this.type = 'email';
  }
}

customElements.define('pwi-accessible-email', PwiAccessibleEmail);

class PwiAccessibleNumber extends PwiAccessibleTextfield {

  constructor() {
    super();
    this.type = 'number';
  }
}

customElements.define('pwi-accessible-number', PwiAccessibleNumber);

const supportLocale = !!Number.prototype.toLocaleString;
const reg = /[^\d]*/g;

const LocaleInput = (baseElement) => class extends baseElement {

  static get properties() {
    return {
      ...super.properties,

      /**
       * `locale`  A string with a BCP 47 language tag, or an array of such strings(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation)
       */
      locale: {
        type: String
      },

      /**
       * `currency` the currency to Use. The currency to use in currency formatting. Possible values are the ISO 4217 currency codes, such as "USD" for the US dollar, "EUR" for the euro, or "CNY" for the Chinese RMB — see the Current currency & funds code list. There is no default value; if the style is "currency", the currency property must be provided.
       */
      currency: {
        type: String
      },

      /**
       * `style` The formatting style to use. Possible values are "decimal" for plain number formatting, "currency" for currency formatting, and "percent" for percent formatting.
       */
      formatingStyle: {
        type: String
      },


      /**
       * `currencyDisplay` How to display the currency in currency formatting. Possible values are "symbol" to use a localized currency symbol such as €, "code" to use the ISO currency code, "name" to use a localized currency name such as "dollar"; the default is "symbol".
       */
      currencyDisplay: {
        type: String
      },

      /**
       * `preventUseGrouping` Whether to use grouping separators, such as thousands separators or thousand/lakh/crore separators. .
       */
      preventUseGrouping: {
        type: Boolean
      },

      /**
       * `minimumFractionDigits` The minimum number of fraction digits to use. Possible values are from 0 to 20; the default for plain number and percent formatting is 0
       */
      minimumFractionDigits: {
        type: Number
      },

      /**
       * `maximumFractionDigits` The maximum number of fraction digits to use. Possible values are from 0 to 20; the default for plain number formatting is the larger of minimumFractionDigits and 3; the default for currency formatting is the larger of minimumFractionDigits and the number of minor unit digits provided by the ISO 4217 currency code list (2 if the list doesn't provide that information); the default for percent formatting is the larger of minimumFractionDigits and 0.
       */
      maximumFractionDigits: {
        type: Number
      },

      /**
       * `minimumIntegerDigits` The minimum number of integer digits to use. Possible values are from 1 to 21; the default is 1.
       */
      minimumIntegerDigits: {
        type: Number
      },

      /*
       * `__numValue` value used for validation and firing value canhges up
       */
      __numValue: {
        type: Number,
      },
    };
  }

  constructor() {
    super();
    this.minimumFractionDigits = 0;
    this.maximumFractionDigits = 2;
    this.minimumIntegerDigits = 1;
    this.preventUseGrouping = false;
    this.currencyDisplay = 'symbol';
    this.locale = 'us-US';
    this.currency = 'USD';
    this.formatingStyle = 'currency';

  }
  update(props) {
    if (supportLocale && props.has('value')) {
      this.__numValue = this.getNumericValue(this.value);
      this.value = this.getFormatedValue(this.__numValue);
    }
    super.update(props);
  }

  updated(props) {
    if (props.has('minimumIntegerDigits')
      || props.has('maximumFractionDigits')
      || props.has('minimumFractionDigits')
      || props.has('preventUseGrouping')
      || props.has('currencyDisplay')
      || props.has('currency')
      || props.has('locale')
      || props.has('formatingStyle')
      ) {
      this.handleInputChange(this.value);
    }

    if (props.has('currency') && !supportLocale) {
      this.prefix = this.currency;
    }
    super.updated(props);
  }

  dispatchValueChanged() {
    this.dispatchEvent(new CustomEvent('value-changed', { detail: { value: supportLocale ? this.getNumericValue(this.value) : this.value }, bubbles: true, composed: true }));
  }

  getNumericValue(value) {
    value = value.replace(reg, '');
    return value.length ? value * Math.pow(10, -this.minimumFractionDigits) : '';
  }

  getFormatedValue(num) {
    let format;
    try {
      format = num.toLocaleString(this.locale, {
        style: this.formatingStyle,
        currency: this.currency,
        currencyDisplay: this.currencyDisplay,
        preventUseGrouping: this.preventUseGrouping,
        minimumFractionDigits: this.minimumFractionDigits,
        maximumFractionDigits: this.maximumFractionDigits,
        minimumIntegerDigits: this.minimumIntegerDigits
          // minimumSignificantDigits and minimumSignificantDigitsthis does not work
          // minimumSignificantDigits:  this.minimumSignificantDigits || minimumSignificantDigits,
          // maximumSignificantDigits:  this.maximumSignificantDigit || maximumSignificantDigits
      });
    } catch (err) {
      this.errorMessage = err;
      this.invalid = true;
      return num;
    }
    this.errorMessage = null;
    this.invalid = false;
    return format;
  }
};

class PwiAccessibleLocale extends LocaleInput(PwiAccessibleTextfield) {
  static get styles() {
    return [super.styles, css`
      #validator {
        display: none;
      }
    `];
  }

  render() {
    return html$2 `
     ${super.render()}  
     <input 
       .value="${this.__numValue}" 
       type="number" 
       id="validator" 
       ?required="${this.required}"
       min="${ifDefined(this.min === '' ? undefined : this.min)}"
       max="${ifDefined(this.max === '' ? undefined : this.max)}"></input>
    `;
  }

  constructor() {
    super();
    this.validityTransform = (value, validity) => {
      const val = this.validatorElement.validity;
      const customValidity = {};
      for (const propName in val) {
        customValidity[propName] = val[propName];
      }
      return customValidity;
    };
  }

  get validatorElement() {
    return this.renderRoot.querySelector('#validator');
  }

  // @override text-field-validity-message
  get nativeValidationMessage() {
    return this.validatorElement.validationMessage;
  }

}

customElements.define('pwi-accessible-locale', PwiAccessibleLocale);

class PwiAccessibleLocaleForm extends PwiAccessibleLocale {

      /* 
       * `formAttributes` is called when we construct the form. It returns binding attributes
       */
      static assignFormAttributes(domBind, name, item, config, attributes ) {
          Object.assign(attributes, {
            currency: '[[context.currency]]',
            locale: '[[locale]]'
          });
          return attributes;
      }
  
}

customElements.define('pwi-accessible-locale-form', PwiAccessibleLocaleForm);

/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var cssClasses$4 = {
    // Ripple is a special case where the "root" component is really a "mixin" of sorts,
    // given that it's an 'upgrade' to an existing component. That being said it is the root
    // CSS class that all other CSS classes derive from.
    BG_FOCUSED: 'mdc-ripple-upgraded--background-focused',
    FG_ACTIVATION: 'mdc-ripple-upgraded--foreground-activation',
    FG_DEACTIVATION: 'mdc-ripple-upgraded--foreground-deactivation',
    ROOT: 'mdc-ripple-upgraded',
    UNBOUNDED: 'mdc-ripple-upgraded--unbounded',
};
var strings$2 = {
    VAR_FG_SCALE: '--mdc-ripple-fg-scale',
    VAR_FG_SIZE: '--mdc-ripple-fg-size',
    VAR_FG_TRANSLATE_END: '--mdc-ripple-fg-translate-end',
    VAR_FG_TRANSLATE_START: '--mdc-ripple-fg-translate-start',
    VAR_LEFT: '--mdc-ripple-left',
    VAR_TOP: '--mdc-ripple-top',
};
var numbers$2 = {
    DEACTIVATION_TIMEOUT_MS: 225,
    FG_DEACTIVATION_MS: 150,
    INITIAL_ORIGIN_SCALE: 0.6,
    PADDING: 10,
    TAP_DELAY_MS: 300,
};

/**
 * Stores result from supportsCssVariables to avoid redundant processing to
 * detect CSS custom variable support.
 */
function getNormalizedEventCoords(evt, pageOffset, clientRect) {
    if (!evt) {
        return { x: 0, y: 0 };
    }
    var x = pageOffset.x, y = pageOffset.y;
    var documentX = x + clientRect.left;
    var documentY = y + clientRect.top;
    var normalizedX;
    var normalizedY;
    // Determine touch point relative to the ripple container.
    if (evt.type === 'touchstart') {
        var touchEvent = evt;
        normalizedX = touchEvent.changedTouches[0].pageX - documentX;
        normalizedY = touchEvent.changedTouches[0].pageY - documentY;
    }
    else {
        var mouseEvent = evt;
        normalizedX = mouseEvent.pageX - documentX;
        normalizedY = mouseEvent.pageY - documentY;
    }
    return { x: normalizedX, y: normalizedY };
}

/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
// Activation events registered on the root element of each instance for activation
var ACTIVATION_EVENT_TYPES = [
    'touchstart', 'pointerdown', 'mousedown', 'keydown',
];
// Deactivation events registered on documentElement when a pointer-related down event occurs
var POINTER_DEACTIVATION_EVENT_TYPES = [
    'touchend', 'pointerup', 'mouseup', 'contextmenu',
];
// simultaneous nested activations
var activatedTargets = [];
var MDCRippleFoundation = /** @class */ (function (_super) {
    __extends(MDCRippleFoundation, _super);
    function MDCRippleFoundation(adapter) {
        var _this = _super.call(this, __assign(__assign({}, MDCRippleFoundation.defaultAdapter), adapter)) || this;
        _this.activationAnimationHasEnded_ = false;
        _this.activationTimer_ = 0;
        _this.fgDeactivationRemovalTimer_ = 0;
        _this.fgScale_ = '0';
        _this.frame_ = { width: 0, height: 0 };
        _this.initialSize_ = 0;
        _this.layoutFrame_ = 0;
        _this.maxRadius_ = 0;
        _this.unboundedCoords_ = { left: 0, top: 0 };
        _this.activationState_ = _this.defaultActivationState_();
        _this.activationTimerCallback_ = function () {
            _this.activationAnimationHasEnded_ = true;
            _this.runDeactivationUXLogicIfReady_();
        };
        _this.activateHandler_ = function (e) { return _this.activate_(e); };
        _this.deactivateHandler_ = function () { return _this.deactivate_(); };
        _this.focusHandler_ = function () { return _this.handleFocus(); };
        _this.blurHandler_ = function () { return _this.handleBlur(); };
        _this.resizeHandler_ = function () { return _this.layout(); };
        return _this;
    }
    Object.defineProperty(MDCRippleFoundation, "cssClasses", {
        get: function () {
            return cssClasses$4;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCRippleFoundation, "strings", {
        get: function () {
            return strings$2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCRippleFoundation, "numbers", {
        get: function () {
            return numbers$2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCRippleFoundation, "defaultAdapter", {
        get: function () {
            return {
                addClass: function () { return undefined; },
                browserSupportsCssVars: function () { return true; },
                computeBoundingRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                containsEventTarget: function () { return true; },
                deregisterDocumentInteractionHandler: function () { return undefined; },
                deregisterInteractionHandler: function () { return undefined; },
                deregisterResizeHandler: function () { return undefined; },
                getWindowPageOffset: function () { return ({ x: 0, y: 0 }); },
                isSurfaceActive: function () { return true; },
                isSurfaceDisabled: function () { return true; },
                isUnbounded: function () { return true; },
                registerDocumentInteractionHandler: function () { return undefined; },
                registerInteractionHandler: function () { return undefined; },
                registerResizeHandler: function () { return undefined; },
                removeClass: function () { return undefined; },
                updateCssVariable: function () { return undefined; },
            };
        },
        enumerable: true,
        configurable: true
    });
    MDCRippleFoundation.prototype.init = function () {
        var _this = this;
        var supportsPressRipple = this.supportsPressRipple_();
        this.registerRootHandlers_(supportsPressRipple);
        if (supportsPressRipple) {
            var _a = MDCRippleFoundation.cssClasses, ROOT_1 = _a.ROOT, UNBOUNDED_1 = _a.UNBOUNDED;
            requestAnimationFrame(function () {
                _this.adapter.addClass(ROOT_1);
                if (_this.adapter.isUnbounded()) {
                    _this.adapter.addClass(UNBOUNDED_1);
                    // Unbounded ripples need layout logic applied immediately to set coordinates for both shade and ripple
                    _this.layoutInternal_();
                }
            });
        }
    };
    MDCRippleFoundation.prototype.destroy = function () {
        var _this = this;
        if (this.supportsPressRipple_()) {
            if (this.activationTimer_) {
                clearTimeout(this.activationTimer_);
                this.activationTimer_ = 0;
                this.adapter.removeClass(MDCRippleFoundation.cssClasses.FG_ACTIVATION);
            }
            if (this.fgDeactivationRemovalTimer_) {
                clearTimeout(this.fgDeactivationRemovalTimer_);
                this.fgDeactivationRemovalTimer_ = 0;
                this.adapter.removeClass(MDCRippleFoundation.cssClasses.FG_DEACTIVATION);
            }
            var _a = MDCRippleFoundation.cssClasses, ROOT_2 = _a.ROOT, UNBOUNDED_2 = _a.UNBOUNDED;
            requestAnimationFrame(function () {
                _this.adapter.removeClass(ROOT_2);
                _this.adapter.removeClass(UNBOUNDED_2);
                _this.removeCssVars_();
            });
        }
        this.deregisterRootHandlers_();
        this.deregisterDeactivationHandlers_();
    };
    /**
     * @param evt Optional event containing position information.
     */
    MDCRippleFoundation.prototype.activate = function (evt) {
        this.activate_(evt);
    };
    MDCRippleFoundation.prototype.deactivate = function () {
        this.deactivate_();
    };
    MDCRippleFoundation.prototype.layout = function () {
        var _this = this;
        if (this.layoutFrame_) {
            cancelAnimationFrame(this.layoutFrame_);
        }
        this.layoutFrame_ = requestAnimationFrame(function () {
            _this.layoutInternal_();
            _this.layoutFrame_ = 0;
        });
    };
    MDCRippleFoundation.prototype.setUnbounded = function (unbounded) {
        var UNBOUNDED = MDCRippleFoundation.cssClasses.UNBOUNDED;
        if (unbounded) {
            this.adapter.addClass(UNBOUNDED);
        }
        else {
            this.adapter.removeClass(UNBOUNDED);
        }
    };
    MDCRippleFoundation.prototype.handleFocus = function () {
        var _this = this;
        requestAnimationFrame(function () { return _this.adapter.addClass(MDCRippleFoundation.cssClasses.BG_FOCUSED); });
    };
    MDCRippleFoundation.prototype.handleBlur = function () {
        var _this = this;
        requestAnimationFrame(function () { return _this.adapter.removeClass(MDCRippleFoundation.cssClasses.BG_FOCUSED); });
    };
    /**
     * We compute this property so that we are not querying information about the client
     * until the point in time where the foundation requests it. This prevents scenarios where
     * client-side feature-detection may happen too early, such as when components are rendered on the server
     * and then initialized at mount time on the client.
     */
    MDCRippleFoundation.prototype.supportsPressRipple_ = function () {
        return this.adapter.browserSupportsCssVars();
    };
    MDCRippleFoundation.prototype.defaultActivationState_ = function () {
        return {
            activationEvent: undefined,
            hasDeactivationUXRun: false,
            isActivated: false,
            isProgrammatic: false,
            wasActivatedByPointer: false,
            wasElementMadeActive: false,
        };
    };
    /**
     * supportsPressRipple Passed from init to save a redundant function call
     */
    MDCRippleFoundation.prototype.registerRootHandlers_ = function (supportsPressRipple) {
        var _this = this;
        if (supportsPressRipple) {
            ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter.registerInteractionHandler(evtType, _this.activateHandler_);
            });
            if (this.adapter.isUnbounded()) {
                this.adapter.registerResizeHandler(this.resizeHandler_);
            }
        }
        this.adapter.registerInteractionHandler('focus', this.focusHandler_);
        this.adapter.registerInteractionHandler('blur', this.blurHandler_);
    };
    MDCRippleFoundation.prototype.registerDeactivationHandlers_ = function (evt) {
        var _this = this;
        if (evt.type === 'keydown') {
            this.adapter.registerInteractionHandler('keyup', this.deactivateHandler_);
        }
        else {
            POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter.registerDocumentInteractionHandler(evtType, _this.deactivateHandler_);
            });
        }
    };
    MDCRippleFoundation.prototype.deregisterRootHandlers_ = function () {
        var _this = this;
        ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
            _this.adapter.deregisterInteractionHandler(evtType, _this.activateHandler_);
        });
        this.adapter.deregisterInteractionHandler('focus', this.focusHandler_);
        this.adapter.deregisterInteractionHandler('blur', this.blurHandler_);
        if (this.adapter.isUnbounded()) {
            this.adapter.deregisterResizeHandler(this.resizeHandler_);
        }
    };
    MDCRippleFoundation.prototype.deregisterDeactivationHandlers_ = function () {
        var _this = this;
        this.adapter.deregisterInteractionHandler('keyup', this.deactivateHandler_);
        POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
            _this.adapter.deregisterDocumentInteractionHandler(evtType, _this.deactivateHandler_);
        });
    };
    MDCRippleFoundation.prototype.removeCssVars_ = function () {
        var _this = this;
        var rippleStrings = MDCRippleFoundation.strings;
        var keys = Object.keys(rippleStrings);
        keys.forEach(function (key) {
            if (key.indexOf('VAR_') === 0) {
                _this.adapter.updateCssVariable(rippleStrings[key], null);
            }
        });
    };
    MDCRippleFoundation.prototype.activate_ = function (evt) {
        var _this = this;
        if (this.adapter.isSurfaceDisabled()) {
            return;
        }
        var activationState = this.activationState_;
        if (activationState.isActivated) {
            return;
        }
        // Avoid reacting to follow-on events fired by touch device after an already-processed user interaction
        var previousActivationEvent = this.previousActivationEvent_;
        var isSameInteraction = previousActivationEvent && evt !== undefined && previousActivationEvent.type !== evt.type;
        if (isSameInteraction) {
            return;
        }
        activationState.isActivated = true;
        activationState.isProgrammatic = evt === undefined;
        activationState.activationEvent = evt;
        activationState.wasActivatedByPointer = activationState.isProgrammatic ? false : evt !== undefined && (evt.type === 'mousedown' || evt.type === 'touchstart' || evt.type === 'pointerdown');
        var hasActivatedChild = evt !== undefined &&
            activatedTargets.length > 0 &&
            activatedTargets.some(function (target) { return _this.adapter.containsEventTarget(target); });
        if (hasActivatedChild) {
            // Immediately reset activation state, while preserving logic that prevents touch follow-on events
            this.resetActivationState_();
            return;
        }
        if (evt !== undefined) {
            activatedTargets.push(evt.target);
            this.registerDeactivationHandlers_(evt);
        }
        activationState.wasElementMadeActive = this.checkElementMadeActive_(evt);
        if (activationState.wasElementMadeActive) {
            this.animateActivation_();
        }
        requestAnimationFrame(function () {
            // Reset array on next frame after the current event has had a chance to bubble to prevent ancestor ripples
            activatedTargets = [];
            if (!activationState.wasElementMadeActive
                && evt !== undefined
                && (evt.key === ' ' || evt.keyCode === 32)) {
                // If space was pressed, try again within an rAF call to detect :active, because different UAs report
                // active states inconsistently when they're called within event handling code:
                // - https://bugs.chromium.org/p/chromium/issues/detail?id=635971
                // - https://bugzilla.mozilla.org/show_bug.cgi?id=1293741
                // We try first outside rAF to support Edge, which does not exhibit this problem, but will crash if a CSS
                // variable is set within a rAF callback for a submit button interaction (#2241).
                activationState.wasElementMadeActive = _this.checkElementMadeActive_(evt);
                if (activationState.wasElementMadeActive) {
                    _this.animateActivation_();
                }
            }
            if (!activationState.wasElementMadeActive) {
                // Reset activation state immediately if element was not made active.
                _this.activationState_ = _this.defaultActivationState_();
            }
        });
    };
    MDCRippleFoundation.prototype.checkElementMadeActive_ = function (evt) {
        return (evt !== undefined && evt.type === 'keydown') ?
            this.adapter.isSurfaceActive() :
            true;
    };
    MDCRippleFoundation.prototype.animateActivation_ = function () {
        var _this = this;
        var _a = MDCRippleFoundation.strings, VAR_FG_TRANSLATE_START = _a.VAR_FG_TRANSLATE_START, VAR_FG_TRANSLATE_END = _a.VAR_FG_TRANSLATE_END;
        var _b = MDCRippleFoundation.cssClasses, FG_DEACTIVATION = _b.FG_DEACTIVATION, FG_ACTIVATION = _b.FG_ACTIVATION;
        var DEACTIVATION_TIMEOUT_MS = MDCRippleFoundation.numbers.DEACTIVATION_TIMEOUT_MS;
        this.layoutInternal_();
        var translateStart = '';
        var translateEnd = '';
        if (!this.adapter.isUnbounded()) {
            var _c = this.getFgTranslationCoordinates_(), startPoint = _c.startPoint, endPoint = _c.endPoint;
            translateStart = startPoint.x + "px, " + startPoint.y + "px";
            translateEnd = endPoint.x + "px, " + endPoint.y + "px";
        }
        this.adapter.updateCssVariable(VAR_FG_TRANSLATE_START, translateStart);
        this.adapter.updateCssVariable(VAR_FG_TRANSLATE_END, translateEnd);
        // Cancel any ongoing activation/deactivation animations
        clearTimeout(this.activationTimer_);
        clearTimeout(this.fgDeactivationRemovalTimer_);
        this.rmBoundedActivationClasses_();
        this.adapter.removeClass(FG_DEACTIVATION);
        // Force layout in order to re-trigger the animation.
        this.adapter.computeBoundingRect();
        this.adapter.addClass(FG_ACTIVATION);
        this.activationTimer_ = setTimeout(function () { return _this.activationTimerCallback_(); }, DEACTIVATION_TIMEOUT_MS);
    };
    MDCRippleFoundation.prototype.getFgTranslationCoordinates_ = function () {
        var _a = this.activationState_, activationEvent = _a.activationEvent, wasActivatedByPointer = _a.wasActivatedByPointer;
        var startPoint;
        if (wasActivatedByPointer) {
            startPoint = getNormalizedEventCoords(activationEvent, this.adapter.getWindowPageOffset(), this.adapter.computeBoundingRect());
        }
        else {
            startPoint = {
                x: this.frame_.width / 2,
                y: this.frame_.height / 2,
            };
        }
        // Center the element around the start point.
        startPoint = {
            x: startPoint.x - (this.initialSize_ / 2),
            y: startPoint.y - (this.initialSize_ / 2),
        };
        var endPoint = {
            x: (this.frame_.width / 2) - (this.initialSize_ / 2),
            y: (this.frame_.height / 2) - (this.initialSize_ / 2),
        };
        return { startPoint: startPoint, endPoint: endPoint };
    };
    MDCRippleFoundation.prototype.runDeactivationUXLogicIfReady_ = function () {
        var _this = this;
        // This method is called both when a pointing device is released, and when the activation animation ends.
        // The deactivation animation should only run after both of those occur.
        var FG_DEACTIVATION = MDCRippleFoundation.cssClasses.FG_DEACTIVATION;
        var _a = this.activationState_, hasDeactivationUXRun = _a.hasDeactivationUXRun, isActivated = _a.isActivated;
        var activationHasEnded = hasDeactivationUXRun || !isActivated;
        if (activationHasEnded && this.activationAnimationHasEnded_) {
            this.rmBoundedActivationClasses_();
            this.adapter.addClass(FG_DEACTIVATION);
            this.fgDeactivationRemovalTimer_ = setTimeout(function () {
                _this.adapter.removeClass(FG_DEACTIVATION);
            }, numbers$2.FG_DEACTIVATION_MS);
        }
    };
    MDCRippleFoundation.prototype.rmBoundedActivationClasses_ = function () {
        var FG_ACTIVATION = MDCRippleFoundation.cssClasses.FG_ACTIVATION;
        this.adapter.removeClass(FG_ACTIVATION);
        this.activationAnimationHasEnded_ = false;
        this.adapter.computeBoundingRect();
    };
    MDCRippleFoundation.prototype.resetActivationState_ = function () {
        var _this = this;
        this.previousActivationEvent_ = this.activationState_.activationEvent;
        this.activationState_ = this.defaultActivationState_();
        // Touch devices may fire additional events for the same interaction within a short time.
        // Store the previous event until it's safe to assume that subsequent events are for new interactions.
        setTimeout(function () { return _this.previousActivationEvent_ = undefined; }, MDCRippleFoundation.numbers.TAP_DELAY_MS);
    };
    MDCRippleFoundation.prototype.deactivate_ = function () {
        var _this = this;
        var activationState = this.activationState_;
        // This can happen in scenarios such as when you have a keyup event that blurs the element.
        if (!activationState.isActivated) {
            return;
        }
        var state = __assign({}, activationState);
        if (activationState.isProgrammatic) {
            requestAnimationFrame(function () { return _this.animateDeactivation_(state); });
            this.resetActivationState_();
        }
        else {
            this.deregisterDeactivationHandlers_();
            requestAnimationFrame(function () {
                _this.activationState_.hasDeactivationUXRun = true;
                _this.animateDeactivation_(state);
                _this.resetActivationState_();
            });
        }
    };
    MDCRippleFoundation.prototype.animateDeactivation_ = function (_a) {
        var wasActivatedByPointer = _a.wasActivatedByPointer, wasElementMadeActive = _a.wasElementMadeActive;
        if (wasActivatedByPointer || wasElementMadeActive) {
            this.runDeactivationUXLogicIfReady_();
        }
    };
    MDCRippleFoundation.prototype.layoutInternal_ = function () {
        var _this = this;
        this.frame_ = this.adapter.computeBoundingRect();
        var maxDim = Math.max(this.frame_.height, this.frame_.width);
        // Surface diameter is treated differently for unbounded vs. bounded ripples.
        // Unbounded ripple diameter is calculated smaller since the surface is expected to already be padded appropriately
        // to extend the hitbox, and the ripple is expected to meet the edges of the padded hitbox (which is typically
        // square). Bounded ripples, on the other hand, are fully expected to expand beyond the surface's longest diameter
        // (calculated based on the diagonal plus a constant padding), and are clipped at the surface's border via
        // `overflow: hidden`.
        var getBoundedRadius = function () {
            var hypotenuse = Math.sqrt(Math.pow(_this.frame_.width, 2) + Math.pow(_this.frame_.height, 2));
            return hypotenuse + MDCRippleFoundation.numbers.PADDING;
        };
        this.maxRadius_ = this.adapter.isUnbounded() ? maxDim : getBoundedRadius();
        // Ripple is sized as a fraction of the largest dimension of the surface, then scales up using a CSS scale transform
        var initialSize = Math.floor(maxDim * MDCRippleFoundation.numbers.INITIAL_ORIGIN_SCALE);
        // Unbounded ripple size should always be even number to equally center align.
        if (this.adapter.isUnbounded() && initialSize % 2 !== 0) {
            this.initialSize_ = initialSize - 1;
        }
        else {
            this.initialSize_ = initialSize;
        }
        this.fgScale_ = "" + this.maxRadius_ / this.initialSize_;
        this.updateLayoutCssVars_();
    };
    MDCRippleFoundation.prototype.updateLayoutCssVars_ = function () {
        var _a = MDCRippleFoundation.strings, VAR_FG_SIZE = _a.VAR_FG_SIZE, VAR_LEFT = _a.VAR_LEFT, VAR_TOP = _a.VAR_TOP, VAR_FG_SCALE = _a.VAR_FG_SCALE;
        this.adapter.updateCssVariable(VAR_FG_SIZE, this.initialSize_ + "px");
        this.adapter.updateCssVariable(VAR_FG_SCALE, this.fgScale_);
        if (this.adapter.isUnbounded()) {
            this.unboundedCoords_ = {
                left: Math.round((this.frame_.width / 2) - (this.initialSize_ / 2)),
                top: Math.round((this.frame_.height / 2) - (this.initialSize_ / 2)),
            };
            this.adapter.updateCssVariable(VAR_LEFT, this.unboundedCoords_.left + "px");
            this.adapter.updateCssVariable(VAR_TOP, this.unboundedCoords_.top + "px");
        }
    };
    return MDCRippleFoundation;
}(MDCFoundation));

/** @soyCompatible */
class RippleBase extends BaseElement {
    constructor() {
        super(...arguments);
        this.primary = false;
        this.accent = false;
        this.unbounded = false;
        this.disabled = false;
        this.activated = false;
        this.selected = false;
        this.hovering = false;
        this.bgFocused = false;
        this.fgActivation = false;
        this.fgDeactivation = false;
        this.fgScale = '';
        this.fgSize = '';
        this.translateStart = '';
        this.translateEnd = '';
        this.leftPos = '';
        this.topPos = '';
        this.mdcFoundationClass = MDCRippleFoundation;
    }
    get isActive() {
        return (this.parentElement || this).matches(':active');
    }
    createAdapter() {
        return {
            browserSupportsCssVars: () => true,
            isUnbounded: () => this.unbounded,
            isSurfaceActive: () => this.isActive,
            isSurfaceDisabled: () => this.disabled,
            addClass: (className) => {
                switch (className) {
                    case 'mdc-ripple-upgraded--background-focused':
                        this.bgFocused = true;
                        break;
                    case 'mdc-ripple-upgraded--foreground-activation':
                        this.fgActivation = true;
                        break;
                    case 'mdc-ripple-upgraded--foreground-deactivation':
                        this.fgDeactivation = true;
                        break;
                }
            },
            removeClass: (className) => {
                switch (className) {
                    case 'mdc-ripple-upgraded--background-focused':
                        this.bgFocused = false;
                        break;
                    case 'mdc-ripple-upgraded--foreground-activation':
                        this.fgActivation = false;
                        break;
                    case 'mdc-ripple-upgraded--foreground-deactivation':
                        this.fgDeactivation = false;
                        break;
                }
            },
            containsEventTarget: () => true,
            registerInteractionHandler: () => undefined,
            deregisterInteractionHandler: () => undefined,
            registerDocumentInteractionHandler: () => undefined,
            deregisterDocumentInteractionHandler: () => undefined,
            registerResizeHandler: () => undefined,
            deregisterResizeHandler: () => undefined,
            updateCssVariable: (varName, value) => {
                switch (varName) {
                    case '--mdc-ripple-fg-scale':
                        this.fgScale = value;
                        break;
                    case '--mdc-ripple-fg-size':
                        this.fgSize = value;
                        break;
                    case '--mdc-ripple-fg-translate-end':
                        this.translateEnd = value;
                        break;
                    case '--mdc-ripple-fg-translate-start':
                        this.translateStart = value;
                        break;
                    case '--mdc-ripple-left':
                        this.leftPos = value;
                        break;
                    case '--mdc-ripple-top':
                        this.topPos = value;
                        break;
                }
            },
            computeBoundingRect: () => (this.parentElement || this).getBoundingClientRect(),
            getWindowPageOffset: () => ({ x: window.pageXOffset, y: window.pageYOffset }),
        };
    }
    startPress(ev) {
        this.waitForFoundation(() => {
            this.mdcFoundation.activate(ev);
        });
    }
    endPress() {
        this.waitForFoundation(() => {
            this.mdcFoundation.deactivate();
        });
    }
    startFocus() {
        this.waitForFoundation(() => {
            this.mdcFoundation.handleFocus();
        });
    }
    endFocus() {
        this.waitForFoundation(() => {
            this.mdcFoundation.handleBlur();
        });
    }
    startHover() {
        this.hovering = true;
    }
    endHover() {
        this.hovering = false;
    }
    /**
     * Wait for the MDCFoundation to be created by `firstUpdated`
     */
    waitForFoundation(fn) {
        if (this.mdcFoundation) {
            fn();
        }
        else {
            this.updateComplete.then(fn);
        }
    }
    /** @soyTemplate */
    render() {
        const shouldActivateInPrimary = this.activated && (this.primary || !this.accent);
        const shouldSelectInPrimary = this.selected && (this.primary || !this.accent);
        /** @classMap */
        const classes = {
            'mdc-ripple-surface--accent': this.accent,
            'mdc-ripple-surface--primary--activated': shouldActivateInPrimary,
            'mdc-ripple-surface--accent--activated': this.accent && this.activated,
            'mdc-ripple-surface--primary--selected': shouldSelectInPrimary,
            'mdc-ripple-surface--accent--selected': this.accent && this.selected,
            'mdc-ripple-surface--disabled': this.disabled,
            'mdc-ripple-surface--hover': this.hovering,
            'mdc-ripple-surface--primary': this.primary,
            'mdc-ripple-surface--selected': this.selected,
            'mdc-ripple-upgraded--background-focused': this.bgFocused,
            'mdc-ripple-upgraded--foreground-activation': this.fgActivation,
            'mdc-ripple-upgraded--foreground-deactivation': this.fgDeactivation,
            'mdc-ripple-upgraded--unbounded': this.unbounded,
        };
        return html$2 `
        <div class="mdc-ripple-surface mdc-ripple-upgraded ${classMap(classes)}"
          style="${styleMap({
            '--mdc-ripple-fg-scale': this.fgScale,
            '--mdc-ripple-fg-size': this.fgSize,
            '--mdc-ripple-fg-translate-end': this.translateEnd,
            '--mdc-ripple-fg-translate-start': this.translateStart,
            '--mdc-ripple-left': this.leftPos,
            '--mdc-ripple-top': this.topPos,
        })}"></div>`;
    }
}
__decorate([
    query('.mdc-ripple-surface')
], RippleBase.prototype, "mdcRoot", void 0);
__decorate([
    property({ type: Boolean })
], RippleBase.prototype, "primary", void 0);
__decorate([
    property({ type: Boolean })
], RippleBase.prototype, "accent", void 0);
__decorate([
    property({ type: Boolean })
], RippleBase.prototype, "unbounded", void 0);
__decorate([
    property({ type: Boolean })
], RippleBase.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean })
], RippleBase.prototype, "activated", void 0);
__decorate([
    property({ type: Boolean })
], RippleBase.prototype, "selected", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "hovering", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "bgFocused", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "fgActivation", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "fgDeactivation", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "fgScale", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "fgSize", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "translateStart", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "translateEnd", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "leftPos", void 0);
__decorate([
    internalProperty()
], RippleBase.prototype, "topPos", void 0);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$3 = css `.mdc-ripple-surface{--mdc-ripple-fg-size: 0;--mdc-ripple-left: 0;--mdc-ripple-top: 0;--mdc-ripple-fg-scale: 1;--mdc-ripple-fg-translate-end: 0;--mdc-ripple-fg-translate-start: 0;-webkit-tap-highlight-color:rgba(0,0,0,0);will-change:transform,opacity;position:relative;outline:none;overflow:hidden}.mdc-ripple-surface::before,.mdc-ripple-surface::after{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:""}.mdc-ripple-surface::before{transition:opacity 15ms linear,background-color 15ms linear;z-index:1;z-index:var(--mdc-ripple-z-index, 1)}.mdc-ripple-surface::after{z-index:0;z-index:var(--mdc-ripple-z-index, 0)}.mdc-ripple-surface.mdc-ripple-upgraded::before{transform:scale(var(--mdc-ripple-fg-scale, 1))}.mdc-ripple-surface.mdc-ripple-upgraded::after{top:0;left:0;transform:scale(0);transform-origin:center center}.mdc-ripple-surface.mdc-ripple-upgraded--unbounded::after{top:var(--mdc-ripple-top, 0);left:var(--mdc-ripple-left, 0)}.mdc-ripple-surface.mdc-ripple-upgraded--foreground-activation::after{animation:mdc-ripple-fg-radius-in 225ms forwards,mdc-ripple-fg-opacity-in 75ms forwards}.mdc-ripple-surface.mdc-ripple-upgraded--foreground-deactivation::after{animation:mdc-ripple-fg-opacity-out 150ms;transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}.mdc-ripple-surface::before,.mdc-ripple-surface::after{background-color:#000;background-color:var(--mdc-ripple-color, #000)}.mdc-ripple-surface:hover::before,.mdc-ripple-surface.mdc-ripple-surface--hover::before{opacity:0.04;opacity:var(--mdc-ripple-hover-opacity, 0.04)}.mdc-ripple-surface.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-focus-opacity, 0.12)}.mdc-ripple-surface:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-ripple-surface:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-press-opacity, 0.12)}.mdc-ripple-surface.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: var(--mdc-ripple-press-opacity, 0.12)}.mdc-ripple-surface::before,.mdc-ripple-surface::after{top:calc(50% - 100%);left:calc(50% - 100%);width:200%;height:200%}.mdc-ripple-surface.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}.mdc-ripple-surface[data-mdc-ripple-is-unbounded],.mdc-ripple-upgraded--unbounded{overflow:visible}.mdc-ripple-surface[data-mdc-ripple-is-unbounded]::before,.mdc-ripple-surface[data-mdc-ripple-is-unbounded]::after,.mdc-ripple-upgraded--unbounded::before,.mdc-ripple-upgraded--unbounded::after{top:calc(50% - 50%);left:calc(50% - 50%);width:100%;height:100%}.mdc-ripple-surface[data-mdc-ripple-is-unbounded].mdc-ripple-upgraded::before,.mdc-ripple-surface[data-mdc-ripple-is-unbounded].mdc-ripple-upgraded::after,.mdc-ripple-upgraded--unbounded.mdc-ripple-upgraded::before,.mdc-ripple-upgraded--unbounded.mdc-ripple-upgraded::after{top:var(--mdc-ripple-top, calc(50% - 50%));left:var(--mdc-ripple-left, calc(50% - 50%));width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}.mdc-ripple-surface[data-mdc-ripple-is-unbounded].mdc-ripple-upgraded::after,.mdc-ripple-upgraded--unbounded.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}@keyframes mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}:host{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;display:block}:host .mdc-ripple-surface{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;will-change:unset}.mdc-ripple-surface--primary::before,.mdc-ripple-surface--primary::after{background-color:#6200ee;background-color:var(--mdc-ripple-color, var(--mdc-theme-primary, #6200ee))}.mdc-ripple-surface--primary:hover::before,.mdc-ripple-surface--primary.mdc-ripple-surface--hover::before{opacity:0.04;opacity:var(--mdc-ripple-hover-opacity, 0.04)}.mdc-ripple-surface--primary.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface--primary:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-focus-opacity, 0.12)}.mdc-ripple-surface--primary:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-ripple-surface--primary:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-press-opacity, 0.12)}.mdc-ripple-surface--primary.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: var(--mdc-ripple-press-opacity, 0.12)}.mdc-ripple-surface--primary--activated::before{opacity:0.12;opacity:var(--mdc-ripple-activated-opacity, 0.12)}.mdc-ripple-surface--primary--activated::before,.mdc-ripple-surface--primary--activated::after{background-color:#6200ee;background-color:var(--mdc-ripple-color, var(--mdc-theme-primary, #6200ee))}.mdc-ripple-surface--primary--activated:hover::before,.mdc-ripple-surface--primary--activated.mdc-ripple-surface--hover::before{opacity:0.16;opacity:var(--mdc-ripple-hover-opacity, 0.16)}.mdc-ripple-surface--primary--activated.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface--primary--activated:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.24;opacity:var(--mdc-ripple-focus-opacity, 0.24)}.mdc-ripple-surface--primary--activated:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-ripple-surface--primary--activated:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.24;opacity:var(--mdc-ripple-press-opacity, 0.24)}.mdc-ripple-surface--primary--activated.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: var(--mdc-ripple-press-opacity, 0.24)}.mdc-ripple-surface--primary--selected::before{opacity:0.08;opacity:var(--mdc-ripple-selected-opacity, 0.08)}.mdc-ripple-surface--primary--selected::before,.mdc-ripple-surface--primary--selected::after{background-color:#6200ee;background-color:var(--mdc-ripple-color, var(--mdc-theme-primary, #6200ee))}.mdc-ripple-surface--primary--selected:hover::before,.mdc-ripple-surface--primary--selected.mdc-ripple-surface--hover::before{opacity:0.12;opacity:var(--mdc-ripple-hover-opacity, 0.12)}.mdc-ripple-surface--primary--selected.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface--primary--selected:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.2;opacity:var(--mdc-ripple-focus-opacity, 0.2)}.mdc-ripple-surface--primary--selected:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-ripple-surface--primary--selected:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.2;opacity:var(--mdc-ripple-press-opacity, 0.2)}.mdc-ripple-surface--primary--selected.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: var(--mdc-ripple-press-opacity, 0.2)}.mdc-ripple-surface--accent::before,.mdc-ripple-surface--accent::after{background-color:#018786;background-color:var(--mdc-ripple-color, var(--mdc-theme-secondary, #018786))}.mdc-ripple-surface--accent:hover::before,.mdc-ripple-surface--accent.mdc-ripple-surface--hover::before{opacity:0.04;opacity:var(--mdc-ripple-hover-opacity, 0.04)}.mdc-ripple-surface--accent.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface--accent:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-focus-opacity, 0.12)}.mdc-ripple-surface--accent:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-ripple-surface--accent:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-press-opacity, 0.12)}.mdc-ripple-surface--accent.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: var(--mdc-ripple-press-opacity, 0.12)}.mdc-ripple-surface--accent--activated::before{opacity:0.12;opacity:var(--mdc-ripple-activated-opacity, 0.12)}.mdc-ripple-surface--accent--activated::before,.mdc-ripple-surface--accent--activated::after{background-color:#018786;background-color:var(--mdc-ripple-color, var(--mdc-theme-secondary, #018786))}.mdc-ripple-surface--accent--activated:hover::before,.mdc-ripple-surface--accent--activated.mdc-ripple-surface--hover::before{opacity:0.16;opacity:var(--mdc-ripple-hover-opacity, 0.16)}.mdc-ripple-surface--accent--activated.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface--accent--activated:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.24;opacity:var(--mdc-ripple-focus-opacity, 0.24)}.mdc-ripple-surface--accent--activated:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-ripple-surface--accent--activated:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.24;opacity:var(--mdc-ripple-press-opacity, 0.24)}.mdc-ripple-surface--accent--activated.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: var(--mdc-ripple-press-opacity, 0.24)}.mdc-ripple-surface--accent--selected::before{opacity:0.08;opacity:var(--mdc-ripple-selected-opacity, 0.08)}.mdc-ripple-surface--accent--selected::before,.mdc-ripple-surface--accent--selected::after{background-color:#018786;background-color:var(--mdc-ripple-color, var(--mdc-theme-secondary, #018786))}.mdc-ripple-surface--accent--selected:hover::before,.mdc-ripple-surface--accent--selected.mdc-ripple-surface--hover::before{opacity:0.12;opacity:var(--mdc-ripple-hover-opacity, 0.12)}.mdc-ripple-surface--accent--selected.mdc-ripple-upgraded--background-focused::before,.mdc-ripple-surface--accent--selected:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.2;opacity:var(--mdc-ripple-focus-opacity, 0.2)}.mdc-ripple-surface--accent--selected:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-ripple-surface--accent--selected:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.2;opacity:var(--mdc-ripple-press-opacity, 0.2)}.mdc-ripple-surface--accent--selected.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: var(--mdc-ripple-press-opacity, 0.2)}.mdc-ripple-surface--disabled{opacity:0}`;

/** @soyCompatible */
let Ripple = class Ripple extends RippleBase {
};
Ripple.styles = style$3;
Ripple = __decorate([
    customElement('mwc-ripple')
], Ripple);

/**
@license
Copyright 2020 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/**
 * Class that encapsulates the events handlers for `mwc-ripple`
 *
 *
 * Example:
 * ```
 * class XFoo extends LitElement {
 *   async getRipple() {
 *     this.renderRipple = true;
 *     await this.updateComplete;
 *     return this.renderRoot.querySelector('mwc-ripple');
 *   }
 *   rippleHandlers = new RippleHandlers(() => this.getRipple());
 *
 *   render() {
 *     return html`
 *       <div @mousedown=${this.rippleHandlers.startPress}></div>
 *       ${this.renderRipple ? html`<mwc-ripple></mwc-ripple>` : ''}
 *     `;
 *   }
 * }
 * ```
 */
class RippleHandlers {
    constructor(
    /** Function that returns a `mwc-ripple` */
    rippleFn) {
        this.startPress = (ev) => {
            rippleFn().then((r) => {
                r && r.startPress(ev);
            });
        };
        this.endPress = () => {
            rippleFn().then((r) => {
                r && r.endPress();
            });
        };
        this.startFocus = () => {
            rippleFn().then((r) => {
                r && r.startFocus();
            });
        };
        this.endFocus = () => {
            rippleFn().then((r) => {
                r && r.endFocus();
            });
        };
        this.startHover = () => {
            rippleFn().then((r) => {
                r && r.startHover();
            });
        };
        this.endHover = () => {
            rippleFn().then((r) => {
                r && r.endHover();
            });
        };
    }
}

/**
 @license
 Copyright 2020 Google Inc. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
/**
 * @fires request-selected {RequestSelectedDetail}
 * @fires list-item-rendered
 */
class ListItemBase extends LitElement {
    constructor() {
        super(...arguments);
        this.value = '';
        this.group = null;
        this.tabindex = -1;
        this.disabled = false;
        this.twoline = false;
        this.activated = false;
        this.graphic = null;
        this.multipleGraphics = false;
        this.hasMeta = false;
        this.noninteractive = false;
        this.selected = false;
        this.shouldRenderRipple = false;
        this._managingList = null;
        this.boundOnClick = this.onClick.bind(this);
        this._firstChanged = true;
        this._skipPropRequest = false;
        this.rippleHandlers = new RippleHandlers(() => {
            this.shouldRenderRipple = true;
            return this.ripple;
        });
        this.listeners = [
            {
                target: this,
                eventNames: ['click'],
                cb: () => {
                    this.onClick();
                },
            },
            {
                target: this,
                eventNames: ['mouseenter'],
                cb: this.rippleHandlers.startHover,
            },
            {
                target: this,
                eventNames: ['mouseleave'],
                cb: this.rippleHandlers.endHover,
            },
            {
                target: this,
                eventNames: ['focus'],
                cb: this.rippleHandlers.startFocus,
            },
            {
                target: this,
                eventNames: ['blur'],
                cb: this.rippleHandlers.endFocus,
            },
            {
                target: this,
                eventNames: ['mousedown', 'touchstart'],
                cb: (e) => {
                    const name = e.type;
                    this.onDown(name === 'mousedown' ? 'mouseup' : 'touchend', e);
                },
            },
        ];
    }
    get text() {
        const textContent = this.textContent;
        return textContent ? textContent.trim() : '';
    }
    render() {
        const text = this.renderText();
        const graphic = this.graphic ? this.renderGraphic() : html$2 ``;
        const meta = this.hasMeta ? this.renderMeta() : html$2 ``;
        return html$2 `
      ${this.renderRipple()}
      ${graphic}
      ${text}
      ${meta}`;
    }
    renderRipple() {
        if (this.shouldRenderRipple) {
            return html$2 `
      <mwc-ripple
        .activated=${this.activated}>
      </mwc-ripple>`;
        }
        else if (this.activated) {
            return html$2 `<div class="fake-activated-ripple"></div>`;
        }
        else {
            return '';
        }
    }
    renderGraphic() {
        const graphicClasses = {
            multi: this.multipleGraphics,
        };
        return html$2 `
      <span class="mdc-list-item__graphic material-icons ${classMap(graphicClasses)}">
        <slot name="graphic"></slot>
      </span>`;
    }
    renderMeta() {
        return html$2 `
      <span class="mdc-list-item__meta material-icons">
        <slot name="meta"></slot>
      </span>`;
    }
    renderText() {
        const inner = this.twoline ? this.renderTwoline() : this.renderSingleLine();
        return html$2 `
      <span class="mdc-list-item__text">
        ${inner}
      </span>`;
    }
    renderSingleLine() {
        return html$2 `<slot></slot>`;
    }
    renderTwoline() {
        return html$2 `
      <span class="mdc-list-item__primary-text">
        <slot></slot>
      </span>
      <span class="mdc-list-item__secondary-text">
        <slot name="secondary"></slot>
      </span>
    `;
    }
    onClick() {
        this.fireRequestSelected(!this.selected, 'interaction');
    }
    onDown(upName, evt) {
        const onUp = () => {
            window.removeEventListener(upName, onUp);
            this.rippleHandlers.endPress();
        };
        window.addEventListener(upName, onUp);
        this.rippleHandlers.startPress(evt);
    }
    fireRequestSelected(selected, source) {
        if (this.noninteractive) {
            return;
        }
        const customEv = new CustomEvent('request-selected', { bubbles: true, composed: true, detail: { source, selected } });
        this.dispatchEvent(customEv);
    }
    connectedCallback() {
        super.connectedCallback();
        if (!this.noninteractive) {
            this.setAttribute('mwc-list-item', '');
        }
        for (const listener of this.listeners) {
            for (const eventName of listener.eventNames) {
                listener.target.addEventListener(eventName, listener.cb, { passive: true });
            }
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        for (const listener of this.listeners) {
            for (const eventName of listener.eventNames) {
                listener.target.removeEventListener(eventName, listener.cb);
            }
        }
        if (this._managingList) {
            this._managingList.debouncedLayout ?
                this._managingList.debouncedLayout(true) :
                this._managingList.layout(true);
        }
    }
    // composed flag, event fire through shadow root and up through composed tree
    firstUpdated() {
        const ev = new Event('list-item-rendered', { bubbles: true, composed: true });
        this.dispatchEvent(ev);
    }
}
__decorate([
    query('slot')
], ListItemBase.prototype, "slotElement", void 0);
__decorate([
    queryAsync('mwc-ripple')
], ListItemBase.prototype, "ripple", void 0);
__decorate([
    property({ type: String })
], ListItemBase.prototype, "value", void 0);
__decorate([
    property({ type: String, reflect: true })
], ListItemBase.prototype, "group", void 0);
__decorate([
    property({ type: Number, reflect: true })
], ListItemBase.prototype, "tabindex", void 0);
__decorate([
    property({ type: Boolean, reflect: true }),
    observer(function (value) {
        if (value) {
            this.setAttribute('aria-disabled', 'true');
        }
        else {
            this.setAttribute('aria-disabled', 'false');
        }
    })
], ListItemBase.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], ListItemBase.prototype, "twoline", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], ListItemBase.prototype, "activated", void 0);
__decorate([
    property({ type: String, reflect: true })
], ListItemBase.prototype, "graphic", void 0);
__decorate([
    property({ type: Boolean })
], ListItemBase.prototype, "multipleGraphics", void 0);
__decorate([
    property({ type: Boolean })
], ListItemBase.prototype, "hasMeta", void 0);
__decorate([
    property({ type: Boolean, reflect: true }),
    observer(function (value) {
        if (value) {
            this.removeAttribute('aria-checked');
            this.removeAttribute('mwc-list-item');
            this.selected = false;
            this.activated = false;
            this.tabIndex = -1;
        }
        else {
            this.setAttribute('mwc-list-item', '');
        }
    })
], ListItemBase.prototype, "noninteractive", void 0);
__decorate([
    property({ type: Boolean, reflect: true }),
    observer(function (value) {
        const role = this.getAttribute('role');
        const isAriaSelectable = role === 'gridcell' || role === 'option' ||
            role === 'row' || role === 'tab';
        if (isAriaSelectable && value) {
            this.setAttribute('aria-selected', 'true');
        }
        else if (isAriaSelectable) {
            this.setAttribute('aria-selected', 'false');
        }
        if (this._firstChanged) {
            this._firstChanged = false;
            return;
        }
        if (this._skipPropRequest) {
            return;
        }
        this.fireRequestSelected(value, 'property');
    })
], ListItemBase.prototype, "selected", void 0);
__decorate([
    internalProperty()
], ListItemBase.prototype, "shouldRenderRipple", void 0);
__decorate([
    internalProperty()
], ListItemBase.prototype, "_managingList", void 0);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$4 = css `:host{cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;height:48px;display:flex;position:relative;align-items:center;justify-content:flex-start;overflow:hidden;padding:0;padding-left:var(--mdc-list-side-padding, 16px);padding-right:var(--mdc-list-side-padding, 16px);outline:none;height:48px;color:rgba(0,0,0,.87);color:var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, 0.87))}:host:focus{outline:none}:host([activated]){color:#6200ee;color:var(--mdc-theme-primary, #6200ee);--mdc-ripple-color: var(--mdc-theme-primary, #6200ee)}:host([activated]) .mdc-list-item__graphic{color:#6200ee;color:var(--mdc-theme-primary, #6200ee)}:host([activated]) .fake-activated-ripple::before{position:absolute;display:block;top:0;bottom:0;left:0;right:0;width:100%;height:100%;pointer-events:none;z-index:1;content:"";opacity:0.12;opacity:var(--mdc-ripple-activated-opacity, 0.12);background-color:#6200ee;background-color:var(--mdc-ripple-color, var(--mdc-theme-primary, #6200ee))}.mdc-list-item__graphic{flex-shrink:0;align-items:center;justify-content:center;fill:currentColor;display:inline-flex}.mdc-list-item__graphic ::slotted(*){flex-shrink:0;align-items:center;justify-content:center;fill:currentColor;width:100%;height:100%;text-align:center}.mdc-list-item__meta{width:var(--mdc-list-item-meta-size, 24px);height:var(--mdc-list-item-meta-size, 24px);margin-left:auto;margin-right:0;color:rgba(0, 0, 0, 0.38);color:var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.38))}.mdc-list-item__meta.multi{width:auto}.mdc-list-item__meta ::slotted(*){width:var(--mdc-list-item-meta-size, 24px);line-height:var(--mdc-list-item-meta-size, 24px)}.mdc-list-item__meta ::slotted(.material-icons),.mdc-list-item__meta ::slotted(mwc-icon){line-height:var(--mdc-list-item-meta-size, 24px) !important}.mdc-list-item__meta ::slotted(:not(.material-icons):not(mwc-icon)){-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-caption-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.75rem;font-size:var(--mdc-typography-caption-font-size, 0.75rem);line-height:1.25rem;line-height:var(--mdc-typography-caption-line-height, 1.25rem);font-weight:400;font-weight:var(--mdc-typography-caption-font-weight, 400);letter-spacing:0.0333333333em;letter-spacing:var(--mdc-typography-caption-letter-spacing, 0.0333333333em);text-decoration:inherit;text-decoration:var(--mdc-typography-caption-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-caption-text-transform, inherit)}:host[dir=rtl] .mdc-list-item__meta,[dir=rtl] :host .mdc-list-item__meta{margin-left:0;margin-right:auto}.mdc-list-item__meta ::slotted(*){width:100%;height:100%}.mdc-list-item__text{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.mdc-list-item__text ::slotted([for]),.mdc-list-item__text[for]{pointer-events:none}.mdc-list-item__primary-text{text-overflow:ellipsis;white-space:nowrap;overflow:hidden;display:block;margin-top:0;line-height:normal;margin-bottom:-20px;display:block}.mdc-list-item__primary-text::before{display:inline-block;width:0;height:32px;content:"";vertical-align:0}.mdc-list-item__primary-text::after{display:inline-block;width:0;height:20px;content:"";vertical-align:-20px}.mdc-list-item__secondary-text{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-body2-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.875rem;font-size:var(--mdc-typography-body2-font-size, 0.875rem);line-height:1.25rem;line-height:var(--mdc-typography-body2-line-height, 1.25rem);font-weight:400;font-weight:var(--mdc-typography-body2-font-weight, 400);letter-spacing:0.0178571429em;letter-spacing:var(--mdc-typography-body2-letter-spacing, 0.0178571429em);text-decoration:inherit;text-decoration:var(--mdc-typography-body2-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-body2-text-transform, inherit);text-overflow:ellipsis;white-space:nowrap;overflow:hidden;display:block;margin-top:0;line-height:normal;display:block}.mdc-list-item__secondary-text::before{display:inline-block;width:0;height:20px;content:"";vertical-align:0}.mdc-list--dense .mdc-list-item__secondary-text{font-size:inherit}* ::slotted(a),a{color:inherit;text-decoration:none}:host([twoline]){height:72px}:host([twoline]) .mdc-list-item__text{align-self:flex-start}:host([disabled]),:host([noninteractive]){cursor:default;pointer-events:none}:host([disabled]) .mdc-list-item__text ::slotted(*){opacity:.38}:host([disabled]) .mdc-list-item__text ::slotted(*),:host([disabled]) .mdc-list-item__primary-text ::slotted(*),:host([disabled]) .mdc-list-item__secondary-text ::slotted(*){color:#000;color:var(--mdc-theme-on-surface, #000)}.mdc-list-item__secondary-text ::slotted(*){color:rgba(0, 0, 0, 0.54);color:var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54))}.mdc-list-item__graphic ::slotted(*){background-color:transparent;color:rgba(0, 0, 0, 0.38);color:var(--mdc-theme-text-icon-on-background, rgba(0, 0, 0, 0.38))}.mdc-list-group__subheader ::slotted(*){color:rgba(0, 0, 0, 0.87);color:var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, 0.87))}:host([graphic=avatar]) .mdc-list-item__graphic{width:var(--mdc-list-item-graphic-size, 40px);height:var(--mdc-list-item-graphic-size, 40px)}:host([graphic=avatar]) .mdc-list-item__graphic.multi{width:auto}:host([graphic=avatar]) .mdc-list-item__graphic ::slotted(*){width:var(--mdc-list-item-graphic-size, 40px);line-height:var(--mdc-list-item-graphic-size, 40px)}:host([graphic=avatar]) .mdc-list-item__graphic ::slotted(.material-icons),:host([graphic=avatar]) .mdc-list-item__graphic ::slotted(mwc-icon){line-height:var(--mdc-list-item-graphic-size, 40px) !important}:host([graphic=avatar]) .mdc-list-item__graphic ::slotted(*){border-radius:50%}:host([graphic=avatar],[graphic=medium],[graphic=large],[graphic=control]) .mdc-list-item__graphic{margin-left:0;margin-right:var(--mdc-list-item-graphic-margin, 16px)}:host[dir=rtl] :host([graphic=avatar],[graphic=medium],[graphic=large],[graphic=control]) .mdc-list-item__graphic,[dir=rtl] :host :host([graphic=avatar],[graphic=medium],[graphic=large],[graphic=control]) .mdc-list-item__graphic{margin-left:var(--mdc-list-item-graphic-margin, 16px);margin-right:0}:host([graphic=icon]) .mdc-list-item__graphic{width:var(--mdc-list-item-graphic-size, 24px);height:var(--mdc-list-item-graphic-size, 24px);margin-left:0;margin-right:var(--mdc-list-item-graphic-margin, 32px)}:host([graphic=icon]) .mdc-list-item__graphic.multi{width:auto}:host([graphic=icon]) .mdc-list-item__graphic ::slotted(*){width:var(--mdc-list-item-graphic-size, 24px);line-height:var(--mdc-list-item-graphic-size, 24px)}:host([graphic=icon]) .mdc-list-item__graphic ::slotted(.material-icons),:host([graphic=icon]) .mdc-list-item__graphic ::slotted(mwc-icon){line-height:var(--mdc-list-item-graphic-size, 24px) !important}:host[dir=rtl] :host([graphic=icon]) .mdc-list-item__graphic,[dir=rtl] :host :host([graphic=icon]) .mdc-list-item__graphic{margin-left:var(--mdc-list-item-graphic-margin, 32px);margin-right:0}:host([graphic=avatar]:not([twoLine])),:host([graphic=icon]:not([twoLine])){height:56px}:host([graphic=medium]:not([twoLine])),:host([graphic=large]:not([twoLine])){height:72px}:host([graphic=medium]) .mdc-list-item__graphic,:host([graphic=large]) .mdc-list-item__graphic{width:var(--mdc-list-item-graphic-size, 56px);height:var(--mdc-list-item-graphic-size, 56px)}:host([graphic=medium]) .mdc-list-item__graphic.multi,:host([graphic=large]) .mdc-list-item__graphic.multi{width:auto}:host([graphic=medium]) .mdc-list-item__graphic ::slotted(*),:host([graphic=large]) .mdc-list-item__graphic ::slotted(*){width:var(--mdc-list-item-graphic-size, 56px);line-height:var(--mdc-list-item-graphic-size, 56px)}:host([graphic=medium]) .mdc-list-item__graphic ::slotted(.material-icons),:host([graphic=medium]) .mdc-list-item__graphic ::slotted(mwc-icon),:host([graphic=large]) .mdc-list-item__graphic ::slotted(.material-icons),:host([graphic=large]) .mdc-list-item__graphic ::slotted(mwc-icon){line-height:var(--mdc-list-item-graphic-size, 56px) !important}:host([graphic=large]){padding-left:0px}`;

/**
@license
Copyright 2020 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
let ListItem = class ListItem extends ListItemBase {
};
ListItem.styles = style$4;
ListItem = __decorate([
    customElement('mwc-list-item')
], ListItem);

/**
 * @license
 * Copyright 2020 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/**
 * KEY provides normalized string values for keys.
 */
var KEY = {
    UNKNOWN: 'Unknown',
    BACKSPACE: 'Backspace',
    ENTER: 'Enter',
    SPACEBAR: 'Spacebar',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown',
    END: 'End',
    HOME: 'Home',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_UP: 'ArrowUp',
    ARROW_RIGHT: 'ArrowRight',
    ARROW_DOWN: 'ArrowDown',
    DELETE: 'Delete',
    ESCAPE: 'Escape',
};
var normalizedKeys = new Set();
// IE11 has no support for new Map with iterable so we need to initialize this
// by hand.
normalizedKeys.add(KEY.BACKSPACE);
normalizedKeys.add(KEY.ENTER);
normalizedKeys.add(KEY.SPACEBAR);
normalizedKeys.add(KEY.PAGE_UP);
normalizedKeys.add(KEY.PAGE_DOWN);
normalizedKeys.add(KEY.END);
normalizedKeys.add(KEY.HOME);
normalizedKeys.add(KEY.ARROW_LEFT);
normalizedKeys.add(KEY.ARROW_UP);
normalizedKeys.add(KEY.ARROW_RIGHT);
normalizedKeys.add(KEY.ARROW_DOWN);
normalizedKeys.add(KEY.DELETE);
normalizedKeys.add(KEY.ESCAPE);
var KEY_CODE = {
    BACKSPACE: 8,
    ENTER: 13,
    SPACEBAR: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40,
    DELETE: 46,
    ESCAPE: 27,
};
var mappedKeyCodes = new Map();
// IE11 has no support for new Map with iterable so we need to initialize this
// by hand.
mappedKeyCodes.set(KEY_CODE.BACKSPACE, KEY.BACKSPACE);
mappedKeyCodes.set(KEY_CODE.ENTER, KEY.ENTER);
mappedKeyCodes.set(KEY_CODE.SPACEBAR, KEY.SPACEBAR);
mappedKeyCodes.set(KEY_CODE.PAGE_UP, KEY.PAGE_UP);
mappedKeyCodes.set(KEY_CODE.PAGE_DOWN, KEY.PAGE_DOWN);
mappedKeyCodes.set(KEY_CODE.END, KEY.END);
mappedKeyCodes.set(KEY_CODE.HOME, KEY.HOME);
mappedKeyCodes.set(KEY_CODE.ARROW_LEFT, KEY.ARROW_LEFT);
mappedKeyCodes.set(KEY_CODE.ARROW_UP, KEY.ARROW_UP);
mappedKeyCodes.set(KEY_CODE.ARROW_RIGHT, KEY.ARROW_RIGHT);
mappedKeyCodes.set(KEY_CODE.ARROW_DOWN, KEY.ARROW_DOWN);
mappedKeyCodes.set(KEY_CODE.DELETE, KEY.DELETE);
mappedKeyCodes.set(KEY_CODE.ESCAPE, KEY.ESCAPE);
var navigationKeys = new Set();
// IE11 has no support for new Set with iterable so we need to initialize this
// by hand.
navigationKeys.add(KEY.PAGE_UP);
navigationKeys.add(KEY.PAGE_DOWN);
navigationKeys.add(KEY.END);
navigationKeys.add(KEY.HOME);
navigationKeys.add(KEY.ARROW_LEFT);
navigationKeys.add(KEY.ARROW_UP);
navigationKeys.add(KEY.ARROW_RIGHT);
navigationKeys.add(KEY.ARROW_DOWN);
/**
 * normalizeKey returns the normalized string for a navigational action.
 */
function normalizeKey(evt) {
    var key = evt.key;
    // If the event already has a normalized key, return it
    if (normalizedKeys.has(key)) {
        return key;
    }
    // tslint:disable-next-line:deprecation
    var mappedKey = mappedKeyCodes.get(evt.keyCode);
    if (mappedKey) {
        return mappedKey;
    }
    return KEY.UNKNOWN;
}

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var cssClasses$5 = {
    LIST_ITEM_ACTIVATED_CLASS: 'mdc-list-item--activated',
    LIST_ITEM_CLASS: 'mdc-list-item',
    LIST_ITEM_DISABLED_CLASS: 'mdc-list-item--disabled',
    LIST_ITEM_SELECTED_CLASS: 'mdc-list-item--selected',
    LIST_ITEM_TEXT_CLASS: 'mdc-list-item__text',
    LIST_ITEM_PRIMARY_TEXT_CLASS: 'mdc-list-item__primary-text',
    ROOT: 'mdc-list',
};
var strings$3 = {
    ACTION_EVENT: 'MDCList:action',
    ARIA_CHECKED: 'aria-checked',
    ARIA_CHECKED_CHECKBOX_SELECTOR: '[role="checkbox"][aria-checked="true"]',
    ARIA_CHECKED_RADIO_SELECTOR: '[role="radio"][aria-checked="true"]',
    ARIA_CURRENT: 'aria-current',
    ARIA_DISABLED: 'aria-disabled',
    ARIA_ORIENTATION: 'aria-orientation',
    ARIA_ORIENTATION_HORIZONTAL: 'horizontal',
    ARIA_ROLE_CHECKBOX_SELECTOR: '[role="checkbox"]',
    ARIA_SELECTED: 'aria-selected',
    CHECKBOX_RADIO_SELECTOR: 'input[type="checkbox"], input[type="radio"]',
    CHECKBOX_SELECTOR: 'input[type="checkbox"]',
    CHILD_ELEMENTS_TO_TOGGLE_TABINDEX: "\n    ." + cssClasses$5.LIST_ITEM_CLASS + " button:not(:disabled),\n    ." + cssClasses$5.LIST_ITEM_CLASS + " a\n  ",
    FOCUSABLE_CHILD_ELEMENTS: "\n    ." + cssClasses$5.LIST_ITEM_CLASS + " button:not(:disabled),\n    ." + cssClasses$5.LIST_ITEM_CLASS + " a,\n    ." + cssClasses$5.LIST_ITEM_CLASS + " input[type=\"radio\"]:not(:disabled),\n    ." + cssClasses$5.LIST_ITEM_CLASS + " input[type=\"checkbox\"]:not(:disabled)\n  ",
    RADIO_SELECTOR: 'input[type="radio"]',
};
var numbers$3 = {
    UNSET_INDEX: -1,
    TYPEAHEAD_BUFFER_CLEAR_TIMEOUT_MS: 300
};

/**
 @license
 Copyright 2020 Google Inc. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
const findIndexDiff = (oldSet, newSet) => {
    const oldArr = Array.from(oldSet);
    const newArr = Array.from(newSet);
    const diff = { added: [], removed: [] };
    const oldSorted = oldArr.sort();
    const newSorted = newArr.sort();
    let i = 0;
    let j = 0;
    while (i < oldSorted.length || j < newSorted.length) {
        const oldVal = oldSorted[i];
        const newVal = newSorted[j];
        if (oldVal === newVal) {
            i++;
            j++;
            continue;
        }
        if (oldVal !== undefined && (newVal === undefined || oldVal < newVal)) {
            diff.removed.push(oldVal);
            i++;
            continue;
        }
        if (newVal !== undefined && (oldVal === undefined || newVal < oldVal)) {
            diff.added.push(newVal);
            j++;
            continue;
        }
    }
    return diff;
};
const ELEMENTS_KEY_ALLOWED_IN = ['input', 'button', 'textarea', 'select'];
function isIndexSet(selectedIndex) {
    return selectedIndex instanceof Set;
}
const createSetFromIndex = (index) => {
    const entry = index === numbers$3.UNSET_INDEX ? new Set() : index;
    return isIndexSet(entry) ? new Set(entry) : new Set([entry]);
};
class MDCListFoundation extends MDCFoundation {
    constructor(adapter) {
        super(Object.assign(Object.assign({}, MDCListFoundation.defaultAdapter), adapter));
        this.isMulti_ = false;
        this.wrapFocus_ = false;
        this.isVertical_ = true;
        this.selectedIndex_ = numbers$3.UNSET_INDEX;
        this.focusedItemIndex_ = numbers$3.UNSET_INDEX;
        this.useActivatedClass_ = false;
        this.ariaCurrentAttrValue_ = null;
    }
    static get strings() {
        return strings$3;
    }
    static get numbers() {
        return numbers$3;
    }
    static get defaultAdapter() {
        return {
            focusItemAtIndex: () => undefined,
            getFocusedElementIndex: () => 0,
            getListItemCount: () => 0,
            isFocusInsideList: () => false,
            isRootFocused: () => false,
            notifyAction: () => undefined,
            notifySelected: () => undefined,
            getSelectedStateForElementIndex: () => false,
            setDisabledStateForElementIndex: () => undefined,
            getDisabledStateForElementIndex: () => false,
            setSelectedStateForElementIndex: () => undefined,
            setActivatedStateForElementIndex: () => undefined,
            setTabIndexForElementIndex: () => undefined,
            setAttributeForElementIndex: () => undefined,
            getAttributeForElementIndex: () => null,
        };
    }
    /**
     * Sets the private wrapFocus_ variable.
     */
    setWrapFocus(value) {
        this.wrapFocus_ = value;
    }
    /**
     * Sets the private wrapFocus_ variable.
     */
    setMulti(value) {
        this.isMulti_ = value;
        const currentIndex = this.selectedIndex_;
        if (value) {
            // number to set
            if (!isIndexSet(currentIndex)) {
                const isUnset = currentIndex === numbers$3.UNSET_INDEX;
                this.selectedIndex_ = isUnset ? new Set() : new Set([currentIndex]);
            }
        }
        else {
            // set to first sorted number in set
            if (isIndexSet(currentIndex)) {
                if (currentIndex.size) {
                    const vals = Array.from(currentIndex).sort();
                    this.selectedIndex_ = vals[0];
                }
                else {
                    this.selectedIndex_ = numbers$3.UNSET_INDEX;
                }
            }
        }
    }
    /**
     * Sets the isVertical_ private variable.
     */
    setVerticalOrientation(value) {
        this.isVertical_ = value;
    }
    /**
     * Sets the useActivatedClass_ private variable.
     */
    setUseActivatedClass(useActivated) {
        this.useActivatedClass_ = useActivated;
    }
    getSelectedIndex() {
        return this.selectedIndex_;
    }
    setSelectedIndex(index) {
        if (!this.isIndexValid_(index)) {
            return;
        }
        if (this.isMulti_) {
            this.setMultiSelectionAtIndex_(createSetFromIndex(index));
        }
        else {
            this.setSingleSelectionAtIndex_(index);
        }
    }
    /**
     * Focus in handler for the list items.
     */
    handleFocusIn(_, listItemIndex) {
        if (listItemIndex >= 0) {
            this.adapter.setTabIndexForElementIndex(listItemIndex, 0);
        }
    }
    /**
     * Focus out handler for the list items.
     */
    handleFocusOut(_, listItemIndex) {
        if (listItemIndex >= 0) {
            this.adapter.setTabIndexForElementIndex(listItemIndex, -1);
        }
        /**
         * Between Focusout & Focusin some browsers do not have focus on any
         * element. Setting a delay to wait till the focus is moved to next element.
         */
        setTimeout(() => {
            if (!this.adapter.isFocusInsideList()) {
                this.setTabindexToFirstSelectedItem_();
            }
        }, 0);
    }
    /**
     * Key handler for the list.
     */
    handleKeydown(event, isRootListItem, listItemIndex) {
        const isArrowLeft = normalizeKey(event) === 'ArrowLeft';
        const isArrowUp = normalizeKey(event) === 'ArrowUp';
        const isArrowRight = normalizeKey(event) === 'ArrowRight';
        const isArrowDown = normalizeKey(event) === 'ArrowDown';
        const isHome = normalizeKey(event) === 'Home';
        const isEnd = normalizeKey(event) === 'End';
        const isEnter = normalizeKey(event) === 'Enter';
        const isSpace = normalizeKey(event) === 'Spacebar';
        if (this.adapter.isRootFocused()) {
            if (isArrowUp || isEnd) {
                event.preventDefault();
                this.focusLastElement();
            }
            else if (isArrowDown || isHome) {
                event.preventDefault();
                this.focusFirstElement();
            }
            return;
        }
        let currentIndex = this.adapter.getFocusedElementIndex();
        if (currentIndex === -1) {
            currentIndex = listItemIndex;
            if (currentIndex < 0) {
                // If this event doesn't have a mdc-list-item ancestor from the
                // current list (not from a sublist), return early.
                return;
            }
        }
        let nextIndex;
        if ((this.isVertical_ && isArrowDown) ||
            (!this.isVertical_ && isArrowRight)) {
            this.preventDefaultEvent(event);
            nextIndex = this.focusNextElement(currentIndex);
        }
        else if ((this.isVertical_ && isArrowUp) || (!this.isVertical_ && isArrowLeft)) {
            this.preventDefaultEvent(event);
            nextIndex = this.focusPrevElement(currentIndex);
        }
        else if (isHome) {
            this.preventDefaultEvent(event);
            nextIndex = this.focusFirstElement();
        }
        else if (isEnd) {
            this.preventDefaultEvent(event);
            nextIndex = this.focusLastElement();
        }
        else if (isEnter || isSpace) {
            if (isRootListItem) {
                // Return early if enter key is pressed on anchor element which triggers
                // synthetic MouseEvent event.
                const target = event.target;
                if (target && target.tagName === 'A' && isEnter) {
                    return;
                }
                this.preventDefaultEvent(event);
                this.setSelectedIndexOnAction_(currentIndex, true);
            }
        }
        this.focusedItemIndex_ = currentIndex;
        if (nextIndex !== undefined) {
            this.setTabindexAtIndex_(nextIndex);
            this.focusedItemIndex_ = nextIndex;
        }
    }
    /**
     * Click handler for the list.
     */
    handleSingleSelection(index, isInteraction, force) {
        if (index === numbers$3.UNSET_INDEX) {
            return;
        }
        this.setSelectedIndexOnAction_(index, isInteraction, force);
        this.setTabindexAtIndex_(index);
        this.focusedItemIndex_ = index;
    }
    /**
     * Focuses the next element on the list.
     */
    focusNextElement(index) {
        const count = this.adapter.getListItemCount();
        let nextIndex = index + 1;
        if (nextIndex >= count) {
            if (this.wrapFocus_) {
                nextIndex = 0;
            }
            else {
                // Return early because last item is already focused.
                return index;
            }
        }
        this.adapter.focusItemAtIndex(nextIndex);
        return nextIndex;
    }
    /**
     * Focuses the previous element on the list.
     */
    focusPrevElement(index) {
        let prevIndex = index - 1;
        if (prevIndex < 0) {
            if (this.wrapFocus_) {
                prevIndex = this.adapter.getListItemCount() - 1;
            }
            else {
                // Return early because first item is already focused.
                return index;
            }
        }
        this.adapter.focusItemAtIndex(prevIndex);
        return prevIndex;
    }
    focusFirstElement() {
        this.adapter.focusItemAtIndex(0);
        return 0;
    }
    focusLastElement() {
        const lastIndex = this.adapter.getListItemCount() - 1;
        this.adapter.focusItemAtIndex(lastIndex);
        return lastIndex;
    }
    /**
     * @param itemIndex Index of the list item
     * @param isEnabled Sets the list item to enabled or disabled.
     */
    setEnabled(itemIndex, isEnabled) {
        if (!this.isIndexValid_(itemIndex)) {
            return;
        }
        this.adapter.setDisabledStateForElementIndex(itemIndex, !isEnabled);
    }
    /**
     * Ensures that preventDefault is only called if the containing element
     * doesn't consume the event, and it will cause an unintended scroll.
     */
    preventDefaultEvent(evt) {
        const target = evt.target;
        const tagName = `${target.tagName}`.toLowerCase();
        if (ELEMENTS_KEY_ALLOWED_IN.indexOf(tagName) === -1) {
            evt.preventDefault();
        }
    }
    setSingleSelectionAtIndex_(index, isInteraction = true) {
        if (this.selectedIndex_ === index) {
            return;
        }
        // unset previous
        if (this.selectedIndex_ !== numbers$3.UNSET_INDEX) {
            this.adapter.setSelectedStateForElementIndex(this.selectedIndex_, false);
            if (this.useActivatedClass_) {
                this.adapter.setActivatedStateForElementIndex(this.selectedIndex_, false);
            }
        }
        // set new
        if (isInteraction) {
            this.adapter.setSelectedStateForElementIndex(index, true);
        }
        if (this.useActivatedClass_) {
            this.adapter.setActivatedStateForElementIndex(index, true);
        }
        this.setAriaForSingleSelectionAtIndex_(index);
        this.selectedIndex_ = index;
        this.adapter.notifySelected(index);
    }
    setMultiSelectionAtIndex_(newIndex, isInteraction = true) {
        const oldIndex = createSetFromIndex(this.selectedIndex_);
        const diff = findIndexDiff(oldIndex, newIndex);
        if (!diff.removed.length && !diff.added.length) {
            return;
        }
        for (const removed of diff.removed) {
            if (isInteraction) {
                this.adapter.setSelectedStateForElementIndex(removed, false);
            }
            if (this.useActivatedClass_) {
                this.adapter.setActivatedStateForElementIndex(removed, false);
            }
        }
        for (const added of diff.added) {
            if (isInteraction) {
                this.adapter.setSelectedStateForElementIndex(added, true);
            }
            if (this.useActivatedClass_) {
                this.adapter.setActivatedStateForElementIndex(added, true);
            }
        }
        this.selectedIndex_ = newIndex;
        this.adapter.notifySelected(newIndex, diff);
    }
    /**
     * Sets aria attribute for single selection at given index.
     */
    setAriaForSingleSelectionAtIndex_(index) {
        // Detect the presence of aria-current and get the value only during list
        // initialization when it is in unset state.
        if (this.selectedIndex_ === numbers$3.UNSET_INDEX) {
            this.ariaCurrentAttrValue_ =
                this.adapter.getAttributeForElementIndex(index, strings$3.ARIA_CURRENT);
        }
        const isAriaCurrent = this.ariaCurrentAttrValue_ !== null;
        const ariaAttribute = isAriaCurrent ? strings$3.ARIA_CURRENT : strings$3.ARIA_SELECTED;
        if (this.selectedIndex_ !== numbers$3.UNSET_INDEX) {
            this.adapter.setAttributeForElementIndex(this.selectedIndex_, ariaAttribute, 'false');
        }
        const ariaAttributeValue = isAriaCurrent ? this.ariaCurrentAttrValue_ : 'true';
        this.adapter.setAttributeForElementIndex(index, ariaAttribute, ariaAttributeValue);
    }
    setTabindexAtIndex_(index) {
        if (this.focusedItemIndex_ === numbers$3.UNSET_INDEX && index !== 0) {
            // If no list item was selected set first list item's tabindex to -1.
            // Generally, tabindex is set to 0 on first list item of list that has no
            // preselected items.
            this.adapter.setTabIndexForElementIndex(0, -1);
        }
        else if (this.focusedItemIndex_ >= 0 && this.focusedItemIndex_ !== index) {
            this.adapter.setTabIndexForElementIndex(this.focusedItemIndex_, -1);
        }
        this.adapter.setTabIndexForElementIndex(index, 0);
    }
    setTabindexToFirstSelectedItem_() {
        let targetIndex = 0;
        if (typeof this.selectedIndex_ === 'number' &&
            this.selectedIndex_ !== numbers$3.UNSET_INDEX) {
            targetIndex = this.selectedIndex_;
        }
        else if (isIndexSet(this.selectedIndex_) && this.selectedIndex_.size > 0) {
            targetIndex = Math.min(...this.selectedIndex_);
        }
        this.setTabindexAtIndex_(targetIndex);
    }
    isIndexValid_(index) {
        if (index instanceof Set) {
            if (!this.isMulti_) {
                throw new Error('MDCListFoundation: Array of index is only supported for checkbox based list');
            }
            if (index.size === 0) {
                return true;
            }
            else {
                let isOneInRange = false;
                for (const entry of index) {
                    isOneInRange = this.isIndexInRange_(entry);
                    if (isOneInRange) {
                        break;
                    }
                }
                return isOneInRange;
            }
        }
        else if (typeof index === 'number') {
            if (this.isMulti_) {
                throw new Error('MDCListFoundation: Expected array of index for checkbox based list but got number: ' +
                    index);
            }
            return index === numbers$3.UNSET_INDEX || this.isIndexInRange_(index);
        }
        else {
            return false;
        }
    }
    isIndexInRange_(index) {
        const listSize = this.adapter.getListItemCount();
        return index >= 0 && index < listSize;
    }
    /**
     * Sets selected index on user action, toggles checkbox / radio based on
     * toggleCheckbox value. User interaction should not toggle list item(s) when
     * disabled.
     */
    setSelectedIndexOnAction_(index, isInteraction, force) {
        if (this.adapter.getDisabledStateForElementIndex(index)) {
            return;
        }
        let checkedIndex = index;
        if (this.isMulti_) {
            checkedIndex = new Set([index]);
        }
        if (!this.isIndexValid_(checkedIndex)) {
            return;
        }
        if (this.isMulti_) {
            this.toggleMultiAtIndex(index, force, isInteraction);
        }
        else {
            if (isInteraction || force) {
                this.setSingleSelectionAtIndex_(index, isInteraction);
            }
            else {
                const isDeselection = this.selectedIndex_ === index;
                if (isDeselection) {
                    this.setSingleSelectionAtIndex_(numbers$3.UNSET_INDEX);
                }
            }
        }
        if (isInteraction) {
            this.adapter.notifyAction(index);
        }
    }
    toggleMultiAtIndex(index, force, isInteraction = true) {
        let newSelectionValue = false;
        if (force === undefined) {
            newSelectionValue = !this.adapter.getSelectedStateForElementIndex(index);
        }
        else {
            newSelectionValue = force;
        }
        const newSet = createSetFromIndex(this.selectedIndex_);
        if (newSelectionValue) {
            newSet.add(index);
        }
        else {
            newSet.delete(index);
        }
        this.setMultiSelectionAtIndex_(newSet, isInteraction);
    }
}

function debounceLayout(callback, waitInMS = 50) {
    let timeoutId;
    // tslint:disable-next-line
    return function (updateItems = true) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback(updateItems);
        }, waitInMS);
    };
}
const isListItem = (element) => {
    return element.hasAttribute('mwc-list-item');
};
function clearAndCreateItemsReadyPromise() {
    const oldResolver = this.itemsReadyResolver;
    this.itemsReady = new Promise((res) => {
        return this.itemsReadyResolver = res;
    });
    oldResolver();
}
/**
 * @fires selected {SelectedDetail}
 * @fires action {ActionDetail}
 * @fires items-updated
 */
class ListBase extends BaseElement {
    constructor() {
        super();
        this.mdcAdapter = null;
        this.mdcFoundationClass = MDCListFoundation;
        this.activatable = false;
        this.multi = false;
        this.wrapFocus = false;
        this.itemRoles = null;
        this.innerRole = null;
        this.innerAriaLabel = null;
        this.rootTabbable = false;
        this.previousTabindex = null;
        this.noninteractive = false;
        this.itemsReadyResolver = (() => {
            //
        });
        this.itemsReady = Promise.resolve([]);
        this.items_ = [];
        const debouncedFunction = debounceLayout(this.layout.bind(this));
        this.debouncedLayout = (updateItems = true) => {
            clearAndCreateItemsReadyPromise.call(this);
            debouncedFunction(updateItems);
        };
    }
    async _getUpdateComplete() {
        await super._getUpdateComplete();
        await this.itemsReady;
    }
    get assignedElements() {
        const slot = this.slotElement;
        if (slot) {
            return slot.assignedNodes({ flatten: true }).filter(isNodeElement);
        }
        return [];
    }
    get items() {
        return this.items_;
    }
    updateItems() {
        const nodes = this.assignedElements;
        const listItems = [];
        for (const node of nodes) {
            if (isListItem(node)) {
                listItems.push(node);
                node._managingList = this;
            }
            if (node.hasAttribute('divider') && !node.hasAttribute('role')) {
                node.setAttribute('role', 'separator');
            }
        }
        this.items_ = listItems;
        const selectedIndices = new Set();
        this.items_.forEach((item, index) => {
            if (this.itemRoles) {
                item.setAttribute('role', this.itemRoles);
            }
            else {
                item.removeAttribute('role');
            }
            if (item.selected) {
                selectedIndices.add(index);
            }
        });
        if (this.multi) {
            this.select(selectedIndices);
        }
        else {
            const index = selectedIndices.size ? selectedIndices.entries().next().value[1] : -1;
            this.select(index);
        }
        const itemsUpdatedEv = new Event('items-updated', { bubbles: true, composed: true });
        this.dispatchEvent(itemsUpdatedEv);
    }
    get selected() {
        const index = this.index;
        if (!isIndexSet(index)) {
            if (index === -1) {
                return null;
            }
            return this.items[index];
        }
        const selected = [];
        for (const entry of index) {
            selected.push(this.items[entry]);
        }
        return selected;
    }
    get index() {
        if (this.mdcFoundation) {
            return this.mdcFoundation.getSelectedIndex();
        }
        return -1;
    }
    render() {
        const role = this.innerRole === null ? undefined : this.innerRole;
        const ariaLabel = this.innerAriaLabel === null ? undefined : this.innerAriaLabel;
        const tabindex = this.rootTabbable ? '0' : '-1';
        return html$2 `
      <!-- @ts-ignore -->
      <ul
          tabindex=${tabindex}
          role="${ifDefined(role)}"
          aria-label="${ifDefined(ariaLabel)}"
          class="mdc-list"
          @keydown=${this.onKeydown}
          @focusin=${this.onFocusIn}
          @focusout=${this.onFocusOut}
          @request-selected=${this.onRequestSelected}
          @list-item-rendered=${this.onListItemConnected}>
        <slot></slot>
        ${this.renderPlaceholder()}
      </ul>
    `;
    }
    renderPlaceholder() {
        if (this.emptyMessage !== undefined && this.assignedElements.length === 0) {
            return html$2 `
        <mwc-list-item noninteractive>${this.emptyMessage}</mwc-list-item>
      `;
        }
        return null;
    }
    firstUpdated() {
        super.firstUpdated();
        if (!this.items.length) {
            // required because this is called before observers
            this.mdcFoundation.setMulti(this.multi);
            // for when children upgrade before list
            this.layout();
        }
    }
    onFocusIn(evt) {
        if (this.mdcFoundation && this.mdcRoot) {
            const index = this.getIndexOfTarget(evt);
            this.mdcFoundation.handleFocusIn(evt, index);
        }
    }
    onFocusOut(evt) {
        if (this.mdcFoundation && this.mdcRoot) {
            const index = this.getIndexOfTarget(evt);
            this.mdcFoundation.handleFocusOut(evt, index);
        }
    }
    onKeydown(evt) {
        if (this.mdcFoundation && this.mdcRoot) {
            const index = this.getIndexOfTarget(evt);
            const target = evt.target;
            const isRootListItem = isListItem(target);
            this.mdcFoundation.handleKeydown(evt, isRootListItem, index);
        }
    }
    onRequestSelected(evt) {
        if (this.mdcFoundation) {
            let index = this.getIndexOfTarget(evt);
            // might happen in shady dom slowness. Recalc children
            if (index === -1) {
                this.layout();
                index = this.getIndexOfTarget(evt);
                // still not found; may not be mwc-list-item. Unsupported case.
                if (index === -1) {
                    return;
                }
            }
            const element = this.items[index];
            if (element.disabled) {
                return;
            }
            const selected = evt.detail.selected;
            const source = evt.detail.source;
            this.mdcFoundation.handleSingleSelection(index, source === 'interaction', selected);
            evt.stopPropagation();
        }
    }
    getIndexOfTarget(evt) {
        const elements = this.items;
        const path = evt.composedPath();
        for (const pathItem of path) {
            let index = -1;
            if (isNodeElement(pathItem) && isListItem(pathItem)) {
                index = elements.indexOf(pathItem);
            }
            if (index !== -1) {
                return index;
            }
        }
        return -1;
    }
    createAdapter() {
        this.mdcAdapter = {
            getListItemCount: () => {
                if (this.mdcRoot) {
                    return this.items.length;
                }
                return 0;
            },
            getFocusedElementIndex: this.getFocusedItemIndex,
            getAttributeForElementIndex: (index, attr) => {
                const listElement = this.mdcRoot;
                if (!listElement) {
                    return '';
                }
                const element = this.items[index];
                return element ? element.getAttribute(attr) : '';
            },
            setAttributeForElementIndex: (index, attr, val) => {
                if (!this.mdcRoot) {
                    return;
                }
                const element = this.items[index];
                if (element) {
                    element.setAttribute(attr, val);
                }
            },
            focusItemAtIndex: (index) => {
                const element = this.items[index];
                if (element) {
                    element.focus();
                }
            },
            setTabIndexForElementIndex: (index, value) => {
                const item = this.items[index];
                if (item) {
                    item.tabindex = value;
                }
            },
            notifyAction: (index) => {
                const init = { bubbles: true, composed: true };
                init.detail = { index };
                const ev = new CustomEvent('action', init);
                this.dispatchEvent(ev);
            },
            notifySelected: (index, diff) => {
                const init = { bubbles: true, composed: true };
                init.detail = { index, diff };
                const ev = new CustomEvent('selected', init);
                this.dispatchEvent(ev);
            },
            isFocusInsideList: () => {
                return doesElementContainFocus(this);
            },
            isRootFocused: () => {
                const mdcRoot = this.mdcRoot;
                const root = mdcRoot.getRootNode();
                return root.activeElement === mdcRoot;
            },
            setDisabledStateForElementIndex: (index, value) => {
                const item = this.items[index];
                if (!item) {
                    return;
                }
                item.disabled = value;
            },
            getDisabledStateForElementIndex: (index) => {
                const item = this.items[index];
                if (!item) {
                    return false;
                }
                return item.disabled;
            },
            setSelectedStateForElementIndex: (index, value) => {
                const item = this.items[index];
                if (!item) {
                    return;
                }
                item.selected = value;
            },
            getSelectedStateForElementIndex: (index) => {
                const item = this.items[index];
                if (!item) {
                    return false;
                }
                return item.selected;
            },
            setActivatedStateForElementIndex: (index, value) => {
                const item = this.items[index];
                if (!item) {
                    return;
                }
                item.activated = value;
            },
        };
        return this.mdcAdapter;
    }
    selectUi(index, activate = false) {
        const item = this.items[index];
        if (item) {
            item.selected = true;
            item.activated = activate;
        }
    }
    deselectUi(index) {
        const item = this.items[index];
        if (item) {
            item.selected = false;
            item.activated = false;
        }
    }
    select(index) {
        if (!this.mdcFoundation) {
            return;
        }
        this.mdcFoundation.setSelectedIndex(index);
    }
    toggle(index, force) {
        if (this.multi) {
            this.mdcFoundation.toggleMultiAtIndex(index, force);
        }
    }
    onListItemConnected(e) {
        const target = e.target;
        this.layout(this.items.indexOf(target) === -1);
    }
    layout(updateItems = true) {
        if (updateItems) {
            this.updateItems();
        }
        const first = this.items[0];
        for (const item of this.items) {
            item.tabindex = -1;
        }
        if (first) {
            if (this.noninteractive) {
                if (!this.previousTabindex) {
                    this.previousTabindex = first;
                }
            }
            else {
                first.tabindex = 0;
            }
        }
        this.itemsReadyResolver();
    }
    getFocusedItemIndex() {
        if (!this.mdcRoot) {
            return -1;
        }
        if (!this.items.length) {
            return -1;
        }
        const activeElementPath = deepActiveElementPath();
        if (!activeElementPath.length) {
            return -1;
        }
        for (let i = activeElementPath.length - 1; i >= 0; i--) {
            const activeItem = activeElementPath[i];
            if (isListItem(activeItem)) {
                return this.items.indexOf(activeItem);
            }
        }
        return -1;
    }
    focusItemAtIndex(index) {
        for (const item of this.items) {
            if (item.tabindex === 0) {
                item.tabindex = -1;
                break;
            }
        }
        this.items[index].tabindex = 0;
        this.items[index].focus();
    }
    focus() {
        const root = this.mdcRoot;
        if (root) {
            root.focus();
        }
    }
    blur() {
        const root = this.mdcRoot;
        if (root) {
            root.blur();
        }
    }
}
__decorate([
    property({ type: String })
], ListBase.prototype, "emptyMessage", void 0);
__decorate([
    query('.mdc-list')
], ListBase.prototype, "mdcRoot", void 0);
__decorate([
    query('slot')
], ListBase.prototype, "slotElement", void 0);
__decorate([
    property({ type: Boolean }),
    observer(function (value) {
        if (this.mdcFoundation) {
            this.mdcFoundation.setUseActivatedClass(value);
        }
    })
], ListBase.prototype, "activatable", void 0);
__decorate([
    property({ type: Boolean }),
    observer(function (newValue, oldValue) {
        if (this.mdcFoundation) {
            this.mdcFoundation.setMulti(newValue);
        }
        if (oldValue !== undefined) {
            this.layout();
        }
    })
], ListBase.prototype, "multi", void 0);
__decorate([
    property({ type: Boolean }),
    observer(function (value) {
        if (this.mdcFoundation) {
            this.mdcFoundation.setWrapFocus(value);
        }
    })
], ListBase.prototype, "wrapFocus", void 0);
__decorate([
    property({ type: String }),
    observer(function (_newValue, oldValue) {
        if (oldValue !== undefined) {
            this.updateItems();
        }
    })
], ListBase.prototype, "itemRoles", void 0);
__decorate([
    property({ type: String })
], ListBase.prototype, "innerRole", void 0);
__decorate([
    property({ type: String })
], ListBase.prototype, "innerAriaLabel", void 0);
__decorate([
    property({ type: Boolean })
], ListBase.prototype, "rootTabbable", void 0);
__decorate([
    property({ type: Boolean, reflect: true }),
    observer(function (value) {
        const slot = this.slotElement;
        if (value && slot) {
            const tabbable = findAssignedElement(slot, '[tabindex="0"]');
            this.previousTabindex = tabbable;
            if (tabbable) {
                tabbable.setAttribute('tabindex', '-1');
            }
        }
        else if (!value && this.previousTabindex) {
            this.previousTabindex.setAttribute('tabindex', '0');
            this.previousTabindex = null;
        }
    })
], ListBase.prototype, "noninteractive", void 0);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$5 = css `@keyframes mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}:host{display:block}.mdc-list{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-subtitle1-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:1rem;font-size:var(--mdc-typography-subtitle1-font-size, 1rem);line-height:1.75rem;line-height:var(--mdc-typography-subtitle1-line-height, 1.75rem);font-weight:400;font-weight:var(--mdc-typography-subtitle1-font-weight, 400);letter-spacing:0.009375em;letter-spacing:var(--mdc-typography-subtitle1-letter-spacing, 0.009375em);text-decoration:inherit;text-decoration:var(--mdc-typography-subtitle1-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-subtitle1-text-transform, inherit);line-height:1.5rem;margin:0;padding:8px 0;list-style-type:none;color:rgba(0, 0, 0, 0.87);color:var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, 0.87));padding:var(--mdc-list-vertical-padding, 8px) 0}.mdc-list:focus{outline:none}.mdc-list-item{height:48px}.mdc-list--dense{padding-top:4px;padding-bottom:4px;font-size:.812rem}.mdc-list ::slotted([divider]){height:0;margin:0;border:none;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:rgba(0, 0, 0, 0.12)}.mdc-list ::slotted([divider][padded]){margin:0 var(--mdc-list-side-padding, 16px)}.mdc-list ::slotted([divider][inset]){margin-left:var(--mdc-list-inset-margin, 72px);margin-right:0;width:calc(100% - var(--mdc-list-inset-margin, 72px))}.mdc-list-group[dir=rtl] .mdc-list ::slotted([divider][inset]),[dir=rtl] .mdc-list-group .mdc-list ::slotted([divider][inset]){margin-left:0;margin-right:var(--mdc-list-inset-margin, 72px)}.mdc-list ::slotted([divider][inset][padded]){width:calc(100% - var(--mdc-list-inset-margin, 72px) - var(--mdc-list-side-padding, 16px))}.mdc-list--dense ::slotted([mwc-list-item]){height:40px}.mdc-list--dense ::slotted([mwc-list]){--mdc-list-item-graphic-size: 20px}.mdc-list--two-line.mdc-list--dense ::slotted([mwc-list-item]),.mdc-list--avatar-list.mdc-list--dense ::slotted([mwc-list-item]){height:60px}.mdc-list--avatar-list.mdc-list--dense ::slotted([mwc-list]){--mdc-list-item-graphic-size: 36px}:host([noninteractive]){pointer-events:none;cursor:default}.mdc-list--dense ::slotted(.mdc-list-item__primary-text){display:block;margin-top:0;line-height:normal;margin-bottom:-20px}.mdc-list--dense ::slotted(.mdc-list-item__primary-text)::before{display:inline-block;width:0;height:24px;content:"";vertical-align:0}.mdc-list--dense ::slotted(.mdc-list-item__primary-text)::after{display:inline-block;width:0;height:20px;content:"";vertical-align:-20px}`;

/**
@license
Copyright 2020 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
let List = class List extends ListBase {
};
List.styles = style$5;
List = __decorate([
    customElement('mwc-list')
], List);

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var cssClasses$6 = {
    ANCHOR: 'mdc-menu-surface--anchor',
    ANIMATING_CLOSED: 'mdc-menu-surface--animating-closed',
    ANIMATING_OPEN: 'mdc-menu-surface--animating-open',
    FIXED: 'mdc-menu-surface--fixed',
    IS_OPEN_BELOW: 'mdc-menu-surface--is-open-below',
    OPEN: 'mdc-menu-surface--open',
    ROOT: 'mdc-menu-surface',
};
// tslint:disable:object-literal-sort-keys
var strings$4 = {
    CLOSED_EVENT: 'MDCMenuSurface:closed',
    OPENED_EVENT: 'MDCMenuSurface:opened',
    FOCUSABLE_ELEMENTS: [
        'button:not(:disabled)', '[href]:not([aria-disabled="true"])', 'input:not(:disabled)',
        'select:not(:disabled)', 'textarea:not(:disabled)', '[tabindex]:not([tabindex="-1"]):not([aria-disabled="true"])',
    ].join(', '),
};
// tslint:enable:object-literal-sort-keys
var numbers$4 = {
    /** Total duration of menu-surface open animation. */
    TRANSITION_OPEN_DURATION: 120,
    /** Total duration of menu-surface close animation. */
    TRANSITION_CLOSE_DURATION: 75,
    /** Margin left to the edge of the viewport when menu-surface is at maximum possible height. Also used as a viewport margin. */
    MARGIN_TO_EDGE: 32,
    /** Ratio of anchor width to menu-surface width for switching from corner positioning to center positioning. */
    ANCHOR_TO_MENU_SURFACE_WIDTH_RATIO: 0.67,
};
/**
 * Enum for bits in the {@see Corner) bitmap.
 */
var CornerBit;
(function (CornerBit) {
    CornerBit[CornerBit["BOTTOM"] = 1] = "BOTTOM";
    CornerBit[CornerBit["CENTER"] = 2] = "CENTER";
    CornerBit[CornerBit["RIGHT"] = 4] = "RIGHT";
    CornerBit[CornerBit["FLIP_RTL"] = 8] = "FLIP_RTL";
})(CornerBit || (CornerBit = {}));
/**
 * Enum for representing an element corner for positioning the menu-surface.
 *
 * The START constants map to LEFT if element directionality is left
 * to right and RIGHT if the directionality is right to left.
 * Likewise END maps to RIGHT or LEFT depending on the directionality.
 */
var Corner;
(function (Corner) {
    Corner[Corner["TOP_LEFT"] = 0] = "TOP_LEFT";
    Corner[Corner["TOP_RIGHT"] = 4] = "TOP_RIGHT";
    Corner[Corner["BOTTOM_LEFT"] = 1] = "BOTTOM_LEFT";
    Corner[Corner["BOTTOM_RIGHT"] = 5] = "BOTTOM_RIGHT";
    Corner[Corner["TOP_START"] = 8] = "TOP_START";
    Corner[Corner["TOP_END"] = 12] = "TOP_END";
    Corner[Corner["BOTTOM_START"] = 9] = "BOTTOM_START";
    Corner[Corner["BOTTOM_END"] = 13] = "BOTTOM_END";
})(Corner || (Corner = {}));

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCMenuSurfaceFoundation = /** @class */ (function (_super) {
    __extends(MDCMenuSurfaceFoundation, _super);
    function MDCMenuSurfaceFoundation(adapter) {
        var _this = _super.call(this, __assign(__assign({}, MDCMenuSurfaceFoundation.defaultAdapter), adapter)) || this;
        _this.isSurfaceOpen = false;
        _this.isQuickOpen = false;
        _this.isHoistedElement = false;
        _this.isFixedPosition = false;
        _this.openAnimationEndTimerId = 0;
        _this.closeAnimationEndTimerId = 0;
        _this.animationRequestId = 0;
        _this.anchorCorner = Corner.TOP_START;
        /**
         * Corner of the menu surface to which menu surface is attached to anchor.
         *
         *  Anchor corner --->+----------+
         *                    |  ANCHOR  |
         *                    +----------+
         *  Origin corner --->+--------------+
         *                    |              |
         *                    |              |
         *                    | MENU SURFACE |
         *                    |              |
         *                    |              |
         *                    +--------------+
         */
        _this.originCorner = Corner.TOP_START;
        _this.anchorMargin = { top: 0, right: 0, bottom: 0, left: 0 };
        _this.position = { x: 0, y: 0 };
        return _this;
    }
    Object.defineProperty(MDCMenuSurfaceFoundation, "cssClasses", {
        get: function () {
            return cssClasses$6;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCMenuSurfaceFoundation, "strings", {
        get: function () {
            return strings$4;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCMenuSurfaceFoundation, "numbers", {
        get: function () {
            return numbers$4;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCMenuSurfaceFoundation, "Corner", {
        get: function () {
            return Corner;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCMenuSurfaceFoundation, "defaultAdapter", {
        /**
         * @see {@link MDCMenuSurfaceAdapter} for typing information on parameters and return types.
         */
        get: function () {
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            return {
                addClass: function () { return undefined; },
                removeClass: function () { return undefined; },
                hasClass: function () { return false; },
                hasAnchor: function () { return false; },
                isElementInContainer: function () { return false; },
                isFocused: function () { return false; },
                isRtl: function () { return false; },
                getInnerDimensions: function () { return ({ height: 0, width: 0 }); },
                getAnchorDimensions: function () { return null; },
                getWindowDimensions: function () { return ({ height: 0, width: 0 }); },
                getBodyDimensions: function () { return ({ height: 0, width: 0 }); },
                getWindowScroll: function () { return ({ x: 0, y: 0 }); },
                setPosition: function () { return undefined; },
                setMaxHeight: function () { return undefined; },
                setTransformOrigin: function () { return undefined; },
                saveFocus: function () { return undefined; },
                restoreFocus: function () { return undefined; },
                notifyClose: function () { return undefined; },
                notifyOpen: function () { return undefined; },
            };
            // tslint:enable:object-literal-sort-keys
        },
        enumerable: true,
        configurable: true
    });
    MDCMenuSurfaceFoundation.prototype.init = function () {
        var _a = MDCMenuSurfaceFoundation.cssClasses, ROOT = _a.ROOT, OPEN = _a.OPEN;
        if (!this.adapter.hasClass(ROOT)) {
            throw new Error(ROOT + " class required in root element.");
        }
        if (this.adapter.hasClass(OPEN)) {
            this.isSurfaceOpen = true;
        }
    };
    MDCMenuSurfaceFoundation.prototype.destroy = function () {
        clearTimeout(this.openAnimationEndTimerId);
        clearTimeout(this.closeAnimationEndTimerId);
        // Cancel any currently running animations.
        cancelAnimationFrame(this.animationRequestId);
    };
    /**
     * @param corner Default anchor corner alignment of top-left menu surface corner.
     */
    MDCMenuSurfaceFoundation.prototype.setAnchorCorner = function (corner) {
        this.anchorCorner = corner;
    };
    /**
     * Flip menu corner horizontally.
     */
    MDCMenuSurfaceFoundation.prototype.flipCornerHorizontally = function () {
        this.originCorner = this.originCorner ^ CornerBit.RIGHT;
    };
    /**
     * @param margin Set of margin values from anchor.
     */
    MDCMenuSurfaceFoundation.prototype.setAnchorMargin = function (margin) {
        this.anchorMargin.top = margin.top || 0;
        this.anchorMargin.right = margin.right || 0;
        this.anchorMargin.bottom = margin.bottom || 0;
        this.anchorMargin.left = margin.left || 0;
    };
    /** Used to indicate if the menu-surface is hoisted to the body. */
    MDCMenuSurfaceFoundation.prototype.setIsHoisted = function (isHoisted) {
        this.isHoistedElement = isHoisted;
    };
    /** Used to set the menu-surface calculations based on a fixed position menu. */
    MDCMenuSurfaceFoundation.prototype.setFixedPosition = function (isFixedPosition) {
        this.isFixedPosition = isFixedPosition;
    };
    /** Sets the menu-surface position on the page. */
    MDCMenuSurfaceFoundation.prototype.setAbsolutePosition = function (x, y) {
        this.position.x = this.isFinite(x) ? x : 0;
        this.position.y = this.isFinite(y) ? y : 0;
    };
    MDCMenuSurfaceFoundation.prototype.setQuickOpen = function (quickOpen) {
        this.isQuickOpen = quickOpen;
    };
    MDCMenuSurfaceFoundation.prototype.isOpen = function () {
        return this.isSurfaceOpen;
    };
    /**
     * Open the menu surface.
     */
    MDCMenuSurfaceFoundation.prototype.open = function () {
        var _this = this;
        if (this.isSurfaceOpen) {
            return;
        }
        this.adapter.saveFocus();
        if (this.isQuickOpen) {
            this.isSurfaceOpen = true;
            this.adapter.addClass(MDCMenuSurfaceFoundation.cssClasses.OPEN);
            this.dimensions = this.adapter.getInnerDimensions();
            this.autoposition();
            this.adapter.notifyOpen();
        }
        else {
            this.adapter.addClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_OPEN);
            this.animationRequestId = requestAnimationFrame(function () {
                _this.adapter.addClass(MDCMenuSurfaceFoundation.cssClasses.OPEN);
                _this.dimensions = _this.adapter.getInnerDimensions();
                _this.autoposition();
                _this.openAnimationEndTimerId = setTimeout(function () {
                    _this.openAnimationEndTimerId = 0;
                    _this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_OPEN);
                    _this.adapter.notifyOpen();
                }, numbers$4.TRANSITION_OPEN_DURATION);
            });
            this.isSurfaceOpen = true;
        }
    };
    /**
     * Closes the menu surface.
     */
    MDCMenuSurfaceFoundation.prototype.close = function (skipRestoreFocus) {
        var _this = this;
        if (skipRestoreFocus === void 0) { skipRestoreFocus = false; }
        if (!this.isSurfaceOpen) {
            return;
        }
        if (this.isQuickOpen) {
            this.isSurfaceOpen = false;
            if (!skipRestoreFocus) {
                this.maybeRestoreFocus();
            }
            this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.OPEN);
            this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.IS_OPEN_BELOW);
            this.adapter.notifyClose();
        }
        else {
            this.adapter.addClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_CLOSED);
            requestAnimationFrame(function () {
                _this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.OPEN);
                _this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.IS_OPEN_BELOW);
                _this.closeAnimationEndTimerId = setTimeout(function () {
                    _this.closeAnimationEndTimerId = 0;
                    _this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_CLOSED);
                    _this.adapter.notifyClose();
                }, numbers$4.TRANSITION_CLOSE_DURATION);
            });
            this.isSurfaceOpen = false;
            if (!skipRestoreFocus) {
                this.maybeRestoreFocus();
            }
        }
    };
    /** Handle clicks and close if not within menu-surface element. */
    MDCMenuSurfaceFoundation.prototype.handleBodyClick = function (evt) {
        var el = evt.target;
        if (this.adapter.isElementInContainer(el)) {
            return;
        }
        this.close();
    };
    /** Handle keys that close the surface. */
    MDCMenuSurfaceFoundation.prototype.handleKeydown = function (evt) {
        var keyCode = evt.keyCode, key = evt.key;
        var isEscape = key === 'Escape' || keyCode === 27;
        if (isEscape) {
            this.close();
        }
    };
    MDCMenuSurfaceFoundation.prototype.autoposition = function () {
        var _a;
        // Compute measurements for autoposition methods reuse.
        this.measurements = this.getAutoLayoutmeasurements();
        var corner = this.getoriginCorner();
        var maxMenuSurfaceHeight = this.getMenuSurfaceMaxHeight(corner);
        var verticalAlignment = this.hasBit(corner, CornerBit.BOTTOM) ? 'bottom' : 'top';
        var horizontalAlignment = this.hasBit(corner, CornerBit.RIGHT) ? 'right' : 'left';
        var horizontalOffset = this.getHorizontalOriginOffset(corner);
        var verticalOffset = this.getVerticalOriginOffset(corner);
        var _b = this.measurements, anchorSize = _b.anchorSize, surfaceSize = _b.surfaceSize;
        var position = (_a = {},
            _a[horizontalAlignment] = horizontalOffset,
            _a[verticalAlignment] = verticalOffset,
            _a);
        // Center align when anchor width is comparable or greater than menu surface, otherwise keep corner.
        if (anchorSize.width / surfaceSize.width > numbers$4.ANCHOR_TO_MENU_SURFACE_WIDTH_RATIO) {
            horizontalAlignment = 'center';
        }
        // If the menu-surface has been hoisted to the body, it's no longer relative to the anchor element
        if (this.isHoistedElement || this.isFixedPosition) {
            this.adjustPositionForHoistedElement(position);
        }
        this.adapter.setTransformOrigin(horizontalAlignment + " " + verticalAlignment);
        this.adapter.setPosition(position);
        this.adapter.setMaxHeight(maxMenuSurfaceHeight ? maxMenuSurfaceHeight + 'px' : '');
        // If it is opened from the top then add is-open-below class
        if (!this.hasBit(corner, CornerBit.BOTTOM)) {
            this.adapter.addClass(MDCMenuSurfaceFoundation.cssClasses.IS_OPEN_BELOW);
        }
    };
    /**
     * @return Measurements used to position menu surface popup.
     */
    MDCMenuSurfaceFoundation.prototype.getAutoLayoutmeasurements = function () {
        var anchorRect = this.adapter.getAnchorDimensions();
        var bodySize = this.adapter.getBodyDimensions();
        var viewportSize = this.adapter.getWindowDimensions();
        var windowScroll = this.adapter.getWindowScroll();
        if (!anchorRect) {
            // tslint:disable:object-literal-sort-keys Positional properties are more readable when they're grouped together
            anchorRect = {
                top: this.position.y,
                right: this.position.x,
                bottom: this.position.y,
                left: this.position.x,
                width: 0,
                height: 0,
            };
            // tslint:enable:object-literal-sort-keys
        }
        return {
            anchorSize: anchorRect,
            bodySize: bodySize,
            surfaceSize: this.dimensions,
            viewportDistance: {
                // tslint:disable:object-literal-sort-keys Positional properties are more readable when they're grouped together
                top: anchorRect.top,
                right: viewportSize.width - anchorRect.right,
                bottom: viewportSize.height - anchorRect.bottom,
                left: anchorRect.left,
            },
            viewportSize: viewportSize,
            windowScroll: windowScroll,
        };
    };
    /**
     * Computes the corner of the anchor from which to animate and position the
     * menu surface.
     *
     * Only LEFT or RIGHT bit is used to position the menu surface ignoring RTL
     * context. E.g., menu surface will be positioned from right side on TOP_END.
     */
    MDCMenuSurfaceFoundation.prototype.getoriginCorner = function () {
        var corner = this.originCorner;
        var _a = this.measurements, viewportDistance = _a.viewportDistance, anchorSize = _a.anchorSize, surfaceSize = _a.surfaceSize;
        var MARGIN_TO_EDGE = MDCMenuSurfaceFoundation.numbers.MARGIN_TO_EDGE;
        var isAnchoredToBottom = this.hasBit(this.anchorCorner, CornerBit.BOTTOM);
        var availableTop;
        var availableBottom;
        if (isAnchoredToBottom) {
            availableTop = viewportDistance.top - MARGIN_TO_EDGE + anchorSize.height +
                this.anchorMargin.bottom;
            availableBottom =
                viewportDistance.bottom - MARGIN_TO_EDGE - this.anchorMargin.bottom;
        }
        else {
            availableTop =
                viewportDistance.top - MARGIN_TO_EDGE + this.anchorMargin.top;
            availableBottom = viewportDistance.bottom - MARGIN_TO_EDGE +
                anchorSize.height - this.anchorMargin.top;
        }
        var isAvailableBottom = availableBottom - surfaceSize.height > 0;
        if (!isAvailableBottom && availableTop >= availableBottom) {
            // Attach bottom side of surface to the anchor.
            corner = this.setBit(corner, CornerBit.BOTTOM);
        }
        var isRtl = this.adapter.isRtl();
        var isFlipRtl = this.hasBit(this.anchorCorner, CornerBit.FLIP_RTL);
        var hasRightBit = this.hasBit(this.anchorCorner, CornerBit.RIGHT) ||
            this.hasBit(corner, CornerBit.RIGHT);
        // Whether surface attached to right side of anchor element.
        var isAnchoredToRight = false;
        // Anchored to start
        if (isRtl && isFlipRtl) {
            isAnchoredToRight = !hasRightBit;
        }
        else {
            // Anchored to right
            isAnchoredToRight = hasRightBit;
        }
        var availableLeft;
        var availableRight;
        if (isAnchoredToRight) {
            availableLeft =
                viewportDistance.left + anchorSize.width + this.anchorMargin.right;
            availableRight = viewportDistance.right - this.anchorMargin.right;
        }
        else {
            availableLeft = viewportDistance.left + this.anchorMargin.left;
            availableRight =
                viewportDistance.right + anchorSize.width - this.anchorMargin.left;
        }
        var isAvailableLeft = availableLeft - surfaceSize.width > 0;
        var isAvailableRight = availableRight - surfaceSize.width > 0;
        var isOriginCornerAlignedToEnd = this.hasBit(corner, CornerBit.FLIP_RTL) &&
            this.hasBit(corner, CornerBit.RIGHT);
        if (isAvailableRight && isOriginCornerAlignedToEnd && isRtl ||
            !isAvailableLeft && isOriginCornerAlignedToEnd) {
            // Attach left side of surface to the anchor.
            corner = this.unsetBit(corner, CornerBit.RIGHT);
        }
        else if (isAvailableLeft && isAnchoredToRight && isRtl ||
            (isAvailableLeft && !isAnchoredToRight && hasRightBit) ||
            (!isAvailableRight && availableLeft >= availableRight)) {
            // Attach right side of surface to the anchor.
            corner = this.setBit(corner, CornerBit.RIGHT);
        }
        return corner;
    };
    /**
     * @param corner Origin corner of the menu surface.
     * @return Maximum height of the menu surface, based on available space. 0 indicates should not be set.
     */
    MDCMenuSurfaceFoundation.prototype.getMenuSurfaceMaxHeight = function (corner) {
        var viewportDistance = this.measurements.viewportDistance;
        var maxHeight = 0;
        var isBottomAligned = this.hasBit(corner, CornerBit.BOTTOM);
        var isBottomAnchored = this.hasBit(this.anchorCorner, CornerBit.BOTTOM);
        var MARGIN_TO_EDGE = MDCMenuSurfaceFoundation.numbers.MARGIN_TO_EDGE;
        // When maximum height is not specified, it is handled from CSS.
        if (isBottomAligned) {
            maxHeight = viewportDistance.top + this.anchorMargin.top - MARGIN_TO_EDGE;
            if (!isBottomAnchored) {
                maxHeight += this.measurements.anchorSize.height;
            }
        }
        else {
            maxHeight = viewportDistance.bottom - this.anchorMargin.bottom +
                this.measurements.anchorSize.height - MARGIN_TO_EDGE;
            if (isBottomAnchored) {
                maxHeight -= this.measurements.anchorSize.height;
            }
        }
        return maxHeight;
    };
    /**
     * @param corner Origin corner of the menu surface.
     * @return Horizontal offset of menu surface origin corner from corresponding anchor corner.
     */
    MDCMenuSurfaceFoundation.prototype.getHorizontalOriginOffset = function (corner) {
        var anchorSize = this.measurements.anchorSize;
        // isRightAligned corresponds to using the 'right' property on the surface.
        var isRightAligned = this.hasBit(corner, CornerBit.RIGHT);
        var avoidHorizontalOverlap = this.hasBit(this.anchorCorner, CornerBit.RIGHT);
        if (isRightAligned) {
            var rightOffset = avoidHorizontalOverlap ?
                anchorSize.width - this.anchorMargin.left :
                this.anchorMargin.right;
            // For hoisted or fixed elements, adjust the offset by the difference
            // between viewport width and body width so when we calculate the right
            // value (`adjustPositionForHoistedElement`) based on the element
            // position, the right property is correct.
            if (this.isHoistedElement || this.isFixedPosition) {
                return rightOffset -
                    (this.measurements.viewportSize.width -
                        this.measurements.bodySize.width);
            }
            return rightOffset;
        }
        return avoidHorizontalOverlap ? anchorSize.width - this.anchorMargin.right :
            this.anchorMargin.left;
    };
    /**
     * @param corner Origin corner of the menu surface.
     * @return Vertical offset of menu surface origin corner from corresponding anchor corner.
     */
    MDCMenuSurfaceFoundation.prototype.getVerticalOriginOffset = function (corner) {
        var anchorSize = this.measurements.anchorSize;
        var isBottomAligned = this.hasBit(corner, CornerBit.BOTTOM);
        var avoidVerticalOverlap = this.hasBit(this.anchorCorner, CornerBit.BOTTOM);
        var y = 0;
        if (isBottomAligned) {
            y = avoidVerticalOverlap ? anchorSize.height - this.anchorMargin.top :
                -this.anchorMargin.bottom;
        }
        else {
            y = avoidVerticalOverlap ?
                (anchorSize.height + this.anchorMargin.bottom) :
                this.anchorMargin.top;
        }
        return y;
    };
    /** Calculates the offsets for positioning the menu-surface when the menu-surface has been hoisted to the body. */
    MDCMenuSurfaceFoundation.prototype.adjustPositionForHoistedElement = function (position) {
        var e_1, _a;
        var _b = this.measurements, windowScroll = _b.windowScroll, viewportDistance = _b.viewportDistance;
        var props = Object.keys(position);
        try {
            for (var props_1 = __values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
                var prop = props_1_1.value;
                var value = position[prop] || 0;
                // Hoisted surfaces need to have the anchor elements location on the page added to the
                // position properties for proper alignment on the body.
                value += viewportDistance[prop];
                // Surfaces that are absolutely positioned need to have additional calculations for scroll
                // and bottom positioning.
                if (!this.isFixedPosition) {
                    if (prop === 'top') {
                        value += windowScroll.y;
                    }
                    else if (prop === 'bottom') {
                        value -= windowScroll.y;
                    }
                    else if (prop === 'left') {
                        value += windowScroll.x;
                    }
                    else { // prop === 'right'
                        value -= windowScroll.x;
                    }
                }
                position[prop] = value;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (props_1_1 && !props_1_1.done && (_a = props_1.return)) _a.call(props_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    /**
     * The last focused element when the menu surface was opened should regain focus, if the user is
     * focused on or within the menu surface when it is closed.
     */
    MDCMenuSurfaceFoundation.prototype.maybeRestoreFocus = function () {
        var isRootFocused = this.adapter.isFocused();
        var childHasFocus = document.activeElement &&
            this.adapter.isElementInContainer(document.activeElement);
        if (isRootFocused || childHasFocus) {
            this.adapter.restoreFocus();
        }
    };
    MDCMenuSurfaceFoundation.prototype.hasBit = function (corner, bit) {
        return Boolean(corner & bit); // tslint:disable-line:no-bitwise
    };
    MDCMenuSurfaceFoundation.prototype.setBit = function (corner, bit) {
        return corner | bit; // tslint:disable-line:no-bitwise
    };
    MDCMenuSurfaceFoundation.prototype.unsetBit = function (corner, bit) {
        return corner ^ bit;
    };
    /**
     * isFinite that doesn't force conversion to number type.
     * Equivalent to Number.isFinite in ES2015, which is not supported in IE.
     */
    MDCMenuSurfaceFoundation.prototype.isFinite = function (num) {
        return typeof num === 'number' && isFinite(num);
    };
    return MDCMenuSurfaceFoundation;
}(MDCFoundation));

// tslint:disable:no-bitwise
// required for closure compiler
const stringToCorner = {
    'TOP_LEFT': Corner.TOP_LEFT,
    'TOP_RIGHT': Corner.TOP_RIGHT,
    'BOTTOM_LEFT': Corner.BOTTOM_LEFT,
    'BOTTOM_RIGHT': Corner.BOTTOM_RIGHT,
    'TOP_START': Corner.TOP_START,
    'TOP_END': Corner.TOP_END,
    'BOTTOM_START': Corner.BOTTOM_START,
    'BOTTOM_END': Corner.BOTTOM_END,
};
/**
 * @fires opened
 * @fires closed
 */
class MenuSurfaceBase extends BaseElement {
    constructor() {
        super(...arguments);
        this.mdcFoundationClass = MDCMenuSurfaceFoundation;
        this.absolute = false;
        this.fullwidth = false;
        this.fixed = false;
        this.x = null;
        this.y = null;
        // must be defined before open or else race condition in foundation occurs.
        this.quick = false;
        this.open = false;
        this.bitwiseCorner = Corner.TOP_START;
        this.previousMenuCorner = null;
        // must be defined before observer of anchor corner for initialization
        this.menuCorner = 'START';
        this.corner = 'TOP_START';
        this.styleTop = '';
        this.styleLeft = '';
        this.styleRight = '';
        this.styleBottom = '';
        this.styleMaxHeight = '';
        this.styleTransformOrigin = '';
        this.anchor = null;
        this.previouslyFocused = null;
        this.previousAnchor = null;
        this.onBodyClickBound = () => undefined;
    }
    render() {
        const classes = {
            'mdc-menu-surface--fixed': this.fixed,
            'mdc-menu-surface--fullwidth': this.fullwidth,
        };
        const styles = {
            'top': this.styleTop,
            'left': this.styleLeft,
            'right': this.styleRight,
            'bottom': this.styleBottom,
            'max-height': this.styleMaxHeight,
            'transform-origin': this.styleTransformOrigin,
        };
        return html$2 `
      <div
          class="mdc-menu-surface ${classMap(classes)}"
          style="${styleMap(styles)}"
          @keydown=${this.onKeydown}
          @opened=${this.registerBodyClick}
          @closed=${this.deregisterBodyClick}>
        <slot></slot>
      </div>`;
    }
    createAdapter() {
        return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { hasAnchor: () => {
                return !!this.anchor;
            }, notifyClose: () => {
                const init = { bubbles: true, composed: true };
                const ev = new CustomEvent('closed', init);
                this.open = false;
                this.mdcRoot.dispatchEvent(ev);
            }, notifyOpen: () => {
                const init = { bubbles: true, composed: true };
                const ev = new CustomEvent('opened', init);
                this.open = true;
                this.mdcRoot.dispatchEvent(ev);
            }, isElementInContainer: () => false, isRtl: () => {
                if (this.mdcRoot) {
                    return getComputedStyle(this.mdcRoot).direction === 'rtl';
                }
                return false;
            }, setTransformOrigin: (origin) => {
                const root = this.mdcRoot;
                if (!root) {
                    return;
                }
                this.styleTransformOrigin = origin;
            }, isFocused: () => {
                return doesElementContainFocus(this);
            }, saveFocus: () => {
                const activeElementPath = deepActiveElementPath();
                const pathLength = activeElementPath.length;
                if (!pathLength) {
                    this.previouslyFocused = null;
                }
                this.previouslyFocused = activeElementPath[pathLength - 1];
            }, restoreFocus: () => {
                if (!this.previouslyFocused) {
                    return;
                }
                if ('focus' in this.previouslyFocused) {
                    this.previouslyFocused.focus();
                }
            }, getInnerDimensions: () => {
                const mdcRoot = this.mdcRoot;
                if (!mdcRoot) {
                    return { width: 0, height: 0 };
                }
                return { width: mdcRoot.offsetWidth, height: mdcRoot.offsetHeight };
            }, getAnchorDimensions: () => {
                const anchorElement = this.anchor;
                return anchorElement ? anchorElement.getBoundingClientRect() : null;
            }, getBodyDimensions: () => {
                return {
                    width: document.body.clientWidth,
                    height: document.body.clientHeight,
                };
            }, getWindowDimensions: () => {
                return {
                    width: window.innerWidth,
                    height: window.innerHeight,
                };
            }, getWindowScroll: () => {
                return {
                    x: window.pageXOffset,
                    y: window.pageYOffset,
                };
            }, setPosition: (position) => {
                const mdcRoot = this.mdcRoot;
                if (!mdcRoot) {
                    return;
                }
                this.styleLeft = 'left' in position ? `${position.left}px` : '';
                this.styleRight = 'right' in position ? `${position.right}px` : '';
                this.styleTop = 'top' in position ? `${position.top}px` : '';
                this.styleBottom = 'bottom' in position ? `${position.bottom}px` : '';
            }, setMaxHeight: async (height) => {
                const mdcRoot = this.mdcRoot;
                if (!mdcRoot) {
                    return;
                }
                // must set both for IE support as IE will not set a var
                this.styleMaxHeight = height;
                await this.updateComplete;
                this.styleMaxHeight = `var(--mdc-menu-max-height, ${height})`;
            } });
    }
    onKeydown(evt) {
        if (this.mdcFoundation) {
            this.mdcFoundation.handleKeydown(evt);
        }
    }
    onBodyClick(evt) {
        const path = evt.composedPath();
        if (path.indexOf(this) === -1) {
            this.close();
        }
    }
    registerBodyClick() {
        this.onBodyClickBound = this.onBodyClick.bind(this);
        // capture otherwise listener closes menu after quick menu opens
        document.body.addEventListener('click', this.onBodyClickBound, { passive: true, capture: true });
    }
    deregisterBodyClick() {
        document.body.removeEventListener('click', this.onBodyClickBound, { capture: true });
    }
    close() {
        this.open = false;
    }
    show() {
        this.open = true;
    }
}
__decorate([
    query('.mdc-menu-surface')
], MenuSurfaceBase.prototype, "mdcRoot", void 0);
__decorate([
    query('slot')
], MenuSurfaceBase.prototype, "slotElement", void 0);
__decorate([
    property({ type: Boolean }),
    observer(function (isAbsolute) {
        if (this.mdcFoundation && !this.fixed) {
            this.mdcFoundation.setIsHoisted(isAbsolute);
        }
    })
], MenuSurfaceBase.prototype, "absolute", void 0);
__decorate([
    property({ type: Boolean })
], MenuSurfaceBase.prototype, "fullwidth", void 0);
__decorate([
    property({ type: Boolean }),
    observer(function (isFixed) {
        if (this.mdcFoundation && !this.absolute) {
            this.mdcFoundation.setIsHoisted(isFixed);
        }
    })
], MenuSurfaceBase.prototype, "fixed", void 0);
__decorate([
    property({ type: Number }),
    observer(function (value) {
        if (this.mdcFoundation && this.y !== null && value !== null) {
            this.mdcFoundation.setAbsolutePosition(value, this.y);
            this.mdcFoundation.setAnchorMargin({ left: value, top: this.y, right: -value, bottom: this.y });
        }
    })
], MenuSurfaceBase.prototype, "x", void 0);
__decorate([
    property({ type: Number }),
    observer(function (value) {
        if (this.mdcFoundation && this.x !== null && value !== null) {
            this.mdcFoundation.setAbsolutePosition(this.x, value);
            this.mdcFoundation.setAnchorMargin({ left: this.x, top: value, right: -this.x, bottom: value });
        }
    })
], MenuSurfaceBase.prototype, "y", void 0);
__decorate([
    property({ type: Boolean }),
    observer(function (value) {
        if (this.mdcFoundation) {
            this.mdcFoundation.setQuickOpen(value);
        }
    })
], MenuSurfaceBase.prototype, "quick", void 0);
__decorate([
    property({ type: Boolean, reflect: true }),
    observer(function (isOpen, wasOpen) {
        if (this.mdcFoundation) {
            if (isOpen) {
                this.mdcFoundation.open();
                // wasOpen helps with first render (when it is `undefined`) perf
            }
            else if (wasOpen !== undefined) {
                this.mdcFoundation.close();
            }
        }
    })
], MenuSurfaceBase.prototype, "open", void 0);
__decorate([
    internalProperty(),
    observer(function (value) {
        if (this.mdcFoundation) {
            if (value) {
                this.mdcFoundation.setAnchorCorner(value);
            }
            else {
                this.mdcFoundation.setAnchorCorner(value);
            }
        }
    })
], MenuSurfaceBase.prototype, "bitwiseCorner", void 0);
__decorate([
    property({ type: String }),
    observer(function (value) {
        if (this.mdcFoundation) {
            const isValidValue = value === 'START' || value === 'END';
            const isFirstTimeSet = this.previousMenuCorner === null;
            const cornerChanged = !isFirstTimeSet && value !== this.previousMenuCorner;
            const initiallySetToEnd = isFirstTimeSet && value === 'END';
            if (isValidValue && (cornerChanged || initiallySetToEnd)) {
                this.bitwiseCorner = this.bitwiseCorner ^ CornerBit.RIGHT;
                this.mdcFoundation.flipCornerHorizontally();
                this.previousMenuCorner = value;
            }
        }
    })
], MenuSurfaceBase.prototype, "menuCorner", void 0);
__decorate([
    property({ type: String }),
    observer(function (value) {
        if (this.mdcFoundation) {
            if (value) {
                let newCorner = stringToCorner[value];
                if (this.menuCorner === 'END') {
                    newCorner = newCorner ^ CornerBit.RIGHT;
                }
                this.bitwiseCorner = newCorner;
            }
        }
    })
], MenuSurfaceBase.prototype, "corner", void 0);
__decorate([
    internalProperty()
], MenuSurfaceBase.prototype, "styleTop", void 0);
__decorate([
    internalProperty()
], MenuSurfaceBase.prototype, "styleLeft", void 0);
__decorate([
    internalProperty()
], MenuSurfaceBase.prototype, "styleRight", void 0);
__decorate([
    internalProperty()
], MenuSurfaceBase.prototype, "styleBottom", void 0);
__decorate([
    internalProperty()
], MenuSurfaceBase.prototype, "styleMaxHeight", void 0);
__decorate([
    internalProperty()
], MenuSurfaceBase.prototype, "styleTransformOrigin", void 0);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$6 = css `.mdc-menu-surface{display:none;position:absolute;box-sizing:border-box;max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);margin:0;padding:0;transform:scale(1);transform-origin:top left;opacity:0;overflow:auto;will-change:transform,opacity;z-index:8;transition:opacity .03s linear,transform .12s cubic-bezier(0, 0, 0.2, 1),height 250ms cubic-bezier(0, 0, 0.2, 1);box-shadow:0px 5px 5px -3px rgba(0, 0, 0, 0.2),0px 8px 10px 1px rgba(0, 0, 0, 0.14),0px 3px 14px 2px rgba(0,0,0,.12);background-color:#fff;background-color:var(--mdc-theme-surface, #fff);color:#000;color:var(--mdc-theme-on-surface, #000);border-radius:4px;border-radius:var(--mdc-shape-medium, 4px);transform-origin-left:top left;transform-origin-right:top right}.mdc-menu-surface:focus{outline:none}.mdc-menu-surface--open{display:inline-block;transform:scale(1);opacity:1}.mdc-menu-surface--animating-open{display:inline-block;transform:scale(0.8);opacity:0}.mdc-menu-surface--animating-closed{display:inline-block;opacity:0;transition:opacity .075s linear}[dir=rtl] .mdc-menu-surface,.mdc-menu-surface[dir=rtl]{transform-origin-left:top right;transform-origin-right:top left}.mdc-menu-surface--anchor{position:relative;overflow:visible}.mdc-menu-surface--fixed{position:fixed}.mdc-menu-surface--fullwidth{width:100%}:host(:not([open])){display:none}.mdc-menu-surface{z-index:8;z-index:var(--mdc-menu-z-index, 8);max-height:calc(100vh - 32px);max-height:var(--mdc-menu-max-height, calc(100vh - 32px))}`;

/**
@license
Copyright 2020 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
let MenuSurface = class MenuSurface extends MenuSurfaceBase {
};
MenuSurface.styles = style$6;
MenuSurface = __decorate([
    customElement('mwc-menu-surface')
], MenuSurface);

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var cssClasses$7 = {
    MENU_SELECTED_LIST_ITEM: 'mdc-menu-item--selected',
    MENU_SELECTION_GROUP: 'mdc-menu__selection-group',
    ROOT: 'mdc-menu',
};
var strings$5 = {
    ARIA_CHECKED_ATTR: 'aria-checked',
    ARIA_DISABLED_ATTR: 'aria-disabled',
    CHECKBOX_SELECTOR: 'input[type="checkbox"]',
    LIST_SELECTOR: '.mdc-list',
    SELECTED_EVENT: 'MDCMenu:selected',
};
var numbers$5 = {
    FOCUS_ROOT_INDEX: -1,
};
var DefaultFocusState;
(function (DefaultFocusState) {
    DefaultFocusState[DefaultFocusState["NONE"] = 0] = "NONE";
    DefaultFocusState[DefaultFocusState["LIST_ROOT"] = 1] = "LIST_ROOT";
    DefaultFocusState[DefaultFocusState["FIRST_ITEM"] = 2] = "FIRST_ITEM";
    DefaultFocusState[DefaultFocusState["LAST_ITEM"] = 3] = "LAST_ITEM";
})(DefaultFocusState || (DefaultFocusState = {}));

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCMenuFoundation = /** @class */ (function (_super) {
    __extends(MDCMenuFoundation, _super);
    function MDCMenuFoundation(adapter) {
        var _this = _super.call(this, __assign(__assign({}, MDCMenuFoundation.defaultAdapter), adapter)) || this;
        _this.closeAnimationEndTimerId_ = 0;
        _this.defaultFocusState_ = DefaultFocusState.LIST_ROOT;
        return _this;
    }
    Object.defineProperty(MDCMenuFoundation, "cssClasses", {
        get: function () {
            return cssClasses$7;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCMenuFoundation, "strings", {
        get: function () {
            return strings$5;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCMenuFoundation, "numbers", {
        get: function () {
            return numbers$5;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCMenuFoundation, "defaultAdapter", {
        /**
         * @see {@link MDCMenuAdapter} for typing information on parameters and return types.
         */
        get: function () {
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            return {
                addClassToElementAtIndex: function () { return undefined; },
                removeClassFromElementAtIndex: function () { return undefined; },
                addAttributeToElementAtIndex: function () { return undefined; },
                removeAttributeFromElementAtIndex: function () { return undefined; },
                elementContainsClass: function () { return false; },
                closeSurface: function () { return undefined; },
                getElementIndex: function () { return -1; },
                notifySelected: function () { return undefined; },
                getMenuItemCount: function () { return 0; },
                focusItemAtIndex: function () { return undefined; },
                focusListRoot: function () { return undefined; },
                getSelectedSiblingOfItemAtIndex: function () { return -1; },
                isSelectableItemAtIndex: function () { return false; },
            };
            // tslint:enable:object-literal-sort-keys
        },
        enumerable: true,
        configurable: true
    });
    MDCMenuFoundation.prototype.destroy = function () {
        if (this.closeAnimationEndTimerId_) {
            clearTimeout(this.closeAnimationEndTimerId_);
        }
        this.adapter.closeSurface();
    };
    MDCMenuFoundation.prototype.handleKeydown = function (evt) {
        var key = evt.key, keyCode = evt.keyCode;
        var isTab = key === 'Tab' || keyCode === 9;
        if (isTab) {
            this.adapter.closeSurface(/** skipRestoreFocus */ true);
        }
    };
    MDCMenuFoundation.prototype.handleItemAction = function (listItem) {
        var _this = this;
        var index = this.adapter.getElementIndex(listItem);
        if (index < 0) {
            return;
        }
        this.adapter.notifySelected({ index: index });
        this.adapter.closeSurface();
        // Wait for the menu to close before adding/removing classes that affect styles.
        this.closeAnimationEndTimerId_ = setTimeout(function () {
            // Recompute the index in case the menu contents have changed.
            var recomputedIndex = _this.adapter.getElementIndex(listItem);
            if (recomputedIndex >= 0 &&
                _this.adapter.isSelectableItemAtIndex(recomputedIndex)) {
                _this.setSelectedIndex(recomputedIndex);
            }
        }, MDCMenuSurfaceFoundation.numbers.TRANSITION_CLOSE_DURATION);
    };
    MDCMenuFoundation.prototype.handleMenuSurfaceOpened = function () {
        switch (this.defaultFocusState_) {
            case DefaultFocusState.FIRST_ITEM:
                this.adapter.focusItemAtIndex(0);
                break;
            case DefaultFocusState.LAST_ITEM:
                this.adapter.focusItemAtIndex(this.adapter.getMenuItemCount() - 1);
                break;
            case DefaultFocusState.NONE:
                // Do nothing.
                break;
            default:
                this.adapter.focusListRoot();
                break;
        }
    };
    /**
     * Sets default focus state where the menu should focus every time when menu
     * is opened. Focuses the list root (`DefaultFocusState.LIST_ROOT`) element by
     * default.
     */
    MDCMenuFoundation.prototype.setDefaultFocusState = function (focusState) {
        this.defaultFocusState_ = focusState;
    };
    /**
     * Selects the list item at `index` within the menu.
     * @param index Index of list item within the menu.
     */
    MDCMenuFoundation.prototype.setSelectedIndex = function (index) {
        this.validatedIndex_(index);
        if (!this.adapter.isSelectableItemAtIndex(index)) {
            throw new Error('MDCMenuFoundation: No selection group at specified index.');
        }
        var prevSelectedIndex = this.adapter.getSelectedSiblingOfItemAtIndex(index);
        if (prevSelectedIndex >= 0) {
            this.adapter.removeAttributeFromElementAtIndex(prevSelectedIndex, strings$5.ARIA_CHECKED_ATTR);
            this.adapter.removeClassFromElementAtIndex(prevSelectedIndex, cssClasses$7.MENU_SELECTED_LIST_ITEM);
        }
        this.adapter.addClassToElementAtIndex(index, cssClasses$7.MENU_SELECTED_LIST_ITEM);
        this.adapter.addAttributeToElementAtIndex(index, strings$5.ARIA_CHECKED_ATTR, 'true');
    };
    /**
     * Sets the enabled state to isEnabled for the menu item at the given index.
     * @param index Index of the menu item
     * @param isEnabled The desired enabled state of the menu item.
     */
    MDCMenuFoundation.prototype.setEnabled = function (index, isEnabled) {
        this.validatedIndex_(index);
        if (isEnabled) {
            this.adapter.removeClassFromElementAtIndex(index, cssClasses$5.LIST_ITEM_DISABLED_CLASS);
            this.adapter.addAttributeToElementAtIndex(index, strings$5.ARIA_DISABLED_ATTR, 'false');
        }
        else {
            this.adapter.addClassToElementAtIndex(index, cssClasses$5.LIST_ITEM_DISABLED_CLASS);
            this.adapter.addAttributeToElementAtIndex(index, strings$5.ARIA_DISABLED_ATTR, 'true');
        }
    };
    MDCMenuFoundation.prototype.validatedIndex_ = function (index) {
        var menuSize = this.adapter.getMenuItemCount();
        var isIndexInRange = index >= 0 && index < menuSize;
        if (!isIndexInRange) {
            throw new Error('MDCMenuFoundation: No list item at specified index.');
        }
    };
    return MDCMenuFoundation;
}(MDCFoundation));

/**
 * @fires selected {SelectedDetail}
 * @fires action {ActionDetail}
 * @fires items-updated
 * @fires opened
 * @fires closed
 */
class MenuBase extends BaseElement {
    constructor() {
        super(...arguments);
        this.mdcFoundationClass = MDCMenuFoundation;
        this.listElement_ = null;
        this.anchor = null;
        this.open = false;
        this.quick = false;
        this.wrapFocus = false;
        this.innerRole = 'menu';
        this.corner = 'TOP_START';
        this.x = null;
        this.y = null;
        this.absolute = false;
        this.multi = false;
        this.activatable = false;
        this.fixed = false;
        this.forceGroupSelection = false;
        this.fullwidth = false;
        this.menuCorner = 'START';
        this.defaultFocus = 'LIST_ROOT';
        this._listUpdateComplete = null;
    }
    get listElement() {
        if (!this.listElement_) {
            this.listElement_ = this.renderRoot.querySelector('mwc-list');
            return this.listElement_;
        }
        return this.listElement_;
    }
    get items() {
        const listElement = this.listElement;
        if (listElement) {
            return listElement.items;
        }
        return [];
    }
    get index() {
        const listElement = this.listElement;
        if (listElement) {
            return listElement.index;
        }
        return -1;
    }
    get selected() {
        const listElement = this.listElement;
        if (listElement) {
            return listElement.selected;
        }
        return null;
    }
    render() {
        const itemRoles = this.innerRole === 'menu' ? 'menuitem' : 'option';
        return html$2 `
      <mwc-menu-surface
          ?hidden=${!this.open}
          .anchor=${this.anchor}
          .open=${this.open}
          .quick=${this.quick}
          .corner=${this.corner}
          .x=${this.x}
          .y=${this.y}
          .absolute=${this.absolute}
          .fixed=${this.fixed}
          .fullwidth=${this.fullwidth}
          .menuCorner=${this.menuCorner}
          class="mdc-menu mdc-menu-surface"
          @closed=${this.onClosed}
          @opened=${this.onOpened}
          @keydown=${this.onKeydown}>
        <mwc-list
          rootTabbable
          .innerRole=${this.innerRole}
          .multi=${this.multi}
          class="mdc-list"
          .itemRoles=${itemRoles}
          .wrapFocus=${this.wrapFocus}
          .activatable=${this.activatable}
          @action=${this.onAction}>
        <slot></slot>
      </mwc-list>
    </mwc-menu-surface>`;
    }
    createAdapter() {
        return {
            addClassToElementAtIndex: (index, className) => {
                const listElement = this.listElement;
                if (!listElement) {
                    return;
                }
                const element = listElement.items[index];
                if (!element) {
                    return;
                }
                if (className === 'mdc-menu-item--selected') {
                    if (this.forceGroupSelection && !element.selected) {
                        listElement.toggle(index, true);
                    }
                }
                else {
                    element.classList.add(className);
                }
            },
            removeClassFromElementAtIndex: (index, className) => {
                const listElement = this.listElement;
                if (!listElement) {
                    return;
                }
                const element = listElement.items[index];
                if (!element) {
                    return;
                }
                if (className === 'mdc-menu-item--selected') {
                    if (element.selected) {
                        listElement.toggle(index, false);
                    }
                }
                else {
                    element.classList.remove(className);
                }
            },
            addAttributeToElementAtIndex: (index, attr, value) => {
                const listElement = this.listElement;
                if (!listElement) {
                    return;
                }
                const element = listElement.items[index];
                if (!element) {
                    return;
                }
                element.setAttribute(attr, value);
            },
            removeAttributeFromElementAtIndex: (index, attr) => {
                const listElement = this.listElement;
                if (!listElement) {
                    return;
                }
                const element = listElement.items[index];
                if (!element) {
                    return;
                }
                element.removeAttribute(attr);
            },
            elementContainsClass: (element, className) => element.classList.contains(className),
            closeSurface: () => {
                this.open = false;
            },
            getElementIndex: (element) => {
                const listElement = this.listElement;
                if (listElement) {
                    return listElement.items.indexOf(element);
                }
                return -1;
            },
            notifySelected: () => { },
            getMenuItemCount: () => {
                const listElement = this.listElement;
                if (!listElement) {
                    return 0;
                }
                return listElement.items.length;
            },
            focusItemAtIndex: (index) => {
                const listElement = this.listElement;
                if (!listElement) {
                    return;
                }
                const element = listElement.items[index];
                if (element) {
                    element.focus();
                }
            },
            focusListRoot: () => {
                if (this.listElement) {
                    this.listElement.focus();
                }
            },
            getSelectedSiblingOfItemAtIndex: (index) => {
                const listElement = this.listElement;
                if (!listElement) {
                    return -1;
                }
                const elementAtIndex = listElement.items[index];
                if (!elementAtIndex || !elementAtIndex.group) {
                    return -1;
                }
                for (let i = 0; i < listElement.items.length; i++) {
                    if (i === index) {
                        continue;
                    }
                    const current = listElement.items[i];
                    if (current.selected && current.group === elementAtIndex.group) {
                        return i;
                    }
                }
                return -1;
            },
            isSelectableItemAtIndex: (index) => {
                const listElement = this.listElement;
                if (!listElement) {
                    return false;
                }
                const elementAtIndex = listElement.items[index];
                if (!elementAtIndex) {
                    return false;
                }
                return elementAtIndex.hasAttribute('group');
            },
        };
    }
    onKeydown(evt) {
        if (this.mdcFoundation) {
            this.mdcFoundation.handleKeydown(evt);
        }
    }
    onAction(evt) {
        const listElement = this.listElement;
        if (this.mdcFoundation && listElement) {
            const index = evt.detail.index;
            const el = listElement.items[index];
            if (el) {
                this.mdcFoundation.handleItemAction(el);
            }
        }
    }
    onOpened() {
        this.open = true;
        if (this.mdcFoundation) {
            this.mdcFoundation.handleMenuSurfaceOpened();
        }
    }
    onClosed() {
        this.open = false;
    }
    async _getUpdateComplete() {
        await this._listUpdateComplete;
        await super._getUpdateComplete();
    }
    async firstUpdated() {
        super.firstUpdated();
        const listElement = this.listElement;
        if (listElement) {
            this._listUpdateComplete = listElement.updateComplete;
            await this._listUpdateComplete;
        }
    }
    select(index) {
        const listElement = this.listElement;
        if (listElement) {
            listElement.select(index);
        }
    }
    close() {
        this.open = false;
    }
    show() {
        this.open = true;
    }
    getFocusedItemIndex() {
        const listElement = this.listElement;
        if (listElement) {
            return listElement.getFocusedItemIndex();
        }
        return -1;
    }
    focusItemAtIndex(index) {
        const listElement = this.listElement;
        if (listElement) {
            listElement.focusItemAtIndex(index);
        }
    }
    layout(updateItems = true) {
        const listElement = this.listElement;
        if (listElement) {
            listElement.layout(updateItems);
        }
    }
}
__decorate([
    query('.mdc-menu')
], MenuBase.prototype, "mdcRoot", void 0);
__decorate([
    query('slot')
], MenuBase.prototype, "slotElement", void 0);
__decorate([
    property({ type: Object })
], MenuBase.prototype, "anchor", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], MenuBase.prototype, "open", void 0);
__decorate([
    property({ type: Boolean })
], MenuBase.prototype, "quick", void 0);
__decorate([
    property({ type: Boolean })
], MenuBase.prototype, "wrapFocus", void 0);
__decorate([
    property({ type: String })
], MenuBase.prototype, "innerRole", void 0);
__decorate([
    property({ type: String })
], MenuBase.prototype, "corner", void 0);
__decorate([
    property({ type: Number })
], MenuBase.prototype, "x", void 0);
__decorate([
    property({ type: Number })
], MenuBase.prototype, "y", void 0);
__decorate([
    property({ type: Boolean })
], MenuBase.prototype, "absolute", void 0);
__decorate([
    property({ type: Boolean })
], MenuBase.prototype, "multi", void 0);
__decorate([
    property({ type: Boolean })
], MenuBase.prototype, "activatable", void 0);
__decorate([
    property({ type: Boolean })
], MenuBase.prototype, "fixed", void 0);
__decorate([
    property({ type: Boolean })
], MenuBase.prototype, "forceGroupSelection", void 0);
__decorate([
    property({ type: Boolean })
], MenuBase.prototype, "fullwidth", void 0);
__decorate([
    property({ type: String })
], MenuBase.prototype, "menuCorner", void 0);
__decorate([
    property({ type: String }),
    observer(function (value) {
        if (this.mdcFoundation) {
            this.mdcFoundation.setDefaultFocusState(DefaultFocusState[value]);
        }
    })
], MenuBase.prototype, "defaultFocus", void 0);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$7 = css `mwc-list ::slotted([mwc-list-item]:not([twoline])){height:var(--mdc-menu-item-height, 48px)}mwc-list{max-width:var(--mdc-menu-max-width, auto);min-width:var(--mdc-menu-min-width, auto)}`;

/**
@license
Copyright 2020 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
let Menu = class Menu extends MenuBase {
};
Menu.styles = style$7;
Menu = __decorate([
    customElement('mwc-menu')
], Menu);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$8 = css `:host{font-family:var(--mdc-icon-font, "Material Icons");font-weight:normal;font-style:normal;font-size:var(--mdc-icon-size, 24px);line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga"}`;

/** @soyCompatible */
let Icon = class Icon extends LitElement {
    /** @soyTemplate */
    render() {
        return html$2 `<slot></slot>`;
    }
};
Icon.styles = style$8;
Icon = __decorate([
    customElement('mwc-icon')
], Icon);

/**
 * @license
 * Copyright 2020 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var ELEMENTS_KEY_ALLOWED_IN$1 = ['input', 'button', 'textarea', 'select'];
/**
 * Ensures that preventDefault is only called if the containing element
 * doesn't consume the event, and it will cause an unintended scroll.
 *
 * @param evt keyboard event to be prevented.
 */
var preventDefaultEvent = function (evt) {
    var target = evt.target;
    if (!target) {
        return;
    }
    var tagName = ("" + target.tagName).toLowerCase();
    if (ELEMENTS_KEY_ALLOWED_IN$1.indexOf(tagName) === -1) {
        evt.preventDefault();
    }
};

/**
 * @license
 * Copyright 2020 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/**
 * Initializes a state object for typeahead. Use the same reference for calls to
 * typeahead functions.
 *
 * @return The current state of the typeahead process. Each state reference
 *     represents a typeahead instance as the reference is typically mutated
 *     in-place.
 */
function initState() {
    var state = {
        bufferClearTimeout: 0,
        currentFirstChar: '',
        sortedIndexCursor: 0,
        typeaheadBuffer: '',
    };
    return state;
}
/**
 * Initializes typeahead state by indexing the current list items by primary
 * text into the sortedIndexByFirstChar data structure.
 *
 * @param listItemCount numer of items in the list
 * @param getPrimaryTextByItemIndex function that returns the primary text at a
 *     given index
 *
 * @return Map that maps the first character of the primary text to the full
 *     list text and it's index
 */
function initSortedIndex(listItemCount, getPrimaryTextByItemIndex) {
    var sortedIndexByFirstChar = new Map();
    // Aggregate item text to index mapping
    for (var i = 0; i < listItemCount; i++) {
        var primaryText = getPrimaryTextByItemIndex(i).trim();
        if (!primaryText) {
            continue;
        }
        var firstChar = primaryText[0].toLowerCase();
        if (!sortedIndexByFirstChar.has(firstChar)) {
            sortedIndexByFirstChar.set(firstChar, []);
        }
        sortedIndexByFirstChar.get(firstChar).push({ text: primaryText.toLowerCase(), index: i });
    }
    // Sort the mapping
    // TODO(b/157162694): Investigate replacing forEach with Map.values()
    sortedIndexByFirstChar.forEach(function (values) {
        values.sort(function (first, second) {
            return first.index - second.index;
        });
    });
    return sortedIndexByFirstChar;
}
/**
 * Given the next desired character from the user, it attempts to find the next
 * list option matching the buffer. Wraps around if at the end of options.
 *
 * @param opts Options and accessors
 *   - nextChar - the next character to match against items
 *   - sortedIndexByFirstChar - output of `initSortedIndex(...)`
 *   - focusedItemIndex - the index of the currently focused item
 *   - focusItemAtIndex - function that focuses a list item at given index
 *   - skipFocus - whether or not to focus the matched item
 *   - isItemAtIndexDisabled - function that determines whether an item at a
 *        given index is disabled
 * @param state The typeahead state instance. See `initState`.
 *
 * @return The index of the matched item, or -1 if no match.
 */
function matchItem(opts, state) {
    var nextChar = opts.nextChar, focusItemAtIndex = opts.focusItemAtIndex, sortedIndexByFirstChar = opts.sortedIndexByFirstChar, focusedItemIndex = opts.focusedItemIndex, skipFocus = opts.skipFocus, isItemAtIndexDisabled = opts.isItemAtIndexDisabled;
    clearTimeout(state.bufferClearTimeout);
    state.bufferClearTimeout = setTimeout(function () {
        clearBuffer(state);
    }, numbers$3.TYPEAHEAD_BUFFER_CLEAR_TIMEOUT_MS);
    state.typeaheadBuffer = state.typeaheadBuffer + nextChar;
    var index;
    if (state.typeaheadBuffer.length === 1) {
        index = matchFirstChar(sortedIndexByFirstChar, focusedItemIndex, isItemAtIndexDisabled, state);
    }
    else {
        index = matchAllChars(sortedIndexByFirstChar, isItemAtIndexDisabled, state);
    }
    if (index !== -1 && !skipFocus) {
        focusItemAtIndex(index);
    }
    return index;
}
/**
 * Matches the user's single input character in the buffer to the
 * next option that begins with such character. Wraps around if at
 * end of options. Returns -1 if no match is found.
 */
function matchFirstChar(sortedIndexByFirstChar, focusedItemIndex, isItemAtIndexDisabled, state) {
    var firstChar = state.typeaheadBuffer[0];
    var itemsMatchingFirstChar = sortedIndexByFirstChar.get(firstChar);
    if (!itemsMatchingFirstChar) {
        return -1;
    }
    // Has the same firstChar been recently matched?
    // Also, did starting index remain the same between key presses?
    // If both hold true, simply increment index.
    if (firstChar === state.currentFirstChar &&
        itemsMatchingFirstChar[state.sortedIndexCursor].index ===
            focusedItemIndex) {
        state.sortedIndexCursor =
            (state.sortedIndexCursor + 1) % itemsMatchingFirstChar.length;
        var newIndex = itemsMatchingFirstChar[state.sortedIndexCursor].index;
        if (!isItemAtIndexDisabled(newIndex)) {
            return newIndex;
        }
    }
    // If we're here, it means one of the following happened:
    // - either firstChar or startingIndex has changed, invalidating the
    // cursor.
    // - The next item of typeahead is disabled, so we have to look further.
    state.currentFirstChar = firstChar;
    var newCursorPosition = -1;
    var cursorPosition;
    // Find the first non-disabled item as a fallback.
    for (cursorPosition = 0; cursorPosition < itemsMatchingFirstChar.length; cursorPosition++) {
        if (!isItemAtIndexDisabled(itemsMatchingFirstChar[cursorPosition].index)) {
            newCursorPosition = cursorPosition;
            break;
        }
    }
    // Advance cursor to first item matching the firstChar that is positioned
    // after starting item. Cursor is unchanged from fallback if there's no
    // such item.
    for (; cursorPosition < itemsMatchingFirstChar.length; cursorPosition++) {
        if (itemsMatchingFirstChar[cursorPosition].index > focusedItemIndex &&
            !isItemAtIndexDisabled(itemsMatchingFirstChar[cursorPosition].index)) {
            newCursorPosition = cursorPosition;
            break;
        }
    }
    if (newCursorPosition !== -1) {
        state.sortedIndexCursor = newCursorPosition;
        return itemsMatchingFirstChar[state.sortedIndexCursor].index;
    }
    return -1;
}
/**
 * Attempts to find the next item that matches all of the typeahead buffer.
 * Wraps around if at end of options. Returns -1 if no match is found.
 */
function matchAllChars(sortedIndexByFirstChar, isItemAtIndexDisabled, state) {
    var firstChar = state.typeaheadBuffer[0];
    var itemsMatchingFirstChar = sortedIndexByFirstChar.get(firstChar);
    if (!itemsMatchingFirstChar) {
        return -1;
    }
    // Do nothing if text already matches
    var startingItem = itemsMatchingFirstChar[state.sortedIndexCursor];
    if (startingItem.text.lastIndexOf(state.typeaheadBuffer, 0) === 0 &&
        !isItemAtIndexDisabled(startingItem.index)) {
        return startingItem.index;
    }
    // Find next item that matches completely; if no match, we'll eventually
    // loop around to same position
    var cursorPosition = (state.sortedIndexCursor + 1) % itemsMatchingFirstChar.length;
    var nextCursorPosition = -1;
    while (cursorPosition !== state.sortedIndexCursor) {
        var currentItem = itemsMatchingFirstChar[cursorPosition];
        var matches = currentItem.text.lastIndexOf(state.typeaheadBuffer, 0) === 0;
        var isEnabled = !isItemAtIndexDisabled(currentItem.index);
        if (matches && isEnabled) {
            nextCursorPosition = cursorPosition;
            break;
        }
        cursorPosition = (cursorPosition + 1) % itemsMatchingFirstChar.length;
    }
    if (nextCursorPosition !== -1) {
        state.sortedIndexCursor = nextCursorPosition;
        return itemsMatchingFirstChar[state.sortedIndexCursor].index;
    }
    return -1;
}
/**
 * Whether or not the given typeahead instaance state is currently typing.
 *
 * @param state The typeahead state instance. See `initState`.
 */
function isTypingInProgress(state) {
    return state.typeaheadBuffer.length > 0;
}
/**
 * Clears the typeahaed buffer so that it resets item matching to the first
 * character.
 *
 * @param state The typeahead state instance. See `initState`.
 */
function clearBuffer(state) {
    state.typeaheadBuffer = '';
}
/**
 * Given a keydown event, it calculates whether or not to automatically focus a
 * list item depending on what was typed mimicing the typeahead functionality of
 * a standard <select> element that is open.
 *
 * @param opts Options and accessors
 *   - event - the KeyboardEvent to handle and parse
 *   - sortedIndexByFirstChar - output of `initSortedIndex(...)`
 *   - focusedItemIndex - the index of the currently focused item
 *   - focusItemAtIndex - function that focuses a list item at given index
 *   - isItemAtFocusedIndexDisabled - whether or not the currently focused item
 *      is disabled
 *   - isTargetListItem - whether or not the event target is a list item
 * @param state The typeahead state instance. See `initState`.
 *
 * @returns index of the item matched by the keydown. -1 if not matched.
 */
function handleKeydown(opts, state) {
    var event = opts.event, isTargetListItem = opts.isTargetListItem, focusedItemIndex = opts.focusedItemIndex, focusItemAtIndex = opts.focusItemAtIndex, sortedIndexByFirstChar = opts.sortedIndexByFirstChar, isItemAtIndexDisabled = opts.isItemAtIndexDisabled;
    var isArrowLeft = normalizeKey(event) === 'ArrowLeft';
    var isArrowUp = normalizeKey(event) === 'ArrowUp';
    var isArrowRight = normalizeKey(event) === 'ArrowRight';
    var isArrowDown = normalizeKey(event) === 'ArrowDown';
    var isHome = normalizeKey(event) === 'Home';
    var isEnd = normalizeKey(event) === 'End';
    var isEnter = normalizeKey(event) === 'Enter';
    var isSpace = normalizeKey(event) === 'Spacebar';
    if (isArrowLeft || isArrowUp || isArrowRight || isArrowDown || isHome ||
        isEnd || isEnter) {
        return -1;
    }
    var isCharacterKey = !isSpace && event.key.length === 1;
    if (isCharacterKey) {
        preventDefaultEvent(event);
        var matchItemOpts = {
            focusItemAtIndex: focusItemAtIndex,
            focusedItemIndex: focusedItemIndex,
            nextChar: event.key.toLowerCase(),
            sortedIndexByFirstChar: sortedIndexByFirstChar,
            skipFocus: false,
            isItemAtIndexDisabled: isItemAtIndexDisabled,
        };
        return matchItem(matchItemOpts, state);
    }
    if (!isSpace) {
        return -1;
    }
    if (isTargetListItem) {
        preventDefaultEvent(event);
    }
    var typeaheadOnListItem = isTargetListItem && isTypingInProgress(state);
    if (typeaheadOnListItem) {
        var matchItemOpts = {
            focusItemAtIndex: focusItemAtIndex,
            focusedItemIndex: focusedItemIndex,
            nextChar: ' ',
            sortedIndexByFirstChar: sortedIndexByFirstChar,
            skipFocus: false,
            isItemAtIndexDisabled: isItemAtIndexDisabled,
        };
        // space participates in typeahead matching if in rapid typing mode
        return matchItem(matchItemOpts, state);
    }
    return -1;
}

/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var cssClasses$8 = {
    ACTIVATED: 'mdc-select--activated',
    DISABLED: 'mdc-select--disabled',
    FOCUSED: 'mdc-select--focused',
    INVALID: 'mdc-select--invalid',
    MENU_INVALID: 'mdc-select__menu--invalid',
    OUTLINED: 'mdc-select--outlined',
    REQUIRED: 'mdc-select--required',
    ROOT: 'mdc-select',
    WITH_LEADING_ICON: 'mdc-select--with-leading-icon',
};
var strings$6 = {
    ARIA_CONTROLS: 'aria-controls',
    ARIA_DESCRIBEDBY: 'aria-describedby',
    ARIA_SELECTED_ATTR: 'aria-selected',
    CHANGE_EVENT: 'MDCSelect:change',
    HIDDEN_INPUT_SELECTOR: 'input[type="hidden"]',
    LABEL_SELECTOR: '.mdc-floating-label',
    LEADING_ICON_SELECTOR: '.mdc-select__icon',
    LINE_RIPPLE_SELECTOR: '.mdc-line-ripple',
    MENU_SELECTOR: '.mdc-select__menu',
    OUTLINE_SELECTOR: '.mdc-notched-outline',
    SELECTED_TEXT_SELECTOR: '.mdc-select__selected-text',
    SELECT_ANCHOR_SELECTOR: '.mdc-select__anchor',
    VALUE_ATTR: 'data-value',
};
var numbers$6 = {
    LABEL_SCALE: 0.75,
    UNSET_INDEX: -1,
    CLICK_DEBOUNCE_TIMEOUT_MS: 330,
};

/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCSelectFoundation = /** @class */ (function (_super) {
    __extends(MDCSelectFoundation, _super);
    /* istanbul ignore next: optional argument is not a branch statement */
    /**
     * @param adapter
     * @param foundationMap Map from subcomponent names to their subfoundations.
     */
    function MDCSelectFoundation(adapter, foundationMap) {
        if (foundationMap === void 0) { foundationMap = {}; }
        var _this = _super.call(this, __assign(__assign({}, MDCSelectFoundation.defaultAdapter), adapter)) || this;
        // Disabled state
        _this.disabled = false;
        // isMenuOpen is used to track the state of the menu by listening to the
        // MDCMenuSurface:closed event For reference, menu.open will return false if
        // the menu is still closing, but isMenuOpen returns false only after the menu
        // has closed
        _this.isMenuOpen = false;
        // By default, select is invalid if it is required but no value is selected.
        _this.useDefaultValidation = true;
        _this.customValidity = true;
        _this.lastSelectedIndex = numbers$6.UNSET_INDEX;
        _this.clickDebounceTimeout = 0;
        _this.recentlyClicked = false;
        _this.leadingIcon = foundationMap.leadingIcon;
        _this.helperText = foundationMap.helperText;
        return _this;
    }
    Object.defineProperty(MDCSelectFoundation, "cssClasses", {
        get: function () {
            return cssClasses$8;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCSelectFoundation, "numbers", {
        get: function () {
            return numbers$6;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCSelectFoundation, "strings", {
        get: function () {
            return strings$6;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCSelectFoundation, "defaultAdapter", {
        /**
         * See {@link MDCSelectAdapter} for typing information on parameters and return types.
         */
        get: function () {
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            return {
                addClass: function () { return undefined; },
                removeClass: function () { return undefined; },
                hasClass: function () { return false; },
                activateBottomLine: function () { return undefined; },
                deactivateBottomLine: function () { return undefined; },
                getSelectedIndex: function () { return -1; },
                setSelectedIndex: function () { return undefined; },
                hasLabel: function () { return false; },
                floatLabel: function () { return undefined; },
                getLabelWidth: function () { return 0; },
                setLabelRequired: function () { return undefined; },
                hasOutline: function () { return false; },
                notchOutline: function () { return undefined; },
                closeOutline: function () { return undefined; },
                setRippleCenter: function () { return undefined; },
                notifyChange: function () { return undefined; },
                setSelectedText: function () { return undefined; },
                isSelectAnchorFocused: function () { return false; },
                getSelectAnchorAttr: function () { return ''; },
                setSelectAnchorAttr: function () { return undefined; },
                removeSelectAnchorAttr: function () { return undefined; },
                addMenuClass: function () { return undefined; },
                removeMenuClass: function () { return undefined; },
                openMenu: function () { return undefined; },
                closeMenu: function () { return undefined; },
                getAnchorElement: function () { return null; },
                setMenuAnchorElement: function () { return undefined; },
                setMenuAnchorCorner: function () { return undefined; },
                setMenuWrapFocus: function () { return undefined; },
                focusMenuItemAtIndex: function () { return undefined; },
                getMenuItemCount: function () { return 0; },
                getMenuItemValues: function () { return []; },
                getMenuItemTextAtIndex: function () { return ''; },
                isTypeaheadInProgress: function () { return false; },
                typeaheadMatchItem: function () { return -1; },
            };
            // tslint:enable:object-literal-sort-keys
        },
        enumerable: true,
        configurable: true
    });
    /** Returns the index of the currently selected menu item, or -1 if none. */
    MDCSelectFoundation.prototype.getSelectedIndex = function () {
        return this.adapter.getSelectedIndex();
    };
    MDCSelectFoundation.prototype.setSelectedIndex = function (index, closeMenu, skipNotify) {
        if (closeMenu === void 0) { closeMenu = false; }
        if (skipNotify === void 0) { skipNotify = false; }
        if (index >= this.adapter.getMenuItemCount()) {
            return;
        }
        if (index === numbers$6.UNSET_INDEX) {
            this.adapter.setSelectedText('');
        }
        else {
            this.adapter.setSelectedText(this.adapter.getMenuItemTextAtIndex(index).trim());
        }
        this.adapter.setSelectedIndex(index);
        if (closeMenu) {
            this.adapter.closeMenu();
        }
        if (!skipNotify && this.lastSelectedIndex !== index) {
            this.handleChange();
        }
        this.lastSelectedIndex = index;
    };
    MDCSelectFoundation.prototype.setValue = function (value, skipNotify) {
        if (skipNotify === void 0) { skipNotify = false; }
        var index = this.adapter.getMenuItemValues().indexOf(value);
        this.setSelectedIndex(index, /** closeMenu */ false, skipNotify);
    };
    MDCSelectFoundation.prototype.getValue = function () {
        var index = this.adapter.getSelectedIndex();
        var menuItemValues = this.adapter.getMenuItemValues();
        return index !== numbers$6.UNSET_INDEX ? menuItemValues[index] : '';
    };
    MDCSelectFoundation.prototype.getDisabled = function () {
        return this.disabled;
    };
    MDCSelectFoundation.prototype.setDisabled = function (isDisabled) {
        this.disabled = isDisabled;
        if (this.disabled) {
            this.adapter.addClass(cssClasses$8.DISABLED);
            this.adapter.closeMenu();
        }
        else {
            this.adapter.removeClass(cssClasses$8.DISABLED);
        }
        if (this.leadingIcon) {
            this.leadingIcon.setDisabled(this.disabled);
        }
        if (this.disabled) {
            // Prevent click events from focusing select. Simply pointer-events: none
            // is not enough since screenreader clicks may bypass this.
            this.adapter.removeSelectAnchorAttr('tabindex');
        }
        else {
            this.adapter.setSelectAnchorAttr('tabindex', '0');
        }
        this.adapter.setSelectAnchorAttr('aria-disabled', this.disabled.toString());
    };
    /** Opens the menu. */
    MDCSelectFoundation.prototype.openMenu = function () {
        this.adapter.addClass(cssClasses$8.ACTIVATED);
        this.adapter.openMenu();
        this.isMenuOpen = true;
        this.adapter.setSelectAnchorAttr('aria-expanded', 'true');
    };
    /**
     * @param content Sets the content of the helper text.
     */
    MDCSelectFoundation.prototype.setHelperTextContent = function (content) {
        if (this.helperText) {
            this.helperText.setContent(content);
        }
    };
    /**
     * Re-calculates if the notched outline should be notched and if the label
     * should float.
     */
    MDCSelectFoundation.prototype.layout = function () {
        if (this.adapter.hasLabel()) {
            var optionHasValue = this.getValue().length > 0;
            var isFocused = this.adapter.hasClass(cssClasses$8.FOCUSED);
            var shouldFloatAndNotch = optionHasValue || isFocused;
            var isRequired = this.adapter.hasClass(cssClasses$8.REQUIRED);
            this.notchOutline(shouldFloatAndNotch);
            this.adapter.floatLabel(shouldFloatAndNotch);
            this.adapter.setLabelRequired(isRequired);
        }
    };
    /**
     * Synchronizes the list of options with the state of the foundation. Call
     * this whenever menu options are dynamically updated.
     */
    MDCSelectFoundation.prototype.layoutOptions = function () {
        var menuItemValues = this.adapter.getMenuItemValues();
        var selectedIndex = menuItemValues.indexOf(this.getValue());
        this.setSelectedIndex(selectedIndex, /** closeMenu */ false, /** skipNotify */ true);
    };
    MDCSelectFoundation.prototype.handleMenuOpened = function () {
        if (this.adapter.getMenuItemValues().length === 0) {
            return;
        }
        // Menu should open to the last selected element, should open to first menu item otherwise.
        var selectedIndex = this.getSelectedIndex();
        var focusItemIndex = selectedIndex >= 0 ? selectedIndex : 0;
        this.adapter.focusMenuItemAtIndex(focusItemIndex);
    };
    MDCSelectFoundation.prototype.handleMenuClosed = function () {
        this.adapter.removeClass(cssClasses$8.ACTIVATED);
        this.isMenuOpen = false;
        this.adapter.setSelectAnchorAttr('aria-expanded', 'false');
        // Unfocus the select if menu is closed without a selection
        if (!this.adapter.isSelectAnchorFocused()) {
            this.blur();
        }
    };
    /**
     * Handles value changes, via change event or programmatic updates.
     */
    MDCSelectFoundation.prototype.handleChange = function () {
        this.layout();
        this.adapter.notifyChange(this.getValue());
        var isRequired = this.adapter.hasClass(cssClasses$8.REQUIRED);
        if (isRequired && this.useDefaultValidation) {
            this.setValid(this.isValid());
        }
    };
    MDCSelectFoundation.prototype.handleMenuItemAction = function (index) {
        this.setSelectedIndex(index, /** closeMenu */ true);
    };
    /**
     * Handles focus events from select element.
     */
    MDCSelectFoundation.prototype.handleFocus = function () {
        this.adapter.addClass(cssClasses$8.FOCUSED);
        this.layout();
        this.adapter.activateBottomLine();
    };
    /**
     * Handles blur events from select element.
     */
    MDCSelectFoundation.prototype.handleBlur = function () {
        if (this.isMenuOpen) {
            return;
        }
        this.blur();
    };
    MDCSelectFoundation.prototype.handleClick = function (normalizedX) {
        if (this.disabled || this.recentlyClicked) {
            return;
        }
        this.setClickDebounceTimeout();
        if (this.isMenuOpen) {
            this.adapter.closeMenu();
            return;
        }
        this.adapter.setRippleCenter(normalizedX);
        this.openMenu();
    };
    /**
     * Handles keydown events on select element. Depending on the type of
     * character typed, does typeahead matching or opens menu.
     */
    MDCSelectFoundation.prototype.handleKeydown = function (event) {
        if (this.isMenuOpen || !this.adapter.hasClass(cssClasses$8.FOCUSED)) {
            return;
        }
        var isEnter = normalizeKey(event) === KEY.ENTER;
        var isSpace = normalizeKey(event) === KEY.SPACEBAR;
        var arrowUp = normalizeKey(event) === KEY.ARROW_UP;
        var arrowDown = normalizeKey(event) === KEY.ARROW_DOWN;
        // Typeahead
        if (!isSpace && event.key && event.key.length === 1 ||
            isSpace && this.adapter.isTypeaheadInProgress()) {
            var key = isSpace ? ' ' : event.key;
            var typeaheadNextIndex = this.adapter.typeaheadMatchItem(key, this.getSelectedIndex());
            if (typeaheadNextIndex >= 0) {
                this.setSelectedIndex(typeaheadNextIndex);
            }
            event.preventDefault();
            return;
        }
        if (!isEnter && !isSpace && !arrowUp && !arrowDown) {
            return;
        }
        // Increment/decrement index as necessary and open menu.
        if (arrowUp && this.getSelectedIndex() > 0) {
            this.setSelectedIndex(this.getSelectedIndex() - 1);
        }
        else if (arrowDown &&
            this.getSelectedIndex() < this.adapter.getMenuItemCount() - 1) {
            this.setSelectedIndex(this.getSelectedIndex() + 1);
        }
        this.openMenu();
        event.preventDefault();
    };
    /**
     * Opens/closes the notched outline.
     */
    MDCSelectFoundation.prototype.notchOutline = function (openNotch) {
        if (!this.adapter.hasOutline()) {
            return;
        }
        var isFocused = this.adapter.hasClass(cssClasses$8.FOCUSED);
        if (openNotch) {
            var labelScale = numbers$6.LABEL_SCALE;
            var labelWidth = this.adapter.getLabelWidth() * labelScale;
            this.adapter.notchOutline(labelWidth);
        }
        else if (!isFocused) {
            this.adapter.closeOutline();
        }
    };
    /**
     * Sets the aria label of the leading icon.
     */
    MDCSelectFoundation.prototype.setLeadingIconAriaLabel = function (label) {
        if (this.leadingIcon) {
            this.leadingIcon.setAriaLabel(label);
        }
    };
    /**
     * Sets the text content of the leading icon.
     */
    MDCSelectFoundation.prototype.setLeadingIconContent = function (content) {
        if (this.leadingIcon) {
            this.leadingIcon.setContent(content);
        }
    };
    MDCSelectFoundation.prototype.setUseDefaultValidation = function (useDefaultValidation) {
        this.useDefaultValidation = useDefaultValidation;
    };
    MDCSelectFoundation.prototype.setValid = function (isValid) {
        if (!this.useDefaultValidation) {
            this.customValidity = isValid;
        }
        this.adapter.setSelectAnchorAttr('aria-invalid', (!isValid).toString());
        if (isValid) {
            this.adapter.removeClass(cssClasses$8.INVALID);
            this.adapter.removeMenuClass(cssClasses$8.MENU_INVALID);
        }
        else {
            this.adapter.addClass(cssClasses$8.INVALID);
            this.adapter.addMenuClass(cssClasses$8.MENU_INVALID);
        }
        this.syncHelperTextValidity(isValid);
    };
    MDCSelectFoundation.prototype.isValid = function () {
        if (this.useDefaultValidation &&
            this.adapter.hasClass(cssClasses$8.REQUIRED) &&
            !this.adapter.hasClass(cssClasses$8.DISABLED)) {
            // See notes for required attribute under https://www.w3.org/TR/html52/sec-forms.html#the-select-element
            // TL;DR: Invalid if no index is selected, or if the first index is selected and has an empty value.
            return this.getSelectedIndex() !== numbers$6.UNSET_INDEX &&
                (this.getSelectedIndex() !== 0 || Boolean(this.getValue()));
        }
        return this.customValidity;
    };
    MDCSelectFoundation.prototype.setRequired = function (isRequired) {
        if (isRequired) {
            this.adapter.addClass(cssClasses$8.REQUIRED);
        }
        else {
            this.adapter.removeClass(cssClasses$8.REQUIRED);
        }
        this.adapter.setSelectAnchorAttr('aria-required', isRequired.toString());
        this.adapter.setLabelRequired(isRequired);
    };
    MDCSelectFoundation.prototype.getRequired = function () {
        return this.adapter.getSelectAnchorAttr('aria-required') === 'true';
    };
    MDCSelectFoundation.prototype.init = function () {
        var anchorEl = this.adapter.getAnchorElement();
        if (anchorEl) {
            this.adapter.setMenuAnchorElement(anchorEl);
            this.adapter.setMenuAnchorCorner(Corner.BOTTOM_START);
        }
        this.adapter.setMenuWrapFocus(false);
        this.setDisabled(this.adapter.hasClass(cssClasses$8.DISABLED));
        this.syncHelperTextValidity(!this.adapter.hasClass(cssClasses$8.INVALID));
        this.layout();
        this.layoutOptions();
    };
    /**
     * Unfocuses the select component.
     */
    MDCSelectFoundation.prototype.blur = function () {
        this.adapter.removeClass(cssClasses$8.FOCUSED);
        this.layout();
        this.adapter.deactivateBottomLine();
        var isRequired = this.adapter.hasClass(cssClasses$8.REQUIRED);
        if (isRequired && this.useDefaultValidation) {
            this.setValid(this.isValid());
        }
    };
    MDCSelectFoundation.prototype.syncHelperTextValidity = function (isValid) {
        if (!this.helperText) {
            return;
        }
        this.helperText.setValidity(isValid);
        var helperTextVisible = this.helperText.isVisible();
        var helperTextId = this.helperText.getId();
        if (helperTextVisible && helperTextId) {
            this.adapter.setSelectAnchorAttr(strings$6.ARIA_DESCRIBEDBY, helperTextId);
        }
        else {
            // Needed because screenreaders will read labels pointed to by
            // `aria-describedby` even if they are `aria-hidden`.
            this.adapter.removeSelectAnchorAttr(strings$6.ARIA_DESCRIBEDBY);
        }
    };
    MDCSelectFoundation.prototype.setClickDebounceTimeout = function () {
        var _this = this;
        clearTimeout(this.clickDebounceTimeout);
        this.clickDebounceTimeout = setTimeout(function () {
            _this.recentlyClicked = false;
        }, numbers$6.CLICK_DEBOUNCE_TIMEOUT_MS);
        this.recentlyClicked = true;
    };
    return MDCSelectFoundation;
}(MDCFoundation));

const createValidityObj$1 = (customValidity = {}) => {
    /*
     * We need to make ValidityState an object because it is readonly and
     * we cannot use the spread operator. Also, we don't export
     * `CustomValidityState` because it is a leaky implementation and the user
     * already has access to `ValidityState` in lib.dom.ts. Also an interface
     * {a: Type} can be casted to {readonly a: Type} so passing any object
     * should be fine.
     */
    const objectifiedCustomValidity = {};
    // eslint-disable-next-line guard-for-in
    for (const propName in customValidity) {
        /*
         * Casting is needed because ValidityState's props are all readonly and
         * thus cannot be set on `onjectifiedCustomValidity`. In the end, the
         * interface is the same as ValidityState (but not readonly), but the
         * function signature casts the output to ValidityState (thus readonly).
         */
        objectifiedCustomValidity[propName] =
            customValidity[propName];
    }
    return Object.assign({ badInput: false, customError: false, patternMismatch: false, rangeOverflow: false, rangeUnderflow: false, stepMismatch: false, tooLong: false, tooShort: false, typeMismatch: false, valid: true, valueMissing: false }, objectifiedCustomValidity);
};
/**
 * @fires selected {SelectedDetail}
 * @fires action {ActionDetail}
 * @fires opened
 * @fires closed
 * @fires change
 * @fires invalid
 */
class SelectBase extends FormElement {
    constructor() {
        super(...arguments);
        this.mdcFoundationClass = MDCSelectFoundation;
        this.disabled = false;
        this.outlined = false;
        this.label = '';
        this.outlineOpen = false;
        this.outlineWidth = 0;
        this.value = '';
        this.selectedText = '';
        this.icon = '';
        this.menuOpen = false;
        this.helper = '';
        this.validateOnInitialRender = false;
        this.validationMessage = '';
        this.required = false;
        this.naturalMenuWidth = false;
        this.isUiValid = true;
        // Transiently holds current typeahead prefix from user.
        this.typeaheadState = initState();
        this.sortedIndexByFirstChar = new Map();
        this.menuElement_ = null;
        this.listeners = [];
        this.onBodyClickBound = () => undefined;
        this._menuUpdateComplete = null;
        this.renderReady = false;
        this.valueSetDirectly = false;
        this.validityTransform = null;
        this._validity = createValidityObj$1();
    }
    get items() {
        // memoize menuElement to prevent unnecessary querySelector calls.
        if (!this.menuElement_) {
            this.menuElement_ = this.menuElement;
        }
        if (this.menuElement_) {
            return this.menuElement_.items;
        }
        return [];
    }
    get selected() {
        const menuElement = this.menuElement;
        if (menuElement) {
            return menuElement.selected;
        }
        return null;
    }
    get index() {
        const menuElement = this.menuElement;
        if (menuElement) {
            return menuElement.index;
        }
        return -1;
    }
    get shouldRenderHelperText() {
        return !!this.helper || !!this.validationMessage;
    }
    get validity() {
        this._checkValidity(this.value);
        return this._validity;
    }
    render() {
        const classes = {
            'mdc-select--disabled': this.disabled,
            'mdc-select--no-label': !this.label,
            'mdc-select--filled': !this.outlined,
            'mdc-select--outlined': this.outlined,
            'mdc-select--with-leading-icon': !!this.icon,
            'mdc-select--required': this.required,
            'mdc-select--invalid': !this.isUiValid,
        };
        const menuClasses = {
            'mdc-select__menu--invalid': !this.isUiValid,
        };
        const describedby = this.shouldRenderHelperText ? 'helper-text' : undefined;
        return html$2 `
      <div
          class="mdc-select ${classMap(classes)}">
        <input
            class="formElement"
            .value=${this.value}
            hidden
            ?required=${this.required}>
        <!-- @ts-ignore -->
        <div class="mdc-select__anchor"
            aria-autocomplete="none"
            role="combobox"
            aria-expanded=${this.menuOpen}
            aria-invalid=${!this.isUiValid}
            aria-haspopup="listbox"
            aria-labelledby="label"
            aria-required=${this.required}
            aria-describedby=${ifDefined(describedby)}
            @click=${this.onClick}
            @focus=${this.onFocus}
            @blur=${this.onBlur}
            @keydown=${this.onKeydown}>
          ${this.renderRipple()}
          ${this.outlined ? this.renderOutline() : this.renderLabel()}
          ${this.renderLeadingIcon()}
          <span class="mdc-select__selected-text-container">
            <span class="mdc-select__selected-text">${this.selectedText}</span>
          </span>
          <span class="mdc-select__dropdown-icon">
            <svg
                class="mdc-select__dropdown-icon-graphic"
                viewBox="7 10 10 5"
                focusable="false">
              <polygon
                  class="mdc-select__dropdown-icon-inactive"
                  stroke="none"
                  fill-rule="evenodd"
                  points="7 10 12 15 17 10">
              </polygon>
              <polygon
                  class="mdc-select__dropdown-icon-active"
                  stroke="none"
                  fill-rule="evenodd"
                  points="7 15 12 10 17 15">
              </polygon>
            </svg>
          </span>
          ${this.renderLineRipple()}
        </div>
        <mwc-menu
            innerRole="listbox"
            wrapFocus
            class="mdc-select__menu mdc-menu mdc-menu-surface ${classMap(menuClasses)}"
            activatable
            .fullwidth=${!this.naturalMenuWidth}
            .open=${this.menuOpen}
            .anchor=${this.anchorElement}
            @selected=${this.onSelected}
            @opened=${this.onOpened}
            @closed=${this.onClosed}
            @items-updated=${this.onItemsUpdated}
            @keydown=${this.handleTypeahead}>
          <slot></slot>
        </mwc-menu>
      </div>
      ${this.renderHelperText()}`;
    }
    renderRipple() {
        if (this.outlined) {
            return nothing;
        }
        return html$2 `
      <span class="mdc-select__ripple"></span>
    `;
    }
    renderOutline() {
        if (!this.outlined) {
            return nothing;
        }
        return html$2 `
      <mwc-notched-outline
          .width=${this.outlineWidth}
          .open=${this.outlineOpen}
          class="mdc-notched-outline">
        ${this.renderLabel()}
      </mwc-notched-outline>`;
    }
    renderLabel() {
        if (!this.label) {
            return nothing;
        }
        return html$2 `
      <span
          .floatingLabelFoundation=${floatingLabel(this.label)}
          id="label">${this.label}</span>
    `;
    }
    renderLeadingIcon() {
        if (!this.icon) {
            return nothing;
        }
        return html$2 `<mwc-icon class="mdc-select__icon"><div>${this.icon}</div></mwc-icon>`;
    }
    renderLineRipple() {
        if (this.outlined) {
            return nothing;
        }
        return html$2 `
      <span .lineRippleFoundation=${lineRipple()}></span>
    `;
    }
    renderHelperText() {
        if (!this.shouldRenderHelperText) {
            return nothing;
        }
        const showValidationMessage = this.validationMessage && !this.isUiValid;
        const classes = {
            'mdc-select-helper-text--validation-msg': showValidationMessage,
        };
        return html$2 `
        <p
          class="mdc-select-helper-text ${classMap(classes)}"
          id="helper-text">${showValidationMessage ? this.validationMessage : this.helper}</p>`;
    }
    createAdapter() {
        return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { activateBottomLine: () => {
                if (this.lineRippleElement) {
                    this.lineRippleElement.lineRippleFoundation.activate();
                }
            }, deactivateBottomLine: () => {
                if (this.lineRippleElement) {
                    this.lineRippleElement.lineRippleFoundation.deactivate();
                }
            }, hasLabel: () => {
                return !!this.label;
            }, floatLabel: (shouldFloat) => {
                if (this.labelElement) {
                    this.labelElement.floatingLabelFoundation.float(shouldFloat);
                }
            }, getLabelWidth: () => {
                if (this.labelElement) {
                    return this.labelElement.floatingLabelFoundation.getWidth();
                }
                return 0;
            }, setLabelRequired: (isRequired) => {
                if (this.labelElement) {
                    this.labelElement.floatingLabelFoundation.setRequired(isRequired);
                }
            }, hasOutline: () => this.outlined, notchOutline: (labelWidth) => {
                const outlineElement = this.outlineElement;
                if (outlineElement && !this.outlineOpen) {
                    this.outlineWidth = labelWidth;
                    this.outlineOpen = true;
                }
            }, closeOutline: () => {
                if (this.outlineElement) {
                    this.outlineOpen = false;
                }
            }, setRippleCenter: (normalizedX) => {
                if (this.lineRippleElement) {
                    const foundation = this.lineRippleElement.lineRippleFoundation;
                    foundation.setRippleCenter(normalizedX);
                }
            }, notifyChange: async (value) => {
                if (!this.valueSetDirectly && value === this.value) {
                    return;
                }
                this.valueSetDirectly = false;
                this.value = value;
                await this.updateComplete;
                const ev = new Event('change', { bubbles: true });
                this.dispatchEvent(ev);
            }, setSelectedText: (value) => this.selectedText = value, isSelectAnchorFocused: () => {
                const selectAnchorElement = this.anchorElement;
                if (!selectAnchorElement) {
                    return false;
                }
                const rootNode = selectAnchorElement.getRootNode();
                return rootNode.activeElement === selectAnchorElement;
            }, getSelectAnchorAttr: (attr) => {
                const selectAnchorElement = this.anchorElement;
                if (!selectAnchorElement) {
                    return null;
                }
                return selectAnchorElement.getAttribute(attr);
            }, setSelectAnchorAttr: (attr, value) => {
                const selectAnchorElement = this.anchorElement;
                if (!selectAnchorElement) {
                    return;
                }
                selectAnchorElement.setAttribute(attr, value);
            }, removeSelectAnchorAttr: (attr) => {
                const selectAnchorElement = this.anchorElement;
                if (!selectAnchorElement) {
                    return;
                }
                selectAnchorElement.removeAttribute(attr);
            }, openMenu: () => {
                this.menuOpen = true;
            }, closeMenu: () => {
                this.menuOpen = false;
            }, addMenuClass: () => undefined, removeMenuClass: () => undefined, getAnchorElement: () => this.anchorElement, setMenuAnchorElement: () => {
                /* Handled by anchor directive */
            }, setMenuAnchorCorner: () => {
                const menuElement = this.menuElement;
                if (menuElement) {
                    menuElement.corner = 'BOTTOM_START';
                }
            }, setMenuWrapFocus: (wrapFocus) => {
                const menuElement = this.menuElement;
                if (menuElement) {
                    menuElement.wrapFocus = wrapFocus;
                }
            }, focusMenuItemAtIndex: (index) => {
                const menuElement = this.menuElement;
                if (!menuElement) {
                    return;
                }
                const element = menuElement.items[index];
                if (!element) {
                    return;
                }
                element.focus();
            }, getMenuItemCount: () => {
                const menuElement = this.menuElement;
                if (menuElement) {
                    return menuElement.items.length;
                }
                return 0;
            }, getMenuItemValues: () => {
                const menuElement = this.menuElement;
                if (!menuElement) {
                    return [];
                }
                const items = menuElement.items;
                return items.map((item) => item.value);
            }, getMenuItemTextAtIndex: (index) => {
                const menuElement = this.menuElement;
                if (!menuElement) {
                    return '';
                }
                const element = menuElement.items[index];
                if (!element) {
                    return '';
                }
                return element.text;
            }, getSelectedIndex: () => this.index, setSelectedIndex: () => undefined, isTypeaheadInProgress: () => isTypingInProgress(this.typeaheadState), typeaheadMatchItem: (nextChar, startingIndex) => {
                if (!this.menuElement) {
                    return -1;
                }
                const opts = {
                    focusItemAtIndex: (index) => {
                        this.menuElement.focusItemAtIndex(index);
                    },
                    focusedItemIndex: startingIndex ?
                        startingIndex :
                        this.menuElement.getFocusedItemIndex(),
                    nextChar,
                    sortedIndexByFirstChar: this.sortedIndexByFirstChar,
                    skipFocus: false,
                    isItemAtIndexDisabled: (index) => this.items[index].disabled,
                };
                const index = matchItem(opts, this.typeaheadState);
                if (index !== -1) {
                    this.select(index);
                }
                return index;
            } });
    }
    checkValidity() {
        const isValid = this._checkValidity(this.value);
        if (!isValid) {
            const invalidEvent = new Event('invalid', { bubbles: false, cancelable: true });
            this.dispatchEvent(invalidEvent);
        }
        return isValid;
    }
    reportValidity() {
        const isValid = this.checkValidity();
        this.isUiValid = isValid;
        return isValid;
    }
    _checkValidity(value) {
        const nativeValidity = this.formElement.validity;
        let validity = createValidityObj$1(nativeValidity);
        if (this.validityTransform) {
            const customValidity = this.validityTransform(value, validity);
            validity = Object.assign(Object.assign({}, validity), customValidity);
        }
        this._validity = validity;
        return this._validity.valid;
    }
    setCustomValidity(message) {
        this.validationMessage = message;
        this.formElement.setCustomValidity(message);
    }
    async _getUpdateComplete() {
        await this._menuUpdateComplete;
        await super._getUpdateComplete();
    }
    async firstUpdated() {
        const menuElement = this.menuElement;
        if (menuElement) {
            this._menuUpdateComplete = menuElement.updateComplete;
            await this._menuUpdateComplete;
        }
        super.firstUpdated();
        this.mdcFoundation.isValid = () => true;
        this.mdcFoundation.setValid = () => undefined;
        this.mdcFoundation.setDisabled(this.disabled);
        if (this.validateOnInitialRender) {
            this.reportValidity();
        }
        // Select an option based on init value
        if (!this.selected) {
            if (!this.items.length && this.slotElement &&
                this.slotElement.assignedNodes({ flatten: true }).length) {
                // Shady DOM initial render fix
                await new Promise((res) => requestAnimationFrame(res));
                await this.layout();
            }
            const hasEmptyFirstOption = this.items.length && this.items[0].value === '';
            if (!this.value && hasEmptyFirstOption) {
                this.select(0);
                return;
            }
            this.selectByValue(this.value);
        }
        this.sortedIndexByFirstChar = initSortedIndex(this.items.length, (index) => this.items[index].text);
        this.renderReady = true;
    }
    onItemsUpdated() {
        this.sortedIndexByFirstChar = initSortedIndex(this.items.length, (index) => this.items[index].text);
    }
    select(index) {
        const menuElement = this.menuElement;
        if (menuElement) {
            menuElement.select(index);
        }
    }
    selectByValue(value) {
        let indexToSelect = -1;
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.value === value) {
                indexToSelect = i;
                break;
            }
        }
        this.valueSetDirectly = true;
        this.select(indexToSelect);
        this.mdcFoundation.handleChange();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        for (const listener of this.listeners) {
            listener.target.removeEventListener(listener.name, listener.cb);
        }
    }
    focus() {
        const focusEvt = new CustomEvent('focus');
        const selectAnchorElement = this.anchorElement;
        if (selectAnchorElement) {
            selectAnchorElement.dispatchEvent(focusEvt);
            selectAnchorElement.focus();
        }
    }
    blur() {
        const focusEvt = new CustomEvent('blur');
        const selectAnchorElement = this.anchorElement;
        if (selectAnchorElement) {
            selectAnchorElement.dispatchEvent(focusEvt);
            selectAnchorElement.blur();
        }
    }
    onFocus() {
        if (this.mdcFoundation) {
            this.mdcFoundation.handleFocus();
        }
    }
    onBlur() {
        if (this.mdcFoundation) {
            this.mdcFoundation.handleBlur();
        }
        const menuElement = this.menuElement;
        if (menuElement && !menuElement.open) {
            this.reportValidity();
        }
    }
    onClick(evt) {
        if (this.mdcFoundation) {
            this.focus();
            const targetClientRect = evt.target.getBoundingClientRect();
            let xCoord = 0;
            if ('touches' in evt) {
                xCoord = evt.touches[0].clientX;
            }
            else {
                xCoord = evt.clientX;
            }
            const normalizedX = xCoord - targetClientRect.left;
            this.mdcFoundation.handleClick(normalizedX);
        }
    }
    onKeydown(evt) {
        const arrowUp = normalizeKey(evt) === KEY.ARROW_UP;
        const arrowDown = normalizeKey(evt) === KEY.ARROW_DOWN;
        if (arrowDown || arrowUp) {
            const shouldSelectNextItem = arrowUp && this.index > 0;
            const shouldSelectPrevItem = arrowDown && this.index < this.items.length - 1;
            if (shouldSelectNextItem) {
                this.select(this.index - 1);
            }
            else if (shouldSelectPrevItem) {
                this.select(this.index + 1);
            }
            evt.preventDefault();
            this.mdcFoundation.openMenu();
            return;
        }
        this.mdcFoundation.handleKeydown(evt);
    }
    // must capture to run before list foundation captures event
    handleTypeahead(event) {
        if (!this.menuElement) {
            return;
        }
        const focusedItemIndex = this.menuElement.getFocusedItemIndex();
        const target = isNodeElement(event.target) ?
            event.target :
            null;
        const isTargetListItem = target ? target.hasAttribute('mwc-list-item') : false;
        const opts = {
            event,
            focusItemAtIndex: (index) => {
                this.menuElement.focusItemAtIndex(index);
            },
            focusedItemIndex,
            isTargetListItem,
            sortedIndexByFirstChar: this.sortedIndexByFirstChar,
            isItemAtIndexDisabled: (index) => this.items[index].disabled,
        };
        handleKeydown(opts, this.typeaheadState);
    }
    async onSelected(event) {
        if (!this.mdcFoundation) {
            await this.updateComplete;
        }
        this.mdcFoundation.handleMenuItemAction(event.detail.index);
        const item = this.items[event.detail.index];
        if (item) {
            this.value = item.value;
        }
    }
    onOpened() {
        if (this.mdcFoundation) {
            this.menuOpen = true;
            this.mdcFoundation.handleMenuOpened();
        }
    }
    onClosed() {
        if (this.mdcFoundation) {
            this.menuOpen = false;
            this.mdcFoundation.handleMenuClosed();
        }
    }
    async layout(updateItems = true) {
        if (this.mdcFoundation) {
            this.mdcFoundation.layout();
        }
        await this.updateComplete;
        const menuElement = this.menuElement;
        if (menuElement) {
            menuElement.layout(updateItems);
        }
        const labelElement = this.labelElement;
        if (!labelElement) {
            this.outlineOpen = false;
            return;
        }
        const shouldFloat = !!this.label && !!this.value;
        labelElement.floatingLabelFoundation.float(shouldFloat);
        if (!this.outlined) {
            return;
        }
        this.outlineOpen = shouldFloat;
        await this.updateComplete;
        /* When the textfield automatically notches due to a value and label
         * being defined, the textfield may be set to `display: none` by the user.
         * this means that the notch is of size 0px. We provide this function so
         * that the user may manually resize the notch to the floated label's
         * width.
         */
        const labelWidth = labelElement.floatingLabelFoundation.getWidth();
        if (this.outlineOpen) {
            this.outlineWidth = labelWidth;
        }
    }
}
__decorate([
    query('.mdc-select')
], SelectBase.prototype, "mdcRoot", void 0);
__decorate([
    query('.formElement')
], SelectBase.prototype, "formElement", void 0);
__decorate([
    query('slot')
], SelectBase.prototype, "slotElement", void 0);
__decorate([
    query('select')
], SelectBase.prototype, "nativeSelectElement", void 0);
__decorate([
    query('input')
], SelectBase.prototype, "nativeInputElement", void 0);
__decorate([
    query('.mdc-line-ripple')
], SelectBase.prototype, "lineRippleElement", void 0);
__decorate([
    query('.mdc-floating-label')
], SelectBase.prototype, "labelElement", void 0);
__decorate([
    query('mwc-notched-outline')
], SelectBase.prototype, "outlineElement", void 0);
__decorate([
    query('.mdc-menu')
], SelectBase.prototype, "menuElement", void 0);
__decorate([
    query('.mdc-select__anchor')
], SelectBase.prototype, "anchorElement", void 0);
__decorate([
    property({ type: Boolean, attribute: 'disabled', reflect: true }),
    observer(function (value) {
        if (this.renderReady) {
            this.mdcFoundation.setDisabled(value);
        }
    })
], SelectBase.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean }),
    observer(function (_newVal, oldVal) {
        if (oldVal !== undefined && this.outlined !== oldVal) {
            this.layout(false);
        }
    })
], SelectBase.prototype, "outlined", void 0);
__decorate([
    property({ type: String }),
    observer(function (_newVal, oldVal) {
        if (oldVal !== undefined && this.label !== oldVal) {
            this.layout(false);
        }
    })
], SelectBase.prototype, "label", void 0);
__decorate([
    property({ type: Boolean })
], SelectBase.prototype, "outlineOpen", void 0);
__decorate([
    property({ type: Number })
], SelectBase.prototype, "outlineWidth", void 0);
__decorate([
    property({ type: String }),
    observer(function (value) {
        if (this.mdcFoundation) {
            const initialization = this.selected === null && !!value;
            const valueSetByUser = this.selected && this.selected.value !== value;
            if (initialization || valueSetByUser) {
                this.selectByValue(value);
            }
            this.reportValidity();
        }
    })
], SelectBase.prototype, "value", void 0);
__decorate([
    property({ type: String })
], SelectBase.prototype, "selectedText", void 0);
__decorate([
    property({ type: String })
], SelectBase.prototype, "icon", void 0);
__decorate([
    property({ type: Boolean })
], SelectBase.prototype, "menuOpen", void 0);
__decorate([
    property({ type: String })
], SelectBase.prototype, "helper", void 0);
__decorate([
    property({ type: Boolean })
], SelectBase.prototype, "validateOnInitialRender", void 0);
__decorate([
    property({ type: String })
], SelectBase.prototype, "validationMessage", void 0);
__decorate([
    property({ type: Boolean })
], SelectBase.prototype, "required", void 0);
__decorate([
    property({ type: Boolean })
], SelectBase.prototype, "naturalMenuWidth", void 0);
__decorate([
    property({ type: Boolean })
], SelectBase.prototype, "isUiValid", void 0);
__decorate([
    eventOptions({ capture: true })
], SelectBase.prototype, "handleTypeahead", null);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$9 = css `.mdc-floating-label{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-subtitle1-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:1rem;font-size:var(--mdc-typography-subtitle1-font-size, 1rem);font-weight:400;font-weight:var(--mdc-typography-subtitle1-font-weight, 400);letter-spacing:0.009375em;letter-spacing:var(--mdc-typography-subtitle1-letter-spacing, 0.009375em);text-decoration:inherit;text-decoration:var(--mdc-typography-subtitle1-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-subtitle1-text-transform, inherit);position:absolute;left:0;transform-origin:left top;line-height:1.15rem;text-align:left;text-overflow:ellipsis;white-space:nowrap;cursor:text;overflow:hidden;will-change:transform;transition:transform 150ms cubic-bezier(0.4, 0, 0.2, 1),color 150ms cubic-bezier(0.4, 0, 0.2, 1)}[dir=rtl] .mdc-floating-label,.mdc-floating-label[dir=rtl]{right:0;left:auto;transform-origin:right top;text-align:right}.mdc-floating-label--float-above{cursor:auto}.mdc-floating-label--required::after{margin-left:1px;margin-right:0px;content:"*"}[dir=rtl] .mdc-floating-label--required::after,.mdc-floating-label--required[dir=rtl]::after{margin-left:0;margin-right:1px}.mdc-floating-label--float-above{transform:translateY(-106%) scale(0.75)}.mdc-floating-label--shake{animation:mdc-floating-label-shake-float-above-standard 250ms 1}@keyframes mdc-floating-label-shake-float-above-standard{0%{transform:translateX(calc(0 - 0%)) translateY(-106%) scale(0.75)}33%{animation-timing-function:cubic-bezier(0.5, 0, 0.701732, 0.495819);transform:translateX(calc(4% - 0%)) translateY(-106%) scale(0.75)}66%{animation-timing-function:cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);transform:translateX(calc(-4% - 0%)) translateY(-106%) scale(0.75)}100%{transform:translateX(calc(0 - 0%)) translateY(-106%) scale(0.75)}}@keyframes mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}.mdc-line-ripple::before,.mdc-line-ripple::after{position:absolute;bottom:0;left:0;width:100%;border-bottom-style:solid;content:""}.mdc-line-ripple::before{border-bottom-width:1px;z-index:1}.mdc-line-ripple::after{transform:scaleX(0);border-bottom-width:2px;opacity:0;z-index:2}.mdc-line-ripple::after{transition:transform 180ms cubic-bezier(0.4, 0, 0.2, 1),opacity 180ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-line-ripple--active::after{transform:scaleX(1);opacity:1}.mdc-line-ripple--deactivating::after{opacity:0}.mdc-notched-outline{display:flex;position:absolute;top:0;right:0;left:0;box-sizing:border-box;width:100%;max-width:100%;height:100%;text-align:left;pointer-events:none}[dir=rtl] .mdc-notched-outline,.mdc-notched-outline[dir=rtl]{text-align:right}.mdc-notched-outline__leading,.mdc-notched-outline__notch,.mdc-notched-outline__trailing{box-sizing:border-box;height:100%;border-top:1px solid;border-bottom:1px solid;pointer-events:none}.mdc-notched-outline__leading{border-left:1px solid;border-right:none;width:12px}[dir=rtl] .mdc-notched-outline__leading,.mdc-notched-outline__leading[dir=rtl]{border-left:none;border-right:1px solid}.mdc-notched-outline__trailing{border-left:none;border-right:1px solid;flex-grow:1}[dir=rtl] .mdc-notched-outline__trailing,.mdc-notched-outline__trailing[dir=rtl]{border-left:1px solid;border-right:none}.mdc-notched-outline__notch{flex:0 0 auto;width:auto;max-width:calc(100% - 12px * 2)}.mdc-notched-outline .mdc-floating-label{display:inline-block;position:relative;max-width:100%}.mdc-notched-outline .mdc-floating-label--float-above{text-overflow:clip}.mdc-notched-outline--upgraded .mdc-floating-label--float-above{max-width:calc(100% / 0.75)}.mdc-notched-outline--notched .mdc-notched-outline__notch{padding-left:0;padding-right:8px;border-top:none}[dir=rtl] .mdc-notched-outline--notched .mdc-notched-outline__notch,.mdc-notched-outline--notched .mdc-notched-outline__notch[dir=rtl]{padding-left:8px;padding-right:0}.mdc-notched-outline--no-label .mdc-notched-outline__notch{display:none}.mdc-select{display:inline-flex;position:relative}.mdc-select:not(.mdc-select--disabled) .mdc-select__selected-text{color:rgba(0, 0, 0, 0.87)}.mdc-select.mdc-select--disabled .mdc-select__selected-text{color:rgba(0, 0, 0, 0.38)}.mdc-select:not(.mdc-select--disabled) .mdc-floating-label{color:rgba(0, 0, 0, 0.6)}.mdc-select:not(.mdc-select--disabled).mdc-select--focused .mdc-floating-label{color:rgba(98, 0, 238, 0.87)}.mdc-select.mdc-select--disabled .mdc-floating-label{color:rgba(0, 0, 0, 0.38)}.mdc-select:not(.mdc-select--disabled) .mdc-select__dropdown-icon{fill:rgba(0, 0, 0, 0.54)}.mdc-select:not(.mdc-select--disabled).mdc-select--focused .mdc-select__dropdown-icon{fill:#6200ee;fill:var(--mdc-theme-primary, #6200ee)}.mdc-select.mdc-select--disabled .mdc-select__dropdown-icon{fill:rgba(0, 0, 0, 0.38)}.mdc-select:not(.mdc-select--disabled)+.mdc-select-helper-text{color:rgba(0, 0, 0, 0.6)}.mdc-select.mdc-select--disabled+.mdc-select-helper-text{color:rgba(0, 0, 0, 0.38)}.mdc-select:not(.mdc-select--disabled) .mdc-select__icon{color:rgba(0, 0, 0, 0.54)}.mdc-select.mdc-select--disabled .mdc-select__icon{color:rgba(0, 0, 0, 0.38)}@media screen and (-ms-high-contrast: active){.mdc-select.mdc-select--disabled .mdc-select__selected-text{color:GrayText}.mdc-select.mdc-select--disabled .mdc-select__dropdown-icon{fill:red}.mdc-select.mdc-select--disabled .mdc-floating-label{color:GrayText}.mdc-select.mdc-select--disabled .mdc-line-ripple::before{border-bottom-color:GrayText}.mdc-select.mdc-select--disabled .mdc-notched-outline__leading,.mdc-select.mdc-select--disabled .mdc-notched-outline__notch,.mdc-select.mdc-select--disabled .mdc-notched-outline__trailing{border-color:GrayText}.mdc-select.mdc-select--disabled .mdc-select__icon{color:GrayText}.mdc-select.mdc-select--disabled+.mdc-select-helper-text{color:GrayText}}.mdc-select .mdc-floating-label{top:50%;transform:translateY(-50%);pointer-events:none}.mdc-select .mdc-select__anchor{padding-left:16px;padding-right:0}[dir=rtl] .mdc-select .mdc-select__anchor,.mdc-select .mdc-select__anchor[dir=rtl]{padding-left:0;padding-right:16px}.mdc-select.mdc-select--with-leading-icon .mdc-select__anchor{padding-left:0;padding-right:0}[dir=rtl] .mdc-select.mdc-select--with-leading-icon .mdc-select__anchor,.mdc-select.mdc-select--with-leading-icon .mdc-select__anchor[dir=rtl]{padding-left:0;padding-right:0}.mdc-select .mdc-select__icon{width:24px;height:24px;font-size:24px}.mdc-select .mdc-select__dropdown-icon{width:24px;height:24px}.mdc-select .mdc-select__menu .mdc-list-item{padding-left:16px;padding-right:16px}[dir=rtl] .mdc-select .mdc-select__menu .mdc-list-item,.mdc-select .mdc-select__menu .mdc-list-item[dir=rtl]{padding-left:16px;padding-right:16px}.mdc-select .mdc-select__menu .mdc-list-item__graphic{margin-left:0;margin-right:12px}[dir=rtl] .mdc-select .mdc-select__menu .mdc-list-item__graphic,.mdc-select .mdc-select__menu .mdc-list-item__graphic[dir=rtl]{margin-left:12px;margin-right:0}.mdc-select__dropdown-icon{margin-left:12px;margin-right:12px;display:inline-flex;position:relative;align-self:center;align-items:center;justify-content:center;flex-shrink:0;pointer-events:none}.mdc-select__dropdown-icon .mdc-select__dropdown-icon-active,.mdc-select__dropdown-icon .mdc-select__dropdown-icon-inactive{position:absolute;top:0;left:0}.mdc-select__dropdown-icon .mdc-select__dropdown-icon-graphic{width:41.6666666667%;height:20.8333333333%}.mdc-select__dropdown-icon .mdc-select__dropdown-icon-inactive{opacity:1;transition:opacity 75ms linear 75ms}.mdc-select__dropdown-icon .mdc-select__dropdown-icon-active{opacity:0;transition:opacity 75ms linear}[dir=rtl] .mdc-select__dropdown-icon,.mdc-select__dropdown-icon[dir=rtl]{margin-left:12px;margin-right:12px}.mdc-select--activated .mdc-select__dropdown-icon .mdc-select__dropdown-icon-inactive{opacity:0;transition:opacity 49.5ms linear}.mdc-select--activated .mdc-select__dropdown-icon .mdc-select__dropdown-icon-active{opacity:1;transition:opacity 100.5ms linear 49.5ms}.mdc-select__anchor{width:200px;min-width:0;flex:1 1 auto;position:relative;box-sizing:border-box;overflow:hidden;outline:none;cursor:pointer}.mdc-select__anchor .mdc-floating-label--float-above{transform:translateY(-106%) scale(0.75)}.mdc-select__selected-text-container{display:flex;appearance:none;pointer-events:none;box-sizing:border-box;width:auto;min-width:0;flex-grow:1;height:28px;border:none;outline:none;padding:0;background-color:transparent;color:inherit}.mdc-select__selected-text{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-subtitle1-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:1rem;font-size:var(--mdc-typography-subtitle1-font-size, 1rem);line-height:1.75rem;line-height:var(--mdc-typography-subtitle1-line-height, 1.75rem);font-weight:400;font-weight:var(--mdc-typography-subtitle1-font-weight, 400);letter-spacing:0.009375em;letter-spacing:var(--mdc-typography-subtitle1-letter-spacing, 0.009375em);text-decoration:inherit;text-decoration:var(--mdc-typography-subtitle1-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-subtitle1-text-transform, inherit);text-overflow:ellipsis;white-space:nowrap;overflow:hidden;display:block;width:100%;text-align:left}[dir=rtl] .mdc-select__selected-text,.mdc-select__selected-text[dir=rtl]{text-align:right}.mdc-select--invalid:not(.mdc-select--disabled) .mdc-floating-label{color:#b00020;color:var(--mdc-theme-error, #b00020)}.mdc-select--invalid:not(.mdc-select--disabled).mdc-select--focused .mdc-floating-label{color:#b00020;color:var(--mdc-theme-error, #b00020)}.mdc-select--invalid:not(.mdc-select--disabled).mdc-select--invalid+.mdc-select-helper-text--validation-msg{color:#b00020;color:var(--mdc-theme-error, #b00020)}.mdc-select--invalid:not(.mdc-select--disabled) .mdc-select__dropdown-icon{fill:#b00020;fill:var(--mdc-theme-error, #b00020)}.mdc-select--invalid:not(.mdc-select--disabled).mdc-select--focused .mdc-select__dropdown-icon{fill:#b00020;fill:var(--mdc-theme-error, #b00020)}.mdc-select--disabled{cursor:default;pointer-events:none}.mdc-select--with-leading-icon .mdc-select__menu .mdc-list-item{padding-left:12px;padding-right:12px}[dir=rtl] .mdc-select--with-leading-icon .mdc-select__menu .mdc-list-item,.mdc-select--with-leading-icon .mdc-select__menu .mdc-list-item[dir=rtl]{padding-left:12px;padding-right:12px}.mdc-select__menu .mdc-list .mdc-select__icon{margin-left:0;margin-right:0}[dir=rtl] .mdc-select__menu .mdc-list .mdc-select__icon,.mdc-select__menu .mdc-list .mdc-select__icon[dir=rtl]{margin-left:0;margin-right:0}.mdc-select__menu .mdc-list .mdc-list-item--selected,.mdc-select__menu .mdc-list .mdc-list-item--activated{color:#000;color:var(--mdc-theme-on-surface, #000)}.mdc-select__menu .mdc-list .mdc-list-item--selected .mdc-list-item__graphic,.mdc-select__menu .mdc-list .mdc-list-item--activated .mdc-list-item__graphic{color:#000;color:var(--mdc-theme-on-surface, #000)}.mdc-select--filled .mdc-select__anchor{height:56px;display:flex;align-items:baseline}.mdc-select--filled .mdc-select__anchor::before{display:inline-block;width:0;height:40px;content:"";vertical-align:0}.mdc-select--filled.mdc-select--no-label .mdc-select__anchor .mdc-select__selected-text::before{content:"​"}.mdc-select--filled.mdc-select--no-label .mdc-select__anchor .mdc-select__selected-text-container{height:100%;display:inline-flex;align-items:center}.mdc-select--filled.mdc-select--no-label .mdc-select__anchor::before{display:none}.mdc-select--filled .mdc-select__anchor{border-top-left-radius:4px;border-top-left-radius:var(--mdc-shape-small, 4px);border-top-right-radius:4px;border-top-right-radius:var(--mdc-shape-small, 4px);border-bottom-right-radius:0;border-bottom-left-radius:0}.mdc-select--filled:not(.mdc-select--disabled) .mdc-select__anchor{background-color:whitesmoke}.mdc-select--filled.mdc-select--disabled .mdc-select__anchor{background-color:#fafafa}.mdc-select--filled:not(.mdc-select--disabled) .mdc-line-ripple::before{border-bottom-color:rgba(0, 0, 0, 0.42)}.mdc-select--filled:not(.mdc-select--disabled):hover .mdc-line-ripple::before{border-bottom-color:rgba(0, 0, 0, 0.87)}.mdc-select--filled:not(.mdc-select--disabled) .mdc-line-ripple::after{border-bottom-color:#6200ee;border-bottom-color:var(--mdc-theme-primary, #6200ee)}.mdc-select--filled.mdc-select--disabled .mdc-line-ripple::before{border-bottom-color:rgba(0, 0, 0, 0.06)}.mdc-select--filled .mdc-floating-label{max-width:calc(100% - 64px)}.mdc-select--filled .mdc-floating-label--float-above{max-width:calc(100% / 0.75 - 64px / 0.75)}.mdc-select--filled .mdc-menu-surface--is-open-below{border-top-left-radius:0px;border-top-right-radius:0px}.mdc-select--filled.mdc-select--focused.mdc-line-ripple::after{transform:scale(1, 2);opacity:1}.mdc-select--filled .mdc-floating-label{left:16px;right:initial}[dir=rtl] .mdc-select--filled .mdc-floating-label,.mdc-select--filled .mdc-floating-label[dir=rtl]{left:initial;right:16px}.mdc-select--filled.mdc-select--with-leading-icon .mdc-floating-label{left:48px;right:initial}[dir=rtl] .mdc-select--filled.mdc-select--with-leading-icon .mdc-floating-label,.mdc-select--filled.mdc-select--with-leading-icon .mdc-floating-label[dir=rtl]{left:initial;right:48px}.mdc-select--filled.mdc-select--with-leading-icon .mdc-floating-label{max-width:calc(100% - 96px)}.mdc-select--filled.mdc-select--with-leading-icon .mdc-floating-label--float-above{max-width:calc(100% / 0.75 - 96px / 0.75)}.mdc-select--invalid:not(.mdc-select--disabled) .mdc-line-ripple::before{border-bottom-color:#b00020;border-bottom-color:var(--mdc-theme-error, #b00020)}.mdc-select--invalid:not(.mdc-select--disabled):hover .mdc-line-ripple::before{border-bottom-color:#b00020;border-bottom-color:var(--mdc-theme-error, #b00020)}.mdc-select--invalid:not(.mdc-select--disabled) .mdc-line-ripple::after{border-bottom-color:#b00020;border-bottom-color:var(--mdc-theme-error, #b00020)}.mdc-select--outlined{border:none}.mdc-select--outlined .mdc-select__anchor{height:56px}.mdc-select--outlined .mdc-select__anchor .mdc-floating-label--float-above{transform:translateY(-37.25px) scale(1)}.mdc-select--outlined .mdc-select__anchor .mdc-floating-label--float-above{font-size:.75rem}.mdc-select--outlined .mdc-select__anchor.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-select--outlined .mdc-select__anchor .mdc-notched-outline--upgraded .mdc-floating-label--float-above{transform:translateY(-34.75px) scale(0.75)}.mdc-select--outlined .mdc-select__anchor.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-select--outlined .mdc-select__anchor .mdc-notched-outline--upgraded .mdc-floating-label--float-above{font-size:1rem}.mdc-select--outlined .mdc-select__anchor .mdc-floating-label--shake{animation:mdc-floating-label-shake-float-above-select-outlined-56px 250ms 1}@keyframes mdc-floating-label-shake-float-above-select-outlined-56px{0%{transform:translateX(calc(0 - 0%)) translateY(-34.75px) scale(0.75)}33%{animation-timing-function:cubic-bezier(0.5, 0, 0.701732, 0.495819);transform:translateX(calc(4% - 0%)) translateY(-34.75px) scale(0.75)}66%{animation-timing-function:cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);transform:translateX(calc(-4% - 0%)) translateY(-34.75px) scale(0.75)}100%{transform:translateX(calc(0 - 0%)) translateY(-34.75px) scale(0.75)}}.mdc-select--outlined .mdc-notched-outline .mdc-notched-outline__leading{border-top-left-radius:4px;border-top-left-radius:var(--mdc-shape-small, 4px);border-top-right-radius:0;border-bottom-right-radius:0;border-bottom-left-radius:4px;border-bottom-left-radius:var(--mdc-shape-small, 4px)}[dir=rtl] .mdc-select--outlined .mdc-notched-outline .mdc-notched-outline__leading,.mdc-select--outlined .mdc-notched-outline .mdc-notched-outline__leading[dir=rtl]{border-top-left-radius:0;border-top-right-radius:4px;border-top-right-radius:var(--mdc-shape-small, 4px);border-bottom-right-radius:4px;border-bottom-right-radius:var(--mdc-shape-small, 4px);border-bottom-left-radius:0}@supports(top: max(0%)){.mdc-select--outlined .mdc-notched-outline .mdc-notched-outline__leading{width:max(12px, var(--mdc-shape-small, 4px))}}@supports(top: max(0%)){.mdc-select--outlined .mdc-notched-outline .mdc-notched-outline__notch{max-width:calc(100% - max(12px, var(--mdc-shape-small, 4px)) * 2)}}.mdc-select--outlined .mdc-notched-outline .mdc-notched-outline__trailing{border-top-left-radius:0;border-top-right-radius:4px;border-top-right-radius:var(--mdc-shape-small, 4px);border-bottom-right-radius:4px;border-bottom-right-radius:var(--mdc-shape-small, 4px);border-bottom-left-radius:0}[dir=rtl] .mdc-select--outlined .mdc-notched-outline .mdc-notched-outline__trailing,.mdc-select--outlined .mdc-notched-outline .mdc-notched-outline__trailing[dir=rtl]{border-top-left-radius:4px;border-top-left-radius:var(--mdc-shape-small, 4px);border-top-right-radius:0;border-bottom-right-radius:0;border-bottom-left-radius:4px;border-bottom-left-radius:var(--mdc-shape-small, 4px)}@supports(top: max(0%)){.mdc-select--outlined .mdc-select__anchor{padding-left:max(16px, calc(var(--mdc-shape-small, 4px) + 4px))}}[dir=rtl] .mdc-select--outlined .mdc-select__anchor,.mdc-select--outlined .mdc-select__anchor[dir=rtl]{padding-left:0}@supports(top: max(0%)){[dir=rtl] .mdc-select--outlined .mdc-select__anchor,.mdc-select--outlined .mdc-select__anchor[dir=rtl]{padding-right:max(16px, calc(var(--mdc-shape-small, 4px) + 4px))}}@supports(top: max(0%)){.mdc-select--outlined+.mdc-select-helper-text{margin-left:max(16px, calc(var(--mdc-shape-small, 4px) + 4px))}}[dir=rtl] .mdc-select--outlined+.mdc-select-helper-text,.mdc-select--outlined+.mdc-select-helper-text[dir=rtl]{margin-left:0}@supports(top: max(0%)){[dir=rtl] .mdc-select--outlined+.mdc-select-helper-text,.mdc-select--outlined+.mdc-select-helper-text[dir=rtl]{margin-right:max(16px, calc(var(--mdc-shape-small, 4px) + 4px))}}.mdc-select--outlined:not(.mdc-select--disabled) .mdc-select__anchor{background-color:transparent}.mdc-select--outlined.mdc-select--disabled .mdc-select__anchor{background-color:transparent}.mdc-select--outlined:not(.mdc-select--disabled) .mdc-notched-outline__leading,.mdc-select--outlined:not(.mdc-select--disabled) .mdc-notched-outline__notch,.mdc-select--outlined:not(.mdc-select--disabled) .mdc-notched-outline__trailing{border-color:rgba(0, 0, 0, 0.38)}.mdc-select--outlined:not(.mdc-select--disabled):not(.mdc-select--focused) .mdc-select__anchor:hover .mdc-notched-outline .mdc-notched-outline__leading,.mdc-select--outlined:not(.mdc-select--disabled):not(.mdc-select--focused) .mdc-select__anchor:hover .mdc-notched-outline .mdc-notched-outline__notch,.mdc-select--outlined:not(.mdc-select--disabled):not(.mdc-select--focused) .mdc-select__anchor:hover .mdc-notched-outline .mdc-notched-outline__trailing{border-color:rgba(0, 0, 0, 0.87)}.mdc-select--outlined:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline .mdc-notched-outline__leading,.mdc-select--outlined:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline .mdc-notched-outline__notch,.mdc-select--outlined:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline .mdc-notched-outline__trailing{border-width:2px}.mdc-select--outlined:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline .mdc-notched-outline__leading,.mdc-select--outlined:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline .mdc-notched-outline__notch,.mdc-select--outlined:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline .mdc-notched-outline__trailing{border-color:#6200ee;border-color:var(--mdc-theme-primary, #6200ee)}.mdc-select--outlined.mdc-select--disabled .mdc-notched-outline__leading,.mdc-select--outlined.mdc-select--disabled .mdc-notched-outline__notch,.mdc-select--outlined.mdc-select--disabled .mdc-notched-outline__trailing{border-color:rgba(0, 0, 0, 0.06)}.mdc-select--outlined .mdc-select__anchor :not(.mdc-notched-outline--notched) .mdc-notched-outline__notch{max-width:calc(100% - 60px)}.mdc-select--outlined .mdc-select__anchor{display:flex;align-items:baseline;overflow:visible}.mdc-select--outlined .mdc-select__anchor .mdc-floating-label--shake{animation:mdc-floating-label-shake-float-above-select-outlined 250ms 1}.mdc-select--outlined .mdc-select__anchor .mdc-floating-label--float-above{transform:translateY(-37.25px) scale(1)}.mdc-select--outlined .mdc-select__anchor .mdc-floating-label--float-above{font-size:.75rem}.mdc-select--outlined .mdc-select__anchor.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-select--outlined .mdc-select__anchor .mdc-notched-outline--upgraded .mdc-floating-label--float-above{transform:translateY(-34.75px) scale(0.75)}.mdc-select--outlined .mdc-select__anchor.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-select--outlined .mdc-select__anchor .mdc-notched-outline--upgraded .mdc-floating-label--float-above{font-size:1rem}.mdc-select--outlined .mdc-select__anchor .mdc-notched-outline--notched .mdc-notched-outline__notch{padding-top:1px}.mdc-select--outlined .mdc-select__anchor .mdc-select__selected-text::before{content:"​"}.mdc-select--outlined .mdc-select__anchor .mdc-select__selected-text-container{height:100%;display:inline-flex;align-items:center}.mdc-select--outlined .mdc-select__anchor::before{display:none}.mdc-select--outlined .mdc-select__selected-text-container{display:flex;border:none;z-index:1;background-color:transparent}.mdc-select--outlined .mdc-select__icon{z-index:2}.mdc-select--outlined .mdc-floating-label{line-height:1.15rem;left:4px;right:initial}[dir=rtl] .mdc-select--outlined .mdc-floating-label,.mdc-select--outlined .mdc-floating-label[dir=rtl]{left:initial;right:4px}.mdc-select--outlined.mdc-select--focused .mdc-notched-outline--notched .mdc-notched-outline__notch{padding-top:2px}.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled) .mdc-notched-outline__leading,.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled) .mdc-notched-outline__notch,.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled) .mdc-notched-outline__trailing{border-color:#b00020;border-color:var(--mdc-theme-error, #b00020)}.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled):not(.mdc-select--focused) .mdc-select__anchor:hover .mdc-notched-outline .mdc-notched-outline__leading,.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled):not(.mdc-select--focused) .mdc-select__anchor:hover .mdc-notched-outline .mdc-notched-outline__notch,.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled):not(.mdc-select--focused) .mdc-select__anchor:hover .mdc-notched-outline .mdc-notched-outline__trailing{border-color:#b00020;border-color:var(--mdc-theme-error, #b00020)}.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline .mdc-notched-outline__leading,.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline .mdc-notched-outline__notch,.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline .mdc-notched-outline__trailing{border-width:2px}.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline .mdc-notched-outline__leading,.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline .mdc-notched-outline__notch,.mdc-select--outlined.mdc-select--invalid:not(.mdc-select--disabled).mdc-select--focused .mdc-notched-outline .mdc-notched-outline__trailing{border-color:#b00020;border-color:var(--mdc-theme-error, #b00020)}.mdc-select--outlined.mdc-select--with-leading-icon .mdc-floating-label{left:36px;right:initial}[dir=rtl] .mdc-select--outlined.mdc-select--with-leading-icon .mdc-floating-label,.mdc-select--outlined.mdc-select--with-leading-icon .mdc-floating-label[dir=rtl]{left:initial;right:36px}.mdc-select--outlined.mdc-select--with-leading-icon .mdc-floating-label--float-above{transform:translateY(-37.25px) translateX(-32px) scale(1)}[dir=rtl] .mdc-select--outlined.mdc-select--with-leading-icon .mdc-floating-label--float-above,.mdc-select--outlined.mdc-select--with-leading-icon .mdc-floating-label--float-above[dir=rtl]{transform:translateY(-37.25px) translateX(32px) scale(1)}.mdc-select--outlined.mdc-select--with-leading-icon .mdc-floating-label--float-above{font-size:.75rem}.mdc-select--outlined.mdc-select--with-leading-icon.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-select--outlined.mdc-select--with-leading-icon .mdc-notched-outline--upgraded .mdc-floating-label--float-above{transform:translateY(-34.75px) translateX(-32px) scale(0.75)}[dir=rtl] .mdc-select--outlined.mdc-select--with-leading-icon.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-select--outlined.mdc-select--with-leading-icon.mdc-notched-outline--upgraded .mdc-floating-label--float-above[dir=rtl],[dir=rtl] .mdc-select--outlined.mdc-select--with-leading-icon .mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-select--outlined.mdc-select--with-leading-icon .mdc-notched-outline--upgraded .mdc-floating-label--float-above[dir=rtl]{transform:translateY(-34.75px) translateX(32px) scale(0.75)}.mdc-select--outlined.mdc-select--with-leading-icon.mdc-notched-outline--upgraded .mdc-floating-label--float-above,.mdc-select--outlined.mdc-select--with-leading-icon .mdc-notched-outline--upgraded .mdc-floating-label--float-above{font-size:1rem}.mdc-select--outlined.mdc-select--with-leading-icon .mdc-floating-label--shake{animation:mdc-floating-label-shake-float-above-select-outlined-leading-icon-56px 250ms 1}@keyframes mdc-floating-label-shake-float-above-select-outlined-leading-icon-56px{0%{transform:translateX(calc(0 - 32px)) translateY(-34.75px) scale(0.75)}33%{animation-timing-function:cubic-bezier(0.5, 0, 0.701732, 0.495819);transform:translateX(calc(4% - 32px)) translateY(-34.75px) scale(0.75)}66%{animation-timing-function:cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);transform:translateX(calc(-4% - 32px)) translateY(-34.75px) scale(0.75)}100%{transform:translateX(calc(0 - 32px)) translateY(-34.75px) scale(0.75)}}[dir=rtl] .mdc-select--outlined.mdc-select--with-leading-icon .mdc-floating-label--shake,.mdc-select--outlined.mdc-select--with-leading-icon[dir=rtl] .mdc-floating-label--shake{animation:mdc-floating-label-shake-float-above-select-outlined-leading-icon-56px 250ms 1}@keyframes mdc-floating-label-shake-float-above-select-outlined-leading-icon-56px-rtl{0%{transform:translateX(calc(0 - -32px)) translateY(-34.75px) scale(0.75)}33%{animation-timing-function:cubic-bezier(0.5, 0, 0.701732, 0.495819);transform:translateX(calc(4% - -32px)) translateY(-34.75px) scale(0.75)}66%{animation-timing-function:cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);transform:translateX(calc(-4% - -32px)) translateY(-34.75px) scale(0.75)}100%{transform:translateX(calc(0 - -32px)) translateY(-34.75px) scale(0.75)}}.mdc-select--outlined.mdc-select--with-leading-icon .mdc-select__anchor :not(.mdc-notched-outline--notched) .mdc-notched-outline__notch{max-width:calc(100% - 96px)}.mdc-select--outlined .mdc-menu-surface{margin-bottom:8px}.mdc-select--outlined.mdc-select--no-label .mdc-menu-surface,.mdc-select--outlined .mdc-menu-surface--is-open-below{margin-bottom:0}.mdc-select__anchor{--mdc-ripple-fg-size: 0;--mdc-ripple-left: 0;--mdc-ripple-top: 0;--mdc-ripple-fg-scale: 1;--mdc-ripple-fg-translate-end: 0;--mdc-ripple-fg-translate-start: 0;-webkit-tap-highlight-color:rgba(0,0,0,0);will-change:transform,opacity}.mdc-select__anchor .mdc-select__ripple::before,.mdc-select__anchor .mdc-select__ripple::after{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:""}.mdc-select__anchor .mdc-select__ripple::before{transition:opacity 15ms linear,background-color 15ms linear;z-index:1;z-index:var(--mdc-ripple-z-index, 1)}.mdc-select__anchor .mdc-select__ripple::after{z-index:0;z-index:var(--mdc-ripple-z-index, 0)}.mdc-select__anchor.mdc-ripple-upgraded .mdc-select__ripple::before{transform:scale(var(--mdc-ripple-fg-scale, 1))}.mdc-select__anchor.mdc-ripple-upgraded .mdc-select__ripple::after{top:0;left:0;transform:scale(0);transform-origin:center center}.mdc-select__anchor.mdc-ripple-upgraded--unbounded .mdc-select__ripple::after{top:var(--mdc-ripple-top, 0);left:var(--mdc-ripple-left, 0)}.mdc-select__anchor.mdc-ripple-upgraded--foreground-activation .mdc-select__ripple::after{animation:mdc-ripple-fg-radius-in 225ms forwards,mdc-ripple-fg-opacity-in 75ms forwards}.mdc-select__anchor.mdc-ripple-upgraded--foreground-deactivation .mdc-select__ripple::after{animation:mdc-ripple-fg-opacity-out 150ms;transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}.mdc-select__anchor .mdc-select__ripple::before,.mdc-select__anchor .mdc-select__ripple::after{top:calc(50% - 100%);left:calc(50% - 100%);width:200%;height:200%}.mdc-select__anchor.mdc-ripple-upgraded .mdc-select__ripple::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}.mdc-select__anchor .mdc-select__ripple::before,.mdc-select__anchor .mdc-select__ripple::after{background-color:rgba(0, 0, 0, 0.87);background-color:var(--mdc-ripple-color, rgba(0, 0, 0, 0.87))}.mdc-select__anchor:hover .mdc-select__ripple::before,.mdc-select__anchor.mdc-ripple-surface--hover .mdc-select__ripple::before{opacity:0.04;opacity:var(--mdc-ripple-hover-opacity, 0.04)}.mdc-select__anchor.mdc-ripple-upgraded--background-focused .mdc-select__ripple::before,.mdc-select__anchor:not(.mdc-ripple-upgraded):focus .mdc-select__ripple::before{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-focus-opacity, 0.12)}.mdc-select__anchor .mdc-select__ripple{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}.mdc-select__menu .mdc-list .mdc-list-item--selected .mdc-list-item__ripple::before,.mdc-select__menu .mdc-list .mdc-list-item--selected .mdc-list-item__ripple::after{background-color:#000;background-color:var(--mdc-ripple-color, var(--mdc-theme-on-surface, #000))}.mdc-select__menu .mdc-list .mdc-list-item--selected:hover .mdc-list-item__ripple::before,.mdc-select__menu .mdc-list .mdc-list-item--selected.mdc-ripple-surface--hover .mdc-list-item__ripple::before{opacity:0.04;opacity:var(--mdc-ripple-hover-opacity, 0.04)}.mdc-select__menu .mdc-list .mdc-list-item--selected.mdc-ripple-upgraded--background-focused .mdc-list-item__ripple::before,.mdc-select__menu .mdc-list .mdc-list-item--selected:not(.mdc-ripple-upgraded):focus .mdc-list-item__ripple::before{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-focus-opacity, 0.12)}.mdc-select__menu .mdc-list .mdc-list-item--selected:not(.mdc-ripple-upgraded) .mdc-list-item__ripple::after{transition:opacity 150ms linear}.mdc-select__menu .mdc-list .mdc-list-item--selected:not(.mdc-ripple-upgraded):active .mdc-list-item__ripple::after{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-press-opacity, 0.12)}.mdc-select__menu .mdc-list .mdc-list-item--selected.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: var(--mdc-ripple-press-opacity, 0.12)}.mdc-select-helper-text{margin:0;margin-left:16px;margin-right:16px;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-caption-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.75rem;font-size:var(--mdc-typography-caption-font-size, 0.75rem);line-height:1.25rem;line-height:var(--mdc-typography-caption-line-height, 1.25rem);font-weight:400;font-weight:var(--mdc-typography-caption-font-weight, 400);letter-spacing:0.0333333333em;letter-spacing:var(--mdc-typography-caption-letter-spacing, 0.0333333333em);text-decoration:inherit;text-decoration:var(--mdc-typography-caption-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-caption-text-transform, inherit);display:block;margin-top:0;line-height:normal}[dir=rtl] .mdc-select-helper-text,.mdc-select-helper-text[dir=rtl]{margin-left:16px;margin-right:16px}.mdc-select-helper-text::before{display:inline-block;width:0;height:16px;content:"";vertical-align:0}.mdc-select-helper-text--validation-msg{opacity:0;transition:opacity 180ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-select--invalid+.mdc-select-helper-text--validation-msg,.mdc-select-helper-text--validation-msg-persistent{opacity:1}.mdc-select--with-leading-icon .mdc-select__icon{display:inline-block;box-sizing:border-box;border:none;text-decoration:none;cursor:pointer;user-select:none;flex-shrink:0;align-self:center;background-color:transparent;fill:currentColor}.mdc-select--with-leading-icon .mdc-select__icon{margin-left:12px;margin-right:12px}[dir=rtl] .mdc-select--with-leading-icon .mdc-select__icon,.mdc-select--with-leading-icon .mdc-select__icon[dir=rtl]{margin-left:12px;margin-right:12px}.mdc-select__icon:not([tabindex]),.mdc-select__icon[tabindex="-1"]{cursor:default;pointer-events:none}.material-icons{font-family:var(--mdc-icon-font, "Material Icons");font-weight:normal;font-style:normal;font-size:var(--mdc-icon-size, 24px);line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga"}:host{display:inline-block;vertical-align:top;outline:none}.mdc-select{width:100%}[hidden]{display:none}.mdc-select__icon{z-index:2}.mdc-select--with-leading-icon{--mdc-list-item-graphic-margin: calc(48px - var(--mdc-list-item-graphic-size, 24px) - var(--mdc-list-side-padding, 16px))}.mdc-select .mdc-select__anchor .mdc-select__selected-text{overflow:hidden}.mdc-select .mdc-select__anchor *{display:inline-flex}.mdc-select .mdc-select__anchor .mdc-floating-label{display:inline-block}mwc-notched-outline{--mdc-notched-outline-border-color: var(--mdc-select-outlined-idle-border-color, rgba(0, 0, 0, 0.38));--mdc-notched-outline-notch-offset: 1px}:host(:not([disabled]):hover) .mdc-select:not(.mdc-select--invalid):not(.mdc-select--focused) mwc-notched-outline{--mdc-notched-outline-border-color: var(--mdc-select-outlined-hover-border-color, rgba(0, 0, 0, 0.87))}:host(:not([disabled])) .mdc-select:not(.mdc-select--disabled) .mdc-select__selected-text{color:rgba(0, 0, 0, 0.87);color:var(--mdc-select-ink-color, rgba(0, 0, 0, 0.87))}:host(:not([disabled])) .mdc-select:not(.mdc-select--disabled) .mdc-line-ripple::before{border-bottom-color:rgba(0, 0, 0, 0.42);border-bottom-color:var(--mdc-select-idle-line-color, rgba(0, 0, 0, 0.42))}:host(:not([disabled])) .mdc-select:not(.mdc-select--disabled):hover .mdc-line-ripple::before{border-bottom-color:rgba(0, 0, 0, 0.87);border-bottom-color:var(--mdc-select-hover-line-color, rgba(0, 0, 0, 0.87))}:host(:not([disabled])) .mdc-select:not(.mdc-select--outlined):not(.mdc-select--disabled) .mdc-select__anchor{background-color:whitesmoke;background-color:var(--mdc-select-fill-color, whitesmoke)}:host(:not([disabled])) .mdc-select.mdc-select--invalid .mdc-select__dropdown-icon{fill:var(--mdc-select-error-dropdown-icon-color, var(--mdc-select-error-color, var(--mdc-theme-error, #b00020)))}:host(:not([disabled])) .mdc-select.mdc-select--invalid .mdc-floating-label,:host(:not([disabled])) .mdc-select.mdc-select--invalid .mdc-floating-label::after{color:var(--mdc-select-error-color, var(--mdc-theme-error, #b00020))}:host(:not([disabled])) .mdc-select.mdc-select--invalid mwc-notched-outline{--mdc-notched-outline-border-color: var(--mdc-select-error-color, var(--mdc-theme-error, #b00020))}.mdc-select__menu--invalid{--mdc-theme-primary: var(--mdc-select-error-color, var(--mdc-theme-error, #b00020))}:host(:not([disabled])) .mdc-select:not(.mdc-select--invalid):not(.mdc-select--focused) .mdc-floating-label,:host(:not([disabled])) .mdc-select:not(.mdc-select--invalid):not(.mdc-select--focused) .mdc-floating-label::after{color:rgba(0, 0, 0, 0.6);color:var(--mdc-select-label-ink-color, rgba(0, 0, 0, 0.6))}:host(:not([disabled])) .mdc-select:not(.mdc-select--invalid):not(.mdc-select--focused) .mdc-select__dropdown-icon{fill:rgba(0, 0, 0, 0.54);fill:var(--mdc-select-dropdown-icon-color, rgba(0, 0, 0, 0.54))}:host(:not([disabled])) .mdc-select.mdc-select--focused mwc-notched-outline{--mdc-notched-outline-stroke-width: 2px;--mdc-notched-outline-notch-offset: 2px}:host(:not([disabled])) .mdc-select.mdc-select--focused:not(.mdc-select--invalid) mwc-notched-outline{--mdc-notched-outline-border-color: var(--mdc-select-focused-label-color, var(--mdc-theme-primary, rgba(98, 0, 238, 0.87)))}:host(:not([disabled])) .mdc-select.mdc-select--focused:not(.mdc-select--invalid) .mdc-select__dropdown-icon{fill:rgba(98,0,238,.87);fill:var(--mdc-select-focused-dropdown-icon-color, var(--mdc-theme-primary, rgba(98, 0, 238, 0.87)))}:host(:not([disabled])) .mdc-select.mdc-select--focused:not(.mdc-select--invalid) .mdc-floating-label{color:#6200ee;color:var(--mdc-theme-primary, #6200ee)}:host(:not([disabled])) .mdc-select.mdc-select--focused:not(.mdc-select--invalid) .mdc-floating-label::after{color:#6200ee;color:var(--mdc-theme-primary, #6200ee)}:host(:not([disabled])) .mdc-select-helper-text:not(.mdc-select-helper-text--validation-msg){color:var(--mdc-select-label-ink-color, rgba(0, 0, 0, 0.6))}:host([disabled]){pointer-events:none}:host([disabled]) .mdc-select:not(.mdc-select--outlined).mdc-select--disabled .mdc-select__anchor{background-color:#fafafa;background-color:var(--mdc-select-disabled-fill-color, #fafafa)}:host([disabled]) .mdc-select.mdc-select--outlined mwc-notched-outline{--mdc-notched-outline-border-color: var(--mdc-select-outlined-disabled-border-color, rgba(0, 0, 0, 0.06))}:host([disabled]) .mdc-select .mdc-select__dropdown-icon{fill:rgba(0, 0, 0, 0.38);fill:var(--mdc-select-disabled-dropdown-icon-color, rgba(0, 0, 0, 0.38))}:host([disabled]) .mdc-select:not(.mdc-select--invalid):not(.mdc-select--focused) .mdc-floating-label,:host([disabled]) .mdc-select:not(.mdc-select--invalid):not(.mdc-select--focused) .mdc-floating-label::after{color:rgba(0, 0, 0, 0.38);color:var(--mdc-select-disabled-ink-color, rgba(0, 0, 0, 0.38))}:host([disabled]) .mdc-select-helper-text{color:rgba(0, 0, 0, 0.38);color:var(--mdc-select-disabled-ink-color, rgba(0, 0, 0, 0.38))}:host([disabled]) .mdc-select__selected-text{color:rgba(0, 0, 0, 0.38);color:var(--mdc-select-disabled-ink-color, rgba(0, 0, 0, 0.38))}`;

/**
@license
Copyright 2020 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
let Select = class Select extends SelectBase {
};
Select.styles = style$9;
Select = __decorate([
    customElement('mwc-select')
], Select);

/**
 * small mixin to allow Polymer two-way-binding with mwc-se;ect
 * 
 */

const TwoSelectBinding = (baseElement) => class extends baseElement {
  constructor() {
    super();
    this.addEventListener('change', e => {
      this.dispatchValueChanged();
    });
  }

  dispatchValueChanged() {
    // Note(cg): only notify change if the field is still connected. 
    // Othewise, this can lead to values being changed when the field if removed 
    // For instance: https://gitlab.com/christophe-g/ida-ta/-/issues/383
    if (this.isConnected) {
      this.dispatchEvent(new CustomEvent('value-changed', { detail: { value: this.value }, bubbles: true, composed: true }));
    }
  }
};

/**
 * mixin overriding how pwi-select handle async list.async
 * We want to avoid situation where: 
 *   1. value is reset to '' when list item is not pupulated
 *   2. select element does not show any text value, when the 
 *   list is populated later on.
 *
 * Related issue:
 * https://github.com/material-components/material-components-web-components/issues/971
 *
 */

const OverrideSelectAsync = (baseElement) => class extends baseElement {

  selectByValue(value) {
        let indexToSelect = -1;
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.value === value) {
                indexToSelect = i;
                break;
            }
        }
        this.valueSetDirectly = true;
        // Note(cg): we prevent setting item on inner list 
        // for items that do not exit. Otherwise, value is 
        // reset = '' when list item is missing. This is a problem
        // with async lists
        if (indexToSelect === -1) {
          this._missingItem = true;
          if (value) {
            this.selectedText = value;
          }
          return;
        }
        this.select(indexToSelect);
        this.mdcFoundation.handleChange();
    }

   onItemsUpdated(e) {
      super.onItemsUpdated();
      if ((this._missingItem && this.value)) {
        delete this._missingItem;
        this.selectByValue(this.value);
      }
    }

    connectedCallback() {
      super.connectedCallback();
      this.addEventListener('async-value', this.onAsyncValue);
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('async-value', this.onAsyncValue);
    }

    onAsyncValue(e) {
      if (this.selected) {
        this.selectedText = this.selected.text;
      }
    }




   // onNotifyAsync(e) {
   //   if (this.value === e.currentTarget.value) {
   //      this.selectByValue(this.value);
   //    }
   // }
};

/**
 * extension of mwc-textfield emiting a value-changed event when
 * value changes
 */
class PwiSelect extends
  TwoSelectBinding(
    OverrideTextfield(
      OverrideSelectAsync(
        OverrideTextfielValidityMessage(
          Select)))) {
  }

customElements.define('pwi-select', PwiSelect);

var AccessibleLabelStyle$1 = css`
     /* By default, occupy all width*/
     :host([label-above]) {
       width: 100%;
       /* display: inline-flex; */
     }

     :host([label-above]) .mdc-select__anchor {
       flex-direction: column;
       overflow: visible; /* this is to allow tooltip */
     }

     :host([label-above]) .mdc-select__ripple {
       overflow: hidden; /* this is to allow tooltip */
     }

     :host([label-above]) span.mdc-select__selected-text {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        display: inline-block;
     }

     :host([label-above]) .mdc-select__selected-text-container {
       height: 33px;
       width: calc(100% - 48px); /*to avoid overflow */
       overflow-x: hidden;
     }

     :host([label-above]) .mdc-select--filled .mdc-select__anchor::before {
       height: 0;
       display: none;
     }

     :host([label-above]) .mdc-select .label-above {
       margin-right: 40px;
     }

     :host([label-above]) .mdc-select .label-above {
       color: var(--mdc-text-field-label-ink-color, rgba(0, 0, 0, 0.6));
     }

     :host([label-above]:hover) .mdc-select:not(.mdc-select--focused):not(.mdc-select--disabled):not(.mdc-select--invalid) .label-above {
       color: var(--mdc-theme-text-primary-on-background);
     }

     :host([label-above]) .mdc-select--focused .label-above {
       color: var(--mdc-theme-primary, #6200ee);
     }

     :host([label-above]) .mdc-select--disabled .label-above {
       color: var(--mdc-text-field-disabled-ink-color, rgba(0, 0, 0, 0.38));
     }

     :host([label-above]) .mdc-select--invalid .label-above {
       color: var(--mdc-theme-error, #b00020);
     }

     :host([label-above]) .mdc-select--filled .mdc-select__anchor {
       height: unset;
       min-height: 56px;
     }

     :host([label-above]) .mdc-select__dropdown-icon {
       position: absolute;
       right: 0px;
       bottom: 15px;
     }

     /* ICON */
     :host([label-above]) .mdc-select--with-leading-icon .label-above {
       margin-left: 36px;
     }

     :host([label-above]) .mdc-select--with-leading-icon .mdc-text-field__icon--leading {
       left: -10px;
       top: 7px;
     }

     /* PREFIX - NOT YET WORKING */

     /* RTL */
     :host-context([dir=rtl]) .mdc-select--filled .mdc-floating-label {
       right: 40px;
       left: initial;
     }

     :host-context([dir=rtl]) .mdc-select__selected-text-container {
       margin-right: 40px;
     }

     :host-context([dir=rtl]) .mdc-select__dropdown-icon {
       position: absolute;
       right: 0px;
       bottom: 15px;
     }

     .mdc-text-field--filled .mdc-floating-label:dir(rtl) {
       right: 40px;
       left: initial;
     }

     .mdc-select__selected-text-container:dir(rtl) {
       margin-right: 40px;
     }

     .mdc-select__dropdown-icon:dir(rtl) {
       position: absolute;
       right: 0px;
       bottom: 15px;
     }


`;

class PwiAccessibleSelect extends AccessibleLabel(PwiSelect) {

  static get styles() {
    return [super.styles, AccessibleLabelStyle$1];
  }
}

customElements.define('pwi-accessible-select', PwiAccessibleSelect);

class PwiAccessibleTel extends PwiAccessibleTextfield {

  constructor() {
    super();
    this.type = 'tel';
  }
}

customElements.define('pwi-accessible-tel', PwiAccessibleTel);

const validity = {
  badInput: false,
  valid: true,
};

class PwiPseudoInput extends LitElement {

  createRenderRoot() {
    return this;
    // return this.attachShadow({ mode: 'open', delegatesFocus: true });
  }

  get properties() {
    return {
      validity: {
        type: Boolean
      },
    };
  }


  constructor() {
    super();
    this.value = '';
    this.validity = validity;
  }

  // // Note(cg): see. https://github.com/material-components/material-components-web-components/tree/master/packages/textfield
  // validityTransform(value, validity) {
  //   if (this.required && (value === '' || value === undefined)) {
  //     validity.valid = false;
  //     validity.valuMissing = true;
  //     return validity;
  //   }
  //   Object.assign({}, initValidity);
  // }

}

// Register the new element with the browser.
customElements.define('pwi-pseudo-input', PwiPseudoInput);

/**
 * a wrapper around form fields like checkbox and radio-buttons
 * It is also used for displayinga label and show other fields, 
 * e.g. in the context of recursive form section
 */

class PwiFieldWrapper extends AccessibleLabel(PwiTextField) {


  static get styles() {
    return [super.styles, css `
    :host {
      width: 100%;
    }

    .mdc-text-field .label-above {
     color: var(--mdc-text-field-label-ink-color, rgba(0, 0, 0, 0.6));
    }
    
    .mdc-text-field__input {
      display: block;
      height: unset;
      padding-bottom: var(--space-x-small);
      padding-top: var(--space-x-small);
    }

    :host(:hover:not([hasfocus]):not([disabled]):not([invalid])) .mdc-text-field .label-above {
     color: var(--mdc-theme-text-primary-on-background);
    }

    :host([hasfocus]) .mdc-text-field .label-above  {
      color: var(--mdc-theme-primary, #6200ee);
    }

    :host([hasfocus]) .mdc-text-field-helper-text, :host([invalid]) .mdc-text-field-helper-text {
      opacity: 1;
    }

    :host([disabled]) .mdc-text-field .label-above  {
       color: var(--mdc-text-field-disabled-ink-color, rgba(0, 0, 0, 0.38));
    }

    :host([invalid]) .mdc-text-field  .label-above {
      color: var(--mdc-theme-error, #b00020);
    }

    :host(:not([disabled])) .mdc-text-field:not(.mdc-text-field--outlined) {
        background-color: initial;
    }

    .mdc-text-field--filled:before {
      display: none;
    }

     .mdc-line-ripple:before {
       opacity: 0;
     }

     :host(:hover) .mdc-line-ripple:before {
       opacity: 0.2;
     }

    .mdc-text-field {
      height: initial;
      position: relative;
      display: inline-block;
    }

    
    /* RECURSIVE */
    :host([is-recursive]) .mdc-text-field {
      padding-right: 0;
    }
    
    :host([is-recursive]) #label {
      margin-left: -16px;
    }

    `];
  }

  static get properties() {
    return {

      ...super.properties,

      hasfocus: {
        type: Boolean,
        reflect: true
      },

       invalid: {
        type: Boolean,
        reflect: true
      },
      disabled: {
        type: Boolean,
        reflect: true
      },
      /*
       * `isRecursive` true to indicate that field-wrapper is used in a recursive context
       * - hover style should not apply
       */
      isRecursive: {
        type: Boolean,
        attribute: 'is-recursive',
        reflect: true
      },



    };
  }

  constructor() {
    super();
    this.labelAbove = true;
    this.addEventListener('focusin', this._onFocusin.bind(this));
    this.addEventListener('focusout', this._onFocusout.bind(this));
  }

  _onFocusout() {
    // console.info('BLUr', this)
    this.hasfocus = false;
    // this.blur();
  }

  _onFocusin() {
    this.hasfocus = true;
    // this.focus();
    // console.info('Focus', this)
  }

  get formElement() {
    return this.renderRoot.querySelector('pwi-pseudo-input');
  }

  get slotEl() {
    return this.renderRoot.querySelector('slot');
  }

  updated(props) {
    if (props.has('label') && this.label) {
      this.addLightDom('label');
    }
    if (props.has('helper') && this.helper) {
      this.addLightDom('helper');
    }
  }

 addLightDom(id) {
   let el = this[id + '__'] || this.querySelector('#' + id);
   if (!el) {
     el = document.createElement('span');
     el.id = id;
     el.style.display = 'none';
     this[id + '__'] = el;
     this.appendChild(el);
   }
   el.innerText = this[id];
 }

  render() {
    const classes = {
      'mdc-text-field--disabled': this.disabled,
      'mdc-text-field--no-label': !this.label,
      'mdc-text-field--filled': !this.outlined,
      'mdc-text-field--outlined': this.outlined,
      'mdc-text-field--with-leading-icon': this.icon,
      'mdc-text-field--with-trailing-icon': this.iconTrailing,
      'mdc-text-field--end-aligned': this.endAligned,
    };
    return html$2 `
      <label class="mdc-text-field ${classMap(classes)}">
        ${this.isRecursive ? nothing : this.renderRipple() }
        ${this.outlined ? this.renderOutline() : this.renderLabel()}
        ${this.renderInput()}
        ${this.renderLineRipple()}
      </label>
      ${this.renderHelperText(this.renderCharCounter())}
    `;
  }

  renderInput() {
    return html$2 `
    <pwi-pseudo-input 
      tabindex="${ifDefined(this.isRecursive || this.label ? '0' : undefined)}"
      role="group"
      aria-labelledby="label"
      aria-controls="helper"
      aria-describedby="helper"
      aria-errormessage="helper"
      aria-invalid="${ifDefined(this.isUiValid ? undefined : 'true')}"
      class="mdc-text-field__input">
      <slot></slot>
    </pwi-pseudo-input>`;
  }

  // render() {
  //   return html`
  //     <p>A paragraph</p>
  //   `;
  // }
}

customElements.define('pwi-field-wrapper', PwiFieldWrapper);

class PwiGenericGroup extends doNotSetUndefinedValue(PwiAccessibleTextfield) {

  static get styles() {
    return [super.styles, css `
    :host {
      width: 100%;
    }

    .mdc-text-field .label-above {
     color: var(--mdc-text-field-label-ink-color, rgba(0, 0, 0, 0.6));
    }
    
    .mdc-text-field__input {
      display: block;
      height: unset;
      padding-bottom: var(--space-x-small);
      padding-top: var(--space-x-small);
    }

    :host(:hover:not([focused]):not([disabled]):not([invalid])) .mdc-text-field .label-above {
     color: var(--mdc-theme-text-primary-on-background);
    }

    :host([focused]) .mdc-text-field .label-above  {
      color: var(--mdc-theme-primary, #6200ee);
    }

    :host([focused]) .mdc-text-field-helper-text, :host([invalid]) .mdc-text-field-helper-text {
      opacity: 1;
    }

    :host([disabled]) .mdc-text-field .label-above  {
       color: var(--mdc-text-field-disabled-ink-color, rgba(0, 0, 0, 0.38));
    }

    :host([invalid]) .mdc-text-field  .label-above {
      color: var(--mdc-theme-error, #b00020);
    }

    :host(:not([disabled])) .mdc-text-field:not(.mdc-text-field--outlined) {
        background-color: initial;
    }

    .mdc-text-field--filled:before {
      display: none;
    }

     .mdc-line-ripple:before {
       opacity: 0;
     }

     :host(:hover) .mdc-line-ripple:before {
       opacity: 0.2;
     }

    .mdc-text-field {
      height: initial;
      position: relative;
      display: inline-block;
    }

    /* Option container layout  */
    pwi-pseudo-input {
      display: var(--pwi-group-pseudo-input-display, block);
      flex-direction: var(--pwi-group-pseudo-input-flex-direction);
    }
    
    :host([one-line-per-option]){
      --pwi-group-pseudo-input-display :flex;
      --pwi-group-pseudo-input-flex-direction: column;
    }

    pwi-pseudo-input > div {
      display: inline-flex;
    }
    pwi-pseudo-input  pwi-textfield{
      padding-left: var(--space-medium);
    }

    `];
  }

  static get properties() {
    return {

      ...super.properties,

      focused: {
        type: Boolean,
        reflect: true
      },

      invalid: {
        type: Boolean,
        reflect: true
      },

      disabled: {
        type: Boolean,
        reflect: true
      },

      useShadow: {
        type: Boolean
      },

      /*
       * `oneLinePerOption` when true, show each option on their own line
       */
      oneLinePerOption: {
        type: Boolean,
        reflect: true,
        attribute: 'one-line-per-option'
      },

    };
  }


  async onChange(e) {
    await this.updateCompleted;
    this.dispatchEvent(new CustomEvent('selected-changed', { detail: { value: this.selected } }));
    this._value = this.selected; // Note(cg): get _value from the actual selection (dom query).
    this.requestUpdate(); // Note(cg): this is required for instance to make please specify field to appear.
  }
 
  _queryItem(selector) {
    return this.useShadow ? this.renderRoot.querySelector(selector) : this.querySelector(selector);
  }
  _queryItems(selector) {
    return this.useShadow ? this.renderRoot.querySelectorAll(selector) : this.querySelectorAll(selector);
  }



  constructor() {
    super();
    this.labelAbove = true;
    // Note(cg): we assume to be using shadow-dom by default. .
    // if we have a valid slot element, it will be turned to false
    this.useShadow = true; 
    this.addEventListener('change', this.onChange);
    this.addEventListener('focusin', this._onFocusin);
    this.addEventListener('focusout', this._onFocusout);
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.onChange);
    this.removeEventListener('focusin', this._onFocusin);
    this.removeEventListener('focusout', this._onFocusout);
    this.slotEl && this.slotEl.removeEventListener('slotchange', this._boundSlotChange);
    super.disconnectedCallback();
  }

  _onFocusout() {
    // console.info('focusout', this)
    this.focused = false;
    this.reportValidity();
  }

  _onFocusin() {
    // console.info('focusin', this)
    this.focused = true;
  }

  firstUpdated() {
    this._boundSlotChange = this.onSlotChange.bind(this);
    this.slotEl && this.slotEl.addEventListener('slotchange', this._boundSlotChange);
    super.firstUpdated();
  }

  get _selectedItem() {
    return this._queryItems('[checked]')[0];
  }

  get _selectedItems() {
    return this._queryItems('[checked]');
  }

  get _selectedValue() {
    return this._selectedItem && this._selectedItem.value;
  }

  get _selectedValues() {
    return [...this._selectedItems].map(item => item.value);
  }

  get formElement() {
    // Note(cg): will be overriden.
    return null;
  }

  get slotEl() {
    return this.renderRoot.querySelector('slot');
  }

  onSlotChange(e) {
    this.useShadow = false;
    // console.info('slotchange', this)
    if (this._value !== undefined) {
      this.selected = this._value;
    }
  }

  renderInput() {
    // Note(cg): will be overriden.
    return html$2 `
        <div>This component is not suposed to be used directly</div>
      `;
  }
}

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var cssClasses$9 = {
    ROOT: 'mdc-form-field',
};
var strings$7 = {
    LABEL_SELECTOR: '.mdc-form-field > label',
};

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCFormFieldFoundation = /** @class */ (function (_super) {
    __extends(MDCFormFieldFoundation, _super);
    function MDCFormFieldFoundation(adapter) {
        var _this = _super.call(this, __assign(__assign({}, MDCFormFieldFoundation.defaultAdapter), adapter)) || this;
        _this.click = function () {
            _this.handleClick();
        };
        return _this;
    }
    Object.defineProperty(MDCFormFieldFoundation, "cssClasses", {
        get: function () {
            return cssClasses$9;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCFormFieldFoundation, "strings", {
        get: function () {
            return strings$7;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCFormFieldFoundation, "defaultAdapter", {
        get: function () {
            return {
                activateInputRipple: function () { return undefined; },
                deactivateInputRipple: function () { return undefined; },
                deregisterInteractionHandler: function () { return undefined; },
                registerInteractionHandler: function () { return undefined; },
            };
        },
        enumerable: true,
        configurable: true
    });
    MDCFormFieldFoundation.prototype.init = function () {
        this.adapter.registerInteractionHandler('click', this.click);
    };
    MDCFormFieldFoundation.prototype.destroy = function () {
        this.adapter.deregisterInteractionHandler('click', this.click);
    };
    MDCFormFieldFoundation.prototype.handleClick = function () {
        var _this = this;
        this.adapter.activateInputRipple();
        requestAnimationFrame(function () {
            _this.adapter.deactivateInputRipple();
        });
    };
    return MDCFormFieldFoundation;
}(MDCFoundation));

/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class FormfieldBase extends BaseElement {
    constructor() {
        super(...arguments);
        this.alignEnd = false;
        this.spaceBetween = false;
        this.nowrap = false;
        this.label = '';
        this.mdcFoundationClass = MDCFormFieldFoundation;
    }
    createAdapter() {
        return {
            registerInteractionHandler: (type, handler) => {
                this.labelEl.addEventListener(type, handler);
            },
            deregisterInteractionHandler: (type, handler) => {
                this.labelEl.removeEventListener(type, handler);
            },
            activateInputRipple: async () => {
                const input = this.input;
                if (input instanceof FormElement) {
                    const ripple = await input.ripple;
                    if (ripple) {
                        ripple.startPress();
                    }
                }
            },
            deactivateInputRipple: async () => {
                const input = this.input;
                if (input instanceof FormElement) {
                    const ripple = await input.ripple;
                    if (ripple) {
                        ripple.endPress();
                    }
                }
            },
        };
    }
    get input() {
        return findAssignedElement(this.slotEl, '*');
    }
    render() {
        const classes = {
            'mdc-form-field--align-end': this.alignEnd,
            'mdc-form-field--space-between': this.spaceBetween,
            'mdc-form-field--nowrap': this.nowrap
        };
        return html$2 `
      <div class="mdc-form-field ${classMap(classes)}">
        <slot></slot>
        <label class="mdc-label"
               @click="${this._labelClick}">${this.label}</label>
      </div>`;
    }
    _labelClick() {
        const input = this.input;
        if (input) {
            input.focus();
            input.click();
        }
    }
}
__decorate([
    property({ type: Boolean })
], FormfieldBase.prototype, "alignEnd", void 0);
__decorate([
    property({ type: Boolean })
], FormfieldBase.prototype, "spaceBetween", void 0);
__decorate([
    property({ type: Boolean })
], FormfieldBase.prototype, "nowrap", void 0);
__decorate([
    property({ type: String }),
    observer(async function (label) {
        const input = this.input;
        if (input) {
            if (input.localName === 'input') {
                input.setAttribute('aria-label', label);
            }
            else if (input instanceof FormElement) {
                await input.updateComplete;
                input.setAriaLabel(label);
            }
        }
    })
], FormfieldBase.prototype, "label", void 0);
__decorate([
    query('.mdc-form-field')
], FormfieldBase.prototype, "mdcRoot", void 0);
__decorate([
    query('slot')
], FormfieldBase.prototype, "slotEl", void 0);
__decorate([
    query('label')
], FormfieldBase.prototype, "labelEl", void 0);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$a = css `.mdc-form-field{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-body2-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.875rem;font-size:var(--mdc-typography-body2-font-size, 0.875rem);line-height:1.25rem;line-height:var(--mdc-typography-body2-line-height, 1.25rem);font-weight:400;font-weight:var(--mdc-typography-body2-font-weight, 400);letter-spacing:0.0178571429em;letter-spacing:var(--mdc-typography-body2-letter-spacing, 0.0178571429em);text-decoration:inherit;text-decoration:var(--mdc-typography-body2-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-body2-text-transform, inherit);color:rgba(0, 0, 0, 0.87);color:var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, 0.87));display:inline-flex;align-items:center;vertical-align:middle}.mdc-form-field>label{margin-left:0;margin-right:auto;padding-left:4px;padding-right:0;order:0}[dir=rtl] .mdc-form-field>label,.mdc-form-field>label[dir=rtl]{margin-left:auto;margin-right:0}[dir=rtl] .mdc-form-field>label,.mdc-form-field>label[dir=rtl]{padding-left:0;padding-right:4px}.mdc-form-field--nowrap>label{text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.mdc-form-field--align-end>label{margin-left:auto;margin-right:0;padding-left:0;padding-right:4px;order:-1}[dir=rtl] .mdc-form-field--align-end>label,.mdc-form-field--align-end>label[dir=rtl]{margin-left:0;margin-right:auto}[dir=rtl] .mdc-form-field--align-end>label,.mdc-form-field--align-end>label[dir=rtl]{padding-left:4px;padding-right:0}.mdc-form-field--space-between{justify-content:space-between}.mdc-form-field--space-between>label{margin:0}[dir=rtl] .mdc-form-field--space-between>label,.mdc-form-field--space-between>label[dir=rtl]{margin:0}:host{display:inline-flex}.mdc-form-field{width:100%}::slotted(*){-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-body2-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.875rem;font-size:var(--mdc-typography-body2-font-size, 0.875rem);line-height:1.25rem;line-height:var(--mdc-typography-body2-line-height, 1.25rem);font-weight:400;font-weight:var(--mdc-typography-body2-font-weight, 400);letter-spacing:0.0178571429em;letter-spacing:var(--mdc-typography-body2-letter-spacing, 0.0178571429em);text-decoration:inherit;text-decoration:var(--mdc-typography-body2-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-body2-text-transform, inherit);color:rgba(0, 0, 0, 0.87);color:var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, 0.87))}::slotted(mwc-switch){margin-right:10px}[dir=rtl] ::slotted(mwc-switch),::slotted(mwc-switch)[dir=rtl]{margin-left:10px}`;

let Formfield = class Formfield extends FormfieldBase {
};
Formfield.styles = style$a;
Formfield = __decorate([
    customElement('mwc-formfield')
], Formfield);

/**
 * @license
 *  Copyright 2020 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 *
 *     Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Unique symbol for marking roots
 */
const selectionController = Symbol('selection controller');
/**
 * Set of checkable elements with added metadata
 */
class SingleSelectionSet {
    constructor() {
        this.selected = null;
        this.ordered = null;
        this.set = new Set();
    }
}
/**
 * Controller that provides behavior similar to a native `<input type="radio">`
 * group.
 *
 * Behaviors:
 *
 * - Selection via key navigation (currently LTR is supported)
 * - Deselection of other grouped, checkable controls upon selection
 * - Grouping of checkable elements by name
 *   - Defaults grouping scope to host shadow root
 *   - Document-wide scoping enabled
 * - Land focus only on checked element. Focuses leading element when none
 *   checked.
 *
 * Intended Usage:
 *
 * ```ts
 * class MyElement extends HTMLElement {
 *   private selectionController: SingleSelectionController | null = null;
 *   name = "";
 *   global = false;
 *
 *   private _checked = false;
 *   set checked(checked: boolean) {
 *     const oldVal = this._checked;
 *     if (checked === oldVal) return;
 *
 *     this._checked = checked;
 *
 *     if (this.selectionController) {
 *       this.selectionController.update(this)
 *     }
 *   }
 *
 *   get checked() {
 *     return this._checked;
 *   }
 *
 *   connectedCallback() {
 *     this.selectionController = SelectionController.getController(this);
 *     this.selectionController.register(this);
 *     this.selectionController.update(this);
 *   }
 *
 *   disconnectedCallback() {
 *     this.selectionController!.unregister(this);
 *     this.selectionController = null;
 *   }
 * }
 * ```
 */
class SingleSelectionController {
    constructor(element) {
        this.sets = {};
        this.focusedSet = null;
        this.mouseIsDown = false;
        this.updating = false;
        element.addEventListener('keydown', (e) => {
            this.keyDownHandler(e);
        });
        element.addEventListener('mousedown', () => {
            this.mousedownHandler();
        });
        element.addEventListener('mouseup', () => {
            this.mouseupHandler();
        });
    }
    /**
     * Get a controller for the given element. If no controller exists, one will
     * be created. Defaults to getting the controller scoped to the element's root
     * node shadow root unless `element.global` is true. Then, it will get a
     * `window.document`-scoped controller.
     *
     * @param element Element from which to get / create a SelectionController. If
     *     `element.global` is true, it gets a selection controller scoped to
     *     `window.document`.
     */
    static getController(element) {
        const useGlobal = !('global' in element) || ('global' in element && element.global);
        const root = useGlobal ? document :
            element.getRootNode();
        let controller = root[selectionController];
        if (controller === undefined) {
            controller = new SingleSelectionController(root);
            root[selectionController] = controller;
        }
        return controller;
    }
    keyDownHandler(e) {
        const element = e.target;
        if (!('checked' in element)) {
            return;
        }
        if (!this.has(element)) {
            return;
        }
        if (e.key == 'ArrowRight' || e.key == 'ArrowDown') {
            this.selectNext(element);
        }
        else if (e.key == 'ArrowLeft' || e.key == 'ArrowUp') {
            this.selectPrevious(element);
        }
    }
    mousedownHandler() {
        this.mouseIsDown = true;
    }
    mouseupHandler() {
        this.mouseIsDown = false;
    }
    /**
     * Whether or not the controller controls  the given element.
     *
     * @param element element to check
     */
    has(element) {
        const set = this.getSet(element.name);
        return set.set.has(element);
    }
    /**
     * Selects and returns the controlled element previous to the given element in
     * document position order. See
     * [Node.compareDocumentPosition](https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition).
     *
     * @param element element relative from which preceding element is fetched
     */
    selectPrevious(element) {
        const order = this.getOrdered(element);
        const i = order.indexOf(element);
        const previous = order[i - 1] || order[order.length - 1];
        this.select(previous);
        return previous;
    }
    /**
     * Selects and returns the controlled element next to the given element in
     * document position order. See
     * [Node.compareDocumentPosition](https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition).
     *
     * @param element element relative from which following element is fetched
     */
    selectNext(element) {
        const order = this.getOrdered(element);
        const i = order.indexOf(element);
        const next = order[i + 1] || order[0];
        this.select(next);
        return next;
    }
    select(element) {
        element.click();
    }
    /**
     * Focuses the selected element in the given element's selection set. User's
     * mouse selection will override this focus.
     *
     * @param element Element from which selection set is derived and subsequently
     *     focused.
     * @deprecated update() method now handles focus management by setting
     *     appropriate tabindex to form element.
     */
    focus(element) {
        // Only manage focus state when using keyboard
        if (this.mouseIsDown) {
            return;
        }
        const set = this.getSet(element.name);
        const currentFocusedSet = this.focusedSet;
        this.focusedSet = set;
        if (currentFocusedSet != set && set.selected && set.selected != element) {
            set.selected.focus();
        }
    }
    /**
     * @return Returns true if atleast one radio is selected in the radio group.
     */
    isAnySelected(element) {
        const set = this.getSet(element.name);
        for (const e of set.set) {
            if (e.checked) {
                return true;
            }
        }
        return false;
    }
    /**
     * Returns the elements in the given element's selection set in document
     * position order.
     * [Node.compareDocumentPosition](https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition).
     *
     * @param element Element from which selection set is derived and subsequently
     *     ordered.
     */
    getOrdered(element) {
        const set = this.getSet(element.name);
        if (!set.ordered) {
            set.ordered = Array.from(set.set);
            set.ordered.sort((a, b) => a.compareDocumentPosition(b) == Node.DOCUMENT_POSITION_PRECEDING ?
                1 :
                0);
        }
        return set.ordered;
    }
    /**
     * Gets the selection set of the given name and creates one if it does not yet
     * exist.
     *
     * @param name Name of set
     */
    getSet(name) {
        if (!this.sets[name]) {
            this.sets[name] = new SingleSelectionSet();
        }
        return this.sets[name];
    }
    /**
     * Register the element in the selection controller.
     *
     * @param element Element to register. Registers in set of `element.name`.
     */
    register(element) {
        // TODO(b/168546148): Remove accessing 'name' via getAttribute() when new
        // base class is created without single selection controller. Component
        // maybe booted up after it is connected to DOM in which case properties
        // (including `name`) are not updated yet.
        const name = element.name || element.getAttribute('name') || '';
        const set = this.getSet(name);
        set.set.add(element);
        set.ordered = null;
    }
    /**
     * Unregister the element from selection controller.
     *
     * @param element Element to register. Registers in set of `element.name`.
     */
    unregister(element) {
        const set = this.getSet(element.name);
        set.set.delete(element);
        set.ordered = null;
        if (set.selected == element) {
            set.selected = null;
        }
    }
    /**
     * Unselects other elements in element's set if element is checked. Noop
     * otherwise.
     *
     * @param element Element from which to calculate selection controller update.
     */
    update(element) {
        if (this.updating) {
            return;
        }
        this.updating = true;
        const set = this.getSet(element.name);
        if (element.checked) {
            for (const e of set.set) {
                if (e == element) {
                    continue;
                }
                e.checked = false;
            }
            set.selected = element;
        }
        // When tabbing through land focus on the checked radio in the group.
        if (this.isAnySelected(element)) {
            for (const e of set.set) {
                if (e.formElementTabIndex === undefined) {
                    break;
                }
                e.formElementTabIndex = e.checked ? 0 : -1;
            }
        }
        this.updating = false;
    }
}

/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var strings$8 = {
    NATIVE_CONTROL_SELECTOR: '.mdc-radio__native-control',
};
var cssClasses$a = {
    DISABLED: 'mdc-radio--disabled',
    ROOT: 'mdc-radio',
};

/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCRadioFoundation = /** @class */ (function (_super) {
    __extends(MDCRadioFoundation, _super);
    function MDCRadioFoundation(adapter) {
        return _super.call(this, __assign(__assign({}, MDCRadioFoundation.defaultAdapter), adapter)) || this;
    }
    Object.defineProperty(MDCRadioFoundation, "cssClasses", {
        get: function () {
            return cssClasses$a;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCRadioFoundation, "strings", {
        get: function () {
            return strings$8;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCRadioFoundation, "defaultAdapter", {
        get: function () {
            return {
                addClass: function () { return undefined; },
                removeClass: function () { return undefined; },
                setNativeControlDisabled: function () { return undefined; },
            };
        },
        enumerable: true,
        configurable: true
    });
    MDCRadioFoundation.prototype.setDisabled = function (disabled) {
        var DISABLED = MDCRadioFoundation.cssClasses.DISABLED;
        this.adapter.setNativeControlDisabled(disabled);
        if (disabled) {
            this.adapter.addClass(DISABLED);
        }
        else {
            this.adapter.removeClass(DISABLED);
        }
    };
    return MDCRadioFoundation;
}(MDCFoundation));

/**
 * @fires checked
 * @soyCompatible
 */
class RadioBase extends FormElement {
    constructor() {
        super(...arguments);
        this._checked = false;
        this.global = false;
        this.disabled = false;
        this.value = '';
        this.name = '';
        /**
         * Touch target extends beyond visual boundary of a component by default.
         * Set to `true` to remove touch target added to the component.
         * @see https://material.io/design/usability/accessibility.html
         */
        this.reducedTouchTarget = false;
        this.mdcFoundationClass = MDCRadioFoundation;
        /**
         * input's tabindex is updated based on checked status.
         * Tab navigation will be removed from unchecked radios.
         */
        this.formElementTabIndex = 0;
        this.shouldRenderRipple = false;
        this.rippleElement = null;
        this.rippleHandlers = new RippleHandlers(() => {
            this.shouldRenderRipple = true;
            this.ripple.then((v) => {
                this.rippleElement = v;
            });
            return this.ripple;
        });
    }
    get checked() {
        return this._checked;
    }
    /**
     * We define our own getter/setter for `checked` because we need to track
     * changes to it synchronously.
     *
     * The order in which the `checked` property is set across radio buttons
     * within the same group is very important. However, we can't rely on
     * UpdatingElement's `updated` callback to observe these changes (which is
     * also what the `@observer` decorator uses), because it batches changes to
     * all properties.
     *
     * Consider:
     *
     *   radio1.disabled = true;
     *   radio2.checked = true;
     *   radio1.checked = true;
     *
     * In this case we'd first see all changes for radio1, and then for radio2,
     * and we couldn't tell that radio1 was the most recently checked.
     */
    set checked(isChecked) {
        var _a, _b;
        const oldValue = this._checked;
        if (isChecked === oldValue) {
            return;
        }
        this._checked = isChecked;
        if (this.formElement) {
            this.formElement.checked = isChecked;
        }
        (_a = this._selectionController) === null || _a === void 0 ? void 0 : _a.update(this);
        if (isChecked === false) {
            // Remove focus ring when unchecked on other radio programmatically.
            // Blur on input since this determines the focus style.
            (_b = this.formElement) === null || _b === void 0 ? void 0 : _b.blur();
        }
        this.requestUpdate('checked', oldValue);
        // useful when unchecks self and wrapping element needs to synchronize
        // TODO(b/168543810): Remove triggering event on programmatic API call.
        this.dispatchEvent(new Event('checked', { bubbles: true, composed: true }));
    }
    _handleUpdatedValue(newValue) {
        // the observer function can't access protected fields (according to
        // closure compiler) because it's not a method on the class, so we need this
        // wrapper.
        this.formElement.value = newValue;
    }
    /** @soyTemplate */
    renderRipple() {
        return this.shouldRenderRipple ?
            html$2 `<mwc-ripple unbounded accent .disabled="${this.disabled}"></mwc-ripple>` :
            '';
    }
    get isRippleActive() {
        var _a;
        return ((_a = this.rippleElement) === null || _a === void 0 ? void 0 : _a.isActive) || false;
    }
    connectedCallback() {
        super.connectedCallback();
        // Note that we must defer creating the selection controller until the
        // element has connected, because selection controllers are keyed by the
        // radio's shadow root. For example, if we're stamping in a lit-html map
        // or repeat, then we'll be constructed before we're added to a root node.
        //
        // Also note if we aren't using native shadow DOM, we still need a
        // SelectionController, because we should update checked status of other
        // radios in the group when selection changes. It also simplifies
        // implementation and testing to use one in all cases.
        //
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        this._selectionController = SingleSelectionController.getController(this);
        this._selectionController.register(this);
        // Radios maybe checked before connected, update selection as soon it is
        // connected to DOM. Last checked radio button in the DOM will be selected.
        //
        // NOTE: If we update selection only after firstUpdate() we might mistakenly
        // update checked status before other radios are rendered.
        this._selectionController.update(this);
    }
    disconnectedCallback() {
        // The controller is initialized in connectedCallback, so if we are in
        // disconnectedCallback then it must be initialized.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._selectionController.unregister(this);
        this._selectionController = undefined;
    }
    focus() {
        this.formElement.focus();
    }
    createAdapter() {
        return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { setNativeControlDisabled: (disabled) => {
                this.formElement.disabled = disabled;
            } });
    }
    handleFocus() {
        this.handleRippleFocus();
    }
    handleClick() {
        // Firefox has weird behavior with radios if they are not focused
        this.formElement.focus();
    }
    handleBlur() {
        this.formElement.blur();
        this.rippleHandlers.endFocus();
    }
    /**
     * @soyTemplate
     * @soyAttributes radioAttributes: input
     * @soyClasses radioClasses: .mdc-radio
     */
    render() {
        /** @classMap */
        const classes = {
            'mdc-radio--touch': !this.reducedTouchTarget,
            'mdc-radio--disabled': this.disabled,
        };
        return html$2 `
      <div class="mdc-radio ${classMap(classes)}">
        <input
          tabindex="${this.formElementTabIndex}"
          class="mdc-radio__native-control"
          type="radio"
          name="${this.name}"
          .checked="${this.checked}"
          .value="${this.value}"
          ?disabled="${this.disabled}"
          @change="${this.changeHandler}"
          @focus="${this.handleFocus}"
          @click="${this.handleClick}"
          @blur="${this.handleBlur}"
          @mousedown="${this.handleRippleMouseDown}"
          @mouseenter="${this.handleRippleMouseEnter}"
          @mouseleave="${this.handleRippleMouseLeave}"
          @touchstart="${this.handleRippleTouchStart}"
          @touchend="${this.handleRippleDeactivate}"
          @touchcancel="${this.handleRippleDeactivate}">
        <div class="mdc-radio__background">
          <div class="mdc-radio__outer-circle"></div>
          <div class="mdc-radio__inner-circle"></div>
        </div>
        ${this.renderRipple()}
      </div>`;
    }
    handleRippleMouseDown(event) {
        const onUp = () => {
            window.removeEventListener('mouseup', onUp);
            this.handleRippleDeactivate();
        };
        window.addEventListener('mouseup', onUp);
        this.rippleHandlers.startPress(event);
    }
    handleRippleTouchStart(event) {
        this.rippleHandlers.startPress(event);
    }
    handleRippleDeactivate() {
        this.rippleHandlers.endPress();
    }
    handleRippleMouseEnter() {
        this.rippleHandlers.startHover();
    }
    handleRippleMouseLeave() {
        this.rippleHandlers.endHover();
    }
    handleRippleFocus() {
        this.rippleHandlers.startFocus();
    }
    changeHandler() {
        this.checked = this.formElement.checked;
    }
}
__decorate([
    query('.mdc-radio')
], RadioBase.prototype, "mdcRoot", void 0);
__decorate([
    query('input')
], RadioBase.prototype, "formElement", void 0);
__decorate([
    property({ type: Boolean })
], RadioBase.prototype, "global", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], RadioBase.prototype, "checked", null);
__decorate([
    property({ type: Boolean }),
    observer(function (disabled) {
        this.mdcFoundation.setDisabled(disabled);
    })
], RadioBase.prototype, "disabled", void 0);
__decorate([
    property({ type: String }),
    observer(function (value) {
        this._handleUpdatedValue(value);
    })
], RadioBase.prototype, "value", void 0);
__decorate([
    property({ type: String })
], RadioBase.prototype, "name", void 0);
__decorate([
    property({ type: Boolean })
], RadioBase.prototype, "reducedTouchTarget", void 0);
__decorate([
    property({ type: Number })
], RadioBase.prototype, "formElementTabIndex", void 0);
__decorate([
    internalProperty()
], RadioBase.prototype, "shouldRenderRipple", void 0);
__decorate([
    queryAsync('mwc-ripple')
], RadioBase.prototype, "ripple", void 0);
__decorate([
    eventOptions({ passive: true })
], RadioBase.prototype, "handleRippleTouchStart", null);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$b = css `.mdc-touch-target-wrapper{display:inline}.mdc-radio{padding:10px;display:inline-block;position:relative;flex:0 0 auto;box-sizing:content-box;width:20px;height:20px;cursor:pointer;will-change:opacity,transform,border-color,color}.mdc-radio .mdc-radio__native-control:enabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle{border-color:rgba(0, 0, 0, 0.54)}.mdc-radio .mdc-radio__native-control:enabled:checked+.mdc-radio__background .mdc-radio__outer-circle{border-color:#018786;border-color:var(--mdc-theme-secondary, #018786)}.mdc-radio .mdc-radio__native-control:enabled+.mdc-radio__background .mdc-radio__inner-circle{border-color:#018786;border-color:var(--mdc-theme-secondary, #018786)}.mdc-radio [aria-disabled=true] .mdc-radio__native-control:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle,.mdc-radio .mdc-radio__native-control:disabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle{border-color:rgba(0, 0, 0, 0.38)}.mdc-radio [aria-disabled=true] .mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__outer-circle,.mdc-radio .mdc-radio__native-control:disabled:checked+.mdc-radio__background .mdc-radio__outer-circle{border-color:rgba(0, 0, 0, 0.38)}.mdc-radio [aria-disabled=true] .mdc-radio__native-control+.mdc-radio__background .mdc-radio__inner-circle,.mdc-radio .mdc-radio__native-control:disabled+.mdc-radio__background .mdc-radio__inner-circle{border-color:rgba(0, 0, 0, 0.38)}.mdc-radio .mdc-radio__background::before{background-color:#018786;background-color:var(--mdc-theme-secondary, #018786)}.mdc-radio .mdc-radio__background::before{top:-10px;left:-10px;width:40px;height:40px}.mdc-radio .mdc-radio__native-control{top:0px;right:0px;left:0px;width:40px;height:40px}@media screen and (-ms-high-contrast: active){.mdc-radio [aria-disabled=true] .mdc-radio__native-control:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle,.mdc-radio .mdc-radio__native-control:disabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle{border-color:GrayText}.mdc-radio [aria-disabled=true] .mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__outer-circle,.mdc-radio .mdc-radio__native-control:disabled:checked+.mdc-radio__background .mdc-radio__outer-circle{border-color:GrayText}.mdc-radio [aria-disabled=true] .mdc-radio__native-control+.mdc-radio__background .mdc-radio__inner-circle,.mdc-radio .mdc-radio__native-control:disabled+.mdc-radio__background .mdc-radio__inner-circle{border-color:GrayText}}.mdc-radio__background{display:inline-block;position:relative;box-sizing:border-box;width:20px;height:20px}.mdc-radio__background::before{position:absolute;transform:scale(0, 0);border-radius:50%;opacity:0;pointer-events:none;content:"";transition:opacity 120ms 0ms cubic-bezier(0.4, 0, 0.6, 1),transform 120ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-radio__outer-circle{position:absolute;top:0;left:0;box-sizing:border-box;width:100%;height:100%;border-width:2px;border-style:solid;border-radius:50%;transition:border-color 120ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-radio__inner-circle{position:absolute;top:0;left:0;box-sizing:border-box;width:100%;height:100%;transform:scale(0, 0);border-width:10px;border-style:solid;border-radius:50%;transition:transform 120ms 0ms cubic-bezier(0.4, 0, 0.6, 1),border-color 120ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-radio__native-control{position:absolute;margin:0;padding:0;opacity:0;cursor:inherit;z-index:1}.mdc-radio--touch{margin-top:4px;margin-bottom:4px;margin-right:4px;margin-left:4px}.mdc-radio--touch .mdc-radio__native-control{top:-4px;right:-4px;left:-4px;width:48px;height:48px}.mdc-radio__native-control:checked+.mdc-radio__background,.mdc-radio__native-control:disabled+.mdc-radio__background{transition:opacity 120ms 0ms cubic-bezier(0, 0, 0.2, 1),transform 120ms 0ms cubic-bezier(0, 0, 0.2, 1)}.mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__outer-circle,.mdc-radio__native-control:disabled+.mdc-radio__background .mdc-radio__outer-circle{transition:border-color 120ms 0ms cubic-bezier(0, 0, 0.2, 1)}.mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__inner-circle,.mdc-radio__native-control:disabled+.mdc-radio__background .mdc-radio__inner-circle{transition:transform 120ms 0ms cubic-bezier(0, 0, 0.2, 1),border-color 120ms 0ms cubic-bezier(0, 0, 0.2, 1)}.mdc-radio--disabled{cursor:default;pointer-events:none}.mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__inner-circle{transform:scale(0.5);transition:transform 120ms 0ms cubic-bezier(0, 0, 0.2, 1),border-color 120ms 0ms cubic-bezier(0, 0, 0.2, 1)}.mdc-radio__native-control:disabled+.mdc-radio__background,[aria-disabled=true] .mdc-radio__native-control+.mdc-radio__background{cursor:default}.mdc-radio__native-control:focus+.mdc-radio__background::before{transform:scale(1);opacity:.12;transition:opacity 120ms 0ms cubic-bezier(0, 0, 0.2, 1),transform 120ms 0ms cubic-bezier(0, 0, 0.2, 1)}:host{display:inline-block;outline:none}.mdc-radio{vertical-align:bottom}.mdc-radio .mdc-radio__native-control:enabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle{border-color:var(--mdc-radio-unchecked-color, rgba(0, 0, 0, 0.54))}.mdc-radio [aria-disabled=true] .mdc-radio__native-control:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle,.mdc-radio .mdc-radio__native-control:disabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle{border-color:var(--mdc-radio-disabled-color, rgba(0, 0, 0, 0.38))}.mdc-radio [aria-disabled=true] .mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__outer-circle,.mdc-radio .mdc-radio__native-control:disabled:checked+.mdc-radio__background .mdc-radio__outer-circle{border-color:var(--mdc-radio-disabled-color, rgba(0, 0, 0, 0.38))}.mdc-radio [aria-disabled=true] .mdc-radio__native-control+.mdc-radio__background .mdc-radio__inner-circle,.mdc-radio .mdc-radio__native-control:disabled+.mdc-radio__background .mdc-radio__inner-circle{border-color:var(--mdc-radio-disabled-color, rgba(0, 0, 0, 0.38))}`;

let Radio = class Radio extends RadioBase {
};
Radio.styles = style$b;
Radio = __decorate([
    customElement('mwc-radio')
], Radio);

var locale$1 = {
  pleaseSpecify: 'please specify'
};

// const options = [{ code: 1, label: 'first option', specify: true }, { code: 2, label: 'second option' }, { code: 3, label: 'last' }];

class PwiRadioGroup extends EnableTranslation(PwiGenericGroup, locale$1) {

  // static get _styles() {
  //   return css `
  //   :host {
  //     display: block;
  //   }
  //   `;
  // }

  static get properties() {
    return {
      ...super.properties,

      /*
       * `options` the options to render
       */
      options: {
        type: Array,
      },

      /*
       * `name` name for radio
       */
      name: {
        type: String,
      },

      selected: {
        type: String
      },

      // Note(cg): object containg values of 'plese specify fields'.
      specify: {
        type: String
      }


    };
  }

  set selected(value) {
    // const old = this._value;
    this._value = value;
    const selectedItem = this._queryItem(`[value="${value}"]`);
    if (selectedItem) { selectedItem.checked = true; }

    this.requestUpdate();
  }

  get selected() {
    return this._selectedValue;
  }

  get formElement() {
    return this.renderRoot.querySelector('pwi-pseudo-input');
  }

  constructor() {
    super();
    // this.options = options;
    this.name = '__';
    // Note(cg): see. https://github.com/material-components/material-components-web-components/tree/master/packages/textfield
    this.validityTransform = (value, validity) => {
      value = this.selected;
      if (this.required && (value === '' || value === undefined)) {
        validity.valid = false;
        validity.valueMissing = true;
        validity.customError = 'this field is required';
        return validity;
      }
      return validity;
    };
  }

  renderInput() {
    const showValidationMessage = this.validationMessage && !this.isUiValid;
    return html$2 `
      <pwi-pseudo-input
        part="pwi-group-container"
        role="radiogroup"
        aria-labelledby="label"
        aria-describedby="${
        ifDefined(
            this.focused || this.helperPersistent || showValidationMessage ?
                'helper-text' :
                undefined)}"
        >${
          (this.options || []).map((option, index) => html$2`
            <div><pwi-formfield label="${option.label}">
              <pwi-radio 
                name="${option.name || this.name}" 
                value="${option.code}" 
                ?checked="${option.code + '' === this._value}"
                ?disabled="${this.disabled || this.readonly || option.disabled}"
                aria-controls=${ifDefined(option.specify ? `specify${index}` : undefined)} 
                ></pwi-radio>
            </pwi-formfield>${this.renderSpecify(option, index)}</div>`)
        }<slot></slot></pwi-pseudo-input>
      `;
  }
  
  renderSpecify(option, index) {
    const code = option.code || index;
    return (option.specify === true) && (this.isCodeSelected(this._value, code)) ?
      html$2 `<pwi-textfield
          id="specify${index}" 
          class="specify"
          .label="${option.specifyLabel || this.translate('pleaseSpecify')}" 
          @value-changed="${e => {this.specify = e.detail.value; this.onSpecifyChange();}}" 
          .value="${this.specify}"></pwi-textfield>` :
      '';
  }
  
  isCodeSelected(value, code) {
    return value === code + '';
  }
  
  onSpecifyChange() {
    // console.info('specify change: ', this.specify);
    this.dispatchEvent(new CustomEvent('specify-changed', { detail: { value: this.specify } }));
  }

  
}

customElements.define('pwi-radio-group', PwiRadioGroup);

/** @soyCompatible */
class CheckboxBase extends FormElement {
    constructor() {
        super(...arguments);
        this.checked = false;
        this.indeterminate = false;
        this.disabled = false;
        this.value = '';
        /**
         * Touch target extends beyond visual boundary of a component by default.
         * Set to `true` to remove touch target added to the component.
         * @see https://material.io/design/usability/accessibility.html
         */
        this.reducedTouchTarget = false;
        this.animationClass = '';
        this.shouldRenderRipple = false;
        this.focused = false;
        // MDC Foundation is unused
        this.mdcFoundationClass = undefined;
        this.mdcFoundation = undefined;
        this.rippleElement = null;
        this.rippleHandlers = new RippleHandlers(() => {
            this.shouldRenderRipple = true;
            this.ripple.then((v) => this.rippleElement = v);
            return this.ripple;
        });
    }
    createAdapter() {
        return {};
    }
    update(changedProperties) {
        const oldIndeterminate = changedProperties.get('indeterminate');
        const oldChecked = changedProperties.get('checked');
        const oldDisabled = changedProperties.get('disabled');
        if (oldIndeterminate !== undefined || oldChecked !== undefined ||
            oldDisabled !== undefined) {
            const oldState = this.calculateAnimationStateName(!!oldChecked, !!oldIndeterminate, !!oldDisabled);
            const newState = this.calculateAnimationStateName(this.checked, this.indeterminate, this.disabled);
            this.animationClass = `${oldState}-${newState}`;
        }
        super.update(changedProperties);
    }
    calculateAnimationStateName(checked, indeterminate, disabled) {
        if (disabled) {
            return 'disabled';
        }
        else if (indeterminate) {
            return 'indeterminate';
        }
        else if (checked) {
            return 'checked';
        }
        else {
            return 'unchecked';
        }
    }
    // TODO(dfreedm): Make this use selected as a param after Polymer/internal#739
    /** @soyTemplate */
    renderRipple() {
        const selected = this.indeterminate || this.checked;
        return this.shouldRenderRipple ? html$2 `
        <mwc-ripple
          .accent="${selected}"
          .disabled="${this.disabled}"
          unbounded>
        </mwc-ripple>` :
            '';
    }
    /**
     * @soyTemplate
     * @soyAttributes checkboxAttributes: input
     * @soyClasses checkboxClasses: .mdc-checkbox
     */
    render() {
        const selected = this.indeterminate || this.checked;
        /* eslint-disable eqeqeq */
        // tslint:disable:triple-equals
        /** @classMap */
        const classes = {
            'mdc-checkbox--disabled': this.disabled,
            'mdc-checkbox--selected': selected,
            'mdc-checkbox--touch': !this.reducedTouchTarget,
            'mdc-ripple-upgraded--background-focused': this.focused,
            // transition animiation classes
            'mdc-checkbox--anim-checked-indeterminate': this.animationClass == 'checked-indeterminate',
            'mdc-checkbox--anim-checked-unchecked': this.animationClass == 'checked-unchecked',
            'mdc-checkbox--anim-indeterminate-checked': this.animationClass == 'indeterminate-checked',
            'mdc-checkbox--anim-indeterminate-unchecked': this.animationClass == 'indeterminate-unchecked',
            'mdc-checkbox--anim-unchecked-checked': this.animationClass == 'unchecked-checked',
            'mdc-checkbox--anim-unchecked-indeterminate': this.animationClass == 'unchecked-indeterminate',
        };
        // tslint:enable:triple-equals
        /* eslint-enable eqeqeq */
        const ariaChecked = this.indeterminate ? 'mixed' : undefined;
        return html$2 `
      <div class="mdc-checkbox mdc-checkbox--upgraded ${classMap(classes)}">
        <input type="checkbox"
              class="mdc-checkbox__native-control"
              aria-checked="${ifDefined(ariaChecked)}"
              data-indeterminate="${this.indeterminate ? 'true' : 'false'}"
              ?disabled="${this.disabled}"
              .indeterminate="${this.indeterminate}"
              .checked="${this.checked}"
              .value="${this.value}"
              @change="${this._changeHandler}"
              @focus="${this._handleFocus}"
              @blur="${this._handleBlur}"
              @mousedown="${this.handleRippleMouseDown}"
              @mouseenter="${this.handleRippleMouseEnter}"
              @mouseleave="${this.handleRippleMouseLeave}"
              @touchstart="${this.handleRippleTouchStart}"
              @touchend="${this.handleRippleDeactivate}"
              @touchcancel="${this.handleRippleDeactivate}">
        <div class="mdc-checkbox__background"
          @animationend="${this.resetAnimationClass}">
          <svg class="mdc-checkbox__checkmark"
              viewBox="0 0 24 24">
            <path class="mdc-checkbox__checkmark-path"
                  fill="none"
                  d="M1.73,12.91 8.1,19.28 22.79,4.59"></path>
          </svg>
          <div class="mdc-checkbox__mixedmark"></div>
        </div>
        ${this.renderRipple()}
      </div>`;
    }
    _handleFocus() {
        this.focused = true;
        this.handleRippleFocus();
    }
    _handleBlur() {
        this.focused = false;
        this.handleRippleBlur();
    }
    handleRippleMouseDown(event) {
        const onUp = () => {
            window.removeEventListener('mouseup', onUp);
            this.handleRippleDeactivate();
        };
        window.addEventListener('mouseup', onUp);
        this.rippleHandlers.startPress(event);
    }
    handleRippleTouchStart(event) {
        this.rippleHandlers.startPress(event);
    }
    handleRippleDeactivate() {
        this.rippleHandlers.endPress();
    }
    handleRippleMouseEnter() {
        this.rippleHandlers.startHover();
    }
    handleRippleMouseLeave() {
        this.rippleHandlers.endHover();
    }
    handleRippleFocus() {
        this.rippleHandlers.startFocus();
    }
    handleRippleBlur() {
        this.rippleHandlers.endFocus();
    }
    _changeHandler() {
        this.checked = this.formElement.checked;
        this.indeterminate = this.formElement.indeterminate;
    }
    resetAnimationClass() {
        this.animationClass = '';
    }
    get isRippleActive() {
        var _a;
        return ((_a = this.rippleElement) === null || _a === void 0 ? void 0 : _a.isActive) || false;
    }
}
__decorate([
    query('.mdc-checkbox')
], CheckboxBase.prototype, "mdcRoot", void 0);
__decorate([
    query('input')
], CheckboxBase.prototype, "formElement", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], CheckboxBase.prototype, "checked", void 0);
__decorate([
    property({ type: Boolean })
], CheckboxBase.prototype, "indeterminate", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], CheckboxBase.prototype, "disabled", void 0);
__decorate([
    property({ type: String })
], CheckboxBase.prototype, "value", void 0);
__decorate([
    property({ type: Boolean })
], CheckboxBase.prototype, "reducedTouchTarget", void 0);
__decorate([
    internalProperty()
], CheckboxBase.prototype, "animationClass", void 0);
__decorate([
    internalProperty()
], CheckboxBase.prototype, "shouldRenderRipple", void 0);
__decorate([
    internalProperty()
], CheckboxBase.prototype, "focused", void 0);
__decorate([
    queryAsync('mwc-ripple')
], CheckboxBase.prototype, "ripple", void 0);
__decorate([
    eventOptions({ passive: true })
], CheckboxBase.prototype, "handleRippleTouchStart", null);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$c = css `.mdc-checkbox{padding:11px;margin-top:0px;margin-bottom:0px;margin-right:0px;margin-left:0px}.mdc-checkbox .mdc-checkbox__ripple::before,.mdc-checkbox .mdc-checkbox__ripple::after{background-color:#000;background-color:var(--mdc-ripple-color, #000)}.mdc-checkbox:hover .mdc-checkbox__ripple::before,.mdc-checkbox.mdc-ripple-surface--hover .mdc-checkbox__ripple::before{opacity:0.04;opacity:var(--mdc-ripple-hover-opacity, 0.04)}.mdc-checkbox.mdc-ripple-upgraded--background-focused .mdc-checkbox__ripple::before,.mdc-checkbox:not(.mdc-ripple-upgraded):focus .mdc-checkbox__ripple::before{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-focus-opacity, 0.12)}.mdc-checkbox:not(.mdc-ripple-upgraded) .mdc-checkbox__ripple::after{transition:opacity 150ms linear}.mdc-checkbox:not(.mdc-ripple-upgraded):active .mdc-checkbox__ripple::after{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-press-opacity, 0.12)}.mdc-checkbox.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: var(--mdc-ripple-press-opacity, 0.12)}.mdc-checkbox .mdc-checkbox__native-control:checked~.mdc-checkbox__background::before,.mdc-checkbox .mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background::before,.mdc-checkbox .mdc-checkbox__native-control[data-indeterminate=true]~.mdc-checkbox__background::before{background-color:#018786;background-color:var(--mdc-theme-secondary, #018786)}.mdc-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple::before,.mdc-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple::after{background-color:#018786;background-color:var(--mdc-ripple-color, var(--mdc-theme-secondary, #018786))}.mdc-checkbox.mdc-checkbox--selected:hover .mdc-checkbox__ripple::before,.mdc-checkbox.mdc-checkbox--selected.mdc-ripple-surface--hover .mdc-checkbox__ripple::before{opacity:0.04;opacity:var(--mdc-ripple-hover-opacity, 0.04)}.mdc-checkbox.mdc-checkbox--selected.mdc-ripple-upgraded--background-focused .mdc-checkbox__ripple::before,.mdc-checkbox.mdc-checkbox--selected:not(.mdc-ripple-upgraded):focus .mdc-checkbox__ripple::before{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-focus-opacity, 0.12)}.mdc-checkbox.mdc-checkbox--selected:not(.mdc-ripple-upgraded) .mdc-checkbox__ripple::after{transition:opacity 150ms linear}.mdc-checkbox.mdc-checkbox--selected:not(.mdc-ripple-upgraded):active .mdc-checkbox__ripple::after{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-press-opacity, 0.12)}.mdc-checkbox.mdc-checkbox--selected.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: var(--mdc-ripple-press-opacity, 0.12)}.mdc-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple::before,.mdc-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple::after{background-color:#018786;background-color:var(--mdc-ripple-color, var(--mdc-theme-secondary, #018786))}.mdc-checkbox .mdc-checkbox__background{top:11px;left:11px}.mdc-checkbox .mdc-checkbox__background::before{top:-13px;left:-13px;width:40px;height:40px}.mdc-checkbox .mdc-checkbox__native-control{top:0px;right:0px;left:0px;width:40px;height:40px}.mdc-checkbox .mdc-checkbox__native-control:enabled:not(:checked):not(:indeterminate):not([data-indeterminate=true])~.mdc-checkbox__background{border-color:rgba(0, 0, 0, 0.54);border-color:var(--mdc-checkbox-unchecked-color, rgba(0, 0, 0, 0.54));background-color:transparent}.mdc-checkbox .mdc-checkbox__native-control:enabled:checked~.mdc-checkbox__background,.mdc-checkbox .mdc-checkbox__native-control:enabled:indeterminate~.mdc-checkbox__background,.mdc-checkbox .mdc-checkbox__native-control[data-indeterminate=true]:enabled~.mdc-checkbox__background{border-color:#018786;border-color:var(--mdc-checkbox-checked-color, var(--mdc-theme-secondary, #018786));background-color:#018786;background-color:var(--mdc-checkbox-checked-color, var(--mdc-theme-secondary, #018786))}@keyframes mdc-checkbox-fade-in-background-8A000000FF01878600000000FF018786{0%{border-color:rgba(0, 0, 0, 0.54);border-color:var(--mdc-checkbox-unchecked-color, rgba(0, 0, 0, 0.54));background-color:transparent}50%{border-color:#018786;border-color:var(--mdc-checkbox-checked-color, var(--mdc-theme-secondary, #018786));background-color:#018786;background-color:var(--mdc-checkbox-checked-color, var(--mdc-theme-secondary, #018786))}}@keyframes mdc-checkbox-fade-out-background-8A000000FF01878600000000FF018786{0%,80%{border-color:#018786;border-color:var(--mdc-checkbox-checked-color, var(--mdc-theme-secondary, #018786));background-color:#018786;background-color:var(--mdc-checkbox-checked-color, var(--mdc-theme-secondary, #018786))}100%{border-color:rgba(0, 0, 0, 0.54);border-color:var(--mdc-checkbox-unchecked-color, rgba(0, 0, 0, 0.54));background-color:transparent}}.mdc-checkbox.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background,.mdc-checkbox.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__native-control:enabled~.mdc-checkbox__background{animation-name:mdc-checkbox-fade-in-background-8A000000FF01878600000000FF018786}.mdc-checkbox.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background,.mdc-checkbox.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background{animation-name:mdc-checkbox-fade-out-background-8A000000FF01878600000000FF018786}.mdc-checkbox .mdc-checkbox__native-control[disabled]:not(:checked):not(:indeterminate):not([data-indeterminate=true])~.mdc-checkbox__background{border-color:rgba(0, 0, 0, 0.38);border-color:var(--mdc-checkbox-disabled-color, rgba(0, 0, 0, 0.38));background-color:transparent}.mdc-checkbox .mdc-checkbox__native-control[disabled]:checked~.mdc-checkbox__background,.mdc-checkbox .mdc-checkbox__native-control[disabled]:indeterminate~.mdc-checkbox__background,.mdc-checkbox .mdc-checkbox__native-control[data-indeterminate=true][disabled]~.mdc-checkbox__background{border-color:transparent;background-color:rgba(0, 0, 0, 0.38);background-color:var(--mdc-checkbox-disabled-color, rgba(0, 0, 0, 0.38))}.mdc-checkbox .mdc-checkbox__native-control:enabled~.mdc-checkbox__background .mdc-checkbox__checkmark{color:#fff;color:var(--mdc-checkbox-ink-color, #fff)}.mdc-checkbox .mdc-checkbox__native-control:enabled~.mdc-checkbox__background .mdc-checkbox__mixedmark{border-color:#fff;border-color:var(--mdc-checkbox-ink-color, #fff)}.mdc-checkbox .mdc-checkbox__native-control:disabled~.mdc-checkbox__background .mdc-checkbox__checkmark{color:#fff;color:var(--mdc-checkbox-ink-color, #fff)}.mdc-checkbox .mdc-checkbox__native-control:disabled~.mdc-checkbox__background .mdc-checkbox__mixedmark{border-color:#fff;border-color:var(--mdc-checkbox-ink-color, #fff)}.mdc-touch-target-wrapper{display:inline}@keyframes mdc-checkbox-unchecked-checked-checkmark-path{0%,50%{stroke-dashoffset:29.7833385}50%{animation-timing-function:cubic-bezier(0, 0, 0.2, 1)}100%{stroke-dashoffset:0}}@keyframes mdc-checkbox-unchecked-indeterminate-mixedmark{0%,68.2%{transform:scaleX(0)}68.2%{animation-timing-function:cubic-bezier(0, 0, 0, 1)}100%{transform:scaleX(1)}}@keyframes mdc-checkbox-checked-unchecked-checkmark-path{from{animation-timing-function:cubic-bezier(0.4, 0, 1, 1);opacity:1;stroke-dashoffset:0}to{opacity:0;stroke-dashoffset:-29.7833385}}@keyframes mdc-checkbox-checked-indeterminate-checkmark{from{animation-timing-function:cubic-bezier(0, 0, 0.2, 1);transform:rotate(0deg);opacity:1}to{transform:rotate(45deg);opacity:0}}@keyframes mdc-checkbox-indeterminate-checked-checkmark{from{animation-timing-function:cubic-bezier(0.14, 0, 0, 1);transform:rotate(45deg);opacity:0}to{transform:rotate(360deg);opacity:1}}@keyframes mdc-checkbox-checked-indeterminate-mixedmark{from{animation-timing-function:mdc-animation-deceleration-curve-timing-function;transform:rotate(-45deg);opacity:0}to{transform:rotate(0deg);opacity:1}}@keyframes mdc-checkbox-indeterminate-checked-mixedmark{from{animation-timing-function:cubic-bezier(0.14, 0, 0, 1);transform:rotate(0deg);opacity:1}to{transform:rotate(315deg);opacity:0}}@keyframes mdc-checkbox-indeterminate-unchecked-mixedmark{0%{animation-timing-function:linear;transform:scaleX(1);opacity:1}32.8%,100%{transform:scaleX(0);opacity:0}}.mdc-checkbox{display:inline-block;position:relative;flex:0 0 18px;box-sizing:content-box;width:18px;height:18px;line-height:0;white-space:nowrap;cursor:pointer;vertical-align:bottom}@media screen and (-ms-high-contrast: active){.mdc-checkbox__native-control[disabled]:not(:checked):not(:indeterminate):not([data-indeterminate=true])~.mdc-checkbox__background{border-color:GrayText;border-color:var(--mdc-checkbox-disabled-color, GrayText);background-color:transparent}.mdc-checkbox__native-control[disabled]:checked~.mdc-checkbox__background,.mdc-checkbox__native-control[disabled]:indeterminate~.mdc-checkbox__background,.mdc-checkbox__native-control[data-indeterminate=true][disabled]~.mdc-checkbox__background{border-color:GrayText;background-color:transparent;background-color:var(--mdc-checkbox-disabled-color, transparent)}.mdc-checkbox__native-control:disabled~.mdc-checkbox__background .mdc-checkbox__checkmark{color:GrayText;color:var(--mdc-checkbox-ink-color, GrayText)}.mdc-checkbox__native-control:disabled~.mdc-checkbox__background .mdc-checkbox__mixedmark{border-color:GrayText;border-color:var(--mdc-checkbox-ink-color, GrayText)}.mdc-checkbox__mixedmark{margin:0 1px}}.mdc-checkbox--disabled{cursor:default;pointer-events:none}.mdc-checkbox__background{display:inline-flex;position:absolute;align-items:center;justify-content:center;box-sizing:border-box;width:18px;height:18px;border:2px solid currentColor;border-radius:2px;background-color:transparent;pointer-events:none;will-change:background-color,border-color;transition:background-color 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1),border-color 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-checkbox__background .mdc-checkbox__background::before{background-color:#000;background-color:var(--mdc-theme-on-surface, #000)}.mdc-checkbox__checkmark{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;opacity:0;transition:opacity 180ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-checkbox--upgraded .mdc-checkbox__checkmark{opacity:1}.mdc-checkbox__checkmark-path{transition:stroke-dashoffset 180ms 0ms cubic-bezier(0.4, 0, 0.6, 1);stroke:currentColor;stroke-width:3.12px;stroke-dashoffset:29.7833385;stroke-dasharray:29.7833385}.mdc-checkbox__mixedmark{width:100%;height:0;transform:scaleX(0) rotate(0deg);border-width:1px;border-style:solid;opacity:0;transition:opacity 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1),transform 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__background,.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__background,.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__background,.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__background{animation-duration:180ms;animation-timing-function:linear}.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__checkmark-path{animation:mdc-checkbox-unchecked-checked-checkmark-path 180ms linear 0s;transition:none}.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__mixedmark{animation:mdc-checkbox-unchecked-indeterminate-mixedmark 90ms linear 0s;transition:none}.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__checkmark-path{animation:mdc-checkbox-checked-unchecked-checkmark-path 90ms linear 0s;transition:none}.mdc-checkbox--anim-checked-indeterminate .mdc-checkbox__checkmark{animation:mdc-checkbox-checked-indeterminate-checkmark 90ms linear 0s;transition:none}.mdc-checkbox--anim-checked-indeterminate .mdc-checkbox__mixedmark{animation:mdc-checkbox-checked-indeterminate-mixedmark 90ms linear 0s;transition:none}.mdc-checkbox--anim-indeterminate-checked .mdc-checkbox__checkmark{animation:mdc-checkbox-indeterminate-checked-checkmark 500ms linear 0s;transition:none}.mdc-checkbox--anim-indeterminate-checked .mdc-checkbox__mixedmark{animation:mdc-checkbox-indeterminate-checked-mixedmark 500ms linear 0s;transition:none}.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__mixedmark{animation:mdc-checkbox-indeterminate-unchecked-mixedmark 300ms linear 0s;transition:none}.mdc-checkbox__native-control:checked~.mdc-checkbox__background,.mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background,.mdc-checkbox__native-control[data-indeterminate=true]~.mdc-checkbox__background{transition:border-color 90ms 0ms cubic-bezier(0, 0, 0.2, 1),background-color 90ms 0ms cubic-bezier(0, 0, 0.2, 1)}.mdc-checkbox__native-control:checked~.mdc-checkbox__background .mdc-checkbox__checkmark-path,.mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background .mdc-checkbox__checkmark-path,.mdc-checkbox__native-control[data-indeterminate=true]~.mdc-checkbox__background .mdc-checkbox__checkmark-path{stroke-dashoffset:0}.mdc-checkbox__background::before{position:absolute;transform:scale(0, 0);border-radius:50%;opacity:0;pointer-events:none;content:"";will-change:opacity,transform;transition:opacity 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1),transform 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-checkbox__native-control:focus~.mdc-checkbox__background::before{transform:scale(1);opacity:.12;transition:opacity 80ms 0ms cubic-bezier(0, 0, 0.2, 1),transform 80ms 0ms cubic-bezier(0, 0, 0.2, 1)}.mdc-checkbox__native-control{position:absolute;margin:0;padding:0;opacity:0;cursor:inherit}.mdc-checkbox__native-control:disabled{cursor:default;pointer-events:none}.mdc-checkbox--touch{margin-top:4px;margin-bottom:4px;margin-right:4px;margin-left:4px}.mdc-checkbox--touch .mdc-checkbox__native-control{top:-4px;right:-4px;left:-4px;width:48px;height:48px}.mdc-checkbox__native-control:checked~.mdc-checkbox__background .mdc-checkbox__checkmark{transition:opacity 180ms 0ms cubic-bezier(0, 0, 0.2, 1),transform 180ms 0ms cubic-bezier(0, 0, 0.2, 1);opacity:1}.mdc-checkbox__native-control:checked~.mdc-checkbox__background .mdc-checkbox__mixedmark{transform:scaleX(1) rotate(-45deg)}.mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background .mdc-checkbox__checkmark,.mdc-checkbox__native-control[data-indeterminate=true]~.mdc-checkbox__background .mdc-checkbox__checkmark{transform:rotate(45deg);opacity:0;transition:opacity 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1),transform 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background .mdc-checkbox__mixedmark,.mdc-checkbox__native-control[data-indeterminate=true]~.mdc-checkbox__background .mdc-checkbox__mixedmark{transform:scaleX(1) rotate(0deg);opacity:1}.mdc-checkbox.mdc-checkbox--upgraded .mdc-checkbox__background,.mdc-checkbox.mdc-checkbox--upgraded .mdc-checkbox__checkmark,.mdc-checkbox.mdc-checkbox--upgraded .mdc-checkbox__checkmark-path,.mdc-checkbox.mdc-checkbox--upgraded .mdc-checkbox__mixedmark{transition:none}:host{outline:none;display:inline-flex;-webkit-tap-highlight-color:transparent}.mdc-checkbox .mdc-checkbox__background::before{content:none}`;

/** @soyCompatible */
let Checkbox = class Checkbox extends CheckboxBase {
};
Checkbox.styles = style$c;
Checkbox = __decorate([
    customElement('mwc-checkbox')
], Checkbox);

var locale$2 = {
  pleaseSpecify: 'please specify'
};

class PwiCheckboxGroup extends EnableTranslation(PwiGenericGroup, locale$2) {

  static get properties() {
    return {
      ...super.properties,

      /*
       * `options` the options to render
       */
      options: {
        type: Array,
      },

      /*
       * `name` name for radio
       */
      name: {
        type: String,
      },

      // Note(cg): an array containing all values.
      selected: {
        type: Array
      },

      // Note(cg): object containg values of 'plese specify fields'.
      specify: {
        type: Object
      }

    };
  }

  set selected(value) {
    const old = this._value;
    [...this._queryItems(['mwc-checkbox'])].forEach(check => check.checked = (value || []).indexOf(check.value) > -1);
    this._value = value;
    this.requestUpdate('selected', old);
  }

  get selected() {
    return this._selectedValues;
  }

  isCodeSelected(value, code) {
    return (value || []).indexOf(code + '') > -1;
  }

  // get _selectedValue() {
  //   return [...this._selectedItems].map(item => item.value);
  // }

  get formElement() {
    return this.renderRoot.querySelector('pwi-pseudo-input');
  }

  constructor() {
    super();
    this.specify = {};
     // Note(cg): see. https://github.com/material-components/material-components-web-components/tree/master/packages/textfield
    this.validityTransform = (value, validity) => {
      value = this.selected;
      if (this.required && (!value || value.length === 0)) {
        validity.valid = false;
        validity.valueMissing = true;
        validity.customError = 'this field is required';
        return validity;
      }
      return validity;
    };
    // this.options = options;
    // this.name = '__';
  }

  renderInput() {
    const showValidationMessage = this.validationMessage && !this.isUiValid;
    return html$2 `
      <pwi-pseudo-input
        part="pwi-group-container"
        role="group"
        aria-labelledby="label"
        aria-describedby="${
        ifDefined(
            this.focused || this.helperPersistent || showValidationMessage ?
                'helper-text' :
                undefined)}"
        >${
          (this.options || []).map((option, index) => html$2`
            <div><pwi-formfield label="${option.label}">
              <pwi-checkbox 
                value="${option.code}" 
                ?checked="${this.isCodeSelected(this._value, option.code)}"
                ?disabled="${this.disabled || this.readonly || option.disabled}"
                aria-controls=${ifDefined(option.specify ? `specify${index}` : undefined)} 
                ></pwi-checkbox>
            </pwi-formfield>${this.renderSpecify(option, index)}</div>`)
        }<slot></slot></pwi-pseudo-input>
      `;
  }

  renderSpecify(option, index) {
    const code = option.code || index;
    return (option.specify === true) && (this.isCodeSelected(this._value, code)) ?
      html$2 `<pwi-textfield 
          id="specify${index}" 
          class="specify"
          .label="${option.specifyLabel || this.translate('pleaseSpecify')}" 
          @value-changed="${e => {this.specify[code] = e.detail.value; this.onSpecifyChange();}}" 
          .value="${this.specify[code]}"></pwi-textfield>` :
      '';
  }

  onSpecifyChange() {
    // Note(cg): we need specify as a new Object, otherwise change is not notified upstream
    // with Polymer.
    this.specify = Object.assign({}, this.specify);
    this.dispatchEvent(new CustomEvent('specify-changed', { detail: {value: this.specify}}));
  }

}

customElements.define('pwi-checkbox-group', PwiCheckboxGroup);

class PwiFormUpload extends doNotSetUndefinedValue(PwiAccessibleTextfield) {

  static get styles() {
    return [super.styles, css `
    :host {
      width: 100%;
    }

    :host(:hover:not([focused]):not([disabled]):not([invalid])) .mdc-text-field .label-above {
     color: var(--mdc-theme-text-primary-on-background);
    }

    .mdc-text-field {
      height: initial;
      position: relative;
      display: inline-block;
    }

    :host(:not([disabled])) .mdc-text-field:not(.mdc-text-field--outlined) {
        background-color: initial;
    }

    .mdc-text-field--filled:before {
      display: none;
    }


     .mdc-line-ripple:before {
       opacity: 0;
     }

     :host(:hover) .mdc-line-ripple:before {
       opacity: 0.2;
     }

    /* Option container layout  */
    pwi-pseudo-input {
      display: block;
      padding-top: var(--space-xx-small);
      padding-bottom: var(--space-small);
    }

    pwi-pseudo-input:focus {
      outline: none;
    }

    firebase-document-upload {
      background-color: var(--color-primary-background);
      z-index: var(--z-index-default);
    }
    
    `];
  }

  static get properties() {
    return {

      ...super.properties,

      focused: {
        type: Boolean,
        reflect: true
      },

      invalid: {
        type: Boolean,
        reflect: true
      },

      disabled: {
        type: Boolean,
        reflect: true
      },

      /*
       * `path` where firebase metaData is stored.
       */
      path: {
        type: String,

      },

      /*
       * `appName` name of firebaseApp
       */
      appName: {
        type: String,
      },

      /*
       * `metaData` (name, path, type, timestamp) stored in firebase
       */
      metaData: {
        type: Object,
        notify: true
      },

      /*
       * `store` path to set at firestore level. if not set, will deduct from meta 
       */
      store: {
        type: String,
      },

      /*
       * `fileName` the name of the file to store at firestore level. If not set, 
       * will deduct it from original filename and add a timestamp
       */
      fileName: {
        type: String,
      },

      /*
       * Limit of files to upload, by default it is unlimited. If the value is
       * set to one, native file browser will prevent selecting multiple files.
       */
      maxFiles: {
        type: Number,
      },


      /*
       * `multi` 
       */
      multi: {
        type: Boolean,
      },

      /*
       * `debug` true for debug mode
       */
      debug: {
        type: Boolean,
      },

      readonly: {
        type: Boolean,
        reflect: true
      },

      /*
       * `hideExisting` if true, will not display the list of files 
       * already present in the db. This is usefull for instance when
       * we refresh a page with an image gallery. 
       */
      hideExisting: {
        type: Boolean,
      },

      /*
       * `preventRead` if set to true, only push new files and avoid reading 
       * metaDate. This is useful in situation where we do not cound the 
       * number of files (e.g. images in a blogpost.)
       */
      preventRead: {
        type: Boolean,
      },

      /*
       * `buttonText` text on upload button
       * example: {one: 'upload image ...', many: 'upload images ...'}
       */
      buttonText: {
        type: Object,
      },

      /*
       * `dropText` text on dop button
       * example: {one: 'drop image ...', many: 'drop images ...'}
       */
      dropText: {
        type: Object,
      },

      /*
       * `uploading` flag to indicate that we are loading the image
       */
      uploading: {
        type: Number,
      },

      /*
       * `noFileExtension` set true to prevent filename extenstion to be used for 
       * storage path.
       */
      noFileExtension: {
        type: Boolean,
      },


    };
  }

  /* 
   * `formAttributes` is called when we construct the form. It returns binding attributes
   */
  static assignFormAttributes(domBind, name, item, config, attributes) {
    const state = app.getState();
    // Note(cg): for organisation manager, organisation is the active organisation stored under `organisation_mgmt`.
    const organisation = state.token && state.token.active || state.organisation;

    Object.assign(attributes, {
      // 'path': path,
      'path': `[[dataPath]]/${item.code}`,
      'store': `[[dataPath]]/${organisation}/${item.code}`
    });
    return attributes;
  }


  constructor() {
    super();
    this.labelAbove = true;
    this.addEventListener('focusin', this._onFocusin);
    this.addEventListener('focusout', this._onFocusout);
  }

  disconnectedCallback() {
    this.removeEventListener('focusin', this._onFocusin);
    this.removeEventListener('focusout', this._onFocusout);
    super.disconnectedCallback();
  }

  _onFocusout() {
    // console.info('focusout', this)
    this.focused = false;
  }

  _onFocusin() {
    // console.info('focusin', this)
    this.focused = true;
  }

  // firstUpdated() {
  //   super.firstUpdated();
  // }


  get formElement() {
    return this.renderRoot.querySelector('pwi-pseudo-input');
  }

  renderInput() {
    const showValidationMessage = this.validationMessage && !this.isUiValid;
    return html$2 `
     <pwi-pseudo-input
        tabindex="0"
        part="pwi-group-container"
        role="group"
        aria-labelledby="label"
        aria-describedby="${
        ifDefined(
            this.focused || this.helperPersistent || showValidationMessage ?
                'helper-text' :
                undefined)}"
        ><firebase-document-upload

           .path="${this.path}"
           .appName="${this.appName}"
           .metaData="${this.metaData}"
           .store="${this.store}"
           .fileName="${this.fileName}"
           .maxFiles="${this.maxFiles}"
           .multi="${this.multi}"
           .debug="${this.debug}"
           .readonly="${this.readonly}"
           .hideExisting="${this.hideExisting}"
           .preventRead="${this.preventRead}"
           .buttonText="${this.buttonText}"
           .dropText="${this.dropText}"
           .uploading="${this.uploading}"
           .noFileExtension="${this.noFileExtension}"
        ></firebase-document-upload></pwi-pseudo-input>`;
  }


}

customElements.define('pwi-form-upload', PwiFormUpload);

var styleTypography = css`
body, html {
  font-family: var(--font-family-text);
  -webkit-font-smoothing: antialiased;  /* OS X subpixel AA bleed bug */
}

/* [paper-font=display2] */
h1 {
  font-family: var(--font-family-heading, Roboto);
  font-size: var(--font-size-xxx-large, 45);
  font-weight: var(--font-weight-normal, 400);
  letter-spacing: -.018em;
  line-height: 48px;
}

/* [paper-font=display1] */
h2 {
  font-family: var(--font-family-heading, Roboto);
  font-size: var(--font-size-xx-large, 34px);
  font-weight: var(--font-weight-normal, 400);
  letter-spacing: var(--letter-spacing-heading, -.01em);
  line-height: 40px;
}

/* [paper-font=headline] */
h3 {
  font-family: var(--font-family-heading, Roboto);
  font-size: var(--font-size-x-large, 24px);
  font-weight: var(--font-weight-normal, 400);
  letter-spacing: var(--letter-spacing-heading, -.012em);
  line-height: 32px;
}

/* [paper-font=subhead] */
h4 {
  font-family: var(--font-family-heading, Roboto);
  font-size: var(--font-size-large, 16px);
  font-weight: var(--font-weight-normal, 400);
  line-height: 24px;
}

/* [paper-font=body2] */
h5, h6 {
  font-family: var(--font-family-heading, Roboto);
  font-size: var(--font-size-medium, 14px);
  font-weight: var(--font-weight-semi-bold, 500);
  line-height: 24px;
}

/* [paper-font=button] */
/*a {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.018em;
  line-height: 24px;
  text-transform: uppercase;
}*/

/* Overrides */

body {
  color: #212121;
}

h1, h2, h3, h4, h5, h6, p {
  margin: 0 0 20px 0;
}

h1, h2, h3, h4, h5, h6, a {
  text-rendering: optimizeLegibility;
}

a {
  transition: var(--transition-quickly);
  color: var(--color-primary);
}

a:hover {
  color: var(color-primary-dark);
  text-decoration: none;
}

a:active {
  transition: none;
  opacity: var(--opacity-75);
}

a[target=_blank]:after {
  content: 'open_in_new';
  font-family: var(--mdc-icon-font, "Material Icons");
  font-weight: var(--font-weight-thin, 200);
  padding-left: var(--space-xxx-small, 2px);
  line-height: 0px;
  opacity: 0.6;
  font-size: 0.9rem;
}

code {
   font-family: var(--font-family-code, Mono);
}

`;

css`
  :host([theme~="secondary"]) {
      background: var(--secondary-color);
      color: var(--primary-background-color);
      border-color: var(--primary-background-color);
    }

  :host([theme~="primary"]) {
      background: var(--primary-color);
      color: var(--primary-background-color);
      border-color: var(--primary-background-color);
    }

  :host([theme~="accent"]) {
      background: var(--accent-color);
      color: var(--primary-background-color);
      border-color: var(--primary-background-color);
    }    

`;

css`
    
    :host([theme~=badge]) {
      display: inline-block;
      overflow: hidden;
      max-width: var(--badge-max-width, 150px);
      text-overflow: ellipsis;
      white-space: nowrap;
      border-radius: 2px;
      font-size: 11px;
      padding: 2px 3px;
      cursor: pointer;
      margin-left: 2px;
      margin-right: 2px;
      vertical-align: middle;
    }

    :host([theme~=tag]) {
      padding: 5px;
      border:  1px solid;
      border-radius: 10px;
      display: inline-block;
      margin: 5px;
    }
`;

/*
  show hover will only appear on host hover, avtive or focus
 */
css `
  [show-hover] {
    transition: opacity 0.1s;
    opacity: 0;
  }
  
  :host(:hover) [show-hover], :host(:active) [show-hover], :host(:focus) [show-hover], :host([hover]) [show-hover] {
    opacity: 1;
  }
`;

/** use in template 
  <header>
    header content
  </header>
  
  <section id="main">
    <div id="content">
      content
    </div>
    <aside>
      aside content
    </aside>
  </section>

  <footer>
    footer content
  </footer>

**/

css`
   :host {
      display: flex;
      min-height: 100vh;
      flex-direction: column;
      margin: 0;
      color: var(--primary-text-color, #212121);
      --sl-aside-max-width: 380px;
    }
   
    
    header {
      text-align: center;
    }
   
    aside {
      flex: 0 0 20vw;
      max-width: var(--sl-aside-max-width);  
    }

    /* we used <div id="main"> instead of <main> 
     * because we want to keep main at appliction level.
     */
    #main {
      display: flex;
      flex: 1;
      box-sizing: border-box;
    }

    #main > * {
      box-sizing: border-box;
    }
    
    #content {
      flex: 1;
      max-width: var(--sl-content-max-width, var(--size-layout-max-width));
      margin: auto;
    }

    @media screen and (max-width: 992px) {
      #main {
        display: block;
      }
    }
  `;

// Note(cg): style for using `lite-youtube` in markdown fields.
// copied from https://github.com/paulirish/lite-youtube-embed/blob/master/src/lite-yt-embed.css
// version 0.1.2

var liteYoutube = css`
lite-youtube {
    background-color: #000;
    position: relative;
    display: block;
    contain: content;
    background-position: center center;
    background-size: cover;
    cursor: pointer;
    max-width: 720px;
}

/* gradient */
lite-youtube::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==);
    background-position: top;
    background-repeat: repeat-x;
    height: 60px;
    padding-bottom: 50px;
    width: 100%;
    transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

/* responsive iframe with a 16:9 aspect ratio
    thanks https://css-tricks.com/responsive-iframes/
*/
lite-youtube::after {
    content: "";
    display: block;
    padding-bottom: calc(100% / (16 / 9));
}
lite-youtube > iframe {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}

/* play button */
lite-youtube > .lty-playbtn {
    width: 68px;
    height: 48px;
    position: absolute;
    transform: translate3d(-50%, -50%, 0);
    top: 50%;
    left: 50%;
    z-index: 1;
    background-color: transparent;
    /* YT's actual play button svg */
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 68 48"><path fill="%23f00" fill-opacity="0.8" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"></path><path d="M 45,24 27,14 27,34" fill="%23fff"></path></svg>');
    filter: grayscale(100%);
    transition: filter .1s cubic-bezier(0, 0, 0.2, 1);
    border: none;
}

lite-youtube:hover > .lty-playbtn,
lite-youtube .lty-playbtn:focus {
    filter: none;
}

/* Post-click styles */
lite-youtube.lyt-activated {
    cursor: unset;
}
lite-youtube.lyt-activated::before,
lite-youtube.lyt-activated > .lty-playbtn {
    opacity: 0;
    pointer-events: none;
}
`;

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var cssClasses$b = {
    ACTIVE: 'mdc-tab-indicator--active',
    FADE: 'mdc-tab-indicator--fade',
    NO_TRANSITION: 'mdc-tab-indicator--no-transition',
};
var strings$9 = {
    CONTENT_SELECTOR: '.mdc-tab-indicator__content',
};

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCTabIndicatorFoundation = /** @class */ (function (_super) {
    __extends(MDCTabIndicatorFoundation, _super);
    function MDCTabIndicatorFoundation(adapter) {
        return _super.call(this, __assign(__assign({}, MDCTabIndicatorFoundation.defaultAdapter), adapter)) || this;
    }
    Object.defineProperty(MDCTabIndicatorFoundation, "cssClasses", {
        get: function () {
            return cssClasses$b;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTabIndicatorFoundation, "strings", {
        get: function () {
            return strings$9;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTabIndicatorFoundation, "defaultAdapter", {
        get: function () {
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            return {
                addClass: function () { return undefined; },
                removeClass: function () { return undefined; },
                computeContentClientRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                setContentStyleProperty: function () { return undefined; },
            };
            // tslint:enable:object-literal-sort-keys
        },
        enumerable: true,
        configurable: true
    });
    MDCTabIndicatorFoundation.prototype.computeContentClientRect = function () {
        return this.adapter.computeContentClientRect();
    };
    return MDCTabIndicatorFoundation;
}(MDCFoundation));

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/* istanbul ignore next: subclass is not a branch statement */
var MDCFadingTabIndicatorFoundation = /** @class */ (function (_super) {
    __extends(MDCFadingTabIndicatorFoundation, _super);
    function MDCFadingTabIndicatorFoundation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MDCFadingTabIndicatorFoundation.prototype.activate = function () {
        this.adapter.addClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
    };
    MDCFadingTabIndicatorFoundation.prototype.deactivate = function () {
        this.adapter.removeClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
    };
    return MDCFadingTabIndicatorFoundation;
}(MDCTabIndicatorFoundation));

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/* istanbul ignore next: subclass is not a branch statement */
var MDCSlidingTabIndicatorFoundation = /** @class */ (function (_super) {
    __extends(MDCSlidingTabIndicatorFoundation, _super);
    function MDCSlidingTabIndicatorFoundation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MDCSlidingTabIndicatorFoundation.prototype.activate = function (previousIndicatorClientRect) {
        // Early exit if no indicator is present to handle cases where an indicator
        // may be activated without a prior indicator state
        if (!previousIndicatorClientRect) {
            this.adapter.addClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
            return;
        }
        // This animation uses the FLIP approach. You can read more about it at the link below:
        // https://aerotwist.com/blog/flip-your-animations/
        // Calculate the dimensions based on the dimensions of the previous indicator
        var currentClientRect = this.computeContentClientRect();
        var widthDelta = previousIndicatorClientRect.width / currentClientRect.width;
        var xPosition = previousIndicatorClientRect.left - currentClientRect.left;
        this.adapter.addClass(MDCTabIndicatorFoundation.cssClasses.NO_TRANSITION);
        this.adapter.setContentStyleProperty('transform', "translateX(" + xPosition + "px) scaleX(" + widthDelta + ")");
        // Force repaint before updating classes and transform to ensure the transform properly takes effect
        this.computeContentClientRect();
        this.adapter.removeClass(MDCTabIndicatorFoundation.cssClasses.NO_TRANSITION);
        this.adapter.addClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
        this.adapter.setContentStyleProperty('transform', '');
    };
    MDCSlidingTabIndicatorFoundation.prototype.deactivate = function () {
        this.adapter.removeClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
    };
    return MDCSlidingTabIndicatorFoundation;
}(MDCTabIndicatorFoundation));

class TabIndicatorBase extends BaseElement {
    constructor() {
        super(...arguments);
        this.icon = '';
        this.fade = false;
    }
    get mdcFoundationClass() {
        return this.fade ? MDCFadingTabIndicatorFoundation :
            MDCSlidingTabIndicatorFoundation;
    }
    render() {
        const contentClasses = {
            'mdc-tab-indicator__content--icon': this.icon,
            'material-icons': this.icon,
            'mdc-tab-indicator__content--underline': !this.icon,
        };
        return html$2 `
      <span class="mdc-tab-indicator ${classMap({
            'mdc-tab-indicator--fade': this.fade
        })}">
        <span class="mdc-tab-indicator__content ${classMap(contentClasses)}">${this.icon}</span>
      </span>
      `;
    }
    updated(changedProperties) {
        if (changedProperties.has('fade')) {
            this.createFoundation();
        }
    }
    createAdapter() {
        return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { computeContentClientRect: () => this.contentElement.getBoundingClientRect(), setContentStyleProperty: (prop, value) => this.contentElement.style.setProperty(prop, value) });
    }
    computeContentClientRect() {
        return this.mdcFoundation.computeContentClientRect();
    }
    activate(previousIndicatorClientRect) {
        this.mdcFoundation.activate(previousIndicatorClientRect);
    }
    deactivate() {
        this.mdcFoundation.deactivate();
    }
}
__decorate([
    query('.mdc-tab-indicator')
], TabIndicatorBase.prototype, "mdcRoot", void 0);
__decorate([
    query('.mdc-tab-indicator__content')
], TabIndicatorBase.prototype, "contentElement", void 0);
__decorate([
    property()
], TabIndicatorBase.prototype, "icon", void 0);
__decorate([
    property({ type: Boolean })
], TabIndicatorBase.prototype, "fade", void 0);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$d = css `.material-icons{font-family:var(--mdc-icon-font, "Material Icons");font-weight:normal;font-style:normal;font-size:var(--mdc-icon-size, 24px);line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga"}.mdc-tab-indicator{display:flex;position:absolute;top:0;left:0;justify-content:center;width:100%;height:100%;pointer-events:none;z-index:1}.mdc-tab-indicator .mdc-tab-indicator__content--underline{border-color:#6200ee;border-color:var(--mdc-theme-primary, #6200ee)}.mdc-tab-indicator .mdc-tab-indicator__content--icon{color:#018786;color:var(--mdc-theme-secondary, #018786)}.mdc-tab-indicator .mdc-tab-indicator__content--underline{border-top-width:2px}.mdc-tab-indicator .mdc-tab-indicator__content--icon{height:34px;font-size:34px}.mdc-tab-indicator__content{transform-origin:left;opacity:0}.mdc-tab-indicator__content--underline{align-self:flex-end;box-sizing:border-box;width:100%;border-top-style:solid}.mdc-tab-indicator__content--icon{align-self:center;margin:0 auto}.mdc-tab-indicator--active .mdc-tab-indicator__content{opacity:1}.mdc-tab-indicator .mdc-tab-indicator__content{transition:250ms transform cubic-bezier(0.4, 0, 0.2, 1)}.mdc-tab-indicator--no-transition .mdc-tab-indicator__content{transition:none}.mdc-tab-indicator--fade .mdc-tab-indicator__content{transition:150ms opacity linear}.mdc-tab-indicator--active.mdc-tab-indicator--fade .mdc-tab-indicator__content{transition-delay:100ms}`;

let TabIndicator = class TabIndicator extends TabIndicatorBase {
};
TabIndicator.styles = style$d;
TabIndicator = __decorate([
    customElement('mwc-tab-indicator')
], TabIndicator);

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var cssClasses$c = {
    ACTIVE: 'mdc-tab--active',
};
var strings$a = {
    ARIA_SELECTED: 'aria-selected',
    CONTENT_SELECTOR: '.mdc-tab__content',
    INTERACTED_EVENT: 'MDCTab:interacted',
    RIPPLE_SELECTOR: '.mdc-tab__ripple',
    TABINDEX: 'tabIndex',
    TAB_INDICATOR_SELECTOR: '.mdc-tab-indicator',
};

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCTabFoundation = /** @class */ (function (_super) {
    __extends(MDCTabFoundation, _super);
    function MDCTabFoundation(adapter) {
        var _this = _super.call(this, __assign(__assign({}, MDCTabFoundation.defaultAdapter), adapter)) || this;
        _this.focusOnActivate_ = true;
        return _this;
    }
    Object.defineProperty(MDCTabFoundation, "cssClasses", {
        get: function () {
            return cssClasses$c;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTabFoundation, "strings", {
        get: function () {
            return strings$a;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTabFoundation, "defaultAdapter", {
        get: function () {
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            return {
                addClass: function () { return undefined; },
                removeClass: function () { return undefined; },
                hasClass: function () { return false; },
                setAttr: function () { return undefined; },
                activateIndicator: function () { return undefined; },
                deactivateIndicator: function () { return undefined; },
                notifyInteracted: function () { return undefined; },
                getOffsetLeft: function () { return 0; },
                getOffsetWidth: function () { return 0; },
                getContentOffsetLeft: function () { return 0; },
                getContentOffsetWidth: function () { return 0; },
                focus: function () { return undefined; },
            };
            // tslint:enable:object-literal-sort-keys
        },
        enumerable: true,
        configurable: true
    });
    MDCTabFoundation.prototype.handleClick = function () {
        // It's up to the parent component to keep track of the active Tab and
        // ensure we don't activate a Tab that's already active.
        this.adapter.notifyInteracted();
    };
    MDCTabFoundation.prototype.isActive = function () {
        return this.adapter.hasClass(cssClasses$c.ACTIVE);
    };
    /**
     * Sets whether the tab should focus itself when activated
     */
    MDCTabFoundation.prototype.setFocusOnActivate = function (focusOnActivate) {
        this.focusOnActivate_ = focusOnActivate;
    };
    /**
     * Activates the Tab
     */
    MDCTabFoundation.prototype.activate = function (previousIndicatorClientRect) {
        this.adapter.addClass(cssClasses$c.ACTIVE);
        this.adapter.setAttr(strings$a.ARIA_SELECTED, 'true');
        this.adapter.setAttr(strings$a.TABINDEX, '0');
        this.adapter.activateIndicator(previousIndicatorClientRect);
        if (this.focusOnActivate_) {
            this.adapter.focus();
        }
    };
    /**
     * Deactivates the Tab
     */
    MDCTabFoundation.prototype.deactivate = function () {
        // Early exit
        if (!this.isActive()) {
            return;
        }
        this.adapter.removeClass(cssClasses$c.ACTIVE);
        this.adapter.setAttr(strings$a.ARIA_SELECTED, 'false');
        this.adapter.setAttr(strings$a.TABINDEX, '-1');
        this.adapter.deactivateIndicator();
    };
    /**
     * Returns the dimensions of the Tab
     */
    MDCTabFoundation.prototype.computeDimensions = function () {
        var rootWidth = this.adapter.getOffsetWidth();
        var rootLeft = this.adapter.getOffsetLeft();
        var contentWidth = this.adapter.getContentOffsetWidth();
        var contentLeft = this.adapter.getContentOffsetLeft();
        return {
            contentLeft: rootLeft + contentLeft,
            contentRight: rootLeft + contentLeft + contentWidth,
            rootLeft: rootLeft,
            rootRight: rootLeft + rootWidth,
        };
    };
    return MDCTabFoundation;
}(MDCFoundation));

// used for generating unique id for each tab
let tabIdCounter = 0;
class TabBase extends BaseElement {
    constructor() {
        super(...arguments);
        this.mdcFoundationClass = MDCTabFoundation;
        this.label = '';
        this.icon = '';
        this.hasImageIcon = false;
        this.isFadingIndicator = false;
        this.minWidth = false;
        this.isMinWidthIndicator = false;
        this.indicatorIcon = '';
        this.stacked = false;
        this.focusOnActivate = true;
        this._active = false;
        this.initFocus = false;
        this.shouldRenderRipple = false;
        this.rippleElement = null;
        this.rippleHandlers = new RippleHandlers(() => {
            this.shouldRenderRipple = true;
            this.ripple.then((v) => this.rippleElement = v);
            return this.ripple;
        });
    }
    get active() {
        return this._active;
    }
    createRenderRoot() {
        return this.attachShadow({ mode: 'open', delegatesFocus: true });
    }
    connectedCallback() {
        this.dir = document.dir;
        super.connectedCallback();
    }
    firstUpdated() {
        super.firstUpdated();
        // create an unique id
        this.id = this.id || `mdc-tab-${++tabIdCounter}`;
    }
    render() {
        const classes = {
            'mdc-tab--min-width': this.minWidth,
            'mdc-tab--stacked': this.stacked,
        };
        let iconTemplate = html$2 ``;
        if (this.hasImageIcon || this.icon) {
            // NOTE: MUST be on same line as spaces will cause vert alignment issues
            // in IE
            iconTemplate = html$2 `
        <span class="mdc-tab__icon material-icons"><slot name="icon">${this.icon}</slot></span>`;
        }
        let labelTemplate = html$2 ``;
        if (this.label) {
            labelTemplate = html$2 `
        <span class="mdc-tab__text-label">${this.label}</span>`;
        }
        return html$2 `
      <button
        @click="${this.handleClick}"
        class="mdc-tab ${classMap(classes)}"
        role="tab"
        aria-selected="false"
        tabindex="-1"
        @focus="${this.focus}"
        @blur="${this.handleBlur}"
        @mousedown="${this.handleRippleMouseDown}"
        @mouseenter="${this.handleRippleMouseEnter}"
        @mouseleave="${this.handleRippleMouseLeave}"
        @touchstart="${this.handleRippleTouchStart}"
        @touchend="${this.handleRippleDeactivate}"
        @touchcancel="${this.handleRippleDeactivate}">
        <span class="mdc-tab__content">
          ${iconTemplate}
          ${labelTemplate}
          ${this.isMinWidthIndicator ? this.renderIndicator() : ''}
        </span>
        ${this.isMinWidthIndicator ? '' : this.renderIndicator()}
        ${this.renderRipple()}
      </button>`;
    }
    renderIndicator() {
        return html$2 `<mwc-tab-indicator
        .icon="${this.indicatorIcon}"
        .fade="${this.isFadingIndicator}"></mwc-tab-indicator>`;
    }
    // TODO(dfreedm): Make this use selected as a param after Polymer/internal#739
    /** @soyCompatible */
    renderRipple() {
        return this.shouldRenderRipple ? html$2 `
          <mwc-ripple primary></mwc-ripple>
        ` :
            '';
    }
    createAdapter() {
        return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { setAttr: (attr, value) => this.mdcRoot.setAttribute(attr, value), activateIndicator: async (previousIndicatorClientRect) => {
                await this.tabIndicator.updateComplete;
                this.tabIndicator.activate(previousIndicatorClientRect);
            }, deactivateIndicator: async () => {
                await this.tabIndicator.updateComplete;
                this.tabIndicator.deactivate();
            }, notifyInteracted: () => this.dispatchEvent(new CustomEvent(MDCTabFoundation.strings.INTERACTED_EVENT, {
                detail: { tabId: this.id },
                bubbles: true,
                composed: true,
                cancelable: true,
            })), getOffsetLeft: () => this.offsetLeft, getOffsetWidth: () => this.mdcRoot.offsetWidth, getContentOffsetLeft: () => this._contentElement.offsetLeft, getContentOffsetWidth: () => this._contentElement.offsetWidth, focus: () => {
                if (this.initFocus) {
                    this.initFocus = false;
                }
                else {
                    this.mdcRoot.focus();
                }
            } });
    }
    activate(clientRect) {
        // happens only on initialization. We don't want to focus to prevent scroll
        if (!clientRect) {
            this.initFocus = true;
        }
        if (this.mdcFoundation) {
            this.mdcFoundation.activate(clientRect);
            this.setActive(this.mdcFoundation.isActive());
        }
        else {
            // happens if this is called by tab-bar on initialization, but tab has not
            // finished rendering.
            this.updateComplete.then(() => {
                this.mdcFoundation.activate(clientRect);
                this.setActive(this.mdcFoundation.isActive());
            });
        }
    }
    deactivate() {
        this.mdcFoundation.deactivate();
        this.setActive(this.mdcFoundation.isActive());
    }
    setActive(newValue) {
        const oldValue = this.active;
        if (oldValue !== newValue) {
            this._active = newValue;
            this.requestUpdate('active', oldValue);
        }
    }
    computeDimensions() {
        return this.mdcFoundation.computeDimensions();
    }
    computeIndicatorClientRect() {
        return this.tabIndicator.computeContentClientRect();
    }
    // NOTE: needed only for ShadyDOM where delegatesFocus is not implemented
    focus() {
        this.mdcRoot.focus();
        this.handleFocus();
    }
    handleClick() {
        this.handleFocus();
        this.mdcFoundation.handleClick();
    }
    handleFocus() {
        this.handleRippleFocus();
    }
    handleBlur() {
        this.handleRippleBlur();
    }
    handleRippleMouseDown(event) {
        const onUp = () => {
            window.removeEventListener('mouseup', onUp);
            this.handleRippleDeactivate();
        };
        window.addEventListener('mouseup', onUp);
        this.rippleHandlers.startPress(event);
    }
    handleRippleTouchStart(event) {
        this.rippleHandlers.startPress(event);
    }
    handleRippleDeactivate() {
        this.rippleHandlers.endPress();
    }
    handleRippleMouseEnter() {
        this.rippleHandlers.startHover();
    }
    handleRippleMouseLeave() {
        this.rippleHandlers.endHover();
    }
    handleRippleFocus() {
        this.rippleHandlers.startFocus();
    }
    handleRippleBlur() {
        this.rippleHandlers.endFocus();
    }
    get isRippleActive() {
        var _a;
        return ((_a = this.rippleElement) === null || _a === void 0 ? void 0 : _a.isActive) || false;
    }
}
__decorate([
    query('.mdc-tab')
], TabBase.prototype, "mdcRoot", void 0);
__decorate([
    query('mwc-tab-indicator')
], TabBase.prototype, "tabIndicator", void 0);
__decorate([
    property()
], TabBase.prototype, "label", void 0);
__decorate([
    property()
], TabBase.prototype, "icon", void 0);
__decorate([
    property({ type: Boolean })
], TabBase.prototype, "hasImageIcon", void 0);
__decorate([
    property({ type: Boolean })
], TabBase.prototype, "isFadingIndicator", void 0);
__decorate([
    property({ type: Boolean })
], TabBase.prototype, "minWidth", void 0);
__decorate([
    property({ type: Boolean })
], TabBase.prototype, "isMinWidthIndicator", void 0);
__decorate([
    property({ type: Boolean, reflect: true, attribute: 'active' })
], TabBase.prototype, "active", null);
__decorate([
    property()
], TabBase.prototype, "indicatorIcon", void 0);
__decorate([
    property({ type: Boolean })
], TabBase.prototype, "stacked", void 0);
__decorate([
    observer(async function (value) {
        await this.updateComplete;
        this.mdcFoundation.setFocusOnActivate(value);
    }),
    property({ type: Boolean })
], TabBase.prototype, "focusOnActivate", void 0);
__decorate([
    query('.mdc-tab__content')
], TabBase.prototype, "_contentElement", void 0);
__decorate([
    internalProperty()
], TabBase.prototype, "shouldRenderRipple", void 0);
__decorate([
    queryAsync('mwc-ripple')
], TabBase.prototype, "ripple", void 0);
__decorate([
    eventOptions({ passive: true })
], TabBase.prototype, "handleRippleTouchStart", null);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$e = css `.material-icons{font-family:var(--mdc-icon-font, "Material Icons");font-weight:normal;font-style:normal;font-size:var(--mdc-icon-size, 24px);line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga"}.mdc-tab{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-button-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.875rem;font-size:var(--mdc-typography-button-font-size, 0.875rem);line-height:2.25rem;line-height:var(--mdc-typography-button-line-height, 2.25rem);font-weight:500;font-weight:var(--mdc-typography-button-font-weight, 500);letter-spacing:0.0892857143em;letter-spacing:var(--mdc-typography-button-letter-spacing, 0.0892857143em);text-decoration:none;text-decoration:var(--mdc-typography-button-text-decoration, none);text-transform:uppercase;text-transform:var(--mdc-typography-button-text-transform, uppercase);padding-right:24px;padding-left:24px;min-width:90px;position:relative;display:flex;flex:1 0 auto;justify-content:center;box-sizing:border-box;margin:0;padding-top:0;padding-bottom:0;border:none;outline:none;background:none;text-align:center;white-space:nowrap;cursor:pointer;-webkit-appearance:none;z-index:1}.mdc-tab .mdc-tab__text-label{color:rgba(0, 0, 0, 0.6)}.mdc-tab .mdc-tab__icon{color:rgba(0, 0, 0, 0.54);fill:currentColor}.mdc-tab::-moz-focus-inner{padding:0;border:0}.mdc-tab--min-width{flex:0 1 auto}.mdc-tab__content{position:relative;display:flex;align-items:center;justify-content:center;height:inherit;pointer-events:none}.mdc-tab__text-label{transition:150ms color linear;display:inline-block;line-height:1;z-index:2}.mdc-tab__icon{transition:150ms color linear;width:24px;height:24px;font-size:24px;z-index:2}.mdc-tab--stacked .mdc-tab__content{flex-direction:column;align-items:center;justify-content:center}.mdc-tab--stacked .mdc-tab__text-label{padding-top:6px;padding-bottom:4px}.mdc-tab--active .mdc-tab__text-label{color:#6200ee;color:var(--mdc-theme-primary, #6200ee)}.mdc-tab--active .mdc-tab__icon{color:#6200ee;color:var(--mdc-theme-primary, #6200ee);fill:currentColor}.mdc-tab--active .mdc-tab__text-label,.mdc-tab--active .mdc-tab__icon{transition-delay:100ms}.mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label{padding-left:8px;padding-right:0}[dir=rtl] .mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label,.mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label[dir=rtl]{padding-left:0;padding-right:8px}@keyframes mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}.mdc-tab__ripple{--mdc-ripple-fg-size: 0;--mdc-ripple-left: 0;--mdc-ripple-top: 0;--mdc-ripple-fg-scale: 1;--mdc-ripple-fg-translate-end: 0;--mdc-ripple-fg-translate-start: 0;-webkit-tap-highlight-color:rgba(0,0,0,0);will-change:transform,opacity;position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden}.mdc-tab__ripple::before,.mdc-tab__ripple::after{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:""}.mdc-tab__ripple::before{transition:opacity 15ms linear,background-color 15ms linear;z-index:1;z-index:var(--mdc-ripple-z-index, 1)}.mdc-tab__ripple::after{z-index:0;z-index:var(--mdc-ripple-z-index, 0)}.mdc-tab__ripple.mdc-ripple-upgraded::before{transform:scale(var(--mdc-ripple-fg-scale, 1))}.mdc-tab__ripple.mdc-ripple-upgraded::after{top:0;left:0;transform:scale(0);transform-origin:center center}.mdc-tab__ripple.mdc-ripple-upgraded--unbounded::after{top:var(--mdc-ripple-top, 0);left:var(--mdc-ripple-left, 0)}.mdc-tab__ripple.mdc-ripple-upgraded--foreground-activation::after{animation:mdc-ripple-fg-radius-in 225ms forwards,mdc-ripple-fg-opacity-in 75ms forwards}.mdc-tab__ripple.mdc-ripple-upgraded--foreground-deactivation::after{animation:mdc-ripple-fg-opacity-out 150ms;transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}.mdc-tab__ripple::before,.mdc-tab__ripple::after{top:calc(50% - 100%);left:calc(50% - 100%);width:200%;height:200%}.mdc-tab__ripple.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}.mdc-tab__ripple::before,.mdc-tab__ripple::after{background-color:#6200ee;background-color:var(--mdc-ripple-color, var(--mdc-theme-primary, #6200ee))}.mdc-tab__ripple:hover::before,.mdc-tab__ripple.mdc-ripple-surface--hover::before{opacity:0.04;opacity:var(--mdc-ripple-hover-opacity, 0.04)}.mdc-tab__ripple.mdc-ripple-upgraded--background-focused::before,.mdc-tab__ripple:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-focus-opacity, 0.12)}.mdc-tab__ripple:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-tab__ripple:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.12;opacity:var(--mdc-ripple-press-opacity, 0.12)}.mdc-tab__ripple.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: var(--mdc-ripple-press-opacity, 0.12)}:host{outline:none;flex:1 0 auto;display:flex;justify-content:center;-webkit-tap-highlight-color:transparent}.mdc-tab{height:var(--mdc-tab-height, 48px);margin-left:0;margin-right:0;padding-right:var(--mdc-tab-horizontal-padding, 24px);padding-left:var(--mdc-tab-horizontal-padding, 24px)}.mdc-tab--stacked{height:var(--mdc-tab-stacked-height, 72px)}.mdc-tab::-moz-focus-inner{border:0}.mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label{padding-left:8px;padding-right:0}[dir=rtl] .mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label,.mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label[dir=rtl]{padding-left:0;padding-right:8px}.mdc-tab:not(.mdc-tab--active) .mdc-tab__text-label{color:var(--mdc-tab-text-label-color-default, rgba(0, 0, 0, 0.6))}.mdc-tab:not(.mdc-tab--active) .mdc-tab__icon{color:var(--mdc-tab-color-default, rgba(0, 0, 0, 0.54))}`;

let Tab = class Tab extends TabBase {
};
Tab.styles = style$e;
Tab = __decorate([
    customElement('mwc-tab')
], Tab);

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var cssClasses$d = {
    ANIMATING: 'mdc-tab-scroller--animating',
    SCROLL_AREA_SCROLL: 'mdc-tab-scroller__scroll-area--scroll',
    SCROLL_TEST: 'mdc-tab-scroller__test',
};
var strings$b = {
    AREA_SELECTOR: '.mdc-tab-scroller__scroll-area',
    CONTENT_SELECTOR: '.mdc-tab-scroller__scroll-content',
};

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCTabScrollerRTL = /** @class */ (function () {
    function MDCTabScrollerRTL(adapter) {
        this.adapter = adapter;
    }
    return MDCTabScrollerRTL;
}());

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCTabScrollerRTLDefault = /** @class */ (function (_super) {
    __extends(MDCTabScrollerRTLDefault, _super);
    function MDCTabScrollerRTLDefault() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MDCTabScrollerRTLDefault.prototype.getScrollPositionRTL = function () {
        var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
        var right = this.calculateScrollEdges_().right;
        // Scroll values on most browsers are ints instead of floats so we round
        return Math.round(right - currentScrollLeft);
    };
    MDCTabScrollerRTLDefault.prototype.scrollToRTL = function (scrollX) {
        var edges = this.calculateScrollEdges_();
        var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
        var clampedScrollLeft = this.clampScrollValue_(edges.right - scrollX);
        return {
            finalScrollPosition: clampedScrollLeft,
            scrollDelta: clampedScrollLeft - currentScrollLeft,
        };
    };
    MDCTabScrollerRTLDefault.prototype.incrementScrollRTL = function (scrollX) {
        var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
        var clampedScrollLeft = this.clampScrollValue_(currentScrollLeft - scrollX);
        return {
            finalScrollPosition: clampedScrollLeft,
            scrollDelta: clampedScrollLeft - currentScrollLeft,
        };
    };
    MDCTabScrollerRTLDefault.prototype.getAnimatingScrollPosition = function (scrollX) {
        return scrollX;
    };
    MDCTabScrollerRTLDefault.prototype.calculateScrollEdges_ = function () {
        var contentWidth = this.adapter.getScrollContentOffsetWidth();
        var rootWidth = this.adapter.getScrollAreaOffsetWidth();
        return {
            left: 0,
            right: contentWidth - rootWidth,
        };
    };
    MDCTabScrollerRTLDefault.prototype.clampScrollValue_ = function (scrollX) {
        var edges = this.calculateScrollEdges_();
        return Math.min(Math.max(edges.left, scrollX), edges.right);
    };
    return MDCTabScrollerRTLDefault;
}(MDCTabScrollerRTL));

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCTabScrollerRTLNegative = /** @class */ (function (_super) {
    __extends(MDCTabScrollerRTLNegative, _super);
    function MDCTabScrollerRTLNegative() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MDCTabScrollerRTLNegative.prototype.getScrollPositionRTL = function (translateX) {
        var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
        return Math.round(translateX - currentScrollLeft);
    };
    MDCTabScrollerRTLNegative.prototype.scrollToRTL = function (scrollX) {
        var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
        var clampedScrollLeft = this.clampScrollValue_(-scrollX);
        return {
            finalScrollPosition: clampedScrollLeft,
            scrollDelta: clampedScrollLeft - currentScrollLeft,
        };
    };
    MDCTabScrollerRTLNegative.prototype.incrementScrollRTL = function (scrollX) {
        var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
        var clampedScrollLeft = this.clampScrollValue_(currentScrollLeft - scrollX);
        return {
            finalScrollPosition: clampedScrollLeft,
            scrollDelta: clampedScrollLeft - currentScrollLeft,
        };
    };
    MDCTabScrollerRTLNegative.prototype.getAnimatingScrollPosition = function (scrollX, translateX) {
        return scrollX - translateX;
    };
    MDCTabScrollerRTLNegative.prototype.calculateScrollEdges_ = function () {
        var contentWidth = this.adapter.getScrollContentOffsetWidth();
        var rootWidth = this.adapter.getScrollAreaOffsetWidth();
        return {
            left: rootWidth - contentWidth,
            right: 0,
        };
    };
    MDCTabScrollerRTLNegative.prototype.clampScrollValue_ = function (scrollX) {
        var edges = this.calculateScrollEdges_();
        return Math.max(Math.min(edges.right, scrollX), edges.left);
    };
    return MDCTabScrollerRTLNegative;
}(MDCTabScrollerRTL));

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCTabScrollerRTLReverse = /** @class */ (function (_super) {
    __extends(MDCTabScrollerRTLReverse, _super);
    function MDCTabScrollerRTLReverse() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MDCTabScrollerRTLReverse.prototype.getScrollPositionRTL = function (translateX) {
        var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
        // Scroll values on most browsers are ints instead of floats so we round
        return Math.round(currentScrollLeft - translateX);
    };
    MDCTabScrollerRTLReverse.prototype.scrollToRTL = function (scrollX) {
        var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
        var clampedScrollLeft = this.clampScrollValue_(scrollX);
        return {
            finalScrollPosition: clampedScrollLeft,
            scrollDelta: currentScrollLeft - clampedScrollLeft,
        };
    };
    MDCTabScrollerRTLReverse.prototype.incrementScrollRTL = function (scrollX) {
        var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
        var clampedScrollLeft = this.clampScrollValue_(currentScrollLeft + scrollX);
        return {
            finalScrollPosition: clampedScrollLeft,
            scrollDelta: currentScrollLeft - clampedScrollLeft,
        };
    };
    MDCTabScrollerRTLReverse.prototype.getAnimatingScrollPosition = function (scrollX, translateX) {
        return scrollX + translateX;
    };
    MDCTabScrollerRTLReverse.prototype.calculateScrollEdges_ = function () {
        var contentWidth = this.adapter.getScrollContentOffsetWidth();
        var rootWidth = this.adapter.getScrollAreaOffsetWidth();
        return {
            left: contentWidth - rootWidth,
            right: 0,
        };
    };
    MDCTabScrollerRTLReverse.prototype.clampScrollValue_ = function (scrollX) {
        var edges = this.calculateScrollEdges_();
        return Math.min(Math.max(edges.right, scrollX), edges.left);
    };
    return MDCTabScrollerRTLReverse;
}(MDCTabScrollerRTL));

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCTabScrollerFoundation = /** @class */ (function (_super) {
    __extends(MDCTabScrollerFoundation, _super);
    function MDCTabScrollerFoundation(adapter) {
        var _this = _super.call(this, __assign(__assign({}, MDCTabScrollerFoundation.defaultAdapter), adapter)) || this;
        /**
         * Controls whether we should handle the transitionend and interaction events during the animation.
         */
        _this.isAnimating_ = false;
        return _this;
    }
    Object.defineProperty(MDCTabScrollerFoundation, "cssClasses", {
        get: function () {
            return cssClasses$d;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTabScrollerFoundation, "strings", {
        get: function () {
            return strings$b;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTabScrollerFoundation, "defaultAdapter", {
        get: function () {
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            return {
                eventTargetMatchesSelector: function () { return false; },
                addClass: function () { return undefined; },
                removeClass: function () { return undefined; },
                addScrollAreaClass: function () { return undefined; },
                setScrollAreaStyleProperty: function () { return undefined; },
                setScrollContentStyleProperty: function () { return undefined; },
                getScrollContentStyleValue: function () { return ''; },
                setScrollAreaScrollLeft: function () { return undefined; },
                getScrollAreaScrollLeft: function () { return 0; },
                getScrollContentOffsetWidth: function () { return 0; },
                getScrollAreaOffsetWidth: function () { return 0; },
                computeScrollAreaClientRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                computeScrollContentClientRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                computeHorizontalScrollbarHeight: function () { return 0; },
            };
            // tslint:enable:object-literal-sort-keys
        },
        enumerable: true,
        configurable: true
    });
    MDCTabScrollerFoundation.prototype.init = function () {
        // Compute horizontal scrollbar height on scroller with overflow initially hidden, then update overflow to scroll
        // and immediately adjust bottom margin to avoid the scrollbar initially appearing before JS runs.
        var horizontalScrollbarHeight = this.adapter.computeHorizontalScrollbarHeight();
        this.adapter.setScrollAreaStyleProperty('margin-bottom', -horizontalScrollbarHeight + 'px');
        this.adapter.addScrollAreaClass(MDCTabScrollerFoundation.cssClasses.SCROLL_AREA_SCROLL);
    };
    /**
     * Computes the current visual scroll position
     */
    MDCTabScrollerFoundation.prototype.getScrollPosition = function () {
        if (this.isRTL_()) {
            return this.computeCurrentScrollPositionRTL_();
        }
        var currentTranslateX = this.calculateCurrentTranslateX_();
        var scrollLeft = this.adapter.getScrollAreaScrollLeft();
        return scrollLeft - currentTranslateX;
    };
    /**
     * Handles interaction events that occur during transition
     */
    MDCTabScrollerFoundation.prototype.handleInteraction = function () {
        // Early exit if we aren't animating
        if (!this.isAnimating_) {
            return;
        }
        // Prevent other event listeners from handling this event
        this.stopScrollAnimation_();
    };
    /**
     * Handles the transitionend event
     */
    MDCTabScrollerFoundation.prototype.handleTransitionEnd = function (evt) {
        // Early exit if we aren't animating or the event was triggered by a different element.
        var evtTarget = evt.target;
        if (!this.isAnimating_ ||
            !this.adapter.eventTargetMatchesSelector(evtTarget, MDCTabScrollerFoundation.strings.CONTENT_SELECTOR)) {
            return;
        }
        this.isAnimating_ = false;
        this.adapter.removeClass(MDCTabScrollerFoundation.cssClasses.ANIMATING);
    };
    /**
     * Increment the scroll value by the scrollXIncrement using animation.
     * @param scrollXIncrement The value by which to increment the scroll position
     */
    MDCTabScrollerFoundation.prototype.incrementScroll = function (scrollXIncrement) {
        // Early exit for non-operational increment values
        if (scrollXIncrement === 0) {
            return;
        }
        this.animate_(this.getIncrementScrollOperation_(scrollXIncrement));
    };
    /**
     * Increment the scroll value by the scrollXIncrement without animation.
     * @param scrollXIncrement The value by which to increment the scroll position
     */
    MDCTabScrollerFoundation.prototype.incrementScrollImmediate = function (scrollXIncrement) {
        // Early exit for non-operational increment values
        if (scrollXIncrement === 0) {
            return;
        }
        var operation = this.getIncrementScrollOperation_(scrollXIncrement);
        if (operation.scrollDelta === 0) {
            return;
        }
        this.stopScrollAnimation_();
        this.adapter.setScrollAreaScrollLeft(operation.finalScrollPosition);
    };
    /**
     * Scrolls to the given scrollX value
     */
    MDCTabScrollerFoundation.prototype.scrollTo = function (scrollX) {
        if (this.isRTL_()) {
            return this.scrollToRTL_(scrollX);
        }
        this.scrollTo_(scrollX);
    };
    /**
     * @return Browser-specific {@link MDCTabScrollerRTL} instance.
     */
    MDCTabScrollerFoundation.prototype.getRTLScroller = function () {
        if (!this.rtlScrollerInstance_) {
            this.rtlScrollerInstance_ = this.rtlScrollerFactory_();
        }
        return this.rtlScrollerInstance_;
    };
    /**
     * @return translateX value from a CSS matrix transform function string.
     */
    MDCTabScrollerFoundation.prototype.calculateCurrentTranslateX_ = function () {
        var transformValue = this.adapter.getScrollContentStyleValue('transform');
        // Early exit if no transform is present
        if (transformValue === 'none') {
            return 0;
        }
        // The transform value comes back as a matrix transformation in the form
        // of `matrix(a, b, c, d, tx, ty)`. We only care about tx (translateX) so
        // we're going to grab all the parenthesized values, strip out tx, and
        // parse it.
        var match = /\((.+?)\)/.exec(transformValue);
        if (!match) {
            return 0;
        }
        var matrixParams = match[1];
        // tslint:disable-next-line:ban-ts-ignore "Unused vars" should be a linter warning, not a compiler error.
        // @ts-ignore These unused variables should retain their semantic names for clarity.
        var _a = __read(matrixParams.split(','), 6), a = _a[0], b = _a[1], c = _a[2], d = _a[3], tx = _a[4], ty = _a[5];
        return parseFloat(tx); // tslint:disable-line:ban
    };
    /**
     * Calculates a safe scroll value that is > 0 and < the max scroll value
     * @param scrollX The distance to scroll
     */
    MDCTabScrollerFoundation.prototype.clampScrollValue_ = function (scrollX) {
        var edges = this.calculateScrollEdges_();
        return Math.min(Math.max(edges.left, scrollX), edges.right);
    };
    MDCTabScrollerFoundation.prototype.computeCurrentScrollPositionRTL_ = function () {
        var translateX = this.calculateCurrentTranslateX_();
        return this.getRTLScroller().getScrollPositionRTL(translateX);
    };
    MDCTabScrollerFoundation.prototype.calculateScrollEdges_ = function () {
        var contentWidth = this.adapter.getScrollContentOffsetWidth();
        var rootWidth = this.adapter.getScrollAreaOffsetWidth();
        return {
            left: 0,
            right: contentWidth - rootWidth,
        };
    };
    /**
     * Internal scroll method
     * @param scrollX The new scroll position
     */
    MDCTabScrollerFoundation.prototype.scrollTo_ = function (scrollX) {
        var currentScrollX = this.getScrollPosition();
        var safeScrollX = this.clampScrollValue_(scrollX);
        var scrollDelta = safeScrollX - currentScrollX;
        this.animate_({
            finalScrollPosition: safeScrollX,
            scrollDelta: scrollDelta,
        });
    };
    /**
     * Internal RTL scroll method
     * @param scrollX The new scroll position
     */
    MDCTabScrollerFoundation.prototype.scrollToRTL_ = function (scrollX) {
        var animation = this.getRTLScroller().scrollToRTL(scrollX);
        this.animate_(animation);
    };
    /**
     * Internal method to compute the increment scroll operation values.
     * @param scrollX The desired scroll position increment
     * @return MDCTabScrollerAnimation with the sanitized values for performing the scroll operation.
     */
    MDCTabScrollerFoundation.prototype.getIncrementScrollOperation_ = function (scrollX) {
        if (this.isRTL_()) {
            return this.getRTLScroller().incrementScrollRTL(scrollX);
        }
        var currentScrollX = this.getScrollPosition();
        var targetScrollX = scrollX + currentScrollX;
        var safeScrollX = this.clampScrollValue_(targetScrollX);
        var scrollDelta = safeScrollX - currentScrollX;
        return {
            finalScrollPosition: safeScrollX,
            scrollDelta: scrollDelta,
        };
    };
    /**
     * Animates the tab scrolling
     * @param animation The animation to apply
     */
    MDCTabScrollerFoundation.prototype.animate_ = function (animation) {
        var _this = this;
        // Early exit if translateX is 0, which means there's no animation to perform
        if (animation.scrollDelta === 0) {
            return;
        }
        this.stopScrollAnimation_();
        // This animation uses the FLIP approach.
        // Read more here: https://aerotwist.com/blog/flip-your-animations/
        this.adapter.setScrollAreaScrollLeft(animation.finalScrollPosition);
        this.adapter.setScrollContentStyleProperty('transform', "translateX(" + animation.scrollDelta + "px)");
        // Force repaint
        this.adapter.computeScrollAreaClientRect();
        requestAnimationFrame(function () {
            _this.adapter.addClass(MDCTabScrollerFoundation.cssClasses.ANIMATING);
            _this.adapter.setScrollContentStyleProperty('transform', 'none');
        });
        this.isAnimating_ = true;
    };
    /**
     * Stops scroll animation
     */
    MDCTabScrollerFoundation.prototype.stopScrollAnimation_ = function () {
        this.isAnimating_ = false;
        var currentScrollPosition = this.getAnimatingScrollPosition_();
        this.adapter.removeClass(MDCTabScrollerFoundation.cssClasses.ANIMATING);
        this.adapter.setScrollContentStyleProperty('transform', 'translateX(0px)');
        this.adapter.setScrollAreaScrollLeft(currentScrollPosition);
    };
    /**
     * Gets the current scroll position during animation
     */
    MDCTabScrollerFoundation.prototype.getAnimatingScrollPosition_ = function () {
        var currentTranslateX = this.calculateCurrentTranslateX_();
        var scrollLeft = this.adapter.getScrollAreaScrollLeft();
        if (this.isRTL_()) {
            return this.getRTLScroller().getAnimatingScrollPosition(scrollLeft, currentTranslateX);
        }
        return scrollLeft - currentTranslateX;
    };
    /**
     * Determines the RTL Scroller to use
     */
    MDCTabScrollerFoundation.prototype.rtlScrollerFactory_ = function () {
        // Browsers have three different implementations of scrollLeft in RTL mode,
        // dependent on the browser. The behavior is based off the max LTR
        // scrollLeft value and 0.
        //
        // * Default scrolling in RTL *
        //    - Left-most value: 0
        //    - Right-most value: Max LTR scrollLeft value
        //
        // * Negative scrolling in RTL *
        //    - Left-most value: Negated max LTR scrollLeft value
        //    - Right-most value: 0
        //
        // * Reverse scrolling in RTL *
        //    - Left-most value: Max LTR scrollLeft value
        //    - Right-most value: 0
        //
        // We use those principles below to determine which RTL scrollLeft
        // behavior is implemented in the current browser.
        var initialScrollLeft = this.adapter.getScrollAreaScrollLeft();
        this.adapter.setScrollAreaScrollLeft(initialScrollLeft - 1);
        var newScrollLeft = this.adapter.getScrollAreaScrollLeft();
        // If the newScrollLeft value is negative,then we know that the browser has
        // implemented negative RTL scrolling, since all other implementations have
        // only positive values.
        if (newScrollLeft < 0) {
            // Undo the scrollLeft test check
            this.adapter.setScrollAreaScrollLeft(initialScrollLeft);
            return new MDCTabScrollerRTLNegative(this.adapter);
        }
        var rootClientRect = this.adapter.computeScrollAreaClientRect();
        var contentClientRect = this.adapter.computeScrollContentClientRect();
        var rightEdgeDelta = Math.round(contentClientRect.right - rootClientRect.right);
        // Undo the scrollLeft test check
        this.adapter.setScrollAreaScrollLeft(initialScrollLeft);
        // By calculating the clientRect of the root element and the clientRect of
        // the content element, we can determine how much the scroll value changed
        // when we performed the scrollLeft subtraction above.
        if (rightEdgeDelta === newScrollLeft) {
            return new MDCTabScrollerRTLReverse(this.adapter);
        }
        return new MDCTabScrollerRTLDefault(this.adapter);
    };
    MDCTabScrollerFoundation.prototype.isRTL_ = function () {
        return this.adapter.getScrollContentStyleValue('direction') === 'rtl';
    };
    return MDCTabScrollerFoundation;
}(MDCFoundation));

class TabScrollerBase extends BaseElement {
    constructor() {
        super(...arguments);
        this.mdcFoundationClass = MDCTabScrollerFoundation;
        this._scrollbarHeight = -1;
    }
    _handleInteraction() {
        this.mdcFoundation.handleInteraction();
    }
    _handleTransitionEnd(e) {
        this.mdcFoundation.handleTransitionEnd(e);
    }
    render() {
        return html$2 `
      <div class="mdc-tab-scroller">
        <div class="mdc-tab-scroller__scroll-area"
            @wheel="${this._handleInteraction}"
            @touchstart="${this._handleInteraction}"
            @pointerdown="${this._handleInteraction}"
            @mousedown="${this._handleInteraction}"
            @keydown="${this._handleInteraction}"
            @transitionend="${this._handleTransitionEnd}">
          <div class="mdc-tab-scroller__scroll-content"><slot></slot></div>
        </div>
      </div>
      `;
    }
    createAdapter() {
        return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { eventTargetMatchesSelector: (evtTarget, selector) => matches(evtTarget, selector), addScrollAreaClass: (className) => this.scrollAreaElement.classList.add(className), setScrollAreaStyleProperty: (prop, value) => this.scrollAreaElement.style.setProperty(prop, value), setScrollContentStyleProperty: (prop, value) => this.scrollContentElement.style.setProperty(prop, value), getScrollContentStyleValue: (propName) => window.getComputedStyle(this.scrollContentElement)
                .getPropertyValue(propName), setScrollAreaScrollLeft: (scrollX) => this.scrollAreaElement.scrollLeft = scrollX, getScrollAreaScrollLeft: () => this.scrollAreaElement.scrollLeft, getScrollContentOffsetWidth: () => this.scrollContentElement.offsetWidth, getScrollAreaOffsetWidth: () => this.scrollAreaElement.offsetWidth, computeScrollAreaClientRect: () => this.scrollAreaElement.getBoundingClientRect(), computeScrollContentClientRect: () => this.scrollContentElement.getBoundingClientRect(), computeHorizontalScrollbarHeight: () => {
                if (this._scrollbarHeight === -1) {
                    this.scrollAreaElement.style.overflowX = 'scroll';
                    this._scrollbarHeight = this.scrollAreaElement.offsetHeight -
                        this.scrollAreaElement.clientHeight;
                    this.scrollAreaElement.style.overflowX = '';
                }
                return this._scrollbarHeight;
            } });
    }
    /**
     * Returns the current visual scroll position
     * @return {number}
     */
    getScrollPosition() {
        return this.mdcFoundation.getScrollPosition();
    }
    /**
     * Returns the width of the scroll content
     * @return {number}
     */
    getScrollContentWidth() {
        return this.scrollContentElement.offsetWidth;
    }
    /**
     * Increments the scroll value by the given amount
     * @param {number} scrollXIncrement The pixel value by which to increment the
     *     scroll value
     */
    incrementScrollPosition(scrollXIncrement) {
        this.mdcFoundation.incrementScroll(scrollXIncrement);
    }
    /**
     * Scrolls to the given pixel position
     * @param {number} scrollX The pixel value to scroll to
     */
    scrollToPosition(scrollX) {
        this.mdcFoundation.scrollTo(scrollX);
    }
}
__decorate([
    query('.mdc-tab-scroller')
], TabScrollerBase.prototype, "mdcRoot", void 0);
__decorate([
    query('.mdc-tab-scroller__scroll-area')
], TabScrollerBase.prototype, "scrollAreaElement", void 0);
__decorate([
    query('.mdc-tab-scroller__scroll-content')
], TabScrollerBase.prototype, "scrollContentElement", void 0);
__decorate([
    eventOptions({ passive: true })
], TabScrollerBase.prototype, "_handleInteraction", null);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$f = css `.mdc-tab-scroller{overflow-y:hidden}.mdc-tab-scroller.mdc-tab-scroller--animating .mdc-tab-scroller__scroll-content{transition:250ms transform cubic-bezier(0.4, 0, 0.2, 1)}.mdc-tab-scroller__test{position:absolute;top:-9999px;width:100px;height:100px;overflow-x:scroll}.mdc-tab-scroller__scroll-area{-webkit-overflow-scrolling:touch;display:flex;overflow-x:hidden}.mdc-tab-scroller__scroll-area::-webkit-scrollbar,.mdc-tab-scroller__test::-webkit-scrollbar{display:none}.mdc-tab-scroller__scroll-area--scroll{overflow-x:scroll}.mdc-tab-scroller__scroll-content{position:relative;display:flex;flex:1 0 auto;transform:none;will-change:transform}.mdc-tab-scroller--align-start .mdc-tab-scroller__scroll-content{justify-content:flex-start}.mdc-tab-scroller--align-end .mdc-tab-scroller__scroll-content{justify-content:flex-end}.mdc-tab-scroller--align-center .mdc-tab-scroller__scroll-content{justify-content:center}.mdc-tab-scroller--animating .mdc-tab-scroller__scroll-area{-webkit-overflow-scrolling:auto}:host{display:flex}.mdc-tab-scroller{flex:1}`;

let TabScroller = class TabScroller extends TabScrollerBase {
};
TabScroller.styles = style$f;
TabScroller = __decorate([
    customElement('mwc-tab-scroller')
], TabScroller);

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var strings$c = {
    ARROW_LEFT_KEY: 'ArrowLeft',
    ARROW_RIGHT_KEY: 'ArrowRight',
    END_KEY: 'End',
    ENTER_KEY: 'Enter',
    HOME_KEY: 'Home',
    SPACE_KEY: 'Space',
    TAB_ACTIVATED_EVENT: 'MDCTabBar:activated',
    TAB_SCROLLER_SELECTOR: '.mdc-tab-scroller',
    TAB_SELECTOR: '.mdc-tab',
};
var numbers$7 = {
    ARROW_LEFT_KEYCODE: 37,
    ARROW_RIGHT_KEYCODE: 39,
    END_KEYCODE: 35,
    ENTER_KEYCODE: 13,
    EXTRA_SCROLL_AMOUNT: 20,
    HOME_KEYCODE: 36,
    SPACE_KEYCODE: 32,
};

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var ACCEPTABLE_KEYS = new Set();
// IE11 has no support for new Set with iterable so we need to initialize this by hand
ACCEPTABLE_KEYS.add(strings$c.ARROW_LEFT_KEY);
ACCEPTABLE_KEYS.add(strings$c.ARROW_RIGHT_KEY);
ACCEPTABLE_KEYS.add(strings$c.END_KEY);
ACCEPTABLE_KEYS.add(strings$c.HOME_KEY);
ACCEPTABLE_KEYS.add(strings$c.ENTER_KEY);
ACCEPTABLE_KEYS.add(strings$c.SPACE_KEY);
var KEYCODE_MAP = new Map();
// IE11 has no support for new Map with iterable so we need to initialize this by hand
KEYCODE_MAP.set(numbers$7.ARROW_LEFT_KEYCODE, strings$c.ARROW_LEFT_KEY);
KEYCODE_MAP.set(numbers$7.ARROW_RIGHT_KEYCODE, strings$c.ARROW_RIGHT_KEY);
KEYCODE_MAP.set(numbers$7.END_KEYCODE, strings$c.END_KEY);
KEYCODE_MAP.set(numbers$7.HOME_KEYCODE, strings$c.HOME_KEY);
KEYCODE_MAP.set(numbers$7.ENTER_KEYCODE, strings$c.ENTER_KEY);
KEYCODE_MAP.set(numbers$7.SPACE_KEYCODE, strings$c.SPACE_KEY);
var MDCTabBarFoundation = /** @class */ (function (_super) {
    __extends(MDCTabBarFoundation, _super);
    function MDCTabBarFoundation(adapter) {
        var _this = _super.call(this, __assign(__assign({}, MDCTabBarFoundation.defaultAdapter), adapter)) || this;
        _this.useAutomaticActivation_ = false;
        return _this;
    }
    Object.defineProperty(MDCTabBarFoundation, "strings", {
        get: function () {
            return strings$c;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTabBarFoundation, "numbers", {
        get: function () {
            return numbers$7;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTabBarFoundation, "defaultAdapter", {
        get: function () {
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            return {
                scrollTo: function () { return undefined; },
                incrementScroll: function () { return undefined; },
                getScrollPosition: function () { return 0; },
                getScrollContentWidth: function () { return 0; },
                getOffsetWidth: function () { return 0; },
                isRTL: function () { return false; },
                setActiveTab: function () { return undefined; },
                activateTabAtIndex: function () { return undefined; },
                deactivateTabAtIndex: function () { return undefined; },
                focusTabAtIndex: function () { return undefined; },
                getTabIndicatorClientRectAtIndex: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                getTabDimensionsAtIndex: function () { return ({ rootLeft: 0, rootRight: 0, contentLeft: 0, contentRight: 0 }); },
                getPreviousActiveTabIndex: function () { return -1; },
                getFocusedTabIndex: function () { return -1; },
                getIndexOfTabById: function () { return -1; },
                getTabListLength: function () { return 0; },
                notifyTabActivated: function () { return undefined; },
            };
            // tslint:enable:object-literal-sort-keys
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Switches between automatic and manual activation modes.
     * See https://www.w3.org/TR/wai-aria-practices/#tabpanel for examples.
     */
    MDCTabBarFoundation.prototype.setUseAutomaticActivation = function (useAutomaticActivation) {
        this.useAutomaticActivation_ = useAutomaticActivation;
    };
    MDCTabBarFoundation.prototype.activateTab = function (index) {
        var previousActiveIndex = this.adapter.getPreviousActiveTabIndex();
        if (!this.indexIsInRange_(index) || index === previousActiveIndex) {
            return;
        }
        var previousClientRect;
        if (previousActiveIndex !== -1) {
            this.adapter.deactivateTabAtIndex(previousActiveIndex);
            previousClientRect =
                this.adapter.getTabIndicatorClientRectAtIndex(previousActiveIndex);
        }
        this.adapter.activateTabAtIndex(index, previousClientRect);
        this.scrollIntoView(index);
        this.adapter.notifyTabActivated(index);
    };
    MDCTabBarFoundation.prototype.handleKeyDown = function (evt) {
        // Get the key from the event
        var key = this.getKeyFromEvent_(evt);
        // Early exit if the event key isn't one of the keyboard navigation keys
        if (key === undefined) {
            return;
        }
        // Prevent default behavior for movement keys, but not for activation keys, since :active is used to apply ripple
        if (!this.isActivationKey_(key)) {
            evt.preventDefault();
        }
        if (this.useAutomaticActivation_) {
            if (this.isActivationKey_(key)) {
                return;
            }
            var index = this.determineTargetFromKey_(this.adapter.getPreviousActiveTabIndex(), key);
            this.adapter.setActiveTab(index);
            this.scrollIntoView(index);
        }
        else {
            var focusedTabIndex = this.adapter.getFocusedTabIndex();
            if (this.isActivationKey_(key)) {
                this.adapter.setActiveTab(focusedTabIndex);
            }
            else {
                var index = this.determineTargetFromKey_(focusedTabIndex, key);
                this.adapter.focusTabAtIndex(index);
                this.scrollIntoView(index);
            }
        }
    };
    /**
     * Handles the MDCTab:interacted event
     */
    MDCTabBarFoundation.prototype.handleTabInteraction = function (evt) {
        this.adapter.setActiveTab(this.adapter.getIndexOfTabById(evt.detail.tabId));
    };
    /**
     * Scrolls the tab at the given index into view
     * @param index The tab index to make visible
     */
    MDCTabBarFoundation.prototype.scrollIntoView = function (index) {
        // Early exit if the index is out of range
        if (!this.indexIsInRange_(index)) {
            return;
        }
        // Always scroll to 0 if scrolling to the 0th index
        if (index === 0) {
            return this.adapter.scrollTo(0);
        }
        // Always scroll to the max value if scrolling to the Nth index
        // MDCTabScroller.scrollTo() will never scroll past the max possible value
        if (index === this.adapter.getTabListLength() - 1) {
            return this.adapter.scrollTo(this.adapter.getScrollContentWidth());
        }
        if (this.isRTL_()) {
            return this.scrollIntoViewRTL_(index);
        }
        this.scrollIntoView_(index);
    };
    /**
     * Private method for determining the index of the destination tab based on what key was pressed
     * @param origin The original index from which to determine the destination
     * @param key The name of the key
     */
    MDCTabBarFoundation.prototype.determineTargetFromKey_ = function (origin, key) {
        var isRTL = this.isRTL_();
        var maxIndex = this.adapter.getTabListLength() - 1;
        var shouldGoToEnd = key === strings$c.END_KEY;
        var shouldDecrement = key === strings$c.ARROW_LEFT_KEY && !isRTL || key === strings$c.ARROW_RIGHT_KEY && isRTL;
        var shouldIncrement = key === strings$c.ARROW_RIGHT_KEY && !isRTL || key === strings$c.ARROW_LEFT_KEY && isRTL;
        var index = origin;
        if (shouldGoToEnd) {
            index = maxIndex;
        }
        else if (shouldDecrement) {
            index -= 1;
        }
        else if (shouldIncrement) {
            index += 1;
        }
        else {
            index = 0;
        }
        if (index < 0) {
            index = maxIndex;
        }
        else if (index > maxIndex) {
            index = 0;
        }
        return index;
    };
    /**
     * Calculates the scroll increment that will make the tab at the given index visible
     * @param index The index of the tab
     * @param nextIndex The index of the next tab
     * @param scrollPosition The current scroll position
     * @param barWidth The width of the Tab Bar
     */
    MDCTabBarFoundation.prototype.calculateScrollIncrement_ = function (index, nextIndex, scrollPosition, barWidth) {
        var nextTabDimensions = this.adapter.getTabDimensionsAtIndex(nextIndex);
        var relativeContentLeft = nextTabDimensions.contentLeft - scrollPosition - barWidth;
        var relativeContentRight = nextTabDimensions.contentRight - scrollPosition;
        var leftIncrement = relativeContentRight - numbers$7.EXTRA_SCROLL_AMOUNT;
        var rightIncrement = relativeContentLeft + numbers$7.EXTRA_SCROLL_AMOUNT;
        if (nextIndex < index) {
            return Math.min(leftIncrement, 0);
        }
        return Math.max(rightIncrement, 0);
    };
    /**
     * Calculates the scroll increment that will make the tab at the given index visible in RTL
     * @param index The index of the tab
     * @param nextIndex The index of the next tab
     * @param scrollPosition The current scroll position
     * @param barWidth The width of the Tab Bar
     * @param scrollContentWidth The width of the scroll content
     */
    MDCTabBarFoundation.prototype.calculateScrollIncrementRTL_ = function (index, nextIndex, scrollPosition, barWidth, scrollContentWidth) {
        var nextTabDimensions = this.adapter.getTabDimensionsAtIndex(nextIndex);
        var relativeContentLeft = scrollContentWidth - nextTabDimensions.contentLeft - scrollPosition;
        var relativeContentRight = scrollContentWidth - nextTabDimensions.contentRight - scrollPosition - barWidth;
        var leftIncrement = relativeContentRight + numbers$7.EXTRA_SCROLL_AMOUNT;
        var rightIncrement = relativeContentLeft - numbers$7.EXTRA_SCROLL_AMOUNT;
        if (nextIndex > index) {
            return Math.max(leftIncrement, 0);
        }
        return Math.min(rightIncrement, 0);
    };
    /**
     * Determines the index of the adjacent tab closest to either edge of the Tab Bar
     * @param index The index of the tab
     * @param tabDimensions The dimensions of the tab
     * @param scrollPosition The current scroll position
     * @param barWidth The width of the tab bar
     */
    MDCTabBarFoundation.prototype.findAdjacentTabIndexClosestToEdge_ = function (index, tabDimensions, scrollPosition, barWidth) {
        /**
         * Tabs are laid out in the Tab Scroller like this:
         *
         *    Scroll Position
         *    +---+
         *    |   |   Bar Width
         *    |   +-----------------------------------+
         *    |   |                                   |
         *    |   V                                   V
         *    |   +-----------------------------------+
         *    V   |             Tab Scroller          |
         *    +------------+--------------+-------------------+
         *    |    Tab     |      Tab     |        Tab        |
         *    +------------+--------------+-------------------+
         *        |                                   |
         *        +-----------------------------------+
         *
         * To determine the next adjacent index, we look at the Tab root left and
         * Tab root right, both relative to the scroll position. If the Tab root
         * left is less than 0, then we know it's out of view to the left. If the
         * Tab root right minus the bar width is greater than 0, we know the Tab is
         * out of view to the right. From there, we either increment or decrement
         * the index.
         */
        var relativeRootLeft = tabDimensions.rootLeft - scrollPosition;
        var relativeRootRight = tabDimensions.rootRight - scrollPosition - barWidth;
        var relativeRootDelta = relativeRootLeft + relativeRootRight;
        var leftEdgeIsCloser = relativeRootLeft < 0 || relativeRootDelta < 0;
        var rightEdgeIsCloser = relativeRootRight > 0 || relativeRootDelta > 0;
        if (leftEdgeIsCloser) {
            return index - 1;
        }
        if (rightEdgeIsCloser) {
            return index + 1;
        }
        return -1;
    };
    /**
     * Determines the index of the adjacent tab closest to either edge of the Tab Bar in RTL
     * @param index The index of the tab
     * @param tabDimensions The dimensions of the tab
     * @param scrollPosition The current scroll position
     * @param barWidth The width of the tab bar
     * @param scrollContentWidth The width of the scroller content
     */
    MDCTabBarFoundation.prototype.findAdjacentTabIndexClosestToEdgeRTL_ = function (index, tabDimensions, scrollPosition, barWidth, scrollContentWidth) {
        var rootLeft = scrollContentWidth - tabDimensions.rootLeft - barWidth - scrollPosition;
        var rootRight = scrollContentWidth - tabDimensions.rootRight - scrollPosition;
        var rootDelta = rootLeft + rootRight;
        var leftEdgeIsCloser = rootLeft > 0 || rootDelta > 0;
        var rightEdgeIsCloser = rootRight < 0 || rootDelta < 0;
        if (leftEdgeIsCloser) {
            return index + 1;
        }
        if (rightEdgeIsCloser) {
            return index - 1;
        }
        return -1;
    };
    /**
     * Returns the key associated with a keydown event
     * @param evt The keydown event
     */
    MDCTabBarFoundation.prototype.getKeyFromEvent_ = function (evt) {
        if (ACCEPTABLE_KEYS.has(evt.key)) {
            return evt.key;
        }
        return KEYCODE_MAP.get(evt.keyCode);
    };
    MDCTabBarFoundation.prototype.isActivationKey_ = function (key) {
        return key === strings$c.SPACE_KEY || key === strings$c.ENTER_KEY;
    };
    /**
     * Returns whether a given index is inclusively between the ends
     * @param index The index to test
     */
    MDCTabBarFoundation.prototype.indexIsInRange_ = function (index) {
        return index >= 0 && index < this.adapter.getTabListLength();
    };
    /**
     * Returns the view's RTL property
     */
    MDCTabBarFoundation.prototype.isRTL_ = function () {
        return this.adapter.isRTL();
    };
    /**
     * Scrolls the tab at the given index into view for left-to-right user agents.
     * @param index The index of the tab to scroll into view
     */
    MDCTabBarFoundation.prototype.scrollIntoView_ = function (index) {
        var scrollPosition = this.adapter.getScrollPosition();
        var barWidth = this.adapter.getOffsetWidth();
        var tabDimensions = this.adapter.getTabDimensionsAtIndex(index);
        var nextIndex = this.findAdjacentTabIndexClosestToEdge_(index, tabDimensions, scrollPosition, barWidth);
        if (!this.indexIsInRange_(nextIndex)) {
            return;
        }
        var scrollIncrement = this.calculateScrollIncrement_(index, nextIndex, scrollPosition, barWidth);
        this.adapter.incrementScroll(scrollIncrement);
    };
    /**
     * Scrolls the tab at the given index into view in RTL
     * @param index The tab index to make visible
     */
    MDCTabBarFoundation.prototype.scrollIntoViewRTL_ = function (index) {
        var scrollPosition = this.adapter.getScrollPosition();
        var barWidth = this.adapter.getOffsetWidth();
        var tabDimensions = this.adapter.getTabDimensionsAtIndex(index);
        var scrollWidth = this.adapter.getScrollContentWidth();
        var nextIndex = this.findAdjacentTabIndexClosestToEdgeRTL_(index, tabDimensions, scrollPosition, barWidth, scrollWidth);
        if (!this.indexIsInRange_(nextIndex)) {
            return;
        }
        var scrollIncrement = this.calculateScrollIncrementRTL_(index, nextIndex, scrollPosition, barWidth, scrollWidth);
        this.adapter.incrementScroll(scrollIncrement);
    };
    return MDCTabBarFoundation;
}(MDCFoundation));

class TabBarBase extends BaseElement {
    constructor() {
        super(...arguments);
        this.mdcFoundationClass = MDCTabBarFoundation;
        this.activeIndex = 0;
        this._previousActiveIndex = -1;
    }
    _handleTabInteraction(e) {
        this.mdcFoundation.handleTabInteraction(e);
    }
    _handleKeydown(e) {
        this.mdcFoundation.handleKeyDown(e);
    }
    // TODO(sorvell): can scroller be optional for perf?
    render() {
        return html$2 `
      <div class="mdc-tab-bar" role="tablist"
          @MDCTab:interacted="${this._handleTabInteraction}"
          @keydown="${this._handleKeydown}">
        <mwc-tab-scroller><slot></slot></mwc-tab-scroller>
      </div>
      `;
    }
    // TODO(sorvell): probably want to memoize this and use a `slotChange` event
    _getTabs() {
        return this.tabsSlot
            .assignedNodes({ flatten: true })
            .filter((e) => e instanceof Tab);
    }
    _getTab(index) {
        return this._getTabs()[index];
    }
    createAdapter() {
        return {
            scrollTo: (scrollX) => this.scrollerElement.scrollToPosition(scrollX),
            incrementScroll: (scrollXIncrement) => this.scrollerElement.incrementScrollPosition(scrollXIncrement),
            getScrollPosition: () => this.scrollerElement.getScrollPosition(),
            getScrollContentWidth: () => this.scrollerElement.getScrollContentWidth(),
            getOffsetWidth: () => this.mdcRoot.offsetWidth,
            isRTL: () => window.getComputedStyle(this.mdcRoot)
                .getPropertyValue('direction') === 'rtl',
            setActiveTab: (index) => this.mdcFoundation.activateTab(index),
            activateTabAtIndex: (index, clientRect) => {
                const tab = this._getTab(index);
                if (tab !== undefined) {
                    tab.activate(clientRect);
                }
                this._previousActiveIndex = index;
            },
            deactivateTabAtIndex: (index) => {
                const tab = this._getTab(index);
                if (tab !== undefined) {
                    tab.deactivate();
                }
            },
            focusTabAtIndex: (index) => {
                const tab = this._getTab(index);
                if (tab !== undefined) {
                    tab.focus();
                }
            },
            // TODO(sorvell): tab may not be able to synchronously answer
            // `computeIndicatorClientRect` if an update is pending or it has not yet
            // updated. If this is necessary, LitElement may need a `forceUpdate`
            // method.
            getTabIndicatorClientRectAtIndex: (index) => {
                const tab = this._getTab(index);
                return tab !== undefined ? tab.computeIndicatorClientRect() :
                    new DOMRect();
            },
            getTabDimensionsAtIndex: (index) => {
                const tab = this._getTab(index);
                return tab !== undefined ?
                    tab.computeDimensions() :
                    { rootLeft: 0, rootRight: 0, contentLeft: 0, contentRight: 0 };
            },
            getPreviousActiveTabIndex: () => {
                return this._previousActiveIndex;
            },
            getFocusedTabIndex: () => {
                const tabElements = this._getTabs();
                const activeElement = this.getRootNode().activeElement;
                return tabElements.indexOf(activeElement);
            },
            getIndexOfTabById: (id) => {
                const tabElements = this._getTabs();
                for (let i = 0; i < tabElements.length; i++) {
                    if (tabElements[i].id === id) {
                        return i;
                    }
                }
                return -1;
            },
            getTabListLength: () => this._getTabs().length,
            notifyTabActivated: (index) => {
                // Synchronize the tabs `activeIndex` to the foundation.
                // This is needed when a tab is changed via a click, for example.
                this.activeIndex = index;
                this.dispatchEvent(new CustomEvent(MDCTabBarFoundation.strings.TAB_ACTIVATED_EVENT, { detail: { index }, bubbles: true, cancelable: true }));
            },
        };
    }
    firstUpdated() {
        // NOTE: Delay creating foundation until scroller is fully updated.
        // This is necessary because the foundation/adapter synchronously addresses
        // the scroller element.
    }
    _getUpdateComplete() {
        return super._getUpdateComplete()
            .then(() => this.scrollerElement.updateComplete)
            .then(() => {
            if (this.mdcFoundation === undefined) {
                this.createFoundation();
            }
        });
    }
    scrollIndexIntoView(index) {
        this.mdcFoundation.scrollIntoView(index);
    }
}
__decorate([
    query('.mdc-tab-bar')
], TabBarBase.prototype, "mdcRoot", void 0);
__decorate([
    query('mwc-tab-scroller')
], TabBarBase.prototype, "scrollerElement", void 0);
__decorate([
    query('slot')
], TabBarBase.prototype, "tabsSlot", void 0);
__decorate([
    observer(async function () {
        await this.updateComplete;
        // only provoke the foundation if we are out of sync with it, i.e.
        // ignore an foundation generated set.
        // use `activeIndex` directly to avoid staleness if it was set before the
        // first render.
        if (this.activeIndex !== this._previousActiveIndex) {
            this.mdcFoundation.activateTab(this.activeIndex);
        }
    }),
    property({ type: Number })
], TabBarBase.prototype, "activeIndex", void 0);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$g = css `.mdc-tab-bar{width:100%}.mdc-tab{height:48px}.mdc-tab--stacked{height:72px}:host{display:block}.mdc-tab-bar{flex:1}mwc-tab{--mdc-tab-height: 48px;--mdc-tab-stacked-height: 72px}`;

let TabBar = class TabBar extends TabBarBase {
};
TabBar.styles = style$g;
TabBar = __decorate([
    customElement('mwc-tab-bar')
], TabBar);

/**
 * ## PwiMdEditr
 *
 * `<pwi-md-editor>` is a markdown text editor with a preview tab, similar to gitlab edit
 * 
 * @fires md-changes - eventfired when `md` changes
 * @fires md-paste - event fired when user paste on textarea. Used to listed for image copy.
 */
class PwiMdEditor extends LitElement {

  static get styles() {
    return [
    liteYoutube,
    styleTypography,
    css `
    :host {
      display: block;
      width: auto;
      box-sizing: border-box;

      --mdc-tab-horizontal-padding: 12px;
      --mdc-tab-height: var(--pwi-md-editor-tab-height, 1.5rem);
    }

    #container {
      min-height: 10rem;
      display: flex;
    }

    #container > * {
      flex: 1;
    }

    mwc-tab-bar {
      width: fit-content;
      margin-left: 0px;
      margin-right: auto;
      --mdc-typography-button-text-transform: none;
      --mdc-typography-button-letter-spacing: 0px;
    }

    pwi-textarea {
      width: 100%;
    }

    .toolbar {
      color: var(--pwi-md-editor-toolbar-color, var(--secondary-text-color));
      display: flex;
      opacity: 0;
      will-change: opacity;
      transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1) 0s;
      padding-right: 16px;
      padding-left: 16px;
    }

    :host([hasfocus]) .toolbar {
      opacity: 1;
    }

    :host([helper-persistent]) .toolbar {
      opacity: 1;
    }

    .flex {
      flex: 1;
    }

    .toolbar a {
      color: var(--primary-color); 
      text-decoration: none;
    }

    #markdown {
      padding: 0px 16px;
      margin: 8px 0px 1px;
    }

    #markdown img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    `];
  }

  static get properties() {

    return {

      ...super.properties,

      hasFocus: {
        reflect: true,
        type: Boolean
      },

      /**
       * mardown text
       * @type {String}
       */
      md: {
        type: String
      },

     /**
       * translated mardown text
       * @type {String}
       */
      mdtranslate: {
        type: String
      },

      /**
       * label for this field
       * @type {Object}
       */
      label: {
        type: String,
      },

      _selected: {
        type: Number
      },

      /**
       * textarea placeholder
       * @type {String}
       */
      placeholder: {
        type: String
      },

      /*
       * label appering under write tab
       * @type {String} 'Write'
       */
      writeLabel: {
        type: String,
      },

      /*
       * label appering under preview tab
       * @type {String} 'Preview'
       */
      previewLabel: {
        type: String,
      },

      /*
       * label appering under translate tab
       * @type {String} 'Translate'
       */
       translateLabel: {
        type: String,
      },

      /*
       * label appering under transalte preview tab
       * @type {String} 'Preview Transation'
       */
      translatePreviewLabel: {
        type: String,
      },

      /**
       * rows to apply to textarea
       * @type {Number}
       */
      rows: {
        type: Number
      },

      /**
       * cols to apply to textarea
       * @type {Number}
       */
      cols: {
        type: Number
      },

      /**
       * textarea helper
       * @type {String}
       */
      helper: {
        type: String
      },
      /**
       * textarea helper for traslation
       * @type {String}
       */
      helpertranslate: {
        type: String
      },

      /*
       * `helperPersistent` true to make helper persistant
       */
      helperPersistent: {
        type: Boolean,
        reflect: true
      },

      /**
       * true to make texarea readonly
       * @type {Boolean}
       */
      readonly: {
        type: Boolean
      },

      /*
       * `maxLength` 
       */
      maxLength: {
        type: Number,
      },

      /*
       * `maxLength` 
       */
      minLength: {
        type: Number,
      },

      /*
       * `charCounter` 
       */
      charCounter: {
        type: Boolean,
        // attribute: 'char-counter'
      },

      /*
       * `resize` {'vertival' | 'horizontal' | 'auto'}
       * apply resize css to text area
       * Should be removed when https://github.com/material-components/material-components-web-components/issues/1305 lands
       */
      resize: {
        type: String,
      },

      /*
       * `translate` flag to make this editor alaso a translation
       */
      translate: {
        type: Boolean,
      },


    };
  }

  render() {
    return html$2 `
    
       <mwc-tab-bar @MDCTabBar:activated=${e => this._selected = e.detail.index} .activeIndex="${this._selected}" theme="centered">
          <mwc-tab isMinWidthIndicator .label="${this.writeLabel}"></mwc-tab>
          <mwc-tab isMinWidthIndicator .label="${this.previewLabel}"></mwc-tab>
          ${this.translate ? html$2 `
            <mwc-tab isMinWidthIndicator icon="translate" .label="${this.translateLabel}"></mwc-tab>
            <mwc-tab isMinWidthIndicator .label="${this.translatePreviewLabel}"></mwc-tab>
          ` : nothing}
      </mwc-tab-bar>
      <div id="container"> 
      ${cache(
        this._selected === 0 || this._selected === 2
          ? html$2`<div>
              <pwi-textarea
                droppable 
                .ripple=${this.dragoverValid}
                .cols=${this.cols}
                .rows=${this.rows}
                .readonly=${this._selected === 0 && this.translate ? true : this.readonly}
                .value=${this._selected === 0 ? this.md : this.mdtranslate} 
                .resize=${this.resize}
                .maxLength=${this.maxLength}
                .minLength=${this.minLength}
                .charCounter=${this.charCounter ? 'internal' : false}
                @input=${this.onValueChanged}
                @focus=${this.onFocus} 
                @blur=${this.onBlur} 
                placeholder=${this.placeholder}></pwi-textarea>
                ${this.renderToolbar()}
             </div>
              `
          : html$2`<div id="markdown">${parse(this._selected === 1 ? this.md : this.mdtranslate)}</div>`
          )}
      </div>
    `;
  }

  renderToolbar() {
    return html$2 `
     <small class="toolbar"><span class="flex">${this._selected === 3 ? this.helpertranslate : this.helper} <a tabindex="-1" rel="noopener" href="https://en.wikipedia.org/wiki/Markdown" target="blank">Markdown</a> is supported. </span class="helper"></span></span><slot name="bottomToolbar">${this.renderSlotToolbar()}</slot></small>
    `;
  }

  onFocus(e) {
    this.hasFocus = true;
  }

  onBlur(e) {
    this.hasFocus = false;
  }

  renderSlotToolbar() {
    return '';
  }

  constructor() {
    super();
    this.placeholder = '';
    this.md = '';
    this.helper = '';
    this.minLength = -1;
    this.maxLength = -1;
    this.rows = 5;
    this._selected = 0;
    this.writeLabel = 'Write';
    this.previewLabel = 'Preview';
    this.translateLabel = 'Translate';
    this.translatePreviewLabel = 'Translation Preview';
  }

  get pwitextarea() {
    return this.renderRoot.querySelector('pwi-textarea');
  }

  get textarea() {
    return this.pwitextarea.renderRoot.querySelector('textarea');
  }

  insertAtCaret(text) {
    const txtarea = this.textarea;
    const scrollPos = txtarea.scrollTop;
    let caretPos = txtarea.selectionStart;

    const front = (txtarea.value).substring(0, caretPos);
    const back = (txtarea.value).substring(txtarea.selectionEnd, txtarea.value.length);
    txtarea.value = front + text + back;
    caretPos = caretPos + text.length;
    txtarea.selectionStart = caretPos;
    txtarea.selectionEnd = caretPos;
    txtarea.focus();
    txtarea.scrollTop = scrollPos;
  }

  // onPaste(e) {
  //   console.info('Paste Editor', e);
  //   this.dispatchEvent(new CustomEvent('md-paste', {detail: null, clipboardData: e.clipboardData, bubbles: true, composed: true})); 
  // }

  onValueChanged(e) {
    // console.info('changed', e)
    if (this._selected === 0) {
      this.md = e.target.value;
      this.dispatchEvent(new CustomEvent('md-changed', {detail: {value: this.md}, bubbles: true, composed: true})); 
    }
    if (this._selected === 2) {
      this.mdtranslate = e.target.value;
      this.dispatchEvent(new CustomEvent('mdtranslate-changed', {detail: {value: this.mdtranslate}, bubbles: true, composed: true})); 
    }
  }
}

// Register the new element with the browser.
customElements.define('pwi-md-editor', PwiMdEditor);

var droppable = css`

       :host(:not([nodrop])) [droppable] {
        overflow: hidden;
        border: 1px dashed var(--color-droppable-border, var(--color-divider));
        border-radius: 4px;
        transition: border-color 0.6s;
        position: relative;
      }

      :host([dragover-valid]) [droppable] {
        border-color: var(--color-primary);
        transition: border-color 0.1s;
      }

      /* Ripple */
      [droppable]::before {
        content: "";
        position: absolute;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        top: 50%;
        left: 50%;
        pointer-events: none;
        background-color: var(--color-primary);
        opacity: 0;
        transform: translate(-50%, -50%) scale(0);
        transition: transform 0s cubic-bezier(.075, .82, .165, 1), opacity 0.4s linear;
        transition-delay: 0.4s, 0s;
      }

      :host([dragover-valid]) [droppable]::before {
        transform: translate(-50%, -50%) scale(10);
        opacity: 0.1;
        transition-duration: 2s, 0.1s;
        transition-delay: 0s, 0s;
      }
`;

/** @soyCompatible */
class ButtonBase extends LitElement {
    constructor() {
        super(...arguments);
        this.raised = false;
        this.unelevated = false;
        this.outlined = false;
        this.dense = false;
        this.disabled = false;
        this.trailingIcon = false;
        this.fullwidth = false;
        this.icon = '';
        this.label = '';
        this.expandContent = false;
        this.shouldRenderRipple = false;
        this.rippleHandlers = new RippleHandlers(() => {
            this.shouldRenderRipple = true;
            return this.ripple;
        });
    }
    /** @soyTemplate */
    renderOverlay() {
        return html$2 ``;
    }
    /** @soyTemplate */
    renderRipple() {
        const filled = this.raised || this.unelevated;
        return this.shouldRenderRipple ?
            html$2 `<mwc-ripple class="ripple" .primary="${!filled}" .disabled="${this.disabled}"></mwc-ripple>` :
            '';
    }
    createRenderRoot() {
        return this.attachShadow({ mode: 'open', delegatesFocus: true });
    }
    focus() {
        const buttonElement = this.buttonElement;
        if (buttonElement) {
            this.rippleHandlers.startFocus();
            buttonElement.focus();
        }
    }
    blur() {
        const buttonElement = this.buttonElement;
        if (buttonElement) {
            this.rippleHandlers.endFocus();
            buttonElement.blur();
        }
    }
    /** @soyTemplate classMap */
    getRenderClasses() {
        return classMap({
            'mdc-button--raised': this.raised,
            'mdc-button--unelevated': this.unelevated,
            'mdc-button--outlined': this.outlined,
            'mdc-button--dense': this.dense,
        });
    }
    /**
     * @soyTemplate
     * @soyAttributes buttonAttributes: #button
     * @soyClasses buttonClasses: #button
     */
    render() {
        return html$2 `
      <button
          id="button"
          class="mdc-button ${this.getRenderClasses()}"
          ?disabled="${this.disabled}"
          aria-label="${this.label || this.icon}"
          @focus="${this.handleRippleFocus}"
          @blur="${this.handleRippleBlur}"
          @mousedown="${this.handleRippleActivate}"
          @mouseenter="${this.handleRippleMouseEnter}"
          @mouseleave="${this.handleRippleMouseLeave}"
          @touchstart="${this.handleRippleActivate}"
          @touchend="${this.handleRippleDeactivate}"
          @touchcancel="${this.handleRippleDeactivate}">
        ${this.renderOverlay()}
        ${this.renderRipple()}
        <span class="leading-icon">
          <slot name="icon">
            ${this.icon && !this.trailingIcon ? this.renderIcon() : ''}
          </slot>
        </span>
        <span class="mdc-button__label">${this.label}</span>
        <span class="slot-container ${classMap({
            flex: this.expandContent
        })}">
          <slot></slot>
        </span>
        <span class="trailing-icon">
          <slot name="trailingIcon">
            ${this.icon && this.trailingIcon ? this.renderIcon() : ''}
          </slot>
        </span>
      </button>`;
    }
    /** @soyTemplate */
    renderIcon() {
        return html$2 `
    <mwc-icon class="mdc-button__icon">
      ${this.icon}
    </mwc-icon>`;
    }
    handleRippleActivate(evt) {
        const onUp = () => {
            window.removeEventListener('mouseup', onUp);
            this.handleRippleDeactivate();
        };
        window.addEventListener('mouseup', onUp);
        this.rippleHandlers.startPress(evt);
    }
    handleRippleDeactivate() {
        this.rippleHandlers.endPress();
    }
    handleRippleMouseEnter() {
        this.rippleHandlers.startHover();
    }
    handleRippleMouseLeave() {
        this.rippleHandlers.endHover();
    }
    handleRippleFocus() {
        this.rippleHandlers.startFocus();
    }
    handleRippleBlur() {
        this.rippleHandlers.endFocus();
    }
}
__decorate([
    property({ type: Boolean, reflect: true })
], ButtonBase.prototype, "raised", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], ButtonBase.prototype, "unelevated", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], ButtonBase.prototype, "outlined", void 0);
__decorate([
    property({ type: Boolean })
], ButtonBase.prototype, "dense", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], ButtonBase.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, attribute: 'trailingicon' })
], ButtonBase.prototype, "trailingIcon", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], ButtonBase.prototype, "fullwidth", void 0);
__decorate([
    property({ type: String })
], ButtonBase.prototype, "icon", void 0);
__decorate([
    property({ type: String })
], ButtonBase.prototype, "label", void 0);
__decorate([
    property({ type: Boolean })
], ButtonBase.prototype, "expandContent", void 0);
__decorate([
    query('#button')
], ButtonBase.prototype, "buttonElement", void 0);
__decorate([
    queryAsync('mwc-ripple')
], ButtonBase.prototype, "ripple", void 0);
__decorate([
    internalProperty()
], ButtonBase.prototype, "shouldRenderRipple", void 0);
__decorate([
    eventOptions({ passive: true })
], ButtonBase.prototype, "handleRippleActivate", null);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$h = css `.mdc-touch-target-wrapper{display:inline}.mdc-elevation-overlay{position:absolute;border-radius:inherit;pointer-events:none;opacity:0;opacity:var(--mdc-elevation-overlay-opacity, 0);transition:opacity 280ms cubic-bezier(0.4, 0, 0.2, 1);background-color:#fff;background-color:var(--mdc-elevation-overlay-color, #fff)}.mdc-button{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-button-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.875rem;font-size:var(--mdc-typography-button-font-size, 0.875rem);line-height:2.25rem;line-height:var(--mdc-typography-button-line-height, 2.25rem);font-weight:500;font-weight:var(--mdc-typography-button-font-weight, 500);letter-spacing:0.0892857143em;letter-spacing:var(--mdc-typography-button-letter-spacing, 0.0892857143em);text-decoration:none;text-decoration:var(--mdc-typography-button-text-decoration, none);text-transform:uppercase;text-transform:var(--mdc-typography-button-text-transform, uppercase);padding:0 8px 0 8px;position:relative;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:64px;border:none;outline:none;line-height:inherit;user-select:none;-webkit-appearance:none;overflow:visible;vertical-align:middle;border-radius:4px;border-radius:var(--mdc-shape-small, 4px);height:36px}.mdc-button .mdc-elevation-overlay{width:100%;height:100%;top:0;left:0}.mdc-button::-moz-focus-inner{padding:0;border:0}.mdc-button:active{outline:none}.mdc-button:hover{cursor:pointer}.mdc-button:disabled{cursor:default;pointer-events:none}.mdc-button .mdc-button__ripple{border-radius:4px;border-radius:var(--mdc-shape-small, 4px)}.mdc-button:not(:disabled){background-color:transparent}.mdc-button:disabled{background-color:transparent}.mdc-button .mdc-button__icon{margin-left:0;margin-right:8px;display:inline-block;width:18px;height:18px;font-size:18px;vertical-align:top}[dir=rtl] .mdc-button .mdc-button__icon,.mdc-button .mdc-button__icon[dir=rtl]{margin-left:8px;margin-right:0}.mdc-button .mdc-button__touch{position:absolute;top:50%;right:0;height:48px;left:0;transform:translateY(-50%)}.mdc-button:not(:disabled){color:#6200ee;color:var(--mdc-theme-primary, #6200ee)}.mdc-button:disabled{color:rgba(0, 0, 0, 0.38)}.mdc-button__label+.mdc-button__icon{margin-left:8px;margin-right:0}[dir=rtl] .mdc-button__label+.mdc-button__icon,.mdc-button__label+.mdc-button__icon[dir=rtl]{margin-left:0;margin-right:8px}svg.mdc-button__icon{fill:currentColor}.mdc-button--raised .mdc-button__icon,.mdc-button--unelevated .mdc-button__icon,.mdc-button--outlined .mdc-button__icon{margin-left:-4px;margin-right:8px}[dir=rtl] .mdc-button--raised .mdc-button__icon,.mdc-button--raised .mdc-button__icon[dir=rtl],[dir=rtl] .mdc-button--unelevated .mdc-button__icon,.mdc-button--unelevated .mdc-button__icon[dir=rtl],[dir=rtl] .mdc-button--outlined .mdc-button__icon,.mdc-button--outlined .mdc-button__icon[dir=rtl]{margin-left:8px;margin-right:-4px}.mdc-button--raised .mdc-button__label+.mdc-button__icon,.mdc-button--unelevated .mdc-button__label+.mdc-button__icon,.mdc-button--outlined .mdc-button__label+.mdc-button__icon{margin-left:8px;margin-right:-4px}[dir=rtl] .mdc-button--raised .mdc-button__label+.mdc-button__icon,.mdc-button--raised .mdc-button__label+.mdc-button__icon[dir=rtl],[dir=rtl] .mdc-button--unelevated .mdc-button__label+.mdc-button__icon,.mdc-button--unelevated .mdc-button__label+.mdc-button__icon[dir=rtl],[dir=rtl] .mdc-button--outlined .mdc-button__label+.mdc-button__icon,.mdc-button--outlined .mdc-button__label+.mdc-button__icon[dir=rtl]{margin-left:-4px;margin-right:8px}.mdc-button--raised,.mdc-button--unelevated{padding:0 16px 0 16px}.mdc-button--raised:not(:disabled),.mdc-button--unelevated:not(:disabled){background-color:#6200ee;background-color:var(--mdc-theme-primary, #6200ee)}.mdc-button--raised:not(:disabled),.mdc-button--unelevated:not(:disabled){color:#fff;color:var(--mdc-theme-on-primary, #fff)}.mdc-button--raised:disabled,.mdc-button--unelevated:disabled{background-color:rgba(0, 0, 0, 0.12)}.mdc-button--raised:disabled,.mdc-button--unelevated:disabled{color:rgba(0, 0, 0, 0.38)}.mdc-button--raised{box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.2),0px 2px 2px 0px rgba(0, 0, 0, 0.14),0px 1px 5px 0px rgba(0,0,0,.12);transition:box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-button--raised:hover,.mdc-button--raised:focus{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0,0,0,.12)}.mdc-button--raised:active{box-shadow:0px 5px 5px -3px rgba(0, 0, 0, 0.2),0px 8px 10px 1px rgba(0, 0, 0, 0.14),0px 3px 14px 2px rgba(0,0,0,.12)}.mdc-button--raised:disabled{box-shadow:0px 0px 0px 0px rgba(0, 0, 0, 0.2),0px 0px 0px 0px rgba(0, 0, 0, 0.14),0px 0px 0px 0px rgba(0,0,0,.12)}.mdc-button--outlined{padding:0 15px 0 15px;border-width:1px;border-style:solid}.mdc-button--outlined .mdc-button__ripple{top:-1px;left:-1px;border:1px solid transparent}.mdc-button--outlined .mdc-button__touch{left:-1px;width:calc(100% + 2 * 1px)}.mdc-button--outlined:not(:disabled){border-color:rgba(0, 0, 0, 0.12)}.mdc-button--outlined:disabled{border-color:rgba(0, 0, 0, 0.12)}.mdc-button--touch{margin-top:6px;margin-bottom:6px}:host{display:inline-flex;outline:none;-webkit-tap-highlight-color:transparent;vertical-align:top}:host([fullwidth]){width:100%}:host([raised]),:host([unelevated]){--mdc-ripple-color: #fff;--mdc-ripple-focus-opacity: 0.24;--mdc-ripple-hover-opacity: 0.08;--mdc-ripple-press-opacity: 0.24}.trailing-icon ::slotted(*),.trailing-icon .mdc-button__icon,.leading-icon ::slotted(*),.leading-icon .mdc-button__icon{margin-left:0;margin-right:8px;display:inline-block;width:18px;height:18px;font-size:18px;vertical-align:top}[dir=rtl] .trailing-icon ::slotted(*),.trailing-icon ::slotted(*)[dir=rtl],[dir=rtl] .trailing-icon .mdc-button__icon,.trailing-icon .mdc-button__icon[dir=rtl],[dir=rtl] .leading-icon ::slotted(*),.leading-icon ::slotted(*)[dir=rtl],[dir=rtl] .leading-icon .mdc-button__icon,.leading-icon .mdc-button__icon[dir=rtl]{margin-left:8px;margin-right:0}.trailing-icon ::slotted(*),.trailing-icon .mdc-button__icon{margin-left:8px;margin-right:0}[dir=rtl] .trailing-icon ::slotted(*),.trailing-icon ::slotted(*)[dir=rtl],[dir=rtl] .trailing-icon .mdc-button__icon,.trailing-icon .mdc-button__icon[dir=rtl]{margin-left:0;margin-right:8px}.slot-container{display:inline-flex;align-items:center;justify-content:center}.slot-container.flex{flex:auto}.mdc-button{flex:auto;overflow:hidden;padding-left:8px;padding-left:var(--mdc-button-horizontal-padding, 8px);padding-right:8px;padding-right:var(--mdc-button-horizontal-padding, 8px)}.mdc-button--raised{box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);box-shadow:var(--mdc-button-raised-box-shadow, 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12))}.mdc-button--raised:focus{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);box-shadow:var(--mdc-button-raised-box-shadow-focus, var(--mdc-button-raised-box-shadow-hover, 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)))}.mdc-button--raised:hover{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);box-shadow:var(--mdc-button-raised-box-shadow-hover, 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12))}.mdc-button--raised:active{box-shadow:0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12);box-shadow:var(--mdc-button-raised-box-shadow-active, 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12))}.mdc-button--raised:disabled{box-shadow:0px 0px 0px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12);box-shadow:var(--mdc-button-raised-box-shadow-disabled, 0px 0px 0px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12))}.mdc-button--raised,.mdc-button--unelevated{padding-left:16px;padding-left:var(--mdc-button-horizontal-padding, 16px);padding-right:16px;padding-right:var(--mdc-button-horizontal-padding, 16px)}.mdc-button--outlined{border-width:1px;border-width:var(--mdc-button-outline-width, 1px);padding-left:calc(16px - 1px);padding-left:calc(var(--mdc-button-horizontal-padding, 16px) - var(--mdc-button-outline-width, 1px));padding-right:calc(16px - 1px);padding-right:calc(var(--mdc-button-horizontal-padding, 16px) - var(--mdc-button-outline-width, 1px))}.mdc-button--outlined:not(:disabled){border-color:rgba(0, 0, 0, 0.12);border-color:var(--mdc-button-outline-color, rgba(0, 0, 0, 0.12))}.mdc-button--outlined .ripple{top:calc(-1 * 1px);top:calc(-1 * var(--mdc-button-outline-width, 1px));left:calc(-1 * 1px);left:calc(-1 * var(--mdc-button-outline-width, 1px));right:initial;border-width:1px;border-width:var(--mdc-button-outline-width, 1px);border-style:solid;border-color:transparent}[dir=rtl] .mdc-button--outlined .ripple,.mdc-button--outlined .ripple[dir=rtl]{left:initial;right:calc(-1 * 1px);right:calc(-1 * var(--mdc-button-outline-width, 1px))}.mdc-button--dense{height:28px;margin-top:0;margin-bottom:0}.mdc-button--dense .mdc-button__touch{display:none}:host([disabled]){pointer-events:none}:host([disabled]) .mdc-button{color:rgba(0, 0, 0, 0.38);color:var(--mdc-button-disabled-ink-color, rgba(0, 0, 0, 0.38))}:host([disabled]) .mdc-button--raised,:host([disabled]) .mdc-button--unelevated{background-color:rgba(0, 0, 0, 0.12);background-color:var(--mdc-button-disabled-fill-color, rgba(0, 0, 0, 0.12))}:host([disabled]) .mdc-button--outlined{border-color:rgba(0, 0, 0, 0.12);border-color:var(--mdc-button-disabled-outline-color, rgba(0, 0, 0, 0.12))}`;

/** @soyCompatible */
let Button = class Button extends ButtonBase {
};
Button.styles = style$h;
Button = __decorate([
    customElement('mwc-button')
], Button);

/** @soyCompatible */
class LinearProgressBase extends LitElement {
    constructor() {
        super(...arguments);
        this.indeterminate = false;
        this.progress = 0;
        this.buffer = 1;
        this.reverse = false;
        this.closed = false;
        this.ariaLabel = '';
        this.stylePrimaryHalf = '';
        this.stylePrimaryFull = '';
        this.styleSecondaryQuarter = '';
        this.styleSecondaryHalf = '';
        this.styleSecondaryFull = '';
        this.animationReady = true;
        this.closedAnimationOff = false;
        this.resizeObserver = null;
    }
    connectedCallback() {
        super.connectedCallback();
        // if detached and reattached
        if (this.rootEl) {
            this.attachResizeObserver();
        }
    }
    /**
     * @soyTemplate
     */
    render() {
        /** @classMap */
        const classes = {
            'mdc-linear-progress--closed': this.closed,
            'mdc-linear-progress--closed-animation-off': this.closedAnimationOff,
            'mdc-linear-progress--indeterminate': this.indeterminate,
            'mdc-linear-progress--reversed': this.reverse,
            // needed for controller-less render
            'mdc-linear-progress--animation-ready': this.animationReady
        };
        const rootStyles = {
            '--mdc-linear-progress-primary-half': this.stylePrimaryHalf,
            '--mdc-linear-progress-primary-half-neg': this.stylePrimaryHalf !== '' ? `-${this.stylePrimaryHalf}` : '',
            '--mdc-linear-progress-primary-full': this.stylePrimaryFull,
            '--mdc-linear-progress-primary-full-neg': this.stylePrimaryFull !== '' ? `-${this.stylePrimaryFull}` : '',
            '--mdc-linear-progress-secondary-quarter': this.styleSecondaryQuarter,
            '--mdc-linear-progress-secondary-quarter-neg': this.styleSecondaryQuarter !== '' ? `-${this.styleSecondaryQuarter}` :
                '',
            '--mdc-linear-progress-secondary-half': this.styleSecondaryHalf,
            '--mdc-linear-progress-secondary-half-neg': this.styleSecondaryHalf !== '' ? `-${this.styleSecondaryHalf}` : '',
            '--mdc-linear-progress-secondary-full': this.styleSecondaryFull,
            '--mdc-linear-progress-secondary-full-neg': this.styleSecondaryFull !== '' ? `-${this.styleSecondaryFull}` : '',
        };
        const bufferBarStyles = {
            'flex-basis': this.indeterminate ? '100%' : `${this.buffer * 100}%`,
        };
        const primaryBarStyles = {
            transform: this.indeterminate ? 'scaleX(1)' : `scaleX(${this.progress})`,
        };
        return html$2 `
      <div
          role="progressbar"
          class="mdc-linear-progress ${classMap(classes)}"
          style=${styleMap(rootStyles)}
          aria-label=${ifDefined(this.ariaLabel ? this.ariaLabel : undefined)}
          aria-valuemin="0"
          aria-valuemax="1"
          aria-valuenow=${ifDefined(this.indeterminate ? undefined : this.progress)}
        @transitionend=${this.syncClosedState}>
        <div class="mdc-linear-progress__buffer">
          <div
            class="mdc-linear-progress__buffer-bar"
            style=${styleMap(bufferBarStyles)}>
          </div>
          <div class="mdc-linear-progress__buffer-dots"></div>
        </div>
        <div
            class="mdc-linear-progress__bar mdc-linear-progress__primary-bar"
            style=${styleMap(primaryBarStyles)}>
          <span class="mdc-linear-progress__bar-inner"></span>
        </div>
        <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
          <span class="mdc-linear-progress__bar-inner"></span>
        </div>
      </div>`;
    }
    update(changedProperties) {
        // - When showing the indicator, enable animations immediately.
        // - On first render, disable the animation immediately.
        // - For normal calls to hide the component, let transitionend event trigger
        //   disabling of animations instead (see render method), so that animation
        //   does not jump in the middle of fade out.
        if (changedProperties.has('closed') &&
            (!this.closed || changedProperties.get('closed') === undefined)) {
            this.syncClosedState();
        }
        super.update(changedProperties);
    }
    async firstUpdated(changed) {
        super.firstUpdated(changed);
        this.attachResizeObserver();
    }
    syncClosedState() {
        this.closedAnimationOff = this.closed;
    }
    updated(changed) {
        // restart animation for timing if reverse changed and is indeterminate.
        // don't restart here if indeterminate has changed as well because we don't
        // want to incur an extra style recalculation
        if (!changed.has('indeterminate') && changed.has('reverse') &&
            this.indeterminate) {
            this.restartAnimation();
        }
        // Recaclulate the animation css custom props and restart the calculation
        // if this is not the first render cycle, otherwise, resize observer init
        // will already handle this and prevent unnecessary rerender + style recalc
        // but resize observer will not update animation vals while determinate
        if (changed.has('indeterminate') &&
            changed.get('indeterminate') !== undefined && this.indeterminate &&
            window.ResizeObserver) {
            this.calculateAndSetAnimationDimensions(this.rootEl.offsetWidth);
        }
        super.updated(changed);
    }
    disconnectedCallback() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        super.disconnectedCallback();
    }
    attachResizeObserver() {
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver((entries) => {
                if (!this.indeterminate) {
                    return;
                }
                for (const entry of entries) {
                    if (entry.contentRect) {
                        const width = entry.contentRect.width;
                        this.calculateAndSetAnimationDimensions(width);
                    }
                }
            });
            this.resizeObserver.observe(this.rootEl);
            return;
        }
        this.resizeObserver = null;
    }
    calculateAndSetAnimationDimensions(width) {
        const primaryHalf = width * 0.8367142;
        const primaryFull = width * 2.00611057;
        const secondaryQuarter = width * 0.37651913;
        const secondaryHalf = width * 0.84386165;
        const secondaryFull = width * 1.60277782;
        this.stylePrimaryHalf = `${primaryHalf}px`;
        this.stylePrimaryFull = `${primaryFull}px`;
        this.styleSecondaryQuarter = `${secondaryQuarter}px`;
        this.styleSecondaryHalf = `${secondaryHalf}px`;
        this.styleSecondaryFull = `${secondaryFull}px`;
        // need to restart animation for custom props to apply to keyframes
        this.restartAnimation();
    }
    async restartAnimation() {
        this.animationReady = false;
        await this.updateComplete;
        await new Promise(requestAnimationFrame);
        this.animationReady = true;
        await this.updateComplete;
    }
    open() {
        this.closed = false;
    }
    close() {
        this.closed = true;
    }
}
__decorate([
    query('.mdc-linear-progress')
], LinearProgressBase.prototype, "rootEl", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LinearProgressBase.prototype, "indeterminate", void 0);
__decorate([
    property({ type: Number })
], LinearProgressBase.prototype, "progress", void 0);
__decorate([
    property({ type: Number })
], LinearProgressBase.prototype, "buffer", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LinearProgressBase.prototype, "reverse", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LinearProgressBase.prototype, "closed", void 0);
__decorate([
    property()
], LinearProgressBase.prototype, "ariaLabel", void 0);
__decorate([
    internalProperty()
], LinearProgressBase.prototype, "stylePrimaryHalf", void 0);
__decorate([
    internalProperty()
], LinearProgressBase.prototype, "stylePrimaryFull", void 0);
__decorate([
    internalProperty()
], LinearProgressBase.prototype, "styleSecondaryQuarter", void 0);
__decorate([
    internalProperty()
], LinearProgressBase.prototype, "styleSecondaryHalf", void 0);
__decorate([
    internalProperty()
], LinearProgressBase.prototype, "styleSecondaryFull", void 0);
__decorate([
    internalProperty()
], LinearProgressBase.prototype, "animationReady", void 0);
__decorate([
    internalProperty()
], LinearProgressBase.prototype, "closedAnimationOff", void 0);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$i = css `@keyframes mdc-linear-progress-primary-indeterminate-translate{0%{transform:translateX(0)}20%{animation-timing-function:cubic-bezier(0.5, 0, 0.701732, 0.495819);transform:translateX(0)}59.15%{animation-timing-function:cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);transform:translateX(83.67142%);transform:translateX(var(--mdc-linear-progress-primary-half, 83.67142%))}100%{transform:translateX(200.611057%);transform:translateX(var(--mdc-linear-progress-primary-full, 200.611057%))}}@keyframes mdc-linear-progress-primary-indeterminate-scale{0%{transform:scaleX(0.08)}36.65%{animation-timing-function:cubic-bezier(0.334731, 0.12482, 0.785844, 1);transform:scaleX(0.08)}69.15%{animation-timing-function:cubic-bezier(0.06, 0.11, 0.6, 1);transform:scaleX(0.661479)}100%{transform:scaleX(0.08)}}@keyframes mdc-linear-progress-secondary-indeterminate-translate{0%{animation-timing-function:cubic-bezier(0.15, 0, 0.515058, 0.409685);transform:translateX(0)}25%{animation-timing-function:cubic-bezier(0.31033, 0.284058, 0.8, 0.733712);transform:translateX(37.651913%);transform:translateX(var(--mdc-linear-progress-secondary-quarter, 37.651913%))}48.35%{animation-timing-function:cubic-bezier(0.4, 0.627035, 0.6, 0.902026);transform:translateX(84.386165%);transform:translateX(var(--mdc-linear-progress-secondary-half, 84.386165%))}100%{transform:translateX(160.277782%);transform:translateX(var(--mdc-linear-progress-secondary-full, 160.277782%))}}@keyframes mdc-linear-progress-secondary-indeterminate-scale{0%{animation-timing-function:cubic-bezier(0.205028, 0.057051, 0.57661, 0.453971);transform:scaleX(0.08)}19.15%{animation-timing-function:cubic-bezier(0.152313, 0.196432, 0.648374, 1.004315);transform:scaleX(0.457104)}44.15%{animation-timing-function:cubic-bezier(0.257759, -0.003163, 0.211762, 1.38179);transform:scaleX(0.72796)}100%{transform:scaleX(0.08)}}@keyframes mdc-linear-progress-buffering{from{transform:rotate(180deg) translateX(-10px)}}@keyframes mdc-linear-progress-primary-indeterminate-translate-reverse{0%{transform:translateX(0)}20%{animation-timing-function:cubic-bezier(0.5, 0, 0.701732, 0.495819);transform:translateX(0)}59.15%{animation-timing-function:cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);transform:translateX(-83.67142%);transform:translateX(var(--mdc-linear-progress-primary-half-neg, -83.67142%))}100%{transform:translateX(-200.611057%);transform:translateX(var(--mdc-linear-progress-primary-full-neg, -200.611057%))}}@keyframes mdc-linear-progress-secondary-indeterminate-translate-reverse{0%{animation-timing-function:cubic-bezier(0.15, 0, 0.515058, 0.409685);transform:translateX(0)}25%{animation-timing-function:cubic-bezier(0.31033, 0.284058, 0.8, 0.733712);transform:translateX(-37.651913%);transform:translateX(var(--mdc-linear-progress-secondary-quarter-neg, -37.651913%))}48.35%{animation-timing-function:cubic-bezier(0.4, 0.627035, 0.6, 0.902026);transform:translateX(-84.386165%);transform:translateX(var(--mdc-linear-progress-secondary-half-neg, -84.386165%))}100%{transform:translateX(-160.277782%);transform:translateX(var(--mdc-linear-progress-secondary-full-neg, -160.277782%))}}@keyframes mdc-linear-progress-buffering-reverse{from{transform:translateX(-10px)}}.mdc-linear-progress{position:relative;width:100%;height:4px;transform:translateZ(0);outline:1px solid transparent;overflow:hidden;transition:opacity 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-linear-progress__bar{position:absolute;width:100%;height:100%;animation:none;transform-origin:top left;transition:transform 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-linear-progress__bar-inner{display:inline-block;position:absolute;width:100%;animation:none;border-top:4px solid}.mdc-linear-progress__buffer{display:flex;position:absolute;width:100%;height:100%}.mdc-linear-progress__buffer-dots{background-repeat:repeat-x;background-size:10px 4px;flex:auto;transform:rotate(180deg);animation:mdc-linear-progress-buffering 250ms infinite linear}.mdc-linear-progress__buffer-bar{flex:0 1 100%;transition:flex-basis 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-linear-progress__primary-bar{transform:scaleX(0)}.mdc-linear-progress__secondary-bar{visibility:hidden}.mdc-linear-progress--indeterminate .mdc-linear-progress__bar{transition:none}.mdc-linear-progress--indeterminate .mdc-linear-progress__primary-bar{left:-145.166611%}.mdc-linear-progress--indeterminate .mdc-linear-progress__secondary-bar{left:-54.888891%;visibility:visible}.mdc-linear-progress--indeterminate.mdc-linear-progress--animation-ready .mdc-linear-progress__primary-bar{animation:mdc-linear-progress-primary-indeterminate-translate 2s infinite linear}.mdc-linear-progress--indeterminate.mdc-linear-progress--animation-ready .mdc-linear-progress__primary-bar>.mdc-linear-progress__bar-inner{animation:mdc-linear-progress-primary-indeterminate-scale 2s infinite linear}.mdc-linear-progress--indeterminate.mdc-linear-progress--animation-ready .mdc-linear-progress__secondary-bar{animation:mdc-linear-progress-secondary-indeterminate-translate 2s infinite linear}.mdc-linear-progress--indeterminate.mdc-linear-progress--animation-ready .mdc-linear-progress__secondary-bar>.mdc-linear-progress__bar-inner{animation:mdc-linear-progress-secondary-indeterminate-scale 2s infinite linear}.mdc-linear-progress--reversed .mdc-linear-progress__bar{right:0;transform-origin:center right}.mdc-linear-progress--reversed.mdc-linear-progress--animation-ready .mdc-linear-progress__primary-bar{animation-name:mdc-linear-progress-primary-indeterminate-translate-reverse}.mdc-linear-progress--reversed.mdc-linear-progress--animation-ready .mdc-linear-progress__secondary-bar{animation-name:mdc-linear-progress-secondary-indeterminate-translate-reverse}.mdc-linear-progress--reversed .mdc-linear-progress__buffer-dots{animation:mdc-linear-progress-buffering-reverse 250ms infinite linear;order:0;transform:rotate(0)}.mdc-linear-progress--reversed .mdc-linear-progress__buffer-bar{order:1}.mdc-linear-progress--closed{opacity:0}.mdc-linear-progress--closed-animation-off .mdc-linear-progress__buffer-dots{animation:none}.mdc-linear-progress--closed-animation-off.mdc-linear-progress--indeterminate .mdc-linear-progress__bar,.mdc-linear-progress--closed-animation-off.mdc-linear-progress--indeterminate .mdc-linear-progress__bar .mdc-linear-progress__bar-inner{animation:none}.mdc-linear-progress__bar-inner{border-color:#6200ee;border-color:var(--mdc-theme-primary, #6200ee)}.mdc-linear-progress__buffer-dots{background-image:url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' enable-background='new 0 0 5 2' xml:space='preserve' viewBox='0 0 5 2' preserveAspectRatio='none slice'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23e6e6e6'/%3E%3C/svg%3E")}.mdc-linear-progress__buffer-bar{background-color:#e6e6e6}.mdc-linear-progress--indeterminate.mdc-linear-progress--reversed .mdc-linear-progress__primary-bar{right:-145.166611%;left:auto}.mdc-linear-progress--indeterminate.mdc-linear-progress--reversed .mdc-linear-progress__secondary-bar{right:-54.888891%;left:auto}:host{display:block}.mdc-linear-progress__buffer-bar{background-color:#e6e6e6;background-color:var(--mdc-linear-progress-buffer-color, #e6e6e6)}.mdc-linear-progress__buffer-dots{background-image:url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' enable-background='new 0 0 5 2' xml:space='preserve' viewBox='0 0 5 2' preserveAspectRatio='none slice'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23e6e6e6'/%3E%3C/svg%3E");background-image:var(--mdc-linear-progress-buffering-dots-image, url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' enable-background='new 0 0 5 2' xml:space='preserve' viewBox='0 0 5 2' preserveAspectRatio='none slice'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23e6e6e6'/%3E%3C/svg%3E"))}`;

/** @soyCompatible */
let LinearProgress = class LinearProgress extends LinearProgressBase {
};
LinearProgress.styles = style$i;
LinearProgress = __decorate([
    customElement('mwc-linear-progress')
], LinearProgress);

const imageLoading = '{{loading image ...}}';

/**
 * Markdown editor, with droppable and image copy/paste facility. 
 * This is supposed to work as blog poset editor where images 
 * can be added.
 *
 * Note: `firebase-document-upload` shall be availalbe in DOM independently
 */
// class PwiMdDroppableEditor extends Droppable(PwiMdEditor) {
class PwiMdDroppableEditor extends PwiMdEditor {

  static get styles() {
    return [
      super.styles,
      droppable,
      css `
      firebase-document-upload  {
        display: none;
      }

      mwc-button {
        margin-top: var(--space-xx-small, 4px);
      }

      [part=error] {
        color: var(--color-error, red);
        padding: 0 20px;
      }
    `
    ];
  }

  static get properties() {
    return {
      ...super.properties,

      /*
       * `nodrop` set true to prevent droping files
       */
      nodrop: {
        type: Boolean
      },

      /**
       * Specifies the types of files that the server accepts.
       * Syntax: a comma-separated list of MIME type patterns (wildcards are
       * allowed) or file extensions.
       * Notice that MIME types are widely supported, while file extensions
       * are only implemented in certain browsers, so avoid using it.
       * Example: accept="video/*,image/tiff" or accept=".pdf,audio/mp3"
       */
      accept: {
        type: String,
        value: ''
      },

      /**
       * Specifies the maximum file size in bytes allowed to upload.
       * Notice that it is a client-side constraint, which will be checked before
       * sending the request. Obviously you need to do the same validation in
       * the server-side and be sure that they are aligned.
       */
      maxFileSize: {
        type: Number,
        attribute: 'max-file-size',
        value: Infinity
      },

      /*
       * `dragoverValid` true when we drag-over and the drag is valid.
       */
      dragoverValid: {
        type: Boolean,
        reflect: true,
        attribute: 'dragover-valid'
      },

      /*
       * `log` true to log in the console
       */
      log: {
        type: Boolean
      },

      /*
       * `_uploadStatus` status {
       *  status: {started|progress|success|error}
       *  error: error,
       *  file: String,
       *  progress: Number
       */
      _uploadStatus: {
        type: Object,
      },

      _errorMessage: {
        type: String
      }
    };
  }

  render() {
    const editor = super.render();

    return [html$2 `
     <firebase-document-upload 
        prevent-read
        .log="${this.log}"
        .nodrop="${this.nodrop}"
        .accept="${this.accept}" 
        .maxFileSize="${this.maxFileSize}"
        .path="${this.path}" 
        .dropTarget="${this.dropTarget}"
        @upload-start="${this.onUploadStart}" 
        @upload-success="${this.onUploadSuccess}" 
        @upload-error="${this.onUploadError}" 
        @upload-progress="${this.onUploadProgress}"  
        @upload-finished="${this.onUploadFinished}"  
        @file-reject="${this.onFileReject}"
      ></firebase-document-upload>`, editor];
  }

  renderSlotToolbar() {
    return html$2 `
        <div id="toolbar">
          ${this._errorMessage ? html$2`<span part="error">${this._errorMessage}</span>` : ''}
          <mwc-button  dense @click="${this.onclickUpload}" label="upload image" icon="cloud_upload"></mwc-button>
          ${this.loading ? html$2 `<mwc-linear-progress indeterminate></mwc-linear-progress> ` : ''} 
        </div>
    `;
  }

  constructor() {
    super();
    this.path = 'pathNeedToBeSet';
    this.addEventListener('paste', this.onPaste);
    this.accept = 'image/*, video/*';
  }

  get upload() {
    return this.renderRoot.querySelector('firebase-document-upload');
  }

  firstUpdated() {
    this.setAttribute('droppable', true);
    setTimeout(() => {
      this.upload.dropTarget = this;
    }, 200);
  }

  update(props) {
    if (props.has('_uploadStatus')) {
      this.processStatus();
    }
    super.update(props);
  }

  processStatus() {
    const status = this._uploadStatus;
    this.log && console.info('processStatus', status);
    if (status.status === 'start') {
      this._errorMessage = null;
      this.uploadingStarted();
    }
    // if (status.status === 'progress') {
    // }
    // if (status.status === 'success') {
    // }
    if (status.status === 'finished') {
      this.uploadingFinished(status);
    }
    if (status.status === 'error') {
      this._errorMessage = status.error;
      setTimeout(() => {this._errorMessage = null; }, 4000);
    }
  }

  _isOnTextarea(e) {
    return e.composedPath()[0].localName === 'textarea';
  }

  canDrag(e) {
    return this._isOnTextarea(e);
  }

  canDrop(e) {
    return this._isOnTextarea(e);
  }

  uploadingStarted() {
    this.insertAtCaret(`\n${imageLoading}`);
    this.md = this.textarea.value;
  }

  formatURL(url) {
    return url;
  }

  uploadingFinished(status) {
    this.md = this.md.replace(imageLoading, `![${status.file.name.split('.')[0]}](${this.formatURL(status.file.url)})`);
  }

  onclickUpload() {
    this.upload._onAddFilesClick();
  }

  onUploadError(e) {
    this.loading = false;
    this._uploadStatus = {
      status: 'error',
      file: e.detail.file,
      error: e.detail.file.error
    };
  }
  onUploadSuccess(e) {
    this.loading = false;
    this._uploadStatus = {
      status: 'success',
      file: e.detail.file
    };
  }

  onUploadFinished(e) {
    this.loading = false;
    this._uploadStatus = {
      status: 'finished',
      file: e.detail.file
    };
  }

  onUploadProgress(e) {
    this.loading = true;
    this._uploadStatus = {
      status: 'progress',
      file: e.detail.file
    };
  }

  onUploadStart(e) {
    this.loading = true;
    this._uploadStatus = {
      status: 'start',
      file: e.detail.file
    };
  }

  onFileReject(e) {
    this.loading = false;
    this._uploadStatus = {
      status: 'error',
      file: e.detail.file,
      error: e.detail.error
    };
  }

  // Note(cg): handle pasting image data ; ) 
  onPaste(e) {

    // We need to check if event.clipboardData is supported (Chrome & IE)
    if (e.clipboardData && e.clipboardData.items) {

      // Get the items from the clipboard
      var items = e.clipboardData.items;

      // Loop through all items, looking for any kind of image
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          // We need to represent the image as a file
          this.upload._uploadFirebaseFile(items[i].getAsFile());
          // Prevent the image (or URL) from being pasted into the contenteditable element
          e.preventDefault();
        }
      }
    }
  }
}

// Register the new element with the browser.
customElements.define('pwi-md-droppable-editor', PwiMdDroppableEditor);

// import { ifDefined } from 'lit-html/directives/if-defined.js';

/*
   # Checkbox for form (preignition form engine)

   It renders a checkbox within a pseudo-input field

   @fires checked-changed when status of chekbox changes
 */

class PwiFormCheckBase extends doNotSetUndefinedValue(PwiAccessibleTextfield) {

  static get styles() {
    return [super.styles, css `
    :host {
      width: 100%;
    }

    :host(:hover:not([focused]):not([disabled]):not([invalid])) .mdc-text-field .label-above {
     color: var(--mdc-theme-text-primary-on-background);
    }

    /* Option container layout  */
    pwi-pseudo-input:focus {
      outline: none;
    }
    
    `];
  }

  static get properties() {
    return {

      ...super.properties,

      focused: {
        type: Boolean,
        reflect: true
      },

      invalid: {
        type: Boolean,
        reflect: true
      },

      disabled: {
        type: Boolean,
        reflect: true
      },

      /*
       * `checkboxlabel` label of checkbox
       */
      checkboxlabel: {
        type: String,
      },

      /*
       * `checked` status of check box
       */
      checked: {
        type: Boolean,
      },
    };
  }

  constructor() {
    super();
    this.labelAbove = true;
    this.addEventListener('focusin', this._onFocusin);
    this.addEventListener('focusout', this._onFocusout);
  }

  disconnectedCallback() {
    this.removeEventListener('focusin', this._onFocusin);
    this.removeEventListener('focusout', this._onFocusout);
    super.disconnectedCallback();
  }

  _onFocusout() {
    // console.info('out')
    this.focused = false;
  }

  _onFocusin() {
    // console.info('in')
    this.focused = true;
  }

  get formElement() {
    return this.renderRoot.querySelector('pwi-pseudo-input');
  }

  onChange(e) {
    // console.info('change', e, e.currentTarget.checked);
    this.checked = e.currentTarget.checked;
    this.dispatchEvent(new CustomEvent('checked-changed', {detail: {value: this.checked}}));
  }

  renderInput() {
    return html$2 `need to be overriden`;
  }
}

/*
   # Checkbox for form (preignition form engine)

   It renders a checkbox within a pseudo-input field

   @fires checked-changed when status of chekbox changes
 */

class PwiFormCheckbox extends PwiFormCheckBase {

  renderInput() {
    const showValidationMessage = this.validationMessage && !this.isUiValid;
    return html$2 `
     <pwi-pseudo-input
        
        part="pwi-group-container"
        role="group"
        aria-labelledby="label"
        aria-describedby="${
        ifDefined(
            this.focused || this.helperPersistent || showValidationMessage ?
                'helper-text' :
                undefined)}"
        ><pwi-formfield .label="${this.checkboxlabel}">
          <pwi-checkbox 
            ?checked="${this.checked}"
            @change="${this.onChange}"></pwi-checkbox>
        </pwi-formfield>
        </pwi-pseudo-input>`;
  }


}

customElements.define('pwi-form-checkbox', PwiFormCheckbox);

/*
   # Checkbox for form (preignition form engine)

   It renders a checkbox within a pseudo-input field

   @fires checked-changed when status of chekbox changes
 */

class PwiFormSwitch extends PwiFormCheckBase {

  static get styles() {
    return [super.styles, css `
      pwi-pseudo-input {
        height: 48px;
        display: flex;
      }
    `];
  }

  renderInput() {
    const showValidationMessage = this.validationMessage && !this.isUiValid;
    return html$2 `
     <pwi-pseudo-input
        part="pwi-group-container"
        role="group"
        aria-labelledby="label"
        aria-describedby="${
        ifDefined(
            this.focused || this.helperPersistent || showValidationMessage ?
                'helper-text' :
                undefined)}"
        ><pwi-formfield .label="${this.checkboxlabel}">
          <pwi-switch 
            ?checked="${this.checked}"
            @change="${this.onChange}"></pwi-switch>
        </pwi-formfield>
        </pwi-pseudo-input>`;
  }
}

customElements.define('pwi-form-switch', PwiFormSwitch);

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

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var cronstrue = createCommonjsModule(function (module, exports) {
(function webpackUniversalModuleDefinition(root, factory) {
	module.exports = factory();
})(typeof self !== 'undefined' ? self : commonjsGlobal, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionDescriptor = void 0;
var stringUtilities_1 = __webpack_require__(1);
var cronParser_1 = __webpack_require__(2);
var ExpressionDescriptor = (function () {
    function ExpressionDescriptor(expression, options) {
        this.expression = expression;
        this.options = options;
        this.expressionParts = new Array(5);
        if (ExpressionDescriptor.locales[options.locale]) {
            this.i18n = ExpressionDescriptor.locales[options.locale];
        }
        else {
            console.warn("Locale '" + options.locale + "' could not be found; falling back to 'en'.");
            this.i18n = ExpressionDescriptor.locales["en"];
        }
        if (options.use24HourTimeFormat === undefined) {
            options.use24HourTimeFormat = this.i18n.use24HourTimeFormatByDefault();
        }
    }
    ExpressionDescriptor.toString = function (expression, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.throwExceptionOnParseError, throwExceptionOnParseError = _c === void 0 ? true : _c, _d = _b.verbose, verbose = _d === void 0 ? false : _d, _e = _b.dayOfWeekStartIndexZero, dayOfWeekStartIndexZero = _e === void 0 ? true : _e, use24HourTimeFormat = _b.use24HourTimeFormat, _f = _b.locale, locale = _f === void 0 ? "en" : _f;
        var options = {
            throwExceptionOnParseError: throwExceptionOnParseError,
            verbose: verbose,
            dayOfWeekStartIndexZero: dayOfWeekStartIndexZero,
            use24HourTimeFormat: use24HourTimeFormat,
            locale: locale,
        };
        var descripter = new ExpressionDescriptor(expression, options);
        return descripter.getFullDescription();
    };
    ExpressionDescriptor.initialize = function (localesLoader) {
        ExpressionDescriptor.specialCharacters = ["/", "-", ",", "*"];
        localesLoader.load(ExpressionDescriptor.locales);
    };
    ExpressionDescriptor.prototype.getFullDescription = function () {
        var description = "";
        try {
            var parser = new cronParser_1.CronParser(this.expression, this.options.dayOfWeekStartIndexZero);
            this.expressionParts = parser.parse();
            var timeSegment = this.getTimeOfDayDescription();
            var dayOfMonthDesc = this.getDayOfMonthDescription();
            var monthDesc = this.getMonthDescription();
            var dayOfWeekDesc = this.getDayOfWeekDescription();
            var yearDesc = this.getYearDescription();
            description += timeSegment + dayOfMonthDesc + dayOfWeekDesc + monthDesc + yearDesc;
            description = this.transformVerbosity(description, this.options.verbose);
            description = description.charAt(0).toLocaleUpperCase() + description.substr(1);
        }
        catch (ex) {
            if (!this.options.throwExceptionOnParseError) {
                description = this.i18n.anErrorOccuredWhenGeneratingTheExpressionD();
            }
            else {
                throw "" + ex;
            }
        }
        return description;
    };
    ExpressionDescriptor.prototype.getTimeOfDayDescription = function () {
        var secondsExpression = this.expressionParts[0];
        var minuteExpression = this.expressionParts[1];
        var hourExpression = this.expressionParts[2];
        var description = "";
        if (!stringUtilities_1.StringUtilities.containsAny(minuteExpression, ExpressionDescriptor.specialCharacters) &&
            !stringUtilities_1.StringUtilities.containsAny(hourExpression, ExpressionDescriptor.specialCharacters) &&
            !stringUtilities_1.StringUtilities.containsAny(secondsExpression, ExpressionDescriptor.specialCharacters)) {
            description += this.i18n.atSpace() + this.formatTime(hourExpression, minuteExpression, secondsExpression);
        }
        else if (!secondsExpression &&
            minuteExpression.indexOf("-") > -1 &&
            !(minuteExpression.indexOf(",") > -1) &&
            !(minuteExpression.indexOf("/") > -1) &&
            !stringUtilities_1.StringUtilities.containsAny(hourExpression, ExpressionDescriptor.specialCharacters)) {
            var minuteParts = minuteExpression.split("-");
            description += stringUtilities_1.StringUtilities.format(this.i18n.everyMinuteBetweenX0AndX1(), this.formatTime(hourExpression, minuteParts[0], ""), this.formatTime(hourExpression, minuteParts[1], ""));
        }
        else if (!secondsExpression &&
            hourExpression.indexOf(",") > -1 &&
            hourExpression.indexOf("-") == -1 &&
            hourExpression.indexOf("/") == -1 &&
            !stringUtilities_1.StringUtilities.containsAny(minuteExpression, ExpressionDescriptor.specialCharacters)) {
            var hourParts = hourExpression.split(",");
            description += this.i18n.at();
            for (var i = 0; i < hourParts.length; i++) {
                description += " ";
                description += this.formatTime(hourParts[i], minuteExpression, "");
                if (i < hourParts.length - 2) {
                    description += ",";
                }
                if (i == hourParts.length - 2) {
                    description += this.i18n.spaceAnd();
                }
            }
        }
        else {
            var secondsDescription = this.getSecondsDescription();
            var minutesDescription = this.getMinutesDescription();
            var hoursDescription = this.getHoursDescription();
            description += secondsDescription;
            if (description.length > 0 && minutesDescription.length > 0) {
                description += ", ";
            }
            description += minutesDescription;
            if (description.length > 0 && hoursDescription.length > 0) {
                description += ", ";
            }
            description += hoursDescription;
        }
        return description;
    };
    ExpressionDescriptor.prototype.getSecondsDescription = function () {
        var _this = this;
        var description = this.getSegmentDescription(this.expressionParts[0], this.i18n.everySecond(), function (s) {
            return s;
        }, function (s) {
            return stringUtilities_1.StringUtilities.format(_this.i18n.everyX0Seconds(), s);
        }, function (s) {
            return _this.i18n.secondsX0ThroughX1PastTheMinute();
        }, function (s) {
            return s == "0"
                ? ""
                : parseInt(s) < 20
                    ? _this.i18n.atX0SecondsPastTheMinute()
                    : _this.i18n.atX0SecondsPastTheMinuteGt20() || _this.i18n.atX0SecondsPastTheMinute();
        });
        return description;
    };
    ExpressionDescriptor.prototype.getMinutesDescription = function () {
        var _this = this;
        var secondsExpression = this.expressionParts[0];
        var hourExpression = this.expressionParts[2];
        var description = this.getSegmentDescription(this.expressionParts[1], this.i18n.everyMinute(), function (s) {
            return s;
        }, function (s) {
            return stringUtilities_1.StringUtilities.format(_this.i18n.everyX0Minutes(), s);
        }, function (s) {
            return _this.i18n.minutesX0ThroughX1PastTheHour();
        }, function (s) {
            try {
                return s == "0" && hourExpression.indexOf("/") == -1 && secondsExpression == ""
                    ? _this.i18n.everyHour()
                    : parseInt(s) < 20
                        ? _this.i18n.atX0MinutesPastTheHour()
                        : _this.i18n.atX0MinutesPastTheHourGt20() || _this.i18n.atX0MinutesPastTheHour();
            }
            catch (e) {
                return _this.i18n.atX0MinutesPastTheHour();
            }
        });
        return description;
    };
    ExpressionDescriptor.prototype.getHoursDescription = function () {
        var _this = this;
        var expression = this.expressionParts[2];
        var description = this.getSegmentDescription(expression, this.i18n.everyHour(), function (s) {
            return _this.formatTime(s, "0", "");
        }, function (s) {
            return stringUtilities_1.StringUtilities.format(_this.i18n.everyX0Hours(), s);
        }, function (s) {
            return _this.i18n.betweenX0AndX1();
        }, function (s) {
            return _this.i18n.atX0();
        });
        return description;
    };
    ExpressionDescriptor.prototype.getDayOfWeekDescription = function () {
        var _this = this;
        var daysOfWeekNames = this.i18n.daysOfTheWeek();
        var description = null;
        if (this.expressionParts[5] == "*") {
            description = "";
        }
        else {
            description = this.getSegmentDescription(this.expressionParts[5], this.i18n.commaEveryDay(), function (s) {
                var exp = s;
                if (s.indexOf("#") > -1) {
                    exp = s.substr(0, s.indexOf("#"));
                }
                else if (s.indexOf("L") > -1) {
                    exp = exp.replace("L", "");
                }
                return daysOfWeekNames[parseInt(exp)];
            }, function (s) {
                if (parseInt(s) == 1) {
                    return "";
                }
                else {
                    return stringUtilities_1.StringUtilities.format(_this.i18n.commaEveryX0DaysOfTheWeek(), s);
                }
            }, function (s) {
                return _this.i18n.commaX0ThroughX1();
            }, function (s) {
                var format = null;
                if (s.indexOf("#") > -1) {
                    var dayOfWeekOfMonthNumber = s.substring(s.indexOf("#") + 1);
                    var dayOfWeekOfMonthDescription = null;
                    switch (dayOfWeekOfMonthNumber) {
                        case "1":
                            dayOfWeekOfMonthDescription = _this.i18n.first();
                            break;
                        case "2":
                            dayOfWeekOfMonthDescription = _this.i18n.second();
                            break;
                        case "3":
                            dayOfWeekOfMonthDescription = _this.i18n.third();
                            break;
                        case "4":
                            dayOfWeekOfMonthDescription = _this.i18n.fourth();
                            break;
                        case "5":
                            dayOfWeekOfMonthDescription = _this.i18n.fifth();
                            break;
                    }
                    format = _this.i18n.commaOnThe() + dayOfWeekOfMonthDescription + _this.i18n.spaceX0OfTheMonth();
                }
                else if (s.indexOf("L") > -1) {
                    format = _this.i18n.commaOnTheLastX0OfTheMonth();
                }
                else {
                    var domSpecified = _this.expressionParts[3] != "*";
                    format = domSpecified ? _this.i18n.commaAndOnX0() : _this.i18n.commaOnlyOnX0();
                }
                return format;
            });
        }
        return description;
    };
    ExpressionDescriptor.prototype.getMonthDescription = function () {
        var _this = this;
        var monthNames = this.i18n.monthsOfTheYear();
        var description = this.getSegmentDescription(this.expressionParts[4], "", function (s) {
            return monthNames[parseInt(s) - 1];
        }, function (s) {
            if (parseInt(s) == 1) {
                return "";
            }
            else {
                return stringUtilities_1.StringUtilities.format(_this.i18n.commaEveryX0Months(), s);
            }
        }, function (s) {
            return _this.i18n.commaMonthX0ThroughMonthX1() || _this.i18n.commaX0ThroughX1();
        }, function (s) {
            return _this.i18n.commaOnlyInMonthX0 ? _this.i18n.commaOnlyInMonthX0() : _this.i18n.commaOnlyInX0();
        });
        return description;
    };
    ExpressionDescriptor.prototype.getDayOfMonthDescription = function () {
        var _this = this;
        var description = null;
        var expression = this.expressionParts[3];
        switch (expression) {
            case "L":
                description = this.i18n.commaOnTheLastDayOfTheMonth();
                break;
            case "WL":
            case "LW":
                description = this.i18n.commaOnTheLastWeekdayOfTheMonth();
                break;
            default:
                var weekDayNumberMatches = expression.match(/(\d{1,2}W)|(W\d{1,2})/);
                if (weekDayNumberMatches) {
                    var dayNumber = parseInt(weekDayNumberMatches[0].replace("W", ""));
                    var dayString = dayNumber == 1
                        ? this.i18n.firstWeekday()
                        : stringUtilities_1.StringUtilities.format(this.i18n.weekdayNearestDayX0(), dayNumber.toString());
                    description = stringUtilities_1.StringUtilities.format(this.i18n.commaOnTheX0OfTheMonth(), dayString);
                    break;
                }
                else {
                    var lastDayOffSetMatches = expression.match(/L-(\d{1,2})/);
                    if (lastDayOffSetMatches) {
                        var offSetDays = lastDayOffSetMatches[1];
                        description = stringUtilities_1.StringUtilities.format(this.i18n.commaDaysBeforeTheLastDayOfTheMonth(), offSetDays);
                        break;
                    }
                    else if (expression == "*" && this.expressionParts[5] != "*") {
                        return "";
                    }
                    else {
                        description = this.getSegmentDescription(expression, this.i18n.commaEveryDay(), function (s) {
                            return s == "L"
                                ? _this.i18n.lastDay()
                                : _this.i18n.dayX0
                                    ? stringUtilities_1.StringUtilities.format(_this.i18n.dayX0(), s)
                                    : s;
                        }, function (s) {
                            return s == "1" ? _this.i18n.commaEveryDay() : _this.i18n.commaEveryX0Days();
                        }, function (s) {
                            return _this.i18n.commaBetweenDayX0AndX1OfTheMonth();
                        }, function (s) {
                            return _this.i18n.commaOnDayX0OfTheMonth();
                        });
                    }
                    break;
                }
        }
        return description;
    };
    ExpressionDescriptor.prototype.getYearDescription = function () {
        var _this = this;
        var description = this.getSegmentDescription(this.expressionParts[6], "", function (s) {
            return /^\d+$/.test(s) ? new Date(parseInt(s), 1).getFullYear().toString() : s;
        }, function (s) {
            return stringUtilities_1.StringUtilities.format(_this.i18n.commaEveryX0Years(), s);
        }, function (s) {
            return _this.i18n.commaYearX0ThroughYearX1() || _this.i18n.commaX0ThroughX1();
        }, function (s) {
            return _this.i18n.commaOnlyInYearX0 ? _this.i18n.commaOnlyInYearX0() : _this.i18n.commaOnlyInX0();
        });
        return description;
    };
    ExpressionDescriptor.prototype.getSegmentDescription = function (expression, allDescription, getSingleItemDescription, getIncrementDescriptionFormat, getRangeDescriptionFormat, getDescriptionFormat) {
        var description = null;
        var doesExpressionContainIncrement = expression.indexOf("/") > -1;
        var doesExpressionContainRange = expression.indexOf("-") > -1;
        var doesExpressionContainMultipleValues = expression.indexOf(",") > -1;
        if (!expression) {
            description = "";
        }
        else if (expression === "*") {
            description = allDescription;
        }
        else if (!doesExpressionContainIncrement && !doesExpressionContainRange && !doesExpressionContainMultipleValues) {
            description = stringUtilities_1.StringUtilities.format(getDescriptionFormat(expression), getSingleItemDescription(expression));
        }
        else if (doesExpressionContainMultipleValues) {
            var segments = expression.split(",");
            var descriptionContent = "";
            for (var i = 0; i < segments.length; i++) {
                if (i > 0 && segments.length > 2) {
                    descriptionContent += ",";
                    if (i < segments.length - 1) {
                        descriptionContent += " ";
                    }
                }
                if (i > 0 && segments.length > 1 && (i == segments.length - 1 || segments.length == 2)) {
                    descriptionContent += this.i18n.spaceAnd() + " ";
                }
                if (segments[i].indexOf("/") > -1 || segments[i].indexOf("-") > -1) {
                    var isSegmentRangeWithoutIncrement = segments[i].indexOf("-") > -1 && segments[i].indexOf("/") == -1;
                    var currentDescriptionContent = this.getSegmentDescription(segments[i], allDescription, getSingleItemDescription, getIncrementDescriptionFormat, isSegmentRangeWithoutIncrement ? this.i18n.commaX0ThroughX1 : getRangeDescriptionFormat, getDescriptionFormat);
                    if (isSegmentRangeWithoutIncrement) {
                        currentDescriptionContent = currentDescriptionContent.replace(", ", "");
                    }
                    descriptionContent += currentDescriptionContent;
                }
                else if (!doesExpressionContainIncrement) {
                    descriptionContent += getSingleItemDescription(segments[i]);
                }
                else {
                    descriptionContent += this.getSegmentDescription(segments[i], allDescription, getSingleItemDescription, getIncrementDescriptionFormat, getRangeDescriptionFormat, getDescriptionFormat);
                }
            }
            if (!doesExpressionContainIncrement) {
                description = stringUtilities_1.StringUtilities.format(getDescriptionFormat(expression), descriptionContent);
            }
            else {
                description = descriptionContent;
            }
        }
        else if (doesExpressionContainIncrement) {
            var segments = expression.split("/");
            description = stringUtilities_1.StringUtilities.format(getIncrementDescriptionFormat(segments[1]), segments[1]);
            if (segments[0].indexOf("-") > -1) {
                var rangeSegmentDescription = this.generateRangeSegmentDescription(segments[0], getRangeDescriptionFormat, getSingleItemDescription);
                if (rangeSegmentDescription.indexOf(", ") != 0) {
                    description += ", ";
                }
                description += rangeSegmentDescription;
            }
            else if (segments[0].indexOf("*") == -1) {
                var rangeItemDescription = stringUtilities_1.StringUtilities.format(getDescriptionFormat(segments[0]), getSingleItemDescription(segments[0]));
                rangeItemDescription = rangeItemDescription.replace(", ", "");
                description += stringUtilities_1.StringUtilities.format(this.i18n.commaStartingX0(), rangeItemDescription);
            }
        }
        else if (doesExpressionContainRange) {
            description = this.generateRangeSegmentDescription(expression, getRangeDescriptionFormat, getSingleItemDescription);
        }
        return description;
    };
    ExpressionDescriptor.prototype.generateRangeSegmentDescription = function (rangeExpression, getRangeDescriptionFormat, getSingleItemDescription) {
        var description = "";
        var rangeSegments = rangeExpression.split("-");
        var rangeSegment1Description = getSingleItemDescription(rangeSegments[0]);
        var rangeSegment2Description = getSingleItemDescription(rangeSegments[1]);
        rangeSegment2Description = rangeSegment2Description.replace(":00", ":59");
        var rangeDescriptionFormat = getRangeDescriptionFormat(rangeExpression);
        description += stringUtilities_1.StringUtilities.format(rangeDescriptionFormat, rangeSegment1Description, rangeSegment2Description);
        return description;
    };
    ExpressionDescriptor.prototype.formatTime = function (hourExpression, minuteExpression, secondExpression) {
        var hour = parseInt(hourExpression);
        var period = "";
        var setPeriodBeforeTime = false;
        if (!this.options.use24HourTimeFormat) {
            setPeriodBeforeTime = this.i18n.setPeriodBeforeTime && this.i18n.setPeriodBeforeTime();
            period = setPeriodBeforeTime ? this.getPeriod(hour) + " " : " " + this.getPeriod(hour);
            if (hour > 12) {
                hour -= 12;
            }
            if (hour === 0) {
                hour = 12;
            }
        }
        var minute = minuteExpression;
        var second = "";
        if (secondExpression) {
            second = ":" + ("00" + secondExpression).substring(secondExpression.length);
        }
        return "" + (setPeriodBeforeTime ? period : "") + ("00" + hour.toString()).substring(hour.toString().length) + ":" + ("00" + minute.toString()).substring(minute.toString().length) + second + (!setPeriodBeforeTime ? period : "");
    };
    ExpressionDescriptor.prototype.transformVerbosity = function (description, useVerboseFormat) {
        if (!useVerboseFormat) {
            description = description.replace(new RegExp(", " + this.i18n.everyMinute(), "g"), "");
            description = description.replace(new RegExp(", " + this.i18n.everyHour(), "g"), "");
            description = description.replace(new RegExp(this.i18n.commaEveryDay(), "g"), "");
            description = description.replace(/\, ?$/, "");
        }
        return description;
    };
    ExpressionDescriptor.prototype.getPeriod = function (hour) {
        return hour >= 12 ? (this.i18n.pm && this.i18n.pm()) || "PM" : (this.i18n.am && this.i18n.am()) || "AM";
    };
    ExpressionDescriptor.locales = {};
    return ExpressionDescriptor;
}());
exports.ExpressionDescriptor = ExpressionDescriptor;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtilities = void 0;
var StringUtilities = (function () {
    function StringUtilities() {
    }
    StringUtilities.format = function (template) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        return template.replace(/%s/g, function () {
            return values.shift();
        });
    };
    StringUtilities.containsAny = function (text, searchStrings) {
        return searchStrings.some(function (c) {
            return text.indexOf(c) > -1;
        });
    };
    return StringUtilities;
}());
exports.StringUtilities = StringUtilities;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.CronParser = void 0;
var CronParser = (function () {
    function CronParser(expression, dayOfWeekStartIndexZero) {
        if (dayOfWeekStartIndexZero === void 0) { dayOfWeekStartIndexZero = true; }
        this.expression = expression;
        this.dayOfWeekStartIndexZero = dayOfWeekStartIndexZero;
    }
    CronParser.prototype.parse = function () {
        var parsed = this.extractParts(this.expression);
        this.normalize(parsed);
        this.validate(parsed);
        return parsed;
    };
    CronParser.prototype.extractParts = function (expression) {
        if (!this.expression) {
            throw new Error("Expression is empty");
        }
        var parsed = expression.trim().split(/[ ]+/);
        if (parsed.length < 5) {
            throw new Error("Expression has only " + parsed.length + " part" + (parsed.length == 1 ? "" : "s") + ". At least 5 parts are required.");
        }
        else if (parsed.length == 5) {
            parsed.unshift("");
            parsed.push("");
        }
        else if (parsed.length == 6) {
            if (/\d{4}$/.test(parsed[5])) {
                parsed.unshift("");
            }
            else {
                parsed.push("");
            }
        }
        else if (parsed.length > 7) {
            throw new Error("Expression has " + parsed.length + " parts; too many!");
        }
        return parsed;
    };
    CronParser.prototype.normalize = function (expressionParts) {
        var _this = this;
        expressionParts[3] = expressionParts[3].replace("?", "*");
        expressionParts[5] = expressionParts[5].replace("?", "*");
        expressionParts[2] = expressionParts[2].replace("?", "*");
        if (expressionParts[0].indexOf("0/") == 0) {
            expressionParts[0] = expressionParts[0].replace("0/", "*/");
        }
        if (expressionParts[1].indexOf("0/") == 0) {
            expressionParts[1] = expressionParts[1].replace("0/", "*/");
        }
        if (expressionParts[2].indexOf("0/") == 0) {
            expressionParts[2] = expressionParts[2].replace("0/", "*/");
        }
        if (expressionParts[3].indexOf("1/") == 0) {
            expressionParts[3] = expressionParts[3].replace("1/", "*/");
        }
        if (expressionParts[4].indexOf("1/") == 0) {
            expressionParts[4] = expressionParts[4].replace("1/", "*/");
        }
        if (expressionParts[6].indexOf("1/") == 0) {
            expressionParts[6] = expressionParts[6].replace("1/", "*/");
        }
        expressionParts[5] = expressionParts[5].replace(/(^\d)|([^#/\s]\d)/g, function (t) {
            var dowDigits = t.replace(/\D/, "");
            var dowDigitsAdjusted = dowDigits;
            if (_this.dayOfWeekStartIndexZero) {
                if (dowDigits == "7") {
                    dowDigitsAdjusted = "0";
                }
            }
            else {
                dowDigitsAdjusted = (parseInt(dowDigits) - 1).toString();
            }
            return t.replace(dowDigits, dowDigitsAdjusted);
        });
        if (expressionParts[5] == "L") {
            expressionParts[5] = "6";
        }
        if (expressionParts[3] == "?") {
            expressionParts[3] = "*";
        }
        if (expressionParts[3].indexOf("W") > -1 &&
            (expressionParts[3].indexOf(",") > -1 || expressionParts[3].indexOf("-") > -1)) {
            throw new Error("The 'W' character can be specified only when the day-of-month is a single day, not a range or list of days.");
        }
        var days = {
            SUN: 0,
            MON: 1,
            TUE: 2,
            WED: 3,
            THU: 4,
            FRI: 5,
            SAT: 6,
        };
        for (var day in days) {
            expressionParts[5] = expressionParts[5].replace(new RegExp(day, "gi"), days[day].toString());
        }
        var months = {
            JAN: 1,
            FEB: 2,
            MAR: 3,
            APR: 4,
            MAY: 5,
            JUN: 6,
            JUL: 7,
            AUG: 8,
            SEP: 9,
            OCT: 10,
            NOV: 11,
            DEC: 12,
        };
        for (var month in months) {
            expressionParts[4] = expressionParts[4].replace(new RegExp(month, "gi"), months[month].toString());
        }
        if (expressionParts[0] == "0") {
            expressionParts[0] = "";
        }
        if (!/\*|\-|\,|\//.test(expressionParts[2]) &&
            (/\*|\//.test(expressionParts[1]) || /\*|\//.test(expressionParts[0]))) {
            expressionParts[2] += "-" + expressionParts[2];
        }
        for (var i = 0; i < expressionParts.length; i++) {
            if (expressionParts[i] == "*/1") {
                expressionParts[i] = "*";
            }
            if (expressionParts[i].indexOf("/") > -1 && !/^\*|\-|\,/.test(expressionParts[i])) {
                var stepRangeThrough = null;
                switch (i) {
                    case 4:
                        stepRangeThrough = "12";
                        break;
                    case 5:
                        stepRangeThrough = "6";
                        break;
                    case 6:
                        stepRangeThrough = "9999";
                        break;
                    default:
                        stepRangeThrough = null;
                        break;
                }
                if (stepRangeThrough != null) {
                    var parts = expressionParts[i].split("/");
                    expressionParts[i] = parts[0] + "-" + stepRangeThrough + "/" + parts[1];
                }
            }
        }
    };
    CronParser.prototype.validate = function (parsed) {
        this.assertNoInvalidCharacters("DOW", parsed[5]);
        this.assertNoInvalidCharacters("DOM", parsed[3]);
    };
    CronParser.prototype.assertNoInvalidCharacters = function (partDescription, expression) {
        var invalidChars = expression.match(/[A-KM-VX-Z]+/gi);
        if (invalidChars && invalidChars.length) {
            throw new Error(partDescription + " part contains invalid values: '" + invalidChars.toString() + "'");
        }
    };
    return CronParser;
}());
exports.CronParser = CronParser;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.en = void 0;
var en = (function () {
    function en() {
    }
    en.prototype.atX0SecondsPastTheMinuteGt20 = function () {
        return null;
    };
    en.prototype.atX0MinutesPastTheHourGt20 = function () {
        return null;
    };
    en.prototype.commaMonthX0ThroughMonthX1 = function () {
        return null;
    };
    en.prototype.commaYearX0ThroughYearX1 = function () {
        return null;
    };
    en.prototype.use24HourTimeFormatByDefault = function () {
        return false;
    };
    en.prototype.anErrorOccuredWhenGeneratingTheExpressionD = function () {
        return "An error occured when generating the expression description.  Check the cron expression syntax.";
    };
    en.prototype.everyMinute = function () {
        return "every minute";
    };
    en.prototype.everyHour = function () {
        return "every hour";
    };
    en.prototype.atSpace = function () {
        return "At ";
    };
    en.prototype.everyMinuteBetweenX0AndX1 = function () {
        return "Every minute between %s and %s";
    };
    en.prototype.at = function () {
        return "At";
    };
    en.prototype.spaceAnd = function () {
        return " and";
    };
    en.prototype.everySecond = function () {
        return "every second";
    };
    en.prototype.everyX0Seconds = function () {
        return "every %s seconds";
    };
    en.prototype.secondsX0ThroughX1PastTheMinute = function () {
        return "seconds %s through %s past the minute";
    };
    en.prototype.atX0SecondsPastTheMinute = function () {
        return "at %s seconds past the minute";
    };
    en.prototype.everyX0Minutes = function () {
        return "every %s minutes";
    };
    en.prototype.minutesX0ThroughX1PastTheHour = function () {
        return "minutes %s through %s past the hour";
    };
    en.prototype.atX0MinutesPastTheHour = function () {
        return "at %s minutes past the hour";
    };
    en.prototype.everyX0Hours = function () {
        return "every %s hours";
    };
    en.prototype.betweenX0AndX1 = function () {
        return "between %s and %s";
    };
    en.prototype.atX0 = function () {
        return "at %s";
    };
    en.prototype.commaEveryDay = function () {
        return ", every day";
    };
    en.prototype.commaEveryX0DaysOfTheWeek = function () {
        return ", every %s days of the week";
    };
    en.prototype.commaX0ThroughX1 = function () {
        return ", %s through %s";
    };
    en.prototype.first = function () {
        return "first";
    };
    en.prototype.second = function () {
        return "second";
    };
    en.prototype.third = function () {
        return "third";
    };
    en.prototype.fourth = function () {
        return "fourth";
    };
    en.prototype.fifth = function () {
        return "fifth";
    };
    en.prototype.commaOnThe = function () {
        return ", on the ";
    };
    en.prototype.spaceX0OfTheMonth = function () {
        return " %s of the month";
    };
    en.prototype.lastDay = function () {
        return "the last day";
    };
    en.prototype.commaOnTheLastX0OfTheMonth = function () {
        return ", on the last %s of the month";
    };
    en.prototype.commaOnlyOnX0 = function () {
        return ", only on %s";
    };
    en.prototype.commaAndOnX0 = function () {
        return ", and on %s";
    };
    en.prototype.commaEveryX0Months = function () {
        return ", every %s months";
    };
    en.prototype.commaOnlyInX0 = function () {
        return ", only in %s";
    };
    en.prototype.commaOnTheLastDayOfTheMonth = function () {
        return ", on the last day of the month";
    };
    en.prototype.commaOnTheLastWeekdayOfTheMonth = function () {
        return ", on the last weekday of the month";
    };
    en.prototype.commaDaysBeforeTheLastDayOfTheMonth = function () {
        return ", %s days before the last day of the month";
    };
    en.prototype.firstWeekday = function () {
        return "first weekday";
    };
    en.prototype.weekdayNearestDayX0 = function () {
        return "weekday nearest day %s";
    };
    en.prototype.commaOnTheX0OfTheMonth = function () {
        return ", on the %s of the month";
    };
    en.prototype.commaEveryX0Days = function () {
        return ", every %s days";
    };
    en.prototype.commaBetweenDayX0AndX1OfTheMonth = function () {
        return ", between day %s and %s of the month";
    };
    en.prototype.commaOnDayX0OfTheMonth = function () {
        return ", on day %s of the month";
    };
    en.prototype.commaEveryHour = function () {
        return ", every hour";
    };
    en.prototype.commaEveryX0Years = function () {
        return ", every %s years";
    };
    en.prototype.commaStartingX0 = function () {
        return ", starting %s";
    };
    en.prototype.daysOfTheWeek = function () {
        return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    };
    en.prototype.monthsOfTheYear = function () {
        return [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
    };
    return en;
}());
exports.en = en;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.toString = void 0;
var expressionDescriptor_1 = __webpack_require__(0);
var enLocaleLoader_1 = __webpack_require__(5);
expressionDescriptor_1.ExpressionDescriptor.initialize(new enLocaleLoader_1.enLocaleLoader());
exports.default = expressionDescriptor_1.ExpressionDescriptor;
var toString = expressionDescriptor_1.ExpressionDescriptor.toString;
exports.toString = toString;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.enLocaleLoader = void 0;
var en_1 = __webpack_require__(3);
var enLocaleLoader = (function () {
    function enLocaleLoader() {
    }
    enLocaleLoader.prototype.load = function (availableLocales) {
        availableLocales["en"] = new en_1.en();
    };
    return enLocaleLoader;
}());
exports.enLocaleLoader = enLocaleLoader;


/***/ })
/******/ ]);
});
});

var cronstrue$1 = unwrapExports(cronstrue);

const cronReg = '(((([*])|(((([0-5])?[0-9])((-(([0-5])?[0-9])))?)))((/(([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?[0-9])))?))(,(((([*])|(((([0-5])?[0-9])((-(([0-5])?[0-9])))?)))((/(([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?[0-9])))?)))* (((([*])|(((((([0-1])?[0-9]))|(([2][0-3])))((-(((([0-1])?[0-9]))|(([2][0-3])))))?)))((/(([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?[0-9])))?))(,(((([*])|(((((([0-1])?[0-9]))|(([2][0-3])))((-(((([0-1])?[0-9]))|(([2][0-3])))))?)))((/(([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?[0-9])))?)))* (((((((([*])|(((((([1-2])?[0-9]))|(([3][0-1]))|(([1-9])))((-(((([1-2])?[0-9]))|(([3][0-1]))|(([1-9])))))?)))((/(([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?[0-9])))?))|(L)|(((((([1-2])?[0-9]))|(([3][0-1]))|(([1-9])))W))))(,(((((([*])|(((((([1-2])?[0-9]))|(([3][0-1]))|(([1-9])))((-(((([1-2])?[0-9]))|(([3][0-1]))|(([1-9])))))?)))((/(([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?[0-9])))?))|(L)|(((((([1-2])?[0-9]))|(([3][0-1]))|(([1-9])))W)))))*)|([?])) (((([*])|((((([1-9]))|(([1][0-2])))((-((([1-9]))|(([1][0-2])))))?))|((((JAN)|(FEB)|(MAR)|(APR)|(MAY)|(JUN)|(JUL)|(AUG)|(SEP)|(OKT)|(NOV)|(DEC))((-((JAN)|(FEB)|(MAR)|(APR)|(MAY)|(JUN)|(JUL)|(AUG)|(SEP)|(OKT)|(NOV)|(DEC))))?)))((/(([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?[0-9])))?))(,(((([*])|((((([1-9]))|(([1][0-2])))((-((([1-9]))|(([1][0-2])))))?))|((((JAN)|(FEB)|(MAR)|(APR)|(MAY)|(JUN)|(JUL)|(AUG)|(SEP)|(OKT)|(NOV)|(DEC))((-((JAN)|(FEB)|(MAR)|(APR)|(MAY)|(JUN)|(JUL)|(AUG)|(SEP)|(OKT)|(NOV)|(DEC))))?)))((/(([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?[0-9])))?)))* (((((((([*])|((([0-6](#[1-5])?)((-([0-6])))?))|((((SUN(#[1-5])?)|(MON(#[1-5])?)|(TUE(#[1-5])?)|(WED(#[1-5])?)|(THU(#[1-5])?)|(FRI(#[1-5])?)|(SAT(#[1-5])?))((-((SUN)|(MON)|(TUE)|(WED)|(THU)|(FRI)|(SAT))))?)))((/(([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?[0-9])))?))|((([0-6])L))|(W)|(([#][1-5]))))(,(((((([*])|((([0-6])((-([0-6])))?))|((((SUN)|(MON)|(TUE)|(WED)|(THU)|(FRI)|(SAT))((-((SUN)|(MON)|(TUE)|(WED)|(THU)|(FRI)|(SAT))))?)))((/(([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?[0-9])))?))|((([0-6])L))|(W)|(([#][1-5])))))*)|([?]))((( (((([*])|((([1-2][0-9][0-9][0-9])((-([1-2][0-9][0-9][0-9])))?)))((/(([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?[0-9])))?))(,(((([*])|((([1-2][0-9][0-9][0-9])((-([1-2][0-9][0-9][0-9])))?)))((/(([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?([0-9])?[0-9])))?)))*))?)';

class PwiCronBuilder extends LitNotify(LitElement) {

  static get styles() {
    return css `
    :host {
      display: block;
    }
    `;
  }

  static get properties() {
    return {
      /**
       * cron expression
       * @type {String}
       */
      cron: {
        notify: true,
        type: String
      },

     /*
      * `label` 
      */
     label: {
       type: String,
     },

     /*
      * `helper` 
      */
     helper: {
       type: String,
     },

     /*
      * `validationMessage` 
      */
     validationMessage: {
       type: String,
     },

     /*
      * `required` 
      */
     required: {
       type: Boolean,
     },

     /*
      * `disabled` 
      */
     disabled: {
       type: Boolean,
     },


      /*
       * human readable cron. 
       */
      cronHuman: {
        type: String,
        notify: true,
        attribute: 'cron-human'
      },
    };
  }

  render() {
    return html$2 `
      <mwc-textfield 
        part="input" 
        .helper="${this.helper}"
        .required="${this.required}"
        .label="${this.label}"
        .icon="${this.icon}"
        .disabled="${this.disabled}"
        .validationMessage="${this.validationMessage}"
        .pattern="${cronReg}" 
        .value="${this.cron}"
        @input="${e => this.cron = e.target.value}"
        @invalid="${e => this.cronHuman = 'invalid cron expression'}"></mwc-textfield>
      <div part="parsed">${this.cronHuman}</div>
    `;
  }

  constructor() {
    super();
    this.required = false;
    this.cron = '0 0 0 1,2 *';
    this.label = 'cron expression';
    this.icon = 'schedule';
    this.helper = 'cron expression of the form "* * * * *"';
    this.validationMessage = 'invalid cron format, see https://en.wikipedia.org/wiki/Cron';
  }

  update(props) {
    if (props.has('cron')) {
      this.cronHuman = !this.cron ? 'no cron expression' : cronstrue$1.toString(this.cron);
    }
    super.update(props);
  }


}

// Register the new element with the browser.
customElements.define('pwi-cron-builder', PwiCronBuilder);

const callback = (mutation, observer) => {
  mutation[0].target.dispatchEvent(new CustomEvent('content-observer-inner-change', { bubbles: true, composed: true }));
};
const contentObserver = new MutationObserver(callback);


/**
 * ## PwiContentObserver
 *
 * `<pwi-content-observer>` brings slottted text content and exposes it on content properties
 * 
 * @fires content-changed - eventfired when slotted content changes
 * @slot - default slot
 */
class PwiContentObserver extends LitElement {

  static get properties() {

    return {

      ...super.properties,

      /*
       * title for the panel
       */
      content: {
        type: String,
      }
    };
  }

  render() {
    return html$2 `<slot></slot>`;
  }

  constructor() {
    super();
    this.addEventListener('content-observer-inner-change', this.onContentChange);
  }
  
  disconnectedCallback() {
    this._observer && this._observer.disconnect();
    super.disconnectedCallback();
  }

  firstUpdated() {
    super.firstUpdated();
    this.onContentChange();
    this.content = this.innerText;
    this._observer = contentObserver.observe(this, { characterData: true, subtree: true, childList: true });
  }

  onContentChange(e) {
    e && e.stopPropagation();
    this.content = this.innerText;
    this.dispatchEvent(new CustomEvent('content-changed', { detail: {value: this.content}, bubbles: true, composed: true }));
  }
}

// Register the new element with the browser.
customElements.define('pwi-content-observer', PwiContentObserver);

// import TwoWayBinding from './two-way-binding.js';

/**
 * extenstion of mwc-textfield emiting a value-changed event when
 * value changes
 */
class PwiForm extends Formfield {
  static get styles() {
    return [
      super.styles,
      css `::slotted(pwi-switch){margin-right:10px}[dir=rtl] ::slotted(pwi-switch),::slotted(pwi-switch)[dir=rtl]{margin-left:10px}`
      ];
  }
}

customElements.define('pwi-formfield', PwiForm);

/**
 * extention of mwc-switch emiting a value-changed event when
 * value changes
 */
class PwiCheckbox extends Checkbox {
  
  // Note(cg): checkbox has _changehandler (unlike switch and radio).
  _changeHandler(e) {
    super._changeHandler(...arguments);
    this.dispatchEvent(new CustomEvent('checked-changed', { detail: { value: this.checked }, bubbles: true, composed: true }));
  }

}

customElements.define('pwi-checkbox', PwiCheckbox);

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/** CSS classes used by the switch. */
var cssClasses$e = {
    /** Class used for a switch that is in the "checked" (on) position. */
    CHECKED: 'mdc-switch--checked',
    /** Class used for a switch that is disabled. */
    DISABLED: 'mdc-switch--disabled',
};
/** String constants used by the switch. */
var strings$d = {
    /** Aria attribute for checked or unchecked state of switch */
    ARIA_CHECKED_ATTR: 'aria-checked',
    /** A CSS selector used to locate the native HTML control for the switch.  */
    NATIVE_CONTROL_SELECTOR: '.mdc-switch__native-control',
    /** A CSS selector used to locate the ripple surface element for the switch. */
    RIPPLE_SURFACE_SELECTOR: '.mdc-switch__thumb-underlay',
};

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCSwitchFoundation = /** @class */ (function (_super) {
    __extends(MDCSwitchFoundation, _super);
    function MDCSwitchFoundation(adapter) {
        return _super.call(this, __assign(__assign({}, MDCSwitchFoundation.defaultAdapter), adapter)) || this;
    }
    Object.defineProperty(MDCSwitchFoundation, "strings", {
        /** The string constants used by the switch. */
        get: function () {
            return strings$d;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCSwitchFoundation, "cssClasses", {
        /** The CSS classes used by the switch. */
        get: function () {
            return cssClasses$e;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCSwitchFoundation, "defaultAdapter", {
        /** The default Adapter for the switch. */
        get: function () {
            return {
                addClass: function () { return undefined; },
                removeClass: function () { return undefined; },
                setNativeControlChecked: function () { return undefined; },
                setNativeControlDisabled: function () { return undefined; },
                setNativeControlAttr: function () { return undefined; },
            };
        },
        enumerable: true,
        configurable: true
    });
    /** Sets the checked state of the switch. */
    MDCSwitchFoundation.prototype.setChecked = function (checked) {
        this.adapter.setNativeControlChecked(checked);
        this.updateAriaChecked_(checked);
        this.updateCheckedStyling_(checked);
    };
    /** Sets the disabled state of the switch. */
    MDCSwitchFoundation.prototype.setDisabled = function (disabled) {
        this.adapter.setNativeControlDisabled(disabled);
        if (disabled) {
            this.adapter.addClass(cssClasses$e.DISABLED);
        }
        else {
            this.adapter.removeClass(cssClasses$e.DISABLED);
        }
    };
    /** Handles the change event for the switch native control. */
    MDCSwitchFoundation.prototype.handleChange = function (evt) {
        var nativeControl = evt.target;
        this.updateAriaChecked_(nativeControl.checked);
        this.updateCheckedStyling_(nativeControl.checked);
    };
    /** Updates the styling of the switch based on its checked state. */
    MDCSwitchFoundation.prototype.updateCheckedStyling_ = function (checked) {
        if (checked) {
            this.adapter.addClass(cssClasses$e.CHECKED);
        }
        else {
            this.adapter.removeClass(cssClasses$e.CHECKED);
        }
    };
    MDCSwitchFoundation.prototype.updateAriaChecked_ = function (checked) {
        this.adapter.setNativeControlAttr(strings$d.ARIA_CHECKED_ATTR, "" + !!checked);
    };
    return MDCSwitchFoundation;
}(MDCFoundation));

class SwitchBase extends FormElement {
    constructor() {
        super(...arguments);
        this.checked = false;
        this.disabled = false;
        this.shouldRenderRipple = false;
        this.mdcFoundationClass = MDCSwitchFoundation;
        this.rippleHandlers = new RippleHandlers(() => {
            this.shouldRenderRipple = true;
            return this.ripple;
        });
    }
    changeHandler(e) {
        this.mdcFoundation.handleChange(e);
        // catch "click" event and sync properties
        this.checked = this.formElement.checked;
    }
    createAdapter() {
        return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { setNativeControlChecked: (checked) => {
                this.formElement.checked = checked;
            }, setNativeControlDisabled: (disabled) => {
                this.formElement.disabled = disabled;
            }, setNativeControlAttr: (attr, value) => {
                this.formElement.setAttribute(attr, value);
            } });
    }
    renderRipple() {
        return this.shouldRenderRipple ? html$2 `
        <mwc-ripple 
          .accent="${this.checked}"
          .disabled="${this.disabled}"
          unbounded>
        </mwc-ripple>` :
            '';
    }
    focus() {
        const formElement = this.formElement;
        if (formElement) {
            this.rippleHandlers.startFocus();
            formElement.focus();
        }
    }
    blur() {
        const formElement = this.formElement;
        if (formElement) {
            this.rippleHandlers.endFocus();
            formElement.blur();
        }
    }
    render() {
        return html$2 `
      <div class="mdc-switch">
        <div class="mdc-switch__track"></div>
        <div class="mdc-switch__thumb-underlay">
          ${this.renderRipple()}
          <div class="mdc-switch__thumb">
            <input
              type="checkbox"
              id="basic-switch"
              class="mdc-switch__native-control"
              role="switch"
              @change="${this.changeHandler}"
              @focus="${this.handleRippleFocus}"
              @blur="${this.handleRippleBlur}"
              @mousedown="${this.handleRippleMouseDown}"
              @mouseenter="${this.handleRippleMouseEnter}"
              @mouseleave="${this.handleRippleMouseLeave}"
              @touchstart="${this.handleRippleTouchStart}"
              @touchend="${this.handleRippleDeactivate}"
              @touchcancel="${this.handleRippleDeactivate}">
          </div>
        </div>
      </div>`;
    }
    handleRippleMouseDown(event) {
        const onUp = () => {
            window.removeEventListener('mouseup', onUp);
            this.handleRippleDeactivate();
        };
        window.addEventListener('mouseup', onUp);
        this.rippleHandlers.startPress(event);
    }
    handleRippleTouchStart(event) {
        this.rippleHandlers.startPress(event);
    }
    handleRippleDeactivate() {
        this.rippleHandlers.endPress();
    }
    handleRippleMouseEnter() {
        this.rippleHandlers.startHover();
    }
    handleRippleMouseLeave() {
        this.rippleHandlers.endHover();
    }
    handleRippleFocus() {
        this.rippleHandlers.startFocus();
    }
    handleRippleBlur() {
        this.rippleHandlers.endFocus();
    }
}
__decorate([
    property({ type: Boolean }),
    observer(function (value) {
        this.mdcFoundation.setChecked(value);
    })
], SwitchBase.prototype, "checked", void 0);
__decorate([
    property({ type: Boolean }),
    observer(function (value) {
        this.mdcFoundation.setDisabled(value);
    })
], SwitchBase.prototype, "disabled", void 0);
__decorate([
    query('.mdc-switch')
], SwitchBase.prototype, "mdcRoot", void 0);
__decorate([
    query('input')
], SwitchBase.prototype, "formElement", void 0);
__decorate([
    queryAsync('mwc-ripple')
], SwitchBase.prototype, "ripple", void 0);
__decorate([
    internalProperty()
], SwitchBase.prototype, "shouldRenderRipple", void 0);
__decorate([
    eventOptions({ passive: true })
], SwitchBase.prototype, "handleRippleMouseDown", null);
__decorate([
    eventOptions({ passive: true })
], SwitchBase.prototype, "handleRippleTouchStart", null);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$j = css `.mdc-switch__thumb-underlay{left:-14px;right:initial;top:-17px;width:48px;height:48px}[dir=rtl] .mdc-switch__thumb-underlay,.mdc-switch__thumb-underlay[dir=rtl]{left:initial;right:-14px}.mdc-switch__native-control{width:64px;height:48px}.mdc-switch{display:inline-block;position:relative;outline:none;user-select:none}.mdc-switch.mdc-switch--checked .mdc-switch__track{background-color:#018786;background-color:var(--mdc-theme-secondary, #018786)}.mdc-switch.mdc-switch--checked .mdc-switch__thumb{background-color:#018786;background-color:var(--mdc-theme-secondary, #018786);border-color:#018786;border-color:var(--mdc-theme-secondary, #018786)}.mdc-switch:not(.mdc-switch--checked) .mdc-switch__track{background-color:#000;background-color:var(--mdc-theme-on-surface, #000)}.mdc-switch:not(.mdc-switch--checked) .mdc-switch__thumb{background-color:#fff;background-color:var(--mdc-theme-surface, #fff);border-color:#fff;border-color:var(--mdc-theme-surface, #fff)}.mdc-switch__native-control{left:0;right:initial;position:absolute;top:0;margin:0;opacity:0;cursor:pointer;pointer-events:auto;transition:transform 90ms cubic-bezier(0.4, 0, 0.2, 1)}[dir=rtl] .mdc-switch__native-control,.mdc-switch__native-control[dir=rtl]{left:initial;right:0}.mdc-switch__track{box-sizing:border-box;width:36px;height:14px;border:1px solid transparent;border-radius:7px;opacity:.38;transition:opacity 90ms cubic-bezier(0.4, 0, 0.2, 1),background-color 90ms cubic-bezier(0.4, 0, 0.2, 1),border-color 90ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-switch__thumb-underlay{display:flex;position:absolute;align-items:center;justify-content:center;transform:translateX(0);transition:transform 90ms cubic-bezier(0.4, 0, 0.2, 1),background-color 90ms cubic-bezier(0.4, 0, 0.2, 1),border-color 90ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-switch__thumb{box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.2),0px 2px 2px 0px rgba(0, 0, 0, 0.14),0px 1px 5px 0px rgba(0,0,0,.12);box-sizing:border-box;width:20px;height:20px;border:10px solid;border-radius:50%;pointer-events:none;z-index:1}.mdc-switch--checked .mdc-switch__track{opacity:.54}.mdc-switch--checked .mdc-switch__thumb-underlay{transform:translateX(16px)}[dir=rtl] .mdc-switch--checked .mdc-switch__thumb-underlay,.mdc-switch--checked .mdc-switch__thumb-underlay[dir=rtl]{transform:translateX(-16px)}.mdc-switch--checked .mdc-switch__native-control{transform:translateX(-16px)}[dir=rtl] .mdc-switch--checked .mdc-switch__native-control,.mdc-switch--checked .mdc-switch__native-control[dir=rtl]{transform:translateX(16px)}.mdc-switch--disabled{opacity:.38;pointer-events:none}.mdc-switch--disabled .mdc-switch__thumb{border-width:1px}.mdc-switch--disabled .mdc-switch__native-control{cursor:default;pointer-events:none}:host{display:inline-flex;outline:none;-webkit-tap-highlight-color:transparent}`;

let Switch = class Switch extends SwitchBase {
};
Switch.styles = style$j;
Switch = __decorate([
    customElement('mwc-switch')
], Switch);

/**
 * small mixin to allow Polymer two-way-binding with checked-type 
 * fields (switch, radio, checkbox)
 * 
 */

const TwoWayCheckedBinding = (baseElement) => class extends baseElement {
  changeHandler(e) {
    super.changeHandler(...arguments);
    this.dispatchEvent(new CustomEvent('checked-changed', { detail: { value: this.checked }, bubbles: true, composed: true }));
  }
};

// import OverrideSwitchAriaChecked from './override-switch-aria-checked.js' 

/**
 * extention of mwc-switch emiting a value-changed event when
 * value changes
 */
class PwiSwitch extends TwoWayCheckedBinding(Switch) {


}

customElements.define('pwi-switch', PwiSwitch);

// import OverrideRadioAriaChecked from './override-checkbox-aria-checked.js' 
/**
 * extention of mwc-switch emiting a value-changed event when
 * value changes
 */
class PwiRadio extends TwoWayCheckedBinding(Radio) {

}

customElements.define('pwi-radio', PwiRadio);

/**
 * extention of mwc-linear-progress allowing:
 * - set progress as percen
 * - set height of the progress bar
 */
class PwiLinearProgress extends LinearProgress {

  static get styles() {
    return [super.styles, css `
      :host {
        --pwi-linear-progress-height: 4px;
        height: var(--pwi-linear-progress-height);
      }
      .mdc-linear-progress {
        height: var(--pwi-linear-progress-height) ;
      }
      .mdc-linear-progress__bar-inner {
        border-top: var(--pwi-linear-progress-height) solid var(--mdc-theme-primary, #6200ee); 
      }
    `];
  }

  static get properties() {
    return {
      ...super.properties,

      percent: {
        type: Number
      }
    };
  }

  updated(props) {
    if (props.has('percent')) {
      this.progress = this.percent / 100;
    }
    super.updated(props);
  }
}

customElements.define('pwi-linear-progress', PwiLinearProgress);

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var cssClasses$f = {
    FIXED_CLASS: 'mdc-top-app-bar--fixed',
    FIXED_SCROLLED_CLASS: 'mdc-top-app-bar--fixed-scrolled',
    SHORT_CLASS: 'mdc-top-app-bar--short',
    SHORT_COLLAPSED_CLASS: 'mdc-top-app-bar--short-collapsed',
    SHORT_HAS_ACTION_ITEM_CLASS: 'mdc-top-app-bar--short-has-action-item',
};
var numbers$8 = {
    DEBOUNCE_THROTTLE_RESIZE_TIME_MS: 100,
    MAX_TOP_APP_BAR_HEIGHT: 128,
};
var strings$e = {
    ACTION_ITEM_SELECTOR: '.mdc-top-app-bar__action-item',
    NAVIGATION_EVENT: 'MDCTopAppBar:nav',
    NAVIGATION_ICON_SELECTOR: '.mdc-top-app-bar__navigation-icon',
    ROOT_SELECTOR: '.mdc-top-app-bar',
    TITLE_SELECTOR: '.mdc-top-app-bar__title',
};

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var MDCTopAppBarBaseFoundation = /** @class */ (function (_super) {
    __extends(MDCTopAppBarBaseFoundation, _super);
    /* istanbul ignore next: optional argument is not a branch statement */
    function MDCTopAppBarBaseFoundation(adapter) {
        return _super.call(this, __assign(__assign({}, MDCTopAppBarBaseFoundation.defaultAdapter), adapter)) || this;
    }
    Object.defineProperty(MDCTopAppBarBaseFoundation, "strings", {
        get: function () {
            return strings$e;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTopAppBarBaseFoundation, "cssClasses", {
        get: function () {
            return cssClasses$f;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTopAppBarBaseFoundation, "numbers", {
        get: function () {
            return numbers$8;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MDCTopAppBarBaseFoundation, "defaultAdapter", {
        /**
         * See {@link MDCTopAppBarAdapter} for typing information on parameters and return types.
         */
        get: function () {
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            return {
                addClass: function () { return undefined; },
                removeClass: function () { return undefined; },
                hasClass: function () { return false; },
                setStyle: function () { return undefined; },
                getTopAppBarHeight: function () { return 0; },
                notifyNavigationIconClicked: function () { return undefined; },
                getViewportScrollY: function () { return 0; },
                getTotalActionItems: function () { return 0; },
            };
            // tslint:enable:object-literal-sort-keys
        },
        enumerable: true,
        configurable: true
    });
    /** Other variants of TopAppBar foundation overrides this method */
    MDCTopAppBarBaseFoundation.prototype.handleTargetScroll = function () { }; // tslint:disable-line:no-empty
    /** Other variants of TopAppBar foundation overrides this method */
    MDCTopAppBarBaseFoundation.prototype.handleWindowResize = function () { }; // tslint:disable-line:no-empty
    MDCTopAppBarBaseFoundation.prototype.handleNavigationClick = function () {
        this.adapter.notifyNavigationIconClicked();
    };
    return MDCTopAppBarBaseFoundation;
}(MDCFoundation));

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var INITIAL_VALUE = 0;
var MDCTopAppBarFoundation = /** @class */ (function (_super) {
    __extends(MDCTopAppBarFoundation, _super);
    /* istanbul ignore next: optional argument is not a branch statement */
    function MDCTopAppBarFoundation(adapter) {
        var _this = _super.call(this, adapter) || this;
        /**
         * Indicates if the top app bar was docked in the previous scroll handler iteration.
         */
        _this.wasDocked_ = true;
        /**
         * Indicates if the top app bar is docked in the fully shown position.
         */
        _this.isDockedShowing_ = true;
        /**
         * Variable for current scroll position of the top app bar
         */
        _this.currentAppBarOffsetTop_ = 0;
        /**
         * Used to prevent the top app bar from being scrolled out of view during resize events
         */
        _this.isCurrentlyBeingResized_ = false;
        /**
         * The timeout that's used to throttle the resize events
         */
        _this.resizeThrottleId_ = INITIAL_VALUE;
        /**
         * The timeout that's used to debounce toggling the isCurrentlyBeingResized_ variable after a resize
         */
        _this.resizeDebounceId_ = INITIAL_VALUE;
        _this.lastScrollPosition_ = _this.adapter.getViewportScrollY();
        _this.topAppBarHeight_ = _this.adapter.getTopAppBarHeight();
        return _this;
    }
    MDCTopAppBarFoundation.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.adapter.setStyle('top', '');
    };
    /**
     * Scroll handler for the default scroll behavior of the top app bar.
     * @override
     */
    MDCTopAppBarFoundation.prototype.handleTargetScroll = function () {
        var currentScrollPosition = Math.max(this.adapter.getViewportScrollY(), 0);
        var diff = currentScrollPosition - this.lastScrollPosition_;
        this.lastScrollPosition_ = currentScrollPosition;
        // If the window is being resized the lastScrollPosition_ needs to be updated but the
        // current scroll of the top app bar should stay in the same position.
        if (!this.isCurrentlyBeingResized_) {
            this.currentAppBarOffsetTop_ -= diff;
            if (this.currentAppBarOffsetTop_ > 0) {
                this.currentAppBarOffsetTop_ = 0;
            }
            else if (Math.abs(this.currentAppBarOffsetTop_) > this.topAppBarHeight_) {
                this.currentAppBarOffsetTop_ = -this.topAppBarHeight_;
            }
            this.moveTopAppBar_();
        }
    };
    /**
     * Top app bar resize handler that throttle/debounce functions that execute updates.
     * @override
     */
    MDCTopAppBarFoundation.prototype.handleWindowResize = function () {
        var _this = this;
        // Throttle resize events 10 p/s
        if (!this.resizeThrottleId_) {
            this.resizeThrottleId_ = setTimeout(function () {
                _this.resizeThrottleId_ = INITIAL_VALUE;
                _this.throttledResizeHandler_();
            }, numbers$8.DEBOUNCE_THROTTLE_RESIZE_TIME_MS);
        }
        this.isCurrentlyBeingResized_ = true;
        if (this.resizeDebounceId_) {
            clearTimeout(this.resizeDebounceId_);
        }
        this.resizeDebounceId_ = setTimeout(function () {
            _this.handleTargetScroll();
            _this.isCurrentlyBeingResized_ = false;
            _this.resizeDebounceId_ = INITIAL_VALUE;
        }, numbers$8.DEBOUNCE_THROTTLE_RESIZE_TIME_MS);
    };
    /**
     * Function to determine if the DOM needs to update.
     */
    MDCTopAppBarFoundation.prototype.checkForUpdate_ = function () {
        var offscreenBoundaryTop = -this.topAppBarHeight_;
        var hasAnyPixelsOffscreen = this.currentAppBarOffsetTop_ < 0;
        var hasAnyPixelsOnscreen = this.currentAppBarOffsetTop_ > offscreenBoundaryTop;
        var partiallyShowing = hasAnyPixelsOffscreen && hasAnyPixelsOnscreen;
        // If it's partially showing, it can't be docked.
        if (partiallyShowing) {
            this.wasDocked_ = false;
        }
        else {
            // Not previously docked and not partially showing, it's now docked.
            if (!this.wasDocked_) {
                this.wasDocked_ = true;
                return true;
            }
            else if (this.isDockedShowing_ !== hasAnyPixelsOnscreen) {
                this.isDockedShowing_ = hasAnyPixelsOnscreen;
                return true;
            }
        }
        return partiallyShowing;
    };
    /**
     * Function to move the top app bar if needed.
     */
    MDCTopAppBarFoundation.prototype.moveTopAppBar_ = function () {
        if (this.checkForUpdate_()) {
            // Once the top app bar is fully hidden we use the max potential top app bar height as our offset
            // so the top app bar doesn't show if the window resizes and the new height > the old height.
            var offset = this.currentAppBarOffsetTop_;
            if (Math.abs(offset) >= this.topAppBarHeight_) {
                offset = -numbers$8.MAX_TOP_APP_BAR_HEIGHT;
            }
            this.adapter.setStyle('top', offset + 'px');
        }
    };
    /**
     * Throttled function that updates the top app bar scrolled values if the
     * top app bar height changes.
     */
    MDCTopAppBarFoundation.prototype.throttledResizeHandler_ = function () {
        var currentHeight = this.adapter.getTopAppBarHeight();
        if (this.topAppBarHeight_ !== currentHeight) {
            this.wasDocked_ = false;
            // Since the top app bar has a different height depending on the screen width, this
            // will ensure that the top app bar remains in the correct location if
            // completely hidden and a resize makes the top app bar a different height.
            this.currentAppBarOffsetTop_ -= this.topAppBarHeight_ - currentHeight;
            this.topAppBarHeight_ = currentHeight;
        }
        this.handleTargetScroll();
    };
    return MDCTopAppBarFoundation;
}(MDCTopAppBarBaseFoundation));

const passiveEventOptionsIfSupported = supportsPassiveEventListener ? { passive: true } : undefined;
class TopAppBarBaseBase extends BaseElement {
    constructor() {
        super(...arguments);
        this.mdcFoundationClass = MDCTopAppBarBaseFoundation;
        this.centerTitle = false;
        this.handleTargetScroll = () => {
            this.mdcFoundation.handleTargetScroll();
        };
        this.handleNavigationClick = () => {
            this.mdcFoundation.handleNavigationClick();
        };
    }
    get scrollTarget() {
        return this._scrollTarget || window;
    }
    set scrollTarget(value) {
        this.unregisterScrollListener();
        const old = this.scrollTarget;
        this._scrollTarget = value;
        this.updateRootPosition();
        this.requestUpdate('scrollTarget', old);
        this.registerScrollListener();
    }
    updateRootPosition() {
        if (this.mdcRoot) {
            const windowScroller = this.scrollTarget === window;
            // we add support for top-app-bar's tied to an element scroller.
            this.mdcRoot.style.position = windowScroller ? '' : 'absolute';
        }
    }
    render() {
        // clang-format off
        let title = html$2 `<span class="mdc-top-app-bar__title"><slot name="title"></slot></span>`;
        if (this.centerTitle) {
            title = html$2 `<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-center">${title}</section>`;
        }
        // clang-format on
        return html$2 `
      <header class="mdc-top-app-bar ${classMap(this.barClasses())}">
      <div class="mdc-top-app-bar__row">
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start" id="navigation">
          <slot name="navigationIcon"
            @click=${this.handleNavigationClick}></slot>
          ${this.centerTitle ? null : title}
        </section>
        ${this.centerTitle ? title : null}
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" id="actions" role="toolbar">
          <slot name="actionItems"></slot>
        </section>
      </div>
    </header>
    <div class="${classMap(this.contentClasses())}">
      <slot></slot>
    </div>
    `;
    }
    createAdapter() {
        return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { setStyle: (property, value) => this.mdcRoot.style.setProperty(property, value), getTopAppBarHeight: () => this.mdcRoot.clientHeight, notifyNavigationIconClicked: () => {
                this.dispatchEvent(new Event(strings$e.NAVIGATION_EVENT, { bubbles: true, cancelable: true }));
            }, getViewportScrollY: () => this.scrollTarget instanceof Window ?
                this.scrollTarget.pageYOffset :
                this.scrollTarget.scrollTop, getTotalActionItems: () => this._actionItemsSlot
                .assignedNodes({ flatten: true })
                .length });
    }
    registerListeners() {
        this.registerScrollListener();
    }
    unregisterListeners() {
        this.unregisterScrollListener();
    }
    registerScrollListener() {
        this.scrollTarget.addEventListener('scroll', this.handleTargetScroll, passiveEventOptionsIfSupported);
    }
    unregisterScrollListener() {
        this.scrollTarget.removeEventListener('scroll', this.handleTargetScroll);
    }
    firstUpdated() {
        super.firstUpdated();
        this.updateRootPosition();
        this.registerListeners();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.unregisterListeners();
    }
}
__decorate([
    query('.mdc-top-app-bar')
], TopAppBarBaseBase.prototype, "mdcRoot", void 0);
__decorate([
    query('slot[name="actionItems"]')
], TopAppBarBaseBase.prototype, "_actionItemsSlot", void 0);
__decorate([
    property({ type: Boolean })
], TopAppBarBaseBase.prototype, "centerTitle", void 0);
__decorate([
    property()
], TopAppBarBaseBase.prototype, "scrollTarget", null);

class TopAppBarBase extends TopAppBarBaseBase {
    constructor() {
        super(...arguments);
        this.mdcFoundationClass = MDCTopAppBarFoundation;
        this.prominent = false;
        this.dense = false;
        this.handleResize = () => {
            this.mdcFoundation.handleWindowResize();
        };
    }
    barClasses() {
        return {
            'mdc-top-app-bar--dense': this.dense,
            'mdc-top-app-bar--prominent': this.prominent,
            'center-title': this.centerTitle,
        };
    }
    contentClasses() {
        return {
            'mdc-top-app-bar--fixed-adjust': !this.dense && !this.prominent,
            'mdc-top-app-bar--dense-fixed-adjust': this.dense && !this.prominent,
            'mdc-top-app-bar--prominent-fixed-adjust': !this.dense && this.prominent,
            'mdc-top-app-bar--dense-prominent-fixed-adjust': this.dense && this.prominent,
        };
    }
    registerListeners() {
        super.registerListeners();
        window.addEventListener('resize', this.handleResize, passiveEventOptionsIfSupported);
    }
    unregisterListeners() {
        super.unregisterListeners();
        window.removeEventListener('resize', this.handleResize);
    }
}
__decorate([
    property({ type: Boolean, reflect: true })
], TopAppBarBase.prototype, "prominent", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], TopAppBarBase.prototype, "dense", void 0);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$k = css `.mdc-top-app-bar{background-color:#6200ee;background-color:var(--mdc-theme-primary, #6200ee);color:white;display:flex;position:fixed;flex-direction:column;justify-content:space-between;box-sizing:border-box;width:100%;z-index:4}.mdc-top-app-bar .mdc-top-app-bar__action-item,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon{color:#fff;color:var(--mdc-theme-on-primary, #fff)}.mdc-top-app-bar .mdc-top-app-bar__action-item::before,.mdc-top-app-bar .mdc-top-app-bar__action-item::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon::after{background-color:#fff;background-color:var(--mdc-ripple-color, var(--mdc-theme-on-primary, #fff))}.mdc-top-app-bar .mdc-top-app-bar__action-item:hover::before,.mdc-top-app-bar .mdc-top-app-bar__action-item.mdc-ripple-surface--hover::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:hover::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon.mdc-ripple-surface--hover::before{opacity:0.08;opacity:var(--mdc-ripple-hover-opacity, 0.08)}.mdc-top-app-bar .mdc-top-app-bar__action-item.mdc-ripple-upgraded--background-focused::before,.mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded):focus::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded--background-focused::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.24;opacity:var(--mdc-ripple-focus-opacity, 0.24)}.mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded)::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded):active::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.24;opacity:var(--mdc-ripple-press-opacity, 0.24)}.mdc-top-app-bar .mdc-top-app-bar__action-item.mdc-ripple-upgraded,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: var(--mdc-ripple-press-opacity, 0.24)}.mdc-top-app-bar__row{display:flex;position:relative;box-sizing:border-box;width:100%;height:64px}.mdc-top-app-bar__section{display:inline-flex;flex:1 1 auto;align-items:center;min-width:0;padding:8px 12px;z-index:1}.mdc-top-app-bar__section--align-start{justify-content:flex-start;order:-1}.mdc-top-app-bar__section--align-end{justify-content:flex-end;order:1}.mdc-top-app-bar__title{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-headline6-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:1.25rem;font-size:var(--mdc-typography-headline6-font-size, 1.25rem);line-height:2rem;line-height:var(--mdc-typography-headline6-line-height, 2rem);font-weight:500;font-weight:var(--mdc-typography-headline6-font-weight, 500);letter-spacing:0.0125em;letter-spacing:var(--mdc-typography-headline6-letter-spacing, 0.0125em);text-decoration:inherit;text-decoration:var(--mdc-typography-headline6-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-headline6-text-transform, inherit);padding-left:20px;padding-right:0;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;z-index:1}[dir=rtl] .mdc-top-app-bar__title,.mdc-top-app-bar__title[dir=rtl]{padding-left:0;padding-right:20px}.mdc-top-app-bar--short-collapsed{border-top-left-radius:0;border-top-right-radius:0;border-bottom-right-radius:24px;border-bottom-left-radius:0}[dir=rtl] .mdc-top-app-bar--short-collapsed,.mdc-top-app-bar--short-collapsed[dir=rtl]{border-top-left-radius:0;border-top-right-radius:0;border-bottom-right-radius:0;border-bottom-left-radius:24px}.mdc-top-app-bar--short{top:0;right:auto;left:0;width:100%;transition:width 250ms cubic-bezier(0.4, 0, 0.2, 1)}[dir=rtl] .mdc-top-app-bar--short,.mdc-top-app-bar--short[dir=rtl]{right:0;left:auto}.mdc-top-app-bar--short .mdc-top-app-bar__row{height:56px}.mdc-top-app-bar--short .mdc-top-app-bar__section{padding:4px}.mdc-top-app-bar--short .mdc-top-app-bar__title{transition:opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);opacity:1}.mdc-top-app-bar--short-collapsed{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0,0,0,.12);width:56px;transition:width 300ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__title{display:none}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__action-item{transition:padding 150ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item{width:112px}.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end{padding-left:0;padding-right:12px}[dir=rtl] .mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end,.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end[dir=rtl]{padding-left:12px;padding-right:0}.mdc-top-app-bar--dense .mdc-top-app-bar__row{height:48px}.mdc-top-app-bar--dense .mdc-top-app-bar__section{padding:0 4px}.mdc-top-app-bar--dense .mdc-top-app-bar__title{padding-left:12px;padding-right:0}[dir=rtl] .mdc-top-app-bar--dense .mdc-top-app-bar__title,.mdc-top-app-bar--dense .mdc-top-app-bar__title[dir=rtl]{padding-left:0;padding-right:12px}.mdc-top-app-bar--prominent .mdc-top-app-bar__row{height:128px}.mdc-top-app-bar--prominent .mdc-top-app-bar__title{align-self:flex-end;padding-bottom:2px}.mdc-top-app-bar--prominent .mdc-top-app-bar__action-item,.mdc-top-app-bar--prominent .mdc-top-app-bar__navigation-icon{align-self:flex-start}.mdc-top-app-bar--fixed{transition:box-shadow 200ms linear}.mdc-top-app-bar--fixed-scrolled{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0,0,0,.12);transition:box-shadow 200ms linear}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__row{height:96px}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__section{padding:0 12px}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title{padding-left:20px;padding-right:0;padding-bottom:9px}[dir=rtl] .mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title,.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title[dir=rtl]{padding-left:0;padding-right:20px}.mdc-top-app-bar--fixed-adjust{padding-top:64px}.mdc-top-app-bar--dense-fixed-adjust{padding-top:48px}.mdc-top-app-bar--short-fixed-adjust{padding-top:56px}.mdc-top-app-bar--prominent-fixed-adjust{padding-top:128px}.mdc-top-app-bar--dense-prominent-fixed-adjust{padding-top:96px}@media(max-width: 599px){.mdc-top-app-bar__row{height:56px}.mdc-top-app-bar__section{padding:4px}.mdc-top-app-bar--short{transition:width 200ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed{transition:width 250ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end{padding-left:0;padding-right:12px}[dir=rtl] .mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end,.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end[dir=rtl]{padding-left:12px;padding-right:0}.mdc-top-app-bar--prominent .mdc-top-app-bar__title{padding-bottom:6px}.mdc-top-app-bar--fixed-adjust{padding-top:56px}}:host{display:block}.mdc-top-app-bar{color:#fff;color:var(--mdc-theme-on-primary, #fff);width:100%;width:var(--mdc-top-app-bar-width, 100%)}.mdc-top-app-bar--prominent #navigation ::slotted(*),.mdc-top-app-bar--prominent #actions ::slotted(*){align-self:flex-start}#navigation ::slotted(*),#actions ::slotted(*){--mdc-icon-button-ripple-opacity: 0.24}.mdc-top-app-bar--short-collapsed #actions ::slotted(*){transition:padding 150ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar__section--align-center{justify-content:center}.mdc-top-app-bar__section--align-center .mdc-top-app-bar__title{padding-left:0;padding-right:0}.center-title .mdc-top-app-bar__section--align-start,.center-title .mdc-top-app-bar__section--align-end{flex-basis:0}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__section--align-center .mdc-top-app-bar__title{padding-left:0;padding-right:0}.mdc-top-app-bar--fixed-scrolled{box-shadow:var(--mdc-top-app-bar-fixed-box-shadow, 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12))}`;

let TopAppBar = class TopAppBar extends TopAppBarBase {
};
TopAppBar.styles = style$k;
TopAppBar = __decorate([
    customElement('mwc-top-app-bar')
], TopAppBar);

/**
 * extenstion of mwc-top-app-bar as unfixed is not yet supported.
 * https://github.com/material-components/material-components-web-components/issues/1064
 */
class PwiTopAppBar extends TopAppBar {
  static get styles() {
    return [
      super.styles,
      css `
        :host([unfixed]) .mdc-top-app-bar {
          position: sticky;
        }

       :host([unfixed]) .mdc-top-app-bar--fixed-adjust {
         padding-top: 0;
       }

      `
      ];
  }

  static get properties() {
    return {
      ...super.properties,

      /*
       * `unfixed`
       */
      unfixed: {
        type: Boolean,
        reflect: true
      }
    };
  }
}

customElements.define('pwi-top-app-bar', PwiTopAppBar);

var tooltip = css `
    
    [data-title] {
      position: relative;
    }
  
    [data-title]::before {
      opacity: 0;
      will-change: opacity;
      transition: opacity 150ms;
      content: attr(data-title);
      position: absolute;
      bottom: -32px;
      display: inline-block;
      padding: 5px 10px;
      border-radius: 3px;
      font-family: var(--mdc-typography-body2-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));
      font-size: var(--mdc-typography-body2-font-size, 0.875rem);
      line-height: var(--mdc-typography-body2-line-height, 1.25rem);
      font-weight: var(--mdc-typography-body2-font-weight, 400);
      letter-spacing: var(--mdc-typography-body2-letter-spacing, 0.0178571em);
      text-transform: var(--mdc-typography-body2-text-transform, inherit);
      background-color: var(--tooltip-background-color, rgb(51, 51, 51));
      color: var(--tooltip-color, rgba(255, 255, 255, 0.87));
      white-space: nowrap;
    }
   
    [data-title]:hover::before, [data-title]:hover::after {
      opacity: 1;
    }
`;

/** @soyCompatible */
class IconButtonBase extends LitElement {
    constructor() {
        super(...arguments);
        this.disabled = false;
        this.icon = '';
        this.label = '';
        this.shouldRenderRipple = false;
        this.rippleHandlers = new RippleHandlers(() => {
            this.shouldRenderRipple = true;
            return this.ripple;
        });
    }
    /** @soyTemplate */
    renderRipple() {
        return this.shouldRenderRipple ? html$2 `
            <mwc-ripple
                .disabled="${this.disabled}"
                unbounded>
            </mwc-ripple>` :
            '';
    }
    focus() {
        const buttonElement = this.buttonElement;
        if (buttonElement) {
            this.rippleHandlers.startFocus();
            buttonElement.focus();
        }
    }
    blur() {
        const buttonElement = this.buttonElement;
        if (buttonElement) {
            this.rippleHandlers.endFocus();
            buttonElement.blur();
        }
    }
    /** @soyTemplate */
    render() {
        return html$2 `<button
        class="mdc-icon-button"
        aria-label="${this.label || this.icon}"
        ?disabled="${this.disabled}"
        @focus="${this.handleRippleFocus}"
        @blur="${this.handleRippleBlur}"
        @mousedown="${this.handleRippleMouseDown}"
        @mouseenter="${this.handleRippleMouseEnter}"
        @mouseleave="${this.handleRippleMouseLeave}"
        @touchstart="${this.handleRippleTouchStart}"
        @touchend="${this.handleRippleDeactivate}"
        @touchcancel="${this.handleRippleDeactivate}">
      ${this.renderRipple()}
    <i class="material-icons">${this.icon}</i>
    <span class="default-slot-container">
        <slot></slot>
    </span>
  </button>`;
    }
    handleRippleMouseDown(event) {
        const onUp = () => {
            window.removeEventListener('mouseup', onUp);
            this.handleRippleDeactivate();
        };
        window.addEventListener('mouseup', onUp);
        this.rippleHandlers.startPress(event);
    }
    handleRippleTouchStart(event) {
        this.rippleHandlers.startPress(event);
    }
    handleRippleDeactivate() {
        this.rippleHandlers.endPress();
    }
    handleRippleMouseEnter() {
        this.rippleHandlers.startHover();
    }
    handleRippleMouseLeave() {
        this.rippleHandlers.endHover();
    }
    handleRippleFocus() {
        this.rippleHandlers.startFocus();
    }
    handleRippleBlur() {
        this.rippleHandlers.endFocus();
    }
}
__decorate([
    property({ type: Boolean, reflect: true })
], IconButtonBase.prototype, "disabled", void 0);
__decorate([
    property({ type: String })
], IconButtonBase.prototype, "icon", void 0);
__decorate([
    property({ type: String })
], IconButtonBase.prototype, "label", void 0);
__decorate([
    query('button')
], IconButtonBase.prototype, "buttonElement", void 0);
__decorate([
    queryAsync('mwc-ripple')
], IconButtonBase.prototype, "ripple", void 0);
__decorate([
    internalProperty()
], IconButtonBase.prototype, "shouldRenderRipple", void 0);
__decorate([
    eventOptions({ passive: true })
], IconButtonBase.prototype, "handleRippleMouseDown", null);
__decorate([
    eventOptions({ passive: true })
], IconButtonBase.prototype, "handleRippleTouchStart", null);

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const style$l = css `.material-icons{font-family:var(--mdc-icon-font, "Material Icons");font-weight:normal;font-style:normal;font-size:var(--mdc-icon-size, 24px);line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga"}.mdc-icon-button{display:inline-block;position:relative;box-sizing:border-box;border:none;outline:none;background-color:transparent;fill:currentColor;color:inherit;font-size:24px;text-decoration:none;cursor:pointer;user-select:none;width:48px;height:48px;padding:12px}.mdc-icon-button svg,.mdc-icon-button img{width:24px;height:24px}.mdc-icon-button:disabled{color:rgba(0, 0, 0, 0.38);color:var(--mdc-theme-text-disabled-on-light, rgba(0, 0, 0, 0.38))}.mdc-icon-button:disabled{cursor:default;pointer-events:none}.mdc-icon-button__icon{display:inline-block}.mdc-icon-button__icon.mdc-icon-button__icon--on{display:none}.mdc-icon-button--on .mdc-icon-button__icon{display:none}.mdc-icon-button--on .mdc-icon-button__icon.mdc-icon-button__icon--on{display:inline-block}:host{display:inline-block;outline:none;--mdc-ripple-color: currentcolor;-webkit-tap-highlight-color:transparent}:host([disabled]){pointer-events:none}:host,.mdc-icon-button{vertical-align:top}.mdc-icon-button{width:var(--mdc-icon-button-size, 48px);height:var(--mdc-icon-button-size, 48px);padding:calc( (var(--mdc-icon-button-size, 48px) - var(--mdc-icon-size, 24px)) / 2 )}.mdc-icon-button>i{position:absolute;top:0;padding-top:inherit}.mdc-icon-button i,.mdc-icon-button svg,.mdc-icon-button img,.mdc-icon-button ::slotted(*){display:block;width:var(--mdc-icon-size, 24px);height:var(--mdc-icon-size, 24px)}`;

/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/** @soyCompatible */
let IconButton = class IconButton extends IconButtonBase {
};
IconButton.styles = style$l;
IconButton = __decorate([
    customElement('mwc-icon-button')
], IconButton);

/**
 * An element that copies slotted text a text to clipboard.
 *
 * @fires content-copy - fired before copy. preventDefault to cancel copy
 * @fires content-copied  - after successful copy
 * @fires content-copied-error  - there was a problem
 * 
 */
class PwiCopy extends LitElement {

  static get styles() {
    return [tooltip, css `
    :host {
    }
    `];
  }

  static get properties() {
    return {
      
      _icon: {
        type: String
      },

      /*
       * `content` content to be copied. 
       * If empty, will take textContent of slot.
       */
      content: {
        type: String,
      },

    };
  }

  render() {
    return html$2 `
      <slot id="copy"></slot><mwc-icon-button id="button" part="button" data-title="Copy to clipboard" @click="${this.copy}" icon="${this._icon}" label="copy to clipboard">
    `;
  }

  constructor() {
    super();
    this._icon = 'content_copy';
  }

  _reset() {
    setTimeout(() => {
      this._icon = 'content_copy';
    }, 2000);
  }

  copy(e) {
    if (this.dispatchEvent(new CustomEvent('content-copy', { bubbles: true, composed: true}))) {
      const content = this.content ? [this.content] : this.renderRoot.querySelector('slot').assignedNodes().map(getContent);

      return copyText(content.join('\n'))
        .then(() => {
          this._icon = 'done';
          this._reset();
          this.dispatchEvent(new CustomEvent('content-copied', {detail: content, bubbles: true, composed: true}));
        })
        .catch(e => {
          this._icon = 'error';
          this._reset();
          this.dispatchEvent(new CustomEvent('content-copied-error', {detail: e, bubbles: true, composed: true}));
        });
      }
    }
}

function getContent(node) {
  if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
    return node.value;
  } else if (node instanceof HTMLAnchorElement && node.hasAttribute('href')) {
    return node.href;
  } else {
    return node.textContent;
  }
}

function copyNode(node) {
  if ('clipboard' in navigator) {
    return navigator.clipboard.writeText(node.textContent);
  }

  const selection = getSelection();

  if (selection == null) {
    return Promise.reject(new Error());
  }

  selection.removeAllRanges();
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.addRange(range);
  document.execCommand('copy');
  selection.removeAllRanges();
  return Promise.resolve();
}

function copyText(text) {
  if ('clipboard' in navigator) {
    return navigator.clipboard.writeText(text);
  }

  const body = document.body;

  if (!body) {
    return Promise.reject(new Error());
  }

  const node = createNode(text);
  body.appendChild(node);
  copyNode(node);
  body.removeChild(node);
  return Promise.resolve();
}

function createNode(text) {
  const node = document.createElement('pre');
  node.style.width = '1px';
  node.style.height = '1px';
  node.style.position = 'fixed';
  node.style.top = '5px';
  node.textContent = text;
  return node;
}


// Register the new element with the browser.
customElements.define('pwi-copy', PwiCopy);

/**
 * ## PwiMdEditr
 *
 * `<pwi-error-panel>` is a simple panel do display error and possible remedy actions
 * 
 * @fires pwi-error-action - evend fired when `md` changes
 * @slot message - present when message property is not set
 * @slot action - present when action property is not set
 */
class PwiErrorPanel extends LitElement {

  static get styles() {
    return [
      styleTypography,
      css `
    :host {
      display: block;
    }

    :host([theme=center]) {
        display: flex;
        align-items: center;
        justify-content: center;
    }
     :host([theme=center]) > div {
        padding: var(--space-xx-large, 48px);
    }

    [part=message] {
      margin-bottom: var(--space-medium, 16px);
      color: var(--color-danger);
    }

    `
    ];
  }

  static get properties() {

    return {

      ...super.properties,

      /*
       * the error message
       */
      message: {
        type: String,
      },

      /*
       * the label 
       */
      action: {
        type: String,
      },

      /*
       * title for the panel
       */
      title: {
        type: String,
      },

      /*
       * `type` type of error, will be fired when action is clicked
       */
      type: {
        type: String,
      },

      /*
       * `theme` 
       */
      theme: {
        type: String,
        reflect: true
      }

    };
  }

  render() {
    return this.message ? html$2 `
      <div>
        <h3 part="title">${this.title}</h3>
        <div part="message">${this.message ? this.message : html$2 `<slot name="message"></slot>`}</div>
        <div part="action">${this.action ? html$2 `<mwc-button @click="${this.onAction}" raised label="${this.action}"></mwc-button>` : html$2 `<slot name="action"></slot>`}</message>
      </div>
    ` : '';
  }

  constructor() {
    super();
    this.title = 'Ooops, something is not quite right!';
  }

  onAction(e) {
    this.dispatchEvent(new CustomEvent('pwi-error-action', {detail: {type: this.type}, bubbles: true, composed: true }));
  }
}

// Register the new element with the browser.
customElements.define('pwi-error-panel', PwiErrorPanel);

/**
 * set firebase app from appName
 *
 * @param {LitElement} baseElement - the LitElement to extend
 */
const appMixin = (baseElement) => class extends baseElement {

  static get properties() {
    return {
      ...super.properties,

      app: {
        type: Object,
      },

      appName: {
        type: String,
        attribute: 'app-name'
      },

      /*
       * `log` true to enable logging
       */
      log: {
        type: Boolean,
      },
    }

  }

  constructor() {
    super();
    this.appName = '';
  }

  update(props) {
    super.update(props);
    if (props.has('appName') && (!this.app || this.app.name !== this.appName || (this.appName === '' && this.app.name !== '[DEFAULT]'))) {
      if(firebase) {
        this.app = firebase.app(this.appName);
      }
      else {
        window.addEventListener('firebase-app-initialized', () => {
           this.app = firebase.app(this.appName);   
        }, {once: true});
      }
    }
  }


  onError(err) {
    this.log && console.error(err);
    this.dispatchEvent(new CustomEvent('error', { detail: err, bubbles: true, composed: true }));
  }
};

/**
 * ##  Resizable
 * 
 * handles size and resizing
 * 
 * @memberof MultiChart.mixin
 * @polymer
 * @mixinFunction
 */


const networkStatusSubscribers = [];

function notifySubscribers() {
  for (let i = 0; i < networkStatusSubscribers.length; ++i) {
    networkStatusSubscribers[i].refreshNetworkStatus();
  }
}

window.addEventListener('online', notifySubscribers);
window.addEventListener('offline', notifySubscribers);

const AppNetworkStatusBehavior = superClass => {

  /*
   * @polymer
   * @mixinClass
   */
  class Mixin extends superClass {

    // static get properties() {

    //   return {

    //     ...super.properties,

    //     *
    //      * True if the browser is online, and false if the browser is offline
    //      * matching the HTML browser state spec.
    //      *
    //      * @type {Boolean}
         
    //     _online: {
    //       type: Boolean
    //     }

    //   };
    // }

    connectedCallback() {
      super.connectedCallback();
      networkStatusSubscribers.push(this);
      this.refreshNetworkStatus();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      const index = networkStatusSubscribers.indexOf(this);
      if (index < 0) {
        return;
      }
      networkStatusSubscribers.splice(index, 1);
    }

    /**
     * Updates the `online` property to reflect the browser connection status.
     */
    refreshNetworkStatus() {
      this._online = window.navigator.onLine;
    }

  }

  return Mixin;
};

/**
 * common properties for firebase database
 *
 * @param {LitElement} baseElement - the LitElement to extend
 */


/**
 * cheks whether path is a valid path
 * @param  {String} path firebase database path
 * @return {Boolean}      true if path is valid
 */
const pathReady = (path) => path && path.split('/').slice(1).indexOf('') < 0;

const Mixin = (baseElement) => class extends AppNetworkStatusBehavior(appMixin(baseElement)) {

  static get properties() {
    return {

      ...super.properties,

      db: {
        type: Object,
      },

      ref: {
        type: Object
      },

      /**
       * Path to a Firebase root or endpoint. N.B. `path` is case sensitive.
       * @type {string|null}
       */
      path: {
        type: String
      },

      /**
       * When true, Firebase listeners won't be activated. This can be useful
       * in situations where elements are loaded into the DOM before they're
       * ready to be activated (e.g. navigation, initialization scenarios).
       */
      disabled: {
        type: Boolean,
        value: false
      }

    }

  }

  constructor() {
    super();
    this.appName = '';
  }

  update(props) {
    super.update(props);
    if (props.has('app')) {
      this.__computeDb(this.app);
    }
    if (props.has('db') || props.has('path') || props.has('disabled')) {
      this.__computeRef(this.db, this.path);
    }
  }

  __computeDb(app) {
    this.db = app ? app.database() : null;
  }

  __computeRef(db, path) {
    if (db == null ||
      path == null ||
      !pathReady(path) ||
      this.disabled) {
      this.ref = null;
      return;
    }

    this.ref = db.ref(path);
    this.dispatchLoading();
  }

  /**
   * called when we start loading data, i.e. when this.ref is set
   */
  dispatchLoading() {
    this.__dispatchChange(true);
  }

  /**
   * called when we we have received data 
   */
  dispatchValue() {
    this.__dispatchChange(false);
  }

  /**
   * @override
   * Updates the `online` property to reflect the browser connection status.
   */
  refreshNetworkStatus() {
    if (!this.ref) {
      return;
    }

    if (window.navigator.onLine) {
      this.db.goOnline();
    } else {
      this.db.goOffline();
    }
  }

  /**
   * notify outisde world about change 
   * we need to set path in event detail to make sure the value is read from detail and not form 
   * host property (see Polymer property-effects handleNotification)
   * @param  {Boolean} loading           true if we are loading data (just once this.ref is set)
   * @param  {Boolean} skipDispatchValue when true 
   * @return {[type]}                   [description]
   */
  __dispatchChange(loading) {

    if (!loading) {
      this.log && console.info('data-changed', this.__remote);

      /*
      
      Note(cg): we need this as we are dispatching event without path.
      Polymer handles notifications differently:
        if (fromPath) {
          toPath = Polymer.Path.translate(fromProp, toPath, fromPath);
          value = detail && detail.value;
        } else {
          value = event.currentTarget[fromProp];
        }

      */

      this.dispatchEvent(new CustomEvent('data-changed', { detail: { value: this.__remote } }));
    }
    this.dispatchEvent(new CustomEvent('loading-changed', { detail: { value: loading, path: 'loading' } }));
    this.dispatchEvent(new CustomEvent('exists-changed', { detail: { value: loading ? null : !(this.__remote === null || this.__remote === undefined), path: 'exists' } }));
  }
};

class LifDocument extends Mixin(UpdatingElement) {

  static get properties() {
    return {
      ...super.properties,
    }
  }

  get data() {
    return this.__remote;
  }

  set data(value) {
    if (value === undefined) { return }
    const setData = (val) => {
      if (val !== this.__remote || (val === Object(val) && JSON.stringify(val) !== JSON.stringify(this.__remote))) {
        this.log && console.info('settings value to remote', val);
        this.ref.set(val)
          .catch(e => this.onError(e));
      }
    };

    // Note(cg): only set data once __remote is known.
    if (this.__remote === undefined) {
      this.addEventListener('data-changed', () => { 
        // Note(cg): override persisted data only if remote is null.
        if(this._remote === null) {
          setData(value);
        }}, { once: true });
      return;
    }
    setData(value);
  }

  disconnectedCallback() {
    if (this.ref) {
      this.ref.off('value', this.onValue, this);
    }
    super.disconnectedCallback();
  }

  update(props) {
    if (this.log) {
      console.info('update query props');
      for (const item of props) console.info(item);
    }
    if (props.has('ref')) {
      this.__setRef(this.ref, props.get('ref'));
    }
    super.update(props);
  }

  __setRef(ref, old) {
    if (old) {
      this.__remote = undefined;
      old.off('value', this.onValue, this);
    }
    if (ref) {
      ref.on('value', this.onValue, this.onError, this);
    }
  }

  onValue(snap) {
    this.__remote = snap.val();
    this.log && console.info('read value', this.__remote);
    this.dispatchValue();

  }
}

// Register the new element with the browser.
customElements.define('lif-document', LifDocument);

const __valueWithKey = (key, value) => {
  const leaf = typeof value !== 'object';

  if (leaf) {
    return { $key: key, $val: value };
  }
  value.$key = key;
  return value;
};

const __snapshotToValue = (snapshot) => __valueWithKey(snapshot.key, snapshot.val());

class LifQuery extends Mixin(UpdatingElement) {

  static get properties() {
    return {
      ...super.properties,

      /*
       * `data` 
       */
      // data: {
      //   type: Array,
      // },

      /**
       * [`firebase.database.Query`](https://firebase.google.com/docs/reference/js/firebase.database.Query#property)
       * object computed by the following parameters.
       */
      query: {
        type: Object,
      },

      /**
       * The child key of each query result to order the query by.
       *
       * Changing this value generates a new `query` ordered by the
       * specified child key.
       */
      orderByChild: {
        type: String,
        attribute: 'order-by-child'
      },

      /**
       * Order this query by values. This is only applicable to leaf node queries
       * against data structures such as `{a: 1, b: 2, c: 3}`.
       */
      orderByValue: {
        type: Boolean,
        attribute: 'order-by-value'
      },

      /**
       * The value to start at in the query.
       *
       * Changing this value generates a new `query` with the specified
       * starting point. The generated `query` includes children which match
       * the specified starting point.
       */
      startAt: {
        type: String,
        attribute: 'start-at'
      },

      /**
       * The value to end at in the query.
       *
       * Changing this value generates a new `query` with the specified
       * ending point. The generated `query` includes children which match
       * the specified ending point.
       */
      endAt: {
        type: String,
        attribute: 'end-at'
      },

      /**
       * Specifies a child-key value that must be matched for each candidate result.
       *
       * Changing this value generates a new `query` which includes children
       * which match the specified value.
       */
      equalTo: {
        type: Object,
        attribute: 'equal-to'
      },

      /**
       * The maximum number of nodes to include in the query.
       *
       * Changing this value generates a new `query` limited to the first
       * number of children.
       */
      limitToFirst: {
        type: Number,
        attribute: 'limit-to-first'
      },

      /**
       * The maximum number of nodes to include in the query.
       *
       * Changing this value generates a new `query` limited to the last
       * number of children.
       */
      limitToLast: {
        type: Number,
        attribute: 'limit-to-last'
        // value: 0
      }
    }
  }

  get data() {
    return this.__remote;
  }

  set data(value) {
    // Note(cg): do nothing. But we need a setter
  }

  constructor() {
    super();
    this.__map = {};
    this.__remote = [];
  }

  disconnectedCallback() {
    if (this.query) {
      this.__removeListeners(this.query);
    }
    super.disconnectedCallback();
  }

  update(props) {
    if(this.log) {
      console.info('update query props');
      for (const item of props) console.log(item);
    } 
    if (props.has('ref') || props.has('orderByChild') || props.has('orderByValue') || props.has('limitToFirst') || props.has('limitToLast') || props.has('startAt') || props.has('endAt') || props.has('equalTo')) {
      this.__setQuery(this.ref, props.get('ref'));
    }
    if (props.has('query')) {
      this.__queryChanged(this.query, props.get('query'));
    }
    super.update(props);
  }

  __setRef(ref, old) {
    if (old) {
      old.off('value', this.onValue, this);
    }
    if (ref) {
      ref.on('value', this.onValue, this.onError, this);
    }
  }

  __setQuery(ref) {
    if (ref == null) {
      this.query = null;
      return
    }

    let query;

    if (this.orderByChild) {
      query = ref.orderByChild(this.orderByChild);
    } else if (this.orderByValue) {
      query = ref.orderByValue();
    } else {
      query = ref.orderByKey();
    }

    if (this.limitToFirst) {
      query = query.limitToFirst(this.limitToFirst);
    } else if (this.limitToLast) {
      query = query.limitToLast(this.limitToLast);
    }

    if (this.startAt !== undefined) {
      query = query.startAt(this.startAt);
    }

    if (this.endAt !== undefined) {
      query = query.endAt(this.endAt);
    }

    if (this.equalTo !== undefined) {
      query = query.equalTo(this.equalTo);
    }

    this.query = query;
  }

  __removeListeners(query) {
    query.off('value', this.__onFirebaseValue, this);
    query.off('child_added', this.__onFirebaseChildAdded, this);
    query.off('child_removed', this.__onFirebaseChildRemoved, this);
    query.off('child_changed', this.__onFirebaseChildChanged, this);
    query.off('child_moved', this.__onFirebaseChildMoved, this);

  }

  __queryChanged(query, oldQuery) {
    if (oldQuery) {
      this.__removeListeners(oldQuery);

      this.__remote = [];
      this.__map = {};
    }

    // this allows us to just call the addition of event listeners only once.
    // __queryChanged is being called thrice when firebase-query is created
    // 1 - 2. query property computed (null, undefined)
    // 3. when attached is called (this.query, this.query)
    // need help to fix this so that this function is only called once

    if (query) {
      query.on('value', this.__onFirebaseValue, this.onError, this);
    }
  }

  __indexFromKey(key) {
    return this.__remote.findIndex(item => item.$key === key);
  }

  __onFirebaseValue(snapshot) {
    if (snapshot.hasChildren()) {
      const data = [];
      snapshot.forEach((childSnapshot) => {
        const { key } = childSnapshot;
        const value = __valueWithKey(key, childSnapshot.val());

        this.__map[key] = value;
        data.push(value);
      });

      this.__remote = data;
    }
    this.dispatchValue();
    // this.dispatchChange(false, !!this._remote);
    this.log && console.info('set value', this.__remote);

    const { query } = this;

    query.on('child_added', this.__onFirebaseChildAdded, this.onError, this);
    query.on('child_removed', this.__onFirebaseChildRemoved, this.onError, this);
    query.on('child_changed', this.__onFirebaseChildChanged, this.onError, this);
    query.on('child_moved', this.__onFirebaseChildMoved, this.onError, this);
  }

  __onFirebaseChildAdded(snapshot, previousChildKey) {
    const key = snapshot.key;

    // check if the key-value pair already exists
    if (this.__indexFromKey(key) >= 0) return

    // const value = snapshot.val();
    const previousChildIndex = this.__indexFromKey(previousChildKey);


    const value = __snapshotToValue(snapshot);
    this.log && console.info('Firebase child_added:', key, value);

    this.__map[key] = value;
    this.__remote.splice(previousChildIndex + 1, 0, value);
    
    // Note(cg): we need a new Object, otherwise Polymer will not be notified of array mutation..
    this.__remote = [...this.__remote];
    this.dispatchValue();
  }

  __onFirebaseChildRemoved(snapshot) {

    const key = snapshot.key;
    const value = this.__map[key];

    this.log && console.info('Firebase child_removed:', key, value);

    if (value) {
      this.__map[key] = null;
      if (this.__indexFromKey(key) >= 0) {
        // Note(cg): we need a new Object, otherwise Polymer will not be notified of array mutation..
        this.__remote.splice(this.__indexFromKey(key), 1);
      }
     this.__remote = [...this.__remote];
     this.dispatchValue();
    }
  }

  __onFirebaseChildChanged(snapshot) {
    const key = snapshot.key;
    const prev = this.__map[key];

    this.log && console.info('Firebase child_changed:', key, prev);

    if (prev) {
      const index = this.__indexFromKey(key);
      const value = __snapshotToValue(snapshot);

      this.__map[key] = value;
      if (value instanceof Object) {
        for (const property in value) {
          this.__remote[index][property] = value[property];
        }
        for (const property in prev) {
          if (!value.hasOwnProperty(property)) {
            this.__remote[index][property] = null;
          }
        }
      } else {
        this.__remote[index] = value;
      }

    }
    this.__remote = [...this.__remote];
    this.dispatchValue();
  }

  __onFirebaseChildMoved(snapshot, previousChildKey) {
    const key = snapshot.key;
    const value = this.__map[key];
    const targetIndex = previousChildKey ? this.__indexFromKey(previousChildKey) + 1 : 0;

    this.log && console.info('Firebase child_moved:', key, value, 'to index', targetIndex);

    if (value) {
      const index = this.__indexFromKey(key);

      this.__map[key] = __snapshotToValue(snapshot);
      this.__remote.splice(index, 1);
      this.__remote.splice(targetIndex, 0, this.__map[key]);

      this.__remote = [...this.__remote];
      this.dispatchValue();

    }
  }

}

// Register the new element with the browser.
customElements.define('lif-query', LifQuery);

// import { default as FirebaseDatabase } from './lif-database-mixin.js';

/**
 * cheks whether path is a valid path
 * @param  {String} path firebase database path
 * @return {Boolean}      true if path is valid
 */
const pathReady$1 = (path) => {
  const split = path && path.split('/').slice(1);
  return split.indexOf('') < 0 && split.indexOf('undefined') < 0;
};


const decorate = (data, id, change) => {
  data.$id = id;
};

const getter = (doc, fieldPath) => {
  return fieldPath 
    ? (Array.isArray(fieldPath) 
      ? fieldPath.reduce((obj, key) => {
        obj[key] = doc.get(key) || {};
        return obj;
      }, {}) 
      : doc.get(fieldPath) || {})
        : doc.data();
      };

class LifStore extends appMixin(UpdatingElement) {

  static get properties() {
    return {
      ...super.properties,

      db: {
        type: Object,
      },

      ref: {
        type: Object
      },

      /**
       * Path to a Firebase root or endpoint. N.B. `path` is case sensitive.
       * @type {string|null}
       */
      path: {
        type: String
      },

      /*
       * `fieldPath` if set, will use DocumentSnapshot.get(fieldPath) instead of DocumentSnapshot.data().``
       *  WHen fieldPath is an Array, will collect all fields. 
       */
      fieldPath: {
        type: String,
      },

      /*
       * `where` the where query {field: 'field', op: '==', value: 123}
       */
      where: {
        type: Object
      },

      /*
       * `decorate` a function decorate collection data 
       */
      decorate: {
        type: Function,
      },
    }
  }

  constructor() {
    super();
    this.decorate = decorate;
  }

  get data() {
    return this.__remote;
  }

  set data(value) {
    if (value === undefined || this._refType === 'collection') { return }
    const setData = (val) => {
      if (val !== this.__remote || (val === Object(val) && JSON.stringify(val) !== JSON.stringify(this.__remote))) {
        this.log && console.info('settings value to remote', this.fieldPath, val);
        if(this.fieldPath) {
          if(Array.isArray(this.fieldPath)) {
            throw 'Document Store can only have String fieldPath'
          }
          this.ref.update({[this.fieldPath]: val})
            .catch(e => this.onError(e));  
        } else {
          this.ref.set(val)
            .catch(e => this.onError(e));
          }
      }
    };

    // Note(cg): only set data once __remote is known.
    if (this.__remote === undefined) {
      this.addEventListener('data-changed', () => { setData(value); }, { once: true });
      return;
    }
    setData(value);
  }


  save(data) {
    this.data = data;
  }

  disconnectedCallback() {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
    super.disconnectedCallback();
  }

  update(props) {
    if (this.log) {
      console.info('update query props');
      for (const item of props) console.info(item);
    }
    if (props.has('app')) {
      this.__computeDb(this.app);
    }
    if (props.has('db') || props.has('path') || props.has('where')) {
      this.__computeRef(this.db, this.path);
    }
    if (props.has('ref')  ) {
      this.__setRef(this.ref, props.get('ref'));
    }
    if (props.has('decorate')) {
      if (this.refType === 'collection' && this.__remote && this.ref) {
        this.__readCollection(this.ref);
      }
    }
    super.update(props);
  }

  __computeDb(app) {
    this.db = app ? app.firestore() : null;
  }

  __computeRef(db, path) {
    if (db == null ||
      path == null ||
      !pathReady$1(path)) {
      this.ref = null;
      return;
    }

    const split = path.split('/').splice(1);
    this.ref = split.reduce((ref, name, index) => {
      let query = ref instanceof firebase.firestore.CollectionReference ? ref.doc(name) : ref.collection(name);
      if (query instanceof firebase.firestore.CollectionReference && index < 2 && this.where) {
        query.where(this.where.field, this.where.op, this.where.value);
      }
      return query;
    }, db);
    this.dispatchEvent(new CustomEvent('ref-changed', { detail: { value: this.ref } }));
  }

  async __setRef(ref, old) {
    if (old) {
      this.__remote = undefined;
      this.refType = null;
      this._unsubscribe();
    }
    if (ref) {
      if (ref instanceof firebase.firestore.CollectionReference) {
        this.log && console.info('collection ref');
        this.refType = 'collection';
        this.__subscribeCollection(ref);
      } else {
        this.log && console.info('document ref');
        this.refType = 'document';
        this.__subscribeDocument(ref);
      }
    }
  }

  __subscribeDocument(ref) {
    this._unsubscribe = ref.onSnapshot((doc) => {
      this.__remote = getter(doc, this.fieldPath); 
      this.log && console.info('document data', this.__remote);
      this.__dispatchChange();
    });
  }

  __subscribeCollection(ref) {
    
    this._unsubscribe = ref.onSnapshot((snapshot) => {
      // Note(cg): we do not react until the first get is complete.
      if (this._firstLoadCompleted) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = getter(change.doc, this.fieldPath); 
            this.decorate(data, change.doc.id, change);
            this.__remote = this.__remote.concat([data]);
            this.dispatchEvent(new CustomEvent('firestore-added', { detail: change }));
          }
          if (change.type === 'modified') {
            const data = getter(change.doc, this.fieldPath); 
            this.decorate(data, change.doc.id, change);
            this.__remote[change.oldIndex] = data;
            this.__remote = this.__remote.concat();
            this.dispatchEvent(new CustomEvent('firestore-modified', { detail: change }));
          }
          if (change.type === 'removed') {
            const { id } = change.doc;
            this.__remote = this.__remote.filter(item => item.$id !== id);
            this.dispatchEvent(new CustomEvent('firestore-removed', { detail: change }));
          }
        });
        this.__dispatchChange();
      }
    }, this.onError);

    this.__readCollection(ref);
  }

  async __readCollection(ref) {
    [this.__remote] = await Promise.all([
      await ref.get().then(snap => {
        this._firstLoadCompleted = true;
        return snap.docs.map((doc) => {
          const data = getter(doc, this.fieldPath); 
          this.decorate(data, doc.id);
          return data;
        });
      })
    ]);
    this.__dispatchChange();
  }

  /**
   * notify outisde world about change 
   * we need to set path in event detail to make sure the value is read from detail and not form 
   * host property (see Polymer property-effects handleNotification)
   * @param  {Boolean} loading           true if we are loading data (just once this.ref is set)
   * @param  {Boolean} skipDispatchValue when true 
   * @return {[type]}                   [description]
   */
  __dispatchChange(loading) {

    if (!loading) {
      this.log && console.info('data-changed', this.__remote);

      /*
        
      Note(cg): we need this as we are dispatching event without path.
      Polymer handles notifications differently:
        if (fromPath) {
          toPath = Polymer.Path.translate(fromProp, toPath, fromPath);
          value = detail && detail.value;
        } else {
          value = event.currentTarget[fromProp];
        }

      */

      this.dispatchEvent(new CustomEvent('data-changed', { detail: { value: this.__remote } }));
    }
    this.dispatchEvent(new CustomEvent('loading-changed', { detail: { value: loading, path: 'loading' } }));
    this.dispatchEvent(new CustomEvent('exists-changed', { detail: { value: loading ? null : !(this.__remote === null || this.__remote === undefined), path: 'exists' } }));
  }
}

// Register the new element with the browser.
customElements.define('lif-store', LifStore);

/*! @license DOMPurify | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/2.0.8/LICENSE */

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var hasOwnProperty = Object.hasOwnProperty,
    setPrototypeOf = Object.setPrototypeOf,
    isFrozen = Object.isFrozen,
    objectKeys = Object.keys;
var freeze = Object.freeze,
    seal = Object.seal,
    create = Object.create; // eslint-disable-line import/no-mutable-exports

var _ref = typeof Reflect !== 'undefined' && Reflect,
    apply = _ref.apply,
    construct = _ref.construct;

if (!apply) {
  apply = function apply(fun, thisValue, args) {
    return fun.apply(thisValue, args);
  };
}

if (!freeze) {
  freeze = function freeze(x) {
    return x;
  };
}

if (!seal) {
  seal = function seal(x) {
    return x;
  };
}

if (!construct) {
  construct = function construct(Func, args) {
    return new (Function.prototype.bind.apply(Func, [null].concat(_toConsumableArray(args))))();
  };
}

var arrayForEach = unapply(Array.prototype.forEach);
var arrayIndexOf = unapply(Array.prototype.indexOf);
var arrayJoin = unapply(Array.prototype.join);
var arrayPop = unapply(Array.prototype.pop);
var arrayPush = unapply(Array.prototype.push);
var arraySlice = unapply(Array.prototype.slice);

var stringToLowerCase = unapply(String.prototype.toLowerCase);
var stringMatch = unapply(String.prototype.match);
var stringReplace = unapply(String.prototype.replace);
var stringIndexOf = unapply(String.prototype.indexOf);
var stringTrim = unapply(String.prototype.trim);

var regExpTest = unapply(RegExp.prototype.test);
var regExpCreate = unconstruct(RegExp);

var typeErrorCreate = unconstruct(TypeError);

function unapply(func) {
  return function (thisArg) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return apply(func, thisArg, args);
  };
}

function unconstruct(func) {
  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return construct(func, args);
  };
}

/* Add properties to a lookup table */
function addToSet(set, array) {
  if (setPrototypeOf) {
    // Make 'in' and truthy checks like Boolean(set.constructor)
    // independent of any properties defined on Object.prototype.
    // Prevent prototype setters from intercepting set as a this value.
    setPrototypeOf(set, null);
  }

  var l = array.length;
  while (l--) {
    var element = array[l];
    if (typeof element === 'string') {
      var lcElement = stringToLowerCase(element);
      if (lcElement !== element) {
        // Config presets (e.g. tags.js, attrs.js) are immutable.
        if (!isFrozen(array)) {
          array[l] = lcElement;
        }

        element = lcElement;
      }
    }

    set[element] = true;
  }

  return set;
}

/* Shallow clone an object */
function clone(object) {
  var newObject = create(null);

  var property = void 0;
  for (property in object) {
    if (apply(hasOwnProperty, object, [property])) {
      newObject[property] = object[property];
    }
  }

  return newObject;
}

var html = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);

// SVG
var svg = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'audio', 'canvas', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'video', 'view', 'vkern']);

var svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']);

var mathMl = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover']);

var text = freeze(['#text']);

var html$1 = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns']);

var svg$1 = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'targetx', 'targety', 'transform', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);

var mathMl$1 = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);

var xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

// eslint-disable-next-line unicorn/better-regex
var MUSTACHE_EXPR = seal(/\{\{[\s\S]*|[\s\S]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode
var ERB_EXPR = seal(/<%[\s\S]*|[\s\S]*%>/gm);
var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); // eslint-disable-line no-useless-escape
var ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape
var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
);
var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var getGlobal = function getGlobal() {
  return typeof window === 'undefined' ? null : window;
};

/**
 * Creates a no-op policy for internal use only.
 * Don't export this function outside this module!
 * @param {?TrustedTypePolicyFactory} trustedTypes The policy factory.
 * @param {Document} document The document object (to determine policy name suffix)
 * @return {?TrustedTypePolicy} The policy created (or null, if Trusted Types
 * are not supported).
 */
var _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, document) {
  if ((typeof trustedTypes === 'undefined' ? 'undefined' : _typeof(trustedTypes)) !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
    return null;
  }

  // Allow the callers to control the unique policy name
  // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
  // Policy creation with duplicate names throws in Trusted Types.
  var suffix = null;
  var ATTR_NAME = 'data-tt-policy-suffix';
  if (document.currentScript && document.currentScript.hasAttribute(ATTR_NAME)) {
    suffix = document.currentScript.getAttribute(ATTR_NAME);
  }

  var policyName = 'dompurify' + (suffix ? '#' + suffix : '');

  try {
    return trustedTypes.createPolicy(policyName, {
      createHTML: function createHTML(html$$1) {
        return html$$1;
      }
    });
  } catch (_) {
    // Policy creation failed (most likely another DOMPurify script has
    // already run). Skip creating the policy, as this will only cause errors
    // if TT are enforced.
    console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
    return null;
  }
};

function createDOMPurify() {
  var window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();

  var DOMPurify = function DOMPurify(root) {
    return createDOMPurify(root);
  };

  /**
   * Version label, exposed for easier checks
   * if DOMPurify is up to date or not
   */
  DOMPurify.version = '2.0.15';

  /**
   * Array of elements that DOMPurify removed during sanitation.
   * Empty if nothing was removed.
   */
  DOMPurify.removed = [];

  if (!window || !window.document || window.document.nodeType !== 9) {
    // Not running in a browser, provide a factory function
    // so that you can pass your own Window
    DOMPurify.isSupported = false;

    return DOMPurify;
  }

  var originalDocument = window.document;
  var removeTitle = false;

  var document = window.document;
  var DocumentFragment = window.DocumentFragment,
      HTMLTemplateElement = window.HTMLTemplateElement,
      Node = window.Node,
      NodeFilter = window.NodeFilter,
      _window$NamedNodeMap = window.NamedNodeMap,
      NamedNodeMap = _window$NamedNodeMap === undefined ? window.NamedNodeMap || window.MozNamedAttrMap : _window$NamedNodeMap,
      Text = window.Text,
      Comment = window.Comment,
      DOMParser = window.DOMParser,
      trustedTypes = window.trustedTypes;

  // As per issue #47, the web-components registry is inherited by a
  // new document created via createHTMLDocument. As per the spec
  // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
  // a new empty registry is used when creating a template contents owner
  // document, so we use that as our parent document to ensure nothing
  // is inherited.

  if (typeof HTMLTemplateElement === 'function') {
    var template = document.createElement('template');
    if (template.content && template.content.ownerDocument) {
      document = template.content.ownerDocument;
    }
  }

  var trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, originalDocument);
  var emptyHTML = trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML('') : '';

  var _document = document,
      implementation = _document.implementation,
      createNodeIterator = _document.createNodeIterator,
      getElementsByTagName = _document.getElementsByTagName,
      createDocumentFragment = _document.createDocumentFragment;
  var importNode = originalDocument.importNode;


  var documentMode = clone(document).documentMode ? document.documentMode : {};

  var hooks = {};

  /**
   * Expose whether this browser supports running the full DOMPurify.
   */
  DOMPurify.isSupported = implementation && typeof implementation.createHTMLDocument !== 'undefined' && documentMode !== 9;

  var MUSTACHE_EXPR$$1 = MUSTACHE_EXPR,
      ERB_EXPR$$1 = ERB_EXPR,
      DATA_ATTR$$1 = DATA_ATTR,
      ARIA_ATTR$$1 = ARIA_ATTR,
      IS_SCRIPT_OR_DATA$$1 = IS_SCRIPT_OR_DATA,
      ATTR_WHITESPACE$$1 = ATTR_WHITESPACE;
  var IS_ALLOWED_URI$$1 = IS_ALLOWED_URI;

  /**
   * We consider the elements and attributes below to be safe. Ideally
   * don't add any new ones but feel free to remove unwanted ones.
   */

  /* allowed element names */

  var ALLOWED_TAGS = null;
  var DEFAULT_ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray$1(html), _toConsumableArray$1(svg), _toConsumableArray$1(svgFilters), _toConsumableArray$1(mathMl), _toConsumableArray$1(text)));

  /* Allowed attribute names */
  var ALLOWED_ATTR = null;
  var DEFAULT_ALLOWED_ATTR = addToSet({}, [].concat(_toConsumableArray$1(html$1), _toConsumableArray$1(svg$1), _toConsumableArray$1(mathMl$1), _toConsumableArray$1(xml)));

  /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
  var FORBID_TAGS = null;

  /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
  var FORBID_ATTR = null;

  /* Decide if ARIA attributes are okay */
  var ALLOW_ARIA_ATTR = true;

  /* Decide if custom data attributes are okay */
  var ALLOW_DATA_ATTR = true;

  /* Decide if unknown protocols are okay */
  var ALLOW_UNKNOWN_PROTOCOLS = false;

  /* Output should be safe for jQuery's $() factory? */
  var SAFE_FOR_JQUERY = false;

  /* Output should be safe for common template engines.
   * This means, DOMPurify removes data attributes, mustaches and ERB
   */
  var SAFE_FOR_TEMPLATES = false;

  /* Decide if document with <html>... should be returned */
  var WHOLE_DOCUMENT = false;

  /* Track whether config is already set on this instance of DOMPurify. */
  var SET_CONFIG = false;

  /* Decide if all elements (e.g. style, script) must be children of
   * document.body. By default, browsers might move them to document.head */
  var FORCE_BODY = false;

  /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
   * string (or a TrustedHTML object if Trusted Types are supported).
   * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
   */
  var RETURN_DOM = false;

  /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
   * string  (or a TrustedHTML object if Trusted Types are supported) */
  var RETURN_DOM_FRAGMENT = false;

  /* If `RETURN_DOM` or `RETURN_DOM_FRAGMENT` is enabled, decide if the returned DOM
   * `Node` is imported into the current `Document`. If this flag is not enabled the
   * `Node` will belong (its ownerDocument) to a fresh `HTMLDocument`, created by
   * DOMPurify. */
  var RETURN_DOM_IMPORT = false;

  /* Try to return a Trusted Type object instead of a string, return a string in
   * case Trusted Types are not supported  */
  var RETURN_TRUSTED_TYPE = false;

  /* Output should be free from DOM clobbering attacks? */
  var SANITIZE_DOM = true;

  /* Keep element content when removing element? */
  var KEEP_CONTENT = true;

  /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
   * of importing it into a new Document and returning a sanitized copy */
  var IN_PLACE = false;

  /* Allow usage of profiles like html, svg and mathMl */
  var USE_PROFILES = {};

  /* Tags to ignore content of when KEEP_CONTENT is true */
  var FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);

  /* Tags that are safe for data: URIs */
  var DATA_URI_TAGS = null;
  var DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);

  /* Attributes safe for values like "javascript:" */
  var URI_SAFE_ATTRIBUTES = null;
  var DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'summary', 'title', 'value', 'style', 'xmlns']);

  /* Keep a reference to config to pass to hooks */
  var CONFIG = null;

  /* Ideally, do not touch anything below this line */
  /* ______________________________________________ */

  var formElement = document.createElement('form');

  /**
   * _parseConfig
   *
   * @param  {Object} cfg optional config literal
   */
  // eslint-disable-next-line complexity
  var _parseConfig = function _parseConfig(cfg) {
    if (CONFIG && CONFIG === cfg) {
      return;
    }

    /* Shield configuration object from tampering */
    if (!cfg || (typeof cfg === 'undefined' ? 'undefined' : _typeof(cfg)) !== 'object') {
      cfg = {};
    }

    /* Shield configuration object from prototype pollution */
    cfg = clone(cfg);

    /* Set configuration parameters */
    ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS) : DEFAULT_ALLOWED_TAGS;
    ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR) : DEFAULT_ALLOWED_ATTR;
    URI_SAFE_ATTRIBUTES = 'ADD_URI_SAFE_ATTR' in cfg ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), cfg.ADD_URI_SAFE_ATTR) : DEFAULT_URI_SAFE_ATTRIBUTES;
    DATA_URI_TAGS = 'ADD_DATA_URI_TAGS' in cfg ? addToSet(clone(DEFAULT_DATA_URI_TAGS), cfg.ADD_DATA_URI_TAGS) : DEFAULT_DATA_URI_TAGS;
    FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS) : {};
    FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR) : {};
    USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
    SAFE_FOR_JQUERY = cfg.SAFE_FOR_JQUERY || false; // Default false
    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
    RETURN_DOM = cfg.RETURN_DOM || false; // Default false
    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
    RETURN_DOM_IMPORT = cfg.RETURN_DOM_IMPORT || false; // Default false
    RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false
    FORCE_BODY = cfg.FORCE_BODY || false; // Default false
    SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
    KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
    IN_PLACE = cfg.IN_PLACE || false; // Default false
    IS_ALLOWED_URI$$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI$$1;
    if (SAFE_FOR_TEMPLATES) {
      ALLOW_DATA_ATTR = false;
    }

    if (RETURN_DOM_FRAGMENT) {
      RETURN_DOM = true;
    }

    /* Parse profile info */
    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray$1(text)));
      ALLOWED_ATTR = [];
      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, html);
        addToSet(ALLOWED_ATTR, html$1);
      }

      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, svg);
        addToSet(ALLOWED_ATTR, svg$1);
        addToSet(ALLOWED_ATTR, xml);
      }

      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, svgFilters);
        addToSet(ALLOWED_ATTR, svg$1);
        addToSet(ALLOWED_ATTR, xml);
      }

      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, mathMl);
        addToSet(ALLOWED_ATTR, mathMl$1);
        addToSet(ALLOWED_ATTR, xml);
      }
    }

    /* Merge configuration parameters */
    if (cfg.ADD_TAGS) {
      if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
        ALLOWED_TAGS = clone(ALLOWED_TAGS);
      }

      addToSet(ALLOWED_TAGS, cfg.ADD_TAGS);
    }

    if (cfg.ADD_ATTR) {
      if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
        ALLOWED_ATTR = clone(ALLOWED_ATTR);
      }

      addToSet(ALLOWED_ATTR, cfg.ADD_ATTR);
    }

    if (cfg.ADD_URI_SAFE_ATTR) {
      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR);
    }

    /* Add #text in case KEEP_CONTENT is set to true */
    if (KEEP_CONTENT) {
      ALLOWED_TAGS['#text'] = true;
    }

    /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
    if (WHOLE_DOCUMENT) {
      addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
    }

    /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */
    if (ALLOWED_TAGS.table) {
      addToSet(ALLOWED_TAGS, ['tbody']);
      delete FORBID_TAGS.tbody;
    }

    // Prevent further manipulation of configuration.
    // Not available in IE8, Safari 5, etc.
    if (freeze) {
      freeze(cfg);
    }

    CONFIG = cfg;
  };

  /**
   * _forceRemove
   *
   * @param  {Node} node a DOM node
   */
  var _forceRemove = function _forceRemove(node) {
    arrayPush(DOMPurify.removed, { element: node });
    try {
      node.parentNode.removeChild(node);
    } catch (_) {
      node.outerHTML = emptyHTML;
    }
  };

  /**
   * _removeAttribute
   *
   * @param  {String} name an Attribute name
   * @param  {Node} node a DOM node
   */
  var _removeAttribute = function _removeAttribute(name, node) {
    try {
      arrayPush(DOMPurify.removed, {
        attribute: node.getAttributeNode(name),
        from: node
      });
    } catch (_) {
      arrayPush(DOMPurify.removed, {
        attribute: null,
        from: node
      });
    }

    node.removeAttribute(name);
  };

  /**
   * _initDocument
   *
   * @param  {String} dirty a string of dirty markup
   * @return {Document} a DOM, filled with the dirty markup
   */
  var _initDocument = function _initDocument(dirty) {
    /* Create a HTML document */
    var doc = void 0;
    var leadingWhitespace = void 0;

    if (FORCE_BODY) {
      dirty = '<remove></remove>' + dirty;
    } else {
      /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
      var matches = stringMatch(dirty, /^[\r\n\t ]+/);
      leadingWhitespace = matches && matches[0];
    }

    var dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
    /* Use the DOMParser API by default, fallback later if needs be */
    try {
      doc = new DOMParser().parseFromString(dirtyPayload, 'text/html');
    } catch (_) {}

    /* Remove title to fix a mXSS bug in older MS Edge */
    if (removeTitle) {
      addToSet(FORBID_TAGS, ['title']);
    }

    /* Use createHTMLDocument in case DOMParser is not available */
    if (!doc || !doc.documentElement) {
      doc = implementation.createHTMLDocument('');
      var _doc = doc,
          body = _doc.body;

      body.parentNode.removeChild(body.parentNode.firstElementChild);
      body.outerHTML = dirtyPayload;
    }

    if (dirty && leadingWhitespace) {
      doc.body.insertBefore(document.createTextNode(leadingWhitespace), doc.body.childNodes[0] || null);
    }

    /* Work on whole document or just its body */
    return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
  };

  /* Here we test for a broken feature in Edge that might cause mXSS */
  if (DOMPurify.isSupported) {
    (function () {
      try {
        var doc = _initDocument('<x/><title>&lt;/title&gt;&lt;img&gt;');
        if (regExpTest(/<\/title/, doc.querySelector('title').innerHTML)) {
          removeTitle = true;
        }
      } catch (_) {}
    })();
  }

  /**
   * _createIterator
   *
   * @param  {Document} root document/fragment to create iterator for
   * @return {Iterator} iterator instance
   */
  var _createIterator = function _createIterator(root) {
    return createNodeIterator.call(root.ownerDocument || root, root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, function () {
      return NodeFilter.FILTER_ACCEPT;
    }, false);
  };

  /**
   * _isClobbered
   *
   * @param  {Node} elm element to check for clobbering attacks
   * @return {Boolean} true if clobbered, false if safe
   */
  var _isClobbered = function _isClobbered(elm) {
    if (elm instanceof Text || elm instanceof Comment) {
      return false;
    }

    if (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function' || typeof elm.namespaceURI !== 'string') {
      return true;
    }

    return false;
  };

  /**
   * _isNode
   *
   * @param  {Node} obj object to check whether it's a DOM node
   * @return {Boolean} true is object is a DOM node
   */
  var _isNode = function _isNode(object) {
    return (typeof Node === 'undefined' ? 'undefined' : _typeof(Node)) === 'object' ? object instanceof Node : object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string';
  };

  /**
   * _executeHook
   * Execute user configurable hooks
   *
   * @param  {String} entryPoint  Name of the hook's entry point
   * @param  {Node} currentNode node to work on with the hook
   * @param  {Object} data additional hook parameters
   */
  var _executeHook = function _executeHook(entryPoint, currentNode, data) {
    if (!hooks[entryPoint]) {
      return;
    }

    arrayForEach(hooks[entryPoint], function (hook) {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  };

  /**
   * _sanitizeElements
   *
   * @protect nodeName
   * @protect textContent
   * @protect removeChild
   *
   * @param   {Node} currentNode to check for permission to exist
   * @return  {Boolean} true if node was killed, false if left alive
   */
  // eslint-disable-next-line complexity
  var _sanitizeElements = function _sanitizeElements(currentNode) {
    var content = void 0;

    /* Execute a hook if present */
    _executeHook('beforeSanitizeElements', currentNode, null);

    /* Check if element is clobbered or can clobber */
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }

    /* Check if tagname contains Unicode */
    if (stringMatch(currentNode.nodeName, /[\u0080-\uFFFF]/)) {
      _forceRemove(currentNode);
      return true;
    }

    /* Now let's check the element's type and name */
    var tagName = stringToLowerCase(currentNode.nodeName);

    /* Execute a hook if present */
    _executeHook('uponSanitizeElement', currentNode, {
      tagName: tagName,
      allowedTags: ALLOWED_TAGS
    });

    /* Take care of an mXSS pattern using p, br inside svg, math */
    if ((tagName === 'svg' || tagName === 'math') && currentNode.querySelectorAll('p, br').length !== 0) {
      _forceRemove(currentNode);
      return true;
    }

    /* Remove element if anything forbids its presence */
    if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
      /* Keep content except for bad-listed elements */
      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName] && typeof currentNode.insertAdjacentHTML === 'function') {
        try {
          var htmlToInsert = currentNode.innerHTML;
          currentNode.insertAdjacentHTML('AfterEnd', trustedTypesPolicy ? trustedTypesPolicy.createHTML(htmlToInsert) : htmlToInsert);
        } catch (_) {}
      }

      _forceRemove(currentNode);
      return true;
    }

    /* Remove in case a noscript/noembed XSS is suspected */
    if (tagName === 'noscript' && regExpTest(/<\/noscript/i, currentNode.innerHTML)) {
      _forceRemove(currentNode);
      return true;
    }

    if (tagName === 'noembed' && regExpTest(/<\/noembed/i, currentNode.innerHTML)) {
      _forceRemove(currentNode);
      return true;
    }

    /* Convert markup to cover jQuery behavior */
    if (SAFE_FOR_JQUERY && !_isNode(currentNode.firstElementChild) && (!_isNode(currentNode.content) || !_isNode(currentNode.content.firstElementChild)) && regExpTest(/</g, currentNode.textContent)) {
      arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
      if (currentNode.innerHTML) {
        currentNode.innerHTML = stringReplace(currentNode.innerHTML, /</g, '&lt;');
      } else {
        currentNode.innerHTML = stringReplace(currentNode.textContent, /</g, '&lt;');
      }
    }

    /* Sanitize element content to be template-safe */
    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
      /* Get the element's text content */
      content = currentNode.textContent;
      content = stringReplace(content, MUSTACHE_EXPR$$1, ' ');
      content = stringReplace(content, ERB_EXPR$$1, ' ');
      if (currentNode.textContent !== content) {
        arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
        currentNode.textContent = content;
      }
    }

    /* Execute a hook if present */
    _executeHook('afterSanitizeElements', currentNode, null);

    return false;
  };

  /**
   * _isValidAttribute
   *
   * @param  {string} lcTag Lowercase tag name of containing element.
   * @param  {string} lcName Lowercase attribute name.
   * @param  {string} value Attribute value.
   * @return {Boolean} Returns true if `value` is valid, otherwise false.
   */
  // eslint-disable-next-line complexity
  var _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
    /* Make sure attribute cannot clobber */
    if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
      return false;
    }

    /* Allow valid data-* attributes: At least one character after "-"
        (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
        XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
        We don't need to check the value; it's always URI safe. */
    if (ALLOW_DATA_ATTR && regExpTest(DATA_ATTR$$1, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$$1, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
      return false;

      /* Check value is safe. First, is attr inert? If so, is safe */
    } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$$1, stringReplace(value, ATTR_WHITESPACE$$1, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$$1, stringReplace(value, ATTR_WHITESPACE$$1, ''))) ; else if (!value) ; else {
      return false;
    }

    return true;
  };

  /**
   * _sanitizeAttributes
   *
   * @protect attributes
   * @protect nodeName
   * @protect removeAttribute
   * @protect setAttribute
   *
   * @param  {Node} currentNode to sanitize
   */
  // eslint-disable-next-line complexity
  var _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
    var attr = void 0;
    var value = void 0;
    var lcName = void 0;
    var idAttr = void 0;
    var l = void 0;
    /* Execute a hook if present */
    _executeHook('beforeSanitizeAttributes', currentNode, null);

    var attributes = currentNode.attributes;

    /* Check if we have attributes; if not we might have a text node */

    if (!attributes) {
      return;
    }

    var hookEvent = {
      attrName: '',
      attrValue: '',
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR
    };
    l = attributes.length;

    /* Go backwards over all attributes; safely remove bad ones */
    while (l--) {
      attr = attributes[l];
      var _attr = attr,
          name = _attr.name,
          namespaceURI = _attr.namespaceURI;

      value = stringTrim(attr.value);
      lcName = stringToLowerCase(name);

      /* Execute a hook if present */
      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
      _executeHook('uponSanitizeAttribute', currentNode, hookEvent);
      value = hookEvent.attrValue;
      /* Did the hooks approve of the attribute? */
      if (hookEvent.forceKeepAttr) {
        continue;
      }

      /* Remove attribute */
      // Safari (iOS + Mac), last tested v8.0.5, crashes if you try to
      // remove a "name" attribute from an <img> tag that has an "id"
      // attribute at the time.
      if (lcName === 'name' && currentNode.nodeName === 'IMG' && attributes.id) {
        idAttr = attributes.id;
        attributes = arraySlice(attributes, []);
        _removeAttribute('id', currentNode);
        _removeAttribute(name, currentNode);
        if (arrayIndexOf(attributes, idAttr) > l) {
          currentNode.setAttribute('id', idAttr.value);
        }
      } else if (
      // This works around a bug in Safari, where input[type=file]
      // cannot be dynamically set after type has been removed
      currentNode.nodeName === 'INPUT' && lcName === 'type' && value === 'file' && hookEvent.keepAttr && (ALLOWED_ATTR[lcName] || !FORBID_ATTR[lcName])) {
        continue;
      } else {
        // This avoids a crash in Safari v9.0 with double-ids.
        // The trick is to first set the id to be empty and then to
        // remove the attribute
        if (name === 'id') {
          currentNode.setAttribute(name, '');
        }

        _removeAttribute(name, currentNode);
      }

      /* Did the hooks approve of the attribute? */
      if (!hookEvent.keepAttr) {
        continue;
      }

      /* Work around a security issue in jQuery 3.0 */
      if (SAFE_FOR_JQUERY && regExpTest(/\/>/i, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }

      /* Take care of an mXSS pattern using namespace switches */
      if (regExpTest(/svg|math/i, currentNode.namespaceURI) && regExpTest(regExpCreate('</(' + arrayJoin(objectKeys(FORBID_CONTENTS), '|') + ')', 'i'), value)) {
        _removeAttribute(name, currentNode);
        continue;
      }

      /* Sanitize attribute content to be template-safe */
      if (SAFE_FOR_TEMPLATES) {
        value = stringReplace(value, MUSTACHE_EXPR$$1, ' ');
        value = stringReplace(value, ERB_EXPR$$1, ' ');
      }

      /* Is `value` valid for this attribute? */
      var lcTag = currentNode.nodeName.toLowerCase();
      if (!_isValidAttribute(lcTag, lcName, value)) {
        continue;
      }

      /* Handle invalid data-* attribute set by try-catching it */
      try {
        if (namespaceURI) {
          currentNode.setAttributeNS(namespaceURI, name, value);
        } else {
          /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
          currentNode.setAttribute(name, value);
        }

        arrayPop(DOMPurify.removed);
      } catch (_) {}
    }

    /* Execute a hook if present */
    _executeHook('afterSanitizeAttributes', currentNode, null);
  };

  /**
   * _sanitizeShadowDOM
   *
   * @param  {DocumentFragment} fragment to iterate over recursively
   */
  var _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
    var shadowNode = void 0;
    var shadowIterator = _createIterator(fragment);

    /* Execute a hook if present */
    _executeHook('beforeSanitizeShadowDOM', fragment, null);

    while (shadowNode = shadowIterator.nextNode()) {
      /* Execute a hook if present */
      _executeHook('uponSanitizeShadowNode', shadowNode, null);

      /* Sanitize tags and elements */
      if (_sanitizeElements(shadowNode)) {
        continue;
      }

      /* Deep shadow DOM detected */
      if (shadowNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(shadowNode.content);
      }

      /* Check attributes, sanitize if necessary */
      _sanitizeAttributes(shadowNode);
    }

    /* Execute a hook if present */
    _executeHook('afterSanitizeShadowDOM', fragment, null);
  };

  /**
   * Sanitize
   * Public method providing core sanitation functionality
   *
   * @param {String|Node} dirty string or DOM node
   * @param {Object} configuration object
   */
  // eslint-disable-next-line complexity
  DOMPurify.sanitize = function (dirty, cfg) {
    var body = void 0;
    var importedNode = void 0;
    var currentNode = void 0;
    var oldNode = void 0;
    var returnNode = void 0;
    /* Make sure we have a string to sanitize.
      DO NOT return early, as this will return the wrong type if
      the user has requested a DOM object rather than a string */
    if (!dirty) {
      dirty = '<!-->';
    }

    /* Stringify, in case dirty is an object */
    if (typeof dirty !== 'string' && !_isNode(dirty)) {
      // eslint-disable-next-line no-negated-condition
      if (typeof dirty.toString !== 'function') {
        throw typeErrorCreate('toString is not a function');
      } else {
        dirty = dirty.toString();
        if (typeof dirty !== 'string') {
          throw typeErrorCreate('dirty is not a string, aborting');
        }
      }
    }

    /* Check we can run. Otherwise fall back or ignore */
    if (!DOMPurify.isSupported) {
      if (_typeof(window.toStaticHTML) === 'object' || typeof window.toStaticHTML === 'function') {
        if (typeof dirty === 'string') {
          return window.toStaticHTML(dirty);
        }

        if (_isNode(dirty)) {
          return window.toStaticHTML(dirty.outerHTML);
        }
      }

      return dirty;
    }

    /* Assign config vars */
    if (!SET_CONFIG) {
      _parseConfig(cfg);
    }

    /* Clean up removed elements */
    DOMPurify.removed = [];

    /* Check if dirty is correctly typed for IN_PLACE */
    if (typeof dirty === 'string') {
      IN_PLACE = false;
    }

    if (IN_PLACE) ; else if (dirty instanceof Node) {
      /* If dirty is a DOM element, append to an empty document to avoid
         elements being stripped by the parser */
      body = _initDocument('<!-->');
      importedNode = body.ownerDocument.importNode(dirty, true);
      if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
        /* Node is already a body, use as is */
        body = importedNode;
      } else if (importedNode.nodeName === 'HTML') {
        body = importedNode;
      } else {
        // eslint-disable-next-line unicorn/prefer-node-append
        body.appendChild(importedNode);
      }
    } else {
      /* Exit directly if we have nothing to do */
      if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT &&
      // eslint-disable-next-line unicorn/prefer-includes
      dirty.indexOf('<') === -1) {
        return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
      }

      /* Initialize the document to work on */
      body = _initDocument(dirty);

      /* Check we have a DOM node from the data */
      if (!body) {
        return RETURN_DOM ? null : emptyHTML;
      }
    }

    /* Remove first element node (ours) if FORCE_BODY is set */
    if (body && FORCE_BODY) {
      _forceRemove(body.firstChild);
    }

    /* Get node iterator */
    var nodeIterator = _createIterator(IN_PLACE ? dirty : body);

    /* Now start iterating over the created document */
    while (currentNode = nodeIterator.nextNode()) {
      /* Fix IE's strange behavior with manipulated textNodes #89 */
      if (currentNode.nodeType === 3 && currentNode === oldNode) {
        continue;
      }

      /* Sanitize tags and elements */
      if (_sanitizeElements(currentNode)) {
        continue;
      }

      /* Shadow DOM detected, sanitize it */
      if (currentNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(currentNode.content);
      }

      /* Check attributes, sanitize if necessary */
      _sanitizeAttributes(currentNode);

      oldNode = currentNode;
    }

    oldNode = null;

    /* If we sanitized `dirty` in-place, return it. */
    if (IN_PLACE) {
      return dirty;
    }

    /* Return sanitized string or DOM */
    if (RETURN_DOM) {
      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);

        while (body.firstChild) {
          // eslint-disable-next-line unicorn/prefer-node-append
          returnNode.appendChild(body.firstChild);
        }
      } else {
        returnNode = body;
      }

      if (RETURN_DOM_IMPORT) {
        /*
          AdoptNode() is not used because internal state is not reset
          (e.g. the past names map of a HTMLFormElement), this is safe
          in theory but we would rather not risk another attack vector.
          The state that is cloned by importNode() is explicitly defined
          by the specs.
        */
        returnNode = importNode.call(originalDocument, returnNode, true);
      }

      return returnNode;
    }

    var serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;

    /* Sanitize final string template-safe */
    if (SAFE_FOR_TEMPLATES) {
      serializedHTML = stringReplace(serializedHTML, MUSTACHE_EXPR$$1, ' ');
      serializedHTML = stringReplace(serializedHTML, ERB_EXPR$$1, ' ');
    }

    return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
  };

  /**
   * Public method to set the configuration once
   * setConfig
   *
   * @param {Object} cfg configuration object
   */
  DOMPurify.setConfig = function (cfg) {
    _parseConfig(cfg);
    SET_CONFIG = true;
  };

  /**
   * Public method to remove the configuration
   * clearConfig
   *
   */
  DOMPurify.clearConfig = function () {
    CONFIG = null;
    SET_CONFIG = false;
  };

  /**
   * Public method to check if an attribute value is valid.
   * Uses last set config, if any. Otherwise, uses config defaults.
   * isValidAttribute
   *
   * @param  {string} tag Tag name of containing element.
   * @param  {string} attr Attribute name.
   * @param  {string} value Attribute value.
   * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
   */
  DOMPurify.isValidAttribute = function (tag, attr, value) {
    /* Initialize shared config vars if necessary. */
    if (!CONFIG) {
      _parseConfig({});
    }

    var lcTag = stringToLowerCase(tag);
    var lcName = stringToLowerCase(attr);
    return _isValidAttribute(lcTag, lcName, value);
  };

  /**
   * AddHook
   * Public method to add DOMPurify hooks
   *
   * @param {String} entryPoint entry point for the hook to add
   * @param {Function} hookFunction function to execute
   */
  DOMPurify.addHook = function (entryPoint, hookFunction) {
    if (typeof hookFunction !== 'function') {
      return;
    }

    hooks[entryPoint] = hooks[entryPoint] || [];
    arrayPush(hooks[entryPoint], hookFunction);
  };

  /**
   * RemoveHook
   * Public method to remove a DOMPurify hook at a given entryPoint
   * (pops it from the stack of hooks if more are present)
   *
   * @param {String} entryPoint entry point for the hook to remove
   */
  DOMPurify.removeHook = function (entryPoint) {
    if (hooks[entryPoint]) {
      arrayPop(hooks[entryPoint]);
    }
  };

  /**
   * RemoveHooks
   * Public method to remove all DOMPurify hooks at a given entryPoint
   *
   * @param  {String} entryPoint entry point for the hooks to remove
   */
  DOMPurify.removeHooks = function (entryPoint) {
    if (hooks[entryPoint]) {
      hooks[entryPoint] = [];
    }
  };

  /**
   * RemoveAllHooks
   * Public method to remove all DOMPurify hooks
   *
   */
  DOMPurify.removeAllHooks = function () {
    hooks = {};
  };

  return DOMPurify;
}

var purify = createDOMPurify();

const inner = (content) => {
  if (!content) {
    return html$2`
      ${nothing}
    `;
  }

  return html$2`
    ${unsafeHTML(purify.sanitize(content))}
  `;
};

class LifSpan extends Mixin(LitElement) {

  
  static get properties() {
    return {
      
      ...super.properties,

      /*
       * `defaultValue` value to display when no data
       */
      defaultValue: {
        type: String,
        attribute: 'default-value'
      },

      /*
       * `loadingValue` value to display when loading
       */
      loadingValue: {
        type: String,
        attribute: 'loading-value'
      },

      errorValue: {
        type: String, 
        attribute: 'error-value'
      },

      value: {
        type: String
      },

      exists: {
        type: Boolean
      },

      loading: {
        type: Boolean
      },

      /*
       * a `format` taking value as parameter
       */
      format: {
        type: Function
      },

      /*
       * `inner` when true, inject hml
       */
      inner: {
        type: Boolean,
      },

      /*
       * `asyncValue` event to dispach when value changes.
       * When true, dispatch a 'async-value' event
       * 
       * This is useful when lif-span is used in lists and the value 
       * changes async. We need a mechanism to reflect the change
       * on selected value
       */
      asyncValue: {
        type: Boolean,
        attribute: 'async-value'
      },


    }
  }

  // Note(cg): we want to render value in light dom so that 
  // textContent work on parent elements.
  createRenderRoot() {
    return this;
  }

  render() {
    return this.loading ? 
        html$2 `<span part="loading">${this.loadingValue}</span>` :
        this.exists ?  this.renderValue() : html$2 `<span part="default">${this.defaultValue}</span>`;
  }

  renderValue() {
    return this.inner ? inner(this.format(this.value)) : html$2 `<span part="value">${this.format(this.value)}</span>`;
  }

  constructor() {
    super();
    this.format = (value) => value;
    this.defaultValue = '';
    this.errorValue = '⚠';
    this.inner = false;
    this.loadingValue = '...';
  }

  disconnectedCallback() {
    if (this.ref) {
      this.ref.off('value', this.onValue, this);
    }
    super.disconnectedCallback();
  }

  update(props) {
    this.log && console.info('update document props', props.keys());
    if (props.has('ref')) {
      this.__setRef(this.ref, props.get('ref'));
    }
    super.update(props);
  }

  __setRef(ref, old) {
    if (old) {
      this.__remote = undefined;
      this.value = undefined;
      old.off('value', this.onValue, this);
    }
    if (ref) {
      this.loading = true;
      this.exists = null;
      this.value = undefined;
      ref.on('value', this.onValue, this.onError, this);
    }
  }

  async onValue(snap) {
    this.__remote = snap.val();
    this.loading = false; 
    this.log && console.info('data from db', this.__remote); 
    if (Object(this.__remote) === this.__remote) {
      this.log && console.warn('expecting a primitive, got an object', this.path);
      this.value = this.errorValue;
      return;
    }
    this.value = this.__remote;
    this.exists = this.__remote !== null;
    this.dispatchValue();
    if (this.asyncValue) {
      await this.updateComplete;
      this.dispatchEvent(new CustomEvent('async-value', {bubbles: true, composed: true})); 
    }
  }
}
customElements.define('lif-span', LifSpan);

/**
 * Displays an image for a user
 */
class PwiUserImg extends LitElement {

  static get styles() {
    return css `
    :host {
       display: inline-flex;
    }

    img {
      border: solid white 2px;
      height: var(--pwi-user-img-size, 40px);
      width: var(--pwi-user-img-size, 40px);
      display: inline-block;
      background-color: var(--pwi-user-img-color, #dadce0)
      border-radius: 50%;
      flex-shrink: 0;
      margin: -2px;
      
      object-fit: cover;
      overflow: hidden;
      max-width: 100%;
      vertical-align: middle;
      filter: grayscale(60%);
    }

    [part=photo] {
      border: solid white 2px;
      border-radius: 50%;
      height: var(--pwi-user-img-size, 40px);
      width: var(--pwi-user-img-size, 40px);
      overflow: hidden;
      position: relative;
    }
    `;
  }

  static get properties() {
    return {

      ...super.properties,

      /*
       * `uid` the user ID
       */
      uid: {
        type: String,
      },

      /*
       * `displayName` used name
       */
      displayName: {
        type: String,
      },

      /*
       * `photoURL` 
       */
      photoURL: {
        type: String,
      },

      /*
       * `gravatarURL` 
       */
      gravatarURL: {
        type: String,
      },
      /*
       * `gravatarType` 
       */
      gravatarType: {
        type: String,
      },
      /*
       * `gravatarSize` 
       */
      gravatarSize: {
        type: String,
      }
    };
  }

  // render() {
  //   return html`
  //    <h3>COUCOU</h3>
  //   `;
  // }

  render() {
    return html$2 `
      <lif-document @data-changed="${this.setPhotoURL}" .path="${this.photoPath}"></lif-document>
      <lif-document @data-changed="${e => this.displayName = e.detail.value}" .path="${this.namePath}"></lif-document>
      ${this.photoURL ? html$2`<div part="photo"><img src="${this.photoURL}" loading="lazy" alt="${this.displayName}"></div>` :''}
    `;
  }

  constructor() {
    super();
    this.gravatarURL = 'https://www.gravatar.com/avatar';
    this.gravatarType = 'mm';

  }

  setPhotoURL(e) {
    if (e && e.detail.value) {
      this.photoURL = e.detail.value;
      return;
    }
    this.photoURL = `${this.gravatarURL}/${this.uid}?d=${this.gravatarType}${this.gravatarSize ? ('size=' + this.gravatarSize) : ''}`;
  }

  get photoPath() {
    return `/userData/profile/${this.uid}/photoURL`;
  }
  get namePath() {
    return `/userData/profile/${this.uid}/displayName`;
  }
}
customElements.define('pwi-user-img', PwiUserImg);

// import { css } from 'lit-element';
// import { themeColor, themeTag } from '../style/index.js';

class PwiProgram extends LifSpan {

  static get properties() {
    return {

      ...super.properties,

      /*
       * `language` 
       */
      language: {
        type: String,
      },

      prid: {
        type: String,
      }

    };

  }

  constructor() {
    super();
    this.language = 'en';
    this.defaultValue = 'this program';

    // this.addEventListener('click', this._onClick);
  }

  updated(props) {
    if (props.has('prid') || props.has('language') ) {
      this.setPath();
    }
    super.updated(...arguments);
  }

  setPath() {
    if (this.prid) {
      this.path = `/programData/profile/${this.prid}/title`;
    }
  }

  // _onClick(e) {
  //   // Note(cg): we allow to clic on a widget-resource and listen to this event higher up
  //   // We can potentially ask is we want to edit the resource.
  //   this.dispatchEvent(new CustomEvent('resource-tap', {
  //     detail: {
  //       resourceType: this.resourceType,
  //       resourceId: this.resourceId,
  //       state: this.state,
  //       language: this.language,
  //       title: this.value
  //     },
  //     bubbles: true,
  //     composed: true
  //   }));
  // }

}
customElements.define('pwi-program', PwiProgram);

class PwiDateFormat extends LitElement {


  // Note(cg): we want to render value in light dom so that 
  // textContent work on parent elements.
  createRenderRoot() {
    return this;
  }

  static get properties() {
    return {

      /*
       * `date` 
       */
      date: {
        type: String,
      },

      options: {
        type: Object
      },

      locale: {
        type: String
      },

      /*
       * `interval` when date - now small smaller that interval,
       * we display a longer format
       */
      interval: {
        type: Number,
      },

    };
  }

  constructor() {
    super();
    this.options = { year: 'numeric', month: 'short', day: 'numeric' };
    this.interval = 1000 * 60 * 60 * 12; //12 hours.
  }

  render() {
    return html$2 `
      <span>${this.formatDate(this.date)}</span>
    `;
  }

  formatDate(date) {
    if (date) {
      try {
        const now = new Date();
        const d = new Date(date);
        return (now - d) < this.interval ? d.toLocaleTimeString(this.locale) : d.toLocaleDateString(this.locale, this.options);
      } catch (e) {
        return date;
      }
    }
    return '';
  }
}

// Register the new element with the browser.
customElements.define('pwi-date-format', PwiDateFormat);

class PwiMd extends LitElement {

  static get properties() {
    return {

      /*
       * `md` markdown to render
       */
      md: {
        type: String,
      },

      mdConfig: {
        type: Object
      }
    };
  }

  render() {
    return html$2 `<div class="markdown">${parse(this.md, this.mdConfig)}</div>`;
  }

  constructor() {
    super();
    // this.mdConfig = {ADD_ATTR: ['target', 'width', 'height']};
  }

  // Note(cg): we want to render value in light dom so that
  // textContent work on parent elements.
  createRenderRoot() {
    return this;
  }
}
customElements.define('pwi-md', PwiMd);

/**
 * am element rendering marksown straight from firebase
 */

class PwiLifMd extends LifSpan {

  renderValue() {
    return html$2 `<div class="value">${parse(this.format(this.value))}</div>`;
  }
}

customElements.define('pwi-lif-md', PwiLifMd);

var locale$3 = {
  email: 'e-mail',
  password: 'password',
  forgotPsw: 'I forgot my password',
  signIn: 'sign-in',
  signInWith: 'Sign-in with ',
  signUp: 'sign-up',
  signingIn: 'signing-in',
  signingUp: 'signing-up',
  orSignUpWith: 'Or sign-up-with',
  createAccount: 'create account',
  createAnAccount: 'Create an account',
  continueAsGuest: 'continue as guest',
  signInInProcess: 'signing in progress',
  or: 'or',
  backToApp: 'back to app',
  backToSignIn: 'Back to sign-in',
  firstName: 'first name',
  firstNameHelp: 'name under which you will appear in the application',

};

class PwiLogIn extends EnableTranslation(LitElement, locale$3) {

  static get styles() {
    return [styleTypography, css `
        :host {
          display: block;
        }
        #sign-in, #sign-up {
          margin-left: auto;
          margin-right: auto;
          max-width: 320px;
          width: 100%;
        }

        #sign-up {
          max-width: 480px;
        }
        #sign-in {
          max-width: 300px;
        }

       .button-container {
          display: flex;
          flex-wrap: wrap;
          flex-direction: row;
          align-items: baseline;
        }

        pwi-textfield {
          margin-bottom: var(--space-small, 12px);
          width: 100%;
        }

        mwc-button {
          margin-bottom: var(--space-medium, 20px);
        }

        .accent {
          --mdc-theme-primary: var(--color-accent);
        }

        .button-container mwc-button, .button-container div {
          flex: 1;
        }
        .button-container span { 
          margin-left: var(--space-medium, 12px);
          margin-right: var(--space-medium, 12px);
        }

         .progress {
          --mdc-circular-progress-bar-color-1: var(--color-primary-background);
          --mdc-circular-progress-bar-color-2: var(--primary-color);
          --mdc-circular-progress-bar-color-3: var(--primary-color);
          --mdc-circular-progress-bar-color-4: var(--color-primary-background);
          position: absolute;
          left: 14px;
          top: 5px;
        }
       
        h2 {
          color: var(--dark-primary-color);
          font-size: 30px;
          font-weight: 100;
          margin-top: 0;
          margin-bottom: 0;
        }

        a {
          text-decoration: none;
        }

        .error-message, .info-message {
          text-align: center; 
          margin-bottom: var(--space-x-small);
          cursor: pointer;
        }

        .error-message {
          color: var(--color-error);
        }

        .info-message {
          color: var(--accent-color);
        }

        .info-message a {
          color: var(--accent-color);
          text-decoration: underline;
        }

        .back {
          position: fixed;
          right: 10px;
          bottom: 0;
        }

        .break {
          width: 100%;
          border-top: solid var(--divider-color) 1px;
          margin-bottom: var(--space-medium, 20px);
        }

     @media (max-width: 600px) {

      #sign-up {
       max-width: 320px;
      }
      .button-container mwc-button {
        flex-basis: 100%;
      }
      .button-container span, .button-container div {
        display: none;
      }

      .break {
        border-top: none;
        margin-bottom: var(--space-small);   
      }
       
      pwi-textfield {
        margin-bottom: var(--space-xx-small, 4px);
      }

      mwc-button {
        margin-top: var(--space-xx-small, 4px);
        margin-bottom: var(--space-xx-small, 4px);
      }

      a.back {
        position: static;
        text-align: right;
      }
    }
    `];
  }

  static get properties() {
    return {
      ...super.properties,

      /*
       * `isSignUp` true when signing-up
       * default: false
       */
      isSignUp: {
        type: Boolean,
        attribute: 'is-sign-up'
      },

      /*
       * `email`
       */
      email: {
        type: String,
      },

      /*
       * `password`
       */
      password: {
        type: String,
      },

      /*
       * `displayName`
       */
      displayName: {
        type: String,
      },

      /*
       * `errorMsg` the error message to display
       */
      errorMsg: {
        type: String,
      },

      /*
       * `successMsg`
       */
      successMsg: {
        type: String,
      },

      /*
       * `signingIn`  flag to know if this element is siging in. It is also user to check whether we need to activate redirection stuff
       */
      signingIn: {
        type: Boolean,
      },

      /**
       * `onlyLogin` flag to set that we only authorize login stuff (and not account creation)
       */
      onlyLogin: {
        type: Boolean,
        attribute: 'only-login'
      },

      /*
       * `enableBack` flag to enable `window.history.back()` once a user is signed-in
       */
      enableRedirect: {
        type: Boolean,
        attribute: 'enable-redirect'
      },

      /*
       * `hideSocial` true to hide social buttons
       */
      hideSocial: {
        type: Boolean,
        attribute: 'hide-social'
      },

      /*
       * `allowAnonynous` true to allow anonymous accounts
       */
      allowAnonymous: {
        type: Boolean,
        attribute: 'allow-anonymous'
      },

      /*
       * `queryParams`handle query params like: 
       * email, view
       */
      queryParams: {
        type: Object,
      },

    };
  }

  render() {
    return this.isSignUp ? this.renderSignUp() : this.renderSignIn();
  }

  renderError() {
    return this.errorMsg ? html$2 `<div class="error-message">${this.errorMsg}</div>` : nothing;
  }
  renderSuccess() {
    return this.successMsg ? html$2 `<div class="info-message">${this.successMsg}</div>` : nothing;
  }
  renderForScreenReader(test, content) {
    return test ? html$2 `<div style="height: 0px; line-height: 0; opacity: 0;">${content}</div>` : nothing;
  }
  renderSocial(text) {
    return html$2 `
      <div class="break "></div>
      <div>
        <span class="label">${text}</span>
      </div>
      <div class="social  button-container">
        <mwc-button @click="${this.loginHandler}" class="accent-paint" data-provider="google" outlined label="google">
          <iron-icon slot="icon" icon="social-post:gplus"></iron-icon>
        </mwc-button>
        <span></span>
        <mwc-button @click="${this.loginHandler}" class="accent-paint" data-provider="facebook" label="facebook" outlined>
          <iron-icon slot="icon" icon="social-post:facebook"></iron-icon>
        </mwc-button>
      </div>`;

    // <!--mwc-button @click="${this.loginHandler}" data-provider="twitter" label="twitter" outlined disabled>
    //   <iron-icon slot="icon" icon="social-post:twitter"><
    // </mwc-button>-->
  }


  renderSignIn() {
    return html$2 `
      <div id="sign-in" class="content">
        <form>
          <pwi-textfield autocomplete="username" .value="${this.email}" @input="${e => this.email = e.currentTarget.value}" .label="${this.translate('email')}" type="email" name="username"></pwi-textfield>
          <pwi-textfield autocomplete="password" .value="${this.password}" @input="${e => this.password = e.currentTarget.value}" .label="${this.translate('password')}" name="password" type="password"></pwi-textfield>
        </form>
        <div aria-live="polite">
          ${this.renderError()}
          ${this.renderSuccess()}
          ${this.renderForScreenReader(this.signingIn, html$2`<span>${this.translate('signingIn')}</span>`)}
        </div>
        <div aria-live="assertive">
          ${this.errorMsg !== '' && this.email !== ''
            ? html$2 `<mwc-button @click="${this.resetPasswordHandler}" icon="contact_mail" label="${this.translate('forgotPsw')}" class="accent" raised></mwc-button>`
            : nothing
          }
        </div>
        <div class="button-container">
          <mwc-button id="login-button" label="${this.translate('signIn')}" ?disabled="${!(this.email && this.password)}" data-provider="password" class="accent" @click="${this.loginHandler}" raised>
            <mwc-icon slot="icon">person</mwc-icon>
            <mwc-circular-progress-four-color slot="icon" aria-label="${this.translate('signInInProcess')}" density="-5" class="progress" ?closed="${!this.signingIn}" indeterminate></mwc-circular-progress-four-color>
          </mwc-button>
          ${
            this.onlyLogin ? nothing : html$2`
              <span> ${this.translate('or')} </span>
              <mwc-button icon="person_add" label="${this.translate('signUp')}" raised @click="${e => this.isSignUp = true}"></mwc-button>
            `
          }
        </div>
        ${this.hideSocial ? nothing : this.renderSocial(html$2`<span>${this.translate('signInWith')}</span>`)}
        ${this.enableRedirect && !this.onlyLogin
          ? html$2`
            <a href="/main/home" class="back" title="${this.translate('backToApp')}">
            <mwc-button outlined icon="exit_to_app" label="${this.translate('backToApp')}" trailingIcon></mwc-button>
          </a>
          ` : nothing
        }
      </div>
    `;
  }

  renderSignUp() {
    return html$2 `
      <div id="sign-up" class="content">
        <h2>${this.translate('createAnAccount')}</h2>
        <form>
          <pwi-textfield autocomplete="username" .value="${this.email}" @input="${e => this.email = e.currentTarget.value}" .label="${this.translate('email')}" type="email" name="username" ></pwi-textfield>
          <pwi-textfield autocomplete="password" .value="${this.password}" @input="${e => this.password = e.currentTarget.value}" .label="${this.translate('password')}" name="password" type="password"></pwi-textfield>
          <pwi-textfield autocomplete="name" .value="${this.displayName}" @input="${e => this.displayName = e.currentTarget.value}" .label="${this.translate('firstName')}" .helper="${this.translate('firstNameHelp')}"></pwi-textfield>
        </form>
        <div aria-live="polite">
            ${this.renderError()}
            ${this.renderSuccess()}
            ${this.renderForScreenReader(this.signingIn, html$2`<span>${this.translate('signingUp')}</span>`)}
        </div>
        <div class="button-container">
          <mwc-button icon="person_add" @click="${this.createUserHandler}" label="${this.translate('createAccount')}" raised></mwc-button>
          ${this.allowAnonymous
            ? html$2`<span>${this.translate('or')}</span><mwc-button @click="${this.loginHandler}" icon="person_outline" data-provider="anonymous" raised label="${this.translate('continueAsGuest')}"></mwc-button>`
            : html$2`<div></div>`}
        </div>
        ${this.hideSocial ? nothing : this.renderSocial(html$2`<span>${this.translate('orSignUpWith')}</span>`)}
        <div class="break "></div>
        <div class="button-container">
          <div></div>
          <span></span>
          <mwc-button @click="${e => this.isSignUp = false}" label="${this.translate('backToSignIn')}" icon=""></mwc-button>
        </div>
    `;
  }

  constructor() {
    super();
    this.isSignUp = false;
    this.signingIn = false;
    this.onlyLogin = false;
    this.hideSocial = false;
    this.allowAnonymous = false;
    this.enableRedirect = false;
    this._resetData();

    this.addEventListener('keydown', this._handleKeydown);
  }

  _handleKeydown(e) {
    if (e.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      return e.stopPropagation();
    }
    if (e.key === 'Enter') {
      if (this.isSignUp) {
        return this.createUserHandler();
      }
      this.loginHandler();
    }
  }
  _resetData() {
    this.email = '';
    this.password = '';
    this.displayName = '';
    this._resetMessage();
  }

  _resetMessage() {
    this.errorMsg = '';
    this.successMsg = '';
  }

  updated(props) {
    if (props.has('queryParams') && this.queryParams) {
      if (this.queryParams.email) {
        this.email = this.queryParams.email;
      }
      if (this.queryParams.view) {
        this.isSignUp = this.queryParams.view === 'sign-up';
      }
      if (this.queryParams.hideSocial) {
        this.hideSocial = true;
      }
      this.queryParams = null;
    }
    if (props.has('isSignUp')) {
      this._resetMessage();
    }
    super.updated(props);
  }
  // Note(cg): callback when success.
  onSuccessCallback(message) {
    this.signingIn = false;
    this.errorMsg = '';
    this.successMsg = message;
    this._checkRedirect();
  }

  // Note(cg): callback when error.
  onErrorCallback(error) {
    this.signingIn = false;
    this.successMsg = '';
    this.errorMsg = `Error:  ${error.message}`;
  }

  _checkRedirect() {
    if (this.enableRedirect) {
      if (app.backRoute) {
        this.resetLocation(app.backRoute);
        app.backRoute = null;

        // force a repaint because the header is not shown sometimes
        document.body.style.webkitTransform = 'scale(1)';
        document.body.style.webkitTransform = null;
      } else if (!document.referrer) {
        // Note(cg): this is happening when we launch the app on /login.
        this.resetLocation();
      } else {
        window.history.back();
      }
    }
  }

  resetLocation(path) {
    path = path || '/main/home';
    window.history.pushState({}, '', path);
    window.dispatchEvent(new CustomEvent('location-changed'));
  }
  /*
   * HANDLERS
   */

  loginHandler(e) {
    this.signingIn = true;
    this.provider = e && e.currentTarget && e.currentTarget.dataset.provider || 'password';
    this.dispatchEvent(new CustomEvent('auth-sign-in', {
      detail: {
        provider: this.provider,
        email: this.email,
        password: this.password,
        successCallback: this.onSuccessCallback.bind(this),
        errorCallback: this.onErrorCallback.bind(this),
      },
      bubbles: true,
      composed: true
    }));
  }

  resetPasswordHandler(e) {
    if (this.email) {
      this.dispatchEvent(new CustomEvent('auth-reset-email', {
        detail: {
          provider: this.provider,
          email: this.email,
          successCallback: () => {
            this.successMsg = `reset password email sent to ${this.email}!`;
          },
          errorCallback: this.onErrorCallback.bind(this),
        },
        bubbles: true,
        composed: true
      }));
    }
  }

  createUserHandler(e) {
    if (this.email && this.password) {
      const displayName = this.displayName || this.email.replace(/@.*/, '');
      this.provider = 'password';

      this.dispatchEvent(new CustomEvent('auth-sign-up', {
        detail: {
          provider: this.provider,
          email: this.email,
          displayName: displayName,
          password: this.password,
          successCallback: () => {
            this.successMsg = `Success: new user ${displayName} created!`;
            setTimeout(() => { this.selected = 0; }, 200);
            setTimeout(() => { this._checkRedirect(); }, 500);
          },
          errorCallback: this.onErrorCallback.bind(this),
        },
        bubbles: true,
        composed: true
      }));
    }
  }
}

// Register the new element with the browser.
customElements.define('pwi-log-in', PwiLogIn);

class PwiResource extends LifSpan {

  static get properties() {
    return {

      ...super.properties,

      /*
       * `language` 
       */
      language: {
        type: String,
      },

      /*
       * `property` the property to display 
       * default is 'title'
       */
      property: {
        type: String,
      },

      resourceType: {
        type: String,
        attribute: 'resource-type'
      },

      resourceId: {
        type: String,
        attribute: 'resource-id'
      },

      state: {
        type: String
      }


    };

  }

  constructor() {
    super();
    this.language = 'en';
    this.property = 'title';
    this.state = 'published';
    this.defaultValue = 'this resource';

    this.addEventListener('click', this._onClick);
  }

  updated(props) {
    if (props.has('resourceType') || props.has('resourceId') || props.has('language') || props.has('property') || props.has('state')) {
      this.setPath();
    }
    super.updated(...arguments);
  }

  setPath() {
    if (this.property && this.resourceId && this.resourceType && this.language) {
      this.path = `/resources/${this.state}/${this.resourceType}/${this.resourceId}/${this.property}`;
    }
  }

  _onClick(e) {
    // Note(cg): we allow to clic on a widget-resource and listen to this event higher up
    // We can potentially ask is we want to edit the resource.
    this.dispatchEvent(new CustomEvent('resource-tap', {
      detail: {
        resourceType: this.resourceType,
        resourceId: this.resourceId,
        state: this.state,
        language: this.language,
        title: this.value
      },
      bubbles: true,
      composed: true
    }));
  }

}
customElements.define('pwi-resource', PwiResource);

// Note(cg): Create sub classes
const config = {
  question: {
    property: 'label'
  },
  section: {
    property: 'label'
  }
};

['form', 'report', 'survey', 'question', 'section', 'machine', 'notification'].forEach(name => {
  class PwiResourceName extends PwiResource {
    constructor() {
      super();
      this.resourceType = name;
      this.defaultValue = `this ${name}`;
      if (config[name]) {
        Object.assign(this, config[name]);
      }
    }
  }
  customElements.define(`pwi-resource-${name}`, PwiResourceName);
});

// import { css } from 'lit-element';

class PwiResourceLocale extends PwiResource {

  setPath() {
    if (this.property && this.resourceId && this.resourceType && this.language) {
      this.path = `/locale/${this.state}/${this.resourceType}/${this.language}/${this.resourceId}/${this.property}`;
    }
  }
}
customElements.define('pwi-resource-locale', PwiResourceLocale);

// Note(cg): Create sub classes
const config$1 = {
  question: {
    property: 'label'
  },
  section: {
    property: 'label'
  }
};

['form', 'report', 'survey', 'question', 'section', 'machine', 'notification'].forEach(name => {
  class PwiResourceName extends PwiResourceLocale {
    constructor() {
      super();
      this.resourceType = name;
      this.defaultValue = `this ${name}`;
      if (config$1[name]) {
        Object.assign(this, config$1[name]);
      }
    }
  }
  customElements.define(`pwi-resource-locale-${name}`, PwiResourceName);
});

/*
 # tooltip
 show a tooltip over an element

 ## example
 `<pwi-tooltip message="this is the tooltip`>hover me</pwi-tooltip>

  @csspart tooltip
  @csspart message
  @csspart heading
  @csspart outline

  @cssprop --pwi-tooltip-border-radius - tooltip header readius
  @cssprop --pwi-tooltip-background-color - tooltip background color
  @cssprop --pwi-tooltip-decoration-color - color used for highlighting tooltip target (underline, outline)
  @cssprop --pwi-tooltip-color - tooltip text color
  @cssprop --pwi-tooltip-font-weight
  @cssprop --pwi-tooltip-font-size
  @cssprop --pwi-tooltip-line-height
  @cssprop --pwi-tooltip-padding
 */
class PwiTooltip extends LitElement {

  static get styles() {
    return [styleTypography, css `
    /**
     * @prop --hide-delay: The amount of time to wait before hiding the tooltip.
     * @prop --hide-duration: The amount of time the hide transition takes to complete.
     * @prop --hide-timing-function: The timing function (easing) to use for the hide transition.
     * @prop --max-width: The maximum width of the tooltip.
     * @prop --show-delay: The amount of time to wait before showing the tooltip.
     * @prop --show-duration: The amount of time the show transition takes to complete.
     * @prop --show-timing-function: The timing function (easing) to use for the show transition.
     * 
     * @prop --pwi-tooltip-border-radius: tooltip radius.
     * @prop --pwi-tooltip-background-color: color of background.
     * @prop --pwi-tooltip-decoration-color: color for icon and hover.
     * @prop --pwi-tooltip-color: text color.
     * @prop --pwi-tooltip-font-weight: 
     * @prop --pwi-tooltip-font-size: 
     * @prop --pwi-tooltip-line-height: 

     */
    :host {
      --max-width: 20rem;
      --hide-delay: 0s;
      --hide-duration: 0.1s;
      --hide-timing-function: ease;
      --show-delay: 0.1s;
      --show-duration: 0.1s;
      --show-timing-function: ease;
     
      display: inline-block;
      position: relative;
    }


    #outline {
      padding: 0 2px;
      border-radius: 2px;
      position: relative;
      margin-right: 13px;
    }
    
    #outline::after {
      content: "";
      position: absolute;
      background-color: var(--secondary-text-color);
      opacity: 0.1;
      inset: 0px;
      border-radius: 4px;
    }
    
     mwc-icon {
      --mdc-icon-size: 14px;
      color: var(--secondary-text-color);
      position: absolute;
      top: -3px;
      right: -12px;
    }

    #outline:hover, #outline:active, #outline:focus {
      outline: none;
      text-decoration: none;
    }
    
    #outline:hover mwc-icon, #outline:active mwc-icon, #outline:focus mwc-icon {
      color: var(--pwi-tooltip-decoration-color, var(--primary-color));
    }
    
    #outline:hover::after, #outline:active::after, #outline:focus::after {
      background-color: var(--pwi-tooltip-decoration-color, var(--primary-color));
      opacity: 0.25;
    }

    #tooltip {
      position: absolute;
      z-index: var(--z-index-popup);
      max-width: var(--max-width);
      border-radius: var(--pwi-tooltip-border-radius, var(--radius-default));
      background-color: var(--pwi-tooltip-background-color, var(--primary-text-color));
      font-family: var(--pwi-tooltip-font-family);
      font-size: var(--pwi-tooltip-font-size, var(--font-size-medium));
      font-weight: var(--pwi-tooltip-font-weight, var(--font-weight-normal));
      line-height: var(--pwi-tooltip-line-height, var(--line-height-small));
      opacity: 1;
      color: var(--pwi-tooltip-color,var(--color-primary-background));
      padding: var(--space-xx-small) var(--space-x-small);
      transform: scale(0.2);
      transform-origin: center;
      transition-property: opacity, transform;
      transition-delay: var(--hide-delay);
      transition-duration: var(--hide-duration);
      transition-timing-function: var(--hide-timing-function);
    }

    #tooltip[aria-hidden] {
      opacity: 0;
    }

    #tooltip.top {
        top: 0;
        left: 50%;
        transform: translate(-50%, calc(-100% - 0.6rem)) scale(0.2);
    }

    #tooltip.visible.top {
        transform: translate(-50%, calc(-100% - 0.6rem)) scale(1);
    }

    #tooltip.bottom {
        bottom: 0;
        left: 50%;
        transform: translate(-50%, calc(100% + 0.6rem)) scale(0.2);
    }

    #tooltip.visible.bottom {
      transform: translate(-50%, calc(100% + 0.6rem)) scale(1);
     }

    #tooltip.right {
        bottom: 50%;
        right: 0;
        transform: translate(calc(100% + 0.6rem), 50%) scale(0.2);
    }
    #tooltip.visible.right {
        transform: translate(calc(100% + 0.6rem), 50%) scale(1);
    }

    #tooltip.left {
        bottom: 50%;
        left: 0;
        transform: translate(calc(-100% - 0.6rem), 50%) scale(0.2);
    }

    #tooltip.visible.left {
        transform: translateX(calc(-100% - 0.6rem), 50%) scale(1);
    }

    #tooltip::before {
        background-color: var(--pwi-tooltip-background-color, var(--primary-text-color));
        content: ' ';
        
        position: absolute;
        width: 0.6rem;
        height: 0.6rem;
        z-index: var(--z-index-popup);
    }

    #tooltip.bottom::before {
        top: 0;
        left: 50%;
        transform: translate(-50%, calc(-100% + 0.4rem)) rotate(45deg);
    }

    #tooltip.top::before {
        bottom: 0;
        left: 50%;
        transform: translate(-50%, calc(100% - 0.4rem)) rotate(45deg);
    }

    #tooltip.left::before {
        top: 50%;
        right: 0;
        transform: translate(calc(100% - 0.4rem), -50%) rotate(45deg);
    }

    #tooltip.right::before {
        top: 50%;
        left: 0;
        transform: translate(calc(-100% + 0.4rem), -50%) rotate(45deg);
    }

    .buttons {
      margin: var(--space-xx-small) 0;
      text-align: center;
    }
    .heading {
      margin: var(--space-xx-small) 0;
      font-size: larger;
    }

    .message {

    }

    `];
  }
  static get properties() {
    return {
      heading: { type: String },
      message: { type: String },
      tipwidth: { type: String },
      /**
       * The preferred placement of the tooltip. Note that the actual placement may vary as needed to keep the tooltip
       * inside of the viewport  {'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end'  }
       */
      position: {
        type: String
      },
      fireonclick: { type: Boolean },
      _opened: { type: Boolean },
    };
  }

  render() {
    return html$2 `
      ${this.renderTooltip()}
        <span 
          id="outline"
          part="outline"
          aria-describedby="tooltip"
          tabindex="0"
          @keydown="${e => {e.code === 'Enter' || e.code === 'Space' ? this.toggleTooltip(e) : '';}}"
          @mouseover="${() => { this.fireonclick ? '' : this.showTooltip();}}"
          @mouseout="${() => { this.fireonclick ? '' : this.hideTooltip();}}"
          @click="${() => {this.fireonclick ? this.showTooltip() : '';}}">
          <slot></slot>
          <mwc-icon>info</mwc-icon>
        </span>
    `;
  }

  renderTooltip() {
    return html$2 `
      <div part="tooltip" 
        id="tooltip" 
        class="${this.position} ${this._opened ? 'visible' : ''}"  
        aria-hidden="${ifDefined(this._opened ? undefined : 'true')}"
        role="tooltip"  
        style="${`min-width: ${this.tipwidth}px;`}">
          ${this.heading ? html$2 `<header part="heading" class="heading">${this.heading}</header>` : nothing}
          <div part="message" class="message">${this.message}</div>
        ${this.fireonclick ? html$2 `<div class="buttons"><mwc-button label="close" dense unelevated @click="${this.toggleTooltip}"></mwc-button><div>` : nothing}
      </div>
    `;
  }

  constructor() {
    super();

    // property defaults
    this.position = 'top';
    this.tipwidth = 200;
    this.opened = false;
  }

  hideTooltip() {
    this._opened = false;
  }

  showTooltip() {
    this._opened = true;
  }

  toggleTooltip(e) {
    e && e.preventDefault(); // Note(cg): prevent Space to scroll down.
    this._opened = !this._opened;
  }
}

// Register the new element with the browser.
customElements.define('pwi-tooltip', PwiTooltip);

/*
  # tooltip loading its content from firebase
  

 */

class PwiFirebaseTooltip extends PwiTooltip {

  static get properties() {
    return {
      ...super.properties,

      /*
       * `path` database path
       */
      path: {
        type: String,
      },
      /*
       * `appName`
       */
      appName: {
        type: String,
        attribute: 'app-name'
      },

      /*
       * `loadingMessage` message appearing before
       * remote content was loaded
       */
      loadingMessage: {
        type: String,
      },
    };
  }

  constructor() {
    super();
    this.loadingMessage = 'loading remote tooltip ...';

  }

  render() {
    return html$2 `
      <lif-document path="${this.path}" .appName="${this.appName}" @data-changed="${e => this.message = parse(e.detail.value)}"></lif-document>
      ${super.render()}
    `;
  }

  firstUpdated(props) {
    if (!this.message && this.loadingMessage) {
      this.message = this.loadingMessage;
    }
    super.firstUpdated(props);
  }

}

// Register the new element with the browser.
customElements.define('pwi-firebase-tooltip', PwiFirebaseTooltip);

/*
  # tooltip loading its content from firebase
  path is calculated on the basis of term id
  

 */

class PwiFormTooltip extends PwiFirebaseTooltip {


  static get properties() {
    return {
      ...super.properties,

     /*
      * `resource` the resource object to get
      * context from. It can be a form or a section
      * path is calculated on that basis
      */
     resource: {
       type: Object,
     },

     /*
      * `term` the term id to get tooltip for
      */
     term: {
       type: String,
     },
    };
  }

  firstUpdated(props) {
    // Note(cg): form and sectionlisten to the event and will set resource in turn.
    this.dispatchEvent(new CustomEvent('form-tooltip-ready', {detail: {}, bubbles: true, composed: true})); 
    super.firstUpdated(props);
  }

  updated(props) {
    if (props.has('resource')) {
      this.setPath(this.resource, this.term);
    }
    super.updated(props);
  }

  setPath(resource, term) {
    if (resource && term) {
      if (resource.localName === 'form-container') {
        this.path = `/resourceDataLocale/${resource.isTest ? 'draft' : 'published'}/${resource.resourceId}/${resource.language}/glossary/${term}/definition`;
      }
      // TODO(cg): handle shared section.
      // if (resource.localeName === 'form-section') {
      //   this.path = `/resourceDataLocale/${resource.isTest ? 'draft' : 'published'}/${resource.resourceId}/${resource.language}/glossary/${term}/definition`
      // }
    }
  }
  

}

// Register the new element with the browser.
customElements.define('pwi-form-tooltip', PwiFormTooltip);

/**
 * A custom element similar to the HTML5 `<details>` element.
 *
 * @element expansion-panel
 *
 * @slot - Slot fot panel content
 * @slot header - Slot for panel header
 *
 * @attr {boolean} focused - State attribute set when element has focus.
 * @attr {boolean} focus-ring - State attribute set when focused from keyboard.
 *
 * @cssprop --panel-header-background - Default panel header background color.
 * @cssprop --panel-header-min-height - Panel header minimum height.
 * @cssprop --panel-ripple-background - Active toggle button ripple background.
 *
 * @csspart header - An element wrapping the `header` slot.
 * @csspart toggle - A toggle button, child of the header part.
 * @csspart content - An element wrapping the `content` slot.
 *
 * @fires opened-changed - Event fired when expanding / collapsing
 */
let ExpansionPanel = class ExpansionPanel extends LitElement {
    constructor() {
        super(...arguments);
        /**
         * When true, the panel content is expanded and visible
         */
        this.opened = false;
        /**
         * Disabled panel can not be expanded or collapsed
         */
        this.disabled = false;
        this._isShiftTabbing = false;
        this._tabPressed = false;
        this._boundBodyKeydown = this._onBodyKeydown.bind(this);
        this._boundBodyKeyup = this._onBodyKeyup.bind(this);
    }
    static get styles() {
        return css `
      :host {
        display: block;
        outline: none;
        color: rgba(0, 0, 0, 0.87);
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
          0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);

        --panel-header-background: #fff;
        --panel-header-min-height: 48px;
        --panel-ripple-background: rgba(0, 0, 0, 0.38);
      }

      :host([hidden]) {
        display: none !important;
      }

      [part='content'] {
        display: none;
        overflow: hidden;
        padding: 16px 24px 24px;
      }

      [part='header'] {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        position: relative;
        outline: none;
        min-height: var(--panel-header-min-height);
        padding: 0 24px;
        box-sizing: border-box;
        font-weight: 500;
        font-size: 13px;
        background-color: var(--panel-header-background);
        color: inherit;
        cursor: default;
        -webkit-tap-highlight-color: transparent;
      }

      :host([disabled]) [part='header'] {
        filter: brightness(75%);
        opacity: 0.75;
        pointer-events: none;
      }

      :host([opened]) [part='content'] {
        display: block;
        overflow: visible;
      }

      :host([focus-ring]) [part='header'] {
        filter: brightness(90%);
      }

      [part='header'] ::slotted(*) {
        margin: 12px 0;
      }

      [part='toggle'] {
        position: absolute;
        order: 1;
        right: 8px;
        width: 24px;
        height: 24px;
        padding: 4px;
        text-align: center;
        transform: rotate(45deg);
        transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 0.1);
      }

      [part='toggle']::before {
        width: 7px;
        position: absolute;
        height: 7px;
        left: 50%;
        top: 50%;
        content: '';
        border-width: 0 2px 2px 0;
        transform: translateX(-60%) translateY(-60%);
        border-style: solid;
        border-color: currentColor;
      }

      [part='toggle']::after {
        display: inline-block;
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: var(--panel-ripple-background);
        transform: scale(0);
        opacity: 0;
        transition: transform 0s 0.8s, opacity 0.8s;
        will-change: transform, opacity;
      }

      :host(:not([disabled])) [part='header']:active [part='toggle']::after {
        transition-duration: 0.08s, 0.01s;
        transition-delay: 0s, 0s;
        transform: scale(1.25);
        opacity: 0.15;
      }

      :host([opened]) [part='toggle'] {
        transform: rotate(225deg);
      }
    `;
    }
    render() {
        return html$2 `
      <div role="heading">
        <div
          role="button"
          part="header"
          @click="${this._onToggleClick}"
          @keydown="${this._onToggleKeyDown}"
          aria-expanded="${this.opened ? 'true' : 'false'}"
          tabindex="0"
        >
          <span part="toggle"></span>
          <slot name="header"></slot>
        </div>
      </div>
      <div
        part="content"
        style="${styleMap({ maxHeight: this.opened ? '' : '0px' })}"
        aria-hidden="${this.opened ? 'false' : 'true'}"
      >
        <slot></slot>
      </div>
    `;
    }
    connectedCallback() {
        super.connectedCallback();
        document.body.addEventListener('keydown', this._boundBodyKeydown, true);
        document.body.addEventListener('keyup', this._boundBodyKeyup, true);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        document.body.removeEventListener('keydown', this._boundBodyKeydown, true);
        document.body.removeEventListener('keyup', this._boundBodyKeyup, true);
    }
    focus() {
        if (this.header) {
            this.header.focus();
        }
    }
    firstUpdated() {
        this.setAttribute('tabindex', '0');
        this.addEventListener('focusin', e => {
            if (e.composedPath()[0] === this) {
                if (this._isShiftTabbing) {
                    return;
                }
                this._setFocused(true);
                this.focus();
            }
            else if (this.header &&
                e.composedPath().indexOf(this.header) !== -1 &&
                !this.disabled) {
                this._setFocused(true);
            }
        });
        this.addEventListener('focusout', () => this._setFocused(false));
        this.addEventListener('keydown', e => {
            if (e.shiftKey && e.keyCode === 9) {
                this._isShiftTabbing = true;
                HTMLElement.prototype.focus.apply(this);
                this._setFocused(false);
                setTimeout(() => {
                    this._isShiftTabbing = false;
                }, 0);
            }
        });
    }
    updated(props) {
        if (props.has('opened')) {
            this.dispatchEvent(new CustomEvent('opened-changed', {
                detail: { value: this.opened }
            }));
        }
        if (props.has('disabled') && this.header) {
            if (this.disabled) {
                this.removeAttribute('tabindex');
                this.header.setAttribute('tabindex', '-1');
            }
            else if (props.get('disabled')) {
                this.setAttribute('tabindex', '0');
                this.header.setAttribute('tabindex', '0');
            }
        }
    }
    _setFocused(focused) {
        if (focused) {
            this.setAttribute('focused', '');
        }
        else {
            this.removeAttribute('focused');
        }
        if (focused && this._tabPressed) {
            this.setAttribute('focus-ring', '');
        }
        else {
            this.removeAttribute('focus-ring');
        }
    }
    _onToggleClick() {
        this.opened = !this.opened;
    }
    _onToggleKeyDown(e) {
        if ([13, 32].indexOf(e.keyCode) > -1) {
            e.preventDefault();
            this.opened = !this.opened;
        }
    }
    _onBodyKeydown(e) {
        this._tabPressed = e.keyCode === 9;
    }
    _onBodyKeyup() {
        this._tabPressed = false;
    }
};
__decorate([
    property({ type: Boolean, reflect: true })
], ExpansionPanel.prototype, "opened", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], ExpansionPanel.prototype, "disabled", void 0);
__decorate([
    query('[part="header"]')
], ExpansionPanel.prototype, "header", void 0);
ExpansionPanel = __decorate([
    customElement('pwi-expansion-panel')
], ExpansionPanel);

/**
 * A custom element implementing the accordion widget: a vertically stacked set of expandable panels
 * that wraps several instances of the `<expansion-panel>` element. Only one panel can be opened
 * (expanded) at a time.
 *
 * Panel headings function as controls that enable users to open (expand) or hide (collapse) their
 * associated sections of content. The user can toggle panels by mouse click, Enter and Space keys.
 *
 * The component supports keyboard navigation and is aligned with the
 * [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/#accordion).
 *
 * @element fancy-accordion
 *
 * @slot - Slot fot panel elements.
 *
 * @fires opened-index-changed - Event fired when changing currently opened panel.
 */
let FancyAccordion = class FancyAccordion extends LitElement {
    constructor() {
        super(...arguments);
        /**
         * Index of the currently opened panel. By default all the panels are closed.
         * Only one panel can be opened at the same time. Setting `null` or `undefined`
         * closes all the accordion panels.
         */
        this.openedIndex = null;
        this._items = [];
        this._boundOnOpened = this._onOpened.bind(this);
    }
    static get styles() {
        return css `
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }

      ::slotted([opened]:not(:first-child)) {
        margin-top: 16px;
      }

      ::slotted([opened]:not(:last-child)) {
        margin-bottom: 16px;
      }

      ::slotted(:not([opened])) {
        position: relative;
      }

      ::slotted(:not([opened]))::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 1px;
        opacity: 1;
        z-index: 1;
        background-color: rgba(0, 0, 0, 0.12);
      }
    `;
    }
    render() {
        return html$2 `
      <slot></slot>
    `;
    }
    firstUpdated() {
        this.addEventListener('keydown', e => this._onKeydown(e));
        Array.from(this.children).forEach(node => {
            if (node instanceof ExpansionPanel) {
                this._items.push(node);
                node.addEventListener('opened-changed', this._boundOnOpened);
            }
        });
    }
    update(props) {
        if (props.has('openedIndex') && this._items) {
            const item = this.openedIndex == null ? null : this._items[this.openedIndex];
            this._items.forEach(el => {
                el.opened = el === item;
            });
        }
        super.update(props);
    }
    get focused() {
        const root = this.getRootNode();
        return root.activeElement;
    }
    _onKeydown(event) {
        const target = event.composedPath()[0];
        if (target.getAttribute('part') !== 'header') {
            return;
        }
        const key = event.key.replace(/^Arrow/, '');
        const currentIdx = this._items.indexOf(this.focused);
        let idx;
        let increment;
        switch (key) {
            case 'Up':
                increment = -1;
                idx = currentIdx - 1;
                break;
            case 'Down':
                increment = 1;
                idx = currentIdx + 1;
                break;
            case 'Home':
                increment = 1;
                idx = 0;
                break;
            case 'End':
                increment = -1;
                idx = this._items.length - 1;
                break;
        }
        idx = this._getAvailableIndex(idx, increment);
        if (idx >= 0) {
            this._items[idx].focus();
            this._items[idx].setAttribute('focus-ring', '');
            event.preventDefault();
        }
    }
    _getAvailableIndex(index, increment) {
        const total = this._items.length;
        let idx = index;
        for (let i = 0; typeof idx === 'number' && i < total; i++, idx += increment || 1) {
            if (idx < 0) {
                idx = total - 1;
            }
            else if (idx >= total) {
                idx = 0;
            }
            const item = this._items[idx];
            if (!item.disabled) {
                return idx;
            }
        }
        return -1;
    }
    _onOpened(e) {
        const target = e.composedPath()[0];
        const idx = this._items.indexOf(target);
        if (e.detail.value) {
            if (target.disabled || idx === -1) {
                return;
            }
            this.openedIndex = idx;
            this._notifyOpen();
            this._items.forEach(item => {
                if (item !== target && item.opened) {
                    item.opened = false;
                }
            });
        }
        else if (!this._items.some(item => item.opened)) {
            this.openedIndex = undefined;
            this._notifyOpen();
        }
    }
    _notifyOpen() {
        this.dispatchEvent(new CustomEvent('opened-index-changed', {
            detail: {
                value: this.openedIndex
            }
        }));
    }
};
__decorate([
    property({ type: Number, attribute: 'opened-index' })
], FancyAccordion.prototype, "openedIndex", void 0);
FancyAccordion = __decorate([
    customElement('pwi-accordion')
], FancyAccordion);

const timezoneOffset = new Date().getTimezoneOffset();  // Note(cg): in minutes -120 for GMT+2 

/**
 * ## PwiIsPast
 *
 * `<pwi-is-past>` simple element that dispatch a `date-in-past` when date in in the past
 * 
 * @fires is-past-changed - event fired when date is in past
 */
class PwiIsPast extends LitElement {

  static get properties() {
    return {
      /**
       * date in GMT by default or locale 
       * if `isLocale` is true
       * @type String
       */
      date: {
        type: String
      },

      /**
       * timezone offest between Date.now and this.date (in minutes)
       * we assume that date is in GMT and we calculate 
       * the difference. 
       * set 0 to indicate same timezone
       * @type {Object}
       */
      timezoneOffset: {
        type: Number
      },

      /*
       * `interval` in ms
       */
      interval: {
        type: Number
      },

    };
  }
  set isPast(past) {
  }

  get isPast() {
    console.info('isPast');
    return this._isPast || false;

  }

  constructor() {
    super();
    this.timezoneOffset = timezoneOffset;
    this.interval = 1000;
  }

  updated(props) {
    if (props.has('date')) {
      this._handleDate();
    }
  }
  _handleDate() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }

    if (this.date) {
      this.timestamp = new Date(this.date).getTime();
      this.intervalID = window.setInterval(() => {this._checkDateInThePast();}, this.interval);
    }
  }

  _checkDateInThePast() {
    // Note(cg): dispatch `date-in-past-changed`.event and clear interval;
    if ((this.timestamp + timezoneOffset * 60 * 1000) < Date.now()) {
      clearInterval(this.intervalID);
      this._isPast = true;
      this.dispatchEvent(new CustomEvent('is-past-changed', {detail: {value: true}}));
      return;
    }
    if (this._isPast) { // Note(cg): is we cahnge the date and isPast was true.
      this._isPast = false;
      this.dispatchEvent(new CustomEvent('is-past-changed', {detail: {value: false}}));
    }
  }
}

// Register the new element with the browser.
customElements.define('pwi-is-past', PwiIsPast);
