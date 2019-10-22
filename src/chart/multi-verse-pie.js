import { html } from 'lit-element';
import { Pie, Select } from '@preignition/multi-chart'
import { default as ChartProperties } from './properties/multi-verse-chart-properties.js'

class MultiVersePie extends Pie {

  getContentRender() {
    return this.html `
      ${super.getContentRender()}
      <!--multi-serie .label="${this.serieLabel}" .path="${this.path}" .keyPath="${this.keyPath}"></multi-serie-->
      <multi-select 
            .multi="${this.multi}" 
            .trackHover="${this.trackHover}" 
            .selectedItems="${this.selectedItems}" 
            .selectedValues="${this.selectedValues}"
            .selectedItem="${this.selectedItem}" 
            .selected="${this.selected}"
            @selected-values-changed="${e => this.selectedValues = e.detail.value}"
            @selected-changed="${e => this.selected = e.detail.value}"
            ></multi-select>`
  }

  static get properties() {
    
    return {

      ...super.properties,

      ...Select.properties,

      ...ChartProperties,

      valuePath: {
        type: String,
        attribute: 'value-path',
        value: '+value.count'
      },

      padAngle: {
        type: Number,
        attribute: 'pad-angle',
        value: 0.03
      },

      pieWidth: {
        type: String, 
        attribute:'pie-width',
        value: '35%'
      }
    };
  }


}

export default MultiVersePie;


