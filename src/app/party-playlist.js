import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin.js';
import './playlist-item.js';

export default define(class PartyPlaylist extends RenderMixin(HTMLElement) {

  get playlist() {
    return window.party.playlist;
  }

  get selector() {
    return this.shadowRoot.querySelector('custom-selector');
  }

  get pages() {
    return this.shadowRoot.querySelector('custom-pages');
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'})

    this._onSelected = this._onSelected.bind(this);
    this._onDeckLoad = this._onDeckLoad.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    this.selector.addEventListener('selected', this._onSelected);
    this.addEventListener('dragover', this._preventDefault);
    this.addEventListener('drop', this._onDrop);

    document.addEventListener('deck-load', this._onDeckLoad)
  }

  _onDeckLoad({detail}) {
    console.log(detail);
  }

  _preventDefault(event) {
    return event.preventDefault();
  }

  _onDrop(event) {
    event.preventDefault()
    let data = event.dataTransfer.getData('items');
    data = JSON.parse(data);
    this.playlist.push(data);
    const item = document.createElement('playlist-item');
    const count = this.playlist.reduce((p, c) => c.path === data.path ? p + 1 : p, 0);
    Array.from(this.querySelectorAll('playlist-item')).forEach(el => {
      if (el.song.path === data.path) {
        el.count = count;
      }
    })

    item.song = data;
    item.count = count;
    this.appendChild(item);
    document.dispatchEvent(new CustomEvent('playlist-item-added', {detail: data}))
    // this.beforeLoad(data);
    // this.data = data;
    // this.load(this.data.path, this.data.ques);
    // this.text = `${this.data.artist} - ${this.data.title}`;
  }

  _onSelected({detail}) {
    // this.pages.select(detail);
    console.log(detail);
  }

  get template() {
    return html`<style>
      :host {
        display: flex;
        flex-direction: column;
        width: var(--party-playlist-width, 320px);
        height: 100%;
        border: 1px solid #FFF;
      }
    </style>
    <custom-selector>
      <slot></slot>
    </custom-selector>`;

  }

})
