import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin.js';

export default define(class ScrollingText extends RenderMixin(HTMLElement) {
  static get observedAttributes() {
    return ['text'];
  }

  get delay() {
    return this.getAttribute('delay') || 0
  }

  set text(value) {
    this.innerHTML = `<span class="text">${value}</span>`;
    requestAnimationFrame(() => {
      const el = this.querySelector('.text')
      el.style.transfrom = 'translateX: -100%';
      window.anime({
        targets: el,
        translateX: ['-100%', this.offsetWidth - el.offsetWidth],
        loop: true,
        elasticity: 0,
        easing: 'easeOutSine',
        duration: 30000
      });
    })
  }

  get spacing() {
    return 20;
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'})
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) this[name] = newValue;

  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    color: inherit;
  }

  .text {
    display: inherit;
    color: inherit;
    /* width: 100%; */
    height: 100%;
  }

  ::slotted(.text) {
    display: block;
    font-size: 20px;
    color: inherit;
    text-transform: uppercase;
  }
</style>
<span class="text">
  <slot></slot>
</span>
    `;
  }

})
