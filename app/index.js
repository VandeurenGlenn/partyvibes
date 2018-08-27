'use strict';

var webAudioBeatDetectorBroker = require('web-audio-beat-detector-broker');

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

/**
 * @param {object} element HTMLElement
 * @param {function} tagResult custom-renderer-mixin {changes: [], template: ''}
 */
var render = (element, {changes, template}) => {
  if (!changes && !template) return console.warn('changes or template expected');
  if (element.shadowRoot) element = element.shadowRoot;
  if (!element.innerHTML) element.innerHTML = template;
  for (const key of Object.keys(changes)) {
    const els = Array.from(element.querySelectorAll(`[render-mixin-id="${key}"]`));
    for (const el of els) {
      el.innerHTML = changes[key];
    }
  }
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
    const changes = {};
    let template = null;
    if (!this.rendered) template = strings[0];

    if (values[0] !== undefined) {
      keys.forEach((key, i) => {
        const string = strings[i + 1];
        let value = Number.isInteger(key) ? values[key] : dict[key];
        if (value === undefined && Array.isArray(key)) {
          value = key.join('');
        } else if (value === undefined && !Array.isArray(key) && this.set[i]) {
          value = this.set[i].value; // set previous value, doesn't require developer to pass all properties
        } else if (value === undefined && !Array.isArray(key) && !this.set[i]) {
          value = '';
        }
        if (!this.rendered) {
          template = template.replace(/(>)[^>]*$/g,  ` render-mixin-id="${key}">`);
          template += `${value}${string}`;
        }
        if (this.set[key] && this.set[key] !== value) {
          changes[key] = value;
          this.set[key] = value;
        } else if (!this.set[key]) {
          this.set[key] = value;
          changes[key] = value;
        }
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
          value = '';
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
    if (firstObject)
      if (firstObject.hasOwnProperty('value') ||
          firstObject.hasOwnProperty('reflect') ||
          firstObject.hasOwnProperty('observer') ||
          firstObject.hasOwnProperty('render'))
        return false;
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

    pointer-events: auto;
    cursor: pointer;
  }

  button {
    min-height: 48px;
    min-width: 56px;
    width: inherit;
    pointer-events: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 8px;
    box-sizing: border-box;
    border: none;
    background: transparent;
    outline: none;
    user-select: none;
    border: 1px solid #eee;
  }

  .flex {
    flex: 1;
  }

</style>

<button>
  <slot></slot>
</button>
    `;
  }
});

define(class ScrollingText extends RenderMixin(HTMLElement) {
  static get observedAttributes() {
    return ['text'];
  }

  get delay() {
    return this.getAttribute('delay') || 0
  }

  set text(value) {
    this.innerHTML = `<span class="text">${value}</span>`;
    requestAnimationFrame(() => {
      const el = this.querySelector('.text');
      el.style.transfrom = 'translateX: -100%';
      window.anime({
        targets: el,
        translateX: ['-100%', this.offsetWidth - el.offsetWidth],
        loop: true,
        elasticity: 0,
        easing: 'easeOutSine',
        duration: 30000
      });
    });
  }

  get spacing() {
    return 20;
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) this[name] = newValue;

  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    color: inherit;
  }

  .text {
    display: inherit;
    color: inherit;
    /* width: 100%; */
    height: 100%;
  }

  ::slotted(.text) {
    display: block;
    font-size: 20px;
    color: inherit;
    text-transform: uppercase;
  }
</style>
<span class="text">
  <slot></slot>
</span>
    `;
  }

});

define(class PartyPlayer extends RenderMixin(HTMLElement) {

  get ques() {
    return this.peaks.points.getPoints()
  }

  get queLabels() {
    return ['A', 'B', 'C', 'D'];
  }

  get queColors() {
    return ['#E91E63', '#673AB7', '#2196F3', '#00BCD4'];
  }

  get audio() {
    return this.shadowRoot.querySelector('audio');
  }

  set text(value) {
    this.shadowRoot.querySelector('scrolling-text').text = value;
  }

  set playbackRate(value) {
    this.audio.playbackRate = value;
    this.source.playbackRate.value = value;
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this._onDrop = this._onDrop.bind(this);
    this._userseek = this._userseek.bind(this);
    this._preventDefault = this._preventDefault.bind(this);
  }

  connectedCallback() {
    // import('./party-player-template.js').then(({ template }) => {
      // this.template = template;
    super.connectedCallback();
    // })
    this.addEventListener('dragover', this._preventDefault);
    this.addEventListener('drop', this._onDrop);

    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.audio.volume = 0;
  }

  _preventDefault(event) {
    return event.preventDefault();
  }

  _onDrop(event) {
    event.preventDefault();
    let data = event.dataTransfer.getData('items');
    data = JSON.parse(data);
    this.beforeLoad(data);
    this.data = data;
    this.load(this.data.path, this.data.ques);
    this.text = `${this.data.artist} - ${this.data.title}`;
  }

  decode(ayyayBuffer) {
    return new Promise((resolve, reject) => {
      const context = this.audioContext || new AudioContext();
      context.decodeAudioData(ayyayBuffer, audioBuffer => resolve(audioBuffer));
    });
  }

  load(src, ques = []) {
    if (!src) return console.warn('src undefined');
    this.worker = new Worker('workers/song.js');
    this.worker.onmessage = async message => {
      try {
        if (this.peaks) this.peaks.destroy();
        this.audio.onloadeddata = async () => {
          const buffer_size = 4096;
          this.peaks = peaks.init({
            container: this.shadowRoot.querySelector('.peaks-container'),
            mediaElement: this.shadowRoot.querySelector('audio'),
            audioContext: this.audioContext,
            points: ques,
            height: 86,
            overviewWaveformColor: '#888'
          });


          this.source = this.audioContext.createBufferSource();
          this.audioBuffer = await this.decode(message.data.arrayBuffer);
          this.source.buffer = this.audioBuffer;
          this.scriptProcessor = this.audioContext.createScriptProcessor(buffer_size);

          this.scriptProcessor.onaudioprocess = function() {
           var in0  = event.inputBuffer.getChannelData(0);
           var in1  = event.inputBuffer.getChannelData(1);
           var out0 = event.outputBuffer.getChannelData(0);
           var out1 = event.outputBuffer.getChannelData(1);

           for(var k = 0; k < buffer_size; k++) {
             out0[k] = in0[k];
             out1[k] = in1[k];
           }
         };

          this.source.connect(this.gainNode);
          this.gainNode.connect(this.scriptProcessor);
          // this.gainNode.connect(this.)
          // this.gainNode.connect()
          // this.scriptProcessor.connect(this.audioContext.destination)
          this.saveQues = this.saveQues.bind(this);
          this.peaks.on('points.dragend', this.saveQues);
          this.peaks.on('user_seek', this._userseek);
        };
        this.audio.setAttribute('src', message.data.uri);



      } catch (e) {
        console.error(e);
      }
    };

    this.worker.postMessage(src);
  }

  play() {
    if (this.source.paused) {
      this.source = this.audioContext.createBufferSource();
      this.source.buffer = this.audioBuffer;

      this.source.connect(this.gainNode);
    }
    this.peaks.player.play();
    this.source.start(0, this.currentTime);
    this.source.playing = true;
    this.source.paused = false;
  }

  pause() {
    this.peaks.player.pause();

    this.currentTime = this.audioContext.currentTime;
    this.source.stop();
    this.source.paused = true;
  }

  que() {
    this.peaks.points.add({
      time: this.peaks.player.getCurrentTime(),
      labelText: this.queLabels[this.ques.length],
      color: this.queColors[this.ques.length],
      editable: true,
      id: this.queLabels[this.ques.length]
    });
  }

  saveQues() {
    document.dispatchEvent(new CustomEvent('save-ques', {detail: {
        path: this.data.path,
        ques: this.ques
      }
    }));
  }

  // TODO: reduce writing to disk
  beforeLoad(data) {
    if (this.data && this.data.path !== data.path) this.saveQues();
  }

  loop({start, end}) {
    if (this.source.playing) {
      this.currentTime = this.audioContext.currentTime;
      this.source.stop();
    }
    if (this.looper && this.looper.playing) this.looper.stop();
    this.looper = this.audioContext.createBufferSource();
    this.looper.buffer = this.audioBuffer;
    this.looper.connect(this.audioContext.destination);
    this.looper.loop = true;
    if (start) this.looper.loopStart = start;
    if (end) this.looper.loopEnd = end;
    this.looper.start();
    this.looper.playing = true;
  }

  getCurrentTime() {
    return this.peaks.player.getCurrentTime()
  }

  _userseek(time) {
    this.source.stop();
    this.currentTime = time;
    // this.pause()
    this.source.paused = true;
    this.play();
  }

  get template() {
    return html`
    <style>
      :host {
        /* height: 100%; */
        /* min-width: 438px; */
        min-height: 198px;
        display: flex;
        flex-direction: column;
        pointer-events: auto;
        box-sizing: border-box;
        background: #333;
        position: relative;
        overflow: hidden;
        border-radius: 3px;
        border: 1px solid #fff;
      }

      .row {
        display: flex;
        flex-direction: row;
      }

      .info {
        height: 32px;
        padding: 0 24px;
        box-sizing: border-box;
      }

      .peaks-container {
        width: 100%;
        display: block;
        padding: 6px;
        box-sizing: border-box;
      }
      .zoom-container {

        pointer-events: none;
      }

      audio {
        position: absolute;
        bottom: 0;
      }

      .overview-container {
        height: 56px;
        position: absolute;
        bottom: 6px;
        left: 0;
        width: calc(100% - 12px);

        padding: 0 6px;
        box-sizing: border-box;
      }

      .flex {
        flex: 1;
      }

      scrolling-text {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 44px;
        color: #FFF;
      }
    </style>
    <span class="row info">
      <span class="duration"></span>
      <span class="currenttime"></span>
      <span class="flex"></span>
      <span class="bpm"></span>
    </span>
    <span class="peaks-container"></span>
    <span class="flex"></span>
    <audio></audio>

    <scrolling-text text="drop song to start"></scrolling-text>

    `

  }
});

/**
 * @mixin Backed
 * @module utils
 * @export merge
 *
 * some-prop -> someProp
 *
 * @param {object} object The object to merge with
 * @param {object} source The object to merge
 * @return {object} merge result
 */
var merge = (object = {}, source = {}) => {
  // deep assign
  for (const key of Object.keys(object)) {
    if (source[key]) {
      Object.assign(object[key], source[key]);
    }
  }
  // assign the rest
  for (const key of Object.keys(source)) {
    if (!object[key]) {
      object[key] = source[key];
    }
  }
  return object;
};

window.Backed = window.Backed || {};
// binding does it's magic using the propertyStore ...
window.Backed.PropertyStore = window.Backed.PropertyStore || new Map();

// TODO: Create & add global observer
var PropertyMixin = base => {
  return class PropertyMixin extends base {
    static get observedAttributes() {
      return Object.entries(this.properties).map(entry => {if (entry[1].reflect) {return entry[0]} else return null});
    }

    get properties() {
      return customElements.get(this.localName).properties;
    }

    constructor() {
      super();
      if (this.properties) {
        for (const entry of Object.entries(this.properties)) {
          const { observer, reflect, renderer } = entry[1];
          // allways define property even when renderer is not found.
          this.defineProperty(entry[0], entry[1]);
        }
      }
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
      if (this.attributes)
        for (const attribute of this.attributes) {
          if (String(attribute.name).includes('on-')) {
            const fn = attribute.value;
            const name = attribute.name.replace('on-', '');
            this.addEventListener(String(name), event => {
              let target = event.path[0];
              while (!target.host) {
                target = target.parentNode;
              }
              if (target.host[fn]) {
                target.host[fn](event);
              }
            });
          }
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this[name] = newValue;
    }

    /**
     * @param {function} options.observer callback function returns {instance, property, value}
     * @param {boolean} options.reflect when true, reflects value to attribute
     * @param {function} options.render callback function for renderer (example: usage with lit-html, {render: render(html, shadowRoot)})
     */
    defineProperty(property = null, {strict = false, observer, reflect = false, renderer, value}) {
      Object.defineProperty(this, property, {
        set(value) {
          if (value === this[`___${property}`]) return;
          this[`___${property}`] = value;

          if (reflect) {
            if (value) this.setAttribute(property, String(value));
            else this.removeAttribute(property);
          }

          if (observer) {
            if (observer in this) this[observer]();
            else console.warn(`observer::${observer} undefined`);
          }

          if (renderer) {
            const obj = {};
            obj[property] = value;
            if (renderer in this) this.render(obj, this[renderer]);
            else console.warn(`renderer::${renderer} undefined`);
          }

        },
        get() {
          return this[`___${property}`];
        },
        configurable: strict ? false : true
      });
      // check if attribute is defined and update property with it's value
      // else fallback to it's default value (if any)
      const attr = this.getAttribute(property);
      this[property] = attr || this.hasAttribute(property) || value;
    }
  }
};

define(class PartySlider extends PropertyMixin(RenderMixin(HTMLElement)) {
  static get properties() {
      return merge(super.properties, {
        value: {
          reflect: true
        },
        min: {
          reflect: true
        },
        max: {
          reflect: true
        },
        step: {
          reflect: true
        },
        name: {
          reflect: true
        }
      });
  }

  get min() {
    return this.input.min || 0;
  }

  get max() {
    return this.input.max || 1;
  }

  get step() {
    return this.inpurt.step || 0.01;
  }

  get input() {
    return this.shadowRoot.querySelector('input');
  }

  get value() {
    return this._value || this.getAttribute('value') || 0.5;
  }

  set min(value) {
    this.input.min = value;
  }

  set max(value) {
    this.input.max = value;
  }

  set step(value) {
    this.input.step = value;
  }

  set value(value) {
    this._value = value;
    this.input.value = value;
  }

  get name() {
    return this._name || this.getAttribute('name');
  }

  set name(value) {
    this._name = value;
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    // disable RenderMixin's first render
    // bind methods
    this.oninput = this.oninput.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    this.input.addEventListener('input', this.oninput);
  }

  attributeChangedCallback(name, old, value) {
    if (old !== value) this[name] = value;
  }

  oninput() {
    this.value = this.input.value;
    this.dispatchEvent(new CustomEvent('input', {detail: this.value}));
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 22px;
    width: 100%;
  }
  :host([vertical]) {
    flex-direction: column;
    width: 22px;
    height: 100%;
  }
  :host([vertical]) input {
    -webkit-appearance: slider-vertical
  }
  input {
    height: inherit;
    width: inherit;
    outline: none;
  }
</style>
<span>${'label'}</span>
<input type="range" min="0" max="1" step="0.01"></input>
    `
  }
});

define(class PartyTempoSlider extends RenderMixin(HTMLElement) {

  get slider() {
    return this.shadowRoot.querySelector('party-slider')
  }

  get selector() {
    return this.shadowRoot.querySelector('custom-select')
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.percentage = 4;
    // disable RenderMixin's first render
    // this.rendered = true;
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this.selector.addEventListener('selected', this._onSelected);
    this.slider.addEventListener('input', ({ detail }) => {
      // this.percentage
      // 0.5 =1
      detail = detail * 2;
      this.dispatchEvent(new CustomEvent('change', {detail}));
    });
    // this.input.addEventListener('input', this.oninput);
  }

  _onSelected({detail}) {
    this.percentage = detail;
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
});

//
define(class PartyQues extends RenderMixin(HTMLElement) {
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
    flex-direction: row;
    width: 100%;
  }

  .flex {
    flex: 1;
  }

  custom-selector {
    display: flex;
    flex-direction: row;
  }
</style>

<span class="flex"></span>
<custom-selector selected="A" class="row">
  <party-button class="que-item">A</party-button>
  <party-button class="que-item">B</party-button>
  <party-button class="que-item">C</party-button>
  <party-button class="que-item">D</party-button>
</custom-selector>
<span class="flex"></span>
    `;
  }
});

define(class PartyEffects extends RenderMixin(HTMLElement) {
  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: row;
  }

  custom-selector {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
  }
</style>

<custom-selector>
  <party-button>filter</party-button>
  <party-button>echo</party-button>
  <party-button>trans</party-button>
  <party-button>skid</party-button>
  <party-button>hold</party-button>
  <party-button title="phaser">phase</party-button>
  <party-button title="flanger">flang</party-button>
  <party-button title="panner">pan</party-button>
  <party-button title="reverse">rev</party-button>
</custom-selector>
    `;
  }
});

define(class PartyTurntable extends RenderMixin(HTMLElement) {

  get tempoSlider() {
    return this.shadowRoot.querySelector('party-tempo-slider')
  }

  get player() {
    return this.shadowRoot.querySelector('party-player')
  }

  constructor() {
    super();

    this.attachShadow({mode: 'open'});

    // this.peaks.on('peaks.ready');
  }

  connectedCallback() {
    // super.connectedCallback();
    if (super.connectedCallback) super.connectedCallback();
    // this.audioBuffer = this.audioContext.createBuffer();
    this.tempoSlider.addEventListener('change', ({ detail }) => {
      this.player.playbackRate = detail;
    });

    this.loop = {};

    this.play = this.play.bind(this);
    this.shadowRoot.querySelector('.play').addEventListener('click', this.play);

    this.shadowRoot.querySelector('.que').addEventListener('click', e => {
      this.player.que();
    });

    this.shadowRoot.querySelector('.loop-in').addEventListener('click', e => {
      this.loop.start = this.player.getCurrentTime();

      if (!this.player.source.playing) {
        this.player.play();
      }
    });

    this.shadowRoot.querySelector('.loop-out').addEventListener('click', e => {
      this.loop.end = this.player.getCurrentTime();
      this.player.pause();
      this.player.loop(this.loop);
    });

    this.shadowRoot.querySelector('.reloop').addEventListener('click', e => {
      this.loop.end = this.player.source.context.currentTime;
      this.player.loop(this.loop);
    });
  }

  play() {
    if (!this.playing) {
      // this.source.connect(this.audioContext.destination)
      // this.audioContext.createBufferSource()

      // console.log(this.source);
      this.player.play();
      // TODO: pitch
      // TODO: convert playbackRate to bpm
      this.playing = true;
    } else {
      this.player.pause();
      // TODO: get currenttime and temp save when paused
      this.playing = false;
    }
  }

  get template() {
    return html`
    <style>
    :host {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: row;
      pointer-events: auto;
      background: #555;
      padding: 24px 0 24px 0;
      box-sizing: border-box;
    }

    .column {
      display: flex;
      flex-direction: column;
    }

    .row {
      display: flex;
      flex-direction: row;
    }

    .peaks-container {
      width: 100%;
      display: block;
    }
    .bottom {
      padding: 6px 24px 6px 0;
      box-sizing: border-box;
    }

    .flex {
      flex: 1;
    }

    .flex2 {
      flex: 2;
    }

    party-tempo-slider, .side {

      padding: 0 24px;
    }

    .que-item {
      display: flex;
      align-items: center;
      padding: 24px;
      box-sizing: border-box;
    }

    .center {
      align-items: center;
    }


    party-button {
    }
    </style>
    <span class="column side center">

      <span class="flex2"></span>
      <party-button class="loop-in">in</party-button>
      <party-button class="loop-out">out</party-button>
      <party-button class="reloop">reloop</party-button>

      <span class="flex"></span>
      <party-button class="que">que</party-button>
      <party-button class="play">play</party-button>
    </span>

    <span class="flex"></span>

    <span class="column top">
      <span class="row top">
        <span class="column top">
          <party-player></party-player>
          <party-effects></party-effects>
          <party-ques></party-ques>
        </span>
      </span>
      <span class="row">


        <span class="flex"></span>

        <span class="flex2"></span>
      </span>
    </span>
    <span class="flex"></span>
    <party-tempo-slider></party-tempo-slider>

    `

  }
});

define(class PartyMixer extends RenderMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this._change = this._change.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    const sliders = this.shadowRoot.querySelectorAll('party-slider');
    sliders.forEach(slider => slider.addEventListener('input', this._change));
  }

  _change(event) {
    this.gainChanged(event.path[0]);
  }

  gainChanged(target) {
    this.dispatchEvent(new CustomEvent('gain-change', {
      detail: {
        value: target.value,
        target: target.name
      }})
    );
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    padding: 12px 24px 12px 24px;
    box-sizing: border-box;
    min-width: 180px;
    border-left: 1px solid #fff;
    border-right: 1px solid #fff;
  }

  .gains {
    padding: 8px 0;
    width: 100%;
  }

  .defeat {
    padding: 8px 0;
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
</style>
<span class="row gains">
  <span class="flex"></span>
  <party-slider vertical name="A"></party-slider>
  <span class="flex2"></span>
  <party-slider vertical name="B"></party-slider>
  <span class="flex"></span>
</span>

<span class="flex"></span>

<span class="row">
  <span class="flex"></span>
  <h4>A</h4>
  <span class="flex2"></span>
  <h4>B</h4>
  <span class="flex"></span>
</span>
<party-slider class="fader" name="fader"></party-slider>
    `;
  }
});

define(class PureKnobElement extends RenderMixin(HTMLElement) {
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
    this.knob.addListener(this._onValue);
    this.node = this.knob.node();
    this.shadowRoot.appendChild(this.node);
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
});

define(class FilterKnob extends RenderMixin(HTMLElement) {
  static get observedAttributes() {
    return ['filter']
  }

  get left() {
    return !this.hasAttribute('right')
  }

  set filter(value) {
    this.shadowRoot.querySelector('pure-knob-element').name = value;
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.render(this.template);
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this.span = document.createElement('span');
    if (this.left) {
      this.knob = this.shadowRoot.querySelector('party-knob');
      this.span.innerHTML = '<label><slot></slot></label><span class="flex"></span>';
      this.shadowRoot.insertBefore(this.span, this.knob);
    } else {
      this.span.innerHTML = '<span class="flex"></span><label><slot></slot></label>';
      this.shadowRoot.appendChild(this.span);
    }
  }

  attributeChangedCallback(name, oldvalue, newvalue) {
    if (oldvalue !== newvalue) {
      this[name] = newvalue;
    }
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    pointer-events: auto;
    cursor: pointer;
    align-items: center;
  }

  .flex {
    flex: 1;
  }

</style>

<pure-knob-element></pure-knob-element>

    `;
  }
});

define(class PartyFilters extends RenderMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
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
});

class GainNode {
  constructor(deck) {
    if (!deck) return console.warn('Expected deck to be defined');
    const audioContext = deck.audioContext;
    const node = audioContext.createGain();

    deck.gainNode.connect(node);
    node.connect(audioContext.destination);

    node.gain.value = 0.5;

    return node;
  }
}

// import { analyze } from 'web-audio-beat-detector';


define(class PartyDeck extends RenderMixin(HTMLElement) {

  get __tables__() {
    return [
      {name: 'a', side: 'left'},
      {name: 'b', side: 'right'},
      {name: 'c', side: 'left'},
      {name: 'd', side: 'right'}
    ]
  }
  get a() {
    return this.shadowRoot.querySelector('party-turntable[name="a"]')
  }

  get b() {
    return this.shadowRoot.querySelector('party-turntable[name="b"]')
  }

  get mixer() {
    return this.shadowRoot.querySelector('party-mixer');
  }

  get decks() {
    return this.getAttribute('decks') || 2;
  }

  get leftTables() {
    return this.tables.filter(table => {
      if (table.getAttribute('side') === 'left') {
        return table
      }
    })
  }

  get rightTables() {
    return this.tables.filter(table => {
      if (table.getAttribute('side') === 'right') {
        return table
      }
    })
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this._gainChange = this._gainChange.bind(this);
    this.gains = {};
    this.tables = [];
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();

    for (let deck = 0; deck < this.decks; deck++) {
      const table = document.createElement('party-turntable');
      table.setAttribute('name', this.__tables__[deck].name);
      table.setAttribute('side', this.__tables__[deck].side);
      table.setAttribute('slot', this.__tables__[deck].side);
      this.appendChild(table);
      table.gainNode = new GainNode(table.player);
      this.tables.push(table);
    }
    this.mixer.addEventListener('gain-change', this._gainChange);
  }

  _gainChange({detail}) {
    if (detail.target === 'fader') {
      if (detail.value === 0.5) {
        this.leftTables.forEach(table => table.gainNode.gain.value = 0.5);
        this.rightTables.forEach(table => table.gainNode.gain.value = 0.5);
      } else if (detail.value === 1) {
        this.leftTables.forEach(table => table.gainNode.gain.value = 0);
        this.rightTables.forEach(table => table.gainNode.gain.value = 1);
      } else if (detail.value === 0) {
        this.leftTables.forEach(table => table.gainNode.gain.value = 1);
        this.rightTables.forEach(table => table.gainNode.gain.value = 0);
      } else {
        this.leftTables.forEach(table => table.gainNode.gain.value = 1 - detail.value);
        this.rightTables.forEach(table => table.gainNode.gain.value = detail.value);
      }
    }
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    height: 55%;
    top: 0;
    left: 0;
    right: 0;
    border: 1px solid #fff;
    background: #888;
  }

  .column {
    display: flex;
    flex-direction: column;
  }

  .row {
    display: flex;
    flex-direction: row;
  }
  .flex {
    flex: 1;
  }
</style>
<span class="row" style="border-bottom: 1px solid #fff;">
  <span class="column">
    <slot name="left"></slot>
  </span>
  <span class="column">
    <party-filters></party-filters>
    <party-mixer></party-mixer>
  </span>
  <span class="column">
    <slot name="right"></slot>
  </span>
</span>

    `;
  }
});

// tslint:disable-next-line:max-line-length
const worker = `!function(e){var t={};function r(o){if(t[o])return t[o].exports;var n=t[o]={i:o,l:!1,exports:{}};return e[o].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=e,r.c=t,r.d=function(e,t,o){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(r.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)r.d(o,n,function(t){return e[t]}.bind(null,n));return o},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=1)}([function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.computeTempoBuckets=void 0;var o=r(3),n=r(4),s=r(5),a=r(6);t.computeTempoBuckets=((e,t)=>{const r=(0,n.getMaximumValue)(e),u=.3*r;let c=[],l=r-.05*r;if(r>.25)for(;c.length<30&&l>=u;)c=(0,s.getPeaksAtThreshold)(e,l,t),l-=.05*r;const i=(0,o.countIntervalsBetweenNearbyPeaks)(c),p=(0,a.groupNeighborsByTempo)(i,t);return p.sort((e,t)=>t.score-e.score),p})},function(e,t,r){"use strict";var o=r(2),n=r(7);addEventListener("message",({data:e})=>{try{if("analyze"===e.method){const r=e.id;var t=e.params;const n=t.channelData,s=t.sampleRate,a=(0,o.analyze)(n,s);postMessage({error:null,id:r,result:{tempo:a}})}else{if("guess"!==e.method)throw new Error('The given method "'+e.method+'" is not supported');{const t=e.id;var r=e.params;const o=r.channelData,a=r.sampleRate;var s=(0,n.guess)(o,a);const u=s.bpm,c=s.offset;postMessage({error:null,id:t,result:{bpm:u,offset:c}})}}}catch(t){postMessage({error:{message:t.message},id:e.id,result:null})}})},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.analyze=void 0;var o=r(0);t.analyze=((e,t)=>{const r=(0,o.computeTempoBuckets)(e,t);if(0===r.length)throw new Error("The given channelData does not contain any detectable beats.");return r[0].tempo})},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.countIntervalsBetweenNearbyPeaks=(e=>{const t=[];return e.forEach((r,o)=>{const n=Math.min(e.length-o,10);for(let s=1;s<n;s+=1){const n=e[o+s]-r;t.some(e=>e.interval===n&&(e.peaks.push(r),!0))||t.push({interval:n,peaks:[r]})}}),t})},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.getMaximumValue=(e=>{let t=0;const r=e.length;for(let o=0;o<r;o+=1)e[o]>t&&(t=e[o]);return t})},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.getPeaksAtThreshold=((e,t,r)=>{const o=e.length,n=[];let s=!1;for(let a=0;a<o;a+=1)e[a]>t?s=!0:s&&(s=!1,n.push(a-1),a+=r/4-1);return s&&n.push(o-1),n})},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.groupNeighborsByTempo=((e,t)=>{const r=[];return e.forEach(e=>{let o=60/(e.interval/t);for(;o<90;)o*=2;for(;o>180;)o/=2;let n=!1,s=e.peaks.length;r.forEach(t=>{if(t.tempo===o&&(t.score+=e.peaks.length,t.peaks=[...t.peaks,...e.peaks],n=!0),t.tempo>o-.5&&t.tempo<o+.5){const r=2*Math.abs(t.tempo-o);s+=(1-r)*t.peaks.length,t.score+=(1-r)*e.peaks.length}}),n||r.push({peaks:e.peaks,score:s,tempo:o})}),r})},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.guess=void 0;var o=r(0);t.guess=((e,t)=>{const r=(0,o.computeTempoBuckets)(e,t);if(0===r.length)throw new Error("The given channelData does not contain any detectable beats.");var n=r[0];const s=n.peaks,a=n.tempo,u=Math.round(a),c=60/u;s.sort((e,t)=>e-t);let l=s[0]/t;for(;l>c;)l-=c;return{bpm:u,offset:l}})}]);`;

const blob = new Blob([worker], { type: 'application/javascript; charset=utf-8' });
const url = URL.createObjectURL(blob);
const webAudioBeatDetector = webAudioBeatDetectorBroker.load(url);
const analyze = webAudioBeatDetector.analyze;
const guess = webAudioBeatDetector.guess;

define(class CollectionItem extends RenderMixin(HTMLElement) {
  set song(value) {
    this.innerHTML = `
      <h4>${value.artist}</h4>
      <span class="flex"></span>
      <h4>${value.title}</h4>
      <span class="flex"></span>
      <h4>${value.genre}</h4>
      <span class="flex"></span>
      <h4>${value.bpm}</h4>
    `;
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.dragstart = this.dragstart.bind(this);
  }

  connectedCallback() {
    (async () => {
      const { template } = await Promise.resolve().then(function () { return collectionItemTemplate; });
      this.template = template;

      if (super.connectedCallback) super.connectedCallback();
      this.song = this.data;

      this.setAttribute('draggable', true);
      this.addEventListener('dragstart', this.dragstart);
    })();


  }

  disconnectedCallback() {
    if (super.disconnectedCallback) super.disconnectedCallback();
    this.removeEventListener('dragstart', this.dragstart);
  }

  dragstart(event) {
    this.dragging = true;
    event.dataTransfer.setData('items', JSON.stringify(this.data));
  }

  mouseup(event) {
    event.dataTransfer.setData('application/json', this.data);
    this.dragging = false;
    document.removeEventListener('mouseup', this.mouseup);
  }

});

define(class CollectionExplorer extends RenderMixin(HTMLElement) {

  get selector() {
    return this.shadowRoot.querySelector('custom-selector');
  }

  get pages() {
    return this.shadowRoot.querySelector('custom-pages');
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    this._onSelected = this._onSelected.bind(this);
  }

  connectedCallback() {
    Promise.resolve().then(function () { return collectionExplorerTemplate; }).then(({ template }) => {
      this.template = template;
      if (super.connectedCallback) super.connectedCallback();

      this.selector.addEventListener('selected', this._onSelected);
    });
  }

  _onSelected({detail}) {
    this.pages.select(detail);
  }

});

define(class PartyCollection extends RenderMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback() {
    (async () => {
      if (super.connectedCallback) super.connectedCallback();

      try {
        this.config = await this.read('../../config.json');
      } catch (e) {
        this.config = {
          paths: []
        };
        await this.write('../../config.json', JSON.stringify(this.config));
        // return console.log('no config');
      }

      window.party.config = this.config;
      try {
        this.collection = await this.read('../../collection');
        this.stampCollection();
      } catch (e) {
        console.log(e);
        this.collection = {};
        await this.write('../../collection', JSON.stringify(this.collection));
      }
      this.watcher = new Worker('workers/watcher.js');
      this.watcher.onmessage = message => {
        if (this.needsUpdate(message.data)) this.prepare(message.data);
        console.log(message.data + ' added');
      };
      this.watcher.postMessage(this.config.paths);
      window.watcher = this.watcher;
    })();
    this.updateSongQues = this.updateSongQues.bind(this);
    document.addEventListener('save-ques', this.updateSongQues);
  }

  /**
   * reads json
   */
  read(path) {
    return new Promise((resolve, reject) => {
      const worker = new Worker('workers/read.js');

      worker.onmessage = ({ data }) => {
        if (data.error) return reject(data.error);
        data = utils.arrayBufferToJSON(data);
        resolve(data);
      };

      worker.postMessage(path);
    });
  }

  write(path, data) {
    return new Promise((resolve, reject) => {
      const worker = new Worker('workers/write.js');

      worker.onmessage = ({ data }) => {
        if (data.error) return reject(data.error);
        resolve();
      };

      worker.postMessage({ path, data });
    });
  }

  needsUpdate(path) {
    return !this.collection[path];
  }

  /**
   * decode arrayBuffer to audioBuffer
   */
  decode(buffer) {
    return new Promise((resolve, reject) => {
      const context = this.audioContext || new AudioContext();
      context.decodeAudioData(buffer, audioBuffer => resolve(audioBuffer));
    });
  }

  encode(audioBuffer) {
    return new Promise((resolve, reject) => {
      this.audioContext.encodeAudioData(audioBuffer, arrayBuffer => {
        resolve(arrayBuffer);
      });
    });
  }

  stampCollection() {
    Object.keys(this.collection).forEach(key => {
      this.collection[key].path = key;
      this.updateCollection(this.collection[key]);
    });
  }

  updateCollection(song) {
    const el = document.createElement('collection-item');
    el.data = song;
    this.appendChild(el);
  }

  updateSongQues({detail}) {
    const {path, ques} = detail;
    this.collection[path].ques = ques;
    this.collectionWorker = this.collectionWorker || new Worker('workers/collection.js');
    this.collectionWorker.postMessage(this.collection[path]);

  }

  updateSong({detail}) {
    // const {path, }
  }

  prepare(path) {
    this.collectionWorker = new Worker('workers/collection.js');
    // TODO: ignore path in chokidar
    this.collectionWorker.onmessage = async message => {
      if (message.data.status === 'updated') return this.updateCollection(message.data.song);
      // if (!message.arrayBuffer && !message.song message.data !== 'succes') return console.error(message);
      if (!message.data.song.bpm) {
        const audioBuffer = await this.decode(message.data.arrayBuffer);
        message.data.song.bpm = await analyze(audioBuffer);
        this.collectionWorker.postMessage(message.data.song);
        return;
      }
      this.updateCollection(message.data.song);
    };

    this.collectionWorker.postMessage(path);
  }

  get template() {
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: row;
          position: absolute;
          bottom: 0;
          right: 0;
          left: 0;
          height: 45%;

          border: 1px solid #FFF;
          background: #555;
        }
      </style>

      <collection-explorer>
        <slot></slot>
      </collection-explorer>
    `;
  }

});

window.utils = window.utils || {
  arrayBufferToString: buffer => String.fromCharCode.apply(null, new Uint8Array(buffer)),
  arrayBufferToJSON: buffer => JSON.parse(window.utils.arrayBufferToString(buffer))
};
window.party = window.party || {
  audioContext: new AudioContext(),
  config: {
    // customConfig
  }
};
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
  }

  main {
    position: relative;
    height: 100%;
    overflow-y: auto;
  }

  .row {
    display: flex;
    flex-direction: row;
    height: 100%;
  }
</style>

<header></header>
<main>
  <party-deck></party-deck>
  <party-collection></party-collection>
</main>
    `;
  }
});

const template = html`
  <style>
    :host {
      display: flex;
      flex-direction: row;
      height: 30px;
      width: 100%;
      pointer-events: auto;
      user-select: none;
      cursor: pointer;
    }

    .row {
      display: flex;
      flex-direction: row;
    }

    ::slotted(.flex) {
      flex: 1;
    }
  </style>
  <slot></slot>
`;

var collectionItemTemplate = /*#__PURE__*/Object.freeze({
  template: template
});

define(class CustomSelect extends PropertyMixin(RenderMixin(HTMLElement)) {

  set items(value) {
    this._items = value;
  }

  set _items(value) {
    this.innerHTML = '';
    this.innerHTML += `${value.map(item => `<span class="option" data-id="${item.deviceId}">${item.label}</span>`).join('')}`;
  }

  get items() {
    return this._items;
  }

  get selector() {
    return this.shadowRoot.querySelector('custom-selector');
  }

  static get properties() {
    return merge(super.properties, {
      label: {
        reflect: true,
        renderer: 'template'
      },
      selected: {
        reflect: true,
        renderer: 'template'
      }
    });
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    this._onSelected = this._onSelected.bind(this);
    this._onClick = this._onClick.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this.shadowRoot.querySelector('.selected').addEventListener('click', this._onClick);
  }

  open() {
    const top = this.getBoundingClientRect().height;
    // const left = this.shadowRoot.querySelector('.selected').getBoundingClientRect().width;
    this.selector.style.top = `${top - 1}px`;
    // this.selector.style.left = `${left}px`;
    // this.selector.style.top = `8px`;
    this.classList.add('selecting');
  }

  close() {
    this.selecting = false;
    this.classList.remove('selecting');
  }

  _onClick() {
    if (this.selecting) this.close() ;
    else this.open();

    this.selecting = !this.selecting;

    this.selector.addEventListener('selected', this._onSelected);
  }

  _onSelected({detail}) {
    this.selected = this.querySelector(`[data-id="${detail}"]`).innerHTML;
    this.selector.removeEventListener('selected', this._onSelected);

    this.close();
  }

  get template() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: row;
    position: relative;
    cursor: pointer;
  }
  .option {
    display: flex;
    flex-direction: row;
  }
  custom-selector {
    position: absolute;
    opacity: 0;
    display: flex;
    flex-direction: column;
    transform: scale(0);
    pointer-events: none;
    cursor: pointer;
    width: 240px;
    background: #FFF;
    padding: 4px 6px;
  }
  :host(.selecting) custom-selector {
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
    z-index: 100;
  }

  .selected {
    padding: 0 4px;
    border-bottom: 1px solid #fff;
  }
  strong {
    padding-right: 4px;
  }
</style>
<strong>${'label'}</strong>
<span class="selected">${'selected'}</span>
<custom-selector attr-for-selected="data-id">
  <slot></slot>
</custom-selector>

    `;
  }
});

define(class CollectionSettings extends RenderMixin(HTMLElement) {

  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    this._addFolder = this._addFolder.bind(this);
  }

  connectedCallback() {
    Promise.resolve().then(function () { return collectionSettingsTemplate; }).then(async ({ template }) => {
      this.template = template;
      if (super.connectedCallback) super.connectedCallback();

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audiooutput'); // && device.deviceId !== 'communications' );
      // await audio.setSinkId(audioDevices[0].deviceId);

      const selects = this.shadowRoot.querySelectorAll('custom-select');
      selects[0].items = audioDevices;
      selects[1].items = audioDevices;

      this.shadowRoot.querySelector('.add').addEventListener('click', this._addFolder);
      // console.log('Audio is being played on ' + audio.sinkId);
    });
  }

  _addFolder() {
    const input = document.createElement('input');
    input.type = 'file';
    input.setAttribute('multiple', '');

    input.setAttribute('directory', '');
    input.setAttribute('webkitdirectory', '');
    input.addEventListener('change', e => {
      window.party.config.paths.push(input.files[0].path);
      const writer = new Worker('workers/write.js');

      writer.postMessage({path: '../../config.json', data: JSON.stringify(window.party.config)});

      window.watcher.postMessage({add: true, paths: input.files[0].path});

    });
    input.click();
    // return Promise
  }

});

var SelectMixin = base => {
  return class SelectMixin extends PropertyMixin(base) {

    static get properties() {
      return merge(super.properties, {
        selected: {
          value: 0,
          observer: '__selectedObserver__'
        }
      });
    }

    constructor() {
      super();
    }

    get slotted() {
      return this.shadowRoot ? this.shadowRoot.querySelector('slot') : this;
    }

    get _assignedNodes() {
      return 'assignedNodes' in this.slotted ? this.slotted.assignedNodes() : this.children;
    }

    /**
    * @return {String}
    */
    get attrForSelected() {
      return this.getAttribute('attr-for-selected') || 'name';
    }

    set attrForSelected(value) {
      this.setAttribute('attr-for-selected', value);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        // check if value is number
        if (!isNaN(newValue)) {
          newValue = Number(newValue);
        }
        this[name] = newValue;
      }
    }

    /**
     * @param {string|number|HTMLElement} selected
     */
    select(selected) {
      this.selected = selected;
    }

    next(string) {
      const index = this.getIndexFor(this.currentSelected);
      if (index !== -1 && index >= 0 && this._assignedNodes.length > index &&
          (index + 1) <= this._assignedNodes.length - 1) {
        this.selected = this._assignedNodes[index + 1];
      }
    }

    previous() {
      const index = this.getIndexFor(this.currentSelected);
      if (index !== -1 && index >= 0 && this._assignedNodes.length > index &&
          (index - 1) >= 0) {
        this.selected = this._assignedNodes[index - 1];
      }
    }

    getIndexFor(element) {
      if (element && element instanceof HTMLElement === false)
        return console.error(`${element} is not an instanceof HTMLElement`);

      return this._assignedNodes.indexOf(element || this.selected);
    }

    _updateSelected(selected) {
      selected.classList.add('custom-selected');
      if (this.currentSelected && this.currentSelected !== selected) {
        this.currentSelected.classList.remove('custom-selected');
      }
      this.currentSelected = selected;
    }

    /**
     * @param {string|number|HTMLElement} change.value
     */
    __selectedObserver__(value) {
      switch (typeof this.selected) {
        case 'object':
          this._updateSelected(this.selected);
          break;
        case 'string':
          for (const child of this._assignedNodes) {
            if (child.nodeType === 1) {
              if (child.getAttribute(this.attrForSelected) === this.selected) {
                return this._updateSelected(child);
              }
            }
          }
          if (this.currentSelected) {
            this.currentSelected.classList.remove('custom-selected');
          }
          break;
        default:
          // set selected by index
          const child = this._assignedNodes[this.selected];
          if (child && child.nodeType === 1) {
            this._updateSelected(child);
          // remove selected even when nothing found, better to return nothing
          } else if (this.currentSelected) {
            this.currentSelected.classList.remove('custom-selected');
          }
      }
    }
  }
};

/**
 * @extends HTMLElement
 */
class CustomPages extends SelectMixin(HTMLElement) {
  constructor() {
    super();
    this.slotchange = this.slotchange.bind(this);
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          flex: 1;
          position: relative;
          --primary-background-color: #ECEFF1;
          overflow: hidden;
        }
        ::slotted(*) {
          display: flex;
          position: absolute;
          opacity: 0;
          pointer-events: none;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          transition: transform ease-out 160ms, opacity ease-out 60ms;
          /*transform: scale(0.5);*/
          transform-origin: left;
        }
        ::slotted(.animate-up) {
          transform: translateY(-120%);
        }
        ::slotted(.animate-down) {
          transform: translateY(120%);
        }
        ::slotted(.custom-selected) {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
          transition: transform ease-in 160ms, opacity ease-in 320ms;
          max-height: 100%;
          max-width: 100%;
        }
      </style>
      <!-- TODO: scale animation, ace doesn't resize that well ... -->
      <div class="wrapper">
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.slotchange);
  }

  isEvenNumber(number) {
    return Boolean(number % 2 === 0)
  }

  /**
   * set animation class when slot changes
   */
  slotchange() {
    let call = 0;
    for (const child of this.slotted.assignedNodes()) {
      if (child && child.nodeType === 1) {
        child.style.zIndex = 99 - call;
        if (this.isEvenNumber(call++)) {
          child.classList.add('animate-down');
        } else {
          child.classList.add('animate-up');
        }
        this.dispatchEvent(new CustomEvent('child-change', {detail: child}));
      }
    }
  }
}customElements.define('custom-pages', CustomPages);

var SelectorMixin = base => {
  return class SelectorMixin extends SelectMixin(base) {

  static get properties() {
      return merge(super.properties, {
        selected: {
          value: 0,
          observer: '__selectedObserver__'
        }
      });
    }
    constructor() {
      super();
    }
    connectedCallback() {
      super.connectedCallback();
      this._onClick = this._onClick.bind(this);
      this.addEventListener('click', this._onClick);
    }
    disconnectedCallback() {
      this.removeEventListener('click', this._onClick);
    }
    _onClick(event) {
      const target = event.path[0];
      const attr = target.getAttribute(this.attrForSelected);
      console.log(target);
      console.log(event.path);
      if (target.localName !== this.localName) {
        this.selected = attr ? attr : target;
        console.log(this.selected);
        this.dispatchEvent(new CustomEvent('selected', { detail: this.selected }));
      }
    }
  }
};

const define$1  = klass => customElements.define('custom-selector', klass);
define$1(class CustomSelector extends SelectorMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = '<slot></slot>';
  }
});

const template$1 = html`
  <style>
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    .row {
      display: flex;
      flex-direction: row;
    }

    .drawer {
      display: flex;
      flex-direction: column;
      width: 256px;
      height: 100%;

      background: #777;

      border-right: 1px solid #fff;
    }

    custom-pages, .main {
      height: 100%;
      width: 100%;
    }

    party-button {
      width: 100%;
    }

    .flex {
      flex: 1;
    }

    section {
      display: flex;
      flex-direction: column;
    }

    custom-selector, party-button {
      pointer-events: auto;
      cursor: pointer;
    }

    span {
      pointer-events: none;
    }
    party-button {
      width: 100%;
    }

    section {
      box-sizing: border-box;
      padding: 4px 10px;
    }
  </style>

  <span class="row main">
    <custom-selector class="drawer" selected="music" attr-for-selected="data-route">
      <party-button data-route="music">Music</party-button>
      <party-button data-route="effects">Effects</party-button>
      <span class="flex"></span>
      <party-button data-route="settings">settings</party-button>
    </custom-selector>

    <custom-pages selected="music" attr-for-selected="data-route">
      <section data-route="music"><slot></slot></section>
      <collection-settings data-route="settings"></collection-settings>
    </custom-pages>
  </span>
`;

var collectionExplorerTemplate = /*#__PURE__*/Object.freeze({
  template: template$1
});

const template$2 = html`
  <style>
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    .row {
      display: flex;
      flex-direction: row;
    }

    .drawer {
      display: flex;
      flex-direction: column;
      width: 256px;
      height: 100%;

      background: #777;
    }

    main, .main {
      height: 100%;
      width: 100%;
    }

    .tabs {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      min-height: 56px;
      width: 100%;

      background: #888;
    }

    party-button {
      width: 100%;
    }

    .flex {
      flex: 1;
    }
  </style>

  <span class="setting">
    <h4 class="devices">Audio devices</h4>
    <h6>Device('s') to use</h6>
    <custom-select label="main" selected="Default">main</custom-select>

    <custom-select label="monitor" selected="Default">monitor</custom-select>
    <h4 class="libraries">libraries</h4>
    <h6>folders to scan for files</h6>



    <party-button class="add">add</party-button>
  </span>
`;

var collectionSettingsTemplate = /*#__PURE__*/Object.freeze({
  template: template$2
});

module.exports = index;
