import { LitElement, html } from 'lit-element';
import { SelectMixin, DefaultValueMixin, DoNotSetUndefinedValue } from '@preignition/preignition-mixin';
import { LitNotify, LitSync } from '@morbidick/lit-element-notify';

class DemoRepeat extends DefaultValueMixin(LitElement) {

  render() {
    return html`
      <div>
        <multi-repeat-select>
          ${this.items.map(this.template, this)}
        </multi-repeat-select>
        <paper-button raised @tap="${this.doupdate}">update</paper-button>
      </div>

    `;
  }

  static get properties() {
    return {
     items: {type: Array},
     template: {
       type: Function, 
       value: ()=> {
           return function(item){
             return html`<paper-button 
             ?disabled="${this.disableName(item.name)}"
             raised
             .name="${item.name}"
             >a ${item.name}</paper-button>`
           }
       }
     }
    }
  }


  constructor() {
    super()
    this.items = [{name:1}, {name:2}, {name:4}];
  }

  disableName(count) {
   return count == 5;
  }

  doupdate(){
    ++this.items[2].name
    this.items = [...this.items]
  }



}

customElements.define('demo-repeat', DemoRepeat);