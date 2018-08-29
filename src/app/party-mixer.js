import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';

import './party-slider';
import lines from './../utils/lines';
export default define(class PartyMixer extends RenderMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'})
    this._change = this._change.bind(this)
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    const sliders = this.shadowRoot.querySelectorAll('party-slider');
    sliders.forEach(slider => slider.addEventListener('input', this._change));

    this.render({lines: lines({count: [
      {height: 2, width: 3},
      {height: 4, width: 3},
      {height: 6, width: 3},
      {height: 8, width: 3},
      {height: 10, width: 3},
      {height: 12, width: 3},
      {height: 14, width: 3},
      {height: 12, width: 3},
      {height: 10, width: 3},
      {height: 8, width: 3},
      {height: 6, width: 3},
      {height: 4, width: 3},
      {height: 2, width: 3}
    ]})})
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
    box-sizing: border-box;
    min-width: 180px;
    height: 100%;

    min-height: 256px;
    border-left: 1px solid #fff;
    border-right: 1px solid #fff;
  }

  .gains {
    width: 100%;
  }

  .fade {
    padding: 0 8px;

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

  .lines.top {
    align-items: flex-end;
  }

  .spacer {
    display: block;
    height: 1px;
    background: #FFF;
    width: 100%;
  }
</style>
<span class="flex"></span>
<span class="row gains">
  <span class="flex"></span>

  <span class="column lines">${'lines'}</span>
  <party-slider vertical name="A"></party-slider>
  <span class="column lines">${'lines'}</span>
  <span class="flex2"></span>

  <span class="column lines">${'lines'}</span>
  <party-slider vertical name="B"></party-slider>
  <span class="column lines">${'lines'}</span>
  <span class="flex"></span>
</span>

<span class="flex"></span>
<span class="spacer"></span>
<span class="flex"></span>
<span class="fade column">
  <span class="row lines top">${'lines'}</span>
  <party-slider class="fader" name="fader"></party-slider>
  <span class="row lines">${'lines'}</span>
</span>
<span class="flex"></span>
    `;
  }
})
