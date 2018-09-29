import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';

export default define(class PartyStudioWave extends RenderMixin(HTMLElement) {

  set id(value) {
    this.setAttribute('id', value)
  }

  set song(value) {
    this._song = value;
    this.id = value.id;
  }

  get id() {
    return this.getAttribute('id');
  }

  get song() {
    return this._song;
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  /**
   * Html tagged template
   */
  get template () {
    return html`<style>
      :host {
        display: flex;
        flex-direction: row;
      }
    </style>

    
    <slot></slot>`;
  }

});
