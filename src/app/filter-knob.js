import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin.js';
import './pure-knob-element';
export default define(class FilterKnob extends RenderMixin(HTMLElement) {
  static get observedAttributes() {
    return ['filter']
  }

  get left() {
    return !this.hasAttribute('right')
  }

  set filter(value) {
    this.shadowRoot.querySelector('pure-knob-element').name = value
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.render(this.template);
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this.span = document.createElement('span');
    if (this.left) {
      this.knob = this.shadowRoot.querySelector('party-knob');
      this.span.innerHTML = '<label><slot></slot></label><span class="flex"></span>'
      this.shadowRoot.insertBefore(this.span, this.knob)
    } else {
      this.span.innerHTML = '<span class="flex"></span><label><slot></slot></label>';
      this.shadowRoot.appendChild(this.span)
    }
  }

  attributeChangedCallback(name, oldvalue, newvalue) {
    if (oldvalue !== newvalue) {
      this[name] = newvalue
    }
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    pointer-events: auto;
    cursor: pointer;
    align-items: center;
  }

  .flex {
    flex: 1;
  }

</style>

<pure-knob-element></pure-knob-element>

    `;
  }
})
