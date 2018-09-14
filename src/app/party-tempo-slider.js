import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';


import './party-slider';
import './party-button';
import './../custom-select';
import lines from './../utils/lines'

export default define(class PartyTempoSlider extends RenderMixin(HTMLElement) {

  get slider() {
    return this.shadowRoot.querySelector('party-slider')
  }

  get selector() {
    return this.shadowRoot.querySelector('custom-select')
  }

  constructor() {
    super()
    this.attachShadow({mode: 'open'});
    this.percentage = .4;
    this._onSelected = this._onSelected.bind(this);


  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this.render({lines: lines({count: [
      {width: 2},
      {width: 4},
      {width: 6},
      {width: 8},
      {width: 10},
      {width: 12},
      {width: 14},
      {width: 12},
      {width: 10},
      {width: 8},
      {width: 6},
      {width: 4},
      {width: 2}
    ]})})

    this.shadowRoot.querySelector('custom-select').addEventListener('selected', this._onSelected);
    this.slider.addEventListener('input', ({ detail }) => {
      this.current = parseFloat(detail);
      if (this.current === 0.5) detail = this.current * 2;
      else  detail = (this.current - (this.current * (this.percentage / 10))) * 2;

      this.dispatchEvent(new CustomEvent('change', {detail}))
    });
  }

  _onSelected({detail}) {
    this.percentage = parseFloat(detail);
    detail = (this.current - (this.current * (this.percentage / 10))) * 2;
    this.dispatchEvent(new CustomEvent('change', {detail}))
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
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

  .center {
    align-items: center;
  }

  .percentage {
    display: block;
    box-sizing: border-box;
    padding: 16px 0px;
  }

  party-slider {
    height: 200px;
  }

  .lines {
    padding: 6px 0;
  }

  .lines.left {
    align-items: flex-end;
  }

</style>
<span class="flex2"></span>
<span class="row">
  <span class="column lines left">${'lines'}</span>

  <party-slider name="bpm" min="0" max="3" step="0.01" vertical></party-slider>

  <span class="column lines">${'lines'}</span>
</span>
<span class="flex"></span>
<custom-select selected=".2" attr-for-selected="data-id">
  <span class="percentage row center" data-id="1.6">16</span>
  <span class="percentage row center" data-id=".8">8</span>
  <span class="percentage row center" data-id=".4">4</span>
  <span class="percentage row center" data-id=".2">2</span>
</custom-select>
<span class="flex2"></span>
<party-button>lock (pitch)</party-button>
    `
  }
})
