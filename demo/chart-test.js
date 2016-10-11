Object.assign(d3, d3Charts);

var data = [
  { "key": 0, "value": { "count": 20 } }, { "key": 1, "value": { "count": 4 } }, { "key": 3, "value": { "count": 1 } }, { "key": 5, "value": { "count": 42 } }, { "key": 6, "value": { "count": 1412 } }, { "key": 7, "value": { "count": 1958 } }, { "key": 8, "value": { "count": 1917 } }, { "key": 9, "value": { "count": 1706 } }, { "key": 10, "value": { "count": 1634 } }, { "key": 11, "value": { "count": 1760 } }, { "key": 12, "value": { "count": 1814 } }, { "key": 13, "value": { "count": 1684 } }, { "key": 14, "value": { "count": 1744 } }, { "key": 15, "value": { "count": 1754 } }, { "key": 16, "value": { "count": 1745 } }, { "key": 17, "value": { "count": 2022 } }, { "key": 18, "value": { "count": 1877 } }, { "key": 19, "value": { "count": 1768 } }, { "key": 20, "value": { "count": 1604 } }, { "key": 21, "value": { "count": 1310 } }, { "key": 22, "value": { "count": 493 } }, { "key": 23, "value": { "count": 126 } }
]

var c = d3.barChart(d3.select('#chart'))
// var formatDate = d3_time_format.timeParse('%d-%b-%y');

// var lineChart = d3_line_chart.chart()
var lineChart = d3.lineChart()
                  .width(700)
                  .height(400)
                  // .margin({top: 20, right: 30, bottom: 30, left: 40})
                  .xValue(function(d) {
                  	return d.key
                    // return formatDate(d.date);
                  })
                  .yValue(function(d) {
                  	return +d.value.count;
                    // return +d.close;
                  });

  d3.select('#chart').datum(data) // set the data for the element
    .call(lineChart);

