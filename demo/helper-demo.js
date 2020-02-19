import { html, css } from 'lit-element';
// import {default as Base } from '@preignition/preignition-demo';
import { DemoBase } from '@preignition/preignition-demo';

import {scaleOrdinal} from 'd3-scale';
import {schemeCategory10 } from 'd3-scale-chromatic';

const keys = ['tomato', 'banana', 'pear', 'apple'];

// Note(cg): config to apply to components when they are rendered.
const config = {
  'multi-legend': {
    scale: scaleOrdinal().range(schemeCategory10).domain(keys)
  }
};


class HelperDemos extends DemoBase {


  static get properties() {
    return {
       /*
       * location of web-content-analyzer json output
       */
      src: {
        type: String,
        value: '/docs/helper.json'

      },

      readme: {
        type: String,
        value: '/src/helper/README.md'
      }
    };
  }


  render() {
    return html`
    <demos-container .src="${this.src}">
      <div slot="header">
        <demo-readme src="${this.readme}"></demo-readme>
      </div>
      <demo-fancy-list slot="list" .src="${this.src}"></demo-fancy-list>
      <demo-api-viewer .selected="${this.selected}" slot="aside" .src="${this.src}">
        
        <template data-element="d3-format" data-target="host">
          <d3-format specifier=".1f" value="123.999"></d3-format>
        </template>

        <template data-element="d3-fetch" data-target="host">
          <d3-fetch url="/demo/data/data.json" type="json"></d3-fetch>
        </template>

        <template data-element="multi-legend" data-target="host">
          <multi-legend position="top-right"></multi-legend>
        </template>

      </demo-api-viewer>
    </demos-container>
    
    `;
  }

  constructor() {
    super();
    // Note(cg): Base method applyConfig needs config.
    this.config = config;
  }

}

customElements.define('helper-demo', HelperDemos);
