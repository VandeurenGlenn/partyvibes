import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';


import './party-slider';
import './party-button';

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
    this.percentage = 4
    // disable RenderMixin's first render
    // this.rendered = true;
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this.selector.addEventListener('selected', this._onSelected);
    this.slider.addEventListener('input', ({ detail }) => {
      // this.percentage
      // 0.5 =1
      detail = detail * 2
      this.dispatchEvent(new CustomEvent('change', {detail}))
    });
    // this.input.addEventListener('input', this.oninput);
  }

  _onSelected({detail}) {
    this.percentage = detail
  }

  shouldRender() {
    // if (this.value) this.render({value: this.value}, this.template)
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
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

</style>
<span class="flex2"></span>
<party-slider name="bpm" min="0" max="3" step="0.01" vertical></party-slider>
<span class="flex"></span>
<custom-select selected="4" attr-for-selected="data-id">
  <span class="percentage row center" data-id="100">100</span>
  <span class="percentage row center" data-id="16">16</span>
  <span class="percentage row center" data-id="8">8</span>
  <span class="percentage row center" data-id="4">4</span>
</custom-select>
<span class="flex2"></span>
<party-button>lock (pitch)</party-button>
    `
  }
})
