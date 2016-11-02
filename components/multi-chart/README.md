# \<multi-chart\>

[Demo and API docs](http://polymerel.github.io/multi-chart/components/multi-chart/#multi-chart-geo)

A set of polymer elements for building reusable, modular and standard-based charts. 

This library works well with [\<multi-verse\>](https://github.com/PolymerEl/multi-verse), polymer elements for fast multivariate analysis of large dataset.
 
## Dependencies 
Multi-chart is heavily coupled to d3.js (v4).  
To use multi-chart, either import build of d3.js customized for multi-chart available under [d3-bundle-element/d3-bundle-element-multi.html](https://github.com/PolymerEl/d3-bundle), or make sure the following d3-plugins are available on the client:
- d3-svg-legend,
- d3-hexbin

For maps, multi-chart also requires topojson, available as a web-component under [d3-bundle-element/topojson-element-multi.html](https://github.com/PolymerEl/d3-bundle)

## Simple Examples

### Pie chart

Example of a very simple pie chart, along with chart legend (\<multi-legend\>)and a selector to select pie arcs (\<multi-selector\>) 
```html
 <multi-chart-simple 
      id="chart" 
      title="test pie" 
      width="{{width}}" 
      height="{{height}}" 
      center="{{center}}" 

      color-scale="{{colorScale}}" 
      key-accessor-path="[[keyAccessorPath]]" 
      key-accessor="{{keyAccessor}}" 
      value-accessor-path="[[valueAccessorPath]]" 
      value-accessor="{{valueAccessor}}" 
       >
      <d3-pie  data="{{arcs}}" value="[[valueAccessor]]" pad-angle="[[padAngle]]" sort="[[sort]]" sort-values="[[sortValues]]"></d3-pie>
      <multi-shape-pie 
        width="[[width]]" 
        height="[[height]]" 
        center="[[center]]" 
        arcs="[[arcs]]"
        inner-radius="[[innerRadius]]"
        color-scale="[[colorScale]]"></multi-shape-pie>
       <multi-selector selection-type="select" accessor="[[keyAccessor]]"></multi-selector>  
       <multi-legend legend chart-width="[[width]]" scale="[[colorScale]]" position="top-right" ></multi-legend>

    </multi-chart-simple>

```
<div>
  <img src="https://raw.githubusercontent.com/PolymerEl/multi-chart/master/images/chart-pie.png" width="300"></img>
</div>


## How it works
As illustrated under the pie-chart example above, multi-chart uses the compose-able nature of Polymer and web-components to construct a chart. 

However, as Polymer does not support external namespaces, we cheat with the way charting elements (e.g axis, series, legend, topojson features, ...) are inserted into main chart as chart components.

Each chart as a container (either \<multi-container-simple\> for simple charts or \<multi-container-coordinate\> for charts with x and y coordinates). The chart container provides the backbone structure of the chart itself - with anchors for specific chart components (e.g axis will be inserted within the \<g id="axisGroup"\>\</g\> :

```html
 <svg id="svg">
    <g id="chartContent" transform$="[[translate(margin.left, margin.top)]]">
      <g id="zoom">
        <g id="chart" class="chart">
        </g>
      </g>
      <g id="axisGroup"></g>
    </g>
    <g id="legend"></g>
  </svg>
```

Chart containers listen to inserted charting web-component. When the `shallRegister` property of a new charting web-component is set to true, those new nodes are registered as part of the chart (and hence will be redrawn e.g. when data changes). 

This approach allows Polymer native data-binding to still work and provides enough flexibility to construct complex charts as a composition of smaller web-components


## Other examples 

### Bar chart

<div>
  <img src="https://raw.githubusercontent.com/PolymerEl/multi-chart/master/images/chart-bar.png" width="300"></img>
</div>


### Stack chart
Example of a stack chart:
```html
<multi-chart-coordinate id="chart" title="test stack chart" width="{{width}}" height="{{height}}" y-domain="[[yDomain]]" color-scale="{{colorScale}}" x-scale="{{xScale}}" y-scale="{{yScale}}" color-domain="[[keys]]" series="{{series}}" keys="{{keys}}" >
  <d3-stack domain="{{yDomain}}" data="{{stack}}" domain-min="[[domainMin]]" value="[[value]]" value-path="[[valuePath]]" order="[[order]]" offset="[[offset]]" keys="[[keys]]"></d3-stack>
  <multi-shape-stack chart  stack="[[stack]]" x-scale="[[xScale]]"  y-scale="[[yScale]]"    color-scale="[[colorScale]]"></multi-shape-stack>
  <multi-serie serie key="apple" label="apple"></multi-serie>
  <multi-serie serie key="banana" label="banana"></multi-serie>
  <multi-serie serie key="grape" label="grape"></multi-serie>
  <multi-legend legend chart-width="{{width}}" scale="[[colorScale]]" position="top-right" ></multi-legend>
  <multi-selector selection-type="brushX" width="[[width]]"  height="[[height]]" x-scale="[[xScale]]" accessor="[[keyAccessor]]"></multi-selector> 
</multi-chart-coordinate>
```          
<div>
  <img src="https://raw.githubusercontent.com/PolymerEl/multi-chart/master/images/chart-stack.png" width="300"></img>
</div>

### Bubble Chart
Example of a bubble chart:
<div>
  <img src="https://raw.githubusercontent.com/PolymerEl/multi-chart/master/images/chart-bubble.png" width="300"></img>
</div>


### Choropleth chart
Example of a choropleth chart:
<div>
  <img src="https://raw.githubusercontent.com/PolymerEl/multi-chart/master/images/chart-choropleth.png" width="300"></img>
</div>


