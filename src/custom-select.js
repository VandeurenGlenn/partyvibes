import define from '../node_modules/backed/src/utils/define';
import merge from '../node_modules/backed/src/utils/merge';
import PropertyMixin from '../node_modules/backed/src/mixins/property-mixin.js';
import RenderMixin from '../node_modules/custom-renderer-mixin/src/render-mixin.js';

define(class CustomSelect extends PropertyMixin(RenderMixin(HTMLElement)) {

  set items(value) {
    this._items = value
  }

  set _items(value) {
    this.innerHTML = '';
    this.innerHTML += `${value.map(item => `<span class="option" data-id="${item.deviceId}">${item.label}</span>`).join('')}`
  }

  get items() {
    return this._items;
  }

  get selector() {
    return this.shadowRoot.querySelector('custom-selector');
  }

  static get properties() {
    return merge(super.properties, {
      label: {
        reflect: true,
        renderer: 'template'
      },
      selected: {
        reflect: true,
        renderer: 'template'
      }
    });
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    this._onSelected = this._onSelected.bind(this);
    this._onClick = this._onClick.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this.shadowRoot.querySelector('.selected').addEventListener('click', this._onClick);
  }

  open() {
    const top = this.getBoundingClientRect().height;
    // const left = this.shadowRoot.querySelector('.selected').getBoundingClientRect().width;
    this.selector.style.top = `${top - 1}px`;
    // this.selector.style.left = `${left}px`;
    // this.selector.style.top = `8px`;
    this.classList.add('selecting');
  }

  close() {
    this.selecting = false;
    this.classList.remove('selecting');
  }

  _onClick() {
    if (this.selecting) this.close() ;
    else this.open();

    this.selecting = !this.selecting;

    this.selector.addEventListener('selected', this._onSelected);
  }

  _onSelected({detail}) {
    this.selected = this.querySelector(`[data-id="${detail}"]`).innerHTML;
    this.selector.removeEventListener('selected', this._onSelected);
    this.dispatchEvent(new CustomEvent('selected', {detail}))
    this.close();
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: row;
    position: relative;
    cursor: pointer;
  }
  .option {
    display: flex;
    flex-direction: row;
  }
  custom-selector {
    position: absolute;
    opacity: 0;
    display: flex;
    flex-direction: column;
    transform: scale(0);
    pointer-events: none;
    cursor: pointer;
    width: 240px;
    background: #FFF;
    padding: 4px 6px;
  }
  :host(.selecting) custom-selector {
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
    z-index: 100;
  }

  .selected {
    padding: 0 4px;
    border-bottom: 1px solid #fff;
  }
  strong {
    padding-right: 4px;
  }
</style>
<strong>${'label'}</strong>
<span class="selected">${'selected'}</span>
<custom-selector attr-for-selected="data-id">
  <slot></slot>
</custom-selector>

    `;
  }
})
