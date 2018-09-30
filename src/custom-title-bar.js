import define from '../node_modules/backed/src/utils/define';
import RenderMixin from '../node_modules/custom-renderer-mixin/src/render-mixin.js';

export default define(class CustomTitleBar extends RenderMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'})
  }

  get template() {
    return html`
<style>
  :host {
    background: #333;
    display: flex;
    flex-direction: row;
    height: 26px;
    box-sizing: border-box;
    width: 100%;
  }

  .dragger {
    flex: 1;
    -webkit-user-select: none;
    -webkit-app-region: drag;
  }
</style>
<slot name="left"></slot>
<span class="dragger"></span>
<slot name="middle"></slot>
<span class="dragger"></span>
<slot name="right"><slot>
    `;
  }
})
