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
      ${this.selectType === 'brush'
        ? this.html `<multi-brush
            id="selector"
            x-continuous=""
            .log="${this.log}"
            .xScale="${this.bottomScale}" 
            .preventClear="${this.preventClear}"
            @selected-values-changed="${e => this.selectedValues = e.detail.value}"
          ></multi-brush>`
        : this.html `<multi-select 
            id="selector"
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

  get selector() {
    return this.renderRoot.querySelector('#selector');
  }

  clearSelection() {
    this.selector && this.selector.clearSelection()
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
      },
      
      /*
       * `preventClear` set true to prevent selection to cleat on brush end
       */
      preventClear: {
        type: Boolean,
        attribute: 'prevent-clear'
      },
    };
  }


}

export default MultiVerseBar;
