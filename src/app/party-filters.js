import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';

import './filter-knob';

export default define(class PartyFilters extends RenderMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'})
  }

  get defaults() {
    return {
      lowpass: 440
    }
  }

  filterize(type, frequency, q) {
    const filter = this.audioContext.createBiquadFilter();
    source.connect(filter);
    filter.connect(this.audioContext.destination);
    // Create and specify parameters for the low-pass filter.
    filter.type = type; // Low-pass filter. See BiquadFilterNode docs
    filter.frequency.value = this.defaults[type]; // Set cutoff to 440 HZ
    return filter;
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this.filters = Array.from(this.querySelectorAll('filter-knob'));
    this.audioContext = window.party.audioContext;
    this.filters.map(el => [
      el,
      filterize(el.getAttribute('filter'))
    ]);
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: row;
    padding: 12px 12px 12px 12px;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: 1px solid #fff;
    align-items: center;
    background: #888;
  }

  .gains {
    padding: 8px 0;
    width: 100%;
  }

  .defeat {
    padding: 0 6px;
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
  filter-knob {
    padding: 6px;
  }
</style>
  <span class="column">
    <filter-knob filter="lowpass" right></filter-knob>
    <filter-knob filter="hp" right></filter-knob>
    <filter-knob filter="hp" right></filter-knob>
  </span>

  <span class="flex"></span>
  <span class="column">
  <p>high</p>
  <p>mid</p>
  <p>low</p>
  </span>
  <span class="flex"></span>

  <span class="flex">
    <filter-knob filter="hp" right></filter-knob>
    <filter-knob filter="hp" right></filter-knob>
    <filter-knob filter="hp" right></filter-knob>
  </span>
    `;
  }
})
