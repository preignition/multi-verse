import { html, css } from 'lit-element';
import { DemoBase, multipleRnd } from '@preignition/preignition-demo';


import './basic/demo-flight.js';


class BasicDemo extends DemoBase {

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
        <h2>Basic demo</h2>
      </div>
      <fancy-accordion >
          
          <expansion-panel opened>
              <div slot="header">multi-chart-pie</div>
              <vaadin-tabs selected="${this.tabs.indexOf(this.activeTab)}" theme="centered">
                <vaadin-tab @click=${() => this.activeTab = 'intro'}>Intro</vaadin-tab>
                <vaadin-tab @click=${() => this.activeTab = 'api'}>API</vaadin-tab>
                <vaadin-tab @click=${() => this.activeTab = 'demo2'}>Alternative Demo</vaadin-tab>
            </vaadin-tabs>
            ${this.activeTab === 'intro' ? html `
              <h2>Example</h2>
              <demo-flight class="example"></demo-flight>` : ''}
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

customElements.define('basic-demo', BasicDemo);