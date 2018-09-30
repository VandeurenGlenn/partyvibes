import define from '../../../node_modules/backed/src/utils/define';
import RenderMixin from '../../../node_modules/custom-renderer-mixin/src/render-mixin.js';
import CustomDragMixin from '../../../node_modules/custom-drag-drop/custom-drag-mixin.js';

export default define(class CollectionItem extends RenderMixin(HTMLElement) {
  set song(value) {
    this.innerHTML = `
      <h4>${value.artist}</h4>
      <span class="flex"></span>
      <h4>${value.title}</h4>
      <span class="flex2"></span>
      <h4>${value.genre}</h4>
      <span class="flex2"></span>
      <h4 class="last">${value.bpm}</h4>
    `;
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.dragstart = this.dragstart.bind(this);
  }

  connectedCallback() {
    (async () => {
      const { template } = await import('./collection-item-template.js')
      this.template = template;

      if (super.connectedCallback) super.connectedCallback();
      this.song = this.data;

      this.setAttribute('draggable', true)
      this.addEventListener('dragstart', this.dragstart);
    })();


  }

  disconnectedCallback() {
    if (super.disconnectedCallback) super.disconnectedCallback();
    this.removeEventListener('dragstart', this.dragstart);
  }

  dragstart(event) {
    this.dragging = true;
    event.dataTransfer.setData('items', JSON.stringify(window.party.collection[this.data.path]));
  }

  mouseup(event) {
    this.dragging = false;
    document.removeEventListener('mouseup', this.mouseup);
  }

})
