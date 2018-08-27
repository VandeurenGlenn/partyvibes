import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin.js';

export default define(class PartyButton extends RenderMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;

    pointer-events: auto;
    cursor: pointer;
  }

  button {
    min-height: 48px;
    min-width: 56px;
    width: inherit;
    pointer-events: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 8px;
    box-sizing: border-box;
    border: none;
    background: transparent;
    outline: none;
    user-select: none;
    border: 1px solid #eee;
  }

  .flex {
    flex: 1;
  }

</style>

<button>
  <slot></slot>
</button>
    `;
  }
})
