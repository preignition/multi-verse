import { html, css } from 'lit-element';
import { DemoBase, multipleRnd } from '@preignition/preignition-demo';

class AdvancedDemo extends DemoBase {

  static get styles() {
    return [
      ...super.styles, 
      css `
       .example {
         max-width: 80vw;
       }
      `
    ];
  }

  static get properties() {
    return {
      /*
       * location of web-content-analyzer json output
       */
      src: {
        type: String,
        value: '/docs/chart.json'

      },

      readme: {
        type: String,
        value: '/src/chart/README.md'
      }
    };
  }


  render() {
    return html `
    <demos-container>
      <div slot="header">
        <h2>Example of a choropleth map interconnected with a list of actor, a list of sector, and a summary chart. </h2>
        <p>Clicking on countries will recalculate chart for the selection only. Similarly, selecting a partner or a sector will show for which country the selection is fullfilled. The chart wil update as well. </p>
      </div>
      <fancy-accordion >
          
          <expansion-panel opened>
              <div slot="header">multi-repeat</div>
              <vaadin-tabs selected="${this.tabs.indexOf(this.activeTab)}" theme="centered">
                <vaadin-tab @click=${() => this.activeTab = 'intro'}>Intro</vaadin-tab>
                <vaadin-tab @click=${() => this.activeTab = 'api'}>API</vaadin-tab>
                <vaadin-tab @click=${() => this.activeTab = 'demo2'}>Alternative Demo</vaadin-tab>
            </vaadin-tabs>
            ${this.activeTab === 'intro' ? html `
              <h2>Example</h2>
              <home-map class="example"></home-map>` : ''}
            ${this.activeTab === 'api' ? html `
              <h2>API</h2>
              <demo-api-viewer selected="multi-chart-pie"  .src="${this.src}">` : ''}
          </expansion-panel>

       
         
      </fancy-accordion>

  
    </demos-container>
    
    `;
  }



  constructor() {
    super();
    this.tabs = ['intro', 'api', 'demo2'];
    this.activeTab = 'intro';
    // Note(cg): Base method applyConfig needs config.
    // this.config = config;
  }

}

customElements.define('advanced-demo', AdvancedDemo);