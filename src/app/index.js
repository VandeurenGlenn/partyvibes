import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin.js';
import './../../node_modules/custom-pages/src/custom-pages.js';

import './party-deck';
import './party-collection/party-collection';
import './../custom-title-bar';

window.utils = window.utils || {
  arrayBufferToString: buffer => String.fromCharCode.apply(null, new Uint8Array(buffer)),
  arrayBufferToJSON: buffer => JSON.parse(window.utils.arrayBufferToString(buffer))
}

export default define(class partyVibes extends RenderMixin(HTMLElement) {
  set mode(value) {
    this._mode = value;
    this.modeButton.innerHTML = value;
    this.partyCollection.setAttribute('mode', value);
    this.partyDeck.setAttribute('mode', value);
  }
  get mode() {
    return this._mode;
  }
  get pages() {
    return this.shadowRoot.querySelector('custom-pages');
  }
  get partyDeck() {
    return this.shadowRoot.querySelector('party-deck');
  }
  get partyCollection() {
    return this.shadowRoot.querySelector('party-collection');
  }
  get modeButton() {
    return this.shadowRoot.querySelector('.mode');
  }
  get showSettingsButton() {
    return this.shadowRoot.querySelector('.show-settings');
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'})
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this._init();
  }

  disconnectedCallback() {
    this.showSettingsButton.removeEventListener('click', this.switchView);
    this.modeButton.removeEventListener('click', this.switchMode);
  }

  _init() {
    this.mode = 'live';
    this.pages.selected = 'main';
    this.switchMode = this.switchMode.bind(this);
    this.switchView = this.switchView.bind(this);
    this.showSettingsButton.addEventListener('click', this.switchView);
    this.modeButton.addEventListener('click', this.switchMode);
    console.log('ready to initialize');
  }

  switchMode() {
    if (this.mode === 'live') this.mode = 'studio';
    else this.mode = 'live';
  }

  switchView() {
    if (this.pages.selected === 'settings' ) {
      this.pages.selected = 'main';
    } else {
      console.log(window.party);
      if (!window.party.loaded['./party-settings']) import('./party-settings').then(() => window.party.loaded['./party-settings'] = true);
      this.pages.selected = 'settings';
    }
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    overflow: hidden;

    --primary-color: #bec8e9;
  }

  main {
    position: absolute;
    top: 26px;
    left: 0;
    right: 0;
    bottom: 0;
    /* overflow-y: auto; */
  }

  .row {
    display: flex;
    flex-direction: row;
    height: 100%;
  }

  .mode {
    cursor: pointer;
    pointer-events: auto;

    border: none;
    border-left: 1px solid #eee;
  }

  custom-title-bar button {
    display: flex;
    align-items: center;
    background: transparent;
    height: 26px;
    border: none;
    border-right: 1px solid #eee;
    user-select: none;
    outline: none;
    cursor: pointer;
    color: #eee;
    padding: 4px 10px;
    box-sizing: border-box;
  }

  .autoplay {
    border: none;
  }

  .button-holder {
    display: flex;
    align-items: center;
    min-width: 66px;
  }
  .button-holder.right {
    justify-content: flex-end;
  }

</style>

<custom-pages attr-for-selected="data-route">
  <section data-route="main">
    <custom-title-bar>
      <span class="button-holder" slot="left">
        <button class="show-settings">settings</button>
      </span>
      <button class="autoplay" slot="middle">autoplay</button>
      <span class="button-holder right" slot="right">
        <button class="mode"></button>
      </span>
    </custom-title-bar>
    <main>
      <party-deck></party-deck>
      <party-collection></party-collection>
    </main>
  </section>

  <party-settings data-route="settings"></party-settings>
</custom-pages>
    `;
  }
});
