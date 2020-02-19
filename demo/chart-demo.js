import { html, css } from 'lit-element';
import { DemoBase, multipleRnd } from '@preignition/preignition-demo';

import './charts/demo-repeat.js';
import './charts/demo-choropleth.js';


class ChartDemo extends DemoBase {

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
      },


    };
  }


  render() {
    return html `
    <demos-container>
      <div slot="header">
        <demo-readme src="${this.readme}"></demo-readme>
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
              <demo-repeat class="example"></demo-repeat>` : ''}
            ${this.activeTab === 'api' ? html `
              <h2>API</h2>
              <demo-api-viewer selected="multi-chart-pie"  .src="${this.src}">` : ''}
          </expansion-panel>

          <expansion-panel >
              <div slot="header">multi-choropleth</div>
              <vaadin-tabs selected="${this.tabs.indexOf(this.activeTab)}" theme="centered">
                <vaadin-tab @click=${() => this.activeTab = 'intro'}>Intro</vaadin-tab>
                <vaadin-tab @click=${() => this.activeTab = 'api'}>API</vaadin-tab>
                <vaadin-tab @click=${() => this.activeTab = 'demo2'}>Alternative Demo</vaadin-tab>
            </vaadin-tabs>
            ${this.activeTab === 'intro' ? html `
              <h2>Example</h2>
              <demo-choropleth class="example"></demo-choropleth>` : ''}
            ${this.activeTab === 'api' ? html `
              <h2>API</h2>
              <demo-api-viewer selected="multi-chart-radar"  .src="${this.src}">` : ''}
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

customElements.define('chart-demo', ChartDemo);