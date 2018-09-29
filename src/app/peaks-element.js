import define from '../../node_modules/backed/src/utils/define';
import RenderMixin from '../../node_modules/custom-renderer-mixin/src/render-mixin';

export default define(class PeaksElement extends RenderMixin(HTMLElement) {

  get audio() {
    return this.shadowRoot.querySelector('audio');
  }

  get buffer() {
    return this.peaks.waveform.originalWaveformData.adapter.data.buffer;
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    this._userseek = this._userseek.bind(this);
    this._peaksReady = this._peaksReady.bind(this);
    this._peaksError = this._peaksError.bind(this);
    this.saveQues = this.saveQues.bind(this)
  }

  initPeaks(dataUri, ques) {
    if (this.peaks) this.peaks.destroy()
    const options = {
      container: this.shadowRoot.querySelector('.peaks-container'),
      mediaElement: this.shadowRoot.querySelector('audio'),
      points: ques,
      height: 86,
      overviewWaveformColor: '#888'
    }
    if (typeof dataUri === 'string') options.dataUri = {arraybuffer: dataUri};
    else options.audioContext = dataUri;

    this.peaks = peaks.init(options);

    this.peaks.on('points.dragend', this.saveQues)
    this.peaks.on('user_seek', this._userseek)
    this.peaks.on('peaks.ready', this._peaksReady)
    this.peaks.on('error', this._peaksError)
  }

  /**
   * Error reading from dataUri remove dataUri from song object and init peakjs using audioContext
   */
  _peaksError() {
    this.peaks.destroy();
    this.initPeaks(this.audioContext, this.data.ques || []);
  }

  async _peaksReady() {
    this.dispatchEvent(new CustomEvent('ready'))
  }

  saveQues() {
    if (this.ques) {
      document.dispatchEvent(new CustomEvent('save-ques', {detail: {
          path: this.data.path,
          ques: this.peaks.getPoints()
        }
      }))
    }
  }

  play() {
    this.peaks.player.play();
  }

  pause() {
    this.peaks.player.pause();
  }

  _userseek(time) {
    this.dispatchEvent(new CustomEvent('user_seek', {detail: time}))
  }
  /**
   * Html tagged template
   */
  get template () {
    return html`<style>
      :host {
        display:  flex;
        flex-direction: column;
        min-height: 198px;
        position: relative;
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
    </style>

    <span class="peaks-container"></span>
    <span class="flex"></span>
    <audio></audio>`;
  }
})
