import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';

import './scrolling-text.js';
import {saveWaveform} from '../utils/app.js';
import './peaks-element.js';

export default define(class PartyPlayer extends RenderMixin(HTMLElement) {

  get peaksEl() {
    return this.shadowRoot.querySelector('peaks-element');
  }

  get ques() {
    return this.peaksEl.peaks.points ? this.peaksEl.peaks.points.getPoints() : null
  }

  get queLabels() {
    return window.party.config.queLabels || ['A', 'B', 'C', 'D'];
  }

  get queColors() {
    return window.party.config.queColors || ['#E91E63', '#673AB7', '#2196F3', '#00BCD4'];
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
    this.attachShadow({mode: 'open'})
    this._onDrop = this._onDrop.bind(this);
    this._preventDefault = this._preventDefault.bind(this);
    this._peaksElReady = this._peaksElReady.bind(this);
  }

  connectedCallback() {
    // import('./party-player-template.js').then(({ template }) => {
      // this.template = template;
    super.connectedCallback();
    // })
    this.addEventListener('dragover', this._preventDefault);
    this.addEventListener('drop', this._onDrop);

    this.peaksEl.addEventListener('user_seek', this._userseek);
    this.peaksEl.addEventListener('ready', this._peaksElReady);

    this.audioContext = window.party.audioContext;
    this.gainNode = this.audioContext.createGain()
    this.peaksEl.audio.volume = 0;
  }

  _preventDefault(event) {
    return event.preventDefault();
  }

  _onDrop(event) {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData('items'));
    this.beforeLoad(data);
    this.data = data;
    this.load(this.data.path, this.data.dataUri, this.data.ques || []);
    this.text = this.data.title ? `${this.data.artist} - ${this.data.title}` : this.data.path;
  }

  decode(ayyayBuffer) {
    return new Promise((resolve, reject) => {
      const context = this.audioContext || new AudioContext();
      context.decodeAudioData(ayyayBuffer, audioBuffer => resolve(audioBuffer))
    });
  }

  load(uri, dataUri, ques) {
    if (!uri) return console.warn('src undefined');
    this.worker = new Worker('workers/song.js');
    this.worker.onmessage = async message => {
      try {

        this.peaksEl.audio.onloadeddata = async () => {
          const buffer_size = 4096;
          if (!message.data.dataUri) {
            this.data.dataUri = null;
            this.peaksEl.initPeaks(this.audioContext, ques)
          } else {
            this.peaksEl.initPeaks(message.data.dataUri, ques)
          }

          this.source = this.audioContext.createBufferSource();
          this.audioBuffer = await this.decode(message.data.arrayBuffer);
          this.source.buffer = this.audioBuffer;
          this.scriptProcessor = this.audioContext.createScriptProcessor(buffer_size)

          this.scriptProcessor.onaudioprocess = function() {
           var in0  = event.inputBuffer.getChannelData(0)
           var in1  = event.inputBuffer.getChannelData(1)
           var out0 = event.outputBuffer.getChannelData(0)
           var out1 = event.outputBuffer.getChannelData(1)

           for(var k = 0; k < buffer_size; k++) {
             out0[k] = in0[k]
             out1[k] = in1[k]
           }
         }

          this.source.connect(this.gainNode)
          this.gainNode.connect(this.scriptProcessor);
          // this.gainNode.connect(this.)
          // this.gainNode.connect()
          // this.scriptProcessor.connect(this.audioContext.destination)
        }
        this.peaksEl.audio.setAttribute('src', message.data.uri);

        let parentNode = this.parentNode;
        while (!parentNode.host) {
          parentNode = parentNode.parentNode
        }

        const detail = {
          path: uri,
          deck: parentNode.host.getAttribute('name')
        }

        document.dispatchEvent(new CustomEvent('deck-load', { detail }))

      } catch (e) {
        console.error(e);
      }
    }

    if (dataUri) this.worker.postMessage({uri, dataUri});
    else this.worker.postMessage(uri);
  }

  _peaksElReady() {
    this.save();
  }

  saveQues() {
    if (this.peaks.ques) {
      document.dispatchEvent(new CustomEvent('save-ques', {detail: {
          path: this.data.path,
          ques: this.ques
        }
      }))
    }
  }

  play() {
    if (this.source.paused) {
      this.source = this.audioContext.createBufferSource();
      this.source.buffer = this.audioBuffer;

      this.source.connect(this.gainNode);
    }
    this.peaksEl.play()
    this.source.start(0, this.currentTime);
    this.source.playing = true;
    this.source.paused = false;
  }

  pause() {
    this.peaksEl.pause()
    this.source.stop()
    this.currentTime = this.audioContext.currentTime
    this.source.paused = true;
  }

  que() {
    this.peaksEl.peaks.points.add({
      time: this.peaksEl.peaks.player.getCurrentTime(),
      labelText: this.queLabels[this.ques.length],
      color: this.queColors[this.ques.length],
      editable: true,
      id: this.queLabels[this.ques.length]
    });

    this.data.ques = this.peaksEl.peaks.points.getPoints();
    window.party.collection[this.data.path] = this.data;
  }

  loop({start, end}) {
    if (this.source.playing) {
      this.currentTime = this.audioContext.currentTime
      this.source.stop()
    }
    if (this.looper && this.looper.playing) this.looper.stop()
    this.looper = this.audioContext.createBufferSource();
    this.looper.buffer = this.audioBuffer;
    this.looper.connect(this.audioContext.destination);
    this.looper.loop = true;
    if (start) this.looper.loopStart = start;
    if (end) this.looper.loopEnd = end;
    this.looper.start()
    this.looper.playing = true
  }

  getCurrentTime() {
    return this.peaks.player.getCurrentTime()
  }

  _userseek({detail}) {
    this.source.stop()
    this.currentTime = detail
    // this.pause()
    this.source.paused = true
    this.play()
  }

  // TODO: reduce writing to disk
  beforeLoad(data) {
    if (this.data && this.data.path !== data.path) this.save();
  }

  async save() {
    if (!this.data.dataUri) {
      const buffer = this.peaksEl.buffer;
      this.data.dataUri = await saveWaveform(this.data.path, buffer);
      window.party.saveToCollection(this.data);
    }
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
    <peaks-element></peaks-element>

    <scrolling-text text="drop song to start"></scrolling-text>

    `

  }
});
