#d3-bundle-element


Builds of custom D3 4.0 bundle using ES2015 modules and [Rollup](http://rollupjs.org). Those builds are then integrated in custom web component for easy integration with polymer: 
- d3-bundle-element: imports the full d3.js library (d3-bundle-element-debug for the non-minified version)
- d3-element-small: imports core functionalites of d3.js library, mainly `d3-selection`, `d3-transition`, `d3-ease`, `d3-collection`, `d3-color`, `d3-format`, `d3-interpolate` and `d3-scale`  (d3-element-small-debug for the non-minified version)
- d3-element-multi: imports the full version of d3, plus d3-svg-legend. used in [multichart](https://github.com/PolymerEl/multichart) and [multiverse](https://github.com/PolymerEl/multiverse) (d3-element-multi-debug for the non-minified version)
- d3-element-shape: imports `d3-shape` and `d3-path` (d3-element-shape-debug for the non-minified version)


To build:

```
npm install
npm run prepublish
``


```
