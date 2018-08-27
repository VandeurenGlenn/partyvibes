import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin.js';

export default define(class PureKnobElement extends RenderMixin(HTMLElement) {
  get size() {
    return 48;
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this._onValue = this._onValue.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    this.knob = pureknob.createKnob(this.size, this.size);
    this.knob.setProperty('angleStart', -0.75 * Math.PI);
    this.knob.setProperty('angleEnd', 0.75 * Math.PI);
    this.knob.setProperty('colorFG', '#88ff88');
    this.knob.setProperty('trackWidth', 0.4);
    this.knob.setProperty('valMin', 0);
    this.knob.setProperty('valMax', 100);
    this.knob.setValue(50);
    this.knob.addListener(this._onValue)
    this.node = this.knob.node();
    this.shadowRoot.appendChild(this.node)
  }

  _onValue(knob, value) {
    console.log(knob, value, this.name);
  }

  get template() {
    return html`
<style>
  :host {
    /* height: 24px;
    width: 24px; */
    display: flex;
    /* border: 1px solid #eee;
    border-radius: 50%; */
    height: 48px;
    width: 48px;
    pointer-events: auto;
    cursor: pointer;
  }

</style>
    `;
  }
})
