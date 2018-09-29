// import { analyze } from 'web-audio-beat-detector';
import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';


import './party-studio-table.js';
import './party-studio-wave.js';

export default define(class PartyStudio extends RenderMixin(HTMLElement) {
  get playlist() {
    return window.party.playlist;
  }

  get __tables__() {
    return window.party.config.tables;
  }

  get decks() {
    return this.getAttribute('decks') || window.party.config.decks || 2;
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    for (var i = 0; i < this.decks; i++) {
      const table = document.createElement('party-studio-table');
      table.setAttribute('name', this.__tables__[i].name);
      this.appendChild(table);
    }

    this.playLitItemAdded = this.playLitItemAdded.bind(this);
    document.addEventListener('playlist-item-added', this.playLitItemAdded);
  }

  playLitItemAdded({detail}) {
    console.log(detail);
    console.log(this.playlist);

    this.lastDeck
    this.stampStudioWaves()
  }

  guid() {
    const s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  stampStudioWaves() {
    let deck = this.lastDeck ? this.lastDeck : 0;
    const incDeck = () => {
      if (deck < this.decks) deck++;
      else deck = 0;
      return deck;
    }
    const waves = this.shadowRoot.querySelectorAll('studio-wave');
    for (const song of this.playlist) {
      let el = this.shadowRoot.querySelector(`studio-wave[id="${song.id}"]`);
      if (el && song.deck === deck) {
        deck = incDeck();
        return;
      } else if (el) {
        this.moveSong(el, deck);
        deck = incDeck();
        return;
      }

      el = document.createElement('party-studio-wave');
      song.id = this.guid();
      song.deck = deck;
      el.song = song;
      // el.setAttribute('deck', deck)
      const target = this.querySelector(`party-studio-table[name="${this.__tables__[deck].name}"]`);
      target.appendChild(el);
      deck = incDeck();

      // song.id = ''; // TODO: songs should get id's

    }

    this.lastDeck = deck;

  }

  moveSong(el, deck) {
    const target = this.querySelector(`partyu-studio-table[name="${deck}"]`);
    target.appendChild(el.cloneNode(true));
    this.removeChild(el);
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    border: 1px solid #fff;
    background: #888;

    pointer-events: auto;
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

  :host([mode="meister"]) {
    opacity: 0;
    pointer-events: none;
  }
</style>

<slot></slot>

    `;
  }
})
