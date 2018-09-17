import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin.js';

export default define(class PlaylistItem extends RenderMixin(HTMLElement) {
  set song(value) {
    this._song = value;
    this.setAttribute('title', `title: ${value.title}\nartist: ${value.artist}\ngenre: ${value.genre}\nBPM: ${value.bpm}`)
    this.innerHTML = `
      <h4>${value.title}</h4>
      <span class="flex"></span>
      <h4>${value.bpm}</h4>
    `;
  }

  get song() {
    return this._song
  }

  set badge(value) {
    const el = this.shadowRoot.querySelector('badges')
    badge.innerHTML = '';
    value.forEach(badge => {
      badge.innerHTML +=  `<span class="badge ${badge}">badge</span>`;
    })
  }

  set lock(value) {
    this._lock = value;
  }

  get locked() {
    return this.lock;
  }

  constructor() {
    super()
    this.attachShadow({mode: 'open'})
  }
  connectedCallback() {

    if (super.connectedCallback) super.connectedCallback();

    this.setAttribute('draggable', true)
    this.addEventListener('dragstart', this.dragstart);


  }

  disconnectedCallback() {
    if (super.disconnectedCallback) super.disconnectedCallback();
    this.removeEventListener('dragstart', this.dragstart);
  }

  dragstart(event) {
    this.dragging = true;
    event.dataTransfer.setData('items', JSON.stringify(this.song));
  }

  mouseup(event) {
    event.dataTransfer.setData('application/json', this.song);
    this.dragging = false;
    document.removeEventListener('mouseup', this.mouseup);
  }

  get template() {
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: row;
          height: 30px;
          width: 100%;
          pointer-events: auto;
          user-select: none;
          cursor: pointer;
        }

        .row {
          display: flex;
          flex-direction: row;
        }

        ::slotted(.flex) {
          flex: 1;
        }
      </style>
      <span class="badges"></span>
      <slot></slot>
    `;
  }
})
