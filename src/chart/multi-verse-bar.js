import { html } from 'lit-element';
import { Bar, Select } from '@preignition/multi-chart';
import { default as ChartProperties } from './properties/multi-verse-chart-properties.js';

/**
 * # MultiVerseBar
 *
 * bar chart for multi-verse
 * 
 * @element multi-verse-bar
 */
class MultiVerseBar extends Bar {

  getContentRender() {
    return this.html `
      ${super.getContentRender()}
      <multi-serie .label="${this.serieLabel}" .path="${this.valuePath}" .keyPath="${this.keyPath}"></multi-serie>
      ${this.selectType === 'brush'
        ? this.html `<multi-brush
            @xContinuous 
            .log="${this.log}"
            .xScale="${this.bottomScale}" 
            
            @selected-values-changed="${e => this.selectedValues = e.detail.value}"
          ></multi-brush>`
        : this.html `<multi-select 
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
    `;
  }

  static get properties() {
   
    return {

      ...super.properties,

      ...Select.properties,

      ...ChartProperties,

      keys: {
        type: Array,
        value: ['count']
      },

      valuePath: {
        type: String,
        attribute: 'value-path',
        value: 'value.count'
      },

      bottomPadding: {
        type: Number,
        attribute: 'bottom-padding',
        value: 0.3
      }
    };
  }


}

export default MultiVerseBar;
