import define from '../../node_modules/backed/src/utils/define';
import merge from '../../node_modules/backed/src/utils/merge';
import PropertyMixin from '../../node_modules/backed/src/mixins/property-mixin';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';

export default define(class PartySlider extends PropertyMixin(RenderMixin(HTMLElement)) {
  static get properties() {
      return merge(super.properties, {
        value: {
          reflect: true
        },
        min: {
          reflect: true
        },
        max: {
          reflect: true
        },
        step: {
          reflect: true
        },
        name: {
          reflect: true
        }
      });
  }

  get min() {
    return this.input.min || 0;
  }

  get max() {
    return this.input.max || 1;
  }

  get step() {
    return this.inpurt.step || 0.01;
  }

  get input() {
    return this.shadowRoot.querySelector('input');
  }

  get value() {
    return this._value || this.getAttribute('value') || 0.5;
  }

  set min(value) {
    this.input.min = value;
  }

  set max(value) {
    this.input.max = value
  }

  set step(value) {
    this.input.step = value;
  }

  set value(value) {
    this._value = value;
    this.input.value = value
  }

  get name() {
    return this._name || this.getAttribute('name');
  }

  set name(value) {
    this._name = value;
  }

  constructor() {
    super()
    this.attachShadow({mode: 'open'})
    // disable RenderMixin's first render
    // bind methods
    this.oninput = this.oninput.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    this.input.addEventListener('input', this.oninput);
  }

  attributeChangedCallback(name, old, value) {
    if (old !== value) this[name] = value;
  }

  oninput() {
    this.value = this.input.value;
    this.dispatchEvent(new CustomEvent('input', {detail: this.value}))
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 22px;
    width: 100%;
  }
  :host([vertical]) {
    flex-direction: column;
    width: 22px;
    height: 100%;
  }
  :host([vertical]) input {
    -webkit-appearance: slider-vertical
  }
  input {
    height: inherit;
    width: inherit;
    outline: none;
  }
</style>
<span>${'label'}</span>
<input type="range" min="0" max="1" step="0.01"></input>
    `
  }
})
