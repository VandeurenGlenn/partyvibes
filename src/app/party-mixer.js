import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';

import './party-slider';

export default define(class PartyMixer extends RenderMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'})
    this._change = this._change.bind(this)
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    const sliders = this.shadowRoot.querySelectorAll('party-slider');
    sliders.forEach(slider => slider.addEventListener('input', this._change))
  }

  _change(event) {
    this.gainChanged(event.path[0]);
  }

  gainChanged(target) {
    this.dispatchEvent(new CustomEvent('gain-change', {
      detail: {
        value: target.value,
        target: target.name
      }})
    )
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    padding: 12px 24px 12px 24px;
    box-sizing: border-box;
    min-width: 180px;
    border-left: 1px solid #fff;
    border-right: 1px solid #fff;
  }

  .gains {
    padding: 8px 0;
    width: 100%;
  }

  .defeat {
    padding: 8px 0;
  }

  .row {
    display: flex;
    flex-direction: row;
  }

  .column {
    display: flex;
    flex-direction: column;
  }

  .flex {
    flex: 1;
  }

  .flex2 {
    flex: 2;
  }

  .center, .center-center {
    align-items: center;
  }

  .center-center {
    justify-content: center;
  }
</style>
<span class="row gains">
  <span class="flex"></span>
  <party-slider vertical name="A"></party-slider>
  <span class="flex2"></span>
  <party-slider vertical name="B"></party-slider>
  <span class="flex"></span>
</span>

<span class="flex"></span>

<span class="row">
  <span class="flex"></span>
  <h4>A</h4>
  <span class="flex2"></span>
  <h4>B</h4>
  <span class="flex"></span>
</span>
<party-slider class="fader" name="fader"></party-slider>
    `;
  }
})
