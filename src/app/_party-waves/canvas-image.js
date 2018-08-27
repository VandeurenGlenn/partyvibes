import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';
import mapper from './mapper.js';

export default define(class CanvasImage extends RenderMixin(HTMLElement) {

  static get observedAttributes() {
    return ['src', 'width', 'height', 'x', 'y', 'offset']
  }

  get context() {
    return this.canvas.getContext('2d');
  }

  get artBounds() {
    return [2560, 984]
  }

  get y() {
    return this._y || 0;
  }

  get y() {
    return this._y || 0;
  }

  get width() {
    return this.canvas.width || 300;
  }

  set y(value) {
    this._y = value;
  }

  set x(value) {
    this._x = value;
  }

  set width(value) {
    this.canvas.width = value;
  }

  set height(value) {
    this.canvas.height = value;
  }

  get height() {
    return this.canvas.height || 300;
  }

  set offset(value) {
    this._offset = value;
  }

  get offset() {
    return this._offset || { x: 0, y: 0 }
  }

  set src(value) {
    this.srcChanged(value, this._src);
    this._src = value;
  }

  get src() {
    return this._src;
  }

  get canvas() {
    return this.shadowRoot.querySelector('canvas');
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: row;
  }
</style>

<canvas></canvas>
    `;
  }

  constructor() {
    super();
    this.map = mapper.map;

    this.attachShadow({mode: 'open'})

      if (super.connectedCallback) super.connectedCallback();
  }

  connectedCallback() {
    // this.ratio =
  }

  attributeChangedCallback(name, old, value) {
    if (old !== value) this[name] = value;
  }

  componize(params) {
    const id = params.id || Math.random().toString(36).slice(-11);
    mapper.set(id, params);
  }

  scale({ width, height, offset, x, y }) {
    if (this.width < this.artBounds[0] || this.height < this.artBounds[1]) {
      let ratioX = (this.artBounds[0] / this.width);
      let ratioY = (this.artBounds[1] / this.height);
      // ratioX = (width * 2) / ratioX
      // ratioY = (height * 2 ) / ratioY
      const nwidth = width / ratioX;
      const nheight = height / ratioX;

      // if (offset) {
      //   if (offset.x) offset.x = offset.x * ratioX;
      //   if (offset.y) offset.y = offset.y * ratioX;
      // }


      x = x + (width - nwidth) / ratioX;
      y = y + (height - nheight) / ratioX;

      width = nwidth;
      height = nheight;
    }
    return { width, height, offset, x, y }
  }

  srcChanged(value, oldValue) {
    if (oldValue !== value) {
      this.load({
        src: value,
        offset: this.offset,
        width: 300,
        height: 300,
        x: 0,
        y: 0
      })
    }
  }

  draw(o) {
    if (!o) o = this.imageObject;

    this.componize(o);

    if (o.center) {
      o.x = (this.width / 2) - (this.img.width / 2) + o.offset.x;
      o.y = (this.height / 2) - (this.img.height / 2) + o.offset.y;
    }
    const {width, height, offset, x, y} = this.scale(o);

    // this.context.clearRect(0, 0, this.width, this.height);
    this.context.drawImage(this.img, x, y, width, height);
  }

  load(o) {
    this.img = new Image();

    this.img.onload = () => {
      if (!this.width) this.width = this.img.width;
      if (!this.height) this.height = this.img.height;
      this.context.drawImage(this.img, 0, 0, this.width, this.height);
    }

    this.img.src = o.src;
  }
});
