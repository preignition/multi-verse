[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://beta.webcomponents.org/element/polymerEl/multi-verse)

# \<multi-verse\>

polymer elements for multivariate analysis (built on top of [multi-chart](https://github.com/PolymerEl/multi-chart), and [universe](https://github.com/crossfilter/universe))



## Example of multi-verse in a interactive dashboard

<div>
  <img src="https://raw.githubusercontent.com/PolymerEl/multi-verse/master/images/analysis.png" width="600"></img>
</div>

## Other advanced example - available from the demo

<div>
  <img src="https://raw.githubusercontent.com/PolymerEl/multi-verse/master/images/dash.png" width="600"></img>
</div>

## Simple Example

```html
 <!-- Load the data -->
	<multi-csv url="flight.csv" data="{{data}}"></multi-csv>
 <!-- Start a multi-verse -->
  <multi-verse id="universe" data="[[data]]" universe="{{universe}}">
 		<!-- Group the data by distances-->
    <multi-group universe="[[universe]]" data="{{data-chart-distance}}" group-by="distances">
 			<!-- Render this group in a bar chart-->
      <multi-verse-bar title="distance" data="[[data-chart-distance]]"> </multi-verse-bar>
    </multi-group>
 		<!-- Group the data by day-->
    <multi-group universe="[[universe]]" data="{{data-chart-day}}" group-by="day">
 			<!-- Render this group in a pie chart-->
      <multi-verse-pie title="day (pie)" data="[[data-chart-day]]" color-scale="{{colorScale}}" width="{{width}}">
      	<!-- Add a color scale legend to the chart -->
        <multi-legend legend chart-width="[[width]]" scale="[[colorScale]]" position="top-right"></multi-legend>
      </multi-verse-pie>
    </multi-group>
  </multi-verse>
```





