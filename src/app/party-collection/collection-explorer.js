import define from '../../../node_modules/backed/src/utils/define';
import RenderMixin from '../../../node_modules/custom-renderer-mixin/src/render-mixin.js';

export default define(class CollectionExplorer extends RenderMixin(HTMLElement) {

  get selector() {
    return this.shadowRoot.querySelector('custom-selector');
  }

  get pages() {
    return this.shadowRoot.querySelector('custom-pages');
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'})

    this._onSelected = this._onSelected.bind(this);
  }

  connectedCallback() {
    import(`./collection-explorer-template.js`).then(({ template }) => {
      this.template = template;
      if (super.connectedCallback) super.connectedCallback();

      this.selector.addEventListener('selected', this._onSelected);
    });
  }

  _onSelected({detail}) {
    this.pages.select(detail);
  }

})
