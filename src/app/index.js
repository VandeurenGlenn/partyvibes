import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin.js';

import './party-deck';
import './party-collection/party-collection';

window.utils = window.utils || {
  arrayBufferToString: buffer => String.fromCharCode.apply(null, new Uint8Array(buffer)),
  arrayBufferToJSON: buffer => JSON.parse(window.utils.arrayBufferToString(buffer))
}
window.party = window.party || {
  audioContext: new AudioContext(),
  config: {
    // customConfig
  }
};
export default define(class partyVibes extends RenderMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'})
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this._init();
  }

  _init() {
    console.log('ready to initialize');
  }

  get template() {
    return html`
<style>
  :host {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    overflow: hidden;

    --primary-color: #bec8e9;
  }

  main {
    position: relative;
    height: 100%;
    overflow-y: auto;
  }

  .row {
    display: flex;
    flex-direction: row;
    height: 100%;
  }
</style>

<header></header>
<main>
  <party-deck></party-deck>
  <party-collection></party-collection>
</main>
    `;
  }
});
