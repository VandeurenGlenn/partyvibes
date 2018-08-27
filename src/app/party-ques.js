//
// const partyElement = object => {
//   if (!object.mixin) object.mixin = HTMLElement;
//   customElements.define(object.tag, class extends object.mixin {
//     constructor() {
//       super();
//       if (object.constructor) object.constructor();
//     }
//
//     connectedCallback() {
//       if (super.connectedCallback) super.connectedCallback();
//       if (object.connectedCallback) object.connectedCallback();
//     }
//
//     disconnectedCallback() {
//       if (super.disconnectedCallback) super.disconnectedCallback();
//       if (object.disconnectedCallback) object.disconnectedCallback();
//     }
//   }
// })
// partyElement({
//   tag: 'party-ques',
//   connectedCallback: () => {
//
//   }
// })


import define from '../../node_modules/backed/src/utils/define';

import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin.js';
export default define(class PartyQues extends RenderMixin(HTMLElement) {
  constructor() {
    super()
    this.attachShadow({mode: 'open'})
  }
  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: row;
    width: 100%;
  }

  .flex {
    flex: 1;
  }

  custom-selector {
    display: flex;
    flex-direction: row;
  }
</style>

<span class="flex"></span>
<custom-selector selected="A" class="row">
  <party-button class="que-item">A</party-button>
  <party-button class="que-item">B</party-button>
  <party-button class="que-item">C</party-button>
  <party-button class="que-item">D</party-button>
</custom-selector>
<span class="flex"></span>
    `;
  }
})
