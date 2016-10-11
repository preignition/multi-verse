// (It's CSV, but GitHub Pages only gzip's JSON at the moment.)

d3.csv('flight.csv', function(error, flights) {

  function parseDate(d) {
    return new Date(2001,
      d.substring(0, 2) - 1,
      d.substring(2, 4),
      d.substring(4, 6),
      d.substring(6, 8));
  }
  var formatNumber = d3.format(',d'),
    formatChange = d3.format('+,d'),
    formatDate = d3.timeFormat('%B %d, %Y'),
    formatTime = d3.timeFormat('%I:%M %p');

  let index = 0;
  flights.forEach(function(d, i) {
    d.date = parseDate(d.date);
    d.index = ++index;
  });

  const generatedColumns = {
    day: d => d3.timeFormat('%A')(d.date),
    hour: d => Number(d3.timeFormat('%H')(d.date)),
    dayOfWeek: d => d3.timeFormat('%A')(d.date),
    arrivalDelay: d => Math.floor(+d.delay / 30) * 30,
    distances: d => Math.floor(+d.distance / 100) * 100
  };

  function barChart() {
    if (!barChart.id) {
      barChart.id = 0;
    }

    let margin = { top: 20, right: 10, bottom: 20, left: 10 };
    let x = d3.scaleLinear();
    let y = d3.scaleLinear();

    const id = barChart.id++;
    // const axis = d3.svg.axis().orient('bottom');
    const axis = d3.axisBottom();
    // const brush = d3.svg.brush();
    let width = 500;
    let height = 100;

    const brush = d3.brushX()
      .extent([
        [0, 0],
        [width, height]
      ])
      .on('end', brushended)
      .on('brush', brushended);

    // let brushDirty = null;
    // let round = null;
    let title = '';

    let query = null;
    let isInitialized = false;
    let chartContent = null;
    let chartAxis = null;

    function initialize(data) {
      const xe = d3.extent(data, d => d.key);
      const del = data[1].key - data[0].key;

      xe[1] += del;

      x.domain(xe);
      y.domain(d3.extent(data, d => d.value.count));

      isInitialized = true
    }


    function chart(selection) {


      y.range([height, 0])
      x.rangeRound([0, width]);
      // .domain(xe)

      axis.scale(x);
      // brush.x(x);
      // brush(x);

      // const div = d3.select(this);
      let g = selection.select('g');

      // Create the skeletal chart.
      if (g.empty()) {
        const svg = selection.append('svg')
          .attr('title', title)
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);

        svg
          .append('text')
          .attr('class', 'title')
          .attr('text-anchor', 'middle')
          .attr('transform', `translate(${width / 2},${margin.top / 2})`)
          .text(title);

        g = svg
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);
        g.append('clipPath')
          .attr('id', `clip-${id}`)
          .append('rect')
          .attr('width', width)
          .attr('height', height);

        chartContent = g.selectAll('.bar')
          .data(['background', 'foreground'])
          .enter().append('path')
          .attr('class', d => `${d} bar`)
          // .datum(query.data, d => d.key);

        g.selectAll('.foreground.bar')
          .attr('clip-path', `url(#clip-${id})`);

        chartAxis = g.append('g')
          .attr('class', 'axis')
          .attr('transform', `translate(0,${height})`)
          .call(axis);
        // Initialize the brush component with pretty resize handles.
        const gBrush = g.append('g').attr('class', 'brush').call(brush);

        chart.update = function() {
          selection.call(chart);
        };

        return chart
      }

      if (isInitialized) {
        // g.selectAll('.bar')
        chartAxis.call(axis);
        chartContent.transition().attr('d', barPath);
      }
      // });

      function barPath(groups) {
        if (!isInitialized) {
          return;
        }
        const path = [];
        let i = -1;
        const n = groups.length;
        let d = null;
        const w = x(groups[1].key) - x(groups[0].key) - 2;
        while (++i < n) {
          d = groups[i];
          path.push('M', x(d.key) + 1, ',', height, 'V', y(d.value.count), 'h', w, 'V', height);
        }
        return path.join('');
      }
    }

    function brushended() {
      if (!d3.event.sourceEvent) return; // Only transition after input.
      if (!d3.event.selection) {
        query.universe.filter(query.column.key);
        return; // Ignore empty selections.
      }
      var d0 = d3.event.selection.map(x.invert);
      query.universe.filter(query.column.key, d0, true);
    }

    chart.query = function(_) {
      if (!arguments.length) {
        return query;
      }
      query = _;
      chartContent.datum(query.data, d => d.key);
      initialize(query.data);
      chart.update();
      return chart;
    };

    chart.margin = function(_) {
      if (!arguments.length) {
        return margin;
      }
      margin = _;
      return chart;
    };

    chart.width = function(_) {
      if (!arguments.length) {
        return width;
      }
      width = _;
      return chart;
    };

    chart.height = function(_) {
      if (!arguments.length) {
        return height;
      }
      height = _;
      return chart;
    };

    chart.title = function(_) {
      if (!arguments.length) {
        return title;
      }
      title = _;
      return chart;
    };

    return chart;
  }

  const chartsConfig = [
    { groupBy: 'hour', displayName: 'Time of Day' },
    { groupBy: 'arrivalDelay', displayName: 'Arrival Delay (min.)' },
    { groupBy: 'distances', displayName: 'Distance (mi.)' }
  ];

  let charts = null;
  // A nest operator, for grouping the flight list.

  let flu = null;

  universe(flights, {
      generatedColumns: generatedColumns
    }).then(function(fl) {
      flu = fl;

      fl.onFilter(updateCharts, 100);

      charts = d3.select('#charts').selectAll('.chart')
        .data(chartsConfig);

      charts.enter().append('div')
        .attr('class', 'chart')
        .merge(charts)
        .each(function(d, i) {
          var c = d3.select(this);

          d.barChart = barChart()
            .width(200)
            .title(d.displayName)
            (c);

          fl.query(d)
            .then(function(res) {
               d.barChart.query(res);
            })
            .catch(function(error) {
              console.error(error); // 'oh, no!'
            });

        });

      fl.column('date')
        .then(function(universe) {
          list.each(render);
          d3.select('#total').text(universe.cf.size())
        }); // main data list  

      return fl;
    })
    .catch(function(error) {
      console.error(error); // 'oh, no!'

    });

  function updateCharts() {
    if (charts) {
      charts.each(chart => {
          if (chart.barChart.update) {
            chart.barChart
              .update();
          }
        })
        // console.info('UPDATE', this, arguments);
    }
    if (list) {
      list.each(render);
    }

  }


  window.filter = function(filters) {
    filters.forEach(function(d, i) {
      charts[i].filter(d);
    });
  };

  window.reset = function(i) {
    charts[i].filter(null);
  };

  var nestByDate = d3.nest()
    .key(function(d) {
      return d3.timeDay(d.date);
    });

  // Renders the specified chart or list.
  function render(method) {
    d3.select(this).call(method);
  }
  // Render the initial lists.
  var list = d3.selectAll('.list')
    .data([flightList]);

  function flightList(div) {
    var dim = flu.column.find('date').dimension
    var flightsByDate = nestByDate.entries(dim.top(100));

      // var active = dim.
      // d3.select("#active").text(formatNumber(all.value()));
      d3.select('#active').text(dim.top(Infinity).length)

    div.each(function() {
      var date = d3.select(this).selectAll('.date').data(flightsByDate, function(d) {
          return d.key;
        }) // UPDATE

      date.exit().remove(); // EXIT

      date = date.enter().append('div') // ENTER
        .attr('class', 'date')
        .merge(date) // ENTER + UPDATE
        .append('div')
        .attr('class', 'day')
        .text(function(d) {
          return formatDate(d.values[0].date);
        });

      var flight = date.order().selectAll('.flight')
        .data(function(d) {
          return d.values;
        }, function(d) {
          return d.index;
        });

      flight.exit().remove();

      flight = flight.enter().append('div')
        .attr('class', 'flight')
        .merge(flight);

      flight.append('div')
        .attr('class', 'time')
        .text(function(d) {
          return formatTime(d.date);
        });

      flight.append('div')
        .attr('class', 'origin')
        .text(function(d) {
          return d.origin;
        });

      flight.append('div')
        .attr('class', 'destination')
        .text(function(d) {
          return d.destination;
        });

      flight.append('div')
        .attr('class', 'distance')
        .text(function(d) {
          return formatNumber(d.distance) + ' mi.';
        });

      flight.append('div')
        .attr('class', 'delay')
        .classed('early', function(d) {
          return d.delay < 0;
        })
        .text(function(d) {
          return formatChange(d.delay) + ' min.';
        });

      flight.order();
    });
  }
})
