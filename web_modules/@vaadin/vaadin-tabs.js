import '../common/directive-9885f5ff.js';
import '../common/boot-5426e289.js';
import '../@polymer/polymer/lib/utils/mixin.js';
import { idlePeriod } from '../@polymer/polymer/lib/utils/async.js';
import { Debouncer, enqueueDebouncer } from '../@polymer/polymer/lib/utils/debounce.js';
import { h as html } from '../common/lit-html-a0bff75d.js';
import { CSSResult, css, LitElement, unsafeCSS, property, customElement } from '../lit-element.js';
import { __decorate } from '../tslib.js';

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

let CSS_URL_RX = /(url\()([^)]*)(\))/g;
let ABS_URL = /(^\/[^\/])|(^#)|(^[\w-\d]*:)/;
let workingURL;
let resolveDoc;
/**
 * Resolves the given URL against the provided `baseUri'.
 *
 * Note that this function performs no resolution for URLs that start
 * with `/` (absolute URLs) or `#` (hash identifiers).  For general purpose
 * URL resolution, use `window.URL`.
 *
 * @param {string} url Input URL to resolve
 * @param {?string=} baseURI Base URI to resolve the URL against
 * @return {string} resolved URL
 */
function resolveUrl(url, baseURI) {
  if (url && ABS_URL.test(url)) {
    return url;
  }
  if (url === '//') {
    return url;
  }
  // Lazy feature detection.
  if (workingURL === undefined) {
    workingURL = false;
    try {
      const u = new URL('b', 'http://a');
      u.pathname = 'c%20d';
      workingURL = (u.href === 'http://a/c%20d');
    } catch (e) {
      // silently fail
    }
  }
  if (!baseURI) {
    baseURI = document.baseURI || window.location.href;
  }
  if (workingURL) {
    try {
      return (new URL(url, baseURI)).href;
    } catch (e) {
      // Bad url or baseURI structure. Do not attempt to resolve.
      return url;
    }
  }
  // Fallback to creating an anchor into a disconnected document.
  if (!resolveDoc) {
    resolveDoc = document.implementation.createHTMLDocument('temp');
    resolveDoc.base = resolveDoc.createElement('base');
    resolveDoc.head.appendChild(resolveDoc.base);
    resolveDoc.anchor = resolveDoc.createElement('a');
    resolveDoc.body.appendChild(resolveDoc.anchor);
  }
  resolveDoc.base.href = baseURI;
  resolveDoc.anchor.href = url;
  return resolveDoc.anchor.href || url;

}

/**
 * Resolves any relative URL's in the given CSS text against the provided
 * `ownerDocument`'s `baseURI`.
 *
 * @param {string} cssText CSS text to process
 * @param {string} baseURI Base URI to resolve the URL against
 * @return {string} Processed CSS text with resolved URL's
 */
function resolveCss(cssText, baseURI) {
  return cssText.replace(CSS_URL_RX, function(m, pre, url, post) {
    return pre + '\'' +
      resolveUrl(url.replace(/["']/g, ''), baseURI) +
      '\'' + post;
  });
}

/**
 * Returns a path from a given `url`. The path includes the trailing
 * `/` from the url.
 *
 * @param {string} url Input URL to transform
 * @return {string} resolved path
 */
function pathFromUrl(url) {
  return url.substring(0, url.lastIndexOf('/') + 1);
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
const useNativeCSSProperties = Boolean(!window.ShadyCSS || window.ShadyCSS.nativeCss);


/**
 * Globally settable property that is automatically assigned to
 * `ElementMixin` instances, useful for binding in templates to
 * make URL's relative to an application's root.  Defaults to the main
 * document URL, but can be overridden by users.  It may be useful to set
 * `rootPath` to provide a stable application mount path when
 * using client side routing.
 */
let rootPath = pathFromUrl(document.baseURI || window.location.href);

/**
 * A global callback used to sanitize any value before inserting it into the DOM.
 * The callback signature is:
 *
 *  function sanitizeDOMValue(value, name, type, node) { ... }
 *
 * Where:
 *
 * `value` is the value to sanitize.
 * `name` is the name of an attribute or property (for example, href).
 * `type` indicates where the value is being inserted: one of property, attribute, or text.
 * `node` is the node where the value is being inserted.
 *
 * @type {(function(*,string,string,Node):*)|undefined}
 */
let sanitizeDOMValue = window.Polymer && window.Polymer.sanitizeDOMValue || undefined;

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

let modules = {};
let lcModules = {};
/**
 * Sets a dom-module into the global registry by id.
 *
 * @param {string} id dom-module id
 * @param {DomModule} module dom-module instance
 * @return {void}
 */
function setModule(id, module) {
  // store id separate from lowercased id so that
  // in all cases mixedCase id will stored distinctly
  // and lowercase version is a fallback
  modules[id] = lcModules[id.toLowerCase()] = module;
}
/**
 * Retrieves a dom-module from the global registry by id.
 *
 * @param {string} id dom-module id
 * @return {DomModule!} dom-module instance
 */
function findModule(id) {
  return modules[id] || lcModules[id.toLowerCase()];
}

function styleOutsideTemplateCheck(inst) {
  if (inst.querySelector('style')) {
    console.warn('dom-module %s has style outside template', inst.id);
  }
}

/**
 * The `dom-module` element registers the dom it contains to the name given
 * by the module's id attribute. It provides a unified database of dom
 * accessible via its static `import` API.
 *
 * A key use case of `dom-module` is for providing custom element `<template>`s
 * via HTML imports that are parsed by the native HTML parser, that can be
 * relocated during a bundling pass and still looked up by `id`.
 *
 * Example:
 *
 *     <dom-module id="foo">
 *       <img src="stuff.png">
 *     </dom-module>
 *
 * Then in code in some other location that cannot access the dom-module above
 *
 *     let img = customElements.get('dom-module').import('foo', 'img');
 *
 * @customElement
 * @extends HTMLElement
 * @summary Custom element that provides a registry of relocatable DOM content
 *   by `id` that is agnostic to bundling.
 * @unrestricted
 */
class DomModule extends HTMLElement {

  /** @override */
  static get observedAttributes() { return ['id']; }

  /**
   * Retrieves the element specified by the css `selector` in the module
   * registered by `id`. For example, this.import('foo', 'img');
   * @param {string} id The id of the dom-module in which to search.
   * @param {string=} selector The css selector by which to find the element.
   * @return {Element} Returns the element which matches `selector` in the
   * module registered at the specified `id`.
   *
   * @export
   * @nocollapse Referred to indirectly in style-gather.js
   */
  static import(id, selector) {
    if (id) {
      let m = findModule(id);
      if (m && selector) {
        return m.querySelector(selector);
      }
      return m;
    }
    return null;
  }

  /* eslint-disable no-unused-vars */
  /**
   * @param {string} name Name of attribute.
   * @param {?string} old Old value of attribute.
   * @param {?string} value Current value of attribute.
   * @param {?string} namespace Attribute namespace.
   * @return {void}
   * @override
   */
  attributeChangedCallback(name, old, value, namespace) {
    if (old !== value) {
      this.register();
    }
  }
  /* eslint-enable no-unused-args */

  /**
   * The absolute URL of the original location of this `dom-module`.
   *
   * This value will differ from this element's `ownerDocument` in the
   * following ways:
   * - Takes into account any `assetpath` attribute added during bundling
   *   to indicate the original location relative to the bundled location
   * - Uses the HTMLImports polyfill's `importForElement` API to ensure
   *   the path is relative to the import document's location since
   *   `ownerDocument` is not currently polyfilled
   */
  get assetpath() {
    // Don't override existing assetpath.
    if (!this.__assetpath) {
      // note: assetpath set via an attribute must be relative to this
      // element's location; accomodate polyfilled HTMLImports
      const owner = window.HTMLImports && HTMLImports.importForElement ?
        HTMLImports.importForElement(this) || document : this.ownerDocument;
      const url = resolveUrl(
        this.getAttribute('assetpath') || '', owner.baseURI);
      this.__assetpath = pathFromUrl(url);
    }
    return this.__assetpath;
  }

  /**
   * Registers the dom-module at a given id. This method should only be called
   * when a dom-module is imperatively created. For
   * example, `document.createElement('dom-module').register('foo')`.
   * @param {string=} id The id at which to register the dom-module.
   * @return {void}
   */
  register(id) {
    id = id || this.id;
    if (id) {
      this.id = id;
      setModule(id, this);
      styleOutsideTemplateCheck(this);
    }
  }
}

DomModule.prototype['modules'] = modules;

customElements.define('dom-module', DomModule);

let moduleIdIndex = 0;
// Map of <CSSResult, Polymer.DomModule> pairs.
const styleMap = {};

/**
 * Registers CSS styles for a component type. Make sure to register the styles before
 * the first instance of a component of the type is attached to DOM.
 *
 * @param {String} themeFor The local/tag name of the component type to register the styles for
 * @param {CSSResult | CSSResult[]} styles The CSS style rules to be registered for the component type
 * matching themeFor and included in the local scope of each component instance
 * @param {Object} [options] Additional options
 * @return {void}
 */
const registerStyles = (themeFor, styles, options) => {
  const themeId = (options && options.moduleId) || `custom-style-module-${moduleIdIndex++}`;

  if (!Array.isArray(styles)) {
    styles = styles ? [styles] : [];
  }

  styles.forEach(cssResult => {
    if (!(cssResult instanceof CSSResult)) {
      throw new Error(
        'An item in styles is not of type CSSResult. Use `unsafeCSS` or `css`.');
    }
    if (!styleMap[cssResult]) {
      const styleModuleElement = document.createElement('dom-module');
      styleModuleElement.innerHTML = `
        <template>
          <style>${cssResult.toString()}</style>
        </template>
      `;

      const styleId = `custom-style-module-${moduleIdIndex++}`;
      styleModuleElement.register(styleId);
      styleMap[cssResult] = styleId;
    }
  });

  const themeModuleElement = document.createElement('dom-module');
  if (themeFor) {
    const elementClass = window.customElements && window.customElements.get(themeFor);
    if (elementClass && elementClass.hasOwnProperty('__finalized')) {
      console.warn(`The custom element definition for "${themeFor}"
      was finalized before a style module was registered.
      Make sure to add component specific style modules before
      importing the corresponding custom element.`);
    }
    themeModuleElement.setAttribute('theme-for', themeFor);
  }

  const moduleIncludes = (options && options.include) || [];

  themeModuleElement.innerHTML = `
    <template>
      ${styles.map(style => `<style include=${styleMap[style]}></style>`)}
      ${moduleIncludes.map(include => `<style include=${include}></style>`)}
    </template>
  `;

  themeModuleElement.register(themeId);
};

class Lumo extends HTMLElement {
  static get version() {
    return '1.6.0';
  }
}

customElements.define('vaadin-lumo-styles', Lumo);

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/** @type {Promise<void>} */
let readyPromise = null;

/** @type {?function(?function())} */
let whenReady = window['HTMLImports'] && window['HTMLImports']['whenReady'] || null;

/** @type {function()} */
let resolveFn;

/**
 * @param {?function()} callback
 */
function documentWait(callback) {
  requestAnimationFrame(function() {
    if (whenReady) {
      whenReady(callback);
    } else {
      if (!readyPromise) {
        readyPromise = new Promise((resolve) => {resolveFn = resolve;});
        if (document.readyState === 'complete') {
          resolveFn();
        } else {
          document.addEventListener('readystatechange', () => {
            if (document.readyState === 'complete') {
              resolveFn();
            }
          });
        }
      }
      readyPromise.then(function(){ callback && callback(); });
    }
  });
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

const SEEN_MARKER = '__seenByShadyCSS';
const CACHED_STYLE = '__shadyCSSCachedStyle';

/** @type {?function(!HTMLStyleElement)} */
let transformFn = null;

/** @type {?function()} */
let validateFn = null;

/**
This interface is provided to add document-level <style> elements to ShadyCSS for processing.
These styles must be processed by ShadyCSS to simulate ShadowRoot upper-bound encapsulation from outside styles
In addition, these styles may also need to be processed for @apply rules and CSS Custom Properties

To add document-level styles to ShadyCSS, one can call `ShadyCSS.addDocumentStyle(styleElement)` or `ShadyCSS.addDocumentStyle({getStyle: () => styleElement})`

In addition, if the process used to discover document-level styles can be synchronously flushed, one should set `ShadyCSS.documentStyleFlush`.
This function will be called when calculating styles.

An example usage of the document-level styling api can be found in `examples/document-style-lib.js`

@unrestricted
*/
class CustomStyleInterface {
  constructor() {
    /** @type {!Array<!CustomStyleProvider>} */
    this['customStyles'] = [];
    this['enqueued'] = false;
    // NOTE(dfreedm): use quotes here to prevent closure inlining to `function(){}`;
    documentWait(() => {
      if (window['ShadyCSS']['flushCustomStyles']) {
        window['ShadyCSS']['flushCustomStyles']();
      }
    });
  }
  /**
   * Queue a validation for new custom styles to batch style recalculations
   */
  enqueueDocumentValidation() {
    if (this['enqueued'] || !validateFn) {
      return;
    }
    this['enqueued'] = true;
    documentWait(validateFn);
  }
  /**
   * @param {!HTMLStyleElement} style
   */
  addCustomStyle(style) {
    if (!style[SEEN_MARKER]) {
      style[SEEN_MARKER] = true;
      this['customStyles'].push(style);
      this.enqueueDocumentValidation();
    }
  }
  /**
   * @param {!CustomStyleProvider} customStyle
   * @return {HTMLStyleElement}
   */
  getStyleForCustomStyle(customStyle) {
    if (customStyle[CACHED_STYLE]) {
      return customStyle[CACHED_STYLE];
    }
    let style;
    if (customStyle['getStyle']) {
      style = customStyle['getStyle']();
    } else {
      style = customStyle;
    }
    return style;
  }
  /**
   * @return {!Array<!CustomStyleProvider>}
   */
  processStyles() {
    const cs = this['customStyles'];
    for (let i = 0; i < cs.length; i++) {
      const customStyle = cs[i];
      if (customStyle[CACHED_STYLE]) {
        continue;
      }
      const style = this.getStyleForCustomStyle(customStyle);
      if (style) {
        // HTMLImports polyfill may have cloned the style into the main document,
        // which is referenced with __appliedElement.
        const styleToTransform = /** @type {!HTMLStyleElement} */(style['__appliedElement'] || style);
        if (transformFn) {
          transformFn(styleToTransform);
        }
        customStyle[CACHED_STYLE] = styleToTransform;
      }
    }
    return cs;
  }
}

/* eslint-disable no-self-assign */
CustomStyleInterface.prototype['addCustomStyle'] = CustomStyleInterface.prototype.addCustomStyle;
CustomStyleInterface.prototype['getStyleForCustomStyle'] = CustomStyleInterface.prototype.getStyleForCustomStyle;
CustomStyleInterface.prototype['processStyles'] = CustomStyleInterface.prototype.processStyles;
/* eslint-enable no-self-assign */

Object.defineProperties(CustomStyleInterface.prototype, {
  'transformCallback': {
    /** @return {?function(!HTMLStyleElement)} */
    get() {
      return transformFn;
    },
    /** @param {?function(!HTMLStyleElement)} fn */
    set(fn) {
      transformFn = fn;
    }
  },
  'validateCallback': {
    /** @return {?function()} */
    get() {
      return validateFn;
    },
    /**
     * @param {?function()} fn
     * @this {CustomStyleInterface}
     */
    set(fn) {
      let needsEnqueue = false;
      if (!validateFn) {
        needsEnqueue = true;
      }
      validateFn = fn;
      if (needsEnqueue) {
        this.enqueueDocumentValidation();
      }
    },
  }
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

/**
 * @param {Element} element
 * @param {Object=} properties
 */
function updateNativeProperties(element, properties) {
  // remove previous properties
  for (let p in properties) {
    // NOTE: for bc with shim, don't apply null values.
    if (p === null) {
      element.style.removeProperty(p);
    } else {
      element.style.setProperty(p, properties[p]);
    }
  }
}

/**
 * @param {Element} element
 * @param {string} property
 * @return {string}
 */
function getComputedStyleValue(element, property) {
  /**
   * @const {string}
   */
  const value = window.getComputedStyle(element).getPropertyValue(property);
  if (!value) {
    return '';
  } else {
    return value.trim();
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

const nativeShadow = !(window['ShadyDOM'] && window['ShadyDOM']['inUse']);
let nativeCssVariables_;

/**
 * @param {(ShadyCSSOptions | ShadyCSSInterface)=} settings
 */
function calcCssVariables(settings) {
  if (settings && settings['shimcssproperties']) {
    nativeCssVariables_ = false;
  } else {
    // chrome 49 has semi-working css vars, check if box-shadow works
    // safari 9.1 has a recalc bug: https://bugs.webkit.org/show_bug.cgi?id=155782
    // However, shim css custom properties are only supported with ShadyDOM enabled,
    // so fall back on native if we do not detect ShadyDOM
    // Edge 15: custom properties used in ::before and ::after will also be used in the parent element
    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12414257/
    nativeCssVariables_ = nativeShadow || Boolean(!navigator.userAgent.match(/AppleWebKit\/601|Edge\/15/) &&
      window.CSS && CSS.supports && CSS.supports('box-shadow', '0 0 0 var(--foo)'));
  }
}

/** @type {string | undefined} */
let cssBuild;
if (window.ShadyCSS && window.ShadyCSS.cssBuild !== undefined) {
  cssBuild = window.ShadyCSS.cssBuild;
}

/** @type {boolean} */
const disableRuntime = Boolean(window.ShadyCSS && window.ShadyCSS.disableRuntime);

if (window.ShadyCSS && window.ShadyCSS.nativeCss !== undefined) {
  nativeCssVariables_ = window.ShadyCSS.nativeCss;
} else if (window.ShadyCSS) {
  calcCssVariables(window.ShadyCSS);
  // reset window variable to let ShadyCSS API take its place
  window.ShadyCSS = undefined;
} else {
  calcCssVariables(window['WebComponents'] && window['WebComponents']['flags']);
}

// Hack for type error under new type inference which doesn't like that
// nativeCssVariables is updated in a function and assigns the type
// `function(): ?` instead of `boolean`.
const nativeCssVariables = /** @type {boolean} */(nativeCssVariables_);

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

const customStyleInterface = new CustomStyleInterface();

if (!window.ShadyCSS) {
  window.ShadyCSS = {
    /**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     * @param {string=} elementExtends
     */
    prepareTemplate(template, elementName, elementExtends) {}, // eslint-disable-line no-unused-vars

    /**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     */
    prepareTemplateDom(template, elementName) {}, // eslint-disable-line no-unused-vars

    /**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     * @param {string=} elementExtends
     */
    prepareTemplateStyles(template, elementName, elementExtends) {}, // eslint-disable-line no-unused-vars

    /**
     * @param {Element} element
     * @param {Object=} properties
     */
    styleSubtree(element, properties) {
      customStyleInterface.processStyles();
      updateNativeProperties(element, properties);
    },

    /**
     * @param {Element} element
     */
    styleElement(element) { // eslint-disable-line no-unused-vars
      customStyleInterface.processStyles();
    },

    /**
     * @param {Object=} properties
     */
    styleDocument(properties) {
      customStyleInterface.processStyles();
      updateNativeProperties(document.body, properties);
    },

    /**
     * @param {Element} element
     * @param {string} property
     * @return {string}
     */
    getComputedStyleValue(element, property) {
      return getComputedStyleValue(element, property);
    },

    flushCustomStyles() {},
    nativeCss: nativeCssVariables,
    nativeShadow: nativeShadow,
    cssBuild: cssBuild,
    disableRuntime: disableRuntime,
  };
}

window.ShadyCSS.CustomStyleInterface = customStyleInterface;

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

const MODULE_STYLE_LINK_SELECTOR = 'link[rel=import][type~=css]';
const INCLUDE_ATTR = 'include';
const SHADY_UNSCOPED_ATTR = 'shady-unscoped';

/**
 * @param {string} moduleId .
 * @return {?DomModule} .
 */
function importModule(moduleId) {
  return /** @type {?DomModule} */(DomModule.import(moduleId));
}

function styleForImport(importDoc) {
  // NOTE: polyfill affordance.
  // under the HTMLImports polyfill, there will be no 'body',
  // but the import pseudo-doc can be used directly.
  let container = importDoc.body ? importDoc.body : importDoc;
  const importCss = resolveCss(container.textContent,
    importDoc.baseURI);
  const style = document.createElement('style');
  style.textContent = importCss;
  return style;
}


/**
 * Returns a list of <style> elements in a space-separated list of `dom-module`s.
 *
 * @function
 * @param {string} moduleIds List of dom-module id's within which to
 * search for css.
 * @return {!Array<!HTMLStyleElement>} Array of contained <style> elements
 */
function stylesFromModules(moduleIds) {
 const modules = moduleIds.trim().split(/\s+/);
 const styles = [];
 for (let i=0; i < modules.length; i++) {
   styles.push(...stylesFromModule(modules[i]));
 }
 return styles;
}

/**
 * Returns a list of <style> elements in a given `dom-module`.
 * Styles in a `dom-module` can come either from `<style>`s within the
 * first `<template>`, or else from one or more
 * `<link rel="import" type="css">` links outside the template.
 *
 * @param {string} moduleId dom-module id to gather styles from
 * @return {!Array<!HTMLStyleElement>} Array of contained styles.
 */
function stylesFromModule(moduleId) {
  const m = importModule(moduleId);

  if (!m) {
    console.warn('Could not find style data in module named', moduleId);
    return [];
  }

  if (m._styles === undefined) {
    const styles = [];
    // module imports: <link rel="import" type="css">
    styles.push(..._stylesFromModuleImports(m));
    // include css from the first template in the module
    const template = /** @type {?HTMLTemplateElement} */(
        m.querySelector('template'));
    if (template) {
      styles.push(...stylesFromTemplate(template,
        /** @type {templateWithAssetPath} */(m).assetpath));
    }

    m._styles = styles;
  }

  return m._styles;
}

/**
 * Returns the `<style>` elements within a given template.
 *
 * @param {!HTMLTemplateElement} template Template to gather styles from
 * @param {string=} baseURI baseURI for style content
 * @return {!Array<!HTMLStyleElement>} Array of styles
 */
function stylesFromTemplate(template, baseURI) {
  if (!template._styles) {
    const styles = [];
    // if element is a template, get content from its .content
    const e$ = template.content.querySelectorAll('style');
    for (let i=0; i < e$.length; i++) {
      let e = e$[i];
      // support style sharing by allowing styles to "include"
      // other dom-modules that contain styling
      let include = e.getAttribute(INCLUDE_ATTR);
      if (include) {
        styles.push(...stylesFromModules(include).filter(function(item, index, self) {
          return self.indexOf(item) === index;
        }));
      }
      if (baseURI) {
        e.textContent =
            resolveCss(e.textContent, /** @type {string} */ (baseURI));
      }
      styles.push(e);
    }
    template._styles = styles;
  }
  return template._styles;
}

/**
 * @param {!HTMLElement} module dom-module element that could contain `<link rel="import" type="css">` styles
 * @return {!Array<!HTMLStyleElement>} Array of contained styles
 */
function _stylesFromModuleImports(module) {
  const styles = [];
  const p$ = module.querySelectorAll(MODULE_STYLE_LINK_SELECTOR);
  for (let i=0; i < p$.length; i++) {
    let p = p$[i];
    if (p.import) {
      const importDoc = p.import;
      const unscoped = p.hasAttribute(SHADY_UNSCOPED_ATTR);
      if (unscoped && !importDoc._unscopedStyle) {
        const style = styleForImport(importDoc);
        style.setAttribute(SHADY_UNSCOPED_ATTR, '');
        importDoc._unscopedStyle = style;
      } else if (!importDoc._style) {
        importDoc._style = styleForImport(importDoc);
      }
      styles.push(unscoped ? importDoc._unscopedStyle : importDoc._style);
    }
  }
  return styles;
}

/**
 *
 * Returns CSS text of styles in a space-separated list of `dom-module`s.
 * Note: This method is deprecated, use `stylesFromModules` instead.
 *
 * @deprecated
 * @param {string} moduleIds List of dom-module id's within which to
 * search for css.
 * @return {string} Concatenated CSS content from specified `dom-module`s
 */
function cssFromModules(moduleIds) {
 let modules = moduleIds.trim().split(/\s+/);
 let cssText = '';
 for (let i=0; i < modules.length; i++) {
   cssText += cssFromModule(modules[i]);
 }
 return cssText;
}

/**
 * Returns CSS text of styles in a given `dom-module`.  CSS in a `dom-module`
 * can come either from `<style>`s within the first `<template>`, or else
 * from one or more `<link rel="import" type="css">` links outside the
 * template.
 *
 * Any `<styles>` processed are removed from their original location.
 * Note: This method is deprecated, use `styleFromModule` instead.
 *
 * @deprecated
 * @param {string} moduleId dom-module id to gather styles from
 * @return {string} Concatenated CSS content from specified `dom-module`
 */
function cssFromModule(moduleId) {
  let m = importModule(moduleId);
  if (m && m._cssText === undefined) {
    // module imports: <link rel="import" type="css">
    let cssText = _cssFromModuleImports(m);
    // include css from the first template in the module
    let t = /** @type {?HTMLTemplateElement} */(m.querySelector('template'));
    if (t) {
      cssText += cssFromTemplate(t,
        /** @type {templateWithAssetPath} */(m).assetpath);
    }
    m._cssText = cssText || null;
  }
  if (!m) {
    console.warn('Could not find style data in module named', moduleId);
  }
  return m && m._cssText || '';
}

/**
 * Returns CSS text of `<styles>` within a given template.
 *
 * Any `<styles>` processed are removed from their original location.
 * Note: This method is deprecated, use `styleFromTemplate` instead.
 *
 * @deprecated
 * @param {!HTMLTemplateElement} template Template to gather styles from
 * @param {string} baseURI Base URI to resolve the URL against
 * @return {string} Concatenated CSS content from specified template
 */
function cssFromTemplate(template, baseURI) {
  let cssText = '';
  const e$ = stylesFromTemplate(template, baseURI);
  // if element is a template, get content from its .content
  for (let i=0; i < e$.length; i++) {
    let e = e$[i];
    if (e.parentNode) {
      e.parentNode.removeChild(e);
    }
    cssText += e.textContent;
  }
  return cssText;
}

/**
 * @deprecated
 * @param {!HTMLElement} module dom-module element that could contain `<link rel="import" type="css">` styles
 * @return {string} Concatenated CSS content from links in the dom-module
 */
function _cssFromModuleImports(module) {
  let cssText = '';
  let styles = _stylesFromModuleImports(module);
  for (let i=0; i < styles.length; i++) {
    cssText += styles[i].textContent;
  }
  return cssText;
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

const attr = 'include';

const CustomStyleInterface$1 = window.ShadyCSS.CustomStyleInterface;

/**
 * Custom element for defining styles in the main document that can take
 * advantage of [shady DOM](https://github.com/webcomponents/shadycss) shims
 * for style encapsulation, custom properties, and custom mixins.
 *
 * - Document styles defined in a `<custom-style>` are shimmed to ensure they
 *   do not leak into local DOM when running on browsers without native
 *   Shadow DOM.
 * - Custom properties can be defined in a `<custom-style>`. Use the `html` selector
 *   to define custom properties that apply to all custom elements.
 * - Custom mixins can be defined in a `<custom-style>`, if you import the optional
 *   [apply shim](https://github.com/webcomponents/shadycss#about-applyshim)
 *   (`shadycss/apply-shim.html`).
 *
 * To use:
 *
 * - Import `custom-style.html`.
 * - Place a `<custom-style>` element in the main document, wrapping an inline `<style>` tag that
 *   contains the CSS rules you want to shim.
 *
 * For example:
 *
 * ```html
 * <!-- import apply shim--only required if using mixins -->
 * <link rel="import" href="bower_components/shadycss/apply-shim.html">
 * <!-- import custom-style element -->
 * <link rel="import" href="bower_components/polymer/lib/elements/custom-style.html">
 *
 * <custom-style>
 *   <style>
 *     html {
 *       --custom-color: blue;
 *       --custom-mixin: {
 *         font-weight: bold;
 *         color: red;
 *       };
 *     }
 *   </style>
 * </custom-style>
 * ```
 *
 * @customElement
 * @extends HTMLElement
 * @summary Custom element for defining styles in the main document that can
 *   take advantage of Polymer's style scoping and custom properties shims.
 */
class CustomStyle extends HTMLElement {
  constructor() {
    super();
    this._style = null;
    CustomStyleInterface$1.addCustomStyle(this);
  }
  /**
   * Returns the light-DOM `<style>` child this element wraps.  Upon first
   * call any style modules referenced via the `include` attribute will be
   * concatenated to this element's `<style>`.
   *
   * @export
   * @return {HTMLStyleElement} This element's light-DOM `<style>`
   */
  getStyle() {
    if (this._style) {
      return this._style;
    }
    const style = /** @type {HTMLStyleElement} */(this.querySelector('style'));
    if (!style) {
      return null;
    }
    this._style = style;
    const include = style.getAttribute(attr);
    if (include) {
      style.removeAttribute(attr);
      /** @suppress {deprecated} */
      style.textContent = cssFromModules(include) + style.textContent;
    }
    /*
    HTML Imports styling the main document are deprecated in Chrome
    https://crbug.com/523952

    If this element is not in the main document, then it must be in an HTML Import document.
    In that case, move the custom style to the main document.

    The ordering of `<custom-style>` should stay the same as when loaded by HTML Imports, but there may be odd
    cases of ordering w.r.t the main document styles.
    */
    if (this.ownerDocument !== window.document) {
      window.document.head.appendChild(this);
    }
    return this._style;
  }
}

window.customElements.define('custom-style', CustomStyle);

const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<custom-style>
  <style>
    html {
      /* Base (background) */
      --lumo-base-color: #FFF;

      /* Tint */
      --lumo-tint-5pct: hsla(0, 0%, 100%, 0.3);
      --lumo-tint-10pct: hsla(0, 0%, 100%, 0.37);
      --lumo-tint-20pct: hsla(0, 0%, 100%, 0.44);
      --lumo-tint-30pct: hsla(0, 0%, 100%, 0.5);
      --lumo-tint-40pct: hsla(0, 0%, 100%, 0.57);
      --lumo-tint-50pct: hsla(0, 0%, 100%, 0.64);
      --lumo-tint-60pct: hsla(0, 0%, 100%, 0.7);
      --lumo-tint-70pct: hsla(0, 0%, 100%, 0.77);
      --lumo-tint-80pct: hsla(0, 0%, 100%, 0.84);
      --lumo-tint-90pct: hsla(0, 0%, 100%, 0.9);
      --lumo-tint: #FFF;

      /* Shade */
      --lumo-shade-5pct: hsla(214, 61%, 25%, 0.05);
      --lumo-shade-10pct: hsla(214, 57%, 24%, 0.1);
      --lumo-shade-20pct: hsla(214, 53%, 23%, 0.16);
      --lumo-shade-30pct: hsla(214, 50%, 22%, 0.26);
      --lumo-shade-40pct: hsla(214, 47%, 21%, 0.38);
      --lumo-shade-50pct: hsla(214, 45%, 20%, 0.5);
      --lumo-shade-60pct: hsla(214, 43%, 19%, 0.61);
      --lumo-shade-70pct: hsla(214, 42%, 18%, 0.72);
      --lumo-shade-80pct: hsla(214, 41%, 17%, 0.83);
      --lumo-shade-90pct: hsla(214, 40%, 16%, 0.94);
      --lumo-shade: hsl(214, 35%, 15%);

      /* Contrast */
      --lumo-contrast-5pct: var(--lumo-shade-5pct);
      --lumo-contrast-10pct: var(--lumo-shade-10pct);
      --lumo-contrast-20pct: var(--lumo-shade-20pct);
      --lumo-contrast-30pct: var(--lumo-shade-30pct);
      --lumo-contrast-40pct: var(--lumo-shade-40pct);
      --lumo-contrast-50pct: var(--lumo-shade-50pct);
      --lumo-contrast-60pct: var(--lumo-shade-60pct);
      --lumo-contrast-70pct: var(--lumo-shade-70pct);
      --lumo-contrast-80pct: var(--lumo-shade-80pct);
      --lumo-contrast-90pct: var(--lumo-shade-90pct);
      --lumo-contrast: var(--lumo-shade);

      /* Text */
      --lumo-header-text-color: var(--lumo-contrast);
      --lumo-body-text-color: var(--lumo-contrast-90pct);
      --lumo-secondary-text-color: var(--lumo-contrast-70pct);
      --lumo-tertiary-text-color: var(--lumo-contrast-50pct);
      --lumo-disabled-text-color: var(--lumo-contrast-30pct);

      /* Primary */
      --lumo-primary-color: hsl(214, 90%, 52%);
      --lumo-primary-color-50pct: hsla(214, 90%, 52%, 0.5);
      --lumo-primary-color-10pct: hsla(214, 90%, 52%, 0.1);
      --lumo-primary-text-color: var(--lumo-primary-color);
      --lumo-primary-contrast-color: #FFF;

      /* Error */
      --lumo-error-color: hsl(3, 100%, 61%);
      --lumo-error-color-50pct: hsla(3, 100%, 60%, 0.5);
      --lumo-error-color-10pct: hsla(3, 100%, 60%, 0.1);
      --lumo-error-text-color: hsl(3, 92%, 53%);
      --lumo-error-contrast-color: #FFF;

      /* Success */
      --lumo-success-color: hsl(145, 80%, 42%); /* hsl(144,82%,37%); */
      --lumo-success-color-50pct: hsla(145, 76%, 44%, 0.55);
      --lumo-success-color-10pct: hsla(145, 76%, 44%, 0.12);
      --lumo-success-text-color: hsl(145, 100%, 32%);
      --lumo-success-contrast-color: #FFF;
    }
  </style>
</custom-style><dom-module id="lumo-color">
  <template>
    <style>
      [theme~="dark"] {
        /* Base (background) */
        --lumo-base-color: hsl(214, 35%, 21%);

        /* Tint */
        --lumo-tint-5pct: hsla(214, 65%, 85%, 0.06);
        --lumo-tint-10pct: hsla(214, 60%, 80%, 0.14);
        --lumo-tint-20pct: hsla(214, 64%, 82%, 0.23);
        --lumo-tint-30pct: hsla(214, 69%, 84%, 0.32);
        --lumo-tint-40pct: hsla(214, 73%, 86%, 0.41);
        --lumo-tint-50pct: hsla(214, 78%, 88%, 0.5);
        --lumo-tint-60pct: hsla(214, 82%, 90%, 0.6);
        --lumo-tint-70pct: hsla(214, 87%, 92%, 0.7);
        --lumo-tint-80pct: hsla(214, 91%, 94%, 0.8);
        --lumo-tint-90pct: hsla(214, 96%, 96%, 0.9);
        --lumo-tint: hsl(214, 100%, 98%);

        /* Shade */
        --lumo-shade-5pct: hsla(214, 0%, 0%, 0.07);
        --lumo-shade-10pct: hsla(214, 4%, 2%, 0.15);
        --lumo-shade-20pct: hsla(214, 8%, 4%, 0.23);
        --lumo-shade-30pct: hsla(214, 12%, 6%, 0.32);
        --lumo-shade-40pct: hsla(214, 16%, 8%, 0.41);
        --lumo-shade-50pct: hsla(214, 20%, 10%, 0.5);
        --lumo-shade-60pct: hsla(214, 24%, 12%, 0.6);
        --lumo-shade-70pct: hsla(214, 28%, 13%, 0.7);
        --lumo-shade-80pct: hsla(214, 32%, 13%, 0.8);
        --lumo-shade-90pct: hsla(214, 33%, 13%, 0.9);
        --lumo-shade: hsl(214, 33%, 13%);

        /* Contrast */
        --lumo-contrast-5pct: var(--lumo-tint-5pct);
        --lumo-contrast-10pct: var(--lumo-tint-10pct);
        --lumo-contrast-20pct: var(--lumo-tint-20pct);
        --lumo-contrast-30pct: var(--lumo-tint-30pct);
        --lumo-contrast-40pct: var(--lumo-tint-40pct);
        --lumo-contrast-50pct: var(--lumo-tint-50pct);
        --lumo-contrast-60pct: var(--lumo-tint-60pct);
        --lumo-contrast-70pct: var(--lumo-tint-70pct);
        --lumo-contrast-80pct: var(--lumo-tint-80pct);
        --lumo-contrast-90pct: var(--lumo-tint-90pct);
        --lumo-contrast: var(--lumo-tint);

        /* Text */
        --lumo-header-text-color: var(--lumo-contrast);
        --lumo-body-text-color: var(--lumo-contrast-90pct);
        --lumo-secondary-text-color: var(--lumo-contrast-70pct);
        --lumo-tertiary-text-color: var(--lumo-contrast-50pct);
        --lumo-disabled-text-color: var(--lumo-contrast-30pct);

        /* Primary */
        --lumo-primary-color: hsl(214, 86%, 55%);
        --lumo-primary-color-50pct: hsla(214, 86%, 55%, 0.5);
        --lumo-primary-color-10pct: hsla(214, 90%, 63%, 0.1);
        --lumo-primary-text-color: hsl(214, 100%, 70%);
        --lumo-primary-contrast-color: #FFF;

        /* Error */
        --lumo-error-color: hsl(3, 90%, 63%);
        --lumo-error-color-50pct: hsla(3, 90%, 63%, 0.5);
        --lumo-error-color-10pct: hsla(3, 90%, 63%, 0.1);
        --lumo-error-text-color: hsl(3, 100%, 67%);

        /* Success */
        --lumo-success-color: hsl(145, 65%, 42%);
        --lumo-success-color-50pct: hsla(145, 65%, 42%, 0.5);
        --lumo-success-color-10pct: hsla(145, 65%, 42%, 0.1);
        --lumo-success-text-color: hsl(145, 85%, 47%);
      }

      html {
        color: var(--lumo-body-text-color);
        background-color: var(--lumo-base-color);
      }

      [theme~="dark"] {
        color: var(--lumo-body-text-color);
        background-color: var(--lumo-base-color);
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        color: var(--lumo-header-text-color);
      }

      a {
        color: var(--lumo-primary-text-color);
      }

      blockquote {
        color: var(--lumo-secondary-text-color);
      }

      code,
      pre {
        background-color: var(--lumo-contrast-10pct);
        border-radius: var(--lumo-border-radius-m);
      }
    </style>
  </template>
</dom-module><dom-module id="lumo-color-legacy">
  <template>
    <style include="lumo-color">
      :host {
        color: var(--lumo-body-text-color) !important;
        background-color: var(--lumo-base-color) !important;
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

const $_documentContainer$1 = document.createElement('template');

$_documentContainer$1.innerHTML = `<custom-style>
  <style>
    html {
      --lumo-size-xs: 1.625rem;
      --lumo-size-s: 1.875rem;
      --lumo-size-m: 2.25rem;
      --lumo-size-l: 2.75rem;
      --lumo-size-xl: 3.5rem;

      /* Icons */
      --lumo-icon-size-s: 1.25em;
      --lumo-icon-size-m: 1.5em;
      --lumo-icon-size-l: 2.25em;
      /* For backwards compatibility */
      --lumo-icon-size: var(--lumo-icon-size-m);
    }
  </style>
</custom-style>`;

document.head.appendChild($_documentContainer$1.content);

const $_documentContainer$2 = document.createElement('template');

$_documentContainer$2.innerHTML = `<custom-style>
  <style>
    html {
      /* Border radius */
      --lumo-border-radius-s: 0.25em; /* Checkbox, badge, date-picker year indicator, etc */
      --lumo-border-radius-m: var(--lumo-border-radius, 0.25em); /* Button, text field, menu overlay, etc */
      --lumo-border-radius-l: 0.5em; /* Dialog, notification, etc */
      --lumo-border-radius: 0.25em; /* Deprecated */

      /* Shadow */
      --lumo-box-shadow-xs: 0 1px 4px -1px var(--lumo-shade-50pct);
      --lumo-box-shadow-s: 0 2px 4px -1px var(--lumo-shade-20pct), 0 3px 12px -1px var(--lumo-shade-30pct);
      --lumo-box-shadow-m: 0 2px 6px -1px var(--lumo-shade-20pct), 0 8px 24px -4px var(--lumo-shade-40pct);
      --lumo-box-shadow-l: 0 3px 18px -2px var(--lumo-shade-20pct), 0 12px 48px -6px var(--lumo-shade-40pct);
      --lumo-box-shadow-xl: 0 4px 24px -3px var(--lumo-shade-20pct), 0 18px 64px -8px var(--lumo-shade-40pct);

      /* Clickable element cursor */
      --lumo-clickable-cursor: default;
    }
  </style>
</custom-style>`;

document.head.appendChild($_documentContainer$2.content);

const $_documentContainer$3 = document.createElement('template');

$_documentContainer$3.innerHTML = `<custom-style>
  <style>
    html {
      /* Font families */
      --lumo-font-family: -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";

      /* Font sizes */
      --lumo-font-size-xxs: .75rem;
      --lumo-font-size-xs: .8125rem;
      --lumo-font-size-s: .875rem;
      --lumo-font-size-m: 1rem;
      --lumo-font-size-l: 1.125rem;
      --lumo-font-size-xl: 1.375rem;
      --lumo-font-size-xxl: 1.75rem;
      --lumo-font-size-xxxl: 2.5rem;

      /* Line heights */
      --lumo-line-height-xs: 1.25;
      --lumo-line-height-s: 1.375;
      --lumo-line-height-m: 1.625;
    }

  </style>
</custom-style><dom-module id="lumo-typography">
  <template>
    <style>
      html {
        font-family: var(--lumo-font-family);
        font-size: var(--lumo-font-size, var(--lumo-font-size-m));
        line-height: var(--lumo-line-height-m);
        -webkit-text-size-adjust: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Can’t combine with the above selector because that doesn’t work in browsers without native shadow dom */
      :host {
        font-family: var(--lumo-font-family);
        font-size: var(--lumo-font-size, var(--lumo-font-size-m));
        line-height: var(--lumo-line-height-m);
        -webkit-text-size-adjust: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      small,
      [theme~="font-size-s"] {
        font-size: var(--lumo-font-size-s);
        line-height: var(--lumo-line-height-s);
      }

      [theme~="font-size-xs"] {
        font-size: var(--lumo-font-size-xs);
        line-height: var(--lumo-line-height-xs);
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-weight: 600;
        line-height: var(--lumo-line-height-xs);
        margin-top: 1.25em;
      }

      h1 {
        font-size: var(--lumo-font-size-xxxl);
        margin-bottom: 0.75em;
      }

      h2 {
        font-size: var(--lumo-font-size-xxl);
        margin-bottom: 0.5em;
      }

      h3 {
        font-size: var(--lumo-font-size-xl);
        margin-bottom: 0.5em;
      }

      h4 {
        font-size: var(--lumo-font-size-l);
        margin-bottom: 0.5em;
      }

      h5 {
        font-size: var(--lumo-font-size-m);
        margin-bottom: 0.25em;
      }

      h6 {
        font-size: var(--lumo-font-size-xs);
        margin-bottom: 0;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      p,
      blockquote {
        margin-top: 0.5em;
        margin-bottom: 0.75em;
      }

      a {
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      hr {
        display: block;
        align-self: stretch;
        height: 1px;
        border: 0;
        padding: 0;
        margin: var(--lumo-space-s) calc(var(--lumo-border-radius-m) / 2);
        background-color: var(--lumo-contrast-10pct);
      }

      blockquote {
        border-left: 2px solid var(--lumo-contrast-30pct);
      }

      b,
      strong {
        font-weight: 600;
      }

      /* RTL specific styles */

      blockquote[dir="rtl"] {
        border-left: none;
        border-right: 2px solid var(--lumo-contrast-30pct);
      }

    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer$3.content);

const tabStyles = css `
  :host {
    box-sizing: border-box;
    padding: 0.5rem 0.75rem;
    font-family: var(--lumo-font-family);
    font-size: var(--lumo-font-size-m);
    line-height: var(--lumo-line-height-xs);
    font-weight: 500;
    opacity: 1;
    color: var(--lumo-contrast-60pct);
    transition: 0.15s color, 0.2s transform;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    position: relative;
    cursor: pointer;
    transform-origin: 50% 100%;
    outline: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
    min-width: var(--lumo-size-m);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  :host(:not([orientation='vertical'])) {
    text-align: center;
  }

  :host([orientation='vertical']) {
    transform-origin: 0% 50%;
    padding: 0.25rem 1rem;
    min-height: var(--lumo-size-m);
    min-width: 0;
  }

  :host(:hover),
  :host([focus-ring]) {
    color: var(--lumo-body-text-color);
  }

  :host([selected]) {
    color: var(--lumo-primary-text-color);
    transition: 0.6s color;
  }

  :host([active]:not([selected])) {
    color: var(--lumo-primary-text-color);
    transition-duration: 0.1s;
  }

  :host::before,
  :host::after {
    content: '';
    position: absolute;
    display: var(--_lumo-tab-marker-display, block);
    bottom: 0;
    left: 50%;
    width: var(--lumo-size-s);
    height: 2px;
    background-color: var(--lumo-contrast-60pct);
    border-radius: var(--lumo-border-radius) var(--lumo-border-radius) 0 0;
    transform: translateX(-50%) scale(0);
    transform-origin: 50% 100%;
    transition: 0.14s transform cubic-bezier(0.12, 0.32, 0.54, 1);
    will-change: transform;
  }

  :host([selected])::before,
  :host([selected])::after {
    background-color: var(--lumo-primary-color);
  }

  :host([orientation='vertical'])::before,
  :host([orientation='vertical'])::after {
    left: 0;
    bottom: 50%;
    transform: translateY(50%) scale(0);
    width: 2px;
    height: var(--lumo-size-xs);
    border-radius: 0 var(--lumo-border-radius) var(--lumo-border-radius) 0;
    transform-origin: 100% 50%;
  }

  :host::after {
    box-shadow: 0 0 0 4px var(--lumo-primary-color);
    opacity: 0.15;
    transition: 0.15s 0.02s transform, 0.8s 0.17s opacity;
  }

  :host([selected])::before,
  :host([selected])::after {
    transform: translateX(-50%) scale(1);
    transition-timing-function: cubic-bezier(0.12, 0.32, 0.54, 1.5);
  }

  :host([orientation='vertical'][selected])::before,
  :host([orientation='vertical'][selected])::after {
    transform: translateY(50%) scale(1);
  }

  :host([selected]:not([active]))::after {
    opacity: 0;
  }

  :host(:not([orientation='vertical'])) ::slotted(a[href]) {
    justify-content: center;
  }

  :host ::slotted(a) {
    display: flex;
    width: 100%;
    align-items: center;
    height: 100%;
    margin: -0.5rem -0.75rem;
    padding: 0.5rem 0.75rem;
    outline: none;
    /*
      Override the CSS inherited from "lumo-color" and "lumo-typography".
      Note: !important is needed because of the :slotted() specificity.
    */
    text-decoration: none !important;
    color: inherit !important;
  }

  :host ::slotted(iron-icon) {
    margin: 0 4px;
    width: var(--lumo-icon-size-m);
    height: var(--lumo-icon-size-m);
  }

  /* Vaadin icons are based on a 16x16 grid (unlike Lumo and Material icons with 24x24), so they look too big by default */
  :host ::slotted(iron-icon[icon^='vaadin:']) {
    padding: 0.25rem;
    box-sizing: border-box !important;
  }

  :host ::slotted(iron-icon:first-child) {
    margin-left: 0;
  }

  :host ::slotted(iron-icon:last-child) {
    margin-right: 0;
  }

  :host([theme~='icon-on-top']) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    text-align: center;
    padding-bottom: 0.5rem;
    padding-top: 0.25rem;
  }

  :host([theme~='icon-on-top']) ::slotted(a) {
    flex-direction: column;
    align-items: center;
    margin-top: -0.25rem;
    padding-top: 0.25rem;
  }

  :host([theme~='icon-on-top']) ::slotted(iron-icon) {
    margin: 0;
  }

  /* Disabled */
  :host([disabled]) {
    pointer-events: none;
    opacity: 1;
    color: var(--lumo-disabled-text-color);
  }

  /* Focus-ring */
  :host([focus-ring]) {
    box-shadow: inset 0 0 0 2px var(--lumo-primary-color-50pct);
    border-radius: var(--lumo-border-radius);
  }
`;

registerStyles('vaadin-tab', tabStyles);

/**
 * Array of Vaadin custom element classes that have been subscribed to the dir changes.
 */
const directionSubscribers = [];
const directionUpdater = function() {
  const documentDir = getDocumentDir();
  directionSubscribers.forEach(element => {
    alignDirs(element, documentDir);
  });
};

const directionObserver = new MutationObserver(directionUpdater);
directionObserver.observe(document.documentElement, {attributes: true, attributeFilter: ['dir']});

const alignDirs = function(element, documentDir) {
  if (documentDir) {
    element.setAttribute('dir', documentDir);
  } else {
    element.removeAttribute('dir');
  }
};

const getDocumentDir = function() {
  return document.documentElement.getAttribute('dir');
};

/**
 * @polymerMixin
 */
const DirMixin = superClass => class VaadinDirMixin extends superClass {
  static get properties() {
    return {
      /**
       * @protected
       */
      dir: {
        type: String,
        readOnly: true
      }
    };
  }
  connectedCallback() {
    super.connectedCallback();

    if (!this.hasAttribute('dir')) {
      this.__subscribe();
      alignDirs(this, getDocumentDir());
    }
  }

  /** @protected */
  attributeChangedCallback(name, oldValue, newValue) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name !== 'dir') {
      return;
    }

    // New value equals to the document direction and the element is not subscribed to the changes
    const newValueEqlDocDir = newValue === getDocumentDir() && directionSubscribers.indexOf(this) === -1;
    // Value was emptied and the element is not subscribed to the changes
    const newValueEmptied = !newValue && oldValue && directionSubscribers.indexOf(this) === -1;
    // New value is different and the old equals to document direction and the element is not subscribed to the changes
    const newDiffValue = newValue !== getDocumentDir() && oldValue === getDocumentDir();

    if (newValueEqlDocDir || newValueEmptied) {
      this.__subscribe();
      alignDirs(this, getDocumentDir());
    } else if (newDiffValue) {
      this.__subscribe(false);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.__subscribe(false);
  }

  __subscribe(push = true) {
    if (push) {
      directionSubscribers.indexOf(this) === -1 &&
        directionSubscribers.push(this);
    } else {
      directionSubscribers.indexOf(this) > -1 &&
        directionSubscribers.splice(directionSubscribers.indexOf(this), 1);
    }
  }
};

const DEV_MODE_CODE_REGEXP =
  /\/\*\*\s+vaadin-dev-mode:start([\s\S]*)vaadin-dev-mode:end\s+\*\*\//i;

const FlowClients = window.Vaadin && window.Vaadin.Flow && window.Vaadin.Flow.clients;

function isMinified() {
  function test() {
    /** vaadin-dev-mode:start
    return false;
    vaadin-dev-mode:end **/
    return true;
  }
  return uncommentAndRun(test);
}

function isDevelopmentMode() {
  try {
    if (isForcedDevelopmentMode()) {
      return true;
    }

    if (!isLocalhost()) {
      return false;
    }

    if (FlowClients) {
      return !isFlowProductionMode();
    }

    return !isMinified();
  } catch (e) {
    // Some error in this code, assume production so no further actions will be taken
    return false;
  }
}

function isForcedDevelopmentMode() {
  return localStorage.getItem("vaadin.developmentmode.force");
}

function isLocalhost() {
  return (["localhost","127.0.0.1"].indexOf(window.location.hostname) >= 0);
}

function isFlowProductionMode() {
  if (FlowClients) {
    const productionModeApps = Object.keys(FlowClients)
      .map(key => FlowClients[key])
      .filter(client => client.productionMode);
    if (productionModeApps.length > 0) {
      return true;
    }
  }
  return false;
}

function uncommentAndRun(callback, args) {
  if (typeof callback !== 'function') {
    return;
  }

  const match = DEV_MODE_CODE_REGEXP.exec(callback.toString());
  if (match) {
    try {
      // requires CSP: script-src 'unsafe-eval'
      callback = new Function(match[1]);
    } catch (e) {
      // eat the exception
      console.log('vaadin-development-mode-detector: uncommentAndRun() failed', e);
    }
  }

  return callback(args);
}

// A guard against polymer-modulizer removing the window.Vaadin
// initialization above.
window['Vaadin'] = window['Vaadin'] || {};

/**
 * Inspects the source code of the given `callback` function for
 * specially-marked _commented_ code. If such commented code is found in the
 * callback source, uncomments and runs that code instead of the callback
 * itself. Otherwise runs the callback as is.
 *
 * The optional arguments are passed into the callback / uncommented code,
 * the result is returned.
 *
 * See the `isMinified()` function source code in this file for an example.
 *
 */
const runIfDevelopmentMode = function(callback, args) {
  if (window.Vaadin.developmentMode) {
    return uncommentAndRun(callback, args);
  }
};

if (window.Vaadin.developmentMode === undefined) {
  window.Vaadin.developmentMode = isDevelopmentMode();
}

/* This file is autogenerated from src/vaadin-usage-statistics.tpl.html */

function maybeGatherAndSendStats() {
  /** vaadin-dev-mode:start
  (function () {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var getPolymerVersion = function getPolymerVersion() {
  return window.Polymer && window.Polymer.version;
};

var StatisticsGatherer = function () {
  function StatisticsGatherer(logger) {
    classCallCheck(this, StatisticsGatherer);

    this.now = new Date().getTime();
    this.logger = logger;
  }

  createClass(StatisticsGatherer, [{
    key: 'frameworkVersionDetectors',
    value: function frameworkVersionDetectors() {
      return {
        'Flow': function Flow() {
          if (window.Vaadin && window.Vaadin.Flow && window.Vaadin.Flow.clients) {
            var flowVersions = Object.keys(window.Vaadin.Flow.clients).map(function (key) {
              return window.Vaadin.Flow.clients[key];
            }).filter(function (client) {
              return client.getVersionInfo;
            }).map(function (client) {
              return client.getVersionInfo().flow;
            });
            if (flowVersions.length > 0) {
              return flowVersions[0];
            }
          }
        },
        'Vaadin Framework': function VaadinFramework() {
          if (window.vaadin && window.vaadin.clients) {
            var frameworkVersions = Object.values(window.vaadin.clients).filter(function (client) {
              return client.getVersionInfo;
            }).map(function (client) {
              return client.getVersionInfo().vaadinVersion;
            });
            if (frameworkVersions.length > 0) {
              return frameworkVersions[0];
            }
          }
        },
        'AngularJs': function AngularJs() {
          if (window.angular && window.angular.version && window.angular.version) {
            return window.angular.version.full;
          }
        },
        'Angular': function Angular() {
          if (window.ng) {
            var tags = document.querySelectorAll("[ng-version]");
            if (tags.length > 0) {
              return tags[0].getAttribute("ng-version");
            }
            return "Unknown";
          }
        },
        'Backbone.js': function BackboneJs() {
          if (window.Backbone) {
            return window.Backbone.VERSION;
          }
        },
        'React': function React() {
          var reactSelector = '[data-reactroot], [data-reactid]';
          if (!!document.querySelector(reactSelector)) {
            // React does not publish the version by default
            return "unknown";
          }
        },
        'Ember': function Ember() {
          if (window.Em && window.Em.VERSION) {
            return window.Em.VERSION;
          } else if (window.Ember && window.Ember.VERSION) {
            return window.Ember.VERSION;
          }
        },
        'jQuery': function (_jQuery) {
          function jQuery() {
            return _jQuery.apply(this, arguments);
          }

          jQuery.toString = function () {
            return _jQuery.toString();
          };

          return jQuery;
        }(function () {
          if (typeof jQuery === 'function' && jQuery.prototype.jquery !== undefined) {
            return jQuery.prototype.jquery;
          }
        }),
        'Polymer': function Polymer() {
          var version = getPolymerVersion();
          if (version) {
            return version;
          }
        },
        'LitElement': function LitElement() {
          var version = window.litElementVersions && window.litElementVersions[0];
          if (version) {
            return version;
          }
        },
        'LitHtml': function LitHtml() {
          var version = window.litHtmlVersions && window.litHtmlVersions[0];
          if (version) {
            return version;
          }
        },
        'Vue.js': function VueJs() {
          if (window.Vue) {
            return window.Vue.version;
          }
        }
      };
    }
  }, {
    key: 'getUsedVaadinElements',
    value: function getUsedVaadinElements(elements) {
      var version = getPolymerVersion();
      var elementClasses = void 0;
      // NOTE: In case you edit the code here, YOU MUST UPDATE any statistics reporting code in Flow.
      // Check all locations calling the method getEntries() in
      // https://github.com/vaadin/flow/blob/master/flow-server/src/main/java/com/vaadin/flow/internal/UsageStatistics.java#L106
      // Currently it is only used by BootstrapHandler.
      if (version && version.indexOf('2') === 0) {
        // Polymer 2: components classes are stored in window.Vaadin
        elementClasses = Object.keys(window.Vaadin).map(function (c) {
          return window.Vaadin[c];
        }).filter(function (c) {
          return c.is;
        });
      } else {
        // Polymer 3: components classes are stored in window.Vaadin.registrations
        elementClasses = window.Vaadin.registrations || [];
      }
      elementClasses.forEach(function (klass) {
        var version = klass.version ? klass.version : "0.0.0";
        elements[klass.is] = { version: version };
      });
    }
  }, {
    key: 'getUsedVaadinThemes',
    value: function getUsedVaadinThemes(themes) {
      ['Lumo', 'Material'].forEach(function (themeName) {
        var theme;
        var version = getPolymerVersion();
        if (version && version.indexOf('2') === 0) {
          // Polymer 2: themes are stored in window.Vaadin
          theme = window.Vaadin[themeName];
        } else {
          // Polymer 3: themes are stored in custom element registry
          theme = customElements.get('vaadin-' + themeName.toLowerCase() + '-styles');
        }
        if (theme && theme.version) {
          themes[themeName] = { version: theme.version };
        }
      });
    }
  }, {
    key: 'getFrameworks',
    value: function getFrameworks(frameworks) {
      var detectors = this.frameworkVersionDetectors();
      Object.keys(detectors).forEach(function (framework) {
        var detector = detectors[framework];
        try {
          var version = detector();
          if (version) {
            frameworks[framework] = { version: version };
          }
        } catch (e) {}
      });
    }
  }, {
    key: 'gather',
    value: function gather(storage) {
      var storedStats = storage.read();
      var gatheredStats = {};
      var types = ["elements", "frameworks", "themes"];

      types.forEach(function (type) {
        gatheredStats[type] = {};
        if (!storedStats[type]) {
          storedStats[type] = {};
        }
      });

      var previousStats = JSON.stringify(storedStats);

      this.getUsedVaadinElements(gatheredStats.elements);
      this.getFrameworks(gatheredStats.frameworks);
      this.getUsedVaadinThemes(gatheredStats.themes);

      var now = this.now;
      types.forEach(function (type) {
        var keys = Object.keys(gatheredStats[type]);
        keys.forEach(function (key) {
          if (!storedStats[type][key] || _typeof(storedStats[type][key]) != _typeof({})) {
            storedStats[type][key] = { firstUsed: now };
          }
          // Discards any previously logged version number
          storedStats[type][key].version = gatheredStats[type][key].version;
          storedStats[type][key].lastUsed = now;
        });
      });

      var newStats = JSON.stringify(storedStats);
      storage.write(newStats);
      if (newStats != previousStats && Object.keys(storedStats).length > 0) {
        this.logger.debug("New stats: " + newStats);
      }
    }
  }]);
  return StatisticsGatherer;
}();

var StatisticsStorage = function () {
  function StatisticsStorage(key) {
    classCallCheck(this, StatisticsStorage);

    this.key = key;
  }

  createClass(StatisticsStorage, [{
    key: 'read',
    value: function read() {
      var localStorageStatsString = localStorage.getItem(this.key);
      try {
        return JSON.parse(localStorageStatsString ? localStorageStatsString : '{}');
      } catch (e) {
        return {};
      }
    }
  }, {
    key: 'write',
    value: function write(data) {
      localStorage.setItem(this.key, data);
    }
  }, {
    key: 'clear',
    value: function clear() {
      localStorage.removeItem(this.key);
    }
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      var storedStats = this.read();
      var empty = true;
      Object.keys(storedStats).forEach(function (key) {
        if (Object.keys(storedStats[key]).length > 0) {
          empty = false;
        }
      });

      return empty;
    }
  }]);
  return StatisticsStorage;
}();

var StatisticsSender = function () {
  function StatisticsSender(url, logger) {
    classCallCheck(this, StatisticsSender);

    this.url = url;
    this.logger = logger;
  }

  createClass(StatisticsSender, [{
    key: 'send',
    value: function send(data, errorHandler) {
      var logger = this.logger;

      if (navigator.onLine === false) {
        logger.debug("Offline, can't send");
        errorHandler();
        return;
      }
      logger.debug("Sending data to " + this.url);

      var req = new XMLHttpRequest();
      req.withCredentials = true;
      req.addEventListener("load", function () {
        // Stats sent, nothing more to do
        logger.debug("Response: " + req.responseText);
      });
      req.addEventListener("error", function () {
        logger.debug("Send failed");
        errorHandler();
      });
      req.addEventListener("abort", function () {
        logger.debug("Send aborted");
        errorHandler();
      });
      req.open("POST", this.url);
      req.setRequestHeader("Content-Type", "application/json");
      req.send(data);
    }
  }]);
  return StatisticsSender;
}();

var StatisticsLogger = function () {
  function StatisticsLogger(id) {
    classCallCheck(this, StatisticsLogger);

    this.id = id;
  }

  createClass(StatisticsLogger, [{
    key: '_isDebug',
    value: function _isDebug() {
      return localStorage.getItem("vaadin." + this.id + ".debug");
    }
  }, {
    key: 'debug',
    value: function debug(msg) {
      if (this._isDebug()) {
        console.info(this.id + ": " + msg);
      }
    }
  }]);
  return StatisticsLogger;
}();

var UsageStatistics = function () {
  function UsageStatistics() {
    classCallCheck(this, UsageStatistics);

    this.now = new Date();
    this.timeNow = this.now.getTime();
    this.gatherDelay = 10; // Delay between loading this file and gathering stats
    this.initialDelay = 24 * 60 * 60;

    this.logger = new StatisticsLogger("statistics");
    this.storage = new StatisticsStorage("vaadin.statistics.basket");
    this.gatherer = new StatisticsGatherer(this.logger);
    this.sender = new StatisticsSender("https://tools.vaadin.com/usage-stats/submit", this.logger);
  }

  createClass(UsageStatistics, [{
    key: 'maybeGatherAndSend',
    value: function maybeGatherAndSend() {
      var _this = this;

      if (localStorage.getItem(UsageStatistics.optOutKey)) {
        return;
      }
      this.gatherer.gather(this.storage);
      setTimeout(function () {
        _this.maybeSend();
      }, this.gatherDelay * 1000);
    }
  }, {
    key: 'lottery',
    value: function lottery() {
      return true;
    }
  }, {
    key: 'currentMonth',
    value: function currentMonth() {
      return this.now.getYear() * 12 + this.now.getMonth();
    }
  }, {
    key: 'maybeSend',
    value: function maybeSend() {
      var firstUse = Number(localStorage.getItem(UsageStatistics.firstUseKey));
      var monthProcessed = Number(localStorage.getItem(UsageStatistics.monthProcessedKey));

      if (!firstUse) {
        // Use a grace period to avoid interfering with tests, incognito mode etc
        firstUse = this.timeNow;
        localStorage.setItem(UsageStatistics.firstUseKey, firstUse);
      }

      if (this.timeNow < firstUse + this.initialDelay * 1000) {
        this.logger.debug("No statistics will be sent until the initial delay of " + this.initialDelay + "s has passed");
        return;
      }
      if (this.currentMonth() <= monthProcessed) {
        this.logger.debug("This month has already been processed");
        return;
      }
      localStorage.setItem(UsageStatistics.monthProcessedKey, this.currentMonth());
      // Use random sampling
      if (this.lottery()) {
        this.logger.debug("Congratulations, we have a winner!");
      } else {
        this.logger.debug("Sorry, no stats from you this time");
        return;
      }

      this.send();
    }
  }, {
    key: 'send',
    value: function send() {
      // Ensure we have the latest data
      this.gatherer.gather(this.storage);

      // Read, send and clean up
      var data = this.storage.read();
      data["firstUse"] = Number(localStorage.getItem(UsageStatistics.firstUseKey));
      data["usageStatisticsVersion"] = UsageStatistics.version;
      var info = 'This request contains usage statistics gathered from the application running in development mode. \n\nStatistics gathering is automatically disabled and excluded from production builds.\n\nFor details and to opt-out, see https://github.com/vaadin/vaadin-usage-statistics.\n\n\n\n';
      var self = this;
      this.sender.send(info + JSON.stringify(data), function () {
        // Revert the 'month processed' flag
        localStorage.setItem(UsageStatistics.monthProcessedKey, self.currentMonth() - 1);
      });
    }
  }], [{
    key: 'version',
    get: function get$1() {
      return '2.1.0';
    }
  }, {
    key: 'firstUseKey',
    get: function get$1() {
      return 'vaadin.statistics.firstuse';
    }
  }, {
    key: 'monthProcessedKey',
    get: function get$1() {
      return 'vaadin.statistics.monthProcessed';
    }
  }, {
    key: 'optOutKey',
    get: function get$1() {
      return 'vaadin.statistics.optout';
    }
  }]);
  return UsageStatistics;
}();

try {
  window.Vaadin = window.Vaadin || {};
  window.Vaadin.usageStatsChecker = window.Vaadin.usageStatsChecker || new UsageStatistics();
  window.Vaadin.usageStatsChecker.maybeGatherAndSend();
} catch (e) {
  // Intentionally ignored as this is not a problem in the app being developed
}

}());

  vaadin-dev-mode:end **/
}

const usageStatistics = function() {
  if (typeof runIfDevelopmentMode === 'function') {
    return runIfDevelopmentMode(maybeGatherAndSendStats);
  }
};

if (!window.Vaadin) {
  window['Vaadin'] = {};
}

/**
 * Array of Vaadin custom element classes that have been finalized.
 */
window['Vaadin'].registrations = window.Vaadin.registrations || [];

// Use the hack to prevent polymer-modulizer from converting to exports
window['Vaadin'].developmentModeCallback = window.Vaadin.developmentModeCallback || {};
window['Vaadin'].developmentModeCallback['vaadin-usage-statistics'] = function() {
  if (usageStatistics) {
    usageStatistics();
  }
};

let statsJob;

const registered = new Set();

/**
 * @polymerMixin
 */
const ElementMixin = superClass => class VaadinElementMixin extends DirMixin(superClass) {
  /** @protected */
  static finalize() {
    super.finalize();

    const {is} = this;

    // Registers a class prototype for telemetry purposes.
    if (is && !registered.has(is)) {
      window.Vaadin.registrations.push(this);
      registered.add(is);

      if (window.Vaadin.developmentModeCallback) {
        statsJob = Debouncer.debounce(statsJob,
          idlePeriod, () => {
            window.Vaadin.developmentModeCallback['vaadin-usage-statistics']();
          }
        );
        enqueueDebouncer(statsJob);
      }
    }
  }
  constructor() {
    super();
    if (document.doctype === null) {
      console.warn(
        'Vaadin components require the "standards mode" declaration. Please add <!DOCTYPE html> to the HTML document.'
      );
    }
  }
};

const sortModules = (modules) => {
    return Object.keys(modules).sort((moduleNameA, moduleNameB) => {
        const vaadinA = moduleNameA.indexOf('vaadin-') === 0;
        const vaadinB = moduleNameB.indexOf('vaadin-') === 0;
        const prefixes = ['lumo-', 'material-'];
        const vaadinThemeA = prefixes.filter(p => moduleNameA.indexOf(p) === 0).length > 0;
        const vaadinThemeB = prefixes.filter(p => moduleNameB.indexOf(p) === 0).length > 0;
        let result;
        if (vaadinA !== vaadinB) {
            // Include vaadin core styles first
            result = vaadinA ? -1 : 1;
        }
        else if (vaadinThemeA !== vaadinThemeB) {
            // Include vaadin theme styles after that
            result = vaadinThemeA ? -1 : 1;
        }
        else {
            // Lastly include custom styles so they override all vaadin styles
            result = 0;
        }
        return result;
    });
};
class ThemableElement extends LitElement {
    static finalize() {
        super.finalize();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { modules } = DomModule.prototype;
        sortModules(modules).forEach(moduleName => {
            const themeFor = modules[moduleName].getAttribute('theme-for');
            if (themeFor) {
                themeFor.split(' ').forEach((themeForToken) => {
                    if (new RegExp(`^${themeForToken.split('*').join('.*')}$`).test(this.is)) {
                        this._includeStyle(moduleName);
                    }
                });
            }
        });
    }
    static _includeStyle(moduleName) {
        // Hack to bypass TypeScript private property check
        // eslint-disable-next-line dot-notation
        this['_styles'].push(unsafeCSS(cssFromModule(moduleName)));
    }
}

class VaadinElement extends ElementMixin(ThemableElement) {
    static finalize() {
        super.finalize();
    }
}

class TabBase extends VaadinElement {
    static get styles() {
        return css `
      :host {
        display: flex;
        flex-shrink: 0;
        box-sizing: border-box;
      }

      :host([hidden]) {
        display: none !important;
      }
    `;
    }
    render() {
        return html `
      <slot></slot>
    `;
    }
}

const ActiveStateMixin = (base) => {
    class ActiveState extends base {
        firstUpdated(props) {
            super.firstUpdated(props);
            this.addEventListener('mousedown', (event) => {
                this._onMouseDown(event);
            });
            this.addEventListener('keydown', (event) => {
                this._onKeyDown(event);
            });
            this.addEventListener('keyup', (event) => {
                this._onKeyUp(event);
            });
            this.addEventListener('touchstart', (event) => {
                this._onTouchStart(event);
            });
            this.addEventListener('touchend', (event) => {
                this._onTouchEnd(event);
            });
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            // `active` state is preserved when the element is disconnected between keydown and keyup events.
            // reproducible in `<vaadin-date-picker>` when closing on `Cancel` or `Today` click.
            if (this.hasAttribute('active')) {
                this.removeAttribute('active');
            }
        }
        _onKeyDown(event) {
            if (/^( |SpaceBar|Enter)$/.test(event.key) && !this.disabled && !event.defaultPrevented) {
                event.preventDefault();
                this._setActive(true);
            }
        }
        _onKeyUp(_event) {
            this._setActive(false);
        }
        _onMouseDown(event) {
            // Only process events for the left button.
            if (event.buttons !== 1 || this.disabled) {
                return;
            }
            this._setActive(true);
            const upListener = () => {
                this._setActive(false);
                document.removeEventListener('mouseup', upListener);
            };
            document.addEventListener('mouseup', upListener);
        }
        _onTouchStart(_event) {
            if (!this.disabled) {
                this._setActive(true);
            }
        }
        _onTouchEnd(_event) {
            this._setActive(false);
        }
        _setActive(active) {
            this.toggleAttribute('active', active);
        }
    }
    return ActiveState;
};

const DisabledStateMixin = (base) => {
    class DisabledState extends base {
        constructor() {
            super(...arguments);
            /**
             * If true, the user cannot interact with this element.
             */
            this.disabled = false;
        }
        update(props) {
            super.update(props);
            if (props.has('disabled')) {
                if (this.disabled) {
                    this.setAttribute('aria-disabled', 'true');
                }
                else if (props.get('disabled')) {
                    this.removeAttribute('aria-disabled');
                }
            }
        }
        click() {
            if (!this.disabled) {
                super.click();
            }
        }
    }
    __decorate([
        property({ type: Boolean, reflect: true })
    ], DisabledState.prototype, "disabled", void 0);
    return DisabledState;
};

// We consider the keyboard to be active if the window has received a keydown
// event since the last mousedown event.
let keyboardActive = false;
// Listen for top-level keydown and mousedown events.
// Use capture phase so we detect events even if they're handled.
window.addEventListener('keydown', () => {
    keyboardActive = true;
}, { capture: true });
window.addEventListener('mousedown', () => {
    keyboardActive = false;
}, { capture: true });
const FocusVisibleMixin = (base) => {
    class FocusVisible extends base {
        constructor() {
            super(...arguments);
            /**
             * Specify that this control should have input focus when the page loads.
             */
            this.autofocus = false;
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            // in non-Chrome browsers, blur does not fire on the element when it is disconnected.
            // reproducible in `<vaadin-date-picker>` when closing on `Cancel` or `Today` click.
            if (this.hasAttribute('focused')) {
                this._setFocused(false);
            }
        }
        firstUpdated(props) {
            super.firstUpdated(props);
            this.addEventListener('focusin', (event) => this._onFocusin(event));
            this.addEventListener('focusout', (event) => this._onFocusout(event));
            if (this.autofocus && !this.hasAttribute('disabled')) {
                window.requestAnimationFrame(() => {
                    this._autoFocus();
                });
            }
        }
        _autoFocus() {
            keyboardActive = true;
            this._setFocused(true);
        }
        _onFocusin(_event) {
            this._setFocused(true);
        }
        _onFocusout(_event) {
            this._setFocused(false);
        }
        _setFocused(focused) {
            this.toggleAttribute('focused', focused);
            // focus-visible (focus-ring) attribute should be set
            // when the element was focused from the keyboard.
            this.toggleAttribute('focus-ring', focused && keyboardActive);
        }
    }
    __decorate([
        property({ type: Boolean, reflect: true })
    ], FocusVisible.prototype, "autofocus", void 0);
    return FocusVisible;
};

const SelectedStateMixin = (base) => {
    class SelectedState extends base {
        constructor() {
            super(...arguments);
            /**
             * If true, the element is in selected state.
             */
            this.selected = false;
        }
        update(props) {
            if (props.has('disabled') && this.disabled) {
                this.selected = false;
            }
            super.update(props);
        }
        updated(props) {
            super.updated(props);
            if (props.has('selected')) {
                this.setAttribute('aria-selected', this.selected ? 'true' : 'false');
            }
        }
    }
    /**
     * Used for mixin detection because `instanceof` does not work with mixins.
     */
    SelectedState.hasSelectedStateMixin = true;
    __decorate([
        property({ type: Boolean, reflect: true })
    ], SelectedState.prototype, "selected", void 0);
    return SelectedState;
};

const TabMixin = (base) => {
    class Tab extends SelectedStateMixin(FocusVisibleMixin(ActiveStateMixin(DisabledStateMixin(base)))) {
        firstUpdated(props) {
            super.firstUpdated(props);
            this.setAttribute('role', 'tab');
        }
        _onKeyUp(event) {
            const willClick = this.hasAttribute('active');
            super._onKeyUp && super._onKeyUp(event);
            if (willClick) {
                const anchor = this.querySelector('a');
                if (anchor) {
                    anchor.click();
                }
            }
        }
    }
    return Tab;
};

/**
 * `<vaadin-tab>` is a Web Component providing an accessible and customizable tab.
 */
let VaadinTab = class VaadinTab extends TabMixin(TabBase) {
    static get version() {
        return '4.0.0-alpha2';
    }
};
VaadinTab.is = 'vaadin-tab';
VaadinTab = __decorate([
    customElement('vaadin-tab')
], VaadinTab);

const $_documentContainer$4 = document.createElement('template');

$_documentContainer$4.innerHTML = `<custom-style>
  <style>
    @font-face {
      font-family: 'lumo-icons';
      src: url(data:application/font-woff;charset=utf-8;base64,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) format('woff');
      font-weight: normal;
      font-style: normal;
    }

    html {
      --lumo-icons-align-center: "\\ea01";
      --lumo-icons-align-left: "\\ea02";
      --lumo-icons-align-right: "\\ea03";
      --lumo-icons-angle-down: "\\ea04";
      --lumo-icons-angle-left: "\\ea05";
      --lumo-icons-angle-right: "\\ea06";
      --lumo-icons-angle-up: "\\ea07";
      --lumo-icons-arrow-down: "\\ea08";
      --lumo-icons-arrow-left: "\\ea09";
      --lumo-icons-arrow-right: "\\ea0a";
      --lumo-icons-arrow-up: "\\ea0b";
      --lumo-icons-bar-chart: "\\ea0c";
      --lumo-icons-bell: "\\ea0d";
      --lumo-icons-calendar: "\\ea0e";
      --lumo-icons-checkmark: "\\ea0f";
      --lumo-icons-chevron-down: "\\ea10";
      --lumo-icons-chevron-left: "\\ea11";
      --lumo-icons-chevron-right: "\\ea12";
      --lumo-icons-chevron-up: "\\ea13";
      --lumo-icons-clock: "\\ea14";
      --lumo-icons-cog: "\\ea15";
      --lumo-icons-cross: "\\ea16";
      --lumo-icons-download: "\\ea17";
      --lumo-icons-dropdown: "\\ea18";
      --lumo-icons-edit: "\\ea19";
      --lumo-icons-error: "\\ea1a";
      --lumo-icons-eye: "\\ea1b";
      --lumo-icons-eye-disabled: "\\ea1c";
      --lumo-icons-menu: "\\ea1d";
      --lumo-icons-minus: "\\ea1e";
      --lumo-icons-ordered-list: "\\ea1f";
      --lumo-icons-phone: "\\ea20";
      --lumo-icons-photo: "\\ea21";
      --lumo-icons-play: "\\ea22";
      --lumo-icons-plus: "\\ea23";
      --lumo-icons-redo: "\\ea24";
      --lumo-icons-reload: "\\ea25";
      --lumo-icons-search: "\\ea26";
      --lumo-icons-undo: "\\ea27";
      --lumo-icons-unordered-list: "\\ea28";
      --lumo-icons-upload: "\\ea29";
      --lumo-icons-user: "\\ea2a";
    }
  </style>
</custom-style>`;

document.head.appendChild($_documentContainer$4.content);

const $_documentContainer$5 = document.createElement('template');

$_documentContainer$5.innerHTML = `<custom-style>
  <style>
    html {
      /* Square */
      --lumo-space-xs: 0.25rem;
      --lumo-space-s: 0.5rem;
      --lumo-space-m: 1rem;
      --lumo-space-l: 1.5rem;
      --lumo-space-xl: 2.5rem;

      /* Wide */
      --lumo-space-wide-xs: calc(var(--lumo-space-xs) / 2) var(--lumo-space-xs);
      --lumo-space-wide-s: calc(var(--lumo-space-s) / 2) var(--lumo-space-s);
      --lumo-space-wide-m: calc(var(--lumo-space-m) / 2) var(--lumo-space-m);
      --lumo-space-wide-l: calc(var(--lumo-space-l) / 2) var(--lumo-space-l);
      --lumo-space-wide-xl: calc(var(--lumo-space-xl) / 2) var(--lumo-space-xl);

      /* Tall */
      --lumo-space-tall-xs: var(--lumo-space-xs) calc(var(--lumo-space-xs) / 2);
      --lumo-space-tall-s: var(--lumo-space-s) calc(var(--lumo-space-s) / 2);
      --lumo-space-tall-m: var(--lumo-space-m) calc(var(--lumo-space-m) / 2);
      --lumo-space-tall-l: var(--lumo-space-l) calc(var(--lumo-space-l) / 2);
      --lumo-space-tall-xl: var(--lumo-space-xl) calc(var(--lumo-space-xl) / 2);
    }
  </style>
</custom-style>`;

document.head.appendChild($_documentContainer$5.content);

const tabsStyles = css `
  :host {
    -webkit-tap-highlight-color: transparent;
  }

  :host(:not([orientation='vertical'])) {
    box-shadow: inset 0 -1px 0 0 var(--lumo-contrast-10pct);
    position: relative;
    min-height: var(--lumo-size-l);
  }

  :host(:not([orientation='vertical'])) [part='tabs'] ::slotted(vaadin-tab:not([theme~='icon-on-top'])) {
    justify-content: center;
  }

  :host([orientation='vertical']) {
    box-shadow: -1px 0 0 0 var(--lumo-contrast-10pct);
  }

  :host(:not([orientation='vertical'])) [part='tabs'] {
    margin: 0 0.75rem;
  }

  :host([orientation='vertical']) [part='tabs'] {
    width: 100%;
    margin: 0.5rem 0;
  }

  [part='forward-button'],
  [part='back-button'] {
    position: absolute;
    z-index: 1;
    font-family: lumo-icons;
    color: var(--lumo-tertiary-text-color);
    font-size: var(--lumo-icon-size-m);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5em;
    height: 100%;
    transition: 0.2s opacity;
    top: 0;
  }

  [part='forward-button']:hover,
  [part='back-button']:hover {
    color: inherit;
  }

  [part='forward-button'] {
    right: 0;
  }

  [part='forward-button']::after {
    content: var(--lumo-icons-angle-right);
  }

  [part='back-button']::after {
    content: var(--lumo-icons-angle-left);
  }

  /* Tabs overflow */

  [part='tabs'] {
    --_lumo-tabs-overflow-mask-image: none;
    -webkit-mask-image: var(--_lumo-tabs-overflow-mask-image);
    /* For IE11 */
    min-height: var(--lumo-size-l);
  }

  /*
    TODO: CSS custom property in "mask-image" causes crash in older Edge versions
    see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/15415089/
  */
  @-moz-document url-prefix() {
    [part='tabs'] {
      mask-image: var(--_lumo-tabs-overflow-mask-image);
    }
  }

  /* Horizontal tabs overflow */

  /* Both ends overflowing */
  :host([overflow~='start'][overflow~='end']:not([orientation='vertical'])) [part='tabs'] {
    /* prettier-ignore */
    --_lumo-tabs-overflow-mask-image: linear-gradient(90deg, transparent 2em, #000 4em, #000 calc(100% - 4em), transparent calc(100% - 2em));
  }

  /* End overflowing */
  :host([overflow~='end']:not([orientation='vertical'])) [part='tabs'] {
    --_lumo-tabs-overflow-mask-image: linear-gradient(90deg, #000 calc(100% - 4em), transparent calc(100% - 2em));
  }

  /* Start overflowing */
  :host([overflow~='start']:not([orientation='vertical'])) [part='tabs'] {
    --_lumo-tabs-overflow-mask-image: linear-gradient(90deg, transparent 2em, #000 4em);
  }

  /* Vertical tabs overflow */

  /* Both ends overflowing */
  :host([overflow~='start'][overflow~='end'][orientation='vertical']) [part='tabs'] {
    --_lumo-tabs-overflow-mask-image: linear-gradient(transparent, #000 2em, #000 calc(100% - 2em), transparent);
  }

  /* End overflowing */
  :host([overflow~='end'][orientation='vertical']) [part='tabs'] {
    --_lumo-tabs-overflow-mask-image: linear-gradient(#000 calc(100% - 2em), transparent);
  }

  /* Start overflowing */
  :host([overflow~='start'][orientation='vertical']) [part='tabs'] {
    --_lumo-tabs-overflow-mask-image: linear-gradient(transparent, #000 2em);
  }

  :host [part='tabs'] ::slotted(:not(vaadin-tab)) {
    margin-left: var(--lumo-space-m);
  }

  /* Centered */
  :host([theme~='centered']:not([orientation='vertical'])) [part='tabs'] {
    justify-content: center;
  }

  /* Small */
  :host([theme~='small']),
  :host([theme~='small']) [part='tabs'] {
    min-height: var(--lumo-size-m);
  }

  :host([theme~='small']) [part='tabs'] ::slotted(vaadin-tab) {
    font-size: var(--lumo-font-size-s);
  }

  /* Minimal */
  :host([theme~='minimal']) {
    box-shadow: none;
    /* This doesn't work with ShadyCSS */
    --_lumo-tab-marker-display: none;
  }

  /* Workaround for the above ShadyCSS issue */
  :host([theme~='minimal']) [part='tabs'] ::slotted(vaadin-tab[selected])::before,
  :host([theme~='minimal']) [part='tabs'] ::slotted(vaadin-tab[selected])::after {
    display: none;
  }

  /* Hide-scroll-buttons */
  :host([theme~='hide-scroll-buttons']) [part='back-button'],
  :host([theme~='hide-scroll-buttons']) [part='forward-button'] {
    display: none;
  }

  /* prettier-ignore */
  :host([theme~='hide-scroll-buttons'][overflow~='start'][overflow~='end']:not([orientation='vertical'])) [part='tabs'] {
    --_lumo-tabs-overflow-mask-image: linear-gradient(90deg, transparent, #000 2em, #000 calc(100% - 2em), transparent 100%);
  }

  :host([theme~='hide-scroll-buttons'][overflow~='end']:not([orientation='vertical'])) [part='tabs'] {
    --_lumo-tabs-overflow-mask-image: linear-gradient(90deg, #000 calc(100% - 2em), transparent 100%);
  }

  :host([theme~='hide-scroll-buttons'][overflow~='start']:not([orientation='vertical'])) [part='tabs'] {
    --_lumo-tabs-overflow-mask-image: linear-gradient(90deg, transparent, #000 2em);
  }

  /* Equal-width tabs */
  :host([theme~='equal-width-tabs']) {
    flex: auto;
  }

  :host([theme~='equal-width-tabs']) [part='tabs'] ::slotted(vaadin-tab) {
    flex: 1 0 0%;
  }
`;

registerStyles('vaadin-tabs', tabsStyles);

const tabsStyles$1 = css `
  :host {
    display: flex;
    align-items: center;
  }

  :host([hidden]) {
    display: none !important;
  }

  :host([orientation='vertical']) {
    display: block;
  }

  :host(:not([orientation='vertical'])) [part='tabs'] {
    flex-grow: 1;
    display: flex;
    align-self: stretch;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    -ms-overflow-style: none;
  }

  @-moz-document url-prefix() {
    :host(:not([orientation='vertical'])) [part='tabs'] {
      overflow: hidden;
    }
  }

  :host(:not([orientation='vertical'])) [part='tabs']::-webkit-scrollbar {
    display: none;
  }

  :host([orientation='vertical']) [part='tabs'] {
    height: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  [part='back-button'],
  [part='forward-button'] {
    pointer-events: none;
    opacity: 0;
    cursor: default;
  }

  :host([overflow~='start']) [part='back-button'],
  :host([overflow~='end']) [part='forward-button'] {
    pointer-events: auto;
    opacity: 1;
  }

  [part='back-button']::after {
    content: '◀';
  }

  [part='forward-button']::after {
    content: '▶';
  }

  :host([orientation='vertical']) [part='back-button'],
  :host([orientation='vertical']) [part='forward-button'] {
    display: none;
  }
`;

class TabsBase extends VaadinElement {
    static get styles() {
        return tabsStyles$1;
    }
}

const appliedMixins = new Set();
function getPrototypeChain(obj) {
    const chain = [];
    let proto = obj;
    while (proto) {
        chain.push(proto);
        proto = Object.getPrototypeOf(proto);
    }
    return chain;
}
function wasApplied(superClass) {
    const classes = getPrototypeChain(superClass);
    return classes.reduce((res, klass) => res || appliedMixins.has(klass), false);
}
function DirectionMixin(base) {
    if (wasApplied(base)) {
        return base;
    }
    class Direction extends base {
        get _vertical() {
            return false;
        }
    }
    appliedMixins.add(Direction);
    return Direction;
}

const isFocusable = (item) => !item.hasAttribute('disabled') && !item.hasAttribute('hidden');
/**
 * Returns index of the next item that satisfies the given condition,
 * based on the index of the current item and a numeric increment.
 *
 * @param {Element[]} items - array of items to iterate over
 * @param {number} index - index of the current item
 * @param {number} increment - numeric increment, can be either 1 or -1
 * @param {ItemCondition} condition - function that accepts item as a parameter
 */
const getAvailableIndex = (items, index, increment, condition) => {
    const totalItems = items.length;
    let idx = index;
    for (let i = 0; typeof idx === 'number' && i < totalItems; i += 1, idx += increment || 1) {
        if (idx < 0) {
            idx = totalItems - 1;
        }
        else if (idx >= totalItems) {
            idx = 0;
        }
        const item = items[idx];
        if (condition(item)) {
            return idx;
        }
    }
    return -1;
};
const KeyboardDirectionMixin = (base) => {
    const Base = DirectionMixin(base);
    class KeyboardDirection extends Base {
        focus() {
            const first = this.items.length ? this.items[0] : null;
            if (first) {
                first.focus();
            }
        }
        get focused() {
            const root = this.getRootNode();
            return root ? root.activeElement : null;
        }
        firstUpdated(props) {
            super.firstUpdated(props);
            this.addEventListener('keydown', (event) => {
                this._onKeyDown(event);
            });
        }
        _onKeyDown(event) {
            if (event.metaKey || event.ctrlKey) {
                return;
            }
            const { key } = event;
            const { items, focused } = this;
            const currentIdx = items.findIndex(item => focused === item);
            let idx;
            let increment;
            const isRTL = !this._vertical && this.getAttribute('dir') === 'rtl';
            const dirIncrement = isRTL ? -1 : 1;
            if (this._isPrevKey(key)) {
                increment = -dirIncrement;
                idx = currentIdx - dirIncrement;
            }
            else if (this._isNextKey(key)) {
                increment = dirIncrement;
                idx = currentIdx + dirIncrement;
            }
            else if ((key === 'Home' && !isRTL) || (key === 'End' && isRTL)) {
                increment = 1;
                idx = 0;
            }
            else if ((key === 'End' && !isRTL) || (key === 'Home' && isRTL)) {
                increment = -1;
                idx = items.length - 1;
            }
            idx = getAvailableIndex(items, idx, increment, isFocusable);
            if (idx >= 0) {
                event.preventDefault();
                const item = items[idx];
                if (item) {
                    this._focus(item);
                }
            }
        }
        _isPrevKey(key) {
            return this._vertical ? key === 'ArrowUp' : key === 'ArrowLeft';
        }
        _isNextKey(key) {
            return this._vertical ? key === 'ArrowDown' : key === 'ArrowRight';
        }
        _focus(item) {
            item.focus();
        }
    }
    return KeyboardDirection;
};

const OrientationMixin = (base) => {
    const Base = DirectionMixin(base);
    class Orientation extends Base {
        firstUpdated(props) {
            super.firstUpdated(props);
            this._setOrientation();
        }
        updated(props) {
            super.updated(props);
            if (props.has('orientation')) {
                this._setOrientation();
            }
        }
        get _vertical() {
            return this.orientation === 'vertical';
        }
        _setOrientation() {
            this.setAttribute('aria-orientation', this.orientation === 'vertical' ? 'vertical' : 'horizontal');
        }
    }
    __decorate([
        property({ type: String, reflect: true })
    ], Orientation.prototype, "orientation", void 0);
    return Orientation;
};

const RovingTabIndexMixin = (base) => {
    class RovingTabIndex extends base {
        focus() {
            const first = this.querySelector('[tabindex="0"]') ||
                (this.items.length ? this.items[0] : null);
            if (first) {
                first.focus();
            }
        }
        _itemsChanged(items, oldItems) {
            super._itemsChanged && super._itemsChanged(items, oldItems);
            if (items) {
                const { focused } = this;
                this._setFocusable(focused && this.contains(focused) ? items.indexOf(focused) : 0);
            }
        }
        _setFocusable(idx) {
            const index = getAvailableIndex(this.items, idx, 1, isFocusable);
            this._setTabIndex(this.items[index]);
        }
        _setTabIndex(item) {
            this.items.forEach((el) => {
                // eslint-disable-next-line no-param-reassign
                el.tabIndex = el === item ? 0 : -1;
            });
        }
        _focus(item) {
            super._focus && super._focus(item);
            this._setTabIndex(item);
        }
    }
    return RovingTabIndex;
};

const SelectionInViewMixin = (base) => {
    class SelectionInView extends base {
        /* istanbul ignore next */
        get _scrollTarget() {
            return this;
        }
        updated(props) {
            super.updated(props);
            if (props.has('selected') && this.selected != null) {
                const item = this.items[this.selected];
                if (item && !item.hasAttribute('disabled')) {
                    this._scrollToItem(item);
                }
            }
        }
        _focus(item) {
            super._focus && super._focus(item);
            this._scrollToItem(item);
        }
        _scroll(distance) {
            const prop = this._vertical ? 'scrollTop' : 'scrollLeft';
            this._scrollTarget[prop] += distance;
        }
        _scrollToItem(item) {
            const idx = this.items.indexOf(item);
            let distance = 0;
            const props = this._vertical
                ? ['top', 'bottom']
                : ['left', 'right'];
            const scrollerRect = this._scrollTarget.getBoundingClientRect();
            const nextItemRect = (this.items[idx + 1] || item).getBoundingClientRect();
            const prevItemRect = (this.items[idx - 1] || item).getBoundingClientRect();
            if (nextItemRect[props[1]] >= scrollerRect[props[1]]) {
                distance = nextItemRect[props[1]] - scrollerRect[props[1]];
            }
            else if (prevItemRect[props[0]] <= scrollerRect[props[0]]) {
                distance = prevItemRect[props[0]] - scrollerRect[props[0]];
            }
            this._scroll(distance);
        }
    }
    return SelectionInView;
};

const filterItems = (nodes) => {
    return nodes.filter((node) => {
        return (node.nodeType === Node.ELEMENT_NODE &&
            node.constructor.hasSelectedStateMixin);
    });
};
const SingleSelectionMixin = (base) => {
    class SingleSelection extends base {
        firstUpdated(props) {
            super.firstUpdated(props);
            this.addEventListener('click', event => {
                this._onClick(event);
            });
            this.addEventListener('keyup', event => {
                this._onKeyUp(event);
            });
        }
        updated(props) {
            super.updated(props);
            if (props.has('selected')) {
                const { items, selected } = this;
                items.forEach((item, idx) => {
                    // eslint-disable-next-line no-param-reassign
                    item.selected = idx === selected;
                });
                this.dispatchEvent(new CustomEvent('selected-changed', {
                    detail: { value: this.selected }
                }));
            }
        }
        _onClick(event) {
            this._setSelected(event);
        }
        _onKeyUp(event) {
            if (/^( |SpaceBar|Enter)$/.test(event.key)) {
                this._setSelected(event);
            }
        }
        _setSelected(event) {
            if (event.metaKey || event.shiftKey || event.ctrlKey) {
                return;
            }
            const path = event.composedPath();
            const item = filterItems(path)[0];
            const idx = this.items.indexOf(item);
            if (item && !item.disabled && idx >= 0) {
                this.selected = idx;
            }
        }
    }
    __decorate([
        property({ type: Number, reflect: true })
    ], SingleSelection.prototype, "selected", void 0);
    return SingleSelection;
};

const SlottedItemsMixin = (base) => {
    class SlottedItems extends base {
        constructor() {
            super(...arguments);
            this._items = [];
        }
        get items() {
            return this._items;
        }
        connectedCallback() {
            super.connectedCallback();
            this._items = this._filterItems();
        }
        update(props) {
            /* istanbul ignore else */
            if (props.has('_items')) {
                this._itemsChanged(this._items, (props.get('_items') || []));
            }
            super.update(props);
        }
        firstUpdated(props) {
            super.firstUpdated(props);
            const slot = this.renderRoot.querySelector('slot');
            /* istanbul ignore else */
            if (slot) {
                slot.addEventListener('slotchange', () => {
                    this._items = this._filterItems();
                });
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _itemsChanged(items, _oldItems) {
            this.dispatchEvent(new CustomEvent('items-changed', {
                detail: {
                    value: items
                }
            }));
        }
        _filterItems() {
            return Array.from(this.children);
        }
    }
    __decorate([
        property({ attribute: false, hasChanged: () => true })
    ], SlottedItems.prototype, "_items", void 0);
    return SlottedItems;
};

let RO;
async function init() {
    RO = window.ResizeObserver;
    /* istanbul ignore next */
    try {
        new RO(() => { }); // eslint-disable-line
    }
    catch (e) {
        RO = (await import('../common/ResizeObserver.es-fbae82ae.js')).default;
    }
    return RO;
}
async function getResizeObserver() {
    return RO !== undefined ? RO : init();
}

const ResizableMixin = (base) => {
    class Resizable extends base {
        connectedCallback() {
            super.connectedCallback();
            this._initResizeObserver().then(() => {
                const observer = Resizable._resizeObserver;
                if (observer && this.isConnected) {
                    observer.observe(this);
                }
            });
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            const observer = Resizable._resizeObserver;
            if (observer) {
                observer.unobserve(this);
            }
        }
        async _initResizeObserver() {
            const observer = Resizable._resizeObserver;
            if (observer == null) {
                const ResizeObserver = await getResizeObserver();
                // @ts-ignore
                Resizable._resizeObserver = new ResizeObserver((entries) => {
                    entries.forEach(entry => {
                        entry.target._sizeChanged(entry.contentRect);
                    });
                });
            }
        }
        _sizeChanged(contentRect) {
            this.dispatchEvent(new CustomEvent('resize', {
                detail: {
                    contentRect
                }
            }));
        }
    }
    return Resizable;
};

const TabsMixin = (base) => {
    class Tabs extends ResizableMixin(SelectionInViewMixin(SingleSelectionMixin(OrientationMixin(RovingTabIndexMixin(KeyboardDirectionMixin(SlottedItemsMixin(base))))))) {
        constructor() {
            super();
            this.selected = 0;
        }
        static get styles() {
            return tabsStyles$1;
        }
        render() {
            return html `
        <div @click="${this._scrollBack}" part="back-button"></div>

        <div part="tabs" @scroll="${this._onScroll}">
          <slot></slot>
        </div>

        <div @click="${this._scrollForward}" part="forward-button"></div>
      `;
        }
        firstUpdated(props) {
            super.firstUpdated(props);
            this.setAttribute('role', 'tablist');
            this._scroller = this.renderRoot.querySelector('[part="tabs"]');
            // Wait for the vaadin-tab elements to upgrade and get styled
            const tabsComplete = this.items.map(tab => tab.updateComplete);
            Promise.all(tabsComplete).then(() => {
                this._updateOverflow();
            });
        }
        updated(props) {
            if (props.has('orientation') || props.has('_items')) {
                // NOTE: we need "orientation" on individual tabs for styling selected state,
                // because Safari does not support `::before` and `::after` with `::slotted`
                // See https://bugs.webkit.org/show_bug.cgi?id=178237
                this.items.forEach(item => {
                    if (this.orientation) {
                        item.setAttribute('orientation', this.orientation);
                    }
                    else {
                        item.removeAttribute('orientation');
                    }
                });
                this._updateOverflow();
            }
            // Ensure scroll to item is called after "overflow" update
            super.updated(props);
        }
        _sizeChanged(contentRect) {
            // Ensure resize event is fired after "overflow" update
            this._updateOverflow();
            super._sizeChanged && super._sizeChanged(contentRect);
        }
        _onScroll() {
            this._updateOverflow();
        }
        get _overflow() {
            const { scrollTop, scrollLeft, scrollHeight, scrollWidth } = this._scrollTarget;
            const scrollPosition = this._vertical ? scrollTop : scrollLeft;
            let scrollSize = this._vertical ? scrollHeight : scrollWidth;
            // In Edge we need to adjust the size in 1 pixel
            scrollSize -= 1;
            let result = scrollPosition > 0 ? 'start' : '';
            result += scrollPosition + this._scrollOffset < scrollSize ? ' end' : '';
            return result.trim();
        }
        _scrollForward() {
            this._scroll && this._scroll(this._scrollOffset);
        }
        _scrollBack() {
            this._scroll && this._scroll(-1 * this._scrollOffset);
        }
        get _scrollOffset() {
            return this._vertical ? this._scrollTarget.offsetHeight : this._scrollTarget.offsetWidth;
        }
        get _scrollTarget() {
            return this._scroller;
        }
        _updateOverflow() {
            const overflow = this._overflow;
            if (overflow) {
                this.setAttribute('overflow', overflow);
            }
            else {
                this.removeAttribute('overflow');
            }
        }
    }
    return Tabs;
};

/**
 * `<vaadin-tabs>` is a Web Component for easy switching between different views.
 *
 * @attr {start | none | both} overflow - Attribute set depending on whether the items fit into viewport.
 *
 * @csspart back-button - Button for moving the scroll back
 * @csspart forward-button - Button for moving the scroll forward
 * @csspart tabs - The tabs container
 *
 * @event selected-changed - Fired when the `selected` property changes.
 * @event resize - Fired when the element is resized. Non-bubbling.
 */
let VaadinTabs = class VaadinTabs extends TabsMixin(TabsBase) {
    static get version() {
        return '4.0.0-alpha2';
    }
    _filterItems() {
        return Array.from(this.querySelectorAll(VaadinTab.is));
    }
};
VaadinTabs.is = 'vaadin-tabs';
VaadinTabs = __decorate([
    customElement('vaadin-tabs')
], VaadinTabs);

export { VaadinTabs };
