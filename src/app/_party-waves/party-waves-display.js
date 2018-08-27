import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';

import './party-button.js';
import './canvas-image.js';
import './party-tempo-slider.js';

export default define(class PartyWavesDisplay extends RenderMixin(HTMLElement) {
  get canvas() {
    return this.shadowRoot.querySelector('canvas')
  }
  constructor() {
    super();

    this.attachShadow({mode: 'open'})
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 80px;

  }

  .timeline {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 12px;
  }

  .marker {
    position: absolute;
    top: 18px;
    bottom: 18px;
    left: 0;
    right: 0;
  }

  canvas, .marker {
    height: 100%;
    width: 100%;
  }
</style>
<span class="timeline"></span>
<canvas></canvas>
<canvas class="marker"></canvas>
    `;
  }

})
