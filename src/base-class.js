/**
 * ## MultiVerseBase
 *
 * `<multi-verse-base>` base class for multi-verse other elements
 *
 * @memberof MultiVerse
 * @customElement
 * @polymer
 * @appliesMixin MultiChart.mixin.Logger
 * @appliesMixin MultiChart.mixin.PolymerExtends
 * @demo
 **/
import { LitElement } from 'lit-element';
import { SelectMixin, DefaultValueMixin, DoNotSetUndefinedValue } from '@preignition/preignition-mixin';
import { LitNotify, LitSync } from '@morbidick/lit-element-notify';

export class Base extends
DefaultValueMixin(
  LitNotify(
    DoNotSetUndefinedValue(
      LitElement))) {

  static get properties() {

    return {

      ...super.properties,

      /*
       * `log`  true to show log
       */
      log: {
        type: Boolean,
      }
    };
  }

  dispatch(name) {
    this.dispatchEvent(new CustomEvent(`${name}-changed`, {
      detail: {
        value: this[name]
      },
      bubbles: true,
      composed: true
    }));
  }


}

export default Base;
