// import { analyze } from 'web-audio-beat-detector';
import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';

import './party-turntable.js';
import './party-mixer.js';
import './party-filters';
import lines from './../utils/lines';
import GainNode from './gain-node';


export default define(class PartyDeck extends RenderMixin(HTMLElement) {

  get __tables__() {
    return [
      {name: 'a', side: 'left'},
      {name: 'b', side: 'right'},
      {name: 'c', side: 'left'},
      {name: 'd', side: 'right'}
    ]
  }
  get a() {
    return this.shadowRoot.querySelector('party-turntable[name="a"]')
  }

  get b() {
    return this.shadowRoot.querySelector('party-turntable[name="b"]')
  }

  get mixer() {
    return this.shadowRoot.querySelector('party-mixer');
  }

  get decks() {
    return this.getAttribute('decks') || 2;
  }

  get leftTables() {
    return this.tables.filter(table => {
      if (table.getAttribute('side') === 'left') {
        return table
      }
    })
  }

  get rightTables() {
    return this.tables.filter(table => {
      if (table.getAttribute('side') === 'right') {
        return table
      }
    })
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this._gainChange = this._gainChange.bind(this);
    this.gains = {};
    this.tables = []
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    for (let deck = 0; deck < this.decks; deck++) {
      const table = document.createElement('party-turntable');
      table.setAttribute('name', this.__tables__[deck].name);
      table.setAttribute('side', this.__tables__[deck].side);
      table.setAttribute('slot', this.__tables__[deck].side);
      this.appendChild(table);
      table.gainNode = new GainNode(table.player);
      this.tables.push(table)
    }
    this.mixer.addEventListener('gain-change', this._gainChange);
  }

  _gainChange({detail}) {
    if (detail.target === 'fader') {
      if (detail.value === 0.5) {
        this.leftTables.forEach(table => table.gainNode.gain.value = 0.5);
        this.rightTables.forEach(table => table.gainNode.gain.value = 0.5)
      } else if (detail.value === 1) {
        this.leftTables.forEach(table => table.gainNode.gain.value = 0);
        this.rightTables.forEach(table => table.gainNode.gain.value = 1);
      } else if (detail.value === 0) {
        this.leftTables.forEach(table => table.gainNode.gain.value = 1);
        this.rightTables.forEach(table => table.gainNode.gain.value = 0);
      } else {
        this.leftTables.forEach(table => table.gainNode.gain.value = 1 - detail.value);
        this.rightTables.forEach(table => table.gainNode.gain.value = detail.value);
      }
    }
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    height: 55%;
    top: 0;
    left: 0;
    right: 0;
    border: 1px solid #fff;
    background: #888;
  }

  .column {
    display: flex;
    flex-direction: column;
  }

  .row {
    display: flex;
    flex-direction: row;
    height: 100%;
  }
  .flex {
    flex: 1;
  }
</style>
<span class="row" style="border-bottom: 1px solid #fff;">
  <span class="column">
    <slot name="left"></slot>
  </span>
  <span class="column">
    <party-filters></party-filters>
    <span class="flex"></span>
    <party-mixer></party-mixer>
  </span>
  <span class="column">
    <slot name="right"></slot>
  </span>
</span>

    `;
  }
})
