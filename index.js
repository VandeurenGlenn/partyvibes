/**
 * Add space between camelCase text.
 */
var unCamelCase = (string) => {
  string = string.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2');
  string = string.toLowerCase();
  return string;
};

/**
* Replaces all accented chars with regular ones
*/
var replaceAccents = (string) => {
  // verifies if the String has accents and replace them
  if (string.search(/[\xC0-\xFF]/g) > -1) {
      string = string
              .replace(/[\xC0-\xC5]/g, 'A')
              .replace(/[\xC6]/g, 'AE')
              .replace(/[\xC7]/g, 'C')
              .replace(/[\xC8-\xCB]/g, 'E')
              .replace(/[\xCC-\xCF]/g, 'I')
              .replace(/[\xD0]/g, 'D')
              .replace(/[\xD1]/g, 'N')
              .replace(/[\xD2-\xD6\xD8]/g, 'O')
              .replace(/[\xD9-\xDC]/g, 'U')
              .replace(/[\xDD]/g, 'Y')
              .replace(/[\xDE]/g, 'P')
              .replace(/[\xE0-\xE5]/g, 'a')
              .replace(/[\xE6]/g, 'ae')
              .replace(/[\xE7]/g, 'c')
              .replace(/[\xE8-\xEB]/g, 'e')
              .replace(/[\xEC-\xEF]/g, 'i')
              .replace(/[\xF1]/g, 'n')
              .replace(/[\xF2-\xF6\xF8]/g, 'o')
              .replace(/[\xF9-\xFC]/g, 'u')
              .replace(/[\xFE]/g, 'p')
              .replace(/[\xFD\xFF]/g, 'y');
  }

  return string;
};

var removeNonWord = (string) => string.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, '');

const WHITE_SPACES = [
    ' ', '\n', '\r', '\t', '\f', '\v', '\u00A0', '\u1680', '\u180E',
    '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006',
    '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u2029', '\u202F',
    '\u205F', '\u3000'
];

/**
* Remove chars from beginning of string.
*/
var ltrim = (string, chars) => {
  chars = chars || WHITE_SPACES;

  let start = 0,
      len = string.length,
      charLen = chars.length,
      found = true,
      i, c;

  while (found && start < len) {
      found = false;
      i = -1;
      c = string.charAt(start);

      while (++i < charLen) {
          if (c === chars[i]) {
              found = true;
              start++;
              break;
          }
      }
  }

  return (start >= len) ? '' : string.substr(start, len);
};

/**
* Remove chars from end of string.
*/
var rtrim = (string, chars) => {
  chars = chars || WHITE_SPACES;

  var end = string.length - 1,
      charLen = chars.length,
      found = true,
      i, c;

  while (found && end >= 0) {
      found = false;
      i = -1;
      c = string.charAt(end);

      while (++i < charLen) {
          if (c === chars[i]) {
              found = true;
              end--;
              break;
          }
      }
  }

  return (end >= 0) ? string.substring(0, end + 1) : '';
};

/**
 * Remove white-spaces from beginning and end of string.
 */
var trim = (string, chars) => {
  chars = chars || WHITE_SPACES;
  return ltrim(rtrim(string, chars), chars);
};

/**
 * Convert to lower case, remove accents, remove non-word chars and
 * replace spaces with the specified delimeter.
 * Does not split camelCase text.
 */
var slugify = (string, delimeter) => {
  if (delimeter == null) {
      delimeter = "-";
  }

  string = replaceAccents(string);
  string = removeNonWord(string);
  string = trim(string) //should come after removeNonWord
          .replace(/ +/g, delimeter) //replace spaces with delimeter
          .toLowerCase();
  return string;
};

/**
* Replaces spaces with hyphens, split camelCase text, remove non-word chars, remove accents and convert to lower case.
*/
var hyphenate = string => {
  string = unCamelCase(string);
  return slugify(string, "-");
};

const shouldRegister = name => {
  return customElements.get(name) ? false : true;
};

var define = klass => {
  const name = hyphenate(klass.name);
  return shouldRegister(name) ? customElements.define(name, klass) : '';
};

const charIt = (chars, string) => `${chars[0]}${string}${chars[1]}`;

// let offset = 0;

/**
 * @param {object} element HTMLElement
 * @param {function} tagResult custom-renderer-mixin {changes: [], template: ''}
 */
var render = (element, tagResult) => {
  let offset = 0;
  if (element.shadowRoot) element = element.shadowRoot;
  if (!element.innerHTML) {
    element.innerHTML = tagResult.template;
  }
  const length = element.innerHTML.length;
  tagResult.changes.forEach(change => {
    const position = change.from.position;
    const chars = [
      element.innerHTML.charAt(((position[0] - 1) + offset)),
      element.innerHTML.charAt(((position[1]) + offset))
    ];
    element.innerHTML = element.innerHTML.replace(
      charIt(chars, change.from.value), charIt(chars, change.to.value)
    );
    offset = element.innerHTML.length - length;
  });
  return;
};

/**
 *
 * @example
 ```js
  const template = html`<h1>${'name'}</h1>`;
  let templateResult = template({name: 'Olivia'});

  templateResult.values // property values 'Olivia'
  templateResult.keys // property keys 'name'
  templateResult.strings // raw template array '["<h1>", "</h1>"]'
 ```
 */
const html$1 = (strings, ...keys) => {
  return ((...values) => {
    return {strings, keys, values};
  });
};

window.html = window.html || html$1;

var RenderMixin = (base = HTMLElement) =>
class RenderMixin extends base {

  constructor() {
    super();
    this.set = [];
    this.renderer = this.renderer.bind(this);
    this.render = this.renderer;
  }

  beforeRender({values, strings, keys}) {
    const dict = values[values.length - 1] || {};
    let template = strings[0];
    const changes = [];
    if (values[0] !== undefined) {
      keys.forEach((key, i) => {
        let value = Number.isInteger(key) ? values[key] : dict[key];
        if (value === undefined && Array.isArray(key)) {
          value = key.join('');
        } else if (value === undefined && !Array.isArray(key) && this.set[i]) {
          value = this.set[i].value; // set previous value, doesn't require developer to pass all properties
        } else if (value === undefined && !Array.isArray(key) && !this.set[i]) {
          value = '';
        }
        const string = strings[i + 1];
        const stringLength = string.length;
        const start = template.length;
        const end = template.length + value.length;
        const position = [start, end];

        if (this.set[i] && this.set[i].value !== value) {
          changes.push({
            from: {
              value: this.set[i].value,
              position: this.set[i].position,
            },
            to: {
              value,
              position
            }
          });
          this.set[i].value = value;
          this.set[i].position = [start, end];
        } else if (!this.set[i]) {
          this.set.push({value, position: [start, end]});
          changes.push({
            from: {
              value: null,
              position
            },
            to: {
              value,
              position
            }
          });
        }
        template += `${value}${string}`;
      });
    } else {
      template += strings[0];
    }
    return {
      template,
      changes
    };
  }

  renderer(properties = this.properties, template = this.template) {
    if (!properties) properties = {};
    else if (!this.isFlat(properties)) {
      // check if we are dealing with an flat or indexed object
      // create flat object getting the values from super if there is one
      // default to given properties set properties[key].value
      // this implementation is meant to work with 'property-mixin'
      // checkout https://github.com/vandeurenglenn/backed/src/mixin/property-mixin
      // while I did not test, I believe it should be compatible with PolymerElements
      const object = {};
      // try getting value from this.property
      // try getting value from properties.property.value
      // try getting value from property.property
      // fallback to property
      for (const key of Object.keys(properties)) {
        let value;
        if (this[key] !== undefined) value = this[key];
        else if (properties[key].value !== undefined) {
          value = properties[key].value;
        } else {
          value = properties[key];
        }
        object[key] = value;
      }      properties = object;
    }
    render(this, this.beforeRender(template(properties)));
  }

  /**
   * wether or not properties is just an object or indexed object (like {prop: {value: 'value'}})
   */
  isFlat(object) {
    const firstObject = object[Object.keys(object)[0]];
    if (firstObject && firstObject.hasOwnProperty('value')) return false;
    else return true;
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    if (this.render) {
      this.render();
      this.rendered = true;
    }  }
};

define(class PartyButton extends RenderMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
  }

  button {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px;
    box-sizing: border-box;
    border: none;
    background: transparent;
    outline: none;
    user-select: none;
  }

  .flex {
    flex: 1;
  }

</style>

<button>
  <span class="flex"></span>
  <slot></slot>
  <span class="flex"></span>
</button>
    `;
  }
});

const map = new Map();

var mapper = {
  set: (id, params) => map.set(id, params),
  get: id => map.get(id),
  collision: (x, y, width, height) => {

  },
  map
};

define(class CanvasImage extends RenderMixin(HTMLElement) {

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

    this.attachShadow({mode: 'open'});

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
      });
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
    };

    this.img.src = o.src;
  }
});

// import { analyze } from 'web-audio-beat-detector';

define(class PartyTurntable extends RenderMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.audioContext = new AudioContext();

    // this.peaks.on('peaks.ready');
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    this.peaks = peaks.init({
      container: this.shadowRoot.querySelector('.peaks-container'),
      mediaElement: this.shadowRoot.querySelector('audio'),
      audioContext: this.audioContext
    });

    this.shadowRoot.querySelector('audio').play();
    this.shadowRoot.querySelector('audio').pause();
    this.shadowRoot.querySelector('party-button').addEventListener('click', e => {
      this.shadowRoot.querySelector('audio').play();
    });
  }

  get template() {
    return html`
<style>
  :host {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    pointer-events: auto;
  }

  canvas-image {
    position: absolute;
  }

  .vinyl {
    opacity: 0;
  }

  :host([song-loaded]) .vinyl {
    opacity: 1;
  }

  party-button {
    pointer-events: auto;
    cursor: pointer;
  }
</style>

<canvas-image src="assets/decks/deep.svg" width="300" height="300"></canvas-image>
<canvas-image class="vinyl" src="assets/vinyls/Vinyl_record.svg" width="300" height="300"></canvas-image>

<span class="peaks-container"></span>
<audio src="assets/music/00 - 28-07-2009_5 -  We are going_2 2.mp3"></audio>
<party-button>play</party-button>

    `;
  }
});

// import { analyze } from 'web-audio-beat-detector';

define(class PartyDecks extends RenderMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

  }

  get template() {
    return html`
<style>
  :host {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
  }
</style>
<party-turntable></party-turntable>

<party-turntable song-loaded></party-turntable>

    `;
  }
});

var index = define(class partyVibes extends RenderMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this._init();
  }

  _init() {
    console.log('ready to initialize');
  }

  get template() {
    return html`
<style>
  :host {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    overflow: hidden;

    --primary-color: #bec8e9;

    --header-height: 40px;
  }

  header {
    height: var(--header-height);
    width: 100%;
    padding: 5px 10px;
    box-sizing: border-box;

    background: var(--primary-color)
  }

  main {
    height: calc(100% - var(--header-height));
  }
</style>

<header></header>
<main>
  <party-decks></party-decks>
</main>

    `;
  }
});

export default index;
