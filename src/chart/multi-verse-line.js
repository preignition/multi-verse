import { Line, Select } from '@preignition/multi-chart'
import { default as ChartProperties } from './properties/multi-verse-chart-properties.js'

class MultiVerseLine extends Line {

  getContentRender() {
    
    return this.html`
      ${super.getContentRender()}
      <multi-serie .label="${this.serieLabel}" .path="${this.path}" .keyPath="${this.keyPath}"></multi-serie>
      <multi-brush 
            x-continuous 
            .xScale="${this.bottomScale}" 
            @selected-values-changed="${e => this.selectedValues = e.detail.value}"
            ></multi-brush>
    `
  }

  static get properties() {
    
    return {

      ...super.properties,

      ...Select.properties,

      ...ChartProperties

    };
  }

}

export default MultiVerseLine;
