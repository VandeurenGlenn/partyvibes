import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';

export default define(class PartyStudioTable extends RenderMixin(HTMLElement) {

  set name(value) {
    this.setAttribute('name', value);
  }

  get name() {
    return this.getAttribute('name')
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this.render({name: this.name})
  }
  /**
   * Html tagged template
   */
  get template () {
    return html`<style>
      :host {
        display:  flex;
        flex-direction: row;
        height: 100%;
      }
    </style>

    <span class="">
    ${'name'}
    </span>
    <slot></slot>`;
  }

});
