import { LitElement, html, css } from 'lit-element';
// import { FormatMixim } from 'multi0-chart';


/**
 * ## MultiSelectorDisplay
 *
 * `<multi-select-display>` shows what has been selected and displays it 
 * in a nice format
 *
 * @memberof MultiVerse
 * @customElement
 * @polymer
 * @appliesMixin MultiChart.mixin.D3Format
 * @demo
 **/
class MultiSelectorDisplay extends LitElement {
  
  static get styles() {
    return css `
      :host {
        display: inline;
        color: var(--multi-select-display-color, var(--primary-color));
      }

      paper-icon-button {
        padding: 0;
        width: var(--multi-select-display-icon-width, 18px);
        height: var(--multi-select-display-icon-height, 18px);
        margin-left: 2px;
      }
    `
  }

  render() {
    const selectedValues = this.selected ? [this.selected] : this.selectedValues || [];
    if (selectedValues && selectedValues.length) {
      return html `
          ${this.isRange 
             ? html `<span>${this.selectedText} [${this.format(selectedValues[0])}-${this.format(this.selectedValues[1])}]</span>` 
             : html `<span>${this.selectedText} ${this.renderSelected(selectedValues)}</span>` 
           }
           <paper-icon-button @tap="${this.clear}" part="clear-icon" icon="cancel"></paper-icon-button>
      `
    }
    return html ``;
  }

  renderSelected(selectedValues) {
    if (this.labels) {
      const isFunction = this.labels && typeof this.labels === 'function';
      return selectedValues.map(k => {
        return isFunction ? this.labels(k) : (this.labels[k] || k);
      }).join(', ')
    }
    return selectedValues.join(', ');
  }


  static get properties() {
    return {
      selectedValues: {
        type: Array
      },

      selected: {
        type: String
      },

      selectedText: {
        type: String,
        value: 'selected:'
      },

      isRange: {
        type: Boolean,
        value: false
      },

      /* 
       * `labels` as in http://d3-legend.susielu.com
       */
      labels: {
        type: Function,
        value: null
      }
    };
  }

  clear() {
    this.selected = null;
    this.selectedValues = [];
    this.dispatchEvent(new CustomEvent('multi-clear', { bubbles: true, composed: true }));
  }
}

export default MultiSelectorDisplay;