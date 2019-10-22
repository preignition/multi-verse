import { Choropleth } from '@preignition/multi-geo'
import { Select } from '@preignition/multi-chart'
import { default as ChartProperties } from './properties/multi-verse-chart-properties.js'

/**
 * ## MultiVerseLine
 *
 * `<multi-verse-choropleth>` 
 *
 * @memberof MultiVerse
 * @customElement
 * @polymer
 * @appliesMixin MuliVerse.mixin.ChartSelectProperty
 * @demo
 **/
class MultiVerseChoropleth extends Choropleth {

 getContentRender() {
    
    return this.html`
      ${super.getContentRender()}
      <multi-select 
          .multi="${this.multi}" 
          .trackHover="${this.trackHover}" 
          .selectedItems="${this.selectedItems}" 
          .selectedValues="${this.selectedValues}"
          .selectedItem="${this.selectedItem}" 
          .selected="${this.selected}"
          @selected-values-changed="${e => this.selectedValues = e.detail.value}"
          @selected-changed="${e => this.selected = e.detail.value}"
          ></multi-select>
    `
  }

  static get properties() {
    return {

      ...super.properties, 

      ...Select.properties,

      ...ChartProperties,

      valuePath: {
        type:String, 
        attribute: 'value-path',
        value: '+value.count'
      },

      keyPath: {
        type:String, 
        attribute: 'key-path',
        value: 'key'
      },
      leftMargin: {
        type: Number, 
        value: 0
      }
    };
  }
}

export default MultiVerseChoropleth;
