// LitElement and html are the basic required imports
import { LitElement, html, css } from 'lit-element';
import {render} from 'lit-html';
import * as format from 'd3-time-format';
import * as time from 'd3-time';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { scaleOrdinal } from 'd3-scale';


const parseDate = (d) => {
  return new Date(2001,
    d.substring(0, 2) - 1,
    d.substring(2, 4),
    d.substring(4, 6),
    d.substring(6, 8));
}

// Create a class definition for your component and extend the LitElement base class
class DemoFlight extends LitElement {
  // The render callback renders your element's template. This should be a pure function,
  // it should always return the same template given the same properties. It should not perform
  // any side effects such as setting properties or manipulating the DOM. See the updated
  // or first-updated examples if you need side effects.
  render() {
    // Return the template using the html template tag. lit-html will parse the template and
    // create the DOM elements
    return html `
        <d3-fetch type="csv" url="/demo/data/flight.csv" @data-changed="${e => this.data = e.detail.value}"></d3-fetch>
        <multi-verse id="universe" log
          .data="${this.data}" 
          @universe-changed="${e => this.universe = e.detail.value}" 
          .columns="${this.columns}"
          .generatedColumns="${this.generatedColumns}"
          .preProcess="${this.preProcess}">
          <multi-group .universe="${this.universe}" @data-changed="${ e=> this.dataDistance = e.detail.value}"  group-by="distances">
            <multi-verse-line .data="${this.dataDistance}" left-axis bottom-axis left-text="count" bottom-text="distance (in km)">
              <h4 slot="header">Count of flights by distance</h4>
              <vaadin-grid-sort-column path="origin" header="Origin"></vaadin-grid-sort-column>
            </multi-verse-line>
          </multi-group>
          <multi-group .universe="${this.universe}" @data-changed="${ e=> this.dataDistance = e.detail.value}" group-by="distances">
            <multi-verse-bar left-axis bottom-axis left-continuous .data="${this.dataDistance}">
              <h3 slot="header">distance (bar chart)</h3>
            </multi-verse-bar>
          </multi-group>
          <multi-group .universe="${this.universe}" @data-changed="${e => this.dataDay = e.detail.value}" group-by="day">
            <multi-verse-bar left-axis bottom-axis .data="${this.dataDay}"  >
              <h3 slot="header">day (chart)</h3>
            </multi-verse-bar>
          </multi-group>
           <!--multi-group .universe="${this.universe}" @data-changed="${e => this.dataDate = e.detail.value}" group-by="week"-->
           <multi-group .universe="${this.universe}" @data-changed="${e => this.dataDate = e.detail.value}" .groupBy="${d => time.timeWeek(d.date)}">
            <multi-verse-bar select-type="brush" left-axis bottom-axis bottom-scale-type="time" .data="${this.dataDate}"  >
              <h3 slot="header">group by week</h3>
            </multi-verse-bar>
          </multi-group>
          <multi-group .universe="${this.universe}" @data-changed="${e => this.dataDay = e.detail.value}" group-by="day">
            <multi-verse-pie .data="${this.dataDay}"  .colorScale="${this.dayScale}" >
              <h3 slot="header">day (pie)</h3>
              <multi-legend .scale="${this.dayScale}" position="top-right"></multi-legend>
            </multi-verse-pie>
          </multi-group>

          <multi-data-provider id="provider" 
            @data-provider-changed="${e => this.dataProvider = e.detail.value}" 
            @length-changed="${e => this.length = e.detail.value}" 
            .universe="${this.universe}" 
            column="$index">
            
            <h3>Total Count: ${this.length}</h3>
             <vaadin-grid id="grid" _item-id-path="name.first" _items="[[items]]" 
               .dataProvider="${this.dataProvider}" multi-selection column-reordering-allowed>
                
              <vaadin-grid-column flex-grow="0"  width="145px"  frozen resizable header="Index" .renderer="${this.indexRenderer}"></vaadin-grid-column>
              <vaadin-grid-column flex-grow="1" header="Destination" .renderer="${this.destinationRenderer}"></vaadin-grid-column>
              <vaadin-grid-sort-column path="origin" flex-grow="1" header="Origin"></vaadin-grid-sort-column>
              <vaadin-grid-sort-column path="destination" flex-grow="1" header="Destination"></vaadin-grid-sort-column>
              <vaadin-grid-column flex-grow="1" header="Date" .renderer="${this.dateRenderer}"></vaadin-grid-column>

            </vaadin-grid>

           </multi-data-provider>
        </multi-verse>
            

    `;
  }

  dateRenderer(root, column, rowData) {

    return render(
      html`
        <span >${rowData.item.date}</span>
      `, 
      root
    );
  }

  destinationRenderer(root, column, rowData) {
    return render(
      html`
        <paper-input .value="${rowData.item.destination}" @value-changed="${e => rowData.item.destination = e.detail.value}" no-label-float></paper-input>
      `, 
      root
    );
  }

  indexRenderer(root, column, rowData) {
    return render(
      html`
        <div>${rowData.index}</div>
      `, 
      root
    );
  }

  static get properties() {
    return {
      data: { type: Array },
      universe: { type: Function },
      columns: { type: Object },
      generatedColumns: { type: Object },
      preProcess: { type: Function },
      dataDistance: { type: Array },
      dataDay: { type: Array },
      colorScale: { type: Function },
      dayScale: { type: Function },
      dataProvider: {type: Function},
      length: {type: Number}


    }
  }

  constructor() {
    super();
    this.columns = { $index: '$index' }
    this.preProcess = (d, i) => {
      d.date = parseDate(d.date);
      d.$index = i;
    };
    this.colorScale = scaleOrdinal().range(schemeCategory10);
    this.dayScale = scaleOrdinal().range(schemeCategory10);
    this.generatedColumns = {
      day: d => format.timeFormat('%A')(d.date),
      hour: d => Number(format.timeFormat('%H')(d.date)),
      dayOfWeek: d => format.timeFormat('%A')(d.date),
      week: d => time.timeWeek(d.date),
      arrivalDelay: d => Math.floor(+d.delay / 30) * 30,
      distances: d => Math.floor(+d.distance / 200) * 200
    };
  }
}

// Register your element to custom elements registry, pass it a tag name and your class definition
// The element name must always contain at least one dash
customElements.define('demo-flight', DemoFlight);