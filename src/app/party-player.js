import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';

import './scrolling-text.js';

export default define(class PartyPlayer extends RenderMixin(HTMLElement) {

  get ques() {
    return this.peaks.points ? this.peaks.points.getPoints() : null
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
    this.attachShadow({mode: 'open'})
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

    this.audioContext = new AudioContext()
    this.gainNode = this.audioContext.createGain()
    this.audio.volume = 0;
  }

  _preventDefault(event) {
    return event.preventDefault();
  }

  _onDrop(event) {
    event.preventDefault()
    let data = event.dataTransfer.getData('items');
    data = JSON.parse(data);
    this.beforeLoad(data);
    this.data = data;
    this.load(this.data.path, this.data.ques || []);
    this.text = `${this.data.artist} - ${this.data.title}`;
  }

  decode(ayyayBuffer) {
    return new Promise((resolve, reject) => {
      const context = this.audioContext || new AudioContext();
      context.decodeAudioData(ayyayBuffer, audioBuffer => resolve(audioBuffer))
    });
  }

  load(src, ques = []) {
    if (!src) return console.warn('src undefined');
    this.worker = new Worker('workers/song.js');
    this.worker.onmessage = async message => {
      try {
        if (this.peaks) this.peaks.destroy()
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
          this.saveQues = this.saveQues.bind(this)
          this.peaks.on('points.dragend', this.saveQues)
          this.peaks.on('user_seek', this._userseek)
        }
        this.audio.setAttribute('src', message.data.uri);

        let parentNode = this.parentNode;
        while (!parentNode.host) {
          parentNode = parentNode.parentNode
        }

        const detail = {
          path: src,
          deck: parentNode.host.getAttribute('name')
        }

        document.dispatchEvent(new CustomEvent('deck-load', { detail }))

      } catch (e) {
        console.error(e);
      }
    }

    this.worker.postMessage(src);
  }

  play() {
    if (this.source.paused) {
      this.source = this.audioContext.createBufferSource();
      this.source.buffer = this.audioBuffer;

      this.source.connect(this.gainNode);
    }
    this.peaks.player.play()
    this.source.start(0, this.currentTime);
    this.source.playing = true;
    this.source.paused = false;
  }

  pause() {
    this.peaks.player.pause()

    this.currentTime = this.audioContext.currentTime
    this.source.stop()
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
    if (this.ques) {
      document.dispatchEvent(new CustomEvent('save-ques', {detail: {
          path: this.data.path,
          ques: this.ques
        }
      }))
    }
  }

  // TODO: reduce writing to disk
  beforeLoad(data) {
    if (this.data && this.data.path !== data.path) this.saveQues()
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

  _userseek(time) {
    this.source.stop()
    this.currentTime = time
    // this.pause()
    this.source.paused = true
    this.play()
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
