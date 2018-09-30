import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin.js';
import './../../node_modules/custom-pages/src/custom-pages.js';

import './party-deck';
import './party-studio';
import './party-collection/party-collection';
import './../custom-title-bar';

import './party-minimize-button.js';
import './party-quit-button.js';
import './party-mode-button.js';

window.utils = window.utils || {
  arrayBufferToString: buffer => String.fromCharCode.apply(null, new Uint8Array(buffer)),
  arrayBufferToJSON: buffer => JSON.parse(window.utils.arrayBufferToString(buffer))
}

export default define(class partyVibes extends RenderMixin(HTMLElement) {
  set mode(value) {
    this._mode = value;
    this.modeButton.innerHTML = value === 'live' ? 'studio' : 'live';
    this.partyCollection.setAttribute('mode', value);
    this.partyDeck.setAttribute('mode', value);
    this.partyLive.setAttribute('mode', value);
    window.party.config.mode = value;
    window.party.saveConfig()
  }
  get mode() {
    return window.party.config.mode;
  }
  get pages() {
    return this.shadowRoot.querySelector('custom-pages');
  }
  get partyLive() {
    return this.shadowRoot.querySelector('party-studio');
  }
  get partyDeck() {
    return this.shadowRoot.querySelector('party-deck');
  }
  get partyCollection() {
    return this.shadowRoot.querySelector('party-collection');
  }
  get modeButton() {
    return this.shadowRoot.querySelector('party-mode-button');
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
    document.removeEventListener('back', this.switchView);
  }

  _init() {
    this.mode = this.mode || 'live';
    this.pages.selected = 'main';
    this.switchMode = this.switchMode.bind(this);
    this.switchView = this.switchView.bind(this);
    document.addEventListener('back', this.switchView);
    this.showSettingsButton.addEventListener('click', this.switchView);
    this.modeButton.addEventListener('click', this.switchMode);
  }

  switchMode() {
    if (this.mode === 'live') this.mode = 'studio';
    else this.mode = 'live';
  }

  set selected(value) {
    this.pages.selected = value;
    this.setAttribute('selected', value);
  }

  get selected() {
    return this.pages.selected
  }

  switchView() {
    if (this.selected === 'settings' ) {
      this.selected = 'main';
    } else {
      if (!window.party.loaded['./party-settings']) import('./party-settings').then(() => window.party.loaded['./party-settings'] = true);
      this.selected = 'settings';
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

  custom-pages {
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

  party-studio {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    height: 50%;
    bottom: 0;
    left: 0;
    right: 0;
  }

  [mode="studio"] {
    opacity: 1;
    pointer-events: auto;
  }

  :host([selected="settings"]) custom-pages {
    top: 0;
  }

</style>
<custom-title-bar>
  <span class="button-holder" slot="left">
    <button class="show-settings">settings</button>
  </span>
  <button class="autoplay" slot="middle">autoplay</button>
  <span class="button-holder right" slot="right">
    <party-mode-button></party-mode-button>
    <party-minimize-button></party-minimize-button>
    <party-quit-button></party-quit-button>
  </span>
</custom-title-bar>

<custom-pages attr-for-selected="data-route">
  <section data-route="main">
    <party-deck></party-deck>
    <party-collection></party-collection>
    <party-studio></party-studio>
  </section>

  <party-settings data-route="settings"></party-settings>
</custom-pages>
    `;
  }
});
