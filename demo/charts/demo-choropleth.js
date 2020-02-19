import { LitElement, html, css } from 'lit-element';


class Chart extends LitElement {
   
  static get styles() {
    return css `
       #chart {
        height: 600px;
       }
     `
  }

  render() {

    return html `
    <p>Example of a choropleth chart</p>
    
      <!-- fetch data -->
      <d3-fetch url="/demo/data/bangladeshScores.json" @data-changed="${e => this.raw = e.detail.value}"></d3-fetch>
   
     <!-- construction of hexbin -->
     <multi-project 
       .data="${this.raw}" 
       coordinate-accessor-path="location" 
       .projection="${this.projection}" 
       @projected-data-changed="${e => this.data = e.detail.value}" 
       ></multi-project>

      <multi-verse 
         .data="${this.data}" 
         @universe-changed="${e => this.universe = e.detail.value}">
         <multi-group 
           .universe="${this.universe}" 
           @data-changed="${ e=> this.dataChartDistrict = e.detail.value}"
           group-by="district">     
           <multi-verse-choropleth 
              id="chart" 
              log
              enable-zoom
              auto-fit
              .data="${this.dataChartDistrict}"
              
              feature-url="/demo/data/bangladeshSimplify02.json"
              feature-name="BGD_adm2"
              feature-path="properties.NAME_2"  
              mesh-name="BGD_adm1"
              .meshAttrs="${{fill:'none', stroke: '#00acff', 'stroke-width': 2}}"
              
              projection-type="geoMercator"
              @projection-changed="${ e => {this.projection = e.detail.value; console.info('PROJ', this.projection)}}"

              >
              
              <h3 slot="header">Bangladesh score by District</h3>

               <!-- TODO: revive hexbin
                 - multi-project should be part of hexbin ?
                 - we need to re-project on resize
                 - what about radius
                    
                -->
               <multi-drawable-hexbin  
                
                .points="${this.data}"
                radius="20"

              ></multi-drawable-hexbin>
              
            </multi-verse-choropleth>

          </multi-group>
        </multi-verse>

    `;
  }

  static get properties() {
    return {
      ...super.properties,
      raw: {type: Array},
      data: { type: Array },
      dataChartDistrict: { type: Array },
      universe: { type: Function },
      projection: {type: Function},
    };
  }

  constructor() {
    super();
    // this.zDomain = [0,10];
    // this.zPath = '+value';
    // this.zRangeMin= 2;
    // this.zRangeMax = 6;
    // this.zRange = [3,10];
  }


}

customElements.define('demo-choropleth', Chart);